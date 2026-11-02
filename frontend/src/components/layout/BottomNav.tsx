/* eslint-disable */
'use client';
import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { getMediaUrl } from '@/lib/api';
import { 
  Home, Users, CalendarCheck, DollarSign, 
  FileText, Bell, Globe, LogOut, Award, Shield, 
  UserCheck, MessageSquare, ShieldCheck, X
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface BottomNavProps {
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}

export default function BottomNav({ 
  mobileOpen = false, 
  setMobileOpen 
}: BottomNavProps) {
  const { user, logoutUser } = useAuth();
  const { t, isBangla } = useLanguage();
  const pathname = usePathname();

  // Close mobile drawer on route change
  useEffect(() => {
    if (mobileOpen && setMobileOpen) {
      setMobileOpen(false);
    }
  }, [pathname]);

  if (!user) return null;

  const role = user.role;
  let tabs = [];

  if (['principal', 'vice_principal', 'managing_director', 'teacher', 'staff'].includes(role)) {
    tabs = [
      { name: isBangla ? 'ড্যাশবোর্ড' : 'Dashboard', href: '/dashboard', icon: Home },
      { name: isBangla ? 'শিক্ষার্থী' : 'Students', href: '/students', icon: Users },
      { name: isBangla ? 'শিক্ষক ও স্টাফ' : 'Faculty & Staff', href: '/teachers', icon: UserCheck },
      { name: isBangla ? 'উপস্থিতি' : 'Attendance', href: '/attendance', icon: CalendarCheck },
      { name: isBangla ? 'ছুটি ও গেটপাস' : 'Leaves & Gatepass', href: '/students/leaves', icon: ShieldCheck },
      { name: isBangla ? 'ফি ও হিসাব' : 'Fees & Accounts', href: '/fees', icon: DollarSign },
      { name: isBangla ? 'পরীক্ষা ও ফলাফল' : 'Exams & Results', href: '/exams', icon: FileText },
      { name: isBangla ? 'হোয়াটসঅ্যাপ ও বার্তা' : 'WhatsApp & SMS', href: '/notifications', icon: MessageSquare },
      { name: isBangla ? 'নোটিশ বোর্ড' : 'Notice Board', href: '/notices', icon: Bell },
      { name: isBangla ? 'ক্যাশ খাতা ও রিপোর্ট' : 'Reports & Print', href: '/reports', icon: FileText },
      { name: isBangla ? 'প্রোফাইল সেটিংস' : 'Profile Settings', href: '/profile', icon: Shield },
    ];
  } else if (role === 'guardian') {
    tabs = [
      { name: isBangla ? 'ড্যাশবোর্ড' : 'Dashboard', href: '/guardian', icon: Home },
      { name: isBangla ? 'উপস্থিতি' : 'Attendance', href: '/guardian/attendance', icon: CalendarCheck },
      { name: isBangla ? 'বেতন পরিশোধ' : 'Pay Fees', href: '/guardian/fees', icon: DollarSign },
      { name: isBangla ? 'রেজাল্ট কার্ড' : 'Results', href: '/guardian/results', icon: FileText },
      { name: isBangla ? 'নোটিশ' : 'Notices', href: '/notices', icon: Bell },
      { name: isBangla ? 'প্রোফাইল সেটিংস' : 'Profile Settings', href: '/profile', icon: Shield },
    ];
  } else {
    tabs = [
      { name: isBangla ? 'ড্যাশবোর্ড' : 'Dashboard', href: '/student', icon: Home },
      { name: isBangla ? 'রেজাল্ট' : 'Results', href: '/student/results', icon: FileText },
      { name: isBangla ? 'র‍্যাংকিং' : 'Rankings', href: '/student/ranking', icon: Award },
      { name: isBangla ? 'উপস্থিতি' : 'Attendance', href: '/student/attendance', icon: CalendarCheck },
      { name: isBangla ? 'নোটিশ' : 'Notices', href: '/notices', icon: Bell },
      { name: isBangla ? 'প্রোফাইল সেটিংস' : 'Profile Settings', href: '/profile', icon: Shield },
    ];
  }

  // Role display label
  const getRoleLabel = () => {
    switch (user.role) {
      case 'principal':
        return isBangla ? 'অধ্যক্ষ মহোদয়' : 'Principal';
      case 'vice_principal':
        return isBangla ? 'উপাধ্যক্ষ মহোদয়' : 'Vice Principal';
      case 'managing_director':
        return isBangla ? 'ম্যানেজিং ডিরেক্টর' : 'Managing Director';
      case 'teacher':
        return isBangla ? 'সম্মানিত শিক্ষক' : 'Faculty / Teacher';
      case 'staff':
        return isBangla ? 'হিসাবরক্ষক ও স্টাফ' : 'Staff / Accountant';
      case 'guardian':
        return isBangla ? 'সম্মানিত অভিভাবক' : 'Guardian';
      case 'student':
        return isBangla ? 'শিক্ষার্থী' : 'Student';
      default:
        return (user.role as string)?.replace('_', ' ') || 'User';
    }
  };

  const userAvatarImg = user.photo ? (
    <img src={getMediaUrl(user.photo)} alt="" className="w-full h-full object-cover rounded-full" />
  ) : user.role === 'managing_director' ? (
    <img src="/md.jpg" alt="" className="w-full h-full object-cover object-top rounded-full" />
  ) : user.role === 'principal' || user.name_bn?.includes('ফারুক') || !user.role ? (
    <img src="/principal.jpg" alt="" className="w-full h-full object-cover rounded-full" />
  ) : (
    <div className="w-full h-full rounded-full bg-[#031c0b] flex items-center justify-center text-amber-300 font-bold text-xs">
      {user.name_bn?.charAt(0) || user.name?.charAt(0) || 'U'}
    </div>
  );

  return (
    <>
      {/* ============================================================ */}
      {/* 1. DESKTOP SIDEBAR: 100% untouched layout for >= md screens */}
      {/* ============================================================ */}
      <aside className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:left-0 md:w-64 bg-[#132A20] text-white border-r border-[#1F4233] p-4 z-40 shadow-xl transition-all">
        {/* Desktop Brand Header */}
        <div className="flex flex-col gap-2 p-3 mb-6 border-b border-[#1F4233]">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-full p-[2px] bg-[#C5A059] shadow-md group-hover:scale-105 transition-transform shrink-0">
              <img 
                src="/logo.jpg" 
                alt="আল মদিনা মডেল মাদ্রাসা" 
                className="w-full h-full object-cover rounded-full bg-white shadow-inner"
              />
            </div>
            <div className="overflow-hidden">
              <h1 className="font-bold text-sm tracking-tight text-white leading-tight">
                {isBangla ? 'আল-মদিনা মডেল' : 'Al-Madinah Model'}
              </h1>
              <p className="text-[#C5A059] text-[10px] font-semibold tracking-wider">
                {isBangla ? 'মাদ্রাসার এডমিন প্যানেল' : 'Madrasah Admin Panel'}
              </p>
            </div>
          </Link>
        </div>
        
        {/* Desktop Navigation Links */}
        <div className="flex-1 overflow-y-auto w-full space-y-1 pr-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = pathname.startsWith(tab.href) && (tab.href !== '/dashboard' || pathname === '/dashboard');
            return (
              <Link 
                key={tab.href} 
                href={tab.href} 
                className={`flex items-center px-3.5 py-2.5 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? 'text-white bg-[#1B4332] border border-[#2D6A4F]/60 shadow-xs' 
                    : 'text-emerald-100/75 hover:text-white hover:bg-white/[0.08]'
                }`}
              >
                <Icon 
                  size={20} 
                  className={`mr-3 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-[#C5A059]' : 'text-emerald-200/70 group-hover:text-[#C5A059]'
                  }`} 
                />
                <span className="text-xs font-medium tracking-wide flex-1">{tab.name}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059] shadow-xs" />
                )}
              </Link>
            );
          })}

          {/* Quick Link to Public Website on Desktop */}
          <div className="pt-4 border-t border-[#1F4233] mt-3">
            <Link
              href="/"
              target="_blank"
              className="flex items-center p-2.5 px-3.5 rounded-xl text-emerald-100/80 hover:text-[#C5A059] hover:bg-white/[0.08] transition-all text-xs font-medium gap-3"
            >
              <Globe size={18} className="text-[#C5A059]" />
              <span>{isBangla ? 'পাবলিক ওয়েবসাইট' : 'Public Website'}</span>
            </Link>
          </div>
        </div>
        
        {/* Desktop User Profile Footer */}
        <div className="mt-auto pt-3 border-t border-[#1F4233]">
          <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.04] border border-[#1F4233]">
            <Link href="/profile" className="flex items-center gap-2.5 overflow-hidden flex-1 group">
              <div className="w-9 h-9 rounded-full bg-[#C5A059] p-[1.5px] shrink-0 overflow-hidden">
                {userAvatarImg}
              </div>
              <div className="overflow-hidden">
                <p className="text-white font-semibold text-xs truncate group-hover:text-[#C5A059] transition-colors">
                  {isBangla ? (user.name_bn || user.name || 'ইউজার') : (user.name || user.name_bn || 'User')}
                </p>
                <p className="text-emerald-200/70 text-[10px] truncate capitalize">
                  {getRoleLabel()}
                </p>
              </div>
            </Link>
            
            <button
              onClick={() => logoutUser()}
              title="লগ-আউট করুন"
              className="p-1.5 text-emerald-400/60 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors ml-1 cursor-pointer"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* ============================================================ */}
      {/* 2. MOBILE DRAWER: Smooth slide-out off-canvas menu for mobile */}
      {/* ============================================================ */}
      {/* Backdrop overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/65 backdrop-blur-xs z-50 md:hidden transition-opacity"
          onClick={() => setMobileOpen?.(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Sliding Drawer */}
      <aside 
        className={`fixed inset-y-0 left-0 w-[285px] sm:w-[320px] bg-[#132A20] text-white z-50 md:hidden flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Mobile Navigation Menu"
      >
        {/* Mobile Header with Logo & Close Button */}
        <div className="flex items-center justify-between p-4 border-b border-[#1F4233] bg-white/[0.02]">
          <Link 
            href="/dashboard" 
            onClick={() => setMobileOpen?.(false)} 
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-full p-[2px] bg-[#C5A059] shadow-md shrink-0">
              <img 
                src="/logo.jpg" 
                alt="আল মদিনা মডেল মাদ্রাসা" 
                className="w-full h-full object-cover rounded-full bg-white shadow-inner"
              />
            </div>
            <div>
              <h2 className="font-bold text-sm tracking-tight text-white leading-tight">
                {isBangla ? 'আল-মদিনা মডেল' : 'Al-Madinah Model'}
              </h2>
              <p className="text-[#C5A059] text-[10px] font-semibold">
                {isBangla ? 'মাদ্রাসার এডমিন প্যানেল' : 'Admin Panel'}
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen?.(false)}
            className="p-2 text-emerald-200/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* User Card inside Mobile Drawer */}
        <div className="p-3 border-b border-[#1F4233] bg-white/[0.02]">
          <Link 
            href="/profile" 
            onClick={() => setMobileOpen?.(false)}
            className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/[0.04] border border-[#1F4233] hover:bg-white/[0.08] transition-colors"
          >
            <div className="w-11 h-11 rounded-full bg-[#C5A059] p-[1.5px] shrink-0 overflow-hidden shadow-sm">
              {userAvatarImg}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-white font-bold text-sm truncate">
                {isBangla ? (user.name_bn || user.name || 'ইউজার') : (user.name || user.name_bn || 'User')}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-emerald-200/80 text-[11px] font-medium truncate capitalize">
                  {getRoleLabel()}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-[#C5A059] shrink-0">
                  {user.user_id}
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Scrollable Navigation Items */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = pathname.startsWith(tab.href) && (tab.href !== '/dashboard' || pathname === '/dashboard');
            return (
              <Link 
                key={tab.href} 
                href={tab.href} 
                onClick={() => setMobileOpen?.(false)}
                className={`flex items-center px-3.5 py-2.5 rounded-xl transition-all text-xs font-medium gap-3 ${
                  isActive 
                    ? 'text-white bg-[#1B4332] border border-[#2D6A4F]/60 shadow-xs' 
                    : 'text-emerald-100/75 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                <Icon 
                  size={19} 
                  className={`shrink-0 ${isActive ? 'text-[#C5A059]' : 'text-emerald-300/70'}`} 
                />
                <span className="tracking-wide flex-1">{tab.name}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059] shadow-xs" />
                )}
              </Link>
            );
          })}

          {/* Public Website Link in Mobile Drawer */}
          <div className="pt-2 mt-2 border-t border-[#1F4233]">
            <Link
              href="/"
              target="_blank"
              onClick={() => setMobileOpen?.(false)}
              className="flex items-center px-3.5 py-2.5 rounded-xl text-emerald-100/80 hover:text-[#C5A059] hover:bg-white/[0.05] transition-all text-xs font-medium gap-3"
            >
              <Globe size={18} className="text-[#C5A059] shrink-0" />
              <span>{isBangla ? 'পাবলিক ওয়েবসাইট' : 'Public Website'}</span>
            </Link>
          </div>
        </div>

        {/* Mobile Drawer Logout Footer */}
        <div className="p-3 border-t border-[#1F4233]">
          <button
            type="button"
            onClick={() => {
              setMobileOpen?.(false);
              logoutUser();
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-300 hover:text-rose-200 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all cursor-pointer"
          >
            <LogOut size={16} />
            <span>{isBangla ? 'লগ-আউট করুন' : 'Log Out'}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
