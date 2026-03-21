'use client';

import React, { useEffect, useState } from 'react';
import { User, Mail, Phone, MapPin, Shield, Key, Save, Loader2, Camera } from 'lucide-react';
import { fetchAPI } from '@/services/api';
import toast from 'react-hot-toast';

export default function AdminProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    username: '',
    phone: '',
    address: '',
    image: '',
  });

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetchAPI('/users/profile');
        const userData = res.data || res;
        if (userData) {
          setProfile({
            name: userData.name || '',
            email: userData.email || '',
            username: userData.username || '',
            phone: userData.phone || '',
            address: userData.address || '',
            image: userData.image || '',
          });
        }
      } catch (error) {
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetchAPI('/users/profile', {
        method: 'PATCH',
        body: JSON.stringify(profile),
      });
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setSaving(true);
    try {
      await fetchAPI('/users/profile/password', {
        method: 'PATCH',
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
        }),
      });
      toast.success('Password updated successfully');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      toast.error(error.message || 'Failed to update password');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
          <User className="w-8 h-8 text-brand-500" /> My Profile
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Manage your personal information and security settings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Col - Avatar & Overview */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm text-center">
            <div className="relative w-32 h-32 mx-auto mb-6">
              {profile.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.image} alt={profile.name} className="w-full h-full rounded-full object-cover ring-4 ring-brand-50 dark:ring-brand-900/20" />
              ) : (
                <div className="w-full h-full rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-4xl font-black ring-4 ring-brand-50 dark:ring-brand-900/20">
                  {profile.name.charAt(0).toUpperCase()}
                </div>
              )}
              <button className="absolute bottom-1 right-1 p-2 bg-white dark:bg-slate-700 rounded-full shadow-lg border border-slate-100 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:text-brand-500 transition-colors">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{profile.name}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">@{profile.username}</p>
            <div className="mt-6 pt-6 border-t border-slate-50 dark:border-slate-700/50 space-y-3">
               <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 justify-center">
                  <Mail className="w-4 h-4 text-brand-500" /> {profile.email}
               </div>
               {profile.phone && (
                 <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 justify-center">
                    <Phone className="w-4 h-4 text-brand-500" /> {profile.phone}
                 </div>
               )}
            </div>
          </div>
        </div>

        {/* Right Col - Forms */}
        <div className="md:col-span-2 space-y-8">
          {/* Profile Info Form */}
          <form onSubmit={handleProfileUpdate} className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-brand-500" /> Personal Information
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Profile Image URL</label>
                <div className="relative">
                  <Camera className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={profile.image}
                    onChange={(e) => setProfile({ ...profile, image: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                    placeholder="https://..."
                  />
                </div>
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <textarea
                    value={profile.address}
                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold transition-all disabled:opacity-50 shadow-lg shadow-brand-500/20"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
            </div>
          </form>

          {/* Password Change Form */}
          <form onSubmit={handlePasswordUpdate} className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Key className="w-5 h-5 text-amber-500" /> Change Password
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Current Password</label>
                <input
                  type="password"
                  value={passwords.currentPassword}
                  onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">New Password</label>
                  <input
                    type="password"
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwords.confirmPassword}
                    onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold transition-all disabled:opacity-50 shadow-lg"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                Update Password
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
