/* eslint-disable */
'use client';

import { use, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import Link from 'next/link';
import { 
  Award, ArrowLeft, Printer, Search, CheckCircle, 
  BarChart3, Medal, Users, Sparkles, Send, ExternalLink, 
  ChevronRight, BookOpen, Clock, HeartHandshake, ShieldCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import { toBanglaDigit } from '@/lib/numberToBanglaWords';
import PrintableMarksheet, { MarksheetData } from '@/components/exams/PrintableMarksheet';
import PrintableCertificate, { CertificateData } from '@/components/exams/PrintableCertificate';

export default function ExamRankingClient({ params }: { params?: Promise<{ id: string }> }) {
  const routeParams = useParams();
  const resolvedParams = params ? use(params) : null;
  const id = (routeParams?.id as string) || resolvedParams?.id || '1';
  const [search, setSearch] = useState('');
  const [activeMarksheet, setActiveMarksheet] = useState<MarksheetData | null>(null);
  const [activeCertificate, setActiveCertificate] = useState<CertificateData | null>(null);
  const [isBulkSending, setIsBulkSending] = useState(false);
  const queryClient = useQueryClient();

  // 1. Fetch Exam Details
  const { data: exam, isLoading: isExamLoading } = useQuery({
    queryKey: ['exam-detail-ranking', id],
    queryFn: async () => {
      const res = await api.get(`/api/exams/${id}/`);
      return res.data;
    }
  });

  // 2. Fetch Class Ranking for this exam
  const { data: ranking = [], isLoading: isRankingLoading, refetch } = useQuery({
    queryKey: ['exam-ranking-page', id],
    queryFn: async () => {
      const res = await api.get(`/api/exams/${id}/ranking/`);
      return res.data;
    }
  });

  // Bulk Notify Mutation
  const handleBulkNotify = async () => {
    if (!confirm('আপনি কি এই পরীক্ষার সকল শিক্ষার্থীর অভিভাবকদের মোবাইলে রেজাল্ট ও মেধা স্থান মেসেজ পাঠাতে চান?')) {
      return;
    }
    setIsBulkSending(true);
    try {
      const res = await api.post(`/api/exams/${id}/notify-results/`, {});
      toast.success(`সফলভাবে ${res.data.sent_count} জন অভিভাবকের মোবাইলে রেজাল্ট পাঠানো হয়েছে!`);
      refetch();
    } catch (err: any) {
      toast.error('রেজাল্ট পাঠাতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setIsBulkSending(false);
    }
  };

  // Single Student Notify
  const handleSingleNotify = async (studentPk: number, waLink: string) => {
    try {
      await api.post(`/api/exams/${id}/notify-results/`, { student_id: studentPk });
      toast.success('রেজাল্ট নোটিফিকেশন লগ ও পাঠানো হয়েছে!');
    } catch (err) {
      // Still allow opening WhatsApp link
    }
    if (waLink) {
      window.open(waLink, '_blank');
    }
  };

  const handleOpenMarksheet = async (studentId: string) => {
    try {
      const res = await api.get(`/api/exams/students/${studentId}/marksheet/${id}/`);
      setActiveMarksheet(res.data);
    } catch (err) {
      toast.error('মার্কশিট লোড করতে সমস্যা হয়েছে।');
    }
  };

  const handleOpenCertificate = (student: any) => {
    if (!exam) return;
    setActiveCertificate({
      exam: {
        id: exam.id,
        name: exam.name,
        name_bn: exam.name_bn,
        academic_year: exam.academic_year,
        term: exam.term,
        start_date: exam.start_date,
        end_date: exam.end_date,
      },
      students: [{
        student_pk: student.student_pk,
        student_id: student.student_id,
        name: student.name,
        name_bn: student.name_bn,
        roll_number: student.roll_number,
        department_name: student.department_name,
        total_marks: student.total_marks,
        gpa: student.gpa,
        grade: student.grade,
        rank: student.rank,
      }],
      title: `${student.name_bn || student.name}-এর মেধা প্রশংসাপত্র`
    });
  };

  const handleOpenTop3Certificates = () => {
    if (!exam || topThree.length === 0) return;
    setActiveCertificate({
      exam: {
        id: exam.id,
        name: exam.name,
        name_bn: exam.name_bn,
        academic_year: exam.academic_year,
        term: exam.term,
        start_date: exam.start_date,
        end_date: exam.end_date,
      },
      students: topThree.map((s: any) => ({
        student_pk: s.student_pk,
        student_id: s.student_id,
        name: s.name,
        name_bn: s.name_bn,
        roll_number: s.roll_number,
        department_name: s.department_name,
        total_marks: s.total_marks,
        gpa: s.gpa,
        grade: s.grade,
        rank: s.rank,
      })),
      title: 'শীর্ষ ৩ জন কৃতি শিক্ষার্থীর মেধা প্রশংসাপত্র'
    });
  };

  const handleOpenAllCertificates = () => {
    if (!exam || ranking.length === 0) return;
    setActiveCertificate({
      exam: {
        id: exam.id,
        name: exam.name,
        name_bn: exam.name_bn,
        academic_year: exam.academic_year,
        term: exam.term,
        start_date: exam.start_date,
        end_date: exam.end_date,
      },
      students: ranking.map((s: any) => ({
        student_pk: s.student_pk,
        student_id: s.student_id,
        name: s.name,
        name_bn: s.name_bn,
        roll_number: s.roll_number,
        department_name: s.department_name,
        total_marks: s.total_marks,
        gpa: s.gpa,
        grade: s.grade,
        rank: s.rank,
      })),
      title: 'সকল শিক্ষার্থীর আনুষ্ঠানিক মেধা প্রশংসাপত্র'
    });
  };

  const filteredRanking = useMemo(() => {
    if (!search.trim()) return ranking;
    const q = search.toLowerCase();
    return ranking.filter((item: any) =>
      item.name?.toLowerCase().includes(q) ||
      item.name_bn?.toLowerCase().includes(q) ||
      item.student_id?.toLowerCase().includes(q) ||
      String(item.roll_number || '').includes(q)
    );
  }, [ranking, search]);

  const topThree = ranking.slice(0, 3);
  const highestTotal = ranking.length > 0 ? ranking[0].total_marks : 0;
  const avgClassGpa = ranking.length > 0 
    ? (ranking.reduce((acc: number, curr: any) => acc + (curr.gpa || 0), 0) / ranking.length).toFixed(2)
    : '0.00';

  if (isExamLoading) {
    return (
      <AppLayout title="মেধা তালিকা">
        <div className="p-16 text-center text-gray-500">পরীক্ষার মেধা তালিকা লোড হচ্ছে...</div>
      </AppLayout>
    );
  }

  if (!exam) {
    return (
      <AppLayout title="মেধা তালিকা">
        <div className="p-16 text-center text-red-500">পরীক্ষা পাওয়া যায়নি।</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title={`মেধা তালিকা — ${exam.name_bn || exam.name}`}>
      <div className="space-y-6">
        
        {/* Top Control Bar (Hidden on Print) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
          <Link 
            href={`/exams/${id}`}
            className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-800 hover:text-emerald-950 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>পরীক্ষার মূল মার্কশিট পেজে ফিরুন</span>
          </Link>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleBulkNotify}
              disabled={isBulkSending || ranking.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
              <Send className="w-4 h-4 text-amber-300" />
              <span>{isBulkSending ? 'পাঠানো হচ্ছে...' : 'সকল রেজাল্ট পাঠান'}</span>
            </button>

            <button
              onClick={handleOpenTop3Certificates}
              disabled={topThree.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-emerald-950 font-black text-xs sm:text-sm shadow-md transition-all active:scale-95"
            >
              <Award className="w-4 h-4 text-emerald-950" />
              <span>🏆 শীর্ষ ৩ জনের মেধা সনদ প্রিন্ট</span>
            </button>

            <button
              onClick={handleOpenAllCertificates}
              disabled={ranking.length === 0}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-emerald-900 border border-emerald-300 font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95"
            >
              <Printer className="w-4 h-4 text-emerald-700" />
              <span>📜 সকল মেধা সনদ</span>
            </button>

            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-gray-800 font-bold text-xs sm:text-sm transition-all active:scale-95"
            >
              <Printer className="w-4 h-4 text-gray-600" />
              <span>তালিকা শিট</span>
            </button>
          </div>
        </div>

        {/* Hero Banner with Madrasah Title & Exam Stats (Screen View) */}
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-[#02200d] text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden border border-emerald-500/20 print:hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-semibold mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>আল-মদিনা মডেল মাদ্রাসা এন্ড রিসার্চ ইনস্টিটিউট</span>
              </div>
              
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                অফিসিয়াল মেধা তালিকা ও র্যাংকিং (Merit List)
              </h1>
              <p className="text-emerald-200 text-xs sm:text-sm mt-1">
                {exam.name_bn || exam.name} • শিক্ষাবর্ষ: {exam.academic_year || 2026} • মোট পরীক্ষার্থী: {toBanglaDigit(ranking.length)} জন
              </p>

              <div className="flex flex-wrap items-center gap-2 mt-4 text-xs">
                <span className="px-3 py-1 bg-white/10 rounded-xl border border-white/10 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span>মেধা স্থান অনুযায়ী সাজানো</span>
                </span>
                <span className="px-3 py-1 bg-white/10 rounded-xl border border-white/10">
                  ক্লাসের গড় GPA: <span className="font-bold text-amber-300 font-mono">{avgClassGpa}</span>
                </span>
                <span className="px-3 py-1 bg-white/10 rounded-xl border border-white/10">
                  সর্বোচ্চ নম্বর: <span className="font-bold text-amber-300 font-mono">{toBanglaDigit(highestTotal)}</span>
                </span>
              </div>
            </div>

            {/* Merit Crest Badge */}
            <div className="flex items-center gap-3 bg-white/[0.07] border border-amber-400/30 p-3 rounded-2xl backdrop-blur-md shadow-lg shrink-0">
              <div className="w-16 h-16 rounded-xl overflow-hidden border border-amber-400/40 shrink-0 bg-black/40">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/awards-crests.png" alt="মেধা পুরস্কার" className="w-full h-full object-cover" />
              </div>
              <div className="text-left">
                <span className="text-[10px] text-amber-300 font-bold block uppercase tracking-wider">শীর্ষ স্থান অর্জনকারী</span>
                <span className="text-sm text-white font-extrabold block">
                  {ranking.length > 0 ? ranking[0].name_bn : 'N/A'} (১ম)
                </span>
                <span className="text-[11px] text-emerald-200">মোট নম্বর: {toBanglaDigit(highestTotal)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3D Trophy Podium for Top 3 (Screen View) */}
        {topThree.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:hidden">
            {topThree.map((item: any, idx: number) => {
              const trophyEmoji = idx === 0 ? '🏆' : idx === 1 ? '🥈' : '🥉';
              const rankTitle = idx === 0 ? '১ম স্থান (Champion)' : idx === 1 ? '২য় স্থান (Runner-up)' : '৩য় স্থান (3rd Position)';
              const borderColor = idx === 0 ? 'border-amber-400 shadow-amber-950/20' : idx === 1 ? 'border-slate-300' : 'border-orange-300';
              const bannerBg = idx === 0 ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-emerald-950 font-black' : idx === 1 ? 'bg-slate-200 text-slate-800 font-bold' : 'bg-orange-200 text-orange-900 font-bold';

              return (
                <div 
                  key={idx}
                  className={`bg-white rounded-3xl p-6 shadow-sm border-2 ${borderColor} flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs ${bannerBg}`}>
                      {rankTitle}
                    </span>
                    <span className="text-4xl filter drop-shadow-sm">{trophyEmoji}</span>
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-gray-900 leading-tight">
                      {item.name_bn || item.name}
                    </h3>
                    <p className="text-xs text-gray-500 font-mono mt-0.5">
                      আইডি: {item.student_id} {item.roll_number ? `• রোল: ${toBanglaDigit(item.roll_number)}` : ''}
                    </p>
                    <p className="text-xs text-emerald-800 font-medium mt-1">
                      {item.department_name || 'জেনারেল ও হিফজ বিভাগ'}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase font-semibold block">প্রাপ্ত মোট নম্বর</span>
                      <span className="text-xl font-black text-emerald-950 font-mono">
                        {toBanglaDigit(item.total_marks)}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-gray-400 uppercase font-semibold block">জিপিএ ও গ্রেড</span>
                      <span className="text-sm font-black text-amber-600 font-mono">
                        GPA {item.gpa?.toFixed(2)} ({item.grade || 'A+'})
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <button
                      onClick={() => handleOpenCertificate(item)}
                      className="flex-1 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-emerald-950 text-xs font-black rounded-xl border border-amber-500 flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95"
                    >
                      <Award size={14} className="text-emerald-950" />
                      <span>মেধা সনদ</span>
                    </button>
                    <button
                      onClick={() => handleSingleNotify(item.student_pk, item.wa_link)}
                      className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 flex items-center justify-center gap-1 transition-colors"
                      title="WhatsApp রেজাল্ট"
                    >
                      <Send size={13} className="text-emerald-700" />
                      <span>WhatsApp</span>
                    </button>
                    <button
                      onClick={() => handleOpenMarksheet(item.student_id)}
                      className="px-2.5 py-2 bg-slate-50 hover:bg-slate-100 text-gray-700 text-xs font-bold rounded-xl border border-slate-200"
                    >
                      মার্কশিট
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ===================== PRINTABLE OFFICIAL MERIT LIST SHEET ===================== */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-6 sm:p-8 space-y-5 print:shadow-none print:border-none print:p-0 print:m-0">
          
          {/* Printable Official Header (Visible on print & screen) */}
          <div className="text-center pb-6 border-b-2 border-emerald-900/40">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="w-14 h-14 rounded-full overflow-hidden p-[1px] bg-amber-400 shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover rounded-full bg-white" />
              </div>
              <div className="text-left">
                <h2 className="text-xl sm:text-2xl font-black text-emerald-950 leading-tight">
                  আল-মদিনা মডেল মাদ্রাসা এন্ড রিসার্চ ইনস্টিটিউট
                </h2>
                <p className="text-xs text-amber-800 font-bold uppercase tracking-wider">
                  Al Madina Model Madrasa and Research Institute
                </p>
                <p className="text-[11px] text-gray-600">
                  ক-৭৫/২, মহাখালী দক্ষিণপাড়া, বনানী, ঢাকা-১২১২ • ফোন: ০১৭১২-৬৩৩২৬৪
                </p>
              </div>
            </div>

            <div className="mt-3 inline-block px-5 py-1 rounded-full bg-emerald-950 text-white font-extrabold text-xs sm:text-sm tracking-wide">
              📋 বার্ষিক/সাময়িক পরীক্ষার আনুষ্ঠানিক মেধা তালিকা (Official Merit List)
            </div>
            
            <div className="mt-2 text-xs text-gray-700 flex flex-wrap items-center justify-center gap-4">
              <span><strong>পরীক্ষার নাম:</strong> {exam.name_bn || exam.name}</span>
              <span><strong>শিক্ষাবর্ষ:</strong> {toBanglaDigit(exam.academic_year || 2026)}</span>
              <span><strong>তারিখ:</strong> {exam.start_date} হতে {exam.end_date}</span>
              <span><strong>মোট পরীক্ষার্থী:</strong> {toBanglaDigit(ranking.length)} জন</span>
            </div>
          </div>

          {/* Search Box on Screen (Hidden on Print) */}
          <div className="flex items-center justify-between gap-3 print:hidden">
            <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-700" />
              <span>সম্পূর্ণ মেধা তালিকা ও ফলাফল বিবরণী</span>
            </h3>

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3.5 top-3 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="শিক্ষার্থীর নাম বা রোল খুঁজুন..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          {/* Merit List Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse border border-slate-300">
              <thead className="bg-[#032410] text-white uppercase font-bold text-[11px]">
                <tr>
                  <th className="py-2.5 px-3 text-center border border-emerald-800 w-16">মেধা স্থান</th>
                  <th className="py-2.5 px-3 border border-emerald-800">শিক্ষার্থীর নাম</th>
                  <th className="py-2.5 px-3 text-center border border-emerald-800">রোল নং</th>
                  <th className="py-2.5 px-3 text-center border border-emerald-800">আইডি নং</th>
                  <th className="py-2.5 px-3 border border-emerald-800">বিভাগ / শ্রেণি</th>
                  <th className="py-2.5 px-3 text-right border border-emerald-800">মোট নম্বর</th>
                  <th className="py-2.5 px-3 text-center border border-emerald-800">গড় জিপিএ</th>
                  <th className="py-2.5 px-3 text-center border border-emerald-800">লেটার গ্রেড</th>
                  <th className="py-2.5 px-3 text-center border border-emerald-800">ফলাফল</th>
                  <th className="py-2.5 px-3 text-center border border-emerald-800 print:hidden">অভিভাবককে প্রেরণ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-gray-800">
                {isRankingLoading ? (
                  <tr>
                    <td colSpan={10} className="text-center py-8 text-gray-400">
                      মেধা তালিকা প্রস্তুত হচ্ছে...
                    </td>
                  </tr>
                ) : filteredRanking.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center py-8 text-gray-400">
                      কোনো ফলাফল পাওয়া যায়নি
                    </td>
                  </tr>
                ) : (
                  filteredRanking.map((item: any) => {
                    const rankBadgeClass = 
                      item.rank === 1 ? 'bg-amber-400 text-black font-black' :
                      item.rank === 2 ? 'bg-slate-300 text-black font-bold' :
                      item.rank === 3 ? 'bg-orange-300 text-black font-bold' :
                      'bg-slate-100 text-gray-800 font-semibold';

                    return (
                      <tr key={item.student_id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-3 text-center border border-slate-300">
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${rankBadgeClass}`}>
                            {toBanglaDigit(item.rank)}
                          </span>
                        </td>

                        <td className="py-2.5 px-3 font-bold text-gray-900 border border-slate-300">
                          {item.name_bn || item.name}
                        </td>

                        <td className="py-2.5 px-3 text-center font-bold font-mono border border-slate-300">
                          {item.roll_number ? toBanglaDigit(item.roll_number) : '—'}
                        </td>

                        <td className="py-2.5 px-3 text-center font-mono text-[11px] border border-slate-300 text-gray-600">
                          {item.student_id}
                        </td>

                        <td className="py-2.5 px-3 border border-slate-300 text-gray-700">
                          {item.department_name || 'জেনারেল ও হিফজ বিভাগ'}
                        </td>

                        <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-950 border border-slate-300">
                          {toBanglaDigit(item.total_marks)}
                        </td>

                        <td className="py-2.5 px-3 text-center font-mono font-bold border border-slate-300 text-emerald-900">
                          {item.gpa?.toFixed(2)}
                        </td>

                        <td className="py-2.5 px-3 text-center font-bold border border-slate-300">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                            item.grade === 'A+' ? 'bg-emerald-100 text-emerald-900' :
                            item.grade === 'F' ? 'bg-rose-100 text-rose-900' : 'bg-blue-100 text-blue-900'
                          }`}>
                            {item.grade || 'A+'}
                          </span>
                        </td>

                        <td className="py-2.5 px-3 text-center border border-slate-300">
                          {item.has_failed ? (
                            <span className="text-rose-700 font-bold text-[10px]">অকৃতকার্য</span>
                          ) : (
                            <span className="text-emerald-700 font-bold text-[10px]">কৃতকার্য</span>
                          )}
                        </td>

                        {/* WhatsApp / SMS Actions on Screen */}
                        <td className="py-2.5 px-3 text-center border border-slate-300 print:hidden">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleOpenCertificate(item)}
                              title="মেধা সনদ ও প্রশংসাপত্র প্রিন্ট করুন"
                              className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-lg text-[10px] flex items-center gap-1 transition-colors shadow-sm"
                            >
                              <Award size={11} />
                              <span>সনদ</span>
                            </button>
                            <button
                              onClick={() => handleSingleNotify(item.student_pk, item.wa_link)}
                              title="অভিভাবককে WhatsApp-এ রেজাল্ট পাঠান"
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[10px] flex items-center gap-1 transition-colors"
                            >
                              <Send size={11} />
                              <span>WhatsApp</span>
                            </button>
                            <button
                              onClick={() => handleOpenMarksheet(item.student_id)}
                              title="মার্কশিট প্রিন্ট করুন"
                              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-gray-700 font-semibold rounded-lg text-[10px] transition-colors"
                            >
                              মার্কশিট
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Official Signatures Footer (Visible in Print & Screen) */}
          <div className="pt-10 mt-8 border-t border-gray-300 flex justify-between items-end text-xs text-gray-800">
            <div className="text-center">
              <div className="w-36 border-b border-gray-400 mb-1" />
              <p className="font-semibold">শ্রেণি শিক্ষক / পরীক্ষক</p>
              <p className="text-[10px] text-gray-500">স্বাক্ষর ও তারিখ</p>
            </div>

            <div className="text-center">
              <div className="w-36 border-b border-gray-400 mb-1" />
              <p className="font-semibold">পরীক্ষা নিয়ন্ত্রক</p>
              <p className="text-[10px] text-gray-500">আল-মদিনা মডেল মাদ্রাসা</p>
            </div>

            <div className="text-center relative">
              <div className="w-12 h-12 rounded-full overflow-hidden p-[1px] bg-emerald-600/20 absolute -top-5 left-1/2 -translate-x-1/2 opacity-30 pointer-events-none">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.jpg" alt="Seal" className="w-full h-full object-cover rounded-full" />
              </div>
              <div className="font-serif italic font-bold text-sm text-emerald-950 mb-0.5">
                মাওলানা ওমর ফারুক মুজাহিদী
              </div>
              <div className="w-44 border-b border-gray-400 mb-1" />
              <p className="font-bold text-gray-900">অধ্যক্ষ ও শায়খুল হাদিস</p>
              <p className="text-[10px] text-emerald-800">আল-মদিনা মডেল মাদ্রাসা এন্ড রিসার্চ ইনস্টিটিউট</p>
            </div>
          </div>

        </div>

      </div>

      {/* PRINTABLE MARKSHEET MODAL */}
      {activeMarksheet && (
        <PrintableMarksheet
          marksheet={activeMarksheet}
          onClose={() => setActiveMarksheet(null)}
        />
      )}

      {/* PRINTABLE MERIT CERTIFICATE MODAL */}
      {activeCertificate && (
        <PrintableCertificate
          data={activeCertificate}
          onClose={() => setActiveCertificate(null)}
        />
      )}

      {/* PRINT CSS */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm 8mm;
          }
          body {
            background-color: white !important;
            color: black !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
    </AppLayout>
  );
}
