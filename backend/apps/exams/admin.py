from django.contrib import admin
from .models import Exam, ExamResult

@admin.register(Exam)
class ExamAdmin(admin.ModelAdmin):
    list_display = ('name', 'name_bn', 'exam_type', 'classroom', 'academic_year', 'is_published')
    list_filter = ('exam_type', 'is_published', 'academic_year')

@admin.register(ExamResult)
class ExamResultAdmin(admin.ModelAdmin):
    list_display = ('exam', 'student', 'subject', 'marks_obtained', 'total_marks', 'grade', 'gpa', 'is_absent')
    list_filter = ('exam', 'grade', 'is_absent')
    search_fields = ('student__name', 'student__student_id', 'subject__name')
