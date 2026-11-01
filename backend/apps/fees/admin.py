from django.contrib import admin
from .models import FeePayment, FeeReminder

@admin.register(FeePayment)
class FeePaymentAdmin(admin.ModelAdmin):
    list_display = ('receipt_number', 'student', 'payment_type', 'amount_due', 'amount_paid', 'discount', 'payment_date', 'whatsapp_sent')
    list_filter = ('payment_type', 'payment_date', 'whatsapp_sent')
    search_fields = ('receipt_number', 'student__name', 'student__student_id')

@admin.register(FeeReminder)
class FeeReminderAdmin(admin.ModelAdmin):
    list_display = ('student', 'month', 'year', 'sent_at')
