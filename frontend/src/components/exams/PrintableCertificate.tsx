/* eslint-disable */
'use client';

import React from 'react';
import { X, Printer, Award, Sparkles, CheckCircle2 } from 'lucide-react';
import { toBanglaDigit } from '@/lib/numberToBanglaWords';

export interface CertificateStudentData {
  student_pk?: number;
  student_id: string;
  name: string;
  name_bn?: string;
  roll_number?: number | string;
  department_name?: string;
  total_marks: number;
  gpa: number;
  grade: string;
  rank: number;
}

export interface CertificateData {
  exam: {
    id: number | string;
    name: string;
    name_bn?: string;
    academic_year?: number;
    term?: string;
    start_date?: string;
    end_date?: string;
  };
  students: CertificateStudentData[];
  title?: string;
}

interface PrintableCertificateProps {
  data: CertificateData;
  onClose: () => void;
}

export default function PrintableCertificate({ data, onClose }: PrintableCertificateProps) {
  const { exam, students } = data;

  const handlePrint = () => {
    window.print();
  };

  const getRankBangla = (rank: number) => {
    switch (rank) {
      case 1:
        return '১ম স্থান (Champion)';
      case 2:
        return '২য় স্থান (Runner-up)';
      case 3:
        return '৩য় স্থান (3rd Position)';
      default:
        return `মেধা তালিকায় ${toBanglaDigit(rank)} তম স্থান`;
    }
  };

  const getRankBadgeColors = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-slate-950 border-amber-600 shadow-amber-900/20';
      case 2:
        return 'bg-gradient-to-r from-slate-200 via-slate-100 to-slate-300 text-slate-900 border-slate-400 shadow-slate-900/20';
      case 3:
        return 'bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800 text-white border-amber-900 shadow-amber-950/20';
      default:
        return 'bg-emerald-800 text-white border-emerald-950';
    }
  };

  const todayBangla = new Intl.DateTimeFormat('bn-BD', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date());

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm overflow-y-auto flex flex-col items-center justify-start py-6 px-3 sm:px-6">
      
      {/* Top Floating Control Bar (Hidden on print) */}
      <div className="w-full max-w-5xl bg-emerald-950 text-white rounded-2xl p-4 mb-6 shadow-2xl border border-emerald-500/30 flex items-center justify-between gap-4 sticky top-4 z-50 print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400 text-emerald-950 flex items-center justify-center font-bold shadow-md">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-white">
              আনুষ্ঠানিক মেধা সনদ ও প্রশংসাপত্র প্রিভিউ ({toBanglaDigit(students.length)} টি সনদ)
            </h3>
            <p className="text-xs text-emerald-300">
              {exam.name_bn || exam.name} • শিক্ষাবর্ষ: {toBanglaDigit(exam.academic_year || 2026)} • A4 Landscape প্রিন্ট সাইজ
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-emerald-950 font-black text-xs sm:text-sm shadow-lg transition-transform active:scale-95"
          >
            <Printer className="w-4 h-4 text-emerald-950" />
            <span>প্রিন্ট করুন (Print A4)</span>
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

      {/* Printable Certificates Container */}
      <div className="w-full max-w-5xl space-y-8 print:space-y-0 print:w-full print:max-w-none">
        {students.map((student, idx) => (
          <div 
            key={student.student_id || idx}
            className="certificate-page relative bg-[#fffdf7] text-slate-900 border-[10px] border-double border-amber-600 rounded-3xl p-6 sm:p-10 shadow-2xl print:shadow-none print:rounded-none print:m-0 print:border-[10px] print:border-double print:border-amber-700 overflow-hidden"
            style={{
              breakAfter: 'page',
              pageBreakAfter: 'always',
              minHeight: '200mm'
            }}
          >
            {/* Corner Filigree / Ornamental Motifs */}
            <div className="absolute top-2 left-2 text-amber-600/70 text-2xl select-none pointer-events-none font-serif">۞</div>
            <div className="absolute top-2 right-2 text-amber-600/70 text-2xl select-none pointer-events-none font-serif">۞</div>
            <div className="absolute bottom-2 left-2 text-amber-600/70 text-2xl select-none pointer-events-none font-serif">۞</div>
            <div className="absolute bottom-2 right-2 text-amber-600/70 text-2xl select-none pointer-events-none font-serif">۞</div>

            {/* Inner Thin Border */}
            <div className="absolute inset-3 sm:inset-4 border border-emerald-900/30 rounded-2xl pointer-events-none" />

            {/* Faint Center Watermark Logo */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.045] pointer-events-none">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.jpg" alt="Watermark" className="w-[420px] h-[420px] object-contain rounded-full" />
            </div>

            {/* Top Bismillah in Arabic Calligraphy */}
            <div className="text-center mb-3 relative z-10">
              <span className="font-serif text-base sm:text-lg text-emerald-950 font-bold tracking-widest drop-shadow-sm">
                بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ
              </span>
            </div>

            {/* Header: Logo, Institution Name, Address, & Crest Image */}
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-amber-600/40 relative z-10">
              {/* Left: Official Madrasah Logo */}
              <div className="flex items-center gap-3.5">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full p-1 bg-gradient-to-tr from-amber-500 to-emerald-700 shadow-md shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/logo.jpg" alt="Madrasah Logo" className="w-full h-full object-cover rounded-full bg-white" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-emerald-950 leading-tight">
                    আল-মদিনা মডেল মাদ্রাসা এন্ড রিসার্চ ইনস্টিটিউট
                  </h1>
                  <p className="text-xs sm:text-sm font-extrabold text-amber-800 tracking-wider uppercase font-sans">
                    Al Madina Model Madrasa and Research Institute
                  </p>
                  <p className="text-[11px] sm:text-xs text-gray-700 font-medium mt-0.5">
                    ক-৭৫/২, মহাখালী দক্ষিণপাড়া, বনানী, ঢাকা-১২১২ • মোবাইল: ০১৭১২-৬৩৩২৬৪
                  </p>
                  <p className="text-[10px] text-emerald-800 font-semibold mt-0.5">
                    দ্বীনি নৈতিকতা ও আধুনিক জ্ঞানের এক অপূর্ব সমন্বয়ে পরিচালিত মডেল শিক্ষাপ্রতিষ্ঠান
                  </p>
                </div>
              </div>

              {/* Right: Awards Crest Badge */}
              <div className="hidden sm:flex flex-col items-center shrink-0">
                <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-amber-500 shadow-md bg-white p-0.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/awards-crests.png" alt="Merit Crest" className="w-full h-full object-contain" />
                </div>
                <span className="text-[10px] text-amber-900 font-black mt-1 uppercase tracking-tight">
                  মেধা সম্মাননা স্মারক
                </span>
              </div>
            </div>

            {/* Certificate Title Ribbon */}
            <div className="text-center my-5 relative z-10">
              <div className="inline-block relative">
                <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 text-white px-8 sm:px-14 py-2 rounded-full border-2 border-amber-400 shadow-lg">
                  <div className="flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span className="text-base sm:text-xl font-black tracking-wide font-serif">
                      মেধা ও কৃতিত্ব প্রশংসাপত্র
                    </span>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                  </div>
                  <span className="text-[10px] sm:text-xs text-amber-300 font-bold tracking-widest uppercase block mt-0.5">
                    CERTIFICATE OF ACADEMIC MERIT & EXCELLENCE
                  </span>
                </div>
              </div>
            </div>

            {/* Student Citation Body */}
            <div className="relative z-10 space-y-4 text-center px-4 sm:px-8">
              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                এই মর্মে অত্যন্ত আনন্দের সাথে প্রত্যয়ন ও প্রশংসাপত্র প্রদান করা যাচ্ছে যে,
              </p>

              {/* Student Name */}
              <div className="py-1">
                <span className="inline-block text-2xl sm:text-4xl font-black text-emerald-950 font-serif border-b-2 border-amber-500 pb-1 px-6 tracking-wide">
                  {student.name_bn || student.name}
                </span>
                {student.name && student.name_bn && (
                  <span className="block text-xs sm:text-sm font-semibold text-gray-600 mt-1 font-sans">
                    ({student.name})
                  </span>
                )}
              </div>

              {/* Student Details Grid */}
              <div className="flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm font-semibold text-gray-800">
                <div className="px-3.5 py-1 rounded-xl bg-amber-50 border border-amber-200">
                  বিভাগ / শ্রেণি: <span className="font-bold text-emerald-950">{student.department_name || 'জেনারেল ও হিফজ বিভাগ'}</span>
                </div>
                <div className="px-3.5 py-1 rounded-xl bg-amber-50 border border-amber-200">
                  রোল নং: <span className="font-bold text-emerald-950 font-mono">{student.roll_number ? toBanglaDigit(student.roll_number) : '—'}</span>
                </div>
                <div className="px-3.5 py-1 rounded-xl bg-amber-50 border border-amber-200">
                  শিক্ষার্থী আইডি: <span className="font-bold text-emerald-950 font-mono">{student.student_id}</span>
                </div>
              </div>

              {/* Achievement Narrative */}
              <p className="text-xs sm:text-sm text-gray-800 leading-relaxed max-w-3xl mx-auto">
                অত্র মাদ্রাসার <strong className="text-emerald-950 font-bold">{exam.name_bn || exam.name} ({toBanglaDigit(exam.academic_year || 2026)})</strong>-এ 
                অংশগ্রহণ করে অনন্য মেধা ও কৃতিত্বপূর্ণ ফলাফলের স্বাক্ষর রেখে মেধা তালিকায়
              </p>

              {/* Big Merit Position Badge */}
              <div className="my-2">
                <div className={`inline-flex items-center gap-2.5 px-6 py-2 rounded-2xl border-2 text-base sm:text-xl font-black shadow-md ${getRankBadgeColors(student.rank)}`}>
                  <Award className="w-5 h-5 text-amber-300" />
                  <span>{getRankBangla(student.rank)}</span>
                  <Award className="w-5 h-5 text-amber-300" />
                </div>
              </div>

              {/* Performance Metrics: Total Marks, GPA, Grade */}
              <div className="flex items-center justify-center gap-6 text-xs sm:text-sm pt-1">
                <div className="flex items-center gap-1.5 text-gray-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>মোট প্রাপ্ত নম্বর:</span>
                  <strong className="text-emerald-950 font-mono text-base font-black">
                    {toBanglaDigit(student.total_marks)}
                  </strong>
                </div>

                <div className="flex items-center gap-1.5 text-gray-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>প্রাপ্ত জিপিএ:</span>
                  <strong className="text-emerald-950 font-mono text-base font-black">
                    {student.gpa?.toFixed(2)}
                  </strong>
                </div>

                <div className="flex items-center gap-1.5 text-gray-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>লেটার গ্রেড:</span>
                  <strong className="text-amber-800 font-mono text-base font-black">
                    {student.grade || 'A+'}
                  </strong>
                </div>
              </div>

              {/* Formal Blessing & Commendation Text */}
              <p className="text-[11px] sm:text-xs text-gray-600 leading-relaxed max-w-3xl mx-auto italic font-serif pt-1">
                দ্বীনি নৈতিকতা ও আধুনিক সাধারণ শিক্ষার সুন্দর সমন্বয় সাধনে তার নিষ্ঠা ও পরিশ্রমের স্বীকৃতিস্বরূপ এই সনদপত্র প্রদান করা হলো। আমরা তার সুস্বাস্থ্য, দীর্ঘায়ু ও ইলমি জীবনের উত্তরোত্তর উন্নতি এবং উভয় জাহানের সফলতা কামনা করি।
              </p>
            </div>

            {/* Date, Memo & Official Signatures Footer */}
            <div className="relative z-10 mt-8 pt-6 border-t border-amber-600/30 flex flex-col sm:flex-row items-center sm:items-end justify-between gap-6 text-xs text-gray-800">
              
              {/* Issue Date & Memo No */}
              <div className="text-center sm:text-left space-y-1">
                <p className="text-[11px] text-gray-700">
                  <strong>সনদ নং:</strong> <span className="font-mono text-emerald-950 font-bold">AMMS/MERIT/{exam.academic_year || 2026}/{student.student_id}</span>
                </p>
                <p className="text-[11px] text-gray-700">
                  <strong>ইস্যুর তারিখ:</strong> {todayBangla}
                </p>
              </div>

              {/* Signature 1: Class Teacher */}
              <div className="text-center">
                <div className="w-36 border-b border-gray-400 mb-1 mx-auto" />
                <p className="font-bold text-gray-900">শ্রেণি শিক্ষক / পরীক্ষক</p>
                <p className="text-[10px] text-gray-500">স্বাক্ষর ও সিল</p>
              </div>

              {/* Signature 2: Controller of Examinations */}
              <div className="text-center">
                <div className="w-36 border-b border-gray-400 mb-1 mx-auto" />
                <p className="font-bold text-gray-900">পরীক্ষা নিয়ন্ত্রক</p>
                <p className="text-[10px] text-gray-500">মেধা মূল্যায়ন কমিটি</p>
              </div>

              {/* Signature 3: Principal & Madrasah Seal */}
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
        ))}
      </div>

      {/* PRINT CSS FOR CERTIFICATE */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 6mm 6mm;
          }
          body {
            background-color: white !important;
            color: black !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .certificate-page {
            border: 8px double #d97706 !important;
            background-color: #fffdf7 !important;
            page-break-after: always !important;
            break-after: page !important;
            box-shadow: none !important;
            margin: 0 !important;
            padding: 8mm !important;
            min-height: 195mm !important;
          }
        }
      `}</style>
    </div>
  );
}
