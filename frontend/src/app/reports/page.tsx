/* eslint-disable */
'use client';

import { useState, useMemo } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import {
  Printer, PlusCircle, Calendar, DollarSign, TrendingUp, TrendingDown,
  Wallet, FileText, CheckCircle2, AlertCircle, ArrowUpRight, ArrowDownRight,
  Sparkles, Search, X, RefreshCw, Check, Clock, User, Tag, HelpCircle,
  BarChart3, PieChart, Layers, Building
} from 'lucide-react';
import { numberToBanglaWords, toBanglaDigit } from '@/lib/numberToBanglaWords';

const EXPENSE_CATEGORIES = [
  { value: 'salary', label: 'শিক্ষক ও স্টাফ বেতন (Salary)' },
  { value: 'food', label: 'মেস ও খাদ্য সামগ্রী (Hostel & Food)' },
  { value: 'utility', label: 'বিদ্যুৎ, গ্যাস ও পানি বিল (Utility Bills)' },
  { value: 'maintenance', label: 'ক্যাম্পাস মেরামত ও পরিচ্ছন্নতা (Maintenance)' },
  { value: 'stationery', label: 'প্রিন্টিং ও স্টেশনারি (Printing & Stationery)' },
  { value: 'entertainment', label: 'আপ্যায়ন ও মেহমানদারি (Refreshments)' },
  { value: 'conveyance', label: 'যাতায়াত ও পরিবহন (Conveyance)' },
  { value: 'other', label: 'বিবিধ পরিচালনা ব্যয় (Miscellaneous)' },
];

export default function DailyCashBookPage() {
  const queryClient = useQueryClient();

  // Selected date state (defaults to today)
  const todayStr = useMemo(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  }, []);

  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  // Search filters inside ledgers
  const [incomeSearch, setIncomeSearch] = useState('');
  const [expenseSearch, setExpenseSearch] = useState('');

  // Modal State for adding new expense voucher
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('other');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseSpentBy, setExpenseSpentBy] = useState('');
  const [expenseNote, setExpenseNote] = useState('');
  const [voucherNumber, setVoucherNumber] = useState('');

  // Mode: Daily Cash Book vs Annual Financial Audit
  const [reportMode, setReportMode] = useState<'daily' | 'annual'>('daily');
  const [auditYear, setAuditYear] = useState<number>(new Date().getFullYear());

  // Fetch Daily Cash Book Data
  const { data: cashbook, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['daily-cashbook', selectedDate],
    queryFn: async () => {
      const res = await api.get(`/api/fees/cashbook/?date=${selectedDate}`);
      return res.data;
    },
    enabled: reportMode === 'daily'
  });

  // Fetch Annual Financial Audit Data
  const { 
    data: annualAudit, 
    isLoading: isAnnualLoading, 
    isFetching: isAnnualFetching,
    refetch: refetchAnnual 
  } = useQuery({
    queryKey: ['annual-financial-audit', auditYear],
    queryFn: async () => {
      const res = await api.get(`/api/reports/annual-financial/?year=${auditYear}`);
      return res.data;
    },
    enabled: reportMode === 'annual'
  });

  // Mutation for adding expense
  const createExpenseMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post('/api/fees/expenses/', payload);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(`খরচ ভাউচার #${data.voucher_number || ''} সফলভাবে সংরক্ষিত হয়েছে!`, {
        icon: '✅',
        style: {
          borderRadius: '12px',
          background: '#064e3b',
          color: '#fff',
        },
      });
      setIsExpenseModalOpen(false);
      setExpenseTitle('');
      setExpenseCategory('other');
      setExpenseAmount('');
      setExpenseSpentBy('');
      setExpenseNote('');
      setVoucherNumber('');
      queryClient.invalidateQueries({ queryKey: ['daily-cashbook', selectedDate] });
    },
    onError: (err: any) => {
      toast.error('ভাউচার এন্ট্রি সংরক্ষণে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    },
  });

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseTitle.trim()) {
      toast.error('খরচের বিবরণ লিখুন');
      return;
    }
    const amt = parseFloat(expenseAmount);
    if (isNaN(amt) || amt <= 0) {
      toast.error('সঠিক টাকার পরিমাণ লিখুন');
      return;
    }

    createExpenseMutation.mutate({
      title: expenseTitle.trim(),
      category: expenseCategory,
      amount: amt,
      expense_date: selectedDate,
      spent_by: expenseSpentBy.trim(),
      note: expenseNote.trim(),
      voucher_number: voucherNumber.trim() || undefined,
    });
  };

  // Filtered Incomes
  const filteredIncomes = useMemo(() => {
    if (!cashbook?.incomes) return [];
    if (!incomeSearch.trim()) return cashbook.incomes;
    const q = incomeSearch.toLowerCase();
    return cashbook.incomes.filter(
      (item: any) =>
        item.receipt_number?.toLowerCase().includes(q) ||
        item.student_name?.toLowerCase().includes(q) ||
        item.student_name_bn?.toLowerCase().includes(q) ||
        item.student_id?.toLowerCase().includes(q) ||
        item.payment_type_display?.toLowerCase().includes(q)
    );
  }, [cashbook?.incomes, incomeSearch]);

  // Filtered Expenses
  const filteredExpenses = useMemo(() => {
    if (!cashbook?.expenses) return [];
    if (!expenseSearch.trim()) return cashbook.expenses;
    const q = expenseSearch.toLowerCase();
    return cashbook.expenses.filter(
      (item: any) =>
        item.voucher_number?.toLowerCase().includes(q) ||
        item.title?.toLowerCase().includes(q) ||
        item.category_display?.toLowerCase().includes(q) ||
        item.spent_by?.toLowerCase().includes(q)
    );
  }, [cashbook?.expenses, expenseSearch]);

  const openingBal = parseFloat(cashbook?.opening_balance || 0);
  const totalIn = parseFloat(cashbook?.total_income || 0);
  const totalOut = parseFloat(cashbook?.total_expense || 0);
  const closingBal = parseFloat(cashbook?.closing_balance || 0);
  const netFlow = parseFloat(cashbook?.net_cash_flow || 0);

  // Maximum monthly value for chart scale calculation
  const maxMonthlyVal = useMemo(() => {
    if (!annualAudit?.monthly_trend) return 100000;
    const maxVal = Math.max(
      ...annualAudit.monthly_trend.map((m: any) =>
        Math.max(Number(m.income || 0), Number(m.expense || 0))
      ),
      100000
    );
    return maxVal;
  }, [annualAudit?.monthly_trend]);

  return (
    <AppLayout title="দৈনিক ক্যাশ খাতা ও ব্যালেন্স শিট">
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
          .print-container {
            display: block !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .print-page {
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
          }
          table {
            border-collapse: collapse !important;
            width: 100% !important;
          }
          th, td {
            border: 1px solid #333 !important;
            padding: 4px 6px !important;
            font-size: 10pt !important;
          }
        }
      `}</style>

      <div className="space-y-6 max-w-7xl mx-auto">

        {/* 🌟 Top Header & Date Navigation Banner */}
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-[#02200d] text-white p-6 rounded-3xl shadow-xl relative overflow-hidden border border-emerald-500/20 no-print">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-semibold mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>আল-মদিনা মডেল মাদ্রাসা এন্ড রিসার্চ ইনস্টিটিউট</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-3">
                <span>
                  {reportMode === 'daily'
                    ? 'মাদ্রাসার দৈনিক ক্যাশ খাতা ও ব্যালেন্স শিট'
                    : 'বার্ষিক আয়-ব্যয় অডিট ও গ্রাফিক্যাল আর্থিক রিপোর্ট'}
                </span>
              </h1>
              <p className="text-emerald-200/80 text-xs sm:text-sm mt-1 max-w-2xl">
                {reportMode === 'daily'
                  ? 'দৈনিক যাবতীয় ছাত্র বেতন আদায় ও প্রশাসনিক খরচসমূহের স্বয়ংক্রিয় ব্যালেন্স শিট, প্রারম্ভিক জের ও নগদ সমাপনী ক্যাশ অডিট।'
                  : `${toBanglaDigit(auditYear)} শিক্ষাবর্ষের ১২ মাসের সমন্বিত আর্থিক অডিট, মাসিক আয়-ব্যয়ের গ্রাফিকাল বিশ্লেষণ এবং ক্যাটাগরিভিত্তিক বাজেট বিভাজন।`}
              </p>

              {/* Mode Switcher Tabs */}
              <div className="flex items-center gap-2 mt-4">
                <button
                  onClick={() => setReportMode('daily')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    reportMode === 'daily'
                      ? 'bg-amber-400 text-emerald-950 shadow-md scale-[1.02]'
                      : 'bg-white/10 text-emerald-200 hover:bg-white/20'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>দৈনিক ক্যাশ খাতা</span>
                </button>
                <button
                  onClick={() => setReportMode('annual')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    reportMode === 'annual'
                      ? 'bg-amber-400 text-emerald-950 shadow-md scale-[1.02]'
                      : 'bg-white/10 text-emerald-200 hover:bg-white/20'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>বার্ষিক অডিট ও চার্ট ({toBanglaDigit(auditYear)})</span>
                </button>
              </div>
            </div>

            {/* Date/Year Picker & Action Controls */}
            <div className="flex flex-wrap items-center gap-3 bg-black/40 p-2 rounded-2xl border border-white/10 backdrop-blur-md">
              {reportMode === 'daily' ? (
                <>
                  <div className="flex items-center gap-2 bg-emerald-950/80 px-3 py-2 rounded-xl border border-emerald-500/30">
                    <Calendar className="w-4 h-4 text-amber-400" />
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="bg-transparent text-white text-xs sm:text-sm font-semibold focus:outline-none cursor-pointer"
                    />
                  </div>

                  {/* Quick Preset Buttons */}
                  <button
                    onClick={() => setSelectedDate(todayStr)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      selectedDate === todayStr
                        ? 'bg-amber-400 text-emerald-950 shadow-md'
                        : 'bg-white/10 text-emerald-200 hover:text-white'
                    }`}
                  >
                    আজ
                  </button>

                  {/* Add Expense Button */}
                  <button
                    onClick={() => setIsExpenseModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs sm:text-sm font-bold shadow-md transition-all active:scale-95"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>নতুন খরচ এন্ট্রি</span>
                  </button>
                </>
              ) : (
                <>
                  {/* Year Selector */}
                  <div className="flex items-center gap-2 bg-emerald-950/80 px-3 py-2 rounded-xl border border-emerald-500/30">
                    <Building className="w-4 h-4 text-amber-400" />
                    <span className="text-xs text-emerald-200 font-bold">শিক্ষাবর্ষ:</span>
                    <select
                      value={auditYear}
                      onChange={(e) => setAuditYear(Number(e.target.value))}
                      className="bg-transparent text-white text-xs sm:text-sm font-black focus:outline-none cursor-pointer [&>option]:text-black"
                    >
                      {[2024, 2025, 2026, 2027].map((yr) => (
                        <option key={yr} value={yr}>
                          {toBanglaDigit(yr)} খ্রিঃ
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {/* Print Button */}
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 text-xs sm:text-sm font-extrabold shadow-md transition-all active:scale-95"
                title={
                  reportMode === 'daily'
                    ? 'অফিসিয়াল ক্যাশ খাতা A4 ফরম্যাটে প্রিন্ট করুন'
                    : 'বার্ষিক অডিট ব্যালেন্স শিট A4 ফরম্যাটে প্রিন্ট করুন'
                }
              >
                <Printer className="w-4 h-4" />
                <span>প্রিন্ট রিপোর্ট</span>
              </button>

              {/* Refresh Button */}
              <button
                onClick={() => (reportMode === 'daily' ? refetch() : refetchAnnual())}
                className={`p-2 rounded-xl bg-white/10 hover:bg-white/20 text-emerald-200 hover:text-white transition-all ${
                  (reportMode === 'daily' ? isFetching : isAnnualFetching)
                    ? 'animate-spin text-amber-400'
                    : ''
                }`}
                title="তথ্য রিফ্রেশ করুন"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ===================== DAILY CASH BOOK VIEW ===================== */}
        {reportMode === 'daily' && (
          <>
            {/* 📊 Financial Summary Cards (Executive Stat Grid) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 no-print">
          
          {/* 1. Opening Balance */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 hover:shadow-md transition-all relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500">প্রারম্ভিক জের (Opening)</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
              ৳ {toBanglaDigit(openingBal.toLocaleString('en-IN', { minimumFractionDigits: 2 }))}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              গতকালের সমাপনী নগদ উদ্বৃত্ত
            </p>
          </div>

          {/* 2. Today's Inflow */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-emerald-100 hover:shadow-md transition-all relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full blur-2xl group-hover:bg-emerald-100/60 transition-all pointer-events-none" />
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-700">আজকের মোট জমা (Inflow)</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-700 tracking-tight">
              + ৳ {toBanglaDigit(totalIn.toLocaleString('en-IN', { minimumFractionDigits: 2 }))}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-semibold mt-1">
              <span className="px-1.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-200">
                {toBanglaDigit(cashbook?.income_count || 0)} টি রশিদ
              </span>
              <span>আদায় সম্পন্ন</span>
            </div>
          </div>

          {/* 3. Today's Outflow */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-rose-100 hover:shadow-md transition-all relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 rounded-full blur-2xl group-hover:bg-rose-100/60 transition-all pointer-events-none" />
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-rose-700">আজকের মোট খরচ (Outflow)</span>
              <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                <TrendingDown className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-rose-600 tracking-tight">
              - ৳ {toBanglaDigit(totalOut.toLocaleString('en-IN', { minimumFractionDigits: 2 }))}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-rose-600 font-semibold mt-1">
              <span className="px-1.5 py-0.5 rounded-md bg-rose-50 border border-rose-200">
                {toBanglaDigit(cashbook?.expense_count || 0)} টি ভাউচার
              </span>
              <span>ব্যয় অনুমোদিত</span>
            </div>
          </div>

          {/* 4. Closing Cash Balance */}
          <div className={`rounded-2xl p-5 shadow-sm border hover:shadow-md transition-all relative overflow-hidden ${
            closingBal >= 0 
              ? 'bg-gradient-to-br from-emerald-900 to-teal-950 text-white border-emerald-700' 
              : 'bg-gradient-to-br from-rose-900 to-red-950 text-white border-rose-700'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-200/90">সমাপনী ক্যাশ উদ্বৃত্ত (Closing)</span>
              <div className="w-8 h-8 rounded-xl bg-white/10 text-amber-300 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black tracking-tight text-amber-300">
              ৳ {toBanglaDigit(closingBal.toLocaleString('en-IN', { minimumFractionDigits: 2 }))}
            </div>
            <div className="flex items-center justify-between text-[11px] text-emerald-100/80 mt-1">
              <span>নগদ ক্যাশ হাতে আছে</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                netFlow >= 0 ? 'bg-emerald-500/30 text-emerald-200' : 'bg-rose-500/30 text-rose-200'
              }`}>
                নিট ফ্লো: {netFlow >= 0 ? '+' : ''}{toBanglaDigit(netFlow)} ৳
              </span>
            </div>
          </div>

        </div>

        {/* 📑 Category Breakdown Pills */}
        <div className="bg-slate-50/80 border border-slate-200/60 p-4 rounded-2xl no-print flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <Tag className="w-4 h-4 text-emerald-600" />
            <span>আজকের তারিখ: <strong className="text-emerald-900">{cashbook?.date_bn || selectedDate}</strong></span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">আদায় খাত:</span>
            {cashbook?.income_breakdown && Object.keys(cashbook.income_breakdown).length > 0 ? (
              Object.entries(cashbook.income_breakdown).map(([k, v]) => (
                <span key={k} className="px-2.5 py-1 rounded-lg bg-emerald-100/70 border border-emerald-200 text-emerald-800 text-xs font-medium">
                  {k === 'monthly' ? 'মাসিক বেতন' : k === 'hostel' ? 'হোস্টেল' : k === 'admission' ? 'ভর্তি' : k === 'exam' ? 'পরীক্ষা' : k}: ৳{toBanglaDigit(Number(v))}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-400 italic">আজ কোনো আদায় নেই</span>
            )}
            
            <div className="h-4 w-px bg-slate-300 mx-1 hidden md:block" />

            <span className="text-xs font-semibold text-slate-500">খরচ খাত:</span>
            {cashbook?.expense_breakdown && Object.keys(cashbook.expense_breakdown).length > 0 ? (
              Object.entries(cashbook.expense_breakdown).map(([k, v]) => (
                <span key={k} className="px-2.5 py-1 rounded-lg bg-rose-100/70 border border-rose-200 text-rose-800 text-xs font-medium">
                  {k === 'salary' ? 'বেতন' : k === 'food' ? 'খাদ্য' : k === 'utility' ? 'বিল' : k === 'stationery' ? 'স্টেশনারি' : k === 'maintenance' ? 'মেরামত' : k === 'entertainment' ? 'আপ্যায়ন' : k}: ৳{toBanglaDigit(Number(v))}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-400 italic">আজ কোনো খরচ নেই</span>
            )}
          </div>
        </div>

        {/* 📖 DUAL LEDGER GRID: জমা ও খরচ খাতা (Screen View) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 no-print">

          {/* 🟢 LEFT LEDGER: জমা বিবরণী (Cash Inflow / Receipts) */}
          <div className="bg-white rounded-3xl shadow-sm border border-emerald-200/80 overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-emerald-800 to-emerald-700 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-900/60 flex items-center justify-center font-bold text-amber-300">
                  জ
                </div>
                <div>
                  <h2 className="font-extrabold text-base">জমা খাতা (Cash Inflow / Receipts)</h2>
                  <p className="text-[11px] text-emerald-100">ছাত্র বেতন, হোস্টেল ও অন্যান্য আদায়</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs bg-emerald-900/50 px-2.5 py-1 rounded-full font-bold text-amber-300 border border-emerald-500/30">
                  মোট: ৳ {toBanglaDigit(totalIn.toLocaleString('en-IN'))}
                </span>
              </div>
            </div>

            {/* Sub-search */}
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={incomeSearch}
                onChange={(e) => setIncomeSearch(e.target.value)}
                placeholder="রশিদ নং, শিক্ষার্থীর নাম বা আইডি দিয়ে খুঁজুন..."
                className="w-full bg-transparent text-xs text-slate-700 focus:outline-none placeholder:text-slate-400"
              />
              {incomeSearch && (
                <button onClick={() => setIncomeSearch('')}>
                  <X className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600" />
                </button>
              )}
            </div>

            {/* Table */}
            <div className="overflow-x-auto flex-1 max-h-[520px]">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/90 text-slate-600 font-bold uppercase tracking-wider sticky top-0 z-10 border-b border-slate-200">
                  <tr>
                    <th className="px-3 py-2.5">রশিদ নং</th>
                    <th className="px-3 py-2.5">শিক্ষার্থীর নাম ও রোল</th>
                    <th className="px-3 py-2.5">খাত / বিবরণ</th>
                    <th className="px-3 py-2.5 text-right">আদায় (৳)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredIncomes.length > 0 ? (
                    filteredIncomes.map((item: any) => (
                      <tr key={item.id} className="hover:bg-emerald-50/40 transition-colors">
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                            {item.receipt_number}
                          </span>
                          <div className="text-[10px] text-slate-400 mt-0.5">{item.created_at}</div>
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="font-bold text-slate-800">{item.student_name_bn || item.student_name}</div>
                          <div className="text-[11px] text-slate-500">
                            রোল: {toBanglaDigit(item.roll_number || '০')} • {item.department || item.student_id}
                          </div>
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[10px]">
                            {item.payment_type_display}
                          </span>
                          {item.month_name && (
                            <span className="text-[10px] text-slate-500 ml-1">({item.month_name})</span>
                          )}
                          {item.note && (
                            <div className="text-[10px] text-slate-400 truncate max-w-[140px]">{item.note}</div>
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-right font-black text-emerald-700 text-sm whitespace-nowrap">
                          ৳ {toBanglaDigit(Number(item.amount_paid).toLocaleString('en-IN'))}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-slate-400">
                        <FileText className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
                        <p className="text-xs">আজকের তারিখে কোনো ফি আদায় রেকর্ড নেই</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer Summary */}
            <div className="p-3 bg-emerald-50/80 border-t border-emerald-200 flex items-center justify-between font-bold text-xs text-emerald-950">
              <span>মোট আদায়কৃত রশিদ: {toBanglaDigit(filteredIncomes.length)} টি</span>
              <span className="text-sm font-black text-emerald-800">
                মোট: ৳ {toBanglaDigit(filteredIncomes.reduce((acc: number, cur: any) => acc + Number(cur.amount_paid), 0).toLocaleString('en-IN'))}
              </span>
            </div>
          </div>

          {/* 🔴 RIGHT LEDGER: খরচ বিবরণী (Cash Outflow / Expenses) */}
          <div className="bg-white rounded-3xl shadow-sm border border-rose-200/80 overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-rose-800 to-rose-700 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-900/60 flex items-center justify-center font-bold text-amber-300">
                  খ
                </div>
                <div>
                  <h2 className="font-extrabold text-base">খরচ খাতা (Cash Outflow / Vouchers)</h2>
                  <p className="text-[11px] text-rose-100">বেতন, মেস খাদ্য, বিদ্যুৎ বিল ও পরিচালনা ব্যয়</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-rose-900/50 px-2.5 py-1 rounded-full font-bold text-amber-300 border border-rose-500/30">
                  মোট: ৳ {toBanglaDigit(totalOut.toLocaleString('en-IN'))}
                </span>
                <button
                  onClick={() => setIsExpenseModalOpen(true)}
                  className="bg-amber-400 hover:bg-amber-300 text-emerald-950 p-1.5 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1"
                  title="নতুন খরচ যোগ করুন"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span className="text-[11px]">যোগ</span>
                </button>
              </div>
            </div>

            {/* Sub-search */}
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={expenseSearch}
                onChange={(e) => setExpenseSearch(e.target.value)}
                placeholder="ভাউচার নং, খরচের বিবরণ বা খাত দিয়ে খুঁজুন..."
                className="w-full bg-transparent text-xs text-slate-700 focus:outline-none placeholder:text-slate-400"
              />
              {expenseSearch && (
                <button onClick={() => setExpenseSearch('')}>
                  <X className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600" />
                </button>
              )}
            </div>

            {/* Table */}
            <div className="overflow-x-auto flex-1 max-h-[520px]">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/90 text-slate-600 font-bold uppercase tracking-wider sticky top-0 z-10 border-b border-slate-200">
                  <tr>
                    <th className="px-3 py-2.5">ভাউচার নং</th>
                    <th className="px-3 py-2.5">খরচের বিবরণ ও খাত</th>
                    <th className="px-3 py-2.5">ব্যয়কারী / মাধ্যম</th>
                    <th className="px-3 py-2.5 text-right">ব্যয় (৳)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredExpenses.length > 0 ? (
                    filteredExpenses.map((item: any) => (
                      <tr key={item.id} className="hover:bg-rose-50/40 transition-colors">
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          <span className="font-mono font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 text-[11px]">
                            {item.voucher_number}
                          </span>
                          <div className="text-[10px] text-slate-400 mt-0.5">{item.created_at}</div>
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="font-bold text-slate-800">{item.title}</div>
                          <span className="inline-block mt-0.5 px-2 py-0.5 rounded bg-rose-50 border border-rose-200 text-rose-700 font-semibold text-[10px]">
                            {item.category_display}
                          </span>
                          {item.note && (
                            <div className="text-[10px] text-slate-400 truncate max-w-[150px]">{item.note}</div>
                          )}
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="font-semibold text-slate-700">{item.spent_by || 'হিসাব শাখা'}</div>
                          <div className="text-[10px] text-slate-400">অনুমোদন: {item.created_by}</div>
                        </td>
                        <td className="px-3 py-2.5 text-right font-black text-rose-600 text-sm whitespace-nowrap">
                          ৳ {toBanglaDigit(Number(item.amount).toLocaleString('en-IN'))}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-slate-400">
                        <FileText className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
                        <p className="text-xs">আজকের তারিখে কোনো খরচ ভাউচার এন্ট্রি নেই</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer Summary */}
            <div className="p-3 bg-rose-50/80 border-t border-rose-200 flex items-center justify-between font-bold text-xs text-rose-950">
              <span>মোট অনুমোদিত ভাউচার: {toBanglaDigit(filteredExpenses.length)} টি</span>
              <span className="text-sm font-black text-rose-700">
                মোট: ৳ {toBanglaDigit(filteredExpenses.reduce((acc: number, cur: any) => acc + Number(cur.amount), 0).toLocaleString('en-IN'))}
              </span>
            </div>
          </div>

        </div>
          </>
        )}

        {/* ===================== ANNUAL FINANCIAL AUDIT VIEW ===================== */}
        {reportMode === 'annual' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* 📊 Annual 4 Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 no-print">
              
              {/* 1. Annual Revenue */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-emerald-100 hover:shadow-md transition-all relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-50 rounded-full blur-2xl group-hover:bg-emerald-100/70 transition-all pointer-events-none" />
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-emerald-800">বাৎসরিক মোট রাজস্ব (Inflow)</span>
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-700 tracking-tight">
                  ৳ {toBanglaDigit(Number(annualAudit?.total_income || 0).toLocaleString('en-IN'))}
                </div>
                <div className="flex items-center gap-2 text-xs text-emerald-600 font-semibold mt-2">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200">
                    {toBanglaDigit(annualAudit?.total_receipts || 0)} টি ফি রশিদ
                  </span>
                  <span>{toBanglaDigit(annualAudit?.active_months || 0)} মাস সক্রিয়</span>
                </div>
              </div>

              {/* 2. Annual Outflow */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-rose-100 hover:shadow-md transition-all relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-28 h-28 bg-rose-50 rounded-full blur-2xl group-hover:bg-rose-100/70 transition-all pointer-events-none" />
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-rose-800">বাৎসরিক মোট খরচ (Outflow)</span>
                  <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                    <TrendingDown className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-rose-600 tracking-tight">
                  ৳ {toBanglaDigit(Number(annualAudit?.total_expense || 0).toLocaleString('en-IN'))}
                </div>
                <div className="flex items-center gap-2 text-xs text-rose-600 font-semibold mt-2">
                  <span className="px-2 py-0.5 rounded-md bg-rose-50 border border-rose-200">
                    {toBanglaDigit(annualAudit?.total_vouchers || 0)} টি অনুমোদিত ভাউচার
                  </span>
                </div>
              </div>

              {/* 3. Net Surplus / Deficit */}
              <div className={`rounded-3xl p-5 sm:p-6 shadow-sm border hover:shadow-md transition-all relative overflow-hidden ${
                annualAudit?.is_surplus
                  ? 'bg-gradient-to-br from-emerald-900 to-teal-950 text-white border-emerald-700'
                  : 'bg-gradient-to-br from-rose-950 to-red-900 text-white border-rose-700'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-emerald-200/90">
                    বাৎসরিক নিট স্থিতি ({annualAudit?.is_surplus ? 'উদ্বৃত্ত' : 'ঘাটতি'})
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-white/10 text-amber-300 flex items-center justify-center font-bold">
                    {annualAudit?.is_surplus ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black tracking-tight text-amber-300">
                  {Number(annualAudit?.net_surplus || 0) >= 0 ? '+' : ''}৳ {toBanglaDigit(Number(annualAudit?.net_surplus || 0).toLocaleString('en-IN'))}
                </div>
                <p className="text-xs text-white/80 mt-2 truncate">
                  {annualAudit?.is_surplus ? 'নগদ উদ্বৃত্ত সংরক্ষিত আছে' : 'চলতি তহবিলে নিট ঘাটতি রয়েছে'}
                </p>
              </div>

              {/* 4. Average Monthly Burn */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200/80 hover:shadow-md transition-all relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-600">গড় মাসিক পরিচালনা ব্যয়</span>
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                    <DollarSign className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
                  ৳ {toBanglaDigit(Math.round(Number(annualAudit?.avg_monthly_expense || 0)).toLocaleString('en-IN'))}
                </div>
                <div className="text-xs text-slate-500 font-medium mt-2">
                  গড় মাসিক আয়: ৳ {toBanglaDigit(Math.round(Number(annualAudit?.avg_monthly_income || 0)).toLocaleString('en-IN'))}
                </div>
              </div>

            </div>

            {/* 📈 12-Month Graphical Visual Chart */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 no-print">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-5 border-b border-slate-100">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold mb-1">
                    <BarChart3 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>১২ মাসের আয় ও ব্যয় ভিজুয়াল চিত্র</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-800 tracking-tight">
                    {toBanglaDigit(auditYear)} শিক্ষাবর্ষের মাসভিত্তিক রাজস্ব আদায় বনাম পরিচালনা ব্যয়ের তুলনামূলক চার্ট
                  </h3>
                </div>

                {/* Legend */}
                <div className="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-200 text-xs font-bold">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded-md bg-emerald-600 inline-block" />
                    <span className="text-slate-700">রাজস্ব আদায় (Inflow)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded-md bg-rose-500 inline-block" />
                    <span className="text-slate-700">পরিচালনা ব্যয় (Outflow)</span>
                  </div>
                </div>
              </div>

              {/* Chart Canvas */}
              <div className="relative pt-6 pb-2">
                {/* Horizontal reference grid lines */}
                <div className="absolute inset-x-0 top-6 bottom-14 flex flex-col justify-between pointer-events-none opacity-20">
                  <div className="border-b border-dashed border-slate-400 w-full" />
                  <div className="border-b border-dashed border-slate-400 w-full" />
                  <div className="border-b border-dashed border-slate-400 w-full" />
                  <div className="border-b border-slate-300 w-full" />
                </div>

                {/* 12 Month Columns */}
                <div className="grid grid-cols-12 gap-1.5 sm:gap-3 items-end h-64 relative z-10 px-1 sm:px-2">
                  {annualAudit?.monthly_trend?.map((m: any) => {
                    const incH = Math.max(6, Math.min(100, Math.round((Number(m.income || 0) / maxMonthlyVal) * 100)));
                    const expH = Math.max(6, Math.min(100, Math.round((Number(m.expense || 0) / maxMonthlyVal) * 100)));
                    const isNetPositive = Number(m.net) >= 0;

                    return (
                      <div key={m.month} className="flex flex-col items-center h-full justify-end group">
                        
                        {/* Hover Tooltip Card */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none absolute -top-12 z-30 bg-slate-900 text-white text-[11px] font-semibold py-1.5 px-3 rounded-xl shadow-xl whitespace-nowrap">
                          <span className="text-amber-300 font-bold">{m.month_name}:</span> 
                          {' '}আদায় ৳{toBanglaDigit(Number(m.income).toLocaleString('en-IN'))} | ব্যয় ৳{toBanglaDigit(Number(m.expense).toLocaleString('en-IN'))}
                        </div>

                        {/* Dual Column Bars */}
                        <div className="w-full flex items-end justify-center gap-1 h-48">
                          {/* Income Bar */}
                          <div
                            style={{ height: `${incH}%` }}
                            className="w-1/2 max-w-[24px] bg-gradient-to-t from-emerald-700 to-emerald-500 hover:to-emerald-400 rounded-t-lg transition-all duration-500 relative group/bar shadow-sm"
                          >
                            {m.income > 0 && (
                              <span className="hidden sm:block opacity-0 group-hover/bar:opacity-100 absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-bold text-emerald-800 bg-emerald-50 px-1 rounded shadow">
                                {toBanglaDigit(Math.round(m.income / 1000))}k
                              </span>
                            )}
                          </div>

                          {/* Expense Bar */}
                          <div
                            style={{ height: `${expH}%` }}
                            className="w-1/2 max-w-[24px] bg-gradient-to-t from-rose-700 to-rose-500 hover:to-rose-400 rounded-t-lg transition-all duration-500 relative group/bar shadow-sm"
                          >
                            {m.expense > 0 && (
                              <span className="hidden sm:block opacity-0 group-hover/bar:opacity-100 absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-bold text-rose-800 bg-rose-50 px-1 rounded shadow">
                                {toBanglaDigit(Math.round(m.expense / 1000))}k
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Month Label */}
                        <div className="mt-3 text-center">
                          <div className="text-[11px] sm:text-xs font-bold text-slate-700">
                            {m.month_short}
                          </div>
                          {/* Net Status Indicator */}
                          <div className={`mt-0.5 text-[9px] sm:text-[10px] font-black px-1 py-0.5 rounded ${
                            isNetPositive ? 'text-emerald-700 bg-emerald-50' : 'text-rose-600 bg-rose-50'
                          }`}>
                            {isNetPositive ? '+' : ''}{toBanglaDigit(Math.round(Number(m.net) / 1000))}k
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 🍱 Two-Column Breakdown: Expense vs Revenue Heads */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 no-print">

              {/* Left: Category-Wise Expense Distribution */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-rose-200/70 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                        <PieChart className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-800 text-base">বাৎসরিক ব্যয় বাজেট খাতসমূহ</h4>
                        <p className="text-xs text-slate-400">ক্যাটাগরিভিত্তিক খরচের বণ্টন ও শতকরা হার</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold bg-rose-50 text-rose-700 px-3 py-1 rounded-full border border-rose-200">
                      মোট: ৳ {toBanglaDigit(Number(annualAudit?.total_expense || 0).toLocaleString('en-IN'))}
                    </span>
                  </div>

                  <div className="space-y-4 mt-5">
                    {annualAudit?.expense_by_category?.map((item: any) => (
                      <div key={item.category} className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <div className="font-bold text-slate-700 flex items-center gap-1.5">
                            <span>{item.name}</span>
                            <span className="text-[10px] text-slate-400">({toBanglaDigit(item.count)} টি ভাউচার)</span>
                          </div>
                          <div className="font-black text-rose-700">
                            ৳ {toBanglaDigit(Number(item.total).toLocaleString('en-IN'))}
                            <span className="text-slate-400 font-semibold ml-1.5">({toBanglaDigit(item.percentage)}%)</span>
                          </div>
                        </div>
                        <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${Math.min(100, Math.max(3, item.percentage))}%` }}
                            className="h-full bg-gradient-to-r from-rose-500 to-amber-500 rounded-full transition-all duration-500"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between font-semibold">
                  <span>সর্বোচ্চ ব্যয়ের মাস: {annualAudit?.highest_expense_month?.month_name || '—'}</span>
                  <span className="text-rose-700 font-bold">
                    ৳ {toBanglaDigit(Number(annualAudit?.highest_expense_month?.expense || 0).toLocaleString('en-IN'))}
                  </span>
                </div>
              </div>

              {/* Right: Revenue Heads Distribution */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-emerald-200/70 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                        <Layers className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-800 text-base">বাৎসরিক রাজস্ব ও আয় খাতসমূহ</h4>
                        <p className="text-xs text-slate-400">ছাত্র বেতন, হোস্টেল ও বিবিধ ফি উৎস</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full border border-emerald-200">
                      মোট: ৳ {toBanglaDigit(Number(annualAudit?.total_income || 0).toLocaleString('en-IN'))}
                    </span>
                  </div>

                  <div className="space-y-4 mt-5">
                    {annualAudit?.income_by_type?.map((item: any) => (
                      <div key={item.type} className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <div className="font-bold text-slate-700 flex items-center gap-1.5">
                            <span>{item.name}</span>
                            <span className="text-[10px] text-slate-400">({toBanglaDigit(item.count)} টি রশিদ)</span>
                          </div>
                          <div className="font-black text-emerald-700">
                            ৳ {toBanglaDigit(Number(item.total).toLocaleString('en-IN'))}
                            <span className="text-slate-400 font-semibold ml-1.5">({toBanglaDigit(item.percentage)}%)</span>
                          </div>
                        </div>
                        <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${Math.min(100, Math.max(3, item.percentage))}%` }}
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between font-semibold">
                  <span>সর্বোচ্চ আয়ের মাস: {annualAudit?.highest_income_month?.month_name || '—'}</span>
                  <span className="text-emerald-700 font-bold">
                    ৳ {toBanglaDigit(Number(annualAudit?.highest_income_month?.income || 0).toLocaleString('en-IN'))}
                  </span>
                </div>
              </div>

            </div>

            {/* 📋 Comprehensive 12-Month Financial Ledger Table */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden no-print">
              <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-[#02200d] text-white p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-400 text-emerald-950 flex items-center justify-center font-bold">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base sm:text-lg">১২ মাসের সমন্বিত বার্ষিক হিসাব খাতা</h3>
                    <p className="text-xs text-emerald-200/80">{toBanglaDigit(auditYear)} শিক্ষাবর্ষের মাসভিত্তিক অডিট নিরীক্ষা</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-white/10 px-3 py-1.5 rounded-xl text-emerald-200 font-bold">
                    মোট ১২ মাস অন্তর্ভুক্ত
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">মাস (Month)</th>
                      <th className="px-4 py-3 text-right">মোট রাজস্ব আদায় (৳)</th>
                      <th className="px-4 py-3 text-right">মোট ব্যয় ও খরচ (৳)</th>
                      <th className="px-4 py-3 text-right">নিট স্থিতি (৳)</th>
                      <th className="px-4 py-3 text-center">স্থিতি অবস্থা</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {annualAudit?.monthly_trend?.map((row: any) => {
                      const isSurplus = Number(row.net) >= 0;
                      return (
                        <tr key={row.month} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3.5 font-bold text-slate-800 whitespace-nowrap">
                            <span className="w-6 inline-block font-mono text-slate-400">{toBanglaDigit(row.month)}.</span>
                            {row.month_name}
                          </td>
                          <td className="px-4 py-3.5 text-right font-black text-emerald-700 whitespace-nowrap">
                            ৳ {toBanglaDigit(Number(row.income).toLocaleString('en-IN'))}
                          </td>
                          <td className="px-4 py-3.5 text-right font-black text-rose-600 whitespace-nowrap">
                            ৳ {toBanglaDigit(Number(row.expense).toLocaleString('en-IN'))}
                          </td>
                          <td className={`px-4 py-3.5 text-right font-black whitespace-nowrap ${
                            isSurplus ? 'text-emerald-700' : 'text-rose-600'
                          }`}>
                            {isSurplus ? '+' : ''}৳ {toBanglaDigit(Number(row.net).toLocaleString('en-IN'))}
                          </td>
                          <td className="px-4 py-3.5 text-center whitespace-nowrap">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 ${
                              isSurplus
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : 'bg-rose-100 text-rose-800 border border-rose-200'
                            }`}>
                              {isSurplus ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                              <span>{isSurplus ? 'উদ্বৃত্ত' : 'ঘাটতি'}</span>
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-emerald-950 text-white font-bold border-t-2 border-amber-400">
                    <tr>
                      <td className="px-4 py-4 text-amber-300 font-extrabold text-sm sm:text-base">
                        সর্বমোট বাৎসরিক ব্যালেন্স:
                      </td>
                      <td className="px-4 py-4 text-right text-emerald-300 font-black text-sm sm:text-base">
                        ৳ {toBanglaDigit(Number(annualAudit?.total_income || 0).toLocaleString('en-IN'))}
                      </td>
                      <td className="px-4 py-4 text-right text-rose-300 font-black text-sm sm:text-base">
                        ৳ {toBanglaDigit(Number(annualAudit?.total_expense || 0).toLocaleString('en-IN'))}
                      </td>
                      <td className={`px-4 py-4 text-right font-black text-sm sm:text-base ${
                        annualAudit?.is_surplus ? 'text-emerald-300' : 'text-amber-300'
                      }`}>
                        {annualAudit?.is_surplus ? '+' : ''}৳ {toBanglaDigit(Number(annualAudit?.net_surplus || 0).toLocaleString('en-IN'))}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="px-3 py-1 rounded-full bg-amber-400 text-emerald-950 text-xs font-black">
                          {annualAudit?.is_surplus ? 'বাৎসরিক উদ্বৃত্ত' : 'বাৎসরিক ঘাটতি'}
                        </span>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* 🖨️ OFFICIAL PRINTABLE A4 AUDIT STATEMENT (Only shows on window.print) */}
        <div className="hidden print:block print-container bg-white p-6 text-black">
          
          {/* DAILY PRINT STATEMENT */}
          {reportMode === 'daily' && (
            <div>
              {/* Official Letterhead */}
              <div className="text-center pb-4 border-b-2 border-black mb-4">
                <div className="flex items-center justify-center gap-4 mb-2">
                  <img
                    src="/logo.jpg"
                    alt="Logo"
                    className="w-16 h-16 object-contain rounded-full border border-black"
                  />
                  <div>
                    <h1 className="text-2xl font-black tracking-tight">
                      আল-মদিনা মডেল মাদ্রাসা এন্ড রিসার্চ ইনস্টিটিউট
                    </h1>
                    <p className="text-xs font-semibold">
                      ক-৭৫/২, মহাখালী দক্ষিণ পাড়া, বনানী, ঢাকা-১২১২ | ফোন: ০১৭২২-১৫৭৪৬৪, ০১৭১২-৬৩০২৬৪
                    </p>
                    <div className="inline-block mt-1 px-4 py-0.5 border border-black rounded-full font-black text-xs uppercase">
                      দৈনিক ক্যাশ খাতা ও আয়-ব্যয় অডিট ব্যালেন্স শিট
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs mt-2 font-bold px-2">
                  <span>তারিখ: {cashbook?.date_bn || selectedDate}</span>
                  <span>প্রিন্ট সময়: {new Date().toLocaleTimeString('bn-BD')}</span>
                </div>
              </div>

              {/* Executive Summary Table */}
              <div className="mb-4">
                <table className="w-full text-xs border border-black mb-3">
                  <thead>
                    <tr className="bg-gray-200 font-bold text-center">
                      <th className="p-2 border border-black">প্রারম্ভিক জের (Opening Cash)</th>
                      <th className="p-2 border border-black">আজকের মোট জমা (Total Inflow)</th>
                      <th className="p-2 border border-black">আজকের মোট খরচ (Total Outflow)</th>
                      <th className="p-2 border border-black bg-gray-300">সমাপনী ক্যাশ উদ্বৃত্ত (Closing Balance)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="text-center font-bold text-sm">
                      <td className="p-2 border border-black">৳ {toBanglaDigit(openingBal.toLocaleString('en-IN', { minimumFractionDigits: 2 }))}</td>
                      <td className="p-2 border border-black">৳ {toBanglaDigit(totalIn.toLocaleString('en-IN', { minimumFractionDigits: 2 }))}</td>
                      <td className="p-2 border border-black">৳ {toBanglaDigit(totalOut.toLocaleString('en-IN', { minimumFractionDigits: 2 }))}</td>
                      <td className="p-2 border border-black bg-gray-100 font-black">
                        ৳ {toBanglaDigit(closingBal.toLocaleString('en-IN', { minimumFractionDigits: 2 }))}
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div className="text-xs italic px-1 font-semibold">
                  সমাপনী ব্যালেন্স কথায়: {numberToBanglaWords(closingBal)}
                </div>
              </div>

              {/* Side-by-Side Dual Print Ledgers */}
              <div className="grid grid-cols-2 gap-4">
                
                {/* Left: Inflow */}
                <div>
                  <div className="bg-gray-200 text-black font-black text-xs p-1.5 border border-black text-center mb-1">
                    জমা বিবরণী (Cash Inflow) - মোট: ৳ {toBanglaDigit(totalIn.toLocaleString('en-IN'))}
                  </div>
                  <table className="w-full text-[10pt] border border-black">
                    <thead>
                      <tr className="bg-gray-100 font-bold">
                        <th className="p-1 border border-black text-left">রশিদ নং</th>
                        <th className="p-1 border border-black text-left">শিক্ষার্থী ও বিভাগ</th>
                        <th className="p-1 border border-black text-left">খাত</th>
                        <th className="p-1 border border-black text-right">টাকা</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cashbook?.incomes && cashbook.incomes.length > 0 ? (
                        cashbook.incomes.map((item: any) => (
                          <tr key={item.id}>
                            <td className="p-1 border border-black font-mono font-bold text-[9pt]">{item.receipt_number}</td>
                            <td className="p-1 border border-black font-bold text-[9pt]">{item.student_name_bn || item.student_name}</td>
                            <td className="p-1 border border-black text-[9pt]">{item.payment_type_display}</td>
                            <td className="p-1 border border-black text-right font-black text-[9pt]">
                              {toBanglaDigit(Number(item.amount_paid).toLocaleString('en-IN'))}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="p-2 text-center italic border border-black text-gray-500">কোনো আদায় নেই</td>
                        </tr>
                      )}
                      <tr className="font-bold bg-gray-100">
                        <td colSpan={3} className="p-1 border border-black text-right">সর্বমোট জমা:</td>
                        <td className="p-1 border border-black text-right font-black">
                          ৳ {toBanglaDigit(totalIn.toLocaleString('en-IN'))}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Right: Outflow */}
                <div>
                  <div className="bg-gray-200 text-black font-black text-xs p-1.5 border border-black text-center mb-1">
                    খরচ বিবরণী (Cash Outflow) - মোট: ৳ {toBanglaDigit(totalOut.toLocaleString('en-IN'))}
                  </div>
                  <table className="w-full text-[10pt] border border-black">
                    <thead>
                      <tr className="bg-gray-100 font-bold">
                        <th className="p-1 border border-black text-left">ভাউচার নং</th>
                        <th className="p-1 border border-black text-left">খরচের বিবরণ</th>
                        <th className="p-1 border border-black text-left">খাত</th>
                        <th className="p-1 border border-black text-right">টাকা</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cashbook?.expenses && cashbook.expenses.length > 0 ? (
                        cashbook.expenses.map((item: any) => (
                          <tr key={item.id}>
                            <td className="p-1 border border-black font-mono font-bold text-[9pt]">{item.voucher_number}</td>
                            <td className="p-1 border border-black font-bold text-[9pt]">{item.title}</td>
                            <td className="p-1 border border-black text-[9pt]">{item.category_display}</td>
                            <td className="p-1 border border-black text-right font-black text-[9pt]">
                              {toBanglaDigit(Number(item.amount).toLocaleString('en-IN'))}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="p-2 text-center italic border border-black text-gray-500">কোনো খরচ নেই</td>
                        </tr>
                      )}
                      <tr className="font-bold bg-gray-100">
                        <td colSpan={3} className="p-1 border border-black text-right">সর্বমোট খরচ:</td>
                        <td className="p-1 border border-black text-right font-black">
                          ৳ {toBanglaDigit(totalOut.toLocaleString('en-IN'))}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

              </div>

              {/* Official Endorsements & Signatures */}
              <div className="mt-16 pt-8 grid grid-cols-3 text-center text-xs font-bold gap-8">
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
                  <p className="text-[10px] text-gray-800 font-bold mt-0.5">মাওলানা ওমর ফারুক মুজাহিদী</p>
                </div>
              </div>
            </div>
          )}

          {/* ANNUAL PRINT STATEMENT */}
          {reportMode === 'annual' && (
            <div>
              {/* Official Letterhead */}
              <div className="text-center pb-4 border-b-2 border-black mb-4">
                <div className="flex items-center justify-center gap-4 mb-2">
                  <img
                    src="/logo.jpg"
                    alt="Logo"
                    className="w-16 h-16 object-contain rounded-full border border-black"
                  />
                  <div>
                    <h1 className="text-2xl font-black tracking-tight">
                      আল-মদিনা মডেল মাদ্রাসা এন্ড রিসার্চ ইনস্টিটিউট
                    </h1>
                    <p className="text-xs font-semibold">
                      ক-৭৫/২, মহাখালী দক্ষিণ পাড়া, বনানী, ঢাকা-১২১২ | ফোন: ০১৭২২-১৫৭৪৬৪, ০১৭১২-৬৩০২৬৪
                    </p>
                    <div className="inline-block mt-1 px-4 py-0.5 border border-black rounded-full font-black text-xs uppercase">
                      বার্ষিক আর্থিক নিরীক্ষা ও ক্যাশ অডিট প্রতিবেদন — {toBanglaDigit(auditYear)} খ্রিঃ
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs mt-2 font-bold px-2">
                  <span>শিক্ষাবর্ষ: {toBanglaDigit(auditYear)}</span>
                  <span>প্রিন্ট সময় ও তারিখ: {new Date().toLocaleDateString('bn-BD')} {new Date().toLocaleTimeString('bn-BD')}</span>
                </div>
              </div>

              {/* Executive Summary Table */}
              <div className="mb-4">
                <table className="w-full text-xs border border-black mb-2">
                  <thead>
                    <tr className="bg-gray-200 font-bold text-center">
                      <th className="p-2 border border-black">বাৎসরিক মোট রাজস্ব আদায়</th>
                      <th className="p-2 border border-black">বাৎসরিক মোট পরিচালনা ব্যয়</th>
                      <th className="p-2 border border-black bg-gray-300">বাৎসরিক নিট স্থিতি ({annualAudit?.is_surplus ? 'উদ্বৃত্ত' : 'ঘাটতি'})</th>
                      <th className="p-2 border border-black">মোট রশিদ ও ভাউচার</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="text-center font-bold text-sm">
                      <td className="p-2 border border-black text-emerald-800">
                        ৳ {toBanglaDigit(Number(annualAudit?.total_income || 0).toLocaleString('en-IN'))}
                      </td>
                      <td className="p-2 border border-black text-rose-700">
                        ৳ {toBanglaDigit(Number(annualAudit?.total_expense || 0).toLocaleString('en-IN'))}
                      </td>
                      <td className="p-2 border border-black bg-gray-100 font-black">
                        {Number(annualAudit?.net_surplus || 0) >= 0 ? '+' : ''}৳ {toBanglaDigit(Number(annualAudit?.net_surplus || 0).toLocaleString('en-IN'))}
                      </td>
                      <td className="p-2 border border-black text-xs">
                        রশিদ: {toBanglaDigit(annualAudit?.total_receipts || 0)} টি | ভাউচার: {toBanglaDigit(annualAudit?.total_vouchers || 0)} টি
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div className="text-xs italic px-1 font-semibold">
                  বার্ষিক নিট স্থিতি কথায়: {numberToBanglaWords(Math.abs(Number(annualAudit?.net_surplus || 0)))} {annualAudit?.is_surplus ? 'উদ্বৃত্ত' : 'ঘাটতি'}
                </div>
              </div>

              {/* 12-Month Ledger Table for Print */}
              <div className="mb-4">
                <div className="bg-gray-200 text-black font-black text-xs p-1.5 border border-black text-center mb-1">
                  ১২ মাসের মাসভিত্তিক আর্থিক অডিট বিবরণী
                </div>
                <table className="w-full text-[9pt] border border-black">
                  <thead>
                    <tr className="bg-gray-100 font-bold text-center">
                      <th className="p-1 border border-black text-left">মাস</th>
                      <th className="p-1 border border-black text-right">রাজস্ব আদায় (৳)</th>
                      <th className="p-1 border border-black text-right">পরিচালন ব্যয় (৳)</th>
                      <th className="p-1 border border-black text-right">নিট ব্যালেন্স (৳)</th>
                      <th className="p-1 border border-black text-center">অবস্থা</th>
                    </tr>
                  </thead>
                  <tbody>
                    {annualAudit?.monthly_trend?.map((row: any) => {
                      const isSurplus = Number(row.net) >= 0;
                      return (
                        <tr key={row.month}>
                          <td className="p-1 border border-black font-bold">{row.month_name}</td>
                          <td className="p-1 border border-black text-right font-bold">
                            {toBanglaDigit(Number(row.income).toLocaleString('en-IN'))}
                          </td>
                          <td className="p-1 border border-black text-right font-bold">
                            {toBanglaDigit(Number(row.expense).toLocaleString('en-IN'))}
                          </td>
                          <td className="p-1 border border-black text-right font-black">
                            {isSurplus ? '+' : ''}{toBanglaDigit(Number(row.net).toLocaleString('en-IN'))}
                          </td>
                          <td className="p-1 border border-black text-center font-bold text-[8pt]">
                            {isSurplus ? 'উদ্বৃত্ত' : 'ঘাটতি'}
                          </td>
                        </tr>
                      );
                    })}
                    <tr className="font-bold bg-gray-200 text-[10pt]">
                      <td className="p-1.5 border border-black">সর্বমোট বাৎসরিক:</td>
                      <td className="p-1.5 border border-black text-right font-black">
                        ৳ {toBanglaDigit(Number(annualAudit?.total_income || 0).toLocaleString('en-IN'))}
                      </td>
                      <td className="p-1.5 border border-black text-right font-black">
                        ৳ {toBanglaDigit(Number(annualAudit?.total_expense || 0).toLocaleString('en-IN'))}
                      </td>
                      <td className="p-1.5 border border-black text-right font-black">
                        {Number(annualAudit?.net_surplus || 0) >= 0 ? '+' : ''}৳ {toBanglaDigit(Number(annualAudit?.net_surplus || 0).toLocaleString('en-IN'))}
                      </td>
                      <td className="p-1.5 border border-black text-center font-black">
                        {annualAudit?.is_surplus ? 'উদ্বৃত্ত' : 'ঘাটতি'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Expense Category Breakdown Print */}
              <div className="mb-4">
                <div className="bg-gray-200 text-black font-black text-xs p-1.5 border border-black text-center mb-1">
                  বাৎসরিক পরিচালনা ব্যয়ের খাতভিত্তিক হিসাব
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {annualAudit?.expense_by_category?.map((cat: any) => (
                    <div key={cat.category} className="border border-black p-1 text-[9pt] flex justify-between">
                      <span className="font-bold">{cat.name} ({toBanglaDigit(cat.count)} টি):</span>
                      <span className="font-black">৳ {toBanglaDigit(Number(cat.total).toLocaleString('en-IN'))} ({toBanglaDigit(cat.percentage)}%)</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Official Endorsements & Signatures */}
              <div className="mt-14 pt-6 grid grid-cols-3 text-center text-xs font-bold gap-8">
                <div>
                  <div className="border-t border-black pt-1">
                    হিসাবরক্ষক স্বাক্ষর ও তারিখ
                  </div>
                  <p className="text-[10px] text-gray-600 mt-0.5">আল-মদিনা মডেল মাদ্রাসা</p>
                </div>
                <div>
                  <div className="border-t border-black pt-1">
                    অভ্যন্তরীণ নিরীক্ষক / কোষাধ্যক্ষ
                  </div>
                  <p className="text-[10px] text-gray-600 mt-0.5">মাদ্রাসার অডিট কমিটি</p>
                </div>
                <div>
                  <div className="border-t border-black pt-1 font-black">
                    অধ্যক্ষ ও মুহতামিম
                  </div>
                  <p className="text-[10px] text-gray-800 font-bold mt-0.5">মাওলানা ওমর ফারুক মুজাহিদী</p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* ➕ MODAL: নতুন খরচ ভাউচার এন্ট্রি (Add Expense Modal) */}
        {isExpenseModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn no-print">
            <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
              
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-[#02200d] text-white p-5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-400 text-emerald-950 flex items-center justify-center font-bold">
                    <PlusCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">নতুন খরচ ভাউচার এন্ট্রি</h3>
                    <p className="text-xs text-emerald-200/80">তারিখ: {selectedDate}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="p-1 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleCreateExpense} className="p-6 space-y-4">
                
                {/* Category Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    খরচের খাত নির্বাচন করুন <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={expenseCategory}
                    onChange={(e) => setExpenseCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50"
                  >
                    {EXPENSE_CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    খরচের শিরোনাম / বিবরণ <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={expenseTitle}
                    onChange={(e) => setExpenseTitle(e.target.value)}
                    placeholder="যেমন: হোস্টেলের জন্য চাল ও ডাল ক্রয়, এসি সার্ভিসিং..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none placeholder:text-slate-400"
                    required
                  />
                </div>

                {/* Amount and Spent By Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      টাকার পরিমাণ (৳) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-slate-400 font-bold">৳</span>
                      <input
                        type="number"
                        step="0.01"
                        value={expenseAmount}
                        onChange={(e) => setExpenseAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      ব্যয়কারী / দায়িত্বশীল
                    </label>
                    <input
                      type="text"
                      value={expenseSpentBy}
                      onChange={(e) => setExpenseSpentBy(e.target.value)}
                      placeholder="যেমন: হাফেজ মাওলানা কারী আব্দুল্লাহ"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Voucher Number (Optional manual override) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ভাউচার নম্বর (ঐচ্ছিক - খালি রাখলে স্বয়ংক্রিয় তৈরি হবে)
                  </label>
                  <input
                    type="text"
                    value={voucherNumber}
                    onChange={(e) => setVoucherNumber(e.target.value)}
                    placeholder="স্বয়ংক্রিয় ভাউচার আইডি তৈরি হবে"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono text-slate-600 focus:ring-2 focus:ring-emerald-500 focus:outline-none placeholder:text-slate-400 bg-slate-50"
                  />
                </div>

                {/* Note */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    বিশেষ নোট বা মন্তব্য
                  </label>
                  <textarea
                    rows={2}
                    value={expenseNote}
                    onChange={(e) => setExpenseNote(e.target.value)}
                    placeholder="দোকান বা ক্রয়কৃত স্থানের নাম, বিশেষ কোনো অনুমোদন সংক্রান্ত তথ্য..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none placeholder:text-slate-400 resize-none"
                  />
                </div>

                {/* Submit Buttons */}
                <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setIsExpenseModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    disabled={createExpenseMutation.isPending}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white text-xs sm:text-sm font-extrabold shadow-md transition-all disabled:opacity-50"
                  >
                    {createExpenseMutation.isPending ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>সংরক্ষণ হচ্ছে...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>ভাউচার সংরক্ষণ করুন</span>
                      </>
                    )}
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}

      </div>
    </AppLayout>
  );
}

