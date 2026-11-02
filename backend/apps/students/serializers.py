from rest_framework import serializers
from .models import Department, Student, AdmissionApplication, StudentLeave
from django.contrib.auth import get_user_model
from django.db import transaction
import datetime
from apps.notifications.whatsapp import send_admission_notification

User = get_user_model()

class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = '__all__'

class StudentListSerializer(serializers.ModelSerializer):
    islamic_department_name = serializers.CharField(source='islamic_department.name_en', read_only=True)
    general_department_name = serializers.CharField(source='general_department.name_en', read_only=True)
    islamic_department_name_bn = serializers.CharField(source='islamic_department.name', read_only=True)
    general_department_name_bn = serializers.CharField(source='general_department.name', read_only=True)

    class Meta:
        model = Student
        fields = [
            'id', 'student_id', 'name', 'name_bn', 
            'islamic_department_name', 'general_department_name',
            'islamic_department_name_bn', 'general_department_name_bn', 
            'roll_number', 'status', 'photo', 'monthly_fee', 'hostel_fee',
            'guardian_phone', 'residential_status', 'academic_year',
            'date_of_birth', 'present_address'
        ]

class StudentDetailSerializer(serializers.ModelSerializer):
    islamic_department_name = serializers.CharField(source='islamic_department.name_en', read_only=True)
    general_department_name = serializers.CharField(source='general_department.name_en', read_only=True)
    islamic_department_name_bn = serializers.CharField(source='islamic_department.name', read_only=True)
    general_department_name_bn = serializers.CharField(source='general_department.name', read_only=True)

    class Meta:
        model = Student
        fields = '__all__'

class StudentAdmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        exclude = ['user', 'student_id', 'admitted_by']
        
    def create(self, validated_data):
        with transaction.atomic():
            import uuid
            # Create user with a temporary phone first to get the auto-generated user_id
            temp_phone = f"tmp_{uuid.uuid4().hex[:10]}"
            
            # Format: DDMMYYYY
            password = validated_data.get('date_of_birth').strftime('%d%m%Y')
            
            user = User.objects.create_user(
                phone=temp_phone,
                password=password,
                name=validated_data.get('name'),
                name_bn=validated_data.get('name_bn'),
                role='student',
                photo=validated_data.get('photo', None)
            )
            
            # Update phone to be the generated user_id (which acts as the login ID)
            user.phone = user.user_id
            user.save()
            
            validated_data['user'] = user
            validated_data['student_id'] = user.user_id
            validated_data['admitted_by'] = self.context['request'].user
            
            student = Student.objects.create(**validated_data)

            # Auto-register or sync Guardian User account (Phone as Login ID, Student DOB as Password)
            guardian_phone = (student.guardian_phone or '').strip()
            if guardian_phone and student.date_of_birth:
                try:
                    dob_str = student.date_of_birth.strftime('%d%m%Y')
                    g_user = User.objects.filter(phone=guardian_phone).first()
                    g_name = student.guardian_name or student.father_name or "অভিভাবক"
                    g_name_bn = student.guardian_name or student.father_name_bn or g_name
                    if not g_user:
                        User.objects.create_user(
                            phone=guardian_phone,
                            password=dob_str,
                            name=g_name,
                            name_bn=g_name_bn,
                            role='guardian'
                        )
                    elif g_user.role == 'guardian':
                        g_user.set_password(dob_str)
                        g_user.save(update_fields=['password'])
                except Exception as e:
                    print("Auto Guardian Registration Error on Student Admission:", e)

            send_admission_notification(student, password)
            
            return student

class StudentUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        exclude = ['user', 'student_id', 'admitted_by']

class AdmissionApplicationSerializer(serializers.ModelSerializer):
    reviewed_by_name = serializers.CharField(source='reviewed_by.name', read_only=True)
    enrolled_student_id = serializers.CharField(source='enrolled_student.student_id', read_only=True)
    enrolled_student_roll = serializers.IntegerField(source='enrolled_student.roll_number', read_only=True)
    enrolled_student_section = serializers.CharField(source='enrolled_student.section', read_only=True)
    enrolled_student_dept = serializers.SerializerMethodField()

    class Meta:
        model = AdmissionApplication
        fields = '__all__'
        read_only_fields = [
            'application_no', 'status', 'applied_at', 'reviewed_at', 'reviewed_by',
            'assigned_roll', 'assigned_student_id', 'enrolled_student'
        ]

    def get_enrolled_student_dept(self, obj):
        if not obj.enrolled_student:
            return None
        st = obj.enrolled_student
        parts = []
        if st.islamic_department:
            parts.append(st.islamic_department.name)
        if st.general_department:
            parts.append(st.general_department.name)
        return ' • '.join(parts) if parts else 'সাধারণ'


class StudentLeaveSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.name', read_only=True)
    student_name_bn = serializers.CharField(source='student.name_bn', read_only=True)
    student_uid = serializers.CharField(source='student.student_id', read_only=True)
    student_roll = serializers.IntegerField(source='student.roll_number', read_only=True)
    student_photo = serializers.SerializerMethodField()
    residential_status = serializers.CharField(source='student.residential_status', read_only=True)
    department_name_bn = serializers.SerializerMethodField()
    room_number = serializers.SerializerMethodField()
    leave_type_display = serializers.CharField(source='get_leave_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    reviewed_by_name = serializers.CharField(source='reviewed_by.name', read_only=True)
    whatsapp_link = serializers.SerializerMethodField()

    class Meta:
        model = StudentLeave
        fields = '__all__'
        read_only_fields = ['leave_no', 'gate_pass_no', 'status', 'reviewed_by', 'reviewed_at', 'created_at', 'updated_at']

    def get_student_photo(self, obj):
        if obj.student.photo:
            try:
                return obj.student.photo.url
            except Exception:
                return None
        return None

    def get_department_name_bn(self, obj):
        st = obj.student
        parts = []
        if st.islamic_department:
            parts.append(st.islamic_department.name)
        if st.general_department:
            parts.append(st.general_department.name)
        return ' • '.join(parts) if parts else 'সাধারণ'

    def get_room_number(self, obj):
        if obj.student.hostel_room:
            return obj.student.hostel_room.room_number
        return None

    def get_whatsapp_link(self, obj):
        from apps.notifications.whatsapp import generate_whatsapp_web_link
        if obj.status == 'approved':
            msg = (
                f"আস-সালামু আলাইকুম! আল-মদিনা মডেল মাদ্রাসা থেকে জানানো যাচ্ছে যে, "
                f"শিক্ষার্থী {obj.student.name_bn} এর ছুটির আবেদন অনুমোদিত হয়েছে। "
                f"গেটপাস নং: {obj.gate_pass_no}। "
                f"গেটপাস দেখতে ভিজিট করুন: http://localhost:3000/students/leaves/{obj.id}/gatepass"
            )
            return generate_whatsapp_web_link(obj.guardian_phone, msg)
        return None


