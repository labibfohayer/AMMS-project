from django.contrib import admin
from .models import Teacher, SalaryPayment, LeaveApplication

@admin.register(Teacher)
class TeacherAdmin(admin.ModelAdmin):
    list_display = ('teacher_id', 'name', 'phone', 'staff_type', 'designation', 'monthly_salary', 'is_active')
    search_fields = ('teacher_id', 'name', 'name_bn', 'phone', 'nid')
    list_filter = ('staff_type', 'is_active')

@admin.register(SalaryPayment)
class SalaryPaymentAdmin(admin.ModelAdmin):
    list_display = ('teacher', 'month', 'year', 'amount', 'paid_date', 'paid_by')
    list_filter = ('year', 'month')

@admin.register(LeaveApplication)
class LeaveApplicationAdmin(admin.ModelAdmin):
    list_display = ('teacher', 'leave_type', 'from_date', 'to_date', 'status')
    list_filter = ('status', 'leave_type')
