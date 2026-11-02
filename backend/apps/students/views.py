from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.http import HttpResponse
from django.contrib.auth import get_user_model
from django.db.models import Q, Max
from django.db import transaction
from django.utils import timezone
import datetime
import uuid
from .models import Department, Student, AdmissionApplication, StudentLeave
from .serializers import (
    DepartmentSerializer, StudentListSerializer, StudentDetailSerializer,
    StudentAdmissionSerializer, StudentUpdateSerializer, AdmissionApplicationSerializer,
    StudentLeaveSerializer
)
from apps.accounts.permissions import IsPrincipal, IsPrincipalOrTeacher
from .utils import generate_id_card_pdf
from django.shortcuts import get_object_or_404
from apps.notifications.whatsapp import send_leave_application_notification, send_leave_approval_gatepass

class DepartmentListView(generics.ListAPIView):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [IsAuthenticated]

class StudentListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return StudentAdmissionSerializer
        return StudentListSerializer
    
    def get_queryset(self):
        user = self.request.user
        if user.role in ['principal', 'vice_principal', 'managing_director', 'teacher', 'staff']:
            return Student.objects.all()
        elif user.role == 'student':
            return Student.objects.filter(user=user)
        elif user.role == 'guardian':
            return Student.objects.filter(guardian_phone=user.phone)
        return Student.objects.none()
        
    def check_permissions(self, request):
        super().check_permissions(request)
        if request.method == 'POST':
            if request.user.role not in ['principal', 'vice_principal', 'managing_director', 'teacher']:
                self.permission_denied(request, message="Only principal or teacher can admit students.")

class StudentDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    def get_queryset(self):
        user = self.request.user
        if user.role in ['principal', 'vice_principal', 'managing_director', 'teacher', 'staff']:
            return Student.objects.all()
        elif user.role == 'student':
            return Student.objects.filter(user=user)
        elif user.role == 'guardian':
            return Student.objects.filter(guardian_phone=user.phone)
        return Student.objects.none()

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return StudentUpdateSerializer
        return StudentDetailSerializer
        
    def check_object_permissions(self, request, obj):
        super().check_object_permissions(request, obj)
        if request.method in ['PUT', 'PATCH', 'DELETE'] and request.user.role not in ['principal', 'vice_principal', 'managing_director', 'teacher']:
            self.permission_denied(request, message="Only principal or teacher can edit or delete.")

    def perform_destroy(self, instance):
        user = instance.user
        instance.delete()
        if user and user.role == 'student':
            user.delete()


class StudentMeView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        student = Student.objects.filter(user=request.user).first()
        if not student:
            if request.user.role == 'guardian':
                student = Student.objects.filter(guardian_phone=request.user.phone).first()
            if not student:
                student = Student.objects.first()
        if not student:
            return Response({'error': 'No student profile found'}, status=status.HTTP_404_NOT_FOUND)
        return Response(StudentDetailSerializer(student).data)




class StudentStatusUpdateView(APIView):
    permission_classes = [IsAuthenticated, IsPrincipal]
    
    def post(self, request, pk):
        student = get_object_or_404(Student, pk=pk)
        new_status = request.data.get('status')
        if new_status in dict(Student.STATUS_CHOICES):
            student.status = new_status
            if new_status == 'expelled':
                student.expulsion_reason = request.data.get('expulsion_reason', '')
            student.save()
            return Response({'detail': f'Status updated to {new_status}'})
        return Response({'detail': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)

class StudentIDCardView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, pk):
        student = get_object_or_404(Student, pk=pk)
        
        user = request.user
        if user.role not in ['principal', 'vice_principal', 'managing_director', 'teacher', 'staff']:
            if user.role == 'student' and student.user != user:
                return Response({'detail': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
            if user.role == 'guardian' and student.guardian_phone != user.phone:
                return Response({'detail': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
                
        pdf_bytes = generate_id_card_pdf(student)
        
        response = HttpResponse(pdf_bytes, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="student_id_{student.student_id}.pdf"'
        return response

class AdmissionApplicationCreateView(generics.CreateAPIView):
    queryset = AdmissionApplication.objects.all()
    serializer_class = AdmissionApplicationSerializer
    permission_classes = [AllowAny]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        instance = serializer.save()

        # Auto-register or sync Guardian User account (Phone as Login ID, Student DOB as Password)
        try:
            from django.contrib.auth import get_user_model
            User = get_user_model()
            guardian_phone = (instance.guardian_phone or '').strip()
            if guardian_phone and instance.date_of_birth:
                dob_str = instance.date_of_birth.strftime('%d%m%Y')
                g_user = User.objects.filter(phone=guardian_phone).first()
                g_name = instance.father_name or instance.name or "অভিভাবক"
                g_name_bn = instance.father_name_bn or instance.name_bn or "অভিভাবক"
                if not g_user:
                    User.objects.create_user(
                        phone=guardian_phone,
                        password=dob_str,
                        name=g_name,
                        name_bn=g_name_bn,
                        role='guardian'
                    )
                elif g_user.role == 'guardian':
                    g_user.set_password(dob_str)
                    g_user.save(update_fields=['password'])
        except Exception as e:
            print("Auto Guardian Registration Error on Application Apply:", e)

        # Trigger WhatsApp notification & logging
        try:
            from apps.notifications.whatsapp import send_admission_application_alert
            send_admission_application_alert(instance)
        except Exception as e:
            print("Auto Admission WhatsApp alert error:", e)

        return Response({
            "status": "success",
            "message": "ভর্তি আবেদন সফলভাবে গৃহীত হয়েছে এবং অভিভাবক অ্যাকাউন্ট সক্রিয় করা হয়েছে!",
            "application_no": instance.application_no,
            "guardian_phone": instance.guardian_phone,
            "data": serializer.data
        }, status=status.HTTP_201_CREATED)

class AdmissionApplicationListView(generics.ListAPIView):
    serializer_class = AdmissionApplicationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role in ['principal', 'vice_principal', 'managing_director', 'teacher', 'staff']:
            qs = AdmissionApplication.objects.all().select_related(
                'reviewed_by', 'enrolled_student', 
                'enrolled_student__islamic_department', 'enrolled_student__general_department'
            )
        elif user.role == 'guardian':
            qs = AdmissionApplication.objects.filter(guardian_phone=user.phone).select_related(
                'reviewed_by', 'enrolled_student', 
                'enrolled_student__islamic_department', 'enrolled_student__general_department'
            )
        else:
            return AdmissionApplication.objects.none()
        status_filter = self.request.query_params.get('status')
        if status_filter and status_filter in ['pending', 'approved', 'rejected']:
            qs = qs.filter(status=status_filter)
        year = self.request.query_params.get('academic_year')
        if year:
            try:
                qs = qs.filter(academic_year=int(year))
            except ValueError:
                pass
        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(
                Q(name__icontains=search) |
                Q(name_bn__icontains=search) |
                Q(application_no__icontains=search) |
                Q(guardian_phone__icontains=search) |
                Q(father_name__icontains=search) |
                Q(desired_program__icontains=search)
            )
        return qs

class AdmissionApplicationStatsView(APIView):
    permission_classes = [IsAuthenticated, IsPrincipalOrTeacher]

    def get(self, request):
        qs = AdmissionApplication.objects.all()
        year = request.query_params.get('academic_year')
        if year:
            try:
                qs = qs.filter(academic_year=int(year))
            except ValueError:
                pass
        
        return Response({
            'total': qs.count(),
            'pending': qs.filter(status='pending').count(),
            'approved': qs.filter(status='approved').count(),
            'rejected': qs.filter(status='rejected').count(),
        })

class AdmissionNextRollView(APIView):
    permission_classes = [IsAuthenticated, IsPrincipalOrTeacher]

    def get(self, request):
        academic_year = int(request.query_params.get('academic_year', 2027))
        islamic_dept_id = request.query_params.get('islamic_department_id')
        general_dept_id = request.query_params.get('general_department_id')
        section = request.query_params.get('section', 'A')

        qs = Student.objects.filter(academic_year=academic_year, section=section)
        if general_dept_id:
            qs = qs.filter(general_department_id=general_dept_id)
        elif islamic_dept_id:
            qs = qs.filter(islamic_department_id=islamic_dept_id)

        max_roll = qs.aggregate(Max('roll_number'))['roll_number__max'] or 0
        return Response({
            'next_roll': max_roll + 1,
            'existing_count': qs.count(),
            'section': section,
            'academic_year': academic_year
        })

class AdmissionApplicationApproveView(APIView):
    permission_classes = [IsAuthenticated, IsPrincipalOrTeacher]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def post(self, request, pk):
        application = get_object_or_404(AdmissionApplication, pk=pk)
        
        if application.status == 'approved' and application.enrolled_student:
            return Response({
                'detail': 'এই আবেদনটি ইতিমধ্যে অনুমোদিত হয়েছে এবং শিক্ষার্থী রেকর্ড তৈরি রয়েছে।'
            }, status=status.HTTP_400_BAD_REQUEST)

        data = request.data
        islamic_dept_id = data.get('islamic_department_id') or None
        general_dept_id = data.get('general_department_id') or None
        enrollment_type = data.get('enrollment_type') or (
            'both' if (islamic_dept_id and general_dept_id) else ('islamic_only' if islamic_dept_id else 'general_only')
        )
        section = data.get('section', 'A')
        academic_year = int(data.get('academic_year', application.academic_year or 2027))
        residential_status = data.get('residential_status', application.residential_status or 'day')
        hostel_room_id = data.get('hostel_room_id') or None
        
        # Fees
        monthly_fee = float(data.get('monthly_fee', 0) or 0)
        hostel_fee = float(data.get('hostel_fee', 0) or 0)
        admission_fee = float(data.get('admission_fee', 0) or 0)

        # Marks & Note
        interview_marks = data.get('interview_marks')
        written_marks = data.get('written_marks')
        admin_note = data.get('admin_note', '').strip()

        # Roll Number Calculation
        requested_roll = data.get('roll_number')
        if requested_roll and int(requested_roll) > 0:
            roll_number = int(requested_roll)
        else:
            q = Student.objects.filter(academic_year=academic_year, section=section)
            if general_dept_id:
                q = q.filter(general_department_id=general_dept_id)
            elif islamic_dept_id:
                q = q.filter(islamic_department_id=islamic_dept_id)
            max_roll = q.aggregate(Max('roll_number'))['roll_number__max'] or 0
            roll_number = max_roll + 1

        User = get_user_model()

        with transaction.atomic():
            # Format DOB for password: DDMMYYYY
            dob_str = application.date_of_birth.strftime('%d%m%Y')
            temp_phone = f"tmp_{uuid.uuid4().hex[:10]}"

            # 1. Create User account for student
            user = User.objects.create_user(
                phone=temp_phone,
                password=dob_str,
                name=application.name,
                name_bn=application.name_bn,
                role='student'
            )
            # Update user phone to user_id so student logs in with ID
            user.phone = user.user_id
            user.save()

            # 2. Create Student Record
            student = Student.objects.create(
                user=user,
                student_id=user.user_id,
                name=application.name,
                name_bn=application.name_bn,
                father_name=application.father_name,
                father_name_bn=application.father_name_bn or application.father_name,
                mother_name=application.mother_name,
                mother_name_bn=application.mother_name_bn or application.mother_name,
                date_of_birth=application.date_of_birth,
                birth_reg_no=application.birth_reg_no,
                present_address=application.present_address,
                permanent_address=application.present_address,
                guardian_name=application.father_name or application.guardian_relationship,
                guardian_relationship=application.guardian_relationship or 'পিতা',
                guardian_phone=application.guardian_phone,
                enrollment_type=enrollment_type,
                islamic_department_id=islamic_dept_id,
                general_department_id=general_dept_id,
                section=section,
                roll_number=roll_number,
                admission_date=datetime.date.today(),
                academic_year=academic_year,
                previous_institution=application.previous_school,
                residential_status=residential_status,
                hostel_room_id=hostel_room_id,
                monthly_fee=monthly_fee,
                hostel_fee=hostel_fee,
                photo=application.photo,
                status='active',
                admitted_by=request.user
            )

            if application.photo:
                user.photo = application.photo
                user.save(update_fields=['photo'])

            if 'photo' in request.FILES:
                student.photo = request.FILES['photo']
                user.photo = request.FILES['photo']
                student.save(update_fields=['photo'])
                user.save(update_fields=['photo'])

            # 3. If admission fee collected, generate FeePayment & receipt
            receipt_no = None
            if admission_fee > 0:
                from apps.fees.models import FeePayment
                from apps.fees.utils import generate_receipt_number
                receipt_no = generate_receipt_number()
                FeePayment.objects.create(
                    student=student,
                    payment_type='admission',
                    year=academic_year,
                    amount_due=admission_fee,
                    amount_paid=admission_fee,
                    discount=0,
                    payment_date=datetime.date.today(),
                    receipt_number=receipt_no,
                    note=f"অনলাইন ভর্তি ফি (আবেদন #{application.application_no})",
                    collected_by=request.user
                )

            # 4. Update AdmissionApplication record
            application.status = 'approved'
            application.interview_marks = interview_marks if interview_marks is not None else None
            application.written_marks = written_marks if written_marks is not None else None
            application.assigned_roll = roll_number
            application.assigned_student_id = student.student_id
            application.enrolled_student = student
            application.admin_note = admin_note
            application.reviewed_at = timezone.now()
            application.reviewed_by = request.user
            application.save()

            # 5. Ensure guardian user exists & password is set to student's DOB
            g_phone = (application.guardian_phone or '').strip()
            if g_phone:
                try:
                    g_user = User.objects.filter(phone=g_phone).first()
                    g_name = student.guardian_name or student.father_name or "অভিভাবক"
                    g_name_bn = student.guardian_name or student.father_name_bn or g_name
                    if not g_user:
                        User.objects.create_user(
                            phone=g_phone,
                            password=dob_str,
                            name=g_name,
                            name_bn=g_name_bn,
                            role='guardian'
                        )
                    elif g_user.role == 'guardian':
                        g_user.set_password(dob_str)
                        g_user.save(update_fields=['password'])
                except Exception as e:
                    print("Auto Guardian Registration Error on Approval:", e)

            # 6. Send WhatsApp notification
            try:
                from apps.notifications.whatsapp import send_admission_notification
                send_admission_notification(student, password=dob_str, sent_by=request.user)
            except Exception as e:
                print("WhatsApp admission notify error:", e)

            return Response({
                'status': 'success',
                'message': f"ভর্তি সফলভাবে অনুমোদিত হয়েছে! রোল নম্বর: {roll_number}, ছাত্র আইডি: {student.student_id}",
                'application': AdmissionApplicationSerializer(application).data,
                'student': {
                    'id': student.id,
                    'student_id': student.student_id,
                    'name': student.name,
                    'name_bn': student.name_bn,
                    'roll_number': student.roll_number,
                    'section': student.section,
                    'academic_year': student.academic_year,
                    'password': dob_str,
                    'receipt_number': receipt_no
                }
            }, status=status.HTTP_200_OK)

class AdmissionApplicationRejectView(APIView):
    permission_classes = [IsAuthenticated, IsPrincipalOrTeacher]

    def post(self, request, pk):
        application = get_object_or_404(AdmissionApplication, pk=pk)
        note = request.data.get('admin_note', '').strip()
        if not note:
            note = 'কর্তৃপক্ষ কর্তৃক আবেদনটি বাতিল করা হয়েছে।'

        application.status = 'rejected'
        application.admin_note = note
        application.reviewed_at = timezone.now()
        application.reviewed_by = request.user
        application.save()

        return Response({
            'status': 'success',
            'message': 'ভর্তি আবেদন বাতিল করা হয়েছে।',
            'application': AdmissionApplicationSerializer(application).data
        }, status=status.HTTP_200_OK)


class StudentLeaveListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = StudentLeaveSerializer

    def get_queryset(self):
        user = self.request.user
        qs = StudentLeave.objects.select_related(
            'student', 'student__islamic_department', 'student__general_department',
            'student__hostel_room', 'reviewed_by'
        ).all()
        
        if user.role in ['principal', 'vice_principal', 'managing_director', 'teacher', 'staff']:
            status_param = self.request.query_params.get('status')
            if status_param and status_param != 'all':
                qs = qs.filter(status=status_param)
            dept_param = self.request.query_params.get('department')
            if dept_param and dept_param != 'all':
                qs = qs.filter(Q(student__islamic_department_id=dept_param) | Q(student__general_department_id=dept_param))
            student_id = self.request.query_params.get('student') or self.request.query_params.get('student_id')
            if student_id:
                qs = qs.filter(Q(student__student_id=student_id) | Q(student_id=student_id))
            q = self.request.query_params.get('q')
            if q:
                qs = qs.filter(
                    Q(leave_no__icontains=q) |
                    Q(gate_pass_no__icontains=q) |
                    Q(student__name__icontains=q) |
                    Q(student__name_bn__icontains=q) |
                    Q(student__student_id__icontains=q) |
                    Q(guardian_phone__icontains=q)
                )
            return qs
        elif user.role == 'guardian':
            return qs.filter(
                Q(student__guardian_phone=user.phone) |
                Q(guardian_phone=user.phone) |
                Q(student__user=user)
            )
        elif user.role == 'student':
            return qs.filter(student__user=user)
        return StudentLeave.objects.none()

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        student_id = data.get('student') or data.get('student_id')
        
        student = None
        if student_id:
            student = Student.objects.filter(Q(id=student_id if str(student_id).isdigit() else None) | Q(student_id=str(student_id))).first()
        elif request.user.role == 'student':
            student = getattr(request.user, 'student_profile', None)
        elif request.user.role == 'guardian':
            student = Student.objects.filter(guardian_phone=request.user.phone).first()

        if not student:
            return Response({'error': 'শিক্ষার্থী শনাক্ত করা যায়নি। সঠিক শিক্ষার্থী নির্বাচন করুন।'}, status=status.HTTP_400_BAD_REQUEST)

        from_date = data.get('from_date')
        to_date = data.get('to_date')
        total_days = data.get('total_days', 1)
        try:
            d1 = datetime.datetime.strptime(from_date, '%Y-%m-%d').date()
            d2 = datetime.datetime.strptime(to_date, '%Y-%m-%d').date()
            calc_days = (d2 - d1).days + 1
            if calc_days > 0:
                total_days = calc_days
        except Exception:
            pass

        leave = StudentLeave.objects.create(
            student=student,
            applied_by_guardian=data.get('applied_by_guardian') or request.user.name_bn or request.user.name or student.guardian_name,
            guardian_phone=data.get('guardian_phone') or request.user.phone or student.guardian_phone,
            relationship=data.get('relationship') or student.guardian_relationship or 'অভিভাবক',
            leave_type=data.get('leave_type', 'sick'),
            from_date=from_date,
            to_date=to_date,
            total_days=int(total_days),
            reason=data.get('reason', ''),
            emergency_contact=data.get('emergency_contact') or student.guardian_phone,
            departure_time=data.get('departure_time', ''),
            expected_return_time=data.get('expected_return_time', ''),
            status='pending'
        )

        whatsapp_link = None
        try:
            whatsapp_link = send_leave_application_notification(leave, sent_by=request.user)
        except Exception as e:
            print(f"WhatsApp leave notification error: {e}")

        serializer = StudentLeaveSerializer(leave)
        return Response({
            'status': 'success',
            'message': f'ছুটির আবেদন ({leave.leave_no}) সফলভাবে জমা হয়েছে।',
            'leave': serializer.data,
            'whatsapp_link': whatsapp_link
        }, status=status.HTTP_201_CREATED)


class StudentLeaveDetailView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = StudentLeaveSerializer
    queryset = StudentLeave.objects.all()


class StudentLeaveApproveView(APIView):
    permission_classes = [IsAuthenticated, IsPrincipalOrTeacher]

    def post(self, request, pk):
        leave = get_object_or_404(StudentLeave, pk=pk)
        
        departure_time = request.data.get('departure_time', leave.departure_time or 'অনুমোদিত সময়সূচি অনুযায়ী')
        expected_return_time = request.data.get('expected_return_time', leave.expected_return_time or 'নির্ধারিত তারিখ অনুযায়ী')
        review_comment = request.data.get('review_comment', 'অনুমোদিত')

        leave.status = 'approved'
        leave.departure_time = departure_time
        leave.expected_return_time = expected_return_time
        leave.review_comment = review_comment
        leave.reviewed_by = request.user
        leave.reviewed_at = timezone.now()
        leave.save()

        whatsapp_link = None
        try:
            whatsapp_link = send_leave_approval_gatepass(leave, sent_by=request.user)
        except Exception as e:
            print(f"Error sending gatepass whatsapp: {e}")

        return Response({
            'status': 'success',
            'message': f'ছুটি অনুমোদিত হয়েছে এবং গেটপাস ({leave.gate_pass_no}) ইস্যু করা হয়েছে।',
            'leave': StudentLeaveSerializer(leave).data,
            'whatsapp_link': whatsapp_link
        }, status=status.HTTP_200_OK)


class StudentLeaveRejectView(APIView):
    permission_classes = [IsAuthenticated, IsPrincipalOrTeacher]

    def post(self, request, pk):
        leave = get_object_or_404(StudentLeave, pk=pk)
        review_comment = request.data.get('review_comment', 'কর্তৃপক্ষ কর্তৃক আবেদনটি বাতিল করা হয়েছে।')

        leave.status = 'rejected'
        leave.review_comment = review_comment
        leave.reviewed_by = request.user
        leave.reviewed_at = timezone.now()
        leave.save()

        return Response({
            'status': 'success',
            'message': 'ছুটির আবেদন বাতিল করা হয়েছে।',
            'leave': StudentLeaveSerializer(leave).data
        }, status=status.HTTP_200_OK)


class StudentLeaveStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        today = datetime.date.today()
        user = request.user
        if user.role in ['principal', 'vice_principal', 'managing_director', 'teacher', 'staff']:
            qs = StudentLeave.objects.all()
        elif user.role == 'guardian':
            qs = StudentLeave.objects.filter(Q(student__guardian_phone=user.phone) | Q(guardian_phone=user.phone))
        else:
            qs = StudentLeave.objects.filter(student__user=user)

        total = qs.count()
        pending = qs.filter(status='pending').count()
        approved = qs.filter(status='approved').count()
        rejected = qs.filter(status='rejected').count()
        currently_on_leave = qs.filter(status='approved', from_date__lte=today, to_date__gte=today).count()

        return Response({
            'total_applications': total,
            'pending_applications': pending,
            'approved_applications': approved,
            'rejected_applications': rejected,
            'currently_on_leave': currently_on_leave
        })



