/* eslint-disable */
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { isLoggedIn } from '@/lib/auth';
import { 
  CreditCard, Smartphone, CheckCircle2, AlertCircle, Clock, 
  Printer, Send, Sparkles, User, Calendar, DollarSign, 
  Copy, ExternalLink, ShieldCheck, ChevronRight, BookOpen, 
  ArrowRight, Award, RefreshCw, X, CalendarCheck, Plus, Eye, Share2
} from 'lucide-react';
import { toBanglaDigit } from '@/lib/numberToBanglaWords';
import PrintableMoneyReceipt, { FeeReceiptData } from '@/components/fees/PrintableMoneyReceipt';
import PrintableGatePass, { StudentGatePassData } from '@/components/students/PrintableGatePass';


const MONTH_NAMES = [
  '', 'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
];

export default function GuardianDashboard() {
  const { user, isMounted } = useAuth();
  const { t, d, isBangla } = useLanguage();
  const queryClient = useQueryClient();
  const router = useRouter();

  useEffect(() => {
    if (!isMounted) return;
    if (!isLoggedIn()) {
      router.replace('/login');
    }
  }, [isMounted, router]);

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[#FAF6ED] flex items-center justify-center p-8">
        <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    );
  }

  // Selected Student State
  const [selectedStudentIdx, setSelectedStudentIdx] = useState<number>(0);

  // Online Payment Modal State
  const [isPayModalOpen, setIsPayModalOpen] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<'bkash' | 'nagad' | 'rocket'>('bkash');
  const [paymentType, setPaymentType] = useState<'monthly' | 'hostel' | 'exam' | 'admission'>('monthly');
  const [paymentMonth, setPaymentMonth] = useState<number>(new Date().getMonth() + 1);
  const [paymentYear, setPaymentYear] = useState<number>(new Date().getFullYear());
  const [amount, setAmount] = useState<string>('');
  const [senderPhone, setSenderPhone] = useState<string>('');
  const [trxId, setTrxId] = useState<string>('');
  const [customNote, setCustomNote] = useState<string>('');

  // Printable Receipt Modal State
  const [activeReceipt, setActiveReceipt] = useState<FeeReceiptData | null>(null);

  // Tab State: 'fees' | 'leaves'
  const [activeTab, setActiveTab] = useState<'fees' | 'leaves'>('fees');

  // Leave Modal & Gate Pass States
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState<boolean>(false);
  const [activeGatePass, setActiveGatePass] = useState<StudentGatePassData | null>(null);
  const [leaveType, setLeaveType] = useState<string>('sick');
  const [leaveFromDate, setLeaveFromDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [leaveToDate, setLeaveToDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [leaveReason, setLeaveReason] = useState<string>('');
  const [leaveDepartureTime, setLeaveDepartureTime] = useState<string>('বিকাল ৫:০০ টা');
  const [leaveExpectedReturnTime, setLeaveExpectedReturnTime] = useState<string>('নির্ধারিত তারিখ সকাল ৮:০০ টা');
  const [leaveEmergencyContact, setLeaveEmergencyContact] = useState<string>('');


  // 1. Fetch Students
  const { data: students = [], isLoading: isStudentsLoading } = useQuery({
    queryKey: ['guardian_students'],
    queryFn: async () => {
      const res = await api.get('/api/students/');
      return res.data;
    }
  });

  const activeStudent = useMemo(() => {
    if (!students || students.length === 0) return null;
    return students[selectedStudentIdx] || students[0];
  }, [students, selectedStudentIdx]);

  // Sync amount when active student or paymentType changes
  useEffect(() => {
    if (activeStudent) {
      if (paymentType === 'monthly') {
        setAmount(String(activeStudent.monthly_fee || 1500));
      } else if (paymentType === 'hostel') {
        setAmount(String(activeStudent.hostel_fee || 3500));
      } else {
        setAmount('1000');
      }
      if (!senderPhone && activeStudent.guardian_phone) {
        setSenderPhone(activeStudent.guardian_phone);
      }
    }
  }, [activeStudent, paymentType]);

  // 2. Fetch Active Student Fee Status
  const { data: feeStatus, isLoading: isFeeStatusLoading } = useQuery({
    queryKey: ['student_fee_status', activeStudent?.student_id],
    queryFn: async () => {
      if (!activeStudent?.student_id) return null;
      const res = await api.get(`/api/fees/students/${activeStudent.student_id}/status/`);
      return res.data;
    },
    enabled: !!activeStudent?.student_id
  });

  // 3. Fetch Active Student Payment History
  const { data: paymentHistory = [], isLoading: isHistoryLoading } = useQuery({
    queryKey: ['student_payments_history', activeStudent?.student_id],
    queryFn: async () => {
      if (!activeStudent?.student_id) return [];
      const res = await api.get(`/api/fees/payments/?student=${activeStudent.student_id}`);
      return res.data;
    },
    enabled: !!activeStudent?.student_id
  });

  // 4. Online Payment Mutation
  const payMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post('/api/fees/online-payment/', payload);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'পেমেন্ট সফলভাবে গৃহীত হয়েছে!');
      setIsPayModalOpen(false);
      setTrxId('');
      setCustomNote('');
      queryClient.invalidateQueries({ queryKey: ['student_fee_status', activeStudent?.student_id] });
      queryClient.invalidateQueries({ queryKey: ['student_payments_history', activeStudent?.student_id] });
      queryClient.invalidateQueries({ queryKey: ['guardian_students'] });

      // Open digital money receipt
      if (data.payment && activeStudent) {
        setActiveReceipt({
          receipt_number: data.payment.receipt_number || data.receipt_number,
          payment_date: data.payment.payment_date,
          payment_type: data.payment.payment_type,
          month: data.payment.month,
          year: data.payment.year,
          amount_due: data.payment.amount_due,
          amount_paid: data.payment.amount_paid,
          discount: data.payment.discount || 0,
          balance_due: data.payment.balance_due || 0,
          note: data.payment.note,
          student_name: activeStudent.name,
          student_name_bn: activeStudent.name_bn,
          student_id_code: activeStudent.student_id,
          roll_number: activeStudent.roll_number,
          islamic_department_name: activeStudent.islamic_department_name,
          general_department_name: activeStudent.general_department_name,
          guardian_phone: activeStudent.guardian_phone,
        });
      }
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'পেমেন্ট সম্পন্ন করতে সমস্যা হয়েছে।');
    }
  });

  // 5. Fetch Active Student Leaves
  const { data: studentLeaves = [], isLoading: isLeavesLoading } = useQuery({
    queryKey: ['guardian_student_leaves', activeStudent?.student_id],
    queryFn: async () => {
      if (!activeStudent?.student_id) return [];
      const res = await api.get(`/api/students/leaves/?student=${activeStudent.student_id}`);
      return res.data;
    },
    enabled: !!activeStudent?.student_id
  });

  // 6. Submit Leave Mutation
  const leaveMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post('/api/students/leaves/', payload);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'ছুটির আবেদন সফলভাবে জমা হয়েছে!');
      queryClient.invalidateQueries({ queryKey: ['guardian_student_leaves', activeStudent?.student_id] });
      setIsLeaveModalOpen(false);
      setLeaveReason('');
      if (data.whatsapp_link) {
        toast((t) => (
          <div className="flex items-center gap-2 text-xs">
            <span>হোয়াটসঅ্যাপ কনফার্মেশন:</span>
            <a href={data.whatsapp_link} target="_blank" rel="noreferrer" className="text-emerald-700 underline font-bold">
              লিংক খুলুন
            </a>
          </div>
        ), { duration: 6000 });
      }
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'ছুটির আবেদন জমা দিতে ব্যর্থ');
    }
  });

  const handleCopy = (text: string, label: string) => {

    navigator.clipboard.writeText(text);
    toast.success(`${label} কপি করা হয়েছে!`);
  };

  const handleOpenReceiptFromHistory = (p: any) => {
    if (!activeStudent) return;
    setActiveReceipt({
      id: p.id,
      receipt_number: p.receipt_number,
      payment_date: p.payment_date,
      payment_type: p.payment_type,
      month: p.month,
      year: p.year,
      amount_due: p.amount_due,
      amount_paid: p.amount_paid,
      discount: p.discount || 0,
      balance_due: p.balance_due || 0,
      note: p.note,
      student_name: activeStudent.name,
      student_name_bn: activeStudent.name_bn,
      student_id_code: activeStudent.student_id,
      roll_number: activeStudent.roll_number,
      islamic_department_name: activeStudent.islamic_department_name,
      general_department_name: activeStudent.general_department_name,
      guardian_phone: activeStudent.guardian_phone,
    });
  };

  const handlePaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trxId.trim()) {
      toast.error('বিকাশ বা নগদ ট্রানজেকশন আইডি (TrxID) লিখুন');
      return;
    }
    if (!amount || Number(amount) <= 0) {
      toast.error('টাকার পরিমাণ প্রদান করুন');
      return;
    }

    payMutation.mutate({
      student_id: activeStudent.student_id,
      payment_method: paymentMethod,
      payment_type: paymentType,
      month: paymentType === 'monthly' ? paymentMonth : null,
      year: paymentYear,
      amount: amount,
      trx_id: trxId.trim(),
      sender_phone: senderPhone.trim(),
      note: customNote.trim()
    });
  };

  if (isStudentsLoading) {
    return (
      <AppLayout title={isBangla ? "অভিভাবক ড্যাশবোর্ড" : "Guardian Portal"}>
        <div className="flex flex-col items-center justify-center p-16 space-y-4">
          <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-600 rounded-full animate-spin" />
          <p className="text-gray-500 text-sm font-semibold">আপনার সন্তানের তথ্য লোড হচ্ছে...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title={isBangla ? "অভিভাবক ড্যাশবোর্ড ও অনলাইন ফি পেমেন্ট" : "Guardian Portal & Online Fee Payment"}>
      <div className="space-y-6">
        
        {/* ===================== HERO HEADER BANNER ===================== */}
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-[#02200d] text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden border border-emerald-500/20">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-semibold mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>আল-মদিনা মডেল মাদ্রাসা এন্ড রিসার্চ ইনস্টিটিউট</span>
              </div>
              
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                সম্মানিত অভিভাবক ড্যাশবোর্ড ও ডিজিটাল পেমেন্ট পোর্টাল
              </h1>
              <p className="text-emerald-200/85 text-xs sm:text-sm mt-1 max-w-2xl">
                আপনার সন্তানের অ্যাকাডেমিক অগ্রগতি, মাসিক ফি হিসাব ও সরাসরি বিকাশ/নগদে ঘরে বসেই ফি পরিশোধের কেন্দ্রীয় অনলাইন গেটওয়ে।
              </p>

              <div className="flex flex-wrap items-center gap-3 mt-4 text-xs font-semibold">
                <span className="px-3 py-1 rounded-xl bg-white/10 border border-white/10 text-emerald-200">
                  মোট সন্তান: {toBanglaDigit(students.length)} জন
                </span>
                <span className="px-3 py-1 rounded-xl bg-white/10 border border-white/10 text-amber-300">
                  মার্চেন্ট হটলাইন: ০১৭১২-৬৩৩২৬৪
                </span>
              </div>
            </div>

            {/* Quick Action Button */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <button
                onClick={() => setIsPayModalOpen(true)}
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-emerald-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-950/40 transition-transform active:scale-95"
              >
                <CreditCard className="w-4 h-4 text-emerald-950" />
                <span>বিকাশ / নগদে ফি পরিশোধ করুন</span>
              </button>
            </div>
          </div>
        </div>

        {/* ===================== CHILDREN SELECTOR TABS ===================== */}
        {students.length > 1 && (
          <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap gap-2">
            {students.map((std: any, idx: number) => (
              <button
                key={std.id || idx}
                onClick={() => setSelectedStudentIdx(idx)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  selectedStudentIdx === idx
                    ? 'bg-emerald-800 text-white shadow-md'
                    : 'bg-slate-50 text-gray-700 hover:bg-slate-100'
                }`}
              >
                <User size={15} className={selectedStudentIdx === idx ? 'text-amber-300' : 'text-gray-400'} />
                <span>{std.name_bn || std.name}</span>
                <span className="text-[11px] font-mono opacity-80">({std.student_id})</span>
              </button>
            ))}
          </div>
        )}

        {/* ===================== ACTIVE STUDENT PROFILE & FINANCIAL BENTO ===================== */}
        {activeStudent ? (
          <div className="space-y-6">
            
            {/* Student Profile Overview Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl p-1 bg-gradient-to-tr from-amber-400 to-emerald-600 shadow-md shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={activeStudent.photo ? (activeStudent.photo.startsWith('http') || activeStudent.photo.startsWith('/') ? activeStudent.photo : `/${activeStudent.photo}`) : '/logo.jpg'} 
                    alt={activeStudent.name} 
                    className="w-full h-full object-cover rounded-xl bg-white" 
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-mono font-bold text-xs">
                      {activeStudent.student_id}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-xs">
                      {activeStudent.residential_status === 'residential' ? 'আবাসিক' : 'অনাবাসিক'}
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-black text-gray-900 mt-1">
                    {activeStudent.name_bn || activeStudent.name}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600 font-medium">
                    বিভাগ: <strong className="text-emerald-950">{activeStudent.islamic_department_name || activeStudent.general_department_name || 'জেনারেল ও হিফজ বিভাগ'}</strong>
                    {activeStudent.roll_number ? ` • রোল: ${toBanglaDigit(activeStudent.roll_number)}` : ''}
                  </p>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    অভিভাবকের মোবাইল: <span className="font-mono">{toBanglaDigit(activeStudent.guardian_phone || '—')}</span>
                  </p>
                </div>
              </div>

              {/* Action Buttons for this Student */}
              <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
                <button
                  onClick={() => setIsPayModalOpen(true)}
                  className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95"
                >
                  <CreditCard size={15} className="text-amber-300" />
                  <span>অনলাইনে ফি পরিশোধ</span>
                </button>
                <button
                  onClick={() => {
                    if (activeStudent) {
                      setLeaveEmergencyContact(activeStudent.guardian_phone || '');
                    }
                    setIsLeaveModalOpen(true);
                  }}
                  className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95"
                >
                  <Calendar size={15} />
                  <span>ছুটির আবেদন করুন</span>
                </button>
              </div>
            </div>

            {/* Top Tab Navigator: 'fees' vs 'leaves' */}
            <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
              <button
                onClick={() => setActiveTab('fees')}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                  activeTab === 'fees'
                    ? 'bg-emerald-900 text-amber-300 shadow-md'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <DollarSign className="w-4 h-4" />
                <span>ফি ও অনলাইন পেমেন্ট হিস্ট্রি</span>
              </button>
              <button
                onClick={() => setActiveTab('leaves')}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                  activeTab === 'leaves'
                    ? 'bg-emerald-900 text-amber-300 shadow-md'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CalendarCheck className="w-4 h-4" />
                <span>ছুটির আবেদন ও গেটপাস ট্র্যাকার ({toBanglaDigit(studentLeaves.length)})</span>
              </button>
            </div>

            {/* View 1: Fees & Online Payment */}
            {activeTab === 'fees' && (
              <div className="space-y-6">
                
                {/* 3 Metric Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

              
              {/* Card 1: Due Status */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">চলতি বছরের মোট বকেয়া</span>
                    <span className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
                      <AlertCircle size={18} />
                    </span>
                  </div>
                  <h3 className="text-3xl font-black text-rose-600 font-mono">
                    ৳ {toBanglaDigit(Number(feeStatus?.total_due_this_year || 0).toLocaleString('en-IN'))}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {feeStatus?.due_months && feeStatus.due_months.length > 0
                      ? `${toBanglaDigit(feeStatus.due_months.length)} টি মাসের বেতন বকেয়া রয়েছে`
                      : 'আলহামদুলিল্লাহ, কোনো বকেয়া নেই'}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
                  <span className="text-gray-600">মাসিক নির্ধারিত ফি:</span>
                  <span className="font-mono text-emerald-950 font-bold">৳ {toBanglaDigit(activeStudent.monthly_fee || 1500)}</span>
                </div>
              </div>

              {/* Card 2: Paid Status */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">পরিশোধিত মোট ফি</span>
                    <span className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <CheckCircle2 size={18} />
                    </span>
                  </div>
                  <h3 className="text-3xl font-black text-emerald-800 font-mono">
                    ৳ {toBanglaDigit(Number(feeStatus?.total_paid_this_year || 0).toLocaleString('en-IN'))}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    মোট {toBanglaDigit(paymentHistory.length)} টি রিসিট ট্রানজেকশন সফল
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
                  <span className="text-gray-600">হালনাগাদ বছর:</span>
                  <span className="font-mono text-emerald-950 font-bold">{toBanglaDigit(new Date().getFullYear())}</span>
                </div>
              </div>

              {/* Card 3: Instant Pay Prompt */}
              <div className="bg-gradient-to-br from-[#fffdf7] to-amber-50/60 rounded-3xl p-6 shadow-sm border-2 border-amber-300 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-amber-900 font-bold uppercase tracking-wider">বিকাশ / নগদ পেমেন্ট</span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-400 text-emerald-950 font-black text-[10px]">
                      ইন্সট্যান্ট রিসিট
                    </span>
                  </div>
                  <h4 className="text-lg font-black text-emerald-950 leading-snug">
                    ঘরে বসেই সহজ ও নিরাপদ ফি প্রদান
                  </h4>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                    বিকাশ বা নগদ মার্চেন্ট নম্বরে ফি পরিশোধ করে ট্রানজেকশন আইডি (TrxID) দিয়ে রিসিট গ্রহণ করুন।
                  </p>
                </div>

                <button
                  onClick={() => setIsPayModalOpen(true)}
                  className="mt-4 w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-emerald-950 font-black text-xs shadow-md transition-transform active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <Smartphone size={14} />
                  <span>পেমেন্ট ফর্ম খুলুন</span>
                </button>
              </div>

            </div>

            {/* Unpaid Months Card & Pay Directly */}
            {feeStatus?.due_months && feeStatus.due_months.length > 0 && (
              <div className="bg-amber-50/80 border border-amber-300/80 rounded-3xl p-6 shadow-sm space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-base text-amber-950 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-amber-700" />
                      <span>চলতি বছরের বকেয়া মাসসমূহের তালিকা:</span>
                    </h3>
                    <p className="text-xs text-amber-900/80 mt-0.5">
                      নির্ধারিত তারিখের মধ্যে ফি পরিশোধ করে মাদ্রাসার স্বাভাবিক পাঠদান সচল রাখতে সহায়তা করুন।
                    </p>
                  </div>
                  <button
                    onClick={() => setIsPayModalOpen(true)}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-sm transition-all shrink-0"
                  >
                    বকেয়া পরিশোধ করুন ➔
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {feeStatus.due_months.map((dM: any, dIdx: number) => (
                    <div 
                      key={dIdx} 
                      className="px-3.5 py-2 bg-white rounded-xl border border-amber-300 text-xs flex items-center gap-2 shadow-xs"
                    >
                      <span className="font-bold text-slate-800">{dM.month_name}</span>
                      <span className="font-mono font-bold text-rose-700">৳ {toBanglaDigit(dM.amount_due)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Payment History Ledger Table */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-emerald-700" />
                  <span>পরিশোধিত ফি ও ডিজিটাল রিসিটসমূহ (Payment History)</span>
                </h3>
                <span className="text-xs text-gray-500 font-medium">
                  সর্বমোট {toBanglaDigit(paymentHistory.length)} টি রিসিট
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse border border-slate-200">
                  <thead className="bg-[#032410] text-white uppercase text-[11px] font-bold">
                    <tr>
                      <th className="py-2.5 px-3 border border-emerald-800 text-center w-12">নং</th>
                      <th className="py-2.5 px-3 border border-emerald-800">রশিদ নম্বর</th>
                      <th className="py-2.5 px-3 border border-emerald-800">তারিখ</th>
                      <th className="py-2.5 px-3 border border-emerald-800">ফি-এর বিবরণ</th>
                      <th className="py-2.5 px-3 border border-emerald-800 text-right">পরিশোধিত টাকা</th>
                      <th className="py-2.5 px-3 border border-emerald-800">পেমেন্ট মেথড ও TrxID</th>
                      <th className="py-2.5 px-3 border border-emerald-800 text-center">রিসিট ডাউনলোড</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-gray-800">
                    {isHistoryLoading ? (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-gray-400">
                          পেমেন্ট হিস্ট্রি লোড হচ্ছে...
                        </td>
                      </tr>
                    ) : paymentHistory.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-gray-400">
                          কোনো পূর্ববর্তী পেমেন্ট রিসিট পাওয়া যায়নি
                        </td>
                      </tr>
                    ) : (
                      paymentHistory.map((item: any, pIdx: number) => (
                        <tr key={item.id || pIdx} className="hover:bg-slate-50 transition-colors">
                          <td className="py-2.5 px-3 text-center font-mono border border-slate-200">
                            {toBanglaDigit(pIdx + 1)}
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-emerald-950 border border-slate-200">
                            {item.receipt_number}
                          </td>
                          <td className="py-2.5 px-3 font-mono border border-slate-200 text-gray-600">
                            {toBanglaDigit(item.payment_date)}
                          </td>
                          <td className="py-2.5 px-3 border border-slate-200">
                            <span className="font-bold text-gray-900 block">
                              {item.payment_type === 'monthly' ? 'মাসিক বেতন' : (item.payment_type === 'hostel' ? 'হোস্টেল ফি' : 'অন্যান্য ফি')}
                            </span>
                            {item.month && (
                              <span className="text-[10px] text-gray-500">
                                {MONTH_NAMES[item.month]}, {toBanglaDigit(item.year)}
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-900 border border-slate-200 text-sm">
                            ৳ {toBanglaDigit(Number(item.amount_paid).toLocaleString('en-IN'))}
                          </td>
                          <td className="py-2.5 px-3 border border-slate-200 text-gray-600 text-[11px]">
                            {item.note || 'অনলাইন পেমেন্ট'}
                          </td>
                          <td className="py-2.5 px-3 text-center border border-slate-200">
                            <button
                              onClick={() => handleOpenReceiptFromHistory(item)}
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-lg text-[10px] border border-emerald-200 transition-colors flex items-center justify-center gap-1 mx-auto"
                            >
                              <Printer size={12} />
                              <span>মানি রিসিট</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* View 2: Leave Applications & Gate Pass Tracker */}
        {activeTab === 'leaves' && (
          <div className="space-y-6">
            
            {/* Leave Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  <CalendarCheck className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold">মোট আবেদন</p>
                  <h4 className="text-2xl font-black text-gray-900 mt-0.5">
                    {toBanglaDigit(studentLeaves.length)} টি
                  </h4>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-5 shadow-sm border border-emerald-200 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-emerald-700 font-bold">অনুমোদিত গেটপাস</p>
                  <h4 className="text-2xl font-black text-emerald-800 mt-0.5">
                    {toBanglaDigit(studentLeaves.filter((l: any) => l.status === 'approved').length)} টি
                  </h4>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-5 shadow-sm border border-amber-200 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-amber-700 font-bold">অপেক্ষমাণ আবেদন</p>
                  <h4 className="text-2xl font-black text-amber-700 mt-0.5">
                    {toBanglaDigit(studentLeaves.filter((l: any) => l.status === 'pending').length)} টি
                  </h4>
                </div>
              </div>
            </div>

            {/* Applications Table */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                    <CalendarCheck className="w-5 h-5 text-emerald-700" />
                    <span>ছুটির আবেদন ও অনুমোদনের তালিকা</span>
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {activeStudent.name_bn} এর ছুটির অনুমোদন অবস্থা ও ডিজিটাল গেটপাস স্লিপ
                  </p>
                </div>

                <button
                  onClick={() => {
                    setLeaveEmergencyContact(activeStudent.guardian_phone || '');
                    setIsLeaveModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>নতুন ছুটির আবেদন</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse border border-slate-200">
                  <thead className="bg-[#032410] text-white uppercase text-[11px] font-bold">
                    <tr>
                      <th className="py-2.5 px-3 border border-emerald-800 text-center w-12">নং</th>
                      <th className="py-2.5 px-3 border border-emerald-800">ট্র্যাকিং ও গেটপাস</th>
                      <th className="py-2.5 px-3 border border-emerald-800">ছুটির ধরন ও মেয়াদ</th>
                      <th className="py-2.5 px-3 border border-emerald-800">ক্যাম্পাস ত্যাগের সময়</th>
                      <th className="py-2.5 px-3 border border-emerald-800">আবেদনকৃত কারণ</th>
                      <th className="py-2.5 px-3 border border-emerald-800 text-center">স্ট্যাটাস</th>
                      <th className="py-2.5 px-3 border border-emerald-800 text-center">গেটপাস</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLeavesLoading ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-gray-400">
                          লোড হচ্ছে...
                        </td>
                      </tr>
                    ) : studentLeaves.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-gray-400">
                          এই শিক্ষার্থীর কোনো ছুটির আবেদন পাওয়া যায়নি।
                        </td>
                      </tr>
                    ) : (
                      studentLeaves.map((lv: any, idx: number) => {
                        const isApproved = lv.status === 'approved';
                        const isPending = lv.status === 'pending';

                        return (
                          <tr key={lv.id || idx} className="hover:bg-slate-50 transition">
                            <td className="py-2.5 px-3 text-center border border-slate-200 text-gray-500 font-mono">
                              {toBanglaDigit(idx + 1)}
                            </td>
                            <td className="py-2.5 px-3 border border-slate-200">
                              <span className="font-mono font-bold text-slate-900 block">{lv.leave_no}</span>
                              {lv.gate_pass_no && (
                                <span className="font-mono text-[10px] text-emerald-800 font-bold block mt-0.5">
                                  🎫 {lv.gate_pass_no}
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 border border-slate-200">
                              <span className="font-bold text-slate-800 block">{lv.leave_type_display || lv.leave_type}</span>
                              <span className="text-gray-500 text-[11px] block mt-0.5">
                                {lv.from_date} হতে {lv.to_date} ({toBanglaDigit(lv.total_days)} দিন)
                              </span>
                            </td>
                            <td className="py-2.5 px-3 border border-slate-200 text-[11px]">
                              <span className="text-amber-800 font-medium block">ত্যাগ: {lv.departure_time || 'নির্ধারিত সময়'}</span>
                              <span className="text-gray-500 block">প্রবেশ: {lv.expected_return_time || 'নির্ধারিত তারিখ'}</span>
                            </td>
                            <td className="py-2.5 px-3 border border-slate-200 max-w-xs text-gray-700 italic">
                              "{lv.reason}"
                              {lv.review_comment && (
                                <span className="block not-italic text-emerald-800 font-semibold text-[10px] mt-1">
                                  ওস্তাদের মন্তব্য: {lv.review_comment}
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 border border-slate-200 text-center">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                isApproved 
                                  ? 'bg-emerald-100 text-emerald-800' 
                                  : isPending 
                                  ? 'bg-amber-100 text-amber-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {isApproved ? 'অনুমোদিত' : isPending ? 'অপেক্ষমাণ' : 'বাতিল'}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 border border-slate-200 text-center">
                              {isApproved ? (
                                <button
                                  onClick={() => setActiveGatePass(lv)}
                                  className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-[10px] transition shadow-sm flex items-center justify-center gap-1 mx-auto"
                                >
                                  <Printer size={12} />
                                  <span>গেটপাস</span>
                                </button>
                              ) : (
                                <span className="text-gray-400 text-[10px]">অপেক্ষমাণ</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </div>
    ) : (

          <div className="bg-white rounded-3xl p-12 text-center text-gray-500 border border-slate-200">
            কোনো শিক্ষার্থী প্রোফাইল পাওয়া যায়নি।
          </div>
        )}

      </div>

      {/* ===================== ONLINE PAYMENT MODAL ===================== */}
      {isPayModalOpen && activeStudent && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm overflow-y-auto flex items-center justify-center p-3 sm:p-6">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-[#02200d] text-white p-5 flex items-center justify-between border-b-2 border-amber-400">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400 text-emerald-950 flex items-center justify-center font-bold shadow-md">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">বিকাশ / নগদ অনলাইন ফি পেমেন্ট</h3>
                  <p className="text-xs text-emerald-300">
                    শিক্ষার্থী: {activeStudent.name_bn || activeStudent.name} (রোল: {toBanglaDigit(activeStudent.roll_number || '—')})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPayModalOpen(false)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handlePaySubmit} className="p-6 space-y-5">
              
              {/* 1. Payment Method Tabs */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-2">১. পেমেন্ট মাধ্যম নির্বাচন করুন:</label>
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('bkash')}
                    className={`py-3 px-3 rounded-2xl border text-center transition-all ${
                      paymentMethod === 'bkash'
                        ? 'border-pink-600 bg-pink-50 ring-2 ring-pink-500/20 text-pink-900 font-black'
                        : 'border-slate-200 bg-slate-50 text-gray-700'
                    }`}
                  >
                    <span className="text-sm block">🟣 বিকাশ (bKash)</span>
                    <span className="text-[10px] text-gray-500">মার্চেন্ট পে</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('nagad')}
                    className={`py-3 px-3 rounded-2xl border text-center transition-all ${
                      paymentMethod === 'nagad'
                        ? 'border-orange-600 bg-orange-50 ring-2 ring-orange-500/20 text-orange-900 font-black'
                        : 'border-slate-200 bg-slate-50 text-gray-700'
                    }`}
                  >
                    <span className="text-sm block">🟠 নগদ (Nagad)</span>
                    <span className="text-[10px] text-gray-500">মার্চেন্ট পে</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('rocket')}
                    className={`py-3 px-3 rounded-2xl border text-center transition-all ${
                      paymentMethod === 'rocket'
                        ? 'border-purple-600 bg-purple-50 ring-2 ring-purple-500/20 text-purple-900 font-black'
                        : 'border-slate-200 bg-slate-50 text-gray-700'
                    }`}
                  >
                    <span className="text-sm block">🟤 রকেট (Rocket)</span>
                    <span className="text-[10px] text-gray-500">বিল পে</span>
                  </button>
                </div>
              </div>

              {/* Instructions Box with Copyable Number */}
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-950">
                    মাদ্রাসার অফিসিয়াল {paymentMethod === 'bkash' ? 'বিকাশ' : (paymentMethod === 'nagad' ? 'নগদ' : 'রকেট')} নম্বর:
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy('01712633264', 'মার্চেন্ট নম্বর')}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-emerald-300 rounded-lg text-emerald-900 font-bold hover:bg-emerald-100"
                  >
                    <Copy size={11} />
                    <span>কপি করুন</span>
                  </button>
                </div>
                <div className="font-mono text-base font-black text-emerald-950 bg-white p-2 rounded-xl text-center border border-emerald-200 tracking-wider">
                  ০১৭১২-৬৩৩২৬৪
                </div>
                <p className="text-[11px] text-gray-600 leading-relaxed">
                  💡 {paymentMethod === 'bkash' ? 'বিকাশ' : (paymentMethod === 'nagad' ? 'নগদ' : 'রকেট')} অ্যাপ থেকে উপরিউক্ত নম্বরে ফি পাঠিয়ে প্রাপ্ত <strong>TrxID (ট্রানজেকশন আইডি)</strong> নিচের বক্সে লিখে সাবমিট করুন।
                </p>
              </div>

              {/* 2. Fee Type & Month */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">ফি-এর ধরন:</label>
                  <select
                    value={paymentType}
                    onChange={(e: any) => setPaymentType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none"
                  >
                    <option value="monthly">মাসিক বেতন (Monthly)</option>
                    <option value="hostel">হোস্টেল ফি (Hostel)</option>
                    <option value="exam">পরীক্ষার ফি (Exam)</option>
                    <option value="admission">ভর্তি ফি (Admission)</option>
                  </select>
                </div>

                {paymentType === 'monthly' ? (
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">পরিশোধের মাস:</label>
                    <select
                      value={paymentMonth}
                      onChange={(e) => setPaymentMonth(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none"
                    >
                      {MONTH_NAMES.slice(1).map((mName, idx) => (
                        <option key={idx + 1} value={idx + 1}>
                          {mName}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">শিক্ষাবর্ষ:</label>
                    <input
                      type="number"
                      value={paymentYear}
                      onChange={(e) => setPaymentYear(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* 3. Amount & Sender Mobile */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">টাকার পরিমাণ (৳):</label>
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="যেমন: ১৫০০"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-black font-mono text-emerald-950 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">প্রেরকের বিকাশ/নগদ নম্বর:</label>
                  <input
                    type="text"
                    value={senderPhone}
                    onChange={(e) => setSenderPhone(e.target.value)}
                    placeholder="০১৭১১..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              {/* 4. TrxID Input */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1 flex items-center justify-between">
                  <span>বিকাশ / নগদ ট্রানজেকশন আইডি (TrxID) * :</span>
                  <span className="text-[10px] text-amber-700 font-bold">SMS থেকে কপি করুন</span>
                </label>
                <input
                  type="text"
                  required
                  value={trxId}
                  onChange={(e) => setTrxId(e.target.value)}
                  placeholder="যেমন: 9X7A2B4C1E"
                  className="w-full px-4 py-2.5 bg-slate-50 border-2 border-amber-300 rounded-xl text-xs sm:text-sm font-black font-mono tracking-wider text-slate-900 focus:outline-none focus:border-emerald-600 uppercase"
                />
              </div>

              {/* 5. Custom Note */}
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1">অতিরিক্ত নোট বা তথ্য (ঐচ্ছিক):</label>
                <input
                  type="text"
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  placeholder="যেমন: অক্টোবর মাসের বেতন পরিশোধ"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-gray-700 focus:outline-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={payMutation.isPending || !trxId.trim() || !amount}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-amber-600 hover:from-emerald-700 hover:to-amber-500 text-white font-extrabold text-xs sm:text-sm shadow-xl shadow-emerald-950/20 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
              >
                <CheckCircle2 size={16} className="text-amber-300" />
                <span>{payMutation.isPending ? 'পেমেন্ট ভেরিফাই করা হচ্ছে...' : 'পেমেন্ট নিশ্চিত করুন ও ডিজিটাল মানি রিসিট গ্রহণ করুন'}</span>
              </button>

            </form>
          </div>
        </div>
      )}

      {/* ===================== PRINTABLE MONEY RECEIPT MODAL ===================== */}
      {activeReceipt && (
        <PrintableMoneyReceipt
          receipt={activeReceipt}
          onClose={() => setActiveReceipt(null)}
        />
      )}

      {/* ===================== GUARDIAN LEAVE APPLICATION MODAL ===================== */}
      {isLeaveModalOpen && activeStudent && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm overflow-y-auto flex items-center justify-center p-3 sm:p-6">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150 my-auto">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-[#02200d] text-white p-5 flex items-center justify-between border-b-2 border-amber-400">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400 text-emerald-950 flex items-center justify-center font-bold shadow-md">
                  <CalendarCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black tracking-tight">ছুটির আবেদন জমা দিন</h3>
                  <p className="text-xs text-emerald-200">
                    শিক্ষার্থী: {activeStudent.name_bn} ({activeStudent.student_id})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsLeaveModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!leaveReason.trim()) {
                  toast.error('ছুটির কারণ উল্লেখ করুন');
                  return;
                }
                leaveMutation.mutate({
                  student_id: activeStudent.id,
                  leave_type: leaveType,
                  from_date: leaveFromDate,
                  to_date: leaveToDate,
                  departure_time: leaveDepartureTime,
                  expected_return_time: leaveExpectedReturnTime,
                  emergency_contact: leaveEmergencyContact || activeStudent.guardian_phone,
                  reason: leaveReason,
                  applied_by_guardian: activeStudent.guardian_name,
                  guardian_phone: activeStudent.guardian_phone,
                  relationship: activeStudent.guardian_relationship || 'পিতা'
                });
              }}
              className="p-5 sm:p-6 space-y-4 text-xs"
            >
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">ছুটির ধরন *</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-600"
                >
                  <option value="sick">অসুস্থতা (Sick Leave)</option>
                  <option value="family">জরুরি পারিবারিক কাজ (Family Emergency)</option>
                  <option value="event">সামাজিক অনুষ্ঠান (Social Event)</option>
                  <option value="exam_prep">পরীক্ষার প্রস্তুতি / অধ্যয়ন</option>
                  <option value="other">অন্যান্য (Other)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">শুরুর তারিখ *</label>
                  <input
                    type="date"
                    required
                    value={leaveFromDate}
                    onChange={(e) => setLeaveFromDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">শেষ তারিখ *</label>
                  <input
                    type="date"
                    required
                    value={leaveToDate}
                    onChange={(e) => setLeaveToDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">ক্যাম্পাস ত্যাগের সময়</label>
                  <input
                    type="text"
                    value={leaveDepartureTime}
                    onChange={(e) => setLeaveDepartureTime(e.target.value)}
                    placeholder="যেমন: বিকাল ৫:০০ টা"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">মাদ্রাসায় ফেরার শেষ সময়</label>
                  <input
                    type="text"
                    value={leaveExpectedReturnTime}
                    onChange={(e) => setLeaveExpectedReturnTime(e.target.value)}
                    placeholder="যেমন: পরদিন সকাল ৮:০০ টা"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">জরুরি যোগাযোগের মোবাইল নম্বর</label>
                <input
                  type="text"
                  value={leaveEmergencyContact}
                  onChange={(e) => setLeaveEmergencyContact(e.target.value)}
                  placeholder="017XXXXXXXX"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">ছুটির সুনির্দিষ্ট কারণ *</label>
                <textarea
                  required
                  rows={3}
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  placeholder="যেমন: তীব্র জ্বর থাকায় বাড়িতে এনে চিকিৎসার জন্য ছুটি প্রয়োজন..."
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={leaveMutation.isPending}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-amber-600 hover:from-emerald-700 hover:to-amber-500 text-white font-extrabold text-xs sm:text-sm shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <CheckCircle2 size={16} className="text-amber-300" />
                  <span>{leaveMutation.isPending ? 'আবেদন জমা হচ্ছে...' : 'ছুটির আবেদন জমা দিন'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ===================== PRINTABLE GATE PASS MODAL ===================== */}
      {activeGatePass && (
        <PrintableGatePass
          gatePass={activeGatePass}
          onClose={() => setActiveGatePass(null)}
        />
      )}


    </AppLayout>
  );
}
