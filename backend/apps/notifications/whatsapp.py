import requests
import os
import urllib.parse
from .models import NotificationLog

WHATSAPP_SERVICE_URL = os.getenv('WHATSAPP_SERVICE_URL', 'http://localhost:3001')

def format_bangladesh_phone(phone: str) -> str:
    cleaned = ''.join(c for c in str(phone) if c.isdigit())
    if cleaned.startswith('880'):
        return cleaned
    if cleaned.startswith('0'):
        return f"88{cleaned}"
    return f"880{cleaned}"

def generate_whatsapp_web_link(phone: str, message: str) -> str:
    intl_phone = format_bangladesh_phone(phone)
    encoded_message = urllib.parse.quote(message)
    return f"https://wa.me/{intl_phone}?text={encoded_message}"

def send_whatsapp_message(
    phone: str, 
    message: str, 
    title: str = "WhatsApp Notification",
    notification_type: str = "custom",
    student=None,
    recipient_name: str = "",
    sent_by=None
) -> bool:
    formatted_phone = format_bangladesh_phone(phone)
    is_success = False
    error_detail = ""

    try:
        response = requests.post(
            f"{WHATSAPP_SERVICE_URL}/send",
            json={"phone": formatted_phone, "message": message},
            timeout=5
        )
        if response.status_code == 200:
            is_success = True
        else:
            error_detail = f"HTTP {response.status_code}: {response.text}"
    except Exception as e:
        error_detail = str(e)
        # Even if microservice is offline, we mark as queued/logged with web link availability
        is_success = False

    # Log into Database
    try:
        NotificationLog.objects.create(
            student=student,
            recipient_phone=phone,
            recipient_name=recipient_name or (student.guardian_name if student else ''),
            channel='whatsapp',
            notification_type=notification_type,
            title=title,
            message=message,
            status='delivered' if is_success else 'queued',
            error_message=error_detail if not is_success else '',
            sent_by=sent_by
        )
    except Exception as log_err:
        print(f"Error logging notification: {log_err}")

    return is_success

def send_admission_notification(student, password: str, sent_by=None):
    title = f"ভর্তি নিশ্চিতকরণ - {student.name_bn or student.name}"
    message = (
        f"আস-সালামু আলাইকুম!\n\n"
        f"*আল-মদিনা মডেল মাদ্রাসা এন্ড রিসার্চ ইনস্টিটিউট*\n"
        f"ক-৭৫/২, মহাখালী দক্ষিণপাড়া, বনানী, ঢাকা | ০১৭১২-৬৩৩২৬৪\n\n"
        f"আপনার সন্তান *{student.name_bn or student.name}* এর ভর্তি কার্যক্রম সফলভাবে সম্পন্ন হয়েছে।\n\n"
        f"📋 *Student ID:* {student.student_id}\n"
        f"🔑 *Password:* {password}\n"
        f"📚 *বিভাগ:* {student.islamic_department.name if student.islamic_department else (student.general_department.name if student.general_department else 'সাধারণ')}\n\n"
        f"অনলাইন পোর্টালে লগইন করতে ভিজিট করুন:\n"
        f"http://localhost:3000/login\n\n"
        f"জাযাকাল্লাহু খাইরান।"
    )
    return send_whatsapp_message(
        phone=student.guardian_phone,
        message=message,
        title=title,
        notification_type='admission',
        student=student,
        recipient_name=student.guardian_name,
        sent_by=sent_by
    )

def send_admission_application_alert(application, sent_by=None):
    title = f"অনলাইন ভর্তি আবেদন গৃহীত - {application.application_no}"
    message = (
        f"আস-সালামু আলাইকুম!\n\n"
        f"*আল-মদিনা মডেল মাদ্রাসা এন্ড রিসার্চ ইনস্টিটিউট*\n"
        f"ক-৭৫/২, মহাখালী দক্ষিণপাড়া, বনানী, ঢাকা\n\n"
        f"আপনার সন্তান *{application.name_bn}* এর ভর্তি আবেদন সফলভাবে গৃহীত হয়েছে।\n\n"
        f"🔖 *আবেদন ট্র্যাকিং নং:* {application.application_no}\n"
        f"📖 *কাঙ্ক্ষিত বিভাগ:* {application.desired_program}\n"
        f"📅 *শিক্ষাবর্ষ:* {application.academic_year}\n\n"
        f"মাদ্রাসার ভর্তি স্লিপ ডাউনলোড ও বিস্তারিত তথ্যের জন্য মাদ্রাসায় যোগাযোগ করুন।\n"
        f"হেল্পলাইন: ০১৭১২-৬৩৩২৬৪\n\n"
        f"জাযাকাল্লাহু খাইরান।"
    )
    return send_whatsapp_message(
        phone=application.guardian_phone,
        message=message,
        title=title,
        notification_type='admission',
        recipient_name=application.father_name_bn or application.father_name,
        sent_by=sent_by
    )

def send_fee_receipt_notification(payment, sent_by=None):
    title = f"মানি রিসিট ভাউচার - {payment.receipt_number}"
    student = payment.student
    month_str = f" ({payment.month} মাস)" if payment.month else ""
    message = (
        f"আস-সালামু আলাইকুম!\n\n"
        f"*আল-মদিনা মডেল মাদ্রাসা এন্ড রিসার্চ ইনস্টিটিউট*\n"
        f"ক-৭৫/২, মহাখালী দক্ষিণপাড়া, বনানী, ঢাকা | ০১৭১২-৬৩৩২৬৪\n\n"
        f"🧾 *অর্থ আদায় মানি রিসিট ভাউচার*\n"
        f"────────────────────────\n"
        f"রশিদ নম্বর: *{payment.receipt_number}*\n"
        f"তারিখ: {payment.payment_date}\n"
        f"শিক্ষার্থী: *{student.name_bn or student.name}* (ID: {student.student_id})\n"
        f"ফি'র বিবরণ: *{payment.get_payment_type_display()}{month_str}*\n"
        f"পরিশোধিত টাকা: *৳ {payment.amount_paid}/-*\n"
        f"মওকুফ/ছাড়: ৳ {payment.discount}/-\n"
        f"অবশিষ্ট বকেয়া: ৳ {payment.balance_due}/-\n"
        f"────────────────────────\n"
        f"আদায়কারী: {payment.collected_by.name if payment.collected_by else 'অফিস ক্যাশিয়ার'}\n\n"
        f"মাদ্রাসার অনলাইন পোর্টালে লগইন করে সম্পূর্ণ রশিদ প্রিন্ট বা সংরক্ষণ করতে পারেন।\n"
        f"জাযাকাল্লাহু খাইরান।"
    )
    return send_whatsapp_message(
        phone=student.guardian_phone,
        message=message,
        title=title,
        notification_type='fee_receipt',
        student=student,
        recipient_name=student.guardian_name,
        sent_by=sent_by
    )

def send_fee_reminder(student, month_name: str, amount: float, sent_by=None):
    title = f"বকেয়া বেতন রিমাইন্ডার - {student.name_bn or student.name}"
    message = (
        f"আস-সালামু আলাইকুম!\n\n"
        f"*আল-মদিনা মডেল মাদ্রাসা এন্ড রিসার্চ ইনস্টিটিউট*\n"
        f"ক-৭৫/২, মহাখালী দক্ষিণপাড়া, বনানী, ঢাকা | ০১৭১২-৬৩৩২৬৪\n\n"
        f"সম্মানিত অভিভাবক,\n"
        f"বিনীতভাবে স্মরণ করিয়ে দেওয়া যাচ্ছে যে, আপনার সন্তান *{student.name_bn or student.name}* (ID: {student.student_id}) এর *{month_name}* মাসের নির্ধারিত ফি *৳ {amount}/-* এখনো বকেয়া রয়েছে।\n\n"
        f"মাদ্রাসার সুষ্ঠু শিক্ষা কার্যক্রম পরিচালনায় নির্ধারিত সময়ের মধ্যে বকেয়া পরিশোধের জন্য বিনীত অনুরোধ করা হলো।\n\n"
        f"বিকাশ/নগদ বা সরাসরি মাদ্রাসার ক্যাশে ফি জমা দিয়ে রশিদ সংগ্রহ করুন।\n"
        f"জাযাকাল্লাহু খাইরান।"
    )
    return send_whatsapp_message(
        phone=student.guardian_phone,
        message=message,
        title=title,
        notification_type='fee_reminder',
        student=student,
        recipient_name=student.guardian_name,
        sent_by=sent_by
    )

def build_due_reminder_message(student, due_months_text: str, total_due: float, monthly_due: float = 0, hostel_due: float = 0, custom_note: str = "") -> str:
    msg = (
        f"আস-সালামু আলাইকুম ওয়ারাহমাতুল্লাহ!\n\n"
        f"*আল-মদিনা মডেল মাদ্রাসা এন্ড রিসার্চ ইনস্টিটিউট*\n"
        f"ক-৭৫/২, মহাখালী দক্ষিণপাড়া, বনানী, ঢাকা | হেল্পলাইন: ০১৭১২-৬৩৩২৬৪, ০১৭২২-১৫৭৪৬৪\n\n"
        f"সম্মানিত অভিভাবক,\n"
        f"আপনার সন্তান *{student.name_bn or student.name}* (রোল: {student.roll_number or '—'}, আইডি: {student.student_id}) এর মাদ্রাসার মাসিক বকেয়া ফি বিবরণী:\n\n"
        f"📌 *বকেয়া মাসসমূহ:* {due_months_text}\n"
        f"💰 *মাসিক বেতন বকেয়া:* ৳ {monthly_due:,.2f}\n"
    )
    if hostel_due > 0:
        msg += f"🏠 *হোস্টেল/মেস বকেয়া:* ৳ {hostel_due:,.2f}\n"
    msg += f"🔴 *সর্বমোট বকেয়া:* ৳ {total_due:,.2f}\n\n"
    if custom_note:
        msg += f"📢 *বিশেষ নোটিশ:* {custom_note}\n\n"
    msg += (
        f"মাদ্রাসার সুষ্ঠু দ্বীনি শিক্ষা ও পরিচালনার স্বার্থে বকেয়া ফি পরিশোধের বিনীত অনুরোধ রইল।\n\n"
        f"💳 *বিকাশ / নগদ পেমেন্ট:* ০১৭১২-৬৩৩২৬৪ (পার্সোনাল/মার্চেন্ট)\n"
        f"অথবা সরাসরি মাদ্রাসার হিসাব শাখায় জমা দিয়ে রসিদ সংগ্রহ করুন।\n\n"
        f"জাযাকাল্লাহু খাইরান।"
    )
    return msg

def send_comprehensive_fee_reminder(student, due_months_text: str, total_due: float, monthly_due: float = 0, hostel_due: float = 0, custom_note: str = "", sent_by=None):
    title = f"বকেয়া ফি নোটিশ - {student.name_bn or student.name}"
    message = build_due_reminder_message(student, due_months_text, total_due, monthly_due, hostel_due, custom_note)
    link = generate_whatsapp_web_link(student.guardian_phone, message)
    is_success = send_whatsapp_message(
        phone=student.guardian_phone,
        message=message,
        title=title,
        notification_type='fee_reminder',
        student=student,
        recipient_name=student.guardian_name,
        sent_by=sent_by
    )
    return is_success, message, link

def send_result_notification(student, exam_name: str, gpa: float, grade: str = "A+", sent_by=None):
    title = f"পরীক্ষার ফলাফল ও রেজাল্ট - {student.name_bn or student.name}"
    message = (
        f"আস-সালামু আলাইকুম!\n\n"
        f"*আল-মদিনা মডেল মাদ্রাসা এন্ড রিসার্চ ইনস্টিটিউট*\n"
        f"ক-৭৫/২, মহাখালী দক্ষিণপাড়া, বনানী, ঢাকা | ০১৭১২-৬৩৩২৬৪\n\n"
        f"আনন্দের সাথে জানানো যাচ্ছে যে, *{exam_name}*-এ আপনার সন্তান *{student.name_bn or student.name}* (ID: {student.student_id}) কৃতিত্বের সাথে উত্তীর্ণ হয়েছে।\n\n"
        f"🌟 *প্রাপ্ত GPA:* {gpa:.2f}\n"
        f"🏅 *লেটার গ্রেড:* {grade}\n\n"
        f"মাদ্রাসার অনলাইন পোর্টালে লগইন করে সিল-স্বাক্ষরসহ পূর্ণাঙ্গ মার্কশিট দেখুন ও ডাউনলোড করুন:\n"
        f"http://localhost:3000/login\n\n"
        f"জাযাকাল্লাহু খাইরান।"
    )
    return send_whatsapp_message(
        phone=student.guardian_phone,
        message=message,
        title=title,
        notification_type='result',
        student=student,
        recipient_name=student.guardian_name,
        sent_by=sent_by
    )

def send_absent_notification(student, date_str: str, sent_by=None):
    title = f"অনুপস্থিতি নোটিশ - {student.name_bn or student.name}"
    message = (
        f"আস-সালামু আলাইকুম!\n\n"
        f"*আল-মদিনা মডেল মাদ্রাসা এন্ড রিসার্চ ইনস্টিটিউট*\n"
        f"ক-৭৫/২, মহাখালী দক্ষিণপাড়া, বনানী, ঢাকা\n\n"
        f"সম্মানিত অভিভাবক, আজ *{date_str}* তারিখে আপনার সন্তান *{student.name_bn or student.name}* (ID: {student.student_id}) মাদ্রাসায় অনুপস্থিত ছিলেন।\n\n"
        f"কোনো জরুরি কারণ বা অসুস্থতা থাকলে অনুগ্রহ করে মাদ্রাসা অফিসে অবহিত করুন।\n"
        f"হেল্পলাইন: ০১৭১২-৬৩৩২৬৪\n\n"
        f"জাযাকাল্লাহু খাইরান।"
    )
    return send_whatsapp_message(
        phone=student.guardian_phone,
        message=message,
        title=title,
        notification_type='attendance',
        student=student,
        recipient_name=student.guardian_name,
        sent_by=sent_by
    )

def send_notice_broadcast(phones: list, title: str, body: str, sent_by=None):
    message = (
        f"আস-সালামু আলাইকুম!\n\n"
        f"*আল-মদিনা মডেল মাদ্রাসা এন্ড রিসার্চ ইনস্টিটিউট*\n"
        f"📢 *বিজ্ঞপ্তি: {title}*\n"
        f"────────────────────────\n"
        f"{body}\n"
        f"────────────────────────\n"
        f"ঠিকানা: ক-৭৫/২, মহাখালী দক্ষিণপাড়া, বনানী, ঢাকা\n"
        f"মোবাইল: ০১৭১২-৬৩৩২৬৪\n\n"
        f"জাযাকাল্লাহু খাইরান।"
    )
    success_count = 0
    for phone in phones:
        if send_whatsapp_message(phone, message, title=f"নোটিশ: {title}", notification_type='notice', sent_by=sent_by):
            success_count += 1
    return success_count

def send_teacher_credentials(teacher, password: str, sent_by=None):
    title = f"শিক্ষক একাউন্ট তথ্য - {teacher.name_bn or teacher.name}"
    message = (
        f"আস-সালামু আলাইকুম!\n\n"
        f"*আল-মদিনা মডেল মাদ্রাসা এন্ড রিসার্চ ইনস্টিটিউট*\n"
        f"সম্মানিত উস্তাদ *{teacher.name_bn or teacher.name}*,\n"
        f"আপনার শিক্ষক পোর্টাল একাউন্ট প্রস্তুত করা হয়েছে।\n\n"
        f"👤 *Teacher ID:* {teacher.teacher_id}\n"
        f"🔑 *Password:* {password}\n"
        f"📱 *Phone:* {teacher.phone}\n\n"
        f"লগইন পোর্টাল লিংক:\n"
        f"http://localhost:3000/login\n\n"
        f"জাযাকাল্লাহু খাইরান।"
    )
    return send_whatsapp_message(
        phone=teacher.phone,
        message=message,
        title=title,
        notification_type='custom',
        sent_by=sent_by
    )

def send_leave_application_notification(leave, sent_by=None):
    student = leave.student
    title = f"ছুটির আবেদন গৃহীত - {leave.leave_no}"
    message = (
        f"আস-সালামু আলাইকুম!\n\n"
        f"*আল-মদিনা মডেল মাদ্রাসা এন্ড রিসার্চ ইনস্টিটিউট*\n"
        f"ক-৭৫/২, মহাখালী দক্ষিণপাড়া, বনানী, ঢাকা | ০১৭১২-৬৩৩২৬৪\n\n"
        f"সম্মানিত অভিভাবক, আপনার সন্তান *{student.name_bn or student.name}* (আইডি: {student.student_id}) এর ছুটির আবেদন সফলভাবে জমা হয়েছে।\n\n"
        f"🔖 *আবেদন ট্র্যাকিং নং:* {leave.leave_no}\n"
        f"📅 *ছুটির মেয়াদ:* {leave.from_date} হতে {leave.to_date} ({leave.total_days} দিন)\n"
        f"📌 *ছুটির ধরন:* {leave.get_leave_type_display()}\n"
        f"📝 *কারণ:* {leave.reason}\n\n"
        f"মাদ্রাসার শিক্ষক/কর্তৃপক্ষের অনুমোদনের পর ডিজিটাল গেটপাস ইস্যু করা হবে এবং আপনাকে জানিয়ে দেওয়া হবে।\n\n"
        f"জাযাকাল্লাহু খাইরান।"
    )
    send_whatsapp_message(
        phone=leave.guardian_phone,
        message=message,
        title=title,
        notification_type='custom',
        student=student,
        recipient_name=leave.applied_by_guardian,
        sent_by=sent_by
    )
    return generate_whatsapp_web_link(leave.guardian_phone, message)

def send_leave_approval_gatepass(leave, sent_by=None):
    student = leave.student
    title = f"ছুটি অনুমোদিত ও ডিজিটাল গেটপাস - {leave.gate_pass_no}"
    gatepass_url = f"http://localhost:3000/students/leaves/{leave.id}/gatepass"
    message = (
        f"আস-সালামু আলাইকুম!\n\n"
        f"*আল-মদিনা মডেল মাদ্রাসা এন্ড রিসার্চ ইনস্টিটিউট*\n"
        f"ক-৭৫/২, মহাখালী দক্ষিণপাড়া, বনানী, ঢাকা | ০১৭১২-৬৩৩২৬৪\n\n"
        f"সম্মানিত অভিভাবক, আপনার সন্তান *{student.name_bn or student.name}* এর ছুটির আবেদন *অনুমোদিত* হয়েছে এবং ডিজিটাল গেটপাস ইস্যু করা হয়েছে।\n\n"
        f"🎫 *গেটপাস নং:* {leave.gate_pass_no}\n"
        f"📅 *ছুটির তারিখ:* {leave.from_date} হতে {leave.to_date} ({leave.total_days} দিন)\n"
        f"🕒 *প্রস্থানের সময়:* {leave.departure_time or 'অনুমোদিত সময়সূচি অনুযায়ী'}\n"
        f"⏰ *মাদ্রাসায় ফিরে আসার শেষ সময়:* {leave.expected_return_time or 'নির্ধারিত তারিখের সকাল'}\n"
        f"💬 *শিক্ষকের মন্তব্য:* {leave.review_comment or 'অনুমোদিত'}\n\n"
        f"অনলাইন গেটপাস দেখতে ও ডাউনলোড করতে নিচের লিংকে ক্লিক করুন:\n"
        f"{gatepass_url}\n\n"
        f"⚠️ দ্রষ্টব্য: দারোয়ান বা সিকিউরিটি ইন-চার্জকে এই গেটপাস প্রদর্শন করে ক্যাম্পাস ত্যাগ ও প্রবেশ করতে হবে।\n\n"
        f"জাযাকাল্লাহু খাইরান।"
    )
    send_whatsapp_message(
        phone=leave.guardian_phone,
        message=message,
        title=title,
        notification_type='custom',
        student=student,
        recipient_name=leave.applied_by_guardian,
        sent_by=sent_by
    )
    return generate_whatsapp_web_link(leave.guardian_phone, message)

