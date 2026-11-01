/* eslint-disable */
'use client';

import { useState, useMemo } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { 
  MessageSquare, Send, Search, CheckCircle2, AlertCircle, Clock, 
  RefreshCw, Sparkles, User, Phone, ExternalLink, ShieldCheck, 
  Layers, Filter, Copy, FileText, Smartphone, Radio, Megaphone, Users
} from 'lucide-react';
import { toBanglaDigit } from '@/lib/numberToBanglaWords';

const PRESET_TEMPLATES = [
  {
    id: 'fee_reminder',
    name: 'বকেয়া বেতন পরিশোধের তাগাদা',
    image: '/images/awards-crests.png',
    type: 'fee_reminder',
    title: 'বকেয়া ফি পরিশোধের তাগাদা',
    template: (s: any) => 
      `আস-সালামু আলাইকুম!\n*আল-মদিনা মডেল মাদ্রাসা এন্ড রিসার্চ ইনস্টিটিউট*\nক-৭৫/২, মহাখালী দক্ষিণপাড়া, বনানী, ঢাকা\n\nসম্মানিত অভিভাবক,\nআপনার সন্তান *${s?.name_bn || 'শিক্ষার্থী'}* এর চলতি মাসের নির্ধারিত ফি বকেয়া রয়েছে। মাদ্রাসার সুষ্ঠু শিক্ষা কার্যক্রম অব্যাহত রাখতে দ্রুত পরিশোধের অনুরোধ করা হলো।\n\nযোগাযোগ ও হেল্পলাইন: ০১৭১২-৬৩৩২৬৪\nজাযাকাল্লাহু খাইরান।`
  },
  {
    id: 'guardians_meeting',
    name: 'অভিভাবক সমাবেশ সংক্রান্ত বিজ্ঞপ্তি',
    image: '/images/guardians-meeting-1.png',
    type: 'notice',
    title: 'মাসিক অভিভাবক সমাবেশ',
    template: (s: any) => 
      `আস-সালামু আলাইকুম!\n*আল-মদিনা মডেল মাদ্রাসা এন্ড রিসার্চ ইনস্টিটিউট*\n\nসম্মানিত অভিভাবকবৃন্দ,\nশিক্ষার্থীদের পড়ালেখার মানোন্নয়ন ও সার্বিক অগ্রগতি নিয়ে আলোচনার জন্য আগামী শুক্রবার সকাল ১০:০০ ঘটিকায় মাদ্রাসার কনফারেন্স কক্ষে মাসিক Guardians Meeting অনুষ্ঠিত হবে। অধ্যক্ষ মাওলানা ওমর ফারুক মুজাহিদী সরাসরি উপস্থিত থাকবেন। আপনার উপস্থিতি একান্ত কাম্য।\n\nঠিকানা: ক-৭৫/২, মহাখালী দক্ষিণপাড়া, বনানী, ঢাকা।\nমোবাইল: ০১৭১২-৬৩৩২৬৪`
  },
  {
    id: 'hifz_evaluation',
    name: 'হিফজুল কুরআন সাপ্তাহিক শুনানি',
    image: '/images/quran-class.png',
    type: 'notice',
    title: 'হিফজুল কুরআন সাপ্তাহিক শুনানি',
    template: (s: any) => 
      `আস-সালামু আলাইকুম!\n*আল-মদিনা মডেল মাদ্রাসা এন্ড রিসার্চ ইনস্টিটিউট*\n\nহিফজুল কুরআন বিভাগের সম্মানিত অভিভাবকবৃন্দ,\nআগামী শনিবার সকাল ৯:০০ ঘটিকা থেকে সকল শিক্ষার্থীর সাপ্তাহিক সবক ও শুনানি অনুষ্ঠিত হবে। আপনার সন্তান *${s?.name_bn || 'শিক্ষার্থী'}* কে নির্ধারিত পারার পূর্ণ প্রস্তুতি নিয়ে উপস্থিত থাকার তাগিদ দেওয়ার অনুরোধ করা হলো।\n\nজাযাকাল্লাহু খাইরান।`
  },
  {
    id: 'vacation_notice',
    name: 'মাদ্রাসা ছুটি ও বন্ধের নোটিশ',
    image: '/images/principal-class.png',
    type: 'notice',
    title: 'মাদ্রাসা ছুটি সংক্রান্ত নোটিশ',
    template: (s: any) => 
      `আস-সালামু আলাইকুম!\n*আল-মদিনা মডেল মাদ্রাসা এন্ড রিসার্চ ইনস্টিটিউট*\n\nসকল সম্মানিত অভিভাবক ও শুভানুধ্যায়ীদের অবগতির জন্য জানানো যাচ্ছে যে, আগামী রবিবার মাদ্রাসার সকল পাঠদান ও দাপ্তরিক কার্যক্রম বন্ধ থাকবে। পরবর্তী সোমবার থেকে যথারীতি সময়সূচি অনুযায়ী ক্লাস চলবে।\n\nহেল্পলাইন: ০১৭১২-৬৩৩২৬৪`
  },
  {
    id: 'custom',
    name: 'কাস্টম বার্তা লিখুন',
    image: null,
    type: 'custom',
    title: 'জরুরি বিজ্ঞপ্তি',
    template: () => ''
  }
];

const BROADCAST_TEMPLATES = [
  {
    id: 'holiday',
    name: '🏖️ ছুটি ও বন্ধের নোটিশ',
    type: 'holiday',
    title: 'মাদ্রাসা বন্ধ ও ছুটির জরুরি নোটিশ',
    text: `আস-সালামু আলাইকুম।
*আল-মদিনা মডেল মাদ্রাসা এন্ড রিসার্চ ইনস্টিটিউট*
ক-৭৫/২, মহাখালী দক্ষিণপাড়া, বনানী, ঢাকা-১২১২

সম্মানিত অভিভাবক,
আগামী রবিবার মাদ্রাসার সকল পাঠদান ও দাপ্তরিক কার্যক্রম বন্ধ থাকবে। পরবর্তী সোমবার থেকে যথারীতি সময়সূচি অনুযায়ী ক্লাস শুরু হবে ইনশাআল্লাহ।

আপনার সন্তান {শিক্ষার্থী}-কে ছুটির দিনগুলোতে নিয়মিত ৫ ওয়াক্ত নামাজ আদায় ও হিফজের সবক রিভিশন নিশ্চিত করার জন্য বিশেষ অনুরোধ করা হলো।

— অধ্যক্ষ মাওলানা ওমর ফারুক মুজাহিদী
জরুরি হেল্পলাইন: ০১৭১২-৬৩৩২৬৪`
  },
  {
    id: 'exam_admit',
    name: '📝 পরীক্ষার রুটিন ও প্রবেশপত্র',
    type: 'exam',
    title: 'টার্ম পরীক্ষার সময়সূচি ও প্রবেশপত্র সংক্রান্ত নোটিশ',
    text: `আস-সালামু আলাইকুম।
*আল-মদিনা মডেল মাদ্রাসা এন্ড রিসার্চ ইনস্টিটিউট*

সম্মানিত অভিভাবক,
অত্র মাদ্রাসার আগামী টার্ম পরীক্ষা নির্ধারিত সময়সূচি অনুযায়ী শুরু হতে যাচ্ছে। আপনার সন্তান {শিক্ষার্থী} (রোল: {রোল})-এর সকল প্রকার বকেয়া বেতন ও ফি পরিশোধপূর্বক অফিস কক্ষ হতে প্রবেশপত্র (Admit Card) সংগ্রহ করার জন্য বিনীত অনুরোধ করা হলো।

পরীক্ষার পূর্ণাঙ্গ রুটিন মাদ্রাসার নোটিশ বোর্ডে ও শিক্ষার্থী পোর্টালে প্রকাশ করা হয়েছে।

— পরীক্ষা নিয়ন্ত্রক ও মেধা কমিটি
আল-মদিনা মডেল মাদ্রাসা এন্ড রিসার্চ ইনস্টিটিউট
মোবাইল: ০১৭১২-৬৩৩২৬৪`
  },
  {
    id: 'guardian_meeting',
    name: '🤝 মাসিক অভিভাবক সমাবেশ',
    type: 'event',
    title: 'মাসিক অভিভাবক সমাবেশ ও মতবিনিময় সভা',
    text: `আস-সালামু আলাইকুম!
*আল-মদিনা মডেল মাদ্রাসা এন্ড রিসার্চ ইনস্টিটিউট*

সম্মানিত অভিভাবক,
আপনার সন্তান {শিক্ষার্থী}-এর দ্বীনি চরিত্র গঠন, পরীক্ষার ফলাফল ও হিফজুল কুরআনের সার্বিক অগ্রগতি পর্যালোচনার লক্ষ্যে আগামী শুক্রবার সকাল ১০:০০ ঘটিকায় মাদ্রাসার কনফারেন্স কক্ষে 'অভিভাবক সমাবেশ' অনুষ্ঠিত হবে। 

উক্ত সভায় অধ্যক্ষ মাওলানা ওমর ফারুক মুজাহিদী সরাসরি উপস্থিত থেকে দিকনির্দেশনামূলক নসীহত পেশ করবেন। আপনার উপস্থিতি মাদ্রাসার উন্নয়নে একান্ত কাম্য।

স্থান: ক-৭৫/২, মহাখালী দক্ষিণপাড়া, বনানী, ঢাকা।
হেল্পলাইন: ০১৭১২-৬৩৩২৬৪`
  },
  {
    id: 'emergency_weather',
    name: '⚠️ জরুরি দুর্যোগ বা আবহাওয়া ছুটি',
    type: 'notice',
    title: 'জরুরি পরিস্থিতি ও পাঠদান স্থগিতের নোটিশ',
    text: `জরুরি বিজ্ঞপ্তি:
*আল-মদিনা মডেল মাদ্রাসা এন্ড রিসার্চ ইনস্টিটিউট*

সম্মানিত অভিভাবকবৃন্দ,
অনিবার্য কারণ ও বৈরী আবহাওয়াজনিত কারণে আজ মাদ্রাসার সকল অনাবাসিক শ্রেণি কার্যক্রম সাময়িকভাবে স্থগিত ঘোষণা করা হলো। আবাসিক শিক্ষার্থীদের হিফজ ও অভ্যন্তরীণ তালিম যথারীতি চলবে। পরিস্থিতি স্বাভাবিক হলে আগামী কাল থেকে নিয়মিত ক্লাস অনুষ্ঠিত হবে।

— প্রশাসন, আল-মদিনা মডেল মাদ্রাসা
যোগাযোগ: ০১৭১২-৬৩৩২৬৪`
  },
  {
    id: 'annual_program',
    name: '🕌 বার্ষিক মেধা পুরস্কার ও দোয়া',
    type: 'event',
    title: 'বার্ষিক মেধা পুরস্কার বিতরণ ও খতমে কুরআন মাহফিল',
    text: `আস-সালামু আলাইকুম।
*আল-মদিনা মডেল মাদ্রাসা এন্ড রিসার্চ ইনস্টিটিউট*

সম্মানিত অভিভাবক,
অত্র মাদ্রাসার বার্ষিক মেধা তালিকায় উত্তীর্ণ কৃতি শিক্ষার্থীদের সম্মাননা ক্রেস্ট ও সনদপত্র প্রদান এবং দোয়া মাহফিল আগামী শনিবার সকাল ৯:৩০ মিনিটে অনুষ্ঠিত হবে। 

আপনার সন্তান {শিক্ষার্থী}-এর অর্জিত মেধার আনন্দঘন মুহূর্তে আপনি সপরিবারে আমন্ত্রিত।

— অধ্যক্ষ ও শায়খুল হাদিস মাওলানা ওমর ফারুক মুজাহিদী`
  },
  {
    id: 'custom',
    name: '✏️ কাস্টম নোটিশ তৈরি করুন',
    type: 'custom',
    title: 'জরুরি প্রাতিষ্ঠানিক বিজ্ঞপ্তি',
    text: ''
  }
];

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'broadcast' | 'logs' | 'send' | 'gateway'>('broadcast');

  // Bulk Broadcast State
  const [broadcastAudience, setBroadcastAudience] = useState<'all' | 'department' | 'hostel' | 'daycare' | 'teachers'>('all');
  const [broadcastDeptId, setBroadcastDeptId] = useState<string>('');
  const [broadcastChannel, setBroadcastChannel] = useState<'whatsapp' | 'sms' | 'both'>('whatsapp');
  const [broadcastType, setBroadcastType] = useState<string>('holiday');
  const [broadcastTitle, setBroadcastTitle] = useState<string>('মাদ্রাসা বন্ধ ও ছুটির জরুরি নোটিশ');
  const [broadcastMessage, setBroadcastMessage] = useState<string>(BROADCAST_TEMPLATES[0].text);
  const [broadcastSelectedTplId, setBroadcastSelectedTplId] = useState<string>('holiday');
  const [broadcastResult, setBroadcastResult] = useState<any | null>(null);

  // Send Form State
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [phone, setPhone] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [title, setTitle] = useState('জরুরি প্রাতিষ্ঠানিক বার্তা');
  const [message, setMessage] = useState('');
  const [channel, setChannel] = useState<'whatsapp' | 'sms'>('whatsapp');
  const [selectedTemplateId, setSelectedTemplateId] = useState('fee_reminder');

  // Logs Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  // 1. Fetch Students
  const { data: students = [] } = useQuery({
    queryKey: ['students-for-notifications'],
    queryFn: async () => {
      const res = await api.get('/api/students/');
      return res.data;
    }
  });

  // 2. Fetch Notification Logs
  const { data: logs = [], isLoading: isLogsLoading } = useQuery({
    queryKey: ['notification-logs'],
    queryFn: async () => {
      const res = await api.get('/api/notifications/logs/');
      return res.data;
    }
  });

  // 3. Fetch Gateway Status
  const { data: gatewayStatus, isLoading: isGatewayLoading } = useQuery({
    queryKey: ['notification-gateway-status'],
    queryFn: async () => {
      const res = await api.get('/api/notifications/gateway-status/');
      return res.data;
    }
  });

  // 4. Fetch Departments
  const { data: departments = [] } = useQuery({
    queryKey: ['departments-for-notifications'],
    queryFn: async () => {
      const res = await api.get('/api/students/departments/');
      return res.data;
    }
  });

  // 5. Fetch Teachers
  const { data: teachers = [] } = useQuery({
    queryKey: ['teachers-for-notifications'],
    queryFn: async () => {
      const res = await api.get('/api/teachers/');
      return res.data;
    }
  });

  // Broadcast Mutation
  const broadcastMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post('/api/notifications/broadcast/', payload);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'বাল্ক নোটিশ সফলভাবে সম্পন্ন হয়েছে!');
      setBroadcastResult(data);
      queryClient.invalidateQueries({ queryKey: ['notification-logs'] });
      queryClient.invalidateQueries({ queryKey: ['notification-gateway-status'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'বাল্ক নোটিশ পাঠাতে সমস্যা হয়েছে।');
    }
  });

  const handleSelectBroadcastTemplate = (tplId: string) => {
    setBroadcastSelectedTplId(tplId);
    const tpl = BROADCAST_TEMPLATES.find(t => t.id === tplId);
    if (tpl) {
      setBroadcastTitle(tpl.title);
      setBroadcastType(tpl.type);
      if (tpl.id !== 'custom') {
        setBroadcastMessage(tpl.text);
      }
    }
  };

  const handleInsertVariable = (variable: string) => {
    setBroadcastMessage(prev => prev + variable);
  };

  const handleBroadcastSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) {
      toast.error('নোটিশের মেসেজ প্রদান করুন');
      return;
    }

    if (!confirm('আপনি কি নিশ্চিত যে এই নোটিশটি নির্বাচিত সকল প্রাপকের মোবাইলে পাঠাতে চান?')) {
      return;
    }

    broadcastMutation.mutate({
      target_audience: broadcastAudience,
      department_id: broadcastDeptId || null,
      channel: broadcastChannel,
      notification_type: broadcastType,
      title: broadcastTitle,
      message: broadcastMessage,
    });
  };

  // Handle template selection
  const handleSelectTemplate = (tplId: string) => {
    setSelectedTemplateId(tplId);
    const tpl = PRESET_TEMPLATES.find(t => t.id === tplId);
    if (tpl) {
      setTitle(tpl.title);
      if (tpl.id !== 'custom') {
        setMessage(tpl.template(selectedStudent));
      }
    }
  };

  // Handle Student Selection
  const handleSelectStudent = (student: any) => {
    setSelectedStudent(student);
    setPhone(student.guardian_phone || '');
    setRecipientName(student.guardian_name || student.father_name_bn || '');

    const tpl = PRESET_TEMPLATES.find(t => t.id === selectedTemplateId);
    if (tpl && tpl.id !== 'custom') {
      setMessage(tpl.template(student));
    }
  };

  // Send Custom Notification Mutation
  const sendMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post('/api/notifications/send-custom/', payload);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'নোটিফিকেশন সফলভাবে সম্পন্ন হয়েছে!');
      queryClient.invalidateQueries({ queryKey: ['notification-logs'] });
      queryClient.invalidateQueries({ queryKey: ['notification-gateway-status'] });

      // Automatically open direct WhatsApp window if available
      if (data.wa_direct_link) {
        window.open(data.wa_direct_link, '_blank');
      }

      // Reset
      setActiveTab('logs');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || 'বার্তা পাঠাতে ব্যর্থ হয়েছে।');
    }
  });

  // Resend Mutation
  const resendMutation = useMutation({
    mutationFn: async (logId: number) => {
      const res = await api.post(`/api/notifications/resend/${logId}/`);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success('নোটিফিকেশন পুনরায় প্রক্রিয়াকরণ করা হয়েছে!');
      queryClient.invalidateQueries({ queryKey: ['notification-logs'] });
      if (data.wa_direct_link) {
        window.open(data.wa_direct_link, '_blank');
      }
    }
  });

  const handleSendSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      toast.error('প্রাপকের মোবাইল নম্বর প্রদান করুন');
      return;
    }
    if (!message.trim()) {
      toast.error('বার্তার বিবরণ লিখুন');
      return;
    }

    sendMutation.mutate({
      recipient_phone: phone,
      recipient_name: recipientName,
      student_id: selectedStudent?.student_id || null,
      channel: channel,
      title: title,
      message: message,
      notification_type: selectedTemplateId === 'custom' ? 'custom' : (PRESET_TEMPLATES.find(t => t.id === selectedTemplateId)?.type || 'custom')
    });
  };

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    return logs.filter((l: any) => {
      const matchesSearch = !searchQuery.trim() || 
        l.recipient_phone?.includes(searchQuery) ||
        l.recipient_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.student_name_bn?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.title?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = typeFilter === 'all' || l.notification_type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [logs, searchQuery, typeFilter]);

  return (
    <AppLayout title="হোয়াটসঅ্যাপ ও এসএমএস অটোমেশন">
      <div className="space-y-6">
        
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-[#02200d] text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden border border-emerald-500/20">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-semibold mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>আল-মদিনা মডেল মাদ্রাসা এন্ড রিসার্চ ইনস্টিটিউট</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                স্মার্ট হোয়াটসঅ্যাপ ও এসএমএস নোটিফিকেশন সেন্টার
              </h1>
              <p className="text-emerald-200/80 text-xs sm:text-sm mt-1 max-w-2xl">
                ভর্তি নিশ্চিতকরণ, ডিজিটাল মানি রিসিট, পরীক্ষার ফলাফল ও অনুপস্থিতির নোটিফিকেশন স্বয়ংক্রিয়ভাবে অভিভাবকদের কাছে পৌঁছানোর সম্পূর্ণ লাইভ সিস্টেম।
              </p>
            </div>

            {/* Quick Tabs & Status Indicator */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="flex flex-wrap bg-black/40 p-1 rounded-2xl border border-white/10 backdrop-blur-md">
                <button
                  onClick={() => setActiveTab('broadcast')}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    activeTab === 'broadcast'
                      ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-emerald-950 shadow-md'
                      : 'text-emerald-200 hover:text-white'
                  }`}
                >
                  <Megaphone className="w-4 h-4" />
                  <span>📢 বাল্ক নোটিশ ব্রডকাস্ট</span>
                </button>
                <button
                  onClick={() => setActiveTab('logs')}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    activeTab === 'logs'
                      ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-emerald-950 shadow-md'
                      : 'text-emerald-200 hover:text-white'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  <span>অ্যাক্টিভিটি লগ ({toBanglaDigit(logs.length)})</span>
                </button>
                <button
                  onClick={() => setActiveTab('send')}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    activeTab === 'send'
                      ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-emerald-950 shadow-md'
                      : 'text-emerald-200 hover:text-white'
                  }`}
                >
                  <Send className="w-4 h-4" />
                  <span>একক মেসেজ</span>
                </button>
                <button
                  onClick={() => setActiveTab('gateway')}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    activeTab === 'gateway'
                      ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-emerald-950 shadow-md'
                      : 'text-emerald-200 hover:text-white'
                  }`}
                >
                  <Radio className="w-4 h-4" />
                  <span>গেটওয়ে</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* TAB 0: BULK NOTIFICATION & SMS BROADCAST */}
        {activeTab === 'broadcast' && (
          <div className="space-y-6">
            
            {/* Broadcast Results Card (if just submitted) */}
            {broadcastResult && (
              <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-[#02200d] text-white p-6 rounded-3xl shadow-xl border border-emerald-500/30 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-400 text-emerald-950 flex items-center justify-center font-bold">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base text-white">বাল্ক নোটিশ সফলভাবে প্রসেস করা হয়েছে!</h3>
                      <p className="text-xs text-emerald-300">
                        মোট প্রাপক: {toBanglaDigit(broadcastResult.total_targeted || 0)} জন • সরাসরি প্রেরিত: {toBanglaDigit(broadcastResult.sent_count || 0)} জন • সিস্টেমে সংরক্ষিত: {toBanglaDigit(broadcastResult.queued_count || 0)} জন
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setBroadcastResult(null)}
                    className="text-xs text-emerald-300 hover:text-white px-3 py-1 rounded-lg bg-white/10"
                  >
                    বন্ধ করুন
                  </button>
                </div>

                {/* Direct Dispatch Links Grid */}
                {broadcastResult.direct_links && broadcastResult.direct_links.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
                    <span className="text-xs font-bold text-amber-300 block">
                      সরাসরি এক-ক্লিকে WhatsApp-এ ওপেন করুন:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {broadcastResult.direct_links.map((link: any, lIdx: number) => (
                        <div key={lIdx} className="bg-white/10 p-2.5 rounded-xl border border-white/10 flex items-center justify-between text-xs">
                          <div className="truncate mr-2">
                            <span className="font-bold text-white block truncate">{link.student_name}</span>
                            <span className="text-[11px] font-mono text-emerald-300">{toBanglaDigit(link.phone)}</span>
                          </div>
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold rounded-lg text-[10px] flex items-center gap-1 shrink-0"
                          >
                            <span>WhatsApp</span>
                            <ExternalLink size={10} />
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Main Broadcast Control Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Target Audience, Templates & Composer (7 cols) */}
              <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200/80 space-y-6">
                
                {/* 1. Target Audience Selection */}
                <div>
                  <label className="text-xs font-extrabold text-gray-800 uppercase tracking-wider block mb-3 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-emerald-700" />
                    <span>১. নোটিশের প্রাপক নির্ধারণ করুন (Target Audience)</span>
                  </label>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setBroadcastAudience('all')}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        broadcastAudience === 'all'
                          ? 'border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                      }`}
                    >
                      <span className="text-sm font-bold text-gray-900 block">সকল শিক্ষার্থী</span>
                      <span className="text-[11px] text-gray-500">মোট {toBanglaDigit(students.length)} জন অভিভাবক</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setBroadcastAudience('department')}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        broadcastAudience === 'department'
                          ? 'border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                      }`}
                    >
                      <span className="text-sm font-bold text-gray-900 block">নির্দিষ্ট শ্রেণি / বিভাগ</span>
                      <span className="text-[11px] text-gray-500">ক্লাস ফিল্টার</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setBroadcastAudience('hostel')}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        broadcastAudience === 'hostel'
                          ? 'border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                      }`}
                    >
                      <span className="text-sm font-bold text-gray-900 block">আবাসিক ছাত্র</span>
                      <span className="text-[11px] text-gray-500">
                        {toBanglaDigit(students.filter((s: any) => s.residential_status === 'residential').length)} জন হোস্টেল
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setBroadcastAudience('daycare')}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        broadcastAudience === 'daycare'
                          ? 'border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                      }`}
                    >
                      <span className="text-sm font-bold text-gray-900 block">অনাবাসিক ছাত্র</span>
                      <span className="text-[11px] text-gray-500">
                        {toBanglaDigit(students.filter((s: any) => s.residential_status !== 'residential').length)} জন ডে-কেয়ার
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setBroadcastAudience('teachers')}
                      className={`p-3 rounded-2xl border text-left transition-all col-span-2 sm:col-span-2 ${
                        broadcastAudience === 'teachers'
                          ? 'border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                      }`}
                    >
                      <span className="text-sm font-bold text-gray-900 block">সকল শিক্ষক ও কর্মকর্তা</span>
                      <span className="text-[11px] text-gray-500">মোট {toBanglaDigit(teachers.length || 6)} জন শিক্ষক-কর্মী</span>
                    </button>
                  </div>

                  {/* Department Dropdown if selected */}
                  {broadcastAudience === 'department' && (
                    <div className="mt-3 p-3 bg-emerald-50/60 rounded-2xl border border-emerald-200">
                      <label className="text-xs font-bold text-emerald-950 block mb-1">বিভাগ বা শ্রেণি নির্বাচন করুন:</label>
                      <select
                        value={broadcastDeptId}
                        onChange={(e) => setBroadcastDeptId(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl text-xs font-semibold focus:outline-none"
                      >
                        <option value="">সকল বিভাগ</option>
                        {departments.map((dept: any) => (
                          <option key={dept.id} value={dept.id}>
                            {dept.name} ({dept.dept_type === 'islamic' ? 'ইসলামিক' : 'জেনারেল'})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* 2. Channel Selection */}
                <div>
                  <label className="text-xs font-extrabold text-gray-800 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                    <Radio className="w-4 h-4 text-emerald-700" />
                    <span>২. নোটিফিকেশন চ্যানেল নির্বাচন করুন</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setBroadcastChannel('whatsapp')}
                      className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                        broadcastChannel === 'whatsapp'
                          ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      <span>💬 WhatsApp</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setBroadcastChannel('sms')}
                      className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                        broadcastChannel === 'sms'
                          ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      <span>📱 সাধারণ SMS</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setBroadcastChannel('both')}
                      className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                        broadcastChannel === 'both'
                          ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      <span>⚡ উভয় মাধ্যম</span>
                    </button>
                  </div>
                </div>

                {/* 3. Pre-configured Broadcast Template Chips */}
                <div>
                  <label className="text-xs font-extrabold text-gray-800 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-emerald-700" />
                    <span>৩. দ্রুত নোটিশ টেমপ্লেট নির্বাচন (১-ক্লিক লোড)</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {BROADCAST_TEMPLATES.map((tpl) => (
                      <button
                        key={tpl.id}
                        type="button"
                        onClick={() => handleSelectBroadcastTemplate(tpl.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          broadcastSelectedTplId === tpl.id
                            ? 'bg-amber-400 text-emerald-950 shadow-sm scale-105'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {tpl.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Message Composer */}
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">নোটিশের শিরোনাম:</label>
                    <input
                      type="text"
                      value={broadcastTitle}
                      onChange={(e) => setBroadcastTitle(e.target.value)}
                      placeholder="নোটিশের শিরোনাম লিখুন..."
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-gray-900 focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-gray-700">নোটিশের পূর্ণাঙ্গ বিবরণ ও বার্তা:</label>
                      <div className="flex items-center gap-1 text-[11px] text-gray-500">
                        <span>ভেরিয়েবল যোগ করুন:</span>
                        <button
                          type="button"
                          onClick={() => handleInsertVariable('{শিক্ষার্থী}')}
                          className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold hover:bg-emerald-200"
                        >
                          + {`{শিক্ষার্থী}`}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleInsertVariable('{রোল}')}
                          className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold hover:bg-emerald-200"
                        >
                          + {`{রোল}`}
                        </button>
                      </div>
                    </div>

                    <textarea
                      rows={8}
                      value={broadcastMessage}
                      onChange={(e) => setBroadcastMessage(e.target.value)}
                      placeholder="নোটিশের বিস্তারিত বার্তা লিখুন..."
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm leading-relaxed text-gray-900 focus:outline-none focus:border-emerald-600 font-sans"
                    />

                    <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1">
                      <span>মোট অক্ষর: {toBanglaDigit(broadcastMessage.length)} টি</span>
                      <span>আনুমানিক SMS পার্টস: {toBanglaDigit(Math.ceil(broadcastMessage.length / 70) || 1)} টি</span>
                    </div>
                  </div>

                  {/* Send Broadcast Action */}
                  <button
                    type="button"
                    onClick={handleBroadcastSubmit}
                    disabled={broadcastMutation.isPending || !broadcastMessage.trim()}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-amber-600 hover:from-emerald-700 hover:to-amber-500 text-white font-extrabold text-sm shadow-xl shadow-emerald-950/20 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
                  >
                    <Megaphone className="w-5 h-5 text-amber-300" />
                    <span>
                      {broadcastMutation.isPending
                        ? 'বাল্ক নোটিশ পাঠানো হচ্ছে...'
                        : `📢 সকল প্রাপকের কাছে নোটিশ ব্রডকাস্ট করুন (${broadcastAudience === 'teachers' ? 'সকল শিক্ষক' : 'সকল অভিভাবক'})`}
                    </span>
                  </button>
                </div>

              </div>

              {/* Right Column: Smartphone Live Preview Mockup (5 cols) */}
              <div className="lg:col-span-5 flex flex-col items-center">
                <div className="w-full max-w-[340px] bg-slate-900 rounded-[40px] p-4 shadow-2xl border-4 border-slate-700 relative">
                  
                  {/* Phone Speaker Notch */}
                  <div className="w-32 h-4 bg-slate-800 rounded-full mx-auto mb-3 flex items-center justify-center">
                    <div className="w-8 h-1.5 bg-slate-700 rounded-full" />
                  </div>

                  {/* Screen Container */}
                  <div className="bg-[#0b141a] text-white rounded-[28px] overflow-hidden p-3 min-h-[460px] flex flex-col justify-between border border-slate-800">
                    
                    {/* WhatsApp Top Bar */}
                    <div className="bg-[#1f2c34] p-2.5 rounded-xl flex items-center gap-2.5 mb-3 border-b border-emerald-900/30">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-white p-[1px] shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover rounded-full" />
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="text-xs font-bold text-white truncate">আল-মদিনা মডেল মাদ্রাসা</h4>
                        <p className="text-[10px] text-emerald-400 font-mono">অফিসিয়াল নোটিফিকেশন</p>
                      </div>
                    </div>

                    {/* Chat Bubble Message */}
                    <div className="flex-1 flex flex-col justify-start">
                      <div className="bg-[#005c4b] text-white rounded-2xl rounded-tl-none p-3.5 shadow-md space-y-1.5 text-xs">
                        <div className="text-[10px] font-bold text-amber-300 border-b border-emerald-600/40 pb-1 flex items-center justify-between">
                          <span>{broadcastTitle || 'জরুরি বিজ্ঞপ্তি'}</span>
                          <span>আজ</span>
                        </div>
                        <p className="text-xs text-emerald-50 leading-relaxed whitespace-pre-wrap font-sans">
                          {broadcastMessage
                            .replace(/{শিক্ষার্থী}/g, 'মুয়াজ বিন জাবাল')
                            .replace(/{রোল}/g, '১')
                            .replace(/{নাম}/g, 'মুয়াজ বিন জাবাল')
                            .replace(/{শ্রেণি}/g, 'হিফজুল কুরআন বিভাগ')}
                        </p>
                        <div className="text-[9px] text-emerald-300/80 text-right pt-1 font-mono">
                          ✓✓ পঠিত • ১২:৩০ PM
                        </div>
                      </div>
                    </div>

                    {/* Chat Footer Mock */}
                    <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                      <span>ইনক্রিপ্টেড ব্রডকাস্ট বার্তা</span>
                      <span className="text-emerald-400 font-bold">আল-মদিনা SMS</span>
                    </div>

                  </div>

                  {/* Home Bar */}
                  <div className="w-28 h-1 bg-slate-700 rounded-full mx-auto mt-3" />
                </div>

                <div className="mt-4 text-center">
                  <span className="text-xs text-gray-500 font-medium">
                    📱 অভিভাবকের মোবাইলে বার্তার লাইভ প্রিভিউ
                  </span>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 1: NOTIFICATION LOGS & ACTIVITY */}
        {activeTab === 'logs' && (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-6 space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-emerald-700" />
                  <span>সাম্প্রতিক প্রেরিত বার্তার তালিকা</span>
                </h3>
                <p className="text-xs text-gray-500">যেকোনো বার্তার পাশে 'WhatsApp-এ ওপেন' বাটনে ক্লিক করে সরাসরি দেখুন</p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2">
                {/* Type Filter */}
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                >
                  <option value="all">সকল ধরন</option>
                  <option value="admission">ভর্তি নোটিফিকেশন</option>
                  <option value="fee_receipt">মানি রিসিট</option>
                  <option value="fee_reminder">বকেয়া বেতন</option>
                  <option value="result">রেজাল্ট ও মার্কশিট</option>
                  <option value="attendance">অনুপস্থিতি</option>
                  <option value="notice">বিজ্ঞপ্তি ব্রডকাস্ট</option>
                </select>

                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3.5 top-2.5 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="ফোন নম্বর বা নাম..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-gray-700 uppercase font-bold border-y border-slate-200">
                  <tr>
                    <th className="py-3 px-4">তারিখ ও সময়</th>
                    <th className="py-3 px-4">প্রাপক ও শিক্ষার্থী</th>
                    <th className="py-3 px-4">বিষয় ও শিরোনাম</th>
                    <th className="py-3 px-4 text-center">চ্যানেল</th>
                    <th className="py-3 px-4 text-center">স্ট্যাটাস</th>
                    <th className="py-3 px-4 text-center">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLogsLoading ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-gray-400">
                        নোটিফিকেশন লগ লোড হচ্ছে...
                      </td>
                    </tr>
                  ) : filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-gray-400">
                        কোনো নোটিফিকেশন পাওয়া যায়নি
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log: any) => (
                      <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 text-gray-500 font-mono">
                          {new Date(log.created_at).toLocaleString('bn-BD', { dateStyle: 'short', timeStyle: 'short' })}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-gray-900 font-mono text-xs">{log.recipient_phone}</div>
                          <div className="text-[11px] text-gray-500">
                            {log.recipient_name || log.student_name_bn || 'অভিভাবক'}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 max-w-xs">
                          <div className="font-bold text-emerald-950 truncate">{log.title}</div>
                          <div className="text-[11px] text-gray-500 truncate">{log.message}</div>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-emerald-100 text-emerald-800">
                            <MessageSquare className="w-3 h-3 text-emerald-700" />
                            <span>WhatsApp</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {log.status === 'delivered' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              <CheckCircle2 size={12} /> সফল
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                              <Clock size={12} /> প্রস্তুত
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {log.wa_link && (
                              <a
                                href={log.wa_link}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow-sm transition-transform active:scale-95"
                                title="সরাসরি WhatsApp-এ ওপেন করুন"
                              >
                                <ExternalLink size={12} />
                                <span>WhatsApp</span>
                              </a>
                            )}
                            <button
                              onClick={() => resendMutation.mutate(log.id)}
                              disabled={resendMutation.isPending}
                              className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-gray-700 transition-colors"
                              title="পুনরায় পাঠান"
                            >
                              <RefreshCw size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* TAB 2: SEND CUSTOM MESSAGE */}
        {activeTab === 'send' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left: Student Selector & Templates (5 cols) */}
            <div className="lg:col-span-5 space-y-5">
              
              {/* Ready Templates */}
              <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200/80">
                <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-700" />
                  <span>রেডিমেড মেসেজ টেমপ্লেট নির্বাচন করুন</span>
                </h3>

                <div className="space-y-2">
                  {PRESET_TEMPLATES.map((tpl) => {
                    const isSel = selectedTemplateId === tpl.id;
                    return (
                      <button
                        type="button"
                        key={tpl.id}
                        onClick={() => handleSelectTemplate(tpl.id)}
                        className={`w-full text-left p-2.5 rounded-2xl text-xs font-bold border transition-all flex items-center justify-between gap-3 ${
                          isSel
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-950 shadow-sm'
                            : 'bg-slate-50 border-slate-100 text-gray-700 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          {tpl.image ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img src={tpl.image} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0 border border-emerald-500/20" />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                              <FileText className="w-4 h-4" />
                            </div>
                          )}
                          <span className="truncate">{tpl.name}</span>
                        </div>
                        {isSel && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Student Quick Picker */}
              <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200/80">
                <h3 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-700" />
                  <span>শিক্ষার্থী নির্বাচন (ঐচ্ছিক)</span>
                </h3>
                <p className="text-[11px] text-gray-500 mb-3">শিক্ষার্থী সিলেক্ট করলে তার অভিভাবকের নম্বর ও তথ্য স্বয়ংক্রিয়ভাবে বসে যাবে</p>

                <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                  {students.map((s: any) => {
                    const isSel = selectedStudent?.id === s.id;
                    return (
                      <div
                        key={s.id}
                        onClick={() => handleSelectStudent(s)}
                        className={`p-2.5 rounded-xl cursor-pointer text-xs flex items-center justify-between transition-all ${
                          isSel ? 'bg-emerald-100 text-emerald-950 font-bold border border-emerald-400' : 'hover:bg-slate-50 border border-slate-100'
                        }`}
                      >
                        <div>
                          <div className="font-bold">{s.name_bn || s.name}</div>
                          <div className="text-[10px] text-gray-500 font-mono">{s.student_id} • {s.guardian_phone}</div>
                        </div>
                        {isSel && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />}
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Right: Message Editor & Live Preview (7 cols) */}
            <div className="lg:col-span-7">
              <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200/80 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">মেসেজ ড্রাফট ও লাইভ প্রিভিউ</h3>
                    <p className="text-xs text-gray-500">প্রাপক ও বার্তার বিবরণ যাচাই করে পাঠান</p>
                  </div>
                  <MessageSquare className="w-6 h-6 text-emerald-700" />
                </div>

                <form onSubmit={handleSendSubmit} className="space-y-4">
                  
                  {/* Phone & Recipient Name */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">
                        প্রাপকের মোবাইল নম্বর <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="যেমন: 01712633264"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-mono focus:outline-none focus:border-emerald-600 focus:bg-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">
                        প্রাপকের নাম
                      </label>
                      <input
                        type="text"
                        placeholder="যেমন: অভিভাবকের নাম"
                        value={recipientName}
                        onChange={(e) => setRecipientName(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:border-emerald-600 focus:bg-white"
                      />
                    </div>
                  </div>

                  {/* Title & Channel */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">
                        বার্তার শিরোনাম <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold focus:outline-none focus:border-emerald-600 focus:bg-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">
                        ডেলিভারি চ্যানেল
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setChannel('whatsapp')}
                          className={`py-2 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 ${
                            channel === 'whatsapp' ? 'bg-emerald-900 border-emerald-900 text-white' : 'bg-slate-50 text-gray-700'
                          }`}
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setChannel('sms')}
                          className={`py-2 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 ${
                            channel === 'sms' ? 'bg-emerald-900 border-emerald-900 text-white' : 'bg-slate-50 text-gray-700'
                          }`}
                        >
                          <Smartphone className="w-3.5 h-3.5" />
                          <span>SMS</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Message Body */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      বার্তার মূল বিষয়বস্তু (Message Body) <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="এখানে বার্তার বিবরণ লিখুন..."
                      className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-sans focus:outline-none focus:border-emerald-600 focus:bg-white leading-relaxed"
                      required
                    />
                  </div>

                  {/* Live WhatsApp Simulated Message Box */}
                  <div className="bg-[#e5ddd5] p-4 rounded-2xl border border-gray-300">
                    <div className="text-[10px] text-gray-500 font-bold mb-1 flex items-center gap-1">
                      <MessageSquare className="w-3 h-3 text-emerald-800" />
                      <span>হোয়াটসঅ্যাপ মেসেজ লাইভ প্রিভিউ:</span>
                    </div>
                    <div className="bg-white rounded-xl p-3 shadow-sm max-w-md text-xs text-gray-800 whitespace-pre-wrap font-sans leading-relaxed">
                      {message || 'বার্তার টেক্সট এখানে প্রদর্শিত হবে...'}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 flex items-center gap-3">
                    <button
                      type="submit"
                      disabled={sendMutation.isPending}
                      className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-amber-600 hover:from-emerald-700 hover:to-amber-500 text-white font-extrabold text-xs sm:text-sm shadow-xl shadow-emerald-950/20 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
                    >
                      <Send className="w-4 h-4 text-amber-300" />
                      <span>{sendMutation.isPending ? 'প্রেরণ করা হচ্ছে...' : 'মেসেজ পাঠান ও WhatsApp খুলুন'}</span>
                    </button>
                  </div>

                </form>
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: GATEWAY STATUS & HOW TO CONNECT */}
        {activeTab === 'gateway' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Status Card */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200/80 space-y-4">
              <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Radio className="w-5 h-5 text-emerald-700" />
                <span>অটোমেশন গেটওয়ে কানেক্টিভিটি</span>
              </h3>

              <div className="space-y-3 text-xs sm:text-sm">
                <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-gray-600">হোয়াটসঅ্যাপ ওয়েব ডিরেক্ট সার্ভিস:</span>
                  <span className="font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 size={12} /> সক্রিয় (Active)
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-gray-600">ব্যাকগ্রাউন্ড সার্ভিস পোর্ট:</span>
                  <span className="font-mono font-bold text-gray-800">http://localhost:3001</span>
                </div>

                <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-gray-600">মোট সফল নোটিফিকেশন:</span>
                  <span className="font-bold text-emerald-950 text-base">{toBanglaDigit(logs.length)} টি</span>
                </div>

                <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-gray-600">মাদ্রাসার অফিসিয়াল হেল্পলাইন:</span>
                  <span className="font-mono font-bold text-emerald-900">০১৭১২-৬৩৩২৬৪</span>
                </div>
              </div>
            </div>

            {/* Instruction Card */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200/80 space-y-4">
              <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <ShieldCheck className="w-5 h-5 text-emerald-700" />
                <span>মাদ্রাসার অফিসিয়াল হোয়াটসঅ্যাপ কানেক্ট করার নিয়ম</span>
              </h3>

              <div className="space-y-2.5 text-xs text-gray-700 leading-relaxed">
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center flex-shrink-0 text-[10px]">১</span>
                  <span><strong>১-ক্লিক ওয়েব লিঙ্ক মোড:</strong> যেকোনো শিক্ষার্থী বা মানি রিসিট থেকে 'WhatsApp-এ পাঠান' বাটনে চাপলে সরাসরি মাদ্রাসার ডেস্কটপ বা ফোনের WhatsApp অ্যাপ ওপেন হয়ে প্রি-ফিল্ড মেসেজ চলে যাবে।</span>
                </div>

                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center flex-shrink-0 text-[10px]">২</span>
                  <span><strong>অটোমেটিক ব্যাকগ্রাউন্ড রোবট:</strong> <code>whatsapp-service</code> ফোল্ডারে <code>node index.js</code> চালালে টার্মিনালে প্রদর্শিত কিউআর কোডটি মাদ্রাসার ফোন থেকে লিংকড ডিভাইস (Linked Devices) হিসেবে স্ক্যান করে নিলেই পুরো সিস্টেম সম্পূর্ণ স্বয়ংক্রিয়ভাবে মেসেজ পাঠাতে শুরু করবে।</span>
                </div>

                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center flex-shrink-0 text-[10px]">৩</span>
                  <span><strong>জিরো কস্ট:</strong> কোনো পেইড গেটওয়ে বা অতিরিক্ত এসএমএস প্যাকেজ কেনার বাধ্যবাধকতা নেই।</span>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </AppLayout>
  );
}
