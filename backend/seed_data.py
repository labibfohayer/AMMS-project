import os
import django
import datetime
from decimal import Decimal

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from apps.academic.models import AcademicYear, ClassRoom, Subject
from apps.students.models import Department, Student
from apps.teachers.models import Teacher
from apps.attendance.models import StudentAttendance
from apps.fees.models import FeePayment
from apps.notices.models import Notice
from apps.exams.models import Exam, ExamResult
from apps.hostel.models import HostelRoom

User = get_user_model()

def seed_database():
    print("🌱 Starting AMMS Data Seeding (Strict Watchdog Protocol)...")

    # 1. Academic Years
    year_2026, _ = AcademicYear.objects.get_or_create(
        year=2026,
        defaults={
            'is_current': True,
            'start_date': datetime.date(2026, 1, 1),
            'end_date': datetime.date(2026, 12, 31)
        }
    )
    year_2027, _ = AcademicYear.objects.get_or_create(
        year=2027,
        defaults={
            'is_current': False,
            'start_date': datetime.date(2027, 1, 1),
            'end_date': datetime.date(2027, 12, 31)
        }
    )
    print("✓ Academic Years verified: 2026 (current), 2027")

    # 2. Departments
    islamic_depts_data = [
        ('নূরানী ও নাজেরা বিভাগ', 'Noorani & Najera', 1),
        ('হিফজুল কুরআন বিভাগ', 'Hifzul Quran', 2),
    ]
    general_depts_data = [
        ('প্লে-গ্রুপ', 'Play-group', 3),
        ('নার্সারি', 'Nursery', 4),
        ('প্রথম শ্রেণি', 'Class 1', 5),
        ('দ্বিতীয় শ্রেণি', 'Class 2', 6),
        ('তৃতীয় শ্রেণি', 'Class 3', 7),
        ('চতুর্থ শ্রেণি', 'Class 4', 8),
        ('পঞ্চম শ্রেণি', 'Class 5', 9),
        ('ষষ্ঠ শ্রেণি', 'Class 6', 10),
    ]

    dept_map = {}
    for bn, en, ord_val in islamic_depts_data:
        d, _ = Department.objects.get_or_create(
            name_en=en,
            defaults={'name': bn, 'dept_type': 'islamic', 'order': ord_val}
        )
        dept_map[en] = d

    for bn, en, ord_val in general_depts_data:
        d, _ = Department.objects.get_or_create(
            name_en=en,
            defaults={'name': bn, 'dept_type': 'general', 'order': ord_val}
        )
        dept_map[en] = d

    print(f"✓ Departments configured: {len(dept_map)} active departments")

    # 3. Hostel Rooms
    hostel_rooms_data = [
        ('Room 101', 'কক্ষ ১০১ (আবাসিক-হিফজ)', 15),
        ('Room 102', 'কক্ষ ১০২ (আবাসিক-জেনারেল)', 15),
        ('Room 103', 'কক্ষ ১০৩ (আবাসিক-নূরানী)', 12),
    ]
    hostel_rooms = []
    for num, bn, cap in hostel_rooms_data:
        hr, _ = HostelRoom.objects.get_or_create(
            room_number=num,
            defaults={'room_number_bn': bn, 'capacity': cap, 'is_active': True}
        )
        hostel_rooms.append(hr)
    print(f"✓ Hostel Rooms verified: {len(hostel_rooms)} rooms")

    # 4. Superuser / Principal User
    principal_user = User.objects.filter(phone='01712633264').first()
    if not principal_user:
        principal_user = User.objects.filter(phone='01700000000').first()

    if not principal_user:
        principal_user = User.objects.create_superuser(
            phone='01712633264',
            password='admin123',
            name='Maulana Omar Faruk Mujahidi',
            name_bn='প্রিন্সিপাল মাওলানা ওমর ফারুক মুজাহিদী',
            role='principal'
        )
    else:
        principal_user.name = 'Maulana Omar Faruk Mujahidi'
        principal_user.name_bn = 'প্রিন্সিপাল মাওলানা ওমর ফারুক মুজাহিদী'
        principal_user.role = 'principal'
        principal_user.set_password('admin123')
        principal_user.save()

    # Managing Director (MD)
    md_user = User.objects.filter(phone='01580506445').first()
    if not md_user:
        md_user = User.objects.create_user(
            phone='01580506445',
            password='admin123',
            name='Labib Fohayer',
            name_bn='লাবিব ফোহায়ের',
            role='managing_director',
            is_staff=True
        )
    else:
        md_user.name = 'Labib Fohayer'
        md_user.name_bn = 'লাবিব ফোহায়ের'
        md_user.role = 'managing_director'
        md_user.is_staff = True
        md_user.set_password('admin123')
        md_user.save()

    # Vice Principal (VP)
    vp_user = User.objects.filter(phone='01711000010').first()
    if not vp_user:
        vp_user = User.objects.create_user(
            phone='01711000010',
            password='admin123',
            name='Mufti Habibur Rahman',
            name_bn='মুফতি হাবিবুর রহমান (ভাইস প্রিন্সিপাল)',
            role='vice_principal',
            is_staff=True
        )
    else:
        vp_user.name = 'Mufti Habibur Rahman'
        vp_user.name_bn = 'মুফতি হাবিবুর রহমান (ভাইস প্রিন্সিপাল)'
        vp_user.role = 'vice_principal'
        vp_user.is_staff = True
        vp_user.set_password('admin123')
        vp_user.save()

    # Principal Teacher Profile
    principal_teacher, _ = Teacher.objects.get_or_create(
        teacher_id="TCH-001",
        defaults={
            'user': principal_user,
            'name': 'Maulana Omar Faruk Mujahidi',
            'name_bn': 'প্রিন্সিপাল মাওলানা ওমর ফারুক মুজাহিদী',
            'phone': principal_user.phone,
            'staff_type': 'teacher',
            'designation': 'Principal & Shaykhul Hadith',
            'designation_bn': 'অধ্যক্ষ ও শায়খুল হাদিস',
            'qualification': 'Dawra-e-Hadith (M.A), Kamil',
            'joining_date': datetime.date(2020, 1, 1),
            'monthly_salary': Decimal('35000.00'),
            'address': 'মহাখালী দক্ষিণপাড়া, বনানী, ঢাকা',
            'is_active': True,
        }
    )

    # Additional Teachers & Staff
    teacher_data = [
        {
            'phone': '01711000001',
            'id': 'TCH-002',
            'name': 'Hafez Maulana Abdur Rahman',
            'name_bn': 'হাফেজ মাওলানা আবদুর রহমান',
            'staff_type': 'teacher',
            'designation': 'Head of Hifz Department',
            'designation_bn': 'প্রধান ক্বারী ও হিফজ প্রধান',
            'qualification': 'Hafez-e-Quran, Dawra-e-Hadith',
            'salary': Decimal('22000.00'),
        },
        {
            'phone': '01711000002',
            'id': 'TCH-003',
            'name': 'Maulana Mohammad Noman',
            'name_bn': 'মাওলানা মোহাম্মদ নোমান',
            'staff_type': 'teacher',
            'designation': 'Assistant Teacher (Islamic Studies)',
            'designation_bn': 'সহকারী শিক্ষক (ইসলামিক স্টাডিজ)',
            'qualification': 'Kamil (Hadith), B.A',
            'salary': Decimal('18000.00'),
        },
        {
            'phone': '01711000003',
            'id': 'TCH-004',
            'name': 'Muhammad Mahfuzur Rahman',
            'name_bn': 'মুহাম্মদ মাহফুজুর রহমান',
            'staff_type': 'teacher',
            'designation': 'Senior Teacher (English & Math)',
            'designation_bn': 'জ্যেষ্ঠ শিক্ষক (ইংরেজি ও গণিত)',
            'qualification': 'B.Sc (Hons), M.Sc (Math)',
            'salary': Decimal('20000.00'),
        },
        {
            'phone': '01711000004',
            'id': 'STF-001',
            'name': 'Muhammad Billal Hossain',
            'name_bn': 'মুহাম্মদ বিল্লাল হোসেন',
            'staff_type': 'staff',
            'designation': 'Office Assistant & Accountant',
            'designation_bn': 'অফিস সহকারী ও হিসাবরক্ষক',
            'qualification': 'B.Com, Diploma in Computer',
            'salary': Decimal('14000.00'),
        },
    ]

    teachers = [principal_teacher]
    for td in teacher_data:
        t_user, _ = User.objects.get_or_create(
            phone=td['phone'],
            defaults={
                'name': td['name'],
                'name_bn': td['name_bn'],
                'role': 'teacher' if td['staff_type'] == 'teacher' else 'staff',
                'is_staff': True,
                'is_active': True
            }
        )
        t_user.set_password('admin123')
        t_user.save()

        t_profile, _ = Teacher.objects.get_or_create(
            teacher_id=td['id'],
            defaults={
                'user': t_user,
                'name': td['name'],
                'name_bn': td['name_bn'],
                'phone': td['phone'],
                'staff_type': td['staff_type'],
                'designation': td['designation'],
                'designation_bn': td['designation_bn'],
                'qualification': td['qualification'],
                'joining_date': datetime.date(2022, 1, 1),
                'monthly_salary': td['salary'],
                'address': 'বনানী, ঢাকা',
                'is_active': True,
                'added_by': principal_user
            }
        )
        teachers.append(t_profile)

    print(f"✓ Teachers & Staff created: {len(teachers)} profiles")

    # 5. ClassRooms (Each room has a unique Department + Section + AcademicYear)
    classrooms_spec = [
        ('Play', 'প্লে শ্রেণি', dept_map['Play-group'], 'A', teachers[3]),
        ('Nursery', 'নার্সারি শ্রেণি', dept_map['Nursery'], 'A', teachers[3]),
        ('Class 1', 'প্রথম শ্রেণি', dept_map['Class 1'], 'A', teachers[2]),
        ('Class 2', 'দ্বিতীয় শ্রেণি', dept_map['Class 2'], 'A', teachers[2]),
        ('Class 3', 'তৃতীয় শ্রেণি', dept_map['Class 3'], 'A', teachers[3]),
        ('Class 4', 'চতুর্থ শ্রেণি', dept_map['Class 4'], 'A', teachers[2]),
        ('Class 5', 'পঞ্চম শ্রেণি', dept_map['Class 5'], 'A', teachers[3]),
        ('Class 6', 'ষষ্ঠ শ্রেণি', dept_map['Class 6'], 'A', teachers[2]),
        ('Noorani', 'নূরানী ও নাজেরা', dept_map['Noorani & Najera'], 'A', teachers[1]),
        ('Hifz', 'হিফজুল কুরআন বিভাগ', dept_map['Hifzul Quran'], 'A', teachers[1]),
    ]

    classrooms = []
    for c_name, c_bn, dept_obj, sec, class_t in classrooms_spec:
        cr, _ = ClassRoom.objects.get_or_create(
            department=dept_obj,
            section=sec,
            academic_year=year_2026,
            defaults={
                'name': c_name,
                'name_bn': c_bn,
                'class_teacher': class_t,
                'capacity': 40
            }
        )
        classrooms.append(cr)
    print(f"✓ ClassRooms verified: {len(classrooms)} active classrooms")

    # 6. Subjects for Classrooms
    sub1, _ = Subject.objects.get_or_create(
        code="AR-101",
        defaults={'name': 'Arabic & Tajweed', 'name_bn': 'আরবি ও তাজবীদ', 'classroom': classrooms[2], 'teacher': teachers[1], 'total_marks': 100, 'pass_marks': 33}
    )
    sub2, _ = Subject.objects.get_or_create(
        code="BN-101",
        defaults={'name': 'Bangla', 'name_bn': 'বাংলা', 'classroom': classrooms[2], 'teacher': teachers[2], 'total_marks': 100, 'pass_marks': 33}
    )
    sub3, _ = Subject.objects.get_or_create(
        code="EN-101",
        defaults={'name': 'English', 'name_bn': 'ইংরেজি', 'classroom': classrooms[2], 'teacher': teachers[3], 'total_marks': 100, 'pass_marks': 33}
    )
    sub4, _ = Subject.objects.get_or_create(
        code="MT-101",
        defaults={'name': 'Mathematics', 'name_bn': 'গণিত', 'classroom': classrooms[2], 'teacher': teachers[3], 'total_marks': 100, 'pass_marks': 33}
    )
    sub_hifz, _ = Subject.objects.get_or_create(
        code="HF-101",
        defaults={'name': 'Hifzul Quran Tilawat', 'name_bn': 'হিফজুল কুরআন তিলাওয়াত', 'classroom': classrooms[9], 'teacher': teachers[1], 'total_marks': 100, 'pass_marks': 33}
    )
    print("✓ Academic Subjects verified")

    # 7. Students (12 realistic students across programs)
    students_spec = [
        ("Abdullah Al Mahdi", "আবদুল্লাহ আল মাহদী", "Muhammad Rafiqul Islam", "মুহাম্মদ রফিকুল ইসলাম", "2018-05-14", "01811223344", "both", dept_map['Hifzul Quran'], dept_map['Class 2'], classrooms[3], "residential", hostel_rooms[0], Decimal("3500.00"), 1),
        ("Muhammad Anas", "মুহাম্মদ আনাস", "Abdur Rashid", "আবদুর রশিদ", "2019-03-20", "01822334455", "general_only", None, dept_map['Nursery'], classrooms[1], "day", None, Decimal("1800.00"), 2),
        ("Salman Farsi", "সালমান ফারসী", "Kamal Hossain", "কামাল হোসেন", "2017-08-11", "01833445566", "islamic_only", dept_map['Hifzul Quran'], None, classrooms[9], "residential", hostel_rooms[0], Decimal("3000.00"), 3),
        ("Rayhan Ahmed", "রায়হান আহমেদ", "Nazrul Islam", "নজরুল ইসলাম", "2020-01-10", "01844556677", "general_only", None, dept_map['Play-group'], classrooms[0], "day", None, Decimal("1600.00"), 4),
        ("Tahmid Hasan", "তাহমীদ হাসান", "Mahbubur Rahman", "মাহবুবুর রহমান", "2016-11-25", "01855667788", "both", dept_map['Hifzul Quran'], dept_map['Class 4'], classrooms[5], "residential", hostel_rooms[1], Decimal("3500.00"), 5),
        ("Muaz bin Jabal", "মুয়াজ বিন জাবাল", "Sirajul Islam", "সিরাজুল ইসলাম", "2018-07-19", "01866778899", "islamic_only", dept_map['Noorani & Najera'], None, classrooms[8], "day", None, Decimal("1500.00"), 6),
        ("Huzaifa Rahman", "হুযাইফা রহমান", "Shahidul Alam", "শহিদুল আলম", "2015-09-05", "01877889900", "general_only", None, dept_map['Class 6'], classrooms[7], "day", None, Decimal("2000.00"), 7),
        ("Zayan Khan", "যায়ান খান", "Enamul Haque", "এনামুল হক", "2019-12-15", "01888990011", "general_only", None, dept_map['Nursery'], classrooms[1], "day", None, Decimal("1800.00"), 8),
        ("Omar Faruq Jr.", "ওমর ফারুক", "Moniruzzaman", "মনিরুজ্জামান", "2017-04-02", "01899001122", "both", dept_map['Hifzul Quran'], dept_map['Class 3'], classrooms[4], "residential", hostel_rooms[0], Decimal("3500.00"), 9),
        ("Ibrahim Khalil", "ইব্রাহিম খলিল", "Abu Taher", "আবু তাহের", "2014-06-30", "01711223399", "general_only", None, dept_map['Class 6'], classrooms[7], "day", None, Decimal("2200.00"), 10),
        ("Yusuf Ali", "ইউসুফ আলী", "Nurul Huda", "নুরুল হুদা", "2018-02-18", "01722334400", "both", dept_map['Noorani & Najera'], dept_map['Class 1'], classrooms[2], "day", None, Decimal("2000.00"), 11),
        ("Hamza Mahmud", "হামযা মাহমুদ", "Farhad Hossain", "ফরহাদ হোসেন", "2016-10-12", "01733445511", "both", dept_map['Hifzul Quran'], dept_map['Class 5'], classrooms[6], "residential", hostel_rooms[1], Decimal("3500.00"), 12),
    ]

    students = []
    for idx, s in enumerate(students_spec, start=1):
        stu_id = f"STU-2026-{idx:03d}"
        dob_parts = s[4].split('-')
        password = f"{dob_parts[2]}{dob_parts[1]}{dob_parts[0]}" # DDMMYYYY

        user_stu, _ = User.objects.get_or_create(
            phone=f"019{idx:08d}",
            defaults={
                'name': s[0],
                'name_bn': s[1],
                'role': 'student',
                'user_id': stu_id,
                'is_active': True
            }
        )
        user_stu.set_password(password)
        user_stu.save()

        student, _ = Student.objects.get_or_create(
            student_id=stu_id,
            defaults={
                'user': user_stu,
                'name': s[0],
                'name_bn': s[1],
                'father_name': s[2],
                'father_name_bn': s[3],
                'mother_name': 'Fatema Begum',
                'mother_name_bn': 'ফাতেমা বেগম',
                'date_of_birth': datetime.date.fromisoformat(s[4]),
                'birth_reg_no': f"20182692019{idx:06d}",
                'present_address': 'ক-৭৫/২, মহাখালী দক্ষিণপাড়া, বনানী, ঢাকা',
                'permanent_address': 'ক-৭৫/২, মহাখালী দক্ষিণপাড়া, বনানী, ঢাকা',
                'guardian_name': s[3],
                'guardian_relationship': 'পিতা',
                'guardian_phone': s[5],
                'guardian_nid': f"19852692019000{idx:03d}",
                'enrollment_type': s[6],
                'islamic_department': s[7],
                'general_department': s[8],
                'section': 'A',
                'roll_number': s[13],
                'admission_date': datetime.date(2026, 1, 5),
                'academic_year': 2026,
                'residential_status': s[10],
                'hostel_room': s[11],
                'monthly_fee': s[12],
                'hostel_fee': Decimal('1500.00') if s[10] == 'residential' else Decimal('0.00'),
                'status': 'active',
                'admitted_by': principal_user
            }
        )
        students.append(student)

    print(f"✓ Students created: {len(students)} active students")

    # 8. Student Attendance (For today)
    today = datetime.date.today()
    for idx, stu in enumerate(students):
        # 10 present, 2 absent
        status = 'present' if idx < 10 else 'absent'
        cr = stu.general_department and classrooms[2] or classrooms[9]
        StudentAttendance.objects.get_or_create(
            student=stu,
            date=today,
            classroom=cr,
            defaults={
                'status': status,
                'taken_by': teachers[1].user,
                'whatsapp_sent': True
            }
        )
    print(f"✓ Today's Attendance recorded for {len(students)} students (10 Present, 2 Absent)")

    # 9. Fee Payments & Dues
    current_month = today.month
    for idx, stu in enumerate(students[:8], start=1):
        FeePayment.objects.get_or_create(
            receipt_number=f"REC-2026-{idx:04d}",
            defaults={
                'student': stu,
                'payment_type': 'monthly',
                'month': current_month,
                'year': today.year,
                'amount_due': stu.monthly_fee,
                'amount_paid': stu.monthly_fee,
                'discount': Decimal('0.00'),
                'payment_date': today,
                'note': f'{current_month} মাসের বেতন পরিশোধ',
                'collected_by': principal_user,
                'whatsapp_sent': True
            }
        )
    print("✓ Fee payments recorded. Remaining 4 students have pending dues.")

    # 10. Notices
    Notice.objects.get_or_create(
        title="Admission Open for Session 2027",
        defaults={
            'title_bn': "২০২৭ শিক্ষাবর্ষে প্লে-গ্রুপ থেকে ষষ্ঠ শ্রেণি ও হিফজ বিভাগে নতুন ভর্তি বিজ্ঞপ্তি",
            'body': "Al Madina Model Madrasa and Research Institute invites applications for session 2027. Air conditioned classrooms, multimedia projectors, and CCTV coverage available.",
            'body_bn': "আল-মদিনা মডেল মাদ্রাসা এন্ড রিসার্চ ইনস্টিটিউটে ২০২৭ শিক্ষাবর্ষে প্লে-গ্রুপ থেকে ষষ্ঠ শ্রেণি এবং হিফজুল কুরআন বিভাগে নতুন শিক্ষার্থী ভর্তি চলছে। সম্পূর্ণ শীতাতপ নিয়ন্ত্রিত আধুনিক ক্লাসরুম ও সার্বক্ষণিক সিসিটিভি ক্যামেরার সুরক্ষায় আপনার সন্তানের দ্বীনি ও আধুনিক শিক্ষার ভিত্তি গড়ে তুলতে আজই যোগাযোগ করুন। আসন সংখ্যা সীমিত।",
            'target': 'all',
            'created_by': principal_user,
            'is_active': True,
            'whatsapp_sent': True
        }
    )

    Notice.objects.get_or_create(
        title="Monthly Guardians Meeting",
        defaults={
            'title_bn': "চলতি মাসের অভিভাবক সমাবেশ (Guardians Meeting) সংক্রান্ত নোটিশ",
            'body': "Monthly meeting with respected guardians regarding student academic progress will be held this Friday at 10:00 AM.",
            'body_bn': "সম্মানিত অভিভাবকবৃন্দের সদয় অবগতির জন্য জানানো যাচ্ছে যে, শিক্ষার্থীদের পড়ালেখার মানোন্নয়ন ও সার্বিক অগ্রগতি পর্যালোচনার লক্ষ্যে আগামী শুক্রবার সকাল ১০:০০ ঘটিকায় মাদ্রাসার কনফারেন্স কক্ষে মাসিক অভিভাবক সমাবেশ অনুষ্ঠিত হবে। অধ্যক্ষ মহোদয় সরাসরি উপস্থিত থাকবেন। সকল অভিভাবককে উপস্থিত থাকার অনুরোধ করা হচ্ছে।",
            'target': 'guardians',
            'created_by': principal_user,
            'is_active': True,
            'whatsapp_sent': True
        }
    )

    Notice.objects.get_or_create(
        title="Hifzul Quran Weekly Evaluation",
        defaults={
            'title_bn': "হিফজুল কুরআন বিভাগের সাপ্তাহিক শুনানি ও পরীক্ষা",
            'body': "Weekly evaluation for all Hifz department students will take place on Saturday under supervision of Principal.",
            'body_bn': "হিফজুল কুরআন বিভাগের সকল শিক্ষার্থীর সাপ্তাহিক সবক ও শুনানি আগামী শনিবার সকাল ৯:০০ ঘটিকা হতে শুরু হবে। শিক্ষার্থীরা তাদের নির্ধারিত পারার পূর্ণ প্রস্তুতি নিয়ে উপস্থিত থাকবে।",
            'target': 'students',
            'created_by': principal_user,
            'is_active': True,
            'whatsapp_sent': False
        }
    )
    print("✓ 3 Madrasah Notices published")

    # 11. Exam & Results
    exam_monthly, _ = Exam.objects.get_or_create(
        name="Monthly Evaluation Exam 2026",
        classroom=classrooms[2],
        academic_year=year_2026,
        defaults={
            'name_bn': "মাসিক মূল্যায়ন পরীক্ষা ২০২৬",
            'exam_type': 'monthly',
            'start_date': today - datetime.timedelta(days=10),
            'end_date': today - datetime.timedelta(days=5),
            'is_published': True,
            'created_by': principal_user
        }
    )

    for idx, stu in enumerate(students[:6], start=1):
        marks = Decimal(f"{85 - idx * 4}.00")
        ExamResult.objects.get_or_create(
            exam=exam_monthly,
            student=stu,
            subject=sub1,
            defaults={
                'marks_obtained': marks,
                'total_marks': 100,
                'is_absent': False,
                'entered_by': principal_user
            }
        )
    print("✓ Exam and Results entered for ranking testing")

    print("\n🎉 Seeding Completed! Database is fully populated with realistic AMMS records.")

if __name__ == '__main__':
    seed_database()
