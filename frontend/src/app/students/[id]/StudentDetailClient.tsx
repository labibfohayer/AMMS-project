/* eslint-disable */
'use client';

import AppLayout from '@/components/layout/AppLayout';
import { 
  UserCircle, Printer, Award, Phone, MapPin, Calendar, BookOpen, 
  CreditCard, ArrowLeft, Trash2, Edit, AlertOctagon, X, Check, ShieldAlert
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { getMediaUrl } from '@/lib/api';
import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import StudentIDCard from '@/components/students/StudentIDCard';
import { toBanglaDigit } from '@/lib/numberToBanglaWords';

export default function StudentDetailClient({ params }: { params?: Promise<{ id: string }> }) {
    const routeParams = useParams();
    const resolvedParams = params ? use(params) : null;
    const id = (routeParams?.id as string) || resolvedParams?.id || '1';
    const router = useRouter();
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const isPrincipal = user && ['principal', 'vice_principal', 'managing_director', 'admin'].includes(user.role);

    const [showIdCard, setShowIdCard] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<string>('active');
    const [expulsionReason, setExpulsionReason] = useState<string>('');

    const { data: student, isLoading: isStudentLoading } = useQuery({
        queryKey: ['student', id],
        queryFn: async () => {
            const res = await api.get(`/api/students/${id}/`);
            return res.data;
        }
    });

    useEffect(() => {
        if (student) {
            setSelectedStatus(student.status || 'active');
            setExpulsionReason(student.expulsion_reason || '');
        }
    }, [student]);

    // Delete Student Mutation
    const deleteMutation = useMutation({
        mutationFn: async () => {
            await api.delete(`/api/students/${id}/`);
        },
        onSuccess: () => {
            toast.success('শিক্ষার্থী সফলভাবে ডাটাবেজ থেকে মুছে ফেলা হয়েছে');
            queryClient.invalidateQueries({ queryKey: ['students'] });
            router.push('/students');
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.detail || 'শিক্ষার্থী মুছতে সমস্যা হয়েছে');
        }
    });

    const handleDelete = () => {
        if (confirm(`আপনি কি নিশ্চিতভাবে শিক্ষার্থী "${student.name_bn || student.name}" (আইডি: ${student.student_id}) কে মুছে ফেলতে চান? এটি স্থায়ীভাবে ডাটাবেজ থেকে মুছে যাবে।`)) {
            deleteMutation.mutate();
        }
    };

    // Update Student Status / Expulsion Mutation
    const statusMutation = useMutation({
        mutationFn: async ({ status, expulsion_reason }: { status: string; expulsion_reason?: string }) => {
            await api.post(`/api/students/${id}/status/`, { status, expulsion_reason });
        },
        onSuccess: () => {
            toast.success('শিক্ষার্থীর স্ট্যাটাস সফলভাবে আপডেট হয়েছে');
            queryClient.invalidateQueries({ queryKey: ['student', id] });
            queryClient.invalidateQueries({ queryKey: ['students'] });
            setShowStatusModal(false);
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.detail || 'স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে');
        }
    });

    // Update Student Full Profile Mutation
    const updateStudentMutation = useMutation({
        mutationFn: async (payload: any) => {
            const res = await api.patch(`/api/students/${id}/`, payload);
            return res.data;
        },
        onSuccess: () => {
            toast.success('শিক্ষার্থীর তথ্য সফলভাবে সংরক্ষিত হয়েছে');
            queryClient.invalidateQueries({ queryKey: ['student', id] });
            queryClient.invalidateQueries({ queryKey: ['students'] });
            setShowEditModal(false);
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.detail || 'তথ্য আপডেট করতে সমস্যা হয়েছে');
        }
    });

    const { data: feesStatus, isLoading: isFeesLoading } = useQuery({
        queryKey: ['fees', id],
        queryFn: async () => {
            const res = await api.get(`/api/fees/students/${id}/status/`);
            return res.data;
        }
    });

    if (isStudentLoading) {
        return (
            <AppLayout title="শিক্ষার্থীর প্রোফাইল">
                <div className="p-12 text-center text-gray-500">লোড হচ্ছে...</div>
            </AppLayout>
        );
    }

    if (!student) {
        return (
            <AppLayout title="শিক্ষার্থীর প্রোফাইল">
                <div className="p-12 text-center text-red-500">শিক্ষার্থী পাওয়া যায়নি।</div>
            </AppLayout>
        );
    }

    const deptName = student.islamic_department_name_bn || student.general_department_name_bn || student.islamic_department_name || student.general_department_name || 'সাধারণ বিভাগ';

    return (
        <AppLayout title="শিক্ষার্থীর প্রোফাইল ও আইডি কার্ড">
            <div className="space-y-6 max-w-4xl mx-auto">
                
                {/* Back button & Action Toolbar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <Link href="/students" className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-800 hover:text-emerald-950">
                        <ArrowLeft className="w-4 h-4" />
                        <span>শিক্ষার্থী তালিকায় ফিরুন</span>
                    </Link>

                    {/* Action Buttons Group */}
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            onClick={() => setShowIdCard(true)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-emerald-950 rounded-xl font-bold text-xs shadow-md transition-all active:scale-95"
                            title="আইডি কার্ড প্রিন্ট করুন"
                        >
                            <Award className="w-4 h-4" />
                            <span>আইডি কার্ড প্রিন্ট</span>
                        </button>

                        {isPrincipal && (
                            <>
                                <button
                                    onClick={() => setShowEditModal(true)}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-emerald-900 border border-emerald-300 rounded-xl font-bold text-xs shadow-xs transition-all active:scale-95"
                                    title="শিক্ষার্থীর তথ্য সম্পাদনা করুন"
                                >
                                    <Edit className="w-3.5 h-3.5 text-emerald-700" />
                                    <span>তথ্য এডিট</span>
                                </button>

                                <button
                                    onClick={() => setShowStatusModal(true)}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 rounded-xl font-bold text-xs shadow-xs transition-all active:scale-95"
                                    title="বহিষ্কার বা স্ট্যাটাস পরিবর্তন করুন"
                                >
                                    <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
                                    <span>বহিষ্কার / স্ট্যাটাস</span>
                                </button>

                                <button
                                    onClick={handleDelete}
                                    disabled={deleteMutation.isPending}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-xl font-bold text-xs shadow-xs transition-all active:scale-95 disabled:opacity-50"
                                    title="শিক্ষার্থী স্থায়ীভাবে মুছে ফেলুন"
                                >
                                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                                    <span>মুছে ফেলুন</span>
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Expulsion Alert Banner (if expelled) */}
                {student.status === 'expelled' && (
                    <div className="bg-rose-50 border-2 border-rose-300 text-rose-950 p-4 rounded-2xl flex items-start gap-3 shadow-xs">
                        <AlertOctagon className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-extrabold text-sm text-rose-900">এই শিক্ষার্থীকে মাদ্রাসা থেকে বহিষ্কার করা হয়েছে</h4>
                            {student.expulsion_reason ? (
                                <p className="text-xs text-rose-800 mt-1 leading-relaxed">
                                    <span className="font-bold">বহিষ্কারের কারণ: </span>{student.expulsion_reason}
                                </p>
                            ) : (
                                <p className="text-xs text-rose-700 mt-1">কোনো কারণ উল্লেখ করা হয়নি।</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Hero Header Card */}
                <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-800 text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden border border-emerald-500/20">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
                        {/* Student Photo Frame */}
                        <div className="w-28 h-32 rounded-2xl bg-white/10 p-1.5 border-2 border-amber-400/40 shadow-lg flex-shrink-0">
                            <div className="w-full h-full bg-emerald-950/80 rounded-xl overflow-hidden flex items-center justify-center">
                                {student.photo ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img 
                                        src={getMediaUrl(student.photo)} 
                                        alt={student.name} 
                                        className="w-full h-full object-cover" 
                                    />
                                ) : (
                                    <UserCircle size={70} className="text-emerald-300/80" />
                                )}
                            </div>
                        </div>

                        <div className="flex-1">
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
                                <span className="px-3 py-0.5 bg-amber-400 text-emerald-950 font-extrabold text-[11px] rounded-full">
                                    শিক্ষাবর্ষ ২০২৭
                                </span>
                                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                    student.status === 'active' 
                                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30' 
                                        : student.status === 'expelled'
                                        ? 'bg-rose-500/30 text-rose-200 border border-rose-400/60 font-black'
                                        : student.status === 'passed_out'
                                        ? 'bg-blue-500/30 text-blue-200 border border-blue-400/40'
                                        : 'bg-red-500/20 text-red-300'
                                }`}>
                                    {student.status === 'active' 
                                        ? 'সক্রিয় শিক্ষার্থী' 
                                        : student.status === 'expelled' 
                                        ? 'মাদ্রাসা থেকে বহিষ্কৃত' 
                                        : student.status === 'passed_out'
                                        ? 'উত্তীর্ণ শিক্ষার্থী'
                                        : 'নিষ্ক্রিয়'}
                                </span>
                                <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-white text-[11px]">
                                    {student.residential_status === 'residential' ? 'আবাসিক' : 'অনাবাসিক'}
                                </span>
                            </div>

                            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                                {student.name_bn}
                            </h1>
                            <p className="text-emerald-200 text-sm font-semibold mb-3">
                                {student.name}
                            </p>

                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-emerald-100">
                                <div className="bg-white/10 px-3 py-1.5 rounded-xl">
                                    <span className="text-emerald-300">আইডি: </span>
                                    <span className="font-mono font-bold text-amber-300">{student.student_id}</span>
                                </div>
                                {student.roll_number && (
                                    <div className="bg-white/10 px-3 py-1.5 rounded-xl">
                                        <span className="text-emerald-300">রোল: </span>
                                        <span className="font-bold">{toBanglaDigit(student.roll_number)}</span>
                                    </div>
                                )}
                                <div className="bg-white/10 px-3 py-1.5 rounded-xl">
                                    <span className="text-emerald-300">বিভাগ: </span>
                                    <span className="font-bold">{deptName}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Profile Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Academic & Personal Box */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/80 space-y-4">
                        <h3 className="font-bold text-base text-gray-900 border-b border-slate-100 pb-2.5 flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-emerald-700" />
                            <span>ব্যক্তিগত ও শিক্ষা তথ্য</span>
                        </h3>

                        <div className="space-y-3 text-xs sm:text-sm">
                            <div className="flex justify-between border-b border-slate-100 pb-2">
                                <span className="text-gray-500">জন্ম তারিখ</span>
                                <span className="font-bold text-gray-800">{student.date_of_birth}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-100 pb-2">
                                <span className="text-gray-500">জন্ম নিবন্ধন সনদ নং</span>
                                <span className="font-mono font-semibold text-gray-800">{student.birth_reg_no || 'সংযুক্ত নেই'}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-100 pb-2">
                                <span className="text-gray-500">পিতার নাম</span>
                                <span className="font-semibold text-gray-800">{student.father_name_bn || student.father_name}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-100 pb-2">
                                <span className="text-gray-500">মাতার নাম</span>
                                <span className="font-semibold text-gray-800">{student.mother_name_bn || student.mother_name}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-100 pb-2">
                                <span className="text-gray-500">বর্তমান ঠিকানা</span>
                                <span className="font-medium text-gray-800 text-right max-w-xs">{student.present_address}</span>
                            </div>
                        </div>
                    </div>

                    {/* Financial & Guardian Contact Box */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/80 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                            <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-emerald-700" />
                                <span>ফি ও অভিভাবক তথ্য</span>
                            </h3>
                            <Link
                                href="/fees"
                                className="text-xs font-bold text-emerald-700 hover:text-emerald-900 underline"
                            >
                                ফি জমা দিন
                            </Link>
                        </div>

                        <div className="space-y-3 text-xs sm:text-sm">
                            <div className="flex justify-between border-b border-slate-100 pb-2">
                                <span className="text-gray-500">অভিভাবক</span>
                                <span className="font-semibold text-gray-800">{student.guardian_name || student.father_name_bn}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-100 pb-2">
                                <span className="text-gray-500">অভিভাবকের মোবাইল</span>
                                <span className="font-mono font-bold text-emerald-800">{student.guardian_phone}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-100 pb-2">
                                <span className="text-gray-500">নির্ধারিত মাসিক বেতন</span>
                                <span className="font-bold text-gray-900">৳ {toBanglaDigit(student.monthly_fee || 0)}/-</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-100 pb-2">
                                <span className="text-gray-500">হোস্টেল ও খাবার ফি</span>
                                <span className="font-bold text-gray-900">৳ {toBanglaDigit(student.hostel_fee || 0)}/-</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-100 pb-2">
                                <span className="text-gray-500">চলতি বছরের বকেয়া বেতন</span>
                                <span className={`font-bold ${feesStatus?.total_due_this_year > 0 ? 'text-red-600' : 'text-emerald-700'}`}>
                                    ৳ {toBanglaDigit(feesStatus?.total_due_this_year || 0)}/-
                                </span>
                            </div>
                        </div>

                        {/* Direct Button to open ID Card and Marksheet */}
                        <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <button
                                onClick={() => setShowIdCard(true)}
                                className="py-3 px-3 bg-slate-100 hover:bg-emerald-50 text-emerald-900 font-bold text-xs rounded-xl border border-emerald-200 transition-colors flex items-center justify-center gap-1.5"
                            >
                                <Printer className="w-4 h-4 text-emerald-700" />
                                <span>আইডি কার্ড প্রিন্ট</span>
                            </button>
                            <Link
                                href="/exams/1"
                                className="py-3 px-3 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs rounded-xl border border-amber-200 transition-colors flex items-center justify-center gap-1.5"
                            >
                                <Award className="w-4 h-4 text-amber-600" />
                                <span>মার্কশিট ও রেজাল্ট</span>
                            </Link>
                        </div>
                    </div>

                </div>

            </div>

            {/* STUDENT ID CARD POPUP MODAL */}
            {showIdCard && (
                <StudentIDCard
                    student={{
                        id: student.id,
                        student_id: student.student_id,
                        name: student.name,
                        name_bn: student.name_bn,
                        photo: student.photo,
                        roll_number: student.roll_number,
                        academic_year: student.academic_year,
                        islamic_department_name: student.islamic_department_name,
                        islamic_department_name_bn: student.islamic_department_name_bn,
                        general_department_name: student.general_department_name,
                        general_department_name_bn: student.general_department_name_bn,
                        guardian_name: student.guardian_name,
                        guardian_phone: student.guardian_phone,
                        present_address: student.present_address,
                        residential_status: student.residential_status
                    }}
                    onClose={() => setShowIdCard(false)}
                />
            )}

            {/* EDIT STUDENT MODAL */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
                    <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-emerald-100 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-800">
                                    <Edit size={18} />
                                </div>
                                <div>
                                    <h3 className="font-black text-gray-900 text-base">শিক্ষার্থীর তথ্য সম্পাদনা</h3>
                                    <p className="text-xs text-gray-500 font-mono">আইডি: {student.student_id}</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowEditModal(false)}
                                className="p-1.5 rounded-xl hover:bg-slate-100 text-gray-400 hover:text-gray-700"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                const form = e.currentTarget;
                                const payload = {
                                    name_bn: (form.elements.namedItem('name_bn') as HTMLInputElement).value,
                                    name: (form.elements.namedItem('name') as HTMLInputElement).value,
                                    roll_number: (form.elements.namedItem('roll_number') as HTMLInputElement).value ? Number((form.elements.namedItem('roll_number') as HTMLInputElement).value) : null,
                                    section: (form.elements.namedItem('section') as HTMLInputElement).value,
                                    father_name_bn: (form.elements.namedItem('father_name_bn') as HTMLInputElement).value,
                                    mother_name_bn: (form.elements.namedItem('mother_name_bn') as HTMLInputElement).value,
                                    guardian_name: (form.elements.namedItem('guardian_name') as HTMLInputElement).value,
                                    guardian_phone: (form.elements.namedItem('guardian_phone') as HTMLInputElement).value,
                                    monthly_fee: (form.elements.namedItem('monthly_fee') as HTMLInputElement).value,
                                    hostel_fee: (form.elements.namedItem('hostel_fee') as HTMLInputElement).value,
                                    residential_status: (form.elements.namedItem('residential_status') as HTMLSelectElement).value,
                                    present_address: (form.elements.namedItem('present_address') as HTMLTextAreaElement).value,
                                };
                                updateStudentMutation.mutate(payload);
                            }}
                            className="space-y-3.5 text-xs sm:text-sm"
                        >
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold text-gray-700 mb-1">শিক্ষার্থীর নাম (বাংলা)</label>
                                    <input
                                        type="text"
                                        name="name_bn"
                                        defaultValue={student.name_bn}
                                        required
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-slate-50 font-medium"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-gray-700 mb-1">শিক্ষার্থীর নাম (English)</label>
                                    <input
                                        type="text"
                                        name="name"
                                        defaultValue={student.name}
                                        required
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-slate-50 font-medium"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold text-gray-700 mb-1">রোল নম্বর</label>
                                    <input
                                        type="number"
                                        name="roll_number"
                                        defaultValue={student.roll_number || ''}
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-slate-50 font-mono font-bold"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-gray-700 mb-1">শাখা (Section)</label>
                                    <input
                                        type="text"
                                        name="section"
                                        defaultValue={student.section || 'A'}
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-slate-50 font-bold"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold text-gray-700 mb-1">পিতার নাম</label>
                                    <input
                                        type="text"
                                        name="father_name_bn"
                                        defaultValue={student.father_name_bn || student.father_name}
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-slate-50"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-gray-700 mb-1">মাতার নাম</label>
                                    <input
                                        type="text"
                                        name="mother_name_bn"
                                        defaultValue={student.mother_name_bn || student.mother_name}
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-slate-50"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold text-gray-700 mb-1">অভিভাবকের নাম</label>
                                    <input
                                        type="text"
                                        name="guardian_name"
                                        defaultValue={student.guardian_name || student.father_name_bn}
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-slate-50 font-medium"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-gray-700 mb-1">অভিভাবকের ফোন নম্বর</label>
                                    <input
                                        type="text"
                                        name="guardian_phone"
                                        defaultValue={student.guardian_phone}
                                        required
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-slate-50 font-mono font-bold"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <label className="block font-bold text-gray-700 mb-1">নির্ধারিত মাসিক বেতন (৳)</label>
                                    <input
                                        type="number"
                                        name="monthly_fee"
                                        defaultValue={student.monthly_fee}
                                        required
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-slate-50 font-mono font-bold"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-gray-700 mb-1">হোস্টেল ফি (৳)</label>
                                    <input
                                        type="number"
                                        name="hostel_fee"
                                        defaultValue={student.hostel_fee || 0}
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-slate-50 font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-gray-700 mb-1">আবাসিক অবস্থা</label>
                                    <select
                                        name="residential_status"
                                        defaultValue={student.residential_status}
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-slate-50 font-medium"
                                    >
                                        <option value="residential">আবাসিক (Residential)</option>
                                        <option value="day">অনাবাসিক (Day Scholar)</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block font-bold text-gray-700 mb-1">বর্তমান ঠিকানা</label>
                                <textarea
                                    name="present_address"
                                    defaultValue={student.present_address}
                                    rows={2}
                                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-slate-50"
                                />
                            </div>

                            <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition"
                                >
                                    বাতিল
                                </button>
                                <button
                                    type="submit"
                                    disabled={updateStudentMutation.isPending}
                                    className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold transition shadow-md disabled:opacity-50"
                                >
                                    {updateStudentMutation.isPending ? 'সংরক্ষণ হচ্ছে...' : 'আপডেট সংরক্ষণ করুন'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* EXPULSION / STATUS UPDATE MODAL */}
            {showStatusModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-amber-100">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-xl bg-amber-50 text-amber-800">
                                    <ShieldAlert size={18} />
                                </div>
                                <div>
                                    <h3 className="font-black text-gray-900 text-base">শিক্ষার্থী স্ট্যাটাস ও বহিষ্কার</h3>
                                    <p className="text-xs text-gray-500 font-mono">{student.name_bn || student.name}</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowStatusModal(false)}
                                className="p-1.5 rounded-xl hover:bg-slate-100 text-gray-400 hover:text-gray-700"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                statusMutation.mutate({
                                    status: selectedStatus,
                                    expulsion_reason: selectedStatus === 'expelled' ? expulsionReason : ''
                                });
                            }}
                            className="space-y-4 text-xs sm:text-sm"
                        >
                            <div>
                                <label className="block font-bold text-gray-700 mb-1.5">শিক্ষার্থীর বর্তমান অবস্থা নির্বাচন করুন</label>
                                <select
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-600 bg-slate-50 font-bold"
                                >
                                    <option value="active">✅ সক্রিয় শিক্ষার্থী (Active)</option>
                                    <option value="inactive">⏸️ সাময়িক নিষ্ক্রিয় (Inactive)</option>
                                    <option value="expelled">🚫 মাদ্রাসা থেকে বহিষ্কৃত (Expelled)</option>
                                    <option value="passed_out">🎓 উত্তীর্ণ / শিক্ষা সমাপ্ত (Passed Out)</option>
                                </select>
                            </div>

                            {selectedStatus === 'expelled' && (
                                <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl space-y-2 animate-in fade-in">
                                    <label className="block font-bold text-rose-900">
                                        বহিষ্কারের সুনির্দিষ্ট কারণ উল্লেখ করুন:
                                    </label>
                                    <textarea
                                        value={expulsionReason}
                                        onChange={(e) => setExpulsionReason(e.target.value)}
                                        placeholder="যেমন: মাদ্রাসার অভ্যন্তরীণ নিয়ম ও শৃঙ্খলাভঙ্গ, কর্তৃপক্ষের নির্দেশ অমান্য..."
                                        rows={3}
                                        required
                                        className="w-full p-2.5 rounded-xl border border-rose-200 focus:outline-none focus:border-rose-500 bg-white text-rose-950 placeholder-rose-300 text-xs"
                                    />
                                    <p className="text-[11px] text-rose-700 leading-tight">
                                        ⚠️ বহিষ্কার কার্যকর হলে শিক্ষার্থীর প্রোফাইলে সতর্কবার্তা প্রদর্শিত হবে।
                                    </p>
                                </div>
                            )}

                            <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setShowStatusModal(false)}
                                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition"
                                >
                                    বাতিল
                                </button>
                                <button
                                    type="submit"
                                    disabled={statusMutation.isPending}
                                    className={`px-5 py-2 rounded-xl text-white font-bold transition shadow-md disabled:opacity-50 ${
                                        selectedStatus === 'expelled' 
                                            ? 'bg-rose-600 hover:bg-rose-700' 
                                            : 'bg-emerald-700 hover:bg-emerald-800'
                                    }`}
                                >
                                    {statusMutation.isPending ? 'সংরক্ষণ হচ্ছে...' : 'স্ট্যাটাস আপডেট করুন'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
