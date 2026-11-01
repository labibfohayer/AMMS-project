'use client';
import AppLayout from '@/components/layout/AppLayout';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { Camera, X, UserCircle, UploadCloud } from 'lucide-react';

export default function AddTeacher() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        name_bn: '',
        phone: '',
        staff_type: 'teacher',
        designation: 'Teacher',
        designation_bn: 'শিক্ষক',
        qualification: '',
        joining_date: new Date().toISOString().split('T')[0],
        monthly_salary: '',
        address: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('ছবির সাইজ সর্বোচ্চ ৫ মেগাবাইট (5MB) হতে পারবে');
                return;
            }
            setPhotoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemovePhoto = () => {
        setPhotoFile(null);
        setPhotoPreview(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = new FormData();
            Object.entries(formData).forEach(([key, val]) => {
                if (val !== undefined && val !== null) {
                    data.append(key, val);
                }
            });
            if (photoFile) {
                data.append('photo', photoFile);
            }

            await api.post('/api/teachers/', data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            toast.success('শিক্ষক/স্টাফ সফলভাবে যুক্ত করা হয়েছে!');
            router.push('/teachers');
        } catch (error) {
            toast.error('শিক্ষক যোগ করতে সমস্যা হয়েছে! তথ্যগুলো চেক করুন।');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AppLayout title="নতুন শিক্ষক/স্টাফ যোগ করুন">
            <div className="max-w-3xl mx-auto bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 mb-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Teacher Photo Upload Box */}
                    <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex flex-col sm:flex-row items-center gap-4">
                        <div className="relative group shrink-0">
                            {photoPreview ? (
                                <div className="relative">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={photoPreview}
                                        alt="শিক্ষকের ছবি"
                                        className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-emerald-600 shadow-md"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleRemovePhoto}
                                        className="absolute -top-2 -right-2 p-1.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white shadow-md transition"
                                        title="ছবি মুছুন"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ) : (
                                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white border-2 border-dashed border-emerald-300 flex flex-col items-center justify-center text-emerald-600 shadow-xs">
                                    <UserCircle className="w-10 h-10 text-emerald-600/70 mb-1" />
                                    <span className="text-[10px] font-bold text-slate-500">ছবি নেই</span>
                                </div>
                            )}
                        </div>

                        <div className="flex-1 text-center sm:text-left space-y-1.5">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                <h4 className="text-xs sm:text-sm font-bold text-slate-800">
                                    শিক্ষক/স্টাফের ছবি আপলোড (পাসপোর্ট সাইজ)
                                </h4>
                                <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full inline-block">
                                    আইডি কার্ড ও ডিজিটাল প্রোফাইল
                                </span>
                            </div>
                            <p className="text-[11px] text-slate-500">
                                মোবাইল ক্যামেরা দিয়ে সরাসরি ছবি তুলুন অথবা মোবাইল/কম্পিউটার ফাইল থেকে ছবি সিলেক্ট করুন (JPG/PNG)।
                            </p>
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                                <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm cursor-pointer transition active:scale-95">
                                    <Camera className="w-3.5 h-3.5 text-amber-300" />
                                    <span>{photoPreview ? 'ছবি পরিবর্তন করুন' : 'মোবাইল বা কম্পিউটার থেকে ছবি আপলোড'}</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handlePhotoChange}
                                        className="hidden"
                                    />
                                </label>
                                {photoPreview && (
                                    <button
                                        type="button"
                                        onClick={handleRemovePhoto}
                                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-rose-50 border border-slate-200 text-rose-600 text-xs font-bold transition"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                        <span>ছবি মুছুন</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">নাম (ইংরেজিতে) *</label>
                            <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">নাম (বাংলায়)</label>
                            <input type="text" name="name_bn" value={formData.name_bn} onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">মোবাইল নম্বর (লগ-ইন আইডি) *</label>
                            <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                            <p className="text-xs text-gray-500 mt-1">এই নম্বরটি দিয়ে তিনি সিস্টেমে লগ-ইন করতে পারবেন</p>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">স্টাফ টাইপ *</label>
                            <select name="staff_type" value={formData.staff_type} onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                                <option value="teacher">শিক্ষক (Teacher)</option>
                                <option value="staff">স্টাফ (Staff)</option>
                                <option value="accountant">হিসাবরক্ষক (Accountant)</option>
                                <option value="other">অন্যান্য (Other)</option>
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">পদবী (ইংরেজিতে) *</label>
                            <input type="text" name="designation" required value={formData.designation} onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">পদবী (বাংলায়)</label>
                            <input type="text" name="designation_bn" value={formData.designation_bn} onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">যোগ্যতা (Qualification) *</label>
                            <input type="text" name="qualification" required value={formData.qualification} onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">যোগদানের তারিখ *</label>
                            <input type="date" name="joining_date" required value={formData.joining_date} onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">মাসিক বেতন (টাকা) *</label>
                            <input type="number" name="monthly_salary" required value={formData.monthly_salary} onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ঠিকানা *</label>
                        <textarea name="address" required value={formData.address} onChange={handleChange} rows={2} className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"></textarea>
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex gap-4">
                        <button type="button" onClick={() => router.back()} className="w-1/3 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
                            বাতিল করুন
                        </button>
                        <button type="submit" disabled={loading} className="w-2/3 bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary-dark transition-colors shadow-lg hover:shadow-xl disabled:opacity-70">
                            {loading ? 'সংরক্ষণ হচ্ছে...' : 'শিক্ষক যোগ করুন'}
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    )
}
