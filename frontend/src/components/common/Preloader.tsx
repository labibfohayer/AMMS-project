'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Preloader() {
  const { isBangla } = useLanguage();
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);
  const [charIndex, setCharIndex] = useState(0);

  const welcomeText = isBangla
    ? 'আসসালামু আলাইকুম, আল মদিনা মডেল মাদ্রাসা এন্ড রিসার্চ ইনস্টিটিউট-এর অফিসিয়াল ওয়েবসাইটে স্বাগতম'
    : 'Assalamu Alaikum, Welcome to the official website of Al Madina Model Madrasa and Research Institute';

  // Segment text into complete linguistic graphemes (prevents broken Bengali ligatures)
  const graphemes = useMemo(() => {
    if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
      const segmenter = new Intl.Segmenter(isBangla ? 'bn' : 'en', { granularity: 'grapheme' });
      return Array.from(segmenter.segment(welcomeText), (s) => s.segment);
    }
    return Array.from(welcomeText);
  }, [welcomeText, isBangla]);

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

    // 2. Handwriting / Signature Writing Cadence (Starts at 120ms)
    let current = 0;
    const writeStart = setTimeout(() => {
      const charDelay = isBangla ? 18 : 13;
      const interval = setInterval(() => {
        current++;
        setCharIndex(current);
        if (current >= graphemes.length) {
          clearInterval(interval);
        }
      }, charDelay);

      return () => clearInterval(interval);
    }, 120);

    // 3. Exact visible duration before smooth fade-out starts (2.8s)
    const fadeTimer = setTimeout(() => {
      setIsFading(true);
    }, 2800);

    // 4. Complete fade-out after 3.3s and restore page scrolling
    const unmountTimer = setTimeout(() => {
      setIsVisible(false);
      document.body.style.overflow = prevOverflow || '';
    }, 3350);

    return () => {
      clearTimeout(writeStart);
      clearTimeout(fadeTimer);
      clearTimeout(unmountTimer);
      document.body.style.overflow = prevOverflow || '';
    };
  }, [graphemes.length, isBangla]);

  if (!isVisible) return null;

  const displayedText = graphemes.slice(0, charIndex).join('');
  const isWritingComplete = charIndex >= graphemes.length;

  return (
    <div
      aria-label="Welcome Splash Screen"
      className={`fixed inset-0 w-screen h-screen z-[999999] flex flex-col items-center justify-center select-none transition-all duration-500 ease-in-out ${
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

      {/* Main Content Box (Stable, Clean, Grounded - No Water Floating Motion) */}
      <div className="relative z-10 flex flex-col items-center justify-center max-w-4xl px-6 sm:px-10 text-center">
        {/* Madrasa Emblem / Logo with Subtle Breathing Ambient Aura */}
        <div className="relative mb-4 flex items-center justify-center">
          <div
            className="absolute inset-0 rounded-full bg-emerald-500/25 blur-2xl"
            style={{ animation: 'preloaderAura 2.6s ease-in-out infinite' }}
          />
          <div
            className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full p-1.5 bg-white shadow-xl border-2 border-emerald-600/30 flex items-center justify-center overflow-hidden"
            style={{ animation: 'preloaderLogoPulse 2.8s ease-in-out infinite' }}
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
        <p className="text-emerald-800/80 text-xs sm:text-sm font-serif tracking-widest mb-3 select-none">
          بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
        </p>

        {/* ✍️ Live Calligraphy Signature Writing Text Container */}
        <div className="min-h-[110px] sm:min-h-[135px] md:min-h-[155px] flex items-center justify-center">
          <h1
            className={`text-teal-950 font-normal tracking-wide drop-shadow-xs max-w-3xl ${
              isBangla 
                ? 'font-cursive-bn text-2xl sm:text-3xl md:text-4xl lg:text-[40px] leading-[2.0] sm:leading-[2.1]' 
                : 'font-cursive-en text-3xl sm:text-4xl md:text-5xl lg:text-[54px] leading-[1.4] sm:leading-[1.5]'
            }`}
            style={{
              fontFamily: isBangla 
                ? "'Galada', 'Li SK Bishal Unicode', 'SK Bishal', cursive, serif"
                : "'Great Vibes', 'Caveat', cursive, sans-serif"
            }}
          >
            <span>{displayedText}</span>
            {/* Live Calligraphy Pen / Ink Tip Indicator */}
            {!isWritingComplete && (
              <span 
                className="inline-block w-[3px] sm:w-[3.5px] h-[0.9em] ml-1 sm:ml-1.5 bg-emerald-600 rounded-full align-middle shadow-xs"
                style={{ animation: 'inkPenBlink 0.6s ease-in-out infinite' }}
              />
            )}
          </h1>
        </div>

        {/* Elegant Subtle Institution Sub-badge */}
        <div className="mt-5 flex items-center gap-2">
          <span className="h-px w-8 sm:w-12 bg-emerald-300/60" />
          <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-widest text-emerald-800/75">
            {isBangla ? 'ক্যাম্পাস ও রিসার্চ পোর্টাল' : 'Campus & Research Portal'}
          </span>
          <span className="h-px w-8 sm:w-12 bg-emerald-300/60" />
        </div>

        {/* Smooth Linear 2.7s Progress Indicator */}
        <div className="mt-6 w-44 sm:w-64 h-1 bg-emerald-100/90 rounded-full overflow-hidden shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-700 rounded-full"
            style={{
              animation: 'preloaderProgressBar 2.7s cubic-bezier(0.2, 0.8, 0.2, 1) forwards',
            }}
          />
        </div>
      </div>
    </div>
  );
}
