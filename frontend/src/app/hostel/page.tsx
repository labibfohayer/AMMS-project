/* eslint-disable */
'use client';

import { useState, useMemo } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { 
  Building, Bed, Users, Utensils, Moon, Coffee, Soup, Plus, 
  Search, CheckCircle2, XCircle, AlertCircle, Calendar, RefreshCw, 
  Printer, Sparkles, UserPlus, Check, X, Tag, DollarSign, ArrowRight
} from 'lucide-react';
import { toBanglaDigit } from '@/lib/numberToBanglaWords';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function HostelPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isPrincipal = user && ['principal', 'vice_principal', 'managing_director', 'admin', 'teacher'].includes(user.role);

  // Tab State
  const [activeTab, setActiveTab] = useState<'rooms' | 'meals' | 'curfew' | 'food_costs'>('rooms');

  // Dates
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [mealDate, setMealDate] = useState<string>(todayStr);
  const [curfewDate, setCurfewDate] = useState<string>(todayStr);

  // Modals
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [targetRoom, setTargetRoom] = useState<any | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');

  const [isAddRoomModalOpen, setIsAddRoomModalOpen] = useState(false);
  const [newRoomNumber, setNewRoomNumber] = useState('');
  const [newRoomNumberBn, setNewRoomNumberBn] = useState('');
  const [newRoomCapacity, setNewRoomCapacity] = useState('15');

  // Local state for meals edits
  const [mealEdits, setMealEdits] = useState<Record<number, { breakfast: boolean; lunch: boolean; dinner: boolean; note: string }>>({});

  // Local state for curfew edits
  const [curfewEdits, setCurfewEdits] = useState<Record<number, { present: boolean; note: string }>>({});

  // 1. Fetch Hostel Rooms & Occupants
  const { data: rooms = [], isLoading: isRoomsLoading, refetch: refetchRooms } = useQuery({
    queryKey: ['hostel-rooms'],
    queryFn: async () => {
      const res = await api.get('/api/hostel/rooms/');
      return res.data;
    }
  });

  // 2. Fetch All Students (for room assignment)
  const { data: allStudents = [] } = useQuery({
    queryKey: ['students-all'],
    queryFn: async () => {
      const res = await api.get('/api/students/');
      return res.data;
    }
  });

  // 3. Fetch Daily Meals
  const { 
    data: mealsData, 
    isLoading: isMealsLoading, 
    isFetching: isMealsFetching,
    refetch: refetchMeals 
  } = useQuery({
    queryKey: ['hostel-meals', mealDate],
    queryFn: async () => {
      const res = await api.get(`/api/hostel/meals/?date=${mealDate}`);
      return res.data;
    },
    enabled: activeTab === 'meals'
  });

  // Sync meals local state
  useMemo(() => {
    if (mealsData?.students) {
      const map: Record<number, { breakfast: boolean; lunch: boolean; dinner: boolean; note: string }> = {};
      mealsData.students.forEach((s: any) => {
        map[s.id] = {
          breakfast: s.breakfast ?? true,
          lunch: s.lunch ?? true,
          dinner: s.dinner ?? true,
          note: s.note || ''
        };
      });
      setMealEdits(map);
    }
  }, [mealsData]);

  // 4. Fetch Curfew Attendance
  const { 
    data: curfewData, 
    isLoading: isCurfewLoading, 
    isFetching: isCurfewFetching,
    refetch: refetchCurfew 
  } = useQuery({
    queryKey: ['hostel-curfew', curfewDate],
    queryFn: async () => {
      const res = await api.get(`/api/hostel/curfew/?date=${curfewDate}`);
      return res.data;
    },
    enabled: activeTab === 'curfew'
  });

  // Sync curfew local state
  useMemo(() => {
    if (curfewData?.records) {
      const map: Record<number, { present: boolean; note: string }> = {};
      curfewData.records.forEach((s: any) => {
        map[s.id] = {
          present: s.present ?? true,
          note: s.note || ''
        };
      });
      setCurfewEdits(map);
    }
  }, [curfewData]);

  // 5. Fetch Food Cost Summary
  const currentMonth = useMemo(() => new Date().getMonth() + 1, []);
  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const [costMonth, setCostMonth] = useState(currentMonth);
  const [costYear, setCostYear] = useState(currentYear);

  const { data: foodCosts, isLoading: isFoodLoading, refetch: refetchFood } = useQuery({
    queryKey: ['hostel-food-costs', costMonth, costYear],
    queryFn: async () => {
      const res = await api.get(`/api/hostel/food-costs/?month=${costMonth}&year=${costYear}`);
      return res.data;
    },
    enabled: activeTab === 'food_costs'
  });

  // Mutations
  const assignRoomMutation = useMutation({
    mutationFn: async ({ roomId, studentId }: { roomId: number; studentId: number }) => {
      const res = await api.post(`/api/hostel/${roomId}/assign/`, { student_id: studentId });
      return res.data;
    },
    onSuccess: () => {
      toast.success('শিক্ষার্থীকে সফলভাবে রুমে বরাদ্দ করা হয়েছে!', {
        icon: '✅',
        style: { borderRadius: '12px', background: '#064e3b', color: '#fff' }
      });
      setIsAssignModalOpen(false);
      setSelectedStudentId('');
      queryClient.invalidateQueries({ queryKey: ['hostel-rooms'] });
      queryClient.invalidateQueries({ queryKey: ['hostel-meals'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'রুম বরাদ্দে ত্রুটি হয়েছে');
    }
  });

  const unassignRoomMutation = useMutation({
    mutationFn: async ({ roomId, studentId }: { roomId: number; studentId: number }) => {
      const res = await api.post(`/api/hostel/${roomId}/unassign/`, { student_id: studentId });
      return res.data;
    },
    onSuccess: () => {
      toast.success('রুম থেকে শিক্ষার্থীকে অব্যাহতি দেওয়া হয়েছে');
      queryClient.invalidateQueries({ queryKey: ['hostel-rooms'] });
      queryClient.invalidateQueries({ queryKey: ['hostel-meals'] });
    }
  });

  const saveMealsMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post('/api/hostel/meals/', payload);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(`${toBanglaDigit(data.count || 0)} জন আবাসিক ছাত্রের মিল তথ্য সংরক্ষিত হয়েছে!`, {
        icon: '🍽️',
        style: { borderRadius: '12px', background: '#064e3b', color: '#fff' }
      });
      queryClient.invalidateQueries({ queryKey: ['hostel-meals', mealDate] });
      queryClient.invalidateQueries({ queryKey: ['hostel-food-costs'] });
    },
    onError: () => toast.error('মিল সংরক্ষণ ব্যর্থ হয়েছে')
  });

  const saveCurfewMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post('/api/hostel/curfew/', payload);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(`নাইট কার্ফিউ হাজিরা সংরক্ষিত হয়েছে!`, {
        icon: '🌙',
        style: { borderRadius: '12px', background: '#064e3b', color: '#fff' }
      });
      queryClient.invalidateQueries({ queryKey: ['hostel-curfew', curfewDate] });
    },
    onError: () => toast.error('হাজিরা সংরক্ষণ ব্যর্থ হয়েছে')
  });

  const addRoomMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post('/api/hostel/rooms/', payload);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(`নতুন রুম #${data.room_number} যুক্ত হয়েছে!`);
      setIsAddRoomModalOpen(false);
      setNewRoomNumber('');
      setNewRoomNumberBn('');
      setNewRoomCapacity('15');
      queryClient.invalidateQueries({ queryKey: ['hostel-rooms'] });
    },
    onError: () => toast.error('রুম তৈরিতে সমস্যা হয়েছে')
  });

  // Aggregated Room Stats
  const totalRoomsCount = rooms.length;
  const totalCapacity = rooms.reduce((acc: number, r: any) => acc + (r.capacity || 0), 0);
  const totalOccupied = rooms.reduce((acc: number, r: any) => acc + (r.current_occupancy || 0), 0);
  const totalAvailable = totalCapacity - totalOccupied;

  // Unassigned Students (for room allocation modal)
  const availableStudentsForRoom = useMemo(() => {
    return allStudents.filter((s: any) => !s.hostel_room);
  }, [allStudents]);

  return (
    <AppLayout title="হোস্টেল ও মেস ম্যানেজমেন্ট">
      
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
          .print-hostel-register {
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
            padding: 4px 6px !important;
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
                হোস্টেল ও মেস ম্যানেজমেন্ট সিস্টেম
              </h1>
              <p className="text-emerald-200/80 text-xs sm:text-sm mt-1 max-w-2xl">
                আবাসিক ছাত্রদের রুম ও সিট বরাদ্দ, দৈনিক ৩ বেলার মিল ট্র্যাকার, নাইট কার্ফিউ হাজিরা এবং মেস খাদ্য খরচের নির্ভুল হিসাব।
              </p>
            </div>

            {/* Quick Action Tabs */}
            <div className="flex flex-wrap bg-black/40 p-1.5 rounded-2xl border border-white/10 backdrop-blur-md">
              <button
                onClick={() => setActiveTab('rooms')}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'rooms'
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-emerald-950 shadow-md scale-102'
                    : 'text-emerald-200 hover:text-white'
                }`}
              >
                <Bed className="w-4 h-4" />
                <span>রুম ও সিট ({toBanglaDigit(totalRoomsCount)})</span>
              </button>

              <button
                onClick={() => setActiveTab('meals')}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'meals'
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-emerald-950 shadow-md scale-102'
                    : 'text-emerald-200 hover:text-white'
                }`}
              >
                <Utensils className="w-4 h-4" />
                <span>৩ বেলার মিল শিট</span>
              </button>

              <button
                onClick={() => setActiveTab('curfew')}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'curfew'
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-emerald-950 shadow-md scale-102'
                    : 'text-emerald-200 hover:text-white'
                }`}
              >
                <Moon className="w-4 h-4" />
                <span>নাইট কার্ফিউ</span>
              </button>

              <button
                onClick={() => setActiveTab('food_costs')}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'food_costs'
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-emerald-950 shadow-md scale-102'
                    : 'text-emerald-200 hover:text-white'
                }`}
              >
                <DollarSign className="w-4 h-4" />
                <span>মেস খাদ্য খরচ</span>
              </button>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════
            TAB 1: ROOMS & SEATS ALLOCATION
        ══════════════════════════════════════════════════════════ */}
        {activeTab === 'rooms' && (
          <div className="space-y-6 no-print">
            
            {/* Top Stat Overview */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
                <span className="text-xs font-bold text-slate-500">মোট হোস্টেল রুম</span>
                <div className="text-2xl font-black text-slate-800 mt-1">
                  {toBanglaDigit(totalRoomsCount)} টি
                </div>
                <p className="text-[11px] text-slate-400 mt-1">সক্রিয় আবাসিক শাখা</p>
              </div>

              <div className="bg-white rounded-2xl p-5 shadow-sm border border-blue-100">
                <span className="text-xs font-bold text-blue-700">মোট সিট ধারণক্ষমতা</span>
                <div className="text-2xl font-black text-blue-700 mt-1">
                  {toBanglaDigit(totalCapacity)} টি সিট
                </div>
                <p className="text-[11px] text-blue-600 mt-1">পর্যাপ্ত আবাসন ব্যবস্থা</p>
              </div>

              <div className="bg-white rounded-2xl p-5 shadow-sm border border-emerald-100">
                <span className="text-xs font-bold text-emerald-700">বর্তমান আবাসিক শিক্ষার্থী</span>
                <div className="text-2xl font-black text-emerald-700 mt-1">
                  {toBanglaDigit(totalOccupied)} জন
                </div>
                <p className="text-[11px] text-emerald-600 mt-1">হোস্টেলে অবস্থানরত</p>
              </div>

              <div className="bg-white rounded-2xl p-5 shadow-sm border border-amber-100">
                <span className="text-xs font-bold text-amber-700">খালি সিট রয়েছে</span>
                <div className="text-2xl font-black text-amber-600 mt-1">
                  {toBanglaDigit(totalAvailable)} টি সিট
                </div>
                <p className="text-[11px] text-amber-600 mt-1">নতুন শিক্ষার্থী বরাদ্দযোগ্য</p>
              </div>
            </div>

            {/* Room Actions Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Building className="w-5 h-5 text-emerald-700" />
                <span>হোস্টেল রুম ও ছাত্র বরাদ্দ তালিকা</span>
              </h3>

              {isPrincipal && (
                <button
                  onClick={() => setIsAddRoomModalOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>নতুন রুম যুক্ত করুন</span>
                </button>
              )}
            </div>

            {/* Room Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rooms.map((room: any) => {
                const occupancyPct = Math.round((room.current_occupancy / (room.capacity || 1)) * 100);

                return (
                  <div
                    key={room.id}
                    className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/90 hover:shadow-md hover:border-emerald-500/40 transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Room Banner */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-black border border-emerald-100 text-lg">
                            <Bed className="w-6 h-6" />
                          </div>
                          <div>
                            <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                              {room.room_number}
                            </span>
                            <h4 className="font-extrabold text-slate-900 text-base mt-0.5">
                              {room.room_number_bn || room.room_number}
                            </h4>
                          </div>
                        </div>

                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${
                          room.available_space > 0 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          {room.available_space > 0 ? `${toBanglaDigit(room.available_space)} সিট খালি` : 'রুম পূর্ণ'}
                        </span>
                      </div>

                      {/* Capacity Progress Bar */}
                      <div className="space-y-1 mb-5">
                        <div className="flex justify-between text-[11px] font-semibold text-slate-600">
                          <span>সিট পূর্ণতা:</span>
                          <span className="font-bold text-slate-800">
                            {toBanglaDigit(room.current_occupancy)} / {toBanglaDigit(room.capacity)} ({toBanglaDigit(occupancyPct)}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              occupancyPct >= 100 ? 'bg-rose-500' : occupancyPct >= 70 ? 'bg-amber-500' : 'bg-emerald-600'
                            }`}
                            style={{ width: `${Math.min(100, occupancyPct)}%` }}
                          />
                        </div>
                      </div>

                      {/* Occupants List */}
                      <div className="space-y-2 mb-4">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                          আবাসিক শিক্ষার্থী তালিকা ({toBanglaDigit(room.students?.length || 0)} জন)
                        </span>

                        {room.students && room.students.length > 0 ? (
                          <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto pr-1">
                            {room.students.map((st: any) => (
                              <div key={st.id} className="py-2 flex items-center justify-between text-xs group">
                                <div>
                                  <div className="font-bold text-slate-800">
                                    {st.name_bn || st.name}
                                  </div>
                                  <div className="text-[10px] text-slate-400">
                                    রোল: {toBanglaDigit(st.roll_number || '০')} • {st.department}
                                  </div>
                                </div>

                                {isPrincipal && (
                                  <button
                                    onClick={() => unassignRoomMutation.mutate({ roomId: room.id, studentId: st.id })}
                                    className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors opacity-70 group-hover:opacity-100"
                                    title="রুম থেকে সরান"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400 italic py-4 text-center bg-slate-50 rounded-xl">
                            এই রুমে বর্তমানে কোনো শিক্ষার্থী বরাদ্দ নেই
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Bottom Assign Button */}
                    {isPrincipal && (
                      <button
                        onClick={() => {
                          setTargetRoom(room);
                          setIsAssignModalOpen(true);
                        }}
                        disabled={room.available_space <= 0}
                        className="w-full mt-2 py-2.5 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 text-xs font-bold transition-all border border-slate-200 flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:pointer-events-none"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>শিক্ষার্থী বরাদ্দ করুন</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            TAB 2: DAILY 3-MEAL TRACKER
        ══════════════════════════════════════════════════════════ */}
        {activeTab === 'meals' && (
          <div className="space-y-6 no-print">
            
            {/* Control Bar & Date */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                
                {/* Date Controls */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    <input
                      type="date"
                      value={mealDate}
                      onChange={(e) => setMealDate(e.target.value)}
                      className="bg-transparent text-xs sm:text-sm font-bold text-slate-800 focus:outline-none cursor-pointer"
                    />
                  </div>
                  <button
                    onClick={() => setMealDate(todayStr)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      mealDate === todayStr ? 'bg-emerald-700 text-white shadow-sm' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    আজ
                  </button>
                </div>

                {/* Bulk Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (!mealsData?.students) return;
                      const allOn: Record<number, any> = {};
                      mealsData.students.forEach((s: any) => {
                        allOn[s.id] = { breakfast: true, lunch: true, dinner: true, note: mealEdits[s.id]?.note || '' };
                      });
                      setMealEdits(allOn);
                      toast.success('সবাইকে ৩ বেলা মিল মার্ক করা হয়েছে');
                    }}
                    className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold transition-all"
                  >
                    সবাইকে ৩ বেলা মিল দিন
                  </button>

                  <button
                    onClick={() => {
                      if (!mealsData?.students) return;
                      const payload = mealsData.students.map((s: any) => ({
                        student_id: s.id,
                        breakfast: mealEdits[s.id]?.breakfast ?? true,
                        lunch: mealEdits[s.id]?.lunch ?? true,
                        dinner: mealEdits[s.id]?.dinner ?? true,
                        note: mealEdits[s.id]?.note || ''
                      }));
                      saveMealsMutation.mutate({ date: mealDate, meals: payload });
                    }}
                    disabled={saveMealsMutation.isPending}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs sm:text-sm font-extrabold shadow-md transition-all active:scale-95 disabled:opacity-50"
                  >
                    {saveMealsMutation.isPending ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>সংরক্ষণ হচ্ছে...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>মিল শিট সংরক্ষণ করুন</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Meal Mini Stat Counters */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 border-t border-slate-100">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-500 font-bold block">মোট আবাসিক ছাত্র</span>
                  <span className="text-lg font-black text-slate-800">
                    {toBanglaDigit(mealsData?.total_residential_students || 0)} জন
                  </span>
                </div>
                <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200 text-center">
                  <span className="text-[10px] text-amber-700 font-bold block">🍳 সকালের নাস্তা</span>
                  <span className="text-lg font-black text-amber-700">
                    {toBanglaDigit(mealsData?.total_breakfast || 0)} টি
                  </span>
                </div>
                <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200 text-center">
                  <span className="text-[10px] text-emerald-700 font-bold block">🍲 দুপুরের খানা</span>
                  <span className="text-lg font-black text-emerald-700">
                    {toBanglaDigit(mealsData?.total_lunch || 0)} টি
                  </span>
                </div>
                <div className="bg-indigo-50/70 p-3 rounded-xl border border-indigo-200 text-center">
                  <span className="text-[10px] text-indigo-700 font-bold block">🌙 রাতের খানা</span>
                  <span className="text-lg font-black text-indigo-700">
                    {toBanglaDigit(mealsData?.total_dinner || 0)} টি
                  </span>
                </div>
                <div className="bg-gradient-to-br from-emerald-900 to-teal-950 p-3 rounded-xl text-white text-center shadow-sm">
                  <span className="text-[10px] text-emerald-200 font-bold block">সর্বমোট মিল সংখ্যা</span>
                  <span className="text-lg font-black text-amber-300">
                    {toBanglaDigit(mealsData?.total_meals_count || 0)} টি
                  </span>
                </div>
              </div>
            </div>

            {/* Meals Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/80 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">শিক্ষার্থীর বিবরণ</th>
                      <th className="px-4 py-3">হোস্টেল রুম</th>
                      <th className="px-4 py-3 text-center">🍳 সকাল</th>
                      <th className="px-4 py-3 text-center">🍲 দুপুর</th>
                      <th className="px-4 py-3 text-center">🌙 রাত</th>
                      <th className="px-4 py-3 text-center">মোট মিল</th>
                      <th className="px-4 py-3">মন্তব্য / কারণ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {mealsData?.students?.map((s: any) => {
                      const cur = mealEdits[s.id] || { breakfast: true, lunch: true, dinner: true, note: '' };
                      const sumMeals = (cur.breakfast ? 1 : 0) + (cur.lunch ? 1 : 0) + (cur.dinner ? 1 : 0);

                      return (
                        <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="font-extrabold text-slate-900 text-sm">{s.name_bn || s.name}</div>
                            <div className="text-[11px] font-mono text-slate-400">
                              রোল: {toBanglaDigit(s.roll_number || '০')} • {s.department || s.student_id}
                            </div>
                          </td>

                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="inline-block px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold text-xs border border-emerald-200">
                              {s.room_number_bn || s.room_number}
                            </span>
                          </td>

                          {/* Breakfast Toggle */}
                          <td className="px-4 py-3 text-center">
                            <button
                              type="button"
                              onClick={() => setMealEdits(prev => ({
                                ...prev,
                                [s.id]: { ...prev[s.id], breakfast: !prev[s.id]?.breakfast }
                              }))}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                cur.breakfast 
                                  ? 'bg-amber-400 text-emerald-950 font-black shadow-xs' 
                                  : 'bg-slate-100 text-slate-400 hover:bg-amber-50'
                              }`}
                            >
                              {cur.breakfast ? '✓ নাস্তা' : '✕ বন্ধ'}
                            </button>
                          </td>

                          {/* Lunch Toggle */}
                          <td className="px-4 py-3 text-center">
                            <button
                              type="button"
                              onClick={() => setMealEdits(prev => ({
                                ...prev,
                                [s.id]: { ...prev[s.id], lunch: !prev[s.id]?.lunch }
                              }))}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                cur.lunch 
                                  ? 'bg-emerald-600 text-white shadow-xs' 
                                  : 'bg-slate-100 text-slate-400 hover:bg-emerald-50'
                              }`}
                            >
                              {cur.lunch ? '✓ দুপুর' : '✕ বন্ধ'}
                            </button>
                          </td>

                          {/* Dinner Toggle */}
                          <td className="px-4 py-3 text-center">
                            <button
                              type="button"
                              onClick={() => setMealEdits(prev => ({
                                ...prev,
                                [s.id]: { ...prev[s.id], dinner: !prev[s.id]?.dinner }
                              }))}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                cur.dinner 
                                  ? 'bg-indigo-600 text-white shadow-xs' 
                                  : 'bg-slate-100 text-slate-400 hover:bg-indigo-50'
                              }`}
                            >
                              {cur.dinner ? '✓ রাত' : '✕ বন্ধ'}
                            </button>
                          </td>

                          {/* Total Meals */}
                          <td className="px-4 py-3 text-center font-black text-sm whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded-full ${
                              sumMeals === 3 ? 'bg-emerald-100 text-emerald-800' : sumMeals > 0 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {toBanglaDigit(sumMeals)} টি
                            </span>
                          </td>

                          {/* Note */}
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              value={cur.note || ''}
                              onChange={(e) => setMealEdits(prev => ({
                                ...prev,
                                [s.id]: { ...prev[s.id], note: e.target.value }
                              }))}
                              placeholder="বিশেষ মন্তব্য বা ছুটি..."
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
            TAB 3: NIGHT CURFEW ATTENDANCE
        ══════════════════════════════════════════════════════════ */}
        {activeTab === 'curfew' && (
          <div className="space-y-6 no-print">
            
            {/* Control Bar */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
                  <Moon className="w-4 h-4 text-indigo-600" />
                  <input
                    type="date"
                    value={curfewDate}
                    onChange={(e) => setCurfewDate(e.target.value)}
                    className="bg-transparent text-xs sm:text-sm font-bold text-slate-800 focus:outline-none cursor-pointer"
                  />
                </div>
                <span className="text-xs text-slate-500 font-semibold">
                  (এশার নামাজের পর রাত্রিকালীন হাজিরা)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (!curfewData?.records) return;
                    const allPres: Record<number, any> = {};
                    curfewData.records.forEach((s: any) => {
                      allPres[s.id] = { present: true, note: curfewEdits[s.id]?.note || '' };
                    });
                    setCurfewEdits(allPres);
                    toast.success('সবাইকে উপস্থিত মার্ক করা হয়েছে');
                  }}
                  className="px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-800 text-xs font-bold transition-all"
                >
                  সবাইকে উপস্থিত করুন
                </button>

                <button
                  onClick={() => {
                    if (!curfewData?.records) return;
                    const payload = curfewData.records.map((s: any) => ({
                      student_id: s.id,
                      present: curfewEdits[s.id]?.present ?? true,
                      note: curfewEdits[s.id]?.note || ''
                    }));
                    saveCurfewMutation.mutate({ date: curfewDate, records: payload });
                  }}
                  disabled={saveCurfewMutation.isPending}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1B4332] hover:bg-[#132A20] text-white text-xs sm:text-sm font-extrabold shadow-sm transition-all active:scale-95 disabled:opacity-50"
                >
                  {saveCurfewMutation.isPending ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>সংরক্ষণ হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>কার্ফিউ হাজিরা সংরক্ষণ</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Curfew Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/80 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">শিক্ষার্থীর নাম</th>
                      <th className="px-4 py-3">হোস্টেল রুম</th>
                      <th className="px-4 py-3 text-center">উপস্থিতি স্ট্যাটাস</th>
                      <th className="px-4 py-3">ছুটি / বিশেষ কারণ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {curfewData?.records?.map((s: any) => {
                      const cur = curfewEdits[s.id] || { present: true, note: '' };

                      return (
                        <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="font-extrabold text-slate-900 text-sm">{s.name_bn || s.name}</div>
                            <div className="text-[11px] font-mono text-slate-400">রোল: {toBanglaDigit(s.roll_number || '০')}</div>
                          </td>
                          <td className="px-4 py-3 font-semibold text-emerald-800">
                            {s.room_number}
                          </td>
                          <td className="px-4 py-3 text-center whitespace-nowrap">
                            <div className="inline-flex rounded-xl p-1 bg-slate-100 border border-slate-200">
                              <button
                                type="button"
                                onClick={() => setCurfewEdits(prev => ({
                                  ...prev,
                                  [s.id]: { ...prev[s.id], present: true }
                                }))}
                                className={`px-3 py-1 rounded-lg font-bold text-xs transition-all ${
                                  cur.present ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-500'
                                }`}
                              >
                                ✓ রুমে উপস্থিত
                              </button>
                              <button
                                type="button"
                                onClick={() => setCurfewEdits(prev => ({
                                  ...prev,
                                  [s.id]: { ...prev[s.id], present: false }
                                }))}
                                className={`px-3 py-1 rounded-lg font-bold text-xs transition-all ${
                                  !cur.present ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-500'
                                }`}
                              >
                                ✕ বাইরে / ছুটিতে
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              value={cur.note || ''}
                              onChange={(e) => setCurfewEdits(prev => ({
                                ...prev,
                                [s.id]: { ...prev[s.id], note: e.target.value }
                              }))}
                              placeholder="যেমন: অভিভাবকের সাথে বাড়ি গেছে..."
                              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
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
            TAB 4: MESS FOOD EXPENSES & MEAL RATE
        ══════════════════════════════════════════════════════════ */}
        {activeTab === 'food_costs' && (
          <div className="space-y-6 no-print">
            
            {/* Top Month Selector */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-600">হিসাব মাস:</span>
                <select
                  value={costMonth}
                  onChange={(e) => setCostMonth(Number(e.target.value))}
                  className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {[
                    { value: 1, label: 'জানুয়ারি' }, { value: 2, label: 'ফেব্রুয়ারি' }, { value: 3, label: 'মার্চ' },
                    { value: 4, label: 'এপ্রিল' }, { value: 5, label: 'মে' }, { value: 6, label: 'জুন' },
                    { value: 7, label: 'জুলাই' }, { value: 8, label: 'আগস্ট' }, { value: 9, label: 'সেপ্টেম্বর' },
                    { value: 10, label: 'অক্টোবর' }, { value: 11, label: 'নভেম্বর' }, { value: 12, label: 'ডিসেম্বর' },
                  ].map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>

                <select
                  value={costYear}
                  onChange={(e) => setCostYear(Number(e.target.value))}
                  className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {[2025, 2026, 2027].map(y => (
                    <option key={y} value={y}>{toBanglaDigit(y)}</option>
                  ))}
                </select>
              </div>

              <Link
                href="/reports"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-sm transition-all"
              >
                <span>ক্যাশ খাতায় নতুন খাদ্য খরচ যুক্ত করুন</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Food Cost Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
                <span className="text-xs font-bold text-slate-500">মোট মেস খাদ্য খরচ</span>
                <div className="text-2xl font-black text-rose-600 mt-1">
                  ৳ {toBanglaDigit(Number(foodCosts?.total_food_cost || 0).toLocaleString('en-IN'))}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">চাল, ডাল, মাছ, মাংস ও বাজার ব্যয়</p>
              </div>

              <div className="bg-white rounded-2xl p-5 shadow-sm border border-emerald-200">
                <span className="text-xs font-bold text-emerald-700">মোট পরিবেশিত মিল</span>
                <div className="text-2xl font-black text-emerald-700 mt-1">
                  {toBanglaDigit(foodCosts?.total_meals_served || 0)} টি
                </div>
                <p className="text-[11px] text-emerald-600 mt-1">
                  সকাল: {toBanglaDigit(foodCosts?.total_breakfast || 0)} • দুপুর: {toBanglaDigit(foodCosts?.total_lunch || 0)} • রাত: {toBanglaDigit(foodCosts?.total_dinner || 0)}
                </p>
              </div>

              <div className="bg-white rounded-2xl p-5 shadow-sm border border-amber-200">
                <span className="text-xs font-bold text-amber-700">গড় প্রতি মিল রেট (Cost/Meal)</span>
                <div className="text-2xl font-black text-amber-600 mt-1">
                  ৳ {toBanglaDigit(foodCosts?.cost_per_meal || '০.০০')}
                </div>
                <p className="text-[11px] text-amber-600 mt-1">প্রতি মিলের বাস্তবিক খরচ</p>
              </div>
            </div>

            {/* Expense Vouchers Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-700">
                খাদ্য সামগ্রী ক্রয়ের অনুমোদিত ভাউচার তালিকা ({foodCosts?.month_name} {toBanglaDigit(costYear)})
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-2.5">ভাউচার নং</th>
                      <th className="px-4 py-2.5">ক্রয় বিবরণ</th>
                      <th className="px-4 py-2.5">তারিখ</th>
                      <th className="px-4 py-2.5">বাজারকারী / মাধ্যম</th>
                      <th className="px-4 py-2.5 text-right">খরচ (৳)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {foodCosts?.expenses && foodCosts.expenses.length > 0 ? (
                      foodCosts.expenses.map((exp: any) => (
                        <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-4 py-2.5 font-mono font-bold text-rose-800 bg-rose-50/50">
                            {exp.voucher_number}
                          </td>
                          <td className="px-4 py-2.5 font-semibold text-slate-800">
                            {exp.title}
                            {exp.note && <span className="block text-[10px] text-slate-400">{exp.note}</span>}
                          </td>
                          <td className="px-4 py-2.5 text-slate-600">
                            {toBanglaDigit(exp.expense_date)}
                          </td>
                          <td className="px-4 py-2.5 text-slate-700 font-medium">
                            {exp.spent_by || 'মেস পরিচালক'}
                          </td>
                          <td className="px-4 py-2.5 text-right font-black text-rose-600">
                            ৳ {toBanglaDigit(Number(exp.amount).toLocaleString('en-IN'))}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-400 italic">
                          এই মাসে কোনো খাদ্য সামগ্রীর খরচ রেকর্ড নেই
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            🖨️ PRINTABLE A4 HOSTEL REGISTER
        ══════════════════════════════════════════════════════════ */}
        <div className="hidden print:block print-hostel-register bg-white p-6 text-black">
          {/* Header */}
          <div className="text-center pb-4 border-b-2 border-black mb-4">
            <div className="flex items-center justify-center gap-4 mb-2">
              <img src="/logo.jpg" alt="Logo" className="w-16 h-16 object-contain rounded-full border border-black" />
              <div>
                <h1 className="text-2xl font-black">আল-মদিনা মডেল মাদ্রাসা এন্ড রিসার্চ ইনস্টিটিউট</h1>
                <p className="text-xs font-semibold">ক-৭৫/২, মহাখালী দক্ষিণ পাড়া, বনানী, ঢাকা | ০১৭১২-৬৩০২৬৪</p>
                <div className="inline-block mt-1 px-4 py-0.5 border border-black rounded-full font-black text-xs uppercase">
                  হোস্টেল ও আবাসিক শিক্ষার্থী রুম ও মিল রেজিস্টার শিট
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center text-xs mt-2 font-bold px-2">
              <span>তারিখ: {mealDate}</span>
              <span>মোট আবাসিক শিক্ষার্থী: {toBanglaDigit(totalOccupied)} জন</span>
              <span>প্রিন্ট সময়: {new Date().toLocaleTimeString('bn-BD')}</span>
            </div>
          </div>

          {/* Roster Table */}
          <table className="w-full text-xs border border-black mb-6">
            <thead>
              <tr className="bg-gray-200 font-bold text-center">
                <th className="p-2 border border-black">ক্র.</th>
                <th className="p-2 border border-black text-left">শিক্ষার্থীর নাম</th>
                <th className="p-2 border border-black text-left">রোল ও বিভাগ</th>
                <th className="p-2 border border-black text-center">রুম নং</th>
                <th className="p-2 border border-black text-center">সকাল</th>
                <th className="p-2 border border-black text-center">দুপুর</th>
                <th className="p-2 border border-black text-center">রাত</th>
                <th className="p-2 border border-black text-center">কার্ফিউ</th>
                <th className="p-2 border border-black text-center">স্বাক্ষর / রিমার্ক</th>
              </tr>
            </thead>
            <tbody>
              {mealsData?.students?.map((s: any, idx: number) => {
                const cur = mealEdits[s.id] || { breakfast: true, lunch: true, dinner: true };
                return (
                  <tr key={s.id} className="text-center">
                    <td className="p-1.5 border border-black font-bold">{toBanglaDigit(idx + 1)}</td>
                    <td className="p-1.5 border border-black text-left font-bold">{s.name_bn || s.name}</td>
                    <td className="p-1.5 border border-black text-left">রোল: {toBanglaDigit(s.roll_number)} • {s.department}</td>
                    <td className="p-1.5 border border-black font-semibold">{s.room_number}</td>
                    <td className="p-1.5 border border-black">{cur.breakfast ? '✓' : '✕'}</td>
                    <td className="p-1.5 border border-black">{cur.lunch ? '✓' : '✕'}</td>
                    <td className="p-1.5 border border-black">{cur.dinner ? '✓' : '✕'}</td>
                    <td className="p-1.5 border border-black">উপস্থিত</td>
                    <td className="p-1.5 border border-black"></td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Endorsements */}
          <div className="mt-16 pt-8 grid grid-cols-2 text-center text-xs font-bold gap-8">
            <div>
              <div className="border-t border-black pt-1">হোস্টেল তত্ত্বাবধায়ক ও মেস পরিচালক</div>
              <p className="text-[10px] text-gray-600 mt-0.5">আল-মদিনা মডেল মাদ্রাসা হোস্টেল</p>
            </div>
            <div>
              <div className="border-t border-black pt-1 font-black">অধ্যক্ষ ও মুহতামিম</div>
              <p className="text-[10px] text-gray-800 font-bold mt-0.5">মাওলানা ওমর ফারুক মুজাহিদী</p>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════
            ➕ MODAL: ASSIGN STUDENT TO ROOM
        ══════════════════════════════════════════════════════════ */}
        {isAssignModalOpen && targetRoom && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn no-print">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
              <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-[#02200d] text-white p-5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-400 text-emerald-950 flex items-center justify-center font-bold">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold">রুমে শিক্ষার্থী বরাদ্দ করুন</h3>
                    <p className="text-xs text-emerald-200/80">{targetRoom.room_number_bn || targetRoom.room_number}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAssignModalOpen(false)}
                  className="p-1 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    শিক্ষার্থী নির্বাচন করুন <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="">-- শিক্ষার্থী বাছাই করুন --</option>
                    {availableStudentsForRoom.map((st: any) => (
                      <option key={st.id} value={st.id}>
                        {st.name_bn || st.name} (রোল: {st.roll_number}, আইডি: {st.student_id})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900">
                  রুমের খালি সিট: <strong>{toBanglaDigit(targetRoom.available_space)} টি</strong>। শিক্ষার্থীকে বরাদ্দ করার সাথে সাথে তিনি আবাসিক হিসেবে অন্তর্ভুক্ত হবেন।
                </div>

                <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setIsAssignModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                  >
                    বাতিল
                  </button>
                  <button
                    type="button"
                    disabled={!selectedStudentId || assignRoomMutation.isPending}
                    onClick={() => {
                      if (!selectedStudentId) return;
                      assignRoomMutation.mutate({
                        roomId: targetRoom.id,
                        studentId: Number(selectedStudentId)
                      });
                    }}
                    className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md transition-all disabled:opacity-50"
                  >
                    {assignRoomMutation.isPending ? 'বরাদ্দ হচ্ছে...' : 'বরাদ্দ নিশ্চিত করুন'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            ➕ MODAL: ADD NEW HOSTEL ROOM
        ══════════════════════════════════════════════════════════ */}
        {isAddRoomModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn no-print">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
              <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-[#02200d] text-white p-5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-400 text-emerald-950 flex items-center justify-center font-bold">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold">নতুন হোস্টেল রুম যোগ করুন</h3>
                    <p className="text-xs text-emerald-200/80">ক্যাম্পাস আবাসন শাখা</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAddRoomModalOpen(false)}
                  className="p-1 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newRoomNumber.trim()) return;
                  addRoomMutation.mutate({
                    room_number: newRoomNumber.trim(),
                    room_number_bn: newRoomNumberBn.trim() || newRoomNumber.trim(),
                    capacity: parseInt(newRoomCapacity) || 15,
                    is_active: true
                  });
                }}
                className="p-6 space-y-4"
              >
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    রুম কোড / নম্বর (ইংরেজি) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newRoomNumber}
                    onChange={(e) => setNewRoomNumber(e.target.value)}
                    placeholder="e.g. Room 104"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    রুমের বাংলা নাম ও শাখা
                  </label>
                  <input
                    type="text"
                    value={newRoomNumberBn}
                    onChange={(e) => setNewRoomNumberBn(e.target.value)}
                    placeholder="যেমন: কক্ষ ১০৪ (আবাসিক-হিফজ শাখা)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    সিট ধারণক্ষমতা (Capacity) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={newRoomCapacity}
                    onChange={(e) => setNewRoomCapacity(e.target.value)}
                    min={1}
                    max={50}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setIsAddRoomModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    disabled={addRoomMutation.isPending}
                    className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md transition-all disabled:opacity-50"
                  >
                    {addRoomMutation.isPending ? 'সংরক্ষণ হচ্ছে...' : 'রুম সংরক্ষণ করুন'}
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

