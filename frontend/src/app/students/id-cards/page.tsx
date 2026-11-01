/* eslint-disable */
'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { 
  Printer, ArrowLeft, Filter, Search, CheckSquare, Square, 
  Layers, Scissors, ShieldCheck, Phone, MapPin, Sparkles, Award, User, RefreshCw
} from 'lucide-react';
import { toBanglaDigit } from '@/lib/numberToBanglaWords';

export default function BulkIdCardsPage() {
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedResidential, setSelectedResidential] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [printMode, setPrintMode] = useState<'pair' | 'front' | 'back'>('pair'); // 'pair' = fold & laminate, 'front' = front only, 'back' = back only
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Fetch all students
  const { data: students = [], isLoading, refetch } = useQuery({
    queryKey: ['students-bulk-id'],
    queryFn: async () => {
      const res = await api.get('/api/students/');
      return res.data;
    }
  });

  // Extract distinct departments / classes from students list
  const classOptions = useMemo(() => {
    const set = new Set<string>();
    students.forEach((s: any) => {
      if (s.islamic_department_name_bn) set.add(s.islamic_department_name_bn);
      if (s.general_department_name_bn) set.add(s.general_department_name_bn);
    });
    return Array.from(set);
  }, [students]);

  // Filter students
  const filteredStudents = useMemo(() => {
    return students.filter((s: any) => {
      // Class filter
      if (selectedClass !== 'all') {
        const matchIslamic = s.islamic_department_name_bn === selectedClass;
        const matchGeneral = s.general_department_name_bn === selectedClass;
        if (!matchIslamic && !matchGeneral) return false;
      }
      // Residential filter
      if (selectedResidential !== 'all') {
        if (s.residential_status !== selectedResidential) return false;
      }
      // Search
      if (search.trim()) {
        const q = search.toLowerCase();
        const match = 
          s.name?.toLowerCase().includes(q) ||
          s.name_bn?.toLowerCase().includes(q) ||
          s.student_id?.toLowerCase().includes(q) ||
          String(s.roll_number || '').includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [students, selectedClass, selectedResidential, search]);

  // Toggle selection
  const toggleSelectAll = () => {
    if (selectedIds.length === filteredStudents.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredStudents.map((s: any) => s.id));
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Initially select all filtered if empty
  const activeStudents = useMemo(() => {
    if (selectedIds.length === 0) return filteredStudents;
    return filteredStudents.filter((s: any) => selectedIds.includes(s.id));
  }, [filteredStudents, selectedIds]);

  // Barcode generator helper
  const generateBarcodeBars = (code: string) => {
    const bars: boolean[] = [];
    for (let i = 0; i < code.length; i++) {
      const charCode = code.charCodeAt(i);
      bars.push(true, false, charCode % 2 === 0, true, false, charCode % 3 === 0, true);
    }
    return bars;
  };

  const handlePrint = () => {
    window.print();
  };

  // Group active students into A4 pages (For 'pair' mode: 4 pairs per A4 page; for 'front'/'back': 8 per A4 page)
  const itemsPerPage = printMode === 'pair' ? 4 : 8;
  const pages: any[][] = [];
  for (let i = 0; i < activeStudents.length; i += itemsPerPage) {
    pages.push(activeStudents.slice(i, i + itemsPerPage));
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans print:bg-white print:text-black">
      
      {/* ======================= TOP CONTROL BAR (HIDDEN IN PRINT) ======================= */}
      <header className="print:hidden sticky top-0 z-50 bg-[#031c0b]/95 backdrop-blur-xl border-b border-emerald-500/20 shadow-2xl p-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Left: Back Link & Title */}
          <div className="flex items-center gap-3">
            <Link
              href="/students"
              className="p-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-emerald-300 transition-all"
              title="শিক্ষার্থী তালিকায় ফিরুন"
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                <h1 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  এক ক্লিকে সম্পূর্ণ ক্লাসের আইডি কার্ড বাল্ক প্রিন্ট
                </h1>
              </div>
              <p className="text-xs text-emerald-200/80 mt-0.5">
                আল-মদিনা মডেল মাদ্রাসা এন্ড রিসার্চ ইনস্টিটিউট • A4 সাইজ ব্যাচ প্রিন্টার (CR80 54mm × 86mm)
              </p>
            </div>
          </div>

          {/* Right: Print Action & Counter */}
          <div className="flex items-center gap-3">
            <div className="bg-white/[0.05] border border-white/10 px-3.5 py-1.5 rounded-xl text-center">
              <span className="text-[10px] text-emerald-300 uppercase block font-medium">নির্বাচিত শিক্ষার্থী</span>
              <span className="text-sm font-bold text-amber-300 font-mono">
                {toBanglaDigit(activeStudents.length)} জন ({toBanglaDigit(pages.length)}টি A4 পেজ)
              </span>
            </div>

            <button
              onClick={handlePrint}
              disabled={activeStudents.length === 0}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-emerald-950 font-black text-xs sm:text-sm rounded-xl shadow-[0_10px_25px_-5px_rgba(245,158,11,0.5)] transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              <Printer size={16} />
              <span>A4 পেপারে প্রিন্ট করুন</span>
            </button>
          </div>
        </div>

        {/* Filters and Layout Mode Options */}
        <div className="max-w-7xl mx-auto mt-4 pt-3 border-t border-emerald-500/15 flex flex-wrap items-center justify-between gap-3 text-xs">
          
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Class / Department Dropdown */}
            <div className="flex items-center gap-1.5 bg-white/[0.06] border border-white/10 rounded-xl px-2.5 py-1.5">
              <Filter size={14} className="text-amber-400" />
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="bg-transparent text-white text-xs font-semibold focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-slate-900 text-white">সকল শ্রেণি ও বিভাগ</option>
                {classOptions.map((opt) => (
                  <option key={opt} value={opt} className="bg-slate-900 text-white">{opt}</option>
                ))}
              </select>
            </div>

            {/* Residential Status Filter */}
            <select
              value={selectedResidential}
              onChange={(e) => setSelectedResidential(e.target.value)}
              className="bg-white/[0.06] border border-white/10 text-white rounded-xl px-2.5 py-1.5 text-xs font-semibold focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900 text-white">সকল শিক্ষার্থী (আবাসিক + অনাবাসিক)</option>
              <option value="day" className="bg-slate-900 text-white">অনাবাসিক (Day Scholar)</option>
              <option value="residential" className="bg-slate-900 text-white">আবাসিক (Residential)</option>
            </select>

            {/* Quick Search */}
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-2 text-gray-400" />
              <input
                type="text"
                placeholder="নাম বা আইডি খুঁজুন..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-white/[0.06] border border-white/10 rounded-xl text-xs text-white placeholder-gray-400 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1.5 bg-white/[0.06] p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setPrintMode('pair')}
              className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                printMode === 'pair' 
                  ? 'bg-amber-400 text-emerald-950 shadow-sm' 
                  : 'text-emerald-200 hover:text-white'
              }`}
              title="কাগজে কেটে মাঝখানে ভাঁজ করে একবারে লেমিনেশন করার জন্য পাশাপাশি ফ্রন্ট ও ব্যাক"
            >
              <Scissors size={13} />
              <span>ভাঁজ ও লেমিনেশন জোড়া (Fold & Laminate)</span>
            </button>
            <button
              onClick={() => setPrintMode('front')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                printMode === 'front' 
                  ? 'bg-amber-400 text-emerald-950 shadow-sm' 
                  : 'text-emerald-200 hover:text-white'
              }`}
            >
              শুধু সামনের দিক (Front)
            </button>
            <button
              onClick={() => setPrintMode('back')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                printMode === 'back' 
                  ? 'bg-amber-400 text-emerald-950 shadow-sm' 
                  : 'text-emerald-200 hover:text-white'
              }`}
            >
              শুধু পেছনের দিক (Back)
            </button>
          </div>

          {/* Select All Toggle */}
          <button
            onClick={toggleSelectAll}
            className="flex items-center gap-1.5 text-xs text-amber-300 font-semibold hover:text-amber-200 transition-colors"
          >
            {selectedIds.length === filteredStudents.length && filteredStudents.length > 0 ? (
              <>
                <CheckSquare size={15} className="text-amber-400" />
                <span>সকল শিক্ষার্থী নির্বাচিত</span>
              </>
            ) : (
              <>
                <Square size={15} />
                <span>সবাইকে নির্বাচন করুন ({toBanglaDigit(filteredStudents.length)} জন)</span>
              </>
            )}
          </button>

        </div>
      </header>

      {/* ======================= A4 PRINTABLE CANVAS ======================= */}
      <main className="max-w-6xl mx-auto py-8 px-4 sm:px-6 print:p-0 print:m-0 print:max-w-none">
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-20 text-emerald-400">
            <RefreshCw size={36} className="animate-spin mb-3 text-amber-400" />
            <span className="text-sm font-semibold">শিক্ষার্থীদের তথ্য ও আইডি কার্ড প্রস্তুত হচ্ছে...</span>
          </div>
        ) : activeStudents.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-3xl p-16 text-center text-gray-400">
            <User size={48} className="mx-auto mb-3 opacity-40 text-amber-400" />
            <h3 className="text-lg font-bold text-white mb-1">কোনো শিক্ষার্থী পাওয়া যায়নি</h3>
            <p className="text-xs text-gray-400">উপরের ফিল্টার পরিবর্তন করুন অথবা ভিন্ন শ্রেণি নির্বাচন করুন।</p>
          </div>
        ) : (
          <div className="space-y-8 print:space-y-0">
            
            {pages.map((pageGroup, pageIndex) => (
              <div
                key={pageIndex}
                className="a4-page bg-white text-black p-6 rounded-2xl shadow-2xl border border-gray-200 print:shadow-none print:border-none print:p-0 print:m-0 print:rounded-none relative overflow-hidden"
                style={{
                  minHeight: '297mm',
                  pageBreakAfter: pageIndex < pages.length - 1 ? 'always' : 'auto',
                  breakAfter: pageIndex < pages.length - 1 ? 'page' : 'auto',
                }}
              >
                {/* Print Sheet Header / Margins (Print Only Metadata) */}
                <div className="print:flex justify-between items-center text-[8px] text-gray-500 pb-2 mb-2 border-b border-gray-200 hidden">
                  <span>আল-মদিনা মডেল মাদ্রাসা এন্ড রিসার্চ ইনস্টিটিউট — স্টুডেন্ট আইডি কার্ড ব্যাচ প্রিন্ট</span>
                  <span>পাতা {toBanglaDigit(pageIndex + 1)} / {toBanglaDigit(pages.length)} • সেশন ২০২৭</span>
                </div>

                {/* ================= MODE 1: PAIR (FOLD & LAMINATE) ================= */}
                {printMode === 'pair' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 print:grid-cols-2 print:gap-4 print:gap-y-5 justify-items-center">
                    {pageGroup.map((student: any) => {
                      const barcodeBars = generateBarcodeBars(student.student_id || 'STU-2026-001');
                      const deptBn = student.islamic_department_name_bn || student.general_department_name_bn || 'জেনারেল ও হিফজ বিভাগ';
                      const yearText = student.academic_year ? toBanglaDigit(student.academic_year) : '২০২৭';

                      return (
                        <div 
                          key={student.id}
                          className="flex items-center rounded-xl border border-dashed border-gray-300 print:border-dashed print:border-gray-400 p-1.5 relative group bg-white shadow-sm print:shadow-none"
                        >
                          {/* Top Scissor Guide Icon */}
                          <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-white px-1 text-[8px] text-gray-400 flex items-center gap-0.5 print:hidden">
                            <Scissors size={10} />
                            <span>ভাঁজ লাইন</span>
                          </div>

                          {/* Selection Checkbox (Hidden in Print) */}
                          <button
                            onClick={() => toggleSelect(student.id)}
                            className="print:hidden absolute top-2 right-2 z-20 w-5 h-5 rounded bg-emerald-950 text-amber-300 flex items-center justify-center shadow-md border border-amber-400/50"
                            title="নির্বাচন টগল করুন"
                          >
                            ✓
                          </button>

                          {/* LEFT: FRONT CARD (54mm width × 86mm height) */}
                          <div 
                            className="w-[54mm] h-[86mm] bg-white rounded-lg border border-emerald-900/60 overflow-hidden flex flex-col justify-between relative select-none shrink-0"
                            style={{ width: '54mm', height: '86mm' }}
                          >
                            {/* Card Top Header */}
                            <div className="bg-gradient-to-b from-[#032410] to-[#053d1b] text-white text-center pt-1 pb-1.5 px-1 relative border-b border-amber-400/80">
                              <div className="flex items-center justify-center gap-1.5">
                                <div className="w-5 h-5 rounded-full overflow-hidden p-[0.5px] bg-amber-400 shrink-0">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover rounded-full bg-white" />
                                </div>
                                <div className="text-left leading-tight">
                                  <div className="font-extrabold text-[8px] text-white leading-none">
                                    আল-মদিনা মডেল মাদ্রাসা
                                  </div>
                                  <div className="text-[6.5px] font-bold text-amber-300 leading-none mt-0.5">
                                    এন্ড রিসার্চ ইনস্টিটিউট
                                  </div>
                                </div>
                              </div>
                              <div className="text-[5.5px] text-emerald-200 mt-0.5 leading-none">
                                Al Madina Model Madrasa & Research Institute
                              </div>
                              <div className="mt-1 inline-block px-2 py-[1px] rounded-full bg-amber-400 text-emerald-950 font-black text-[6.5px] uppercase tracking-wider shadow-sm">
                                স্টুডেন্ট আইডি কার্ড — {yearText}
                              </div>
                            </div>

                            {/* Card Middle: Photo & Details */}
                            <div className="flex-1 flex flex-col items-center justify-center px-1.5 py-1 text-center">
                              {/* Photo Frame */}
                              <div className="w-14 h-16 rounded-md p-[1px] bg-gradient-to-b from-amber-400 to-emerald-800 shadow-sm mb-1 shrink-0">
                                <div className="w-full h-full bg-slate-50 rounded-[5px] overflow-hidden flex items-center justify-center">
                                  {student.photo ? (
                                    /* eslint-disable-next-line @next/next/no-img-element */
                                    <img 
                                      src={student.photo.startsWith('http') ? student.photo : `http://127.0.0.1:8001${student.photo.startsWith('/') ? '' : '/'}${student.photo}`} 
                                      alt={student.name} 
                                      className="w-full h-full object-cover" 
                                    />
                                  ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-emerald-800 bg-emerald-50">
                                      <User size={20} className="text-emerald-700" />
                                      <span className="text-[6px] font-bold text-emerald-900 mt-0.5">ছবি</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Student Name */}
                              <h4 className="font-black text-[9px] text-emerald-950 leading-tight truncate w-full">
                                {student.name_bn || student.name}
                              </h4>
                              <p className="text-[7px] text-gray-600 font-semibold truncate w-full mb-1">
                                {student.name}
                              </p>

                              {/* ID Badge */}
                              <div className="inline-flex items-center gap-1 px-1.5 py-[0.5px] bg-[#032410] text-white rounded font-mono font-bold text-[7px] mb-1">
                                <span>ID:</span>
                                <span className="text-amber-300">{student.student_id}</span>
                              </div>

                              {/* Info Box */}
                              <div className="w-full bg-emerald-50/80 border border-emerald-200 rounded p-1 text-left text-[6.5px] space-y-0.5">
                                <div className="flex justify-between">
                                  <span className="text-gray-500">বিভাগ/শ্রেণি:</span>
                                  <span className="font-bold text-emerald-950 truncate max-w-[24mm]">{deptBn}</span>
                                </div>
                                {student.roll_number && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-500">রোল নং:</span>
                                    <span className="font-bold text-emerald-950">{toBanglaDigit(student.roll_number)}</span>
                                  </div>
                                )}
                                <div className="flex justify-between">
                                  <span className="text-gray-500">জরুরি ফোন:</span>
                                  <span className="font-bold text-emerald-950">{student.guardian_phone || '০১৭১২-৬৩৩২৬৪'}</span>
                                </div>
                              </div>
                            </div>

                            {/* Card Bottom Barcode */}
                            <div className="bg-gray-50 border-t border-gray-200 py-1 px-1 text-center">
                              <div className="flex items-center justify-center h-4 gap-[1px] mb-0.5">
                                {barcodeBars.slice(0, 32).map((bar, idx) => (
                                  <div key={idx} className={`h-full ${bar ? 'bg-black' : 'bg-transparent'} w-[1px]`} />
                                ))}
                              </div>
                              <div className="text-[6px] font-mono font-bold tracking-wider text-gray-700">
                                *{student.student_id}*
                              </div>
                            </div>
                          </div>

                          {/* CENTRAL DASHED CUTTING / FOLDING LINE */}
                          <div className="w-[1px] h-[80mm] border-r-2 border-dashed border-gray-400 mx-1 relative flex items-center justify-center">
                            <span className="text-[7px] text-gray-400 rotate-90 select-none bg-white py-1">✂️ ভাঁজ</span>
                          </div>

                          {/* RIGHT: BACK CARD (54mm width × 86mm height) */}
                          <div 
                            className="w-[54mm] h-[86mm] bg-white rounded-lg border border-emerald-900/60 overflow-hidden flex flex-col justify-between relative select-none shrink-0"
                            style={{ width: '54mm', height: '86mm' }}
                          >
                            {/* Back Header */}
                            <div className="bg-[#032410] text-white p-1 text-center border-b border-amber-400">
                              <div className="text-[7.5px] font-bold text-amber-300">
                                নিয়মাবলী ও নির্দেশিকা
                              </div>
                              <div className="text-[5.5px] text-emerald-200">
                                Terms & Emergency Information
                              </div>
                            </div>

                            {/* Back Rules Content */}
                            <div className="p-1.5 flex-1 flex flex-col justify-between text-[6.5px] text-gray-700 leading-tight">
                              <div className="space-y-1">
                                <div className="flex items-start gap-1">
                                  <span className="text-emerald-800 font-bold">১.</span>
                                  <span>এই কার্ডটি মাদ্রাসার সম্পত্তি। ক্যাম্পাসে সর্বদা দৃশ্যমান রাখা আবশ্যক।</span>
                                </div>
                                <div className="flex items-start gap-1">
                                  <span className="text-emerald-800 font-bold">২.</span>
                                  <span>কার্ডটি হস্তান্তরযোগ্য নয়। হারানো গেলে হেল্পলাইনে রিপোর্ট করুন।</span>
                                </div>
                                <div className="flex items-start gap-1">
                                  <span className="text-emerald-800 font-bold">৩.</span>
                                  <span>কার্ড পাওয়া গেলে নিকটস্থ ঠিকানায় পৌঁছে দেওয়ার অনুরোধ করা হলো।</span>
                                </div>
                              </div>

                              {/* Principal Signature & Seal */}
                              <div className="pt-2 border-t border-gray-200 text-center relative mt-auto">
                                <div className="w-8 h-8 rounded-full overflow-hidden p-[1px] bg-emerald-600/20 absolute -top-1 left-1/2 -translate-x-1/2 opacity-30 pointer-events-none">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src="/logo.jpg" alt="Seal" className="w-full h-full object-cover rounded-full" />
                                </div>
                                <div className="font-serif italic font-bold text-[7px] text-emerald-950">
                                  মাওলানা ওমর ফারুক মুজাহিদী
                                </div>
                                <div className="text-[5.5px] font-bold text-gray-500 uppercase tracking-wide">
                                  অধ্যক্ষ ও শায়খুল হাদিস
                                </div>
                              </div>
                            </div>

                            {/* Back Bottom Address */}
                            <div className="bg-emerald-950 text-white p-1 text-center text-[5.5px] leading-tight">
                              <div className="font-bold text-amber-300">ক-৭৫/২, মহাখালী দক্ষিণপাড়া, বনানী, ঢাকা-১২১২</div>
                              <div className="text-emerald-200">হেল্পলাইন: ০১৭১২-৬৩৩২৬৪ • www.almadina.edu.bd</div>
                            </div>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                )}

                {/* ================= MODE 2: FRONT SIDES ONLY ================= */}
                {printMode === 'front' && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 print:grid-cols-4 print:gap-2 justify-items-center">
                    {pageGroup.map((student: any) => {
                      const barcodeBars = generateBarcodeBars(student.student_id || 'STU-2026-001');
                      const deptBn = student.islamic_department_name_bn || student.general_department_name_bn || 'জেনারেল ও হিফজ বিভাগ';
                      const yearText = student.academic_year ? toBanglaDigit(student.academic_year) : '২০২৭';

                      return (
                        <div 
                          key={student.id}
                          className="w-[54mm] h-[86mm] bg-white rounded-lg border-2 border-emerald-900 overflow-hidden flex flex-col justify-between relative select-none shadow-sm print:shadow-none m-1"
                          style={{ width: '54mm', height: '86mm' }}
                        >
                          {/* Card Top Header */}
                          <div className="bg-gradient-to-b from-[#032410] to-[#053d1b] text-white text-center pt-1 pb-1 px-1 border-b border-amber-400">
                            <div className="flex items-center justify-center gap-1">
                              <div className="w-5 h-5 rounded-full overflow-hidden p-[0.5px] bg-amber-400 shrink-0">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover rounded-full bg-white" />
                              </div>
                              <div className="text-left leading-tight">
                                <div className="font-extrabold text-[8px] text-white leading-none">
                                  আল-মদিনা মডেল মাদ্রাসা
                                </div>
                                <div className="text-[6.5px] font-bold text-amber-300 leading-none mt-0.5">
                                  এন্ড রিসার্চ ইনস্টিটিউট
                                </div>
                              </div>
                            </div>
                            <div className="mt-1 inline-block px-2 py-[0.5px] rounded-full bg-amber-400 text-emerald-950 font-black text-[6.5px] uppercase tracking-wider">
                              আইডি কার্ড — {yearText}
                            </div>
                          </div>

                          {/* Card Middle: Photo & Details */}
                          <div className="flex-1 flex flex-col items-center justify-center px-1.5 py-1 text-center">
                            <div className="w-14 h-16 rounded-md p-[1px] bg-gradient-to-b from-amber-400 to-emerald-800 shadow-sm mb-1 shrink-0">
                              <div className="w-full h-full bg-slate-50 rounded-[5px] overflow-hidden flex items-center justify-center">
                                {student.photo ? (
                                  /* eslint-disable-next-line @next/next/no-img-element */
                                  <img 
                                    src={student.photo.startsWith('http') ? student.photo : `http://127.0.0.1:8001${student.photo.startsWith('/') ? '' : '/'}${student.photo}`} 
                                    alt={student.name} 
                                    className="w-full h-full object-cover" 
                                  />
                                ) : (
                                  <div className="w-full h-full flex flex-col items-center justify-center text-emerald-800 bg-emerald-50">
                                    <User size={20} className="text-emerald-700" />
                                    <span className="text-[6px] font-bold text-emerald-900 mt-0.5">ছবি</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            <h4 className="font-black text-[9px] text-emerald-950 leading-tight truncate w-full">
                              {student.name_bn || student.name}
                            </h4>
                            <p className="text-[7px] text-gray-600 font-semibold truncate w-full mb-1">
                              {student.name}
                            </p>

                            <div className="inline-flex items-center gap-1 px-1.5 py-[0.5px] bg-[#032410] text-white rounded font-mono font-bold text-[7px] mb-1">
                              <span>ID:</span>
                              <span className="text-amber-300">{student.student_id}</span>
                            </div>

                            <div className="w-full bg-emerald-50/80 border border-emerald-200 rounded p-1 text-left text-[6.5px] space-y-0.5">
                              <div className="flex justify-between">
                                <span className="text-gray-500">বিভাগ/শ্রেণি:</span>
                                <span className="font-bold text-emerald-950 truncate max-w-[24mm]">{deptBn}</span>
                              </div>
                              {student.roll_number && (
                                <div className="flex justify-between">
                                  <span className="text-gray-500">রোল নং:</span>
                                  <span className="font-bold text-emerald-950">{toBanglaDigit(student.roll_number)}</span>
                                </div>
                              )}
                              <div className="flex justify-between">
                                <span className="text-gray-500">জরুরি ফোন:</span>
                                <span className="font-bold text-emerald-950">{student.guardian_phone || '০১৭১২-৬৩৩২৬৪'}</span>
                              </div>
                            </div>
                          </div>

                          {/* Card Bottom Barcode */}
                          <div className="bg-gray-50 border-t border-gray-200 py-1 px-1 text-center">
                            <div className="flex items-center justify-center h-4 gap-[1px] mb-0.5">
                              {barcodeBars.slice(0, 32).map((bar, idx) => (
                                <div key={idx} className={`h-full ${bar ? 'bg-black' : 'bg-transparent'} w-[1px]`} />
                              ))}
                            </div>
                            <div className="text-[6px] font-mono font-bold tracking-wider text-gray-700">
                              *{student.student_id}*
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* ================= MODE 3: BACK SIDES ONLY ================= */}
                {printMode === 'back' && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 print:grid-cols-4 print:gap-2 justify-items-center">
                    {pageGroup.map((student: any) => (
                      <div 
                        key={student.id}
                        className="w-[54mm] h-[86mm] bg-white rounded-lg border-2 border-emerald-900 overflow-hidden flex flex-col justify-between relative select-none shadow-sm print:shadow-none m-1"
                        style={{ width: '54mm', height: '86mm' }}
                      >
                        <div className="bg-[#032410] text-white p-1 text-center border-b border-amber-400">
                          <div className="text-[7.5px] font-bold text-amber-300">
                            নিয়মাবলী ও নির্দেশিকা
                          </div>
                          <div className="text-[5.5px] text-emerald-200">
                            Terms & Emergency Contact
                          </div>
                        </div>

                        <div className="p-1.5 flex-1 flex flex-col justify-between text-[6.5px] text-gray-700 leading-tight">
                          <div className="space-y-1">
                            <div className="flex items-start gap-1">
                              <span className="text-emerald-800 font-bold">১.</span>
                              <span>এই কার্ডটি মাদ্রাসার সম্পত্তি। ক্যাম্পাসে সর্বদা দৃশ্যমান রাখা আবশ্যক।</span>
                            </div>
                            <div className="flex items-start gap-1">
                              <span className="text-emerald-800 font-bold">২.</span>
                              <span>কার্ডটি হস্তান্তরযোগ্য নয়। হারানো গেলে হেল্পলাইনে রিপোর্ট করুন।</span>
                            </div>
                            <div className="flex items-start gap-1">
                              <span className="text-emerald-800 font-bold">৩.</span>
                              <span>কার্ড পাওয়া গেলে নিকটস্থ ঠিকানায় পৌঁছে দেওয়ার অনুরোধ করা হলো।</span>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-gray-200 text-center relative mt-auto">
                            <div className="w-8 h-8 rounded-full overflow-hidden p-[1px] bg-emerald-600/20 absolute -top-1 left-1/2 -translate-x-1/2 opacity-30 pointer-events-none">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src="/logo.jpg" alt="Seal" className="w-full h-full object-cover rounded-full" />
                            </div>
                            <div className="font-serif italic font-bold text-[7px] text-emerald-950">
                              মাওলানা ওমর ফারুক মুজাহিদী
                            </div>
                            <div className="text-[5.5px] font-bold text-gray-500 uppercase tracking-wide">
                              অধ্যক্ষ ও শায়খুল হাদিস
                            </div>
                          </div>
                        </div>

                        <div className="bg-emerald-950 text-white p-1 text-center text-[5.5px] leading-tight">
                          <div className="font-bold text-amber-300">ক-৭৫/২, মহাখালী দক্ষিণপাড়া, বনানী, ঢাকা-১২১২</div>
                          <div className="text-emerald-200">হেল্পলাইন: ০১৭১২-৬৩৩২৬৪</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              </div>
            ))}

          </div>
        )}

      </main>

      {/* ======================= GLOBAL PRINT STYLES ======================= */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm 6mm;
          }
          body {
            background-color: white !important;
            color: black !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .a4-page {
            page-break-after: always;
            break-after: page;
          }
        }
      `}</style>
    </div>
  );
}
