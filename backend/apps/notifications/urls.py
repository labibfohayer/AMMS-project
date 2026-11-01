from django.urls import path
from . import views

urlpatterns = [
    path('logs/', views.NotificationLogListView.as_view(), name='notification_logs'),
    path('send-custom/', views.SendCustomNotificationView.as_view(), name='notification_send_custom'),
    path('broadcast/', views.BulkNotificationBroadcastView.as_view(), name='notification_broadcast'),
    path('resend/<int:pk>/', views.ResendNotificationView.as_view(), name='notification_resend'),
    path('gateway-status/', views.GatewayStatusView.as_view(), name='notification_gateway_status'),
]
