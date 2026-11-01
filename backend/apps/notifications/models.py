from django.db import models
from django.conf import settings
from apps.students.models import Student

class NotificationLog(models.Model):
    CHANNEL_CHOICES = [
        ('whatsapp', 'WhatsApp'),
        ('sms', 'SMS'),
    ]
    TYPE_CHOICES = [
        ('admission', 'ভর্তি অনুমোদন ও তথ্য'),
        ('fee_receipt', 'ডিজিটাল মানি রিসিট'),
        ('fee_reminder', 'বকেয়া বেতন রিমাইন্ডার'),
        ('result', 'পরীক্ষার ফলাফল ও মার্কশিট'),
        ('attendance', 'অনুপস্থিতি এলার্ট'),
        ('notice', 'নোটিশ ও বিজ্ঞপ্তি ব্রডকাস্ট'),
        ('custom', 'কাস্টম বার্তা'),
    ]
    STATUS_CHOICES = [
        ('sent', 'Sent - প্রেরিত'),
        ('delivered', 'Delivered - সফল'),
        ('failed', 'Failed - ব্যর্থ'),
        ('queued', 'Queued - অপেক্ষমাণ'),
    ]

    student = models.ForeignKey(Student, on_delete=models.SET_NULL, null=True, blank=True, related_name='notifications')
    recipient_phone = models.CharField(max_length=20)
    recipient_name = models.CharField(max_length=255, blank=True)
    channel = models.CharField(max_length=20, choices=CHANNEL_CHOICES, default='whatsapp')
    notification_type = models.CharField(max_length=50, choices=TYPE_CHOICES, default='custom')
    title = models.CharField(max_length=255)
    message = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='sent')
    error_message = models.TextField(blank=True)
    sent_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Notification Log'
        verbose_name_plural = 'Notification Logs'

    def __str__(self):
        return f"[{self.channel.upper()}] {self.recipient_phone} - {self.title} ({self.status})"
