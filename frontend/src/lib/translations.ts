export type Language = 'bn' | 'en';

export const TRANSLATIONS: Record<string, { bn: string; en: string }> = {
  // Brand & Institution
  'brand.name': {
    bn: 'আল-মদিনা মডেল মাদ্রাসা এন্ড রিসার্চ ইনস্টিটিউট',
    en: 'Al-Madinah Model Madrasah & Research Institute'
  },
  'brand.shortName': {
    bn: 'আল-মদিনা মাদ্রাসা',
    en: 'Al-Madinah Madrasah'
  },
  'brand.tagline': {
    bn: 'কুরআন ও সুন্নাহর আলোকে আধুনিক শিক্ষায় আলোকিত আগামী',
    en: 'Enlightening the future with Quran, Sunnah, and Modern Education'
  },
  'brand.address': {
    bn: 'ক-৭৫/২, মহাখালী দক্ষিণপাড়া, বনানী, ঢাকা',
    en: 'Ka-75/2, Mohakhali Dakshinpara, Banani, Dhaka'
  },
  'brand.phone': {
    bn: '০১৭১২-৬৩৩২৬৪',
    en: '01712-633264'
  },
  'brand.phone2': {
    bn: '০১৫৮০-৫০৬৪৪৫',
    en: '01580-506445'
  },
  'brand.admissionBanner': {
    bn: 'সেশন ২০২৭ ভর্তি কার্যক্রম চলমান',
    en: 'Session 2027 Admissions Open'
  },
  'brand.admissionNotice': {
    bn: 'প্লে থেকে দাখিল ও হিফজুল কুরআন বিভাগে নতুন সেশনে ভর্তি চলছে',
    en: 'Admissions ongoing for Play to Dakhil & Hifzul Quran sections'
  },

  // Navigation Items
  'nav.home': { bn: 'হোম', en: 'Home' },
  'nav.dashboard': { bn: 'ড্যাশবোর্ড', en: 'Dashboard' },
  'nav.teachers': { bn: 'শিক্ষকবৃন্দ', en: 'Teachers' },
  'nav.students': { bn: 'শিক্ষার্থী তালিকা', en: 'Students' },
  'nav.attendance': { bn: 'ডিজিটাল হাজিরা', en: 'Attendance' },
  'nav.exams': { bn: 'পরীক্ষা ও ফলাফল', en: 'Exams & Results' },
  'nav.fees': { bn: 'ফি ও কালেকশন', en: 'Fees & Accounts' },
  'nav.hostel': { bn: 'হোস্টেল ও মিল', en: 'Hostel & Dining' },
  'nav.notices': { bn: 'নোটিশ ও সার্কুলার', en: 'Notices' },
  'nav.reports': { bn: 'রিপোর্ট ও প্রিন্ট', en: 'Reports & Print' },
  'nav.profile': { bn: 'প্রোফাইল সেটিংস', en: 'Profile Settings' },
  'nav.liveSite': { bn: 'লাইভ সাইট', en: 'Live Website' },
  'nav.admission': { bn: 'অনলাইন ভর্তি', en: 'Online Admission' },
  'nav.login': { bn: 'লগইন', en: 'Login' },
  'nav.logout': { bn: 'লগআউট', en: 'Logout' },
  'nav.about': { bn: 'আমাদের সম্পর্কে', en: 'About Us' },
  'nav.features': { bn: 'বৈশিষ্ট্যসমূহ', en: 'Features' },
  'nav.academics': { bn: 'বিভাগসমূহ', en: 'Academics' },
  'nav.gallery': { bn: 'ক্যাম্পাস গ্যালারি', en: 'Gallery' },
  'nav.contact': { bn: 'যোগাযোগ', en: 'Contact' },

  // Role Switcher
  'role.switcherTitle': { bn: '১-ক্লিক রোল প্রিভিউয়ার', en: '1-Click Role Previewer' },
  'role.currentView': { bn: 'বর্তমান ভিউ:', en: 'Current View:' },
  'role.principal': { bn: 'প্রিন্সিপাল', en: 'Principal' },
  'role.managing_director': { bn: 'ম্যানেজিং ডিরেক্টর (MD)', en: 'Managing Director (MD)' },
  'role.vice_principal': { bn: 'ভাইস প্রিন্সিপাল (VP)', en: 'Vice Principal (VP)' },
  'role.teacher': { bn: 'শিক্ষক (Teacher)', en: 'Teacher' },
  'role.staff': { bn: 'স্টাফ / হিসাবরক্ষক', en: 'Staff / Cashier' },
  'role.student': { bn: 'শিক্ষার্থী (Student)', en: 'Student' },
  'role.guardian': { bn: 'অভিভাবক (Guardian)', en: 'Guardian' },
  'role.exit': { bn: 'প্রিন্সিপালে ফিরুন', en: 'Back to Principal' },

  // Role Descriptions
  'role.desc.principal': {
    bn: 'মাদ্রাসার প্রশাসনিক ও পূর্ণাঙ্গ ফাইন্যান্সিয়াল কন্ট্রোল',
    en: 'Full administrative & financial control of the Madrasah'
  },
  'role.desc.managing_director': {
    bn: 'লাবিব ফোহায়ের • গভর্নিং বডি ও ট্রাস্টি বোর্ড ভিউ',
    en: 'Labib Fohayer • Governing Body & Trustee Board View'
  },
  'role.desc.vice_principal': {
    bn: 'অ্যাকাডেমিক অডিট ও শিক্ষক তদারকি',
    en: 'Academic audit & faculty supervision'
  },
  'role.desc.teacher': {
    bn: 'ক্লাস হাজিরা, মার্কস এন্ট্রি ও শিক্ষক পোর্টাল',
    en: 'Class attendance, marks entry & faculty portal'
  },
  'role.desc.staff': {
    bn: 'অফিস ক্যাশ খাতা ও কাউন্টার ফি কালেকশন',
    en: 'Office cash register & counter fee collection'
  },
  'role.desc.student': {
    bn: 'ছাত্রের রেজাল্ট, রুটিন ও হাজিরা শতাংশ',
    en: 'Student results, routine & attendance percentage'
  },
  'role.desc.guardian': {
    bn: 'বিকাশ/নগদ পেমেন্ট, বকেয়া ফি ও ছুটির গেটপাস',
    en: 'bKash/Nagad fee payment & leave gatepass'
  },

  // Dashboard Common & Headers
  'dashboard.greeting': { bn: 'আস-সালামু আলাইকুম,', en: 'Assalamu Alaikum,' },
  'dashboard.activeBadge': { bn: 'সক্রিয়', en: 'Active' },
  'dashboard.subtitle': {
    bn: 'আল-মদিনা মডেল মাদ্রাসা এন্ড রিসার্চ ইনস্টিটিউট • ক-৭৫/২, মহাখালী দক্ষিণপাড়া, বনানী, ঢাকা।',
    en: 'Al-Madinah Model Madrasah & Research Institute • Ka-75/2, Mohakhali, Banani, Dhaka.'
  },
  'dashboard.mdView': {
    bn: 'ম্যানেজিং ডিরেক্টর • গভর্নিং বডি ও ট্রাস্টি এক্সিকিউটিভ ভিউ',
    en: 'Managing Director • Governing Body & Trustee Executive View'
  },
  'dashboard.vpView': {
    bn: 'ভাইস প্রিন্সিপাল • অ্যাকাডেমিক অডিট ও শিক্ষক তদারকি ভিউ',
    en: 'Vice Principal • Academic Audit & Teacher Supervision View'
  },
  'dashboard.teacherView': {
    bn: 'সম্মানিত শিক্ষক • ক্লাস ও অ্যাকাডেমিক পোর্টাল',
    en: 'Respected Teacher • Class & Academic Portal'
  },
  'dashboard.staffView': {
    bn: 'অফিস সহকারী • কাউন্টার ও ক্যাশ ম্যানেজমেন্ট',
    en: 'Office Assistant • Counter & Cash Management'
  },
  'dashboard.principalView': {
    bn: 'সেশন ২০২৭ ভর্তি কার্যক্রম চলমান • ক্যাম্পাস ম্যানেজমেন্ট',
    en: 'Session 2027 Admissions Active • Campus Management'
  },

  // Stat Cards
  'stats.totalStudents': { bn: 'মোট শিক্ষার্থী', en: 'Total Students' },
  'stats.presentToday': { bn: 'আজকের উপস্থিতি', en: 'Present Today' },
  'stats.absentToday': { bn: 'আজকের অনুপস্থিত', en: 'Absent Today' },
  'stats.todayCollection': { bn: 'আজকের ফি আদায়', en: 'Fees Collected Today' },
  'stats.monthlyDue': { bn: 'মোট বকেয়া ফি', en: 'Total Due Fees' },
  'stats.totalTeachers': { bn: 'মোট শিক্ষক', en: 'Total Faculty' },
  'stats.taka': { bn: '৳', en: '৳' },
  'stats.studentsUnit': { bn: 'জন শিক্ষার্থী', en: 'Students' },
  'stats.teachersUnit': { bn: 'জন শিক্ষক', en: 'Teachers' },
  'stats.attendanceRate': { bn: 'উপস্থিতির হার', en: 'Attendance Rate' },

  // Quick Action Buttons
  'action.quickActions': { bn: 'জরুরি অ্যাকশন ও কুইক লিংক', en: 'Quick Actions & Links' },
  'action.newAdmission': { bn: 'নতুন ভর্তি আবেদন', en: 'New Admission' },
  'action.newAdmissionSub': { bn: 'শিক্ষার্থী রেজিস্ট্রেশন ফরম', en: 'Student Registration Form' },
  'action.markAttendance': { bn: 'দৈনিক হাজিরা গ্রহণ', en: 'Take Attendance' },
  'action.markAttendanceSub': { bn: 'ডিজিটাল উপস্থিতি এন্ট্রি', en: 'Digital Attendance Entry' },
  'action.collectFees': { bn: 'ফি আদায় করুন', en: 'Collect Fees' },
  'action.collectFeesSub': { bn: 'কাউন্টার ক্যাশ ও অনলাইন', en: 'Counter Cash & Online' },
  'action.addNotice': { bn: 'নতুন নোটিশ দিন', en: 'Publish Notice' },
  'action.addNoticeSub': { bn: 'বিজ্ঞপ্তি ও এসএমএস ঘোষণা', en: 'Announcements & SMS' },
  'action.enterMarks': { bn: 'পরীক্ষার মার্কস এন্ট্রি', en: 'Enter Exam Marks' },
  'action.enterMarksSub': { bn: 'ফলাফল ও গ্রেডিং শিট', en: 'Result & Grading Sheet' },
  'action.sendSMS': { bn: 'বাল্ক এসএমএস পাঠান', en: 'Send Bulk SMS' },
  'action.sendSMSSub': { bn: 'অভিভাবকদের হোয়াটসঅ্যাপ বার্তা', en: 'Parent WhatsApp Alerts' },

  // Principal / MD Sections
  'section.weeklyAttendance': { bn: 'সাপ্তাহিক হাজিরা ট্রেন্ড', en: 'Weekly Attendance Trend' },
  'section.recentTransactions': { bn: 'সাম্প্রতিক লেনদেন ও ফি ভাউচার', en: 'Recent Transactions & Vouchers' },
  'section.academicOverview': { bn: 'অ্যাকাডেমিক ও মাদরাসা সামগ্রিক চিত্র', en: 'Academic & Madrasah Overview' },
  'section.viewAll': { bn: 'সব দেখুন', en: 'View All' },
  'section.date': { bn: 'তারিখ', en: 'Date' },
  'section.studentName': { bn: 'শিক্ষার্থীর নাম', en: 'Student Name' },
  'section.class': { bn: 'শ্রেণি', en: 'Class' },
  'section.amount': { bn: 'পরিমাণ', en: 'Amount' },
  'section.method': { bn: 'পদ্ধতি', en: 'Method' },
  'section.cash': { bn: 'ক্যাশ', en: 'Cash' },
  'section.online': { bn: 'অনলাইন', en: 'Online' },

  // Student Dashboard
  'student.dashboardTitle': { bn: 'শিক্ষার্থী ড্যাশবোর্ড', en: 'Student Portal' },
  'student.idCard': { bn: 'ডিজিটাল আইডি কার্ড', en: 'Digital ID Card' },
  'student.roll': { bn: 'রোল', en: 'Roll' },
  'student.class': { bn: 'শ্রেণি', en: 'Class' },
  'student.section': { bn: 'শাখা', en: 'Section' },
  'student.bloodGroup': { bn: 'রক্তের গ্রুপ', en: 'Blood Group' },
  'student.guardianPhone': { bn: 'অভিভাবকের ফোন', en: 'Guardian Phone' },
  'student.routine': { bn: 'দৈনিক ক্লাস রুটিন', en: 'Daily Class Routine' },
  'student.examResults': { bn: 'সাময়িক পরীক্ষার ফলাফল', en: 'Term Examination Results' },
  'student.subject': { bn: 'বিষয়', en: 'Subject' },
  'student.fullMarks': { bn: 'পূর্ণমান', en: 'Full Marks' },
  'student.obtained': { bn: 'প্রাপ্ত নম্বর', en: 'Obtained' },
  'student.grade': { bn: 'গ্রেড', en: 'Grade' },
  'student.regularStudent': { bn: 'নিয়মিত শিক্ষার্থী', en: 'Regular Student' },
  'student.close': { bn: 'বন্ধ করুন', en: 'Close' },

  // Guardian Portal
  'guardian.portalTitle': { bn: 'অভিভাবক পোর্টাল', en: 'Guardian Portal' },
  'guardian.selectStudent': { bn: 'সন্তান / শিক্ষার্থী নির্বাচন করুন', en: 'Select Child / Student' },
  'guardian.dueFees': { bn: 'বকেয়া ফি বিবরণ', en: 'Due Fee Summary' },
  'guardian.payNow': { bn: 'বিকাশ / নগদ পেমেন্ট', en: 'Pay via bKash / Nagad' },
  'guardian.gatepass': { bn: 'ছুটির আবেদন ও গেটপাস', en: 'Leave Request & Gatepass' },
  'guardian.attendance': { bn: 'হাজিরা রেকর্ড', en: 'Attendance Record' },
  'guardian.receipt': { bn: 'মানি রিসিট', en: 'Money Receipt' },

  // Public Landing Page
  'home.heroBadge': {
    bn: '✨ আল-মদিনা মডেল মাদ্রাসা এন্ড রিসার্চ ইনস্টিটিউট',
    en: '✨ Al-Madinah Model Madrasah & Research Institute'
  },
  'home.heroTitle': {
    bn: 'কুরআন-সুন্নাহ ও আধুনিক শিক্ষার অনন্য সমন্বয়',
    en: 'Unique Synthesis of Quran-Sunnah & Modern Education'
  },
  'home.heroDesc': {
    bn: 'অভিজ্ঞ উস্তাদমণ্ডলী, আন্তর্জাতিক মানের তাজবিদ ও নাজেরা, শীতাতপ নিয়ন্ত্রিত হিফজুল কুরআন বিভাগ, বিজ্ঞান ও কম্পিউটার ল্যাব এবং পুষ্টিকর খাবারের উন্নত আবাসিক ব্যবস্থাপনা।',
    en: 'Experienced faculty, international-standard Tajweed & Nazera, AC Hifzul Quran hallroom, Science & Computer lab, and premium residential hostel with nutritious meals.'
  },
  'home.applyOnline': { bn: 'অনলাইন ভর্তি ফরম', en: 'Online Admission Form' },
  'home.callUs': { bn: 'সরাসরি কল করুন', en: 'Call Us Directly' },
  'home.featuresTitle': { bn: 'আমাদের বিশেষ বৈশিষ্ট্যসমূহ', en: 'Our Special Features' },
  'home.feature1Title': { bn: 'শীতাতপ নিয়ন্ত্রিত হিফজ বিভাগ', en: 'AC Hifzul Quran Section' },
  'home.feature1Desc': {
    bn: 'আন্তর্জাতিক মানের ক্বারীদের তত্ত্বাবধানে প্রতিটি ছাত্রের জন্য বিশেষ মাখরাজ ও তাজবিদ তালিম।',
    en: 'Under supervision of international-standard Qaris with individual Tajweed & Makhraj care.'
  },
  'home.feature2Title': { bn: 'আধুনিক কম্পিউটার ল্যাব', en: 'Modern Computer Lab' },
  'home.feature2Desc': {
    bn: 'প্রাথমিক থেকেই কম্পিউটার প্রশিক্ষণ, প্রোগ্রামিং বেসিকস ও ডিজিটাল শিক্ষায় সুদক্ষকরণ।',
    en: 'Computer training, programming basics, and digital proficiency from the foundational level.'
  },
  'home.feature3Title': { bn: '২৪ ঘণ্টা সিসিটিভি ও নিরাপত্তা', en: '24/7 CCTV & Security' },
  'home.feature3Desc': {
    bn: 'সম্পূর্ণ ক্যাম্পাস সার্বক্ষণিক সিসিটিভি ক্যামেরায় নজরদারি এবং নিবেদিত সিকিউরিটি টিম।',
    en: 'Campus under continuous CCTV surveillance with a dedicated 24/7 security team.'
  },
  'home.feature4Title': { bn: 'মানসম্মত পুষ্টিকর আবাসিক খাবার', en: 'Hygienic & Nutritious Meals' },
  'home.feature4Desc': {
    bn: 'নিজস্ব বাবুর্চি দ্বারা প্রতিদিন ফ্রেশ বাজার ও পুষ্টিবিদের পরামর্শে রুচিশীল ডাইনিং।',
    en: 'Fresh daily groceries prepared by in-house chefs with balanced nutrition.'
  },
  'home.statsStudents': { bn: 'সক্রিয় শিক্ষার্থী', en: 'Active Students' },
  'home.statsTeachers': { bn: 'অভিজ্ঞ শিক্ষক', en: 'Experienced Faculty' },
  'home.statsHifz': { bn: 'হিফজ সম্পন্নকারী', en: 'Hifz Graduates' },
  'home.statsSuccess': { bn: 'বোর্ড পাশের হার', en: 'Board Pass Rate' },
  'home.principalTitle': { bn: 'অধ্যক্ষের বাণী', en: "Principal's Message" },
  'home.principalName': {
    bn: 'প্রিন্সিপাল মাওলানা ওমর ফারুক মুজাহিদী',
    en: 'Principal Maulana Omar Faruk Mujahidi'
  },
  'home.principalDesig': {
    bn: 'অধ্যক্ষ, আল-মদিনা মডেল মাদ্রাসা এন্ড রিসার্চ ইনস্টিটিউট',
    en: 'Principal, Al-Madinah Model Madrasah & Research Institute'
  },
  'home.principalQuote': {
    bn: 'আমরা কেবল সাধারণ পাঠদান করি না, বরং প্রতিটি শিশুকে কুরআন-সুন্নাহর নৈতিকতায় গড়ে তুলে আধুনিক জ্ঞান ও আত্মবিশ্বাসে সমৃদ্ধ করে গড়ে তুলতে প্রতিশ্রুতিবদ্ধ।',
    en: 'We do not merely teach; we are committed to nurturing every child in the morals of Quran & Sunnah while empowering them with modern knowledge and confidence.'
  },
  'home.galleryTitle': { bn: 'বাস্তব ক্যাম্পাসের আলোকিত মুহূর্ত ও কার্যক্রম', en: 'Real Campus Moments & Activities' },
  'home.galleryDesc': {
    bn: 'কুরআন তিলাওয়াত, শ্রেণি পাঠদান, অভিভাবক সম্মেলন ও শিক্ষার্থীদের পুরস্কার বিতরণীর কিছু খণ্ডচিত্র।',
    en: 'Snapshots of Quran recitation, classroom learning, guardian conferences, and student award ceremonies.'
  },
  'home.footerText': {
    bn: '© ২০২৬-২০২৭ আল-মদিনা মডেল মাদ্রাসা এন্ড রিসার্চ ইনস্টিটিউট। সর্বস্বত্ব সংরক্ষিত।',
    en: '© 2026-2027 Al-Madinah Model Madrasah & Research Institute. All rights reserved.'
  },

  // Auth & Login
  'login.title': { bn: 'সিস্টেম লগইন', en: 'System Login' },
  'login.phoneLabel': { bn: 'মোবাইল নম্বর / স্টুডেন্ট আইডি', en: 'Mobile Number / Student ID' },
  'login.phonePlaceholder': { bn: '০১৭১২XXXXXX অথবা STU-2026-001', en: '01712XXXXXX or STU-2026-001' },
  'login.passwordLabel': { bn: 'পাসওয়ার্ড', en: 'Password' },
  'login.passwordPlaceholder': { bn: 'আপনার পাসওয়ার্ড লিখুন', en: 'Enter your password' },
  'login.submit': { bn: 'লগ-ইন করুন', en: 'Log In' },
  'login.authenticating': { bn: 'যাচাই হচ্ছে...', en: 'Authenticating...' },
  'login.studentHint': {
    bn: 'শিক্ষার্থীদের জন্য নির্দেশনা: স্টুডেন্ট আইডি ও পাসওয়ার্ড হিসেবে জন্মতারিখ (DDMMYYYY) দিয়ে সহজেই লগইন করা যাবে।',
    en: 'For Students: Log in with your Student ID and Date of Birth (DDMMYYYY) as password.'
  },

  // Languages
  'lang.bn': { bn: 'বাংলা', en: 'বাংলা' },
  'lang.en': { bn: 'English', en: 'English' },
  'lang.switch': { bn: 'English', en: 'বাংলা' }
};

export function getTranslation(key: string, lang: Language, fallback?: string): string {
  const item = TRANSLATIONS[key];
  if (item && item[lang]) {
    return item[lang];
  }
  return fallback || key;
}

export function formatNumberByLang(num: number | string, lang: Language): string {
  if (lang === 'en') return String(num);
  const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/[0-9]/g, (w) => banglaDigits[+w]);
}
