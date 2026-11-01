/* eslint-disable */
'use client';

import { useState, useMemo, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { getMediaUrl } from '@/lib/api';
import toast from 'react-hot-toast';
import {
  CheckCircle2, AlertCircle, Clock, Search, Filter, Plus, Printer,
  Eye, X, Check, RefreshCw, Sparkles, Building, Bed, Phone, MapPin,
  Calendar, BookOpen, Award, User, ArrowRight, ArrowLeft, ShieldCheck,
  DollarSign, Send, MessageSquare, ExternalLink, ChevronRight, Hash,
  GraduationCap
} from 'lucide-react';
import { toBanglaDigit, numberToBanglaWords } from '@/lib/numberToBanglaWords';

export default function AdmissionApprovalPortal() {
  const queryClient = useQueryClient();

  // Filter States
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [search, setSearch] = useState('');
  const [selectedYear, setSelectedYear] = useState<number>(2027);

  // Modal States
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // Print Slip State
  const [printApp, setPrintApp] = useState<any | null>(null);

  // Approval Form State
  const [approvalForm, setApprovalForm] = useState({
    islamic_department_id: '',
    general_department_id: '',
    enrollment_type: 'both',
    section: 'A',
    roll_number: '',
    residential_status: 'day',
    hostel_room_id: '',
    monthly_fee: '1500',
    hostel_fee: '0',
    admission_fee: '2500',
    interview_marks: '',
    written_marks: '',
    admin_note: 'মৌখিক ও সাধারণ জ্ঞানে সন্তোষজনক ফলাফল করায় ভর্তি মঞ্জুর করা হলো।',
  });

  // 1. Fetch Stats
  const { data: stats, refetch: refetchStats } = useQuery({
    queryKey: ['admission-stats', selectedYear],
    queryFn: async () => {
      const res = await api.get(`/api/students/admissions/stats/?academic_year=${selectedYear}`);
      return res.data;
    }
  });

  // 2. Fetch Applications
  const { data: applications = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ['admissions-list', activeTab, search, selectedYear],
    queryFn: async () => {
      let url = `/api/students/admissions/?academic_year=${selectedYear}`;
      if (activeTab !== 'all') {
        url += `&status=${activeTab}`;
      }
      if (search.trim()) {
        url += `&search=${encodeURIComponent(search.trim())}`;
      }
      const res = await api.get(url);
      return res.data;
    }
  });

  // 3. Fetch Departments
  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const res = await api.get('/api/students/departments/');
      return res.data;
    }
  });

  const islamicDepts = useMemo(() => departments.filter((d: any) => d.dept_type === 'islamic'), [departments]);
  const generalDepts = useMemo(() => departments.filter((d: any) => d.dept_type === 'general'), [departments]);

  // 4. Fetch Hostel Rooms
  const { data: hostelRooms = [] } = useQuery({
    queryKey: ['hostel-rooms'],
    queryFn: async () => {
      const res = await api.get('/api/hostel/rooms/');
      return res.data;
    }
  });

  // 5. Fetch Next Roll Suggestion based on selected department & section
  const { data: nextRollData, refetch: refetchNextRoll } = useQuery({
    queryKey: [
      'next-roll', 
      selectedYear, 
      approvalForm.section, 
      approvalForm.islamic_department_id, 
      approvalForm.general_department_id
    ],
    queryFn: async () => {
      let url = `/api/students/admissions/next-roll/?academic_year=${selectedYear}&section=${approvalForm.section}`;
      if (approvalForm.general_department_id) {
        url += `&general_department_id=${approvalForm.general_department_id}`;
      } else if (approvalForm.islamic_department_id) {
        url += `&islamic_department_id=${approvalForm.islamic_department_id}`;
      }
      const res = await api.get(url);
      return res.data;
    },
    enabled: isApprovalModalOpen
  });

  // Automatically prefill suggested roll number
  useEffect(() => {
    if (nextRollData?.next_roll && isApprovalModalOpen && !approvalForm.roll_number) {
      setApprovalForm(prev => ({ ...prev, roll_number: String(nextRollData.next_roll) }));
    }
  }, [nextRollData, isApprovalModalOpen]);

  // Open Approval Modal for an application
  const handleOpenApproveModal = (app: any) => {
    setSelectedApp(app);

    // Auto-detect department preferences from desired_program
    let detectedIslamic = '';
    let detectedGeneral = '';
    const prog = (app.desired_program || '').toLowerCase();

    if (prog.includes('হিফজ') || prog.includes('হিজ')) {
      const hifzDept = islamicDepts.find((d: any) => d.name.includes('হিফজ'));
      if (hifzDept) detectedIslamic = String(hifzDept.id);
    } else if (prog.includes('নূরানী') || prog.includes('নাজেরা')) {
      const nooraniDept = islamicDepts.find((d: any) => d.name.includes('নূরানী'));
      if (nooraniDept) detectedIslamic = String(nooraniDept.id);
    }

    if (prog.includes('প্লে')) {
      const play = generalDepts.find((d: any) => d.name.includes('প্লে'));
      if (play) detectedGeneral = String(play.id);
    } else if (prog.includes('নার্সারি')) {
      const nursery = generalDepts.find((d: any) => d.name.includes('নার্সারি'));
      if (nursery) detectedGeneral = String(nursery.id);
    } else if (prog.includes('প্রথম') || prog.includes('১ম') || prog.includes('class 1')) {
      const c1 = generalDepts.find((d: any) => d.name.includes('প্রথম'));
      if (c1) detectedGeneral = String(c1.id);
    } else if (prog.includes('দ্বিতীয়') || prog.includes('২য়')) {
      const c2 = generalDepts.find((d: any) => d.name.includes('দ্বিতীয়'));
      if (c2) detectedGeneral = String(c2.id);
    } else if (prog.includes('তৃতীয়') || prog.includes('৩য়')) {
      const c3 = generalDepts.find((d: any) => d.name.includes('তৃতীয়'));
      if (c3) detectedGeneral = String(c3.id);
    }

    const isRes = app.residential_status === 'residential';

    setApprovalForm({
      islamic_department_id: detectedIslamic || (islamicDepts[0] ? String(islamicDepts[0].id) : ''),
      general_department_id: detectedGeneral || (generalDepts[0] ? String(generalDepts[0].id) : ''),
      enrollment_type: detectedIslamic && detectedGeneral ? 'both' : (detectedIslamic ? 'islamic_only' : 'general_only'),
      section: 'A',
      roll_number: '',
      residential_status: app.residential_status || 'day',
      hostel_room_id: isRes && hostelRooms[0] ? String(hostelRooms[0].id) : '',
      monthly_fee: '1500',
      hostel_fee: isRes ? '3500' : '0',
      admission_fee: '2500',
      interview_marks: '25',
      written_marks: '45',
      admin_note: 'মৌখিক ও সাধারণ জ্ঞানে সন্তোষজনক ফলাফল করায় ভর্তি মঞ্জুর করা হলো।',
    });

    setIsApprovalModalOpen(true);
  };

  // Open Reject Modal
  const handleOpenRejectModal = (app: any) => {
    setSelectedApp(app);
    setRejectReason('সিট পূর্ণ থাকায় অথবা কাঙ্ক্ষিত বয়স অসামঞ্জস্যপূর্ণ হওয়ায় ভর্তি আবেদনটি মঞ্জুর করা সম্ভব হলো না।');
    setIsRejectModalOpen(true);
  };

  // Approve Mutation
  const approveMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post(`/api/students/admissions/${selectedApp.id}/approve/`, payload);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'ভর্তি সফলভাবে অনুমোদিত হয়েছে!', {
        icon: '🎉',
        style: {
          borderRadius: '14px',
          background: '#064e3b',
          color: '#fff',
        },
      });
      setIsApprovalModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['admissions-list'] });
      queryClient.invalidateQueries({ queryKey: ['admission-stats'] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      
      // Auto offer print slip
      if (data.application) {
        setPrintApp(data.application);
      }
    },
    onError: (err: any) => {
      const msg = err.response?.data?.detail || 'অনুমোদনে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।';
      toast.error(msg);
    }
  });

  const handleApproveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;

    approveMutation.mutate({
      islamic_department_id: approvalForm.islamic_department_id || null,
      general_department_id: approvalForm.general_department_id || null,
      enrollment_type: approvalForm.enrollment_type,
      section: approvalForm.section,
      roll_number: approvalForm.roll_number ? parseInt(approvalForm.roll_number) : 0,
      academic_year: selectedYear,
      residential_status: approvalForm.residential_status,
      hostel_room_id: approvalForm.hostel_room_id || null,
      monthly_fee: parseFloat(approvalForm.monthly_fee) || 0,
      hostel_fee: parseFloat(approvalForm.hostel_fee) || 0,
      admission_fee: parseFloat(approvalForm.admission_fee) || 0,
      interview_marks: approvalForm.interview_marks ? parseFloat(approvalForm.interview_marks) : null,
      written_marks: approvalForm.written_marks ? parseFloat(approvalForm.written_marks) : null,
      admin_note: approvalForm.admin_note,
    });
  };

  // Reject Mutation
  const rejectMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post(`/api/students/admissions/${selectedApp.id}/reject/`, payload);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success('ভর্তি আবেদন বাতিল করা হয়েছে।');
      setIsRejectModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['admissions-list'] });
      queryClient.invalidateQueries({ queryKey: ['admission-stats'] });
    },
    onError: () => {
      toast.error('বাতিল করতে সমস্যা হয়েছে।');
    }
  });

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;
    rejectMutation.mutate({ admin_note: rejectReason.trim() });
  };

  // Print Handler
  const handlePrintSlip = (app: any) => {
    setPrintApp(app);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  return (
    <AppLayout title="অনলাইন ভর্তি অনুমোদন ও স্বয়ংক্রিয় রোল">
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
          .print-slip-container {
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
            padding: 5px 8px !important;
            font-size: 10pt !important;
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
                <GraduationCap className="w-8 h-8 text-amber-400 hidden sm:block" />
                <span>অনলাইন ভর্তি আবেদন মঞ্জুরি ও স্বয়ংক্রিয় রোল/আইডি পোর্টাল</span>
              </h1>
              <p className="text-emerald-200/80 text-xs sm:text-sm mt-1 max-w-2xl">
                অভিভাবকদের প্রেরিত আবেদন মূল্যায়ন, ভাইভা ও লিখিত নম্বর প্রদান, স্বয়ংক্রিয় ক্রমিক রোল বরাদ্দ এবং ১-ক্লিকে স্থায়ী ছাত্র তালিকায় রূপান্তর।
              </p>
            </div>

            {/* Header Action Controls */}
            <div className="flex flex-wrap items-center gap-2.5">
              
              {/* Year Selector */}
              <div className="flex items-center gap-2 bg-emerald-950/80 px-3 py-2 rounded-xl border border-emerald-500/30">
                <Calendar className="w-4 h-4 text-amber-400" />
                <span className="text-xs text-emerald-200 font-bold">শিক্ষাবর্ষ:</span>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="bg-transparent text-white text-xs sm:text-sm font-black focus:outline-none cursor-pointer [&>option]:text-black"
                >
                  <option value={2027}>২০২৭ শিক্ষাবর্ষ</option>
                  <option value={2026}>২০২৬ শিক্ষাবর্ষ</option>
                </select>
              </div>

              {/* Public Admission Form Link */}
              <Link
                href="/admission"
                target="_blank"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-bold border border-white/15 transition-all shadow-sm"
                title="অভিভাবকদের জন্য পাবলিক ভর্তি ফরম লিঙ্ক খুলুন"
              >
                <ExternalLink className="w-4 h-4 text-amber-300" />
                <span>অনলাইন ফরম দেখুন</span>
              </Link>

              {/* Students Directory Link */}
              <Link
                href="/students"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 text-xs sm:text-sm font-extrabold transition-all shadow-md active:scale-95"
              >
                <User className="w-4 h-4" />
                <span>ছাত্র তালিকা</span>
              </Link>

              {/* Refresh Button */}
              <button
                onClick={() => { refetch(); refetchStats(); }}
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
          
          {/* 1. Total Applications */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/80 hover:shadow-md transition-all relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500">মোট প্রাপ্ত আবেদন</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <BookOpen className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
              {toBanglaDigit(stats?.total || 0)} <span className="text-sm font-semibold text-slate-400">টি</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {toBanglaDigit(selectedYear)} শিক্ষাবর্ষে অনলাইনে প্রাপ্ত
            </p>
          </div>

          {/* 2. Pending Verification */}
          <div 
            onClick={() => setActiveTab('pending')}
            className={`bg-white rounded-3xl p-5 shadow-sm border transition-all cursor-pointer relative overflow-hidden group ${
              activeTab === 'pending' ? 'ring-2 ring-amber-400 border-amber-300' : 'border-amber-200 hover:shadow-md'
            }`}
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-full blur-2xl group-hover:bg-amber-100/70 transition-all pointer-events-none" />
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-amber-800">অপেক্ষমাণ আবেদন (Pending)</span>
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-600 tracking-tight">
              {toBanglaDigit(stats?.pending || 0)} <span className="text-sm font-semibold text-amber-400">টি</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-amber-700 font-semibold mt-1">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>মূল্যায়ন ও রোল বরাদ্দের অপেক্ষায়</span>
            </div>
          </div>

          {/* 3. Approved & Enrolled */}
          <div 
            onClick={() => setActiveTab('approved')}
            className={`bg-white rounded-3xl p-5 shadow-sm border transition-all cursor-pointer relative overflow-hidden group ${
              activeTab === 'approved' ? 'ring-2 ring-emerald-500 border-emerald-300' : 'border-emerald-200 hover:shadow-md'
            }`}
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full blur-2xl group-hover:bg-emerald-100/70 transition-all pointer-events-none" />
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-800">মঞ্জুরিকৃত শিক্ষার্থী (Approved)</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-700 tracking-tight">
              {toBanglaDigit(stats?.approved || 0)} <span className="text-sm font-semibold text-emerald-400">জন</span>
            </div>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1">
              আইডি ও রোলসহ ডেটাবেসে স্থায়ী অন্তর্ভুক্ত
            </p>
          </div>

          {/* 4. Rejected */}
          <div 
            onClick={() => setActiveTab('rejected')}
            className={`bg-white rounded-3xl p-5 shadow-sm border transition-all cursor-pointer relative overflow-hidden group ${
              activeTab === 'rejected' ? 'ring-2 ring-rose-400 border-rose-300' : 'border-rose-200 hover:shadow-md'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-rose-800">বাতিলকৃত আবেদন (Rejected)</span>
              <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                <AlertCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-rose-600 tracking-tight">
              {toBanglaDigit(stats?.rejected || 0)} <span className="text-sm font-semibold text-rose-400">টি</span>
            </div>
            <p className="text-[11px] text-rose-500 font-semibold mt-1">
              সিট সংকট বা অযোগ্যতার কারণে বাতিল
            </p>
          </div>

        </div>

        {/* 🔍 Navigation Tabs & Search Controls */}
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
          
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl overflow-x-auto">
            <button
              onClick={() => setActiveTab('pending')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === 'pending'
                  ? 'bg-amber-400 text-emerald-950 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>অপেক্ষমাণ আবেদন</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/30 text-emerald-950 font-black">
                {toBanglaDigit(stats?.pending || 0)}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('approved')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === 'approved'
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>মঞ্জুরিকৃত শিক্ষার্থী</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-700 text-emerald-100 font-black">
                {toBanglaDigit(stats?.approved || 0)}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('rejected')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === 'rejected'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>বাতিলকৃত</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-700 text-rose-100 font-black">
                {toBanglaDigit(stats?.rejected || 0)}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('all')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === 'all'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>সকল আবেদন</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-700 text-slate-100 font-black">
                {toBanglaDigit(stats?.total || 0)}
              </span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="শিক্ষার্থীর নাম, আবেদন নং বা মোবাইল দিয়ে খুঁজুন..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-400"
            />
            {search && (
              <button 
                onClick={() => setSearch('')}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>

        {/* 📋 Application Cards Roster */}
        {isLoading ? (
          <div className="bg-white rounded-3xl p-16 text-center text-slate-400 shadow-sm border border-slate-200">
            <RefreshCw className="w-8 h-8 mx-auto mb-3 animate-spin text-emerald-600" />
            <p className="text-sm font-semibold">ভর্তি আবেদনের তথ্য লোড হচ্ছে...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center text-slate-400 shadow-sm border border-dashed border-slate-300">
            <User className="w-12 h-12 mx-auto mb-3 opacity-30 text-slate-400" />
            <h3 className="text-base font-bold text-slate-700">কোনো ভর্তি আবেদন পাওয়া যায়নি</h3>
            <p className="text-xs text-slate-400 mt-1">
              {activeTab === 'pending'
                ? 'বর্তমানে কোনো অপেক্ষমাণ আবেদন নেই।'
                : 'অন্য ট্যাব অথবা শিক্ষাবর্ষ পরিবর্তন করে দেখুন।'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {applications.map((app: any) => {
              const isApproved = app.status === 'approved';
              const isPending = app.status === 'pending';
              const isRejected = app.status === 'rejected';

              return (
                <div
                  key={app.id}
                  className={`bg-white rounded-3xl p-5 sm:p-6 shadow-sm border transition-all hover:shadow-md ${
                    isApproved 
                      ? 'border-emerald-200/80 bg-gradient-to-r from-emerald-50/20 to-white' 
                      : isRejected 
                      ? 'border-rose-200/80 bg-gradient-to-r from-rose-50/10 to-white' 
                      : 'border-amber-200/80 bg-gradient-to-r from-amber-50/20 to-white'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                    
                    {/* Left: Applicant Profile Info */}
                    <div className="flex flex-col sm:flex-row items-start gap-4 flex-1">
                      {app.photo ? (
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-emerald-500/30 shadow-xs shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={getMediaUrl(app.photo)}
                            alt={app.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : null}

                      <div className="space-y-3 flex-1 min-w-0">
                      
                      {/* Top Badges */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono font-bold text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-xl border border-slate-200">
                          {app.application_no}
                        </span>

                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold inline-flex items-center gap-1 ${
                          isApproved
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : isRejected
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : 'bg-amber-100 text-amber-900 border border-amber-300'
                        }`}>
                          {isApproved && <CheckCircle2 className="w-3.5 h-3.5" />}
                          {isPending && <Clock className="w-3.5 h-3.5 text-amber-600" />}
                          {isRejected && <AlertCircle className="w-3.5 h-3.5" />}
                          <span>
                            {isApproved ? 'মঞ্জুরিকৃত (Approved)' : isRejected ? 'বাতিল (Rejected)' : 'অপেক্ষমাণ (Pending)'}
                          </span>
                        </span>

                        <span className="px-2 py-0.5 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 text-[11px] font-semibold">
                          {app.residential_status === 'residential' ? '🏠 আবাসিক শিক্ষার্থী' : '🎒 অনাবাসিক (Day Scholar)'}
                        </span>

                        <span className="text-[11px] text-slate-400">
                          আবেদনের তারিখ: {new Date(app.applied_at).toLocaleDateString('bn-BD')}
                        </span>
                      </div>

                      {/* Student Names & Desired Program */}
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg sm:text-xl font-extrabold text-slate-800">
                            {app.name_bn}
                          </h3>
                          <span className="text-xs text-slate-500 font-medium">({app.name})</span>
                        </div>
                        <p className="text-xs sm:text-sm font-bold text-emerald-800 mt-0.5 flex items-center gap-1.5">
                          <BookOpen className="w-4 h-4 text-emerald-600" />
                          <span>কাঙ্ক্ষিত বিভাগ / শ্রেণি: <strong>{app.desired_program}</strong></span>
                        </p>
                      </div>

                      {/* Detailed Metadata Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs text-slate-600 pt-1">
                        <div>
                          <span className="text-slate-400">পিতা:</span> <strong>{app.father_name_bn || app.father_name}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400">মাতা:</span> <strong>{app.mother_name_bn || app.mother_name}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400">জন্ম তারিখ:</span> <strong>{app.date_of_birth}</strong> (রক্ত: {app.blood_group || 'অজানা'})
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-slate-400">মোবাইল:</span> 
                          <strong className="font-mono text-emerald-800">{app.guardian_phone}</strong>
                          <a
                            href={`https://wa.me/88${app.guardian_phone.replace(/^0+/, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1 rounded-md bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition-colors ml-1"
                            title="হোয়াটসঅ্যাপে মেসেজ পাঠান"
                          >
                            <MessageSquare className="w-3 h-3" />
                          </a>
                        </div>
                        <div className="sm:col-span-2 truncate">
                          <span className="text-slate-400">ঠিকানা:</span> <strong>{app.present_address}</strong>
                        </div>
                      </div>

                      {/* Approved Info Strip */}
                      {isApproved && (
                        <div className="p-3 bg-emerald-100/60 border border-emerald-200 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs text-emerald-950 font-bold">
                          <div className="flex items-center gap-4">
                            <span>স্টুডেন্ট আইডি: <strong className="font-mono text-sm text-emerald-900 bg-white px-2 py-0.5 rounded border border-emerald-300">{app.assigned_student_id || app.enrolled_student_id}</strong></span>
                            <span>রোল: <strong className="text-sm text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-300"># {toBanglaDigit(app.assigned_roll || app.enrolled_student_roll)}</strong></span>
                            <span>শাখা: <strong>{app.enrolled_student_section || 'A'}</strong></span>
                            <span>বিভাগ: <strong>{app.enrolled_student_dept || 'নির্ধারিত'}</strong></span>
                          </div>
                          {(app.interview_marks !== null || app.written_marks !== null) && (
                            <div className="text-[11px] text-emerald-800">
                              স্কোর: ভাইভা {toBanglaDigit(app.interview_marks || 0)} • লিখিত {toBanglaDigit(app.written_marks || 0)}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Rejected Note Strip */}
                      {isRejected && app.admin_note && (
                        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
                          <span className="font-bold">বাতিলের কারণ:</span> {app.admin_note}
                        </div>
                      )}

                      </div>
                    </div>

                    {/* Right: Action Buttons */}
                    <div className="flex flex-row lg:flex-col items-center justify-end gap-2 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                      
                      {isPending && (
                        <>
                          <button
                            onClick={() => handleOpenApproveModal(app)}
                            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 text-white text-xs sm:text-sm font-bold shadow-md transition-all active:scale-95"
                          >
                            <CheckCircle2 className="w-4 h-4 text-amber-300" />
                            <span>ভর্তি মঞ্জুর ও রোল বরাদ্দ</span>
                          </button>

                          <button
                            onClick={() => handleOpenRejectModal(app)}
                            className="px-3 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all"
                          >
                            <span>বাতিল</span>
                          </button>
                        </>
                      )}

                      {isApproved && (
                        <button
                          onClick={() => handlePrintSlip(app)}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 text-xs sm:text-sm font-extrabold shadow-md transition-all active:scale-95"
                          title="ভর্তি অনুমোদন স্লিপ প্রিন্ট করুন"
                        >
                          <Printer className="w-4 h-4" />
                          <span>ভর্তি স্লিপ প্রিন্ট</span>
                        </button>
                      )}

                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 🌟 MODAL: ভর্তি মঞ্জুরি ও স্বয়ংক্রিয় রোল বরাদ্দ ফরম (Approval Modal) */}
        {isApprovalModalOpen && selectedApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn no-print">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 max-h-[92vh] flex flex-col">
              
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-[#02200d] text-white p-5 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-400 text-emerald-950 flex items-center justify-center font-bold">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold">ভর্তি মঞ্জুরি ও স্বয়ংক্রিয় রোল বরাদ্দ</h3>
                    <p className="text-xs text-emerald-200/80">
                      আবেদন নং: <strong className="font-mono text-amber-300">{selectedApp.application_no}</strong> • সেশন: {toBanglaDigit(selectedYear)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsApprovalModalOpen(false)}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Applicant Quick Glance */}
              <div className="bg-emerald-50/80 p-3.5 px-6 border-b border-emerald-100 flex items-center justify-between text-xs text-emerald-950 font-bold shrink-0">
                <div className="flex items-center gap-3">
                  {selectedApp.photo && (
                    <div className="w-10 h-10 rounded-xl overflow-hidden border border-emerald-500/40 shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={getMediaUrl(selectedApp.photo)}
                        alt={selectedApp.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div>
                    শিক্ষার্থী: <span className="text-emerald-900 text-sm font-extrabold">{selectedApp.name_bn}</span> ({selectedApp.name})
                  </div>
                </div>
                <div>
                  অভিভাবক: <span>{selectedApp.guardian_phone}</span>
                </div>
              </div>

              {/* Form Body (Scrollable) */}
              <form onSubmit={handleApproveSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
                
                {/* 1. Department Allocation */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      ইসলামিক বিভাগ
                    </label>
                    <select
                      value={approvalForm.islamic_department_id}
                      onChange={(e) => setApprovalForm({ ...approvalForm, islamic_department_id: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50"
                    >
                      <option value="">-- প্রযোজ্য নয় --</option>
                      {islamicDepts.map((d: any) => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      জেনারেল একাডেমি শ্রেণি / বিভাগ
                    </label>
                    <select
                      value={approvalForm.general_department_id}
                      onChange={(e) => setApprovalForm({ ...approvalForm, general_department_id: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50"
                    >
                      <option value="">-- প্রযোজ্য নয় --</option>
                      {generalDepts.map((d: any) => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 2. Section & Auto Roll Calculation */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-amber-50/50 p-4 rounded-2xl border border-amber-200/80">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      শাখা (Section)
                    </label>
                    <select
                      value={approvalForm.section}
                      onChange={(e) => setApprovalForm({ ...approvalForm, section: e.target.value, roll_number: '' })}
                      className="w-full px-3 py-2 rounded-xl border border-amber-300 text-xs font-black bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      <option value="A">শাখা - ক (Section A)</option>
                      <option value="B">শাখা - খ (Section B)</option>
                      <option value="C">শাখা - গ (Section C)</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-800">
                        ছাত্র ক্রমিক রোল (Roll Number) <span className="text-rose-500">*</span>
                      </label>
                      {nextRollData?.next_roll && (
                        <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-300">
                          পরবর্তী রোল: {toBanglaDigit(nextRollData.next_roll)}
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="number"
                        min="1"
                        value={approvalForm.roll_number}
                        onChange={(e) => setApprovalForm({ ...approvalForm, roll_number: e.target.value })}
                        placeholder={nextRollData?.next_roll ? String(nextRollData.next_roll) : 'স্বয়ংক্রিয় হিসাবকৃত'}
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-amber-300 text-sm font-black bg-white text-emerald-950 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Residential Status & Room Allocation */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      আবাসিক অবস্থা
                    </label>
                    <select
                      value={approvalForm.residential_status}
                      onChange={(e) => setApprovalForm({ ...approvalForm, residential_status: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50"
                    >
                      <option value="day">অনাবাসিক (Day Scholar)</option>
                      <option value="residential">আবাসিক (Residential)</option>
                    </select>
                  </div>

                  {approvalForm.residential_status === 'residential' ? (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        হোস্টেল রুম বরাদ্দ
                      </label>
                      <select
                        value={approvalForm.hostel_room_id}
                        onChange={(e) => setApprovalForm({ ...approvalForm, hostel_room_id: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50"
                      >
                        <option value="">-- পরে বরাদ্দ হবে --</option>
                        {hostelRooms.map((r: any) => (
                          <option key={r.id} value={r.id}>
                            {r.room_number} {r.name ? `(${r.name})` : ''} - ধারণ: {toBanglaDigit(r.capacity)} জন
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">
                        হোস্টেল রুম
                      </label>
                      <input
                        type="text"
                        disabled
                        value="অনাবাসিক শিক্ষার্থীর জন্য প্রযোজ্য নয়"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-400 bg-slate-100 cursor-not-allowed"
                      />
                    </div>
                  )}
                </div>

                {/* 4. Fees Structure */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      মাসিক বেতন (৳)
                    </label>
                    <input
                      type="number"
                      value={approvalForm.monthly_fee}
                      onChange={(e) => setApprovalForm({ ...approvalForm, monthly_fee: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      হোস্টেল ফি (৳)
                    </label>
                    <input
                      type="number"
                      disabled={approvalForm.residential_status !== 'residential'}
                      value={approvalForm.hostel_fee}
                      onChange={(e) => setApprovalForm({ ...approvalForm, hostel_fee: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold disabled:bg-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-emerald-800 mb-1">
                      তাৎক্ষণিক ভর্তি ফি (৳)
                    </label>
                    <input
                      type="number"
                      value={approvalForm.admission_fee}
                      onChange={(e) => setApprovalForm({ ...approvalForm, admission_fee: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-xl border border-emerald-300 text-xs font-black text-emerald-800 bg-emerald-50/50"
                      title="টাকা লিখলে স্বয়ংক্রিয় মানি রিসিট ও ক্যাশ খাতায় যুক্ত হবে"
                    />
                  </div>
                </div>

                {/* 5. Evaluation / Interview Scores */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      মৌখিক / ভাইভা নম্বর (ঐচ্ছিক)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={approvalForm.interview_marks}
                      onChange={(e) => setApprovalForm({ ...approvalForm, interview_marks: e.target.value })}
                      placeholder="যেমন: 25.00"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      লিখিত পরীক্ষা নম্বর (ঐচ্ছিক)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={approvalForm.written_marks}
                      onChange={(e) => setApprovalForm({ ...approvalForm, written_marks: e.target.value })}
                      placeholder="যেমন: 45.00"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium"
                    />
                  </div>
                </div>

                {/* 6. Admin Note */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    অনুমোদন নোট / মন্তব্য
                  </label>
                  <input
                    type="text"
                    value={approvalForm.admin_note}
                    onChange={(e) => setApprovalForm({ ...approvalForm, admin_note: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium"
                  />
                </div>

                {/* Submit Buttons */}
                <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-200 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsApprovalModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    বাতিল
                  </button>

                  <button
                    type="submit"
                    disabled={approveMutation.isPending}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-600 hover:to-teal-600 active:scale-95 text-white text-xs sm:text-sm font-extrabold shadow-md transition-all disabled:opacity-50"
                  >
                    {approveMutation.isPending ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>প্রক্রিয়াধীন রয়েছে...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 text-amber-300" />
                        <span>১-ক্লিকে ভর্তি অনুমোদন ও আইডি প্রস্তুত করুন</span>
                      </>
                    )}
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}

        {/* ❌ MODAL: আবেদন বাতিলকরণ ফরম (Reject Modal) */}
        {isRejectModalOpen && selectedApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn no-print">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
              <div className="bg-gradient-to-r from-rose-900 to-red-950 text-white p-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-300" />
                  <h3 className="font-bold text-base">ভর্তি আবেদন বাতিল নিশ্চিতকরণ</h3>
                </div>
                <button
                  onClick={() => setIsRejectModalOpen(false)}
                  className="p-1 rounded-xl bg-white/10 hover:bg-white/20 text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleRejectSubmit} className="p-6 space-y-4">
                <p className="text-xs text-slate-600">
                  আবেদনকারী: <strong>{selectedApp.name_bn}</strong> (আবেদন নং: {selectedApp.application_no}) এর আবেদনটি বাতিল করার কারণ লিখুন:
                </p>

                <textarea
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="বাতিলের কারণ লিখুন..."
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-rose-500 focus:outline-none resize-none"
                  required
                />

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsRejectModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                  >
                    ফিরে যান
                  </button>
                  <button
                    type="submit"
                    disabled={rejectMutation.isPending}
                    className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition-all disabled:opacity-50"
                  >
                    {rejectMutation.isPending ? 'বাতিল হচ্ছে...' : 'বাতিল নিশ্চিত করুন'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 🖨️ OFFICIAL PRINTABLE A4 ADMISSION CONFIRMATION SLIP */}
        {printApp && (
          <div className="hidden print:block print-slip-container bg-white p-6 text-black">
            
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
                    ছাত্র ভর্তি নিশ্চিতকরণ ও পরিচয়পত্র প্রত্যয়ন স্লিপ — সেশন {toBanglaDigit(printApp.academic_year || 2027)}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs mt-3 font-bold px-1 border-t border-dashed border-gray-400 pt-1">
                <span>আবেদন নম্বর: <strong>{printApp.application_no}</strong></span>
                <span>ভর্তির তারিখ: {new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            </div>

            {/* Official Student & Academic Identity Table */}
            <div className="mb-4">
              <table className="w-full text-xs border border-black mb-4">
                <tbody>
                  <tr>
                    <td className="p-2 border border-black bg-gray-100 font-bold w-1/4">শিক্ষার্থীর নাম (বাংলা):</td>
                    <td className="p-2 border border-black font-extrabold text-sm w-1/4">{printApp.name_bn}</td>
                    <td className="p-2 border border-black bg-gray-100 font-bold w-1/4">স্টুডেন্ট আইডি (Student ID):</td>
                    <td className="p-2 border border-black font-mono font-black text-sm w-1/4">{printApp.assigned_student_id || printApp.enrolled_student_id}</td>
                  </tr>
                  <tr>
                    <td className="p-2 border border-black bg-gray-100 font-bold">শিক্ষার্থীর নাম (ইংরেজি):</td>
                    <td className="p-2 border border-black font-semibold">{printApp.name}</td>
                    <td className="p-2 border border-black bg-gray-100 font-bold">রোল নম্বর ও শাখা:</td>
                    <td className="p-2 border border-black font-black text-sm">
                      রোল # {toBanglaDigit(printApp.assigned_roll || printApp.enrolled_student_roll || 1)} (শাখা: {printApp.enrolled_student_section || 'A'})
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 border border-black bg-gray-100 font-bold">অন্তর্ভুক্ত বিভাগ / শ্রেণি:</td>
                    <td className="p-2 border border-black font-bold">{printApp.enrolled_student_dept || printApp.desired_program}</td>
                    <td className="p-2 border border-black bg-gray-100 font-bold">আবাসিক অবস্থা:</td>
                    <td className="p-2 border border-black font-semibold">
                      {printApp.residential_status === 'residential' ? 'আবাসিক (Residential)' : 'অনাবাসিক (Day Scholar)'}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 border border-black bg-gray-100 font-bold">পিতার নাম:</td>
                    <td className="p-2 border border-black">{printApp.father_name_bn || printApp.father_name}</td>
                    <td className="p-2 border border-black bg-gray-100 font-bold">মাতার নাম:</td>
                    <td className="p-2 border border-black">{printApp.mother_name_bn || printApp.mother_name}</td>
                  </tr>
                  <tr>
                    <td className="p-2 border border-black bg-gray-100 font-bold">অভিভাবকের মোবাইল:</td>
                    <td className="p-2 border border-black font-mono font-bold">{printApp.guardian_phone}</td>
                    <td className="p-2 border border-black bg-gray-100 font-bold">জন্ম তারিখ ও রক্তের গ্রুপ:</td>
                    <td className="p-2 border border-black font-bold">{printApp.date_of_birth} ({printApp.blood_group || 'অজানা'})</td>
                  </tr>
                  <tr>
                    <td className="p-2 border border-black bg-gray-100 font-bold">বর্তমান ঠিকানা:</td>
                    <td colSpan={3} className="p-2 border border-black font-semibold">{printApp.present_address}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Online Portal Login Credentials Box */}
            <div className="border-2 border-black p-3 rounded-lg mb-6 bg-gray-50">
              <div className="font-black text-xs uppercase mb-1.5 flex items-center justify-between">
                <span>🔐 অনলাইন পোর্টাল লগইন একাউন্ট তথ্য (Portal Login Credentials):</span>
                <span className="text-[10pt] font-mono">http://localhost:3000/login</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  লগইন ইউজার আইডি: <strong className="font-mono text-sm">{printApp.assigned_student_id || printApp.enrolled_student_id}</strong>
                </div>
                <div>
                  প্রাথমিক পাসওয়ার্ড: <strong className="font-mono text-sm">{printApp.date_of_birth ? printApp.date_of_birth.replace(/-/g, '').slice(6, 8) + printApp.date_of_birth.replace(/-/g, '').slice(4, 6) + printApp.date_of_birth.replace(/-/g, '').slice(0, 4) : 'জন্মতারিখ'}</strong> (জন্ম তারিখ DDMMYYYY)
                </div>
              </div>
              <p className="text-[9pt] text-gray-600 mt-1">
                * অভিভাবক ও শিক্ষার্থী এই আইডি ও পাসওয়ার্ড ব্যবহার করে রেজাল্ট কার্ড, ডিজিটাল হাজিরা ও মাসিক ফি পরিশোধ করতে পারবেন।
              </p>
            </div>

            {/* Guardian Declaration */}
            <div className="text-[9pt] border border-black p-3 mb-10 leading-relaxed bg-white">
              <p className="font-bold mb-1">অভিভাবকের অঙ্গীকারনামা:</p>
              <p>
                আমি এই মর্মে অঙ্গীকার করছি যে, আমার সন্তানকে আল-মদিনা মডেল মাদ্রাসার যাবতীয় দ্বীনি ও প্রাতিষ্ঠানিক নিয়ম-কানুন মেনে চলতে সার্বিক সহায়তা প্রদান করব। মাদ্রাসার নির্ধারিত মাসিক ফি ও অন্যান্য দেয় প্রতি মাসের ১০ তারিখের মধ্যে নিয়মিত পরিশোধ করতে বাধ্য থাকব।
              </p>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-3 text-center text-xs font-bold gap-6 pt-4">
              <div>
                <div className="border-t border-black pt-1">
                  অভিভাবকের স্বাক্ষর ও তারিখ
                </div>
                <p className="text-[10px] text-gray-600 mt-0.5">মোবাইল: {printApp.guardian_phone}</p>
              </div>

              <div>
                <div className="border-t border-black pt-1">
                  আহ্বায়ক, ভর্তি ও পরীক্ষা কমিটি
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
    </AppLayout>
  );
}
