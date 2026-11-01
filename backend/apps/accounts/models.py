from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.utils import timezone
from .managers import CustomUserManager
import datetime

class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = [
        ('principal', 'Principal'),
        ('vice_principal', 'Vice Principal'),
        ('managing_director', 'Managing Director'),
        ('teacher', 'Teacher'),
        ('staff', 'Staff'),
        ('guardian', 'Guardian'),
        ('student', 'Student'),
    ]
    
    user_id = models.CharField(max_length=50, unique=True, blank=True)
    phone = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=255)
    name_bn = models.CharField(max_length=255, blank=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    photo = models.ImageField(upload_to='users/photos/', null=True, blank=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)
    
    USERNAME_FIELD = 'phone'
    REQUIRED_FIELDS = ['name', 'role']
    
    objects = CustomUserManager()
    
    def __str__(self):
        return f"{self.name} ({self.phone})"
        
    def generate_user_id(self):
        prefix = ''
        if self.role == 'principal':
            prefix = 'PRIN'
        elif self.role == 'vice_principal':
            prefix = 'VP'
        elif self.role == 'managing_director':
            prefix = 'MD'
        elif self.role == 'teacher':
            prefix = 'TCH'
        elif self.role == 'staff':
            prefix = 'STF'
        elif self.role == 'guardian':
            prefix = 'GRD'
        elif self.role == 'student':
            year = datetime.date.today().year
            prefix = f'STU-{year}'
        else:
            prefix = 'USR'
        
        ids = list(User.objects.filter(user_id__startswith=prefix).values_list('user_id', flat=True))
        if prefix in ['TCH', 'STF']:
            try:
                from apps.teachers.models import Teacher
                ids += list(Teacher.objects.filter(teacher_id__startswith=prefix).values_list('teacher_id', flat=True))
            except Exception:
                pass
        elif prefix.startswith('STU'):
            try:
                from apps.students.models import Student
                ids += list(Student.objects.filter(student_id__startswith=prefix).values_list('student_id', flat=True))
            except Exception:
                pass

        max_seq = 0
        for uid in ids:
            try:
                seq = int(uid.split('-')[-1])
                if seq > max_seq:
                    max_seq = seq
            except (ValueError, IndexError):
                pass
                
        return f"{prefix}-{max_seq + 1:03d}"
        
    def save(self, *args, **kwargs):
        if not self.user_id:
            from django.db import transaction
            with transaction.atomic():
                self.user_id = self.generate_user_id()
                super().save(*args, **kwargs)
        else:
            super().save(*args, **kwargs)
