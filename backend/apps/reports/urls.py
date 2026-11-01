from django.urls import path
from . import views

urlpatterns = [
    path('dashboard/', views.DashboardStatsView.as_view()),
    path('annual-financial/', views.AnnualFinancialAuditView.as_view()),
    path('fee-report/', views.FeeReportView.as_view()),
    path('attendance-report/', views.AttendanceReportView.as_view()),
    path('result-report/', views.ExamResultReportView.as_view()),
]
