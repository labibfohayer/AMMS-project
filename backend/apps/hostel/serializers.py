from rest_framework import serializers
from .models import HostelRoom, HostelMeal
from apps.students.models import Student

class StudentBasicSerializer(serializers.ModelSerializer):
    department_name = serializers.SerializerMethodField()

    class Meta:
        model = Student
        fields = ['id', 'student_id', 'name', 'name_bn', 'roll_number', 'guardian_phone', 'department_name', 'residential_status']

    def get_department_name(self, obj):
        if obj.islamic_department:
            return obj.islamic_department.name
        if obj.general_department:
            return obj.general_department.name
        return ''

class HostelRoomSerializer(serializers.ModelSerializer):
    current_occupancy = serializers.ReadOnlyField()
    available_space = serializers.ReadOnlyField()

    class Meta:
        model = HostelRoom
        fields = ['id', 'room_number', 'room_number_bn', 'capacity', 'is_active', 'current_occupancy', 'available_space']

class HostelRoomDetailSerializer(serializers.ModelSerializer):
    current_occupancy = serializers.ReadOnlyField()
    available_space = serializers.ReadOnlyField()
    students = serializers.SerializerMethodField()

    class Meta:
        model = HostelRoom
        fields = ['id', 'room_number', 'room_number_bn', 'capacity', 'is_active', 'current_occupancy', 'available_space', 'students']

    def get_students(self, obj):
        active_students = obj.students.filter(status='active').select_related('islamic_department', 'general_department')
        return [
            {
                "id": s.id,
                "student_id": s.student_id,
                "name": s.name,
                "name_bn": s.name_bn or s.name,
                "roll_number": s.roll_number,
                "guardian_phone": s.guardian_phone,
                "department": s.islamic_department.name if s.islamic_department else (s.general_department.name if s.general_department else '')
            }
            for s in active_students
        ]

class HostelMealSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.name', read_only=True)
    student_name_bn = serializers.CharField(source='student.name_bn', read_only=True)
    student_id_code = serializers.CharField(source='student.student_id', read_only=True)
    roll_number = serializers.IntegerField(source='student.roll_number', read_only=True)
    room_number = serializers.CharField(source='student.hostel_room.room_number', read_only=True)
    total_meals = serializers.ReadOnlyField()

    class Meta:
        model = HostelMeal
        fields = '__all__'
