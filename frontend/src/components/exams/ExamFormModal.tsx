/* eslint-disable */
'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { X, Save, Calendar, Award, BookOpen, Sparkles } from 'lucide-react';

interface ExamFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any | null;
  onSaved?: () => void;
}

export default function ExamFormModal({
  isOpen,
  onClose,
  initialData = null,
  onSaved
}: ExamFormModalProps) {
  const queryClient = useQueryClient();
  const isEditing = !!initialData?.id;

  const [nameBn, setNameBn] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [examType, setExamType] = useState('monthly');
  const [classroomId, setClassroomId] = useState<string | number>('');
  const [academicYearId, setAcademicYearId] = useState<string | number>('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  // Fetch ClassRooms
  const { data: classrooms = [] } = useQuery({
    queryKey: ['academic_classrooms'],
    queryFn: async () => {
      const res = await api.get('/api/academic/classrooms/');
      return res.data;
    },
    enabled: isOpen
  });

  // Fetch Academic Years
  const { data: academicYears = [] } = useQuery({
    queryKey: ['academic_years'],
    queryFn: async () => {
      const res = await api.get('/api/academic/academic-years/');
      return res.data;
    },
    enabled: isOpen
  });

  // Set default or initial values
  useEffect(() => {
    if (initialData) {
      setNameBn(initialData.name_bn || '');
      setNameEn(initialData.name || '');
      setExamType(initialData.exam_type || 'monthly');
      setClassroomId(initialData.classroom || initialData.classroom_id || '');
      setAcademicYearId(initialData.academic_year || initialData.academic_year_id || '');
      setStartDate(initialData.start_date || new Date().toISOString().split('T')[0]);
      setEndDate(initialData.end_date || new Date().toISOString().split('T')[0]);
    } else {
      setNameBn('');
      setNameEn('');
      setExamType('monthly');
      setStartDate(new Date().toISOString().split('T')[0]);
      setEndDate(new Date().toISOString().split('T')[0]);
    }
  }, [initialData, isOpen]);

  // Set defaults when classrooms or years load
  useEffect(() => {
    if (!initialData && isOpen) {
      if (!classroomId && classrooms.length > 0) {
        setClassroomId(classrooms[0].id);
      }
      if (!academicYearId && academicYears.length > 0) {
        const currentYear = academicYears.find((y: any) => y.is_current) || academicYears[0];
        setAcademicYearId(currentYear.id);
      }
    }
  }, [classrooms, academicYears, initialData, isOpen]);

  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      if (isEditing) {
        const res = await api.patch(`/api/exams/${initialData.id}/`, payload);
        return res.data;
      } else {
        const res = await api.post('/api/exams/', payload);
        return res.data;
      }
    },
    onSuccess: () => {
      toast.success(isEditing ? 'পরীক্ষার তথ্য সফলভাবে আপডেট হয়েছে!' : 'নতুন পরীক্ষা সফলভাবে তৈরি হয়েছে!');
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      if (initialData?.id) {
        queryClient.invalidateQueries({ queryKey: ['exam-detail', String(initialData.id)] });
      }
      if (onSaved) onSaved();
      onClose();
    },
    onError: (err: any) => {
      const msg = err.response?.data?.detail || err.response?.data?.name_bn || 'পরীক্ষা সংরক্ষণ করতে ব্যর্থ হয়েছে।';
      toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    }
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameBn.trim()) {
      toast.error('পরীক্ষার নাম (বাংলা) লিখুন');
      return;
    }
    if (!classroomId) {
      toast.error('শ্রেণি বা জামাত নির্বাচন করুন');
      return;
    }
    if (!academicYearId) {
      toast.error('শিক্ষাবর্ষ নির্বাচন করুন');
      return;
    }

    const payload = {
      name_bn: nameBn.trim(),
      name: nameEn.trim() || nameBn.trim(),
      exam_type: examType,
      classroom: Number(classroomId),
      academic_year: Number(academicYearId),
      start_date: startDate,
      end_date: endDate
    };

    saveMutation.mutate(payload);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-emerald-500/20">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-950 to-emerald-900 text-white flex items-center justify-between border-b border-emerald-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-300">
              <Award size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {isEditing ? 'পরীক্ষার তথ্য সম্পাদনা' : 'নতুন পরীক্ষা তৈরি করুন'}
              </h2>
              <p className="text-xs text-emerald-200/80">আল-মদিনা মডেল মাদ্রাসা এন্ড রিসার্চ ইনস্টিটিউট</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              পরীক্ষার নাম (বাংলায়) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={nameBn}
              onChange={(e) => setNameBn(e.target.value)}
              placeholder="যেমন: বার্ষিক মূল্যায়ন পরীক্ষা ২০২৬"
              className="w-full py-2.5 px-3.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              পরীক্ষার নাম (ইংরেজিতে)
            </label>
            <input
              type="text"
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              placeholder="e.g. Annual Evaluation Exam 2026"
              className="w-full py-2.5 px-3.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                পরীক্ষার ধরন
              </label>
              <select
                value={examType}
                onChange={(e) => setExamType(e.target.value)}
                className="w-full py-2.5 px-3 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="monthly">মাসিক মূল্যায়ন পরীক্ষা</option>
                <option value="midterm">অর্ধবার্ষিক পরীক্ষা (Midterm)</option>
                <option value="annual">বার্ষিক পরীক্ষা (Annual)</option>
                <option value="other">বিশেষ মূল্যায়ন পরীক্ষা</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                জামাত / শ্রেণি <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={classroomId}
                onChange={(e) => setClassroomId(e.target.value)}
                className="w-full py-2.5 px-3 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {classrooms.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.name_bn || c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                শিক্ষাবর্ষ
              </label>
              <select
                value={academicYearId}
                onChange={(e) => setAcademicYearId(e.target.value)}
                className="w-full py-2.5 px-3 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {academicYears.map((y: any) => (
                  <option key={y.id} value={y.id}>
                    {y.year}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                শুরুর তারিখ
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full py-2 px-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                সমাপ্তির তারিখ
              </label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full py-2 px-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 rounded-xl border border-slate-200 text-xs font-semibold text-gray-600 hover:bg-slate-50 transition-colors"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={saveMutation.isPending}
              className="py-2 px-5 rounded-xl bg-gradient-to-r from-emerald-800 to-emerald-700 hover:from-emerald-700 hover:to-emerald-600 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Save size={15} />
              <span>{saveMutation.isPending ? 'সংরক্ষণ হচ্ছে...' : isEditing ? 'আপডেট করুন' : 'পরীক্ষা তৈরি করুন'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}