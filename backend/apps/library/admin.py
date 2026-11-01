from django.contrib import admin
from .models import Book, BookIssue

@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = ('title', 'title_bn', 'author', 'subject_category', 'total_copies', 'available_copies')
    search_fields = ('title', 'title_bn', 'author', 'isbn')
    list_filter = ('subject_category',)

@admin.register(BookIssue)
class BookIssueAdmin(admin.ModelAdmin):
    list_display = ('book', 'student', 'issued_date', 'due_date', 'returned_date', 'status', 'fine_amount')
    list_filter = ('status', 'issued_date', 'due_date')
    search_fields = ('book__title', 'student__name', 'student__student_id')
