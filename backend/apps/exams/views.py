from rest_framework import generics, views, status, permissions
from rest_framework.response import Response
from .models import Exam, ExamResult
from .serializers import ExamSerializer, ExamResultSerializer, BulkResultEntrySerializer
from apps.notifications.whatsapp import send_result_notification
from apps.students.models import Student
from django.http import HttpResponse
from .utils import generate_marksheet_pdf
from django.shortcuts import get_object_or_404
from django.db.models import Sum, Q

class ExamListCreateView(generics.ListCreateAPIView):
    queryset = Exam.objects.all()
    serializer_class = ExamSerializer

class ExamDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Exam.objects.all()
    serializer_class = ExamSerializer

class ExamPublishView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, pk):
        if request.user.role not in ['principal', 'vice_principal', 'managing_director']:
            return Response(status=status.HTTP_403_FORBIDDEN)
            
        exam = get_object_or_404(Exam, pk=pk)
        exam.is_published = True
        exam.save()
        
        students = Student.objects.filter(exam_results__exam=exam).distinct()
        count = 0
        for student in students:
            results = ExamResult.objects.filter(exam=exam, student=student)
            gpas = [r.gpa for r in results if r.gpa is not None]
            avg_gpa = float(sum(gpas) / len(gpas)) if gpas else 0.0
            send_result_notification(student, exam.name_bn or exam.name, avg_gpa)
            count += 1
            
        return Response({'status': 'published', 'notifications_sent': count})

class ResultEntryView(views.APIView):
    def post(self, request, pk):
        exam = get_object_or_404(Exam, pk=pk)
        serializer = BulkResultEntrySerializer(data=request.data)
        if serializer.is_valid():
            results_data = serializer.validated_data.get('results', [])
            for r_data in results_data:
                ExamResult.objects.update_or_create(
                    exam=exam,
                    student=r_data['student'],
                    subject=r_data['subject'],
                    defaults={
                        'marks_obtained': r_data['marks_obtained'],
                        'total_marks': r_data.get('total_marks', 100),
                        'grade': r_data.get('grade', ''),
                        'gpa': r_data.get('gpa')
                    }
                )
            return Response({'status': 'saved'})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class StudentMarksheetView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, student_id, exam_id):
        if str(student_id).isdigit():
            student = Student.objects.filter(Q(id=int(student_id)) | Q(student_id=str(student_id))).first()
        else:
            student = Student.objects.filter(student_id=str(student_id)).first()
            
        if not student:
            return Response({"detail": "Student not found"}, status=status.HTTP_404_NOT_FOUND)
            
        exam = get_object_or_404(Exam, pk=exam_id)
        
        # Access control
        if not exam.is_published:
            if request.user.role not in ['principal', 'vice_principal', 'managing_director', 'teacher']:
                return Response(status=status.HTTP_403_FORBIDDEN)
        else:
            if request.user.role == 'student' and getattr(student, 'user', None) != request.user:
                return Response(status=status.HTTP_403_FORBIDDEN)
            if request.user.role == 'guardian' and getattr(student, 'guardian_phone', None) != getattr(request.user, 'phone', None):
                return Response(status=status.HTTP_403_FORBIDDEN)
                
        results = ExamResult.objects.filter(exam=exam, student=student).select_related('subject')
        
        subject_results = []
        total_marks_obtained = 0
        total_full_marks = 0
        total_gpa = 0
        valid_subjects = 0
        has_failed = False
        
        for r in results:
            if r.grade == 'F':
                has_failed = True
            subject_results.append({
                "subject_code": r.subject.code,
                "subject_name": r.subject.name,
                "subject_name_bn": r.subject.name_bn,
                "marks_obtained": float(r.marks_obtained),
                "total_marks": r.total_marks,
                "pass_marks": r.subject.pass_marks,
                "grade": r.grade,
                "gpa": float(r.gpa) if r.gpa is not None else 0.0,
                "is_absent": r.is_absent
            })
            total_marks_obtained += r.marks_obtained
            total_full_marks += r.total_marks
            if r.gpa is not None:
                total_gpa += r.gpa
                valid_subjects += 1
                
        average = round(float(total_marks_obtained / valid_subjects), 2) if valid_subjects else 0.0
        overall_gpa = round(float(total_gpa / valid_subjects), 2) if valid_subjects else 0.0
        
        if has_failed:
            overall_grade = 'F'
        elif overall_gpa >= 5.0:
            overall_grade = 'A+'
        elif overall_gpa >= 4.0:
            overall_grade = 'A'
        elif overall_gpa >= 3.5:
            overall_grade = 'A-'
        elif overall_gpa >= 3.0:
            overall_grade = 'B'
        elif overall_gpa >= 2.0:
            overall_grade = 'C'
        elif overall_gpa >= 1.0:
            overall_grade = 'D'
        else:
            overall_grade = 'F'
        
        # Calculate rank
        all_students_results = ExamResult.objects.filter(exam=exam).values('student').annotate(total=Sum('marks_obtained')).order_by('-total')
        
        student_total = next((x['total'] for x in all_students_results if x['student'] == student.id), 0)
        higher_scores = [x['total'] for x in all_students_results if x['total'] > student_total]
        
        class_rank = len(higher_scores) + 1
        total_examinees = all_students_results.count()
        highest_total = max([x['total'] for x in all_students_results] + [0])
        gap_from_first = float(highest_total - student_total)
        
        dept_name = student.islamic_department.name if student.islamic_department else (student.general_department.name if student.general_department else '')
        dept_name_en = student.islamic_department.name_en if student.islamic_department else (student.general_department.name_en if student.general_department else '')
        
        return Response({
            "student_id": student.student_id,
            "student_pk": student.id,
            "name": student.name,
            "name_bn": student.name_bn,
            "father_name": student.father_name,
            "father_name_bn": student.father_name_bn,
            "roll_number": student.roll_number,
            "department_name": dept_name,
            "department_name_en": dept_name_en,
            "classroom_name": exam.classroom.name if exam.classroom else '',
            "classroom_name_bn": exam.classroom.name_bn if exam.classroom else '',
            "academic_year": exam.academic_year.year if exam.academic_year else student.academic_year,
            "exam_id": exam.id,
            "exam_name": exam.name,
            "exam_name_bn": exam.name_bn,
            "exam_type": exam.exam_type,
            "subject_results": subject_results,
            "total_marks_obtained": float(total_marks_obtained),
            "total_full_marks": total_full_marks,
            "average": average,
            "overall_gpa": overall_gpa,
            "overall_grade": overall_grade,
            "result_status": "অকৃতকার্য (Failed)" if has_failed else "উত্তীর্ণ (Passed)",
            "class_rank": class_rank,
            "total_examinees": total_examinees,
            "highest_total": float(highest_total),
            "gap_from_first": gap_from_first
        })

class ClassRankingView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, pk):
        exam = get_object_or_404(Exam, pk=pk)
        
        all_students_results = ExamResult.objects.filter(exam=exam).values('student').annotate(total=Sum('marks_obtained'))
        student_ids = [x['student'] for x in all_students_results]
        
        students = Student.objects.filter(id__in=student_ids)
        student_dict = {s.id: s for s in students}
        
        ranking_data = []
        for x in all_students_results:
            s_id = x['student']
            student = student_dict.get(s_id)
            if not student: continue
            
            # calculate gpa and grade for this student
            results = ExamResult.objects.filter(exam=exam, student=student)
            gpas = [r.gpa for r in results if r.gpa is not None]
            avg_gpa = float(sum(gpas) / len(gpas)) if gpas else 0.0
            has_failed = any(r.grade == 'F' for r in results)
            
            if has_failed:
                grade = 'F'
            elif avg_gpa >= 5.0: grade = 'A+'
            elif avg_gpa >= 4.0: grade = 'A'
            elif avg_gpa >= 3.5: grade = 'A-'
            elif avg_gpa >= 3.0: grade = 'B'
            elif avg_gpa >= 2.0: grade = 'C'
            elif avg_gpa >= 1.0: grade = 'D'
            else: grade = 'F'
            
            is_current_user = False
            if request.user.role == 'student' and getattr(student, 'user', None) == request.user:
                is_current_user = True
            
            dept_bn = student.islamic_department.name if student.islamic_department else (student.general_department.name if student.general_department else '')
            
            # Generate quick WhatsApp URL
            from apps.notifications.whatsapp import generate_whatsapp_web_link
            rank_text = "১ম" if len(ranking_data) == 0 else f"{len(ranking_data) + 1}তম"
            wa_msg = (
                f"আস-সালামু আলাইকুম!\n*আল-মদিনা মডেল মাদ্রাসা এন্ড রিসার্চ ইনস্টিটিউট*\n\n"
                f"সম্মানিত অভিভাবক, *{exam.name_bn or exam.name}*-এ আপনার সন্তান *{student.name_bn or student.name}* (রোল: {student.roll_number or 'N/A'}) কৃতিত্বের সাথে উত্তীর্ণ হয়েছে।\n"
                f"📊 প্রাপ্ত মোট নম্বর: {float(x['total']):.1f}\n🌟 GPA: {avg_gpa:.2f} (গ্রেড: {grade})\n\n"
                f"অনলাইন মার্কশিট দেখতে লগইন করুন: http://localhost:3000/login\n"
                f"অধ্যক্ষ: মাওলানা ওমর ফারুক মুজাহিদী | হেল্পলাইন: ০১৭১২-৬৩৩২৬৪"
            )
            wa_link = generate_whatsapp_web_link(student.guardian_phone or '01712633264', wa_msg)
            
            ranking_data.append({
                "student_pk": student.id,
                "student_id": student.student_id,
                "name": student.name,
                "name_bn": student.name_bn,
                "roll_number": student.roll_number,
                "guardian_phone": student.guardian_phone,
                "guardian_name": student.guardian_name,
                "department_name": dept_bn,
                "total_marks": float(x['total']),
                "gpa": round(avg_gpa, 2),
                "grade": grade,
                "has_failed": has_failed,
                "wa_link": wa_link,
                "is_current_user": is_current_user
            })
            
        ranking_data.sort(key=lambda item: item['total_marks'], reverse=True)
        
        # Assign ranks
        current_rank = 1
        for i in range(len(ranking_data)):
            if i > 0 and ranking_data[i]['total_marks'] < ranking_data[i-1]['total_marks']:
                current_rank = i + 1
            ranking_data[i]['rank'] = current_rank
            
        return Response(ranking_data)

class ExamNotifyResultsView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, pk):
        if request.user.role not in ['principal', 'vice_principal', 'managing_director', 'teacher', 'admin']:
            return Response({"detail": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)
            
        exam = get_object_or_404(Exam, pk=pk)
        target_student_id = request.data.get('student_id')
        
        # Get all results for ranking calculation
        all_students_results = ExamResult.objects.filter(exam=exam).values('student').annotate(total=Sum('marks_obtained')).order_by('-total')
        total_list = list(all_students_results)
        
        if target_student_id:
            students = Student.objects.filter(Q(id=target_student_id) | Q(student_id=target_student_id))
        else:
            student_ids = [x['student'] for x in total_list]
            students = Student.objects.filter(id__in=student_ids)
            
        sent_count = 0
        notifications = []
        from apps.notifications.whatsapp import generate_whatsapp_web_link, send_whatsapp_message
        
        for student in students:
            idx = next((i for i, item in enumerate(total_list) if item['student'] == student.id), -1)
            rank = idx + 1 if idx != -1 else 1
            student_total = total_list[idx]['total'] if idx != -1 else 0
            
            results = ExamResult.objects.filter(exam=exam, student=student)
            gpas = [r.gpa for r in results if r.gpa is not None]
            avg_gpa = float(sum(gpas) / len(gpas)) if gpas else 0.0
            has_failed = any(r.grade == 'F' for r in results)
            
            if has_failed: grade = 'F'
            elif avg_gpa >= 5.0: grade = 'A+'
            elif avg_gpa >= 4.0: grade = 'A'
            elif avg_gpa >= 3.5: grade = 'A-'
            elif avg_gpa >= 3.0: grade = 'B'
            elif avg_gpa >= 2.0: grade = 'C'
            elif avg_gpa >= 1.0: grade = 'D'
            else: grade = 'F'
            
            if student.guardian_phone:
                rank_bn = f"{rank}ম" if rank <= 3 else f"{rank}তম"
                title = f"ফলাফল প্রকাশ - {student.name_bn or student.name} (মেধা স্থান: {rank_bn})"
                msg = (
                    f"আস-সালামু আলাইকুম!\n\n"
                    f"*আল-মদিনা মডেল মাদ্রাসা এন্ড রিসার্চ ইনস্টিটিউট*\n"
                    f"ক-৭৫/২, মহাখালী দক্ষিণপাড়া, বনানী, ঢাকা | হেল্পলাইন: ০১৭১২-৬৩৩২৬৪\n\n"
                    f"সম্মানিত অভিভাবক,\n"
                    f"*{exam.name_bn or exam.name}*-এর ফলাফল প্রকাশিত হয়েছে। আপনার সন্তান *{student.name_bn or student.name}* (ID: {student.student_id}, রোল: {student.roll_number or 'N/A'}) নিম্নলিখিত ফলাফল অর্জন করেছে:\n\n"
                    f"🏆 *মেধা তালিকায় স্থান:* {rank_bn}\n"
                    f"📊 *মোট প্রাপ্ত নম্বর:* {float(student_total):.1f}\n"
                    f"🌟 *গড় জিপিএ (GPA):* {avg_gpa:.2f}\n"
                    f"🏅 *লেটার গ্রেড:* {grade}\n\n"
                    f"সিল-স্বাক্ষরসহ পূর্ণাঙ্গ মার্কশিট দেখতে লগইন করুন:\n"
                    f"http://localhost:3000/login\n\n"
                    f"অধ্যক্ষ: মাওলানা ওমর ফারুক মুজাহিদী\n"
                    f"জাযাকাল্লাহু খাইরান।"
                )
                send_whatsapp_message(
                    phone=student.guardian_phone,
                    message=msg,
                    title=title,
                    notification_type='result',
                    student=student,
                    recipient_name=student.guardian_name,
                    sent_by=request.user
                )
                wa_link = generate_whatsapp_web_link(student.guardian_phone, msg)
                notifications.append({
                    "student_id": student.student_id,
                    "student_name": student.name_bn or student.name,
                    "phone": student.guardian_phone,
                    "wa_link": wa_link,
                    "rank": rank,
                    "gpa": round(avg_gpa, 2),
                    "grade": grade
                })
                sent_count += 1
                
        return Response({
            "status": "success",
            "sent_count": sent_count,
            "exam_name": exam.name_bn or exam.name,
            "notifications": notifications
        })

class MarksheetPDFView(views.APIView):
    def get(self, request, student_id, exam_id):
        student = get_object_or_404(Student, student_id=student_id)
        exam = get_object_or_404(Exam, pk=exam_id)
        results = ExamResult.objects.filter(exam=exam, student=student).select_related('subject')
        pdf = generate_marksheet_pdf(student, exam, results)
        return HttpResponse(pdf, content_type='application/pdf')
