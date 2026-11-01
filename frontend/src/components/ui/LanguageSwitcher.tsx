'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Globe } from 'lucide-react';

interface LanguageSwitcherProps {
  variant?: 'light' | 'dark' | 'glass';
  className?: string;
  showIcon?: boolean;
}

export default function LanguageSwitcher({
  variant = 'light',
  className = '',
  showIcon = true,
}: LanguageSwitcherProps) {
  const { language, setLanguage } = useLanguage();

  const isDark = variant === 'dark';
  const isGlass = variant === 'glass';

  return (
    <div
      role="group"
      aria-label="Language selection"
      className={`inline-flex items-center p-0.5 rounded-full transition-all select-none shadow-xs ${
        isDark
          ? 'bg-emerald-950/80 border border-emerald-500/30'
          : isGlass
          ? 'bg-black/25 backdrop-blur-md border border-white/15'
          : 'bg-[#FAF6ED] border border-[#E6DECB]'
      } ${className}`}
    >
      {showIcon && (
        <span className={`pl-2 pr-1 ${isDark ? 'text-amber-400' : 'text-emerald-700'}`}>
          <Globe size={13} className="animate-spin-slow" />
        </span>
      )}

      {/* Bangla Button */}
      <button
        type="button"
        onClick={() => setLanguage('bn')}
        className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
          language === 'bn'
            ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-sm ring-1 ring-emerald-400/40'
            : isDark
            ? 'text-emerald-200/70 hover:text-white hover:bg-white/5'
            : 'text-gray-600 hover:text-emerald-900 hover:bg-black/5'
        }`}
        title="বাংলা ভাষায় দেখুন"
      >
        বাংলা
      </button>

      {/* English Button */}
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
          language === 'en'
            ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-sm ring-1 ring-emerald-400/40'
            : isDark
            ? 'text-emerald-200/70 hover:text-white hover:bg-white/5'
            : 'text-gray-600 hover:text-emerald-900 hover:bg-black/5'
        }`}
        title="View in English"
      >
        EN
      </button>
    </div>
  );
}
