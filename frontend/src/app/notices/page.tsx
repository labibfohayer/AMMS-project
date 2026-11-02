/* eslint-disable */
'use client';

import React, { useState, useMemo } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import Link from 'next/link';
import { 
  Plus, Bell, Calendar, Sparkles, Search, Filter, 
  Trash2, Edit, MessageSquare, AlertTriangle, Send, CheckCircle, Users 
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { toBanglaDigit } from '@/lib/numberToBanglaWords';
import NoticeFormModal from '@/components/notices/NoticeFormModal';

const TARGET_MAP: { [key: string]: { label: string; color: string } } = {
  all: { label: '📢 সকলের জন্য', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  guardians: { label: '👨‍👩‍👧 অভিভাবকবৃন্দ', color: 'bg-blue-50 text-blue-800 border-blue-200' },
  students: { label: '🎓 শিক্ষার্থীবৃন্দ', color: 'bg-purple-50 text-purple-800 border-purple-200' },
  teachers: { label: '👨‍🏫 সম্মানিত শিক্ষক', color: 'bg-amber-50 text-amber-800 border-amber-200' },
  staff: { label: '💼 স্টাফ ও কর্মী', color: 'bg-slate-50 text-slate-800 border-slate-200' },
};

export default function NoticesPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTarget, setSelectedTarget] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<any | null>(null);
  const [deletingNotice, setDeletingNotice] = useState<any | null>(null);
  const [broadcastingId, setBroadcastingId] = useState<number | null>(null);

  const { data: notices = [], isLoading, error } = useQuery({
    queryKey: ['notices'],
    queryFn: async () => {
      const res = await api.get('/api/notices/');
      return res.data;
    }
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/api/notices/${id}/`);
    },
    onSuccess: () => {
      toast.success('নোটিশটি সফলভাবে মুছে ফেলা হয়েছে!');
      queryClient.invalidateQueries({ queryKey: ['notices'] });
      setDeletingNotice(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || 'নোটিশ মুছতে ব্যর্থ হয়েছে।');
    }
  });

  // WhatsApp Broadcast
  const handleBroadcast = async (notice: any) => {
    if (!confirm(`আপনি কি "${notice.title_bn || notice.title}" নোটিশটি হোয়াটসঅ্যাপে পাঠাতে চান?`)) {
      return;
    }
    setBroadcastingId(notice.id);
    try {
      const res = await api.post(`/api/notices/${notice.id}/broadcast/`);
      toast.success(res.data?.message || 'নোটিশটি সফলভাবে হোয়াটসঅ্যাপে সম্প্রচার করা হয়েছে!');
      queryClient.invalidateQueries({ queryKey: ['notices'] });
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'হোয়াটসঅ্যাপে পাঠাতে সমস্যা হয়েছে।');
    } finally {
      setBroadcastingId(null);
    }
  };

  const canManage = user && ['principal', 'vice_principal', 'managing_director', 'teacher', 'staff'].includes(user.role);

  const handleOpenCreate = () => {
    setEditingNotice(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (notice: any) => {
    setEditingNotice(notice);
    setIsModalOpen(true);
  };

  const filteredNotices = useMemo(() => {
    return notices.filter((n: any) => {
      const matchesTarget = selectedTarget === 'all' || n.target === selectedTarget || n.target === 'all';
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch = !q || 
        n.title?.toLowerCase().includes(q) ||
        n.title_bn?.toLowerCase().includes(q) ||
        n.body?.toLowerCase().includes(q) ||
        n.body_bn?.toLowerCase().includes(q);
      return matchesTarget && matchesSearch;
    });
  }, [notices, selectedTarget, searchTerm]);

  return (
    <AppLayout title="নোটিশ বোর্ড ও সার্কুলার">
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
                ডিজিটাল নোটিশ বোর্ড ও সার্কুলার
              </h1>
              <p className="text-emerald-200/80 text-xs sm:text-sm mt-1 max-w-2xl">
                মাদ্রাসার সকল বিভাগ, শিক্ষার্থী, শিক্ষক ও সম্মানিত অভিভাবকদের জন্য জরুরি বিজ্ঞপ্তি, নোটিশ ও ছুটির নির্দেশনা।
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Add Notice Action Button */}
              {canManage && (
                <button
                  type="button"
                  onClick={handleOpenCreate}
                  className="px-4 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95 shrink-0"
                >
                  <Plus size={18} className="stroke-[2.5]" />
                  <span>নতুন নোটিশ প্রকাশ করুন</span>
                </button>
              )}

              <div className="bg-black/30 border border-white/10 px-4 py-2 rounded-2xl text-center backdrop-blur-md shrink-0">
                <span className="text-[11px] text-emerald-200 block">মোট নোটিশ</span>
                <span className="text-xl font-bold text-amber-400 font-mono">
                  {toBanglaDigit(notices.length)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="নোটিশ খুঁজুন..."
              className="w-full pl-9 pr-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            <span className="text-xs font-semibold text-gray-500 flex items-center gap-1 shrink-0">
              <Filter size={14} /> প্রাপক:
            </span>
            <select
              value={selectedTarget}
              onChange={(e) => setSelectedTarget(e.target.value)}
              className="py-1.5 px-3 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            >
              <option value="all">সকল নোটিশ</option>
              <option value="guardians">অভিভাবকবৃন্দ</option>
              <option value="students">শিক্ষার্থীবৃন্দ</option>
              <option value="teachers">শিক্ষকবৃন্দ</option>
              <option value="staff">স্টাফবৃন্দ</option>
            </select>
          </div>
        </div>

        {/* Notices List */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl shadow-sm border border-slate-100">
            <div className="w-10 h-10 border-4 border-emerald-600/20 border-t-emerald-600 rounded-full animate-spin mb-3"></div>
            <p className="text-gray-500 text-xs font-medium">নোটিশ তালিকা লোড হচ্ছে...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-500 p-6 rounded-3xl border border-red-100 text-center text-sm">
            নোটিশ লোড করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।
          </div>
        ) : filteredNotices.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl shadow-sm border border-slate-100 text-center">
            <Bell className="mx-auto text-gray-300 mb-3" size={48} />
            <h3 className="text-lg font-bold text-gray-700 mb-1">কোনো নোটিশ পাওয়া যায়নি</h3>
            <p className="text-xs text-gray-500 mb-4">এই ক্যাটাগরিতে এখনো কোনো নোটিশ নেই।</p>
            {canManage && (
              <button
                onClick={handleOpenCreate}
                className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-md inline-flex items-center gap-2 cursor-pointer"
              >
                <Plus size={16} />
                <span>নতুন নোটিশ দিন</span>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotices.map((n: any) => {
              const targetInfo = TARGET_MAP[n.target] || TARGET_MAP.all;
              const formattedDate = new Date(n.created_at).toLocaleDateString('bn-BD', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              });

              return (
                <div 
                  key={n.id}
                  className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-all border border-slate-100 flex flex-col justify-between group"
                >
                  <div>
                    {/* Top Badges & Management Buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${targetInfo.color}`}>
                          {targetInfo.label}
                        </span>

                        <span className="text-[11px] text-gray-400 flex items-center gap-1 font-medium">
                          <Calendar size={13} className="text-gray-400" />
                          <span>{formattedDate}</span>
                        </span>

                        {n.whatsapp_sent && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                            <CheckCircle size={11} /> হোয়াটসঅ্যাপে প্রেরিত
                          </span>
                        )}
                      </div>

                      {/* Management Action Buttons (Edit, Delete, Broadcast) */}
                      {canManage && (
                        <div className="flex items-center gap-1.5">
                          {/* Send WhatsApp Broadcast Button */}
                          <button
                            type="button"
                            onClick={() => handleBroadcast(n)}
                            disabled={broadcastingId === n.id}
                            title="অভিভাবকদের হোয়াটসঅ্যাপে নোটিশটি পাঠান"
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold border border-emerald-200/80 transition-colors cursor-pointer disabled:opacity-50"
                          >
                            <MessageSquare size={13} className="text-emerald-700" />
                            <span className="hidden sm:inline">
                              {broadcastingId === n.id ? 'পাঠানো হচ্ছে...' : 'হোয়াটসঅ্যাপে পাঠান'}
                            </span>
                          </button>

                          {/* Edit Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(n)}
                            title="নোটিশ এডিট করুন"
                            className="p-1.5 text-gray-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit size={16} />
                          </button>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => setDeletingNotice(n)}
                            title="নোটিশ মুছে ফেলুন"
                            className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Notice Titles */}
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 leading-snug group-hover:text-emerald-800 transition-colors mb-1">
                      {n.title_bn || n.title}
                    </h3>

                    {n.title && n.title_bn && n.title !== n.title_bn && (
                      <p className="text-xs text-gray-400 font-medium mb-3">
                        {n.title}
                      </p>
                    )}

                    {/* Notice Body */}
                    <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-100 text-gray-700 text-xs sm:text-sm leading-relaxed whitespace-pre-line mt-2">
                      {n.body_bn || n.body || n.content}
                    </div>

                    {n.body && n.body_bn && n.body !== n.body_bn && (
                      <p className="text-xs text-gray-400 italic mt-2 px-1">
                        English: {n.body}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-gray-400">
                    <span>আল-মদিনা মডেল মাদ্রাসা এন্ড রিসার্চ ইনস্টিটিউট কর্তৃপক্ষ</span>
                    <span className="font-mono text-[10px]">আইডি: #{n.id}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Add / Edit Notice Modal */}
      <NoticeFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingNotice}
        onSaved={() => queryClient.invalidateQueries({ queryKey: ['notices'] })}
      />

      {/* Delete Notice Confirmation Modal */}
      {deletingNotice && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 border border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-100">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-1">
              নোটিশটি মুছে ফেলতে চান?
            </h3>
            <p className="text-xs text-gray-500 text-center mb-6">
              <span className="font-bold text-gray-800">
                "{deletingNotice.title_bn || deletingNotice.title}"
              </span>
              <br />
              মুছে ফেললে এটি ওয়েবসাইট ও ব্যবহারকারীদের ড্যাশবোর্ড থেকে চিরতরে অপসারিত হবে।
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setDeletingNotice(null)}
                className="flex-1 py-2.5 border border-slate-200 text-xs font-semibold text-gray-600 rounded-xl hover:bg-slate-50 transition-colors"
              >
                বাতিল
              </button>
              <button
                type="button"
                disabled={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate(deletingNotice.id)}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-all shadow-md disabled:opacity-50 cursor-pointer"
              >
                {deleteMutation.isPending ? 'মুছে ফেলা হচ্ছে...' : 'হ্যাঁ, মুছে ফেলুন'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Add Notice Button on Mobile */}
      {canManage && (
        <button
          onClick={handleOpenCreate}
          className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-tr from-amber-500 to-amber-400 text-emerald-950 rounded-full flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all z-40 cursor-pointer border-2 border-white"
          title="নতুন নোটিশ প্রকাশ করুন"
        >
          <Plus size={26} className="stroke-[2.5]" />
        </button>
      )}

    </AppLayout>
  );
}