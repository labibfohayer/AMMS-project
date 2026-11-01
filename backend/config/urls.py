from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView

from django.http import JsonResponse

def force_setup(request):
    try:
        from apps.accounts.models import User
        users_to_ensure = [
            {'phone': '01712633264', 'role': 'principal', 'name': 'Maulana Omar Faruk Mujahidi', 'name_bn': 'প্রিন্সিপাল মাওলানা ওমর ফারুক মুজাহিদী'},
            {'phone': '01580506445', 'role': 'managing_director', 'name': 'Labib Fohayer', 'name_bn': 'লাবিব ফোহায়ের'},
            {'phone': '01711000010', 'role': 'vice_principal', 'name': 'Mufti Habibur Rahman', 'name_bn': 'মুফতি হাবিবুর রহমান'},
        ]
        results = []
        for udata in users_to_ensure:
            user = User.objects.filter(phone=udata['phone']).first()
            if not user:
                user = User.objects.create_user(
                    phone=udata['phone'],
                    password='admin123',
                    name=udata['name'],
                    name_bn=udata['name_bn'],
                    role=udata['role'],
                    is_staff=True
                )
                results.append(f"created {udata['role']} ({udata['phone']}) with id {user.user_id}")
            else:
                user.name = udata['name']
                user.name_bn = udata['name_bn']
                user.role = udata['role']
                user.is_staff = True
                user.set_password('admin123')
                user.save()
                results.append(f"updated {udata['role']} ({udata['phone']}) with id {user.user_id}")
        return JsonResponse({"status": "success", "results": results})
    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)})

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.accounts.urls')),
    path('api/students/', include('apps.students.urls')),
    path('api/teachers/', include('apps.teachers.urls')),
    path('api/academic/', include('apps.academic.urls')),
    path('api/attendance/', include('apps.attendance.urls')),
    path('api/hostel/', include('apps.hostel.urls')),
    path('api/fees/', include('apps.fees.urls')),
    path('api/exams/', include('apps.exams.urls')),
    path('api/library/', include('apps.library.urls')),
    path('api/notices/', include('apps.notices.urls')),
    path('api/notifications/', include('apps.notifications.urls')),
    path('api/reports/', include('apps.reports.urls')),
    path('api/force-setup/', force_setup),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),

    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]

from django.views.static import serve
from django.urls import re_path

urlpatterns += [
    re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
]
