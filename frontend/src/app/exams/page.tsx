/* eslint-disable */
'use client';

import AppLayout from '@/components/layout/AppLayout';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { FileText, Plus, CheckCircle, Clock, Award, Sparkles, ChevronRight, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { toBanglaDigit } from '@/lib/numberToBanglaWords';

const EXAM_TYPE_MAP: { [key: string]: string } = {
  monthly: 'মাসিক মূল্যায়ন পরীক্ষা',
  midterm: 'অর্ধবার্ষিক পরীক্ষা (Midterm)',
  annual: 'বার্ষিক পরীক্ষা (Annual Exam)',
  other: 'বিশেষ মূল্যায়ন পরীক্ষা'
};

export default function Exams() {
    const { user } = useAuth();
    const { data: exams, isLoading, error } = useQuery({
        queryKey: ['exams'],
        queryFn: async () => {
            const res = await api.get('/api/exams/');
            return res.data;
        }
    });

    return (
        <AppLayout title="পরীক্ষা ও মার্কশিট পোর্টাল">
            <div className="space-y-6">
                
                {/* Header Banner */}
                <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-[#02200d] text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden border border-emerald-500/20">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-semibold mb-2">
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>আল-মদিনা মডেল মাদ্রাসা এন্ড রিসার্চ ইনস্টিটিউট</span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                                পরীক্ষা, রেজাল্ট ও একাডেমিক মার্কশিট
                            </h1>
                            <p className="text-emerald-200/80 text-xs sm:text-sm mt-1 max-w-2xl">
                                নূরানী, নাজেরা, জেনারেল ও হিফজ বিভাগের বিষয়ভিত্তিক ফলাফল, জিপিএ গ্রেডিং এবং ১-ক্লিকে প্রিন্ট-রেডি একাডেমিক ট্রান্সক্রিপ্ট প্রস্তুত করুন।
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-3 bg-white/[0.07] border border-amber-400/30 p-2 sm:p-2.5 rounded-2xl backdrop-blur-md shadow-lg">
                                <div className="w-14 h-14 rounded-xl overflow-hidden border border-amber-400/40 shrink-0 bg-black/40">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img 
                                        src="/images/awards-crests.png" 
                                        alt="মেধা পুরস্কার ক্রেস্ট" 
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="pr-2 hidden sm:block text-left">
                                    <span className="text-[10px] text-amber-300 font-bold block uppercase tracking-wider">মেধা সম্মাননা</span>
                                    <span className="text-xs text-white font-medium">পরীক্ষায় শীর্ষদের ক্রেস্ট প্রদান</span>
                                </div>
                            </div>

                            <div className="bg-black/30 border border-white/10 px-4 py-2.5 rounded-2xl text-center backdrop-blur-md">
                                <span className="text-[11px] text-emerald-200 block">মোট পরীক্ষা</span>
                                <span className="text-xl font-bold text-amber-400 font-mono">
                                    {toBanglaDigit(exams?.length || 0)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Exam Cards Grid */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl shadow-sm border border-slate-100">
                        <div className="w-10 h-10 border-4 border-emerald-600/20 border-t-emerald-600 rounded-full animate-spin mb-3"></div>
                        <p className="text-gray-500 text-xs font-medium">পরীক্ষার তালিকা লোড হচ্ছে...</p>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 text-red-500 p-6 rounded-3xl border border-red-100 text-center text-sm">
                        ডেটা লোড করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।
                    </div>
                ) : exams?.length === 0 ? (
                    <div className="bg-white p-12 rounded-3xl shadow-sm border border-slate-100 text-center">
                        <FileText className="mx-auto text-gray-300 mb-3" size={48} />
                        <h3 className="text-lg font-bold text-gray-700 mb-1">কোনো পরীক্ষা পাওয়া যায়নি</h3>
                        <p className="text-xs text-gray-500">এখনো কোনো পরীক্ষার তালিকা বা রেজাল্ট তৈরি করা হয়নি।</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {exams.map((exam: any) => {
                            const typeLabel = EXAM_TYPE_MAP[exam.exam_type] || exam.exam_type || 'সাধারণ পরীক্ষা';
                            return (
                                <div 
                                    key={exam.id} 
                                    className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-md transition-all border border-slate-100 flex flex-col justify-between group"
                                >
                                    <div>
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-100 group-hover:scale-105 transition-transform">
                                                <Award size={24} className="text-emerald-700" />
                                            </div>
                                            {exam.is_published ? (
                                                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                                                    <CheckCircle size={13} className="text-emerald-600" /> ফলাফল প্রকাশিত
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                                                    <Clock size={13} /> প্রক্রিয়াধীন
                                                </span>
                                            )}
                                        </div>

                                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-emerald-800 transition-colors">
                                            {exam.name_bn || exam.name}
                                        </h3>
                                        <p className="text-xs text-gray-500 font-medium mb-3">
                                            {exam.name}
                                        </p>

                                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-1.5 text-xs mb-4">
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">ধরন:</span>
                                                <span className="font-bold text-gray-800">{typeLabel}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">তারিখ:</span>
                                                <span className="font-semibold text-gray-800">{exam.start_date} হতে {exam.end_date}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <Link
                                        href={`/exams/${exam.id}`}
                                        className="w-full py-3 bg-gradient-to-r from-emerald-800 to-emerald-900 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 group-hover:shadow-lg active:scale-98"
                                    >
                                        <BarChart3 className="w-4 h-4 text-amber-300" />
                                        <span>রেজাল্ট ও মার্কশিট দেখুন</span>
                                        <ChevronRight className="w-4 h-4 text-amber-200" />
                                    </Link>
                                </div>
                            );
                        })}
                    </div>
                )}

            </div>
        </AppLayout>
    );
}
