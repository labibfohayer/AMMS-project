/* eslint-disable */
'use client';

import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { X, Save, Bell, Sparkles, Users, MessageSquare } from 'lucide-react';

interface NoticeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any | null;
  onSaved?: () => void;
}

export default function NoticeFormModal({
  isOpen,
  onClose,
  initialData = null,
  onSaved
}: NoticeFormModalProps) {
  const queryClient = useQueryClient();
  const isEditing = !!initialData?.id;

  const [titleBn, setTitleBn] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [bodyBn, setBodyBn] = useState('');
  const [bodyEn, setBodyEn] = useState('');
  const [target, setTarget] = useState('all');

  useEffect(() => {
    if (initialData) {
      setTitleBn(initialData.title_bn || initialData.title || '');
      setTitleEn(initialData.title || '');
      setBodyBn(initialData.body_bn || initialData.body || '');
      setBodyEn(initialData.body || '');
      setTarget(initialData.target || 'all');
    } else {
      setTitleBn('');
      setTitleEn('');
      setBodyBn('');
      setBodyEn('');
      setTarget('all');
    }
  }, [initialData, isOpen]);

  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      if (isEditing) {
        const res = await api.patch(`/api/notices/${initialData.id}/`, payload);
        return res.data;
      } else {
        const res = await api.post('/api/notices/create/', payload);
        return res.data;
      }
    },
    onSuccess: () => {
      toast.success(isEditing ? 'নোটিশটি সফলভাবে আপডেট হয়েছে!' : 'নতুন নোটিশ সফলভাবে প্রকাশ করা হয়েছে!');
      queryClient.invalidateQueries({ queryKey: ['notices'] });
      if (onSaved) onSaved();
      onClose();
    },
    onError: (err: any) => {
      const msg = err.response?.data?.detail || err.response?.data?.title_bn || 'নোটিশ সংরক্ষণ করতে ব্যর্থ হয়েছে।';
      toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    }
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleBn.trim()) {
      toast.error('নোটিশের শিরোনাম (বাংলা) লিখুন');
      return;
    }
    if (!bodyBn.trim()) {
      toast.error('নোটিশের বিস্তারিত বিবরণ (বাংলা) লিখুন');
      return;
    }

    const payload = {
      title_bn: titleBn.trim(),
      title: titleEn.trim() || titleBn.trim(),
      body_bn: bodyBn.trim(),
      body: bodyEn.trim() || bodyBn.trim(),
      target: target
    };

    saveMutation.mutate(payload);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden border border-emerald-500/20">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-950 to-emerald-900 text-white flex items-center justify-between border-b border-emerald-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-300">
              <Bell size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {isEditing ? 'নোটিশ সম্পাদনা করুন' : 'নতুন নোটিশ প্রকাশ করুন'}
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
              নোটিশের শিরোনাম (বাংলায়) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={titleBn}
              onChange={(e) => setTitleBn(e.target.value)}
              placeholder="যেমন: পবিত্র মাহে রমজান ও ঈদ-উল-ফিতরের ছুটি সংক্রান্ত নোটিশ"
              className="w-full py-2.5 px-3.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              নোটিশের শিরোনাম (ইংরেজিতে)
            </label>
            <input
              type="text"
              value={titleEn}
              onChange={(e) => setTitleEn(e.target.value)}
              placeholder="e.g. Notice regarding Holy Ramadan & Eid Vacation"
              className="w-full py-2.5 px-3.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              প্রাপক নির্বাচন (Target Audience) <span className="text-rose-500">*</span>
            </label>
            <select
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="w-full py-2.5 px-3 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            >
              <option value="all">📢 সকলের জন্য (All - অভিভাবক, শিক্ষার্থী, শিক্ষক ও স্টাফ)</option>
              <option value="guardians">👨‍👩‍👧 শুধুমাত্র সম্মানিত অভিভাবকবৃন্দ (Guardians only)</option>
              <option value="students">🎓 শুধুমাত্র শিক্ষার্থীবৃন্দ (Students only)</option>
              <option value="teachers">👨‍🏫 শুধুমাত্র সম্মানিত শিক্ষকবৃন্দ (Teachers only)</option>
              <option value="staff">💼 শুধুমাত্র কর্মচারী ও স্টাফবৃন্দ (Staff only)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              বিস্তারিত নোটিশ ও বিবরণ (বাংলায়) <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={bodyBn}
              onChange={(e) => setBodyBn(e.target.value)}
              placeholder="এখানে বিস্তারিত নোটিশ, তারিখ ও নির্দেশনা লিখুন..."
              className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              বিস্তারিত নোটিশ (ইংরেজিতে - ঐচ্ছিক)
            </label>
            <textarea
              rows={2}
              value={bodyEn}
              onChange={(e) => setBodyEn(e.target.value)}
              placeholder="Notice details in English (optional)..."
              className="w-full p-3 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed"
            />
          </div>

          {/* Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-semibold text-gray-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={saveMutation.isPending}
              className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-emerald-800 to-emerald-700 hover:from-emerald-700 hover:to-emerald-600 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save size={15} />
              <span>{saveMutation.isPending ? 'সংরক্ষণ হচ্ছে...' : isEditing ? 'আপডেট করুন' : 'নোটিশ প্রকাশ করুন'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}