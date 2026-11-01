"use client";
import AppLayout from '@/components/layout/AppLayout';
import { useState } from 'react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { UserCheck, ShieldCheck } from 'lucide-react';

export default function Attendance() {
    const [attendance, setAttendance] = useState<Record<number, boolean>>({ 1: true, 2: true, 3: false });
    const [loading, setLoading] = useState(false);

    const toggle = (id: number, status: boolean) => {
        setAttendance(prev => ({...prev, [id]: status}));
    };

    const handleSubmit = () => {
        setLoading(true);
        setTimeout(() => {
            toast.success('উপস্থিতি সফলভাবে সেভ হয়েছে!');
            setLoading(false);
        }, 800);
    };

    return (
        <AppLayout title="উপস্থিতি">
            <div className="flex flex-wrap items-center gap-2 mb-4 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                <button className="flex-1 py-2 rounded-lg bg-white shadow-sm text-emerald-900 font-extrabold text-center">
                    ছাত্রদের উপস্থিতি
                </button>
                <Link href="/students/leaves" className="flex-1 py-2 rounded-lg text-slate-600 hover:text-emerald-800 text-center flex items-center justify-center gap-1.5 transition-colors">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>ছুটি ও গেটপাস</span>
                </Link>
                <Link href="/teachers" className="flex-1 py-2 rounded-lg text-slate-600 hover:text-emerald-800 text-center flex items-center justify-center gap-1.5 transition-colors">
                    <UserCheck className="w-4 h-4 text-emerald-600" />
                    <span>শিক্ষক হাজিরা ও বেতন</span>
                </Link>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm mb-4">
                <select className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary mb-3">
                    <option>শ্রেণী নির্বাচন করুন</option>
                    <option>প্রথম শ্রেণী</option>
                    <option>দ্বিতীয় শ্রেণী</option>
                </select>
                <input type="date" className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary" defaultValue={new Date().toISOString().split('T')[0]} />
            </div>
            <div className="space-y-2 mb-20">
                {[1,2,3].map(i => (
                    <div key={i} className="bg-white p-3 rounded-lg shadow-sm flex items-center justify-between hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                <span className="text-gray-500 font-bold text-xs">{i}</span>
                            </div>
                            <div>
                                <h4 className="font-medium text-sm">ছাত্রের নাম {i}</h4>
                                <p className="text-xs text-gray-500">রোল: {i}</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => toggle(i, true)} className={`w-8 h-8 rounded-full flex items-center justify-center font-bold transition-colors ${attendance[i] ? 'bg-green-500 text-white shadow-md' : 'bg-gray-100 text-gray-400 hover:bg-green-100'}`}>✓</button>
                            <button onClick={() => toggle(i, false)} className={`w-8 h-8 rounded-full flex items-center justify-center font-bold transition-colors ${!attendance[i] ? 'bg-red-500 text-white shadow-md' : 'bg-gray-100 text-gray-400 hover:bg-red-100'}`}>✗</button>
                        </div>
                    </div>
                ))}
            </div>
            <div className="fixed bottom-[72px] md:bottom-0 left-0 md:left-64 right-0 p-4 bg-white border-t border-gray-200 z-40">
                <button onClick={handleSubmit} disabled={loading} className="w-full max-w-6xl mx-auto block bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary-dark transition-colors shadow-lg hover:shadow-xl disabled:opacity-70">
                    {loading ? 'সেভ হচ্ছে...' : 'উপস্থিতি সাবমিট করুন'}
                </button>
            </div>
        </AppLayout>
    )
}
