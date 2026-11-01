"use client";
import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function Profile() {
    const { user, setUser } = useAuth();
    const { t, isBangla } = useLanguage();
    const [name, setName] = useState(user?.name_bn || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [loading, setLoading] = useState(false);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            toast.success(isBangla ? 'প্রোফাইল সফলভাবে আপডেট হয়েছে!' : 'Profile updated successfully!');
            // Update local user context for visual feedback
            if (user) {
                const updatedUser = { ...user, name_bn: name, phone: phone };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                setUser(updatedUser);
            }
            setLoading(false);
            window.location.reload();
        }, 1000);
    };

    if (!user) return null;

    return (
        <AppLayout title={isBangla ? "প্রোফাইল সেটিংস" : "Profile Settings"}>
            <div className="max-w-2xl mx-auto bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-20 h-20 rounded-full p-[2px] bg-gradient-to-tr from-amber-400 via-emerald-400 to-amber-500 shadow-md shrink-0 overflow-hidden">
                        {user.role === 'managing_director' ? (
                            <img src="/md.jpg" alt={user.name_bn || 'লাবিব ফোহায়ের'} className="w-full h-full object-cover object-top rounded-full" />
                        ) : user.role === 'principal' || user.name_bn?.includes('ফারুক') || !user.role ? (
                            <img src="/principal.jpg" alt="মাওলানা ওমর ফারুক" className="w-full h-full object-cover rounded-full" />
                        ) : (
                            <div className="w-full h-full rounded-full bg-emerald-50 flex items-center justify-center text-primary font-bold text-3xl">
                                {user.name_bn?.charAt(0) || 'U'}
                            </div>
                        )}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">
                            {isBangla ? (user.name_bn || 'Admin') : (user.name || user.name_bn || 'Admin')}
                        </h2>
                        <p className="text-gray-500 capitalize">{user.role.replace('_', ' ')}</p>
                    </div>
                </div>

                <form onSubmit={handleSave} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {isBangla ? 'আপনার নাম' : 'Your Full Name'}
                        </label>
                        <input type="text" value={name} onChange={e=>setName(e.target.value)} className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {isBangla ? 'মোবাইল নম্বর' : 'Mobile Number'}
                        </label>
                        <input type="text" value={phone} onChange={e=>setPhone(e.target.value)} className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-gray-50" readOnly />
                        <p className="text-xs text-gray-400 mt-1">
                            {isBangla ? 'লগইন আইডি পরিবর্তনযোগ্য নয়' : 'Login ID cannot be modified'}
                        </p>
                    </div>
                    <div className="pt-4">
                        <button type="submit" disabled={loading} className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary-dark transition-colors shadow-md disabled:opacity-70">
                            {loading ? (isBangla ? 'আপডেট হচ্ছে...' : 'Saving...') : (isBangla ? 'সেভ করুন' : 'Save Changes')}
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    )
}
