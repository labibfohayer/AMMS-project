'use client';

import React from 'react';
import { Printer, X, ShieldCheck, DollarSign } from 'lucide-react';
import { numberToBanglaWords, toBanglaDigit } from '@/lib/numberToBanglaWords';

export interface SalarySlipData {
  id?: number | string;
  teacher_id_code: string;
  teacher_name: string;
  teacher_name_bn?: string;
  designation: string;
  designation_bn?: string;
  phone: string;
  month: number;
  month_name?: string;
  year: number;
  monthly_salary: number | string;
  allowance?: number | string;
  deduction?: number | string;
  net_amount: number | string;
  paid_date: string;
  note?: string;
  paid_by?: string;
  voucher_number?: string;
  attendance_summary?: {
    present_days?: number;
    absent_days?: number;
    leave_days?: number;
    late_days?: number;
  };
}

const MONTH_NAMES_BN: { [key: number]: string } = {
  1: 'জানুয়ারি', 2: 'ফেব্রুয়ারি', 3: 'মার্চ', 4: 'এপ্রিল',
  5: 'মে', 6: 'জুন', 7: 'জুলাই', 8: 'আগস্ট',
  9: 'সেপ্টেম্বর', 10: 'অক্টোবর', 11: 'নভেম্বর', 12: 'ডিসেম্বর'
};

interface PrintableSalarySlipProps {
  slip: SalarySlipData;
  onClose?: () => void;
}

export default function PrintableSalarySlip({ slip, onClose }: PrintableSalarySlipProps) {
  const handlePrint = () => {
    window.print();
  };

  const basicSalary = Number(slip.monthly_salary) || 0;
  const allowance = Number(slip.allowance) || 0;
  const deduction = Number(slip.deduction) || 0;
  const netAmount = Number(slip.net_amount) || basicSalary + allowance - deduction;

  const monthLabel = slip.month_name || MONTH_NAMES_BN[slip.month] || `${slip.month}`;
  const inWords = numberToBanglaWords(netAmount);

  const SingleSlipCopy = ({ copyTitle }: { copyTitle: string }) => (
    <div className="border-2 border-emerald-900/40 rounded-xl p-4 sm:p-5 bg-white text-gray-900 text-xs sm:text-sm font-sans relative">
      {/* Watermark Logo / Text */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none font-bold text-5xl tracking-widest text-emerald-950">
        AL MADINA
      </div>

      {/* Madrasah Header */}
      <div className="border-b-2 border-emerald-800 pb-3 mb-3">
        <div className="flex items-center justify-between gap-3 mb-1">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden p-[1px] border border-emerald-800/40 shrink-0 bg-white shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover rounded-full" />
          </div>
          <div className="flex-1 text-center">
            <div className="text-[10px] font-semibold text-emerald-800 tracking-wider">
              بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ
            </div>
            <h1 className="text-base sm:text-lg font-black text-emerald-950 tracking-tight leading-tight">
              আল-মদিনা মডেল মাদ্রাসা এন্ড রিসার্চ ইনস্টিটিউট
            </h1>
            <h2 className="text-[11px] sm:text-xs font-bold text-gray-700 tracking-wide">
              Al Madina Model Madrasa and Research Institute
            </h2>
            <p className="text-[10px] text-gray-600 mt-0.5">
              ক-৭৫/২, মহাখালী দক্ষিণপাড়া, বনানী, ঢাকা | ফোন: ০১৭২২-১৫৭৪৬৪, ০১৭১২-৬৩০২৬৪
            </p>
          </div>
          <div className="text-right shrink-0">
            <span className="inline-block px-2.5 py-1 rounded-md text-[10px] font-black tracking-wider uppercase border border-emerald-700 bg-emerald-50 text-emerald-900 shadow-xs">
              {copyTitle}
            </span>
            <div className="text-[9px] font-mono text-gray-500 mt-1">
              ভাউচার: #{slip.voucher_number || `SLP-${slip.year}-${slip.month}-${slip.teacher_id_code}`}
            </div>
          </div>
        </div>

        {/* Slip Title */}
        <div className="text-center mt-2">
          <span className="inline-block px-4 py-0.5 rounded-full bg-emerald-950 text-amber-300 font-extrabold text-[11px] tracking-wide shadow-sm">
            শিক্ষক ও স্টাফ মাসিক বেতন ও সম্মানী ভাউচার স্লিপ
          </span>
        </div>
      </div>

      {/* Meta Information Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 py-2 px-3 bg-slate-50 rounded-lg border border-slate-200 text-xs mb-3">
        <div>
          <span className="text-gray-500 block text-[10px]">শিক্ষক/স্টাফ আইডি:</span>
          <span className="font-mono font-bold text-emerald-900">{slip.teacher_id_code}</span>
        </div>
        <div>
          <span className="text-gray-500 block text-[10px]">বেতনের মাস ও বছর:</span>
          <span className="font-bold text-slate-800">{monthLabel} {toBanglaDigit(slip.year)}</span>
        </div>
        <div>
          <span className="text-gray-500 block text-[10px]">পরিশোধের তারিখ:</span>
          <span className="font-bold text-slate-800">{toBanglaDigit(slip.paid_date)}</span>
        </div>
        <div>
          <span className="text-gray-500 block text-[10px]">মোবাইল নম্বর:</span>
          <span className="font-mono font-bold text-slate-700">{toBanglaDigit(slip.phone)}</span>
        </div>
      </div>

      {/* Teacher Profile & Attendance Snapshot */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1 mb-3">
        <div>
          <span className="text-[10px] text-gray-500">নাম ও পদবী:</span>
          <div className="text-sm font-extrabold text-slate-900">
            {slip.teacher_name_bn || slip.teacher_name}
          </div>
          <div className="text-xs font-semibold text-emerald-800">
            {slip.designation_bn || slip.designation}
          </div>
        </div>

        {slip.attendance_summary && (
          <div className="flex items-center gap-1.5 text-[10px] bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
            <span className="font-semibold text-slate-600">হাজিরা তথ্য:</span>
            <span className="text-emerald-700 font-bold">উপস্থিত: {toBanglaDigit(slip.attendance_summary.present_days || 0)} দিন</span>
            {Number(slip.attendance_summary.absent_days) > 0 && (
              <span className="text-rose-600 font-bold">• অনুপস্থিত: {toBanglaDigit(slip.attendance_summary.absent_days || 0)}</span>
            )}
            {Number(slip.attendance_summary.leave_days) > 0 && (
              <span className="text-amber-700 font-bold">• ছুটি: {toBanglaDigit(slip.attendance_summary.leave_days || 0)}</span>
            )}
          </div>
        )}
      </div>

      {/* Salary Breakdown Table */}
      <table className="w-full text-xs border border-gray-300 rounded-md overflow-hidden mb-3">
        <thead className="bg-emerald-950 text-white text-[11px]">
          <tr>
            <th className="py-1.5 px-3 text-left font-bold">বিবরণ / খাতের নাম</th>
            <th className="py-1.5 px-3 text-right font-bold">টাকার পরিমাণ (৳)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 text-slate-800">
          <tr>
            <td className="py-1.5 px-3 font-medium">মূল মাসিক বেতন ও নিয়মিত সম্মানী (Basic Salary)</td>
            <td className="py-1.5 px-3 text-right font-mono font-bold">
              ৳ {toBanglaDigit(basicSalary.toLocaleString('en-IN', { minimumFractionDigits: 2 }))}
            </td>
          </tr>
          {allowance > 0 && (
            <tr className="bg-emerald-50/50">
              <td className="py-1.5 px-3 font-medium text-emerald-900">অতিরিক্ত বিশেষ ভাতা ও উপহার (Allowance/Bonus)</td>
              <td className="py-1.5 px-3 text-right font-mono font-bold text-emerald-700">
                + ৳ {toBanglaDigit(allowance.toLocaleString('en-IN', { minimumFractionDigits: 2 }))}
              </td>
            </tr>
          )}
          {deduction > 0 && (
            <tr className="bg-rose-50/50">
              <td className="py-1.5 px-3 font-medium text-rose-900">অনুপস্থিতি বা ঋণ বাবদ কর্তন (Deduction)</td>
              <td className="py-1.5 px-3 text-right font-mono font-bold text-rose-700">
                - ৳ {toBanglaDigit(deduction.toLocaleString('en-IN', { minimumFractionDigits: 2 }))}
              </td>
            </tr>
          )}
          <tr className="bg-slate-100 font-black text-xs sm:text-sm">
            <td className="py-2 px-3 text-emerald-950">সর্বমোট নিট প্রদেয় সম্মানী (Net Payable Amount)</td>
            <td className="py-2 px-3 text-right font-mono text-emerald-800 text-sm">
              ৳ {toBanglaDigit(netAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 }))}
            </td>
          </tr>
        </tbody>
      </table>

      {/* In Words & Notes */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs mb-6">
        <div className="flex items-start gap-1">
          <span className="font-bold text-gray-700 shrink-0">কথায়:</span>
          <span className="font-semibold text-emerald-900 italic">{inWords}</span>
        </div>
        {slip.note && (
          <div className="text-[11px] text-gray-600 mt-1">
            <span className="font-bold">মন্তব্য:</span> {slip.note}
          </div>
        )}
      </div>

      {/* Signature Sign-offs */}
      <div className="grid grid-cols-3 gap-6 text-center text-[10px] sm:text-xs pt-4 font-semibold">
        <div>
          <div className="border-t border-gray-400 pt-1 text-gray-700">
            গ্রহীতা শিক্ষক / কর্মচারীর স্বাক্ষর
          </div>
          <span className="text-[9px] text-gray-400">তারিখসহ স্বাক্ষর</span>
        </div>
        <div>
          <div className="border-t border-gray-400 pt-1 text-gray-700">
            হিসাবরক্ষক / ক্যাশিয়ার
          </div>
          <span className="text-[9px] text-gray-400">অর্থ প্রদানকারী</span>
        </div>
        <div>
          <div className="border-t border-emerald-900 pt-1 font-bold text-emerald-950">
            অধ্যক্ষ ও মুহতামিম
          </div>
          <span className="text-[9px] text-emerald-800 font-bold">মাওলানা ওমর ফারুক মুজাহিদী</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      {/* Container */}
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full my-auto overflow-hidden border border-slate-300">
        
        {/* Floating Modal Control Bar */}
        <div className="no-print bg-gradient-to-r from-emerald-950 via-emerald-900 to-[#02200d] text-white p-4 sm:p-5 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-emerald-950 flex items-center justify-center font-bold shadow-sm">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">অফিসিয়াল শিক্ষক ও স্টাফ পে-স্লিপ</h3>
              <p className="text-xs text-emerald-200/80">
                {slip.teacher_name_bn || slip.teacher_name} ({monthLabel} {slip.year})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-emerald-950 font-black text-xs sm:text-sm shadow-md transition-all active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>প্রিন্ট করুন (A4)</span>
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="বন্ধ করুন"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Preview and Printable Sheets */}
        <div className="p-4 sm:p-6 max-h-[80vh] overflow-y-auto bg-slate-100/60 space-y-6 print:p-0 print:m-0 print:space-y-4 print:bg-white">
          
          {/* COPY 1: শিক্ষক / কর্মচারী কপি */}
          <SingleSlipCopy copyTitle="শিক্ষক / কর্মচারী কপি" />

          {/* Cut Line */}
          <div className="relative py-1 flex items-center justify-center">
            <div className="border-t-2 border-dashed border-gray-400 w-full" />
            <span className="absolute bg-slate-100 print:bg-white px-3 text-[10px] text-gray-500 font-semibold flex items-center gap-1.5">
              <span>✂️</span>
              <span>এখানে কেটে আলাদা করুন (মাদ্রাসার অফিস নথির জন্য সংরক্ষণ করুন)</span>
            </span>
          </div>

          {/* COPY 2: মাদ্রাসা অফিস কপি */}
          <SingleSlipCopy copyTitle="মাদ্রাসা অফিস কপি" />

        </div>
      </div>
    </div>
  );
}
