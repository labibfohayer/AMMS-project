/* eslint-disable */
'use client';

import { use, useState, useMemo } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import Link from 'next/link';
import { 
  Award, ArrowLeft, Printer, Search, CheckCircle, Clock, 
  BarChart3, Medal, Users, BookOpen, Sparkles, ChevronRight, Send
} from 'lucide-react';
import toast from 'react-hot-toast';
import PrintableMarksheet, { MarksheetData } from '@/components/exams/PrintableMarksheet';
import { toBanglaDigit } from '@/lib/numberToBanglaWords';

export default function ExamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [activeMarksheet, setActiveMarksheet] = useState<MarksheetData | null>(null);
  const [search, setSearch] = useState('');
  const [loadingStudentId, setLoadingStudentId] = useState<string | null>(null);
  const [isBulkSending, setIsBulkSending] = useState(false);

  // 1. Fetch Exam Details
  const { data: exam, isLoading: isExamLoading } = useQuery({
    queryKey: ['exam-detail', id],
    queryFn: async () => {
      const res = await api.get(`/api/exams/${id}/`);
      return res.data;
    }
  });

  // 2. Fetch Class Ranking for this exam
  const { data: ranking = [], isLoading: isRankingLoading } = useQuery({
    queryKey: ['exam-ranking', id],
    queryFn: async () => {
      const res = await api.get(`/api/exams/${id}/ranking/`);
      return res.data;
    }
  });

  // Handler to fetch full student marksheet and open print modal
  const handleOpenMarksheet = async (studentId: string) => {
    try {
      setLoadingStudentId(studentId);
      const res = await api.get(`/api/exams/students/${studentId}/marksheet/${id}/`);
      setActiveMarksheet(res.data);
    } catch (err) {
      console.error('Failed to load marksheet', err);
    } finally {
      setLoadingStudentId(null);
    }
  };

  const handleBulkNotify = async () => {
    if (!confirm('আপনি কি এই পরীক্ষার সকল শিক্ষার্থীর অভিভাবকদের মোবাইলে রেজাল্ট ও মেধা স্থান মেসেজ পাঠাতে চান?')) {
      return;
    }
    setIsBulkSending(true);
    try {
      const res = await api.post(`/api/exams/${id}/notify-results/`, {});
      toast.success(`সফলভাবে ${res.data.sent_count} জন অভিভাবকের মোবাইলে রেজাল্ট পাঠানো হয়েছে!`);
    } catch (err: any) {
      toast.error('রেজাল্ট পাঠাতে সমস্যা হয়েছে।');
    } finally {
      setIsBulkSending(false);
    }
  };

  const handleSingleNotify = async (studentPk: number, waLink: string) => {
    try {
      await api.post(`/api/exams/${id}/notify-results/`, { student_id: studentPk });
      toast.success('রেজাল্ট নোটিফিকেশন পাঠানো হয়েছে!');
    } catch (err) {
      // Allow opening link anyway
    }
    if (waLink) {
      window.open(waLink, '_blank');
    }
  };

  const filteredRanking = useMemo(() => {
    if (!search.trim()) return ranking;
    const q = search.toLowerCase();
    return ranking.filter((item: any) =>
      item.name?.toLowerCase().includes(q) ||
      item.name_bn?.toLowerCase().includes(q) ||
      item.student_id?.toLowerCase().includes(q)
    );
  }, [ranking, search]);

  if (isExamLoading) {
    return (
      <AppLayout title="পরীক্ষার রেজাল্ট ও মার্কশিট">
        <div className="p-12 text-center text-gray-500">পরীক্ষার তথ্য লোড হচ্ছে...</div>
      </AppLayout>
    );
  }

  if (!exam) {
    return (
      <AppLayout title="পরীক্ষার রেজাল্ট ও মার্কশিট">
        <div className="p-12 text-center text-red-500">পরীক্ষা পাওয়া যায়নি।</div>
      </AppLayout>
    );
  }

  const topThree = ranking.slice(0, 3);

  return (
    <AppLayout title={`${exam.name_bn || exam.name} - মার্কশিট ও রেজাল্ট`}>
      <div className="space-y-6">
        
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <Link href="/exams" className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-800 hover:text-emerald-950">
            <ArrowLeft className="w-4 h-4" />
            <span>সকল পরীক্ষার তালিকায় ফিরুন</span>
          </Link>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href={`/exams/${id}/ranking`}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 font-bold text-xs shadow-sm hover:bg-amber-100 transition-colors"
            >
              <Award className="w-4 h-4 text-amber-600" />
              <span>মেধা তালিকা ও র্যাংকিং পেজ</span>
            </Link>

            <button
              onClick={handleBulkNotify}
              disabled={isBulkSending || ranking.length === 0}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm transition-all active:scale-95 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5 text-amber-300" />
              <span>{isBulkSending ? 'পাঠানো হচ্ছে...' : 'সকল অভিভাবককে এক ক্লিকে রেজাল্ট পাঠান'}</span>
            </button>
          </div>
        </div>

        {/* Hero Banner */}
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-[#02200d] text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden border border-emerald-500/20">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-semibold mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>আল-মদিনা মডেল মাদ্রাসা এন্ড রিসার্চ ইনস্টিটিউট</span>
              </div>
              
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {exam.name_bn || exam.name}
              </h1>
              <p className="text-emerald-200 text-xs sm:text-sm mt-1">
                {exam.name} • শিক্ষাবর্ষ: {exam.academic_year || 2026}
              </p>

              <div className="flex flex-wrap items-center gap-2 mt-4 text-xs">
                <span className="px-3 py-1 bg-white/10 rounded-xl border border-white/10 flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>রেজাল্ট প্রকাশিত</span>
                </span>
                <span className="px-3 py-1 bg-white/10 rounded-xl border border-white/10">
                  তারিখ: {exam.start_date} হতে {exam.end_date}
                </span>
                <span className="px-3 py-1 bg-white/10 rounded-xl border border-white/10">
                  মোট পরীক্ষার্থী: <span className="font-bold text-amber-300">{toBanglaDigit(ranking.length)} জন</span>
                </span>
              </div>
            </div>

            {/* Quick Summary Pill */}
            <div className="bg-black/30 border border-white/15 p-4 rounded-2xl text-center backdrop-blur-md">
              <span className="text-[11px] text-emerald-200 block">ক্লাসের সর্বোচ্চ নম্বর</span>
              <span className="text-2xl font-black text-amber-400 font-mono">
                {ranking.length > 0 ? toBanglaDigit(ranking[0].total_marks) : '০'}
              </span>
              <span className="text-[10px] text-emerald-300/80 block mt-0.5">
                ১ম স্থান: {ranking.length > 0 ? ranking[0].name_bn : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Podium / Top Rankers Cards */}
        {topThree.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topThree.map((item: any, idx: number) => {
              const medalEmoji = idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉';
              const medalTitle = idx === 0 ? '১ম স্থান (First Place)' : idx === 1 ? '২য় স্থান (Second Place)' : '৩য় স্থান (Third Place)';
              const badgeBg = idx === 0 ? 'bg-amber-400/20 text-amber-300 border-amber-400/40' : idx === 1 ? 'bg-slate-200/20 text-slate-200 border-slate-300/40' : 'bg-orange-400/20 text-orange-300 border-orange-400/40';

              return (
                <div 
                  key={idx} 
                  className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200/80 flex items-center justify-between gap-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="text-3xl">{medalEmoji}</div>
                    <div>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border mb-1 ${badgeBg}`}>
                        {medalTitle}
                      </span>
                      <h4 className="font-bold text-sm text-gray-900 leading-tight">
                        {item.name_bn || item.name}
                      </h4>
                      <p className="text-xs text-gray-500 font-mono mt-0.5">
                        {item.student_id}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-black text-emerald-950 font-mono block">
                      {toBanglaDigit(item.total_marks)}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-bold block">
                      GPA {item.gpa?.toFixed(2)}
                    </span>
                    <button
                      onClick={() => handleOpenMarksheet(item.student_id)}
                      className="mt-1 text-[11px] font-bold text-emerald-800 hover:text-emerald-950 underline flex items-center gap-0.5 justify-end"
                    >
                      <span>মার্কশিট</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Results & Marksheets Table Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-6 space-y-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-700" />
                <span>সকল শিক্ষার্থীর মেধা তালিকা ও মার্কশিট ভাউচার</span>
              </h3>
              <p className="text-xs text-gray-500">যেকোনো শিক্ষার্থীর নামের পাশে ক্লিক করে অফিশিয়াল রেজাল্ট কার্ড প্রিন্ট করুন</p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3.5 top-3 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="শিক্ষার্থীর নাম বা আইডি..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-gray-700 uppercase font-bold border-y border-slate-200">
                <tr>
                  <th className="py-3 px-4 text-center w-16">মেধা স্থান</th>
                  <th className="py-3 px-4">শিক্ষার্থীর নাম ও আইডি</th>
                  <th className="py-3 px-4 text-right">মোট প্রাপ্ত নম্বর</th>
                  <th className="py-3 px-4 text-center">গড় জিপিএ (GPA)</th>
                  <th className="py-3 px-4 text-center">স্ট্যাটাস</th>
                  <th className="py-3 px-4 text-center">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isRankingLoading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-400">
                      মেধা তালিকা লোড হচ্ছে...
                    </td>
                  </tr>
                ) : filteredRanking.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-400">
                      কোনো ফলাফল পাওয়া যায়নি
                    </td>
                  </tr>
                ) : (
                  filteredRanking.map((item: any) => (
                    <tr key={item.student_id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full font-bold text-xs ${
                          item.rank === 1 ? 'bg-amber-400 text-emerald-950 font-black shadow-sm' :
                          item.rank === 2 ? 'bg-slate-200 text-slate-900 font-bold' :
                          item.rank === 3 ? 'bg-orange-200 text-orange-900 font-bold' :
                          'bg-slate-100 text-slate-700 font-mono'
                        }`}>
                          {toBanglaDigit(item.rank)}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-gray-900 text-sm">{item.name_bn || item.name}</div>
                        <div className="text-[11px] text-gray-500 font-mono">{item.student_id}</div>
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-950 text-sm">
                        {toBanglaDigit(item.total_marks)}
                      </td>

                      <td className="py-3.5 px-4 text-center font-mono font-bold text-sm text-emerald-900">
                        {item.gpa?.toFixed(2)}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                          উত্তীর্ণ (Passed)
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleSingleNotify(item.student_pk, item.wa_link)}
                            title="অভিভাবককে WhatsApp-এ রেজাল্ট পাঠান"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-transform active:scale-95"
                          >
                            <Send className="w-3 h-3 text-amber-200" />
                            <span>WhatsApp</span>
                          </button>

                          <button
                            onClick={() => handleOpenMarksheet(item.student_id)}
                            disabled={loadingStudentId === item.student_id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-emerald-950 font-bold text-xs shadow-sm transition-transform active:scale-95 disabled:opacity-50"
                          >
                            <Printer className="w-3.5 h-3.5 text-emerald-950" />
                            <span>{loadingStudentId === item.student_id ? 'লোড হচ্ছে...' : 'মার্কশিট'}</span>
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

      </div>

      {/* PRINTABLE MARKSHEET MODAL */}
      {activeMarksheet && (
        <PrintableMarksheet
          marksheet={activeMarksheet}
          onClose={() => setActiveMarksheet(null)}
        />
      )}
    </AppLayout>
  );
}
