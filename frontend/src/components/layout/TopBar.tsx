/* eslint-disable */
import { Bell, UserCircle, Globe, Calendar, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import { getMediaUrl } from '@/lib/api';

export default function TopBar({ title }: { title: string }) {
  const { user } = useAuth();
  const { t, isBangla } = useLanguage();
  
  const todayFormatted = new Date().toLocaleDateString(isBangla ? 'bn-BD' : 'en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  // Localized title helper
  const localizedTitle = 
    title === 'AMMS' ? (isBangla ? 'আল-মদিনা মডেল মাদ্রাসা' : 'Al-Madinah Model Madrasah') :
    title.includes('ড্যাশবোর্ড') || title === 'Dashboard' ? t('nav.dashboard') :
    title.includes('শিক্ষক') || title.includes('Teacher') ? (isBangla ? 'শিক্ষক ও স্টাফ ডিরেক্টরি' : 'Teachers & Staff Directory') :
    title.includes('শিক্ষার্থী') || title.includes('Student') ? (isBangla ? 'শিক্ষার্থী তালিকা ও প্রোফাইল' : 'Student Directory & Profiles') :
    title.includes('হাজিরা') || title.includes('Attendance') ? (isBangla ? 'ডিজিটাল হাজিরা ব্যবস্থাপনা' : 'Digital Attendance System') :
    title.includes('পরীক্ষা') || title.includes('Exam') ? (isBangla ? 'পরীক্ষা ও ফলাফল' : 'Exams & Results') :
    title.includes('ফি') || title.includes('Fee') ? (isBangla ? 'ফি ও হিসাব ব্যবস্থাপনা' : 'Fees & Financial Accounts') :
    title.includes('হোস্টেল') || title.includes('Hostel') ? (isBangla ? 'হোস্টেল ও মিল ট্র্যাকার' : 'Hostel & Dining Tracker') :
    title.includes('নোটিশ') || title.includes('Notice') ? (isBangla ? 'নোটিশ ও সার্কুলার' : 'Notices & Announcements') :
    title.includes('রিপোর্ট') || title.includes('Report') ? (isBangla ? 'রিপোর্ট ও প্রিন্ট সেন্টার' : 'Reports & Print Center') :
    title.includes('প্রোফাইল') || title.includes('Profile') ? (isBangla ? 'প্রোফাইল সেটিংস' : 'Profile Settings') :
    title.includes('অভিভাবক') || title.includes('Guardian') ? (isBangla ? 'অভিভাবক পোর্টাল' : 'Guardian Portal') :
    title.includes('ভর্তি') || title.includes('Admission') ? (isBangla ? 'অনলাইন ভর্তি আবেদন' : 'Online Admission Application') :
    title;

  return (
    <header className="bg-white/95 backdrop-blur-md sticky top-0 z-40 border-b border-gray-100 px-4 md:px-8 py-3.5 transition-all shadow-xs">
      <div className="flex justify-between items-center">
        {/* Title & Date */}
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="w-10 h-10 rounded-full p-[1px] bg-gradient-to-tr from-amber-400 to-emerald-500 flex items-center justify-center md:hidden shrink-0 shadow-sm">
            <img 
              src="/logo.jpg" 
              alt="আল মদিনা মডেল মাদ্রাসা" 
              className="w-full h-full object-cover rounded-full bg-white"
            />
          </Link>
          <div>
            <h1 className="font-bold text-lg md:text-xl text-gray-900 tracking-tight leading-tight">
              {localizedTitle}
            </h1>
            <p suppressHydrationWarning className="hidden sm:block text-[11px] text-gray-400 font-medium">
              {todayFormatted}
            </p>
          </div>
        </div>

        {/* Right Action Icons & Badges */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          {/* Language Switcher */}
          <LanguageSwitcher variant="light" />

          {/* Admission Pill */}
          <div className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-amber-700 text-xs font-semibold">
            <Sparkles size={13} className="text-amber-500" />
            <span>{t('brand.admissionBanner')}</span>
          </div>

          {/* Quick link to Public Website */}
          <Link 
            href="/" 
            target="_blank"
            title={t('nav.liveSite')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/60 transition-colors"
          >
            <Globe size={14} className="text-emerald-600" />
            <span>{t('nav.liveSite')}</span>
          </Link>

          {/* Notifications */}
          <Link 
            href="/notices" 
            title="নোটিশ দেখুন"
            className="relative p-2 rounded-xl text-gray-500 hover:text-emerald-700 hover:bg-emerald-50/60 transition-colors"
          >
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full ring-2 ring-white"></span>
          </Link>

          {/* Profile Icon */}
          <Link 
            href="/profile" 
            title="প্রোফাইল সেটিংস"
            className="w-9 h-9 rounded-full p-[1px] bg-gradient-to-tr from-amber-400 to-emerald-500 overflow-hidden flex items-center justify-center cursor-pointer shadow-sm hover:ring-2 hover:ring-emerald-400 transition-all shrink-0"
          >
            {user?.photo ? (
              <img 
                src={getMediaUrl(user.photo)} 
                alt={user?.name_bn || user?.name || 'User'} 
                className="w-full h-full object-cover rounded-full"
              />
            ) : user?.role === 'managing_director' ? (
              <img 
                src="/md.jpg" 
                alt={user?.name_bn || 'লাবিব ফোহায়ের'} 
                className="w-full h-full object-cover object-top rounded-full"
              />
            ) : user?.role === 'principal' ? (
              <img 
                src="/principal.jpg" 
                alt="মাওলানা ওমর ফারুক" 
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-xs">
                {user?.name_bn?.charAt(0) || user?.name?.charAt(0) || 'U'}
              </div>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
