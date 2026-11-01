from rest_framework import generics, views, status, permissions
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from datetime import date, datetime
from decimal import Decimal
from django.db.models import Sum
from .models import HostelRoom, HostelMeal
from .serializers import HostelRoomSerializer, HostelRoomDetailSerializer, HostelMealSerializer
from apps.students.models import Student
from apps.attendance.models import HostelNightAttendance
from apps.fees.models import Expense
from apps.fees.utils import BANGLA_MONTHS

class IsPrincipalOrTeacher(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['principal', 'vice_principal', 'managing_director', 'teacher']

class HostelRoomListView(generics.ListCreateAPIView):
    queryset = HostelRoom.objects.all().order_by('id')
    serializer_class = HostelRoomDetailSerializer
    permission_classes = [IsPrincipalOrTeacher]

class HostelRoomDetailView(generics.RetrieveUpdateAPIView):
    queryset = HostelRoom.objects.all()
    serializer_class = HostelRoomDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

class HostelRoomAssignView(views.APIView):
    permission_classes = [IsPrincipalOrTeacher]
    
    def post(self, request, pk):
        room = get_object_or_404(HostelRoom, pk=pk)
        student_id = request.data.get('student_id')
        student = get_object_or_404(Student, pk=student_id)
        
        if room.available_space > 0 or student.hostel_room == room:
            student.hostel_room = room
            student.residential_status = 'residential'
            student.save()
            return Response({'status': 'Student assigned to room successfully'})
        return Response({'error': 'Room is full'}, status=status.HTTP_400_BAD_REQUEST)

class HostelRoomUnassignView(views.APIView):
    permission_classes = [IsPrincipalOrTeacher]
    
    def post(self, request, pk):
        room = get_object_or_404(HostelRoom, pk=pk)
        student_id = request.data.get('student_id')
        student = get_object_or_404(Student, pk=student_id)
        
        if student.hostel_room == room:
            student.hostel_room = None
            student.save()
            return Response({'status': 'Student removed from room'})
        return Response({'error': 'Student not in this room'}, status=status.HTTP_400_BAD_REQUEST)

class HostelDailyMealView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        date_str = request.query_params.get('date')
        if date_str:
            try:
                target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
            except ValueError:
                target_date = date.today()
        else:
            target_date = date.today()

        residential_students = Student.objects.filter(
            residential_status='residential', status='active'
        ).select_related('hostel_room', 'islamic_department', 'general_department').order_by('hostel_room__room_number', 'roll_number')

        meals_map = {m.student_id: m for m in HostelMeal.objects.filter(date=target_date)}

        students_data = []
        total_breakfast = 0
        total_lunch = 0
        total_dinner = 0

        for s in residential_students:
            m = meals_map.get(s.id)
            bf = m.breakfast if m else True
            ln = m.lunch if m else True
            dn = m.dinner if m else True
            note = m.note if m else ''

            if bf: total_breakfast += 1
            if ln: total_lunch += 1
            if dn: total_dinner += 1

            students_data.append({
                'id': s.id,
                'student_id': s.student_id,
                'name': s.name,
                'name_bn': s.name_bn or s.name,
                'roll_number': s.roll_number,
                'room_id': s.hostel_room.id if s.hostel_room else None,
                'room_number': s.hostel_room.room_number if s.hostel_room else 'বরাদ্দহীন',
                'room_number_bn': s.hostel_room.room_number_bn if s.hostel_room else 'রুম বরাদ্দ করা হয়নি',
                'department': s.islamic_department.name if s.islamic_department else (s.general_department.name if s.general_department else ''),
                'breakfast': bf,
                'lunch': ln,
                'dinner': dn,
                'total_meals': (1 if bf else 0) + (1 if ln else 0) + (1 if dn else 0),
                'note': note
            })

        total_meals_count = total_breakfast + total_lunch + total_dinner

        return Response({
            'date': str(target_date),
            'date_bn': f"{target_date.day} {BANGLA_MONTHS.get(target_date.month, '')} {target_date.year}",
            'total_residential_students': len(residential_students),
            'total_breakfast': total_breakfast,
            'total_lunch': total_lunch,
            'total_dinner': total_dinner,
            'total_meals_count': total_meals_count,
            'students': students_data
        })

    def post(self, request):
        date_str = request.data.get('date')
        if not date_str:
            target_date = date.today()
        else:
            try:
                target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
            except ValueError:
                target_date = date.today()

        meals_data = request.data.get('meals', [])
        saved_count = 0
        for item in meals_data:
            student = get_object_or_404(Student, pk=item['student_id'])
            HostelMeal.objects.update_or_create(
                student=student, date=target_date,
                defaults={
                    'breakfast': item.get('breakfast', True),
                    'lunch': item.get('lunch', True),
                    'dinner': item.get('dinner', True),
                    'note': item.get('note', '')
                }
            )
            saved_count += 1

        return Response({'status': 'Meals updated successfully', 'count': saved_count})

class HostelCurfewAttendanceView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        date_str = request.query_params.get('date')
        if date_str:
            try:
                target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
            except ValueError:
                target_date = date.today()
        else:
            target_date = date.today()

        residential_students = Student.objects.filter(
            residential_status='residential', status='active'
        ).select_related('hostel_room').order_by('hostel_room__room_number', 'roll_number')

        curfew_map = {c.student_id: c for c in HostelNightAttendance.objects.filter(date=target_date)}

        records = []
        present_count = 0
        absent_count = 0

        for s in residential_students:
            c = curfew_map.get(s.id)
            is_present = c.present if c else True
            note = c.note if c else ''

            if is_present:
                present_count += 1
            else:
                absent_count += 1

            records.append({
                'id': s.id,
                'student_id': s.student_id,
                'name': s.name,
                'name_bn': s.name_bn or s.name,
                'roll_number': s.roll_number,
                'room_number': s.hostel_room.room_number if s.hostel_room else 'বরাদ্দহীন',
                'present': is_present,
                'note': note
            })

        return Response({
            'date': str(target_date),
            'total_students': len(residential_students),
            'present_count': present_count,
            'absent_count': absent_count,
            'records': records
        })

    def post(self, request):
        date_str = request.data.get('date')
        if not date_str:
            target_date = date.today()
        else:
            try:
                target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
            except ValueError:
                target_date = date.today()

        records = request.data.get('records', [])
        saved = 0
        for item in records:
            student = get_object_or_404(Student, pk=item['student_id'])
            HostelNightAttendance.objects.update_or_create(
                student=student, date=target_date,
                defaults={
                    'present': item.get('present', True),
                    'note': item.get('note', '')
                }
            )
            saved += 1
        return Response({'status': 'Night attendance saved', 'count': saved})

class HostelFoodCostSummaryView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        month = int(request.query_params.get('month', date.today().month))
        year = int(request.query_params.get('year', date.today().year))

        food_expenses = Expense.objects.filter(
            category='food', expense_date__month=month, expense_date__year=year
        ).order_by('-expense_date')

        total_food_cost = food_expenses.aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

        # Total meals served in that month
        meals = HostelMeal.objects.filter(date__month=month, date__year=year)
        total_bf = meals.filter(breakfast=True).count()
        total_ln = meals.filter(lunch=True).count()
        total_dn = meals.filter(dinner=True).count()
        total_meals_served = total_bf + total_ln + total_dn

        cost_per_meal = (total_food_cost / Decimal(total_meals_served)) if total_meals_served > 0 else Decimal('0.00')

        items = [{
            'id': e.id,
            'voucher_number': e.voucher_number,
            'title': e.title,
            'amount': e.amount,
            'expense_date': str(e.expense_date),
            'spent_by': e.spent_by,
            'note': e.note
        } for e in food_expenses]

        return Response({
            'month': month,
            'month_name': BANGLA_MONTHS.get(month, str(month)),
            'year': year,
            'total_food_cost': total_food_cost,
            'total_meals_served': total_meals_served,
            'cost_per_meal': round(cost_per_meal, 2),
            'total_breakfast': total_bf,
            'total_lunch': total_ln,
            'total_dinner': total_dn,
            'expenses': items
        })
