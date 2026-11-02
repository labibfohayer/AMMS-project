/* eslint-disable */
'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import { 
  Phone, Mail, ChevronDown, ChevronRight, ChevronLeft,
  MapPin, Clock, BookOpen, Layers, MessageSquare, HeartHandshake, 
  Tv, Users, ShieldCheck, Utensils, Award, Send, CheckCircle2,
  Menu, X, Sparkles, Building2, School
} from 'lucide-react';

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const { isBangla } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  // Real Al-Madina Model Madrasah Photos & Bilingual Captions
  const slides = [
    { 
      src: '/images/slider-1-students.jpg', 
      title: isBangla ? 'আল-মদিনা মডেল মাদ্রাসার শিক্ষার্থীবৃন্দ' : 'Students of Al-Madina Model Madrasah',
      subtitle: isBangla ? 'দ্বীনি ও আধুনিক শিক্ষার সমন্বয়ে আগামী দিনের আলোকিত প্রজন্ম গড়ার অঙ্গীকার' : 'Modern holistic education rooted in Islamic moral values'
    },
    { 
      src: '/images/slider-2-quran-circle.jpg', 
      title: isBangla ? 'হিফজুল কুরআন ও নাজেরা পাঠদান' : 'Hifzul Quran & Authentic Recitation',
      subtitle: isBangla ? 'আন্তর্জাতিক মানসম্পন্ন তাজবিদ চর্চা ও সহীহ বিশুদ্ধ কুরআন হেফজ কার্যক্রম' : 'International standard Tajweed and Quran memorization'
    },
    { 
      src: '/images/slider-3-director-certificate.jpg', 
      title: isBangla ? 'হিফজ ও মেধা মূল্যায়ন স্বীকৃতি' : 'Merit Evaluation & Award Recognition',
      subtitle: isBangla ? 'পরিচালক মাওলানা ওমর ফারুক মুজাহিদীর প্রত্যক্ষ তত্ত্বাবধান ও দিকনির্দেশনা' : 'Direct mentorship and honors under Principal Maulana Omar Faruk'
    },
    { 
      src: '/images/slider-4-tarbiyah-award.jpg', 
      title: isBangla ? 'আদর্শ নৈতিক তারবিয়াহ ও চরিত্র গঠন' : 'Holistic Tarbiyah & Character Building',
      subtitle: isBangla ? 'স্নেহ, যত্ন ও ইসলামিক অনুশাসনে গড়ে উঠছে আগামী দিনের আদর্শ নাগরিক' : 'Nurturing future leadership with care, discipline, and Islamic ethics'
    },
    { 
      src: '/images/slider-5-guardians-assembly.jpg', 
      title: isBangla ? 'অভিভাবক সম্মেলন ও পরামর্শ সভা' : 'Guardian-Teacher Conferences',
      subtitle: isBangla ? 'শিক্ষার্থীর সামগ্রিক অগ্রগতি ও সুশিক্ষা নিশ্চিতে শিক্ষক-অভিভাবক যৌথ সমন্বয়' : 'Collaborative partnership ensuring holistic student development'
    },
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
              <span className="text-orange-400 font-semibold">{isBangla ? 'হটলাইন:' : 'Call Us:'}</span>
              <a href="tel:01712633264" className="hover:text-orange-200 transition-colors font-medium">
                {isBangla ? '০১৭১২-৬৩৩২৬৪' : '+8801712633264'}
              </a>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-orange-400 font-semibold">{isBangla ? 'ইমেইল:' : 'Email:'}</span>
              <a href="mailto:info@almadinamadrasa.edu.bd" className="hover:text-orange-200 transition-colors">info@almadinamadrasa.edu.bd</a>
            </div>
          </div>

          {/* Social + Language + Login */}
          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <LanguageSwitcher variant="glass" className="scale-90 sm:scale-100" />

            <div className="flex items-center gap-2">
              <a 
                href="https://www.facebook.com/AlMadinaModelMadrasaAndResearchInstitute" 
                target="_blank" 
                rel="noreferrer"
                className="h-7 w-7 rounded-full border border-orange-400 flex items-center justify-center text-orange-400 hover:bg-orange-400 hover:text-white transition-colors"
                aria-label="Facebook"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a 
                href="https://www.youtube.com/@al_madina_model_madrasha" 
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
                {isBangla ? 'ড্যাশবোর্ড' : 'Dashboard'}
              </Link>
            ) : (
              <Link
                href="/login"
                className="px-3.5 py-1 rounded border border-orange-400 text-orange-400 hover:bg-orange-400 hover:text-white transition-colors text-xs font-semibold"
              >
                {isBangla ? 'লগইন' : 'Login'}
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
                  {isBangla ? 'আল-মদিনা মডেল মাদ্রাসা' : 'Al-Madina Model Madrasah'}
                </span>
                <span className="text-[10px] text-teal-700 font-semibold tracking-wider">
                  {isBangla ? 'এন্ড রিসার্চ ইনস্টিটিউট • মহাখালী, বনানী' : '& Research Institute • Mohakhali, Banani'}
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="nav-desktop hidden md:flex items-center gap-4 text-gray-700 font-medium text-sm">
            <Link href="/" className="hover:text-teal-600 text-teal-700 font-bold">
              {isBangla ? 'হোম' : 'Home'}
            </Link>

            <div className="relative group py-2">
              <a href="#about" className="hover:text-teal-600 inline-flex items-center gap-0.5 cursor-pointer">
                {isBangla ? 'আমাদের সম্পর্কে' : 'About Us'} <ChevronDown size={14} className="ml-0.5" />
              </a>
              <div className="dropdown-menu absolute left-0 top-full p-2 w-52 bg-white rounded-xl shadow-xl border border-slate-100 z-50">
                <a href="#about" className="hover:text-teal-600 block px-4 py-2 text-gray-700 hover:bg-slate-50 rounded-lg text-xs font-semibold">
                  {isBangla ? 'অধ্যক্ষ মহোদয়ের বাণী' : "Principal's Message"}
                </a>
                <a href="#why" className="hover:text-teal-600 block px-4 py-2 text-gray-700 hover:bg-slate-50 rounded-lg text-xs font-semibold">
                  {isBangla ? 'আমাদের বিশেষত্ব' : 'Our Features'}
                </a>
              </div>
            </div>

            <div className="relative group py-2">
              <a href="#branches" className="hover:text-teal-600 inline-flex items-center gap-0.5 cursor-pointer">
                {isBangla ? 'ক্যাম্পাস' : 'Campus'} <ChevronDown size={14} className="ml-0.5" />
              </a>
              <div className="dropdown-menu absolute left-0 top-full p-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 z-50">
                <a href="#branches" className="hover:text-teal-600 block px-4 py-2 text-gray-700 hover:bg-slate-50 rounded-lg text-xs font-semibold">
                  {isBangla ? 'মহাখালী মূল ক্যাম্পাস' : 'Mohakhali Main Campus'}
                </a>
                <a href="#branches" className="hover:text-teal-600 block px-4 py-2 text-gray-700 hover:bg-slate-50 rounded-lg text-xs font-semibold">
                  {isBangla ? 'আসন্ন মহিলা শাখা (পরিকল্পনাধীন)' : 'Upcoming Female Branch (Planned)'}
                </a>
              </div>
            </div>

            <div className="relative group py-2">
              <a href="#fac" className="hover:text-teal-600 inline-flex items-center gap-0.5 cursor-pointer">
                {isBangla ? 'সুযোগ-সুবিধা' : 'Facilities'} <ChevronDown size={14} className="ml-0.5" />
              </a>
              <div className="dropdown-menu absolute left-0 top-full p-2 w-52 bg-white rounded-xl shadow-xl border border-slate-100 z-50">
                <a href="#fac" className="hover:text-teal-600 block px-4 py-2 text-gray-700 hover:bg-slate-50 rounded-lg text-xs font-semibold">
                  {isBangla ? 'শীতাতপ নিয়ন্ত্রিত ক্যাম্পাস' : 'Air-Conditioned Campus'}
                </a>
                <a href="#fac" className="hover:text-teal-600 block px-4 py-2 text-gray-700 hover:bg-slate-50 rounded-lg text-xs font-semibold">
                  {isBangla ? 'স্মার্ট মাল্টিমিডিয়া ক্লাসরুম' : 'Smart Multimedia Classrooms'}
                </a>
              </div>
            </div>

            <Link href="/admission" className="hover:text-teal-600">
              {isBangla ? 'ভর্তি' : 'Admission'}
            </Link>
            <a href="#contact" className="hover:text-teal-600">
              {isBangla ? 'যোগাযোগ' : 'Contact'}
            </a>
            <Link href="/notices" className="hover:text-teal-600">
              {isBangla ? 'নোটিশ' : 'Notices'}
            </Link>

            {/* Pre-Admission CTA Button */}
            <Link 
              href="/admission" 
              className="bg-teal-700 hover:bg-teal-800 text-white px-4 py-2 rounded-md font-semibold text-xs shadow-xs transition-colors ml-1"
            >
              {isBangla ? 'প্রি-এডমিশন' : 'Pre-Admission'}
            </Link>
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="md:hidden flex items-center gap-2">
            <LanguageSwitcher variant="light" className="scale-90" />
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
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-teal-700 font-bold border-b border-slate-100">
              {isBangla ? 'হোম' : 'Home'}
            </Link>
            <a href="#about" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-700 font-semibold border-b border-slate-100">
              {isBangla ? 'আমাদের সম্পর্কে' : 'About Us'}
            </a>
            <a href="#why" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-700 font-semibold border-b border-slate-100">
              {isBangla ? 'আমাদের বিশেষত্ব' : 'Our Features'}
            </a>
            <a href="#branches" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-700 font-semibold border-b border-slate-100">
              {isBangla ? 'ক্যাম্পাস ও শাখা' : 'Campus & Branches'}
            </a>
            <a href="#fac" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-700 font-semibold border-b border-slate-100">
              {isBangla ? 'সুযোগ-সুবিধাসমূহ' : 'Facilities'}
            </a>
            <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-700 font-semibold border-b border-slate-100">
              {isBangla ? 'যোগাযোগ' : 'Contact'}
            </a>
            <Link href="/notices" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-700 font-semibold border-b border-slate-100">
              {isBangla ? 'নোটিশ বোর্ড' : 'Notice Board'}
            </Link>
            <Link href="/admission" onClick={() => setMobileMenuOpen(false)} className="block w-full text-center py-2.5 bg-teal-700 text-white rounded-md font-bold text-sm">
              {isBangla ? 'প্রি-এডমিশন আবেদন' : 'Pre-Admission Application'}
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
                <h2 className="hm-admission__title">
                  {isBangla ? 'ভর্তির আবেদন চলছে: ২০২৭' : 'Admissions Open: Academic Session 2027'}
                </h2>
                <p className="hm-admission__detail">
                  {isBangla ? 'আবেদনের শেষ তারিখ: ১৫ নভেম্বর, ২০২৬' : 'Application Deadline: 15 November, 2026'}
                </p>
                <ul className="hm-admission__branches">
                  <li className="hm-admission__branch is-open">
                    <span className="hm-admission__branch-name">
                      {isBangla ? 'হিফজুল কুরআন বিভাগ:' : 'Hifzul Quran Dept:'}
                    </span>
                    <span className="hm-admission__branch-status">
                      {isBangla ? 'অনলাইনে আবেদন চলছে' : 'Online Applications Open'}
                    </span>
                  </li>
                  <li className="hm-admission__branch is-open">
                    <span className="hm-admission__branch-name">
                      {isBangla ? 'প্লে - ৬ষ্ঠ শ্রেণি জেনারেল:' : 'Play - Class 6 General:'}
                    </span>
                    <span className="hm-admission__branch-status">
                      {isBangla ? 'সাক্ষাৎকারের তারিখ নির্ধারণ চলছে' : 'Interviews in Progress'}
                    </span>
                  </li>
                </ul>
              </div>
              <Link className="hm-admission__link" href="/admission">
                <span>{isBangla ? 'আবেদন করুন' : 'Apply Now'}</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M5 12h14"></path>
                  <path d="M13 6l6 6-6 6"></path>
                </svg>
              </Link>
            </div>

            {/* Hero Grid (.hm-hero__grid) */}
            <div className="hm-hero__grid" style={{ marginTop: '20px' }}>
              
              {/* Left Column: Hero Slider */}
              <div className="relative w-full h-[340px] sm:h-[400px] lg:h-[430px] rounded-3xl overflow-hidden shadow-md bg-[#F8FAF9] border border-slate-200/90 group">
                {slides.map((slide, idx) => (
                  <div 
                    key={idx}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      opacity: activeSlide === idx ? 1 : 0,
                      zIndex: activeSlide === idx ? 10 : 0,
                      transition: 'opacity 0.6s ease-in-out',
                      pointerEvents: activeSlide === idx ? 'auto' : 'none'
                    }}
                  >
                    {/* Ambient subtle backdrop to gracefully fit any photo shape without black bars */}
                    <div 
                      className="absolute inset-0 bg-cover bg-center filter blur-2xl opacity-20 scale-110 pointer-events-none"
                      style={{ backgroundImage: `url(${slide.src})` }}
                    />

                    {/* 100% Original, Uncropped HD Photo (No Heads or Hands Cut Off, 100% Light) */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={slide.src} 
                      alt={slide.title} 
                      className="relative z-10 w-full h-full object-contain mx-auto"
                    />
                    
                    {/* Clean, Bright Floating Caption Badge (No dark vintage tint over the image) */}
                    <div className="absolute bottom-3 left-4 right-16 z-20 pointer-events-none">
                      <div className="inline-flex flex-col bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-md border border-slate-200/80 max-w-lg">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="inline-block px-2 py-0.5 rounded-full bg-teal-50 text-teal-900 border border-teal-200/60 text-[10px] font-bold">
                            {isBangla ? `ক্যাম্পাস দৃশ্যপট • ০${idx + 1}/০${slides.length}` : `Campus View • 0${idx + 1}/0${slides.length}`}
                          </span>
                        </div>
                        <h3 className="text-xs sm:text-sm font-extrabold text-teal-950 leading-snug">
                          {slide.title}
                        </h3>
                        <p className="text-[10px] sm:text-[11px] text-slate-600 line-clamp-1">
                          {slide.subtitle}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Left Navigation Arrow */}
                <button
                  type="button"
                  onClick={() => setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-white/90 hover:bg-teal-700 hover:text-white text-teal-950 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow-md border border-slate-200/60 cursor-pointer"
                  aria-label="Previous slide"
                >
                  <ChevronLeft size={20} />
                </button>

                {/* Right Navigation Arrow */}
                <button
                  type="button"
                  onClick={() => setActiveSlide((prev) => (prev + 1) % slides.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-white/90 hover:bg-teal-700 hover:text-white text-teal-950 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow-md border border-slate-200/60 cursor-pointer"
                  aria-label="Next slide"
                >
                  <ChevronRight size={20} />
                </button>

                {/* Slider Pagination Bullets */}
                <div className="flex items-center justify-center gap-1.5 absolute bottom-3 right-5 z-30">
                  {slides.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActiveSlide(i)}
                      className={`transition-all duration-300 rounded-full cursor-pointer ${
                        activeSlide === i 
                          ? 'w-6 h-2 bg-teal-700 shadow-xs' 
                          : 'w-2 h-2 bg-slate-300 hover:bg-slate-400'
                      }`}
                      aria-label={`Go to slide ${i + 1}`}
                    />
                  ))}
                </div>
              </div>

              {/* Right Column: Important Notices (.hm-notices) */}
              <div className="hm-notices">
                <h3 className="hm-notices__title">
                  {isBangla ? 'গুরুত্বপূর্ণ আপডেট' : 'Important Updates'}
                </h3>
                <div id="notice-container">
                  <Link href="/notices" className="hm-notice">
                    <p className="hm-notice__date">
                      {isBangla ? '১০ নভেম্বর, ২০২৬' : '10 Nov, 2026'}
                    </p>
                    <h4 className="hm-notice__title">
                      {isBangla ? '২০২৭ শিক্ষাবর্ষে প্লে থেকে ষষ্ঠ শ্রেণি ও হিফজে ভর্তি সংক্রান্ত বিজ্ঞপ্তি' : 'Admission Notice for Session 2027: Play to Class 6 & Hifz'}
                    </h4>
                  </Link>

                  <div id="scrolling-wrapper">
                    <div id="tab-notices">
                      <Link href="/notices" className="hm-notice">
                        <p className="hm-notice__date">
                          {isBangla ? '২৫ অক্টোবর, ২০২৬' : '25 Oct, 2026'}
                        </p>
                        <h4 className="hm-notice__title">
                          {isBangla ? 'অভিভাবক সম্মেলন ও শিক্ষার্থী মূল্যায়ন সংক্রান্ত নোটিশ' : 'Parent-Teacher conference & student academic evaluation'}
                        </h4>
                      </Link>

                      <Link href="/notices" className="hm-notice">
                        <p className="hm-notice__date">
                          {isBangla ? '১৫ অক্টোবর, ২০২৬' : '15 Oct, 2026'}
                        </p>
                        <h4 className="hm-notice__title">
                          {isBangla ? 'সম্পূর্ণ শীতাতপ নিয়ন্ত্রিত আধুনিক ক্লাসরুম ও কম্পিউটার ল্যাব উদ্বোধন' : 'Inauguration of fully air-conditioned modern classrooms & lab'}
                        </h4>
                      </Link>

                      <Link href="/notices" className="hm-notice blink-highlight">
                        <p className="hm-notice__date">
                          {isBangla ? '০৫ অক্টোবর, ২০২৬' : '05 Oct, 2026'}
                        </p>
                        <h4 className="hm-notice__title">
                          {isBangla ? 'বার্ষিক মূল্যায়ন পরীক্ষা ও ডিজিটাল রেজাল্ট কার্ড প্রকাশ' : 'Annual assessment exam & digital report card publishing'}
                        </h4>
                      </Link>
                    </div>
                  </div>
                </div>

                <Link href="/notices" className="hm-notices__all">
                  <span>{isBangla ? 'সকল নোটিশ দেখুন' : 'View All Notices'}</span>
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
                  alt={isBangla ? 'আল-মদিনা মডেল মাদ্রাসা ক্লাসরুম' : 'Al-Madina Model Madrasah Classroom'} 
                />
                <div className="hm-about__badge">{isBangla ? 'স্থাপিত: ২০২৪ ইং' : 'Est. 2024 AD'}</div>
              </div>

              {/* Text Content */}
              <div className="hm-about__text">
                <h2 className="hm-h2">
                  {isBangla ? 'কেন আল-মদিনা মডেল মাদ্রাসা' : 'Why Al-Madina Model Madrasah'}
                </h2>
                <p style={{ marginTop: '18px' }}>
                  {isBangla 
                    ? 'সমাজে বিদ্যমান বিভিন্ন শিক্ষাধারার মধ্যে মাদরাসা শিক্ষাধারা সুপ্রাচীন এবং কল্যাণমুখী শিক্ষার ধারক হিসেবে সুবিদিত। এই শিক্ষাধারা ইসলামী জীবন-দর্শনের আলোকে উপমহাদেশে গড়ে তুলছে পরকালমুখী মূল্যবোধসম্পন্ন আদর্শ মানুষ। কিন্তু এই শিক্ষাধারা নৈতিকতা ও মূল্যবোধের মানদণ্ডে উত্তীর্ণ একদল আদর্শ মানুষ ও দক্ষ আলেম তৈরিতে সফল হলেও এর দ্বারা সময়োপযোগী ও সৃজনশীল মানুষ সেভাবে তৈরি হচ্ছে না।'
                    : 'Among various educational traditions, Madrasah education is historically recognized as the foundation of benevolent character building. It has cultivated generations of righteous scholars in light of Islamic worldview. However, while traditional streams excel in imparting religious piety, modern creative competence and practical technical acumen often require contemporary enhancement.'}
                </p>
                <p>
                  {isBangla
                    ? 'পক্ষান্তরে প্রচলিত সাধারণ শিক্ষাধারা আমাদের সন্তানদের পার্থিব শিক্ষায় শিক্ষিত করছে বটে, কিন্তু এই মাধ্যমে নৈতিকতা এবং প্রকৃত জীবনবোধসম্পন্ন মানুষ গড়ে উঠছে না। এজন্য আমরা মনে করছি এরকম একটি শিক্ষাপ্রতিষ্ঠান দরকার যেটি উন্নত চরিত্রসমৃদ্ধ কুরআন-সুন্নাহর গভীর জ্ঞানসম্পন্ন মানুষ তৈরি করবে, যারা জাগতিক জ্ঞান-বিজ্ঞানেও প্রয়োজনীয় ধারণা রাখবে। এই লক্ষ্য বাস্তবায়নেই আল-মদিনা মডেল মাদ্রাসা এন্ড রিসার্চ ইনস্টিটিউটের অভিযাত্রা।'
                    : 'Conversely, conventional general education equips children with worldly knowledge, yet frequently lacks foundational moral grounding and divine worldview. Therefore, our visionary institution bridges both paradigms: nurturing righteous souls with deep Quranic mastery alongside modern academic and scientific acumen. This is the noble mission of Al-Madina Model Madrasah & Research Institute.'}
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* SECTION 3: 9 CORE PILLARS (.hm-why) */}
        <section className="hm-section hm-section--tint" id="why">
          <div className="hm-container">
            
            <div className="hm-sec-head">
              <h2 className="hm-h2">
                {isBangla ? 'যে কারণে আল-মদিনা মডেল মাদ্রাসা অনন্য' : 'What Makes Al-Madina Model Madrasah Distinctive'}
              </h2>
            </div>

            <div className="hm-why__grid">
              
              <article className="hm-card hm-why__card">
                <div className="hm-why__top">
                  <span className="hm-why__num">{isBangla ? '০১' : '01'}</span>
                  <span className="hm-why__ic"><BookOpen size={24} /></span>
                </div>
                <h3 className="hm-why__title">
                  {isBangla ? 'সহীহ হিফজুল কুরআন বিভাগ' : 'Authentic Hifzul Quran Division'}
                </h3>
                <p className="hm-why__text">
                  {isBangla 
                    ? 'আন্তর্জাতিক মানসম্পন্ন হাফেজ ও ক্বারীদের নিবিড় তত্ত্বাবধানে সহীহ মাখরাজ ও তাজবীদভিত্তিক বিশুদ্ধ হিফজ প্রশিক্ষণ।' 
                    : 'Rigorous Quran memorization guided by international award-winning Huffaz with authentic Tajweed and Makharaj precision.'}
                </p>
                <Link href="/admission" className="hm-link">
                  <span>{isBangla ? 'বিস্তারিত দেখুন' : 'Learn More'}</span>
                  <ChevronRight size={16} />
                </Link>
              </article>

              <article className="hm-card hm-why__card">
                <div className="hm-why__top">
                  <span className="hm-why__num">{isBangla ? '০২' : '02'}</span>
                  <span className="hm-why__ic"><Layers size={24} /></span>
                </div>
                <h3 className="hm-why__title">
                  {isBangla ? 'সমন্বিত আধুনিক কারিকুলাম' : 'Integrated Modern Curriculum'}
                </h3>
                <p className="hm-why__text">
                  {isBangla 
                    ? 'দ্বীনি শিক্ষার পাশাপাশি জাতীয় শিক্ষাক্রম অনুসারে বাংলা, ইংরেজি, গণিত ও সাধারণ জ্ঞানের আধুনিক মান নিশ্চিতকরণ।' 
                    : 'Harmonious integration of national curriculum (Bangla, English, Math, Science) alongside core Islamic and moral studies.'}
                </p>
                <Link href="/admission" className="hm-link">
                  <span>{isBangla ? 'বিস্তারিত দেখুন' : 'Learn More'}</span>
                  <ChevronRight size={16} />
                </Link>
              </article>

              <article className="hm-card hm-why__card">
                <div className="hm-why__top">
                  <span className="hm-why__num">{isBangla ? '০৩' : '03'}</span>
                  <span className="hm-why__ic"><MessageSquare size={24} /></span>
                </div>
                <h3 className="hm-why__title">
                  {isBangla ? 'আরবি ও ইংরেজি ভাষা চর্চা' : 'Spoken Arabic & English Fluency'}
                </h3>
                <p className="hm-why__text">
                  {isBangla 
                    ? 'ব্যবহারিক কথোপকথন, ভাষা ল্যাব ও নিয়মিত ক্লাসরুম উপস্থাপনার মাধ্যমে দুটি আন্তর্জাতিক ভাষার সাবলীল চর্চা।' 
                    : 'Practical conversational labs and daily interactive presentations to develop effortless fluency in both global languages.'}
                </p>
                <Link href="/admission" className="hm-link">
                  <span>{isBangla ? 'বিস্তারিত দেখুন' : 'Learn More'}</span>
                  <ChevronRight size={16} />
                </Link>
              </article>

              <article className="hm-card hm-why__card">
                <div className="hm-why__top">
                  <span className="hm-why__num">{isBangla ? '০৪' : '04'}</span>
                  <span className="hm-why__ic"><HeartHandshake size={24} /></span>
                </div>
                <h3 className="hm-why__title">
                  {isBangla ? 'নৈতিকতা ও চারিত্রিক তারবিয়াত' : 'Moral Character & Sunnah Tarbiyah'}
                </h3>
                <p className="hm-why__text">
                  {isBangla 
                    ? 'প্রতিটি শিক্ষার্থীর উত্তম আখলাক গঠন এবং প্রিয় নবীজির সুন্নাহর বাস্তব অনুশীলনে নিয়মিত তারবিয়াত প্রদান।' 
                    : 'Dedicated daily mentoring focusing on pristine prophetic character (Akhlaq), empathy, discipline, and pious manners.'}
                </p>
                <Link href="/admission" className="hm-link">
                  <span>{isBangla ? 'বিস্তারিত দেখুন' : 'Learn More'}</span>
                  <ChevronRight size={16} />
                </Link>
              </article>

              <article className="hm-card hm-why__card">
                <div className="hm-why__top">
                  <span className="hm-why__num">{isBangla ? '০৫' : '05'}</span>
                  <span className="hm-why__ic"><Tv size={24} /></span>
                </div>
                <h3 className="hm-why__title">
                  {isBangla ? 'প্রজেক্টর ও স্মার্ট কম্পিউটার ল্যাব' : 'Projector & Smart Computer Lab'}
                </h3>
                <p className="hm-why__text">
                  {isBangla 
                    ? 'কম্পিউটার ল্যাব, মাল্টিমিডিয়া প্রজেক্টর ক্লাসরুম ও যুগোপযোগী তথ্যপ্রযুক্তির সুপরিকল্পিত ব্যবহার।' 
                    : 'Cutting-edge digital multimedia classrooms and computer laboratory fostering tech literacy and interactive conceptual learning.'}
                </p>
                <Link href="/admission" className="hm-link">
                  <span>{isBangla ? 'বিস্তারিত দেখুন' : 'Learn More'}</span>
                  <ChevronRight size={16} />
                </Link>
              </article>

              <article className="hm-card hm-why__card">
                <div className="hm-why__top">
                  <span className="hm-why__num">{isBangla ? '০৬' : '06'}</span>
                  <span className="hm-why__ic"><Users size={24} /></span>
                </div>
                <h3 className="hm-why__title">
                  {isBangla ? 'দক্ষ ওস্তাদ ও শিক্ষক পরিষদ' : 'Distinguished Faculty & Mentors'}
                </h3>
                <p className="hm-why__text">
                  {isBangla 
                    ? 'অধ্যক্ষ মাওলানা ওমর ফারুক মুজাহিদীর প্রত্যক্ষ পরিচালনায় শীর্ষ ইসলামিক বিদ্যাপীঠের অভিজ্ঞ শিক্ষক পরিষদ।' 
                    : 'Supervised directly by Principal Maulana Omar Faruk Mujahidi with veteran Islamic and academic scholars.'}
                </p>
                <Link href="/admission" className="hm-link">
                  <span>{isBangla ? 'বিস্তারিত দেখুন' : 'Learn More'}</span>
                  <ChevronRight size={16} />
                </Link>
              </article>

              <article className="hm-card hm-why__card">
                <div className="hm-why__top">
                  <span className="hm-why__num">{isBangla ? '০৭' : '07'}</span>
                  <span className="hm-why__ic"><ShieldCheck size={24} /></span>
                </div>
                <h3 className="hm-why__title">
                  {isBangla ? 'সম্পূর্ণ AC ক্লাসরুম ও CCTV নিরাপত্তা' : '100% AC Campus & CCTV Surveillance'}
                </h3>
                <p className="hm-why__text">
                  {isBangla 
                    ? 'ক্লান্তিহীন পড়াশোনার জন্য সার্বক্ষণিক এসি ক্লাসরুম, ২৪ ঘণ্টা সিসিটিভি ক্যামেরা ও ডিজিটাল গেটপাস নিয়ন্ত্রণ।' 
                    : 'Fully air-conditioned learning spaces with 24/7 high-definition CCTV security and computerized digital gate-pass access.'}
                </p>
                <Link href="/admission" className="hm-link">
                  <span>{isBangla ? 'বিস্তারিত দেখুন' : 'Learn More'}</span>
                  <ChevronRight size={16} />
                </Link>
              </article>

              <article className="hm-card hm-why__card">
                <div className="hm-why__top">
                  <span className="hm-why__num">{isBangla ? '০৮' : '08'}</span>
                  <span className="hm-why__ic"><Utensils size={24} /></span>
                </div>
                <h3 className="hm-why__title">
                  {isBangla ? 'স্বাস্থ্যসম্মত খাবার ও নিজস্ব ডাইনিং' : 'Hygienic Dining & Nutritious Meals'}
                </h3>
                <p className="hm-why__text">
                  {isBangla 
                    ? 'আবাসিক শিক্ষার্থীদের জন্য অভিজ্ঞ বাবুর্চি দ্বারা প্রস্তুতকৃত শতভাগ পরিচ্ছন্ন, সুষম ও পুষ্টিকর খাদ্য ব্যবস্থা।' 
                    : 'Strictly balanced, freshly prepared wholesome halal dining curated daily for residential students under strict hygiene.'}
                </p>
                <Link href="/admission" className="hm-link">
                  <span>{isBangla ? 'বিস্তারিত দেখুন' : 'Learn More'}</span>
                  <ChevronRight size={16} />
                </Link>
              </article>

              <article className="hm-card hm-why__card">
                <div className="hm-why__top">
                  <span className="hm-why__num">{isBangla ? '০৯' : '09'}</span>
                  <span className="hm-why__ic"><Award size={24} /></span>
                </div>
                <h3 className="hm-why__title">
                  {isBangla ? 'অভিভাবক নিয়মিত মনিটরিং ও রেজাল্ট' : 'Digital Parent Portal & Real-Time Tracking'}
                </h3>
                <p className="hm-why__text">
                  {isBangla 
                    ? 'ডিজিটাল ওয়েব সফটওয়্যার, হাজিরা এসএমএস ও নিয়মিত অভিভাবক বৈঠকের মাধ্যমে সার্বক্ষণিক পারফরম্যান্স ট্র্যাকিং।' 
                    : 'Instant SMS attendance alerts, digital web gradebooks, and collaborative guardian conferences for every learner.'}
                </p>
                <Link href="/admission" className="hm-link">
                  <span>{isBangla ? 'বিস্তারিত দেখুন' : 'Learn More'}</span>
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
              <h2 className="hm-h2">
                {isBangla ? 'মাদরাসার সুযোগ-সুবিধাসমূহ' : 'Campus Facilities & Amenities'}
              </h2>
            </div>

            <div className="hm-fac__grid">
              
              <article className="hm-card hm-fac__card">
                <span className="hm-fac__ic"><ShieldCheck size={28} /></span>
                <h3>
                  {isBangla ? 'সম্পূর্ণ শীতাতপ নিয়ন্ত্রিত (AC) ক্লাসরুম' : 'Fully Air-Conditioned Classrooms'}
                </h3>
                <p>
                  {isBangla 
                    ? 'গ্রীষ্ম ও বর্ষায় মনোরম, আরামদায়ক ও ক্লান্তিহীন পড়াশোনার পরিবেশ বজায় রাখতে পুরো ক্যাম্পাসে সেন্ট্রাল শীতাতপ নিয়ন্ত্রণ ব্যবস্থা সক্রিয় রাখা হয়েছে।'
                    : 'To maintain an optimal, comfortable study atmosphere throughout the year, the entire campus features central air-conditioning.'}
                </p>
              </article>

              <article className="hm-card hm-fac__card">
                <span className="hm-fac__ic"><Tv size={28} /></span>
                <h3>
                  {isBangla ? 'প্রজেক্টর ভিত্তিক মাল্টিমিডিয়া পাঠদান' : 'Interactive Multimedia Teaching'}
                </h3>
                <p>
                  {isBangla
                    ? 'শিক্ষার্থীদের পাঠ্যবিষয় সহজে হৃদয়ঙ্গম করার জন্য প্রজেক্টরের মাধ্যমে ভিজ্যুয়াল প্রেজেন্টেশন ও অডিও-ভিজ্যুয়াল পদ্ধতিতে ক্লাস নেওয়া হয়।'
                    : 'Concepts are presented visually using HD multimedia projectors and audio-visual pedagogical materials for deeper comprehension.'}
                </p>
              </article>

              <article className="hm-card hm-fac__card">
                <span className="hm-fac__ic"><Users size={28} /></span>
                <h3>
                  {isBangla ? 'সার্বক্ষণিক ব্যক্তিগত তদারকি ও সিসিটিভি' : '24/7 Personal Mentoring & Security'}
                </h3>
                <p>
                  {isBangla
                    ? 'অধ্যক্ষ মহোদয়ের সরাসরি ক্লাস, সম্মানিত শিক্ষকদের সার্বক্ষণিক উপস্থিতি এবং ২৪ ঘণ্টা সিসিটিভি ক্যামেরায় শিক্ষার্থীদের কঠোর নিরাপত্তা প্রদান করা হয়।'
                    : 'Personal mentoring by the Principal, constant on-campus teacher presence, and round-the-clock CCTV cameras ensure comprehensive student safety.'}
                </p>
              </article>

              <article className="hm-card hm-fac__card">
                <span className="hm-fac__ic"><Utensils size={28} /></span>
                <h3>
                  {isBangla ? 'পুষ্টিকর খাদ্য ও মনোরম আবাসন' : 'Wholesome Nutrition & Boarding'}
                </h3>
                <p>
                  {isBangla
                    ? 'আবাসিক ও অনাবাসিক শিক্ষার্থীদের শারীরিক সুস্থতা ও স্বাচ্ছন্দ্যের জন্য সম্পূর্ণ পরিচ্ছন্ন পরিবেশে স্বাস্থ্যসম্মত খাবার পরিবেশন নিশ্চিত করা হয়।'
                    : 'A clean, caring home environment with dietitian-supervised balanced meals to nurture physical vitality and mental agility.'}
                </p>
              </article>

            </div>

            <div className="hm-fac__cta">
              <Link href="/admission" className="hm-btn hm-btn--primary">
                <span>{isBangla ? 'অনলাইনে ভর্তি আবেদন করুন' : 'Apply Online for Admission'}</span>
                <ChevronRight size={18} />
              </Link>
            </div>

          </div>
        </section>

        {/* SECTION 5: PRINCIPAL'S MESSAGE (.hm-chair) */}
        <section className="hm-section hm-chair" id="principal">
          <div className="hm-container">
            
            <div className="hm-sec-head">
              <h2 className="hm-h2">
                {isBangla ? 'অধ্যক্ষ মহোদয়ের বাণী' : "Principal's Message"}
              </h2>
            </div>

            <div className="hm-card hm-chair__card">
              <div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  className="hm-chair__img" 
                  src="/principal.jpg" 
                  alt={isBangla ? 'মাওলানা ওমর ফারুক মুজাহিদী' : 'Maulana Omar Faruk Mujahidi'} 
                />
              </div>
              <div>
                <p className="hm-chair__quote">
                  <span style={{ color: '#0d9488', fontSize: '1.6rem', lineHeight: 0, verticalAlign: '-4px' }}>“</span>
                  {isBangla
                    ? 'শিশুদের কোমল হৃদয়ে পরকালীন চেতনা জাগাতে না পারলে, দুনিয়ার যত সুন্দর পরিবেশেই লালন-পালন করা হোক না কেন—তারা প্রকৃত মানুষ হয়ে গড়ে উঠবে না। আমরা আল-মদিনা মডেল মাদ্রাসায় এমন একটি পরিবেশ সৃষ্টি করেছি যেখানে প্রতিটি শিক্ষার্থী আল্লাহর কালাম হিফজ করার পাশাপাশি আধুনিক যুগোপযোগী জ্ঞানে বলীয়ান হয়ে সৎ, দক্ষ ও খোদাভীরু মানুষ হিসেবে গড়ে উঠবে।'
                    : 'Unless we awaken spiritual consciousness and moral devotion within young hearts, worldly comforts alone cannot nurture true humanity. At Al-Madina Model Madrasah, we cultivate an enriching environment where learners memorize the Holy Quran while mastering modern knowledge—emerging as righteous, skilled, and God-fearing leaders.'}
                  <span style={{ color: '#0d9488', fontSize: '1.6rem', lineHeight: 0, verticalAlign: '-4px' }}>”</span>
                </p>
                <h3 className="hm-chair__name">
                  {isBangla ? 'মাওলানা ওমর ফারুক মুজাহিদী' : 'Maulana Omar Faruk Mujahidi'}
                </h3>
                <p className="hm-chair__role">
                  {isBangla ? 'প্রতিষ্ঠাতা ও অধ্যক্ষ, আল-মদিনা মডেল মাদ্রাসা এন্ড রিসার্চ ইনস্টিটিউট' : 'Founder & Principal, Al-Madina Model Madrasah & Research Institute'}
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* SECTION 6: CONTACT (.hm-contact) */}
        <section className="hm-section" id="contact">
          <div className="hm-container">
            
            <div className="hm-sec-head">
              <h2 className="hm-h2">
                {isBangla ? 'আমাদের সাথে যোগাযোগ' : 'Get in Touch With Us'}
              </h2>
            </div>

            <div className="hm-contact__cards">
              
              <div className="hm-card hm-contact__card">
                <span className="hm-contact__ic"><Phone size={24} /></span>
                <h3>{isBangla ? 'ফোন ও হটলাইন' : 'Phone & Hotline'}</h3>
                <p>{isBangla ? '০১৭১২-৬৩৩২৬৪' : '+8801712633264'}</p>
                <p>{isBangla ? 'সকাল ৮:০০ - বিকাল ৫:০০' : '8:00 AM - 5:00 PM'}</p>
                <a href="tel:01712633264">
                  {isBangla ? 'সরাসরি কল করুন' : 'Call Directly'}
                </a>
              </div>

              <div className="hm-card hm-contact__card">
                <span className="hm-contact__ic"><Mail size={24} /></span>
                <h3>{isBangla ? 'ইমেইল ঠিকানা' : 'Email Address'}</h3>
                <p>info@almadinamadrasa.edu.bd</p>
                <p>{isBangla ? 'সার্বক্ষণিক ইমেইল সাপোর্ট' : '24/7 Email Support'}</p>
                <a href="mailto:info@almadinamadrasa.edu.bd">
                  {isBangla ? 'ইমেইল পাঠান' : 'Send an Email'}
                </a>
              </div>

              <div className="hm-card hm-contact__card">
                <span className="hm-contact__ic"><MapPin size={24} /></span>
                <h3>{isBangla ? 'ক্যাম্পাস অবস্থান' : 'Campus Location'}</h3>
                <p>{isBangla ? 'ক-৭৫/২, মহাখালী দক্ষিণপাড়া' : 'Ka-75/2, Mohakhali Dakshinpara'}</p>
                <p>{isBangla ? 'বনানী, ঢাকা-১২১২' : 'Banani, Dhaka-1212'}</p>
                <a href="#map">
                  {isBangla ? 'গুগল ম্যাপে দেখুন' : 'View on Google Maps'}
                </a>
              </div>

            </div>

            {/* Split Form & Google Map (.hm-contact__split) */}
            <div className="hm-contact__split" id="map">
              <div>
                <h3>{isBangla ? 'যেকোনো তথ্যের জন্য লিখুন' : 'Send Us an Inquiry'}</h3>
                <form 
                  className="hm-form" 
                  onSubmit={(e) => { 
                    e.preventDefault(); 
                    alert(isBangla ? 'ধন্যবাদ! আপনার বার্তাটি গৃহীত হয়েছে।' : 'Thank you! Your message has been received.'); 
                  }}
                >
                  <div className="hm-form__row">
                    <input type="text" placeholder={isBangla ? 'আপনার নাম *' : 'Your Name *'} required />
                    <input type="tel" placeholder={isBangla ? 'মোবাইল নম্বর *' : 'Phone Number *'} required />
                  </div>
                  <input type="email" placeholder={isBangla ? 'ইমেইল (ঐচ্ছিক)' : 'Email (Optional)'} />
                  <textarea placeholder={isBangla ? 'আপনার বার্তা বা প্রশ্ন লিখুন *' : 'Your Message or Question *'} required></textarea>
                  <button type="submit" className="hm-form__submit">
                    {isBangla ? 'বার্তা পাঠান' : 'Send Message'}
                  </button>
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

        {/* SECTION 7: CAMPUS & EXPANSION PLAN */}
        <section className="hm-section hm-section--tint" id="branches">
          <div className="hm-container">
            
            <div className="hm-sec-head text-center max-w-2xl mx-auto mb-10">
              <span className="hm-eyebrow">
                {isBangla ? 'ক্যাম্পাস ও সম্প্রসারণ পরিকল্পনা' : 'Campus & Expansion Vision'}
              </span>
              <h2 className="hm-h2">
                {isBangla ? 'আমাদের ক্যাম্পাস ও শাখা পরিকল্পনা' : 'Our Campus & Branch Roadmap'}
              </h2>
              <p className="hm-sub text-sm sm:text-base leading-relaxed text-slate-600 mt-2">
                {isBangla
                  ? 'আল-মদিনা মডেল মাদ্রাসার শিক্ষা কার্যক্রম বর্তমানে মহাখালী মূল ক্যাম্পাসে পরিচালিত হচ্ছে। অভিভাবকদের দীর্ঘদিনের দাবি ও শিক্ষার্থীদের ক্রমবর্ধমান চাহিদার প্রেক্ষিতে অত্র এলাকায় একটি স্বতন্ত্র আধুনিক মহিলা শাখা খোলার বিশেষ পরিকল্পনা গ্রহণ করা হয়েছে।'
                  : 'Academic activities are currently headquartered at our Mohakhali Main Campus. In response to consistent guardian demand and community needs, comprehensive plans are underway to establish an exclusive modern female campus nearby.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              
              {/* Card 1: Mohakhali Main Campus (Active) */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 sm:p-7 border-t-4 border-t-teal-600 flex flex-col justify-between hover:shadow-lg transition-shadow">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      {isBangla ? 'সক্রিয় মূল ক্যাম্পাস' : 'Active Main Campus'}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {isBangla ? 'ক্যাম্পাস ০১' : 'Campus 01'}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-teal-600 shrink-0" />
                    <span>
                      {isBangla ? 'মহাখালী মূল ক্যাম্পাস (বালক ও হিফজ শাখা)' : 'Mohakhali Main Campus (Boys & Hifz)'}
                    </span>
                  </h3>
                  
                  <p className="text-xs text-teal-700 font-medium mb-4">
                    {isBangla ? 'প্লে - ৬ষ্ঠ শ্রেণি জেনারেল ও আন্তর্জাতিক মানের হিফজুল কুরআন বিভাগ' : 'Play to Class 6 General & International-Standard Hifzul Quran'}
                  </p>

                  <div className="space-y-2.5 text-xs text-slate-600 mb-6">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                      <span>
                        <strong>{isBangla ? 'ঠিকানা:' : 'Address:'}</strong> {isBangla ? 'ক-৭৫/২, মহাখালী দক্ষিণপাড়া, বনানী, ঢাকা-১২১২ (মহাখালী ওয়্যারলেস গেট সংলগ্ন)' : 'Ka-75/2, Mohakhali Dakshinpara, Banani, Dhaka-1212 (Near Wireless Gate)'}
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                      <span>
                        <strong>{isBangla ? 'সুবিধাসমূহ:' : 'Facilities:'}</strong> {isBangla ? 'সম্পূর্ণ শীতাতপ নিয়ন্ত্রিত আধুনিক ক্যাম্পাস, স্মার্ট মাল্টিমিডিয়া ক্লাসরুম, নিরিবিলি লাইব্রেরি ও আবাসিক হোস্টেল' : 'Fully air-conditioned modern campus, smart multimedia classrooms, library & boarding'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-teal-600 shrink-0" />
                      <span>
                        <strong>{isBangla ? 'হটলাইন:' : 'Hotline:'}</strong> <a href="tel:01712633264" className="text-teal-700 font-bold hover:underline">{isBangla ? '০১৭১২-৬৩৩২৬৪' : '+8801712633264'}</a>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-teal-600 shrink-0" />
                      <span>
                        <strong>{isBangla ? 'ইমেইল:' : 'Email:'}</strong> <a href="mailto:info@almadinamadrasa.edu.bd" className="text-teal-700 font-bold hover:underline">info@almadinamadrasa.edu.bd</a>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <a 
                    href="#contact" 
                    className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1 hover:underline"
                  >
                    {isBangla ? 'ম্যাপ লোকেশন দেখুন' : 'View Location Map'} <ChevronRight size={14} />
                  </a>
                  <Link 
                    href="/admission" 
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition shadow-xs"
                  >
                    <span>{isBangla ? 'ভর্তি আবেদন' : 'Apply for Admission'}</span>
                    <ChevronRight size={14} />
                  </Link>
                </div>
              </div>

              {/* Card 2: Upcoming Female Branch (Planned) */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 sm:p-7 border-t-4 border-t-amber-500 flex flex-col justify-between hover:shadow-lg transition-shadow bg-gradient-to-b from-amber-50/20 to-white">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      {isBangla ? 'ভবিষ্যৎ সম্প্রসারণ পরিকল্পনা' : 'Future Expansion Plan'}
                    </span>
                    <span className="text-xs text-amber-600 font-mono font-semibold">
                      {isBangla ? 'আসন্ন শাখা' : 'Upcoming Branch'}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                    <School className="w-5 h-5 text-amber-600 shrink-0" />
                    <span>{isBangla ? 'আসন্ন মহিলা শাখা (পরিকল্পনাধীন)' : 'Upcoming Female Campus (Planned)'}</span>
                  </h3>
                  
                  <p className="text-xs text-amber-700 font-medium mb-4">
                    {isBangla ? 'ছাত্রীদের জন্য সম্পূর্ণ পর্দাপূর্ণ ও স্বতন্ত্র ইসলামিক আধুনিক শিক্ষাকেন্দ্র' : 'Dedicated, secure Islamic & modern educational institution for girls'}
                  </p>

                  <div className="space-y-2.5 text-xs text-slate-600 mb-6">
                    <div className="flex items-start gap-2">
                      <BookOpen className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span>
                        <strong>{isBangla ? 'পরিকল্পনার উদ্দেশ্য:' : 'Vision:'}</strong> {isBangla ? 'দ্বীনি ইলম ও নৈতিক তারবিয়াহর সাথে সাধারণ শিক্ষার সমন্বয়ে আদর্শ নারী নেতৃত্ব গড়ে তোলা' : 'Developing exemplary female leadership integrating Islamic sciences with modern curriculum'}
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Layers className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span>
                        <strong>{isBangla ? 'প্রস্তাবিত বিভাগ:' : 'Proposed Sections:'}</strong> {isBangla ? 'নূরানী, নাজেরা, বালিকা হিফজুল কুরআন ও স্কুল কারিকুলাম ভিত্তিক জেনারেল বিভাগ' : 'Noorani, Nazera, Girls Hifz, and School-Curriculum General Sections'}
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Users className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span>
                        <strong>{isBangla ? 'পরিচালনা পর্ষদ:' : 'Supervision:'}</strong> {isBangla ? 'দক্ষ ও অভিজ্ঞ নারী শিক্ষিকাবৃন্দের সার্বক্ষণিক তত্ত্বাবধান ও নিরবচ্ছিন্ন নিরাপত্তা' : 'Exclusive female faculty supervision with rigorous security safeguards'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>
                        <strong>{isBangla ? 'বর্তমান অবস্থা:' : 'Current Status:'}</strong> {isBangla ? 'প্রাথমিক রূপরেখা প্রণয়ন সম্পন্ন; ইনশাআল্লাহ দ্রুত বিস্তারিত জানানো হবে' : 'Initial framework established; official launch announcement coming soon InshaAllah'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <a 
                    href="#contact" 
                    className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 hover:underline"
                  >
                    {isBangla ? 'মতামত ও পরামর্শ দিন' : 'Share Feedback'} <ChevronRight size={14} />
                  </a>
                  <a 
                    href="tel:01712633264" 
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition shadow-xs"
                  >
                    <span>{isBangla ? 'যোগাযোগ করুন' : 'Contact Us'}</span>
                    <Phone size={12} />
                  </a>
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
                alt={isBangla ? 'আল-মদিনা মডেল মাদ্রাসা' : 'Al-Madina Model Madrasah'} 
                className="ft-logo rounded-full p-1 border-2 border-teal-400" 
                style={{ height: '65px', width: '65px', objectFit: 'cover' }}
              />
              <p className="ft-about">
                {isBangla
                  ? 'দ্বীনি নৈতিকতা ও আধুনিক জ্ঞানের এক অপূর্ব সমন্বয়ে আলোকিত প্রতিষ্ঠান ‘আল-মদিনা মডেল মাদ্রাসা এন্ড রিসার্চ ইনস্টিটিউট’। কুরআন-সুন্নাহ ও যুগোপযোগী শিক্ষার মাধ্যমে আমরা এমন সচেতন ও আদর্শ প্রজন্ম গড়ে তোলার প্রত্যয়ে অবিচল—যারা উম্মাহর কল্যাণ ও মানবসেবায় নেতৃত্ব দেবে, ইন-শা-আল্লাহ।'
                  : "'Al-Madina Model Madrasah & Research Institute' represents an exquisite synthesis of divine moral values and contemporary excellence. Rooted in Quran and Sunnah, our mission is to nurture an enlightened generation dedicated to global human welfare and pious leadership, InshaAllah."}
              </p>
            </div>

            {/* Important Links */}
            <nav className="ft-col" aria-label={isBangla ? 'গুরুত্বপূর্ণ লিংক' : 'Quick Links'}>
              <h4 className="ft-title">{isBangla ? 'গুরুত্বপূর্ণ লিংক' : 'Quick Links'}</h4>
              <ul className="ft-links">
                <li><Link href="/admission">{isBangla ? 'এডমিশন' : 'Admission'}</Link></li>
                <li><Link href="/notices">{isBangla ? 'নোটিশ' : 'Notices'}</Link></li>
                <li><a href="#about">{isBangla ? 'আমাদের সম্পর্কে' : 'About Us'}</a></li>
                <li><a href="#fac">{isBangla ? 'সুযোগ-সুবিধা' : 'Facilities'}</a></li>
                <li><a href="#contact">{isBangla ? 'যোগাযোগ' : 'Contact'}</a></li>
                <li><Link href="/login">{isBangla ? 'ম্যানেজমেন্ট পোর্টাল' : 'Staff Portal'}</Link></li>
              </ul>
            </nav>

            {/* Contact */}
            <div className="ft-col">
              <h4 className="ft-title">{isBangla ? 'যোগাযোগ' : 'Contact'}</h4>
              <ul className="ft-contact">
                <li>
                  <Phone size={16} />
                  <a href="tel:01712633264">{isBangla ? '০১৭১২-৬৩৩২৬৪' : '+8801712633264'}</a>
                </li>
                <li>
                  <Mail size={16} />
                  <a href="mailto:info@almadinamadrasa.edu.bd">info@almadinamadrasa.edu.bd</a>
                </li>
                <li>
                  <MapPin size={16} />
                  <span>{isBangla ? 'ক-৭৫/২, মহাখালী দক্ষিণপাড়া, বনানী, ঢাকা-১২১২' : 'Ka-75/2, Mohakhali Dakshinpara, Banani, Dhaka-1212'}</span>
                </li>
              </ul>
            </div>

            {/* Facebook / Community Box */}
            <div className="ft-col ft-fb-col">
              <h4 className="ft-title">{isBangla ? 'ক্যাম্পাস অবস্থান' : 'Campus Location'}</h4>
              <div className="ft-fb p-3 text-xs leading-relaxed text-slate-300">
                <p className="font-bold text-white mb-1">
                  {isBangla ? 'আল-মদিনা মডেল মাদ্রাসা' : 'Al-Madina Model Madrasah'}
                </p>
                <p>
                  {isBangla 
                    ? 'গুলশান, বনানী ও মহাখালী এলাকার কেন্দ্রবিন্দুতে মনোরম ও নিরাপদ পরিবেশে অবস্থিত।'
                    : 'Conveniently situated in the prime heart of Gulshan, Banani, and Mohakhali in a serene and secure environment.'}
                </p>
                <div className="mt-3 pt-3 border-t border-white/10 flex gap-2">
                  <a href="https://www.facebook.com/AlMadinaModelMadrasaAndResearchInstitute" target="_blank" rel="noreferrer" className="text-teal-400 hover:underline">
                    {isBangla ? 'ফেসবুক পেজ' : 'Facebook Page'}
                  </a>
                  <span>•</span>
                  <a href="https://www.youtube.com/@al_madina_model_madrasha" target="_blank" rel="noreferrer" className="text-teal-400 hover:underline">
                    {isBangla ? 'ইউটিউব চ্যানেল' : 'YouTube Channel'}
                  </a>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Copyright */}
          <div className="ft-bottom">
            <div className="ft-bottom__inner">
              <p>
                {isBangla 
                  ? `© ${new Date().getFullYear()} আল-মদিনা মডেল মাদ্রাসা এন্ড রিসার্চ ইনস্টিটিউট। সর্বস্বত্ব সংরক্ষিত।`
                  : `© ${new Date().getFullYear()} Al-Madina Model Madrasah & Research Institute. All rights reserved.`}
              </p>
              <div className="ft-bottom__links">
                <Link href="/privacy">{isBangla ? 'গোপনীয়তা নীতি' : 'Privacy Policy'}</Link>
                <Link href="/terms">{isBangla ? 'শর্তাবলী' : 'Terms of Service'}</Link>
                <Link href="/login">{isBangla ? 'এডমিন লগইন' : 'Admin Login'}</Link>
              </div>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
