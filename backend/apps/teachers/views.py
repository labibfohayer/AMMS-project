from rest_framework import generics, views, status, permissions
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from datetime import date, datetime
from decimal import Decimal
from .models import Teacher, SalaryPayment, LeaveApplication
from apps.attendance.models import TeacherAttendance
from .serializers import (TeacherListSerializer, TeacherDetailSerializer, 
                          TeacherCreateSerializer, SalaryPaymentSerializer, 
                          LeaveApplicationSerializer)
from .utils import generate_id_card_pdf, generate_salary_slip_pdf

class IsPrincipal(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['principal', 'vice_principal', 'managing_director']

class TeacherListCreateView(generics.ListCreateAPIView):
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return TeacherCreateSerializer
        return TeacherListSerializer

    def get_queryset(self):
        return Teacher.objects.all()
        
    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsPrincipal()]
        return [permissions.IsAuthenticated()]

class TeacherDetailView(generics.RetrieveUpdateDestroyAPIView):
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    serializer_class = TeacherDetailSerializer
    queryset = Teacher.objects.all()

    def get_queryset(self):
        if self.request.user.role in ['principal', 'vice_principal', 'managing_director']:
            return Teacher.objects.all()
        return Teacher.objects.filter(user=self.request.user)

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [IsPrincipal()]
        return [permissions.IsAuthenticated()]

    def perform_update(self, serializer):
        instance = serializer.save()
        if instance.photo and instance.user:
            instance.user.photo = instance.photo
            instance.user.save(update_fields=['photo'])

    def perform_destroy(self, instance):
        user = instance.user
        instance.delete()
        if user and user.role in ['teacher', 'staff']:
            user.delete()

class TeacherStatusUpdateView(views.APIView):
    permission_classes = [IsPrincipal]

    def post(self, request, pk):
        teacher = get_object_or_404(Teacher, pk=pk)
        teacher.is_active = not teacher.is_active
        teacher.save()
        return Response({'status': 'Teacher status updated', 'is_active': teacher.is_active})

class SalaryPaymentView(views.APIView):
    permission_classes = [IsPrincipal]
    
    def post(self, request, pk):
        teacher = get_object_or_404(Teacher, pk=pk)
        month = int(request.data.get('month', date.today().month))
        year = int(request.data.get('year', date.today().year))
        amount = request.data.get('amount', teacher.monthly_salary)
        paid_date_str = request.data.get('paid_date')
        if paid_date_str:
            try:
                paid_date = datetime.strptime(paid_date_str, '%Y-%m-%d').date()
            except ValueError:
                paid_date = date.today()
        else:
            paid_date = date.today()
        note = request.data.get('note', '')

        payment, created = SalaryPayment.objects.update_or_create(
            teacher=teacher, month=month, year=year,
            defaults={
                'amount': amount,
                'paid_date': paid_date,
                'note': note,
                'paid_by': request.user if request.user.is_authenticated else None
            }
        )

        # Synchronize with Expense in Fees app for the Cash Book!
        try:
            from apps.fees.models import Expense
            from apps.fees.utils import generate_voucher_number
            
            voucher_title = f"শিক্ষক/স্টাফ বেতন: {teacher.name_bn or teacher.name} ({month}/{year})"
            existing_exp = Expense.objects.filter(
                category='salary',
                title=voucher_title,
                expense_date=paid_date
            ).first()

            if not existing_exp:
                voucher = generate_voucher_number()
                Expense.objects.create(
                    title=voucher_title,
                    category='salary',
                    amount=payment.amount,
                    expense_date=paid_date,
                    voucher_number=voucher,
                    spent_by=request.user.name if hasattr(request.user, 'name') and request.user.name else 'হিসাবরক্ষণ শাখা',
                    note=f"আইডি: {teacher.teacher_id}, পদবী: {teacher.designation_bn or teacher.designation}. {note}".strip(),
                    created_by=request.user if request.user.is_authenticated else None
                )
        except Exception as exp_err:
            print("Expense sync error:", exp_err)

        return Response(SalaryPaymentSerializer(payment).data, status=status.HTTP_201_CREATED)

class MonthlySalarySheetView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        month = int(request.query_params.get('month', date.today().month))
        year = int(request.query_params.get('year', date.today().year))

        teachers = Teacher.objects.filter(is_active=True).order_by('id')
        payments = {p.teacher_id: p for p in SalaryPayment.objects.filter(month=month, year=year)}

        from apps.attendance.models import TeacherAttendance
        from apps.fees.utils import BANGLA_MONTHS

        attendances = TeacherAttendance.objects.filter(
            date__month=month, date__year=year
        )

        teachers_data = []
        total_budget = Decimal('0.00')
        total_paid = Decimal('0.00')
        paid_count = 0
        unpaid_count = 0

        for t in teachers:
            total_budget += t.monthly_salary
            sp = payments.get(t.id)
            t_att = attendances.filter(teacher_id=t.id)
            present_days = t_att.filter(status='present').count()
            absent_days = t_att.filter(status='absent').count()
            late_days = t_att.filter(status='late').count()
            leave_days = t_att.filter(status='leave').count()

            if sp:
                paid_count += 1
                total_paid += sp.amount
                payment_info = {
                    'id': sp.id,
                    'is_paid': True,
                    'amount': sp.amount,
                    'paid_date': sp.paid_date.strftime('%Y-%m-%d'),
                    'note': sp.note,
                    'paid_by': sp.paid_by.name if sp.paid_by else 'কাউন্টার'
                }
            else:
                unpaid_count += 1
                payment_info = {
                    'is_paid': False,
                    'suggested_amount': t.monthly_salary,
                    'amount': t.monthly_salary,
                    'paid_date': None,
                    'note': ''
                }

            teachers_data.append({
                'id': t.id,
                'teacher_id': t.teacher_id,
                'name': t.name,
                'name_bn': t.name_bn or t.name,
                'phone': t.phone,
                'designation': t.designation,
                'designation_bn': t.designation_bn or t.designation,
                'staff_type': t.staff_type,
                'monthly_salary': t.monthly_salary,
                'attendance': {
                    'total_recorded_days': t_att.count(),
                    'present_days': present_days,
                    'absent_days': absent_days,
                    'late_days': late_days,
                    'leave_days': leave_days,
                },
                'payment': payment_info
            })

        return Response({
            'month': month,
            'month_name': BANGLA_MONTHS.get(month, str(month)),
            'year': year,
            'total_staff': len(teachers),
            'total_budget': total_budget,
            'total_paid': total_paid,
            'total_due': total_budget - total_paid,
            'paid_count': paid_count,
            'unpaid_count': unpaid_count,
            'teachers': teachers_data
        })

class TeacherSalaryStatusView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        teacher = get_object_or_404(Teacher, pk=pk)
        if request.user.role not in ['principal', 'vice_principal', 'managing_director'] and request.user != teacher.user:
            return Response(status=status.HTTP_403_FORBIDDEN)
            
        payments = SalaryPayment.objects.filter(teacher=teacher)
        serializer = SalaryPaymentSerializer(payments, many=True)
        return Response(serializer.data)

class TeacherIDCardView(views.APIView):
    def get(self, request, pk):
        teacher = get_object_or_404(Teacher, pk=pk)
        return generate_id_card_pdf(teacher)

class SalarySlipView(views.APIView):
    def get(self, request, pk, month, year):
        teacher = get_object_or_404(Teacher, pk=pk)
        payment = get_object_or_404(SalaryPayment, teacher=teacher, month=month, year=year)
        return generate_salary_slip_pdf(teacher, month, year, payment)

class LeaveApplicationView(generics.ListCreateAPIView):
    serializer_class = LeaveApplicationSerializer
    
    def get_queryset(self):
        if self.request.user.role in ['principal', 'vice_principal', 'managing_director']:
            return LeaveApplication.objects.all()
        # assume teacher profile exists
        return LeaveApplication.objects.filter(teacher__user=self.request.user)
        
    def perform_create(self, serializer):
        teacher = get_object_or_404(Teacher, user=self.request.user)
        serializer.save(teacher=teacher)

class LeaveReviewView(views.APIView):
    permission_classes = [IsPrincipal]
    
    def put(self, request, pk):
        leave = get_object_or_404(LeaveApplication, pk=pk)
        action = request.data.get('status')
        if action in ['approved', 'rejected']:
            leave.status = action
            leave.reviewed_by = request.user
            leave.save()
            return Response({'status': f'Leave {action}'})
        return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)

class TeacherServiceRecordView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        teacher = get_object_or_404(Teacher, pk=pk)
        if request.user.role not in ['principal', 'vice_principal', 'managing_director', 'admin'] and request.user != teacher.user:
            return Response({'error': 'অননুমোদিত এক্সেস'}, status=status.HTTP_403_FORBIDDEN)

        # Tenure calculation
        today = date.today()
        joining = teacher.joining_date or today
        total_days = max(0, (today - joining).days)
        years = total_days // 365
        remaining_days = total_days % 365
        months = remaining_days // 30

        # Attendance calculation
        attendances = TeacherAttendance.objects.filter(teacher=teacher)
        total_recorded = attendances.count()
        present_count = attendances.filter(status='present').count()
        absent_count = attendances.filter(status='absent').count()
        late_count = attendances.filter(status='late').count()
        leave_count = attendances.filter(status='leave').count()
        attendance_rate = round((present_count / total_recorded * 100), 1) if total_recorded > 0 else 100.0

        # Salary history
        salary_qs = SalaryPayment.objects.filter(teacher=teacher).order_by('-year', '-month')
        salary_history = []
        total_salary_disbursed = Decimal('0.00')
        for sp in salary_qs:
            total_salary_disbursed += sp.amount
            salary_history.append({
                'id': sp.id,
                'month': sp.month,
                'year': sp.year,
                'amount': float(sp.amount),
                'paid_date': str(sp.paid_date),
                'note': sp.note,
                'receipt_no': f"SAL-{sp.year}{sp.month:02d}-{teacher.teacher_id}"
            })

        # Leaves
        leaves_qs = LeaveApplication.objects.filter(teacher=teacher).order_by('-created_at')
        leaves_data = []
        for lv in leaves_qs:
            leaves_data.append({
                'id': lv.id,
                'leave_type': lv.leave_type,
                'from_date': str(lv.from_date),
                'to_date': str(lv.to_date),
                'reason': lv.reason,
                'status': lv.status,
                'created_at': str(lv.created_at.date())
            })

        photo_url = None
        if teacher.photo:
            photo_url = request.build_absolute_uri(teacher.photo.url)
        elif 'ফারুক' in (teacher.name_bn or '') or 'principal' in teacher.designation.lower():
            photo_url = '/principal.jpg'

        return Response({
            'teacher': {
                'id': teacher.id,
                'teacher_id': teacher.teacher_id,
                'name': teacher.name,
                'name_bn': teacher.name_bn or teacher.name,
                'phone': teacher.phone,
                'photo': photo_url,
                'staff_type': teacher.staff_type,
                'designation': teacher.designation,
                'designation_bn': teacher.designation_bn or teacher.designation,
                'qualification': teacher.qualification,
                'joining_date': str(teacher.joining_date),
                'monthly_salary': float(teacher.monthly_salary),
                'address': teacher.address,
                'nid': teacher.nid or '—',
                'is_active': teacher.is_active,
            },
            'tenure': {
                'total_days': total_days,
                'years': years,
                'months': months,
                'tenure_text': f"{years} বছর {months} মাস" if years > 0 else f"{months} মাস"
            },
            'attendance_summary': {
                'total_recorded': total_recorded,
                'present_count': present_count,
                'absent_count': absent_count,
                'late_count': late_count,
                'leave_count': leave_count,
                'attendance_rate': attendance_rate,
            },
            'financial_summary': {
                'monthly_salary': float(teacher.monthly_salary),
                'total_disbursed': float(total_salary_disbursed),
                'total_payments_count': len(salary_history),
                'last_paid_date': salary_history[0]['paid_date'] if salary_history else None,
            },
            'salary_history': salary_history,
            'leave_records': leaves_data,
            'institution': {
                'name': 'আল-মদিনা মডেল মাদ্রাসা এন্ড রিসার্চ ইনস্টিটিউট',
                'name_en': 'Al Madina Model Madrasa and Research Institute',
                'address': 'ক-৭৫/২, মহাখালী দক্ষিণপাড়া, বনানী, ঢাকা-১২১২',
                'phone': '০১৭১২-৬৩৩২৬৪',
                'principal_name': 'মাওলানা ওমর ফারুক মুজাহিদী',
                'principal_title': 'অধ্যক্ষ ও শায়খুল হাদিস',
            }
        })


class TeacherMeView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        teacher = Teacher.objects.filter(user=request.user).first()
        if not teacher:
            teacher = Teacher.objects.first()
        if not teacher:
            return Response({'error': 'Teacher record not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response(TeacherDetailSerializer(teacher).data)

