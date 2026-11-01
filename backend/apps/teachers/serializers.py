from rest_framework import serializers
from .models import Teacher, SalaryPayment, LeaveApplication
from django.contrib.auth import get_user_model
from django.db import transaction

User = get_user_model()

class TeacherListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Teacher
        fields = [
            'id', 'teacher_id', 'name', 'name_bn', 'phone', 'photo', 
            'staff_type', 'designation', 'designation_bn', 'qualification', 
            'joining_date', 'monthly_salary', 'address', 'is_active'
        ]

class TeacherDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Teacher
        fields = '__all__'

class TeacherCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Teacher
        exclude = ['user', 'teacher_id', 'added_by', 'is_active']

    @transaction.atomic
    def create(self, validated_data):
        phone = validated_data.get('phone')
        name = validated_data.get('name')
        name_bn = validated_data.get('name_bn', '')
        staff_type = validated_data.get('staff_type')
        
        # Determine role based on staff_type
        role = 'teacher' if staff_type == 'teacher' else 'staff'
        
        photo = validated_data.get('photo', None)
        
        user = User(
            phone=phone,
            name=name,
            name_bn=name_bn,
            role=role,
            is_active=True,
            photo=photo
        )
        user.set_password(phone) # default password is phone
        user.save() # This triggers ID generation
        
        teacher = Teacher.objects.create(
            user=user,
            teacher_id=user.user_id,
            added_by=self.context['request'].user,
            **validated_data
        )
        return teacher

class SalaryPaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = SalaryPayment
        fields = '__all__'
        read_only_fields = ['paid_by', 'teacher']

class LeaveApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeaveApplication
        fields = '__all__'
        read_only_fields = ['status', 'reviewed_by', 'teacher']
