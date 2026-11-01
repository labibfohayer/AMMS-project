from rest_framework import serializers
from .models import FeePayment, FeeReminder, Expense

class ExpenseSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    created_by_name = serializers.CharField(source='created_by.name', read_only=True)

    class Meta:
        model = Expense
        fields = '__all__'
        read_only_fields = ['voucher_number', 'created_at']

class FeePaymentSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.name', read_only=True)
    student_name_bn = serializers.CharField(source='student.name_bn', read_only=True)
    student_id_code = serializers.CharField(source='student.student_id', read_only=True)
    roll_number = serializers.IntegerField(source='student.roll_number', read_only=True)
    islamic_department_name = serializers.CharField(source='student.islamic_department.name', read_only=True)
    general_department_name = serializers.CharField(source='student.general_department.name', read_only=True)
    guardian_phone = serializers.CharField(source='student.guardian_phone', read_only=True)
    collected_by_name = serializers.CharField(source='collected_by.name', read_only=True)
    balance_due = serializers.DecimalField(max_digits=8, decimal_places=2, read_only=True)

    class Meta:
        model = FeePayment
        fields = '__all__'

class FeeCollectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = FeePayment
        fields = ['student', 'payment_type', 'month', 'year', 'amount_due', 'amount_paid', 'discount', 'payment_date', 'note']

class StudentFeeStatusSerializer(serializers.Serializer):
    monthly_fee = serializers.DecimalField(max_digits=8, decimal_places=2)
    hostel_fee = serializers.DecimalField(max_digits=8, decimal_places=2)
    paid_months = serializers.ListField()
    due_months = serializers.ListField()
    total_due = serializers.DecimalField(max_digits=10, decimal_places=2)

class FeeReportSerializer(serializers.Serializer):
    total_collected = serializers.DecimalField(max_digits=10, decimal_places=2)
    total_due = serializers.DecimalField(max_digits=10, decimal_places=2)
