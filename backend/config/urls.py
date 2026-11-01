from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView

from django.http import JsonResponse

def force_setup(request):
    try:
        from apps.accounts.models import User
        if not User.objects.filter(phone='01700000000').exists():
            User.objects.create_user(phone='01700000000', password='admin123', role='principal', name='Principal', name_bn='প্রিন্সিপাল', user_id='PRIN-001')
            return JsonResponse({"status": "created"})
        return JsonResponse({"status": "already_exists"})
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

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
