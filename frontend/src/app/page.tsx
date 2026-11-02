/* eslint-disable */
'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Phone, Mail, ChevronDown, ChevronRight, 
  MapPin, Clock, BookOpen, Layers, MessageSquare, HeartHandshake, 
  Tv, Users, ShieldCheck, Utensils, Award, Send, CheckCircle2,
  Menu, X
} from 'lucide-react';

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const { isBangla } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  // Auto-play for Hero Slider
  const slides = [
    { src: '/images/slider/1.webp', alt: 'Assembly & Campus Grounds' },
    { src: '/principal-class.png', alt: 'Principal Classroom Teaching' },
    { src: '/images/slider/7.webp', alt: 'Islamic Learning' },
    { src: '/quran-class.png', alt: 'Hifzul Quran Department' },
    { src: '/images/slider/2.webp', alt: 'Students Academic Activities' },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="hm-page font-sans text-slate-800 bg-white">
      
      {/* ============================================================ */}
      {/* 1. TOP HEADER NOTICE (Exact Top Bar) */}
      {/* ============================================================ */}
      <header className="bg-teal-700 text-white py-2.5">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-3 md:gap-0">
          
          {/* Contact Info */}
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-8 text-xs sm:text-sm text-center md:text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-orange-400 font-semibold">Call Us:</span>
              <a href="tel:01712633264" className="hover:text-orange-200 transition-colors">০১৭১২-৬৩৩২৬৪</a>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-orange-400 font-semibold">Email:</span>
              <a href="mailto:info@almadinamadrasa.edu.bd" className="hover:text-orange-200 transition-colors">info@almadinamadrasa.edu.bd</a>
            </div>
          </div>

          {/* Social + Login */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noreferrer"
                className="h-7 w-7 rounded-full border border-orange-400 flex items-center justify-center text-orange-400 hover:bg-orange-400 hover:text-white transition-colors"
                aria-label="Facebook"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a 
                href="https://youtube.com" 
                target="_blank" 
                rel="noreferrer"
                className="h-7 w-7 rounded-full border border-orange-400 flex items-center justify-center text-orange-400 hover:bg-orange-400 hover:text-white transition-colors"
                aria-label="YouTube"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
            </div>

            {isAuthenticated && user ? (
              <Link
                href={['principal', 'vice_principal', 'managing_director', 'teacher', 'staff'].includes(user.role) ? '/dashboard' : user.role === 'guardian' ? '/guardian' : '/student'}
                className="px-3.5 py-1 rounded border border-orange-400 text-orange-400 hover:bg-orange-400 hover:text-white transition-colors text-xs font-semibold"
              >
                ড্যাশবোর্ড
              </Link>
            ) : (
              <Link
                href="/login"
                className="px-3.5 py-1 rounded border border-orange-400 text-orange-400 hover:bg-orange-400 hover:text-white transition-colors text-xs font-semibold"
              >
                Login
              </Link>
            )}
          </div>

        </div>
      </header>

      {/* ============================================================ */}
      {/* 2. STICKY NAVBAR (Exact Navigation Menu) */}
      {/* ============================================================ */}
      <nav className="bg-white shadow-xs relative z-50 head_nav" id="navbar">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="/logo.jpg" 
                alt="আল-মদিনা মডেল মাদ্রাসা" 
                className="h-[3.2rem] w-auto rounded-full p-0.5 border border-teal-600 shadow-xs" 
              />
              <div className="flex flex-col">
                <span className="font-extrabold text-slate-900 text-base sm:text-lg leading-tight">
                  আল-মদিনা মডেল মাদ্রাসা
                </span>
                <span className="text-[10px] text-teal-700 font-semibold tracking-wider">
                  এন্ড রিসার্চ ইনস্টিটিউট • মহাখালী, বনানী
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="nav-desktop hidden md:flex items-center gap-4 text-gray-700 font-medium text-sm">
            <Link href="/" className="hover:text-teal-600 text-teal-700 font-bold">হোম</Link>

            <div className="relative group">
              <a href="#about" className="hover:text-teal-600 inline-flex items-center gap-0.5">
                আমাদের সম্পর্কে <ChevronDown size={14} className="ml-0.5" />
              </a>
              <div className="absolute left-0 mt-2 p-2 w-48 bg-white rounded-md shadow-lg dropdown-menu z-50">
                <a href="#about" className="hover:text-teal-600 block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md text-xs font-semibold">
                  অধ্যক্ষ মহোদয়ের বাণী
                </a>
                <a href="#why" className="hover:text-teal-600 block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md text-xs font-semibold">
                  আমাদের বিশেষত্ব
                </a>
              </div>
            </div>

            <div className="relative group">
              <a href="#branches" className="hover:text-teal-600 inline-flex items-center gap-0.5">
                ক্যাম্পাস <ChevronDown size={14} className="ml-0.5" />
              </a>
              <div className="absolute left-0 mt-2 p-2 w-48 bg-white rounded-md shadow-lg dropdown-menu z-50">
                <a href="#branches" className="hover:text-teal-600 block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md text-xs font-semibold">
                  মহাখালী মূল ক্যাম্পাস
                </a>
                <a href="#branches" className="hover:text-teal-600 block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md text-xs font-semibold">
                  রিসার্চ ইনস্টিটিউট
                </a>
              </div>
            </div>

            <div className="relative group">
              <a href="#fac" className="hover:text-teal-600 inline-flex items-center gap-0.5">
                সুযোগ-সুবিধা <ChevronDown size={14} className="ml-0.5" />
              </a>
              <div className="absolute left-0 mt-2 p-2 w-48 bg-white rounded-md shadow-lg dropdown-menu z-50">
                <a href="#fac" className="hover:text-teal-600 block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md text-xs font-semibold">
                  শীতাতপ নিয়ন্ত্রিত ক্যাম্পাস
                </a>
                <a href="#fac" className="hover:text-teal-600 block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md text-xs font-semibold">
                  মাল্টিমিডিয়া প্রজেক্টর
                </a>
              </div>
            </div>

            <Link href="/admission" className="hover:text-teal-600">ভর্তি</Link>
            <a href="#contact" className="hover:text-teal-600">যোগাযোগ</a>
            <Link href="/notices" className="hover:text-teal-600">নোটিশ</Link>

            {/* Pre-Admission CTA Button */}
            <Link 
              href="/admission" 
              className="bg-teal-700 hover:bg-teal-800 text-white px-4 py-2 rounded-md font-semibold text-xs shadow-xs transition-colors ml-1"
            >
              প্রি-এডমিশন
            </Link>
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="md:hidden">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-100"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

        </div>

        {/* Mobile Slide-down Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 space-y-2 shadow-lg">
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-teal-700 font-bold border-b border-slate-100">হোম</Link>
            <a href="#about" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-700 font-semibold border-b border-slate-100">আমাদের সম্পর্কে</a>
            <a href="#why" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-700 font-semibold border-b border-slate-100">আমাদের বিশেষত্ব</a>
            <a href="#branches" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-700 font-semibold border-b border-slate-100">ক্যাম্পাস ও শাখা</a>
            <a href="#fac" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-700 font-semibold border-b border-slate-100">সুযোগ-সুবিধাসমূহ</a>
            <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-700 font-semibold border-b border-slate-100">যোগাযোগ</a>
            <Link href="/notices" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-700 font-semibold border-b border-slate-100">নোটিশ বোর্ড</Link>
            <Link href="/admission" onClick={() => setMobileMenuOpen(false)} className="block w-full text-center py-2.5 bg-teal-700 text-white rounded-md font-bold text-sm">
              প্রি-এডমিশন আবেদন
            </Link>
          </div>
        )}
      </nav>

      {/* ============================================================ */}
      {/* 3. MAIN SCOPED PAGE CONTAINER (.hm-page) */}
      {/* ============================================================ */}
      <main className="hm-page">
        
        {/* SECTION 1: HERO & NOTICES (Exact .hm-hero) */}
        <section className="hm-hero">
          <div className="hm-container">
            
            {/* Top Admission Alert (.hm-admission) */}
            <div className="hm-admission" role="status">
              <div className="hm-admission__text">
                <h2 className="hm-admission__title">ভর্তির আবেদন চলছে: ২০২৭</h2>
                <p className="hm-admission__detail">আবেদনের শেষ তারিখ: ১৫ নভেম্বর, ২০২৬</p>
                <ul className="hm-admission__branches">
                  <li className="hm-admission__branch is-open">
                    <span className="hm-admission__branch-name">হিফজুল কুরআন বিভাগ:</span>
                    <span className="hm-admission__branch-status">অনলাইনে আবেদন চলছে</span>
                  </li>
                  <li className="hm-admission__branch is-open">
                    <span className="hm-admission__branch-name">প্লে - ৬ষ্ঠ শ্রেণি জেনারেল:</span>
                    <span className="hm-admission__branch-status">সাক্ষাৎকারের তারিখ নির্ধারণ চলছে</span>
                  </li>
                </ul>
              </div>
              <Link className="hm-admission__link" href="/admission">
                <span>আবেদন করুন</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M5 12h14"></path>
                  <path d="M13 6l6 6-6 6"></path>
                </svg>
              </Link>
            </div>

            {/* Hero Grid (.hm-hero__grid) */}
            <div className="hm-hero__grid" style={{ marginTop: '20px' }}>
              
              {/* Left Column: Hero Slider (.hm-hero__slider) */}
              <div className="hm-hero__slider">
                <div className="swiper mySwiper" style={{ height: '420px', position: 'relative' }}>
                  <div className="swiper-wrapper h-full relative">
                    {slides.map((slide, idx) => (
                      <div 
                        key={idx}
                        className={`swiper-slide absolute inset-0 transition-opacity duration-1000 ${
                          activeSlide === idx ? 'opacity-100 z-10' : 'opacity-0 z-0'
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={slide.src} 
                          alt={slide.alt} 
                          className="w-full h-full object-cover rounded-xl"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Slider Pagination Bullets */}
                  <div className="swiper-pagination flex items-center justify-center gap-2 absolute bottom-3.5 left-0 right-0 z-20">
                    {slides.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveSlide(i)}
                        className={`transition-all duration-300 ${
                          activeSlide === i 
                            ? 'w-6 h-2 rounded-full bg-teal-400' 
                            : 'w-2 h-2 rounded-full bg-white/70'
                        }`}
                        aria-label={`Slide ${i + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Important Notices (.hm-notices) */}
              <div className="hm-notices">
                <h3 className="hm-notices__title">গুরুত্বপূর্ণ আপডেট</h3>
                <div id="notice-container">
                  <Link href="/notices" className="hm-notice">
                    <p className="hm-notice__date">১০ নভেম্বর, ২০২৬</p>
                    <h4 className="hm-notice__title">২০২৭ শিক্ষাবর্ষে প্লে থেকে ষষ্ঠ শ্রেণি ও হিফজে ভর্তি সংক্রান্ত বিজ্ঞপ্তি</h4>
                  </Link>

                  <div id="scrolling-wrapper">
                    <div id="tab-notices">
                      <Link href="/notices" className="hm-notice">
                        <p className="hm-notice__date">২৫ অক্টোবর, ২০২৬</p>
                        <h4 className="hm-notice__title">অভিভাবক সম্মেলন ও শিক্ষার্থী মূল্যায়ন সংক্রান্ত নোটিশ</h4>
                      </Link>

                      <Link href="/notices" className="hm-notice">
                        <p className="hm-notice__date">১৫ অক্টোবর, ২০২৬</p>
                        <h4 className="hm-notice__title">সম্পূর্ণ শীতাতপ নিয়ন্ত্রিত আধুনিক ক্লাসরুম ও কম্পিউটার ল্যাব উদ্বোধন</h4>
                      </Link>

                      <Link href="/notices" className="hm-notice blink-highlight">
                        <p className="hm-notice__date">০৫ অক্টোবর, ২০২৬</p>
                        <h4 className="hm-notice__title">বার্ষিক মূল্যায়ন পরীক্ষা ও ডিজিটাল রেজাল্ট কার্ড প্রকাশ</h4>
                      </Link>
                    </div>
                  </div>
                </div>

                <Link href="/notices" className="hm-notices__all">
                  <span>সকল নোটিশ দেখুন</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </Link>
              </div>

            </div>

          </div>
        </section>

        {/* SECTION 2: WHY / ABOUT (.hm-about) */}
        <section className="hm-section" id="about">
          <div className="hm-container">
            <div className="hm-about__grid">
              
              {/* Media */}
              <div className="hm-about__media">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src="/principal-class.png" 
                  alt="আল-মদিনা মডেল মাদ্রাসা ক্লাসরুম" 
                />
                <div className="hm-about__badge">স্থাপিত: ২০২৪ ইং</div>
              </div>

              {/* Text Content */}
              <div className="hm-about__text">
                <h2 className="hm-h2">কেন আল-মদিনা মডেল মাদ্রাসা</h2>
                <p style={{ marginTop: '18px' }}>
                  সমাজে বিদ্যমান বিভিন্ন শিক্ষাধারার মধ্যে মাদরাসা শিক্ষাধারা সুপ্রাচীন এবং কল্যাণমুখী শিক্ষার ধারক হিসেবে সুবিদিত। এই শিক্ষাধারা ইসলামী জীবন-দর্শনের আলোকে উপমহাদেশে গড়ে তুলছে পরকালমুখী মূল্যবোধসম্পন্ন আদর্শ মানুষ। কিন্তু এই শিক্ষাধারা নৈতিকতা ও মূল্যবোধের মানদণ্ডে উত্তীর্ণ একদল আদর্শ মানুষ ও দক্ষ আলেম তৈরিতে সফল হলেও এর দ্বারা সময়োপযোগী ও সৃজনশীল মানুষ সেভাবে তৈরি হচ্ছে না।
                </p>
                <p>
                  পক্ষান্তরে প্রচলিত সাধারণ শিক্ষাধারা আমাদের সন্তানদের পার্থিব শিক্ষায় শিক্ষিত করছে বটে, কিন্তু এই মাধ্যমে নৈতিকতা এবং প্রকৃত জীবনবোধসম্পন্ন মানুষ গড়ে উঠছে না। এজন্য আমরা মনে করছি এরকম একটি শিক্ষাপ্রতিষ্ঠান দরকার যেটি উন্নত চরিত্রসমৃদ্ধ কুরআন-সুন্নাহর গভীর জ্ঞানসম্পন্ন মানুষ তৈরি করবে, যারা জাগতিক জ্ঞান-বিজ্ঞানেও প্রয়োজনীয় ধারণা রাখবে। এই লক্ষ্য বাস্তবায়নেই আল-মদিনা মডেল মাদ্রাসা এন্ড রিসার্চ ইনস্টিটিউটের অভিযাত্রা।
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* SECTION 3: 9 CORE PILLARS (.hm-why) */}
        <section className="hm-section hm-section--tint" id="why">
          <div className="hm-container">
            
            <div className="hm-sec-head">
              <h2 className="hm-h2">যে কারণে আল-মদিনা মডেল মাদ্রাসা অনন্য</h2>
            </div>

            <div className="hm-why__grid">
              
              <article className="hm-card hm-why__card">
                <div className="hm-why__top">
                  <span className="hm-why__num">০১</span>
                  <span className="hm-why__ic"><BookOpen size={24} /></span>
                </div>
                <h3 className="hm-why__title">সহীহ হিফজুল কুরআন বিভাগ</h3>
                <p className="hm-why__text">আন্তর্জাতিক মানসম্পন্ন হাফেজ ও ক্বারীদের নিবিড় তত্ত্বাবধানে সহীহ মাখরাজ ও তাজবীদভিত্তিক বিশুদ্ধ হিফজ প্রশিক্ষণ।</p>
                <Link href="/admission" className="hm-link">
                  <span>বিস্তারিত দেখুন</span>
                  <ChevronRight size={16} />
                </Link>
              </article>

              <article className="hm-card hm-why__card">
                <div className="hm-why__top">
                  <span className="hm-why__num">০২</span>
                  <span className="hm-why__ic"><Layers size={24} /></span>
                </div>
                <h3 className="hm-why__title">সমন্বিত আধুনিক কারিকুলাম</h3>
                <p className="hm-why__text">দ্বীনি শিক্ষার পাশাপাশি জাতীয় শিক্ষাক্রম অনুসারে বাংলা, ইংরেজি, গণিত ও সাধারণ জ্ঞানের আধুনিক মান নিশ্চিতকরণ।</p>
                <Link href="/admission" className="hm-link">
                  <span>বিস্তারিত দেখুন</span>
                  <ChevronRight size={16} />
                </Link>
              </article>

              <article className="hm-card hm-why__card">
                <div className="hm-why__top">
                  <span className="hm-why__num">০৩</span>
                  <span className="hm-why__ic"><MessageSquare size={24} /></span>
                </div>
                <h3 className="hm-why__title">আরবি ও ইংরেজি ভাষা চর্চা</h3>
                <p className="hm-why__text">ব্যবহারিক কথোপকথন, ভাষা ল্যাব ও নিয়মিত ক্লাসরুম উপস্থাপনার মাধ্যমে দুটি আন্তর্জাতিক ভাষার সাবলীল চর্চা।</p>
                <Link href="/admission" className="hm-link">
                  <span>বিস্তারিত দেখুন</span>
                  <ChevronRight size={16} />
                </Link>
              </article>

              <article className="hm-card hm-why__card">
                <div className="hm-why__top">
                  <span className="hm-why__num">০৪</span>
                  <span className="hm-why__ic"><HeartHandshake size={24} /></span>
                </div>
                <h3 className="hm-why__title">নৈতিকতা ও চারিত্রিক তারবিয়াত</h3>
                <p className="hm-why__text">প্রতিটি শিক্ষার্থীর উত্তম আখলাক গঠন এবং প্রিয় নবীজির সুন্নাহর বাস্তব অনুশীলনে নিয়মিত তারবিয়াত প্রদান।</p>
                <Link href="/admission" className="hm-link">
                  <span>বিস্তারিত দেখুন</span>
                  <ChevronRight size={16} />
                </Link>
              </article>

              <article className="hm-card hm-why__card">
                <div className="hm-why__top">
                  <span className="hm-why__num">০৫</span>
                  <span className="hm-why__ic"><Tv size={24} /></span>
                </div>
                <h3 className="hm-why__title">প্রজেক্টর ও স্মার্ট কম্পিউটার ল্যাব</h3>
                <p className="hm-why__text">কম্পিউটার ল্যাব, মাল্টিমিডিয়া প্রজেক্টর ক্লাসরুম ও যুগোপযোগী তথ্যপ্রযুক্তির সুপরিকল্পিত ব্যবহার।</p>
                <Link href="/admission" className="hm-link">
                  <span>বিস্তারিত দেখুন</span>
                  <ChevronRight size={16} />
                </Link>
              </article>

              <article className="hm-card hm-why__card">
                <div className="hm-why__top">
                  <span className="hm-why__num">০৬</span>
                  <span className="hm-why__ic"><Users size={24} /></span>
                </div>
                <h3 className="hm-why__title">দক্ষ ওস্তাদ ও শিক্ষক পরিষদ</h3>
                <p className="hm-why__text">অধ্যক্ষ মাওলানা ওমর ফারুক মুজাহিদীর প্রত্যক্ষ পরিচালনায় শীর্ষ ইসলামিক বিদ্যাপীঠের অভিজ্ঞ শিক্ষক পরিষদ।</p>
                <Link href="/admission" className="hm-link">
                  <span>বিস্তারিত দেখুন</span>
                  <ChevronRight size={16} />
                </Link>
              </article>

              <article className="hm-card hm-why__card">
                <div className="hm-why__top">
                  <span className="hm-why__num">০৭</span>
                  <span className="hm-why__ic"><ShieldCheck size={24} /></span>
                </div>
                <h3 className="hm-why__title">সম্পূর্ণ AC ক্লাসরুম ও CCTV নিরাপত্তা</h3>
                <p className="hm-why__text">ক্লান্তিহীন পড়াশোনার জন্য সার্বক্ষণিক এসি ক্লাসরুম, ২৪ ঘণ্টা সিসিটিভি ক্যামেরা ও ডিজিটাল গেটপাস নিয়ন্ত্রণ।</p>
                <Link href="/admission" className="hm-link">
                  <span>বিস্তারিত দেখুন</span>
                  <ChevronRight size={16} />
                </Link>
              </article>

              <article className="hm-card hm-why__card">
                <div className="hm-why__top">
                  <span className="hm-why__num">০৮</span>
                  <span className="hm-why__ic"><Utensils size={24} /></span>
                </div>
                <h3 className="hm-why__title">স্বাস্থ্যসম্মত খাবার ও নিজস্ব ডাইনিং</h3>
                <p className="hm-why__text">আবাসিক শিক্ষার্থীদের জন্য অভিজ্ঞ বাবুর্চি দ্বারা প্রস্তুতকৃত শতভাগ পরিচ্ছন্ন, সুষম ও পুষ্টিকর খাদ্য ব্যবস্থা।</p>
                <Link href="/admission" className="hm-link">
                  <span>বিস্তারিত দেখুন</span>
                  <ChevronRight size={16} />
                </Link>
              </article>

              <article className="hm-card hm-why__card">
                <div className="hm-why__top">
                  <span className="hm-why__num">০৯</span>
                  <span className="hm-why__ic"><Award size={24} /></span>
                </div>
                <h3 className="hm-why__title">অভিভাবক নিয়মিত মনিটরিং ও রেজাল্ট</h3>
                <p className="hm-why__text">ডিজিটাল ওয়েব সফটওয়্যার, হাজিরা এসএমএস ও নিয়মিত অভিভাবক বৈঠকের মাধ্যমে সার্বক্ষণিক পারফরম্যান্স ট্র্যাকিং।</p>
                <Link href="/admission" className="hm-link">
                  <span>বিস্তারিত দেখুন</span>
                  <ChevronRight size={16} />
                </Link>
              </article>

            </div>

          </div>
        </section>

        {/* SECTION 4: FACILITIES (.hm-fac) */}
        <section className="hm-section" id="fac">
          <div className="hm-container">
            
            <div className="hm-sec-head">
              <h2 className="hm-h2">মাদরাসার সুযোগ-সুবিধাসমূহ</h2>
            </div>

            <div className="hm-fac__grid">
              
              <article className="hm-card hm-fac__card">
                <span className="hm-fac__ic"><ShieldCheck size={28} /></span>
                <h3>সম্পূর্ণ শীতাতপ নিয়ন্ত্রিত (AC) ক্লাসরুম</h3>
                <p>গ্রীষ্ম ও বর্ষায় মনোরম, আরামদায়ক ও ক্লান্তিহীন পড়াশোনার পরিবেশ বজায় রাখতে পুরো ক্যাম্পাসে সেন্ট্রাল শীতাতপ নিয়ন্ত্রণ ব্যবস্থা সক্রিয় রাখা হয়েছে।</p>
              </article>

              <article className="hm-card hm-fac__card">
                <span className="hm-fac__ic"><Tv size={28} /></span>
                <h3>প্রজেক্টর ভিত্তিক মাল্টিমিডিয়া পাঠদান</h3>
                <p>শিক্ষার্থীদের পাঠ্যবিষয় সহজে হৃদয়ঙ্গম করার জন্য প্রজেক্টরের মাধ্যমে ভিজ্যুয়াল প্রেজেন্টেশন ও অডিও-ভিজ্যুয়াল পদ্ধতিতে ক্লাস নেওয়া হয়।</p>
              </article>

              <article className="hm-card hm-fac__card">
                <span className="hm-fac__ic"><Users size={28} /></span>
                <h3>সার্বক্ষণিক ব্যক্তিগত তদারকি ও সিসিটিভি</h3>
                <p>অধ্যক্ষ মহোদয়ের সরাসরি ক্লাস, সম্মানিত শিক্ষকদের সার্বক্ষণিক উপস্থিতি এবং ২৪ ঘণ্টা সিসিটিভি ক্যামেরায় শিক্ষার্থীদের কঠোর নিরাপত্তা প্রদান করা হয়।</p>
              </article>

              <article className="hm-card hm-fac__card">
                <span className="hm-fac__ic"><Utensils size={28} /></span>
                <h3>পুষ্টিকর খাদ্য ও মনোরম আবাসন</h3>
                <p>আবাসিক ও অনাবাসিক শিক্ষার্থীদের শারীরিক সুস্থতা ও স্বাচ্ছন্দ্যের জন্য সম্পূর্ণ পরিচ্ছন্ন পরিবেশে স্বাস্থ্যসম্মত খাবার পরিবেশন নিশ্চিত করা হয়।</p>
              </article>

            </div>

            <div className="hm-fac__cta">
              <Link href="/admission" className="hm-btn hm-btn--primary">
                <span>অনলাইনে ভর্তি আবেদন করুন</span>
                <ChevronRight size={18} />
              </Link>
            </div>

          </div>
        </section>

        {/* SECTION 5: PRINCIPAL'S MESSAGE (.hm-chair) */}
        <section className="hm-section hm-chair" id="principal">
          <div className="hm-container">
            
            <div className="hm-sec-head">
              <h2 className="hm-h2">অধ্যক্ষ মহোদয়ের বাণী</h2>
            </div>

            <div className="hm-card hm-chair__card">
              <div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  className="hm-chair__img" 
                  src="/principal.jpg" 
                  alt="মাওলানা ওমর ফারুক মুজাহিদী" 
                />
              </div>
              <div>
                <p className="hm-chair__quote">
                  <span style={{ color: '#0d9488', fontSize: '1.6rem', lineHeight: 0, verticalAlign: '-4px' }}>“</span>
                  শিশুদের কোমল হৃদয়ে পরকালীন চেতনা জাগাতে না পারলে, দুনিয়ার যত সুন্দর পরিবেশেই লালন-পালন করা হোক না কেন—তারা প্রকৃত মানুষ হয়ে গড়ে উঠবে না। আমরা আল-মদিনা মডেল মাদ্রাসায় এমন একটি পরিবেশ সৃষ্টি করেছি যেখানে প্রতিটি শিক্ষার্থী আল্লাহর কালাম হিফজ করার পাশাপাশি আধুনিক যুগোপযোগী জ্ঞানে বলীয়ান হয়ে সৎ, দক্ষ ও খোদাভীরু মানুষ হিসেবে গড়ে উঠবে।
                  <span style={{ color: '#0d9488', fontSize: '1.6rem', lineHeight: 0, verticalAlign: '-4px' }}>”</span>
                </p>
                <h3 className="hm-chair__name">মাওলানা ওমর ফারুক মুজাহিদী</h3>
                <p className="hm-chair__role">প্রতিষ্ঠাতা ও অধ্যক্ষ, আল-মদিনা মডেল মাদ্রাসা এন্ড রিসার্চ ইনস্টিটিউট</p>
              </div>
            </div>

          </div>
        </section>

        {/* SECTION 6: CONTACT (.hm-contact) */}
        <section className="hm-section" id="contact">
          <div className="hm-container">
            
            <div className="hm-sec-head">
              <h2 className="hm-h2">আমাদের সাথে যোগাযোগ</h2>
            </div>

            <div className="hm-contact__cards">
              
              <div className="hm-card hm-contact__card">
                <span className="hm-contact__ic"><Phone size={24} /></span>
                <h3>ফোন ও হটলাইন</h3>
                <p>০১৭১২-৬৩৩২৬৪</p>
                <p>সকাল ৮:০০ - বিকাল ৫:০০</p>
                <a href="tel:01712633264">সরাসরি কল করুন</a>
              </div>

              <div className="hm-card hm-contact__card">
                <span className="hm-contact__ic"><Mail size={24} /></span>
                <h3>ইমেইল ঠিকানা</h3>
                <p>info@almadinamadrasa.edu.bd</p>
                <p>সার্বক্ষণিক ইমেইল সাপোর্ট</p>
                <a href="mailto:info@almadinamadrasa.edu.bd">ইমেইল পাঠান</a>
              </div>

              <div className="hm-card hm-contact__card">
                <span className="hm-contact__ic"><MapPin size={24} /></span>
                <h3>ক্যাম্পাস অবস্থান</h3>
                <p>ক-৭৫/২, মহাখালী দক্ষিণপাড়া</p>
                <p>বনানী, ঢাকা-১২১২</p>
                <a href="#map">গুগল ম্যাপে দেখুন</a>
              </div>

            </div>

            {/* Split Form & Google Map (.hm-contact__split) */}
            <div className="hm-contact__split" id="map">
              <div>
                <h3>যেকোনো তথ্যের জন্য লিখুন</h3>
                <form className="hm-form" onSubmit={(e) => { e.preventDefault(); alert('ধন্যবাদ! আপনার বার্তাটি গৃহীত হয়েছে।'); }}>
                  <div className="hm-form__row">
                    <input type="text" placeholder="আপনার নাম *" required />
                    <input type="tel" placeholder="মোবাইল নম্বর *" required />
                  </div>
                  <input type="email" placeholder="ইমেইল (ঐচ্ছিক)" />
                  <textarea placeholder="আপনার বার্তা বা প্রশ্ন লিখুন *" required></textarea>
                  <button type="submit" className="hm-form__submit">বার্তা পাঠান</button>
                </form>
              </div>

              <div className="hm-map">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3651.054366657906!2d90.4005!3d23.781!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755c70c00000001%3A0x1!2sMohakhali%20Dakshinpara!5e0!3m2!1sen!2sbd!4v1700000000000!5m2!1sen!2sbd" 
                  width="100%" 
                  height="340" 
                  style={{ border: 0 }} 
                  allowFullScreen 
                  loading="lazy" 
                  title="Google Map"
                />
              </div>
            </div>

          </div>
        </section>

        {/* SECTION 7: CAMPUS & BRANCHES (.hm-branch) */}
        <section className="hm-section hm-section--tint hm-branch" id="branches">
          <div className="hm-container">
            
            <div className="hm-sec-head">
              <h2 className="hm-h2">আমাদের ক্যাম্পাস ও শাখা</h2>
            </div>

            <div className="swiper myBranchSwiper">
              <div className="swiper-wrapper">
                
                <div className="swiper-slide">
                  <div className="hm-branch__card">
                    <h4>মহাখালী মূল ক্যাম্পাস</h4>
                    <p className="hm-branch__addr">ক-৭৫/২, মহাখালী দক্ষিণপাড়া, বনানী, ঢাকা-১২১২</p>
                    <a href="tel:01712633264">হটলাইন: ০১৭১২-৬৩৩২৬৪</a>
                    <a href="mailto:info@almadinamadrasa.edu.bd">info@almadinamadrasa.edu.bd</a>
                  </div>
                </div>

                <div className="swiper-slide">
                  <div className="hm-branch__card">
                    <h4>রিসার্চ ইনস্টিটিউট ও হিফজখানা</h4>
                    <p className="hm-branch__addr">দক্ষিণপাড়া, বনানী, ঢাকা (সম্পূর্ণ শীতাতপ নিয়ন্ত্রিত আবাসিক কমপ্লেক্স)</p>
                    <a href="tel:01712633264">যোগাযোগ: ০১৭১২-৬৩৩২৬৪</a>
                    <a href="mailto:info@almadinamadrasa.edu.bd">info@almadinamadrasa.edu.bd</a>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </section>

      </main>

      {/* ============================================================ */}
      {/* 4. EXACT FOOTER (.site-footer) */}
      {/* ============================================================ */}
      <footer className="site-footer">
        <div className="ft-container">
          
          <div className="ft-main">
            
            {/* Brand */}
            <div className="ft-brand">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="/logo.jpg" 
                alt="আল-মদিনা মডেল মাদ্রাসা" 
                className="ft-logo rounded-full p-1 border-2 border-teal-400" 
                style={{ height: '65px', width: '65px', objectFit: 'cover' }}
              />
              <p className="ft-about">
                দ্বীনি নৈতিকতা ও আধুনিক জ্ঞানের এক অপূর্ব সমন্বয়ে আলোকিত প্রতিষ্ঠান ‘আল-মদিনা মডেল মাদ্রাসা এন্ড রিসার্চ ইনস্টিটিউট’। কুরআন-সুন্নাহ ও যুগোপযোগী শিক্ষার মাধ্যমে আমরা এমন সচেতন ও আদর্শ প্রজন্ম গড়ে তোলার প্রত্যয়ে অবিচল—যারা উম্মাহর কল্যাণ ও মানবসেবায় নেতৃত্ব দেবে, ইন-শা-আল্লাহ।
              </p>
            </div>

            {/* Important Links */}
            <nav className="ft-col" aria-label="গুরুত্বপূর্ণ লিংক">
              <h4 className="ft-title">গুরুত্বপূর্ণ লিংক</h4>
              <ul className="ft-links">
                <li><Link href="/admission">এডমিশন</Link></li>
                <li><Link href="/notices">নোটিশ</Link></li>
                <li><a href="#about">আমাদের সম্পর্কে</a></li>
                <li><a href="#fac">সুযোগ-সুবিধা</a></li>
                <li><a href="#contact">যোগাযোগ</a></li>
                <li><Link href="/login">ম্যানেজমেন্ট পোর্টাল</Link></li>
              </ul>
            </nav>

            {/* Contact */}
            <div className="ft-col">
              <h4 className="ft-title">যোগাযোগ</h4>
              <ul className="ft-contact">
                <li>
                  <Phone size={16} />
                  <a href="tel:01712633264">০১৭১২-৬৩৩২৬৪</a>
                </li>
                <li>
                  <Mail size={16} />
                  <a href="mailto:info@almadinamadrasa.edu.bd">info@almadinamadrasa.edu.bd</a>
                </li>
                <li>
                  <MapPin size={16} />
                  <span>ক-৭৫/২, মহাখালী দক্ষিণপাড়া, বনানী, ঢাকা-১২১২</span>
                </li>
              </ul>
            </div>

            {/* Facebook / Community Box */}
            <div className="ft-col ft-fb-col">
              <h4 className="ft-title">ক্যাম্পাস অবস্থান</h4>
              <div className="ft-fb p-3 text-xs leading-relaxed text-slate-300">
                <p className="font-bold text-white mb-1">আল-মদিনা মডেল মাদ্রাসা</p>
                <p>গুলশান, বনানী ও মহাখালী এলাকার কেন্দ্রবিন্দুতে মনোরম ও নিরাপদ পরিবেশে অবস্থিত।</p>
                <div className="mt-3 pt-3 border-t border-white/10 flex gap-2">
                  <a href="https://facebook.com" target="_blank" rel="noreferrer" className="text-teal-400 hover:underline">ফেসবুক পেজ</a>
                  <span>•</span>
                  <a href="https://youtube.com" target="_blank" rel="noreferrer" className="text-teal-400 hover:underline">ইউটিউব চ্যানেল</a>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Copyright */}
          <div className="ft-bottom">
            <div className="ft-bottom__inner">
              <p>© {new Date().getFullYear()} আল-মদিনা মডেল মাদ্রাসা এন্ড রিসার্চ ইনস্টিটিউট। সর্বস্বত্ব সংরক্ষিত।</p>
              <div className="ft-bottom__links">
                <Link href="/privacy">গোপনীয়তা নীতি</Link>
                <Link href="/terms">শর্তাবলী</Link>
                <Link href="/login">এডমিন লগইন</Link>
              </div>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
