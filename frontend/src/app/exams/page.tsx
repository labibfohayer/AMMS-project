/* eslint-disable */
'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { 
  FileText, Plus, CheckCircle, Clock, Award, Sparkles, 
  ChevronRight, BarChart3, Edit, Trash2, PenTool, AlertTriangle 
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { toBanglaDigit } from '@/lib/numberToBanglaWords';
import toast from 'react-hot-toast';
import ExamFormModal from '@/components/exams/ExamFormModal';
import MarksEntryModal from '@/components/exams/MarksEntryModal';

const EXAM_TYPE_MAP: { [key: string]: string } = {
  monthly: 'মাসিক মূল্যায়ন পরীক্ষা',
  midterm: 'অর্ধবার্ষিক পরীক্ষা (Midterm)',
  annual: 'বার্ষিক পরীক্ষা (Annual Exam)',
  other: 'বিশেষ মূল্যায়ন পরীক্ষা'
};

export default function Exams() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<any | null>(null);
  const [marksEntryExamId, setMarksEntryExamId] = useState<number | null>(null);
  const [deletingExam, setDeletingExam] = useState<any | null>(null);

  const { data: exams, isLoading, error } = useQuery({
    queryKey: ['exams'],
    queryFn: async () => {
      const res = await api.get('/api/exams/');
      return res.data;
    }
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (examId: number) => {
      await api.delete(`/api/exams/${examId}/`);
    },
    onSuccess: () => {
      toast.success('পরীক্ষাটি সফলভাবে মুছে ফেলা হয়েছে!');
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      setDeletingExam(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || 'পরীক্ষা মুছতে সমস্যা হয়েছে।');
    }
  });

  const canManage = user && ['principal', 'vice_principal', 'managing_director', 'teacher'].includes(user.role);

  const handleOpenCreate = () => {
    setEditingExam(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (exam: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingExam(exam);
    setIsFormOpen(true);
  };

  const handleOpenDelete = (exam: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingExam(exam);
  };

  const handleOpenMarksEntry = (examId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setMarksEntryExamId(examId);
  };

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

            <div className="flex flex-wrap items-center gap-3">
              {/* Add Exam Action Button */}
              {canManage && (
                <button
                  type="button"
                  onClick={handleOpenCreate}
                  className="px-4 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95 shrink-0"
                >
                  <Plus size={18} className="stroke-[2.5]" />
                  <span>নতুন পরীক্ষা যোগ করুন</span>
                </button>
              )}

              <div className="bg-black/30 border border-white/10 px-4 py-2 rounded-2xl text-center backdrop-blur-md shrink-0">
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
            <p className="text-xs text-gray-500 mb-4">এখনো কোনো পরীক্ষার তালিকা তৈরি করা হয়নি।</p>
            {canManage && (
              <button
                onClick={handleOpenCreate}
                className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-md inline-flex items-center gap-2"
              >
                <Plus size={16} />
                <span>প্রথম পরীক্ষা তৈরি করুন</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {exams.map((exam: any) => {
              const typeLabel = EXAM_TYPE_MAP[exam.exam_type] || exam.exam_type || 'সাধারণ পরীক্ষা';
              return (
                <div 
                  key={exam.id} 
                  className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-md transition-all border border-slate-100 flex flex-col justify-between group relative"
                >
                  <div>
                    {/* Top Status & Action Bar */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-100 group-hover:scale-105 transition-transform">
                        <Award size={24} className="text-emerald-700" />
                      </div>

                      <div className="flex items-center gap-1.5">
                        {exam.is_published ? (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                            <CheckCircle size={12} className="text-emerald-600" /> প্রকাশিত
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                            <Clock size={12} /> প্রক্রিয়াধীন
                          </span>
                        )}

                        {/* Edit & Delete Action Menu */}
                        {canManage && (
                          <div className="flex items-center gap-1 ml-1">
                            <button
                              type="button"
                              onClick={(e) => handleOpenEdit(exam, e)}
                              title="পরীক্ষার তথ্য এডিট করুন"
                              className="p-1.5 text-gray-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Edit size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleOpenDelete(exam, e)}
                              title="পরীক্ষাটি মুছে ফেলুন"
                              className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-emerald-800 transition-colors">
                      {exam.name_bn || exam.name}
                    </h3>
                    <p className="text-xs text-gray-500 font-medium mb-3">
                      {exam.name}
                    </p>

                    <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 space-y-1.5 text-xs mb-4">
                      <div className="flex justify-between">
                        <span className="text-gray-500">জামাত / শ্রেণি:</span>
                        <span className="font-bold text-emerald-800">{exam.classroom_name || 'নির্ধারিত শ্রেণি'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">ধরন:</span>
                        <span className="font-bold text-gray-800">{typeLabel}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">তারিখ:</span>
                        <span className="font-semibold text-gray-800 font-mono text-[11px]">
                          {exam.start_date} হতে {exam.end_date}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    {/* Enter / Edit Marks Button */}
                    {canManage && (
                      <button
                        type="button"
                        onClick={(e) => handleOpenMarksEntry(exam.id, e)}
                        className="w-full py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-200/80 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                      >
                        <PenTool size={14} className="text-emerald-700" />
                        <span>নম্বর এন্ট্রি ও এডিট করুন</span>
                      </button>
                    )}

                    {/* View Results / Marksheet Link */}
                    <Link
                      href={`/exams/${exam.id}`}
                      className="w-full py-2.5 px-3 bg-gradient-to-r from-emerald-800 to-emerald-900 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 group-hover:shadow-lg active:scale-98"
                    >
                      <BarChart3 className="w-4 h-4 text-amber-300" />
                      <span>রেজাল্ট ও মার্কশিট দেখুন</span>
                      <ChevronRight className="w-4 h-4 text-amber-200" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Add / Edit Exam Modal */}
      <ExamFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        initialData={editingExam}
        onSaved={() => queryClient.invalidateQueries({ queryKey: ['exams'] })}
      />

      {/* Marks Entry Modal */}
      <MarksEntryModal
        isOpen={!!marksEntryExamId}
        examId={marksEntryExamId}
        onClose={() => setMarksEntryExamId(null)}
        onSaved={() => {
          queryClient.invalidateQueries({ queryKey: ['exams'] });
          if (marksEntryExamId) {
            queryClient.invalidateQueries({ queryKey: ['exam-detail', String(marksEntryExamId)] });
            queryClient.invalidateQueries({ queryKey: ['exam-ranking', String(marksEntryExamId)] });
          }
        }}
      />

      {/* Delete Exam Confirmation Modal */}
      {deletingExam && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 border border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-100">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-1">
              পরীক্ষাটি মুছে ফেলতে চান?
            </h3>
            <p className="text-xs text-gray-500 text-center mb-6">
              <span className="font-bold text-gray-800">{deletingExam.name_bn || deletingExam.name}</span> মুছে ফেললে এই পরীক্ষার সাথে যুক্ত সকল শিক্ষার্থীর নম্বর ও রেজাল্ট মুছে যাবে।
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setDeletingExam(null)}
                className="flex-1 py-2.5 border border-slate-200 text-xs font-semibold text-gray-600 rounded-xl hover:bg-slate-50 transition-colors"
              >
                বাতিল
              </button>
              <button
                type="button"
                disabled={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate(deletingExam.id)}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-all shadow-md disabled:opacity-50"
              >
                {deleteMutation.isPending ? 'মুছে ফেলা হচ্ছে...' : 'হ্যাঁ, মুছে ফেলুন'}
              </button>
            </div>
          </div>
        </div>
      )}

    </AppLayout>
  );
}