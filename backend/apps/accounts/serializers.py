from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'user_id', 'phone', 'name', 'name_bn', 'role', 'photo', 'is_active', 'date_joined']
        read_only_fields = ['id', 'user_id', 'date_joined']

class LoginSerializer(serializers.Serializer):
    phone = serializers.CharField()
    password = serializers.CharField(write_only=True)

class TokenResponseSerializer(serializers.Serializer):
    access = serializers.CharField()
    refresh = serializers.CharField()
    user_id = serializers.CharField()
    role = serializers.CharField()
    
class PasswordChangeSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)
    
class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'user_id', 'phone', 'name', 'name_bn', 'role', 'photo']
        read_only_fields = ['id', 'user_id', 'role']
        extra_kwargs = {
            'phone': {
                'error_messages': {
                    'unique': 'এই মোবাইল নম্বরটি ইতিমধ্যে অন্য অ্যাকাউন্টে ব্যবহৃত হচ্ছে।'
                }
            }
        }
