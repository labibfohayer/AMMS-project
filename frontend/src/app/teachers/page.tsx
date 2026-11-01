/* eslint-disable */
'use client';

import { useState, useMemo } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { getMediaUrl } from '@/lib/api';
import { 
  UserCircle, Plus, Search, Calendar, DollarSign, Printer, 
  CheckCircle2, XCircle, Clock, CalendarCheck, CreditCard, 
  Sparkles, Filter, Check, FileText, RefreshCw, AlertCircle, 
  UserCheck, ShieldCheck, Tag, X, ChevronRight, Award,
  Trash2, Edit, Camera
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import { toBanglaDigit, numberToBanglaWords } from '@/lib/numberToBanglaWords';
import PrintableSalarySlip, { SalarySlipData } from '@/components/teachers/PrintableSalarySlip';
import PrintableTeacherIDCard, { TeacherIDCardData } from '@/components/teachers/PrintableTeacherIDCard';
import PrintableServiceBook, { ServiceRecordData } from '@/components/teachers/PrintableServiceBook';

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

export default function Teachers() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const isPrincipal = user && ['principal', 'vice_principal', 'managing_director', 'admin'].includes(user.role);

  // Tab State
  const [activeTab, setActiveTab] = useState<'directory' | 'attendance' | 'salary'>('directory');

  // Tab 1: Directory Search
  const [search, setSearch] = useState('');
  const [staffFilter, setStaffFilter] = useState<'all' | 'teacher' | 'staff'>('all');

  // Tab 2: Attendance Date & State
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [attendanceDate, setAttendanceDate] = useState<string>(todayStr);
  const [attendanceMarks, setAttendanceMarks] = useState<Record<number, { status: string; note: string }>>({});

  // Tab 3: Salary Month & Year
  const [salaryMonth, setSalaryMonth] = useState<number>(new Date().getMonth() + 1);
  const [salaryYear, setSalaryYear] = useState<number>(new Date().getFullYear());

  // Modal: Pay Salary
  const [payModalTeacher, setPayModalTeacher] = useState<any | null>(null);
  const [payAmount, setPayAmount] = useState<string>('');
  const [payDate, setPayDate] = useState<string>(todayStr);
  const [payNote, setPayNote] = useState<string>('');

  // Modal: Printable Pay Slip
  const [activeSalarySlip, setActiveSalarySlip] = useState<SalarySlipData | null>(null);

  // Modal: Teacher PVC ID Card
  const [activeTeacherIDCard, setActiveTeacherIDCard] = useState<TeacherIDCardData[] | null>(null);

  // Modal: Teacher Service Book
  const [activeServiceRecord, setActiveServiceRecord] = useState<ServiceRecordData | null>(null);
  const [isLoadingServiceRecord, setIsLoadingServiceRecord] = useState<boolean>(false);

  // Teacher Edit & Delete Mutations
  const [editingTeacher, setEditingTeacher] = useState<any | null>(null);
  const [editPhotoFile, setEditPhotoFile] = useState<File | null>(null);
  const [editPhotoPreview, setEditPhotoPreview] = useState<string | null>(null);
  const [deletingTeacherId, setDeletingTeacherId] = useState<number | null>(null);

  const handleOpenEditTeacher = (t: any) => {
    setEditingTeacher(t);
    setEditPhotoFile(null);
    setEditPhotoPreview(getMediaUrl(t.photo));
  };

  const deleteTeacherMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/api/teachers/${id}/`);
    },
    onSuccess: () => {
      toast.success('শিক্ষক সফলভাবে তালিকা থেকে বাদ দেওয়া হয়েছে');
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      setDeletingTeacherId(null);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.response?.data?.detail || 'শিক্ষক বাদ দিতে সমস্যা হয়েছে');
      setDeletingTeacherId(null);
    }
  });

  const handleDeleteTeacher = (teacher: any) => {
    if (confirm(`আপনি কি নিশ্চিতভাবে "${teacher.name_bn || teacher.name}" কে মাদ্রাসার তালিকা থেকে বাদ/ডিলিট করতে চান?`)) {
      setDeletingTeacherId(teacher.id);
      deleteTeacherMutation.mutate(teacher.id);
    }
  };

  const updateTeacherMutation = useMutation({
    mutationFn: async (payload: any) => {
      let id: any;
      let body: any;
      let headers: any = {};
      if (payload instanceof FormData) {
        id = payload.get('id');
        payload.delete('id');
        body = payload;
        headers = { 'Content-Type': 'multipart/form-data' };
      } else {
        const { id: teacherId, ...data } = payload;
        id = teacherId;
        body = data;
      }
      const res = await api.patch(`/api/teachers/${id}/`, body, { headers });
      return res.data;
    },
    onSuccess: () => {
      toast.success('শিক্ষকের তথ্য সফলভাবে আপডেট করা হয়েছে');
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      setEditingTeacher(null);
      setEditPhotoFile(null);
      setEditPhotoPreview(null);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.detail || 'তথ্য আপডেট করতে ব্যর্থ হয়েছে');
    }
  });

  // 1. Fetch Teachers List
  const { data: teachers = [], isLoading: isTeachersLoading, refetch: refetchTeachers } = useQuery({
    queryKey: ['teachers'],
    queryFn: async () => {
      const res = await api.get('/api/teachers/');
      return res.data;
    }
  });

  // 2. Fetch Teacher Attendance for Selected Date
  const { 
    data: attendanceData, 
    isLoading: isAttendanceLoading, 
    isFetching: isAttendanceFetching,
    refetch: refetchAttendance 
  } = useQuery({
    queryKey: ['teacher-attendance', attendanceDate],
    queryFn: async () => {
      const res = await api.get(`/api/attendance/teachers/bulk/?date=${attendanceDate}`);
      return res.data;
    },
    enabled: activeTab === 'attendance'
  });

  // Keep attendanceMarks synced when attendanceData loads
  useMemo(() => {
    if (attendanceData?.attendances) {
      const marks: Record<number, { status: string; note: string }> = {};
      attendanceData.attendances.forEach((item: any) => {
        marks[item.teacher_id] = {
          status: item.status || 'present',
          note: item.note || ''
        };
      });
      setAttendanceMarks(marks);
    }
  }, [attendanceData]);

  // 3. Fetch Monthly Salary Sheet
  const { 
    data: salarySheet, 
    isLoading: isSalaryLoading, 
    isFetching: isSalaryFetching,
    refetch: refetchSalary 
  } = useQuery({
    queryKey: ['teacher-salary-sheet', salaryMonth, salaryYear],
    queryFn: async () => {
      const res = await api.get(`/api/teachers/salary-sheet/?month=${salaryMonth}&year=${salaryYear}`);
      return res.data;
    },
    enabled: activeTab === 'salary'
  });

  // Mutation: Save Teacher Attendance
  const saveAttendanceMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post('/api/attendance/teachers/bulk/', payload);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(`${toBanglaDigit(data.count || 0)} জন শিক্ষক ও স্টাফের হাজিরা সংরক্ষিত হয়েছে!`, {
        icon: '✅',
        style: { borderRadius: '12px', background: '#064e3b', color: '#fff' }
      });
      queryClient.invalidateQueries({ queryKey: ['teacher-attendance', attendanceDate] });
      queryClient.invalidateQueries({ queryKey: ['teacher-salary-sheet'] });
    },
    onError: () => {
      toast.error('হাজিরা সংরক্ষণে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    }
  });

  // Mutation: Pay Salary
  const paySalaryMutation = useMutation({
    mutationFn: async ({ teacherId, payload }: { teacherId: number; payload: any }) => {
      const res = await api.post(`/api/teachers/${teacherId}/salary/pay/`, payload);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(`বেতন সফলভাবে পরিশোধিত হয়েছে এবং ক্যাশ খাতায় খরচ যুক্ত হয়েছে!`, {
        icon: '🎉',
        style: { borderRadius: '12px', background: '#064e3b', color: '#fff' }
      });
      setPayModalTeacher(null);
      queryClient.invalidateQueries({ queryKey: ['teacher-salary-sheet', salaryMonth, salaryYear] });
      queryClient.invalidateQueries({ queryKey: ['daily-cashbook'] });
    },
    onError: () => {
      toast.error('বেতন পরিশোধে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    }
  });

  // Handlers
  const handleMarkAll = (status: 'present' | 'absent') => {
    if (!attendanceData?.attendances) return;
    const newMarks: Record<number, { status: string; note: string }> = {};
    attendanceData.attendances.forEach((t: any) => {
      newMarks[t.teacher_id] = {
        status,
        note: attendanceMarks[t.teacher_id]?.note || ''
      };
    });
    setAttendanceMarks(newMarks);
    toast.success(status === 'present' ? 'সবাইকে উপস্থিত মার্ক করা হয়েছে' : 'সবাইকে অনুপস্থিত মার্ক করা হয়েছে');
  };

  const handleSaveAttendance = () => {
    if (!attendanceData?.attendances) return;
    const payloadAttendances = attendanceData.attendances.map((t: any) => ({
      teacher_id: t.teacher_id,
      status: attendanceMarks[t.teacher_id]?.status || 'present',
      note: attendanceMarks[t.teacher_id]?.note || ''
    }));

    saveAttendanceMutation.mutate({
      date: attendanceDate,
      attendances: payloadAttendances
    });
  };

  const handleOpenPayModal = (teacherItem: any) => {
    setPayModalTeacher(teacherItem);
    setPayAmount(String(teacherItem.monthly_salary || 0));
    setPayDate(todayStr);
    setPayNote(`${MONTH_OPTIONS.find(m => m.value === salaryMonth)?.label} মাসের সম্মানী`);
  };

  const handleSubmitPaySalary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payModalTeacher) return;
    const amt = parseFloat(payAmount);
    if (isNaN(amt) || amt <= 0) {
      toast.error('সঠিক টাকার পরিমাণ দিন');
      return;
    }

    paySalaryMutation.mutate({
      teacherId: payModalTeacher.id,
      payload: {
        month: salaryMonth,
        year: salaryYear,
        amount: amt,
        paid_date: payDate,
        note: payNote.trim()
      }
    });
  };

  const handleOpenSalarySlip = (teacherItem: any) => {
    const monthLabel = MONTH_OPTIONS.find(m => m.value === salaryMonth)?.label || `${salaryMonth}`;
    const slipData: SalarySlipData = {
      teacher_id_code: teacherItem.teacher_id,
      teacher_name: teacherItem.name,
      teacher_name_bn: teacherItem.name_bn,
      designation: teacherItem.designation,
      designation_bn: teacherItem.designation_bn,
      phone: teacherItem.phone,
      month: salaryMonth,
      month_name: monthLabel,
      year: salaryYear,
      monthly_salary: teacherItem.monthly_salary,
      allowance: 0,
      deduction: 0,
      net_amount: teacherItem.payment?.amount || teacherItem.monthly_salary,
      paid_date: teacherItem.payment?.paid_date || todayStr,
      note: teacherItem.payment?.note || `${monthLabel} মাসের নিয়মিত সম্মানী`,
      paid_by: teacherItem.payment?.paid_by || (user?.name || 'অধ্যক্ষ মহোদয়'),
      attendance_summary: {
        present_days: teacherItem.attendance?.present_days || 0,
        absent_days: teacherItem.attendance?.absent_days || 0,
        leave_days: teacherItem.attendance?.leave_days || 0,
        late_days: teacherItem.attendance?.late_days || 0,
      }
    };
    setActiveSalarySlip(slipData);
  };

  // Filtered Directory Teachers
  const filteredTeachers = useMemo(() => {
    return teachers.filter((t: any) => {
      const matchesSearch = 
        t.name?.toLowerCase().includes(search.toLowerCase()) || 
        (t.name_bn && t.name_bn.includes(search)) || 
        t.phone?.includes(search) ||
        t.teacher_id?.toLowerCase().includes(search.toLowerCase());
      
      const matchesStaff = staffFilter === 'all' 
        ? true 
        : staffFilter === 'teacher' 
          ? (t.staff_type === 'teacher' || !t.staff_type)
          : (t.staff_type !== 'teacher');

      return matchesSearch && matchesStaff;
    });
  }, [teachers, search, staffFilter]);

  // ID Card & Service Book Handlers
  const handleOpenIDCard = (t: any) => {
    setActiveTeacherIDCard([{
      id: t.id,
      teacher_id: t.teacher_id,
      name: t.name,
      name_bn: t.name_bn || t.name,
      phone: t.phone,
      photo: t.photo,
      designation: t.designation,
      designation_bn: t.designation_bn || t.designation,
      staff_type: t.staff_type,
      qualification: t.qualification,
      joining_date: t.joining_date,
      monthly_salary: t.monthly_salary,
      address: t.address,
      nid: t.nid,
      blood_group: t.blood_group || 'B+',
    }]);
  };

  const handleOpenBulkIDCards = () => {
    if (filteredTeachers.length === 0) return;
    setActiveTeacherIDCard(filteredTeachers.map((t: any) => ({
      id: t.id,
      teacher_id: t.teacher_id,
      name: t.name,
      name_bn: t.name_bn || t.name,
      phone: t.phone,
      photo: t.photo,
      designation: t.designation,
      designation_bn: t.designation_bn || t.designation,
      staff_type: t.staff_type,
      qualification: t.qualification,
      joining_date: t.joining_date,
      monthly_salary: t.monthly_salary,
      address: t.address,
      nid: t.nid,
      blood_group: t.blood_group || 'B+',
    })));
  };

  const handleOpenServiceBook = async (teacherId: number) => {
    setIsLoadingServiceRecord(true);
    try {
      const res = await api.get(`/api/teachers/${teacherId}/service-record/`);
      setActiveServiceRecord(res.data);
    } catch (err) {
      toast.error('সার্ভিস বুক লোড করতে সমস্যা হয়েছে।');
    } finally {
      setIsLoadingServiceRecord(false);
    }
  };

  return (
    <AppLayout title="শিক্ষক ও স্টাফ">
      {/* 🖨️ PRINT STYLES */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
            font-size: 10pt !important;
          }
          nav, header, aside, .no-print, button, input {
            display: none !important;
          }
          .print-salary-register {
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
            border: 1px solid #222 !important;
            padding: 4px 6px !important;
            font-size: 9.5pt !important;
          }
        }
      `}</style>

      <div className="space-y-6 max-w-7xl mx-auto">
        
        {/* 🌟 Header Banner */}
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-[#02200d] text-white p-6 rounded-3xl shadow-xl relative overflow-hidden border border-emerald-500/20 no-print">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-semibold mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>আল-মদিনা মডেল মাদ্রাসা এন্ড রিসার্চ ইনস্টিটিউট</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                শিক্ষক ও স্টাফ ডিজিটাল হাজিরা ও বেতন-ভাতা শিট
              </h1>
              <p className="text-emerald-200/80 text-xs sm:text-sm mt-1 max-w-2xl">
                শিক্ষক ও কর্মচারীদের দৈনিক উপস্থিতি ট্র্যাক করুন, মাসিক সম্মানী শিট প্রস্তুত করুন এবং ১-ক্লিকে পে-স্লিপ প্রিন্ট করুন।
              </p>
            </div>

            {/* Quick Action Navigation Tabs */}
            <div className="flex flex-wrap bg-black/40 p-1.5 rounded-2xl border border-white/10 backdrop-blur-md">
              <button
                onClick={() => setActiveTab('directory')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'directory'
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-emerald-950 shadow-md scale-102'
                    : 'text-emerald-200 hover:text-white'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>স্টাফ ডিরেক্টরি ({toBanglaDigit(teachers.length)})</span>
              </button>

              <button
                onClick={() => setActiveTab('attendance')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'attendance'
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-emerald-950 shadow-md scale-102'
                    : 'text-emerald-200 hover:text-white'
                }`}
              >
                <CalendarCheck className="w-4 h-4" />
                <span>ডিজিটাল হাজিরা</span>
              </button>

              <button
                onClick={() => setActiveTab('salary')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'salary'
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-emerald-950 shadow-md scale-102'
                    : 'text-emerald-200 hover:text-white'
                }`}
              >
                <DollarSign className="w-4 h-4" />
                <span>বেতন-ভাতা শিট</span>
              </button>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════
            TAB 1: STAFF DIRECTORY
        ══════════════════════════════════════════════════════════ */}
        {activeTab === 'directory' && (
          <div className="space-y-6 no-print">
            
            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-3.5 top-3 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="নাম, আইডি বা মোবাইল নম্বর দিয়ে খুঁজুন..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                  <button
                    onClick={() => setStaffFilter('all')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${staffFilter === 'all' ? 'bg-white shadow-sm text-emerald-900 font-bold' : 'text-slate-600'}`}
                  >
                    সকল ({toBanglaDigit(teachers.length)})
                  </button>
                  <button
                    onClick={() => setStaffFilter('teacher')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${staffFilter === 'teacher' ? 'bg-white shadow-sm text-emerald-900 font-bold' : 'text-slate-600'}`}
                  >
                    শিক্ষকবৃন্দ
                  </button>
                  <button
                    onClick={() => setStaffFilter('staff')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${staffFilter === 'staff' ? 'bg-white shadow-sm text-emerald-900 font-bold' : 'text-slate-600'}`}
                  >
                    কর্মচারী
                  </button>
                </div>

                <button
                  onClick={handleOpenBulkIDCards}
                  disabled={filteredTeachers.length === 0}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black shadow-md transition-all shrink-0 active:scale-95"
                >
                  <Award size={15} />
                  <span>🪪 সকলের আইডি কার্ড প্রিন্ট</span>
                </button>

                {isPrincipal && (
                  <Link
                    href="/teachers/add"
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md transition-all shrink-0"
                  >
                    <Plus size={16} />
                    <span>নতুন শিক্ষক যোগ</span>
                  </Link>
                )}
              </div>
            </div>

            {/* Teachers Card Grid */}
            {isTeachersLoading ? (
              <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl shadow-sm border border-slate-200">
                <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-600 rounded-full animate-spin mb-3" />
                <p className="text-slate-500 text-xs font-medium">শিক্ষক ও কর্মচারীদের তথ্য লোড হচ্ছে...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredTeachers.map((t: any) => {
                  const isChiefPrincipal = 
                    t.designation?.toLowerCase().includes('principal') || 
                    t.name_bn?.includes('ফারুক') || 
                    t.designation_bn?.includes('অধ্যক্ষ');
                  const photoUrl = isChiefPrincipal 
                    ? '/principal.jpg' 
                    : (t.photo ? getMediaUrl(t.photo) : null);

                  return (
                    <div
                      key={t.id}
                      className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/90 hover:shadow-md hover:border-emerald-500/40 transition-all flex flex-col justify-between relative overflow-hidden group"
                    >
                      {isChiefPrincipal && (
                        <div className="absolute top-0 right-0 bg-amber-400 text-emerald-950 text-[10px] font-black px-3 py-0.5 rounded-bl-xl shadow-xs">
                          অধ্যক্ষ ও মুহতামিম
                        </div>
                      )}

                      <div className="flex items-start gap-4">
                        {photoUrl ? (
                          <img
                            src={photoUrl}
                            alt={t.name}
                            className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-600/30 shadow-md shrink-0"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
                            <UserCircle size={36} />
                          </div>
                        )}

                        <div className="flex-1 overflow-hidden">
                          <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                            {t.teacher_id}
                          </span>
                          <h4 className="font-extrabold text-slate-900 text-base mt-1 truncate">
                            {t.name_bn || t.name}
                          </h4>
                          <p className="text-xs text-emerald-700 font-semibold truncate">
                            {t.designation_bn || t.designation || 'শিক্ষক'}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-1 font-mono">
                            📞 {toBanglaDigit(t.phone)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 block">মাসিক সম্মানী</span>
                          <span className="font-black text-slate-800 text-sm">
                            ৳ {toBanglaDigit(Number(t.monthly_salary || 0).toLocaleString('en-IN'))}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 flex-wrap justify-end">
                          <button
                            onClick={() => handleOpenIDCard(t)}
                            title="ডিজিটাল পিভিসি আইডি কার্ড প্রিন্ট"
                            className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 text-[11px] font-bold border border-amber-300 transition-all flex items-center gap-1 active:scale-95"
                          >
                            <span>🪪</span>
                            <span>আইডি কার্ড</span>
                          </button>

                          <button
                            onClick={() => handleOpenServiceBook(t.id)}
                            title="অফিসিয়াল সার্ভিস বুক ও রেকর্ড শিট"
                            disabled={isLoadingServiceRecord}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-200 transition-all flex items-center gap-1 active:scale-95"
                          >
                            <span>📋</span>
                            <span>সার্ভিস বুক</span>
                          </button>

                          <button
                            onClick={() => {
                              setActiveTab('salary');
                              setSalaryMonth(new Date().getMonth() + 1);
                            }}
                            className="px-2 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-[11px] font-semibold border border-slate-200 transition-all"
                          >
                            বেতন
                          </button>

                          {isPrincipal && (
                            <>
                              <button
                                onClick={() => handleOpenEditTeacher(t)}
                                title="শিক্ষকের তথ্য সম্পাদনা করুন"
                                className="px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 text-[11px] font-bold border border-blue-200 transition-all flex items-center gap-1 active:scale-95"
                              >
                                <Edit size={12} />
                                <span>এডিট</span>
                              </button>

                              <button
                                onClick={() => handleDeleteTeacher(t)}
                                disabled={deletingTeacherId === t.id}
                                title="শিক্ষক মাদ্রাসার তালিকা থেকে বাদ দিন"
                                className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold border border-rose-200 transition-all flex items-center gap-1 active:scale-95 disabled:opacity-50"
                              >
                                <Trash2 size={12} />
                                <span>বাদ দিন</span>
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            TAB 2: DIGITAL TEACHER ATTENDANCE
        ══════════════════════════════════════════════════════════ */}
        {activeTab === 'attendance' && (
          <div className="space-y-6 no-print">
            
            {/* Control Bar & Stats */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                
                {/* Date Controls */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    <input
                      type="date"
                      value={attendanceDate}
                      onChange={(e) => setAttendanceDate(e.target.value)}
                      className="bg-transparent text-xs sm:text-sm font-bold text-slate-800 focus:outline-none cursor-pointer"
                    />
                  </div>
                  <button
                    onClick={() => setAttendanceDate(todayStr)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      attendanceDate === todayStr ? 'bg-emerald-700 text-white shadow-sm' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    আজ
                  </button>
                </div>

                {/* Bulk Actions */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleMarkAll('present')}
                    className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold transition-all"
                  >
                    সবাইকে উপস্থিত করুন
                  </button>
                  <button
                    onClick={() => handleMarkAll('absent')}
                    className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 text-xs font-bold transition-all"
                  >
                    সবাইকে অনুপস্থিত করুন
                  </button>
                  <button
                    onClick={handleSaveAttendance}
                    disabled={saveAttendanceMutation.isPending}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs sm:text-sm font-extrabold shadow-md transition-all active:scale-95 disabled:opacity-50"
                  >
                    {saveAttendanceMutation.isPending ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>সংরক্ষণ হচ্ছে...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>হাজিরা সংরক্ষণ করুন</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Attendance Mini Stat Chips */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 border-t border-slate-100">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-500 font-bold block">মোট স্টাফ</span>
                  <span className="text-lg font-black text-slate-800">
                    {toBanglaDigit(attendanceData?.total_teachers || teachers.length)} জন
                  </span>
                </div>
                <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200 text-center">
                  <span className="text-[10px] text-emerald-700 font-bold block">উপস্থিত</span>
                  <span className="text-lg font-black text-emerald-700">
                    {toBanglaDigit(attendanceData?.present_count || 0)} জন
                  </span>
                </div>
                <div className="bg-rose-50/70 p-3 rounded-xl border border-rose-200 text-center">
                  <span className="text-[10px] text-rose-700 font-bold block">অনুপস্থিত</span>
                  <span className="text-lg font-black text-rose-700">
                    {toBanglaDigit(attendanceData?.absent_count || 0)} জন
                  </span>
                </div>
                <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200 text-center">
                  <span className="text-[10px] text-amber-700 font-bold block">বিলম্বে (Late)</span>
                  <span className="text-lg font-black text-amber-700">
                    {toBanglaDigit(attendanceData?.late_count || 0)} জন
                  </span>
                </div>
                <div className="bg-blue-50/70 p-3 rounded-xl border border-blue-200 text-center">
                  <span className="text-[10px] text-blue-700 font-bold block">ছুটিতে (Leave)</span>
                  <span className="text-lg font-black text-blue-700">
                    {toBanglaDigit(attendanceData?.leave_count || 0)} জন
                  </span>
                </div>
              </div>
            </div>

            {/* Attendance Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/80 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">শিক্ষক ও স্টাফ তথ্য</th>
                      <th className="px-4 py-3">পদবী</th>
                      <th className="px-4 py-3 text-center">হাজিরা স্ট্যাটাস</th>
                      <th className="px-4 py-3">মন্তব্য / কারণ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {attendanceData?.attendances?.map((item: any) => {
                      const currentStatus = attendanceMarks[item.teacher_id]?.status || 'present';
                      const currentNote = attendanceMarks[item.teacher_id]?.note || '';

                      return (
                        <tr key={item.teacher_id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="font-extrabold text-slate-900 text-sm">{item.name_bn || item.name}</div>
                            <div className="text-[11px] font-mono text-slate-400">
                              আইডি: {item.code} • 📞 {toBanglaDigit(item.phone)}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-semibold text-emerald-800 text-xs">
                              {item.designation_bn || item.designation}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-1.5">
                              {/* Present */}
                              <button
                                type="button"
                                onClick={() => setAttendanceMarks(prev => ({
                                  ...prev,
                                  [item.teacher_id]: { ...prev[item.teacher_id], status: 'present' }
                                }))}
                                className={`px-2.5 py-1.5 rounded-lg font-bold text-xs transition-all flex items-center gap-1 ${
                                  currentStatus === 'present'
                                    ? 'bg-emerald-600 text-white shadow-sm'
                                    : 'bg-slate-100 text-slate-600 hover:bg-emerald-50'
                                }`}
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>উপস্থিত</span>
                              </button>

                              {/* Absent */}
                              <button
                                type="button"
                                onClick={() => setAttendanceMarks(prev => ({
                                  ...prev,
                                  [item.teacher_id]: { ...prev[item.teacher_id], status: 'absent' }
                                }))}
                                className={`px-2.5 py-1.5 rounded-lg font-bold text-xs transition-all flex items-center gap-1 ${
                                  currentStatus === 'absent'
                                    ? 'bg-rose-600 text-white shadow-sm'
                                    : 'bg-slate-100 text-slate-600 hover:bg-rose-50'
                                }`}
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>অনুপস্থিত</span>
                              </button>

                              {/* Late */}
                              <button
                                type="button"
                                onClick={() => setAttendanceMarks(prev => ({
                                  ...prev,
                                  [item.teacher_id]: { ...prev[item.teacher_id], status: 'late' }
                                }))}
                                className={`px-2.5 py-1.5 rounded-lg font-bold text-xs transition-all flex items-center gap-1 ${
                                  currentStatus === 'late'
                                    ? 'bg-amber-500 text-emerald-950 font-black shadow-sm'
                                    : 'bg-slate-100 text-slate-600 hover:bg-amber-50'
                                }`}
                              >
                                <Clock className="w-3.5 h-3.5" />
                                <span>লেট</span>
                              </button>

                              {/* Leave */}
                              <button
                                type="button"
                                onClick={() => setAttendanceMarks(prev => ({
                                  ...prev,
                                  [item.teacher_id]: { ...prev[item.teacher_id], status: 'leave' }
                                }))}
                                className={`px-2.5 py-1.5 rounded-lg font-bold text-xs transition-all flex items-center gap-1 ${
                                  currentStatus === 'leave'
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'bg-slate-100 text-slate-600 hover:bg-blue-50'
                                }`}
                              >
                                <span>ছুটি</span>
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              value={currentNote}
                              onChange={(e) => setAttendanceMarks(prev => ({
                                ...prev,
                                [item.teacher_id]: { ...prev[item.teacher_id], note: e.target.value }
                              }))}
                              placeholder="বিশেষ কোনো মন্তব্য বা কারণ..."
                              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            TAB 3: MONTHLY SALARY SHEET & REGISTER
        ══════════════════════════════════════════════════════════ */}
        {activeTab === 'salary' && (
          <div className="space-y-6 no-print">
            
            {/* Month & Year Selection Bar */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">বেতনের মাস:</label>
                  <select
                    value={salaryMonth}
                    onChange={(e) => setSalaryMonth(Number(e.target.value))}
                    className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {MONTH_OPTIONS.map(m => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">সাল:</label>
                  <select
                    value={salaryYear}
                    onChange={(e) => setSalaryYear(Number(e.target.value))}
                    className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {[2025, 2026, 2027].map(y => (
                      <option key={y} value={y}>{toBanglaDigit(y)}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-emerald-950 font-black text-xs sm:text-sm shadow-md transition-all active:scale-95"
                >
                  <Printer className="w-4 h-4" />
                  <span>বেতন শিট প্রিন্ট করুন</span>
                </button>
                <button
                  onClick={() => refetchSalary()}
                  className={`p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all ${
                    isSalaryFetching ? 'animate-spin text-emerald-600' : ''
                  }`}
                  title="রিফ্রেশ করুন"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Salary Executive Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              
              {/* Total Budget */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80">
                <span className="text-xs font-bold text-slate-500">মোট মাসিক বেতন বাজেট</span>
                <div className="text-2xl font-black text-slate-800 mt-1">
                  ৳ {toBanglaDigit(Number(salarySheet?.total_budget || 0).toLocaleString('en-IN'))}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  মোট {toBanglaDigit(salarySheet?.total_staff || teachers.length)} জন শিক্ষক ও স্টাফ
                </p>
              </div>

              {/* Total Paid */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-emerald-200">
                <span className="text-xs font-bold text-emerald-700">পরিশোধিত সম্মানী</span>
                <div className="text-2xl font-black text-emerald-700 mt-1">
                  ৳ {toBanglaDigit(Number(salarySheet?.total_paid || 0).toLocaleString('en-IN'))}
                </div>
                <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                  {toBanglaDigit(salarySheet?.paid_count || 0)} জনের বেতন পরিশোধ সম্পন্ন
                </p>
              </div>

              {/* Total Due */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-amber-200">
                <span className="text-xs font-bold text-amber-700">বকেয়া সম্মানী</span>
                <div className="text-2xl font-black text-amber-600 mt-1">
                  ৳ {toBanglaDigit(Number(salarySheet?.total_due || 0).toLocaleString('en-IN'))}
                </div>
                <p className="text-[11px] text-amber-600 font-semibold mt-1">
                  {toBanglaDigit(salarySheet?.unpaid_count || 0)} জনের সম্মানী প্রদেয় আছে
                </p>
              </div>

            </div>

            {/* Staff Salary Register Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/90 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">শিক্ষক ও কর্মচারীর নাম</th>
                      <th className="px-4 py-3">পদবী</th>
                      <th className="px-4 py-3 text-right">মূল বেতন (৳)</th>
                      <th className="px-4 py-3 text-center">হাজিরা সামারি</th>
                      <th className="px-4 py-3 text-center">পরিশোধ স্ট্যাটাস</th>
                      <th className="px-4 py-3 text-right">কার্যক্রম (Action)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {salarySheet?.teachers?.map((t: any) => {
                      const isPaid = t.payment?.is_paid;

                      return (
                        <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="font-extrabold text-slate-900 text-sm">{t.name_bn || t.name}</div>
                            <div className="text-[11px] font-mono text-slate-400">
                              আইডি: {t.teacher_id} • 📞 {toBanglaDigit(t.phone)}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-semibold text-emerald-800 text-xs">
                              {t.designation_bn || t.designation}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-black text-slate-800 text-sm">
                            ৳ {toBanglaDigit(Number(t.monthly_salary).toLocaleString('en-IN'))}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="inline-block px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[11px] border border-emerald-200">
                              উপস্থিত: {toBanglaDigit(t.attendance?.present_days || 0)} দিন
                            </span>
                            {Number(t.attendance?.absent_days) > 0 && (
                              <span className="inline-block ml-1 px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 font-bold text-[10px]">
                                অনুপস্থিত: {toBanglaDigit(t.attendance.absent_days)}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center whitespace-nowrap">
                            {isPaid ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-200">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>পরিশোধিত</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 font-bold text-xs border border-rose-200">
                                <Clock className="w-3.5 h-3.5" />
                                <span>বকেয়া</span>
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right whitespace-nowrap">
                            {isPaid ? (
                              <button
                                onClick={() => handleOpenSalarySlip(t)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-300 transition-all shadow-xs"
                              >
                                <Printer className="w-3.5 h-3.5" />
                                <span>পে-স্লিপ প্রিন্ট</span>
                              </button>
                            ) : (
                              isPrincipal && (
                                <button
                                  onClick={() => handleOpenPayModal(t)}
                                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs shadow-sm transition-all active:scale-95"
                                >
                                  <CreditCard className="w-3.5 h-3.5" />
                                  <span>বেতন পরিশোধ</span>
                                </button>
                              )
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            🖨️ OFFICIAL FULL SALARY REGISTER (A4 LANDSCAPE PRINT)
        ══════════════════════════════════════════════════════════ */}
        <div className="hidden print:block print-salary-register bg-white p-6 text-black">
          {/* Header */}
          <div className="text-center pb-4 border-b-2 border-black mb-4">
            <div className="flex items-center justify-center gap-4 mb-2">
              <img src="/logo.jpg" alt="Logo" className="w-16 h-16 object-contain rounded-full border border-black" />
              <div>
                <h1 className="text-2xl font-black">আল-মদিনা মডেল মাদ্রাসা এন্ড রিসার্চ ইনস্টিটিউট</h1>
                <p className="text-xs font-semibold">ক-৭৫/২, মহাখালী দক্ষিণ পাড়া, বনানী, ঢাকা | ০১৭১২-৬৩০২৬৪</p>
                <div className="inline-block mt-1 px-4 py-0.5 border border-black rounded-full font-black text-xs uppercase">
                  শিক্ষক ও স্টাফ মাসিক বেতন ও সম্মানী রেজিস্টার শিট
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center text-xs mt-2 font-bold px-2">
              <span>মাস: {MONTH_OPTIONS.find(m => m.value === salaryMonth)?.label} {toBanglaDigit(salaryYear)}</span>
              <span>মোট বাজেট: ৳ {toBanglaDigit(Number(salarySheet?.total_budget || 0).toLocaleString('en-IN'))}</span>
              <span>প্রিন্ট সময়: {new Date().toLocaleTimeString('bn-BD')}</span>
            </div>
          </div>

          {/* Full Table */}
          <table className="w-full text-xs border border-black mb-6">
            <thead>
              <tr className="bg-gray-200 font-bold text-center">
                <th className="p-2 border border-black">ক্র.</th>
                <th className="p-2 border border-black text-left">শিক্ষক/স্টাফের নাম</th>
                <th className="p-2 border border-black text-left">পদবী</th>
                <th className="p-2 border border-black text-right">মূল বেতন (৳)</th>
                <th className="p-2 border border-black text-center">উপস্থিত দিন</th>
                <th className="p-2 border border-black text-center">স্ট্যাটাস</th>
                <th className="p-2 border border-black text-right">প্রদেয় টাকা (৳)</th>
                <th className="p-2 border border-black text-center">গ্রহীতার স্বাক্ষর</th>
              </tr>
            </thead>
            <tbody>
              {salarySheet?.teachers?.map((t: any, idx: number) => (
                <tr key={t.id} className="text-center">
                  <td className="p-1.5 border border-black font-bold">{toBanglaDigit(idx + 1)}</td>
                  <td className="p-1.5 border border-black text-left font-bold">{t.name_bn || t.name}</td>
                  <td className="p-1.5 border border-black text-left">{t.designation_bn || t.designation}</td>
                  <td className="p-1.5 border border-black text-right font-black">
                    {toBanglaDigit(Number(t.monthly_salary).toLocaleString('en-IN'))}
                  </td>
                  <td className="p-1.5 border border-black">{toBanglaDigit(t.attendance?.present_days || 0)} দিন</td>
                  <td className="p-1.5 border border-black font-semibold">
                    {t.payment?.is_paid ? 'পরিশোধিত' : 'বকেয়া'}
                  </td>
                  <td className="p-1.5 border border-black text-right font-black">
                    ৳ {toBanglaDigit(Number(t.payment?.amount || t.monthly_salary).toLocaleString('en-IN'))}
                  </td>
                  <td className="p-1.5 border border-black"></td>
                </tr>
              ))}
              <tr className="bg-gray-100 font-black text-sm">
                <td colSpan={3} className="p-2 border border-black text-right">সর্বমোট বাজেট:</td>
                <td className="p-2 border border-black text-right">
                  ৳ {toBanglaDigit(Number(salarySheet?.total_budget || 0).toLocaleString('en-IN'))}
                </td>
                <td colSpan={2} className="p-2 border border-black text-right">পরিশোধিত:</td>
                <td className="p-2 border border-black text-right text-emerald-800">
                  ৳ {toBanglaDigit(Number(salarySheet?.total_paid || 0).toLocaleString('en-IN'))}
                </td>
                <td className="p-2 border border-black"></td>
              </tr>
            </tbody>
          </table>

          {/* Endorsements */}
          <div className="mt-16 pt-8 grid grid-cols-3 text-center text-xs font-bold gap-8">
            <div>
              <div className="border-t border-black pt-1">হিসাবরক্ষক স্বাক্ষর ও তারিখ</div>
              <p className="text-[10px] text-gray-600 mt-0.5">আল-মদিনা মডেল মাদ্রাসা</p>
            </div>
            <div>
              <div className="border-t border-black pt-1">নিরীক্ষক / কোষাধ্যক্ষ</div>
              <p className="text-[10px] text-gray-600 mt-0.5">মাদ্রাসার অডিট কমিটি</p>
            </div>
            <div>
              <div className="border-t border-black pt-1 font-black">অধ্যক্ষ ও মুহতামিম</div>
              <p className="text-[10px] text-gray-800 font-bold mt-0.5">মাওলানা ওমর ফারুক মুজাহিদী</p>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════
            💳 MODAL: PAY SALARY MODAL
        ══════════════════════════════════════════════════════════ */}
        {payModalTeacher && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn no-print">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
              
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-[#02200d] text-white p-5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-400 text-emerald-950 flex items-center justify-center font-bold">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold">শিক্ষক বেতন পরিশোধ</h3>
                    <p className="text-xs text-emerald-200/80">
                      {MONTH_OPTIONS.find(m => m.value === salaryMonth)?.label} {salaryYear}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setPayModalTeacher(null)}
                  className="p-1 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmitPaySalary} className="p-6 space-y-4">
                
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold block">শিক্ষকের নাম ও পদবী:</span>
                  <div className="text-sm font-extrabold text-slate-900">
                    {payModalTeacher.name_bn || payModalTeacher.name}
                  </div>
                  <div className="text-xs text-emerald-700 font-semibold">
                    {payModalTeacher.designation_bn || payModalTeacher.designation} (আইডি: {payModalTeacher.teacher_id})
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    পরিশোধের টাকার পরিমাণ (৳) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400 font-bold">৳</span>
                    <input
                      type="number"
                      step="0.01"
                      value={payAmount}
                      onChange={(e) => setPayAmount(e.target.value)}
                      className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-black text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      required
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    নির্ধারিত মূল বেতন: ৳ {toBanglaDigit(Number(payModalTeacher.monthly_salary).toLocaleString('en-IN'))}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    পরিশোধের তারিখ <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={payDate}
                    onChange={(e) => setPayDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    বিশেষ নোট বা মন্তব্য
                  </label>
                  <input
                    type="text"
                    value={payNote}
                    onChange={(e) => setPayNote(e.target.value)}
                    placeholder="যেমন: অক্টোবর মাসের নিয়মিত সম্মানী"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    বেতন পরিশোধ করার সাথে সাথে স্বয়ংক্রিয়ভাবে মাদ্রাসার <strong>দৈনিক ক্যাশ খাতায়</strong> একটি বেতন ভাউচার সংরক্ষিত হবে।
                  </span>
                </div>

                <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setPayModalTeacher(null)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    disabled={paySalaryMutation.isPending}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white text-xs sm:text-sm font-extrabold shadow-md transition-all disabled:opacity-50"
                  >
                    {paySalaryMutation.isPending ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>সংরক্ষণ হচ্ছে...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>পরিশোধ নিশ্চিত করুন</span>
                      </>
                    )}
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            🖨️ MODAL: PRINTABLE SALARY SLIP POPUP
        ══════════════════════════════════════════════════════════ */}
        {activeSalarySlip && (
          <PrintableSalarySlip
            slip={activeSalarySlip}
            onClose={() => setActiveSalarySlip(null)}
          />
        )}

        {/* TEACHER PVC ID CARD MODAL */}
        {activeTeacherIDCard && (
          <PrintableTeacherIDCard
            teachers={activeTeacherIDCard}
            onClose={() => setActiveTeacherIDCard(null)}
          />
        )}

        {/* TEACHER SERVICE RECORD MODAL */}
        {activeServiceRecord && (
          <PrintableServiceBook
            data={activeServiceRecord}
            onClose={() => setActiveServiceRecord(null)}
          />
        )}

        {/* EDIT TEACHER MODAL */}
        {editingTeacher && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-emerald-100 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-800">
                    <Edit size={18} />
                  </div>
                  <div>
                    <h3 className="font-black text-gray-900 text-base">শিক্ষকের তথ্য সম্পাদনা</h3>
                    <p className="text-xs text-gray-500 font-mono">আইডি: {editingTeacher.teacher_id}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingTeacher(null)}
                  className="p-1.5 rounded-xl hover:bg-slate-100 text-gray-400 hover:text-gray-700"
                >
                  <X size={18} />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.currentTarget;
                  if (editPhotoFile) {
                    const fd = new FormData();
                    fd.append('id', String(editingTeacher.id));
                    fd.append('name', (form.elements.namedItem('name') as HTMLInputElement).value);
                    fd.append('name_bn', (form.elements.namedItem('name_bn') as HTMLInputElement).value);
                    fd.append('phone', (form.elements.namedItem('phone') as HTMLInputElement).value);
                    fd.append('designation', (form.elements.namedItem('designation') as HTMLInputElement).value);
                    fd.append('designation_bn', (form.elements.namedItem('designation_bn') as HTMLInputElement).value);
                    fd.append('monthly_salary', (form.elements.namedItem('monthly_salary') as HTMLInputElement).value);
                    fd.append('qualification', (form.elements.namedItem('qualification') as HTMLInputElement).value);
                    fd.append('address', (form.elements.namedItem('address') as HTMLTextAreaElement).value);
                    fd.append('photo', editPhotoFile);
                    updateTeacherMutation.mutate(fd);
                  } else {
                    const payload = {
                      id: editingTeacher.id,
                      name: (form.elements.namedItem('name') as HTMLInputElement).value,
                      name_bn: (form.elements.namedItem('name_bn') as HTMLInputElement).value,
                      phone: (form.elements.namedItem('phone') as HTMLInputElement).value,
                      designation: (form.elements.namedItem('designation') as HTMLInputElement).value,
                      designation_bn: (form.elements.namedItem('designation_bn') as HTMLInputElement).value,
                      monthly_salary: (form.elements.namedItem('monthly_salary') as HTMLInputElement).value,
                      qualification: (form.elements.namedItem('qualification') as HTMLInputElement).value,
                      address: (form.elements.namedItem('address') as HTMLTextAreaElement).value,
                    };
                    updateTeacherMutation.mutate(payload);
                  }
                }}
                className="space-y-3.5 text-xs sm:text-sm"
              >
                {/* Teacher Photo Preview & Upload */}
                <div className="p-3 bg-emerald-50/50 rounded-2xl border border-emerald-100 flex items-center gap-3">
                  <div className="relative group shrink-0">
                    {editPhotoPreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={editPhotoPreview}
                        alt="শিক্ষকের ছবি"
                        className="w-16 h-16 rounded-xl object-cover border-2 border-emerald-500 shadow-xs"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-slate-400">
                        <UserCircle size={28} />
                        <span className="text-[9px] font-bold">ছবি নেই</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <span className="block text-xs font-bold text-slate-800">শিক্ষক/স্টাফের ছবি</span>
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs cursor-pointer transition">
                      <Camera size={14} className="text-amber-300" />
                      <span>{editPhotoPreview ? 'ছবি পরিবর্তন' : 'ছবি যোগ করুন'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 5 * 1024 * 1024) {
                              toast.error('ছবির সাইজ সর্বোচ্চ ৫ মেগাবাইট (5MB) হতে পারবে');
                              return;
                            }
                            setEditPhotoFile(file);
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setEditPhotoPreview(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                    {editPhotoFile && (
                      <span className="text-[10px] text-emerald-700 block font-semibold">নতুন ছবি নির্বাচিত হয়েছে</span>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">নাম (বাংলা)</label>
                  <input
                    type="text"
                    name="name_bn"
                    defaultValue={editingTeacher.name_bn || editingTeacher.name}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">নাম (English)</label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={editingTeacher.name}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-slate-50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">পদবী (বাংলা)</label>
                    <input
                      type="text"
                      name="designation_bn"
                      defaultValue={editingTeacher.designation_bn || editingTeacher.designation}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">পদবী (English)</label>
                    <input
                      type="text"
                      name="designation"
                      defaultValue={editingTeacher.designation}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-slate-50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">মোবাইল নম্বর</label>
                    <input
                      type="text"
                      name="phone"
                      defaultValue={editingTeacher.phone}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-slate-50 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">মাসিক সম্মানী (৳)</label>
                    <input
                      type="number"
                      name="monthly_salary"
                      defaultValue={editingTeacher.monthly_salary}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-slate-50 font-mono font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">শিক্ষাগত যোগ্যতা</label>
                  <input
                    type="text"
                    name="qualification"
                    defaultValue={editingTeacher.qualification}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">ঠিকানা</label>
                  <textarea
                    name="address"
                    defaultValue={editingTeacher.address}
                    rows={2}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-slate-50"
                  />
                </div>

                <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setEditingTeacher(null)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    disabled={updateTeacherMutation.isPending}
                    className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold transition shadow-md disabled:opacity-50"
                  >
                    {updateTeacherMutation.isPending ? 'সংরক্ষণ হচ্ছে...' : 'আপডেট সংরক্ষণ করুন'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Floating Add Teacher Button (for Principal) */}
        {isPrincipal && activeTab === 'directory' && (
          <Link
            href="/teachers/add"
            className="fixed bottom-[88px] md:bottom-8 right-4 md:right-8 w-14 h-14 bg-emerald-700 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-900/30 hover:bg-emerald-800 hover:scale-105 transition-all z-40"
            title="নতুন শিক্ষক বা স্টাফ যোগ করুন"
          >
            <Plus size={24} />
          </Link>
        )}

      </div>
    </AppLayout>
  );
}

