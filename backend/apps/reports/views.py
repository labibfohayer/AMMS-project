from rest_framework import views, permissions
from rest_framework.response import Response
from django.db.models import Sum, Count, Q
from datetime import date
from decimal import Decimal
from apps.students.models import Student
from apps.attendance.models import StudentAttendance
from apps.teachers.models import Teacher
from apps.fees.models import FeePayment
from apps.notices.models import Notice
from apps.notices.serializers import NoticeSerializer
from django.http import HttpResponse
from .utils import generate_fee_report_excel
import openpyxl
from apps.exams.models import ExamResult
from django.shortcuts import get_object_or_404
from io import BytesIO

class DashboardStatsView(views.APIView):
    def get(self, request):
        today = date.today()
        current_year = today.year
        current_month = today.month

        # Student counts
        total_students = Student.objects.filter(status='active').count()
        residential = Student.objects.filter(status='active', residential_status='residential').count()
        day_scholars = total_students - residential

        # Today's attendance
        today_present = StudentAttendance.objects.filter(date=today, status='present').values('student').distinct().count()
        today_absent = StudentAttendance.objects.filter(date=today, status='absent').values('student').distinct().count()

        # Staff counts
        total_teachers = Teacher.objects.filter(is_active=True, staff_type='teacher').count()
        total_staff = Teacher.objects.filter(is_active=True).exclude(staff_type='teacher').count()

        # Fee dues: fast bulk aggregate queries (O(1) instead of O(N) student loop)
        total_monthly_rate = Student.objects.filter(status='active').aggregate(
            total=Sum('monthly_fee')
        )['total'] or Decimal('0')
        expected_total = total_monthly_rate * current_month

        total_paid = FeePayment.objects.filter(
            student__status='active',
            payment_type='monthly', 
            year=current_year
        ).aggregate(total=Sum('amount_paid'))['total'] or Decimal('0')

        total_due = max(Decimal('0'), expected_total - total_paid)

        # Latest notices (5)
        latest_notices = Notice.objects.filter(is_active=True).order_by('-created_at')[:5]

        # Department-wise counts
        dept_counts = Student.objects.filter(status='active').values('islamic_department__name', 'general_department__name').annotate(count=Count('id'))

        return Response({
            "total_students": total_students,
            "residential_students": residential,
            "day_students": day_scholars,
            "today_present": today_present,
            "today_absent": today_absent,
            "total_teachers": total_teachers,
            "total_staff": total_staff,
            "total_due_fee": str(total_due),
            "latest_notices": NoticeSerializer(latest_notices, many=True).data,
            "department_counts": list(dept_counts)
        })

class FeeReportView(views.APIView):
    def get(self, request):
        students_data = []
        students = Student.objects.filter(status='active').select_related('islamic_department', 'general_department')
        current_year = date.today().year
        current_month = date.today().month
        for s in students:
            expected_monthly = s.monthly_fee * current_month
            paid_monthly = FeePayment.objects.filter(student=s, payment_type='monthly', year=current_year).aggregate(total=Sum('amount_paid'))['total'] or Decimal('0.00')
            monthly_due = expected_monthly - paid_monthly
            class_name = s.islamic_department.name if s.islamic_department else (s.general_department.name if s.general_department else 'N/A')
            students_data.append({
                'name': s.name,
                'class_name': class_name,
                'monthly_fee': s.monthly_fee,
                'months_paid': FeePayment.objects.filter(student=s, payment_type='monthly', year=current_year).values('month').distinct().count(),
                'total_paid': paid_monthly,
                'total_due': monthly_due
            })
        excel_bytes = generate_fee_report_excel(students_data)
        response = HttpResponse(excel_bytes, content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = 'attachment; filename="fee_report.xlsx"'
        return response

class AttendanceReportView(views.APIView):
    def get(self, request):
        month = request.query_params.get('month')
        year = request.query_params.get('year')
        classroom_id = request.query_params.get('classroom_id')
        
        if not all([month, year, classroom_id]):
            return Response({"error": "Missing parameters"}, status=400)
            
        attendances = StudentAttendance.objects.filter(
            date__month=month,
            date__year=year,
            classroom_id=classroom_id
        ).select_related('student')
        
        student_stats = {}
        for att in attendances:
            student = att.student
            if student.id not in student_stats:
                class_name = student.islamic_department.name if student.islamic_department else (student.general_department.name if student.general_department else '')
                student_stats[student.id] = {
                    'roll': student.roll_number,
                    'name': student.name,
                    'class': class_name,
                    'present': 0,
                    'absent': 0,
                    'late': 0
                }
            
            if att.status == 'present':
                student_stats[student.id]['present'] += 1
            elif att.status == 'absent':
                student_stats[student.id]['absent'] += 1
            elif att.status == 'late':
                student_stats[student.id]['late'] += 1
                
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "Attendance Report"
        
        headers = ["Roll", "Name", "Class", "Present Days", "Absent Days", "Late Days", "Attendance %"]
        ws.append(headers)
        
        sorted_students = sorted(student_stats.values(), key=lambda x: (x['roll'] or 0))
        
        tot_present = 0
        tot_absent = 0
        tot_late = 0
        
        for st in sorted_students:
            total_days = st['present'] + st['absent'] + st['late']
            pct = (st['present'] / total_days * 100) if total_days > 0 else 0
            ws.append([
                st['roll'],
                st['name'],
                st['class'],
                st['present'],
                st['absent'],
                st['late'],
                f"{pct:.2f}%"
            ])
            tot_present += st['present']
            tot_absent += st['absent']
            tot_late += st['late']
            
        ws.append(["Totals", "", "", tot_present, tot_absent, tot_late, ""])
        
        buffer = BytesIO()
        wb.save(buffer)
        
        response = HttpResponse(buffer.getvalue(), content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        month_name = date(int(year), int(month), 1).strftime('%b')
        response['Content-Disposition'] = f'attachment; filename="attendance_report_{month_name}_{year}.xlsx"'
        return response

class ExamResultReportView(views.APIView):
    def get(self, request):
        exam_id = request.query_params.get('exam_id')
        if not exam_id:
            return Response({"error": "Missing exam_id"}, status=400)
            
        results = ExamResult.objects.filter(exam_id=exam_id).select_related('student', 'subject')
        
        student_data = {}
        subjects = set()
        
        for r in results:
            student = r.student
            subjects.add(r.subject.name)
            
            if student.id not in student_data:
                student_data[student.id] = {
                    'roll': student.roll_number,
                    'name': student.name,
                    'subjects': {},
                    'total': 0,
                    'gpas': []
                }
            
            student_data[student.id]['subjects'][r.subject.name] = r.marks_obtained
            student_data[student.id]['total'] += r.marks_obtained
            if r.gpa is not None:
                student_data[student.id]['gpas'].append(r.gpa)
                
        # Calculate rank and GPA
        students_list = list(student_data.values())
        students_list.sort(key=lambda x: x['total'], reverse=True)
        
        current_rank = 1
        for i in range(len(students_list)):
            if i > 0 and students_list[i]['total'] < students_list[i-1]['total']:
                current_rank = i + 1
            students_list[i]['rank'] = current_rank
            
            gpas = students_list[i]['gpas']
            students_list[i]['avg_gpa'] = sum(gpas)/len(gpas) if gpas else 0
            
            # Simple grade calculation based on GPA
            avg_gpa = students_list[i]['avg_gpa']
            if avg_gpa >= 5.0: grade = 'A+'
            elif avg_gpa >= 4.0: grade = 'A'
            elif avg_gpa >= 3.5: grade = 'A-'
            elif avg_gpa >= 3.0: grade = 'B'
            elif avg_gpa >= 2.0: grade = 'C'
            elif avg_gpa >= 1.0: grade = 'D'
            else: grade = 'F'
            students_list[i]['grade'] = grade
            
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "Exam Results"
        
        subject_list = sorted(list(subjects))
        headers = ["Rank", "Roll", "Name"] + subject_list + ["Total", "GPA", "Grade"]
        ws.append(headers)
        
        for st in students_list:
            row = [st['rank'], st['roll'], st['name']]
            for sub in subject_list:
                row.append(st['subjects'].get(sub, ''))
            row.extend([st['total'], f"{st['avg_gpa']:.2f}", st['grade']])
            ws.append(row)
            
        buffer = BytesIO()
        wb.save(buffer)
        
        response = HttpResponse(buffer.getvalue(), content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = 'attachment; filename="exam_result_report.xlsx"'
        return response

class AnnualFinancialAuditView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        year_str = request.query_params.get('year')
        try:
            year = int(year_str) if year_str else date.today().year
        except ValueError:
            year = date.today().year

        from apps.fees.models import FeePayment, Expense
        from apps.fees.utils import BANGLA_MONTHS

        # 1. Total income & expense for the year
        payments_qs = FeePayment.objects.filter(payment_date__year=year)
        expenses_qs = Expense.objects.filter(expense_date__year=year)

        total_income = payments_qs.aggregate(total=Sum('amount_paid'))['total'] or Decimal('0.00')
        total_expense = expenses_qs.aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
        net_surplus = total_income - total_expense
        is_surplus = net_surplus >= 0

        total_receipts = payments_qs.count()
        total_vouchers = expenses_qs.count()

        # 2. 12-Month Breakdown (Monthly trend)
        monthly_trend = []
        for m in range(1, 13):
            m_inc = payments_qs.filter(payment_date__month=m).aggregate(total=Sum('amount_paid'))['total'] or Decimal('0.00')
            m_exp = expenses_qs.filter(expense_date__month=m).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
            monthly_trend.append({
                'month': m,
                'month_name': BANGLA_MONTHS.get(m, str(m)),
                'month_short': BANGLA_MONTHS.get(m, str(m))[:3],
                'income': m_inc,
                'expense': m_exp,
                'net': m_inc - m_exp
            })

        # 3. Expense Breakdown by Category
        CATEGORY_NAMES = dict(Expense.EXPENSE_CATEGORIES)
        expense_by_cat = []
        for item in expenses_qs.values('category').annotate(total=Sum('amount'), count=Count('id')).order_by('-total'):
            cat = item['category']
            tot = item['total']
            pct = round((float(tot) / float(total_expense) * 100), 1) if total_expense > 0 else 0
            expense_by_cat.append({
                'category': cat,
                'name': CATEGORY_NAMES.get(cat, cat),
                'total': tot,
                'percentage': pct,
                'count': item['count']
            })

        # 4. Income Breakdown by Payment Type
        TYPE_NAMES = {
            'monthly': 'মাসিক বেতন ও টিউশন ফি',
            'hostel': 'হোস্টেল ও খাবার মেস ফি',
            'exam': 'পরীক্ষা ফি ও রেজাল্ট কার্ড',
            'admission': 'নতুন ভর্তি ও সেশন ফি',
            'other': 'বিবিধ অনুদান ও অন্যান্য'
        }
        income_by_type = []
        for item in payments_qs.values('payment_type').annotate(total=Sum('amount_paid'), count=Count('id')).order_by('-total'):
            ptype = item['payment_type']
            tot = item['total']
            pct = round((float(tot) / float(total_income) * 100), 1) if total_income > 0 else 0
            income_by_type.append({
                'type': ptype,
                'name': TYPE_NAMES.get(ptype, ptype),
                'total': tot,
                'percentage': pct,
                'count': item['count']
            })

        # 5. Key Financial Ratios & Stats
        active_months = len([m for m in monthly_trend if m['income'] > 0 or m['expense'] > 0]) or 1
        avg_monthly_income = round(total_income / Decimal(active_months), 2)
        avg_monthly_expense = round(total_expense / Decimal(active_months), 2)

        highest_income_month = max(monthly_trend, key=lambda x: x['income'])
        highest_expense_month = max(monthly_trend, key=lambda x: x['expense'])

        return Response({
            'year': year,
            'total_income': total_income,
            'total_expense': total_expense,
            'net_surplus': net_surplus,
            'is_surplus': is_surplus,
            'total_receipts': total_receipts,
            'total_vouchers': total_vouchers,
            'active_months': active_months,
            'avg_monthly_income': avg_monthly_income,
            'avg_monthly_expense': avg_monthly_expense,
            'highest_income_month': highest_income_month,
            'highest_expense_month': highest_expense_month,
            'monthly_trend': monthly_trend,
            'expense_by_category': expense_by_cat,
            'income_by_type': income_by_type
        })
