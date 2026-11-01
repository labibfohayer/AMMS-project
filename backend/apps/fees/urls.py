from django.urls import path
from . import views

urlpatterns = [
    path('cashbook/', views.DailyCashBookView.as_view()),
    path('expenses/', views.ExpenseListCreateView.as_view()),
    path('payments/', views.FeePaymentListView.as_view()),
    path('payments/<int:pk>/', views.FeePaymentDetailView.as_view()),
    path('payments/collect/', views.FeeCollectionView.as_view()),
    path('online-payment/', views.OnlineFeePaymentView.as_view(), name='fee_online_payment'),
    path('payments/<int:pk>/receipt/', views.FeeReceiptPDFView.as_view()),
    path('students/<str:student_id>/status/', views.StudentFeeStatusView.as_view()),
    path('due/', views.DueFeeListView.as_view()),
    path('reminders/bulk/', views.BulkSendFeeReminderView.as_view()),
    path('reminders/', views.SendFeeReminderView.as_view()),
    path('report/', views.AllStudentsFeeReportView.as_view()),
]
