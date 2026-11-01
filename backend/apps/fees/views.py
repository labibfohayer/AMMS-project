from rest_framework import generics, views, status, permissions
from rest_framework.response import Response
from .models import FeePayment, FeeReminder, Expense
from .serializers import FeePaymentSerializer, FeeCollectionSerializer, StudentFeeStatusSerializer, FeeReportSerializer, ExpenseSerializer
from .utils import generate_receipt_number, generate_receipt_pdf, generate_voucher_number, BANGLA_MONTHS
from django.http import HttpResponse
from apps.notifications.whatsapp import (
    send_fee_reminder, send_comprehensive_fee_reminder,
    build_due_reminder_message, generate_whatsapp_web_link
)
from apps.students.models import Student
from django.shortcuts import get_object_or_404
from django.db.models import Sum, Q
from datetime import date, datetime
from decimal import Decimal

class IsPrincipal(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and getattr(request.user, 'role', '') in ['principal', 'vice_principal', 'managing_director'])

class FeePaymentListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = FeePaymentSerializer

    def get_queryset(self):
        qs = FeePayment.objects.select_related('student', 'student__islamic_department', 'student__general_department', 'collected_by').order_by('-created_at')
        student_param = self.request.query_params.get('student') or self.request.query_params.get('student_id')
        if student_param:
            if str(student_param).isdigit():
                qs = qs.filter(Q(student__id=int(student_param)) | Q(student__student_id=str(student_param)))
            else:
                qs = qs.filter(student__student_id=str(student_param))
        return qs

class FeePaymentDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated, IsPrincipal]
    queryset = FeePayment.objects.all()
    serializer_class = FeePaymentSerializer

class FeeCollectionView(generics.CreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = FeeCollectionSerializer

    def perform_create(self, serializer):
        return serializer.save(
            receipt_number=generate_receipt_number(),
            collected_by=self.request.user if self.request.user.is_authenticated else None
        )

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        instance = self.perform_create(serializer)
        
        # Auto trigger WhatsApp receipt notification & logging
        try:
            from apps.notifications.whatsapp import send_fee_receipt_notification
            send_fee_receipt_notification(instance, sent_by=request.user if request.user.is_authenticated else None)
        except Exception as e:
            print("Auto WhatsApp notification error:", e)

        response_serializer = FeePaymentSerializer(instance)
        headers = self.get_success_headers(response_serializer.data)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED, headers=headers)

class OnlineFeePaymentView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        student_id = request.data.get('student_id')
        payment_method = request.data.get('payment_method', 'bkash')
        payment_type = request.data.get('payment_type', 'monthly')
        month = request.data.get('month')
        year = request.data.get('year', date.today().year)
        amount = request.data.get('amount')
        trx_id = str(request.data.get('trx_id', '')).strip()
        sender_phone = str(request.data.get('sender_phone', '')).strip()
        custom_note = str(request.data.get('note', '')).strip()

        if not student_id:
            return Response({'error': 'শিক্ষার্থী আইডি প্রদান আবশ্যক'}, status=status.HTTP_400_BAD_REQUEST)
        if not amount or Decimal(str(amount)) <= 0:
            return Response({'error': 'পরিশোধের টাকার পরিমাণ সঠিক নয়'}, status=status.HTTP_400_BAD_REQUEST)
        if not trx_id:
            return Response({'error': 'বিকাশ/নগদ ট্রানজেকশন আইডি (TrxID) প্রদান করুন'}, status=status.HTTP_400_BAD_REQUEST)

        # Resolve student
        student = None
        if str(student_id).isdigit():
            student = Student.objects.filter(Q(id=int(student_id)) | Q(student_id=str(student_id))).first()
        else:
            student = Student.objects.filter(student_id=str(student_id)).first()

        if not student:
            return Response({'error': 'শিক্ষার্থী পাওয়া যায়নি'}, status=status.HTTP_404_NOT_FOUND)

        amount_decimal = Decimal(str(amount))
        
        # Format receipt note
        method_name = 'বিকাশ (bKash)' if payment_method == 'bkash' else ('নগদ (Nagad)' if payment_method == 'nagad' else 'রকেট (Rocket)')
        note_str = f"ডিজিটাল অনলাইন পেমেন্ট: {method_name} | TrxID: {trx_id}"
        if sender_phone:
            note_str += f" | প্রেরক: {sender_phone}"
        if custom_note:
            note_str += f" | {custom_note}"

        month_val = int(month) if month else (date.today().month if payment_type == 'monthly' else None)
        receipt_no = generate_receipt_number()

        payment = FeePayment.objects.create(
            student=student,
            payment_type=payment_type,
            month=month_val,
            year=int(year),
            amount_due=amount_decimal,
            amount_paid=amount_decimal,
            discount=Decimal('0.00'),
            payment_date=date.today(),
            receipt_number=receipt_no,
            note=note_str,
            collected_by=request.user
        )

        # Trigger auto WhatsApp receipt message
        try:
            from apps.notifications.whatsapp import send_fee_receipt_notification
            send_fee_receipt_notification(payment, sent_by=request.user)
        except Exception as e:
            print("Auto WhatsApp notification error:", e)

        # Build direct WhatsApp text for guardian
        month_bangla = BANGLA_MONTHS.get(payment.month, '') if payment.month else ''
        receipt_text = (
            f"আল-মদিনা মডেল মাদ্রাসা এন্ড রিসার্চ ইনস্টিটিউট\n"
            f"ডিজিটাল ফি পরিশোধ নিশ্চিতকরণ রিসিট\n"
            f"-----------------------------------\n"
            f"রশিদ নং: {payment.receipt_number}\n"
            f"শিক্ষার্থী: {student.name_bn or student.name} (রোল: {student.roll_number or '—'})\n"
            f"আইডি: {student.student_id}\n"
            f"বিবরণ: {payment.get_payment_type_display()} {f'({month_bangla} {payment.year})' if month_bangla else f'({payment.year})'}\n"
            f"পরিশোধিত মাধ্যম: {method_name}\n"
            f"TrxID: {trx_id}\n"
            f"পরিশোধিত টাকা: ৳ {payment.amount_paid}\n"
            f"তারিখ: {payment.payment_date}\n\n"
            f"আল-মদিনা মডেল মাদ্রাসায় ফি পরিশোধের জন্য ধন্যবাদ!\n"
            f"হেল্পলাইন: ০১৭১২-৬৩৩২৬৪"
        )
        wa_link = generate_whatsapp_web_link(sender_phone or student.guardian_phone or '01712633264', receipt_text)

        return Response({
            'status': 'success',
            'message': 'আপনার পেমেন্ট সফলভাবে গৃহীত হয়েছে এবং ডিজিটাল মানি রিসিট প্রস্তুত!',
            'payment': FeePaymentSerializer(payment).data,
            'receipt_number': payment.receipt_number,
            'wa_direct_link': wa_link
        }, status=status.HTTP_201_CREATED)

class StudentFeeStatusView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, student_id):
        if str(student_id).isdigit():
            student = Student.objects.filter(Q(id=int(student_id)) | Q(student_id=str(student_id))).first()
        else:
            student = Student.objects.filter(student_id=str(student_id)).first()
            
        if not student:
            return Response({"detail": "Student not found"}, status=status.HTTP_404_NOT_FOUND)
        
        # Access control
        if request.user.role not in ['principal', 'vice_principal', 'managing_director', 'admin']:
            if request.user.role == 'student':
                if getattr(student, 'user', None) != request.user:
                    return Response(status=status.HTTP_403_FORBIDDEN)
            elif request.user.role == 'guardian':
                if getattr(student, 'guardian_phone', None) and getattr(request.user, 'phone', None) and getattr(student, 'guardian_phone', None) != getattr(request.user, 'phone', None):
                    return Response(status=status.HTTP_403_FORBIDDEN)
            else:
                return Response(status=status.HTTP_403_FORBIDDEN)
        
        current_year = date.today().year
        current_month = date.today().month
        
        payments = FeePayment.objects.filter(student=student, payment_type='monthly', year=current_year)
        
        paid_months_data = []
        paid_month_numbers = set()
        total_paid_this_year = Decimal('0.00')
        
        for p in payments:
            if p.month:
                paid_month_numbers.add(p.month)
                paid_months_data.append({
                    "month": p.month,
                    "month_name": BANGLA_MONTHS.get(p.month, str(p.month)),
                    "amount_paid": p.amount_paid,
                    "payment_date": p.payment_date.strftime("%Y-%m-%d") if p.payment_date else None,
                    "receipt_number": p.receipt_number
                })
            total_paid_this_year += p.amount_paid
            
        due_months_data = []
        total_due_this_year = Decimal('0.00')
        
        for m in range(1, current_month + 1):
            if m not in paid_month_numbers:
                due_months_data.append({
                    "month": m,
                    "month_name": BANGLA_MONTHS.get(m, str(m)),
                    "amount_due": student.monthly_fee
                })
                total_due_this_year += student.monthly_fee
                
        # Handle hostel fee if applicable (Task didn't specify format for hostel dues in this view, so stick to monthly + returning hostel_fee as requested)
        return Response({
            "student_id": student.student_id,
            "name": student.name,
            "monthly_fee": student.monthly_fee,
            "hostel_fee": student.hostel_fee,
            "current_year": current_year,
            "paid_months": paid_months_data,
            "due_months": due_months_data,
            "total_paid_this_year": total_paid_this_year,
            "total_due_this_year": total_due_this_year
        })

class FeeReceiptPDFView(views.APIView):
    def get(self, request, pk):
        payment = generics.get_object_or_404(FeePayment, pk=pk)
        pdf = generate_receipt_pdf(payment)
        response = HttpResponse(pdf, content_type='application/pdf')
        return response

class DueFeeListView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        year_param = request.query_params.get('year')
        month_param = request.query_params.get('up_to_month')
        current_year = int(year_param) if year_param else date.today().year
        current_month = int(month_param) if month_param else date.today().month

        dept_id = request.query_params.get('department_id')
        res_status = request.query_params.get('residential_status')
        min_due_param = request.query_params.get('min_due')
        min_due = float(min_due_param) if min_due_param else 0.0
        search = request.query_params.get('search', '').strip().lower()
        
        students_qs = Student.objects.filter(status='active').select_related(
            'islamic_department', 'general_department'
        )

        if dept_id:
            students_qs = students_qs.filter(
                Q(islamic_department_id=dept_id) | Q(general_department_id=dept_id)
            )
        if res_status and res_status in ['residential', 'day']:
            students_qs = students_qs.filter(residential_status=res_status)

        due_list = []
        total_defaulters = 0
        total_due_sum = Decimal('0.00')
        total_monthly_due_sum = Decimal('0.00')
        total_hostel_due_sum = Decimal('0.00')

        # Cache reminders sent for performance
        recent_reminders = {
            r['student_id']: r['sent_at']
            for r in FeeReminder.objects.order_by('sent_at').values('student_id', 'sent_at')
        }

        for s in students_qs:
            # Monthly tuition fees
            expected_monthly = s.monthly_fee * current_month
            paid_monthly = FeePayment.objects.filter(
                student=s, payment_type='monthly', year=current_year, month__lte=current_month
            ).aggregate(total=Sum('amount_paid'))['total'] or Decimal('0.00')
            monthly_due = max(Decimal('0.00'), expected_monthly - paid_monthly)
            
            # Find exact due months for monthly fee
            paid_months = set(FeePayment.objects.filter(
                student=s, payment_type='monthly', year=current_year, month__lte=current_month
            ).values_list('month', flat=True))
            due_month_indices = [m for m in range(1, current_month + 1) if m not in paid_months]
            due_months = [BANGLA_MONTHS.get(m, str(m)) for m in due_month_indices]
            
            # Hostel fees
            hostel_due = Decimal('0.00')
            paid_hostel = Decimal('0.00')
            if s.residential_status == 'residential' and s.hostel_fee > 0:
                expected_hostel = s.hostel_fee * current_month
                paid_hostel = FeePayment.objects.filter(
                    student=s, payment_type='hostel', year=current_year, month__lte=current_month
                ).aggregate(total=Sum('amount_paid'))['total'] or Decimal('0.00')
                hostel_due = max(Decimal('0.00'), expected_hostel - paid_hostel)
                
            total_due = monthly_due + hostel_due
            
            if total_due > Decimal(str(min_due)) and total_due > 0:
                # Text summary of due months
                if len(due_months) == 0:
                    due_text = 'হোস্টেল ও বিবিধ বকেয়া'
                elif len(due_months) == 1:
                    due_text = due_months[0]
                elif len(due_months) == current_month and current_month > 1:
                    due_text = f"{due_months[0]} - {due_months[-1]} ({len(due_months)} মাস)"
                else:
                    due_text = ', '.join(due_months[:3]) + (f" +{len(due_months)-3} মাস" if len(due_months) > 3 else "")

                # Search filter
                if search:
                    match = (
                        search in (s.name or '').lower() or
                        search in (s.name_bn or '').lower() or
                        search in (s.student_id or '').lower() or
                        search in (s.guardian_phone or '').lower() or
                        search in str(s.roll_number or '')
                    )
                    if not match:
                        continue

                class_name = s.islamic_department.name if s.islamic_department else (s.general_department.name if s.general_department else 'সাধারণ')
                
                # Pre-generate direct WhatsApp link
                wa_msg = build_due_reminder_message(
                    student=s,
                    due_months_text=due_text,
                    total_due=float(total_due),
                    monthly_due=float(monthly_due),
                    hostel_due=float(hostel_due)
                )
                wa_link = generate_whatsapp_web_link(s.guardian_phone, wa_msg)

                last_rem = recent_reminders.get(s.id)

                due_list.append({
                    "id": s.id,
                    "student_id": s.student_id,
                    "name": s.name,
                    "name_bn": s.name_bn or s.name,
                    "roll_number": s.roll_number,
                    "section": s.section,
                    "class_name": class_name,
                    "father_name": s.father_name_bn or s.father_name,
                    "guardian_phone": s.guardian_phone,
                    "residential_status": s.residential_status,
                    "residential_status_display": "আবাসিক" if s.residential_status == 'residential' else "অনাবাসিক",
                    "monthly_fee": float(s.monthly_fee),
                    "hostel_fee": float(s.hostel_fee),
                    "monthly_due": float(monthly_due),
                    "hostel_due": float(hostel_due),
                    "total_due": float(total_due),
                    "due_months": due_months,
                    "due_months_text": due_text,
                    "due_count": len(due_months),
                    "last_reminder_sent": last_rem.strftime('%d %b %Y, %I:%M %p') if last_rem else None,
                    "whatsapp_link": wa_link
                })
                
                total_defaulters += 1
                total_due_sum += total_due
                total_monthly_due_sum += monthly_due
                total_hostel_due_sum += hostel_due
                
        # Sort descending by total due amount
        due_list.sort(key=lambda x: x['total_due'], reverse=True)

        return Response({
            "summary": {
                "total_defaulters": total_defaulters,
                "total_due_amount": float(total_due_sum),
                "total_monthly_due": float(total_monthly_due_sum),
                "total_hostel_due": float(total_hostel_due_sum),
                "current_year": current_year,
                "current_month": current_month,
                "current_month_name": BANGLA_MONTHS.get(current_month, '')
            },
            "defaulters": due_list
        })

class SendFeeReminderView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        student_id_val = request.data.get('student_id')
        if not student_id_val:
            return Response({'detail': 'student_id আবশ্যক'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            if isinstance(student_id_val, int) or str(student_id_val).isdigit():
                student = get_object_or_404(Student, id=int(student_id_val))
            else:
                student = get_object_or_404(Student, student_id=str(student_id_val))
        except Exception:
            return Response({'detail': 'শিক্ষার্থী পাওয়া যায়নি'}, status=status.HTTP_404_NOT_FOUND)

        year_param = request.data.get('year')
        month_param = request.data.get('up_to_month')
        current_year = int(year_param) if year_param else date.today().year
        current_month = int(month_param) if month_param else date.today().month
        custom_note = request.data.get('custom_note', '').strip()

        # Compute dues
        expected_monthly = student.monthly_fee * current_month
        paid_monthly = FeePayment.objects.filter(
            student=student, payment_type='monthly', year=current_year, month__lte=current_month
        ).aggregate(total=Sum('amount_paid'))['total'] or Decimal('0.00')
        monthly_due = max(Decimal('0.00'), expected_monthly - paid_monthly)

        paid_months = set(FeePayment.objects.filter(
            student=student, payment_type='monthly', year=current_year, month__lte=current_month
        ).values_list('month', flat=True))
        due_months = [BANGLA_MONTHS.get(m, str(m)) for m in range(1, current_month + 1) if m not in paid_months]

        hostel_due = Decimal('0.00')
        if student.residential_status == 'residential' and student.hostel_fee > 0:
            expected_hostel = student.hostel_fee * current_month
            paid_hostel = FeePayment.objects.filter(
                student=student, payment_type='hostel', year=current_year, month__lte=current_month
            ).aggregate(total=Sum('amount_paid'))['total'] or Decimal('0.00')
            hostel_due = max(Decimal('0.00'), expected_hostel - paid_hostel)

        total_due = monthly_due + hostel_due
        due_text = ', '.join(due_months) if due_months else 'হোস্টেল ও বিবিধ বকেয়া'

        is_sent, msg, link = send_comprehensive_fee_reminder(
            student=student,
            due_months_text=due_text,
            total_due=float(total_due),
            monthly_due=float(monthly_due),
            hostel_due=float(hostel_due),
            custom_note=custom_note,
            sent_by=request.user
        )

        FeeReminder.objects.create(
            student=student,
            month=current_month,
            year=current_year,
            message=msg
        )

        return Response({
            'status': 'sent',
            'student_name': student.name_bn or student.name,
            'total_due': float(total_due),
            'whatsapp_link': link,
            'message': f"{student.name_bn}-এর অভিভাবককে বকেয়া রিমাইন্ডার সফলভাবে পাঠানো হয়েছে!"
        }, status=status.HTTP_200_OK)

class BulkSendFeeReminderView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        student_ids = request.data.get('student_ids', [])
        custom_note = request.data.get('custom_note', '').strip()
        year_param = request.data.get('year')
        month_param = request.data.get('up_to_month')
        current_year = int(year_param) if year_param else date.today().year
        current_month = int(month_param) if month_param else date.today().month

        if student_ids and len(student_ids) > 0:
            students = Student.objects.filter(id__in=student_ids, status='active')
        else:
            students = Student.objects.filter(status='active')

        sent_count = 0
        failed_count = 0

        for student in students:
            expected_monthly = student.monthly_fee * current_month
            paid_monthly = FeePayment.objects.filter(
                student=student, payment_type='monthly', year=current_year, month__lte=current_month
            ).aggregate(total=Sum('amount_paid'))['total'] or Decimal('0.00')
            monthly_due = max(Decimal('0.00'), expected_monthly - paid_monthly)

            paid_months = set(FeePayment.objects.filter(
                student=student, payment_type='monthly', year=current_year, month__lte=current_month
            ).values_list('month', flat=True))
            due_months = [BANGLA_MONTHS.get(m, str(m)) for m in range(1, current_month + 1) if m not in paid_months]

            hostel_due = Decimal('0.00')
            if student.residential_status == 'residential' and student.hostel_fee > 0:
                expected_hostel = student.hostel_fee * current_month
                paid_hostel = FeePayment.objects.filter(
                    student=student, payment_type='hostel', year=current_year, month__lte=current_month
                ).aggregate(total=Sum('amount_paid'))['total'] or Decimal('0.00')
                hostel_due = max(Decimal('0.00'), expected_hostel - paid_hostel)

            total_due = monthly_due + hostel_due
            if total_due <= 0:
                continue

            due_text = ', '.join(due_months) if due_months else 'হোস্টেল ও বিবিধ বকেয়া'

            try:
                is_sent, msg, link = send_comprehensive_fee_reminder(
                    student=student,
                    due_months_text=due_text,
                    total_due=float(total_due),
                    monthly_due=float(monthly_due),
                    hostel_due=float(hostel_due),
                    custom_note=custom_note,
                    sent_by=request.user
                )
                FeeReminder.objects.create(
                    student=student,
                    month=current_month,
                    year=current_year,
                    message=msg
                )
                sent_count += 1
            except Exception as e:
                failed_count += 1

        return Response({
            'status': 'success',
            'total_processed': sent_count + failed_count,
            'sent_count': sent_count,
            'failed_count': failed_count,
            'message': f"মোট {sent_count} জন শিক্ষার্থীর অভিভাবকের হোয়াটসঅ্যাপে সফলভাবে বকেয়া নোটিশ পাঠানো হয়েছে!"
        }, status=status.HTTP_200_OK)

class AllStudentsFeeReportView(views.APIView):
    def get(self, request):
        current_year = date.today().year
        current_month = date.today().month
        students = Student.objects.filter(status='active').select_related('islamic_department', 'general_department')
        report_data = []
        for s in students:
            expected_monthly = s.monthly_fee * current_month
            paid_monthly = FeePayment.objects.filter(student=s, payment_type='monthly', year=current_year).aggregate(total=Sum('amount_paid'))['total'] or Decimal('0.00')
            monthly_due = expected_monthly - paid_monthly
            
            hostel_due = Decimal('0.00')
            paid_hostel = Decimal('0.00')
            if s.residential_status == 'residential':
                expected_hostel = s.hostel_fee * current_month
                paid_hostel = FeePayment.objects.filter(student=s, payment_type='hostel', year=current_year).aggregate(total=Sum('amount_paid'))['total'] or Decimal('0.00')
                hostel_due = expected_hostel - paid_hostel
                
            report_data.append({
                "student_id": s.student_id,
                "name": s.name,
                "monthly_fee": s.monthly_fee,
                "total_paid_monthly": paid_monthly,
                "monthly_due": monthly_due,
                "hostel_fee": s.hostel_fee,
                "total_paid_hostel": paid_hostel,
                "hostel_due": hostel_due,
                "total_due": monthly_due + hostel_due
            })
        return Response(report_data)

class ExpenseListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ExpenseSerializer

    def get_queryset(self):
        qs = Expense.objects.all().order_by('-expense_date', '-id')
        date_str = self.request.query_params.get('date')
        if date_str:
            try:
                target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
                qs = qs.filter(expense_date=target_date)
            except ValueError:
                pass
        category = self.request.query_params.get('category')
        if category:
            qs = qs.filter(category=category)
        return qs

    def perform_create(self, serializer):
        voucher = serializer.validated_data.get('voucher_number')
        if not voucher:
            voucher = generate_voucher_number()
        serializer.save(
            voucher_number=voucher,
            created_by=self.request.user if self.request.user.is_authenticated else None
        )

class DailyCashBookView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        date_param = request.query_params.get('date')
        if date_param:
            try:
                target_date = datetime.strptime(date_param, '%Y-%m-%d').date()
            except ValueError:
                target_date = date.today()
        else:
            target_date = date.today()

        # Opening Balance: total income prior to target_date minus total expense prior to target_date
        prev_income = FeePayment.objects.filter(payment_date__lt=target_date).aggregate(total=Sum('amount_paid'))['total'] or Decimal('0.00')
        prev_expense = Expense.objects.filter(expense_date__lt=target_date).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
        opening_balance = prev_income - prev_expense

        # Incomes on target_date
        incomes_qs = FeePayment.objects.filter(payment_date=target_date).select_related(
            'student', 'student__islamic_department', 'student__general_department', 'collected_by'
        ).order_by('id')

        incomes_data = []
        for p in incomes_qs:
            dept_name = ''
            if p.student.islamic_department:
                dept_name = p.student.islamic_department.name
            elif p.student.general_department:
                dept_name = p.student.general_department.name

            incomes_data.append({
                'id': p.id,
                'receipt_number': p.receipt_number,
                'student_id': p.student.student_id,
                'student_name': p.student.name,
                'student_name_bn': p.student.name_bn or p.student.name,
                'roll_number': p.student.roll_number,
                'department': dept_name,
                'payment_type': p.payment_type,
                'payment_type_display': p.get_payment_type_display(),
                'month': p.month,
                'month_name': BANGLA_MONTHS.get(p.month, '') if p.month else '',
                'year': p.year,
                'amount_paid': p.amount_paid,
                'discount': p.discount,
                'collected_by': p.collected_by.name if p.collected_by else 'হিসাবরক্ষণ',
                'note': p.note,
                'created_at': p.created_at.strftime('%I:%M %p') if p.created_at else ''
            })

        total_income = incomes_qs.aggregate(total=Sum('amount_paid'))['total'] or Decimal('0.00')

        # Expenses on target_date
        expenses_qs = Expense.objects.filter(expense_date=target_date).select_related('created_by').order_by('id')
        expenses_data = []
        for e in expenses_qs:
            expenses_data.append({
                'id': e.id,
                'voucher_number': e.voucher_number,
                'title': e.title,
                'category': e.category,
                'category_display': e.get_category_display(),
                'amount': e.amount,
                'spent_by': e.spent_by,
                'note': e.note,
                'created_by': e.created_by.name if e.created_by else 'হিসাবরক্ষণ',
                'created_at': e.created_at.strftime('%I:%M %p') if e.created_at else ''
            })

        total_expense = expenses_qs.aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

        closing_balance = opening_balance + total_income - total_expense

        # Income breakdown by payment type
        income_breakdown = {}
        for item in incomes_qs.values('payment_type').annotate(total=Sum('amount_paid')):
            income_breakdown[item['payment_type']] = item['total']

        # Expense breakdown by category
        expense_breakdown = {}
        for item in expenses_qs.values('category').annotate(total=Sum('amount')):
            expense_breakdown[item['category']] = item['total']

        return Response({
            'date': target_date.strftime('%Y-%m-%d'),
            'date_bn': f"{target_date.day} {BANGLA_MONTHS.get(target_date.month, '')} {target_date.year}",
            'opening_balance': opening_balance,
            'total_income': total_income,
            'total_expense': total_expense,
            'closing_balance': closing_balance,
            'net_cash_flow': total_income - total_expense,
            'incomes': incomes_data,
            'expenses': expenses_data,
            'income_count': len(incomes_data),
            'expense_count': len(expenses_data),
            'income_breakdown': income_breakdown,
            'expense_breakdown': expense_breakdown,
        })
