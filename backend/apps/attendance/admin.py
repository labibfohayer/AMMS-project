from django.contrib import admin
from .models import StudentAttendance, TeacherAttendance, HostelNightAttendance

@admin.register(StudentAttendance)
class StudentAttendanceAdmin(admin.ModelAdmin):
    list_display = ('student', 'classroom', 'date', 'status', 'whatsapp_sent', 'taken_by')
    list_filter = ('status', 'date', 'whatsapp_sent', 'classroom')

@admin.register(TeacherAttendance)
class TeacherAttendanceAdmin(admin.ModelAdmin):
    list_display = ('teacher', 'date', 'status')
    list_filter = ('status', 'date')

@admin.register(HostelNightAttendance)
class HostelNightAttendanceAdmin(admin.ModelAdmin):
    list_display = ('student', 'date', 'present')
    list_filter = ('present', 'date')
