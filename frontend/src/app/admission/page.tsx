'use client';
import { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, CheckCircle2, Sparkles, Printer, User, 
  Phone, MapPin, Calendar, Heart, School, BookOpen, 
  Building, ShieldCheck, Download, RefreshCw, Camera, X
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

export default function AdmissionPage() {
  const [loading, setLoading] = useState(false);
  const [submittedData, setSubmittedData] = useState<any>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
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
    if (!formData.name_bn || !formData.name || !formData.guardian_phone || !formData.date_of_birth) {
      toast.error('দয়া করে আবশ্যকীয় তথ্যগুলো সঠিকভাবে পূরণ করুন!');
      return;
    }

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

      const res = await api.post('/api/students/admissions/apply/', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setSubmittedData({
        application_no: res.data.application_no,
        ...res.data.data,
      });
      toast.success('ভর্তি আবেদন সফলভাবে সম্পন্ন হয়েছে!');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      toast.error('আবেদন জমা দিতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-800 selection:bg-[#C5A059]/30 selection:text-slate-900 py-8 px-4 sm:px-6 lg:px-8 relative font-sans">
      {/* Subtle Islamic Geometric Canvas Background Pattern */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.025] z-0 print:hidden"
        style={{
          backgroundImage: `radial-gradient(#1B4332 1.5px, transparent 1.5px)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Top Navbar / Back Link (Hidden in Print) */}
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between relative z-20 print:hidden">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs sm:text-sm font-medium shadow-xs transition-all hover:-translate-x-1"
        >
          <ArrowLeft className="w-4 h-4 text-[#C5A059]" />
          <span>প্রধান পাতা</span>
        </Link>
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FAF5EB] hover:bg-[#F3EAD5] border border-[#C5A059]/40 text-[#1B4332] text-xs sm:text-sm font-semibold transition-colors shadow-xs"
        >
          <span>ম্যানেজমেন্ট লগইন</span>
        </Link>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* HEADER: BIG INSTITUTION TITLE & APPLICATION NOTICE */}
        <div className="text-center mb-8 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs relative overflow-hidden print:bg-white print:text-black print:border-b-2 print:border-black print:rounded-none print:shadow-none print:p-4">
          <div className="w-20 h-20 mx-auto mb-3 rounded-full overflow-hidden p-[2px] bg-[#C5A059] shadow-md print:w-16 print:h-16">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/logo.jpg" 
              alt="Al Madina Model Madrasa Logo" 
              className="w-full h-full object-cover rounded-full bg-white" 
            />
          </div>

          {/* User's Exact Requirement: Big prominent institution title */}
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#1B4332] tracking-tight print:text-2xl print:text-black print:font-bold">
            আল-মদিনা মডেল মাদ্রাসা এন্ড রিসার্চ ইনস্টিটিউট
          </h1>
          <p className="text-xs sm:text-base text-[#C5A059] font-bold mt-1 tracking-wide print:text-black print:text-xs">
            Al Madina Model Madrasa and Research Institute
          </p>
          <p className="text-xs text-slate-500 mt-1 print:text-gray-700">
            ক-৭৫/২, মহাখালী দক্ষিণপাড়া, বনানী, ঢাকা • হেল্পলাইন: ০১৭১২-৬৩৩২৬৪
          </p>

          <div className="inline-block mt-4 px-5 py-1.5 rounded-full bg-[#FAF5EB] border border-[#C5A059]/40 text-[#1B4332] font-bold text-sm sm:text-base print:bg-gray-100 print:text-black print:border-black">
            📋 অনলাইন ভর্তি আবেদন ফরম — সেশন ২০২৭
          </div>
        </div>

        {/* CONDITION 1: SUCCESSFUL SUBMISSION - DISPLAY APPLICATION SLIP */}
        {submittedData ? (
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-sm relative overflow-hidden print:bg-white print:text-black print:border print:border-black print:rounded-none print:shadow-none print:p-4">
            
            {/* Top Success Badge (Hidden in Print) */}
            <div className="text-center mb-6 print:hidden">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full flex items-center justify-center mx-auto mb-3 shadow-xs">
                <CheckCircle2 size={32} />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">ভর্তি আবেদন সফলভাবে গৃহীত হয়েছে!</h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                নিচের আবেদন স্লিপটি প্রিন্ট অথবা স্ক্রিনশট নিয়ে সংরক্ষণ করুন।
              </p>
            </div>

            {/* Official Slip Content */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 print:bg-white print:border print:border-gray-400 print:text-black">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 print:border-b print:border-black gap-2">
                <div className="flex items-center gap-4">
                  {(photoPreview || submittedData.photo) && (
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 border-[#C5A059] print:border-black shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photoPreview || submittedData.photo}
                        alt={submittedData.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <span className="text-xs text-slate-500 print:text-gray-600 uppercase font-semibold">আবেদন ট্র্যাকিং নম্বর (Application No)</span>
                    <div className="text-2xl sm:text-3xl font-extrabold text-[#1B4332] font-mono print:text-black print:text-2xl">
                      {submittedData.application_no}
                    </div>
                  </div>
                </div>
                <div className="text-left sm:text-right text-xs text-slate-500 print:text-gray-700">
                  <p>আবেদনের তারিখ: {new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  <p className="font-semibold text-[#1B4332] print:text-black">শিক্ষাবর্ষ: ২০২৭</p>
                </div>
              </div>

              {/* Grid of Student Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 text-xs sm:text-sm">
                <div>
                  <span className="text-slate-500 print:text-gray-600">শিক্ষার্থীর নাম (বাংলা):</span>
                  <p className="font-bold text-slate-900 print:text-black text-base">{submittedData.name_bn}</p>
                </div>
                <div>
                  <span className="text-slate-500 print:text-gray-600">শিক্ষার্থীর নাম (English):</span>
                  <p className="font-bold text-slate-900 print:text-black text-base uppercase">{submittedData.name}</p>
                </div>
                <div>
                  <span className="text-slate-500 print:text-gray-600">কাঙ্ক্ষিত বিভাগ / শ্রেণি:</span>
                  <p className="font-semibold text-[#1B4332] print:text-black">{submittedData.desired_program}</p>
                </div>
                <div>
                  <span className="text-slate-500 print:text-gray-600">আবাসিক স্ট্যাটাস:</span>
                  <p className="font-semibold text-slate-900 print:text-black">
                    {submittedData.residential_status === 'residential' ? 'আবাসিক (Residential)' : 'অনাবাসিক (Day Scholar)'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500 print:text-gray-600">জন্ম তারিখ:</span>
                  <p className="font-semibold text-slate-900 print:text-black">{submittedData.date_of_birth}</p>
                </div>
                <div>
                  <span className="text-slate-500 print:text-gray-600">রক্তের গ্রুপ:</span>
                  <p className="font-semibold text-slate-900 print:text-black">{submittedData.blood_group || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-slate-500 print:text-gray-600">পিতার নাম:</span>
                  <p className="font-semibold text-slate-900 print:text-black">{submittedData.father_name_bn || submittedData.father_name}</p>
                </div>
                <div>
                  <span className="text-slate-500 print:text-gray-600">মাতার নাম:</span>
                  <p className="font-semibold text-slate-900 print:text-black">{submittedData.mother_name_bn || submittedData.mother_name}</p>
                </div>
                <div>
                  <span className="text-slate-500 print:text-gray-600">অভিভাবকের মোবাইল:</span>
                  <p className="font-bold text-[#1B4332] print:text-black font-mono">{submittedData.guardian_phone}</p>
                </div>
                <div>
                  <span className="text-slate-500 print:text-gray-600">বর্তমান ঠিকানা:</span>
                  <p className="font-semibold text-slate-900 print:text-black">{submittedData.present_address}</p>
                </div>
              </div>

              {/* Instructions Box */}
              <div className="mt-6 p-4 rounded-xl bg-white border border-slate-200 text-xs text-slate-600 leading-relaxed print:bg-gray-50 print:border print:border-gray-300 print:text-black">
                <span className="font-bold text-[#1B4332] print:text-black">গুরুত্বপূর্ণ নির্দেশনা:</span>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>আবেদন যাচাই-বাছাইয়ের পর সাক্ষাৎকারের সময়সূচি অভিভাবকের মোবাইল নম্বরে SMS/WhatsApp-এর মাধ্যমে জানানো হবে।</li>
                  <li>মৌখিক পরীক্ষার দিন শিক্ষার্থীর ২ কপি পাসপোর্ট সাইজ ছবি ও জন্ম সনদের ফটোকপি সাথে আনতে হবে।</li>
                  <li>যেকোনো প্রয়োজনে যোগাযোগ: <strong className="text-slate-900 print:text-black">০১৭১২-৬৩৩২৬৪</strong> (ক্যাম্পাস: ক-৭৫/২, মহাখালী দক্ষিণপাড়া, বনানী, ঢাকা)।</li>
                </ul>
              </div>

              {/* Signature space for print */}
              <div className="hidden print:flex justify-between items-end mt-12 pt-8 text-xs">
                <div className="text-center border-t border-black px-4 pt-1">
                  অভিভাবকের স্বাক্ষর
                </div>
                <div className="text-center border-t border-black px-4 pt-1">
                  ভর্তি কর্মকর্তার স্বাক্ষর
                </div>
                <div className="text-center border-t border-black px-4 pt-1">
                  প্রিন্সিপাল / অধ্যক্ষ
                </div>
              </div>

            </div>

            {/* Action Buttons (Hidden in Print) */}
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4 print:hidden">
              <button
                onClick={handlePrint}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#1B4332] hover:bg-[#132E23] text-white font-bold text-sm shadow-md transition-all active:scale-95"
              >
                <Printer size={18} />
                <span>স্লিপ প্রিন্ট করুন / PDF ডাউনলোড</span>
              </button>

              <button
                onClick={() => setSubmittedData(null)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 font-semibold text-sm transition-all"
              >
                <RefreshCw size={16} />
                <span>নতুন আরেকটি আবেদন করুন</span>
              </button>
            </div>

          </div>
        ) : (
          /* CONDITION 2: MAIN ADMISSION APPLICATION FORM */
          <div className="space-y-6">
            {/* Campus Highlights Reel */}
            <div className="p-4 sm:p-5 rounded-3xl bg-[#031c0b]/80 border border-emerald-500/25 shadow-xl backdrop-blur-md">
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-xs sm:text-sm font-bold text-amber-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>ক্যাম্পাসের বাস্তব দৃশ্য ও অনন্য বৈশিষ্ট্যসমূহ</span>
                </span>
                <span className="text-[11px] text-emerald-300/70 hidden sm:inline">সেশন ২০২৭ ভর্তি চলছে</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="group rounded-2xl overflow-hidden bg-black/40 border border-white/10 relative aspect-[4/3]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/principal-class.png" alt="অধ্যক্ষের সরাসরি পাঠদান" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex items-end p-2">
                    <span className="text-[10px] font-semibold text-white leading-tight">অধ্যক্ষের সরাসরি পাঠদান</span>
                  </div>
                </div>
                <div className="group rounded-2xl overflow-hidden bg-black/40 border border-white/10 relative aspect-[4/3]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/quran-class.png" alt="হিফজুল কুরআন ক্লাস" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex items-end p-2">
                    <span className="text-[10px] font-semibold text-white leading-tight">হিফজ ও নূরানী শিক্ষা</span>
                  </div>
                </div>
                <div className="group rounded-2xl overflow-hidden bg-black/40 border border-white/10 relative aspect-[4/3]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/guardians-meeting-1.png" alt="মাসিক অভিভাবক সমাবেশ" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex items-end p-2">
                    <span className="text-[10px] font-semibold text-white leading-tight">অভিভাবক সমাবেশ</span>
                  </div>
                </div>
                <div className="group rounded-2xl overflow-hidden bg-black/40 border border-white/10 relative aspect-[4/3]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/awards-crests.png" alt="মেধা পুরস্কার ক্রেস্ট" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex items-end p-2">
                    <span className="text-[10px] font-semibold text-white leading-tight">মেধা সম্মাননা ক্রেস্ট</span>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="glass-card rounded-3xl p-6 sm:p-10 shadow-2xl border border-emerald-500/25 space-y-8 backdrop-blur-2xl">
            
            {/* SECTION 1: STUDENT INFO */}
            <div>
              <div className="flex items-center gap-2 pb-3 mb-5 border-b border-slate-200 text-[#1B4332] font-bold text-base sm:text-lg">
                <User className="text-[#C5A059] w-5 h-5" />
                <span>১. শিক্ষার্থীর ব্যক্তিগত তথ্য</span>
              </div>

              {/* Photo Upload Box (Mobile Camera / PC Files) */}
              <div className="mb-5 p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center gap-4">
                <div className="relative group shrink-0">
                  {photoPreview ? (
                    <div className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photoPreview}
                        alt="শিক্ষার্থীর ছবি"
                        className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-[#C5A059] shadow-md"
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
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400">
                      <Camera className="w-8 h-8 text-slate-400 mb-1" />
                      <span className="text-[10px] font-bold text-slate-400">ছবি নেই</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 text-center sm:text-left space-y-1.5">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                      শিক্ষার্থীর ছবি আপলোড (পাসপোর্ট সাইজ)
                    </h4>
                    <span className="text-[10px] font-semibold text-[#1B4332] bg-[#FAF5EB] border border-[#C5A059]/30 px-2 py-0.5 rounded-full inline-block">
                      ডিজিটাল আইডি ও ভর্তি ফর্ম
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    মোবাইল ক্যামেরা দিয়ে সরাসরি ছবি তুলুন অথবা মোবাইল/পিসির ফাইল থেকে সিলেক্ট করুন (সর্বোচ্চ 5MB)।
                  </p>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                    <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#1B4332] hover:bg-[#132E23] text-white text-xs font-bold shadow-xs cursor-pointer transition active:scale-95">
                      <Camera className="w-3.5 h-3.5 text-[#C5A059]" />
                      <span>{photoPreview ? 'ছবি পরিবর্তন করুন' : 'ক্যামেরা বা ফাইল থেকে ছবি আপলোড'}</span>
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
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-200 hover:bg-rose-100 border border-slate-300 text-rose-600 text-xs font-bold transition"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>ছবি মুছুন</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name Bengali */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    শিক্ষার্থীর নাম (বাংলায়) <span className="text-[#C5A059]">*</span>
                  </label>
                  <input
                    type="text"
                    name="name_bn"
                    value={formData.name_bn}
                    onChange={handleChange}
                    placeholder="যেমন: আবদুল্লাহ আল মাহদী"
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-[#1B4332] focus:bg-white focus:ring-1 focus:ring-[#1B4332]"
                  />
                </div>

                {/* Name English */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    শিক্ষার্থীর নাম (English in Capital) <span className="text-[#C5A059]">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. ABDULLAH AL MAHDI"
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-[#1B4332] focus:bg-white focus:ring-1 focus:ring-[#1B4332] uppercase"
                  />
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    জন্মতারিখ (Date of Birth) <span className="text-[#C5A059]">*</span>
                  </label>
                  <input
                    type="date"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-[#1B4332] focus:bg-white focus:ring-1 focus:ring-[#1B4332]"
                  />
                </div>

                {/* Blood Group */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    রক্তের গ্রুপ (Blood Group)
                  </label>
                  <select
                    name="blood_group"
                    value={formData.blood_group}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-[#1B4332] focus:bg-white focus:ring-1 focus:ring-[#1B4332]"
                  >
                    <option value="A+">A+ (A Positive)</option>
                    <option value="A-">A- (A Negative)</option>
                    <option value="B+">B+ (B Positive)</option>
                    <option value="B-">B- (B Negative)</option>
                    <option value="O+">O+ (O Positive)</option>
                    <option value="O-">O- (O Negative)</option>
                    <option value="AB+">AB+ (AB Positive)</option>
                    <option value="AB-">AB- (AB Negative)</option>
                  </select>
                </div>

                {/* Birth Reg No */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    জন্ম নিবন্ধন নম্বর (১৭ ডিজিট)
                  </label>
                  <input
                    type="text"
                    name="birth_reg_no"
                    value={formData.birth_reg_no}
                    onChange={handleChange}
                    placeholder="জন্ম সনদ নম্বর"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-[#1B4332] focus:bg-white focus:ring-1 focus:ring-[#1B4332]"
                  />
                </div>

                {/* Previous School */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    পূর্ববর্তী স্কুল / মাদ্রাসার নাম (যদি থাকে)
                  </label>
                  <input
                    type="text"
                    name="previous_school"
                    value={formData.previous_school}
                    onChange={handleChange}
                    placeholder="আগে যেখানে পড়তো"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-[#1B4332] focus:bg-white focus:ring-1 focus:ring-[#1B4332]"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: ADMISSION PROGRAM & CLASS */}
            <div>
              <div className="flex items-center gap-2 pb-3 mb-5 border-b border-slate-200 text-[#1B4332] font-bold text-base sm:text-lg">
                <BookOpen className="text-[#C5A059] w-5 h-5" />
                <span>২. যে বিভাগে ভর্তি হতে ইচ্ছুক</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Desired Program */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    কাঙ্ক্ষিত শ্রেণি / বিভাগ <span className="text-[#C5A059]">*</span>
                  </label>
                  <select
                    name="desired_program"
                    value={formData.desired_program}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-[#1B4332] focus:bg-white focus:ring-1 focus:ring-[#1B4332] font-medium"
                  >
                    <optgroup label="জেনারেল একাডেমি (প্লে থেকে ষষ্ঠ)">
                      <option value="প্লে-গ্রুপ">প্লে-গ্রুপ (Play-Group)</option>
                      <option value="নার্সারি">নার্সারি (Nursery)</option>
                      <option value="প্রথম শ্রেণি">প্রথম শ্রেণি (Class 1)</option>
                      <option value="দ্বিতীয় শ্রেণি">দ্বিতীয় শ্রেণি (Class 2)</option>
                      <option value="তৃতীয় শ্রেণি">তৃতীয় শ্রেণি (Class 3)</option>
                      <option value="চতুর্থ শ্রেণি">চতুর্থ শ্রেণি (Class 4)</option>
                      <option value="পঞ্চম শ্রেণি">পঞ্চম শ্রেণি (Class 5)</option>
                      <option value="ষষ্ঠ শ্রেণি">ষষ্ঠ শ্রেণি (Class 6)</option>
                    </optgroup>
                    <optgroup label="ইসলামিক বিভাগসমূহ">
                      <option value="নূরানী ও নাজেরা বিভাগ">নূরানী ও নাজেরা বিভাগ</option>
                      <option value="হিফজুল কুরআন বিভাগ">হিফজুল কুরআন বিভাগ (আন্তর্জাতিক মান)</option>
                      <option value="জেনারেল ও হিফজ সমন্বিত">জেনারেল শিক্ষার পাশাপাশি হিফজুল কুরআন</option>
                    </optgroup>
                  </select>
                </div>

                {/* Residential / Day Scholar */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    আবাসিক নাকি অনাবাসিক? <span className="text-[#C5A059]">*</span>
                  </label>
                  <select
                    name="residential_status"
                    value={formData.residential_status}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-[#1B4332] focus:bg-white focus:ring-1 focus:ring-[#1B4332] font-medium"
                  >
                    <option value="day">অনাবাসিক (Day Scholar - ডে-কেয়ার)</option>
                    <option value="residential">আবাসিক (Residential - হোস্টেল সুবিধা)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SECTION 3: GUARDIAN INFO */}
            <div>
              <div className="flex items-center gap-2 pb-3 mb-5 border-b border-slate-200 text-[#1B4332] font-bold text-base sm:text-lg">
                <Phone className="text-[#C5A059] w-5 h-5" />
                <span>৩. পিতা, মাতা ও অভিভাবকের তথ্য</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Father's Name BN */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    পিতার নাম (বাংলায়) <span className="text-[#C5A059]">*</span>
                  </label>
                  <input
                    type="text"
                    name="father_name_bn"
                    value={formData.father_name_bn}
                    onChange={handleChange}
                    placeholder="পিতার নাম বাংলায়"
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-[#1B4332] focus:bg-white focus:ring-1 focus:ring-[#1B4332]"
                  />
                </div>

                {/* Father's Name EN */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Father&apos;s Name (in English) <span className="text-[#C5A059]">*</span>
                  </label>
                  <input
                    type="text"
                    name="father_name"
                    value={formData.father_name}
                    onChange={handleChange}
                    placeholder="Father's name in English"
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-[#1B4332] focus:bg-white focus:ring-1 focus:ring-[#1B4332] uppercase"
                  />
                </div>

                {/* Mother's Name BN */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    মাতার নাম (বাংলায়) <span className="text-[#C5A059]">*</span>
                  </label>
                  <input
                    type="text"
                    name="mother_name_bn"
                    value={formData.mother_name_bn}
                    onChange={handleChange}
                    placeholder="মাতার নাম বাংলায়"
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-[#1B4332] focus:bg-white focus:ring-1 focus:ring-[#1B4332]"
                  />
                </div>

                {/* Mother's Name EN */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Mother&apos;s Name (in English) <span className="text-[#C5A059]">*</span>
                  </label>
                  <input
                    type="text"
                    name="mother_name"
                    value={formData.mother_name}
                    onChange={handleChange}
                    placeholder="Mother's name in English"
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-[#1B4332] focus:bg-white focus:ring-1 focus:ring-[#1B4332] uppercase"
                  />
                </div>

                {/* Guardian Phone Number */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    অভিভাবকের মোবাইল নম্বর (WhatsApp) <span className="text-[#C5A059]">*</span>
                  </label>
                  <input
                    type="tel"
                    name="guardian_phone"
                    value={formData.guardian_phone}
                    onChange={handleChange}
                    placeholder="01XXXXXXXXX"
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-[#1B4332] focus:bg-white focus:ring-1 focus:ring-[#1B4332]"
                  />
                </div>

                {/* Guardian Relationship */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    অভিভাবকের সাথে সম্পর্ক
                  </label>
                  <select
                    name="guardian_relationship"
                    value={formData.guardian_relationship}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-[#1B4332] focus:bg-white focus:ring-1 focus:ring-[#1B4332]"
                  >
                    <option value="পিতা">পিতা</option>
                    <option value="মাতা">মাতা</option>
                    <option value="বড় ভাই">বড় ভাই</option>
                    <option value="চাচা / মামা">চাচা / মামা</option>
                    <option value="অন্যান্য">অন্যান্য</option>
                  </select>
                </div>

                {/* Present Address */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    বর্তমান যোগাযোগের ঠিকানা <span className="text-[#C5A059]">*</span>
                  </label>
                  <textarea
                    rows={2}
                    name="present_address"
                    value={formData.present_address}
                    onChange={handleChange}
                    placeholder="বাসা নং, রোড নং, এলাকা, থানা, জেলা..."
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-[#1B4332] focus:bg-white focus:ring-1 focus:ring-[#1B4332]"
                  />
                </div>
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-500 text-center sm:text-left">
                * তথ্যগুলো যাচাই করে &ldquo;আবেদন জমা দিন&rdquo; বাটনে ক্লিক করুন।
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl bg-[#1B4332] hover:bg-[#132E23] text-white font-bold text-base shadow-sm hover:shadow-md transition-all active:scale-95 disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>জমা হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <span>ভর্তি আবেদন জমা দিন</span>
                    <Sparkles className="w-4 h-4 text-[#C5A059]" />
                  </>
                )}
              </button>
            </div>

          </form>
          </div>
        )}

      </div>
    </div>
  );
}
