from rest_framework import generics, status, views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.contrib.auth import authenticate, get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import (
    UserSerializer, LoginSerializer, PasswordChangeSerializer, UserProfileSerializer
)
from .permissions import IsPrincipal, IsPrincipalOrTeacher

User = get_user_model()

class LoginView(views.APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        identifier = serializer.validated_data['phone'].strip()
        password = serializer.validated_data['password'].strip()
        
        # 1. Standard authentication by phone
        user = authenticate(request, username=identifier, password=password)
        
        # 2. If not authenticated, check user_id / student_id / phone resolution
        if user is None:
            target_user = User.objects.filter(phone=identifier).first()
            if not target_user:
                target_user = User.objects.filter(user_id__iexact=identifier).first()
            if not target_user:
                from apps.students.models import Student
                st = Student.objects.filter(student_id__iexact=identifier).first()
                if not st and identifier.isdigit():
                    st = Student.objects.filter(roll_number=int(identifier)).first()
                if st and st.user:
                    target_user = st.user
            
            if target_user and target_user.is_active:
                if target_user.check_password(password):
                    user = target_user
                else:
                    # Allow student date of birth (DDMMYYYY, YYYY-MM-DD, or DD-MM-YYYY)
                    from apps.students.models import Student
                    st = Student.objects.filter(user=target_user).first()
                    if st and st.date_of_birth:
                        dob_variants = [
                            st.date_of_birth.strftime('%d%m%Y'),
                            st.date_of_birth.strftime('%Y-%m-%d'),
                            st.date_of_birth.strftime('%d-%m-%Y'),
                            st.date_of_birth.strftime('%d/%m/%Y'),
                        ]
                        if password in dob_variants or password == 'student123':
                            user = target_user
                            # Sync password so check_password also works in future
                            user.set_password(password)
                            user.save(update_fields=['password'])

            # 3. Guardian Authentication by Guardian Phone & Student Date of Birth
            if user is None:
                from apps.students.models import Student, AdmissionApplication
                # Match students or admission applications having this guardian phone
                matching_students = list(Student.objects.filter(guardian_phone=identifier))
                matching_apps = list(AdmissionApplication.objects.filter(guardian_phone=identifier))

                if matching_students or matching_apps:
                    dob_candidates = []
                    guardian_name = None
                    guardian_name_bn = None

                    for s in matching_students:
                        if s.date_of_birth:
                            dob_candidates.append(s.date_of_birth)
                        if not guardian_name:
                            guardian_name = s.guardian_name or s.father_name
                            guardian_name_bn = s.guardian_name or s.father_name_bn

                    for a in matching_apps:
                        if a.date_of_birth:
                            dob_candidates.append(a.date_of_birth)
                        if not guardian_name:
                            guardian_name = a.father_name or a.guardian_relationship
                            guardian_name_bn = a.father_name_bn or a.guardian_relationship

                    clean_pwd = password.strip().replace('-', '').replace('/', '').replace(' ', '')
                    matched_dob = False
                    for dob in dob_candidates:
                        variants = [
                            dob.strftime('%d%m%Y'),
                            dob.strftime('%Y-%m-%d'),
                            dob.strftime('%d-%m-%Y'),
                            dob.strftime('%d/%m/%Y'),
                            dob.strftime('%Y%m%d'),
                        ]
                        clean_vars = [v.replace('-', '').replace('/', '') for v in variants]
                        if password.strip() in variants or clean_pwd in clean_vars:
                            matched_dob = True
                            break

                    if matched_dob:
                        guardian_user = User.objects.filter(phone=identifier).first()
                        if not guardian_user:
                            guardian_user = User.objects.create_user(
                                phone=identifier,
                                password=password,
                                name=guardian_name or "অভিভাবক",
                                name_bn=guardian_name_bn or "অভিভাবক",
                                role='guardian'
                            )
                        else:
                            if guardian_user.role in ['guardian', 'student']:
                                guardian_user.role = 'guardian'
                            guardian_user.set_password(password)
                            guardian_user.save(update_fields=['password', 'role'])
                        user = guardian_user
        
        if user is not None:
            refresh = RefreshToken.for_user(user)
            photo_url = user.photo.url if user.photo else None
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user_id': user.user_id,
                'role': user.role,
                'name': user.name,
                'name_bn': user.name_bn,
                'phone': user.phone,
                'photo': photo_url
            })
        return Response({'detail': 'মোবাইল নম্বর, স্টুডেন্ট আইডি বা পাসওয়ার্ড সঠিক নয়।'}, status=status.HTTP_401_UNAUTHORIZED)


class SwitchRoleView(views.APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        target_role = request.data.get('role')
        original_phone = request.data.get('original_phone')
        
        # Verify requester authorization: either currently logged in as admin/principal or original_phone is principal
        requester = request.user if request.user and request.user.is_authenticated else None
        is_allowed = False
        
        if requester and requester.role in ['principal', 'managing_director', 'vice_principal']:
            is_allowed = True
        elif original_phone:
            orig = User.objects.filter(phone=original_phone, role__in=['principal', 'managing_director']).first()
            if orig:
                is_allowed = True
                
        if not is_allowed:
            return Response({'error': 'শুধুমাত্র প্রিন্সিপাল বা এডমিন রোল পরিবর্তন করে প্রিভিউ দেখতে পারেন।'}, status=status.HTTP_403_FORBIDDEN)
            
        role_user_map = {
            'principal': '01712633264',
            'vice_principal': '01711000010',
            'managing_director': '01580506445',
            'teacher': '01711000001',
            'staff': '01711000004',
            'student': '01900000001',
            'guardian': '01811223344'
        }
        
        target_phone = role_user_map.get(target_role)
        target_user = None
        if target_phone:
            target_user = User.objects.filter(phone=target_phone).first()
        if not target_user:
            target_user = User.objects.filter(role=target_role).first()
            
        if not target_user:
            return Response({'error': f'{target_role} রোলের কোনো ইউজার পাওয়া যায়নি।'}, status=status.HTTP_404_NOT_FOUND)
            
        refresh = RefreshToken.for_user(target_user)
        target_photo = target_user.photo.url if target_user.photo else None
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user_id': target_user.user_id,
            'role': target_user.role,
            'name': target_user.name,
            'name_bn': target_user.name_bn,
            'phone': target_user.phone,
            'photo': target_photo
        })


class LogoutView(views.APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
                return Response(status=status.HTTP_205_RESET_CONTENT)
            return Response({'detail': 'Refresh token is required'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception:
            return Response(status=status.HTTP_400_BAD_REQUEST)

class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    def get_object(self):
        return self.request.user

    def perform_update(self, serializer):
        old_phone = self.request.user.phone
        user = serializer.save()

        # 1. Sync Teacher profile if exists
        try:
            if hasattr(user, 'teacher_profile'):
                tp = user.teacher_profile
                tp.phone = user.phone
                if user.name:
                    tp.name = user.name
                if user.name_bn:
                    tp.name_bn = user.name_bn
                if user.photo:
                    tp.photo = user.photo
                tp.save()
        except Exception:
            pass

        # 2. Sync Student profile if exists
        try:
            if hasattr(user, 'student_profile'):
                sp = user.student_profile
                if user.photo:
                    sp.photo = user.photo
                sp.save()
        except Exception:
            pass

        # 3. Sync Guardian children if guardian changed phone
        try:
            if user.role == 'guardian' and old_phone != user.phone:
                from apps.students.models import Student
                Student.objects.filter(guardian_phone=old_phone).update(guardian_phone=user.phone)
        except Exception:
            pass

class PasswordChangeView(views.APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = PasswordChangeSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            old_pass = serializer.validated_data['old_password'].strip()
            new_pass = serializer.validated_data['new_password'].strip()

            is_valid_old = user.check_password(old_pass)
            # If student, allow DOB or student123 as initial password
            if not is_valid_old and user.role == 'student':
                try:
                    from apps.students.models import Student
                    st = Student.objects.filter(user=user).first()
                    if st and st.date_of_birth:
                        dob_variants = [
                            st.date_of_birth.strftime('%d%m%Y'),
                            st.date_of_birth.strftime('%Y-%m-%d'),
                            st.date_of_birth.strftime('%d-%m-%Y'),
                            st.date_of_birth.strftime('%d/%m/%Y'),
                        ]
                        if old_pass in dob_variants or old_pass == 'student123':
                            is_valid_old = True
                except Exception:
                    pass

            if is_valid_old:
                if len(new_pass) < 6:
                    return Response({'detail': 'নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।'}, status=status.HTTP_400_BAD_REQUEST)
                user.set_password(new_pass)
                user.save()
                return Response({'detail': 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!'})
            return Response({'detail': 'বর্তমান (পুরোনো) পাসওয়ার্ডটি সঠিক নয়!'}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsPrincipal]

class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsPrincipal]
    
    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save()
