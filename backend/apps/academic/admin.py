from django.contrib import admin
from .models import AcademicYear, ClassRoom, Subject, TimeTable, Holiday, Syllabus

@admin.register(AcademicYear)
class AcademicYearAdmin(admin.ModelAdmin):
    list_display = ('year', 'is_current', 'start_date', 'end_date')

@admin.register(ClassRoom)
class ClassRoomAdmin(admin.ModelAdmin):
    list_display = ('name', 'name_bn', 'department', 'section', 'academic_year', 'capacity')

@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'classroom', 'teacher', 'total_marks', 'pass_marks')

@admin.register(TimeTable)
class TimeTableAdmin(admin.ModelAdmin):
    list_display = ('classroom', 'subject', 'teacher', 'day', 'start_time', 'end_time')

@admin.register(Holiday)
class HolidayAdmin(admin.ModelAdmin):
    list_display = ('date', 'name', 'name_bn')

@admin.register(Syllabus)
class SyllabusAdmin(admin.ModelAdmin):
    list_display = ('classroom', 'subject', 'title', 'uploaded_at')
