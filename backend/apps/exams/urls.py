from django.urls import path
from . import views

urlpatterns = [
    path('', views.ExamListCreateView.as_view()),
    path('<int:pk>/', views.ExamDetailView.as_view()),
    path('<int:pk>/publish/', views.ExamPublishView.as_view()),
    path('<int:pk>/results/', views.ResultEntryView.as_view()),
    path('<int:pk>/ranking/', views.ClassRankingView.as_view()),
    path('<int:pk>/notify-results/', views.ExamNotifyResultsView.as_view()),
    path('students/<str:student_id>/marksheet/<int:exam_id>/', views.StudentMarksheetView.as_view()),
    path('students/<str:student_id>/marksheet/<int:exam_id>/pdf/', views.MarksheetPDFView.as_view()),
]
