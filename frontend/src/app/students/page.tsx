/* eslint-disable */
'use client';

import AppLayout from '@/components/layout/AppLayout';
import StudentCard from '@/components/ui/StudentCard';
import { Search, Plus, Award, Users, Filter, Printer, Bed, Sparkles, CalendarCheck } from 'lucide-react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import StudentIDCard from '@/components/students/StudentIDCard';
import { toBanglaDigit } from '@/lib/numberToBanglaWords';

export default function Students() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const isPrincipal = user && ['principal', 'vice_principal', 'managing_director', 'admin'].includes(user.role);

    const [search, setSearch] = useState('');
    const [activeIdStudent, setActiveIdStudent] = useState<any | null>(null);

    const { data: students = [], isLoading } = useQuery({
        queryKey: ['students'],
        queryFn: async () => {
            const res = await api.get('/api/students/');
            return res.data;
        }
    });

    const deleteStudentMutation = useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`/api/students/${id}/`);
        },
        onSuccess: () => {
            toast.success('শিক্ষার্থী সফলভাবে তালিকা থেকে মুছে ফেলা হয়েছে');
            queryClient.invalidateQueries({ queryKey: ['students'] });
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.detail || 'শিক্ষার্থী মুছতে সমস্যা হয়েছে');
        }
    });

    const handleDeleteStudent = (student: any) => {
        if (confirm(`আপনি কি নিশ্চিতভাবে "${student.name_bn || student.name}" (রোল: ${student.roll_number || 'N/A'}, আইডি: ${student.student_id}) কে মুছে ফেলতে চান?`)) {
            deleteStudentMutation.mutate(student.id);
        }
    };

    const { data: admissionStats } = useQuery({
        queryKey: ['admission-stats-quick'],
        queryFn: async () => {
            const res = await api.get('/api/students/admissions/stats/?academic_year=2027');
            return res.data;
        }
    });

    const filtered = useMemo(() => {
        if (!search.trim()) return students;
        const q = search.toLowerCase();
        return students.filter((s: any) =>
            s.name?.toLowerCase().includes(q) ||
            s.name_bn?.toLowerCase().includes(q) ||
            s.student_id?.toLowerCase().includes(q) ||
            String(s.roll_number || '').includes(q) ||
            s.islamic_department_name_bn?.toLowerCase().includes(q) ||
            s.general_department_name_bn?.toLowerCase().includes(q)
        );
    }, [students, search]);

    return (
        <AppLayout title="ছাত্র-ছাত্রী ও আইডি কার্ড">
            <div className="space-y-5">
                
                {/* Header Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                            শিক্ষার্থী তালিকা ও আইডি কার্ড পোর্টাল
                        </h2>
                        <p className="text-xs text-gray-500">
                            মোট শিক্ষার্থী: <span className="font-bold text-emerald-800">{toBanglaDigit(students.length)} জন</span> • যেকোনো শিক্ষার্থীর আইডি কার্ড ১-ক্লিকে প্রিন্ট করুন
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <Link
                            href="/students/leaves"
                            className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all active:scale-95"
                            title="শিক্ষার্থী ছুটির আবেদন ও গেটপাস পোর্টাল"
                        >
                            <CalendarCheck size={16} className="text-amber-300" />
                            <span>ছুটি ও গেটপাস</span>
                        </Link>

                        <Link
                            href="/hostel"
                            className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all active:scale-95"
                            title="হোস্টেল ও আবাসিক শিক্ষার্থী রুম ও মিল শিট"
                        >
                            <Bed size={16} className="text-emerald-700" />
                            <span>হোস্টেল ও মেস</span>
                        </Link>

                        <Link
                            href="/students/id-cards"
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-emerald-950 rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all active:scale-95"
                        >
                            <Printer size={16} />
                            <span>বাল্ক আইডি কার্ড প্রিন্ট</span>
                        </Link>
                        
                        <Link
                            href="/students/admissions"
                            className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all active:scale-95 relative"
                            title="অনলাইন ভর্তি আবেদন যাচাই ও রোল বরাদ্দ"
                        >
                            <Sparkles size={16} className="text-amber-600" />
                            <span>অনলাইন ভর্তি আবেদন</span>
                            {Number(admissionStats?.pending || 0) > 0 && (
                                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-500 text-emerald-950 font-black animate-pulse">
                                    {toBanglaDigit(admissionStats.pending)}
                                </span>
                            )}
                        </Link>

                        <Link
                            href="/students/add"
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all active:scale-95"
                        >
                            <Plus size={16} />
                            <span>নতুন শিক্ষার্থী ভর্তি</span>
                        </Link>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-3.5 top-3.5 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="শিক্ষার্থীর নাম, আইডি, রোল অথবা বিভাগ দিয়ে খুঁজুন..." 
                        value={search} 
                        onChange={e => setSearch(e.target.value)} 
                        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 shadow-sm" 
                    />
                </div>

                {/* Students Cards Grid */}
                {isLoading ? (
                    <div className="p-12 text-center text-gray-400 text-sm">শিক্ষার্থীদের তালিকা লোড হচ্ছে...</div>
                ) : filtered.length === 0 ? (
                    <div className="p-12 text-center text-gray-400 text-sm bg-white rounded-2xl border border-dashed border-gray-200">
                        কোনো শিক্ষার্থী পাওয়া যায়নি
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                        {filtered.map((s: any) => (
                            <StudentCard 
                                key={s.id} 
                                student={s} 
                                onPrintId={(studentToPrint) => setActiveIdStudent(studentToPrint)}
                                onDelete={isPrincipal ? handleDeleteStudent : undefined}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* ID CARD MODAL */}
            {activeIdStudent && (
                <StudentIDCard
                    student={{
                        id: activeIdStudent.id,
                        student_id: activeIdStudent.student_id,
                        name: activeIdStudent.name,
                        name_bn: activeIdStudent.name_bn,
                        photo: activeIdStudent.photo,
                        roll_number: activeIdStudent.roll_number,
                        academic_year: activeIdStudent.academic_year || 2027,
                        islamic_department_name: activeIdStudent.islamic_department_name,
                        islamic_department_name_bn: activeIdStudent.islamic_department_name_bn,
                        general_department_name: activeIdStudent.general_department_name,
                        general_department_name_bn: activeIdStudent.general_department_name_bn,
                        guardian_phone: activeIdStudent.guardian_phone,
                        residential_status: activeIdStudent.residential_status
                    }}
                    onClose={() => setActiveIdStudent(null)}
                />
            )}
        </AppLayout>
    );
}
