from rest_framework import generics, views, status, permissions
from rest_framework.response import Response
from .models import NotificationLog
from .serializers import NotificationLogSerializer, SendCustomNotificationSerializer
from .whatsapp import send_whatsapp_message, generate_whatsapp_web_link, WHATSAPP_SERVICE_URL
from apps.students.models import Student
from django.db.models import Q
import requests

class NotificationLogListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = NotificationLogSerializer
    queryset = NotificationLog.objects.select_related('student', 'sent_by').order_by('-created_at')

class SendCustomNotificationView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = SendCustomNotificationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        student = None
        student_id_val = data.get('student_id')
        if student_id_val:
            if str(student_id_val).isdigit():
                student = Student.objects.filter(Q(id=int(student_id_val)) | Q(student_id=str(student_id_val))).first()
            else:
                student = Student.objects.filter(student_id=str(student_id_val)).first()

        phone = data['recipient_phone']
        message = data['message']
        title = data['title']
        notification_type = data.get('notification_type', 'custom')
        recipient_name = data.get('recipient_name') or (student.guardian_name if student else '')

        # Trigger send
        success = send_whatsapp_message(
            phone=phone,
            message=message,
            title=title,
            notification_type=notification_type,
            student=student,
            recipient_name=recipient_name,
            sent_by=request.user
        )

        wa_link = generate_whatsapp_web_link(phone, message)
        latest_log = NotificationLog.objects.filter(recipient_phone=phone).order_by('-created_at').first()

        return Response({
            "status": "success",
            "message": "বার্তা সফলভাবে পাঠানো হয়েছে!" if success else "বার্তা সিস্টেমে সংরক্ষিত হয়েছে এবং সরাসরি WhatsApp এ পাঠানোর জন্য প্রস্তুত।",
            "service_delivered": success,
            "wa_direct_link": wa_link,
            "log": NotificationLogSerializer(latest_log).data if latest_log else None
        }, status=status.HTTP_201_CREATED)

class ResendNotificationView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            log_item = NotificationLog.objects.get(pk=pk)
        except NotificationLog.DoesNotExist:
            return Response({"detail": "Notification log not found"}, status=status.HTTP_404_NOT_FOUND)

        success = send_whatsapp_message(
            phone=log_item.recipient_phone,
            message=log_item.message,
            title=log_item.title,
            notification_type=log_item.notification_type,
            student=log_item.student,
            recipient_name=log_item.recipient_name,
            sent_by=request.user
        )

        log_item.status = 'delivered' if success else 'queued'
        log_item.save()

        return Response({
            "status": "success",
            "delivered": success,
            "wa_direct_link": generate_whatsapp_web_link(log_item.recipient_phone, log_item.message),
            "log": NotificationLogSerializer(log_item).data
        })

class GatewayStatusView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        service_online = False
        service_error = ""

        try:
            res = requests.get(f"{WHATSAPP_SERVICE_URL}/status", timeout=2)
            if res.status_code == 200:
                service_online = True
        except Exception as e:
            service_error = str(e)
            service_online = False

        total_sent = NotificationLog.objects.filter(status__in=['sent', 'delivered']).count()
        total_queued = NotificationLog.objects.filter(status='queued').count()

        return Response({
            "whatsapp_service_online": service_online,
            "service_url": WHATSAPP_SERVICE_URL,
            "direct_wa_supported": True,
            "total_sent": total_sent,
            "total_queued": total_queued,
            "error_note": service_error if not service_online else ""
        })

class BulkNotificationBroadcastView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        target_audience = request.data.get('target_audience', 'all')
        department_id = request.data.get('department_id')
        channel = request.data.get('channel', 'whatsapp')
        notification_type = request.data.get('notification_type', 'notice')
        title = request.data.get('title', 'আল-মদিনা মডেল মাদ্রাসা — জরুরি নোটিশ')
        raw_message = request.data.get('message', '').strip()

        if not raw_message:
            return Response({'error': 'নোটিশের বিবরণ বা মেসেজ প্রদান করুন'}, status=status.HTTP_400_BAD_REQUEST)

        recipients = []

        if target_audience == 'teachers':
            from apps.teachers.models import Teacher
            teachers = Teacher.objects.filter(is_active=True)
            for t in teachers:
                if t.phone:
                    recipients.append({
                        'phone': t.phone,
                        'name': t.name_bn or t.name,
                        'student': None,
                        'dept': t.designation_bn or t.designation,
                    })
        else:
            students_qs = Student.objects.filter(status='active')
            if target_audience == 'hostel':
                students_qs = students_qs.filter(residential_status='residential')
            elif target_audience == 'daycare':
                students_qs = students_qs.filter(residential_status='non_residential')
            elif target_audience == 'department' and department_id:
                students_qs = students_qs.filter(
                    Q(islamic_department_id=department_id) | Q(general_department_id=department_id)
                )

            for s in students_qs:
                phone = s.guardian_phone or ''
                if phone:
                    recipients.append({
                        'phone': phone,
                        'name': s.guardian_name or s.father_name_bn or s.name_bn,
                        'student': s,
                        'dept': s.islamic_department.name if s.islamic_department else (s.general_department.name if s.general_department else ''),
                    })

        if not recipients:
            return Response({'error': 'নির্ধারিত ক্যাটাগরিতে কোনো সক্রিয় প্রাপক পাওয়া যায়নি'}, status=status.HTTP_400_BAD_REQUEST)

        sent_count = 0
        queued_count = 0
        direct_links = []
        sample_msg = ""

        for r in recipients:
            s_obj = r.get('student')
            personalized_msg = raw_message
            if s_obj:
                personalized_msg = personalized_msg.replace('{নাম}', s_obj.name_bn or s_obj.name)
                personalized_msg = personalized_msg.replace('{শিক্ষার্থী}', s_obj.name_bn or s_obj.name)
                personalized_msg = personalized_msg.replace('{রোল}', str(s_obj.roll_number or '—'))
                personalized_msg = personalized_msg.replace('{শ্রেণি}', r.get('dept', ''))
            else:
                personalized_msg = personalized_msg.replace('{নাম}', r.get('name', ''))
                personalized_msg = personalized_msg.replace('{শিক্ষার্থী}', r.get('name', ''))
                personalized_msg = personalized_msg.replace('{রোল}', '')
                personalized_msg = personalized_msg.replace('{শ্রেণি}', r.get('dept', ''))

            if not sample_msg:
                sample_msg = personalized_msg

            success = send_whatsapp_message(
                phone=r['phone'],
                message=personalized_msg,
                title=title,
                notification_type=notification_type,
                student=s_obj,
                recipient_name=r['name'],
                sent_by=request.user
            )

            if success:
                sent_count += 1
            else:
                queued_count += 1

            if len(direct_links) < 10:
                direct_links.append({
                    'name': r['name'],
                    'phone': r['phone'],
                    'student_name': s_obj.name_bn if s_obj else r['name'],
                    'url': generate_whatsapp_web_link(r['phone'], personalized_msg)
                })

        return Response({
            'status': 'success',
            'message': f"মোট {len(recipients)} জন প্রাপকের কাছে নোটিশ সফলভাবে প্রসেস করা হয়েছে! (সরাসরি প্রেরিত: {sent_count}, কিউড/সংরক্ষিত: {queued_count})",
            'total_targeted': len(recipients),
            'sent_count': sent_count,
            'queued_count': queued_count,
            'sample_message': sample_msg,
            'direct_links': direct_links
        })
