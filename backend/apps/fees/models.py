from django.db import models
from django.conf import settings

class FeePayment(models.Model):
    PAYMENT_STATUS = [
        ('paid', 'Paid - পরিশোধিত'),
        ('partial', 'Partial - আংশিক'),
    ]
    PAYMENT_TYPE = [
        ('monthly', 'Monthly - মাসিক বেতন'),
        ('hostel', 'Hostel - হোস্টেল ফি'),
        ('exam', 'Exam - পরীক্ষার ফি'),
        ('admission', 'Admission - ভর্তি ফি'),
        ('other', 'Other - অন্যান্য'),
    ]
    
    student = models.ForeignKey('students.Student', on_delete=models.CASCADE, related_name='fee_payments')
    payment_type = models.CharField(max_length=20, choices=PAYMENT_TYPE)
    month = models.IntegerField(null=True, blank=True)
    year = models.IntegerField()
    amount_due = models.DecimalField(max_digits=8, decimal_places=2)
    amount_paid = models.DecimalField(max_digits=8, decimal_places=2)
    discount = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    payment_date = models.DateField()
    receipt_number = models.CharField(max_length=50, unique=True)
    note = models.CharField(max_length=255, blank=True)
    collected_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    whatsapp_sent = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    @property
    def balance_due(self):
        return self.amount_due - self.amount_paid - self.discount

class FeeReminder(models.Model):
    student = models.ForeignKey('students.Student', on_delete=models.CASCADE)
    month = models.IntegerField()
    year = models.IntegerField()
    sent_at = models.DateTimeField(auto_now_add=True)
    message = models.TextField()

class Expense(models.Model):
    EXPENSE_CATEGORIES = [
        ('salary', 'শিক্ষক ও স্টাফ বেতন (Salary)'),
        ('food', 'মেস ও খাদ্য সামগ্রী (Hostel & Food)'),
        ('utility', 'বিদ্যুৎ, গ্যাস ও পানি বিল (Utility Bills)'),
        ('maintenance', 'ক্যাম্পাস মেরামত ও পরিচ্ছন্নতা (Maintenance)'),
        ('stationery', 'প্রিন্টিং ও স্টেশনারি (Printing & Stationery)'),
        ('entertainment', 'আপ্যায়ন ও মেহমানদারি (Refreshments)'),
        ('conveyance', 'যাতায়াত ও পরিবহন (Conveyance)'),
        ('other', 'বিবিধ পরিচালনা ব্যয় (Miscellaneous)'),
    ]
    
    title = models.CharField(max_length=255)
    category = models.CharField(max_length=50, choices=EXPENSE_CATEGORIES, default='other')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    expense_date = models.DateField()
    voucher_number = models.CharField(max_length=50, unique=True)
    spent_by = models.CharField(max_length=255, blank=True)
    note = models.TextField(blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.voucher_number} - {self.title} (৳{self.amount})"
