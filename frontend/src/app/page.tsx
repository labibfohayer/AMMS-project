'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import { 
  ArrowRight, Sparkles, BookOpen, GraduationCap, ShieldCheck, 
  Award, MessageSquare, Clock, Users, Building, ChevronRight, 
  Phone, MapPin, CheckCircle2, Star, Layers, Calendar, Tv, 
  Wind, Video, Utensils, HeartHandshake, Smile, Target, Compass,
  ChevronUp, Maximize2, X
} from 'lucide-react';

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const { t, d, isBangla } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [previewImage, setPreviewImage] = useState<{ src: string; title: string; alt: string } | null>(null);
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // 🏎️ 120 FPS High-Performance Smooth Momentum Scroll (Zero-Lag Tuned)
    const lenis = new Lenis({
      duration: 0.65, // Instant response, zero lag or sluggish delay
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.0,
      syncTouch: false,
    });
    lenisRef.current = lenis;

    // Zero-lag state debouncing: only trigger state update when threshold booleans flip!
    let lastScrolled = false;
    let lastShowTop = false;

    lenis.on('scroll', (e: any) => {
      const y = e.scroll;
      const isScrolled = y > 20;
      const isTop = y > 300;

      if (isScrolled !== lastScrolled) {
        lastScrolled = isScrolled;
        setScrolled(isScrolled);
      }
      if (isTop !== lastShowTop) {
        lastShowTop = isTop;
        setShowScrollTop(isTop);
      }
    });

    let animationFrameId: number;
    function raf(time: number) {
      lenis.raf(time);
      animationFrameId = requestAnimationFrame(raf);
    }
    animationFrameId = requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
      cancelAnimationFrame(animationFrameId);
      lenisRef.current = null;
    };
  }, []);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      if (lenisRef.current) {
        lenisRef.current.scrollTo(element, { offset: -90, duration: 0.7 });
      } else {
        const headerOffset = 90;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
      window.history.pushState(null, '', `#${id}`);
    }
  };

  const scrollToTop = () => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { duration: 0.7 });
    } else {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#021307] text-white selection:bg-amber-400 selection:text-black overflow-x-hidden relative font-sans">
      {/* Ambient 3D Bokeh Lights - Static GPU Cached Textures (Zero Repaints) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 gpu-layer" style={{ contain: 'strict' }}>
        <div className="absolute top-0 left-1/4 w-[38rem] h-[38rem] bg-emerald-600/15 rounded-full blur-[80px] gpu-accelerated" />
        <div className="absolute top-1/3 -right-20 w-[32rem] h-[32rem] bg-amber-500/10 rounded-full blur-[90px] gpu-accelerated" />
        <div className="absolute -bottom-40 left-10 w-[42rem] h-[42rem] bg-emerald-800/20 rounded-full blur-[100px] gpu-accelerated" />
        
        {/* Islamic Subtle Star Pattern Overlay */}
        <div 
          className="absolute inset-0 opacity-[0.035]" 
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%2334d399' stroke-width='1'%3E%3Cpath d='M30 0 L60 30 L30 60 L0 30 Z'/%3E%3Ccircle cx='30' cy='30' r='10'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Floating Glassmorphic Top Navigation - Fixed Height to Eliminate Layout Reflow */}
      <header className={`fixed top-0 left-0 right-0 z-50 py-3.5 transition-colors duration-200 ${scrolled ? 'bg-[#021307]/92 backdrop-blur-xl border-b border-emerald-500/20 shadow-2xl' : 'bg-transparent border-b border-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-12 h-12 sm:w-13 sm:h-13 rounded-full overflow-hidden p-[1.5px] bg-gradient-to-tr from-amber-400 to-emerald-400 shadow-lg shadow-emerald-950/80 group-hover:scale-105 transition-all shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="/logo.jpg" 
                alt={isBangla ? 'আল-মদিনা মডেল মাদ্রাসা এন্ড রিসার্চ ইনস্টিটিউট' : 'Al Madina Model Madrasa & Research Institute'} 
                className="w-full h-full object-cover rounded-full bg-white" 
              />
            </div>
            <div>
              <div className="font-extrabold text-sm sm:text-base tracking-tight gold-gradient-text leading-tight">
                {isBangla ? 'আল-মদিনা মডেল মাদ্রাসা' : 'Al-Madinah Model Madrasah'}
              </div>
              <div className="text-[11px] text-emerald-200/90 font-medium tracking-wide">
                {isBangla ? 'এন্ড রিসার্চ ইনস্টিটিউট • বনানী, ঢাকা' : '& Research Institute • Banani, Dhaka'}
              </div>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-emerald-100/75">
            <Link href="/admission" className="text-amber-300 font-semibold hover:text-amber-200 transition-colors flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{isBangla ? 'অনলাইন ভর্তি আবেদন' : 'Online Admission'}</span>
            </Link>
            <a 
              href="#about" 
              onClick={(e) => scrollToSection(e, 'about')}
              className="hover:text-amber-300 transition-colors"
            >
              {isBangla ? 'অধ্যক্ষ ও পরিচিতি' : 'Principal & About'}
            </a>
            <a 
              href="#curriculum" 
              onClick={(e) => scrollToSection(e, 'curriculum')}
              className="hover:text-amber-300 transition-colors"
            >
              {isBangla ? 'কী কী পড়ানো হয়' : 'Curriculum'}
            </a>
            <a 
              href="#facilities" 
              onClick={(e) => scrollToSection(e, 'facilities')}
              className="hover:text-amber-300 transition-colors"
            >
              {isBangla ? 'সুযোগ-সুবিধা' : 'Facilities'}
            </a>
            <a 
              href="#gallery" 
              onClick={(e) => scrollToSection(e, 'gallery')}
              className="hover:text-amber-300 transition-colors"
            >
              {isBangla ? 'ক্যাম্পাস চিত্র' : 'Gallery'}
            </a>
            <a 
              href="#contact" 
              onClick={(e) => scrollToSection(e, 'contact')}
              className="hover:text-amber-300 transition-colors"
            >
              {isBangla ? 'যোগাযোগ' : 'Contact'}
            </a>
          </nav>

          {/* Action Button & Hotline & Language Switcher */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Top Language Switcher */}
            <LanguageSwitcher variant="dark" />

            <a 
              href="tel:01712633264" 
              className="hidden xl:inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-emerald-400/20 text-xs text-emerald-200 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              <span>{isBangla ? '০১৭১২-৬৩৩২৬৪' : '01712-633264'}</span>
            </a>

            {isAuthenticated && user ? (
              <Link
                href={['principal', 'vice_principal', 'managing_director', 'teacher', 'staff'].includes(user.role) ? '/dashboard' : user.role === 'guardian' ? '/guardian' : '/student'}
                className="inline-flex items-center gap-2 px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-emerald-600 to-amber-500 hover:from-emerald-500 hover:to-amber-400 text-white shadow-lg shadow-emerald-950/50 hover:shadow-emerald-500/25 transition-all hover:-translate-y-0.5"
              >
                <span>{isBangla ? 'ড্যাশবোর্ডে যান' : 'Dashboard'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-emerald-600 to-amber-500 hover:from-emerald-500 hover:to-amber-400 text-white shadow-lg shadow-emerald-950/50 hover:shadow-emerald-500/25 transition-all hover:-translate-y-0.5"
              >
                <span>{isBangla ? 'লগইন পোর্টাল' : 'Login'}</span>
                <ArrowRight className="w-4 h-4 text-amber-200" />
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 pt-28 sm:pt-36">
        
        {/* HERO SECTION */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24">
          <div className="flex flex-col items-center text-center max-w-5xl mx-auto">
            
            {/* Madrasah Official Big Emblem with Golden Aura */}
            <div className="relative mb-5 group">
              <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-amber-400/30 via-emerald-500/20 to-amber-500/30 blur-2xl opacity-75 group-hover:opacity-100 transition-opacity animate-pulse-glow" />
              <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full p-[3px] bg-gradient-to-tr from-amber-400 via-emerald-400 to-amber-500 shadow-[0_10px_40px_rgba(245,158,11,0.35)] shrink-0 group-hover:scale-105 transition-transform">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src="/logo.jpg" 
                  alt={isBangla ? 'আল-মদিনা মডেল মাদ্রাসা এন্ড রিসার্চ ইনস্টিটিউট' : 'Al Madina Model Madrasa & Research Institute'} 
                  className="w-full h-full object-cover rounded-full bg-white shadow-inner" 
                />
              </div>
            </div>

            {/* Top Welcome / Bismillah Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs sm:text-sm font-semibold mb-4">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="tracking-wide">
                {isBangla ? 'بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ • অফিসিয়াল ওয়েবসাইট' : 'بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ • Official Website'}
              </span>
            </div>

            {/* User Request Invariant: Big Prominent Institution Title */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.15] mb-3 text-white">
              <span className="gold-gradient-text drop-shadow-[0_4px_35px_rgba(245,158,11,0.5)]">
                {isBangla ? 'আল মদিনা মডেল মাদ্রাসা' : 'Al Madina Model Madrasah'}
              </span>
              <br className="hidden sm:inline" />
              <span className="text-white sm:text-4xl lg:text-5xl font-extrabold sm:ml-3">
                {isBangla ? 'অ্যান্ড রিসার্চ ইনস্টিটিউট' : '& Research Institute'}
              </span>
            </h1>

            {/* Sub-headline in English & Official Location */}
            <p className="text-sm sm:text-base font-semibold text-amber-300/90 tracking-wider mb-4 uppercase">
              Al Madina Model Madrasa and Research Institute
            </p>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-400/25 text-emerald-200/90 text-xs sm:text-sm font-medium mb-6">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {isBangla 
                  ? 'ক-৭৫/২, মহাখালী দক্ষিণপাড়া, বনানী, ঢাকা-১২১২ • স্থাপিত: ২০২৪ ইং' 
                  : 'Ka-75/2, Mohakhali Dakshinpara, Banani, Dhaka-1212 • Estd: 2024'}
              </span>
            </div>

            {/* Slogan & Vision */}
            <div className="relative mb-6 max-w-3xl">
              <p className="text-lg sm:text-2xl font-bold text-emerald-100 leading-snug">
                {isBangla 
                  ? '“দ্বীনি নৈতিকতা ও আধুনিক জ্ঞানের এক অপূর্ব সমন্বয়ে আলোকিত ক্যাম্পাস”'
                  : '“An enlightened campus synthesizing Islamic morals and modern education”'}
              </p>
              <p className="text-xs sm:text-sm text-emerald-200/75 mt-2.5 max-w-2xl mx-auto leading-relaxed">
                {isBangla
                  ? 'সম্পূর্ণ শীতাতপ নিয়ন্ত্রিত (AC) পরিবেশে প্রজেক্টর ভিত্তিক আধুনিক পাঠদান, জেনারেল শিক্ষার পাশাপাশি সমৃদ্ধ হিফজুল কুরআন বিভাগ। অধ্যক্ষ মাওলানা ওমর ফারুক মুজাহিদীর প্রত্যক্ষ পরিচালনায় পরিচালিত এক আদর্শ বিদ্যাপীঠ।'
                  : 'Projector-based modern teaching in fully air-conditioned (AC) classrooms, an enriched Hifzul Quran section alongside general education under the direct leadership of Principal Maulana Omar Faruk Mujahidi.'}
              </p>
            </div>

            {/* Admission Notification Pill */}
            <Link 
              href="/admission" 
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-amber-500/20 via-amber-400/25 to-amber-500/20 hover:from-amber-500/35 hover:to-amber-500/35 border border-amber-400/40 text-amber-300 text-xs sm:text-sm font-semibold mb-8 transition-all hover:scale-105 shadow-lg shadow-amber-950/40"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>
                {isBangla
                  ? 'ভর্তি বিজ্ঞপ্তি: ২০২৭ শিক্ষাবর্ষে প্লে থেকে ষষ্ঠ ও হিফজে ভর্তি চলছে — আবেদন করতে ক্লিক করুন'
                  : 'Admission Notice: Admissions open for 2027 in Play to Class 6 & Hifz — Click to Apply'}
              </span>
              <ChevronRight className="w-4 h-4 text-amber-400" />
            </Link>

            {/* Quick Feature Chips */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 mb-10 max-w-3xl text-xs sm:text-sm text-emerald-200/90">
              <span className="px-3.5 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-400/20 shadow-sm flex items-center gap-1.5">
                <span>❄️</span>
                <span>{isBangla ? 'সম্পূর্ণ AC ক্লাসরুম' : 'Fully AC Classrooms'}</span>
              </span>
              <span className="px-3.5 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-400/20 shadow-sm flex items-center gap-1.5">
                <span>📽️</span>
                <span>{isBangla ? 'প্রজেক্টর ভিত্তিক পাঠদান' : 'Projector-based Multimedia'}</span>
              </span>
              <span className="px-3.5 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-400/20 shadow-sm flex items-center gap-1.5">
                <span>📹</span>
                <span>{isBangla ? '২৪ ঘণ্টা CCTV নিরাপত্তা' : '24/7 CCTV Security'}</span>
              </span>
              <span className="px-3.5 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-400/20 shadow-sm flex items-center gap-1.5">
                <span>📖</span>
                <span>{isBangla ? 'নূরানী, নাজেরা ও হিফজ' : 'Noorani, Nazera & Hifz'}</span>
              </span>
              <span className="px-3.5 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-400/20 shadow-sm flex items-center gap-1.5">
                <span>🗣️</span>
                <span>{isBangla ? 'বাংলা, ইংরেজি ও আরবি ভাষার সমন্বয়' : 'Trilingual Curriculum'}</span>
              </span>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full sm:w-auto">
              <Link
                href="/admission"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl text-base font-bold bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-emerald-950 shadow-[0_15px_35px_-10px_rgba(245,158,11,0.5)] transition-all hover:-translate-y-1 active:scale-95"
              >
                <Sparkles className="w-5 h-5 text-emerald-950" />
                <span>{isBangla ? 'অনলাইন ভর্তি আবেদন ফরম' : 'Online Admission Form'}</span>
                <ChevronRight className="w-5 h-5 text-emerald-950" />
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl text-base font-bold bg-white/[0.08] hover:bg-white/[0.14] border border-emerald-500/30 text-white transition-all hover:-translate-y-0.5"
              >
                <span>{isBangla ? 'শিক্ষার্থী / শিক্ষক পোর্টাল' : 'Portal Login'}</span>
                <ChevronRight className="w-5 h-5 text-amber-200" />
              </Link>
              <a
                href="tel:01712633264"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl text-sm font-semibold bg-white/[0.05] hover:bg-white/[0.1] border border-emerald-500/20 text-emerald-200/90 transition-all hover:-translate-y-0.5"
              >
                <Phone className="w-4 h-4 text-amber-400" />
                <span>{isBangla ? '০১৭১২-৬৩৩২৬৪' : '01712-633264'}</span>
              </a>
            </div>

            {/* Interactive Showcase Bento Card */}
            <div className="w-full mt-14 sm:mt-16 relative">
              <div className="relative mx-auto max-w-4xl rounded-3xl p-2 bg-gradient-to-b from-emerald-500/30 via-emerald-500/10 to-transparent border border-emerald-400/20 shadow-[0_30px_100px_-20px_rgba(0,0,0,0.8)] backdrop-blur-2xl">
                <div className="relative rounded-2xl bg-[#031c0b]/90 border border-emerald-500/20 p-6 sm:p-10 overflow-hidden">
                  
                  <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10 text-left">
                    {/* Feature 1 */}
                    <div className="p-5 rounded-2xl bg-white/[0.03] border border-emerald-400/15 hover:border-amber-400/40 transition-colors">
                      <div className="w-12 h-12 rounded-xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-400 mb-4">
                        <GraduationCap className="w-6 h-6" />
                      </div>
                      <h3 className="font-bold text-lg text-white mb-2">
                        {isBangla ? 'প্লে - ৬ষ্ঠ শ্রেণি জেনারেল' : 'Play to Class 6 (General)'}
                      </h3>
                      <p className="text-xs sm:text-sm text-emerald-200/70 leading-relaxed">
                        {isBangla 
                          ? 'Play-group থেকে ৬ষ্ঠ শ্রেণি পর্যন্ত আধুনিক সিলেবাস, বাংলা ও ইংরেজি মাধ্যমের চমৎকার সমন্বয়।' 
                          : 'Modern curriculum from Play-group to Class 6, harmonizing Bengali and English mediums.'}
                      </p>
                    </div>

                    {/* Feature 2 */}
                    <div className="p-5 rounded-2xl bg-white/[0.03] border border-emerald-400/15 hover:border-amber-400/40 transition-colors">
                      <div className="w-12 h-12 rounded-xl bg-emerald-400/15 border border-emerald-400/30 flex items-center justify-center text-emerald-400 mb-4">
                        <BookOpen className="w-6 h-6" />
                      </div>
                      <h3 className="font-bold text-lg text-white mb-2">
                        {isBangla ? 'সমৃদ্ধ হিফজুল কুরআন' : 'Enriched Hifzul Quran'}
                      </h3>
                      <p className="text-xs sm:text-sm text-emerald-200/70 leading-relaxed">
                        {isBangla 
                          ? 'জেনারেল শিক্ষার পাশাপাশি নূরানী, নাজেরা ও আন্তর্জাতিক মানের সহীহ হিফজুল কুরআন বিভাগ।' 
                          : 'Noorani, Nazera and international-standard Sahih Hifzul Quran alongside general education.'}
                      </p>
                    </div>

                    {/* Feature 3 */}
                    <div className="p-5 rounded-2xl bg-white/[0.03] border border-emerald-400/15 hover:border-amber-400/40 transition-colors">
                      <div className="w-12 h-12 rounded-xl bg-emerald-400/15 border border-emerald-400/30 flex items-center justify-center text-emerald-300 mb-4">
                        <Tv className="w-6 h-6" />
                      </div>
                      <h3 className="font-bold text-lg text-white mb-2">
                        {isBangla ? 'প্রজেক্টর ও AC ক্যাম্পাস' : 'Projector & AC Campus'}
                      </h3>
                      <p className="text-xs sm:text-sm text-emerald-200/70 leading-relaxed">
                        {isBangla 
                          ? 'মাল্টিমিডিয়া প্রজেক্টরে চিত্র ও উপকরণের মাধ্যমে পাঠদান এবং সম্পূর্ণ শীতাতপ নিয়ন্ত্রিত শ্রেণিকক্ষ।' 
                          : 'Multimedia projector lessons with visual aids and fully air-conditioned modern classrooms.'}
                      </p>
                    </div>
                  </div>

                  {/* Highlights Bar */}
                  <div className="mt-8 pt-6 border-t border-emerald-500/15 flex flex-wrap items-center justify-between gap-4 text-xs sm:text-sm text-emerald-300/80">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-400" />
                      <span>{isBangla ? 'অধ্যক্ষ মহোদয়ের সরাসরি ক্লাস ও ব্যক্তিগত তদারকি' : 'Direct classes & personal supervision by Principal'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-400" />
                      <span>{isBangla ? '২৪ ঘণ্টা সিসিটিভি নিরাপত্তা ও পরিচ্ছন্ন পরিবেশ' : '24/7 CCTV surveillance & hygienic campus'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-400" />
                      <span>{isBangla ? 'মাসিক অভিভাবক সমাবেশ (Guardians Meeting)' : 'Monthly Guardians Meetings'}</span>
                    </div>
                  </div>

                </div>
              </div>

              {/* Smooth Scroll Down Indicator */}
              <div className="mt-8 flex justify-center">
                <a
                  href="#curriculum"
                  onClick={(e) => scrollToSection(e, 'curriculum')}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-emerald-400/20 text-xs font-medium text-emerald-200/80 hover:text-amber-300 transition-all hover:-translate-y-0.5 shadow-sm"
                >
                  <span>{isBangla ? 'বিস্তারিত জানতে নিচে স্ক্রোল করুন' : 'Scroll down to explore'}</span>
                  <ChevronRight className="w-3.5 h-3.5 rotate-90 text-amber-400" />
                </a>
              </div>
            </div>

          </div>
        </section>

        {/* INFINITE MARQUEE TICKER */}
        <div className="py-4 border-y border-emerald-500/20 bg-emerald-950/40 backdrop-blur-md overflow-hidden relative">
          <div className="animate-marquee whitespace-nowrap text-xs sm:text-sm font-semibold tracking-wider text-emerald-200/90 uppercase flex items-center gap-8">
            <span>✨ {isBangla ? 'আল-মদিনা মডেল মাদ্রাসা এন্ড রিসার্চ ইনস্টিটিউট' : 'Al Madina Model Madrasa & Research Institute'}</span>
            <span className="text-amber-400">•</span>
            <span>{isBangla ? '২০২৭ শিক্ষাবর্ষে ভর্তি চলছে' : 'Admissions Open for Session 2027'}</span>
            <span className="text-amber-400">•</span>
            <span>{isBangla ? 'প্লে-গ্রুপ থেকে ষষ্ঠ শ্রেণি' : 'Play-Group to Class 6'}</span>
            <span className="text-amber-400">•</span>
            <span>{isBangla ? 'জেনারেল শিক্ষার পাশাপাশি হিফজুল কুরআন' : 'General Education & Hifzul Quran'}</span>
            <span className="text-amber-400">•</span>
            <span>{isBangla ? 'সম্পূর্ণ শীতাতপ নিয়ন্ত্রিত (AC) ক্লাসরুম' : 'Fully Air-Conditioned (AC) Classrooms'}</span>
            <span className="text-amber-400">•</span>
            <span>{isBangla ? 'প্রজেক্টর ভিত্তিক আধুনিক পাঠদান' : 'Projector-Based Multimedia Education'}</span>
            <span className="text-amber-400">•</span>
            <span>{isBangla ? '২৪ ঘণ্টা CCTV সার্বিক নিরাপত্তা' : '24/7 CCTV Campus Surveillance'}</span>
            <span className="text-amber-400">•</span>
            <span>{isBangla ? 'ক-৭৫/২, মহাখালী দক্ষিণপাড়া, বনানী, ঢাকা' : 'Ka-75/2, Mohakhali Dakshinpara, Banani, Dhaka'}</span>
            <span className="text-amber-400">•</span>
            <span>{isBangla ? 'ফোন: ০১৭১২-৬৩৩২৬৪' : 'Phone: 01712-633264'}</span>
            <span className="text-amber-400">•</span>
            <span>✨ {isBangla ? 'আল-মদিনা মডেল মাদ্রাসা এন্ড রিসার্চ ইনস্টিটিউট' : 'Al Madina Model Madrasa & Research Institute'}</span>
            <span className="text-amber-400">•</span>
            <span>{isBangla ? '২০২৭ শিক্ষাবর্ষে ভর্তি চলছে' : 'Admissions Open for Session 2027'}</span>
            <span className="text-amber-400">•</span>
            <span>{isBangla ? 'প্লে-গ্রুপ থেকে ষষ্ঠ শ্রেণি' : 'Play-Group to Class 6'}</span>
            <span className="text-amber-400">•</span>
            <span>{isBangla ? 'জেনারেল শিক্ষার পাশাপাশি হিফজুল কুরআন' : 'General Education & Hifzul Quran'}</span>
            <span className="text-amber-400">•</span>
            <span>{isBangla ? 'সম্পূর্ণ শীতাতপ নিয়ন্ত্রিত (AC) ক্লাসরুম' : 'Fully Air-Conditioned (AC) Classrooms'}</span>
            <span className="text-amber-400">•</span>
            <span>{isBangla ? 'প্রজেক্টর ভিত্তিক আধুনিক পাঠদান' : 'Projector-Based Multimedia Education'}</span>
            <span className="text-amber-400">•</span>
            <span>{isBangla ? '২৪ ঘণ্টা CCTV সার্বিক নিরাপত্তা' : '24/7 CCTV Campus Surveillance'}</span>
            <span className="text-amber-400">•</span>
            <span>{isBangla ? 'ক-৭৫/২, মহাখালী দক্ষিণপাড়া, বনানী, ঢাকা' : 'Ka-75/2, Mohakhali Dakshinpara, Banani, Dhaka'}</span>
            <span className="text-amber-400">•</span>
            <span>{isBangla ? 'ফোন: ০১৭১২-৬৩৩২৬৪' : 'Phone: 01712-633264'}</span>
          </div>
        </div>

        {/* ACADEMIC PROGRAMS & CURRICULUM SECTION */}
        <section id="curriculum" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24 sm:scroll-mt-28">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/25 text-amber-300 text-xs font-semibold mb-3">
              <Layers className="w-3.5 h-3.5" />
              <span>Academic Programs & Curriculum</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white mb-4">
              {isBangla ? 'কী কী পড়ানো হয় ও আমাদের শিক্ষাক্রম' : 'What We Teach & Our Curriculum'}
            </h2>
            <p className="text-sm sm:text-base text-emerald-200/70">
              {isBangla
                ? 'কুরআন ও সুন্নাহ ভিত্তিক নৈতিক ও আদর্শিক শিক্ষার সাথে বাংলা, ইংরেজি ও আরবি ভাষার চমৎকার সমন্বয়ে পাঠদান।'
                : 'Quran & Sunnah-based moral education harmonized with Bengali, English, and Arabic mediums.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 */}
            <div className="glass-card rounded-3xl p-6 glass-card-hover flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 mb-5">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  {isBangla ? 'জেনারেল শিক্ষা (প্লে - ৬ষ্ঠ)' : 'General Education (Play - 6th)'}
                </h3>
                <p className="text-xs sm:text-sm text-emerald-200/70 leading-relaxed mb-4">
                  {isBangla
                    ? 'Play-group থেকে শুরু করে ষষ্ঠ শ্রেণি পর্যন্ত জাতীয় শিক্ষাক্রমের আধুনিক পাঠদান। শিশুদের ভিত্তি মজবুত করার সুপরিকল্পিত ব্যবস্থা।'
                    : 'Modern national curriculum education from Play-group to Class 6, strengthening each child’s foundation.'}
                </p>
              </div>
              <div className="text-xs text-amber-300 font-semibold flex items-center gap-1.5 pt-3 border-t border-emerald-500/15">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                <span>{isBangla ? 'প্লে থেকে ষষ্ঠ শ্রেণি' : 'Play to Class 6'}</span>
              </div>
            </div>

            {/* Card 2 */}
            <div className="glass-card rounded-3xl p-6 glass-card-hover flex flex-col justify-between border-amber-500/30">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 mb-5">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  {isBangla ? 'হিফজুল কুরআন বিভাগ' : 'Hifzul Quran Section'}
                </h3>
                <p className="text-xs sm:text-sm text-emerald-200/70 leading-relaxed mb-4">
                  {isBangla
                    ? 'জেনারেল শিক্ষার পাশাপাশি আন্তর্জাতিক মান অনুযায়ী তাজবীদ ও তারতীলের সাথে সম্পূর্ণ কুরআন হিফজের সুবর্ণ সুযোগ।'
                    : 'Golden opportunity for full Quran Hifz with Tajweed and Tarteel according to international standards alongside general studies.'}
                </p>
              </div>
              <div className="text-xs text-amber-300 font-semibold flex items-center gap-1.5 pt-3 border-t border-emerald-500/15">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                <span>{isBangla ? 'জেনারেল + হিফজ সমন্বয়' : 'General + Hifz Combined'}</span>
              </div>
            </div>

            {/* Card 3 */}
            <div className="glass-card rounded-3xl p-6 glass-card-hover flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 mb-5">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  {isBangla ? 'সমৃদ্ধ নূরানী ও নাজেরা' : 'Enriched Noorani & Nazera'}
                </h3>
                <p className="text-xs sm:text-sm text-emerald-200/70 leading-relaxed mb-4">
                  {isBangla
                    ? 'সহীহ মাখরাজ ও তাজবীদ সহকারে কুরআন মাজীদ তিলাওয়াত, প্রয়োজনীয় দোয়া-কালাম ও সুন্দর হস্তাক্ষর প্রশিক্ষণ।'
                    : 'Accurate Makhraj and Tajweed Quran recitation, essential duas, and fine handwriting practice.'}
                </p>
              </div>
              <div className="text-xs text-amber-300 font-semibold flex items-center gap-1.5 pt-3 border-t border-emerald-500/15">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                <span>{isBangla ? 'দৃঢ় বুনিয়াদী শিক্ষা' : 'Solid Foundational Training'}</span>
              </div>
            </div>

            {/* Card 4 */}
            <div className="glass-card rounded-3xl p-6 glass-card-hover flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 mb-5">
                  <Compass className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  {isBangla ? 'ত্রি-ভাষিক ও নৈতিক শিক্ষা' : 'Trilingual & Moral Education'}
                </h3>
                <p className="text-xs sm:text-sm text-emerald-200/70 leading-relaxed mb-4">
                  {isBangla
                    ? 'বাংলা, ইংরেজি ও আরবি ভাষার চমৎকার সমন্বয়ে শিক্ষাদান। কুরআন ও সুন্নাহ ভিত্তিক চারিত্রিক ও আদর্শিক মূল্যবোধ গঠন।'
                    : 'Balanced education combining Bengali, English, and Arabic. Cultivating Islamic values based on Quran & Sunnah.'}
                </p>
              </div>
              <div className="text-xs text-amber-300 font-semibold flex items-center gap-1.5 pt-3 border-t border-emerald-500/15">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                <span>{isBangla ? 'নৈতিক ও আত্মবিশ্বাসী বিকাশ' : 'Ethical & Confident Growth'}</span>
              </div>
            </div>
          </div>
        </section>

        {/* FACILITIES & FEATURES SECTION */}
        <section id="facilities" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24 sm:scroll-mt-28">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-400/10 border border-emerald-400/25 text-emerald-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Facilities & Features</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white mb-4">
              {isBangla ? 'সুযোগ-সুবিধা ও অনন্য বৈশিষ্ট্যসমূহ' : 'Facilities & Key Features'}
            </h2>
            <p className="text-sm sm:text-base text-emerald-200/70">
              {isBangla 
                ? 'শিশুদের জন্য আনন্দময়, পরিচ্ছন্ন, নিরাপদ ও বিশ্বমানের আধুনিক শিক্ষাবান্ধব পরিবেশ।'
                : 'Joyful, clean, safe, and world-class learning-friendly environment for children.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-7 rounded-3xl glass-card glass-card-hover flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-400/30 flex items-center justify-center text-blue-400 mb-5">
                  <Tv className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2.5">
                  {isBangla ? 'প্রজেক্টর ভিত্তিক আধুনিক পাঠদান' : 'Projector-Based Modern Teaching'}
                </h3>
                <p className="text-emerald-100/70 text-xs sm:text-sm leading-relaxed">
                  {isBangla
                    ? 'পাঠদানকে সহজ, বোধগম্য ও আকর্ষণীয় করতে মাল্টিমিডিয়া প্রজেক্টর, রঙিন চিত্র, প্রেজেন্টেশন ও আধুনিক শিক্ষামূলক উপকরণ ব্যবহার করা হয়।'
                    : 'Using multimedia projectors, visual presentations, and modern learning kits to make lessons engaging and comprehensible.'}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-emerald-500/15 text-xs text-emerald-300/80">
                {isBangla ? 'ইন্টারেক্টিভ ও আধুনিক শিক্ষা' : 'Interactive & Modern Learning'}
              </div>
            </div>

            {/* Feature 2 */}
            <div className="p-7 rounded-3xl glass-card glass-card-hover flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center text-cyan-400 mb-5">
                  <Wind className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2.5">
                  {isBangla ? 'সম্পূর্ণ শীতাতপ নিয়ন্ত্রিত (AC) ক্লাসরুম' : 'Fully Air-Conditioned (AC) Classrooms'}
                </h3>
                <p className="text-emerald-100/70 text-xs sm:text-sm leading-relaxed">
                  {isBangla
                    ? 'শিক্ষার্থীদের শারীরিক সুস্থতা ও দীর্ঘক্ষণ মনোযোগ ধরে রাখতে প্রতিটি শ্রেণিকক্ষ সম্পূর্ণ আধুনিক এয়ার কন্ডিশনড (AC) সুবিধাসম্পন্ন।'
                    : 'Every classroom is equipped with modern air conditioning to ensure physical comfort and sustained focus.'}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-emerald-500/15 text-xs text-cyan-300">
                {isBangla ? 'ক্লান্তিহীন মনোরম পরিবেশ' : 'Fatigue-Free Pleasant Atmosphere'}
              </div>
            </div>

            {/* Feature 3 */}
            <div className="p-7 rounded-3xl glass-card glass-card-hover flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center text-amber-400 mb-5">
                  <Video className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2.5">
                  {isBangla ? '২৪ ঘণ্টা CCTV নিরাপত্তা নজরদারি' : '24/7 CCTV Security Surveillance'}
                </h3>
                <p className="text-emerald-100/70 text-xs sm:text-sm leading-relaxed">
                  {isBangla
                    ? 'শিক্ষার্থীদের সর্বোচ্চ সুরক্ষা ও শৃঙ্খলা বজায় রাখতে পুরো ক্যাম্পাস ও শ্রেণিকক্ষগুলো দিন-রাত ২৪ ঘণ্টা ক্লোজড-সার্কিট ক্যামেরার আওতায় সংরক্ষিত।'
                    : 'Entire campus and classrooms are monitored around the clock with closed-circuit cameras for maximum child safety and discipline.'}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-emerald-500/15 text-xs text-amber-300">
                {isBangla ? 'নিরাপদ ও শঙ্কাহীন ক্যাম্পাস' : 'Safe & Protected Campus'}
              </div>
            </div>

            {/* Feature 4 */}
            <div className="p-7 rounded-3xl glass-card glass-card-hover flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-orange-500/15 border border-orange-400/30 flex items-center justify-center text-orange-400 mb-5">
                  <Utensils className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2.5">
                  {isBangla ? 'মানসম্মত পুষ্টিকর খাবার' : 'Hygienic & Nutritious Meals'}
                </h3>
                <p className="text-emerald-100/70 text-xs sm:text-sm leading-relaxed">
                  {isBangla
                    ? 'শিক্ষার্থীদের স্বাস্থ্য সুরক্ষায় স্বাস্থ্যকর, পরিচ্ছন্ন ও পুষ্টিকর খাবারের সুব্যবস্থা রাখা হয়েছে। প্রতিটি শিশুর খাদ্যাভ্যাস যত্ন সহকারে দেখা হয়।'
                    : 'Hygienic and healthy meals prepared with high quality standards. Dietary habits of every child are carefully monitored.'}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-emerald-500/15 text-xs text-orange-300">
                {isBangla ? 'স্বাস্থ্যকর ও হাইজিন নিশ্চিত' : 'Hygiene & Health Assured'}
              </div>
            </div>

            {/* Feature 5 */}
            <div className="p-7 rounded-3xl glass-card glass-card-hover flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center text-emerald-400 mb-5">
                  <Smile className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2.5">
                  {isBangla ? 'খেলাধুলা ও মানসিক বিকাশ' : 'Sports & Mental Well-being'}
                </h3>
                <p className="text-emerald-100/70 text-xs sm:text-sm leading-relaxed">
                  {isBangla
                    ? 'পড়ালেখার পাশাপাশি শিক্ষার্থীদের শারীরিক ও মানসিক বিকাশের জন্য আনন্দদায়ক খেলাধুলা, বিনোদন ও এক্সট্রা-কারিকুলার কার্যক্রম।'
                    : 'Engaging sports, indoor games, and extra-curricular activities designed for holistic mental and physical development.'}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-emerald-500/15 text-xs text-emerald-300">
                {isBangla ? 'শিশুবান্ধব ও আনন্দময় পাঠশালা' : 'Child-Friendly Joyful Schooling'}
              </div>
            </div>

            {/* Feature 6 */}
            <div className="p-7 rounded-3xl glass-card glass-card-hover flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-400/30 flex items-center justify-center text-purple-400 mb-5">
                  <Target className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2.5">
                  {isBangla ? 'প্রতিভা ও আত্মবিশ্বাস বিকাশ' : 'Talent & Confidence Building'}
                </h3>
                <p className="text-emerald-100/70 text-xs sm:text-sm leading-relaxed">
                  {isBangla
                    ? 'প্রতিটি শিক্ষার্থীর মেধা, স্বকীয় প্রতিভা ও আত্মবিশ্বাস জাগ্রত করতে বিশেষ গুরুত্ব দেওয়া হয় এবং দুর্বল শিক্ষার্থীদের প্রতি নেওয়া হয় নিবিড় পরিচর্যা।'
                    : 'Focused mentorship to unlock every student’s potential and confidence, with special care for weaker learners.'}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-emerald-500/15 text-xs text-purple-300">
                {isBangla ? 'ব্যক্তিগত পরিচর্যা ও মনিটরিং' : 'Personal Care & Monitoring'}
              </div>
            </div>
          </div>
        </section>

        {/* PRINCIPAL & GUARDIANS MEETING SECTION */}
        <section id="about" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24 sm:scroll-mt-28">
          <div className="rounded-3xl p-8 sm:p-12 glass-card border border-emerald-400/30 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
              {/* Left Column: Principal Bio & Supervision */}
              <div className="lg:col-span-7">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-semibold mb-4">
                  <Star className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isBangla ? 'অধ্যক্ষ মহোদয়ের ব্যক্তিগত তত্ত্বাবধান' : 'Personal Supervision by Principal'}</span>
                </div>

                <h2 className="text-2xl sm:text-4xl font-extrabold text-white mb-4 leading-snug">
                  {isBangla ? 'অধ্যক্ষ নিজে সরাসরি ক্লাস নেন ও' : 'The Principal Directly Teaches &'} <br />
                  <span className="gold-gradient-text">
                    {isBangla ? 'পড়ালেখার মান ব্যক্তিগতভাবে তদারকি করেন' : 'Personally Monitors Academic Quality'}
                  </span>
                </h2>

                <p className="text-emerald-100/80 text-sm sm:text-base leading-relaxed mb-6">
                  <span className="font-semibold text-white">
                    {isBangla ? 'প্রিন্সিপাল মাওলানা ওমর ফারুক মুজাহিদী' : 'Principal Maulana Omar Faruk Mujahidi'}
                  </span>
                  {isBangla
                    ? '-এর দক্ষ ও প্রত্যক্ষ নির্দেশনায় পরিচালিত হচ্ছে এই প্রতিষ্ঠান। শিক্ষার্থীদের পাঠোন্নতি ও নৈতিক মান নিশ্চিতে প্রতিটি ছাত্রের প্রতি বিশেষ মনোযোগ প্রদান করা হয়।'
                    : ' directly leads the institution. Special attention is given to every student to guarantee academic progress and moral excellence.'}
                </p>

                <div className="space-y-3.5 text-xs sm:text-sm text-emerald-200">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-white">
                        {isBangla ? 'মাসিক অভিভাবক সমাবেশ (Guardians Meeting):' : 'Monthly Guardians Meetings:'}
                      </strong>{' '}
                      {isBangla 
                        ? 'শিক্ষার্থীদের সার্বিক উন্নতি ও পড়ালেখা নিয়ে প্রতি মাসে অভিভাবকদের সাথে পরামর্শ সভা।'
                        : 'Monthly consultation meetings with parents regarding academic growth and student progress.'}
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-white">
                        {isBangla ? 'নিবিড় পরিচর্যা ও কেয়ার:' : 'Intensive Care & Monitoring:'}
                      </strong>{' '}
                      {isBangla
                        ? 'পড়ালেখার অগ্রগতির জন্য প্রতিটি শিক্ষার্থীর জন্য বিশেষ যত্ন ও ব্যক্তিগত ডায়রি মনিটরিং।'
                        : 'Special personal care and student diary tracking to ensure sustained learning progress.'}
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-white">
                        {isBangla ? 'সুশৃঙ্খল ও শিশুবান্ধব পরিবেশ:' : 'Disciplined & Child-Friendly Atmosphere:'}
                      </strong>{' '}
                      {isBangla
                        ? 'পরিচ্ছন্ন, নিরাপদ ও ভয়ভীতিমুক্ত আনন্দময় শিক্ষা পরিবেশ।'
                        : 'Clean, safe, anxiety-free, and joyful Islamic learning environment.'}
                    </span>
                  </div>
                </div>

                {/* Real Photo: Principal Teaching Class */}
                <div className="mt-8 rounded-2xl p-2.5 bg-gradient-to-tr from-amber-400/30 to-emerald-400/20 border border-emerald-400/30 overflow-hidden shadow-2xl group">
                  <div 
                    className="relative aspect-[16/9] w-full rounded-xl overflow-hidden bg-[#02180b] flex items-center justify-center cursor-pointer"
                    onClick={() => setPreviewImage({
                      src: '/images/principal-class.png',
                      alt: isBangla ? 'শ্রেণিকক্ষে শিশুদের সরাসরি পাঠদান করছেন অধ্যক্ষ মাওলানা ওমর ফারুক' : 'Principal Maulana Omar Faruk directly teaching in classroom',
                      title: isBangla ? 'অধ্যক্ষ মাওলানা ওমর ফারুক নিজে ক্লাসরুমে শিশুদের সাথে বসে নিবিড় পাঠদান করছেন' : 'Principal Maulana Omar Faruk directly mentoring students in class'
                    })}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/images/principal-class.png"
                      alt={isBangla ? 'শ্রেণিকক্ষে শিশুদের সরাসরি পাঠদান করছেন অধ্যক্ষ মাওলানা ওমর ফারুক' : 'Principal Maulana Omar Faruk directly teaching in classroom'}
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400 text-black text-[11px] font-bold shadow-md">
                        <Sparkles className="w-3 h-3" />
                        <span>{isBangla ? 'সরাসরি তত্ত্বাবধান' : 'Direct Supervision'}</span>
                      </span>
                    </div>
                    <button
                      type="button"
                      className="absolute bottom-3 right-3 p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white/80 hover:text-white transition-colors"
                      title={isBangla ? 'বড় করে দেখুন' : 'Click to enlarge'}
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="p-3 pt-2.5">
                    <p className="text-xs sm:text-sm font-semibold text-white drop-shadow-md">
                      {isBangla
                        ? 'অধ্যক্ষ মাওলানা ওমর ফারুক নিজে ক্লাসরুমে শিশুদের সাথে বসে নিবিড় পাঠদান করছেন'
                        : 'Principal Maulana Omar Faruk sitting with children in classroom providing intensive teaching'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column: Principal Profile Card */}
              <div className="lg:col-span-5">
                <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#0c2f18] to-[#041a0d] border border-amber-400/40 text-center shadow-2xl relative overflow-hidden">
                  <div className="w-36 h-36 mx-auto rounded-full bg-gradient-to-tr from-amber-400 via-amber-300 to-emerald-400 p-[3px] mb-5 shadow-2xl shadow-emerald-950/80 relative overflow-hidden flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full blur-md bg-amber-400/30 animate-pulse-glow" />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/principal.jpg"
                      alt={isBangla ? 'প্রিন্সিপাল মাওলানা ওমর ফারুক মুজাহিদী' : 'Principal Maulana Omar Faruk Mujahidi'}
                      className="w-full h-full object-contain rounded-full relative z-10 bg-emerald-950 p-1"
                    />
                  </div>
                  <h3 className="text-xl font-extrabold text-white mb-1">
                    {isBangla ? 'প্রিন্সিপাল মাওলানা ওমর ফারুক মুজাহিদী' : 'Principal Maulana Omar Faruk Mujahidi'}
                  </h3>
                  <p className="text-xs text-amber-300 font-semibold mb-4">
                    {isBangla ? 'অধ্যক্ষ, আল-মদিনা মডেল মাদ্রাসা এন্ড রিসার্চ ইনস্টিটিউট' : 'Principal, Al-Madinah Model Madrasah & Research Institute'}
                  </p>
                  
                  <div className="p-4 rounded-xl bg-white/[0.04] border border-emerald-400/20 text-xs text-emerald-200/90 leading-relaxed text-left">
                    {isBangla
                      ? '“আমরা কেবল সাধারণ পাঠদান করি না, বরং প্রতিটি শিশুকে কুরআন-সুন্নাহর নৈতিকতায় গড়ে তুলে আধুনিক জ্ঞান ও আত্মবিশ্বাসে সমৃদ্ধ করে গড়ে তুলতে প্রতিশ্রুতিবদ্ধ।”'
                      : '“We do not merely teach textbooks; we are committed to nurturing each child with Quranic values while equipping them with modern knowledge and confidence.”'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* REAL CAMPUS GALLERY & ACTIVITIES SECTION */}
        <section id="gallery" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24 sm:scroll-mt-28">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/25 text-amber-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Campus Moments & Activities</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mb-4">
              {isBangla ? 'বাস্তব ক্যাম্পাসের আলোকিত মুহূর্ত ও কার্যক্রম অ্যালবাম' : 'Campus Moments & Activities Album'}
            </h2>
            <p className="text-sm sm:text-base text-emerald-200/70">
              {isBangla
                ? 'আল-মদিনা মডেল মাদ্রাসার ডিজিটাল স্মার্ট ক্লাসরুম, তাজবীদ পাঠদান, হিফজুল কুরআন বিভাগ, অভিভাবক সমাবেশ ও মেধা সম্মাননার স্থিরচিত্র অ্যালবাম।'
                : 'Photographic album of smart digital classrooms, Tajweed recitation, Hifz department, guardians meetings, and academic honors.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Card 1: Smart Digital Classroom (Hero Wide Card) */}
            <div className="group rounded-3xl glass-card border border-emerald-400/25 overflow-hidden flex flex-col md:flex-row hover:border-amber-400/50 transition-all shadow-xl lg:col-span-2">
              <div 
                className="relative md:w-1/2 aspect-square overflow-hidden bg-[#02180b] flex items-center justify-center cursor-pointer"
                onClick={() => setPreviewImage({
                  src: '/images/smart-classroom.png',
                  alt: isBangla ? 'প্রজেক্টরে আধুনিক মাল্টিমিডিয়া ক্লাসরুম ও পাঠদান' : 'Modern projector-based multimedia smart classroom',
                  title: isBangla ? 'প্রজেক্টরে আধুনিক ও আকর্ষণীয় মাল্টিমিডিয়া পাঠদান' : 'Projector-Based Interactive Smart Teaching'
                })}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/smart-classroom.png"
                  alt={isBangla ? 'প্রজেক্টরে আধুনিক মাল্টিমিডিয়া ক্লাসরুম ও পাঠদান' : 'Modern projector-based multimedia smart classroom'}
                  className="w-full h-full object-contain"
                />
                <div className="absolute top-3 left-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-bold shadow-lg">
                    <Tv className="w-3.5 h-3.5 text-amber-300" />
                    <span>{isBangla ? 'ডিজিটাল মাল্টিমিডিয়া ক্লাসরুম' : 'Smart Digital Classroom'}</span>
                  </span>
                </div>
                <button
                  type="button"
                  className="absolute bottom-3 right-3 p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white/80 hover:text-white transition-colors"
                  title={isBangla ? 'বড় করে দেখুন' : 'Click to enlarge'}
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="p-6 md:p-8 md:w-1/2 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-amber-300 transition-colors">
                    {isBangla ? 'প্রজেক্টরে আধুনিক ও আকর্ষণীয় মাল্টিমিডিয়া পাঠদান' : 'Projector-Based Interactive Smart Teaching'}
                  </h3>
                  <p className="text-xs sm:text-sm text-emerald-200/80 leading-relaxed mb-4">
                    {isBangla
                      ? 'বড় ডিজিটাল প্রজেক্টর স্ক্রিন, শীতাতপ নিয়ন্ত্রিত আধুনিক শ্রেণিকক্ষ এবং অভিজ্ঞ শিক্ষকের পরিচালনায় আকর্ষণীয় পাঠদান। আধুনিক প্রযুক্তি ও ধর্মীয় মূল্যবোধের অপূর্ব সমন্বয়ে শিক্ষার্থীরা এখানে আনন্দ নিয়ে পড়াশোনা করে।'
                      : 'Modern AC classroom equipped with high-definition digital projector screens and audiovisual aids, synthesizing modern technology with Quranic education.'}
                  </p>
                </div>
                <div className="pt-4 border-t border-emerald-500/15 flex items-center gap-2 text-xs text-amber-300 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{isBangla ? 'সম্পূর্ণ এসি ও মাল্টিমিডিয়া প্রযুক্তি' : 'Fully AC & Multimedia Enabled'}</span>
                </div>
              </div>
            </div>

            {/* Card 2: Foundational Early Learning */}
            <div className="group rounded-3xl glass-card border border-emerald-400/25 overflow-hidden flex flex-col justify-between hover:border-amber-400/50 transition-all shadow-xl">
              <div 
                className="relative aspect-square w-full overflow-hidden bg-[#02180b] flex items-center justify-center cursor-pointer"
                onClick={() => setPreviewImage({
                  src: '/images/child-reading.png',
                  alt: isBangla ? 'মনোযোগ ও স্নেহের সাথে প্রাথমিক বুনিয়াদ পাঠ' : 'Attentive early childhood foundational learning',
                  title: isBangla ? 'স্নেহ ও গভীর মনোযোগে প্রাথমিক বুনিয়াদ গঠন' : 'Loving Guidance & Focused Early Learning'
                })}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/child-reading.png"
                  alt={isBangla ? 'মনোযোগ ও স্নেহের সাথে প্রাথমিক বুনিয়াদ পাঠ' : 'Attentive early childhood foundational learning'}
                  className="w-full h-full object-contain"
                />
                <div className="absolute top-3 left-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold shadow-lg">
                    <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                    <span>{isBangla ? 'নূরানী বুনিয়াদ' : 'Foundational Noorani'}</span>
                  </span>
                </div>
                <button
                  type="button"
                  className="absolute bottom-3 right-3 p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white/80 hover:text-white transition-colors"
                  title={isBangla ? 'বড় করে দেখুন' : 'Click to enlarge'}
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-amber-300 transition-colors">
                  {isBangla ? 'স্নেহ ও গভীর মনোযোগে প্রাথমিক বুনিয়াদ গঠন' : 'Loving Guidance & Focused Early Learning'}
                </h3>
                <p className="text-xs sm:text-sm text-emerald-200/70 leading-relaxed">
                  {isBangla
                    ? 'ছোট বয়সেই শিশুদের আরবি হরফ চেনা, বিশুদ্ধ উচ্চারণ ও বই পড়ার গভীর মনোযোগ তৈরিতে অভিজ্ঞ শিক্ষকমণ্ডলীর নিবিড় যত্ন ও আন্তরিক দিকনির্দেশনা।'
                    : 'Dedicated teachers provide personal care to help young learners master Arabic phonetics, correct pronunciation, and attentive study habits.'}
                </p>
              </div>
            </div>

            {/* Card 3: Pure Tajweed & Recitation */}
            <div className="group rounded-3xl glass-card border border-emerald-400/25 overflow-hidden flex flex-col justify-between hover:border-amber-400/50 transition-all shadow-xl">
              <div 
                className="relative aspect-square w-full overflow-hidden bg-[#02180b] flex items-center justify-center cursor-pointer"
                onClick={() => setPreviewImage({
                  src: '/images/quran-recitation.png',
                  alt: isBangla ? 'তাজবীদ ও মাখরাজের বিশুদ্ধ চর্চা' : 'Quran recitation with Tajweed and Makhraj',
                  title: isBangla ? 'মাখরাজ ও সুরের বিশুদ্ধতায় কুরআন চর্চা' : 'Mastery of Quranic Tajweed & Articulation'
                })}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/quran-recitation.png"
                  alt={isBangla ? 'তাজবীদ ও মাখরাজের বিশুদ্ধ চর্চা' : 'Quran recitation with Tajweed and Makhraj'}
                  className="w-full h-full object-contain"
                />
                <div className="absolute top-3 left-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500 text-black text-xs font-bold shadow-lg">
                    <Award className="w-3.5 h-3.5 text-black" />
                    <span>{isBangla ? 'বিশুদ্ধ তাজবীদ' : 'Pure Tajweed'}</span>
                  </span>
                </div>
                <button
                  type="button"
                  className="absolute bottom-3 right-3 p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white/80 hover:text-white transition-colors"
                  title={isBangla ? 'বড় করে দেখুন' : 'Click to enlarge'}
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-amber-300 transition-colors">
                  {isBangla ? 'মাখরাজ ও সুরের বিশুদ্ধতায় কুরআন চর্চা' : 'Mastery of Quranic Tajweed & Articulation'}
                </h3>
                <p className="text-xs sm:text-sm text-emerald-200/70 leading-relaxed">
                  {isBangla
                    ? 'সহীহ-শুদ্ধভাবে কুরআনুল কারীম তিলাওয়াত নিশ্চিত করতে আন্তর্জাতিক মানের তাজবীদ ও মাখরাজের নিয়মাবলীর সুবিন্যস্ত ও নিয়মিত অনুশীলন।'
                    : 'Systematic daily practice in authentic Tajweed and Makhraj rules under certified Qaris, ensuring flawless and melodious recitation.'}
                </p>
              </div>
            </div>

            {/* Card 4: Dedicated Hifz Circle */}
            <div className="group rounded-3xl glass-card border border-emerald-400/25 overflow-hidden flex flex-col justify-between hover:border-amber-400/50 transition-all shadow-xl">
              <div 
                className="relative aspect-square w-full overflow-hidden bg-[#02180b] flex items-center justify-center cursor-pointer"
                onClick={() => setPreviewImage({
                  src: '/images/hifz-students.png',
                  alt: isBangla ? 'হিফজুল কুরআন বিভাগের শিক্ষার্থীগণ' : 'Students in Hifzul Quran Department',
                  title: isBangla ? 'সুশৃঙ্খল পরিবেশে হিফজের নিয়মিত হালকাহ' : 'Structured Daily Routine in Hifz Circles'
                })}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/hifz-students.png"
                  alt={isBangla ? 'হিফজুল কুরআন বিভাগের শিক্ষার্থীগণ' : 'Students in Hifzul Quran Department'}
                  className="w-full h-full object-contain"
                />
                <div className="absolute top-3 left-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-700 text-white text-xs font-bold shadow-lg">
                    <GraduationCap className="w-3.5 h-3.5 text-amber-300" />
                    <span>{isBangla ? 'হিফজুল কুরআন' : 'Hifzul Quran'}</span>
                  </span>
                </div>
                <button
                  type="button"
                  className="absolute bottom-3 right-3 p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white/80 hover:text-white transition-colors"
                  title={isBangla ? 'বড় করে দেখুন' : 'Click to enlarge'}
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-amber-300 transition-colors">
                  {isBangla ? 'সুশৃঙ্খল পরিবেশে হিফজের নিয়মিত হালকাহ' : 'Structured Daily Routine in Hifz Circles'}
                </h3>
                <p className="text-xs sm:text-sm text-emerald-200/70 leading-relaxed">
                  {isBangla
                    ? 'শান্ত ও আধ্যাত্মিক পরিবেশে প্রতিদিনের সবক, সাত ছবক ও আমোখতা রিভিশন। আধুনিক স্মৃতি সংরক্ষণ কৌশল প্রয়োগে দ্রুত কুরআন হিফজ সম্পন্ন হয়।'
                    : 'Daily memorization circles following rigorous revision techniques in a tranquil environment, empowering students to retain the Quran with ease.'}
                </p>
              </div>
            </div>

            {/* Card 5: Vibrant Student Body & Uniform */}
            <div className="group rounded-3xl glass-card border border-emerald-400/25 overflow-hidden flex flex-col justify-between hover:border-amber-400/50 transition-all shadow-xl">
              <div 
                className="relative aspect-square w-full overflow-hidden bg-[#02180b] flex items-center justify-center cursor-pointer"
                onClick={() => setPreviewImage({
                  src: '/images/students-group.png',
                  alt: isBangla ? 'মার্জিত ও সুশৃঙ্খল শিক্ষার্থীবৃন্দ' : 'Disciplined and cheerful madrasah students',
                  title: isBangla ? 'আমাদের মার্জিত, প্রাণবন্ত ও আদর্শ শিক্ষার্থীরা' : 'Our Disciplined & Bright Young Students'
                })}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/students-group.png"
                  alt={isBangla ? 'মার্জিত ও সুশৃঙ্খল শিক্ষার্থীবৃন্দ' : 'Disciplined and cheerful madrasah students'}
                  className="w-full h-full object-contain"
                />
                <div className="absolute top-3 left-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-600 text-white text-xs font-bold shadow-lg">
                    <Users className="w-3.5 h-3.5 text-white" />
                    <span>{isBangla ? 'সুশৃঙ্খল ক্যাম্পাস' : 'Campus Community'}</span>
                  </span>
                </div>
                <button
                  type="button"
                  className="absolute bottom-3 right-3 p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white/80 hover:text-white transition-colors"
                  title={isBangla ? 'বড় করে দেখুন' : 'Click to enlarge'}
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-amber-300 transition-colors">
                  {isBangla ? 'আমাদের মার্জিত, প্রাণবন্ত ও আদর্শ শিক্ষার্থীরা' : 'Our Disciplined & Bright Young Students'}
                </h3>
                <p className="text-xs sm:text-sm text-emerald-200/70 leading-relaxed">
                  {isBangla
                    ? 'মার্জিত মাদ্রাসা ইউনিফর্ম, পারস্পরিক ভ্রাতৃত্ববোধ ও সুন্দর শিষ্টাচার। কুরআনকে হৃদয়ে ধারণ করে নৈতিক চরিত্রবান আদর্শ প্রজন্ম গড়ে উঠছে এখানে।'
                    : 'A community of polite, disciplined, and cheerful students reflecting Islamic manners, brotherhood, and a passion for holistic learning.'}
                </p>
              </div>
            </div>

            {/* Card 6: Awards & Crests */}
            <div className="group rounded-3xl glass-card border border-emerald-400/25 overflow-hidden flex flex-col justify-between hover:border-amber-400/50 transition-all shadow-xl">
              <div 
                className="relative aspect-[16/9] w-full overflow-hidden bg-[#02180b] flex items-center justify-center cursor-pointer"
                onClick={() => setPreviewImage({
                  src: '/images/awards-crests.png',
                  alt: isBangla ? 'ছাত্রদের জন্য মেধা সম্মাননা ও পুরস্কার ক্রেস্ট' : 'Academic achievement crests and awards for students',
                  title: isBangla ? 'পরীক্ষা ও প্রতিযোগিতায় পুরস্কার বিতরণ' : 'Award Ceremonies & Competitions'
                })}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/awards-crests.png"
                  alt={isBangla ? 'ছাত্রদের জন্য মেধা সম্মাননা ও পুরস্কার ক্রেস্ট' : 'Academic achievement crests and awards for students'}
                  className="w-full h-full object-contain"
                />
                <div className="absolute top-3 left-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500 text-black text-xs font-bold shadow-lg">
                    <Award className="w-3.5 h-3.5 text-black" />
                    <span>{isBangla ? 'মেধা সম্মাননা ক্রেস্ট' : 'Academic Award Crest'}</span>
                  </span>
                </div>
                <button
                  type="button"
                  className="absolute bottom-3 right-3 p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white/80 hover:text-white transition-colors"
                  title={isBangla ? 'বড় করে দেখুন' : 'Click to enlarge'}
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-amber-300 transition-colors">
                  {isBangla ? 'পরীক্ষা ও প্রতিযোগিতায় পুরস্কার বিতরণ' : 'Award Ceremonies & Competitions'}
                </h3>
                <p className="text-xs sm:text-sm text-emerald-200/70 leading-relaxed">
                  {isBangla
                    ? 'প্রতিটি সেমিস্টার পরীক্ষা, মেধা যাচাই ও বিভিন্ন কুরআন তিলাওয়াত প্রতিযোগিতায় শীর্ষ স্থান অধিকারী শিক্ষার্থীদের আকর্ষণীয় ক্রেস্ট ও উপহার দিয়ে অনুপ্রাণিত করা হয়।'
                    : 'Top performers in exams, talent assessments, and Quran recitation competitions are honored with crests and awards.'}
                </p>
              </div>
            </div>

            {/* Card 7: Hifz & Quran Class */}
            <div className="group rounded-3xl glass-card border border-emerald-400/25 overflow-hidden flex flex-col justify-between hover:border-amber-400/50 transition-all shadow-xl">
              <div 
                className="relative aspect-[16/9] w-full overflow-hidden bg-[#02180b] flex items-center justify-center cursor-pointer"
                onClick={() => setPreviewImage({
                  src: '/images/quran-class.png',
                  alt: isBangla ? 'হিফজুল কুরআন ও নাজেরা ক্লাস' : 'Hifzul Quran & Nazera Class',
                  title: isBangla ? 'রেহাল পেতে সহীহ কুরআন তিলাওয়াত' : 'Sahih Quran Recitation'
                })}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/quran-class.png"
                  alt={isBangla ? 'হিফজুল কুরআন ও নাজেরা ক্লাস' : 'Hifzul Quran & Nazera Class'}
                  className="w-full h-full object-contain"
                />
                <div className="absolute top-3 left-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold shadow-lg">
                    <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                    <span>{isBangla ? 'হিফজ ও নূরানী বিভাগ' : 'Hifz & Noorani Section'}</span>
                  </span>
                </div>
                <button
                  type="button"
                  className="absolute bottom-3 right-3 p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white/80 hover:text-white transition-colors"
                  title={isBangla ? 'বড় করে দেখুন' : 'Click to enlarge'}
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-amber-300 transition-colors">
                  {isBangla ? 'রেহাল পেতে সহীহ কুরআন তিলাওয়াত' : 'Sahih Quran Recitation'}
                </h3>
                <p className="text-xs sm:text-sm text-emerald-200/70 leading-relaxed">
                  {isBangla
                    ? 'অভিজ্ঞ হাফেজ ও ক্বারীদের সরাসরি তত্ত্বাবধানে তাজবীদ ও মাখরাজের বিশুদ্ধ নিয়মে নূরানী, নাজেরা এবং আন্তর্জাতিক মানের হিফজুল কুরআন পাঠদান।'
                    : 'Noorani, Nazera, and international-standard Hifz taught with pure Makhraj and Tajweed under experienced Qaris.'}
                </p>
              </div>
            </div>

            {/* Card 8: Principal Teaching Direct */}
            <div className="group rounded-3xl glass-card border border-emerald-400/25 overflow-hidden flex flex-col justify-between hover:border-amber-400/50 transition-all shadow-xl">
              <div 
                className="relative aspect-[16/9] w-full overflow-hidden bg-[#02180b] flex items-center justify-center cursor-pointer"
                onClick={() => setPreviewImage({
                  src: '/images/principal-class.png',
                  alt: isBangla ? 'অধ্যক্ষ মাওলানা ওমর ফারুক ক্লাসে শিশুদের পাঠদান করছেন' : 'Principal Maulana Omar Faruk teaching children in class',
                  title: isBangla ? 'অধ্যক্ষের প্রত্যক্ষ তত্ত্বাবধানে পাঠোন্নতি' : 'Direct Academic Mentorship'
                })}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/principal-class.png"
                  alt={isBangla ? 'অধ্যক্ষ মাওলানা ওমর ফারুক ক্লাসে শিশুদের পাঠদান করছেন' : 'Principal Maulana Omar Faruk teaching children in class'}
                  className="w-full h-full object-contain"
                />
                <div className="absolute top-3 left-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500 text-black text-xs font-bold shadow-lg">
                    <GraduationCap className="w-3.5 h-3.5 text-black" />
                    <span>{isBangla ? 'ব্যক্তিগত পাঠদান' : 'Direct Tutoring'}</span>
                  </span>
                </div>
                <button
                  type="button"
                  className="absolute bottom-3 right-3 p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white/80 hover:text-white transition-colors"
                  title={isBangla ? 'বড় করে দেখুন' : 'Click to enlarge'}
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-amber-300 transition-colors">
                  {isBangla ? 'অধ্যক্ষের প্রত্যক্ষ তত্ত্বাবধানে পাঠোন্নতি' : 'Direct Academic Mentorship'}
                </h3>
                <p className="text-xs sm:text-sm text-emerald-200/70 leading-relaxed">
                  {isBangla
                    ? 'শিশুদের পাঠের বুনিয়াদ মজবুত করতে এবং প্রতিটি ছাত্রের ব্যক্তিত্ব গঠনে অধ্যক্ষ মাওলানা ওমর ফারুক মুজাহিদী নিজেই ক্লাসে বসে নিবিড় পাঠদান করেন।'
                    : 'Principal Maulana Omar Faruk Mujahidi directly sits with students to solidify learning foundations and build character.'}
                </p>
              </div>
            </div>

            {/* Card 9: Grand Guardians Meeting 1 */}
            <div className="group rounded-3xl glass-card border border-emerald-400/25 overflow-hidden flex flex-col justify-between hover:border-amber-400/50 transition-all shadow-xl lg:col-span-2">
              <div 
                className="relative aspect-[21/9] sm:aspect-[2.2/1] w-full overflow-hidden bg-[#02180b] flex items-center justify-center cursor-pointer"
                onClick={() => setPreviewImage({
                  src: '/images/guardians-meeting-1.png',
                  alt: isBangla ? 'মাদ্রাসার অডিটোরিয়ামে মাসিক অভিভাবক সমাবেশ' : 'Monthly Guardians Meeting at Madrasah Auditorium',
                  title: isBangla ? 'মাসিক অভিভাবক সমাবেশ — নিয়মিত পরামর্শ ও মতবিনিময়' : 'Monthly Guardians Meeting — Regular Dialogue & Guidance'
                })}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/guardians-meeting-1.png"
                  alt={isBangla ? 'মাদ্রাসার অডিটোরিয়ামে মাসিক অভিভাবক সমাবেশ' : 'Monthly Guardians Meeting at Madrasah Auditorium'}
                  className="w-full h-full object-contain"
                />
                <div className="absolute top-3 left-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-700 text-white text-xs font-bold shadow-lg">
                    <Users className="w-3.5 h-3.5 text-amber-300" />
                    <span>Guardians Meeting</span>
                  </span>
                </div>
                <button
                  type="button"
                  className="absolute bottom-3 right-3 p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white/80 hover:text-white transition-colors"
                  title={isBangla ? 'বড় করে দেখুন' : 'Click to enlarge'}
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-amber-300 transition-colors">
                  {isBangla ? 'মাসিক অভিভাবক সমাবেশ — নিয়মিত পরামর্শ ও মতবিনিময়' : 'Monthly Guardians Meeting — Regular Dialogue & Guidance'}
                </h3>
                <p className="text-xs sm:text-sm text-emerald-200/70 leading-relaxed">
                  {isBangla
                    ? 'মাদ্রাসার সেন্ট্রাল কনফারেন্স হলে শিক্ষার্থীদের পড়াশোনার অগ্রগতি ও নৈতিক চরিত্র নিয়ে প্রতি মাসে আয়োজিত হয় বৃহৎ অভিভাবক সম্মেলন। সম্মানিত শিক্ষকমণ্ডলী ও বিশিষ্ট স্কলারদের উপস্থিতিতে উন্মুক্ত প্রশ্নোত্তর ও দিকনির্দেশনা প্রদান করা হয়।'
                    : 'Monthly parent-teacher conferences discussing students’ progress and character in the central hall with open Q&A sessions.'}
                </p>
              </div>
            </div>

            {/* Card 10: Grand Guardians Meeting 2 */}
            <div className="group rounded-3xl glass-card border border-emerald-400/25 overflow-hidden flex flex-col justify-between hover:border-amber-400/50 transition-all shadow-xl">
              <div 
                className="relative aspect-[4/3] w-full overflow-hidden bg-[#02180b] flex items-center justify-center cursor-pointer"
                onClick={() => setPreviewImage({
                  src: '/images/guardians-meeting-2.png',
                  alt: isBangla ? 'সচেতন অভিভাবকদের আন্তরিক অংশগ্রহণ' : 'Active participation of conscious parents',
                  title: isBangla ? 'শতাধিক অভিভাবকের স্বতঃস্ফূর্ত অংশগ্রহণ' : 'Enthusiastic Participation by Guardians'
                })}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/guardians-meeting-2.png"
                  alt={isBangla ? 'সচেতন অভিভাবকদের আন্তরিক অংশগ্রহণ' : 'Active participation of conscious parents'}
                  className="w-full h-full object-contain"
                />
                <div className="absolute top-3 left-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500 text-black text-xs font-bold shadow-lg">
                    <HeartHandshake className="w-3.5 h-3.5 text-black" />
                    <span>{isBangla ? 'সচেতন অভিভাবকবৃন্দ' : 'Conscious Guardians'}</span>
                  </span>
                </div>
                <button
                  type="button"
                  className="absolute bottom-3 right-3 p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white/80 hover:text-white transition-colors"
                  title={isBangla ? 'বড় করে দেখুন' : 'Click to enlarge'}
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-amber-300 transition-colors">
                  {isBangla ? 'শতাধিক অভিভাবকের স্বতঃস্ফূর্ত অংশগ্রহণ' : 'Enthusiastic Participation by Guardians'}
                </h3>
                <p className="text-xs sm:text-sm text-emerald-200/70 leading-relaxed">
                  {isBangla
                    ? 'সন্তানের উজ্জ্বল ভবিষ্যৎ ও দ্বীনি শিক্ষা নিশ্চিত করতে অভিভাবক ও মাদ্রাসার সম্মিলিত অংশীদারিত্ব আমাদের প্রতিষ্ঠানের অন্যতম বড় শক্তি।'
                    : 'The active partnership between parents and madrasah is our greatest strength in ensuring children’s bright future.'}
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* CONTACT INFORMATION SECTION */}
        <section id="contact" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24 sm:scroll-mt-28">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/25 text-amber-300 text-xs font-semibold mb-3">
              <Phone className="w-3.5 h-3.5" />
              <span>Contact Information</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white mb-3">
              {isBangla ? 'যোগাযোগ ও ক্যাম্পাস ঠিকানা' : 'Contact & Campus Address'}
            </h2>
            <p className="text-sm text-emerald-200/70">
              {isBangla 
                ? '২০২৭ শিক্ষাবর্ষে আপনার সন্তানের ভর্তি ও যেকোনো তথ্যের জন্য আমাদের সাথে সরাসরি যোগাযোগ করুন।'
                : 'Contact us directly for admission inquiries and information for the 2027 academic session.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Address Card */}
            <div className="p-7 rounded-3xl glass-card glass-card-hover flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 mb-5">
                  <MapPin className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  {isBangla ? 'ক্যাম্পাস ঠিকানা' : 'Campus Address'}
                </h3>
                <p className="text-sm text-emerald-200/80 leading-relaxed">
                  {isBangla ? (
                    <>
                      ক-৭৫/২, মহাখালী দক্ষিণপাড়া,<br />
                      বনানী, ঢাকা।
                    </>
                  ) : (
                    <>
                      Ka-75/2, Mohakhali Dakshinpara,<br />
                      Banani, Dhaka.
                    </>
                  )}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-emerald-500/15 text-xs text-amber-300">
                {isBangla ? 'ঢাকা শহরের প্রাণকেন্দ্রে নিরাপদ ক্যাম্পাস' : 'Secure campus in the heart of Dhaka'}
              </div>
            </div>

            {/* Phone Card */}
            <div className="p-7 rounded-3xl glass-card glass-card-hover flex flex-col justify-between border-amber-500/30">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 mb-5">
                  <Phone className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  {isBangla ? 'সরাসরি ফোন ও হোয়াটসঅ্যাপ' : 'Direct Call & WhatsApp'}
                </h3>
                <p className="text-xl font-extrabold text-amber-300 mt-2">
                  {isBangla ? '০১৭১২-৬৩৩২৬৪' : '01712-633264'}
                </p>
                <p className="text-xs text-emerald-200/70 mt-1">
                  {isBangla ? 'সরাসরি কল বা WhatsApp-এ মেসেজ দিন' : 'Call directly or message on WhatsApp'}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-emerald-500/15">
                <a 
                  href="tel:01712633264" 
                  className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors"
                >
                  <span>{isBangla ? 'এখনই কল করুন' : 'Call Now'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Admission Card */}
            <div className="p-7 rounded-3xl glass-card glass-card-hover flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 mb-5">
                  <Calendar className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  {isBangla ? 'ভর্তি কার্যক্রম' : 'Admission Procedures'}
                </h3>
                <p className="text-sm text-emerald-200/80 leading-relaxed">
                  <strong className="text-white">
                    {isBangla ? '২০২৭ শিক্ষাবর্ষে' : 'Session 2027'}
                  </strong>{' '}
                  {isBangla 
                    ? 'প্লে-গ্রুপ থেকে ষষ্ঠ শ্রেণি ও হিফজ বিভাগে নতুন ভর্তি চলছে। আসন সংখ্যা সীমিত।' 
                    : 'Admissions open for Play to Class 6 & Hifz. Limited seats available.'}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-emerald-500/15">
                <Link 
                  href="/login" 
                  className="inline-flex items-center gap-2 text-xs font-bold text-emerald-300 hover:text-emerald-200 transition-colors"
                >
                  <span>{isBangla ? 'অনলাইন পোর্টাল লগইন' : 'Online Portal Login'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="border-t border-emerald-500/20 bg-[#010c05] py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full overflow-hidden p-[1.5px] bg-gradient-to-tr from-amber-400 to-emerald-400 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="/logo.jpg" 
                alt={isBangla ? 'আল-মদিনা মডেল মাদ্রাসা লোগো' : 'AMMS Logo'} 
                className="w-full h-full object-cover rounded-full bg-white" 
              />
            </div>
            <div>
              <div className="font-bold text-lg gold-gradient-text">
                Al Madina Model Madrasa and Research Institute
              </div>
              <p className="text-xs text-emerald-200/70 mt-0.5">
                {isBangla 
                  ? 'ক-৭৫/২, মহাখালী দক্ষিণপাড়া, বনানী, ঢাকা • ফোন: ০১৭১২-৬৩৩২৬৪' 
                  : 'Ka-75/2, Mohakhali Dakshinpara, Banani, Dhaka • Phone: 01712-633264'}
              </p>
              <p className="text-xs text-amber-300/80 mt-0.5">
                {isBangla ? 'অধ্যক্ষ: প্রিন্সিপাল মাওলানা ওমর ফারুক মুজাহিদী' : 'Principal: Maulana Omar Faruk Mujahidi'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-xs text-emerald-200/80">
            <a href="tel:01712633264" className="hover:text-amber-300 transition-colors">
              {isBangla ? 'হটলাইন' : 'Hotline'}
            </a>
            <span>•</span>
            <Link href="/login" className="hover:text-amber-300 transition-colors">
              {isBangla ? 'ম্যানেজমেন্ট লগইন' : 'Management Login'}
            </Link>
          </div>
          <div className="text-xs text-emerald-300/50">
            &copy; 2026-2027 Al Madina Model Madrasa. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Floating Smooth Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          aria-label={isBangla ? 'পৃষ্ঠার শুরুতে যান' : 'Scroll to top'}
          title={isBangla ? 'পৃষ্ঠার শুরুতে যান' : 'Scroll to top'}
          className="fixed bottom-6 right-6 z-50 p-3.5 rounded-full bg-gradient-to-tr from-amber-500 via-amber-400 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 font-bold border border-amber-300/60 shadow-[0_10px_35px_rgba(245,158,11,0.5)] backdrop-blur-md transition-all hover:scale-110 active:scale-95 group"
        >
          <ChevronUp className="w-5 h-5 text-emerald-950 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      )}

      {/* FULLSCREEN IMAGE LIGHTBOX MODAL */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200"
          onClick={() => setPreviewImage(null)}
        >
          <button
            onClick={() => setPreviewImage(null)}
            className="absolute top-5 right-5 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer z-50"
            aria-label="Close Preview"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div 
            className="relative max-w-5xl max-h-[85vh] w-full flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewImage.src}
              alt={previewImage.alt}
              className="max-h-[75vh] w-auto max-w-full object-contain rounded-2xl shadow-2xl border border-emerald-400/30"
            />
            <p className="mt-4 text-center text-sm sm:text-base font-semibold text-emerald-100/90 bg-black/60 px-4 py-2 rounded-full border border-emerald-500/20">
              {previewImage.title}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
