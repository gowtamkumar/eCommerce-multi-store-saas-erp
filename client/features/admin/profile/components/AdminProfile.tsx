'use client';

import React, { useEffect, useState } from 'react';
import { User, Mail, Phone, MapPin, Shield, Key, Save, Loader2, Camera, Laptop, Smartphone, Trash2, ShieldAlert } from 'lucide-react';
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

  const [sessions, setSessions] = useState<any[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [sessionsLoading, setSessionsLoading] = useState(true);

  const fetchSessions = async () => {
    try {
      const res = await fetchAPI('/auth/sessions');
      const sessionsData = res.data || res;
      if (Array.isArray(sessionsData)) {
        setSessions(sessionsData.filter((s: any) => s.isActive));
      }
    } catch (error) {
      console.error('Failed to load sessions', error);
    } finally {
      setSessionsLoading(false);
    }
  };

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
          if (userData.sessionId) {
            setCurrentSessionId(userData.sessionId);
          }
        }
      } catch (error) {
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
    fetchSessions();
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

  const handleRevokeSession = async (sessionId: string) => {
    try {
      await fetchAPI(`/auth/sessions/${sessionId}`, {
        method: 'DELETE',
      });
      toast.success('Session revoked successfully');
      fetchSessions();
    } catch (error: any) {
      toast.error(error.message || 'Failed to revoke session');
    }
  };

  const handleRevokeOtherSessions = async () => {
    try {
      await fetchAPI('/auth/sessions/other', {
        method: 'DELETE',
      });
      toast.success('Other sessions revoked successfully');
      fetchSessions();
    } catch (error: any) {
      toast.error(error.message || 'Failed to revoke other sessions');
    }
  };

  const getDeviceDetails = (userAgent: string) => {
    if (!userAgent) return { os: 'Unknown OS', browser: 'Unknown Browser', device: 'desktop' };
    
    let os = 'Unknown OS';
    let browser = 'Unknown Browser';
    let device = 'desktop';

    const ua = userAgent.toLowerCase();

    if (ua.includes('windows')) os = 'Windows';
    else if (ua.includes('macintosh') || ua.includes('mac os')) os = 'macOS';
    else if (ua.includes('linux')) os = 'Linux';
    else if (ua.includes('android')) {
      os = 'Android';
      device = 'mobile';
    } else if (ua.includes('iphone') || ua.includes('ipad')) {
      os = 'iOS';
      device = 'mobile';
    }

    if (ua.includes('firefox')) browser = 'Firefox';
    else if (ua.includes('chrome') && !ua.includes('chromium')) browser = 'Chrome';
    else if (ua.includes('safari') && !ua.includes('chrome')) browser = 'Safari';
    else if (ua.includes('edge') || ua.includes('edg')) browser = 'Edge';
    else if (ua.includes('opera') || ua.includes('opr')) browser = 'Opera';

    return { os, browser, device };
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

          {/* Active Sessions UI Card */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-brand-500" /> Active User Sessions
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Manage and revoke your active sessions on other browsers or devices.
                </p>
              </div>
              {sessions.filter(s => s.id !== currentSessionId).length > 0 && (
                <button
                  type="button"
                  onClick={handleRevokeOtherSessions}
                  className="text-xs font-bold text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 border border-red-200 dark:border-red-800 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 px-3.5 py-2 rounded-xl transition-all self-start sm:self-center"
                >
                  Log out all other devices
                </button>
              )}
            </div>

            {sessionsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-6 text-slate-500 dark:text-slate-400 text-sm">
                No active sessions found.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {sessions.map((session) => {
                  const dev = getDeviceDetails(session.userAgent);
                  const isCurrent = session.id === currentSessionId;
                  
                  return (
                    <div key={session.id} className="py-4 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                      <div className="flex items-center gap-3.5">
                        <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100/50 dark:border-slate-700/30 text-slate-600 dark:text-slate-400">
                          {dev.device === 'mobile' ? (
                            <Smartphone className="w-5 h-5 text-brand-500" />
                          ) : (
                            <Laptop className="w-5 h-5 text-brand-500" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-white text-sm">
                              {dev.browser} on {dev.os}
                            </span>
                            {isCurrent && (
                              <span className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider border border-emerald-100 dark:border-emerald-900/30">
                                This Device
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mt-1 text-xs text-slate-500 dark:text-slate-400">
                            <span>{session.ipAddress || 'Unknown IP'}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                            <span>
                              Logged in: {new Date(session.createdAt).toLocaleDateString()} at{' '}
                              {new Date(session.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </div>

                      {!isCurrent && (
                        <button
                          type="button"
                          onClick={() => handleRevokeSession(session.id)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all"
                          title="Revoke session"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
