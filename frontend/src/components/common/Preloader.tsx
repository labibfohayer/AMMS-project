'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Preloader() {
  const { isBangla } = useLanguage();
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);
  const [isEntered, setIsEntered] = useState(false);

  useEffect(() => {
    // 0. Warm up and decode fonts immediately
    if (typeof document !== 'undefined' && document.fonts) {
      document.fonts.load("40px 'Galada'");
      document.fonts.load("48px 'Great Vibes'");
      document.fonts.load("40px 'Caveat'");
    }

    // 1. Lock scrolling on body while preloader is active
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    if (typeof window !== 'undefined' && (window as any).lenis) {
      (window as any).lenis.stop();
    }

    // 2. Smooth, graceful upward float entrance from bottom
    const enterTimer = setTimeout(() => {
      setIsEntered(true);
    }, 40);

    // 3. Exact 3.9s visible duration before smooth fade-out starts (allowing all 3 flip lines to land serenely)
    const fadeTimer = setTimeout(() => {
      setIsFading(true);
    }, 3900);

    // 4. Complete fade-out after 4.45s and restore page scrolling
    const unmountTimer = setTimeout(() => {
      setIsVisible(false);
      document.body.style.overflow = prevOverflow || '';
      if (typeof window !== 'undefined' && (window as any).lenis) {
        (window as any).lenis.start();
      }
    }, 4450);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(fadeTimer);
      clearTimeout(unmountTimer);
      document.body.style.overflow = prevOverflow || '';
      if (typeof window !== 'undefined' && (window as any).lenis) {
        (window as any).lenis.start();
      }
    };
  }, []);

  const handleDismiss = () => {
    setIsFading(true);
    setTimeout(() => {
      setIsVisible(false);
      if (typeof document !== 'undefined') {
        document.body.style.overflow = '';
      }
      if (typeof window !== 'undefined' && (window as any).lenis) {
        (window as any).lenis.start();
      }
    }, 450);
  };

  if (!isVisible) return null;

  const lines = isBangla
    ? [
        'আসসালামু আলাইকুম,',
        'আল মদিনা মডেল মাদ্রাসা এন্ড রিসার্চ ইনস্টিটিউট-এর',
        'অফিসিয়াল ওয়েবসাইটে স্বাগতম',
      ]
    : [
        'Assalamu Alaikum, Welcome to the',
        'official website of Al Madina Model',
        'Madrasa and Research Institute',
      ];

  return (
    <div
      aria-label="Welcome Splash Screen"
      onClick={handleDismiss}
      className={`fixed inset-0 w-screen h-screen z-[999999] flex flex-col items-center justify-center select-none transition-all duration-600 ease-in-out cursor-pointer ${
        isFading ? 'opacity-0 pointer-events-none scale-[1.01]' : 'opacity-100 pointer-events-auto scale-100'
      }`}
      style={{
        background: 'radial-gradient(ellipse at 50% 45%, #F0FDF4 0%, #FAFCFB 60%, #FFFFFF 100%)',
      }}
    >
      {/* 🔒 Instant Body Scroll Lock during Loading */}
      {!isFading && (
        <style dangerouslySetInnerHTML={{ __html: 'body { overflow: hidden !important; }' }} />
      )}

      {/* Decorative Outer Border Frame */}
      <div className="absolute inset-4 sm:inset-8 border border-emerald-500/15 rounded-3xl pointer-events-none" />

      {/* Main Content Box - Firm, anchored, graceful entrance */}
      <div 
        className={`relative z-10 flex flex-col items-center justify-center max-w-4xl px-4 sm:px-8 text-center transition-all duration-700 ease-out ${
          isEntered
            ? 'opacity-100 translate-y-0 scale-100'
            : 'opacity-0 translate-y-4 scale-[0.99]'
        }`}
      >
        {/* Stable Non-Floating Wrapper */}
        <div className="flex flex-col items-center justify-center w-full">
          {/* Madrasa Emblem / Logo with Clean Ambient Glow */}
          <div className="relative mb-3 sm:mb-4 flex items-center justify-center">
            <div
              className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl pointer-events-none"
            />
            <div
              className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full p-1.5 bg-white shadow-xl border-2 border-emerald-600/30 flex items-center justify-center overflow-hidden"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.jpg"
                alt="Al Madina Model Madrasa"
                className="w-full h-full object-contain rounded-full"
              />
            </div>
          </div>

          {/* Bismillah Header */}
          <p className="text-emerald-800/80 text-xs sm:text-sm font-serif tracking-widest mb-2 sm:mb-3 select-none">
            بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
          </p>

          {/* 3-Line Flip Welcome Typography */}
          <div 
            className="w-full flex flex-col items-center justify-center text-center py-1 sm:py-2"
            style={{ perspective: '1000px' }}
          >
            <h1
              className={`text-teal-950 font-normal tracking-wide drop-shadow-xs flex flex-col items-center justify-center w-full ${
                isBangla 
                  ? 'font-cursive-bn text-2xl sm:text-3xl md:text-4xl lg:text-[40px] leading-[1.8] sm:leading-[1.9]' 
                  : 'font-cursive-en text-[22px] min-[400px]:text-2xl sm:text-3xl md:text-4xl lg:text-[46px] leading-[1.3] sm:leading-[1.38]'
              }`}
              style={{
                fontFamily: isBangla 
                  ? "'Galada', 'Li SK Bishal Unicode', 'SK Bishal', cursive, serif"
                  : "'Great Vibes', 'Caveat', cursive, sans-serif"
              }}
            >
              {/* Line 1: Comes first with 3D Flip-Down from top */}
              <span
                className="block will-change-transform"
                style={{
                  transformOrigin: 'top center',
                  backfaceVisibility: 'hidden',
                  animation: isEntered 
                    ? 'preloaderFlipDown 0.85s cubic-bezier(0.2, 0.9, 0.3, 1) 0.35s both'
                    : 'none',
                }}
              >
                {lines[0]}
              </span>

              {/* Line 2: Rises from bottom up with 3D Flip-Up */}
              <span
                className="block will-change-transform"
                style={{
                  transformOrigin: 'bottom center',
                  backfaceVisibility: 'hidden',
                  animation: isEntered 
                    ? 'preloaderFlipUp 0.9s cubic-bezier(0.2, 0.9, 0.3, 1) 0.95s both'
                    : 'none',
                }}
              >
                {lines[1]}
              </span>

              {/* Line 3: Flips into position gracefully */}
              <span
                className="block will-change-transform"
                style={{
                  transformOrigin: 'center center',
                  backfaceVisibility: 'hidden',
                  animation: isEntered 
                    ? 'preloaderFlipIn 0.85s cubic-bezier(0.2, 0.9, 0.3, 1) 1.55s both'
                    : 'none',
                }}
              >
                {lines[2]}
              </span>
            </h1>
          </div>

          {/* Elegant Subtle Institution Sub-badge */}
          <div 
            className="mt-4 sm:mt-5 flex items-center gap-2"
            style={{
              animation: isEntered
                ? 'preloaderBadgeFade 0.65s cubic-bezier(0.2, 0.9, 0.3, 1) 2.1s both'
                : 'none',
            }}
          >
            <span className="h-px w-8 sm:w-12 bg-emerald-300/60" />
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-widest text-emerald-800/75">
              {isBangla ? 'ক্যাম্পাস ও রিসার্চ পোর্টাল' : 'Campus & Research Portal'}
            </span>
            <span className="h-px w-8 sm:w-12 bg-emerald-300/60" />
          </div>

          {/* Smooth Linear Progress Indicator */}
          <div 
            className="mt-5 sm:mt-6 w-44 sm:w-64 h-1 bg-emerald-100/90 rounded-full overflow-hidden shadow-inner"
            style={{
              animation: isEntered
                ? 'preloaderBadgeFade 0.6s ease 2.1s both'
                : 'none',
            }}
          >
            <div
              className="h-full bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-700 rounded-full"
              style={{
                animation: isEntered
                  ? 'preloaderProgressBar 1.8s cubic-bezier(0.25, 0.8, 0.25, 1) 2.1s both'
                  : 'none',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
