'use client';

import React from 'react';
import { Printer, ShieldCheck, User, QrCode, Phone, MapPin, Droplets, Calendar, Award } from 'lucide-react';
import { toBanglaDigit } from '@/lib/numberToBanglaWords';

export interface StudentIDData {
  id: number | string;
  student_id: string;
  name: string;
  name_bn: string;
  photo?: string | null;
  roll_number?: number | string | null;
  academic_year?: number | string;
  islamic_department_name?: string;
  islamic_department_name_bn?: string;
  general_department_name?: string;
  general_department_name_bn?: string;
  blood_group?: string;
  date_of_birth?: string;
  guardian_name?: string;
  guardian_phone?: string;
  present_address?: string;
  residential_status?: string;
}

interface StudentIDCardProps {
  student: StudentIDData;
  onClose?: () => void;
}

export default function StudentIDCard({ student, onClose }: StudentIDCardProps) {
  const handlePrint = () => {
    window.print();
  };

  const deptBn = student.islamic_department_name_bn || student.general_department_name_bn || student.islamic_department_name || student.general_department_name || 'জেনারেল ও হিফজ বিভাগ';
  const deptEn = student.general_department_name || student.islamic_department_name || 'General & Hifz Dept';
  const yearText = student.academic_year ? toBanglaDigit(student.academic_year) : '২০২৭';

  // Barcode pattern SVG bars generator from student ID
  const generateBarcodeBars = (code: string) => {
    const bars: boolean[] = [];
    for (let i = 0; i < code.length; i++) {
      const charCode = code.charCodeAt(i);
      bars.push(true, false, charCode % 2 === 0, true, false, charCode % 3 === 0, true);
    }
    return bars;
  };

  const barcodeBars = generateBarcodeBars(student.student_id || 'STU-2026-001');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white print:static print:inset-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden print:shadow-none print:w-full print:max-w-none print:rounded-none">
        
        {/* Modal Top Control Bar (Hidden on Print) */}
        <div className="print:hidden bg-gradient-to-r from-emerald-950 via-emerald-900 to-[#02200d] p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">ডিজিটাল স্টুডেন্ট আইডি কার্ড (Digital Student ID)</h3>
              <p className="text-xs text-emerald-200">
                {student.name_bn} ({student.student_id}) • ফ্রন্ট ও ব্যাক বোথ-সাইড প্রিন্ট
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-emerald-950 rounded-xl font-bold text-xs sm:text-sm shadow-lg transition-transform active:scale-95"
            >
              <Printer className="w-4 h-4 text-emerald-950" />
              <span>আইডি কার্ড প্রিন্ট করুন</span>
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold"
              >
                বন্ধ করুন
              </button>
            )}
          </div>
        </div>

        {/* Printable Card Container */}
        <div className="p-6 sm:p-8 bg-slate-100 print:bg-white print:p-0">
          
          <div className="text-center print:hidden mb-6">
            <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-900 rounded-full text-xs font-semibold">
              স্ট্যান্ডার্ড পিভিসি / ল্যামিনেশন সাইজ (54mm × 86mm Portrait)
            </span>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-8 print:gap-6 print:flex-row print:justify-center">
            
            {/* ===================== FRONT SIDE ===================== */}
            <div 
              className="w-[320px] h-[500px] bg-white rounded-2xl shadow-xl border-2 border-emerald-800/40 overflow-hidden flex flex-col justify-between relative print:shadow-none print:border-emerald-900 select-none"
              style={{ minWidth: '320px', minHeight: '500px' }}
            >
              {/* Decorative Top Arch / Geometry */}
              <div className="bg-gradient-to-b from-emerald-950 via-emerald-900 to-emerald-800 text-white text-center pt-2.5 pb-3 px-3 relative border-b-2 border-amber-400/50">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <div className="w-9 h-9 rounded-full overflow-hidden p-[1px] bg-amber-400/60 shrink-0 shadow-md">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover rounded-full bg-white" />
                  </div>
                  <div>
                    <div className="font-black text-xs text-white tracking-tight leading-tight">
                      আল-মদিনা মডেল মাদ্রাসা
                    </div>
                    <div className="text-[9px] font-bold text-amber-300 tracking-wider">
                      এন্ড রিসার্চ ইনস্টিটিউট
                    </div>
                  </div>
                </div>
                <div className="text-[7.5px] text-emerald-200">
                  Al Madina Model Madrasa & Research Institute
                </div>
                <div className="mt-1.5 inline-block px-3 py-0.5 rounded-full bg-amber-400 text-emerald-950 font-extrabold text-[9px] uppercase tracking-wider shadow-sm">
                  স্টুডেন্ট আইডি কার্ড — {yearText}
                </div>
              </div>

              {/* Middle Section: Photo & Identity */}
              <div className="flex-1 flex flex-col items-center justify-center px-4 py-2 text-center">
                {/* Photo Frame */}
                <div className="relative mb-2.5">
                  <div className="w-24 h-28 rounded-xl p-1 bg-gradient-to-b from-amber-400 via-emerald-600 to-emerald-900 shadow-md">
                    <div className="w-full h-full bg-white rounded-lg overflow-hidden flex items-center justify-center">
                      {student.photo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img 
                          src={student.photo.startsWith('http') ? student.photo : `http://127.0.0.1:8001${student.photo.startsWith('/') ? '' : '/'}${student.photo}`} 
                          alt={student.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-emerald-50 flex flex-col items-center justify-center text-emerald-800">
                          <User className="w-12 h-12 text-emerald-600" />
                          <span className="text-[9px] font-bold mt-1 text-emerald-900">ছবি</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {student.blood_group && (
                    <span className="absolute -bottom-2 -right-2 px-2 py-0.5 bg-red-600 text-white font-black text-[9px] rounded-md shadow-sm border border-white flex items-center gap-0.5">
                      <Droplets className="w-2.5 h-2.5 fill-white" />
                      {student.blood_group}
                    </span>
                  )}
                </div>

                {/* Student Names */}
                <h4 className="font-black text-base text-emerald-950 leading-tight">
                  {student.name_bn || student.name}
                </h4>
                <p className="text-[11px] font-bold text-gray-700 tracking-wide mb-1">
                  {student.name}
                </p>

                {/* ID Pill */}
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-emerald-950 text-white rounded-lg font-mono font-bold text-xs mb-2">
                  <span>ID:</span>
                  <span className="text-amber-300">{student.student_id}</span>
                </div>

                {/* Info Table */}
                <div className="w-full bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-2 text-left text-[11px] space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-medium">বিভাগ/শ্রেণি:</span>
                    <span className="font-bold text-emerald-950">{deptBn}</span>
                  </div>
                  {student.roll_number && (
                    <div className="flex justify-between">
                      <span className="text-gray-500 font-medium">রোল নং:</span>
                      <span className="font-bold text-emerald-950">{toBanglaDigit(student.roll_number)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-medium">জরুরি ফোন:</span>
                    <span className="font-bold text-emerald-950">{student.guardian_phone || '০১৭১২-৬৩৩২৬৪'}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Barcode & Footer */}
              <div className="bg-gray-50 border-t border-gray-200 p-2 text-center">
                {/* SVG Barcode */}
                <div className="flex items-center justify-center h-7 gap-[2px] mb-0.5">
                  {barcodeBars.map((bar, idx) => (
                    <div 
                      key={idx} 
                      className={`h-full ${bar ? 'bg-black' : 'bg-transparent'} ${idx % 4 === 0 ? 'w-[2px]' : 'w-[1.2px]'}`}
                    />
                  ))}
                </div>
                <div className="text-[9px] font-mono tracking-widest text-gray-700 font-bold">
                  *{student.student_id}*
                </div>
              </div>
            </div>

            {/* ===================== BACK SIDE ===================== */}
            <div 
              className="w-[320px] h-[500px] bg-white rounded-2xl shadow-xl border-2 border-emerald-800/40 overflow-hidden flex flex-col justify-between relative print:shadow-none print:border-emerald-900 select-none"
              style={{ minWidth: '320px', minHeight: '500px' }}
            >
              {/* Back Top Banner */}
              <div className="bg-emerald-950 text-white p-3 text-center border-b-2 border-amber-400">
                <div className="text-[11px] font-bold text-amber-300">
                  নিয়মাবলী ও প্রাতিষ্ঠানিক নির্দেশিকা
                </div>
                <div className="text-[9px] text-emerald-200">
                  Terms & Emergency Contact Information
                </div>
              </div>

              {/* Middle Terms & Conditions */}
              <div className="p-4 flex-1 flex flex-col justify-between text-xs text-gray-800">
                <div className="space-y-2 text-[11px] text-gray-700 leading-relaxed">
                  <div className="flex items-start gap-1.5">
                    <span className="text-emerald-800 font-bold">১.</span>
                    <span>এই কার্ডটি আল-মদিনা মডেল মাদ্রাসার নিজস্ব সম্পত্তি।</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="text-emerald-800 font-bold">২.</span>
                    <span>মাদ্রাসায় অবস্থানকালীন কার্ডটি সার্বক্ষণিক দৃশ্যমানভাবে ঝুলিয়ে রাখা বাধ্যতামূলক।</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="text-emerald-800 font-bold">৩.</span>
                    <span>কার্ডটি কোনোভাবেই হস্তান্তরযোগ্য নয়। কোনো প্রকার পরিবর্তন আইনত দণ্ডনীয়।</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="text-emerald-800 font-bold">৪.</span>
                    <span>কার্ডটি হারিয়ে গেলে মাদ্রাসার হেল্পলাইনে তাৎক্ষণিক রিপোর্ট করতে হবে।</span>
                  </div>
                </div>

                {/* Institutional Address Box */}
                <div className="bg-emerald-50 rounded-xl p-2.5 border border-emerald-200/80 text-[10px] space-y-1">
                  <div className="font-bold text-emerald-950 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-emerald-700 flex-shrink-0" />
                    <span>ক্যাম্পাস ঠিকানা:</span>
                  </div>
                  <p className="text-gray-700 pl-4 leading-tight">
                    ক-৭৫/২, মহাখালী দক্ষিণপাড়া, বনানী, ঢাকা।
                  </p>
                  <div className="font-bold text-emerald-950 flex items-center gap-1 pt-1">
                    <Phone className="w-3 h-3 text-emerald-700 flex-shrink-0" />
                    <span>যোগাযোগ ও হেল্পলাইন:</span>
                  </div>
                  <p className="text-gray-700 pl-4 font-mono font-semibold">
                    ০১৭১২-৬৩৩২৬৪
                  </p>
                </div>

                {/* Validity & Signature */}
                <div className="pt-2 flex items-end justify-between border-t border-gray-300">
                  <div>
                    <span className="text-[10px] text-gray-500 block">মেয়াদ উত্তীর্ণ:</span>
                    <span className="text-[11px] font-bold text-emerald-950">৩১ ডিসেম্বর, ২০২৭</span>
                  </div>
                  <div className="text-center">
                    <div className="w-10 h-10 mx-auto rounded-full overflow-hidden p-[1px] border border-emerald-700/60 mb-0.5 bg-white shadow-sm">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/logo.jpg" alt="Seal" className="w-full h-full object-cover rounded-full" />
                    </div>
                    <div className="text-[10px] font-bold text-gray-900 leading-tight">
                      মাওলানা ওমর ফারুক মুজাহিদী
                    </div>
                    <div className="text-[8.5px] text-gray-600">
                      অধ্যক্ষ, AMMS
                    </div>
                  </div>
                </div>

              </div>

              {/* Bottom Accent */}
              <div className="bg-emerald-900 text-white text-[9px] py-1 text-center font-medium">
                www.almadinamodelmadrasa.com
              </div>
            </div>

          </div>

          <div className="mt-8 text-center print:hidden">
            <p className="text-xs text-gray-500 mb-3">
              💡 প্রিন্ট নির্দেশিকা: ডাবল-সাইড প্রিন্টারে 'Flip on short edge' নির্বাচন করুন অথবা কার্ড পেপারে ফ্রন্ট ও ব্যাক একসাথে প্রিন্ট করে কেটে ল্যামিনেট করুন।
            </p>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md transition-transform active:scale-95"
            >
              <Printer className="w-4 h-4 text-amber-300" />
              <span>স্টুডেন্ট আইডি কার্ড প্রিন্ট করুন</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
