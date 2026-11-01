from django.contrib import admin
from .models import Department, Student, AdmissionApplication, StudentLeave

@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('name_en', 'name', 'dept_type', 'order')
    list_filter = ('dept_type',)

@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ('student_id', 'name', 'name_bn', 'guardian_phone', 'status', 'enrollment_type', 'residential_status')
    search_fields = ('student_id', 'name', 'name_bn', 'guardian_phone', 'birth_reg_no')
    list_filter = ('status', 'enrollment_type', 'residential_status', 'islamic_department', 'general_department')

@admin.register(AdmissionApplication)
class AdmissionApplicationAdmin(admin.ModelAdmin):
    list_display = ('application_no', 'name_bn', 'desired_program', 'guardian_phone', 'residential_status', 'status', 'applied_at')
    list_filter = ('status', 'residential_status', 'academic_year')
    search_fields = ('application_no', 'name', 'name_bn', 'guardian_phone')

@admin.register(StudentLeave)
class StudentLeaveAdmin(admin.ModelAdmin):
    list_display = ('leave_no', 'student', 'leave_type', 'from_date', 'to_date', 'total_days', 'status', 'gate_pass_no', 'created_at')
    list_filter = ('status', 'leave_type', 'created_at')
    search_fields = ('leave_no', 'gate_pass_no', 'student__name', 'student__name_bn', 'student__student_id', 'guardian_phone')


