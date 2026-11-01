/* eslint-disable */
'use client';

import React from 'react';
import { Printer, X, ShieldCheck, User, QrCode, Phone, MapPin, Droplets, Calendar, Award } from 'lucide-react';
import { toBanglaDigit } from '@/lib/numberToBanglaWords';

export interface TeacherIDCardData {
  id: number | string;
  teacher_id: string;
  name: string;
  name_bn?: string;
  photo?: string | null;
  phone: string;
  designation: string;
  designation_bn?: string;
  staff_type?: string;
  qualification?: string;
  joining_date?: string;
  monthly_salary?: number | string;
  address?: string;
  nid?: string;
  blood_group?: string;
}

interface PrintableTeacherIDCardProps {
  teachers: TeacherIDCardData[];
  title?: string;
  onClose?: () => void;
}

export default function PrintableTeacherIDCard({ teachers, title, onClose }: PrintableTeacherIDCardProps) {
  const handlePrint = () => {
    window.print();
  };

  // Barcode pattern SVG bars generator from teacher ID
  const generateBarcodeBars = (code: string) => {
    const bars: boolean[] = [];
    for (let i = 0; i < code.length; i++) {
      const charCode = code.charCodeAt(i);
      bars.push(true, false, charCode % 2 === 0, true, false, charCode % 3 === 0, true);
    }
    return bars;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex flex-col items-center justify-start py-6 px-3 sm:px-6 print:p-0 print:bg-white print:static print:inset-auto">
      
      {/* Top Floating Control Bar (Hidden on Print) */}
      <div className="w-full max-w-5xl bg-emerald-950 text-white rounded-2xl p-4 mb-6 shadow-2xl border border-emerald-500/30 flex items-center justify-between gap-4 sticky top-4 z-50 print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400 text-emerald-950 flex items-center justify-center font-bold shadow-md">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-white">
              {title || `শিক্ষক ও কর্মকর্তা ডিজিটাল আইডি কার্ড (${toBanglaDigit(teachers.length)} জন)`}
            </h3>
            <p className="text-xs text-emerald-300">
              আল-মদিনা মডেল মাদ্রাসা • স্ট্যান্ডার্ড পিভিসি বোথ-সাইড (Front & Back) প্রিন্ট
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-emerald-950 font-black text-xs sm:text-sm shadow-lg transition-transform active:scale-95"
          >
            <Printer className="w-4 h-4 text-emerald-950" />
            <span>আইডি কার্ড প্রিন্ট করুন</span>
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="বন্ধ করুন"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Cards Container */}
      <div className="w-full max-w-5xl space-y-10 print:space-y-6">
        {teachers.map((teacher, idx) => {
          const isChiefPrincipal = 
            teacher.designation?.toLowerCase().includes('principal') || 
            teacher.name_bn?.includes('ফারুক') || 
            teacher.designation_bn?.includes('অধ্যক্ষ');
          const photoSrc = isChiefPrincipal 
            ? '/principal.jpg' 
            : (teacher.photo ? (teacher.photo.startsWith('http') || teacher.photo.startsWith('/') ? teacher.photo : `/${teacher.photo}`) : null);

          const barcodeBars = generateBarcodeBars(teacher.teacher_id || 'TEA-2024-001');

          return (
            <div 
              key={teacher.teacher_id || idx}
              className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 print:border-none print:shadow-none print:p-0 print:m-0"
              style={{ breakAfter: 'page', pageBreakAfter: 'always' }}
            >
              {/* Header on screen */}
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-200 print:hidden">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-sm font-bold text-gray-800">
                    {teacher.name_bn || teacher.name} — {teacher.designation_bn || teacher.designation}
                  </span>
                  <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded text-gray-600 font-bold">
                    {teacher.teacher_id}
                  </span>
                </div>
                <span className="text-xs text-amber-700 font-bold bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
                  PVC সাইজ: 54mm × 86mm
                </span>
              </div>

              {/* Dual-sided Cards (Front & Back) */}
              <div className="flex flex-col md:flex-row items-center justify-center gap-8 print:gap-6 print:flex-row print:justify-center">
                
                {/* ═════════════════════ FRONT SIDE ═════════════════════ */}
                <div 
                  className="w-[320px] h-[500px] rounded-2xl overflow-hidden shadow-2xl border-2 border-emerald-600 relative flex flex-col justify-between bg-white text-slate-800 select-none print:shadow-none shrink-0"
                  style={{
                    background: 'linear-gradient(180deg, #ffffff 0%, #f7faf7 60%, #eef6f0 100%)'
                  }}
                >
                  {/* Top Madrasah Branding Header */}
                  <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-[#02200d] text-white p-3.5 text-center relative overflow-hidden border-b-2 border-amber-400">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-400/10 rounded-full blur-xl pointer-events-none" />
                    
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <div className="w-9 h-9 rounded-full bg-white p-[1px] shadow-sm shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover rounded-full" />
                      </div>
                      <div className="text-left">
                        <h4 className="font-black text-xs text-amber-300 leading-tight">
                          আল-মদিনা মডেল মাদ্রাসা
                        </h4>
                        <p className="text-[9px] text-emerald-100 leading-tight">
                          এন্ড রিসার্চ ইনস্টিটিউট • বনানী, ঢাকা
                        </p>
                      </div>
                    </div>

                    <div className="inline-block mt-1 px-3 py-0.5 bg-amber-400 text-emerald-950 rounded-full text-[9px] font-black uppercase tracking-wider">
                      {teacher.staff_type === 'staff' ? 'কর্মচারী পরিচয়পত্র' : 'শিক্ষক ও কর্মকর্তা পরিচয়পত্র'}
                    </div>
                  </div>

                  {/* Teacher Photo with Golden Ring */}
                  <div className="flex flex-col items-center pt-3 px-4">
                    <div className="relative group">
                      <div className="w-24 h-28 rounded-xl p-[2px] bg-gradient-to-tr from-amber-400 via-emerald-600 to-amber-500 shadow-md">
                        {photoSrc ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img 
                            src={photoSrc} 
                            alt={teacher.name} 
                            className="w-full h-full object-cover rounded-[10px] bg-white" 
                          />
                        ) : (
                          <div className="w-full h-full rounded-[10px] bg-emerald-50 text-emerald-800 flex items-center justify-center">
                            <User className="w-12 h-12" />
                          </div>
                        )}
                      </div>
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-emerald-900 text-amber-300 border border-amber-400/50 text-[9px] font-bold px-2 py-0.5 rounded-full shadow-xs whitespace-nowrap">
                        {teacher.teacher_id}
                      </div>
                    </div>

                    {/* Teacher Name & Designation */}
                    <div className="text-center mt-3">
                      <h3 className="font-black text-base text-emerald-950 leading-tight">
                        {teacher.name_bn || teacher.name}
                      </h3>
                      <p className="text-[10px] font-bold text-gray-500 uppercase mt-0.5">
                        {teacher.name}
                      </p>
                      <div className="mt-1 inline-block px-3 py-0.5 rounded-md bg-emerald-100 text-emerald-900 font-extrabold text-[11px]">
                        {teacher.designation_bn || teacher.designation}
                      </div>
                    </div>
                  </div>

                  {/* Metadata Grid */}
                  <div className="px-5 py-2 text-[10px] text-gray-700 space-y-1">
                    <div className="flex items-center justify-between border-b border-gray-200/70 pb-1">
                      <span className="text-gray-500 font-medium">শিক্ষাগত যোগ্যতা:</span>
                      <span className="font-bold text-emerald-950 text-right truncate max-w-[170px]">
                        {teacher.qualification || 'দাওরায়ে হাদিস / মাস্টার্স'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between border-b border-gray-200/70 pb-1">
                      <span className="text-gray-500 font-medium">যোগদানের তারিখ:</span>
                      <span className="font-bold font-mono text-gray-800">
                        {teacher.joining_date ? toBanglaDigit(teacher.joining_date) : '০১/০১/২০২৪'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between border-b border-gray-200/70 pb-1">
                      <span className="text-gray-500 font-medium">মোবাইল নম্বর:</span>
                      <span className="font-bold font-mono text-emerald-900">
                        {toBanglaDigit(teacher.phone)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 font-medium">রক্তের গ্রুপ:</span>
                      <span className="font-extrabold text-rose-700 font-mono bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        {teacher.blood_group || 'B+'}
                      </span>
                    </div>
                  </div>

                  {/* Bottom Bar: Barcode, Principal Signature & Seal */}
                  <div className="bg-emerald-950 text-white px-4 py-2 border-t-2 border-amber-400 flex items-center justify-between">
                    {/* Barcode */}
                    <div className="flex flex-col items-start">
                      <div className="flex items-center gap-[1px] h-6 bg-white px-1 py-0.5 rounded">
                        {barcodeBars.slice(0, 32).map((bar, bIdx) => (
                          <div 
                            key={bIdx} 
                            className={`h-full ${bar ? 'w-[2px] bg-black' : 'w-[1.5px] bg-white'}`} 
                          />
                        ))}
                      </div>
                      <span className="text-[8px] font-mono text-emerald-200 tracking-widest mt-0.5">
                        {teacher.teacher_id}
                      </span>
                    </div>

                    {/* Principal Signature */}
                    <div className="text-right">
                      <div className="font-serif italic font-bold text-[9px] text-amber-300 leading-none">
                        মাওলানা ওমর ফারুক মুজাহিদী
                      </div>
                      <div className="w-24 border-b border-amber-400/60 my-0.5 ml-auto" />
                      <span className="text-[7.5px] text-emerald-200 font-semibold block uppercase">
                        অধ্যক্ষ মহোদয়ের স্বাক্ষর
                      </span>
                    </div>
                  </div>
                </div>

                {/* ═════════════════════ BACK SIDE ═════════════════════ */}
                <div 
                  className="w-[320px] h-[500px] rounded-2xl overflow-hidden shadow-2xl border-2 border-emerald-600 relative flex flex-col justify-between bg-white text-slate-800 select-none print:shadow-none shrink-0"
                  style={{
                    background: 'linear-gradient(180deg, #ffffff 0%, #f9fbf9 50%, #f0f7f2 100%)'
                  }}
                >
                  {/* Top Header */}
                  <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-[#02200d] text-white p-3 text-center border-b-2 border-amber-400">
                    <h4 className="font-extrabold text-xs text-amber-300">
                      জরুরি নির্দেশনাবলী ও প্রাতিষ্ঠানিক তথ্য
                    </h4>
                    <p className="text-[8.5px] text-emerald-200 uppercase tracking-wider">
                      TERMS & CONTACT INFORMATION
                    </p>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between text-xs">
                    
                    {/* Rules & Return Note */}
                    <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-2.5 space-y-1.5 text-[9.5px] text-emerald-950">
                      <p className="font-bold text-emerald-900 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                        <span>আইডি কার্ড ব্যবহারের শর্তাবলী:</span>
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-gray-700 pl-1 leading-relaxed">
                        <li>ক্যাম্পাসে অবস্থানকালে সার্বক্ষণিক এই কার্ডটি বহন করতে হবে।</li>
                        <li>এই কার্ডটি হস্তান্তরযোগ্য নয় এবং সম্পূর্ণ আল-মদিনা মডেল মাদ্রাসার সম্পত্তি।</li>
                        <li>কার্ডটি হারিয়ে গেলে অবিলম্বে মাদ্রাসা কর্তৃপক্ষকে অবগত করতে হবে।</li>
                      </ul>
                    </div>

                    {/* Official Details & NID */}
                    <div className="space-y-1.5 text-[10px] text-gray-800">
                      <div className="flex justify-between border-b border-gray-100 pb-1">
                        <span className="text-gray-500 font-medium">জাতীয় পরিচয়পত্র (NID):</span>
                        <span className="font-bold font-mono text-emerald-950">
                          {teacher.nid || '৫৭৮৯২৩৪৫১২'}
                        </span>
                      </div>

                      <div className="flex justify-between border-b border-gray-100 pb-1">
                        <span className="text-gray-500 font-medium">স্থায়ী ঠিকানা:</span>
                        <span className="font-semibold text-gray-800 text-right truncate max-w-[180px]">
                          {teacher.address || 'বনানী, ঢাকা-১২১২'}
                        </span>
                      </div>

                      <div className="flex justify-between border-b border-gray-100 pb-1">
                        <span className="text-gray-500 font-medium">জরুরি হটলাইন:</span>
                        <span className="font-bold font-mono text-emerald-900">
                          ০১৭১২-৬৩৩২৬৪
                        </span>
                      </div>
                    </div>

                    {/* QR Code & Return Box */}
                    <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-2.5 rounded-xl">
                      <div className="w-16 h-16 bg-white p-1 rounded-lg border border-slate-200 shrink-0 flex items-center justify-center">
                        <QrCode className="w-14 h-14 text-emerald-950" />
                      </div>
                      <div className="text-[9px] text-gray-600 leading-tight">
                        <strong className="text-emerald-950 block mb-0.5">কার্ডটি কোথাও পাওয়া গেলে:</strong>
                        নিকটস্থ ডাকবাক্সে ফেলুন অথবা নিম্নের ঠিকানায় পৌঁছে দেওয়ার জন্য বিনীত অনুরোধ করা হলো।
                      </div>
                    </div>

                    {/* Madrasah Address */}
                    <div className="text-center text-[9px] text-gray-700 pt-1">
                      <p className="font-bold text-emerald-950">আল-মদিনা মডেল মাদ্রাসা এন্ড রিসার্চ ইনস্টিটিউট</p>
                      <p>ক-৭৫/২, মহাখালী দক্ষিণপাড়া, বনানী, ঢাকা-১২১২</p>
                      <p className="text-emerald-800 font-mono font-semibold">Web: www.amms.edu.bd • Email: info@amms.edu.bd</p>
                    </div>

                  </div>

                  {/* Footer Strip */}
                  <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-[#02200d] text-amber-300 py-1.5 px-3 text-center text-[8px] font-bold tracking-widest uppercase border-t-2 border-amber-400">
                    Al Madina Model Madrasa and Research Institute
                  </div>

                </div>

              </div>

            </div>
          );
        })}
      </div>

      {/* PRINT CSS */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm 8mm;
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
