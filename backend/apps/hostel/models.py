from django.db import models

class HostelRoom(models.Model):
    room_number = models.CharField(max_length=50, unique=True)
    room_number_bn = models.CharField(max_length=50)
    capacity = models.IntegerField(default=20)
    is_active = models.BooleanField(default=True)
    
    @property
    def current_occupancy(self):
        return self.students.filter(status='active').count()
    
    @property
    def available_space(self):
        return self.capacity - self.current_occupancy

    def __str__(self):
        return self.room_number

class HostelMeal(models.Model):
    student = models.ForeignKey('students.Student', on_delete=models.CASCADE, related_name='hostel_meals')
    date = models.DateField()
    breakfast = models.BooleanField(default=True)
    lunch = models.BooleanField(default=True)
    dinner = models.BooleanField(default=True)
    note = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['student', 'date']

    @property
    def total_meals(self):
        return (1 if self.breakfast else 0) + (1 if self.lunch else 0) + (1 if self.dinner else 0)

    def __str__(self):
        return f"{self.student.name} - {self.date} ({self.total_meals} meals)"
