/* eslint-disable */
'use client';

import React, { use } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import PrintableGatePass from '@/components/students/PrintableGatePass';
import Link from 'next/link';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';

interface GatePassPageProps {
  params?: Promise<{ id: string }>;
}

export default function GatepassClient({ params }: GatePassPageProps) {
  const routeParams = useParams();
  const resolvedParams = params ? use(params) : null;
  const leaveId = (routeParams?.id as string) || resolvedParams?.id || '1';

  const { data: leave, isLoading, isError } = useQuery({
    queryKey: ['single_student_leave_gatepass', leaveId],
    queryFn: async () => {
      const res = await api.get(`/api/students/leaves/${leaveId}/`);
      return res.data;
    },
    enabled: !!leaveId
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-4">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mb-3" />
        <p className="text-sm font-medium text-slate-300">ডিজিটাল গেটপাস ও ক্লিয়ারেন্স লোড হচ্ছে...</p>
      </div>
    );
  }

  if (isError || !leave) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center border border-red-500/20 mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">গেটপাস রেকর্ড পাওয়া যায়নি</h2>
        <p className="text-xs text-slate-400 max-w-sm mb-6">
          অনুরোধকৃত গেটপাস আইডি সঠিক নয় অথবা অনুমোদন প্রক্রিয়াধীন রয়েছে।
        </p>
        <Link
          href="/students/leaves"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>ছুটির তালিকায় ফিরে যান</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950/90 py-6 sm:py-10 px-2 sm:px-4">
      <div className="max-w-3xl mx-auto mb-4 flex items-center justify-between print:hidden">
        <Link
          href="/students/leaves"
          className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>সকল ছুটির আবেদনে ফিরে যান</span>
        </Link>
        <span className="text-xs text-slate-400 font-mono">
          Al Madina Madrasah • Digital Security Verification
        </span>
      </div>

      <PrintableGatePass gatePass={leave} />
    </div>
  );
}
