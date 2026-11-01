from django.contrib import admin
from .models import Notice

@admin.register(Notice)
class NoticeAdmin(admin.ModelAdmin):
    list_display = ('title', 'title_bn', 'target', 'is_active', 'whatsapp_sent', 'created_at')
    list_filter = ('target', 'is_active', 'whatsapp_sent')
    search_fields = ('title', 'title_bn', 'body', 'body_bn')
