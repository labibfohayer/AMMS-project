/* eslint-disable */
'use client';

import { useState, useMemo } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import {
  AlertCircle, CheckCircle2, Clock, Search, Filter, Printer,
  Phone, User, MessageSquare, Send, RefreshCw, Sparkles, Building,
  DollarSign, ArrowLeft, Check, X, ShieldAlert, CheckSquare, Square,
  ExternalLink, ChevronRight, FileText, ArrowUpRight
} from 'lucide-react';
import { toBanglaDigit, numberToBanglaWords } from '@/lib/numberToBanglaWords';

const BANGLA_MONTHS: Record<number, string> = {
  1: 'জানুয়ারি',
  2: 'ফেব্রুয়ারি',
  3: 'মার্চ',
  4: 'এপ্রিল',
  5: 'মে',
  6: 'জুন',
  7: 'জুলাই',
  8: 'আগস্ট',
  9: 'সেপ্টেম্বর',
  10: 'অক্টোবর',
  11: 'নভেম্বর',
  12: 'ডিসেম্বর'
};

export default function DueFeesPage() {
  const queryClient = useQueryClient();

  // Filters
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [upToMonth, setUpToMonth] = useState<number>(currentMonth);
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [residentialFilter, setResidentialFilter] = useState<'all' | 'residential' | 'day'>('all');
  const [minDue, setMinDue] = useState<string>('0');
  const [search, setSearch] = useState('');

  // Selected students for bulk action
  const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);

  // Modals
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkCustomNote, setBulkCustomNote] = useState('আগামী ১০ তারিখের মধ্যে বকেয়া ফি পরিশোধ করার জন্য বিনীত অনুরোধ করা হলো।');
  const [singleStudentPrompt, setSingleStudentPrompt] = useState<any | null>(null);

  // Print Slip Mode: 'roster' (full list) or student object for individual slip
  const [printSingleStudent, setPrintSingleStudent] = useState<any | null>(null);

  // 1. Fetch Due Fees
  const { data: dueData, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['due-fees', selectedYear, upToMonth, selectedDept, residentialFilter, minDue, search],
    queryFn: async () => {
      let url = `/api/fees/due/?year=${selectedYear}&up_to_month=${upToMonth}`;
      if (selectedDept !== 'all') {
        url += `&department_id=${selectedDept}`;
      }
      if (residentialFilter !== 'all') {
        url += `&residential_status=${residentialFilter}`;
      }
      if (parseFloat(minDue) > 0) {
        url += `&min_due=${minDue}`;
      }
      if (search.trim()) {
        url += `&search=${encodeURIComponent(search.trim())}`;
      }
      const res = await api.get(url);
      return res.data;
    }
  });

  // 2. Fetch Departments for dropdown
  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const res = await api.get('/api/students/departments/');
      return res.data;
    }
  });

  const defaulters = useMemo(() => dueData?.defaulters || [], [dueData]);
  const summary = useMemo(() => dueData?.summary || {
    total_defaulters: 0,
    total_due_amount: 0,
    total_monthly_due: 0,
    total_hostel_due: 0,
    current_year: selectedYear,
    current_month: upToMonth,
    current_month_name: BANGLA_MONTHS[upToMonth] || ''
  }, [dueData, selectedYear, upToMonth]);

  // Select All / Deselect All
  const handleSelectAll = () => {
    if (selectedStudentIds.length === defaulters.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(defaulters.map((d: any) => d.id));
    }
  };

  const toggleSelectStudent = (id: number) => {
    if (selectedStudentIds.includes(id)) {
      setSelectedStudentIds(selectedStudentIds.filter(item => item !== id));
    } else {
      setSelectedStudentIds([...selectedStudentIds, id]);
    }
  };

  // Single WhatsApp Reminder Mutation
  const singleReminderMutation = useMutation({
    mutationFn: async (payload: { student_id: number; custom_note?: string }) => {
      const res = await api.post('/api/fees/reminders/', {
        ...payload,
        year: selectedYear,
        up_to_month: upToMonth,
      });
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'হোয়াটসঅ্যাপে রিমাইন্ডার সফলভাবে পাঠানো হয়েছে!', {
        icon: '📱',
        style: {
          borderRadius: '12px',
          background: '#064e3b',
          color: '#fff',
        },
      });
      queryClient.invalidateQueries({ queryKey: ['due-fees'] });
      setSingleStudentPrompt(null);
    },
    onError: () => {
      toast.error('রিমাইন্ডার প্রেরণে সমস্যা হয়েছে।');
    }
  });

  // Bulk WhatsApp Reminder Mutation
  const bulkReminderMutation = useMutation({
    mutationFn: async (payload: { student_ids: number[]; custom_note: string }) => {
      const res = await api.post('/api/fees/reminders/bulk/', {
        ...payload,
        year: selectedYear,
        up_to_month: upToMonth,
      });
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'বাল্ক রিমাইন্ডার পাঠানো সম্পন্ন হয়েছে!', {
        icon: '🚀',
        duration: 4000,
        style: {
          borderRadius: '14px',
          background: '#064e3b',
          color: '#fff',
        },
      });
      setIsBulkModalOpen(false);
      setSelectedStudentIds([]);
      queryClient.invalidateQueries({ queryKey: ['due-fees'] });
    },
    onError: () => {
      toast.error('বাল্ক রিমাইন্ডার প্রেরণে সমস্যা হয়েছে।');
    }
  });

  const handleBulkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetIds = selectedStudentIds.length > 0 ? selectedStudentIds : defaulters.map((d: any) => d.id);
    if (targetIds.length === 0) {
      toast.error('রিমাইন্ডার পাঠানোর মতো কোনো শিক্ষার্থী নেই!');
      return;
    }
    bulkReminderMutation.mutate({
      student_ids: targetIds,
      custom_note: bulkCustomNote.trim(),
    });
  };

  // Print Roster
  const handlePrintRoster = () => {
    setPrintSingleStudent(null);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  // Print Individual Slip
  const handlePrintSlip = (student: any) => {
    setPrintSingleStudent(student);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  return (
    <AppLayout title="মাসিক ফি বকেয়া ও হোয়াটসঅ্যাপ রিমাইন্ডার">
      {/* 🖨️ PRINT STYLES */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
            font-size: 11pt !important;
          }
          nav, header, aside, .no-print, button, input {
            display: none !important;
          }
          .print-due-container {
            display: block !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          table {
            border-collapse: collapse !important;
            width: 100% !important;
          }
          th, td {
            border: 1px solid #333 !important;
            padding: 5px 7px !important;
            font-size: 9.5pt !important;
          }
        }
      `}</style>

      <div className="space-y-6 max-w-7xl mx-auto">

        {/* 🌟 Top Header Banner */}
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-[#02200d] text-white p-6 sm:p-7 rounded-3xl shadow-xl relative overflow-hidden border border-emerald-500/20 no-print">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-semibold mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>আল-মদিনা মডেল মাদ্রাসা এন্ড রিসার্চ ইনস্টিটিউট</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-3">
                <ShieldAlert className="w-8 h-8 text-amber-400 hidden sm:block" />
                <span>মাসিক ফি বকেয়া নোটিশ ও বাল্ক হোয়াটসঅ্যাপ রিমাইন্ডার</span>
              </h1>
              <p className="text-emerald-200/80 text-xs sm:text-sm mt-1 max-w-2xl">
                শিক্ষার্থীদের বকেয়া মাসিক বেতন ও হোস্টেল ফি স্বয়ংক্রিয় নিরীক্ষা, ফিল্টারিং, ১-ক্লিকে হোয়াটসঅ্যাপ রিমাইন্ডার প্রেরণ এবং তলবপত্র প্রিন্ট।
              </p>
            </div>

            {/* Header Action Controls */}
            <div className="flex flex-wrap items-center gap-2.5">
              
              {/* Year Selector */}
              <div className="flex items-center gap-2 bg-emerald-950/80 px-3 py-2 rounded-xl border border-emerald-500/30">
                <span className="text-xs text-emerald-200 font-bold">বছর:</span>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="bg-transparent text-white text-xs sm:text-sm font-black focus:outline-none cursor-pointer [&>option]:text-black"
                >
                  <option value={2026}>২০২৬</option>
                  <option value={2027}>২০২৭</option>
                  <option value={2025}>২০২৫</option>
                </select>
              </div>

              {/* Up to Month Selector */}
              <div className="flex items-center gap-2 bg-emerald-950/80 px-3 py-2 rounded-xl border border-emerald-500/30">
                <span className="text-xs text-emerald-200 font-bold">মাস পর্যন্ত:</span>
                <select
                  value={upToMonth}
                  onChange={(e) => setUpToMonth(Number(e.target.value))}
                  className="bg-transparent text-white text-xs sm:text-sm font-black focus:outline-none cursor-pointer [&>option]:text-black"
                >
                  {Object.entries(BANGLA_MONTHS).map(([m, name]) => (
                    <option key={m} value={m}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Fee Collection Link */}
              <Link
                href="/fees"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-bold border border-white/15 transition-all shadow-sm"
              >
                <DollarSign className="w-4 h-4 text-emerald-300" />
                <span>ফি আদায়ের খাতা</span>
              </Link>

              {/* Print Roster Button */}
              <button
                onClick={handlePrintRoster}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 text-xs sm:text-sm font-extrabold shadow-md transition-all active:scale-95"
                title="বকেয়া তালিকা A4 ফরম্যাটে প্রিন্ট করুন"
              >
                <Printer className="w-4 h-4" />
                <span>বকেয়া শিট প্রিন্ট</span>
              </button>

              {/* Refresh Button */}
              <button
                onClick={() => refetch()}
                className={`p-2 rounded-xl bg-white/10 hover:bg-white/20 text-emerald-200 hover:text-white transition-all ${
                  isFetching ? 'animate-spin text-amber-400' : ''
                }`}
                title="তথ্য রিফ্রেশ করুন"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 📊 4 Summary Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 no-print">
          
          {/* 1. Total Due Amount */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-rose-200/80 hover:shadow-md transition-all relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-28 h-28 bg-rose-50 rounded-full blur-2xl group-hover:bg-rose-100/70 transition-all pointer-events-none" />
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-rose-800">সর্বমোট বকেয়া পরিমাণ</span>
              <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-rose-600 tracking-tight">
              ৳ {toBanglaDigit(summary.total_due_amount.toLocaleString('en-IN'))}
            </div>
            <div className="text-[11px] text-rose-700 font-semibold mt-1.5">
              {BANGLA_MONTHS[upToMonth]} {toBanglaDigit(selectedYear)} পর্যন্ত পুঞ্জীভূত বকেয়া
            </div>
          </div>

          {/* 2. Total Defaulters */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-amber-200/80 hover:shadow-md transition-all relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-28 h-28 bg-amber-50 rounded-full blur-2xl group-hover:bg-amber-100/70 transition-all pointer-events-none" />
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-amber-800">বকেয়াদার শিক্ষার্থীর সংখ্যা</span>
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <User className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-700 tracking-tight">
              {toBanglaDigit(summary.total_defaulters)} <span className="text-sm font-semibold text-amber-500">জন</span>
            </div>
            <div className="text-[11px] text-amber-800 font-semibold mt-1.5">
              ১ বা একাধিক মাসের ফি অপরিশোধিত
            </div>
          </div>

          {/* 3. Tuition Fee Due */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200/80 hover:shadow-md transition-all relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-600">মাসিক বেতন বাবদ বকেয়া</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
              ৳ {toBanglaDigit(summary.total_monthly_due.toLocaleString('en-IN'))}
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              সাধারণ ও ইসলামিক বিভাগ সমূহের ফি
            </p>
          </div>

          {/* 4. Hostel Fee Due */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200/80 hover:shadow-md transition-all relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-600">হোস্টেল ও মেস বাবদ বকেয়া</span>
              <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                <Building className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
              ৳ {toBanglaDigit(summary.total_hostel_due.toLocaleString('en-IN'))}
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              আবাসিক ছাত্রদের আবাসন ও খাবার বিল
            </p>
          </div>

        </div>

        {/* 🔍 Filters & Bulk Actions Toolbar */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200/80 space-y-4 no-print">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="শিক্ষার্থীর নাম, রোল বা মোবাইল দিয়ে খুঁজুন..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-400 font-medium"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-3 text-slate-400">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Department Filter */}
            <div>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold text-slate-700"
              >
                <option value="all">সকল বিভাগ / শ্রেণি</option>
                {departments.map((d: any) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.dept_type === 'islamic' ? 'ইসলামিক' : 'জেনারেল'})
                  </option>
                ))}
              </select>
            </div>

            {/* Residential Status Filter */}
            <div>
              <select
                value={residentialFilter}
                onChange={(e) => setResidentialFilter(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold text-slate-700"
              >
                <option value="all">আবাসিক ও অনাবাসিক উভয়ে</option>
                <option value="residential">শুধু আবাসিক শিক্ষার্থী</option>
                <option value="day">শুধু অনাবাসিক (Day Scholar)</option>
              </select>
            </div>

            {/* Min Due Filter */}
            <div>
              <select
                value={minDue}
                onChange={(e) => setMinDue(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold text-slate-700"
              >
                <option value="0">যেকোনো বকেয়া (সকল)</option>
                <option value="1000">ন্যূনতম ১,০০০ ৳ এর বেশি</option>
                <option value="3000">ন্যূনতম ৩,০০০ ৳ এর বেশি</option>
                <option value="5000">ন্যূনতম ৫,০০০ ৳ এর বেশি</option>
                <option value="10000">ন্যূনতম ১০,০০০ ৳ এর বেশি</option>
              </select>
            </div>

          </div>

          {/* Bulk Action Controls */}
          <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleSelectAll}
                className="flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-emerald-800 transition-colors bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200"
              >
                {selectedStudentIds.length === defaulters.length && defaulters.length > 0 ? (
                  <CheckSquare className="w-4 h-4 text-emerald-700" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400" />
                )}
                <span>
                  {selectedStudentIds.length === defaulters.length && defaulters.length > 0
                    ? 'সকল নির্বাচন বাতিল'
                    : 'সবাইকে নির্বাচন করুন'}
                </span>
              </button>

              <span className="text-xs text-slate-500 font-semibold">
                নির্বাচিত: <strong className="text-emerald-900">{toBanglaDigit(selectedStudentIds.length)}</strong> / {toBanglaDigit(defaulters.length)} জন
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setIsBulkModalOpen(true)}
                disabled={defaulters.length === 0}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-600 hover:to-teal-600 text-white text-xs sm:text-sm font-extrabold shadow-md transition-all active:scale-95 disabled:opacity-50"
              >
                <Send className="w-4 h-4 text-amber-300" />
                <span>
                  {selectedStudentIds.length > 0
                    ? `নির্বাচিত (${toBanglaDigit(selectedStudentIds.length)}) জনকে বাল্ক নোটিশ পাঠান`
                    : 'সবাইকে একসাথে হোয়াটসঅ্যাপ রিমাইন্ডার পাঠান'}
                </span>
              </button>
            </div>

          </div>

        </div>

        {/* 📋 Defaulters Roster Grid */}
        {isLoading ? (
          <div className="bg-white rounded-3xl p-16 text-center text-slate-400 shadow-sm border border-slate-200">
            <RefreshCw className="w-8 h-8 mx-auto mb-3 animate-spin text-emerald-600" />
            <p className="text-sm font-semibold">বকেয়া ফি ডেটা লোড হচ্ছে...</p>
          </div>
        ) : defaulters.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center text-slate-400 shadow-sm border border-dashed border-slate-300">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-emerald-500 opacity-60" />
            <h3 className="text-base font-bold text-slate-800">কোনো বকেয়া ফি পাওয়া যায়নি!</h3>
            <p className="text-xs text-slate-400 mt-1">
              নির্বাচিত ফিল্টার অনুযায়ী সকল শিক্ষার্থীর ফি পরিশোধিত অথবা কোনো বকেয়া নেই।
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {defaulters.map((item: any) => {
              const isSelected = selectedStudentIds.includes(item.id);

              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-3xl p-5 shadow-sm border transition-all hover:shadow-md ${
                    isSelected ? 'ring-2 ring-emerald-500 border-emerald-400 bg-emerald-50/20' : 'border-slate-200/90'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    
                    {/* Left: Checkbox + Student Bio */}
                    <div className="flex items-start gap-3.5 flex-1">
                      
                      <button
                        onClick={() => toggleSelectStudent(item.id)}
                        className="mt-1 text-slate-400 hover:text-emerald-700 transition-colors"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-5 h-5 text-emerald-700" />
                        ) : (
                          <Square className="w-5 h-5 text-slate-300" />
                        )}
                      </button>

                      <div className="space-y-2 flex-1">
                        
                        {/* Badges */}
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono font-bold text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg border border-slate-200">
                            {item.student_id}
                          </span>
                          <span className="text-xs font-black bg-amber-100 text-amber-900 px-2 py-0.5 rounded-lg border border-amber-300">
                            রোল # {toBanglaDigit(item.roll_number || '০')}
                          </span>
                          <span className="text-xs font-bold text-slate-600 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-200">
                            শাখা: {item.section || 'A'}
                          </span>
                          <span className="px-2 py-0.5 rounded-lg bg-teal-50 text-teal-800 text-[11px] font-semibold border border-teal-200">
                            {item.residential_status_display}
                          </span>
                          <span className="text-xs font-bold text-emerald-800">
                            {item.class_name}
                          </span>
                        </div>

                        {/* Name & Guardian */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                          <h3 className="text-base sm:text-lg font-black text-slate-800">
                            {item.name_bn}
                          </h3>
                          <span className="text-xs text-slate-500">
                            পিতা/অভিভাবক: <strong>{item.father_name}</strong>
                          </span>
                          <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-mono font-bold">
                            <Phone className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{item.guardian_phone}</span>
                          </div>
                        </div>

                        {/* Due Breakdown Pills */}
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="px-2.5 py-1 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 font-bold">
                            বকেয়া মাস: <strong className="text-rose-900">{item.due_months_text}</strong>
                          </span>
                          <span className="text-slate-500 text-[11px]">
                            বেতন: ৳{toBanglaDigit(item.monthly_due)}
                            {item.hostel_due > 0 && ` • হোস্টেল: ৳${toBanglaDigit(item.hostel_due)}`}
                          </span>
                        </div>

                        {/* Last Reminder Sent Badge */}
                        <div className="text-[11px]">
                          {item.last_reminder_sent ? (
                            <span className="text-emerald-700 font-semibold inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>সর্বশেষ নোটিশ: {item.last_reminder_sent}</span>
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">এখনো নোটিশ পাঠানো হয়নি</span>
                          )}
                        </div>

                      </div>

                    </div>

                    {/* Right: Total Due Badge & Actions */}
                    <div className="flex flex-row lg:flex-col items-end justify-between lg:justify-center gap-3 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                      
                      <div className="text-left lg:text-right">
                        <span className="text-[11px] font-bold text-slate-400 block uppercase">মোট বকেয়া</span>
                        <div className="text-xl sm:text-2xl font-black text-rose-600 tracking-tight">
                          ৳ {toBanglaDigit(item.total_due.toLocaleString('en-IN'))}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        
                        {/* Direct WhatsApp Message Link */}
                        <a
                          href={item.whatsapp_link}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition-all active:scale-95"
                          title="সরাসরি হোয়াটসঅ্যাপে নোটিশ পাঠান"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-amber-300" />
                          <span>হোয়াটসঅ্যাপ</span>
                        </a>

                        {/* Individual Due Slip Print */}
                        <button
                          onClick={() => handlePrintSlip(item)}
                          className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                          title="ব্যক্তিগত বকেয়া তাগিদপত্র প্রিন্ট করুন"
                        >
                          <Printer className="w-4 h-4" />
                        </button>

                        {/* Single Send API Button */}
                        <button
                          onClick={() => singleReminderMutation.mutate({ student_id: item.id })}
                          disabled={singleReminderMutation.isPending}
                          className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 text-xs font-bold transition-all shadow-xs active:scale-95"
                          title="অটোমেটেড API দিয়ে নোটিশ পাঠান"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>

                      </div>

                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 🌟 MODAL: বাল্ক হোয়াটসঅ্যাপ নোটিশ প্রেরণ (Bulk Reminder Modal) */}
        {isBulkModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn no-print">
            <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
              
              <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-[#02200d] text-white p-5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-400 text-emerald-950 flex items-center justify-center font-bold">
                    <Send className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">বাল্ক হোয়াটসঅ্যাপ রিমাইন্ডার</h3>
                    <p className="text-xs text-emerald-200/80">
                      মোট প্রাপক: <strong className="text-amber-300 font-bold">{toBanglaDigit(selectedStudentIds.length > 0 ? selectedStudentIds.length : defaulters.length)} জন অভিভাবক</strong>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsBulkModalOpen(false)}
                  className="p-1 rounded-xl bg-white/10 hover:bg-white/20 text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleBulkSubmit} className="p-6 space-y-4">
                
                {/* Notice message preview info */}
                <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-xs text-emerald-950 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-emerald-800">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>স্বয়ংক্রিয় বাংলা নোটিশ ফরম্যাট:</span>
                  </div>
                  <p className="text-slate-600">
                    প্রতিটি মেসেজে শিক্ষার্থীর নাম, রোল, বিভাগ, নির্দিষ্ট বকেয়া মাসসমূহ, টাকার পরিমাণ এবং মাদ্রাসার বিকাশ/নগদ পেমেন্ট নম্বর অন্তর্ভুক্ত থাকবে।
                  </p>
                </div>

                {/* Custom Note input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    অতিরিক্ত বিশেষ তাগিদ বা নির্দেশনামা (ঐচ্ছিক)
                  </label>
                  <textarea
                    rows={3}
                    value={bulkCustomNote}
                    onChange={(e) => setBulkCustomNote(e.target.value)}
                    placeholder="যেমন: আগামী ১০ তারিখের মধ্যে বকেয়া পরিশোধ না করলে সাময়িক ক্লাস স্থগিত থাকবে..."
                    className="w-full p-3 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setIsBulkModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    disabled={bulkReminderMutation.isPending}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-600 hover:to-teal-600 active:scale-95 text-white text-xs sm:text-sm font-extrabold shadow-md transition-all disabled:opacity-50"
                  >
                    {bulkReminderMutation.isPending ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>পাঠানো হচ্ছে...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 text-amber-300" />
                        <span>এখনই রিমাইন্ডার পাঠান</span>
                      </>
                    )}
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}

        {/* 🖨️ OFFICIAL PRINTABLE A4 ROSTER & DUE STATEMENT */}
        <div className="hidden print:block print-due-container bg-white p-6 text-black">
          
          {/* CONDITION 1: FULL DEFAULTER ROSTER PRINT */}
          {!printSingleStudent && (
            <div>
              {/* Official Letterhead */}
              <div className="text-center pb-4 border-b-2 border-black mb-4">
                <div className="flex items-center justify-center gap-4 mb-2">
                  <img
                    src="/logo.jpg"
                    alt="Madrasa Logo"
                    className="w-16 h-16 object-contain rounded-full border border-black"
                  />
                  <div>
                    <h1 className="text-2xl font-black tracking-tight">
                      আল-মদিনা মডেল মাদ্রাসা এন্ড রিসার্চ ইনস্টিটিউট
                    </h1>
                    <p className="text-xs font-semibold">
                      ক-৭৫/২, মহাখালী দক্ষিণ পাড়া, বনানী, ঢাকা-১২১২ | ফোন: ০১৭২২-১৫৭৪৬৪, ০১৭১২-৬৩০২৬৪
                    </p>
                    <div className="inline-block mt-1 px-4 py-0.5 border border-black rounded-full font-black text-xs uppercase bg-gray-100">
                      মাসিক ফি বকেয়া তালিকা ও হিসাব নিরীক্ষা বিবরণী — {toBanglaDigit(selectedYear)} খ্রিঃ
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs mt-3 font-bold px-1 border-t border-dashed border-gray-400 pt-1">
                  <span>হিসাবকাল: জানুয়ারি হতে {BANGLA_MONTHS[upToMonth]} {toBanglaDigit(selectedYear)} পর্যন্ত</span>
                  <span>প্রিন্ট তারিখ ও সময়: {new Date().toLocaleDateString('bn-BD')} {new Date().toLocaleTimeString('bn-BD')}</span>
                </div>
              </div>

              {/* Summary Audit Box */}
              <div className="mb-4">
                <table className="w-full text-xs border border-black mb-2">
                  <thead>
                    <tr className="bg-gray-200 font-bold text-center">
                      <th className="p-2 border border-black">মোট বকেয়াদার ছাত্র</th>
                      <th className="p-2 border border-black">মাসিক বেতন বকেয়া</th>
                      <th className="p-2 border border-black">হোস্টেল ও মেস বকেয়া</th>
                      <th className="p-2 border border-black bg-gray-300">সর্বমোট বকেয়া টাকার পরিমাণ</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="text-center font-bold text-sm">
                      <td className="p-2 border border-black">{toBanglaDigit(summary.total_defaulters)} জন</td>
                      <td className="p-2 border border-black">৳ {toBanglaDigit(summary.total_monthly_due.toLocaleString('en-IN'))}</td>
                      <td className="p-2 border border-black">৳ {toBanglaDigit(summary.total_hostel_due.toLocaleString('en-IN'))}</td>
                      <td className="p-2 border border-black bg-gray-100 font-black text-base">
                        ৳ {toBanglaDigit(summary.total_due_amount.toLocaleString('en-IN'))}
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div className="text-xs italic px-1 font-semibold">
                  সর্বমোট বকেয়া কথায়: {numberToBanglaWords(summary.total_due_amount)}
                </div>
              </div>

              {/* Roster Table */}
              <div className="mb-8">
                <table className="w-full text-[9pt] border border-black">
                  <thead>
                    <tr className="bg-gray-200 font-bold text-center">
                      <th className="p-1 border border-black w-8">ক্রমিক</th>
                      <th className="p-1 border border-black">রোল ও আইডি</th>
                      <th className="p-1 border border-black text-left">শিক্ষার্থীর নাম</th>
                      <th className="p-1 border border-black text-left">শ্রেণি / বিভাগ</th>
                      <th className="p-1 border border-black text-left">অভিভাবকের মোবাইল</th>
                      <th className="p-1 border border-black text-left">বকেয়া মাসসমূহ</th>
                      <th className="p-1 border border-black text-right">বকেয়া (৳)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {defaulters.map((d: any, idx: number) => (
                      <tr key={d.id} className="text-center">
                        <td className="p-1 border border-black font-mono">{toBanglaDigit(idx + 1)}</td>
                        <td className="p-1 border border-black font-mono font-bold">
                          {toBanglaDigit(d.roll_number || '০')} ({d.student_id})
                        </td>
                        <td className="p-1 border border-black text-left font-bold">{d.name_bn}</td>
                        <td className="p-1 border border-black text-left">{d.class_name} ({d.residential_status_display})</td>
                        <td className="p-1 border border-black text-left font-mono">{d.guardian_phone}</td>
                        <td className="p-1 border border-black text-left font-semibold">{d.due_months_text}</td>
                        <td className="p-1 border border-black text-right font-black">
                          {toBanglaDigit(d.total_due.toLocaleString('en-IN'))}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-gray-200 font-bold text-[10pt]">
                      <td colSpan={6} className="p-1.5 border border-black text-right">সর্বমোট বকেয়া:</td>
                      <td className="p-1.5 border border-black text-right font-black">
                        ৳ {toBanglaDigit(summary.total_due_amount.toLocaleString('en-IN'))}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Signatures */}
              <div className="mt-14 pt-6 grid grid-cols-3 text-center text-xs font-bold gap-8">
                <div>
                  <div className="border-t border-black pt-1">
                    হিসাবরক্ষক স্বাক্ষর ও তারিখ
                  </div>
                  <p className="text-[10px] text-gray-600 mt-0.5">আল-মদিনা মডেল মাদ্রাসা</p>
                </div>
                <div>
                  <div className="border-t border-black pt-1">
                    নিরীক্ষক / কোষাধ্যক্ষ
                  </div>
                  <p className="text-[10px] text-gray-600 mt-0.5">মাদ্রাসার অডিট কমিটি</p>
                </div>
                <div>
                  <div className="border-t border-black pt-1 font-black">
                    অধ্যক্ষ ও মুহতামিম
                  </div>
                  <p className="text-[10px] text-gray-900 font-bold mt-0.5">মাওলানা ওমর ফারুক মুজাহিদী</p>
                </div>
              </div>
            </div>
          )}

          {/* CONDITION 2: INDIVIDUAL STUDENT DUE SLIP (তাগিদপত্র স্লিপ) */}
          {printSingleStudent && (
            <div>
              <div className="text-center pb-4 border-b-2 border-black mb-4">
                <div className="flex items-center justify-center gap-4 mb-2">
                  <img
                    src="/logo.jpg"
                    alt="Madrasa Logo"
                    className="w-16 h-16 object-contain rounded-full border border-black"
                  />
                  <div>
                    <h1 className="text-2xl font-black tracking-tight">
                      আল-মদিনা মডেল মাদ্রাসা এন্ড রিসার্চ ইনস্টিটিউট
                    </h1>
                    <p className="text-xs font-semibold">
                      ক-৭৫/২, মহাখালী দক্ষিণ পাড়া, বনানী, ঢাকা-১২১২ | ফোন: ০১৭২২-১৫৭৪৬৪, ০১৭১২-৬৩০২৬৪
                    </p>
                    <div className="inline-block mt-1 px-4 py-0.5 border border-black rounded-full font-black text-xs uppercase bg-gray-100">
                      মাসিক ফি বকেয়া পরিশোধ তাগিদপত্র ও অভিভাবক তলব নোটিশ
                    </div>
                  </div>
                </div>
              </div>

              {/* Personalized Notice Text */}
              <div className="mb-4 text-xs leading-relaxed border border-black p-3 rounded-lg bg-gray-50">
                <p className="mb-2"><strong>সম্মানিত অভিভাবক,</strong></p>
                <p>
                  আস-সালামু আলাইকুম ওয়ারাহমাতুল্লাহ। আল-মদিনা মডেল মাদ্রাসার হিসাব শাখা হতে আপনাকে বিনীতভাবে জানানো যাচ্ছে যে, আপনার সন্তান <strong>{printSingleStudent.name_bn}</strong> (রোল: {toBanglaDigit(printSingleStudent.roll_number || '০')}, আইডি: {printSingleStudent.student_id}, শ্রেণি: {printSingleStudent.class_name})-এর মাসিক বেতন ও অন্যান্য ফি নিম্নরূপ বকেয়া রয়েছে:
                </p>
              </div>

              {/* Student Due Table */}
              <table className="w-full text-xs border border-black mb-4">
                <tbody>
                  <tr>
                    <td className="p-2 border border-black bg-gray-100 font-bold w-1/3">শিক্ষার্থীর নাম:</td>
                    <td className="p-2 border border-black font-extrabold w-2/3">{printSingleStudent.name_bn} ({printSingleStudent.student_id})</td>
                  </tr>
                  <tr>
                    <td className="p-2 border border-black bg-gray-100 font-bold">শ্রেণি, শাখা ও রোল:</td>
                    <td className="p-2 border border-black font-bold">
                      {printSingleStudent.class_name} • শাখা: {printSingleStudent.section || 'A'} • রোল: #{toBanglaDigit(printSingleStudent.roll_number || '০')}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 border border-black bg-gray-100 font-bold">পিতা / অভিভাবক:</td>
                    <td className="p-2 border border-black">{printSingleStudent.father_name} (মোবাইল: {printSingleStudent.guardian_phone})</td>
                  </tr>
                  <tr>
                    <td className="p-2 border border-black bg-gray-100 font-bold">বকেয়া মাসসমূহ:</td>
                    <td className="p-2 border border-black font-bold text-rose-700">{printSingleStudent.due_months_text}</td>
                  </tr>
                  <tr>
                    <td className="p-2 border border-black bg-gray-100 font-bold">মাসিক বেতন বাবদ বকেয়া:</td>
                    <td className="p-2 border border-black font-bold">৳ {toBanglaDigit(printSingleStudent.monthly_due.toLocaleString('en-IN'))}</td>
                  </tr>
                  {printSingleStudent.hostel_due > 0 && (
                    <tr>
                      <td className="p-2 border border-black bg-gray-100 font-bold">হোস্টেল ও মেস বাবদ বকেয়া:</td>
                      <td className="p-2 border border-black font-bold">৳ {toBanglaDigit(printSingleStudent.hostel_due.toLocaleString('en-IN'))}</td>
                    </tr>
                  )}
                  <tr className="bg-gray-200">
                    <td className="p-2 border border-black font-black text-sm">সর্বমোট পরিশোধযোগ্য বকেয়া:</td>
                    <td className="p-2 border border-black font-black text-base">
                      ৳ {toBanglaDigit(printSingleStudent.total_due.toLocaleString('en-IN'))}
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="text-xs italic mb-4 font-bold">
                কথায়: {numberToBanglaWords(printSingleStudent.total_due)}
              </div>

              {/* Payment Details */}
              <div className="border border-black p-3 text-xs mb-8 rounded-lg bg-gray-50">
                <p className="font-bold mb-1">পরিশোধের মাধ্যম ও নিয়মাবলী:</p>
                <p>১. মাদ্রাসার হিসাব শাখায় সরাসরি নগদ জমা দিয়ে অফিসিয়াল সিলযুক্ত মানি রিসিট গ্রহণ করুন।</p>
                <p>২. অথবা বিকাশ/নগদ মার্চেন্ট নম্বর: <strong>০১৭১২-৬৩৩২৬৪</strong>-এ রেফারেন্সে ছাত্রের আইডি <strong>({printSingleStudent.student_id})</strong> লিখে জমা দিন।</p>
              </div>

              {/* Signatures */}
              <div className="mt-14 pt-6 grid grid-cols-2 text-center text-xs font-bold gap-12">
                <div>
                  <div className="border-t border-black pt-1">
                    হিসাবরক্ষক স্বাক্ষর
                  </div>
                  <p className="text-[10px] text-gray-600 mt-0.5">আল-মদিনা মডেল মাদ্রাসা</p>
                </div>
                <div>
                  <div className="border-t border-black pt-1 font-black">
                    অধ্যক্ষ ও মুহতামিম
                  </div>
                  <p className="text-[10px] text-gray-900 font-bold mt-0.5">মাওলানা ওমর ফারুক মুজাহিদী</p>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </AppLayout>
  );
}
