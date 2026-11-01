'use client';

import React from 'react';
import { Printer, X, CheckCircle, ShieldCheck, MessageSquare, Send } from 'lucide-react';
import { numberToBanglaWords, toBanglaDigit } from '@/lib/numberToBanglaWords';

export interface FeeReceiptData {
  id?: number | string;
  receipt_number: string;
  payment_date: string;
  payment_type: string;
  month?: number | null;
  year: number;
  amount_due: number | string;
  amount_paid: number | string;
  discount?: number | string;
  balance_due?: number | string;
  note?: string;
  student_name: string;
  student_name_bn?: string;
  student_id_code: string;
  roll_number?: number | string;
  islamic_department_name?: string;
  general_department_name?: string;
  guardian_phone?: string;
  collected_by_name?: string;
}

const MONTH_NAMES_BN: { [key: number]: string } = {
  1: 'জানুয়ারি', 2: 'ফেব্রুয়ারি', 3: 'মার্চ', 4: 'এপ্রিল',
  5: 'মে', 6: 'জুন', 7: 'জুলাই', 8: 'আগস্ট',
  9: 'সেপ্টেম্বর', 10: 'অক্টোবর', 11: 'নভেম্বর', 12: 'ডিসেম্বর'
};

const PAYMENT_TYPE_LABELS: { [key: string]: string } = {
  monthly: 'মাসিক বেতন (Monthly Tuition)',
  hostel: 'হোস্টেল ও খাবার ফি (Hostel & Meal)',
  exam: 'পরীক্ষার ফি (Examination Fee)',
  admission: 'ভর্তি ফি (Admission Fee)',
  other: 'অন্যান্য ফি (Other Charges)'
};

interface PrintableMoneyReceiptProps {
  receipt: FeeReceiptData;
  onClose?: () => void;
}

export default function PrintableMoneyReceipt({ receipt, onClose }: PrintableMoneyReceiptProps) {
  const handlePrint = () => {
    window.print();
  };

  const amountPaidNum = Number(receipt.amount_paid) || 0;
  const amountDueNum = Number(receipt.amount_due) || 0;
  const discountNum = Number(receipt.discount) || 0;
  const balanceDueNum = receipt.balance_due !== undefined 
    ? Number(receipt.balance_due) 
    : Math.max(0, amountDueNum - amountPaidNum - discountNum);

  const monthLabel = receipt.month ? MONTH_NAMES_BN[receipt.month] || `${receipt.month}` : null;
  const paymentTypeTitle = PAYMENT_TYPE_LABELS[receipt.payment_type] || receipt.payment_type;
  const inWords = numberToBanglaWords(amountPaidNum);

  const handleSendWhatsApp = () => {
    const waMessage = `আস-সালামু আলাইকুম!\n*আল-মদিনা মডেল মাদ্রাসা এন্ড রিসার্চ ইনস্টিটিউট*\nক-৭৫/২, মহাখালী দক্ষিণপাড়া, বনানী, ঢাকা | ০১৭১২-৬৩৩২৬৪\n\n🧾 *অর্থ আদায় মানি রিসিট ভাউচার*\n────────────────────────\nরশিদ নং: *${receipt.receipt_number}*\nতারিখ: ${receipt.payment_date}\nশিক্ষার্থী: *${receipt.student_name_bn || receipt.student_name}* (ID: ${receipt.student_id_code})\nফি'র বিবরণ: *${paymentTypeTitle}${monthLabel ? ` (${monthLabel})` : ''}*\nপরিশোধিত টাকা: *৳ ${amountPaidNum}/-*\nকথায়: ${inWords}\n${balanceDueNum > 0 ? `অবশিষ্ট বকেয়া: ৳ ${balanceDueNum}/-` : 'কোনো বকেয়া নেই (পরিশোধিত)'}\n────────────────────────\nজাযাকাল্লাহু খাইরান।`;

    const rawPhone = receipt.guardian_phone || '01712633264';
    const clean = rawPhone.replace(/[^0-9]/g, '');
    const intl = clean.startsWith('880') ? clean : clean.startsWith('0') ? `88${clean}` : `880${clean}`;
    window.open(`https://wa.me/${intl}?text=${encodeURIComponent(waMessage)}`, '_blank');
  };

  const SingleSlip = ({ copyTitle }: { copyTitle: string }) => (
    <div className="border-2 border-emerald-900/40 rounded-xl p-5 bg-white text-gray-900 text-xs sm:text-sm font-sans relative">
      {/* Watermark Logo / Text */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none select-none font-bold text-6xl tracking-widest text-emerald-950">
        AMMS 2027
      </div>

      {/* Madrasah Header */}
      <div className="border-b-2 border-emerald-800 pb-3 mb-3">
        <div className="flex items-center justify-between gap-3 mb-1">
          <div className="w-14 h-14 rounded-full overflow-hidden p-[1px] border border-emerald-800/40 shrink-0 bg-white shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover rounded-full" />
          </div>
          <div className="flex-1 text-center">
            <div className="text-[10px] sm:text-xs font-semibold text-emerald-800 tracking-wider">
              بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ
            </div>
            <h1 className="text-lg sm:text-xl font-black text-emerald-950 tracking-tight leading-tight">
              আল-মদিনা মডেল মাদ্রাসা এন্ড রিসার্চ ইনস্টিটিউট
            </h1>
            <h2 className="text-xs sm:text-sm font-bold text-gray-700 tracking-wide">
              Al Madina Model Madrasa and Research Institute
            </h2>
            <p className="text-[11px] text-gray-600 mt-0.5">
              ক-৭৫/২, মহাখালী দক্ষিণপাড়া, বনানী, ঢাকা | মোবাইল: ০১৭১২-৬৩৩২৬৪
            </p>
          </div>
          <div className="w-14 h-14 shrink-0 hidden sm:block" />
        </div>

        {/* Slip Title & Copy Badge */}
        <div className="flex items-center justify-between mt-2 pt-1 border-t border-dashed border-gray-300">
          <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded font-bold text-[11px]">
            {copyTitle}
          </span>
          <span className="text-xs sm:text-sm font-extrabold uppercase px-3 py-0.5 bg-emerald-900 text-white rounded">
            অর্থ আদায় রশিদ / MONEY RECEIPT
          </span>
          <span className="text-[11px] font-semibold text-gray-700">
            রশিদ নং: <span className="font-mono text-emerald-950 font-bold">{receipt.receipt_number}</span>
          </span>
        </div>
      </div>

      {/* Student & Payment Info Grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mb-3 text-xs">
        <div>
          <span className="text-gray-500">শিক্ষার্থীর নাম:</span>{' '}
          <span className="font-bold text-gray-900">{receipt.student_name_bn || receipt.student_name}</span>
          {receipt.student_name_bn && receipt.student_name && (
            <span className="text-gray-500 text-[10px]"> ({receipt.student_name})</span>
          )}
        </div>
        <div className="text-right">
          <span className="text-gray-500">তারিখ:</span>{' '}
          <span className="font-semibold text-gray-900">{receipt.payment_date}</span>
        </div>

        <div>
          <span className="text-gray-500">স্টুডেন্ট আইডি:</span>{' '}
          <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-1 rounded">{receipt.student_id_code}</span>
          {receipt.roll_number && (
            <span className="ml-2">
              <span className="text-gray-500">রোল:</span>{' '}
              <span className="font-bold">{toBanglaDigit(receipt.roll_number)}</span>
            </span>
          )}
        </div>
        <div className="text-right">
          <span className="text-gray-500">মোবাইল:</span>{' '}
          <span className="font-semibold">{receipt.guardian_phone || 'প্রযোজ্য নয়'}</span>
        </div>

        <div>
          <span className="text-gray-500">বিভাগ / শ্রেণি:</span>{' '}
          <span className="font-bold text-gray-800">
            {receipt.islamic_department_name || receipt.general_department_name || 'সাধারণ'}
          </span>
        </div>
        <div className="text-right">
          <span className="text-gray-500">শিক্ষাবর্ষ:</span>{' '}
          <span className="font-bold">{toBanglaDigit(receipt.year)}</span>
        </div>
      </div>

      {/* Itemized Fee Breakdown Table */}
      <table className="w-full border-collapse border border-gray-400 mb-2.5 text-xs">
        <thead>
          <tr className="bg-emerald-50/80 text-emerald-950 font-bold text-center">
            <th className="border border-gray-400 py-1 px-2 w-10">ক্র.নং</th>
            <th className="border border-gray-400 py-1 px-3 text-left">ফি’র বিবরণ ও খাত</th>
            <th className="border border-gray-400 py-1 px-2 w-28">প্রযোজ্য মাস</th>
            <th className="border border-gray-400 py-1 px-2 w-24 text-right">দাবি (৳)</th>
            <th className="border border-gray-400 py-1 px-2 w-20 text-right">মওকুফ (৳)</th>
            <th className="border border-gray-400 py-1 px-2 w-24 text-right">আদায়কৃত (৳)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-gray-400 py-1.5 px-2 text-center font-mono">১</td>
            <td className="border border-gray-400 py-1.5 px-3">
              <span className="font-bold">{paymentTypeTitle}</span>
              {receipt.note && <div className="text-[10px] text-gray-500 italic mt-0.5">নোট: {receipt.note}</div>}
            </td>
            <td className="border border-gray-400 py-1.5 px-2 text-center font-medium">
              {monthLabel ? `${monthLabel} ${toBanglaDigit(receipt.year)}` : `${toBanglaDigit(receipt.year)}`}
            </td>
            <td className="border border-gray-400 py-1.5 px-2 text-right font-mono">
              {toBanglaDigit(amountDueNum.toLocaleString('en-IN'))}/-
            </td>
            <td className="border border-gray-400 py-1.5 px-2 text-right font-mono text-gray-600">
              {discountNum > 0 ? `${toBanglaDigit(discountNum.toLocaleString('en-IN'))}/-` : '০/-'}
            </td>
            <td className="border border-gray-400 py-1.5 px-2 text-right font-mono font-bold text-emerald-900">
              {toBanglaDigit(amountPaidNum.toLocaleString('en-IN'))}/-
            </td>
          </tr>
          {/* Subtotal & Balance Row */}
          <tr className="bg-gray-50 font-bold">
            <td colSpan={3} className="border border-gray-400 py-1 px-3 text-right">
              মোট আদায় (Total Paid):
            </td>
            <td colSpan={3} className="border border-gray-400 py-1 px-2 text-right font-mono text-sm text-emerald-900">
              ৳ {toBanglaDigit(amountPaidNum.toLocaleString('en-IN'))}/-
            </td>
          </tr>
        </tbody>
      </table>

      {/* Amount In Words & Remaining Balance */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs mb-6 px-1">
        <div>
          <span className="font-bold text-gray-800">কথায়:</span>{' '}
          <span className="font-semibold text-emerald-950 underline decoration-dotted">{inWords}</span>
        </div>
        {balanceDueNum > 0 ? (
          <div className="text-red-700 font-bold mt-1 sm:mt-0">
            অবশিষ্ট বকেয়া: ৳ {toBanglaDigit(balanceDueNum.toLocaleString('en-IN'))}/-
          </div>
        ) : (
          <div className="text-emerald-700 font-bold flex items-center gap-1 mt-1 sm:mt-0">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>কোনো বকেয়া নেই (পরিশোধিত)</span>
          </div>
        )}
      </div>

      {/* Signature & Seal Block */}
      <div className="grid grid-cols-3 items-end pt-8 text-center text-[11px] font-semibold text-gray-700">
        <div>
          <div className="border-t border-gray-600 pt-1 mx-4">
            শিক্ষার্থী / অভিভাবকের স্বাক্ষর
          </div>
        </div>
        <div>
          <div className="text-emerald-900 font-bold text-[10px] mb-0.5">
            {receipt.collected_by_name ? `আদায়কারী: ${receipt.collected_by_name}` : 'অনুমোদিত ভাউচার'}
          </div>
          <div className="border-t border-gray-600 pt-1 mx-4">
            আদায়কারীর স্বাক্ষর
          </div>
        </div>
        <div>
          <div className="text-emerald-950 font-black text-[10px] mb-0.5">
            মাওলানা ওমর ফারুক মুজাহিদী
          </div>
          <div className="border-t border-gray-600 pt-1 mx-4">
            অধ্যক্ষ / হিসাবরক্ষকের সিল ও স্বাক্ষর
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white print:static print:inset-auto">
      {/* Outer Modal Container */}
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden print:shadow-none print:w-full print:max-w-none print:rounded-none">
        
        {/* Top Floating Action Bar (Hidden on Print) */}
        <div className="print:hidden bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-950 p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-bold text-sm sm:text-base">প্রিন্ট-রেডি মানি রিসিট (ফি রশিদ)</h3>
              <p className="text-xs text-emerald-200">রশিদ নং: {receipt.receipt_number} • ছাত্র ও অফিস কপি</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleSendWhatsApp}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs sm:text-sm shadow-md transition-transform active:scale-95"
              title="অভিভাবকের WhatsApp-এ রশিদ পাঠান"
            >
              <MessageSquare className="w-4 h-4 text-emerald-100" />
              <span>WhatsApp-এ পাঠান</span>
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-emerald-950 rounded-xl font-bold text-xs sm:text-sm shadow-lg transition-transform active:scale-95"
            >
              <Printer className="w-4 h-4 text-emerald-950" />
              <span>রশিদ প্রিন্ট (A4)</span>
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                title="বন্ধ করুন"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Printable Area: Contains Student Copy + Cutting Line + Office Copy */}
        <div className="p-4 sm:p-6 space-y-6 print:p-0 print:space-y-4 font-sans bg-white" id="money-receipt-printable">
          
          {/* SLIP 1: STUDENT COPY */}
          <SingleSlip copyTitle="ছাত্র কপি (STUDENT COPY)" />

          {/* PERFORATION / CUTTING LINE */}
          <div className="relative flex items-center justify-center my-3 print:my-2">
            <div className="w-full border-t-2 border-dashed border-gray-400" />
            <span className="absolute px-3 bg-white text-gray-500 text-[10px] font-mono tracking-wider flex items-center gap-1">
              ✂️ এখান থেকে কাটুন (Perforation Line) — উপরের অংশ ছাত্র কপি ও নিচের অংশ অফিস কপি
            </span>
          </div>

          {/* SLIP 2: OFFICE / MADRASAH COPY */}
          <SingleSlip copyTitle="অফিস কপি (OFFICE COPY)" />
        </div>

        {/* Bottom Print Button Bar for Ease of Use (Hidden on Print) */}
        <div className="print:hidden bg-gray-50 border-t border-gray-200 p-4 flex items-center justify-between">
          <p className="text-xs text-gray-500">
            💡 টিপস: প্রিন্ট বাটনে চাপ দিলে একটি A4 পাতায় ২টি কপি (ছাত্র ও মাদ্রাসা) নিখুঁতভাবে প্রিন্ট হবে।
          </p>
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleSendWhatsApp}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs sm:text-sm shadow-md transition-transform active:scale-95"
            >
              <MessageSquare className="w-4 h-4 text-emerald-100" />
              <span>WhatsApp-এ পাঠান</span>
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs sm:text-sm shadow-md transition-transform active:scale-95"
            >
              <Printer className="w-4 h-4 text-amber-300" />
              <span>মানি রিসিট প্রিন্ট</span>
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-200 transition-colors"
              >
                বন্ধ করুন
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
