/* eslint-disable */
'use client';

import React from 'react';
import { 
  Printer, X, CheckCircle2, ShieldCheck, AlertCircle, Clock, 
  User, Calendar, MapPin, Phone, Building, QrCode, FileText, Share2 
} from 'lucide-react';
import { toBanglaDigit } from '@/lib/numberToBanglaWords';

export interface StudentGatePassData {
  id?: number | string;
  leave_no: string;
  gate_pass_no?: string;
  student_name: string;
  student_name_bn: string;
  student_uid: string;
  student_roll?: number | string;
  student_photo?: string | null;
  department_name_bn?: string;
  residential_status?: string;
  room_number?: string | number | null;
  
  leave_type: string;
  leave_type_display?: string;
  from_date: string;
  to_date: string;
  total_days: number;
  reason: string;
  
  applied_by_guardian: string;
  guardian_phone: string;
  relationship: string;
  emergency_contact?: string;
  
  departure_time?: string;
  expected_return_time?: string;
  
  status: 'pending' | 'approved' | 'rejected';
  status_display?: string;
  reviewed_by_name?: string;
  reviewed_at?: string;
  review_comment?: string;
  created_at?: string;
}

const LEAVE_TYPE_MAP: { [key: string]: string } = {
  sick: 'অসুস্থতাজনিত ছুটি (Medical Leave)',
  family: 'জরুরি পারিবারিক কাজ (Family Emergency)',
  event: 'সামাজিক/পারিবারিক অনুষ্ঠান (Social Event)',
  exam_prep: 'পরীক্ষার প্রস্তুতি / বাড়িতে অধ্যয়ন',
  other: 'অন্যান্য জরুরি ছুটি (Other)'
};

interface PrintableGatePassProps {
  gatePass: StudentGatePassData;
  onClose?: () => void;
}

export default function PrintableGatePass({ gatePass, onClose }: PrintableGatePassProps) {
  const handlePrint = () => {
    window.print();
  };

  const leaveTypeLabel = LEAVE_TYPE_MAP[gatePass.leave_type] || gatePass.leave_type_display || gatePass.leave_type;
  const isApproved = gatePass.status === 'approved';
  const gatePassNo = gatePass.gate_pass_no || `GP-${new Date().getFullYear()}-XXXX`;

  const handleSendWhatsApp = () => {
    const waMessage = 
      `আস-সালামু আলাইকুম!\n` +
      `*আল-মদিনা মডেল মাদ্রাসা এন্ড রিসার্চ ইনস্টিটিউট*\n` +
      `ক-৭৫/২, মহাখালী দক্ষিণপাড়া, বনানী, ঢাকা | ০১৭১২-৬৩৩২৬৪\n\n` +
      `🎫 *শিক্ষার্থী সাময়িক ছুটি ও গেটপাস*\n` +
      `────────────────────────\n` +
      `গেটপাস নং: *${gatePassNo}*\n` +
      `ট্র্যাকিং আইডি: ${gatePass.leave_no}\n` +
      `শিক্ষার্থী: *${gatePass.student_name_bn || gatePass.student_name}* (ID: ${gatePass.student_uid})\n` +
      `বিভাগ: ${gatePass.department_name_bn || 'হিফজ/নাজেরা'}\n` +
      `ছুটির মেয়াদ: *${gatePass.from_date} হতে ${gatePass.to_date}* (${toBanglaDigit(gatePass.total_days)} দিন)\n` +
      `প্রস্থানের সময়: *${gatePass.departure_time || 'নির্ধারিত সময়'}*\n` +
      `ফেরার সময়: *${gatePass.expected_return_time || 'নির্ধারিত সময়'}*\n` +
      `স্ট্যাটাস: *${isApproved ? 'অনুমোদিত (APPROVED)' : 'প্রক্রিয়াধীন'}*\n` +
      `মন্তব্য: ${gatePass.review_comment || 'যথাযথ অনুমোদন দেওয়া হলো'}\n` +
      `────────────────────────\n` +
      `অনলাইন গেটপাস লিংক:\n` +
      `http://localhost:3000/students/leaves/${gatePass.id || ''}/gatepass\n\n` +
      `জাযাকাল্লাহু খাইরান।`;

    const rawPhone = gatePass.guardian_phone || gatePass.emergency_contact || '01712633264';
    const clean = rawPhone.replace(/[^0-9]/g, '');
    const intl = clean.startsWith('880') ? clean : clean.startsWith('0') ? `88${clean}` : `880${clean}`;
    window.open(`https://wa.me/${intl}?text=${encodeURIComponent(waMessage)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:static print:inset-auto">
      {/* Container */}
      <div className="bg-white text-zinc-900 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden print:shadow-none print:w-full print:max-w-none print:rounded-none flex flex-col my-auto border border-emerald-900/10">
        
        {/* Top Control Bar - Hidden during printing */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800 print:hidden shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-white">ডিজিটাল গেটপাস ও ক্লিয়ারেন্স স্লিপ</h2>
              <p className="text-xs text-slate-400 font-mono">আইডি: {gatePass.leave_no}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSendWhatsApp}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition shadow-sm"
              title="অভিভাবকের হোয়াটসঅ্যাপে গেটপাস লিংক পাঠান"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>হোয়াটসঅ্যাপ</span>
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold shadow-md transition"
            >
              <Printer className="w-4 h-4" />
              <span>প্রিন্ট করুন</span>
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Printable Pass Body */}
        <div className="p-6 sm:p-8 space-y-5 print:p-6 print:space-y-4">
          
          {/* Header Branding */}
          <div className="flex items-center justify-between border-b-2 border-emerald-800/30 pb-4">
            <div className="flex items-center gap-4">
              <img 
                src="/logo.jpg" 
                alt="আল-মদিনা মডেল মাদ্রাসা" 
                className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl border border-emerald-700/20 shadow-sm shrink-0" 
              />
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                  DARUL ULOOM & RESIDENTIAL CAMPUS
                </span>
                <h1 className="text-lg sm:text-2xl font-black text-emerald-950 tracking-tight leading-tight mt-1">
                  আল-মদিনা মডেল মাদ্রাসা এন্ড রিসার্চ ইনস্টিটিউট
                </h1>
                <p className="text-xs text-zinc-600 font-medium">
                  ক-৭৫/২, মহাখালী দক্ষিণপাড়া, বনানী, ঢাকা-১২১২ | হটলাইন: ০১৭১২-৬৩৩২৬৪
                </p>
                <p className="text-[11px] text-emerald-800 font-semibold">
                  নাজেরা, হিফজুল কুরআন, কিতাব ও আধুনিক জেনারেল বিভাগ
                </p>
              </div>
            </div>

            {/* Official Pass Badge */}
            <div className="text-right shrink-0">
              <div className="bg-emerald-900 text-amber-300 font-bold px-3 py-1 rounded-md text-xs tracking-wider inline-block shadow-sm">
                শিক্ষার্থী গেটপাস
              </div>
              <p className="text-[11px] font-mono text-zinc-500 mt-1">
                GATE PASS CLEARANCE
              </p>
            </div>
          </div>

          {/* Identification Banner */}
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-700 text-white rounded-lg">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-emerald-800 font-bold">গেটপাস নম্বর (GATE PASS NO)</p>
                <p className="text-lg font-black font-mono text-emerald-950">{gatePassNo}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-medium text-zinc-700">
              <div>
                <span className="text-zinc-500 block text-[10px]">আবেদন নং:</span>
                <span className="font-mono font-bold text-zinc-900">{gatePass.leave_no}</span>
              </div>
              <div className="h-7 w-[1px] bg-emerald-200"></div>
              <div>
                <span className="text-zinc-500 block text-[10px]">স্ট্যাটাস:</span>
                <span className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded text-[11px] ${
                  isApproved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                }`}>
                  <CheckCircle2 className="w-3 h-3" />
                  {isApproved ? 'অনুমোদিত (APPROVED)' : 'প্রক্রিয়াধীন (PENDING)'}
                </span>
              </div>
            </div>
          </div>

          {/* Student & Guardian Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Student Card with Photo */}
            <div className="md:col-span-2 bg-zinc-50 border border-zinc-200 rounded-xl p-4 flex gap-4">
              <div className="w-20 h-24 rounded-lg bg-zinc-200 border border-zinc-300 overflow-hidden shrink-0 flex items-center justify-center">
                {gatePass.student_photo ? (
                  <img src={gatePass.student_photo} alt={gatePass.student_name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-zinc-400" />
                )}
              </div>

              <div className="flex-1 space-y-1.5 text-xs">
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 leading-tight">
                    {gatePass.student_name_bn}
                  </h3>
                  <p className="text-zinc-600 font-medium text-[11px]">{gatePass.student_name}</p>
                </div>

                <div className="grid grid-cols-2 gap-x-2 gap-y-1 pt-1 text-[11px]">
                  <div>
                    <span className="text-zinc-500">আইডি কোড: </span>
                    <span className="font-mono font-bold text-emerald-900">{gatePass.student_uid}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500">রোল নং: </span>
                    <span className="font-bold text-zinc-900">{toBanglaDigit(gatePass.student_roll || '-')}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-zinc-500">বিভাগ/শ্রেণি: </span>
                    <span className="font-bold text-zinc-800">{gatePass.department_name_bn || 'হিফজুল কুরআন বিভাগ'}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500">আবাসিক অবস্থা: </span>
                    <span className="font-semibold text-emerald-800">
                      {gatePass.residential_status === 'residential' ? 'আবাসিক (হোস্টেল)' : 'অনাবাসিক'}
                    </span>
                  </div>
                  {gatePass.room_number && (
                    <div>
                      <span className="text-zinc-500">হোস্টেল রুম: </span>
                      <span className="font-mono font-bold text-zinc-800">কক্ষ #{gatePass.room_number}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Guardian & Contact */}
            <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3.5 space-y-2 text-xs">
              <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">অভিভাবকের তথ্য</p>
              <div>
                <p className="text-zinc-500 text-[11px]">অভিভাবকের নাম:</p>
                <p className="font-bold text-zinc-900">{gatePass.applied_by_guardian} ({gatePass.relationship || 'পিতা'})</p>
              </div>
              <div>
                <p className="text-zinc-500 text-[11px]">মোবাইল নম্বর:</p>
                <p className="font-mono font-bold text-emerald-900">{gatePass.guardian_phone}</p>
              </div>
              {gatePass.emergency_contact && gatePass.emergency_contact !== gatePass.guardian_phone && (
                <div>
                  <p className="text-zinc-500 text-[11px]">জরুরি যোগাযোগ:</p>
                  <p className="font-mono font-bold text-zinc-800">{gatePass.emergency_contact}</p>
                </div>
              )}
            </div>
          </div>

          {/* Leave Details Table / Bento */}
          <div className="border border-zinc-200 rounded-xl overflow-hidden text-xs">
            <div className="bg-emerald-950 text-white font-bold px-4 py-2 flex items-center justify-between">
              <span>ছুটির অনুমোদন ও সময়সূচির বিবরণ</span>
              <span className="text-amber-300 text-[11px] font-normal">মেয়াদ: {toBanglaDigit(gatePass.total_days)} দিন</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-zinc-200 bg-white">
              
              {/* Left Column: Dates & Times */}
              <div className="p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">ছুটির ধরন:</span>
                  <span className="font-bold text-emerald-950">{leaveTypeLabel}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">ছুটির তারিখ:</span>
                  <span className="font-bold text-zinc-900">{gatePass.from_date} হতে {gatePass.to_date}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">ক্যাম্পাস ত্যাগের সময়:</span>
                  <span className="font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    {gatePass.departure_time || 'অনুমোদিত সময় অনুযায়ী'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">মাদ্রাসায় উপস্থিতির শেষ সময়:</span>
                  <span className="font-bold text-red-950 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                    {gatePass.expected_return_time || 'নির্ধারিত তারিখ সকাল ৮:০০'}
                  </span>
                </div>
              </div>

              {/* Right Column: Reason & Teacher Comment */}
              <div className="p-3.5 space-y-2.5 bg-zinc-50/50">
                <div>
                  <span className="text-zinc-500 block text-[11px]">ছুটির আবেদনকৃত কারণ:</span>
                  <p className="font-medium text-zinc-800 mt-0.5 italic">"{gatePass.reason}"</p>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[11px]">অনুমোদনকারী শিক্ষকের মন্তব্য:</span>
                  <p className="font-semibold text-emerald-950 mt-0.5">
                    {gatePass.review_comment || 'যথাযথ পর্যালোচনা পূর্বক ছুটি মঞ্জুর করা হলো।'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Security Guard & Gatekeeper Check Section */}
          <div className="bg-amber-50/50 border border-amber-200/80 rounded-xl p-3.5 text-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-amber-950 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                গেট সিকিউরিটি ও দারোয়ানের এন্ট্রি রেকর্ড (Security Clearance)
              </span>
              <span className="text-[10px] text-zinc-500">দারোয়ান বা গেট ইন-চার্জ পূরণ করবেন</span>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-1 text-[11px]">
              <div className="bg-white p-2 rounded border border-amber-200/60">
                <span className="text-zinc-500 block text-[10px]">ক্যাম্পাস ত্যাগের সময়:</span>
                <span className="font-mono text-zinc-700 block mt-1">তারিখ: ____/____ সময়: ____:____</span>
              </div>
              <div className="bg-white p-2 rounded border border-amber-200/60">
                <span className="text-zinc-500 block text-[10px]">পুনঃপ্রবেশের সময়:</span>
                <span className="font-mono text-zinc-700 block mt-1">তারিখ: ____/____ সময়: ____:____</span>
              </div>
              <div className="bg-white p-2 rounded border border-amber-200/60">
                <span className="text-zinc-500 block text-[10px]">সিকিউরিটি ইন-চার্জ স্বাক্ষর:</span>
                <span className="font-mono text-zinc-700 block mt-1">স্বাক্ষর: _________________</span>
              </div>
            </div>
          </div>

          {/* Verification QR Code & Official Signatures */}
          <div className="pt-4 flex items-end justify-between border-t border-zinc-200 gap-4">
            
            {/* Digital Verification Seal & QR */}
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 border-2 border-emerald-800/30 rounded-lg p-1 bg-white shadow-sm flex flex-col items-center justify-center shrink-0">
                <QrCode className="w-10 h-10 text-emerald-900" />
                <span className="text-[7px] font-mono text-zinc-500">SCAN TO VERIFY</span>
              </div>
              <div className="text-[10px] text-zinc-600 space-y-0.5">
                <p className="font-bold text-emerald-950">ডিজিটাল ক্লিয়ারেন্স ভেরিফাইড</p>
                <p>ভেরিফিকেশন: amms.madrasah/gatepass</p>
                <p className="font-mono text-[9px] text-zinc-400">Security Hash: {gatePass.leave_no}-{gatePass.student_uid}</p>
              </div>
            </div>

            {/* Authorizer Signatures */}
            <div className="flex items-end gap-6 text-center text-xs">
              <div className="space-y-1">
                <div className="h-10 flex items-center justify-center">
                  <span className="text-xs font-serif font-bold text-emerald-900 italic">
                    {gatePass.reviewed_by_name || 'মুহতামিম / শ্রেণি শিক্ষক'}
                  </span>
                </div>
                <div className="w-28 border-t border-zinc-400"></div>
                <p className="text-[10px] text-zinc-600">অনুমোদনকারী শিক্ষক</p>
              </div>

              <div className="space-y-1">
                <div className="h-10 flex items-center justify-center">
                  <img src="/principal.jpg" alt="সিল" className="h-9 object-contain mix-blend-multiply" />
                </div>
                <div className="w-28 border-t border-zinc-400"></div>
                <p className="text-[10px] text-zinc-600 font-bold">মুহতামিম / ভাইস প্রিন্সিপাল</p>
              </div>
            </div>
          </div>

          {/* Instructions / Rules Footer */}
          <div className="bg-zinc-100 rounded-lg p-2.5 text-[10px] text-zinc-600 space-y-0.5 leading-relaxed">
            <p className="font-bold text-zinc-800">⚠️ শিক্ষার্থীদের প্রতি মাদ্রাসার নির্দেশনাবলী:</p>
            <p>১. গেটপাস প্রদর্শন ব্যতিরেকে কোনো আবাসিক শিক্ষার্থীকে ক্যাম্পাসের বাইরে যেতে দেওয়া হবে না।</p>
            <p>২. ছুটির মেয়াদ শেষ হওয়ার পূর্বেই মাদ্রাসায় প্রত্যাবর্তন বাধ্যতামূলক। যৌক্তিক কারণ ছাড়া বিলম্ব হলে প্রতিদিনের জন্য ১০০/- টাকা জরিমানা প্রযোজ্য হতে পারে।</p>
            <p>৩. ফিরে আসার সাথে সাথে গেটপাসটি দারোয়ানের নিকট এন্ট্রি করিয়ে হোস্টেল সুপারকে রিপোর্ট করতে হবে।</p>
          </div>

        </div>
      </div>
    </div>
  );
}
