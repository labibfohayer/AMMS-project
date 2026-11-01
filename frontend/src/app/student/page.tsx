/* eslint-disable */
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import Link from 'next/link';
import { isLoggedIn } from '@/lib/auth';
import { 
  User, Award, Calendar, DollarSign, CalendarCheck, BookOpen, 
  Clock, ShieldCheck, Printer, Bell, CheckCircle2, AlertCircle, 
  Sparkles, FileText, ChevronRight, MapPin, Phone, ExternalLink 
} from 'lucide-react';
import { toBanglaDigit } from '@/lib/numberToBanglaWords';
import StudentIDCard from '@/components/students/StudentIDCard';

const SAMPLE_ROUTINE = [
  { time: 'ফজরের পর - ৬:৩০', subject: 'হিফজুল কুরআন (নতুন সবক)', teacher: 'হাফেজ মাওলানা আবদুর রহমান', room: 'হলরুম - ২' },
  { time: 'সকাল ৮:০০ - ৯:০০', subject: 'কুরআন তাজবিদ ও মাখরাজ', teacher: 'মাওলানা মোহাম্মদ নোমান', room: 'ক্লাস রুম ৩' },
  { time: 'সকাল ৯:১৫ - ১০:১৫', subject: 'আরবি ভাষা ও ব্যাকরণ (নাহু-সরফ)', teacher: 'মুহাম্মদ মাহফুজুর রহমান', room: 'ক্লাস রুম ৩' },
  { time: 'সকাল ১০:৩০ - ১১:৩০', subject: 'সাধারণ শিক্ষা (গণিত ও বিজ্ঞান)', teacher: 'উস্তাদ শফিকুল ইসলাম', room: 'কম্পিউটার ল্যাব' },
  { time: 'যোহরের পর - ৩:০০', subject: 'আমপারা ও সবক দোহর (রিভিশন)', teacher: 'হাফেজ মাওলানা আবদুর রহমান', room: 'হলরুম - ২' },
];

const SAMPLE_EXAM_MARKS = [
  { subject: 'আল-কুরআনুল কারীম (হিফজ/নাজেরা)', full: 100, marks: 98, grade: 'A+' },
  { subject: 'তাজবিদ ও কেরাত', full: 100, marks: 95, grade: 'A+' },
  { subject: 'আকাইদ ও ফিকহ', full: 100, marks: 92, grade: 'A+' },
  { subject: 'আরবি ভাষা ও ব্যাকরণ', full: 100, marks: 88, grade: 'A+' },
  { subject: 'বাংলা ও সাধারণ জ্ঞান', full: 100, marks: 85, grade: 'A' },
  { subject: 'ইংরেজি ও গণিত', full: 100, marks: 90, grade: 'A+' },
];

export default function StudentDashboard() {
  const { user, isMounted } = useAuth();
  const { t, d, isBangla } = useLanguage();
  const [showIdCardModal, setShowIdCardModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!isMounted) return;
    if (!isLoggedIn()) {
      router.replace('/login');
    }
  }, [isMounted, router]);

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[#021307] flex items-center justify-center p-8">
        <div className="w-10 h-10 border-4 border-amber-400/20 border-t-amber-400 rounded-full animate-spin" />
      </div>
    );
  }

  // 1. Fetch Student Profile
  const { data: student, isLoading: isStudentLoading } = useQuery({
    queryKey: ['student_me_profile'],
    queryFn: async () => {
      const res = await api.get('/api/students/me/');
      return res.data;
    }
  });

  // 2. Fetch Fee Status
  const { data: feeStatus } = useQuery({
    queryKey: ['student_my_fee_status', student?.student_id],
    queryFn: async () => {
      if (!student?.student_id) return null;
      const res = await api.get(`/api/fees/students/${student.student_id}/status/`);
      return res.data;
    },
    enabled: !!student?.student_id
  });

  // 3. Fetch Leaves Status
  const { data: myLeaves = [] } = useQuery({
    queryKey: ['student_my_leaves', student?.student_id],
    queryFn: async () => {
      if (!student?.student_id) return [];
      const res = await api.get(`/api/students/leaves/?student=${student.student_id}`);
      return res.data;
    },
    enabled: !!student?.student_id
  });

  const totalDueNum = Number(feeStatus?.total_due_this_year || 0);
  const isFeePaid = totalDueNum === 0;

  return (
    <AppLayout title={isBangla ? 'শিক্ষার্থী ড্যাশবোর্ড' : 'Student Portal'}>
      <div className="space-y-6 pb-20">
        
        {/* ===================== STUDENT HERO HEADER ===================== */}
        <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white border border-emerald-500/25 shadow-xl overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl p-[2px] bg-gradient-to-tr from-amber-400 via-emerald-400 to-amber-500 shadow-xl shrink-0">
                <img 
                  src={student?.photo ? (student.photo.startsWith('http') || student.photo.startsWith('/') ? student.photo : `/${student.photo}`) : '/logo.jpg'} 
                  alt={student?.name || 'শিক্ষার্থী'} 
                  className="w-full h-full object-cover rounded-2xl bg-white"
                />
                <span className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 border-2 border-emerald-950 rounded-full flex items-center justify-center text-xs text-white font-bold" title="সক্রিয় শিক্ষার্থী">
                  ✓
                </span>
              </div>

              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-semibold">
                  <Sparkles size={12} className="text-amber-400" />
                  <span>শিক্ষাবর্ষ {toBanglaDigit(student?.academic_year || 2026)} • {student?.residential_status === 'residential' ? 'আবাসিক ছাত্র' : 'অনাবাসিক ছাত্র'}</span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  আস-সালামু আলাইকুম, {student?.name_bn || user?.name_bn || 'শিক্ষার্থী'}!
                </h1>

                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-emerald-200/90 font-medium pt-1">
                  <span className="font-mono bg-emerald-900/60 px-2 py-0.5 rounded border border-emerald-500/30">
                    আইডি: {student?.student_id || 'STU-2026-001'}
                  </span>
                  <span>•</span>
                  <span>রোল: <strong>{toBanglaDigit(student?.roll_number || '০১')}</strong></span>
                  <span>•</span>
                  <span className="text-amber-300 font-semibold">
                    {student?.islamic_department_name_bn || student?.general_department_name_bn || 'হিফজুল কুরআন বিভাগ'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action Button on Hero */}
            <div className="flex flex-wrap items-center gap-2.5">
              {student && (
                <button
                  onClick={() => setShowIdCardModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg transition active:scale-95"
                >
                  <Printer size={16} />
                  <span>ডিজিটাল আইডি কার্ড</span>
                </button>
              )}
              <Link
                href="/students/leaves"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold text-xs sm:text-sm transition backdrop-blur-md"
              >
                <ShieldCheck size={16} className="text-emerald-400" />
                <span>ছুটি ও গেটপাস</span>
              </Link>
            </div>
          </div>
        </div>

        {/* ===================== 4 BENTO METRIC CARDS ===================== */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          
          {/* Card 1: Attendance Ring */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">উপস্থিতির হার</span>
              <span className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CalendarCheck size={16} />
              </span>
            </div>
            <div>
              <h3 className="text-3xl font-black text-emerald-700 font-mono">৯৬.৫%</h3>
              <p className="text-[11px] text-slate-500 mt-1">চলতি মাসে ২৫ দিন ক্লাসে উপস্থিত</p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
              <span>অনুপস্থিত: ০ দিন</span>
              <span className="text-emerald-700 font-bold">নিয়মিত</span>
            </div>
          </div>

          {/* Card 2: Academic Exam Result */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">সর্বশেষ ফলাফল</span>
              <span className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                <Award size={16} />
              </span>
            </div>
            <div>
              <h3 className="text-3xl font-black text-amber-600 font-mono">৫.০০</h3>
              <p className="text-[11px] text-slate-500 mt-1">গোল্ডেন এ প্লাস (A+)</p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
              <span>মেধা স্থান: <strong className="text-emerald-800 font-bold">১ম</strong></span>
              <span className="text-amber-700 font-semibold">১ম সাময়িক পরীক্ষা</span>
            </div>
          </div>

          {/* Card 3: Fee Status */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">বেতন ও ফি স্ট্যাটাস</span>
              <span className={`w-8 h-8 rounded-full flex items-center justify-center ${isFeePaid ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                <DollarSign size={16} />
              </span>
            </div>
            <div>
              <h3 className={`text-2xl font-black font-mono ${isFeePaid ? 'text-emerald-700' : 'text-rose-600'}`}>
                {isFeePaid ? 'পরিশোধিত' : `বকেয়া ৳ ${toBanglaDigit(totalDueNum)}`}
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">
                {isFeePaid ? 'আলহামদুলিল্লাহ, কোনো বকেয়া নেই' : 'দ্রুত ফি পরিশোধের অনুরোধ'}
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">মাসিক ফি: ৳ {toBanglaDigit(student?.monthly_fee || 1500)}</span>
              <Link href="/guardian" className="text-emerald-700 font-bold hover:underline">রসিদ</Link>
            </div>
          </div>

          {/* Card 4: Hostel / Leaves */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">ছুটি ও গেটপাস</span>
              <span className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                <ShieldCheck size={16} />
              </span>
            </div>
            <div>
              <h3 className="text-2xl font-black text-blue-700 font-mono">
                {toBanglaDigit(myLeaves.length)} টি
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">
                অনুমোদিত গেটপাস: {toBanglaDigit(myLeaves.filter((l: any) => l.status === 'approved').length)} টি
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
              <span className="text-emerald-700 font-semibold">হোস্টেল: কক্ষ ২০৩</span>
              <Link href="/students/leaves" className="text-blue-700 font-bold hover:underline">ট্র্যাকার</Link>
            </div>
          </div>

        </div>

        {/* ===================== TWO COLUMN CONTENT ===================== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left: Routine & Class Schedule */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Today's Teaching Routine */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
                    <Clock size={18} />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-slate-900 dark:text-white">আজকের ক্লাস ও পাঠ পরিকল্পনা</h2>
                    <p className="text-xs text-slate-500">হিফজ ও ইসলামিক অ্যাকাডেমিক দৈনিক সময়সূচি</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-bold border border-emerald-200">
                  আজকের রুটিন
                </span>
              </div>

              <div className="space-y-3">
                {SAMPLE_ROUTINE.map((r, i) => (
                  <div key={i} className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 hover:border-emerald-300 transition">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold text-xs shrink-0">
                        {toBanglaDigit(i + 1)}
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">{r.subject}</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          ওস্তাদ: <strong className="text-slate-700 dark:text-slate-300">{r.teacher}</strong> • {r.room}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs font-mono font-bold shadow-xs border border-slate-200 dark:border-slate-700">
                        {r.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Exam Marks Overview */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center font-bold">
                    <FileText size={18} />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-slate-900 dark:text-white">সাম্প্রতিক পরীক্ষার বিষয়ভিত্তিক ফলাফল</h2>
                    <p className="text-xs text-slate-500">১ম সাময়িক মূল্যায়ন পরীক্ষা ২০২৬</p>
                  </div>
                </div>
                <Link href="/exams" className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1">
                  <span>পূর্ণ মার্কশিট</span>
                  <ChevronRight size={14} />
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                    <tr>
                      <th className="p-2.5 rounded-l-xl">বিষয়</th>
                      <th className="p-2.5 text-center">পূর্ণমান</th>
                      <th className="p-2.5 text-center">প্রাপ্ত নম্বর</th>
                      <th className="p-2.5 text-center rounded-r-xl">গ্রেড</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {SAMPLE_EXAM_MARKS.map((m, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="p-2.5 font-bold text-slate-800 dark:text-slate-200">{m.subject}</td>
                        <td className="p-2.5 text-center font-mono text-slate-500">{toBanglaDigit(m.full)}</td>
                        <td className="p-2.5 text-center font-mono font-bold text-emerald-800 dark:text-emerald-400 text-sm">
                          {toBanglaDigit(m.marks)}
                        </td>
                        <td className="p-2.5 text-center">
                          <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold font-mono text-xs">
                            {m.grade}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* Right: Profile Details & Madrasah Notices */}
          <div className="space-y-6">
            
            {/* Student ID & Personal Info Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
                <User size={16} className="text-emerald-700" />
                <span>ব্যক্তিগত তথ্য বিবরণী</span>
              </h3>

              <div className="space-y-2.5 text-xs">
                <div>
                  <span className="text-slate-500 block">শিক্ষার্থীর নাম:</span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">{student?.name_bn || 'আবদুল্লাহ আল মাহদী'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">পিতার নাম:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{student?.father_name_bn || student?.guardian_name || 'মুহাম্মদ রফিকুল ইসলাম'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">অভিভাবকের মোবাইল:</span>
                  <span className="font-mono font-bold text-emerald-800 dark:text-emerald-400">{student?.guardian_phone || '০১৮১১-২২৩৩৪۴'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">ঠিকানা:</span>
                  <span className="text-slate-700 dark:text-slate-300 leading-relaxed">{student?.present_address || 'ক-৭৫/২, মহাখালী দক্ষিণপাড়া, বনানী, ঢাকা'}</span>
                </div>
              </div>

              {student && (
                <button
                  onClick={() => setShowIdCardModal(true)}
                  className="w-full mt-2 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition"
                >
                  <Printer size={14} />
                  <span>আইডি কার্ড প্রিন্ট করুন</span>
                </button>
              )}
            </div>

            {/* Quick Links / Shortcuts */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
                <BookOpen size={16} className="text-amber-600" />
                <span>প্রয়োজনীয় লিংক ও পোর্টাল</span>
              </h3>

              <div className="space-y-2">
                <Link
                  href="/students/leaves"
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-800 transition"
                >
                  <span className="flex items-center gap-2">
                    <ShieldCheck size={16} className="text-emerald-600" />
                    <span>ছুটির আবেদন ও গেটপাস</span>
                  </span>
                  <ChevronRight size={14} className="text-slate-400" />
                </Link>

                <Link
                  href="/exams"
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-800 transition"
                >
                  <span className="flex items-center gap-2">
                    <Award size={16} className="text-amber-600" />
                    <span>পরীক্ষার গ্রেড ও মেরিট লিস্ট</span>
                  </span>
                  <ChevronRight size={14} className="text-slate-400" />
                </Link>

                <Link
                  href="/guardian"
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-800 transition"
                >
                  <span className="flex items-center gap-2">
                    <DollarSign size={16} className="text-blue-600" />
                    <span>বেতন ও অনলাইন ফি রসিদ</span>
                  </span>
                  <ChevronRight size={14} className="text-slate-400" />
                </Link>

                <Link
                  href="/notices"
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-800 transition"
                >
                  <span className="flex items-center gap-2">
                    <Bell size={16} className="text-purple-600" />
                    <span>মাদ্রাসার নোটিশ বোর্ড</span>
                  </span>
                  <ChevronRight size={14} className="text-slate-400" />
                </Link>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Student ID Card Modal */}
      {showIdCardModal && student && (
        <StudentIDCard
          student={{
            id: student.id,
            student_id: student.student_id,
            name: student.name,
            name_bn: student.name_bn,
            photo: student.photo,
            roll_number: student.roll_number,
            academic_year: student.academic_year,
            islamic_department_name_bn: student.islamic_department_name_bn,
            general_department_name_bn: student.general_department_name_bn,
            blood_group: student.blood_group,
            date_of_birth: student.date_of_birth,
            guardian_name: student.guardian_name,
            guardian_phone: student.guardian_phone,
            present_address: student.present_address,
            residential_status: student.residential_status
          }}
          onClose={() => setShowIdCardModal(false)}
        />
      )}

    </AppLayout>
  );
}
