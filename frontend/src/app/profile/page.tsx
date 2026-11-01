'use client';

import React, { useState, useEffect, useRef } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import api, { getMediaUrl } from '@/lib/api';
import toast from 'react-hot-toast';
import { 
  Camera, Lock, Phone, User as UserIcon, KeyRound, 
  CheckCircle2, ShieldCheck, AlertTriangle, Eye, EyeOff, 
  Sparkles, RefreshCw, Upload, Smartphone, Save
} from 'lucide-react';

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const { t, isBangla } = useLanguage();

  // Profile Information States
  const [name, setName] = useState('');
  const [nameBn, setNameBn] = useState('');
  const [phone, setPhone] = useState('');
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // Password Change States
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Role display label
  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'principal':
        return isBangla ? 'অধ্যক্ষ / প্রিন্সিপাল' : 'Principal';
      case 'vice_principal':
        return isBangla ? 'উপাধ্যক্ষ / ভাইস প্রিন্সিপাল' : 'Vice Principal';
      case 'managing_director':
        return isBangla ? 'ম্যানেজিং ডিরেক্টর' : 'Managing Director';
      case 'teacher':
        return isBangla ? 'সম্মানিত শিক্ষক' : 'Faculty / Teacher';
      case 'staff':
        return isBangla ? 'কর্মকর্তা ও হিসাবরক্ষক' : 'Officer / Staff';
      case 'guardian':
        return isBangla ? 'সম্মানিত অভিভাবক' : 'Guardian';
      case 'student':
        return isBangla ? 'শিক্ষার্থী' : 'Student';
      default:
        return role ? role.replace('_', ' ') : 'User';
    }
  };

  // Load latest profile from server
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/api/auth/profile/');
        const data = res.data;
        setName(data.name || '');
        setNameBn(data.name_bn || '');
        setPhone(data.phone || '');
        if (data.photo) {
          setCurrentPhotoUrl(data.photo);
        }
      } catch (err) {
        // Fallback to local user
        if (user) {
          setName(user.name || '');
          setNameBn(user.name_bn || '');
          setPhone(user.phone || '');
          if (user.photo) {
            setCurrentPhotoUrl(user.photo);
          }
        }
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [user]);

  // Handle Photo Selection
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error(isBangla ? 'অনুগ্রহ করে শুধুমাত্র ছবি ফাইল নির্বাচন করুন' : 'Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(isBangla ? 'ছবির সাইজ সর্বোচ্চ ৫ মেগাবাইট হতে পারবে' : 'Image size must be less than 5MB');
      return;
    }

    setPhotoFile(file);
    const previewUrl = URL.createObjectURL(file);
    setPhotoPreview(previewUrl);
    toast.success(isBangla ? 'নতুন ছবি নির্বাচন করা হয়েছে! সংরক্ষণে "তথ্য আপডেট করুন" চাপুন।' : 'New photo selected! Click "Update Profile" to save.');
  };

  // Save Profile (Name, Phone, and Photo)
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.trim();
    const cleanName = name.trim();
    const cleanNameBn = nameBn.trim();

    if (!cleanPhone) {
      toast.error(isBangla ? 'মোবাইল নম্বর দেওয়া আবশ্যক' : 'Mobile number is required');
      return;
    }

    // BD Phone validation: must be at least 11 digits
    const bdPhoneRegex = /^01[3-9]\d{8}$/;
    if (!bdPhoneRegex.test(cleanPhone)) {
      toast.error(isBangla ? 'অনুগ্রহ করে ১১ ডিজিটের সঠিক মোবাইল নম্বর লিখুন (যেমন: 017XXXXXXXX)' : 'Please enter a valid 11-digit Bangladeshi mobile number');
      return;
    }

    setIsSavingProfile(true);
    try {
      const formData = new FormData();
      formData.append('phone', cleanPhone);
      formData.append('name', cleanName);
      formData.append('name_bn', cleanNameBn);
      if (photoFile) {
        formData.append('photo', photoFile);
      }

      const res = await api.patch('/api/auth/profile/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const updated = res.data;
      if (updated.photo) {
        setCurrentPhotoUrl(updated.photo);
      }
      setPhotoFile(null);
      setPhotoPreview(null);

      // Synchronize AuthContext and localStorage
      if (user) {
        const newUserData = {
          ...user,
          phone: updated.phone,
          name: updated.name,
          name_bn: updated.name_bn,
          photo: updated.photo || user.photo,
        };
        localStorage.setItem('user', JSON.stringify(newUserData));
        setUser(newUserData);
      }

      toast.success(isBangla ? 'প্রোফাইল সফলভাবে আপডেট করা হয়েছে!' : 'Profile updated successfully!');
    } catch (err: any) {
      const errorMsg = err?.response?.data?.phone?.[0] || 
                       err?.response?.data?.detail || 
                       (isBangla ? 'প্রোফাইল আপডেট করতে সমস্যা হয়েছে' : 'Failed to update profile');
      toast.error(errorMsg);
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Change Login Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanOld = oldPassword.trim();
    const cleanNew = newPassword.trim();
    const cleanConfirm = confirmPassword.trim();

    if (!cleanOld) {
      toast.error(isBangla ? 'বর্তমান পাসওয়ার্ড লিখুন' : 'Please enter current password');
      return;
    }
    if (!cleanNew) {
      toast.error(isBangla ? 'নতুন পাসওয়ার্ড লিখুন' : 'Please enter new password');
      return;
    }
    if (cleanNew.length < 6) {
      toast.error(isBangla ? 'নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে' : 'New password must be at least 6 characters');
      return;
    }
    if (cleanNew !== cleanConfirm) {
      toast.error(isBangla ? 'নতুন পাসওয়ার্ড এবং নিশ্চিতকরণ পাসওয়ার্ড মেলেনি' : 'New password and confirm password do not match');
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await api.post('/api/auth/change-password/', {
        old_password: cleanOld,
        new_password: cleanNew,
      });

      toast.success(res.data?.detail || (isBangla ? 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!' : 'Password changed successfully!'));
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      const errorMsg = err?.response?.data?.detail || 
                       err?.response?.data?.old_password?.[0] || 
                       (isBangla ? 'পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে! পুরোনো পাসওয়ার্ড যাচাই করুন।' : 'Failed to change password');
      toast.error(errorMsg);
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Determine avatar image source
  const getAvatarSrc = () => {
    if (photoPreview) return photoPreview;
    if (currentPhotoUrl) return getMediaUrl(currentPhotoUrl);
    if (user?.photo) return getMediaUrl(user.photo);
    if (user?.role === 'managing_director') return '/md.jpg';
    if (user?.role === 'principal') return '/principal.jpg';
    return null;
  };

  const avatarSrc = getAvatarSrc();

  if (!user && !isLoadingProfile) {
    return (
      <AppLayout title={isBangla ? "প্রোফাইল" : "Profile"}>
        <div className="p-8 text-center text-gray-500">
          {isBangla ? 'অনুগ্রহ করে প্রথমে লগইন করুন' : 'Please login first'}
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title={isBangla ? "প্রোফাইল সেটিংস ও নিরাপত্তা" : "Profile & Security Settings"}>
      <div className="max-w-4xl mx-auto space-y-6 pb-12">
        
        {/* Header Hero Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#021307] via-[#042410] to-[#02180a] text-white p-6 md:p-8 shadow-xl border border-emerald-500/20">
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
            
            {/* Interactive Photo Upload Circle */}
            <div className="relative group shrink-0">
              <div className="w-28 h-28 md:w-32 md:h-32 rounded-full p-[3px] bg-gradient-to-tr from-amber-400 via-emerald-400 to-amber-500 shadow-xl overflow-hidden">
                {avatarSrc ? (
                  <img 
                    src={avatarSrc} 
                    alt={nameBn || name || 'User Profile'} 
                    className="w-full h-full object-cover object-top rounded-full bg-[#031c0b]" 
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-emerald-800 flex items-center justify-center text-amber-300 font-bold text-4xl shadow-inner">
                    {(nameBn || name || user?.role || 'U').charAt(0)}
                  </div>
                )}
              </div>

              {/* Upload Trigger Button Overlay */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title={isBangla ? "ছবি পরিবর্তন করুন" : "Change Photo"}
                className="absolute bottom-0 right-0 p-2.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white shadow-lg border-2 border-[#021307] transition-transform hover:scale-110 active:scale-95 cursor-pointer"
              >
                <Camera size={18} />
              </button>

              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*" 
                onChange={handlePhotoSelect} 
                className="hidden" 
              />
            </div>

            {/* User Meta Information */}
            <div className="text-center md:text-left space-y-2 flex-1">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <ShieldCheck size={14} className="text-emerald-400" />
                  {getRoleLabel(user?.role || '')}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-mono font-medium bg-white/10 text-amber-300 border border-white/10">
                  ID: {user?.user_id || 'AMMS-USER'}
                </span>
              </div>

              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                {isBangla ? (nameBn || name || 'ব্যবহারকারী') : (name || nameBn || 'User')}
              </h1>
              
              <p className="text-emerald-200/80 text-sm flex items-center justify-center md:justify-start gap-2">
                <Smartphone size={15} className="text-amber-400" />
                <span>লগইন নম্বর: <strong className="font-mono text-white">{phone || user?.phone}</strong></span>
              </p>

              <p className="text-xs text-emerald-400/70 pt-1">
                {isBangla 
                  ? '💡 যেকোনো সময় আপনার ছবি, মোবাইল নম্বর ও পাসওয়ার্ড পরিবর্তন করতে পারেন।' 
                  : '💡 You can update your profile photo, phone number, and password anytime.'}
              </p>
            </div>
          </div>
        </div>

        {/* 2-Column Grid: Left: Personal & Phone | Right: Password Change */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Form 1: Personal Info & Phone Number */}
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 pb-4 mb-6 border-b border-gray-100">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                  <UserIcon size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    {isBangla ? 'ব্যক্তিগত তথ্য ও ফোন নম্বর' : 'Personal Info & Phone'}
                  </h2>
                  <p className="text-xs text-gray-400">
                    {isBangla ? 'নাম, পদবি ও যোগাযোগের নম্বর পরিবর্তন' : 'Update your name and contact phone'}
                  </p>
                </div>
              </div>

              <form id="profile-form" onSubmit={handleSaveProfile} className="space-y-4">
                {/* Bangla Name */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    {isBangla ? 'আপনার পূর্ণ নাম (বাংলায়)' : 'Full Name (Bangla)'}
                  </label>
                  <input
                    type="text"
                    value={nameBn}
                    onChange={(e) => setNameBn(e.target.value)}
                    placeholder="যেমন: মাও. ওমর ফারুক"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:bg-white transition-all"
                  />
                </div>

                {/* English Name */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    {isBangla ? 'আপনার পূর্ণ নাম (ইংরেজিতে)' : 'Full Name (English)'}
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Maulana Omar Faruk"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:bg-white transition-all"
                  />
                </div>

                {/* Mobile Phone Number (Login Username) */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center justify-between">
                    <span>{isBangla ? 'লগইন মোবাইল নম্বর' : 'Login Mobile Number'}</span>
                    <span className="text-[11px] text-amber-600 font-normal">১১ ডিজিট</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="017XXXXXXXX"
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-amber-200/80 bg-amber-50/30 text-gray-900 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:bg-white transition-all"
                      required
                    />
                    <Phone size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-600" />
                  </div>
                  
                  {/* Warning Notice for Phone change */}
                  <div className="mt-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200/60 text-[11px] text-amber-800 leading-relaxed flex items-start gap-2">
                    <AlertTriangle size={15} className="text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      {isBangla 
                        ? 'সতর্কতা: মোবাইল নম্বরটি আপনার লগইন ইউজার আইডি। নম্বর পরিবর্তন করলে পরবর্তীতে এই নতুন নম্বর দিয়েই লগইন করতে হবে।' 
                        : 'Warning: This phone number is your login username. If changed, you must use this new number to login.'}
                    </span>
                  </div>
                </div>

                {/* Photo selected preview badge */}
                {photoFile && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
                    <span className="truncate">নতুন ছবি নির্বাচিত: {photoFile.name}</span>
                    <button 
                      type="button" 
                      onClick={() => { setPhotoFile(null); setPhotoPreview(null); }}
                      className="text-rose-600 font-semibold hover:underline shrink-0 ml-2"
                    >
                      বাতিল
                    </button>
                  </div>
                )}
              </form>
            </div>

            <div className="pt-6 mt-6 border-t border-gray-100">
              <button
                type="submit"
                form="profile-form"
                disabled={isSavingProfile}
                className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 shadow-md shadow-emerald-700/20 transition-all disabled:opacity-60 cursor-pointer"
              >
                {isSavingProfile ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>{isBangla ? 'সংরক্ষণ করা হচ্ছে...' : 'Saving...'}</span>
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    <span>{isBangla ? 'তথ্য ও ছবি আপডেট করুন' : 'Update Profile & Photo'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Form 2: Login Password Change */}
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 pb-4 mb-6 border-b border-gray-100">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                  <KeyRound size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    {isBangla ? 'লগইন পাসওয়ার্ড পরিবর্তন' : 'Change Login Password'}
                  </h2>
                  <p className="text-xs text-gray-400">
                    {isBangla ? 'নিরাপত্তার স্বার্থে নিয়মিত পাসওয়ার্ড পরিবর্তন করুন' : 'Update your secret login password'}
                  </p>
                </div>
              </div>

              <form id="password-form" onSubmit={handleChangePassword} className="space-y-4">
                {/* Current Old Password */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    {isBangla ? 'বর্তমান (পুরোনো) পাসওয়ার্ড' : 'Current Password'}
                  </label>
                  <div className="relative">
                    <input
                      type={showOld ? 'text' : 'password'}
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      placeholder={isBangla ? 'বর্তমান পাসওয়ার্ড লিখুন' : 'Enter current password'}
                      className="w-full pl-11 pr-11 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:bg-white transition-all"
                      required
                    />
                    <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <button
                      type="button"
                      onClick={() => setShowOld(!showOld)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      {showOld ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    {isBangla ? 'নতুন গোপন পাসওয়ার্ড' : 'New Password'}
                  </label>
                  <div className="relative">
                    <input
                      type={showNew ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder={isBangla ? 'কমপক্ষে ৬ অক্ষরের নতুন পাসওয়ার্ড' : 'At least 6 characters'}
                      className="w-full pl-11 pr-11 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:bg-white transition-all"
                      required
                    />
                    <KeyRound size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      {showNew ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    {isBangla ? 'নতুন পাসওয়ার্ড পুনরায় লিখুন' : 'Confirm New Password'}
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder={isBangla ? 'নতুন পাসওয়ার্ডটি আবার লিখুন' : 'Re-enter new password'}
                      className="w-full pl-11 pr-11 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:bg-white transition-all"
                      required
                    />
                    <CheckCircle2 size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-[11px] text-gray-500">
                  {isBangla
                    ? '💡 পাসওয়ার্ড পরিবর্তন সম্পন্ন হওয়ার সাথে সাথে তা অবিলম্বে কার্যকর হবে।'
                    : '💡 Password change takes effect immediately across all sessions.'}
                </div>
              </form>
            </div>

            <div className="pt-6 mt-6 border-t border-gray-100">
              <button
                type="submit"
                form="password-form"
                disabled={isChangingPassword}
                className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 shadow-md shadow-amber-700/20 transition-all disabled:opacity-60 cursor-pointer"
              >
                {isChangingPassword ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>{isBangla ? 'পরিবর্তন হচ্ছে...' : 'Changing...'}</span>
                  </>
                ) : (
                  <>
                    <Lock size={16} />
                    <span>{isBangla ? 'পাসওয়ার্ড নিশ্চিত করুন' : 'Confirm Password Change'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>

      </div>
    </AppLayout>
  );
}
