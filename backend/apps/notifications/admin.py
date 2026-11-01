from django.contrib import admin
from .models import NotificationLog

@admin.register(NotificationLog)
class NotificationLogAdmin(admin.ModelAdmin):
    list_display = ['id', 'recipient_phone', 'recipient_name', 'channel', 'notification_type', 'status', 'created_at']
    list_filter = ['channel', 'notification_type', 'status', 'created_at']
    search_fields = ['recipient_phone', 'recipient_name', 'title', 'message']
    readonly_fields = ['created_at']
