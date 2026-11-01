from django.urls import path
from .views import (
    DepartmentListView, StudentListCreateView, StudentDetailView,
    StudentStatusUpdateView, StudentIDCardView, StudentMeView,
    AdmissionApplicationCreateView, AdmissionApplicationListView,
    AdmissionApplicationStatsView, AdmissionNextRollView,
    AdmissionApplicationApproveView, AdmissionApplicationRejectView,
    StudentLeaveListCreateView, StudentLeaveDetailView,
    StudentLeaveApproveView, StudentLeaveRejectView, StudentLeaveStatsView
)

urlpatterns = [
    path('departments/', DepartmentListView.as_view(), name='department_list'),
    path('admissions/apply/', AdmissionApplicationCreateView.as_view(), name='admission_apply'),
    path('admissions/stats/', AdmissionApplicationStatsView.as_view(), name='admission_stats'),
    path('admissions/next-roll/', AdmissionNextRollView.as_view(), name='admission_next_roll'),
    path('admissions/<int:pk>/approve/', AdmissionApplicationApproveView.as_view(), name='admission_approve'),
    path('admissions/<int:pk>/reject/', AdmissionApplicationRejectView.as_view(), name='admission_reject'),
    path('admissions/', AdmissionApplicationListView.as_view(), name='admission_list'),
    path('leaves/stats/', StudentLeaveStatsView.as_view(), name='student_leave_stats'),
    path('leaves/<int:pk>/approve/', StudentLeaveApproveView.as_view(), name='student_leave_approve'),
    path('leaves/<int:pk>/reject/', StudentLeaveRejectView.as_view(), name='student_leave_reject'),
    path('leaves/<int:pk>/', StudentLeaveDetailView.as_view(), name='student_leave_detail'),
    path('leaves/', StudentLeaveListCreateView.as_view(), name='student_leave_list_create'),
    path('me/', StudentMeView.as_view(), name='student_me'),
    path('', StudentListCreateView.as_view(), name='student_list_create'),
    path('<int:pk>/', StudentDetailView.as_view(), name='student_detail'),
    path('<int:pk>/status/', StudentStatusUpdateView.as_view(), name='student_status_update'),
    path('<int:pk>/id-card/', StudentIDCardView.as_view(), name='student_id_card'),
]

