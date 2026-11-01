from rest_framework import serializers
from .models import NotificationLog
from .whatsapp import generate_whatsapp_web_link

class NotificationLogSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.name', read_only=True)
    student_name_bn = serializers.CharField(source='student.name_bn', read_only=True)
    student_id_code = serializers.CharField(source='student.student_id', read_only=True)
    sent_by_name = serializers.CharField(source='sent_by.name', read_only=True)
    wa_link = serializers.SerializerMethodField()

    class Meta:
        model = NotificationLog
        fields = '__all__'

    def get_wa_link(self, obj):
        return generate_whatsapp_web_link(obj.recipient_phone, obj.message)

class SendCustomNotificationSerializer(serializers.Serializer):
    recipient_phone = serializers.CharField(max_length=20)
    recipient_name = serializers.CharField(max_length=255, required=False, allow_blank=True)
    student_id = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    channel = serializers.ChoiceField(choices=['whatsapp', 'sms'], default='whatsapp')
    notification_type = serializers.CharField(default='custom')
    title = serializers.CharField(max_length=255)
    message = serializers.CharField()
