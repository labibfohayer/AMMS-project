from django.contrib import admin
from .models import HostelRoom, HostelMeal

@admin.register(HostelRoom)
class HostelRoomAdmin(admin.ModelAdmin):
    list_display = ('room_number', 'room_number_bn', 'capacity', 'is_active')
    list_filter = ('is_active',)

@admin.register(HostelMeal)
class HostelMealAdmin(admin.ModelAdmin):
    list_display = ('student', 'date', 'breakfast', 'lunch', 'dinner', 'total_meals')
    list_filter = ('date', 'breakfast', 'lunch', 'dinner')
    search_fields = ('student__name', 'student__student_id')
