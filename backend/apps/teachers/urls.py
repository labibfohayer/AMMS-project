from django.urls import path
from .views import (
    TeacherListCreateView, TeacherDetailView, TeacherStatusUpdateView,
    SalaryPaymentView, TeacherSalaryStatusView, TeacherIDCardView,
    SalarySlipView, LeaveApplicationView, LeaveReviewView, MonthlySalarySheetView,
    TeacherServiceRecordView, TeacherMeView
)

urlpatterns = [
    path('salary-sheet/', MonthlySalarySheetView.as_view(), name='monthly-salary-sheet'),
    path('leaves/', LeaveApplicationView.as_view(), name='leave-list-create'),
    path('leaves/<int:pk>/review/', LeaveReviewView.as_view(), name='leave-review'),
    path('me/', TeacherMeView.as_view(), name='teacher-me'),
    path('', TeacherListCreateView.as_view(), name='teacher-list-create'),
    path('<int:pk>/', TeacherDetailView.as_view(), name='teacher-detail'),
    path('<int:pk>/status/', TeacherStatusUpdateView.as_view(), name='teacher-status'),
    path('<int:pk>/salary/', TeacherSalaryStatusView.as_view(), name='teacher-salary-status'),
    path('<int:pk>/salary/pay/', SalaryPaymentView.as_view(), name='teacher-salary-pay'),
    path('<int:pk>/id-card/', TeacherIDCardView.as_view(), name='teacher-id-card'),
    path('<int:pk>/service-record/', TeacherServiceRecordView.as_view(), name='teacher-service-record'),
    path('<int:pk>/salary-slip/<int:month>/<int:year>/', SalarySlipView.as_view(), name='salary-slip'),
]
