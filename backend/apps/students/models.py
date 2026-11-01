from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Department(models.Model):
    name = models.CharField(max_length=255)
    name_en = models.CharField(max_length=255)
    dept_type = models.CharField(max_length=20, choices=[('islamic', 'Islamic'), ('general', 'General')])
    order = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['order']
        
    def __str__(self):
        return f"{self.name_en} ({self.name})"

class Student(models.Model):
    ENROLLMENT_TYPE = [
        ('islamic_only', 'Islamic Only'),
        ('general_only', 'General Only'),
        ('both', 'Both'),
    ]
    RESIDENTIAL_STATUS = [
        ('residential', 'Residential - আবাসিক'),
        ('day', 'Day Scholar - অনাবাসিক'),
    ]
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('expelled', 'Expelled'),
        ('passed_out', 'Passed Out'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile')
    student_id = models.CharField(max_length=50, unique=True)
    
    # Personal info
    name = models.CharField(max_length=255)
    name_bn = models.CharField(max_length=255)
    father_name = models.CharField(max_length=255)
    father_name_bn = models.CharField(max_length=255)
    mother_name = models.CharField(max_length=255)
    mother_name_bn = models.CharField(max_length=255)
    date_of_birth = models.DateField()
    birth_reg_no = models.CharField(max_length=50, blank=True)
    photo = models.ImageField(upload_to='students/photos/', null=True, blank=True)
    
    # Address
    present_address = models.TextField()
    permanent_address = models.TextField()
    
    # Guardian info
    guardian_name = models.CharField(max_length=255)
    guardian_relationship = models.CharField(max_length=50)
    guardian_phone = models.CharField(max_length=20)
    guardian_nid = models.CharField(max_length=50, blank=True)
    
    # Academic
    enrollment_type = models.CharField(max_length=20, choices=ENROLLMENT_TYPE)
    islamic_department = models.ForeignKey(Department, null=True, blank=True, related_name='islamic_students', on_delete=models.SET_NULL)
    general_department = models.ForeignKey(Department, null=True, blank=True, related_name='general_students', on_delete=models.SET_NULL)
    section = models.CharField(max_length=5, default='A')
    roll_number = models.IntegerField(null=True, blank=True)
    admission_date = models.DateField()
    academic_year = models.IntegerField()
    previous_institution = models.CharField(max_length=255, blank=True)
    
    # Residential
    residential_status = models.CharField(max_length=20, choices=RESIDENTIAL_STATUS)
    hostel_room = models.ForeignKey('hostel.HostelRoom', on_delete=models.SET_NULL, null=True, blank=True, related_name='students')
    
    # Fee
    monthly_fee = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    hostel_fee = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    expulsion_reason = models.TextField(blank=True)
    
    admitted_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='admitted_students')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} - {self.student_id}"

class AdmissionApplication(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending - প্রক্রিয়াধীন'),
        ('approved', 'Approved - অনুমোদিত'),
        ('rejected', 'Rejected - বাতিল'),
    ]
    application_no = models.CharField(max_length=50, unique=True, blank=True)
    academic_year = models.IntegerField(default=2027)
    
    # Student Info
    name = models.CharField(max_length=255)
    name_bn = models.CharField(max_length=255)
    date_of_birth = models.DateField()
    blood_group = models.CharField(max_length=10, blank=True)
    birth_reg_no = models.CharField(max_length=50, blank=True)
    previous_school = models.CharField(max_length=255, blank=True)
    photo = models.ImageField(upload_to='students/photos/', null=True, blank=True)
    
    # Program / Dept preference
    desired_program = models.CharField(max_length=100)
    residential_status = models.CharField(max_length=20, default='day')
    
    # Guardian Info
    father_name = models.CharField(max_length=255)
    father_name_bn = models.CharField(max_length=255, blank=True)
    mother_name = models.CharField(max_length=255)
    mother_name_bn = models.CharField(max_length=255, blank=True)
    guardian_phone = models.CharField(max_length=20)
    guardian_relationship = models.CharField(max_length=50, default='পিতা')
    present_address = models.TextField()
    
    # Status & Admin note
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    admin_note = models.TextField(blank=True)
    interview_marks = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    written_marks = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    assigned_roll = models.IntegerField(null=True, blank=True)
    assigned_student_id = models.CharField(max_length=50, blank=True)
    enrolled_student = models.OneToOneField('Student', null=True, blank=True, on_delete=models.SET_NULL, related_name='admission_application')
    applied_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    reviewed_by = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL)

    class Meta:
        ordering = ['-applied_at']

    def save(self, *args, **kwargs):
        if not self.application_no:
            import datetime
            year = datetime.date.today().year
            count = AdmissionApplication.objects.count() + 1
            self.application_no = f"ADM-{year}-{count:04d}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.application_no} - {self.name_bn} ({self.desired_program})"


class StudentLeave(models.Model):
    LEAVE_TYPE_CHOICES = [
        ('sick', 'অসুস্থতা (Sick Leave)'),
        ('family', 'জরুরি পারিবারিক কাজ (Family Emergency)'),
        ('event', 'সামাজিক/পারিবারিক অনুষ্ঠান (Social Event)'),
        ('exam_prep', 'পরীক্ষার প্রস্তুতি / বাড়িতে অধ্যয়ন'),
        ('other', 'অন্যান্য (Other)'),
    ]
    STATUS_CHOICES = [
        ('pending', 'Pending - প্রক্রিয়াধীন'),
        ('approved', 'Approved - অনুমোদিত'),
        ('rejected', 'Rejected - বাতিল'),
    ]

    leave_no = models.CharField(max_length=50, unique=True, blank=True)
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='leave_applications')
    applied_by_guardian = models.CharField(max_length=255)
    guardian_phone = models.CharField(max_length=20)
    relationship = models.CharField(max_length=50, default='পিতা')
    
    leave_type = models.CharField(max_length=50, choices=LEAVE_TYPE_CHOICES, default='sick')
    from_date = models.DateField()
    to_date = models.DateField()
    total_days = models.IntegerField(default=1)
    reason = models.TextField()
    emergency_contact = models.CharField(max_length=20, blank=True)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    gate_pass_no = models.CharField(max_length=50, blank=True)
    departure_time = models.CharField(max_length=100, blank=True)
    expected_return_time = models.CharField(max_length=100, blank=True)
    
    reviewed_by = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name='reviewed_student_leaves')
    reviewed_at = models.DateTimeField(null=True, blank=True)
    review_comment = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        import datetime
        year = datetime.date.today().year
        if not self.leave_no:
            count = StudentLeave.objects.count() + 1
            self.leave_no = f"LV-{year}-{count:04d}"
        if self.status == 'approved' and not self.gate_pass_no:
            gp_count = StudentLeave.objects.filter(gate_pass_no__startswith=f"GP-{year}").count() + 1
            self.gate_pass_no = f"GP-{year}-{gp_count:04d}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.leave_no} - {self.student.name_bn} ({self.get_status_display()})"


