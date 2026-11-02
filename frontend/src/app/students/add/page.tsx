/* eslint-disable */
'use client';

import { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, PlusCircle, Sparkles, User, BookOpen, 
  Phone, Calendar, MapPin, CheckCircle2, RefreshCw,
  Camera, UploadCloud, X
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

export default function AddStudent() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    name_bn: '',
    date_of_birth: '',
    blood_group: 'A+',
    birth_reg_no: '',
    previous_school: '',
    desired_program: 'প্লে-গ্রুপ',
    residential_status: 'day',
    father_name: '',
    father_name_bn: '',
    mother_name: '',
    mother_name_bn: '',
    guardian_phone: '',
    guardian_relationship: 'পিতা',
    present_address: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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
    if (!form.name_bn || !form.name || !form.guardian_phone || !form.date_of_birth) {
      toast.error('দয়া করে আবশ্যকীয় তথ্যগুলো সঠিকভাবে পূরণ করুন!');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, val]) => {
        if (val !== undefined && val !== null) {
          formData.append(key, val);
        }
      });
      if (photoFile) {
        formData.append('photo', photoFile);
      }

      const res = await api.post('/api/students/admissions/apply/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('ভর্তি আবেদন সফলভাবে যুক্ত হয়েছে! এখন রোল ও আইডি বরাদ্দ করুন।', {
        icon: '✅',
        style: {
          borderRadius: '12px',
          background: '#064e3b',
          color: '#fff',
        },
      });
      // Redirect to the admissions portal to approve & allocate roll immediately
      router.push('/students/admissions');
    } catch (err: any) {
      toast.error('ভর্তি তথ্য সংরক্ষণে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout title="নতুন শিক্ষার্থী ভর্তি এন্ট্রি">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header Strip */}
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-[#02200d] text-white p-6 rounded-3xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-emerald-500/20">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>ভর্তি ও রোল বরাদ্দ শাখা</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black">নতুন শিক্ষার্থী ভর্তি ফরম</h1>
            <p className="text-xs text-emerald-200/80 mt-0.5">
              অনলাইন বা সরাসরি আগত নতুন শিক্ষার্থীর তথ্য এন্ট্রি করুন।
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/students/admissions"
              className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 text-xs sm:text-sm font-extrabold shadow-md transition-all active:scale-95"
            >
              <span>অনলাইন আবেদন যাচাই</span>
            </Link>
            <Link
              href="/students"
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Admission Form Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Section 1: Basic Info */}
            <div>
              <h3 className="text-sm font-black text-slate-800 border-b border-slate-200 pb-2 mb-4 flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-600" />
                <span>শিক্ষার্থীর ব্যক্তিগত তথ্য</span>
              </h3>

              {/* Photo Upload Box (Mobile & PC File Support) */}
              <div className="mb-5 p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex flex-col sm:flex-row items-center gap-4">
                <div className="relative group shrink-0">
                  {photoPreview ? (
                    <div className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photoPreview}
                        alt="শিক্ষার্থীর ছবি"
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
                      <Camera className="w-8 h-8 text-emerald-600/70 mb-1" />
                      <span className="text-[10px] font-bold text-slate-500">ছবি নেই</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 text-center sm:text-left space-y-1.5">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-800">
                      শিক্ষার্থীর ছবি আপলোড (পাসপোর্ট সাইজ)
                    </h4>
                    <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full inline-block">
                      আইডি কার্ড ও ডিজিটাল প্রোফাইল
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    মোবাইল ক্যামেরা দিয়ে সরাসরি ছবি তুলুন অথবা মোবাইল/কম্পিউটারের ফাইল থেকে ছবি নির্বাচন করুন।
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    শিক্ষার্থীর পূর্ণ নাম (বাংলা) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name_bn"
                    value={form.name_bn}
                    onChange={handleChange}
                    placeholder="যেমন: মুহাম্মদ তাওহীদ ইসলাম"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    শিক্ষার্থীর নাম (ইংরেজি ক্যাপিটাল) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="MUHAMMED TAWHEED ISLAM"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    জন্ম তারিখ <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="date_of_birth"
                    value={form.date_of_birth}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    রক্তের গ্রুপ
                  </label>
                  <select
                    name="blood_group"
                    value={form.blood_group}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    জন্ম নিবন্ধন সনদ নম্বর
                  </label>
                  <input
                    type="text"
                    name="birth_reg_no"
                    value={form.birth_reg_no}
                    onChange={handleChange}
                    placeholder="১৭ ডিজিটের জন্ম সনদ নং"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    পূর্ববর্তী শিক্ষাপ্রতিষ্ঠান
                  </label>
                  <input
                    type="text"
                    name="previous_school"
                    value={form.previous_school}
                    onChange={handleChange}
                    placeholder="মাদ্রাসার বা স্কুলের নাম (যদি থাকে)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Academic Program & Residential */}
            <div>
              <h3 className="text-sm font-black text-slate-800 border-b border-slate-200 pb-2 mb-4 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                <span>কাঙ্ক্ষিত বিভাগ ও আবাসিক সুবিধা</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ভর্তির কাঙ্ক্ষিত বিভাগ / শ্রেণি <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name="desired_program"
                    value={form.desired_program}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50"
                  >
                    <option value="প্লে-গ্রুপ">প্লে-গ্রুপ (Play Group)</option>
                    <option value="নার্সারি">নার্সারি (Nursery)</option>
                    <option value="নূরানী ও নাজেরা বিভাগ">নূরানী ও নাজেরা বিভাগ</option>
                    <option value="হিফজুল কুরআন বিভাগ">হিফজুল কুরআন বিভাগ</option>
                    <option value="প্রথম শ্রেণি (জেনারেল ও হিফজ)">প্রথম শ্রেণি (জেনারেল ও হিফজ)</option>
                    <option value="দ্বিতীয় শ্রেণি">দ্বিতীয় শ্রেণি (Class 2)</option>
                    <option value="তৃতীয় শ্রেণি">তৃতীয় শ্রেণি (Class 3)</option>
                    <option value="চতুর্থ শ্রেণি">চতুর্থ শ্রেণি (Class 4)</option>
                    <option value="পঞ্চম শ্রেণি">পঞ্চম শ্রেণি (Class 5)</option>
                    <option value="ষষ্ঠ শ্রেণি">ষষ্ঠ শ্রেণি (Class 6)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    আবাসিক অবস্থা <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name="residential_status"
                    value={form.residential_status}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50"
                  >
                    <option value="day">অনাবাসিক (Day Scholar)</option>
                    <option value="residential">আবাসিক (Residential)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 3: Guardian Details */}
            <div>
              <h3 className="text-sm font-black text-slate-800 border-b border-slate-200 pb-2 mb-4 flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-600" />
                <span>অভিভাবকের তথ্য ও যোগাযোগ</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    পিতার নাম <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="father_name"
                    value={form.father_name}
                    onChange={handleChange}
                    placeholder="পিতার নাম লিখুন"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    মাতার নাম <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="mother_name"
                    value={form.mother_name}
                    onChange={handleChange}
                    placeholder="মাতার নাম লিখুন"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    অভিভাবকের মোবাইল নম্বর (লগইন আইডি) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="guardian_phone"
                    value={form.guardian_phone}
                    onChange={handleChange}
                    placeholder="017XXXXXXXX"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-mono font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                  <p className="text-[11px] text-teal-800 font-medium mt-1">
                    💡 অভিভাবক এই মোবাইল নম্বর ও শিক্ষার্থীর জন্মতারিখ (DDMMYYYY) দিয়ে পোর্টালে লগইন করতে পারবেন।
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    অভিভাবকের সাথে সম্পর্ক
                  </label>
                  <select
                    name="guardian_relationship"
                    value={form.guardian_relationship}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50"
                  >
                    <option value="পিতা">পিতা</option>
                    <option value="মাতা">মাতা</option>
                    <option value="বড় ভাই">বড় ভাই</option>
                    <option value="চাচা / মামা">চাচা / মামা</option>
                    <option value="অন্যান্য অভিভাবক">অন্যান্য অভিভাবক</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    বর্তমান যোগাযোগের ঠিকানা <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    name="present_address"
                    value={form.present_address}
                    onChange={handleChange}
                    placeholder="বাসা নং, রোড, এলাকা, থানা ও জেলা..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Submit Bar */}
            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200">
              <Link
                href="/students"
                className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                বাতিল
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-600 hover:to-teal-600 text-white text-xs sm:text-sm font-extrabold shadow-md transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>সংরক্ষণ হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-amber-300" />
                    <span>সংরক্ষণ ও রোল বরাদ্দ স্ক্রিনে যান</span>
                  </>
                )}
              </button>
            </div>

          </form>
        </div>

      </div>
    </AppLayout>
  );
}
