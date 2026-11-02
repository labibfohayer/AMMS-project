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
  ChevronUp, Maximize2, X, Menu, Mail, ExternalLink, Send
} from 'lucide-react';

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const { t, d, isBangla } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [previewImage, setPreviewImage] = useState<{ src: string; title: string; alt: string } | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const lenisRef = useRef<Lenis | null>(null);

  // Auto-advancing Hero Carousel (every 5 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // 🏎️ 120 FPS High-Performance Smooth Momentum Scroll
    const lenis = new Lenis({
      duration: 0.65,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.0,
      syncTouch: false,
    });
    lenisRef.current = lenis;

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
    setMobileMenuOpen(false);
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

  const heroSlides = [
    {
      title: isBangla ? "দ্বীনি নৈতিকতা ও আধুনিক জ্ঞানের এক অপূর্ব সমন্বয়" : "Synthesizing Islamic Morals & Modern Education",
      subtitle: isBangla 
        ? "সম্পূর্ণ শীতাতপ নিয়ন্ত্রিত (AC) ক্লাসরুম, প্রজেক্টর ভিত্তিক আধুনিক পাঠদান এবং আন্তর্জাতিক মানের সহীহ হিফজুল কুরআন বিভাগ।" 
        : "Fully air-conditioned classrooms, projector-based multimedia lessons, and international-standard Sahih Hifzul Quran.",
      badge: isBangla ? "নতুন শিক্ষাবর্ষে ভর্তি চলছে" : "Admissions Open for 2027",
      image: "/principal-class.png"
    },
    {
      title: isBangla ? "আন্তর্জাতিক মানের তাজবীদ ও সমৃদ্ধ হিফজখানা" : "International Standard Tajweed & Hifz Division",
      subtitle: isBangla 
        ? "অভিজ্ঞ হাফেজ ও স্কলারদের প্রত্যক্ষ পরিচালনায় বিশুদ্ধ কুরআন তিলাওয়াত, মাশক ও নিবিড় আবাসিক তারবিয়াত।" 
        : "Direct mentorship by experienced Huffaz, pure Quranic recitation, and dedicated residential tarbiyah.",
      badge: isBangla ? "সীমিত আসন সংখ্যা" : "Limited Seats Available",
      image: "/quran-class.png"
    },
    {
      title: isBangla ? "প্লে-গ্রুপ থেকে ষষ্ঠ শ্রেণি পর্যন্ত আধুনিক শিক্ষাক্রম" : "Modern Curriculum: Play-Group to Class 6",
      subtitle: isBangla 
        ? "বাংলা ও ইংরেজি মাধ্যমের চমৎকার সমন্বয়, কম্পিউটার ল্যাব, স্পোকেন ল্যাঙ্গুয়েজ ও চারিত্রিক গঠন।" 
        : "Balanced synthesis of Bengali & English mediums, computer literacy, spoken language, and moral growth.",
      badge: isBangla ? "অভিভাবকদের আস্থার বিদ্যাপীঠ" : "Trusted by Guardians",
      image: "/guardians-meeting-1.png"
    }
  ];

  const ninePillars = [
    {
      num: "০১",
      title: isBangla ? "হিফজুল কুরআন বিভাগ" : "Hifzul Quran Department",
      desc: isBangla 
        ? "আন্তর্জাতিক মানসম্পন্ন হাফেজ ও ক্বারীদের নিবিড় তত্ত্বাবধানে তাজবীদ ও মশকের মাধ্যমে বিশুদ্ধ হিফজ প্রশিক্ষণ।" 
        : "Pure Hifz training under certified international Huffaz with comprehensive Tajweed and Mashq."
    },
    {
      num: "০২",
      title: isBangla ? "সমন্বিত আধুনিক কারিকুলাম" : "Integrated Modern Curriculum",
      desc: isBangla 
        ? "দ্বীনি শিক্ষার পাশাপাশি জাতীয় শিক্ষাক্রম অনুসারে বাংলা, ইংরেজি, গণিত ও বিজ্ঞানের উচ্চমান নিশ্চিতকরণ।" 
        : "National curriculum standards in Bengali, English, Math, and Science alongside deep Islamic grounding."
    },
    {
      num: "০৩",
      title: isBangla ? "সম্পূর্ণ AC ক্লাসরুম" : "Fully Air-Conditioned Classrooms",
      desc: isBangla 
        ? "গ্রীষ্ম ও বর্ষায় মনোরম, আরামদায়ক ও ক্লান্তিহীন পড়াশোনার জন্য সার্বক্ষণিক শীতাতপ নিয়ন্ত্রিত শ্রেণিকক্ষ।" 
        : "Ergonomic, climate-controlled, air-conditioned rooms ensuring student focus and comfort year-round."
    },
    {
      num: "০৪",
      title: isBangla ? "প্রজেক্টর ও মাল্টিমিডিয়া শিক্ষা" : "Projector & Multimedia Lessons",
      desc: isBangla 
        ? "প্রতিটি ক্লাসে ভিজ্যুয়াল কন্টেন্ট, ডিজিটাল প্রজেক্টর ও অডিও-ভিজ্যুয়াল উপকরণের মাধ্যমে আকর্ষণীয় পাঠদান।" 
        : "Interactive visual teaching using digital multimedia projectors for high cognitive retention."
    },
    {
      num: "০৫",
      title: isBangla ? "আরবি ও ইংরেজি ভাষা চর্চা" : "Spoken Arabic & English Lab",
      desc: isBangla 
        ? "ব্যবহারিক কথোপকথন, ভাষা ল্যাব ও নিয়মিত উপস্থাপনার মাধ্যমে আন্তর্জাতিক ভাষায় কথা বলার দক্ষতা অর্জন।" 
        : "Practical conversational practice, daily spoken vocabulary, and trilingual fluency."
    },
    {
      num: "০৬",
      title: isBangla ? "অভিজ্ঞ ওস্তাদ ও শিক্ষকমণ্ডলী" : "Experienced Faculty Council",
      desc: isBangla 
        ? "অধ্যক্ষ মাওলানা ওমর ফারুক মুজাহিদীর প্রত্যক্ষ পরিচালনায় শীর্ষ ইসলামিক বিদ্যাপীঠের অভিজ্ঞ শিক্ষক পরিষদ।" 
        : "Led directly by Principal Maulana Omar Faruk Mujahidi with certified scholars and educators."
    },
    {
      num: "০৭",
      title: isBangla ? "২৪ ঘণ্টা CCTV সার্বিক নিরাপত্তা" : "24/7 CCTV & Digital Security",
      desc: isBangla 
        ? "ক্যাম্পাস ও হোস্টেলে সার্বক্ষণিক সিসিটিভি ক্যামেরা নজরদারি এবং ডিজিটাল কিউআর গেটপাস নিয়ন্ত্রণ ব্যবস্থা।" 
        : "Full campus surveillance, digital QR gatepass tracking, and strict parent verification protocols."
    },
    {
      num: "০৮",
      title: isBangla ? "স্বাস্থ্যসম্মত খাবার ও ডাইনিং" : "Hygienic Dining & Boarding",
      desc: isBangla 
        ? "আবাসিক শিক্ষার্থীদের জন্য অভিজ্ঞ বাবুর্চি দ্বারা প্রস্তুতকৃত পুষ্টিকর, পরিচ্ছন্ন ও সুষম খাদ্য ব্যবস্থা।" 
        : "Balanced, nutritious meals prepared under strict hygiene standards in our private campus dining."
    },
    {
      num: "০৯",
      title: isBangla ? "ডিজিটাল মনিটরিং ও রেজাল্ট" : "Digital Monitoring & Reports",
      desc: isBangla 
        ? "ওয়েব পোর্টাল, এসএমএস নোটিফিকেশন ও ডিজিটাল মার্কশিটের মাধ্যমে অভিভাবকদের সার্বক্ষণিক অগ্রগতি আপডেট।" 
        : "Real-time attendance SMS, instant online gradecards, and transparent parent portal tracking."
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-800 selection:bg-[#C5A059] selection:text-white overflow-x-hidden relative font-sans">
      
      {/* 1. TOP INSTITUTIONAL UTILITY BAR */}
      <div className="bg-[#132A20] text-emerald-100 py-2 px-4 text-xs font-medium border-b border-[#1F4233] relative z-50">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          
          {/* Contact Hotlines */}
          <div className="flex items-center gap-4 sm:gap-6 flex-wrap justify-center">
            <a href="tel:01712633264" className="flex items-center gap-1.5 hover:text-[#C5A059] transition-colors">
              <Phone size={13} className="text-[#C5A059]" />
              <span>{isBangla ? '০১৭১২-৬৩৩২৬৪ (হটলাইন)' : '01712-633264 (Hotline)'}</span>
            </a>
            <span className="hidden md:flex items-center gap-1.5 text-emerald-200/80">
              <MapPin size={13} className="text-[#C5A059]" />
              <span>{isBangla ? 'ক-৭৫/২, মহাখালী দক্ষিণপাড়া, বনানী, ঢাকা' : 'Mohakhali Dakshinpara, Banani, Dhaka'}</span>
            </span>
          </div>

          {/* Quick Actions & Language */}
          <div className="flex items-center gap-3">
            <span className="hidden lg:inline text-emerald-200/80 text-[11px] font-semibold">
              {isBangla ? '✨ সেশন ২০২৭ ভর্তি কার্যক্রম চলমান' : '✨ Admissions Open for 2027'}
            </span>
            <LanguageSwitcher variant="light" />
            
            {isAuthenticated && user ? (
              <Link
                href={['principal', 'vice_principal', 'managing_director', 'teacher', 'staff'].includes(user.role) ? '/dashboard' : user.role === 'guardian' ? '/guardian' : '/student'}
                className="bg-[#C5A059] hover:bg-[#B38E46] text-slate-900 px-3.5 py-1 rounded-full text-xs font-bold shadow-xs transition-all flex items-center gap-1"
              >
                <span>{isBangla ? 'ড্যাশবোর্ড' : 'Dashboard'}</span>
                <ArrowRight size={13} />
              </Link>
            ) : (
              <Link
                href="/login"
                className="bg-[#C5A059] hover:bg-[#B38E46] text-slate-900 px-3.5 py-1 rounded-full text-xs font-bold shadow-xs transition-all flex items-center gap-1"
              >
                <span>{isBangla ? 'লগইন পোর্টাল' : 'Portal Login'}</span>
                <ArrowRight size={13} />
              </Link>
            )}
          </div>

        </div>
      </div>

      {/* 2. MAIN INSTITUTIONAL NAVBAR */}
      <header className={`sticky top-0 z-40 transition-all duration-200 ${scrolled ? 'bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs py-2.5' : 'bg-white border-b border-slate-200 py-3.5'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          {/* Logo & Brand Emblem */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-12 h-12 sm:w-13 sm:h-13 rounded-full overflow-hidden p-[2px] bg-[#C5A059] shadow-md group-hover:scale-105 transition-all shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="/logo.jpg" 
                alt={isBangla ? 'আল-মদিনা মডেল মাদ্রাসা এন্ড রিসার্চ ইনস্টিটিউট' : 'Al Madina Model Madrasa & Research Institute'} 
                className="w-full h-full object-cover rounded-full bg-white shadow-inner" 
              />
            </div>
            <div>
              <div className="font-extrabold text-sm sm:text-base tracking-tight text-[#132A20] leading-tight">
                {isBangla ? 'আল-মদিনা মডেল মাদ্রাসা' : 'Al-Madinah Model Madrasah'}
              </div>
              <div className="text-[11px] text-slate-500 font-medium tracking-wide">
                {isBangla ? 'এন্ড রিসার্চ ইনস্টিটিউট • বনানী, ঢাকা' : '& Research Institute • Banani, Dhaka'}
              </div>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold text-slate-700">
            <Link href="/" className="text-[#1B4332] font-bold">{isBangla ? 'হোম' : 'Home'}</Link>
            <Link href="/admission" className="text-[#B38E46] font-bold hover:text-[#C5A059] transition-colors flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>{isBangla ? 'ভর্তি তথ্য' : 'Admissions'}</span>
            </Link>
            <a 
              href="#pillars" 
              onClick={(e) => scrollToSection(e, 'pillars')}
              className="hover:text-[#1B4332] transition-colors"
            >
              {isBangla ? 'আমাদের বিশেষত্ব' : 'Why Al-Madina'}
            </a>
            <a 
              href="#curriculum" 
              onClick={(e) => scrollToSection(e, 'curriculum')}
              className="hover:text-[#1B4332] transition-colors"
            >
              {isBangla ? 'কী কী পড়ানো হয়' : 'Curriculum'}
            </a>
            <a 
              href="#about" 
              onClick={(e) => scrollToSection(e, 'about')}
              className="hover:text-[#1B4332] transition-colors"
            >
              {isBangla ? 'অধ্যক্ষের বাণী' : 'Principal'}
            </a>
            <a 
              href="#gallery" 
              onClick={(e) => scrollToSection(e, 'gallery')}
              className="hover:text-[#1B4332] transition-colors"
            >
              {isBangla ? 'ক্যাম্পাস চিত্র' : 'Gallery'}
            </a>
            <a 
              href="#contact" 
              onClick={(e) => scrollToSection(e, 'contact')}
              className="hover:text-[#1B4332] transition-colors"
            >
              {isBangla ? 'যোগাযোগ' : 'Contact'}
            </a>
          </nav>

          {/* Action Button & Mobile Hamburger Toggle */}
          <div className="flex items-center gap-3">
            <Link 
              href="/admission" 
              className="hidden sm:inline-flex items-center gap-2 bg-[#1B4332] hover:bg-[#132E23] text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all hover:-translate-y-0.5 active:scale-95"
            >
              <Sparkles size={15} className="text-[#C5A059]" />
              <span>{isBangla ? 'অনলাইন ভর্তি আবেদন' : 'Online Admission'}</span>
            </Link>

            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

        </div>

        {/* Mobile Slide-down Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-3 shadow-lg">
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-[#1B4332] font-bold border-b border-slate-100">
              {isBangla ? 'হোম' : 'Home'}
            </Link>
            <Link href="/admission" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-[#B38E46] font-bold border-b border-slate-100 flex items-center gap-2">
              <Sparkles size={16} className="text-[#C5A059]" />
              <span>{isBangla ? 'অনলাইন ভর্তি তথ্য' : 'Admissions'}</span>
            </Link>
            <a href="#pillars" onClick={(e) => scrollToSection(e, 'pillars')} className="block py-2 text-slate-700 font-semibold border-b border-slate-100">
              {isBangla ? 'আমাদের বিশেষত্ব (৯ স্তম্ভ)' : 'Our 9 Core Pillars'}
            </a>
            <a href="#curriculum" onClick={(e) => scrollToSection(e, 'curriculum')} className="block py-2 text-slate-700 font-semibold border-b border-slate-100">
              {isBangla ? 'কী কী পড়ানো হয় (পাঠ্যক্রম)' : 'Curriculum'}
            </a>
            <a href="#about" onClick={(e) => scrollToSection(e, 'about')} className="block py-2 text-slate-700 font-semibold border-b border-slate-100">
              {isBangla ? 'অধ্যক্ষ মহোদয়ের বাণী' : 'Principal Message'}
            </a>
            <a href="#gallery" onClick={(e) => scrollToSection(e, 'gallery')} className="block py-2 text-slate-700 font-semibold border-b border-slate-100">
              {isBangla ? 'ক্যাম্পাস ফটো গ্যালারি' : 'Campus Gallery'}
            </a>
            <a href="#contact" onClick={(e) => scrollToSection(e, 'contact')} className="block py-2 text-slate-700 font-semibold">
              {isBangla ? 'যোগাযোগ ও ঠিকানা' : 'Contact & Address'}
            </a>
            <Link href="/admission" onClick={() => setMobileMenuOpen(false)} className="block w-full text-center py-3 bg-[#1B4332] text-white rounded-xl font-bold shadow-xs">
              {isBangla ? 'অনলাইন ভর্তি ফরম পূরণ করুন' : 'Apply Online Now'}
            </Link>
          </div>
        )}
      </header>

      {/* 3. DUAL SPLIT HERO SECTION (Madrasatus Sunnah REA Layout) */}
      <section className="relative overflow-hidden py-6 sm:py-10 bg-gradient-to-b from-[#F0FDF4]/60 to-[#F8F9FA] border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-7 gap-6 items-stretch">
            
            {/* Left 5-Columns: High-Impact Carousel Banner */}
            <div className="lg:col-span-5 bg-[#132A20] text-white rounded-3xl p-6 sm:p-10 shadow-md border border-[#1F4233] relative overflow-hidden flex flex-col justify-between min-h-[420px] transition-all">
              
              {/* Subtle Ambient Glow and Geometric Ring Pattern */}
              <div className="absolute -bottom-16 -right-16 opacity-10 pointer-events-none">
                <div className="w-96 h-96 rounded-full border-[28px] border-white" />
              </div>

              <div className="relative z-10 space-y-4 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 text-emerald-200 border border-white/15 text-xs font-semibold">
                  <Sparkles size={13} className="text-[#C5A059]" />
                  <span>{heroSlides[activeSlide].badge}</span>
                </div>

                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.2] text-white">
                  {heroSlides[activeSlide].title}
                </h1>

                <p className="text-emerald-100/85 text-xs sm:text-sm md:text-base leading-relaxed">
                  {heroSlides[activeSlide].subtitle}
                </p>

                {/* Quick Feature Chips */}
                <div className="pt-2 flex flex-wrap gap-2 text-xs">
                  <span className="px-3 py-1 rounded-full bg-white/10 text-white font-medium border border-white/15">
                    ❄️ সম্পূর্ণ AC ক্লাসরুম
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white/10 text-white font-medium border border-white/15">
                    📽️ প্রজেক্টর পাঠদান
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white/10 text-white font-medium border border-white/15">
                    📖 নুরানী, নাজেরা ও হিফজ
                  </span>
                </div>
              </div>

              {/* Action Buttons & Indicator Dots */}
              <div className="relative z-10 pt-6 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 mt-6">
                <div className="flex flex-wrap items-center gap-3">
                  <Link 
                    href="/admission" 
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#C5A059] hover:bg-[#B38E46] text-slate-900 rounded-xl font-bold text-xs sm:text-sm shadow-sm transition-all"
                  >
                    <span>{isBangla ? 'অনলাইনে এখনই আবেদন করুন' : 'Apply Online Now'}</span>
                    <ChevronRight size={16} />
                  </Link>

                  <a 
                    href="tel:01712633264" 
                    className="inline-flex items-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/15 text-white rounded-xl font-semibold text-xs transition-colors"
                  >
                    <Phone size={14} className="text-[#C5A059]" />
                    <span>{isBangla ? 'হটলাইন: ০১৭১২-৬৩৩২৬৪' : 'Call 01712-633264'}</span>
                  </a>
                </div>

                {/* Carousel Indicator Dots */}
                <div className="flex items-center gap-2">
                  {heroSlides.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveSlide(i)}
                      aria-label={`Slide ${i + 1}`}
                      className={`h-2.5 rounded-full transition-all cursor-pointer ${
                        activeSlide === i ? 'w-8 bg-[#C5A059]' : 'w-2.5 bg-white/30 hover:bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </div>

            </div>

            {/* Right 2-Columns: Live Admission Bento Card (hm-admission) */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs flex flex-col justify-between border-l-4 border-l-[#16A34A]">
              
              <div className="space-y-4">
                {/* Live Indicator */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-600"></span>
                    </span>
                    <span className="text-xs font-bold text-green-800 uppercase tracking-wider">
                      {isBangla ? 'লাইভ ভর্তি তথ্য' : 'Live Admission'}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-green-50 text-green-700 border border-green-200">
                    ২০২৭ শিক্ষাবর্ষ
                  </span>
                </div>

                <div>
                  <h2 className="font-extrabold text-base sm:text-lg text-slate-900 leading-snug">
                    {isBangla ? 'প্লে থেকে ষষ্ঠ ও হিফজে ভর্তি চলছে' : 'Admissions Open: Play to Class 6 & Hifz'}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    {isBangla 
                      ? 'নাজেরা, হিফজুল কুরআন ও জেনারেল কিতাব বিভাগে সীমিত আসনে সাক্ষাৎকার ও মৌখিক পরীক্ষা চলছে।' 
                      : 'Oral interviews and assessments are ongoing for limited seats in Nazera, Hifz, and General grades.'}
                  </p>
                </div>

                {/* Status Badges */}
                <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                  <div className="flex items-center justify-between py-1.5 px-3 rounded-xl bg-green-50/80 text-green-900 font-semibold border border-green-100">
                    <span>{isBangla ? 'হিফজুল কুরআন বিভাগ:' : 'Hifzul Quran:'}</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-green-200 text-green-800 font-bold">চলমান</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 px-3 rounded-xl bg-green-50/80 text-green-900 font-semibold border border-green-100">
                    <span>{isBangla ? 'প্লে - ৬ষ্ঠ শ্রেণি জেনারেল:' : 'Play - Class 6 General:'}</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-green-200 text-green-800 font-bold">চলমান</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 px-3 rounded-xl bg-green-50/80 text-green-900 font-semibold border border-green-100">
                    <span>{isBangla ? 'নূরানী ও নাজেরা বিভাগ:' : 'Noorani & Nazera:'}</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-green-200 text-green-800 font-bold">চলমান</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 px-3 rounded-xl bg-green-50/80 text-green-900 font-semibold border border-green-100">
                    <span>{isBangla ? 'আবাসিক ও ডে-কেয়ার:' : 'Boarding & Day-Care:'}</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-green-200 text-green-800 font-bold">চলমান</span>
                  </div>
                </div>
              </div>

              {/* Instant CTA Button */}
              <div className="pt-4 mt-4 border-t border-slate-100">
                <Link 
                  href="/admission" 
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#16A34A] hover:bg-green-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs group"
                >
                  <span>{isBangla ? 'অনলাইন ভর্তি ফরম পূরণ করুন' : 'Fill Online Admission Form'}</span>
                  <ChevronRight size={15} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 4. INFINITE RUNNING NOTICE TICKER */}
      <div className="py-3 border-y border-[#1F4233] bg-[#132A20] text-emerald-100 overflow-hidden relative shadow-inner">
        <div className="animate-marquee whitespace-nowrap text-xs sm:text-sm font-semibold tracking-wider flex items-center gap-8">
          <span>📢 {isBangla ? 'ভর্তি বিজ্ঞপ্তি: ২০২৭ শিক্ষাবর্ষে প্লে থেকে ষষ্ঠ শ্রেণি ও হিফজুল কুরআন বিভাগে ভর্তি চলছে' : 'Admission Notice: Admissions Open for 2027 in Play to Class 6 & Hifzul Quran'}</span>
          <span className="text-[#C5A059]">•</span>
          <span>{isBangla ? 'ক্যাম্পাস: ক-৭৫/২, মহাখালী দক্ষিণপাড়া, বনানী, ঢাকা-১২১২' : 'Campus: Ka-75/2, Mohakhali Dakshinpara, Banani, Dhaka'}</span>
          <span className="text-[#C5A059]">•</span>
          <span>{isBangla ? 'হটলাইন: ০১৭১২-৬৩৩২৬৪' : 'Hotline: 01712-633264'}</span>
          <span className="text-[#C5A059]">•</span>
          <span>{isBangla ? 'সম্পূর্ণ শীতাতপ নিয়ন্ত্রিত (AC) আধুনিক ক্লাসরুম ও প্রজেক্টর পাঠদান' : 'Fully AC Classrooms & Projector Multimedia Teaching'}</span>
          <span className="text-[#C5A059]">•</span>
          <span>{isBangla ? '২৪ ঘণ্টা CCTV সার্বিক নিরাপত্তা ও ডিজিটাল গেটপাস' : '24/7 CCTV Campus Surveillance & Digital Gatepass'}</span>
          <span className="text-[#C5A059]">•</span>
          <span>📢 {isBangla ? 'ভর্তি বিজ্ঞপ্তি: ২০২৭ শিক্ষাবর্ষে প্লে থেকে ষষ্ঠ শ্রেণি ও হিফজুল কুরআন বিভাগে ভর্তি চলছে' : 'Admission Notice: Admissions Open for 2027 in Play to Class 6 & Hifzul Quran'}</span>
          <span className="text-[#C5A059]">•</span>
          <span>{isBangla ? 'ক্যাম্পাস: ক-৭৫/২, মহাখালী দক্ষিণপাড়া, বনানী, ঢাকা-১২১২' : 'Campus: Ka-75/2, Mohakhali Dakshinpara, Banani, Dhaka'}</span>
          <span className="text-[#C5A059]">•</span>
          <span>{isBangla ? 'হটলাইন: ০১৭১২-৬৩৩২৬৪' : 'Hotline: 01712-633264'}</span>
        </div>
      </div>

      {/* 5. NINE CORE EDUCATIONAL PILLARS (Why Al-Madina?) */}
      <section id="pillars" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <span className="inline-block px-3.5 py-1 rounded-full bg-emerald-50 text-[#1B4332] border border-emerald-200 text-xs font-bold">
            {isBangla ? 'আমাদের বিশেষত্ব ও অঙ্গীকার' : 'Our Distinctive Strengths'}
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {isBangla ? 'কেন আল-মদিনা মডেল মাদ্রাসাকে বেছে নেবেন?' : 'Why Choose Al-Madina Model Madrasah?'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {isBangla
              ? 'দ্বীনি নৈতিকতা ও আধুনিক জ্ঞানের সুষম সমন্বয়ে পরিচালিত একটি আদর্শ বিদ্যাপীঠ।'
              : 'An ideal institution fostering Islamic values and contemporary academic excellence.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ninePillars.map((item, idx) => (
            <div 
              key={idx}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono font-black px-2.5 py-1 rounded-lg bg-emerald-50 text-[#1B4332] border border-emerald-100">
                    {item.num}
                  </span>
                  <CheckCircle2 size={18} className="text-[#C5A059] group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="font-extrabold text-base text-slate-900 mb-2 group-hover:text-[#1B4332] transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. ACADEMIC PROGRAMS & CURRICULUM SECTION */}
      <section id="curriculum" className="py-16 sm:py-24 bg-white border-y border-slate-200 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#C5A059]/15 border border-[#C5A059]/30 text-[#8C6D23] text-xs font-semibold">
              <Layers className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>{isBangla ? 'শিক্ষাক্রম ও বিভাগসমূহ' : 'Curriculum & Programs'}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {isBangla ? 'কী কী পড়ানো হয় ও আমাদের শিক্ষাক্রম' : 'What We Teach & Our Academic Programs'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              {isBangla
                ? 'কুরআন ও সুন্নাহ ভিত্তিক নৈতিক শিক্ষার সাথে বাংলা, ইংরেজি ও আরবি ভাষার সমন্বিত পাঠদান।'
                : 'Quran & Sunnah-based moral education harmonized with Bengali, English, and Arabic mediums.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Program 1 */}
            <div className="bg-[#F8F9FA] border border-slate-200 rounded-3xl p-6 hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#1B4332]/10 border border-[#1B4332]/20 flex items-center justify-center text-[#1B4332] mb-5">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {isBangla ? 'জেনারেল শিক্ষা (প্লে - ৬ষ্ঠ)' : 'General Education (Play - 6th)'}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  {isBangla 
                    ? 'Play-group থেকে ৬ষ্ঠ শ্রেণি পর্যন্ত জাতীয় শিক্ষাক্রম অনুযায়ী বাংলা ও ইংরেজি ভার্সনের সমন্বয়ে আধুনিক পাঠদান।' 
                    : 'Modern curriculum from Play to Class 6 adhering to national standards with strong English skills.'}
                </p>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-700 pt-3 border-t border-slate-200">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-[#C5A059]" />
                  <span>বোর্ড স্ট্যান্ডার্ড পাঠ্যপুস্তক</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-[#C5A059]" />
                  <span>প্রজেক্টরে অডিও-ভিজ্যুয়াল ক্লাস</span>
                </li>
              </ul>
            </div>

            {/* Program 2 */}
            <div className="bg-[#F8F9FA] border border-slate-200 rounded-3xl p-6 hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#C5A059]/15 border border-[#C5A059]/30 flex items-center justify-center text-[#B38E46] mb-5">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {isBangla ? 'হিফজুল কুরআন বিভাগ' : 'Hifzul Quran Division'}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  {isBangla 
                    ? 'সহীহ মাখরাজ ও তাজবীদভিত্তিক বিশুদ্ধ হিফজুল কুরআন বিভাগ। দ্রুত ও নিখুঁত হিফজের আধুনিক পদ্ধতি।' 
                    : 'Authentic Tajweed, precise pronunciation, and structured memorization under expert Huffaz.'}
                </p>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-700 pt-3 border-t border-slate-200">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-[#C5A059]" />
                  <span>আবাসিক ও অনাবাসিক ব্যবস্থা</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-[#C5A059]" />
                  <span>দৈনিক ছবক ও নিয়মিত রিভিশন</span>
                </li>
              </ul>
            </div>

            {/* Program 3 */}
            <div className="bg-[#F8F9FA] border border-slate-200 rounded-3xl p-6 hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#1B4332]/10 border border-[#1B4332]/20 flex items-center justify-center text-[#1B4332] mb-5">
                  <Layers className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {isBangla ? 'নূরানী ও নাজেরা বিভাগ' : 'Noorani & Nazera'}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  {isBangla 
                    ? 'ছোট সোনামণিদের জন্য আনন্দের সাথে নূরানী পদ্ধতিতে কায়দা, আমপারা ও পূর্ণ কুরআন নাজেরা সম্পন্নকরণ।' 
                    : 'Gentle, joyful foundational Quran reading through Noorani methods for early learners.'}
                </p>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-700 pt-3 border-t border-slate-200">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-[#C5A059]" />
                  <span>মাসনুন দোয়া ও আদব শিক্ষা</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-[#C5A059]" />
                  <span>সহজ সুন্দর উচ্চারণ প্রশিক্ষণ</span>
                </li>
              </ul>
            </div>

            {/* Program 4 */}
            <div className="bg-[#F8F9FA] border border-slate-200 rounded-3xl p-6 hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#C5A059]/15 border border-[#C5A059]/30 flex items-center justify-center text-[#B38E46] mb-5">
                  <Tv className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {isBangla ? 'ভাষা ও কম্পিউটার ল্যাব' : 'Language & Tech Lab'}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  {isBangla 
                    ? 'স্পোকেন অ্যারাবিক, দৈনন্দিন ইংরেজি কথোপকথন ও মৌলিক কম্পিউটার চালনায় দক্ষ করে গড়ে তোলা।' 
                    : 'Spoken Arabic fluency, communicative English, and hands-on digital computer education.'}
                </p>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-700 pt-3 border-t border-slate-200">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-[#C5A059]" />
                  <span>ব্যবহারিক স্পোকেন প্র্যাকটিস</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-[#C5A059]" />
                  <span>স্মার্ট ল্যাব সুবিধা</span>
                </li>
              </ul>
            </div>

          </div>

        </div>
      </section>

      {/* 7. PRINCIPAL'S MESSAGE & LEADERSHIP (About Al-Madina) */}
      <section id="about" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        
        {/* Principal Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 shadow-xs border-b-4 border-b-[#1B4332] flex flex-col md:flex-row items-center gap-8 mb-10">
          <div className="w-36 h-36 sm:w-48 sm:h-48 rounded-full border-4 border-[#C5A059] p-1 shrink-0 overflow-hidden shadow-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/principal.jpg" 
              alt="মাওলানা ওমর ফারুক মুজাহিদী - অধ্যক্ষ" 
              className="w-full h-full object-cover rounded-full" 
            />
          </div>
          <div className="space-y-4 text-center md:text-left">
            <span className="text-xs font-bold text-[#1B4332] uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
              {isBangla ? 'অধ্যক্ষ মহোদয়ের বাণী' : 'Message from Principal'}
            </span>
            <p className="text-base sm:text-lg text-slate-800 font-medium leading-relaxed italic">
              {isBangla 
                ? '“আমরা আল-মদিনা মডেল মাদ্রাসায় এমন একটি পরিবেশ সৃষ্টি করেছি যেখানে প্রতিটি শিক্ষার্থী আল্লাহর কালাম হিফজ করার পাশাপাশি যুগোপযোগী জ্ঞানে বলীয়ান হয়ে সৎ, দক্ষ ও খোদাভীরু মানুষ হিসেবে গড়ে উঠবে। আমাদের পুরো ক্যাম্পাস সম্পূর্ণ এসি, সিসিটিভি নিয়ন্ত্রিত এবং ব্যক্তিগত তদারকিতে পরিচালিত।”' 
                : '“At Al-Madina Model Madrasah, we have established an ecosystem where every student memorizes the Quran while gaining contemporary academic skills to become an ethical, proficient, and God-conscious leader.”'}
            </p>
            <div>
              <h3 className="font-extrabold text-xl text-slate-900">মাওলানা ওমর ফারুক মুজাহিদী</h3>
              <p className="text-xs text-[#8C6D23] font-semibold">প্রতিষ্ঠাতা ও অধ্যক্ষ • আল-মদিনা মডেল মাদ্রাসা এন্ড রিসার্চ ইনস্টিটিউট</p>
            </div>
          </div>
        </div>

        {/* Managing Director & Administration Insight */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex items-center gap-5">
            <div className="w-20 h-20 rounded-full border-2 border-[#C5A059] p-0.5 shrink-0 overflow-hidden shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/md.jpg" alt="লাবিব ফোহায়ের" className="w-full h-full object-cover rounded-full object-top" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-[#8C6D23] uppercase">প্রশাসন ও ব্যবস্থাপনা</span>
              <h4 className="font-bold text-base text-slate-900">লাবিব ফোহায়ের</h4>
              <p className="text-xs text-slate-500">ম্যানেজিং ডিরেক্টর • গভর্নিং বডি ও ট্রাস্টি</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-center">
            <div className="flex items-center gap-2 text-xs font-bold text-[#1B4332] mb-1">
              <Building size={16} className="text-[#C5A059]" />
              <span>ক্যাম্পাস অবস্থান</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              ক-৭৫/২, মহাখালী দক্ষিণপাড়া, বনানী, ঢাকা-১২১২।<br />
              <span className="text-slate-500 text-xs">গুলশান, বনানী ও মহাখালী এলাকার কেন্দ্রবিন্দুতে মনোরম ও নিরাপদ পরিবেশে অবস্থিত।</span>
            </p>
          </div>
        </div>

      </section>

      {/* 8. CAMPUS GALLERY WITH ZOOM MODAL */}
      <section id="gallery" className="py-16 sm:py-24 bg-white border-y border-slate-200 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <span className="inline-block px-3.5 py-1 rounded-full bg-[#C5A059]/15 border border-[#C5A059]/30 text-[#8C6D23] text-xs font-bold">
              {isBangla ? 'ক্যাম্পাস স্থিরচিত্র' : 'Campus Photo Gallery'}
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {isBangla ? 'আমাদের ক্লাসরুম ও ক্যাম্পাস দৃশ্য' : 'Our Campus & Classroom Moments'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              {isBangla ? 'ছবিগুলোর উপর ক্লিক করে বড় করে দেখুন।' : 'Click on any photo to view in high resolution.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div 
              onClick={() => setPreviewImage({ src: '/principal-class.png', title: 'অধ্যক্ষ মহোদয়ের পাঠদান', alt: 'ক্লাসরুম' })}
              className="group relative rounded-2xl overflow-hidden border border-slate-200 shadow-xs cursor-pointer h-64"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/principal-class.png" alt="ক্লাসরুম" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent flex items-end p-4">
                <span className="text-white text-xs font-bold flex items-center justify-between w-full">
                  <span>অধ্যক্ষ মহোদয়ের সরাসরি ক্লাস</span>
                  <Maximize2 size={14} className="text-[#C5A059]" />
                </span>
              </div>
            </div>

            <div 
              onClick={() => setPreviewImage({ src: '/quran-class.png', title: 'হিফজুল কুরআন বিভাগ', alt: 'হিফজখানা' })}
              className="group relative rounded-2xl overflow-hidden border border-slate-200 shadow-xs cursor-pointer h-64"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/quran-class.png" alt="হিফজখানা" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent flex items-end p-4">
                <span className="text-white text-xs font-bold flex items-center justify-between w-full">
                  <span>সহীহ হিফজুল কুরআন প্রশিক্ষণ</span>
                  <Maximize2 size={14} className="text-[#C5A059]" />
                </span>
              </div>
            </div>

            <div 
              onClick={() => setPreviewImage({ src: '/guardians-meeting-1.png', title: 'অভিভাবক সম্মেলন', alt: 'অভিভাবক সমাবেশ' })}
              className="group relative rounded-2xl overflow-hidden border border-slate-200 shadow-xs cursor-pointer h-64"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/guardians-meeting-1.png" alt="অভিভাবক সমাবেশ" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent flex items-end p-4">
                <span className="text-white text-xs font-bold flex items-center justify-between w-full">
                  <span>নিয়মিত অভিভাবক সমাবেশ</span>
                  <Maximize2 size={14} className="text-[#C5A059]" />
                </span>
              </div>
            </div>

            <div 
              onClick={() => setPreviewImage({ src: '/awards-crests.png', title: 'পুরস্কার ও সম্মাননা', alt: 'ক্রেস্ট ও সনদ' })}
              className="group relative rounded-2xl overflow-hidden border border-slate-200 shadow-xs cursor-pointer h-64"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/awards-crests.png" alt="ক্রেস্ট ও সনদ" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent flex items-end p-4">
                <span className="text-white text-xs font-bold flex items-center justify-between w-full">
                  <span>শিক্ষার্থীদের মেধা সম্মাননা ক্রেস্ট</span>
                  <Maximize2 size={14} className="text-[#C5A059]" />
                </span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 9. CONTACT & INQUIRY SECTION */}
      <section id="contact" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <span className="inline-block px-3.5 py-1 rounded-full bg-emerald-50 text-[#1B4332] border border-emerald-200 text-xs font-bold">
            {isBangla ? 'সরাসরি যোগাযোগ' : 'Contact Us'}
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {isBangla ? 'ক্যাম্পাস পরিদর্শন ও যোগাযোগ' : 'Visit Our Campus & Reach Out'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            {isBangla ? 'যেকোনো তথ্যের জন্য কল করুন বা ক্যাম্পাসে সরাসরি চলে আসুন।' : 'Call our hotline or visit our Mohakhali campus anytime.'}
          </p>
        </div>

        {/* 3 Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          
          <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center shadow-xs border-b-4 border-b-[#1B4332]">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#1B4332] flex items-center justify-center mx-auto mb-3">
              <Phone size={22} className="text-[#C5A059]" />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1">অফিসিয়াল হটলাইন</h3>
            <p className="text-xs text-slate-500 mb-2">সকাল ৮:০০ থেকে রাত ৯:০০ পর্যন্ত</p>
            <a href="tel:01712633264" className="text-sm font-extrabold text-[#1B4332] hover:underline">
              ০১৭১২-৬৩৩২৬৪
            </a>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center shadow-xs border-b-4 border-b-[#C5A059]">
            <div className="w-12 h-12 rounded-full bg-[#FAF5EB] text-[#8C6D23] flex items-center justify-center mx-auto mb-3">
              <MapPin size={22} className="text-[#C5A059]" />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1">ক্যাম্পাস ঠিকানা</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              ক-৭৫/২, মহাখালী দক্ষিণপাড়া, বনানী, ঢাকা-১২১২
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center shadow-xs border-b-4 border-b-[#1B4332]">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#1B4332] flex items-center justify-center mx-auto mb-3">
              <Sparkles size={22} className="text-[#C5A059]" />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1">ভর্তি সহায়তা</h3>
            <p className="text-xs text-slate-500 mb-2">অনলাইন ও সরাসরি ফর্ম সংগ্রহ</p>
            <Link href="/admission" className="text-xs font-bold text-[#8C6D23] hover:underline">
              অনলাইনে আবেদন করুন →
            </Link>
          </div>

        </div>

        {/* Location & Map Embed */}
        <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-6 shadow-xs overflow-hidden">
          <div className="rounded-2xl overflow-hidden h-72 sm:h-96 w-full border border-slate-200">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3651.054366657906!2d90.4005!3d23.781!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755c70c00000001%3A0x1!2sMohakhali%20Dakshinpara!5e0!3m2!1sen!2sbd!4v1700000000000!5m2!1sen!2sbd" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen 
              loading="lazy" 
              title="Madrasah Location Map"
            />
          </div>
        </div>

      </section>

      {/* 10. INSTITUTIONAL 4-COLUMN FOOTER */}
      <footer className="bg-[#0F172A] text-slate-400 py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-[#C5A059] p-0.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover rounded-full bg-white" />
              </div>
              <h4 className="font-bold text-white text-sm">আল-মদিনা মডেল মাদ্রাসা</h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              এন্ড রিসার্চ ইনস্টিটিউট • দ্বীনি নৈতিকতা ও আধুনিক জ্ঞানের অনন্য সমন্বয়ে পরিচালিত এক আদর্শ ইসলামিক বিদ্যাপীঠ।
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">গুরুত্বপূর্ণ পাতা</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/" className="hover:text-white transition-colors">হোম পেজ</Link></li>
              <li><Link href="/admission" className="hover:text-white transition-colors">অনলাইন ভর্তি তথ্য</Link></li>
              <li><a href="#pillars" onClick={(e) => scrollToSection(e, 'pillars')} className="hover:text-white transition-colors">আমাদের বিশেষত্ব</a></li>
              <li><a href="#curriculum" onClick={(e) => scrollToSection(e, 'curriculum')} className="hover:text-white transition-colors">কী কী পড়ানো হয়</a></li>
              <li><a href="#about" onClick={(e) => scrollToSection(e, 'about')} className="hover:text-white transition-colors">অধ্যক্ষ মহোদয়ের বাণী</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">ম্যানেজমেন্ট পোর্টাল</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/login" className="hover:text-white transition-colors">অ্যাডমিন / শিক্ষক লগইন</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">শিক্ষার্থী ও অভিভাবক লগইন</Link></li>
              <li><Link href="/students/leaves" className="hover:text-white transition-colors">ডিজিটাল গেটপাস ও ছুটি</Link></li>
              <li><Link href="/exams" className="hover:text-white transition-colors">পরীক্ষা ও ফলাফল</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">ক্যাম্পাস ও যোগাযোগ</h4>
            <p className="text-xs leading-relaxed text-slate-400">
              ক-৭৫/২, মহাখালী দক্ষিণপাড়া, বনানী, ঢাকা-১২১২<br />
              হটলাইন: ০১৭১২-৬৩৩২৬৪<br />
              খোলা: শনিবার - বৃহস্পতিবার (সকাল ৮:০০ - বিকাল ৫:০০)
            </p>
          </div>

        </div>

        <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-slate-800 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} আল-মদিনা মডেল মাদ্রাসা এন্ড রিসার্চ ইনস্টিটিউট। সর্বস্বত্ব সংরক্ষিত।</p>
          <p className="text-emerald-500/80">নিরাপদ ও আধুনিক ক্যাম্পাস ম্যানেজমেন্ট সিস্টেম (AMMS)</p>
        </div>
      </footer>

      {/* Floating Scroll-to-Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-40 p-3 rounded-full bg-[#1B4332] text-white shadow-lg hover:bg-[#132E23] transition-all hover:scale-110 active:scale-95 cursor-pointer"
          aria-label="Scroll to top"
        >
          <ChevronUp size={20} />
        </button>
      )}

      {/* High-Resolution Photo Zoom Modal */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl p-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 text-white hover:bg-black transition-colors"
            >
              <X size={20} />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewImage.src} alt={previewImage.alt} className="max-h-[80vh] w-auto mx-auto object-contain rounded-xl" />
            <div className="p-3 text-center text-xs font-bold text-slate-800">
              {previewImage.title}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
