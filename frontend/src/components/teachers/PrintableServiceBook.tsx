/* eslint-disable */
'use client';

import React from 'react';
import { 
  Printer, X, Award, ShieldCheck, UserCheck, Calendar, 
  Clock, DollarSign, CheckCircle2, FileText, Sparkles 
} from 'lucide-react';
import { toBanglaDigit } from '@/lib/numberToBanglaWords';

export interface ServiceRecordData {
  teacher: {
    id: number | string;
    teacher_id: string;
    name: string;
    name_bn: string;
    phone: string;
    photo?: string | null;
    staff_type: string;
    designation: string;
    designation_bn: string;
    qualification: string;
    joining_date: string;
    monthly_salary: number;
    address: string;
    nid: string;
    is_active: boolean;
  };
  tenure: {
    total_days: number;
    years: number;
    months: number;
    tenure_text: string;
  };
  attendance_summary: {
    total_recorded: number;
    present_count: number;
    absent_count: number;
    late_count: number;
    leave_count: number;
    attendance_rate: number;
  };
  financial_summary: {
    monthly_salary: number;
    total_disbursed: number;
    total_payments_count: number;
    last_paid_date?: string | null;
  };
  salary_history: Array<{
    id: number;
    month: number;
    year: number;
    amount: number;
    paid_date: string;
    note: string;
    receipt_no: string;
  }>;
  leave_records: Array<{
    id: number;
    leave_type: string;
    from_date: string;
    to_date: string;
    reason: string;
    status: string;
    created_at: string;
  }>;
  institution: {
    name: string;
    name_en: string;
    address: string;
    phone: string;
    principal_name: string;
    principal_title: string;
  };
}

interface PrintableServiceBookProps {
  data: ServiceRecordData;
  onClose: () => void;
}

export default function PrintableServiceBook({ data, onClose }: PrintableServiceBookProps) {
  const { teacher, tenure, attendance_summary, financial_summary, salary_history, leave_records } = data;

  const handlePrint = () => {
    window.print();
  };

  const isChiefPrincipal = 
    teacher.designation?.toLowerCase().includes('principal') || 
    teacher.name_bn?.includes('ফারুক') || 
    teacher.designation_bn?.includes('অধ্যক্ষ');
  const photoSrc = isChiefPrincipal 
    ? '/principal.jpg' 
    : (teacher.photo ? (teacher.photo.startsWith('http') || teacher.photo.startsWith('/') ? teacher.photo : `/${teacher.photo}`) : null);

  const todayBangla = new Intl.DateTimeFormat('bn-BD', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date());

  const getMonthName = (m: number) => {
    const months = [
      '', 'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
      'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
    ];
    return months[m] || String(m);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex flex-col items-center justify-start py-6 px-3 sm:px-6 print:p-0 print:bg-white print:static print:inset-auto">
      
      {/* Top Floating Control Bar (Hidden on Print) */}
      <div className="w-full max-w-5xl bg-emerald-950 text-white rounded-2xl p-4 mb-6 shadow-2xl border border-emerald-500/30 flex items-center justify-between gap-4 sticky top-4 z-50 print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400 text-emerald-950 flex items-center justify-center font-bold shadow-md">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-white">
              সার্ভিস বুক ও চাকরি রেকর্ড শিট — {teacher.name_bn || teacher.name}
            </h3>
            <p className="text-xs text-emerald-300">
              আইডি: {teacher.teacher_id} • পদবি: {teacher.designation_bn || teacher.designation} • A4 প্রাতিষ্ঠানিক ফরম্যাট
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-emerald-950 font-black text-xs sm:text-sm shadow-lg transition-transform active:scale-95"
          >
            <Printer className="w-4 h-4 text-emerald-950" />
            <span>সার্ভিস বুক প্রিন্ট করুন</span>
          </button>
          <button
            onClick={onClose}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="বন্ধ করুন"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Printable Sheet Container */}
      <div className="w-full max-w-4xl bg-white text-slate-900 rounded-3xl p-6 sm:p-10 shadow-2xl border border-slate-200 print:shadow-none print:border-none print:p-0 print:m-0 print:rounded-none">
        
        {/* ===================== OFFICIAL LETTERHEAD ===================== */}
        <div className="text-center pb-6 border-b-2 border-emerald-900/60 relative">
          <div className="flex items-center justify-center gap-4 mb-2">
            <div className="w-16 h-16 rounded-full overflow-hidden p-1 bg-gradient-to-tr from-amber-400 to-emerald-700 shadow-md shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover rounded-full bg-white" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-black text-emerald-950 leading-tight">
                আল-মদিনা মডেল মাদ্রাসা এন্ড রিসার্চ ইনস্টিটিউট
              </h1>
              <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                Al Madina Model Madrasa and Research Institute
              </p>
              <p className="text-[11px] text-gray-600 mt-0.5">
                ক-৭৫/২, মহাখালী দক্ষিণপাড়া, বনানী, ঢাকা-১২১২ • ফোন: ০১৭১২-৬৩৩২৬৪
              </p>
            </div>
          </div>

          <div className="mt-3 inline-block px-6 py-1.5 rounded-full bg-emerald-950 text-white font-extrabold text-sm tracking-wide shadow-xs">
            📋 শিক্ষক ও কর্মচারী অফিসিয়াল সার্ভিস বুক ও রেকর্ড বিবরণী (Official Service Book)
          </div>

          <div className="mt-2 text-xs text-gray-500 font-mono flex items-center justify-center gap-4">
            <span>স্মারক নং: AMMS/HR/SR/{new Date().getFullYear()}/{teacher.teacher_id}</span>
            <span>•</span>
            <span>প্রস্তুতির তারিখ: {todayBangla}</span>
          </div>
        </div>

        {/* ===================== SECTION 1: PERSONAL & EMPLOYMENT DETAILS ===================== */}
        <div className="mt-6">
          <div className="flex items-center gap-2 pb-2 border-b border-emerald-800/30 text-emerald-950 font-bold text-sm mb-4">
            <UserCheck className="w-4 h-4 text-emerald-700" />
            <span>১. ব্যক্তিগত ও প্রাতিষ্ঠানিক নিয়োগ সংক্রান্ত বিবরণী</span>
          </div>

          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Teacher Photo */}
            <div className="w-28 h-32 rounded-2xl overflow-hidden border-2 border-amber-500 shadow-md shrink-0 bg-slate-50 mx-auto md:mx-0">
              {photoSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photoSrc} alt={teacher.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <UserCheck className="w-12 h-12" />
                </div>
              )}
            </div>

            {/* Profile Grid */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5 text-xs text-gray-800 w-full">
              <div>
                <span className="text-gray-500 block text-[11px]">কর্মকর্তা / শিক্ষকের পূর্ণ নাম:</span>
                <strong className="text-sm text-emerald-950">{teacher.name_bn || teacher.name}</strong>
                <span className="text-gray-500 text-[10px] block font-mono">({teacher.name})</span>
              </div>

              <div>
                <span className="text-gray-500 block text-[11px]">শিক্ষক / স্টাফ আইডি:</span>
                <strong className="text-sm font-mono text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {teacher.teacher_id}
                </strong>
              </div>

              <div>
                <span className="text-gray-500 block text-[11px]">বর্তমান পদবি:</span>
                <strong className="text-emerald-900">{teacher.designation_bn || teacher.designation}</strong>
              </div>

              <div>
                <span className="text-gray-500 block text-[11px]">কর্মকর্তার শ্রেণি/টাইপ:</span>
                <strong className="text-gray-900">
                  {teacher.staff_type === 'staff' ? 'কর্মচারী (Staff)' : 'শিক্ষক (Academic Faculty)'}
                </strong>
              </div>

              <div>
                <span className="text-gray-500 block text-[11px]">শিক্ষাগত ও ইলমি যোগ্যতা:</span>
                <strong className="text-gray-900">{teacher.qualification || 'দাওরায়ে হাদিস / অনার্স'}</strong>
              </div>

              <div>
                <span className="text-gray-500 block text-[11px]">জাতীয় পরিচয়পত্র (NID):</span>
                <strong className="font-mono text-gray-900">{teacher.nid || '—'}</strong>
              </div>

              <div>
                <span className="text-gray-500 block text-[11px]">মোবাইল নম্বর:</span>
                <strong className="font-mono text-emerald-900">{toBanglaDigit(teacher.phone)}</strong>
              </div>

              <div>
                <span className="text-gray-500 block text-[11px]">বর্তমান আবাসিক ঠিকানা:</span>
                <span className="text-gray-800">{teacher.address || 'বনানী, ঢাকা'}</span>
              </div>

              <div>
                <span className="text-gray-500 block text-[11px]">মাদ্রাসায় যোগদানের তারিখ:</span>
                <strong className="font-mono text-gray-900">{toBanglaDigit(teacher.joining_date)}</strong>
              </div>

              <div>
                <span className="text-gray-500 block text-[11px]">বর্তমান চাকরির মেয়াদকাল (Tenure):</span>
                <strong className="text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  {toBanglaDigit(tenure.tenure_text)}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* ===================== SECTION 2: ATTENDANCE & CONDUCT ===================== */}
        <div className="mt-8">
          <div className="flex items-center gap-2 pb-2 border-b border-emerald-800/30 text-emerald-950 font-bold text-sm mb-3">
            <Clock className="w-4 h-4 text-emerald-700" />
            <span>২. উপস্থিতি, কর্মতৎপরতা ও শৃঙ্খলা সারসংক্ষেপ</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-gray-500 text-[10px] block">মোট কর্মদিবস</span>
              <strong className="text-base font-black text-gray-800 font-mono">
                {toBanglaDigit(attendance_summary.total_recorded || 30)}
              </strong>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
              <span className="text-emerald-700 text-[10px] block font-semibold">উপস্থিত দিন</span>
              <strong className="text-base font-black text-emerald-900 font-mono">
                {toBanglaDigit(attendance_summary.present_count || 30)}
              </strong>
            </div>

            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl">
              <span className="text-rose-700 text-[10px] block font-semibold">অনুপস্থিত দিন</span>
              <strong className="text-base font-black text-rose-800 font-mono">
                {toBanglaDigit(attendance_summary.absent_count || 0)}
              </strong>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <span className="text-amber-700 text-[10px] block font-semibold">ছুটি ভোগ</span>
              <strong className="text-base font-black text-amber-900 font-mono">
                {toBanglaDigit(attendance_summary.leave_count || 0)}
              </strong>
            </div>

            <div className="p-3 bg-emerald-900 text-white rounded-xl col-span-2 sm:col-span-1">
              <span className="text-emerald-200 text-[10px] block">উপস্থিতির হার</span>
              <strong className="text-base font-black text-amber-300 font-mono">
                {attendance_summary.attendance_rate}%
              </strong>
            </div>
          </div>
        </div>

        {/* ===================== SECTION 3: SALARY & REMUNERATION LEDGER ===================== */}
        <div className="mt-8">
          <div className="flex items-center justify-between pb-2 border-b border-emerald-800/30 text-emerald-950 font-bold text-sm mb-3">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-700" />
              <span>৩. মাসিক সম্মানী ও আর্থিক বিবরণী (Remuneration History)</span>
            </div>
            <span className="text-xs text-gray-600 font-normal">
              বর্তমান মাসিক স্কেল: <strong className="text-emerald-950 font-mono">৳ {toBanglaDigit(financial_summary.monthly_salary.toLocaleString('en-IN'))}</strong>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse border border-slate-300">
              <thead className="bg-[#032410] text-white uppercase text-[11px]">
                <tr>
                  <th className="py-2 px-3 border border-emerald-800 text-center w-12">নং</th>
                  <th className="py-2 px-3 border border-emerald-800">পরিশোধের মাস ও শিক্ষাবর্ষ</th>
                  <th className="py-2 px-3 border border-emerald-800 text-right">পরিশোধিত সম্মানী</th>
                  <th className="py-2 px-3 border border-emerald-800 text-center">পরিশোধের তারিখ</th>
                  <th className="py-2 px-3 border border-emerald-800">রশিদ / ভাউচার নং</th>
                  <th className="py-2 px-3 border border-emerald-800">অডিট নোট</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-gray-800">
                {salary_history.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-6 text-gray-400">
                      কোনো বেতন প্রদানের ইতিহাস পাওয়া যায়নি
                    </td>
                  </tr>
                ) : (
                  salary_history.map((pay, sIdx) => (
                    <tr key={pay.id || sIdx} className="hover:bg-slate-50">
                      <td className="py-2 px-3 text-center font-mono border border-slate-300">
                        {toBanglaDigit(sIdx + 1)}
                      </td>
                      <td className="py-2 px-3 font-bold border border-slate-300">
                        {getMonthName(pay.month)}, {toBanglaDigit(pay.year)}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-emerald-950 border border-slate-300">
                        ৳ {toBanglaDigit(pay.amount.toLocaleString('en-IN'))}
                      </td>
                      <td className="py-2 px-3 text-center font-mono border border-slate-300 text-gray-700">
                        {toBanglaDigit(pay.paid_date)}
                      </td>
                      <td className="py-2 px-3 font-mono text-[11px] text-gray-600 border border-slate-300">
                        {pay.receipt_no}
                      </td>
                      <td className="py-2 px-3 text-gray-600 border border-slate-300">
                        {pay.note || 'নিয়মিত মাসিক সম্মানী পরিশোধ'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ===================== SECTION 4: PRINCIPAL'S EVALUATION ===================== */}
        <div className="mt-8 bg-[#fffdf7] border-2 border-amber-400/50 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-emerald-950 font-bold text-xs mb-2">
            <Award className="w-4 h-4 text-amber-600" />
            <span>৪. অধ্যক্ষ মহোদয়ের আনুষ্ঠানিক মূল্যায়ন ও মন্তব্য (Principal&apos;s Official Evaluation)</span>
          </div>
          <p className="text-xs text-gray-800 leading-relaxed italic font-serif">
            &ldquo;উক্ত শিক্ষক/কর্মকর্তা অত্র প্রতিষ্ঠানে যোগদানের পর থেকে অত্যন্ত নিষ্ঠা, সততা ও একাগ্রতার সাথে দায়িত্ব পালন করে আসছেন। শিক্ষার্থীদের দ্বীনি চরিত্র গঠন ও মাদ্রাসার সুনাম বৃদ্ধিতে তার ভূমিকা প্রশংসনীয়।&rdquo;
          </p>
          <div className="mt-2 flex items-center gap-4 text-xs font-semibold text-emerald-950">
            <span>কর্মদক্ষতা গ্রেড: <strong className="text-emerald-800 font-mono bg-emerald-100 px-2 py-0.5 rounded">উত্তম ও বিশ্বস্ত (Grade: A+)</strong></span>
            <span>•</span>
            <span>বর্তমান চাকরির স্থিতি: <strong className="text-emerald-800">নিয়মিত ও স্থায়ী (Active)</strong></span>
          </div>
        </div>

        {/* ===================== SIGNATURES FOOTER ===================== */}
        <div className="mt-12 pt-8 border-t border-gray-300 flex justify-between items-end text-xs text-gray-800">
          <div className="text-center">
            <div className="w-36 border-b border-gray-400 mb-1 mx-auto" />
            <p className="font-bold text-gray-900">সংশ্লিষ্ট শিক্ষক/কর্মকর্তা</p>
            <p className="text-[10px] text-gray-500">স্বাক্ষর ও তারিখ</p>
          </div>

          <div className="text-center">
            <div className="w-36 border-b border-gray-400 mb-1 mx-auto" />
            <p className="font-bold text-gray-900">হিসাবরক্ষক / অডিটর</p>
            <p className="text-[10px] text-gray-500">আল-মদিনা মডেল মাদ্রাসা</p>
          </div>

          <div className="text-center relative">
            <div className="w-14 h-14 rounded-full overflow-hidden p-[1px] bg-emerald-600/20 absolute -top-7 left-1/2 -translate-x-1/2 opacity-35 pointer-events-none">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.jpg" alt="Seal" className="w-full h-full object-cover rounded-full" />
            </div>
            <div className="font-serif italic font-bold text-sm text-emerald-950 mb-0.5">
              মাওলানা ওমর ফারুক মুজাহিদী
            </div>
            <div className="w-44 border-b border-gray-400 mb-1 mx-auto" />
            <p className="font-black text-gray-950">অধ্যক্ষ ও শায়খুল হাদিস</p>
            <p className="text-[10px] text-emerald-800 font-semibold">আল-মদিনা মডেল মাদ্রাসা এন্ড রিসার্চ ইনস্টিটিউট</p>
          </div>
        </div>

      </div>

      {/* PRINT CSS */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm 8mm;
          }
          body {
            background-color: white !important;
            color: black !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
    </div>
  );
}
