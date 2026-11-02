/* eslint-disable */
'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Save, Bell, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function AddNotice() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [titleBn, setTitleBn] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [bodyBn, setBodyBn] = useState('');
  const [bodyEn, setBodyEn] = useState('');
  const [target, setTarget] = useState('all');

  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post('/api/notices/create/', payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success('নতুন নোটিশ সফলভাবে প্রকাশ করা হয়েছে!');
      queryClient.invalidateQueries({ queryKey: ['notices'] });
      router.push('/notices');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.detail || err.response?.data?.title_bn || 'নোটিশ প্রকাশ করতে সমস্যা হয়েছে।';
      toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    }
  });

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

    createMutation.mutate({
      title_bn: titleBn.trim(),
      title: titleEn.trim() || titleBn.trim(),
      body_bn: bodyBn.trim(),
      body: bodyEn.trim() || bodyBn.trim(),
      target: target
    });
  };

  return (
    <AppLayout title="নতুন নোটিশ প্রকাশ">
      <div className="max-w-3xl mx-auto space-y-5">
        
        {/* Navigation Back */}
        <Link 
          href="/notices" 
          className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-800 hover:text-emerald-950 transition-colors"
        >
          <ArrowLeft size={16} />
          <span>সকল নোটিশের তালিকায় ফিরুন</span>
        </Link>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden">
          
          <div className="p-6 bg-gradient-to-r from-emerald-950 to-emerald-900 text-white flex items-center justify-between border-b border-emerald-500/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-300">
                <Bell size={20} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">নতুন নোটিশ তৈরি ও প্রকাশ</h1>
                <p className="text-xs text-emerald-200/80">আল-মদিনা মডেল মাদ্রাসা এন্ড রিসার্চ ইনস্টিটিউট</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                নোটিশের শিরোনাম (বাংলায়) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={titleBn}
                onChange={(e) => setTitleBn(e.target.value)}
                placeholder="যেমন: মাসিক অভিভাবক সমাবেশ ও ফলাফল প্রকাশ সংক্রান্ত বিজ্ঞপ্তি"
                className="w-full py-2.5 px-3.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                নোটিশের শিরোনাম (ইংরেজিতে - ঐচ্ছিক)
              </label>
              <input
                type="text"
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                placeholder="e.g. Monthly Guardians Meeting & Result Notice"
                className="w-full py-2.5 px-3.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                প্রাপক নির্বাচন (Target Audience) <span className="text-rose-500">*</span>
              </label>
              <select
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className="w-full py-2.5 px-3.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              >
                <option value="all">📢 সকলের জন্য (All - অভিভাবক, শিক্ষার্থী, শিক্ষক ও স্টাফ)</option>
                <option value="guardians">👨‍👩‍👧 শুধুমাত্র সম্মানিত অভিভাবকবৃন্দ (Guardians only)</option>
                <option value="students">🎓 শুধুমাত্র শিক্ষার্থীবৃন্দ (Students only)</option>
                <option value="teachers">👨‍🏫 শুধুমাত্র সম্মানিত শিক্ষকবৃন্দ (Teachers only)</option>
                <option value="staff">💼 শুধুমাত্র কর্মচারী ও স্টাফবৃন্দ (Staff only)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                বিস্তারিত নোটিশ ও বিবরণ (বাংলায়) <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={5}
                value={bodyBn}
                onChange={(e) => setBodyBn(e.target.value)}
                placeholder="এখানে বিস্তারিত নোটিশ, তারিখ ও নির্দেশনা লিখুন..."
                className="w-full p-3.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                বিস্তারিত নোটিশ (ইংরেজিতে - ঐচ্ছিক)
              </label>
              <textarea
                rows={3}
                value={bodyEn}
                onChange={(e) => setBodyEn(e.target.value)}
                placeholder="Notice details in English (optional)..."
                className="w-full p-3.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <Link
                href="/notices"
                className="py-2.5 px-5 border border-slate-200 text-xs font-semibold text-gray-600 rounded-xl hover:bg-slate-50 transition-colors"
              >
                বাতিল
              </Link>
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-emerald-800 to-emerald-700 hover:from-emerald-700 hover:to-emerald-600 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Save size={16} />
                <span>{createMutation.isPending ? 'প্রকাশ হচ্ছে...' : 'নোটিশ প্রকাশ করুন'}</span>
              </button>
            </div>
          </form>

        </div>
      </div>
    </AppLayout>
  );
}