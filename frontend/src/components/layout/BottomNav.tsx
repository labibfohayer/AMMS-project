/* eslint-disable */
'use client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import { getMediaUrl } from '@/lib/api';
import { 
  Home, Users, CalendarCheck, DollarSign, MoreHorizontal, 
  FileText, Bell, Globe, LogOut, Award, Shield, UserCheck, UserPlus, MessageSquare, ShieldCheck
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
  const { user, logoutUser } = useAuth();
  const { t, isBangla } = useLanguage();
  const pathname = usePathname();

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

  return (
    <aside className="fixed bottom-0 left-0 right-0 md:top-0 md:bottom-0 md:right-auto md:w-64 bg-[#031c0b] text-white border-t border-emerald-500/20 md:border-t-0 md:border-r flex md:flex-col justify-around md:justify-start p-2 pb-safe md:p-4 z-50 shadow-2xl transition-all">
      {/* Desktop Brand Header */}
      <div className="hidden md:flex flex-col gap-2 p-3 mb-6 border-b border-emerald-500/15">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-full p-[2px] bg-gradient-to-tr from-amber-400 via-emerald-400 to-amber-500 shadow-md shadow-emerald-950/80 group-hover:scale-105 transition-transform shrink-0">
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
            <p className="text-amber-400/80 text-[10px] font-semibold tracking-wider">
              {isBangla ? 'মাদ্রাসার এডমিন প্যানেল' : 'Madrasah Admin Panel'}
            </p>
          </div>
        </Link>
      </div>
      
      {/* Navigation Links */}
      <div className="md:flex-1 md:overflow-y-auto w-full flex justify-around md:block space-y-0 md:space-y-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname.startsWith(tab.href) && (tab.href !== '/dashboard' || pathname === '/dashboard');
          return (
            <Link 
              key={tab.href} 
              href={tab.href} 
              className={`flex flex-col md:flex-row md:items-center p-2 md:px-3.5 md:py-2.5 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? 'text-amber-300 md:text-white md:bg-emerald-500/20 md:border md:border-emerald-400/30 md:shadow-inner' 
                  : 'text-emerald-200/70 hover:text-white md:hover:bg-white/[0.05]'
              }`}
            >
              <Icon 
                size={20} 
                className={`md:mr-3 transition-transform group-hover:scale-110 ${
                  isActive ? 'text-amber-400' : 'text-emerald-400/70 group-hover:text-amber-300'
                }`} 
              />
              <span className="text-[10px] md:text-xs font-medium mt-1 md:mt-0 tracking-wide">{tab.name}</span>
            </Link>
          );
        })}

        {/* Quick Link to Public Website on Desktop */}
        <div className="hidden md:block pt-4 border-t border-emerald-500/15 mt-3">
          <Link
            href="/"
            target="_blank"
            className="flex items-center p-2.5 px-3.5 rounded-xl text-emerald-300/80 hover:text-amber-300 hover:bg-white/[0.05] transition-all text-xs font-medium gap-3"
          >
            <Globe size={18} className="text-amber-400" />
            <span>{isBangla ? 'পাবলিক ওয়েবসাইট' : 'Public Website'}</span>
          </Link>
        </div>
      </div>
      
      {/* Desktop User Profile Footer */}
      <div className="hidden md:block mt-auto pt-3 border-t border-emerald-500/15">
        <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.03] border border-emerald-500/15">
          <Link href="/profile" className="flex items-center gap-2.5 overflow-hidden flex-1 group">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-400 to-emerald-500 p-[1px] shrink-0 overflow-hidden">
              {user.photo ? (
                <img src={getMediaUrl(user.photo)} alt={user.name_bn || user.name || 'User'} className="w-full h-full object-cover rounded-full" />
              ) : user.role === 'managing_director' ? (
                <img src="/md.jpg" alt={user.name_bn || 'লাবিব ফোহায়ের'} className="w-full h-full object-cover object-top rounded-full" />
              ) : user.role === 'principal' || user.name_bn?.includes('ফারুক') || !user.role ? (
                <img src="/principal.jpg" alt="মাওলানা ওমর ফারুক" className="w-full h-full object-cover rounded-full" />
              ) : (
                <div className="w-full h-full rounded-full bg-[#031c0b] flex items-center justify-center text-amber-300 font-bold text-xs">
                  {user.name_bn?.charAt(0) || 'U'}
                </div>
              )}
            </div>
            <div className="overflow-hidden">
              <p className="text-white font-semibold text-xs truncate group-hover:text-amber-300 transition-colors">
                {isBangla 
                  ? (user.name_bn || (user.role === 'managing_director' ? 'লাবিব ফোহায়ের' : 'মাওলানা ওমর ফারুক'))
                  : (user.name || (user.role === 'managing_director' ? 'Labib Fohayer' : 'Principal Omar Faruk'))}
              </p>
              <p className="text-emerald-300/60 text-[10px] truncate capitalize">
                {isBangla
                  ? (user.role === 'principal' ? 'অধ্যক্ষ মহোদয়' : user.role === 'managing_director' ? 'ম্যানেজিং ডিরেক্টর' : user.role.replace('_', ' '))
                  : (user.role === 'principal' ? 'Principal' : user.role === 'managing_director' ? 'Managing Director' : user.role.replace('_', ' '))}
              </p>
            </div>
          </Link>
          
          <button
            onClick={() => logoutUser()}
            title="লগ-আউট করুন"
            className="p-1.5 text-emerald-400/60 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors ml-1"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
