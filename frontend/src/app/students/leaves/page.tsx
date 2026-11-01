/* eslint-disable */
'use client';

import React, { useState, useMemo } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { 
  CalendarCheck, Clock, CheckCircle2, XCircle, AlertCircle, 
  Search, Filter, ShieldCheck, Printer, Plus, Share2, 
  ExternalLink, User, Building, MapPin, ArrowRight, Eye, X, MessageSquare 
} from 'lucide-react';
import { toBanglaDigit } from '@/lib/numberToBanglaWords';
import PrintableGatePass, { StudentGatePassData } from '@/components/students/PrintableGatePass';

export default function StudentLeavesPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedDept, setSelectedDept] = useState<string>('all');

  // Modal states
  const [activeGatePass, setActiveGatePass] = useState<StudentGatePassData | null>(null);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isNewLeaveModalOpen, setIsNewLeaveModalOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<any>(null);

  // Approval Form state
  const [departureTime, setDepartureTime] = useState('');
  const [expectedReturnTime, setExpectedReturnTime] = useState('');
  const [reviewComment, setReviewComment] = useState('অনুমোদিত');

  // Reject Form state
  const [rejectReason, setRejectReason] = useState('কর্তৃপক্ষ কর্তৃক আবেদনটি বাতিল করা হয়েছে।');

  // New Leave Form state
  const [newStudentId, setNewStudentId] = useState('');
  const [newLeaveType, setNewLeaveType] = useState('sick');
  const [newFromDate, setNewFromDate] = useState(new Date().toISOString().split('T')[0]);
  const [newToDate, setNewToDate] = useState(new Date().toISOString().split('T')[0]);
  const [newReason, setNewReason] = useState('');
  const [newGuardianName, setNewGuardianName] = useState('');
  const [newGuardianPhone, setNewGuardianPhone] = useState('');
  const [newRelationship, setNewRelationship] = useState('পিতা');
  const [newDepartureTime, setNewDepartureTime] = useState('বিকাল ৫:০০ টা');
  const [newExpectedReturnTime, setNewExpectedReturnTime] = useState('পরদিন সকাল ৮:০০ টা');

  // 1. Fetch Stats
  const { data: stats } = useQuery({
    queryKey: ['student_leaves_stats'],
    queryFn: async () => {
      const res = await api.get('/api/students/leaves/stats/');
      return res.data;
    }
  });

  // 2. Fetch Departments
  const { data: departments = [] } = useQuery({
    queryKey: ['departments_list'],
    queryFn: async () => {
      const res = await api.get('/api/students/departments/');
      return res.data;
    }
  });

  // 3. Fetch Students for New Leave dropdown
  const { data: students = [] } = useQuery({
    queryKey: ['all_students_leave_selector'],
    queryFn: async () => {
      const res = await api.get('/api/students/');
      return res.data;
    }
  });

  // 4. Fetch Leaves
  const { data: leaves = [], isLoading } = useQuery({
    queryKey: ['student_leaves_list', selectedStatus, selectedDept, searchTerm],
    queryFn: async () => {
      let url = `/api/students/leaves/?status=${selectedStatus}`;
      if (selectedDept !== 'all') url += `&department=${selectedDept}`;
      if (searchTerm) url += `&q=${encodeURIComponent(searchTerm)}`;
      const res = await api.get(url);
      return res.data;
    }
  });

  // Approve Mutation
  const approveMutation = useMutation({
    mutationFn: async (payload: { id: number; departure_time: string; expected_return_time: string; review_comment: string }) => {
      const res = await api.post(`/api/students/leaves/${payload.id}/approve/`, payload);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'ছুটি অনুমোদিত হয়েছে এবং গেটপাস তৈরি হয়েছে!');
      queryClient.invalidateQueries({ queryKey: ['student_leaves_list'] });
      queryClient.invalidateQueries({ queryKey: ['student_leaves_stats'] });
      setIsApproveModalOpen(false);
      if (data.leave) {
        setActiveGatePass(data.leave);
      }
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'অনুমোদনে ত্রুটি হয়েছে');
    }
  });

  // Reject Mutation
  const rejectMutation = useMutation({
    mutationFn: async (payload: { id: number; review_comment: string }) => {
      const res = await api.post(`/api/students/leaves/${payload.id}/reject/`, payload);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success('ছুটির আবেদন বাতিল করা হয়েছে');
      queryClient.invalidateQueries({ queryKey: ['student_leaves_list'] });
      queryClient.invalidateQueries({ queryKey: ['student_leaves_stats'] });
      setIsRejectModalOpen(false);
    },
    onError: (err: any) => {
      toast.error('বাতিল করতে সমস্যা হয়েছে');
    }
  });

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post('/api/students/leaves/', payload);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success('ছুটির আবেদন সফলভাবে সংরক্ষণ করা হয়েছে!');
      queryClient.invalidateQueries({ queryKey: ['student_leaves_list'] });
      queryClient.invalidateQueries({ queryKey: ['student_leaves_stats'] });
      setIsNewLeaveModalOpen(false);
      setNewReason('');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'ছুটির আবেদন তৈরিতে ব্যর্থ');
    }
  });

  const handleOpenApprove = (leave: any) => {
    setSelectedLeave(leave);
    setDepartureTime(leave.departure_time || 'বিকাল ৫:০০ টা');
    setExpectedReturnTime(leave.expected_return_time || 'নির্ধারিত তারিখ সকাল ৮:০০ টা');
    setReviewComment('অনুমোদিত। নির্ধারিত সময়ে ক্লাসে উপস্থিত হতে হবে।');
    setIsApproveModalOpen(true);
  };

  const handleOpenReject = (leave: any) => {
    setSelectedLeave(leave);
    setRejectReason('জরুরি পরীক্ষার কারণে এই সময়ে ছুটি দেওয়া সম্ভব হচ্ছে না।');
    setIsRejectModalOpen(true);
  };

  const handleConfirmApprove = () => {
    if (!selectedLeave) return;
    approveMutation.mutate({
      id: selectedLeave.id,
      departure_time: departureTime,
      expected_return_time: expectedReturnTime,
      review_comment: reviewComment
    });
  };

  const handleConfirmReject = () => {
    if (!selectedLeave) return;
    rejectMutation.mutate({
      id: selectedLeave.id,
      review_comment: rejectReason
    });
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentId) {
      toast.error('শিক্ষার্থী নির্বাচন করুন');
      return;
    }
    if (!newReason) {
      toast.error('ছুটির কারণ উল্লেখ করুন');
      return;
    }

    createMutation.mutate({
      student_id: newStudentId,
      leave_type: newLeaveType,
      from_date: newFromDate,
      to_date: newToDate,
      reason: newReason,
      applied_by_guardian: newGuardianName,
      guardian_phone: newGuardianPhone,
      relationship: newRelationship,
      departure_time: newDepartureTime,
      expected_return_time: newExpectedReturnTime
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6 pb-20">
        
        {/* Page Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 text-white p-6 rounded-2xl border border-emerald-500/20 shadow-xl">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-semibold">
                নাজেরা • হিফজ • কিতাব • আবাসিক
              </span>
              <span className="text-amber-400 text-xs font-mono">GATE-PASS ENGINE</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
              <CalendarCheck className="w-8 h-8 text-amber-400" />
              শিক্ষার্থী ছুটির আবেদন ও ডিজিটাল গেটপাস
            </h1>
            <p className="text-sm text-emerald-200/80">
              অভিভাবকদের ছুটির দরখাস্ত যাচাই, ওস্তাদজির অনুমোদন এবং আবাসিক শিক্ষার্থীদের তাৎক্ষণিক কিউআর গেটপাস স্লিপ
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsNewLeaveModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg hover:shadow-amber-500/25 transition group shrink-0"
            >
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
              <span>নতুন ছুটির এন্ট্রি</span>
            </button>
          </div>
        </div>

        {/* Bento Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-800">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">মোট আবেদন</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                {toBanglaDigit(stats?.total_applications ?? 0)}
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-amber-200/80 dark:border-amber-900/50 rounded-2xl p-4 shadow-sm flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-200 dark:border-amber-800">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-amber-700 dark:text-amber-400 font-bold">অপেক্ষমাণ রিভিউ</p>
              <p className="text-2xl font-black text-amber-700 dark:text-amber-300 mt-0.5">
                {toBanglaDigit(stats?.pending_applications ?? 0)}
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl p-4 shadow-sm flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200 dark:border-emerald-800">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-emerald-700 dark:text-emerald-400 font-bold">অনুমোদিত গেটপাস</p>
              <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-0.5">
                {toBanglaDigit(stats?.approved_applications ?? 0)}
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-900/50 rounded-2xl p-4 shadow-sm flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 border border-purple-200 dark:border-purple-800">
              <User className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-purple-700 dark:text-purple-400 font-bold">বর্তমানে ছুটিতে আছে</p>
              <p className="text-2xl font-black text-purple-700 dark:text-purple-300 mt-0.5">
                {toBanglaDigit(stats?.currently_on_leave ?? 0)} জন
              </p>
            </div>
          </div>

        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            
            {/* Status Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-x-auto">
              {[
                { id: 'all', label: 'সকল আবেদন' },
                { id: 'pending', label: 'অপেক্ষমাণ' },
                { id: 'approved', label: 'অনুমোদিত' },
                { id: 'rejected', label: 'বাতিলকৃত' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedStatus(tab.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
                    selectedStatus === tab.id
                      ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Department Filter & Search */}
            <div className="flex items-center gap-2 flex-1 sm:justify-end">
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">সকল বিভাগ</option>
                {departments.map((d: any) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>

              <div className="relative flex-1 sm:max-w-xs">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="নাম, রোল, গেটপাস বা মোবাইল..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs rounded-xl pl-9 pr-3 py-2 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

          </div>
        </div>

        {/* Leaves Table */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3.5 pl-5">ট্র্যাকিং নং ও শিক্ষার্থী</th>
                  <th className="p-3.5">বিভাগ ও রোল</th>
                  <th className="p-3.5">ছুটির ধরন ও মেয়াদ</th>
                  <th className="p-3.5">ক্যাম্পাস ত্যাগের সময়</th>
                  <th className="p-3.5">অভিভাবক ও যোগাযোগ</th>
                  <th className="p-3.5">স্ট্যাটাস ও গেটপাস</th>
                  <th className="p-3.5 pr-5 text-right">কার্যক্রম</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400">
                      লোড হচ্ছে...
                    </td>
                  </tr>
                ) : leaves.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400">
                      কোনো ছুটির আবেদন পাওয়া যায়নি।
                    </td>
                  </tr>
                ) : (
                  leaves.map((leave: any) => {
                    const isApproved = leave.status === 'approved';
                    const isPending = leave.status === 'pending';
                    const isRejected = leave.status === 'rejected';

                    return (
                      <tr key={leave.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                        
                        {/* Student Info */}
                        <td className="p-3.5 pl-5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold text-xs shrink-0 border border-emerald-300 dark:border-emerald-800">
                              {leave.student_photo ? (
                                <img src={leave.student_photo} alt="" className="w-full h-full object-cover rounded-full" />
                              ) : (
                                leave.student_name_bn?.charAt(0) || 'শ'
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white leading-tight">
                                {leave.student_name_bn}
                              </p>
                              <p className="text-[11px] text-slate-500 font-mono">
                                আইডি: {leave.student_uid} • <span className="text-emerald-700 font-semibold">{leave.leave_no}</span>
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Department & Roll */}
                        <td className="p-3.5">
                          <p className="font-semibold text-slate-800 dark:text-slate-200">
                            {leave.department_name_bn || 'হিফজুল কুরআন'}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                            <span>রোল: {toBanglaDigit(leave.student_roll || '-')}</span>
                            <span>•</span>
                            <span className={leave.residential_status === 'residential' ? 'text-blue-600 font-semibold' : 'text-slate-500'}>
                              {leave.residential_status === 'residential' ? 'আবাসিক' : 'অনাবাসিক'}
                            </span>
                          </div>
                        </td>

                        {/* Leave Type & Duration */}
                        <td className="p-3.5">
                          <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            {leave.leave_type_display || leave.leave_type}
                          </span>
                          <p className="text-[11px] text-slate-500 mt-1">
                            {leave.from_date} হতে {leave.to_date} ({toBanglaDigit(leave.total_days)} দিন)
                          </p>
                        </td>

                        {/* Departure & Return */}
                        <td className="p-3.5 text-[11px]">
                          <p className="text-amber-700 dark:text-amber-400 font-semibold">
                            ত্যাগ: {leave.departure_time || 'অনুমোদিত সময়'}
                          </p>
                          <p className="text-slate-500 mt-0.5">
                            ফেরার সময়: {leave.expected_return_time || 'নির্ধারিত তারিখ'}
                          </p>
                        </td>

                        {/* Guardian */}
                        <td className="p-3.5 text-[11px]">
                          <p className="font-semibold text-slate-800 dark:text-slate-200">
                            {leave.applied_by_guardian} ({leave.relationship || 'অভিভাবক'})
                          </p>
                          <p className="font-mono text-emerald-700 dark:text-emerald-400 mt-0.5">
                            {leave.guardian_phone}
                          </p>
                        </td>

                        {/* Status & GatePass */}
                        <td className="p-3.5">
                          <div className="space-y-1">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              isApproved 
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300'
                                : isPending
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300'
                                : 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border border-red-300'
                            }`}>
                              {isApproved ? <CheckCircle2 className="w-3 h-3" /> : isPending ? <Clock className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                              {isApproved ? 'অনুমোদিত' : isPending ? 'অপেক্ষমাণ' : 'বাতিল'}
                            </span>

                            {leave.gate_pass_no && (
                              <p className="font-mono text-[10px] text-emerald-800 dark:text-emerald-300 font-bold">
                                {leave.gate_pass_no}
                              </p>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="p-3.5 pr-5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            
                            {isApproved && (
                              <>
                                <button
                                  onClick={() => setActiveGatePass(leave)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-[11px] font-bold shadow-sm transition"
                                  title="ডিজিটাল গেটপাস দেখুন ও প্রিন্ট করুন"
                                >
                                  <Printer className="w-3.5 h-3.5" />
                                  <span>গেটপাস</span>
                                </button>
                                
                                {leave.whatsapp_link && (
                                  <a
                                    href={leave.whatsapp_link}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 transition"
                                    title="হোয়াটসঅ্যাপে গেটপাস লিংক পাঠান"
                                  >
                                    <Share2 className="w-3.5 h-3.5" />
                                  </a>
                                )}
                              </>
                            )}

                            {isPending && (
                              <>
                                <button
                                  onClick={() => handleOpenApprove(leave)}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold shadow-sm transition"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>অনুমোদন</span>
                                </button>
                                <button
                                  onClick={() => handleOpenReject(leave)}
                                  className="p-1.5 rounded-lg bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 hover:bg-red-200 transition"
                                  title="আবেদন বাতিল করুন"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </>
                            )}

                            {isRejected && (
                              <button
                                onClick={() => setActiveGatePass(leave)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                                title="বিবরণ দেখুন"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            )}

                          </div>
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

      {/* Approve Modal */}
      {isApproveModalOpen && selectedLeave && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                ছুটি অনুমোদন ও গেটপাস ইস্যু
              </h3>
              <button onClick={() => setIsApproveModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-xl border border-emerald-200/60 text-xs space-y-1">
              <p className="font-bold text-emerald-950 dark:text-emerald-200">
                শিক্ষার্থী: {selectedLeave.student_name_bn} ({selectedLeave.department_name_bn})
              </p>
              <p className="text-emerald-800 dark:text-emerald-300">
                ছুটি: {selectedLeave.from_date} হতে {selectedLeave.to_date} ({toBanglaDigit(selectedLeave.total_days)} দিন)
              </p>
              <p className="text-zinc-600 dark:text-zinc-400 italic">"{selectedLeave.reason}"</p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">ক্যাম্পাস ত্যাগের সময়</label>
                <input
                  type="text"
                  value={departureTime}
                  onChange={(e) => setDepartureTime(e.target.value)}
                  placeholder="যেমন: বিকাল ৫:৩০ টা"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">মাদ্রাসায় উপস্থিতির শেষ সময়</label>
                <input
                  type="text"
                  value={expectedReturnTime}
                  onChange={(e) => setExpectedReturnTime(e.target.value)}
                  placeholder="যেমন: পরদিন সকাল ৮:০০ টা"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">শিক্ষকের মন্তব্য / শর্ত</label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setIsApproveModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                বাতিল
              </button>
              <button
                onClick={handleConfirmApprove}
                disabled={approveMutation.isPending}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md disabled:opacity-50"
              >
                {approveMutation.isPending ? 'অনুমোদন হচ্ছে...' : 'অনুমোদন ও গেটপাস তৈরি করুন'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {isRejectModalOpen && selectedLeave && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-red-600 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-600" />
                ছুটির আবেদন বাতিল করুন
              </h3>
              <button onClick={() => setIsRejectModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs space-y-3">
              <p className="text-slate-600 dark:text-slate-300">
                আপনি কি নিশ্চিত যে <span className="font-bold">{selectedLeave.student_name_bn}</span> এর ছুটির আবেদনটি বাতিল করতে চান?
              </p>
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">বাতিলের কারণ:</label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                ফিরে যান
              </button>
              <button
                onClick={handleConfirmReject}
                disabled={rejectMutation.isPending}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white shadow-md disabled:opacity-50"
              >
                {rejectMutation.isPending ? 'বাতিল হচ্ছে...' : 'হ্যাঁ, বাতিল করুন'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Leave Entry Modal */}
      {isNewLeaveModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 my-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-600" />
                নতুন ছুটির আবেদন এন্ট্রি
              </h3>
              <button onClick={() => setIsNewLeaveModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs">
              
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">শিক্ষার্থী নির্বাচন করুন *</label>
                <select
                  value={newStudentId}
                  onChange={(e) => {
                    const stId = e.target.value;
                    setNewStudentId(stId);
                    const matched = students.find((s: any) => String(s.id) === stId || s.student_id === stId);
                    if (matched) {
                      setNewGuardianName(matched.guardian_name || '');
                      setNewGuardianPhone(matched.guardian_phone || '');
                    }
                  }}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white"
                >
                  <option value="">শিক্ষার্থী সিলেক্ট করুন...</option>
                  {students.map((st: any) => (
                    <option key={st.id} value={st.id}>
                      {st.name_bn} ({st.student_id}) - {st.islamic_department_name_bn || 'বিভাগ'} - রোল {st.roll_number}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">ছুটির ধরন</label>
                  <select
                    value={newLeaveType}
                    onChange={(e) => setNewLeaveType(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white"
                  >
                    <option value="sick">অসুস্থতা (Sick Leave)</option>
                    <option value="family">জরুরি পারিবারিক কাজ</option>
                    <option value="event">সামাজিক অনুষ্ঠান</option>
                    <option value="exam_prep">পরীক্ষার প্রস্তুতি</option>
                    <option value="other">অন্যান্য</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">সম্পর্ক</label>
                  <input
                    type="text"
                    value={newRelationship}
                    onChange={(e) => setNewRelationship(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">শুরুর তারিখ</label>
                  <input
                    type="date"
                    value={newFromDate}
                    onChange={(e) => setNewFromDate(e.target.value)}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">শেষ তারিখ</label>
                  <input
                    type="date"
                    value={newToDate}
                    onChange={(e) => setNewToDate(e.target.value)}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">অভিভাবকের নাম</label>
                  <input
                    type="text"
                    value={newGuardianName}
                    onChange={(e) => setNewGuardianName(e.target.value)}
                    placeholder="পিতার নাম"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">অভিভাবকের ফোন</label>
                  <input
                    type="text"
                    value={newGuardianPhone}
                    onChange={(e) => setNewGuardianPhone(e.target.value)}
                    placeholder="017XXXXXXXX"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">ছুটির সুনির্দিষ্ট কারণ *</label>
                <textarea
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  placeholder="যেমন: তীব্র জ্বর থাকায় ডাক্তারের পরামর্শে ৩ দিনের বিশ্রাম..."
                  rows={2}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewLeaveModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md disabled:opacity-50"
                >
                  {createMutation.isPending ? 'জমা হচ্ছে...' : 'ছুটির আবেদন জমা দিন'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Printable Gate Pass Modal */}
      {activeGatePass && (
        <PrintableGatePass
          gatePass={activeGatePass}
          onClose={() => setActiveGatePass(null)}
        />
      )}

    </AppLayout>
  );
}
