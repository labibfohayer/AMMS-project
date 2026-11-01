'use client';

import React from 'react';
import { Printer, X, Award, CheckCircle, ShieldCheck, Star } from 'lucide-react';
import { toBanglaDigit } from '@/lib/numberToBanglaWords';

export interface SubjectResultItem {
  subject_code: string;
  subject_name: string;
  subject_name_bn: string;
  marks_obtained: number;
  total_marks: number;
  pass_marks: number;
  grade: string;
  gpa: number;
  is_absent?: boolean;
}

export interface MarksheetData {
  student_id: string;
  student_pk?: number;
  name: string;
  name_bn: string;
  father_name?: string;
  father_name_bn?: string;
  roll_number?: number | string | null;
  department_name?: string;
  department_name_en?: string;
  classroom_name?: string;
  classroom_name_bn?: string;
  academic_year: number | string;
  exam_id: number;
  exam_name: string;
  exam_name_bn: string;
  exam_type: string;
  subject_results: SubjectResultItem[];
  total_marks_obtained: number;
  total_full_marks: number;
  average: number;
  overall_gpa: number;
  overall_grade: string;
  result_status: string;
  class_rank: number;
  total_examinees: number;
  highest_total?: number;
  gap_from_first?: number;
}

interface PrintableMarksheetProps {
  marksheet: MarksheetData;
  onClose?: () => void;
}

export default function PrintableMarksheet({ marksheet, onClose }: PrintableMarksheetProps) {
  const handlePrint = () => {
    window.print();
  };

  const isPassed = !marksheet.result_status.includes('Failed') && !marksheet.result_status.includes('অকৃতকার্য');
  const yearText = toBanglaDigit(marksheet.academic_year || 2026);
  const deptText = marksheet.department_name || marksheet.classroom_name_bn || 'জেনারেল ও হিফজ বিভাগ';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white print:static print:inset-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden print:shadow-none print:w-full print:max-w-none print:rounded-none">
        
        {/* Floating Controls Bar (Hidden during Print) */}
        <div className="print:hidden bg-gradient-to-r from-emerald-950 via-emerald-900 to-[#02200d] p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">একাডেমিক ট্রান্সক্রিপ্ট ও প্রগ্রেস রিপোর্ট</h3>
              <p className="text-xs text-emerald-200">
                {marksheet.name_bn} ({marksheet.student_id}) • {marksheet.exam_name_bn}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-emerald-950 rounded-xl font-bold text-xs sm:text-sm shadow-lg transition-transform active:scale-95"
            >
              <Printer className="w-4 h-4 text-emerald-950" />
              <span>মার্কশিট প্রিন্ট করুন (A4)</span>
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Printable Marksheet Document Body */}
        <div className="p-6 sm:p-8 bg-white text-gray-900 font-sans print:p-4 relative" id="marksheet-printable">
          
          {/* Watermark Logo / Text */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none font-black text-7xl tracking-widest text-emerald-950 rotate-[-25deg]">
            AMMS TRANSCRIPT
          </div>

          {/* Official Institution Header */}
          <div className="border-b-2 border-emerald-900 pb-3 mb-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              
              {/* Left Logo / Symbol */}
              <div className="w-16 h-16 rounded-full overflow-hidden p-[1.5px] border-2 border-emerald-900 shrink-0 bg-white shadow-md">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover rounded-full" />
              </div>

              {/* Center Madrasah Titles */}
              <div className="text-center flex-1">
                <div className="text-xs font-serif text-emerald-900 font-semibold mb-0.5">
                  بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-emerald-950 tracking-tight leading-snug">
                  আল-মদিনা মডেল মাদ্রাসা এন্ড রিসার্চ ইনস্টিটিউট
                </h1>
                <h2 className="text-xs sm:text-sm font-bold text-gray-700 tracking-wide">
                  Al Madina Model Madrasa and Research Institute
                </h2>
                <p className="text-[11px] text-gray-600 mt-0.5">
                  ক-৭৫/২, মহাখালী দক্ষিণপাড়া, বনানী, ঢাকা | হেল্পলাইন: ০১৭১২-৬৩৩২৬৪
                </p>

                <div className="mt-2 inline-block px-4 py-1 bg-gradient-to-r from-emerald-950 to-emerald-900 text-white rounded-lg shadow-sm">
                  <span className="text-xs sm:text-sm font-extrabold tracking-wider uppercase text-amber-300">
                    একাডেমিক ট্রান্সক্রিপ্ট ও মূল্যায়ন সনদ
                  </span>
                </div>
              </div>

              {/* Right Mini Grading Scale Table */}
              <div className="flex-shrink-0 text-[9px] border border-gray-300 rounded-lg p-1.5 bg-slate-50 text-gray-700 w-36">
                <div className="font-bold text-center border-b border-gray-300 pb-0.5 mb-0.5 text-emerald-950">
                  গ্রেডিং স্কেল (Grading System)
                </div>
                <div className="grid grid-cols-3 gap-0.5 text-center font-mono">
                  <span>৮০-১০০</span><span className="font-bold text-emerald-800">A+</span><span>5.00</span>
                  <span>৭০-৭৯</span><span className="font-bold">A</span><span>4.00</span>
                  <span>৬০-৬৯</span><span className="font-bold">A-</span><span>3.50</span>
                  <span>৫০-৫৯</span><span className="font-bold">B</span><span>3.00</span>
                  <span>৪০-৪৯</span><span className="font-bold">C</span><span>2.00</span>
                  <span>৩৩-৩৯</span><span className="font-bold">D</span><span>1.00</span>
                  <span>০-৩২</span><span className="font-bold text-red-600">F</span><span>0.00</span>
                </div>
              </div>

            </div>
          </div>

          {/* Student & Exam Details Box */}
          <div className="bg-emerald-50/70 border border-emerald-200/90 rounded-2xl p-3.5 mb-4 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-2 gap-x-4">
              <div>
                <span className="text-gray-500 block text-[10px]">শিক্ষার্থীর নাম:</span>
                <span className="font-bold text-gray-950 text-xs sm:text-sm">{marksheet.name_bn}</span>
                <span className="text-[10px] text-gray-500 block">({marksheet.name})</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[10px]">স্টুডেন্ট আইডি:</span>
                <span className="font-mono font-bold text-emerald-900 bg-emerald-100/80 px-1.5 py-0.5 rounded text-xs">
                  {marksheet.student_id}
                </span>
                {marksheet.roll_number && (
                  <span className="text-[11px] text-gray-700 ml-1.5">
                    রোল: <span className="font-bold">{toBanglaDigit(marksheet.roll_number)}</span>
                  </span>
                )}
              </div>
              <div>
                <span className="text-gray-500 block text-[10px]">বিভাগ / শ্রেণি:</span>
                <span className="font-bold text-gray-900">{deptText}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[10px]">পরীক্ষার নাম:</span>
                <span className="font-bold text-emerald-950">{marksheet.exam_name_bn}</span>
                <span className="text-[10px] text-gray-500 block">শিক্ষাবর্ষ: {yearText}</span>
              </div>
            </div>
          </div>

          {/* Subject-Wise Results Table */}
          <table className="w-full border-collapse border border-gray-400 mb-4 text-xs font-sans">
            <thead>
              <tr className="bg-emerald-900 text-white font-bold text-center">
                <th className="border border-gray-400 py-2 px-2 w-10">ক্র.নং</th>
                <th className="border border-gray-400 py-2 px-2 w-20">বিষয় কোড</th>
                <th className="border border-gray-400 py-2 px-3 text-left">বিষয়ের নাম (Subject Name)</th>
                <th className="border border-gray-400 py-2 px-2 w-16 text-center">পূর্ণমান</th>
                <th className="border border-gray-400 py-2 px-2 w-16 text-center">পাস নম্বর</th>
                <th className="border border-gray-400 py-2 px-2 w-24 text-center">প্রাপ্ত নম্বর</th>
                <th className="border border-gray-400 py-2 px-2 w-16 text-center">লেটার গ্রেড</th>
                <th className="border border-gray-400 py-2 px-2 w-16 text-center">গ্রেড পয়েন্ট (GP)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300">
              {marksheet.subject_results.map((sub, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="border border-gray-400 py-2 px-2 text-center font-mono font-medium">
                    {toBanglaDigit(idx + 1)}
                  </td>
                  <td className="border border-gray-400 py-2 px-2 text-center font-mono text-[11px] text-gray-600">
                    {sub.subject_code}
                  </td>
                  <td className="border border-gray-400 py-2 px-3">
                    <span className="font-bold text-gray-900">{sub.subject_name_bn}</span>
                    <span className="text-gray-500 text-[10px] block font-medium">({sub.subject_name})</span>
                  </td>
                  <td className="border border-gray-400 py-2 px-2 text-center font-mono font-medium">
                    {toBanglaDigit(sub.total_marks)}
                  </td>
                  <td className="border border-gray-400 py-2 px-2 text-center font-mono text-gray-600">
                    {toBanglaDigit(sub.pass_marks)}
                  </td>
                  <td className="border border-gray-400 py-2 px-2 text-center font-mono font-bold text-emerald-950 text-sm">
                    {sub.is_absent ? (
                      <span className="text-red-600 text-xs font-bold">অনুপস্থিত</span>
                    ) : (
                      toBanglaDigit(sub.marks_obtained)
                    )}
                  </td>
                  <td className="border border-gray-400 py-2 px-2 text-center font-bold">
                    <span className={`px-2 py-0.5 rounded text-[11px] ${
                      sub.grade === 'A+' ? 'bg-emerald-100 text-emerald-900' :
                      sub.grade === 'F' ? 'bg-red-100 text-red-700' :
                      'bg-slate-100 text-slate-800'
                    }`}>
                      {sub.grade}
                    </span>
                  </td>
                  <td className="border border-gray-400 py-2 px-2 text-center font-mono font-bold text-gray-900">
                    {sub.gpa.toFixed(2)}
                  </td>
                </tr>
              ))}

              {/* Total & Summary Row */}
              <tr className="bg-emerald-50 font-black text-emerald-950">
                <td colSpan={3} className="border border-gray-400 py-2 px-3 text-right">
                  সর্বমোট নম্বর ও জিপিএ (Total & GPA):
                </td>
                <td className="border border-gray-400 py-2 px-2 text-center font-mono text-sm">
                  {toBanglaDigit(marksheet.total_full_marks)}
                </td>
                <td className="border border-gray-400 py-2 px-2 text-center font-mono text-xs">
                  -
                </td>
                <td className="border border-gray-400 py-2 px-2 text-center font-mono text-base font-extrabold text-emerald-950">
                  {toBanglaDigit(marksheet.total_marks_obtained)}
                </td>
                <td className="border border-gray-400 py-2 px-2 text-center font-extrabold text-sm text-emerald-900">
                  {marksheet.overall_grade}
                </td>
                <td className="border border-gray-400 py-2 px-2 text-center font-mono font-extrabold text-sm text-emerald-900">
                  {marksheet.overall_gpa.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Academic Evaluation Badges & Merit Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 text-center">
            
            <div className="p-2.5 rounded-xl border border-emerald-300 bg-emerald-50/80">
              <span className="text-[10px] text-gray-600 block">প্রাপ্ত জিপিএ (GPA)</span>
              <span className="text-xl font-black text-emerald-950 font-mono">
                {marksheet.overall_gpa.toFixed(2)}
              </span>
              <span className="text-[9px] text-emerald-800 block font-bold">
                স্কেল: ৫.০০ (Scale 5.00)
              </span>
            </div>

            <div className="p-2.5 rounded-xl border border-emerald-300 bg-emerald-50/80">
              <span className="text-[10px] text-gray-600 block">লেটার গ্রেড (Grade)</span>
              <span className="text-xl font-black text-emerald-950">
                {marksheet.overall_grade}
              </span>
              <span className="text-[9px] text-emerald-800 block font-bold">
                {marksheet.overall_grade === 'A+' ? 'অনবদ্য (Outstanding)' : marksheet.overall_grade === 'A' ? 'উত্তম (Excellent)' : 'সন্তোষজনক'}
              </span>
            </div>

            <div className="p-2.5 rounded-xl border border-amber-300 bg-amber-50/70">
              <span className="text-[10px] text-amber-800 block">শ্রেণিতে মেধা স্থান (Rank)</span>
              <span className="text-xl font-black text-amber-900">
                {toBanglaDigit(marksheet.class_rank)} র্থ
              </span>
              <span className="text-[9px] text-gray-600 block font-bold">
                মোট পরীক্ষার্থী: {toBanglaDigit(marksheet.total_examinees)} জন
              </span>
            </div>

            <div className={`p-2.5 rounded-xl border ${isPassed ? 'border-emerald-300 bg-emerald-50/80' : 'border-red-300 bg-red-50'}`}>
              <span className="text-[10px] text-gray-600 block">ফলাফল মূল্যায়ন</span>
              <span className={`text-base font-black ${isPassed ? 'text-emerald-950' : 'text-red-700'}`}>
                {marksheet.result_status}
              </span>
              <span className="text-[9px] text-gray-600 block font-medium">
                গড় প্রাপ্ত নম্বর: {toBanglaDigit(marksheet.average)}%
              </span>
            </div>

          </div>

          {/* Remarks & Character Observation */}
          <div className="border border-gray-300 rounded-xl p-2.5 mb-8 text-xs bg-slate-50 flex items-start justify-between">
            <div>
              <span className="font-bold text-gray-800">শ্রেণি শিক্ষকের মন্তব্য ও পর্যালোচনা:</span>{' '}
              <span className="font-semibold text-emerald-950 italic">
                {marksheet.overall_grade === 'A+' || marksheet.overall_grade === 'A' 
                  ? 'অত্যন্ত প্রশংসনীয় ও সন্তোষজনক ফলাফল। দ্বীনি আদব ও নিয়মিত ক্লাসে মনোযোগী। মেধার এই ধারাবাহিকতা বজায় রাখার পরামর্শ দেওয়া হলো।'
                  : 'ফলাফল সন্তোষজনক। তবে পরবর্তী পরীক্ষার জন্য আরও নিবিড় অধ্যবসায় ও বিশেষ যত্ন প্রয়োজন।'}
              </span>
            </div>
          </div>

          {/* Official Signatures & Seal Block */}
          <div className="grid grid-cols-3 items-end pt-8 text-center text-xs font-semibold text-gray-700">
            <div>
              <div className="border-t border-gray-600 pt-1 mx-4">
                অভিভাবকের স্বাক্ষর
              </div>
            </div>
            <div>
              <div className="text-emerald-900 font-bold text-[10px] mb-0.5">
                সিনিয়র শিক্ষক ও পরীক্ষক
              </div>
              <div className="border-t border-gray-600 pt-1 mx-4">
                শ্রেণি শিক্ষকের স্বাক্ষর
              </div>
            </div>
            <div>
              <div className="w-9 h-9 mx-auto rounded-full overflow-hidden p-[1px] border border-emerald-800/40 mb-1 bg-white shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.jpg" alt="Seal" className="w-full h-full object-cover rounded-full" />
              </div>
              <div className="text-emerald-950 font-black text-[11px] mb-0.5">
                মাওলানা ওমর ফারুক মুজাহিদী
              </div>
              <div className="border-t border-gray-600 pt-1 mx-4">
                অধ্যক্ষ ও পরিচালকের সিল ও স্বাক্ষর
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Print Action Footer (Hidden during Print) */}
        <div className="print:hidden bg-gray-50 border-t border-gray-200 p-4 flex items-center justify-between">
          <p className="text-xs text-gray-500">
            💡 টিপস: মার্কশিটটি প্রিন্ট করতে 'প্রিন্ট' বাটনে ক্লিক করুন। এক ক্লিকে অফিশিয়াল সিলসহ A4 সাইজে প্রিন্ট হবে।
          </p>
          <div className="flex items-center gap-3">
            {onClose && (
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-200 transition-colors"
              >
                বন্ধ করুন
              </button>
            )}
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs sm:text-sm shadow-md transition-transform active:scale-95"
            >
              <Printer className="w-4 h-4 text-amber-300" />
              <span>মার্কশিট প্রিন্ট</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
