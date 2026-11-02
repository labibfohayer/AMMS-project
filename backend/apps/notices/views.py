from rest_framework import generics, views, status, permissions
from rest_framework.response import Response
from .models import Notice
from .serializers import NoticeSerializer, NoticeCreateSerializer
from apps.notifications.whatsapp import send_notice_broadcast
from django.utils import timezone
from django.shortcuts import get_object_or_404
from apps.students.models import Student
from apps.teachers.models import Teacher
from django.contrib.auth import get_user_model

User = get_user_model()

class IsPrincipal(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and getattr(request.user, 'role', '') in ['principal', 'vice_principal', 'managing_director'])

class NoticeListView(generics.ListAPIView):
    queryset = Notice.objects.all().order_by('-created_at')
    serializer_class = NoticeSerializer

class NoticeCreateView(generics.CreateAPIView):
    queryset = Notice.objects.all()
    serializer_class = NoticeCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user if self.request.user.is_authenticated else None)

class NoticeDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Notice.objects.all()
    serializer_class = NoticeSerializer
    permission_classes = [permissions.IsAuthenticated]

class NoticeWhatsAppBroadcastView(views.APIView):
    permission_classes = [IsPrincipal]
    
    def post(self, request, pk):
        notice = get_object_or_404(Notice, pk=pk)
        target = getattr(notice, 'target', 'all')  # default to all if target field missing
        
        phones = set()
        
        if target in ('all', 'guardians'):
            guardian_phones = Student.objects.filter(status='active').values_list('guardian_phone', flat=True)
            phones.update(guardian_phones)
        
        if target in ('all', 'students'):
            student_phones = User.objects.filter(role='student', is_active=True).values_list('phone', flat=True)
            phones.update(student_phones)
        
        if target in ('all', 'teachers'):
            teacher_phones = Teacher.objects.filter(is_active=True).values_list('phone', flat=True)
            phones.update(teacher_phones)
        
        if target in ('all', 'staff'):
            staff_phones = Teacher.objects.filter(is_active=True).values_list('phone', flat=True)
            phones.update(staff_phones)
        
        phones = [p for p in phones if p and len(p) >= 11]
        
        title = getattr(notice, 'title_bn', None) or notice.title
        body = getattr(notice, 'body_bn', None) or notice.body
        count = send_notice_broadcast(phones, title, body)
        
        notice.whatsapp_sent = True
        notice.whatsapp_sent_at = timezone.now()
        notice.whatsapp_recipient_count = len(phones)
        notice.save()
        
        return Response({
            "success": True,
            "recipients": len(phones),
            "sent_count": count,
            "message": f"{len(phones)} জনকে WhatsApp message পাঠানো হয়েছে।"
        })
