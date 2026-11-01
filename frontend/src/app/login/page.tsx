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
    <div className="min-h-screen relative flex items-center justify-center p-4 md:p-8 bg-[#021307] overflow-hidden">
      {/* Ambient 3D Bokeh Lights & Subtle Grid Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute top-1/2 -right-40 w-[30rem] h-[30rem] bg-amber-500/15 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '3s' }} />
        <div className="absolute -bottom-40 left-1/3 w-[28rem] h-[28rem] bg-emerald-700/20 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '6s' }} />
        
        {/* Subtle Islamic Geometric Mesh Overlay */}
        <div 
          className="absolute inset-0 opacity-[0.04]" 
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%2334d399' stroke-width='1'%3E%3Cpath d='M40 0 L80 40 L40 80 L0 40 Z'/%3E%3Cpath d='M40 15 L65 40 L40 65 L15 40 Z'/%3E%3Ccircle cx='40' cy='40' r='10'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Top Floating Back Link & Language Switcher */}
      <div className="absolute top-6 left-6 z-30">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-emerald-200 text-sm font-medium backdrop-blur-md transition-all hover:-translate-x-1"
        >
          <ArrowLeft className="w-4 h-4 text-amber-400" />
          <span>{isBangla ? 'প্রধান পাতা' : 'Home'}</span>
        </Link>
      </div>

      <div className="absolute top-6 right-6 z-30">
        <LanguageSwitcher variant="dark" />
      </div>

      {/* Main Glassmorphic Card */}
      <div className="relative z-20 w-full max-w-md mx-auto">
        <div className="glass-card rounded-3xl p-6 sm:p-10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] border border-emerald-500/25 relative overflow-hidden backdrop-blur-2xl">
          {/* Subtle Top Specular Light Beam */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400/80 to-transparent" />

          {/* 3D Animated Logo Emblem */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="relative mb-4 group cursor-pointer">
              <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500 via-amber-400 to-emerald-500 rounded-full blur-lg opacity-50 group-hover:opacity-80 transition duration-500 animate-pulse-glow" />
              <div className="relative w-24 h-24 rounded-full p-[2px] bg-gradient-to-tr from-amber-400 via-amber-300 to-emerald-400 shadow-2xl overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo.jpg"
                  alt="Al Madina Model Madrasa Logo"
                  className="w-full h-full object-cover rounded-full bg-white"
                />
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/20 text-emerald-300 text-xs font-medium mb-2.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>নিরাপদ লগইন পোর্টাল</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold tracking-tight gold-gradient-text">
              আল-মদিনা মডেল মাদ্রাসা
            </h1>
            <p className="text-xs sm:text-sm text-emerald-200/80 mt-1">
              এন্ড রিসার্চ ইনস্টিটিউট • ডিজিটাল ম্যানেজমেন্ট
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Phone / User ID */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-emerald-200/90 flex items-center justify-between">
                <span>{isBangla ? 'মোবাইল নম্বর / স্টুডেন্ট আইডি' : 'Mobile Number / Student ID'}</span>
              </label>
              <div className="relative group">
                <User className="absolute left-3.5 top-3.5 w-5 h-5 text-emerald-400/60 group-focus-within:text-amber-400 transition-colors" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={isBangla ? "017XXXXXXXX বা স্টুডেন্ট আইডি" : "017XXXXXXXX or Student ID"}
                  className="w-full pl-11 pr-4 py-3 bg-white/[0.06] hover:bg-white/[0.08] focus:bg-black/40 border border-white/10 focus:border-amber-400/80 rounded-xl text-white placeholder-emerald-100/30 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition-all"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-emerald-200/90 flex items-center justify-between">
                <span>{isBangla ? 'পাসওয়ার্ড' : 'Password'}</span>
              </label>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-3.5 w-5 h-5 text-emerald-400/60 group-focus-within:text-amber-400 transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isBangla ? "আপনার পাসওয়ার্ড লিখুন" : "Enter your password"}
                  className="w-full pl-11 pr-12 py-3 bg-white/[0.06] hover:bg-white/[0.08] focus:bg-black/40 border border-white/10 focus:border-amber-400/80 rounded-xl text-white placeholder-emerald-100/30 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-emerald-400/60 hover:text-amber-400 transition-colors"
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
              className="w-full py-3.5 mt-2 rounded-xl text-white font-bold text-base bg-gradient-to-r from-emerald-600 via-emerald-500 to-amber-500 hover:from-emerald-500 hover:to-amber-400 active:scale-[0.99] shadow-lg shadow-emerald-950/60 hover:shadow-emerald-500/25 transition-all duration-300 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{isBangla ? 'যাচাই হচ্ছে...' : 'Verifying...'}</span>
                </>
              ) : (
                <>
                  <span>{isBangla ? 'লগ-ইন করুন' : 'Log In'}</span>
                  <Sparkles className="w-4 h-4 text-amber-200" />
                </>
              )}
            </button>
          </form>

          {/* Student & Guardian Instruction Helper Box */}
          <div className="mt-6 p-3.5 rounded-2xl bg-white/[0.04] border border-emerald-500/20 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-400/10 text-amber-400 shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="text-xs leading-relaxed text-emerald-100/80">
              <span className="font-semibold text-amber-300">
                {isBangla ? 'শিক্ষার্থীদের জন্য নির্দেশনা:' : 'Instructions for Students:'}
              </span>
              <p className="mt-0.5">
                {isBangla 
                  ? 'স্টুডেন্ট আইডি ও পাসওয়ার্ড হিসেবে জন্মতারিখ (DDMMYYYY) দিয়ে সহজেই লগইন করা যাবে।' 
                  : 'Log in using your Student ID and Date of Birth (DDMMYYYY) as password.'}
              </p>
            </div>
          </div>

          {/* Footer Info */}
          <div className="mt-6 text-center text-xs text-emerald-200/50 space-y-1">
            <p>{isBangla ? 'ক-৭৫/২, মহাখালী দক্ষিণপাড়া, বনানী, ঢাকা • ফোন: ০১৭১২-৬৩৩২৬৪' : 'Ka-75/2, Mohakhali, Banani, Dhaka • Phone: 01712-633264'}</p>
            <p>{isBangla ? '© ২০২৬-২০২৭ আল-মদিনা মডেল মাদ্রাসা এন্ড রিসার্চ ইনস্টিটিউট' : '© 2026-2027 Al-Madinah Model Madrasah & Research Institute'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
