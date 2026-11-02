/* eslint-disable */
'use client';
import AppLayout from '@/components/layout/AppLayout';
import StatCard from '@/components/ui/StatCard';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Users, UserCheck, UserX, UserPlus, DollarSign, FileText, 
  Bell, BarChart, Sparkles, Building, CheckCircle2, ChevronRight, 
  Calendar, Award, MessageSquare, ArrowUpRight, ShieldCheck, Tv, Wind,
  Clock, AlertCircle, Briefcase, GraduationCap, Printer
} from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { toBanglaDigit } from '@/lib/numberToBanglaWords';
import { isLoggedIn } from '@/lib/auth';

export default function Dashboard() {
  const { user, isAuthenticated, isMounted } = useAuth();
  const { t, d, isBangla } = useLanguage();
  const router = useRouter();

  useEffect(() => {
    if (!isMounted) return;
    if (!isAuthenticated && !isLoggedIn()) {
      router.replace('/login');
      return;
    }
    if (user && !['principal', 'vice_principal', 'managing_director', 'teacher', 'staff'].includes(user.role)) {
      if (user.role === 'student') router.replace('/student');
      else if (user.role === 'guardian') router.replace('/guardian');
      else router.replace('/');
    }
  }, [user, isAuthenticated, isMounted, router]);

  if (!isMounted || !user) {
    return (
      <div className="min-h-screen bg-[#FAF6ED] flex items-center justify-center p-8">
        <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AppLayout title={isBangla ? 'ড্যাশবোর্ড' : 'Dashboard'}>
      {/* Executive Welcome Hero Banner */}
      <div className="relative mb-8 rounded-3xl p-6 sm:p-8 bg-[#132A20] text-white border border-[#1F4233] shadow-lg overflow-hidden">
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none" 
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 0 L40 20 L20 40 L0 20 Z' fill='%23ffffff'/%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl p-[2px] bg-[#C5A059] shadow-md shrink-0">
              <img 
                src={user.role === 'managing_director' ? '/md.jpg' : '/principal.jpg'} 
                alt={user.name_bn || (user.role === 'managing_director' ? 'লাবিব ফোহায়ের' : 'মাওলানা ওমর ফারুক')} 
                className="w-full h-full object-cover object-top rounded-2xl border border-white/20"
              />
              <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-[#132A20] rounded-full flex items-center justify-center text-[10px] text-white font-bold" title={isBangla ? "সক্রিয়" : "Active"}>
                ✓
              </span>
            </div>

            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C5A059]/15 border border-[#C5A059]/30 text-[#E5C985] text-xs font-semibold mb-2">
                <Sparkles size={13} className="text-[#C5A059]" />
                <span>
                  {user.role === 'managing_director' 
                    ? t('dashboard.mdView')
                    : user.role === 'vice_principal'
                    ? t('dashboard.vpView')
                    : user.role === 'teacher'
                    ? t('dashboard.teacherView')
                    : user.role === 'staff'
                    ? t('dashboard.staffView')
                    : t('dashboard.principalView')}
                </span>
              </div>
              
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-1">
                {t('dashboard.greeting')} <span className="text-[#E5C985]">
                  {isBangla 
                    ? (user.name_bn || (user.role === 'managing_director' ? 'লাবিব ফোহায়ের' : 'মাওলানা ওমর ফারুক মুজাহিদী'))
                    : (user.name || (user.role === 'managing_director' ? 'Labib Fohayer' : 'Principal Omar Faruk Mujahidi'))}!
                </span>
              </h2>
              
              <p className="text-xs sm:text-sm text-emerald-100/80 max-w-2xl leading-relaxed">
                {t('dashboard.subtitle')}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/students/add"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#C5A059] hover:bg-[#B38E46] text-[#0D2319] shadow-md transition-all active:scale-95"
            >
              <UserPlus size={16} />
              <span>{isBangla ? 'নতুন শিক্ষার্থী ভর্তি' : 'New Admission'}</span>
            </Link>
            
            <Link
              href="/attendance"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-white/10 hover:bg-white/15 border border-white/20 text-white transition-all"
            >
              <UserCheck size={16} className="text-emerald-300" />
              <span>{isBangla ? 'উপস্থিতি নিন' : 'Take Attendance'}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Role Based Views */}
      {['principal', 'vice_principal', 'managing_director'].includes(user.role) && (
        <PrincipalDashboard />
      )}

      {user.role === 'teacher' && (
        <TeacherDashboard user={user} />
      )}

      {user.role === 'staff' && (
        <StaffDashboard user={user} />
      )}
    </AppLayout>
  );
}

function PrincipalDashboard() {
  const { t, d, isBangla } = useLanguage();
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard_stats'],
    queryFn: async () => {
      const res = await api.get('/api/reports/dashboard/');
      return res.data;
    },
    placeholderData: (previousData) => previousData,
  });

  if (isLoading && !data) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-emerald-800">
        <div className="w-8 h-8 border-4 border-emerald-500/30 border-t-emerald-600 rounded-full animate-spin mb-3" />
        <span className="text-sm font-medium">{isBangla ? 'তথ্য লোড হচ্ছে...' : 'Loading data...'}</span>
      </div>
    );
  }

  const stats = data || { 
    total_students: 0, 
    residential_students: 0,
    day_students: 0,
    today_present: 0, 
    today_absent: 0, 
    total_due_fee: '0', 
    total_due_fees: '0',
    total_teachers: 0, 
    total_staff: 0,
    latest_notices: []
  };

  const dueAmount = stats.total_due_fee || stats.total_due_fees || '0';

  return (
    <div className="space-y-8">
      {/* BENTO ROW 1: KEY STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard 
          title={t('stats.totalStudents')} 
          value={stats.total_students} 
          subtitle={isBangla ? `আবাসিক: ${d(stats.residential_students || 0)} • অনাবাসিক: ${d(stats.day_students || 0)}` : `Residential: ${stats.residential_students || 0} • Day: ${stats.day_students || 0}`}
          color="blue" 
          icon={<Users size={24} />} 
        />
        
        <StatCard 
          title={t('stats.presentToday')} 
          value={stats.today_present} 
          subtitle={isBangla ? `অনুপস্থিত: ${d(stats.today_absent)} জন` : `Absent: ${stats.today_absent}`}
          color="green" 
          icon={<UserCheck size={24} />} 
        />
        
        <StatCard 
          title={t('stats.monthlyDue')} 
          value={`৳ ${dueAmount}`} 
          subtitle={isBangla ? "বকেয়া তালিকা দেখুন →" : "View Due List →"}
          color="red" 
          icon={<DollarSign size={24} />} 
        />

        <StatCard 
          title={isBangla ? "শিক্ষক ও স্টাফ" : "Faculty & Staff"} 
          value={stats.total_teachers + stats.total_staff} 
          subtitle={isBangla ? `শিক্ষক: ${d(stats.total_teachers)} | স্টাফ: ${d(stats.total_staff)}` : `Teachers: ${stats.total_teachers} | Staff: ${stats.total_staff}`}
          color="orange" 
          icon={<Building size={24} />} 
        />
      </div>

      {/* BENTO ROW 2: QUICK ACTION CENTER */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base sm:text-lg font-bold text-gray-800 flex items-center gap-2">
            <span>{isBangla ? 'প্রয়োজনীয় কাজ ও শর্টকাট' : 'Quick Actions & Shortcuts'}</span>
            <span className="text-xs font-normal text-gray-500">{isBangla ? 'কুইক অ্যাকশন' : 'Direct Navigation'}</span>
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          <QuickAction 
            href="/students/add" 
            icon={<UserPlus size={22} />} 
            title={isBangla ? "নতুন ছাত্র ভর্তি" : "New Admission"} 
            desc={isBangla ? "২০২৭ সেশন" : "Session 2027"} 
            color="emerald"
          />
          <QuickAction 
            href="/attendance" 
            icon={<UserCheck size={22} />} 
            title={isBangla ? "হাজিরা গ্রহণ" : "Attendance"} 
            desc={isBangla ? "দৈনিক উপস্থিতি" : "Daily Check"} 
            color="blue"
          />
          <QuickAction 
            href="/fees" 
            icon={<DollarSign size={22} />} 
            title={isBangla ? "ফি আদায়" : "Fees Collection"} 
            desc={isBangla ? "মাসিক ফি রসিদ" : "Counter Receipt"} 
            color="amber"
          />
          <QuickAction 
            href="/exams" 
            icon={<FileText size={22} />} 
            title={isBangla ? "পরীক্ষা ও রেজাল্ট" : "Exams & Results"} 
            desc={isBangla ? "মার্ক এন্ট্রি ও শিট" : "Marks Entry"} 
            color="purple"
          />
          <QuickAction 
            href="/notices/add" 
            icon={<Bell size={22} />} 
            title={isBangla ? "নোটিশ প্রকাশ" : "Post Notice"} 
            desc={isBangla ? "জরুরি ঘোষণা" : "Urgent Alert"} 
            color="rose"
          />
          <QuickAction 
            href="/reports" 
            icon={<BarChart size={22} />} 
            title={isBangla ? "রিপোর্টস" : "Reports"} 
            desc={isBangla ? "মাসিক পরিসংখ্যান" : "Monthly Stats"} 
            color="cyan"
          />
        </div>
      </div>

      {/* BENTO ROW 3: CAMPUS STATUS & NOTICES */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Bento: Campus Infrastructure & Academic Status */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-7 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h4 className="font-bold text-gray-900 text-lg">
                  {isBangla ? 'ক্যাম্পাস অবকাঠামো ও বিভাগসমূহ' : 'Campus Infrastructure & Sections'}
                </h4>
                <p className="text-xs text-gray-500">
                  {isBangla ? 'আল-মদিনা মডেল মাদ্রাসা এন্ড রিসার্চ ইনস্টিটিউট' : 'Al-Madinah Model Madrasah & Research Institute'}
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {isBangla ? 'সক্রিয় সেশন ২০২৭' : 'Active Session 2027'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600">
                    <Tv size={18} />
                  </div>
                  <h5 className="font-semibold text-sm text-gray-800">
                    {isBangla ? 'প্রজেক্টর ভিত্তিক ক্লাসরুম' : 'Projector Classrooms'}
                  </h5>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {isBangla 
                    ? 'চিত্র, প্রেজেন্টেশন ও আধুনিক শিক্ষামূলক উপকরণের সাহায্যে সহজ ও আকর্ষণীয় পাঠদান।' 
                    : 'Interactive learning with slide projections and modern multimedia audio-visual aids.'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600">
                    <Wind size={18} />
                  </div>
                  <h5 className="font-semibold text-sm text-gray-800">
                    {isBangla ? 'শীতাতপ নিয়ন্ত্রিত (AC) রুম' : 'Air-Conditioned (AC) Rooms'}
                  </h5>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {isBangla 
                    ? 'ক্লান্তিহীনভাবে পাঠগ্রহণের জন্য সম্পূর্ণ শীতাতপ নিয়ন্ত্রিত পরিবেশ।' 
                    : 'Fully air-conditioned environment ensuring fatigue-free and focused study.'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
                    <ShieldCheck size={18} />
                  </div>
                  <h5 className="font-semibold text-sm text-gray-800">
                    {isBangla ? '২৪ ঘণ্টা CCTV নজরদারি' : '24/7 CCTV Surveillance'}
                  </h5>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {isBangla 
                    ? 'সার্বিক নিরাপত্তা ও শৃঙ্খলার স্বার্থে সার্বক্ষণিক ক্লোজড-সার্কিট ক্যামেরার আওতায়।' 
                    : 'Round-the-clock closed-circuit monitoring for highest student security and discipline.'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
                    <MessageSquare size={18} />
                  </div>
                  <h5 className="font-semibold text-sm text-gray-800">
                    {isBangla ? 'অভিভাবক সমাবেশ' : 'Guardians Meeting'}
                  </h5>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {isBangla 
                    ? 'শিক্ষার্থীদের সার্বিক উন্নতি নিয়ে প্রতি মাসে নিয়মিত Guardians Meeting অনুষ্ঠিত হয়।' 
                    : 'Monthly guardians meetings to review and align on every student’s academic and moral progress.'}
                </p>
              </div>
            </div>

            {/* Campus Activities Snapshot */}
            <div className="mt-5 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>{isBangla ? 'ক্যাম্পাস ও শিক্ষা কার্যক্রমের স্থিরচিত্র' : 'Campus Activities Highlights'}</span>
                </span>
                <span className="text-[10px] text-gray-400">{isBangla ? 'সরাসরি দৃশ্য' : 'Live Highlights'}</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                <div className="group relative rounded-xl overflow-hidden aspect-[4/3] bg-slate-100 border border-slate-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/principal-class.png" alt={isBangla ? 'অধ্যক্ষের পাঠদান' : "Principal's Class"} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <span className="absolute bottom-0 inset-x-0 bg-black/75 text-[9px] text-white p-1 text-center truncate">
                    {isBangla ? 'অধ্যক্ষের ক্লাস' : "Principal's Class"}
                  </span>
                </div>
                <div className="group relative rounded-xl overflow-hidden aspect-[4/3] bg-slate-100 border border-slate-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/quran-class.png" alt={isBangla ? 'হিফজ ক্লাস' : 'Hifz Class'} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <span className="absolute bottom-0 inset-x-0 bg-black/75 text-[9px] text-white p-1 text-center truncate">
                    {isBangla ? 'হিফজ ও তিলাওয়াত' : 'Hifz & Recitation'}
                  </span>
                </div>
                <div className="group relative rounded-xl overflow-hidden aspect-[4/3] bg-slate-100 border border-slate-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/guardians-meeting-1.png" alt={isBangla ? 'অভিভাবক সমাবেশ' : 'Guardians Meeting'} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <span className="absolute bottom-0 inset-x-0 bg-black/75 text-[9px] text-white p-1 text-center truncate">
                    {isBangla ? 'অভিভাবক সভা' : 'Guardians Meeting'}
                  </span>
                </div>
                <div className="group relative rounded-xl overflow-hidden aspect-[4/3] bg-slate-100 border border-slate-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/awards-crests.png" alt={isBangla ? 'মেধা ক্রেস্ট' : 'Merit Crests'} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <span className="absolute bottom-0 inset-x-0 bg-black/75 text-[9px] text-white p-1 text-center truncate">
                    {isBangla ? 'মেধা ক্রেস্ট' : 'Merit Crests'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>{isBangla ? 'ঠিকানা: ক-৭৫/২, মহাখালী দক্ষিণপাড়া, বনানী, ঢাকা' : 'Address: Ka-75/2, Mohakhali Dakshinpara, Banani, Dhaka'}</span>
            <Link href="/students" className="font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1">
              <span>{isBangla ? 'সকল ছাত্র তালিকা' : 'All Students Directory'}</span>
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>

        {/* Right Bento: Recent Notices Feed */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-7 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h4 className="font-bold text-gray-900 text-lg">{isBangla ? 'সাম্প্রতিক নোটিশ' : 'Recent Notices'}</h4>
                <p className="text-xs text-gray-500">{isBangla ? 'মাদ্রাসার অফিসিয়াল নোটিশ বোর্ড' : 'Official Notice Board'}</p>
              </div>
              <Link 
                href="/notices/add"
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                <span>{isBangla ? '+ নতুন দিন' : '+ Add Notice'}</span>
              </Link>
            </div>

            {stats.latest_notices && stats.latest_notices.length > 0 ? (
              <div className="space-y-3">
                {stats.latest_notices.slice(0, 3).map((notice: any) => (
                  <Link 
                    key={notice.id} 
                    href="/notices" 
                    className="block p-3.5 rounded-2xl bg-slate-50 hover:bg-emerald-50/50 border border-slate-100 hover:border-emerald-200 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h5 className="font-semibold text-sm text-gray-800 truncate">
                        {isBangla ? (notice.title_bn || notice.title) : (notice.title || notice.title_bn)}
                      </h5>
                      <span className="text-[10px] text-gray-400 shrink-0">
                        {notice.created_at ? new Date(notice.created_at).toLocaleDateString(isBangla ? 'bn-BD' : 'en-US') : ''}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                      {isBangla ? (notice.body_bn || notice.body) : (notice.body || notice.body_bn)}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50/60 rounded-2xl border border-dashed border-gray-200">
                <Bell size={32} className="mx-auto text-gray-300 mb-2" />
                <p className="text-sm font-medium text-gray-500">
                  {isBangla ? 'বর্তমানে কোনো সক্রিয় নোটিশ নেই' : 'No active notices at the moment'}
                </p>
                <Link
                  href="/notices/add"
                  className="inline-block mt-3 text-xs font-bold text-emerald-700 hover:text-emerald-800"
                >
                  {isBangla ? 'প্রথম নোটিশ প্রকাশ করুন →' : 'Publish First Notice →'}
                </Link>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100">
            <Link 
              href="/notices" 
              className="text-xs font-semibold text-gray-600 hover:text-emerald-700 flex items-center justify-between"
            >
              <span>{isBangla ? 'সকল নোটিশ দেখুন' : 'View All Notices'}</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

function TeacherDashboard({ user }: { user: any }) {
  const { t, d, isBangla } = useLanguage();
  // 1. Fetch Teacher info
  const { data: teacher } = useQuery({
    queryKey: ['teacher_me_data'],
    queryFn: async () => {
      const res = await api.get('/api/teachers/me/');
      return res.data;
    }
  });

  // 2. Fetch pending student leaves count
  const { data: pendingLeaves = [] } = useQuery({
    queryKey: ['teacher_pending_leaves_count'],
    queryFn: async () => {
      const res = await api.get('/api/students/leaves/?status=pending');
      return res.data;
    }
  });

  const TEACHER_CLASSES = isBangla ? [
    { time: 'সকাল ৮:০০ - ৮:৪৫', subject: 'হিফজুল কুরআন (নতুন সবক)', section: 'হিফজ ৩য় তলা', count: 28, isNext: true },
    { time: 'সকাল ৯:০০ - ৯:৪৫', subject: 'কুরআন তাজবিদ ও সিফাত', section: 'নাজেরা শাখা খ', count: 25, isNext: false },
    { time: 'সকাল ১০:১৫ - ১১:০০', subject: 'আরবি ভাষা ও ব্যাকরণ (নাহু)', section: 'কিতাব ১ম বর্ষ', count: 22, isNext: false },
    { time: 'যোহরের পর - ৩:০০', subject: 'আমপারা ও সবক দোহর', section: 'হিফজ ৩য় তলা', count: 28, isNext: false },
  ] : [
    { time: '8:00 AM - 8:45 AM', subject: 'Hifzul Quran (New Sabaq)', section: 'Hifz 3rd Floor', count: 28, isNext: true },
    { time: '9:00 AM - 9:45 AM', subject: 'Quran Tajweed & Sifat', section: 'Nazera Sec B', count: 25, isNext: false },
    { time: '10:15 AM - 11:00 AM', subject: 'Arabic Grammar (Nahw)', section: 'Kitab 1st Year', count: 22, isNext: false },
    { time: 'Post-Zuhr - 3:00 PM', subject: 'Ampara & Revision', section: 'Hifz 3rd Floor', count: 28, isNext: false },
  ];

  return (
    <div className="space-y-6">
      
      {/* Teacher Profile Card */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl p-1 bg-gradient-to-tr from-amber-400 to-emerald-600 shadow-md shrink-0">
            <img
              src="/principal.jpg"
              alt={teacher?.name || user.name}
              className="w-full h-full object-cover rounded-xl bg-white"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-mono font-bold text-xs">
                {teacher?.teacher_id || 'TCH-001'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 font-bold text-xs">
                {isBangla ? (teacher?.designation_bn || 'সিনিয়র শিক্ষক') : (teacher?.designation || 'Senior Teacher')}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
              {isBangla ? (teacher?.name_bn || user.name_bn || user.name) : (teacher?.name || user.name || user.name_bn)}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              {isBangla ? 'মোবাইল: ' : 'Phone: '}
              <span className="font-mono">{isBangla ? toBanglaDigit(teacher?.phone || user.phone) : (teacher?.phone || user.phone)}</span>
              {' '}• {isBangla ? 'যোগদানের তারিখ: ' : 'Joining Date: '}
              {isBangla ? (teacher?.joining_date || '০১ জানুয়ারি ২০২৪') : (teacher?.joining_date || '01 Jan 2024')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Link
            href="/attendance"
            className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-md transition"
          >
            <UserCheck size={16} className="text-amber-300" />
            <span>{isBangla ? 'আজকের হাজিরা নিন' : 'Take Attendance'}</span>
          </Link>
          <Link
            href="/teachers"
            className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm transition"
          >
            <FileText size={16} />
            <span>{isBangla ? 'সার্ভিস বুক' : 'Service Book'}</span>
          </Link>
        </div>
      </div>

      {/* 4 Bento Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 font-bold">{isBangla ? 'আজকের ক্লাস' : "Today's Classes"}</span>
            <span className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock size={16} />
            </span>
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white font-mono">
            {isBangla ? `${toBanglaDigit(TEACHER_CLASSES.length)} টি` : `${TEACHER_CLASSES.length} Classes`}
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">
            {isBangla ? 'সর্বমোট ৪টি নির্ধারিত পিরিয়ড' : 'Total 4 scheduled periods'}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 font-bold">{isBangla ? 'নিজের হাজিরা' : 'My Attendance'}</span>
            <span className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 size={16} />
            </span>
          </div>
          <h3 className="text-2xl font-black text-emerald-700 font-mono">
            {isBangla ? 'উপস্থিত ✓' : 'Present ✓'}
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">
            {isBangla ? 'ইন টাইম: সকাল ৭:৪৫ মি.' : 'In Time: 7:45 AM'}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 font-bold">{isBangla ? 'মাসিক বেতন' : 'Monthly Salary'}</span>
            <span className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
              <DollarSign size={16} />
            </span>
          </div>
          <h3 className="text-2xl font-black text-emerald-900 dark:text-emerald-400 font-mono">
            ৳ {isBangla 
                ? toBanglaDigit(Number(teacher?.monthly_salary || 25000).toLocaleString('en-IN'))
                : Number(teacher?.monthly_salary || 25000).toLocaleString('en-US')}
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">
            {isBangla ? 'পরিশোধিত • পে-স্লিপ দেখুন' : 'Disbursed • View Pay Slip'}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 font-bold">{isBangla ? 'ছুটির আবেদন' : 'Leave Requests'}</span>
            <span className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertCircle size={16} />
            </span>
          </div>
          <h3 className="text-2xl font-black text-rose-600 font-mono">
            {isBangla 
              ? `${toBanglaDigit(pendingLeaves.length)} টি অপেক্ষমাণ`
              : `${pendingLeaves.length} Pending`}
          </h3>
          <Link href="/students/leaves" className="text-[11px] text-emerald-700 font-bold mt-1 inline-block hover:underline">
            {isBangla ? 'রিভিউ করতে ক্লিক করুন →' : 'Click to review →'}
          </Link>
        </div>

      </div>

      {/* Two Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Today's Assigned Classes */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-700" />
                <span>{isBangla ? 'আজকের ক্লাস রুটিন ও হাজিরা তালিকা' : "Today's Class Routine & Attendance"}</span>
              </h3>
              <p className="text-xs text-slate-500">
                {isBangla ? 'আপনার আজকের নির্ধারিত পাঠদান ও সরাসরি হাজিরা গ্রহণ' : 'Your daily class schedule and direct attendance'}
              </p>
            </div>
            <Link
              href="/attendance"
              className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
            >
              <span>{isBangla ? 'সকল হাজিরা' : 'All Attendance'}</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="space-y-3">
            {TEACHER_CLASSES.map((cls, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-emerald-300 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 font-mono font-bold flex items-center justify-center text-xs shrink-0">
                    {isBangla ? toBanglaDigit(idx + 1) : idx + 1}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{cls.subject}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {cls.section} • {isBangla ? 'শিক্ষার্থী: ' : 'Students: '}
                      <strong className="text-slate-700 dark:text-slate-300">
                        {isBangla ? `${toBanglaDigit(cls.count)} জন` : `${cls.count} enrolled`}
                      </strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-200">
                    {cls.time}
                  </span>
                  <Link
                    href="/attendance"
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm transition"
                  >
                    {isBangla ? 'হাজিরা নিন' : 'Take Attendance'}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Quick Action Tools */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
            <Sparkles size={16} className="text-amber-500" />
            <span>{isBangla ? 'শিক্ষক কুইক টুলস' : 'Teacher Quick Tools'}</span>
          </h3>

          <div className="space-y-2">
            <Link
              href="/attendance"
              className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-800 transition"
            >
              <span className="flex items-center gap-2.5">
                <UserCheck size={18} className="text-blue-600" />
                <span>{isBangla ? 'দৈনিক ক্লাস হাজিরা' : 'Daily Class Attendance'}</span>
              </span>
              <ChevronRight size={14} className="text-slate-400" />
            </Link>

            <Link
              href="/exams"
              className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-800 transition"
            >
              <span className="flex items-center gap-2.5">
                <FileText size={18} className="text-purple-600" />
                <span>{isBangla ? 'পরীক্ষার নম্বর ও গ্রেড এন্ট্রি' : 'Exam Marks & Grade Entry'}</span>
              </span>
              <ChevronRight size={14} className="text-slate-400" />
            </Link>

            <Link
              href="/students/leaves"
              className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-800 transition"
            >
              <span className="flex items-center gap-2.5">
                <ShieldCheck size={18} className="text-emerald-600" />
                <span>{isBangla ? 'ছুটি রিভিউ ও গেটপাস অনুমোদন' : 'Leave Review & Gatepass Approval'}</span>
              </span>
              {pendingLeaves.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                  {isBangla ? toBanglaDigit(pendingLeaves.length) : pendingLeaves.length}
                </span>
              )}
            </Link>

            <Link
              href="/students"
              className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-800 transition"
            >
              <span className="flex items-center gap-2.5">
                <Users size={18} className="text-teal-600" />
                <span>{isBangla ? 'শিক্ষার্থী তালিকা ও যোগাযোগ' : 'Student List & Contact'}</span>
              </span>
              <ChevronRight size={14} className="text-slate-400" />
            </Link>

            <Link
              href="/notices/add"
              className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-800 transition"
            >
              <span className="flex items-center gap-2.5">
                <Bell size={18} className="text-amber-600" />
                <span>{isBangla ? 'বিজ্ঞপ্তি বা নোটিশ প্রকাশ' : 'Publish Notice'}</span>
              </span>
              <ChevronRight size={14} className="text-slate-400" />
            </Link>

            <Link
              href="/teachers"
              className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-800 transition"
            >
              <span className="flex items-center gap-2.5">
                <Award size={18} className="text-rose-600" />
                <span>{isBangla ? 'নিজের সার্ভিস খাতা ও বেতন স্লিপ' : 'Service Book & Pay Slip'}</span>
              </span>
              <ChevronRight size={14} className="text-slate-400" />
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
}

function StaffDashboard({ user }: { user: any }) {
  const { t, d, isBangla } = useLanguage();
  const { data: dashboardData } = useQuery({
    queryKey: ['staff_dashboard_stats'],
    queryFn: async () => {
      const res = await api.get('/api/reports/dashboard/');
      return res.data;
    }
  });

  const { data: pendingLeaves = [] } = useQuery({
    queryKey: ['staff_pending_leaves_count'],
    queryFn: async () => {
      const res = await api.get('/api/students/leaves/?status=pending');
      return res.data;
    }
  });

  return (
    <div className="space-y-6">
      
      {/* Staff Profile Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl p-1 bg-gradient-to-tr from-amber-400 to-indigo-600 shadow-md shrink-0">
            <img
              src="/principal.jpg"
              alt={user.name}
              className="w-full h-full object-cover rounded-xl bg-white"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-900 font-mono font-bold text-xs">
                {user.user_id || 'STF-001'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-bold text-xs">
                {isBangla ? 'অফিস সহকারী ও ক্যাশিয়ার' : 'Office Assistant & Cashier'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
              {isBangla ? (user.name_bn || user.name) : (user.name || user.name_bn)}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              {isBangla ? 'মাদ্রাসার প্রশাসনিক অফিস ও ক্যাশ কাউন্টার ম্যানেজমেন্ট' : 'Administrative Office & Cash Counter Management'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Link
            href="/fees"
            className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-md transition"
          >
            <DollarSign size={16} className="text-amber-300" />
            <span>{isBangla ? 'কাউন্টার ফি আদায়' : 'Counter Collection'}</span>
          </Link>
          <Link
            href="/students/add"
            className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition"
          >
            <UserPlus size={16} />
            <span>{isBangla ? 'নতুন ভর্তি' : 'New Admission'}</span>
          </Link>
        </div>
      </div>

      {/* 4 Bento Operational Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 font-bold">{isBangla ? 'আজকের ফি কালেকশন' : "Today's Collection"}</span>
            <span className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign size={16} />
            </span>
          </div>
          <h3 className="text-2xl font-black text-emerald-800 font-mono">
            ৳ {isBangla 
                ? toBanglaDigit(Number(dashboardData?.finances?.total_collected || 18500).toLocaleString('en-IN'))
                : Number(dashboardData?.finances?.total_collected || 18500).toLocaleString('en-US')}
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">{isBangla ? 'কাউন্টার ও বিকাশ রসিদ' : 'Counter & bKash Receipts'}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 font-bold">{isBangla ? 'নতুন ভর্তি আবেদন' : 'Admission Applications'}</span>
            <span className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <UserPlus size={16} />
            </span>
          </div>
          <h3 className="text-2xl font-black text-blue-700 font-mono">
            {isBangla ? `${toBanglaDigit(dashboardData?.students?.total_students || 13)} জন` : `${dashboardData?.students?.total_students || 13} Students`}
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">{isBangla ? 'সেশন ২০২৭ কার্যক্রম চলমান' : 'Session 2027 ongoing'}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 font-bold">{isBangla ? 'ছাত্র উপস্থিতি হার' : 'Student Attendance Rate'}</span>
            <span className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
              <UserCheck size={16} />
            </span>
          </div>
          <h3 className="text-2xl font-black text-amber-600 font-mono">
            {isBangla ? toBanglaDigit(dashboardData?.attendance?.rate || 94.2) : (dashboardData?.attendance?.rate || 94.2)}%
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">{isBangla ? 'আজকের বায়োমেট্রিক রেকর্ড' : "Today's Biometric Record"}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 font-bold">{isBangla ? 'গেটপাস ও ক্লিয়ারেন্স' : 'Gatepass & Clearance'}</span>
            <span className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
              <ShieldCheck size={16} />
            </span>
          </div>
          <h3 className="text-2xl font-black text-purple-700 font-mono">
            {isBangla ? `${toBanglaDigit(pendingLeaves.length)} টি অপেক্ষমাণ` : `${pendingLeaves.length} Pending`}
          </h3>
          <Link href="/students/leaves" className="text-[11px] text-emerald-700 font-bold mt-1 inline-block hover:underline">
            {isBangla ? 'গেট রেজিস্টার দেখুন →' : 'View Gate Register →'}
          </Link>
        </div>

      </div>

      {/* Staff Quick Action Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <QuickAction href="/fees" icon={<DollarSign size={22} />} title={isBangla ? "কাউন্টার ফি আদায়" : "Counter Fee Collection"} desc={isBangla ? "ক্যাশ ও বিকাশ রসিদ" : "Cash & bKash Receipts"} color="emerald" />
        <QuickAction href="/students/add" icon={<UserPlus size={22} />} title={isBangla ? "নতুন ছাত্র ভর্তি" : "New Student Admission"} desc={isBangla ? "অফিসিয়াল ভর্তি ফর্ম" : "Official Admission Form"} color="amber" />
        <QuickAction href="/students/id-cards" icon={<Printer size={22} />} title={isBangla ? "আইডি কার্ড প্রিন্ট" : "Print ID Card"} desc={isBangla ? "পিভিসি আইডি কার্ড" : "PVC ID Card"} color="purple" />
        <QuickAction href="/reports" icon={<FileText size={22} />} title={isBangla ? "ক্যাশ খাতা ও রিপোর্ট" : "Cash Book & Reports"} desc={isBangla ? "দৈনিক আয়-ব্যয়" : "Daily Income-Expense"} color="blue" />
      </div>

    </div>
  );
}


function QuickAction({ 
  href, 
  icon, 
  title, 
  desc, 
  color = 'emerald' 
}: { 
  href: string; 
  icon: React.ReactNode; 
  title: string; 
  desc?: string;
  color?: string;
}) {
  const colorMap: Record<string, { bg: string; text: string; border: string }> = {
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'hover:border-emerald-300' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'hover:border-blue-300' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'hover:border-amber-300' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'hover:border-purple-300' },
    rose: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'hover:border-rose-300' },
    cyan: { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'hover:border-cyan-300' },
  };

  const style = colorMap[color] || colorMap.emerald;

  return (
    <Link 
      href={href} 
      className={`flex flex-col justify-between p-4 bg-white rounded-2xl border border-gray-100 ${style.border} shadow-sm hover:shadow-md transition-all duration-300 group`}
    >
      <div className={`w-10 h-10 rounded-xl ${style.bg} ${style.text} flex items-center justify-center mb-3 transition-transform group-hover:scale-110`}>
        {icon}
      </div>
      <div>
        <h5 className="font-bold text-sm text-gray-800 group-hover:text-emerald-700 transition-colors">
          {title}
        </h5>
        {desc && <p className="text-[11px] text-gray-400 mt-0.5">{desc}</p>}
      </div>
    </Link>
  );
}
