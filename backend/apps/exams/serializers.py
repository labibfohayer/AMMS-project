from rest_framework import serializers
from .models import Exam, ExamResult

class ExamSerializer(serializers.ModelSerializer):
    classroom_name = serializers.CharField(source='classroom.name_bn', read_only=True)
    academic_year_name = serializers.CharField(source='academic_year.year', read_only=True)
    total_results = serializers.IntegerField(source='results.count', read_only=True)

    class Meta:
        model = Exam
        fields = '__all__'

class ExamResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExamResult
        fields = '__all__'

class BulkResultEntrySerializer(serializers.Serializer):
    results = ExamResultSerializer(many=True)

class StudentMarksheetSerializer(serializers.Serializer):
    pass

class ClassRankingSerializer(serializers.Serializer):
    pass
