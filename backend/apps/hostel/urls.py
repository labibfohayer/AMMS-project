from django.urls import path
from .views import (
    HostelRoomListView, HostelRoomDetailView, HostelRoomAssignView, HostelRoomUnassignView,
    HostelDailyMealView, HostelCurfewAttendanceView, HostelFoodCostSummaryView
)

urlpatterns = [
    path('rooms/', HostelRoomListView.as_view(), name='hostel-room-list'),
    path('meals/', HostelDailyMealView.as_view(), name='hostel-meals'),
    path('curfew/', HostelCurfewAttendanceView.as_view(), name='hostel-curfew'),
    path('food-costs/', HostelFoodCostSummaryView.as_view(), name='hostel-food-costs'),
    path('<int:pk>/', HostelRoomDetailView.as_view(), name='hostel-room-detail'),
    path('<int:pk>/assign/', HostelRoomAssignView.as_view(), name='hostel-room-assign'),
    path('<int:pk>/unassign/', HostelRoomUnassignView.as_view(), name='hostel-room-unassign'),
    path('', HostelRoomListView.as_view(), name='hostel-room-list-root'),
]
