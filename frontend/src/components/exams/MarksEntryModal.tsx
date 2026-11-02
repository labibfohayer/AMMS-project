/* eslint-disable */
'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { X, Save, CheckCircle, AlertCircle, Sparkles, BookOpen, User, Check, RefreshCw } from 'lucide-react';
import { toBanglaDigit } from '@/lib/numberToBanglaWords';

interface MarksEntryModalProps {
  examId: number | string | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export default function MarksEntryModal({
  examId,
  isOpen,
  onClose,
  onSaved
}: MarksEntryModalProps) {
  const queryClient = useQueryClient();
  // key: `${studentId}_${subjectId}` -> string of marks obtained
  const [marksState, setMarksState] = useState<{ [key: string]: string }>({});
  // key: `${studentId}_${subjectId}` -> boolean
  const [absentState, setAbsentState] = useState<{ [key: string]: boolean }>({});

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['exam_marks_entry', examId],
    queryFn: async () => {
      if (!examId) return null;
      const res = await api.get(`/api/exams/${examId}/results/`);
      return res.data;
    },
    enabled: isOpen && !!examId
  });

  // Prefill state from existing results
  useEffect(() => {
    if (data?.results_map) {
      const initialMarks: { [key: string]: string } = {};
      const initialAbsent: { [key: string]: boolean } = {};
      Object.entries(data.results_map).forEach(([key, val]: [string, any]) => {
        initialMarks[key] = val.marks_obtained !== undefined ? String(val.marks_obtained) : '';
        initialAbsent[key] = !!val.is_absent;
      });
      setMarksState(initialMarks);
      setAbsentState(initialAbsent);
    }
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post(`/api/exams/${examId}/results/`, payload);
      return res.data;
    },
    onSuccess: (res) => {
      toast.success(res.message || 'নম্বর সফলভাবে সংরক্ষিত হয়েছে!');
      queryClient.invalidateQueries({ queryKey: ['exam-detail', String(examId)] });
      queryClient.invalidateQueries({ queryKey: ['exam-ranking', String(examId)] });
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      queryClient.invalidateQueries({ queryKey: ['exam_marks_entry', examId] });
      if (onSaved) onSaved();
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'নম্বর সংরক্ষণ করতে সমস্যা হয়েছে।');
    }
  });

  if (!isOpen || !examId) return null;

  const students = data?.students || [];
  const subjects = data?.subjects || [];
  const exam = data?.exam || {};

  const handleMarkChange = (studentId: number, subjectId: number, val: string) => {
    const key = `${studentId}_${subjectId}`;
    setMarksState(prev => ({ ...prev, [key]: val }));
    if (val !== '' && absentState[key]) {
      setAbsentState(prev => ({ ...prev, [key]: false }));
    }
  };

  const handleAbsentToggle = (studentId: number, subjectId: number) => {
    const key = `${studentId}_${subjectId}`;
    const nextAbsent = !absentState[key];
    setAbsentState(prev => ({ ...prev, [key]: nextAbsent }));
    if (nextAbsent) {
      setMarksState(prev => ({ ...prev, [key]: '0' }));
    }
  };

  const handleSave = () => {
    const results: any[] = [];
    students.forEach((stu: any) => {
      subjects.forEach((sub: any) => {
        const key = `${stu.id}_${sub.id}`;
        const markVal = marksState[key];
        const isAbs = absentState[key] || false;
        if (markVal !== undefined && markVal !== '') {
          results.push({
            student_id: stu.id,
            subject_id: sub.id,
            marks_obtained: parseFloat(markVal) || 0,
            total_marks: sub.total_marks || 100,
            is_absent: isAbs
          });
        }
      });
    });

    if (results.length === 0) {
      toast.error('দয়া করে অন্তত একজন শিক্ষার্থীর একটি বিষয়ের নম্বর লিখুন।');
      return;
    }

    saveMutation.mutate({ results });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden border border-emerald-500/20">
        
        {/* Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-emerald-950 via-emerald-900 to-[#02200d] text-white flex items-center justify-between border-b border-emerald-500/20 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-300 shrink-0">
              <BookOpen size={22} />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-[10px] sm:text-xs text-emerald-200 font-semibold mb-1">
                <Sparkles size={11} className="text-amber-400" />
                <span>{exam.classroom_name || 'সকল জামাত'} • শিক্ষাবর্ষ {exam.academic_year || '২০২৬'}</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white leading-tight">
                {exam.name_bn || exam.name || 'পরীক্ষার নম্বর এন্ট্রি ও এডিট'}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
          >
            <X size={22} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-50/50">
          {isLoading ? (
            <div className="py-20 text-center">
              <div className="w-10 h-10 border-4 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-xs text-gray-500 font-medium">শিক্ষার্থী ও বিষয়ভিত্তিক পরীক্ষার নম্বর লোড হচ্ছে...</p>
            </div>
          ) : students.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-2xl border border-slate-200/80 p-6">
              <User size={36} className="mx-auto text-gray-300 mb-2" />
              <h3 className="text-base font-bold text-gray-700">কোনো সক্রিয় শিক্ষার্থী পাওয়া যায়নি</h3>
              <p className="text-xs text-gray-500 mt-1">এই জামাত বা শ্রেণিতে এখনো শিক্ষার্থী এন্ট্রি করা হয়নি।</p>
            </div>
          ) : subjects.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-2xl border border-slate-200/80 p-6">
              <BookOpen size={36} className="mx-auto text-gray-300 mb-2" />
              <h3 className="text-base font-bold text-gray-700">কোনো বিষয় পাওয়া যায়নি</h3>
              <p className="text-xs text-gray-500 mt-1">এই জামাতের জন্য কোনো বিষয় তৈরি করা নেই।</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-emerald-50 border border-emerald-200/70 p-3 rounded-2xl text-xs text-emerald-900">
                <span className="font-medium">
                  💡 প্রতিটি শিক্ষার্থীর নামের পাশে বিষয়ভিত্তিক নম্বর (যেমন: ১০০ এর মধ্যে কত পেল) লিখুন।
                </span>
                <span className="text-[11px] font-bold text-emerald-700 shrink-0">
                  মোট শিক্ষার্থী: {toBanglaDigit(students.length)} জন • বিষয়: {toBanglaDigit(subjects.length)} টি
                </span>
              </div>

              {/* Responsive Marks Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/80 text-gray-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-3.5 w-16 text-center">রোল</th>
                      <th className="py-3 px-4 min-w-[180px]">শিক্ষার্থীর নাম</th>
                      {subjects.map((sub: any) => (
                        <th key={sub.id} className="py-3 px-3 text-center min-w-[120px]">
                          <span className="block text-gray-900 font-bold">{sub.name_bn || sub.name}</span>
                          <span className="text-[10px] text-gray-400 font-mono font-normal">
                            পূর্ণমান: {toBanglaDigit(sub.total_marks || 100)}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {students.map((stu: any) => {
                      return (
                        <tr key={stu.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-3.5 text-center font-mono font-bold text-slate-800">
                            {toBanglaDigit(stu.roll_number || stu.student_id?.slice(-3) || '—')}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                                {stu.photo ? (
                                  <img src={stu.photo} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <span>{stu.name_bn?.charAt(0) || stu.name?.charAt(0) || 'S'}</span>
                                )}
                              </div>
                              <div>
                                <p className="font-bold text-gray-900 leading-snug">{stu.name_bn || stu.name}</p>
                                <p className="text-[10px] text-gray-400 font-mono">{stu.student_id}</p>
                              </div>
                            </div>
                          </td>
                          {subjects.map((sub: any) => {
                            const key = `${stu.id}_${sub.id}`;
                            const val = marksState[key] ?? '';
                            const isAbs = absentState[key] || false;
                            const numVal = parseFloat(val);
                            const maxMarks = sub.total_marks || 100;
                            const isInvalid = !isNaN(numVal) && (numVal < 0 || numVal > maxMarks);

                            return (
                              <td key={sub.id} className="py-2.5 px-3 text-center">
                                <div className="flex flex-col items-center gap-1">
                                  <div className="relative w-20">
                                    <input
                                      type="number"
                                      step="any"
                                      min="0"
                                      max={maxMarks}
                                      disabled={isAbs}
                                      value={isAbs ? '0' : val}
                                      onChange={(e) => handleMarkChange(stu.id, sub.id, e.target.value)}
                                      placeholder="0"
                                      className={`w-full text-center py-1.5 px-2 font-mono font-bold rounded-lg border text-xs transition-all focus:outline-none focus:ring-2 ${
                                        isAbs
                                          ? 'bg-red-50 border-red-200 text-red-500 line-through'
                                          : isInvalid
                                          ? 'bg-rose-50 border-rose-400 text-rose-600 focus:ring-rose-400'
                                          : val !== ''
                                          ? 'bg-emerald-50/70 border-emerald-300 text-emerald-900 focus:ring-emerald-500'
                                          : 'bg-white border-slate-200 text-gray-800 focus:ring-emerald-500'
                                      }`}
                                    />
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleAbsentToggle(stu.id, sub.id)}
                                    className={`text-[9px] px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
                                      isAbs 
                                        ? 'bg-red-100 text-red-700 font-bold' 
                                        : 'text-gray-400 hover:text-red-600 hover:bg-gray-100'
                                    }`}
                                  >
                                    {isAbs ? 'অনুপস্থিত' : 'অনুপস্থিত?'}
                                  </button>
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-white border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-emerald-700 py-2 px-3 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />
            <span>রিফ্রেশ</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-semibold text-gray-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saveMutation.isPending || isLoading}
              className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-emerald-800 to-emerald-700 hover:from-emerald-700 hover:to-emerald-600 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save size={15} />
              <span>{saveMutation.isPending ? 'সংরক্ষণ হচ্ছে...' : 'সব নম্বর সংরক্ষণ করুন'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}