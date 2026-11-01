/* eslint-disable */
'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { 
  CreditCard, Search, Printer, PlusCircle, History, CheckCircle2, 
  AlertCircle, User, Calendar, Receipt, DollarSign, ArrowRight, 
  Building, Check, Filter, Sparkles, Trash2
} from 'lucide-react';
import PrintableMoneyReceipt, { FeeReceiptData } from '@/components/fees/PrintableMoneyReceipt';
import { toBanglaDigit } from '@/lib/numberToBanglaWords';

const MONTH_OPTIONS = [
  { value: 1, label: 'জানুয়ারি' },
  { value: 2, label: 'ফেব্রুয়ারি' },
  { value: 3, label: 'মার্চ' },
  { value: 4, label: 'এপ্রিল' },
  { value: 5, label: 'মে' },
  { value: 6, label: 'জুন' },
  { value: 7, label: 'জুলাই' },
  { value: 8, label: 'আগস্ট' },
  { value: 9, label: 'সেপ্টেম্বর' },
  { value: 10, label: 'অক্টোবর' },
  { value: 11, label: 'নভেম্বর' },
  { value: 12, label: 'ডিসেম্বর' },
];

export default function FeesPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'collect' | 'history'>('collect');
  
  // Student Search & Selection State
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);

  // Form Fields
  const [paymentType, setPaymentType] = useState('monthly');
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [amountDue, setAmountDue] = useState<number>(2000);
  const [amountPaid, setAmountPaid] = useState<number>(2000);
  const [discount, setDiscount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState('নগদ (Cash)');
  const [note, setNote] = useState('');

  // Active Receipt Modal
  const [activeReceipt, setActiveReceipt] = useState<FeeReceiptData | null>(null);

  // Filter for history tab
  const [historySearch, setHistorySearch] = useState('');

  // Delete Receipt Mutation
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const deleteReceiptMutation = useMutation({
    mutationFn: async (paymentId: number) => {
      await api.delete(`/api/fees/payments/${paymentId}/`);
    },
    onSuccess: () => {
      toast.success('রশিদ সফলভাবে মুছে ফেলা হয়েছে');
      queryClient.invalidateQueries({ queryKey: ['fee-payments-list'] });
      queryClient.invalidateQueries({ queryKey: ['fee_payments'] });
      queryClient.invalidateQueries({ queryKey: ['due_fees'] });
      setDeletingId(null);
    },
    onError: () => {
      toast.error('রশিদ মুছতে সমস্যা হয়েছে');
      setDeletingId(null);
    }
  });

  const handleDeleteReceipt = (payment: any) => {
    if (confirm(`আপনি কি নিশ্চিতভাবে রশিদ নং ${payment.receipt_number} (${payment.student_name_bn || payment.student_name}) ডিলিট করতে চান?`)) {
      setDeletingId(payment.id);
      deleteReceiptMutation.mutate(payment.id);
    }
  };

  // 1. Fetch Students
  const { data: students = [], isLoading: isStudentsLoading } = useQuery({
    queryKey: ['students-list-fees'],
    queryFn: async () => {
      const res = await api.get('/api/students/');
      return res.data;
    }
  });

  // 2. Fetch Fee Payments History
  const { data: payments = [], isLoading: isPaymentsLoading } = useQuery({
    queryKey: ['fee-payments-list'],
    queryFn: async () => {
      const res = await api.get('/api/fees/payments/');
      return res.data;
    }
  });

  // 3. Fetch Fee Status of Selected Student
  const { data: studentStatus, isLoading: isStatusLoading } = useQuery({
    queryKey: ['student-fee-status', selectedStudent?.student_id],
    queryFn: async () => {
      if (!selectedStudent?.student_id) return null;
      const res = await api.get(`/api/fees/students/${selectedStudent.student_id}/status/`);
      return res.data;
    },
    enabled: !!selectedStudent?.student_id
  });

  // Filtered Students for live search
  const filteredStudents = useMemo(() => {
    if (!studentSearch.trim()) return students.slice(0, 8);
    const q = studentSearch.toLowerCase();
    return students.filter((s: any) => 
      s.name?.toLowerCase().includes(q) ||
      s.name_bn?.toLowerCase().includes(q) ||
      s.student_id?.toLowerCase().includes(q) ||
      String(s.roll_number || '').includes(q)
    );
  }, [students, studentSearch]);

  // When a student is selected, pre-populate fee fields
  const handleSelectStudent = (student: any) => {
    setSelectedStudent(student);
    const mFee = Number(student.monthly_fee) || 2000;
    const hFee = Number(student.hostel_fee) || 0;
    
    if (paymentType === 'monthly') {
      setAmountDue(mFee);
      setAmountPaid(mFee);
    } else if (paymentType === 'hostel') {
      setAmountDue(hFee);
      setAmountPaid(hFee);
    } else {
      setAmountDue(mFee);
      setAmountPaid(mFee);
    }
    setDiscount(0);
  };

  // Payment Collection Mutation
  const collectMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post('/api/fees/payments/collect/', payload);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success('ফি সফলভাবে গ্রহণ করা হয়েছে!');
      queryClient.invalidateQueries({ queryKey: ['fee-payments-list'] });
      queryClient.invalidateQueries({ queryKey: ['student-fee-status'] });

      // Prepare receipt data and open print modal
      const receiptData: FeeReceiptData = {
        id: data.id,
        receipt_number: data.receipt_number,
        payment_date: data.payment_date || new Date().toISOString().split('T')[0],
        payment_type: data.payment_type,
        month: data.month,
        year: data.year,
        amount_due: data.amount_due,
        amount_paid: data.amount_paid,
        discount: data.discount,
        balance_due: data.balance_due,
        note: data.note,
        student_name: data.student_name || selectedStudent?.name || '',
        student_name_bn: data.student_name_bn || selectedStudent?.name_bn || '',
        student_id_code: data.student_id_code || selectedStudent?.student_id || '',
        roll_number: data.roll_number || selectedStudent?.roll_number,
        islamic_department_name: data.islamic_department_name || selectedStudent?.islamic_department_name_bn || selectedStudent?.islamic_department_name,
        general_department_name: data.general_department_name || selectedStudent?.general_department_name_bn || selectedStudent?.general_department_name,
        guardian_phone: data.guardian_phone || selectedStudent?.guardian_phone,
        collected_by_name: data.collected_by_name || 'অফিস ক্যাশিয়ার'
      };

      setActiveReceipt(receiptData);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.detail || err.response?.data?.error || 'ফি গ্রহণ করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।';
      toast.error(msg);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) {
      toast.error('অনুগ্রহ করে একজন শিক্ষার্থী নির্বাচন করুন');
      return;
    }

    if (amountPaid <= 0) {
      toast.error('পরিশোধিত টাকার পরিমাণ অবশ্যই ০ এর বেশি হতে হবে');
      return;
    }

    const payload = {
      student: selectedStudent.id,
      payment_type: paymentType,
      month: paymentType === 'monthly' ? month : null,
      year: year,
      amount_due: amountDue,
      amount_paid: amountPaid,
      discount: discount,
      payment_date: new Date().toISOString().split('T')[0],
      note: `${paymentMethod}${note ? ` - ${note}` : ''}`
    };

    collectMutation.mutate(payload);
  };

  // Filtered History
  const filteredPayments = useMemo(() => {
    if (!historySearch.trim()) return payments;
    const q = historySearch.toLowerCase();
    return payments.filter((p: any) =>
      p.receipt_number?.toLowerCase().includes(q) ||
      p.student_name?.toLowerCase().includes(q) ||
      p.student_name_bn?.toLowerCase().includes(q) ||
      p.student_id_code?.toLowerCase().includes(q)
    );
  }, [payments, historySearch]);

  return (
    <AppLayout title="ফি কালেকশন ও মানি রিসিট">
      <div className="space-y-6">
        
        {/* Top Header & Stat Banner */}
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-[#02200d] text-white p-6 rounded-3xl shadow-xl relative overflow-hidden border border-emerald-500/20">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-semibold mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>আল-মদিনা মডেল মাদ্রাসা এন্ড রিসার্চ ইনস্টিটিউট</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                ডিজিটাল ফি কালেকশন ও মানি রিসিট ভাউচার
              </h1>
              <p className="text-emerald-200/80 text-xs sm:text-sm mt-1 max-w-2xl">
                মাসিক বেতন, ভর্তি ও হোস্টেল ফি গ্রহণ করুন এবং স্বয়ংক্রিয়ভাবে অফিসিয়াল ২-কপি মানি রিসিট (ছাত্র ও মাদ্রাসা কপি) প্রিন্ট করুন।
              </p>
            </div>

            {/* Quick Action Tabs */}
            <div className="flex bg-black/40 p-1 rounded-2xl border border-white/10 backdrop-blur-md">
              <button
                onClick={() => setActiveTab('collect')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'collect'
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-emerald-950 shadow-md scale-102'
                    : 'text-emerald-200 hover:text-white'
                }`}
              >
                <PlusCircle className="w-4 h-4" />
                <span>নতুন ফি গ্রহণ</span>
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'history'
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-emerald-950 shadow-md scale-102'
                    : 'text-emerald-200 hover:text-white'
                }`}
              >
                <History className="w-4 h-4" />
                <span>রশিদ হিস্ট্রি ({toBanglaDigit(payments.length)})</span>
              </button>
              <Link
                href="/fees/due"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-amber-300 hover:text-white hover:bg-white/10 transition-all border border-amber-400/40 ml-1 bg-amber-400/10"
                title="বকেয়া ফি ও হোয়াটসঅ্যাপ রিমাইন্ডার পোর্টাল"
              >
                <AlertCircle className="w-4 h-4 text-amber-400" />
                <span>বকেয়া ফি ও রিমাইন্ডার</span>
              </Link>
              <Link
                href="/reports"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-emerald-200 hover:text-white hover:bg-white/10 transition-all border border-emerald-500/30 ml-1"
                title="মাদ্রাসার দৈনিক ক্যাশ খাতা ও ব্যালেন্স শিট দেখুন"
              >
                <Receipt className="w-4 h-4 text-amber-400" />
                <span>দৈনিক ক্যাশ খাতা</span>
              </Link>
            </div>
          </div>
        </div>

        {/* TAB 1: COLLECT FEE FORM */}
        {activeTab === 'collect' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left: Student Selector & Info Preview (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Student Search Box */}
              <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200/80">
                <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-700" />
                  <span>শিক্ষার্থী খুঁজুন ও নির্বাচন করুন</span>
                </h3>

                <div className="relative mb-3">
                  <Search className="absolute left-3.5 top-3 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="নাম, রোল অথবা আইডি দিয়ে খুঁজুন..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
                  />
                </div>

                {/* Candidate Students List */}
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {isStudentsLoading ? (
                    <p className="text-xs text-gray-400 text-center py-4">শিক্ষার্থী লোড হচ্ছে...</p>
                  ) : filteredStudents.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-4">কোনো শিক্ষার্থী পাওয়া যায়নি</p>
                  ) : (
                    filteredStudents.map((s: any) => {
                      const isSelected = selectedStudent?.id === s.id;
                      return (
                        <div
                          key={s.id}
                          onClick={() => handleSelectStudent(s)}
                          className={`p-3 rounded-2xl cursor-pointer border transition-all flex items-center justify-between ${
                            isSelected
                              ? 'bg-emerald-50 border-emerald-500 shadow-sm'
                              : 'bg-white hover:bg-slate-50 border-slate-100 hover:border-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-900 font-bold flex items-center justify-center text-xs">
                              {s.roll_number ? toBanglaDigit(s.roll_number) : 'ID'}
                            </div>
                            <div>
                              <div className="font-bold text-xs sm:text-sm text-gray-900 flex items-center gap-1.5">
                                <span>{s.name_bn || s.name}</span>
                                {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                              </div>
                              <div className="text-[11px] text-gray-500">
                                {s.student_id} • {s.islamic_department_name_bn || s.general_department_name_bn || 'সাধারণ'}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-bold text-emerald-800">
                              ৳{toBanglaDigit(s.monthly_fee || 0)}
                            </span>
                            <span className="text-[10px] text-gray-400 block">মাসিক</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Selected Student Profile & Due Card */}
              {selectedStudent ? (
                <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-950 text-white p-5 rounded-3xl shadow-lg border border-emerald-600/30 relative overflow-hidden">
                  <div className="relative z-10">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-emerald-950 font-extrabold text-[10px]">
                        নির্বাচিত শিক্ষার্থী
                      </span>
                      <span className="font-mono text-xs text-emerald-200">
                        {selectedStudent.student_id}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-amber-300 font-black text-base">
                        {selectedStudent.roll_number ? toBanglaDigit(selectedStudent.roll_number) : '১'}
                      </div>
                      <div>
                        <h4 className="font-bold text-base text-white">{selectedStudent.name_bn}</h4>
                        <p className="text-xs text-emerald-200">{selectedStudent.name}</p>
                        <p className="text-[11px] text-emerald-300/80 mt-0.5">
                          {selectedStudent.islamic_department_name_bn || selectedStudent.general_department_name_bn || 'জেনারেল ও হিফজ'}
                        </p>
                      </div>
                    </div>

                    {/* Financial Status Quick View */}
                    <div className="grid grid-cols-2 gap-2 text-center text-xs">
                      <div className="bg-white/10 rounded-xl p-2.5 border border-white/10">
                        <span className="text-emerald-200 text-[10px] block">মাসিক বেতন</span>
                        <span className="font-bold text-amber-300 text-sm">৳ {toBanglaDigit(selectedStudent.monthly_fee || 0)}</span>
                      </div>
                      <div className="bg-white/10 rounded-xl p-2.5 border border-white/10">
                        <span className="text-emerald-200 text-[10px] block">হোস্টেল ফি</span>
                        <span className="font-bold text-amber-300 text-sm">৳ {toBanglaDigit(selectedStudent.hostel_fee || 0)}</span>
                      </div>
                    </div>

                    {/* Due details if fetched */}
                    {studentStatus && (
                      <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                        <span className="text-emerald-200">মোট বকেয়া বেতন:</span>
                        <span className={`font-black ${studentStatus.total_due_this_year > 0 ? 'text-amber-300' : 'text-emerald-300'}`}>
                          ৳ {toBanglaDigit(studentStatus.total_due_this_year || 0)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 text-center text-amber-800 text-xs">
                  <AlertCircle className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                  <p className="font-semibold">কোনো শিক্ষার্থী নির্বাচন করা হয়নি</p>
                  <p className="text-gray-500 mt-0.5">ফি জমা করতে উপরের তালিকা থেকে শিক্ষার্থী নির্বাচন করুন</p>
                </div>
              )}

            </div>

            {/* Right: Payment Entry Form (7 cols) */}
            <div className="lg:col-span-7">
              <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200/80">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">অর্থ আদায় ও রিসিট ভাউচার তৈরি</h3>
                    <p className="text-xs text-gray-500">সকল তথ্য যাচাই করে ফি গ্রহণ করুন</p>
                  </div>
                  <Receipt className="w-6 h-6 text-emerald-700" />
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  
                  {/* Fee Type & Academic Year */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">
                        ফি’র খাত / ধরন <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={paymentType}
                        onChange={(e) => {
                          const type = e.target.value;
                          setPaymentType(type);
                          if (selectedStudent) {
                            if (type === 'monthly') {
                              const f = Number(selectedStudent.monthly_fee) || 2000;
                              setAmountDue(f);
                              setAmountPaid(f);
                            } else if (type === 'hostel') {
                              const f = Number(selectedStudent.hostel_fee) || 3000;
                              setAmountDue(f);
                              setAmountPaid(f);
                            } else if (type === 'admission') {
                              setAmountDue(5000);
                              setAmountPaid(5000);
                            } else if (type === 'exam') {
                              setAmountDue(1000);
                              setAmountPaid(1000);
                            }
                          }
                        }}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold focus:outline-none focus:border-emerald-600 focus:bg-white"
                      >
                        <option value="monthly">মাসিক বেতন (Monthly Tuition)</option>
                        <option value="hostel">হোস্টেল ও খাবার ফি (Hostel & Food)</option>
                        <option value="admission">ভর্তি ফি (Admission Fee)</option>
                        <option value="exam">পরীক্ষার ফি (Exam Fee)</option>
                        <option value="other">অন্যান্য ফি (Other Charges)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">
                        শিক্ষাবর্ষ <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={year}
                        onChange={(e) => setYear(Number(e.target.value))}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold focus:outline-none focus:border-emerald-600 focus:bg-white"
                      />
                    </div>
                  </div>

                  {/* Month Selection (If monthly fee) */}
                  {paymentType === 'monthly' && (
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">
                        প্রযোজ্য মাস <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {MONTH_OPTIONS.map((m) => {
                          const isSel = month === m.value;
                          return (
                            <button
                              type="button"
                              key={m.value}
                              onClick={() => setMonth(m.value)}
                              className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                                isSel
                                  ? 'bg-emerald-900 border-emerald-900 text-white shadow-sm'
                                  : 'bg-slate-50 border-slate-200 text-gray-700 hover:bg-slate-100'
                              }`}
                            >
                              {m.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Amounts Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-1">
                        মোট দাবি (Due)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-gray-400 font-bold">৳</span>
                        <input
                          type="number"
                          value={amountDue}
                          onChange={(e) => setAmountDue(Number(e.target.value))}
                          className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-gray-900"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-1">
                        মওকুফ / ছাড় (Discount)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-gray-400 font-bold">৳</span>
                        <input
                          type="number"
                          value={discount}
                          onChange={(e) => {
                            const d = Number(e.target.value);
                            setDiscount(d);
                            setAmountPaid(Math.max(0, amountDue - d));
                          }}
                          className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-gray-900"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-emerald-800 mb-1">
                        পরিশোধিত টাকা (Paid) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-emerald-700 font-bold">৳</span>
                        <input
                          type="number"
                          value={amountPaid}
                          onChange={(e) => setAmountPaid(Number(e.target.value))}
                          className="w-full pl-8 pr-3 py-2 bg-emerald-50 border-2 border-emerald-600 rounded-xl text-xs sm:text-sm font-extrabold text-emerald-950 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Payment Method & Note */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">
                        পেমেন্ট মেথড
                      </label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold focus:outline-none focus:border-emerald-600"
                      >
                        <option value="নগদ (Cash)">নগদ ক্যাশ (Cash)</option>
                        <option value="বিকাশ (bKash)">বিকাশ (bKash)</option>
                        <option value="নগদ (Nagad)">নগদ ওয়ালেট (Nagad)</option>
                        <option value="ব্যাংক ট্রান্সফার (Bank)">ব্যাংক ট্রান্সফার (Bank)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">
                        অতিরিক্ত মন্তব্য / ট্রানজেকশন আইডি
                      </label>
                      <input
                        type="text"
                        placeholder="যেমন: TrxID বা বিশেষ নোট..."
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={collectMutation.isPending || !selectedStudent}
                      className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-amber-600 hover:from-emerald-700 hover:to-amber-500 text-white font-extrabold text-sm sm:text-base shadow-xl shadow-emerald-950/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 active:scale-98"
                    >
                      {collectMutation.isPending ? (
                        <span>প্রক্রিয়াধীন... অনুগ্রহ করে অপেক্ষা করুন</span>
                      ) : (
                        <>
                          <Printer className="w-5 h-5 text-amber-300" />
                          <span>ফি গ্রহণ ও ২-কপি মানি রিসিট প্রস্তুত করুন</span>
                        </>
                      )}
                    </button>
                  </div>

                </form>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: RECEIPT HISTORY */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-6 space-y-4">
            
            {/* Header & Search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-bold text-lg text-gray-900">সাম্প্রতিক ফি রশিদ হিস্ট্রি</h3>
                <p className="text-xs text-gray-500">যেকোনো রশিদে ক্লিক করে পুনরায় A4 সাইজে প্রিন্ট করুন</p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3.5 top-3 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="রশিদ নং বা ছাত্রের নাম..."
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-gray-700 uppercase font-bold border-y border-slate-200">
                  <tr>
                    <th className="py-3 px-4">রশিদ নং</th>
                    <th className="py-3 px-4">শিক্ষার্থীর নাম ও আইডি</th>
                    <th className="py-3 px-4">ফি’র খাত</th>
                    <th className="py-3 px-4 text-center">মাস/সাল</th>
                    <th className="py-3 px-4 text-right">আদায়কৃত টাকা</th>
                    <th className="py-3 px-4">তারিখ</th>
                    <th className="py-3 px-4 text-center">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isPaymentsLoading ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-gray-400">
                        রশিদ তালিকা লোড হচ্ছে...
                      </td>
                    </tr>
                  ) : filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-gray-400">
                        কোনো রশিদের তথ্য পাওয়া যায়নি
                      </td>
                    </tr>
                  ) : (
                    filteredPayments.map((p: any) => (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-emerald-900">
                          {p.receipt_number}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-gray-900">{p.student_name_bn || p.student_name}</div>
                          <div className="text-[11px] text-gray-500 font-mono">{p.student_id_code}</div>
                        </td>
                        <td className="py-3.5 px-4 font-medium">
                          {p.payment_type === 'monthly' ? 'মাসিক বেতন' : p.payment_type === 'hostel' ? 'হোস্টেল ফি' : p.payment_type === 'admission' ? 'ভর্তি ফি' : 'অন্যান্য'}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {p.month ? `${MONTH_OPTIONS.find(m => m.value === p.month)?.label} ` : ''}{toBanglaDigit(p.year)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-900 text-sm">
                          ৳ {toBanglaDigit(Number(p.amount_paid).toLocaleString('en-IN'))}
                        </td>
                        <td className="py-3.5 px-4 text-gray-600 font-mono">
                          {p.payment_date}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => {
                                const receiptData: FeeReceiptData = {
                                  id: p.id,
                                  receipt_number: p.receipt_number,
                                  payment_date: p.payment_date,
                                  payment_type: p.payment_type,
                                  month: p.month,
                                  year: p.year,
                                  amount_due: p.amount_due,
                                  amount_paid: p.amount_paid,
                                  discount: p.discount,
                                  balance_due: p.balance_due,
                                  note: p.note,
                                  student_name: p.student_name,
                                  student_name_bn: p.student_name_bn,
                                  student_id_code: p.student_id_code,
                                  roll_number: p.roll_number,
                                  islamic_department_name: p.islamic_department_name,
                                  general_department_name: p.general_department_name,
                                  guardian_phone: p.guardian_phone,
                                  collected_by_name: p.collected_by_name
                                };
                                setActiveReceipt(receiptData);
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold border border-emerald-200 transition-colors"
                              title="রশিদ প্রিন্ট"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>প্রিন্ট</span>
                            </button>
                            <button
                              onClick={() => handleDeleteReceipt(p)}
                              disabled={deletingId === p.id}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold border border-rose-200 transition-colors active:scale-95 disabled:opacity-50"
                              title="রশিদ ডিলিট করুন"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">ডিলিট</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

          </div>
        )}

      </div>

      {/* PRINTABLE DUAL-SLIP MONEY RECEIPT MODAL */}
      {activeReceipt && (
        <PrintableMoneyReceipt
          receipt={activeReceipt}
          onClose={() => setActiveReceipt(null)}
        />
      )}
    </AppLayout>
  );
}
