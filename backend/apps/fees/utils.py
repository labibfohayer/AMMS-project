import datetime
from .models import FeePayment
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
import io

BANGLA_MONTHS = {
    1: 'জানুয়ারি', 2: 'ফেব্রুয়ারি', 3: 'মার্চ', 4: 'এপ্রিল',
    5: 'মে', 6: 'জুন', 7: 'জুলাই', 8: 'আগস্ট',
    9: 'সেপ্টেম্বর', 10: 'অক্টোবর', 11: 'নভেম্বর', 12: 'ডিসেম্বর'
}

def generate_receipt_number():
    year = datetime.date.today().year
    last_payment = FeePayment.objects.filter(receipt_number__startswith=f"RCP-{year}-").order_by('-receipt_number').first()
    if last_payment:
        try:
            last_seq = int(last_payment.receipt_number.split('-')[-1])
            seq = last_seq + 1
        except ValueError:
            seq = 1
    else:
        seq = 1
    return f"RCP-{year}-{seq:04d}"

def generate_voucher_number():
    year = datetime.date.today().year
    from .models import Expense
    last_exp = Expense.objects.filter(voucher_number__startswith=f"VCH-{year}-").order_by('-id').first()
    if last_exp:
        try:
            last_seq = int(last_exp.voucher_number.split('-')[-1])
            seq = last_seq + 1
        except Exception:
            seq = Expense.objects.filter(voucher_number__startswith=f"VCH-{year}-").count() + 1
    else:
        seq = 1
    return f"VCH-{year}-{seq:04d}"

def generate_receipt_pdf(payment):
    buffer = io.BytesIO()
    p = canvas.Canvas(buffer, pagesize=A4)
    p.drawString(100, 800, "Al Madina Model Madrasah")
    p.drawString(100, 780, f"Receipt Number: {payment.receipt_number}")
    p.drawString(100, 760, f"Student: {payment.student.name if hasattr(payment, 'student') and payment.student else 'N/A'}")
    p.drawString(100, 740, f"Amount Paid: {payment.amount_paid}")
    p.showPage()
    p.save()
    buffer.seek(0)
    return buffer.getvalue()
