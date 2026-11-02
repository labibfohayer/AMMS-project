'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, User, Lock, ArrowLeft, Sparkles, ShieldCheck, GraduationCap } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import { isLoggedIn } from '@/lib/auth';

export default function LoginPage() {
  const { user, isAuthenticated, setUser } = useAuth();
  const { t, isBangla } = useLanguage();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // If already authenticated, redirect immediately to the correct portal
  useEffect(() => {
    if (isLoggedIn() && user) {
      const targetUrl = ['principal', 'vice_principal', 'managing_director', 'teacher', 'staff'].includes(user.role)
        ? '/dashboard'
        : user.role === 'guardian'
        ? '/guardian'
        : '/student';
      router.replace(targetUrl);
    }
  }, [user, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanIdentifier = phone.trim();
    const cleanPassword = password.trim();

    if (!cleanIdentifier || !cleanPassword) {
      toast.error(isBangla ? 'অনুগ্রহ করে আইডি/মোবাইল নম্বর ও পাসওয়ার্ড দিন' : 'Please enter ID/Mobile and Password');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/api/auth/login/', { 
        phone: cleanIdentifier, 
        password: cleanPassword 
      });
      const { access, refresh, role, user_id, name, name_bn, photo, phone: userPhone } = res.data;

      // 1. Save tokens and user synchronously in localStorage
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      const userData = { role, user_id, name, name_bn, photo, phone: userPhone };
      localStorage.setItem('user', JSON.stringify(userData));

      // 2. Synchronously notify AuthContext
      setUser(userData);

      toast.success(isBangla ? 'সফলভাবে লগ-ইন হয়েছে!' : 'Logged in successfully!');

      // 3. Determine target portal
      const targetUrl = ['principal', 'vice_principal', 'managing_director', 'teacher', 'staff'].includes(role)
        ? '/dashboard'
        : role === 'guardian'
        ? '/guardian'
        : '/student';

      // 4. Navigate using window.location.replace to eliminate browser back-loop
      window.location.replace(targetUrl);
    } catch (err: any) {
      const errMsg = err?.response?.data?.detail || (isBangla ? 'মোবাইল নম্বর, স্টুডেন্ট আইডি বা পাসওয়ার্ড সঠিক নয়!' : 'Invalid ID/Mobile number or password!');
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 md:p-8 bg-[#F8F9FA] overflow-hidden">
      {/* Subtle Islamic Geometric Mesh Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none" 
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%231B4332' stroke-width='1'%3E%3Cpath d='M30 0 L60 30 L30 60 L0 30 Z'/%3E%3Ccircle cx='30' cy='30' r='10'/%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Top Floating Back Link & Language Switcher */}
      <div className="absolute top-6 left-6 z-30">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-sm font-semibold shadow-xs transition-all hover:-translate-x-0.5"
        >
          <ArrowLeft className="w-4 h-4 text-[#C5A059]" />
          <span>{isBangla ? 'প্রধান পাতা' : 'Home'}</span>
        </Link>
      </div>

      <div className="absolute top-6 right-6 z-30">
        <LanguageSwitcher variant="light" />
      </div>

      {/* Main Institutional Card */}
      <div className="relative z-20 w-full max-w-md mx-auto">
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-200/90 relative overflow-hidden">
          {/* Subtle Top Brass Light Beam */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#C5A059] to-transparent" />

          {/* Logo Emblem */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="relative mb-3 group">
              <div className="relative w-20 h-20 rounded-full p-[2px] bg-[#C5A059] shadow-md overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo.jpg"
                  alt="Al Madina Model Madrasa Logo"
                  className="w-full h-full object-cover rounded-full bg-white"
                />
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#F4EEDF] border border-[#E2D4BA] text-[#8C6D28] text-xs font-semibold mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>নিরাপদ লগইন পোর্টাল</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#16382C]">
              আল-মদিনা মডেল মাদ্রাসা
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              এন্ড রিসার্চ ইনস্টিটিউট • ডিজিটাল ম্যানেজমেন্ট
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Phone / User ID */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 flex items-center justify-between">
                <span>{isBangla ? 'মোবাইল নম্বর / স্টুডেন্ট আইডি' : 'Mobile Number / Student ID'}</span>
              </label>
              <div className="relative group">
                <User className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-[#1B4332] transition-colors" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={isBangla ? "017XXXXXXXX বা স্টুডেন্ট আইডি" : "017XXXXXXXX or Student ID"}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 focus:bg-white border border-slate-200 focus:border-[#1B4332] rounded-xl text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332]/20 transition-all font-medium"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 flex items-center justify-between">
                <span>{isBangla ? 'পাসওয়ার্ড' : 'Password'}</span>
              </label>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-[#1B4332] transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isBangla ? "আপনার পাসওয়ার্ড লিখুন" : "Enter your password"}
                  className="w-full pl-11 pr-12 py-3 bg-slate-50 focus:bg-white border border-slate-200 focus:border-[#1B4332] rounded-xl text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332]/20 transition-all font-medium"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-gray-400 hover:text-[#1B4332] transition-colors cursor-pointer"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 mt-2 rounded-xl text-white font-bold text-base bg-[#1B4332] hover:bg-[#16382C] active:scale-[0.99] shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{isBangla ? 'যাচাই হচ্ছে...' : 'Verifying...'}</span>
                </>
              ) : (
                <>
                  <span>{isBangla ? 'লগ-ইন করুন' : 'Log In'}</span>
                  <Sparkles className="w-4 h-4 text-[#C5A059]" />
                </>
              )}
            </button>
          </form>

          {/* Student & Guardian Instruction Helper Box */}
          <div className="mt-6 p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-emerald-100 text-[#1B4332] shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="text-xs leading-relaxed text-emerald-950">
              <span className="font-bold text-[#16382C]">
                {isBangla ? 'শিক্ষার্থীদের জন্য নির্দেশনা:' : 'Instructions for Students:'}
              </span>
              <p className="mt-0.5 text-emerald-900/80">
                {isBangla 
                  ? 'স্টুডেন্ট আইডি ও পাসওয়ার্ড হিসেবে জন্মতারিখ (DDMMYYYY) দিয়ে সহজেই লগইন করা যাবে।' 
                  : 'Log in using your Student ID and Date of Birth (DDMMYYYY) as password.'}
              </p>
            </div>
          </div>

          {/* Footer Info */}
          <div className="mt-6 text-center text-xs text-slate-400 space-y-1 font-medium">
            <p>{isBangla ? 'ক-৭৫/২, মহাখালী দক্ষিণপাড়া, বনানী, ঢাকা • ফোন: ০১৭১২-৬৩৩২৬৪' : 'Ka-75/2, Mohakhali, Banani, Dhaka • Phone: 01712-633264'}</p>
            <p>{isBangla ? '© ২০২৬-২০২৭ আল-মদিনা মডেল মাদ্রাসা এন্ড রিসার্চ ইনস্টিটিউট' : '© 2026-2027 Al-Madinah Model Madrasah & Research Institute'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
