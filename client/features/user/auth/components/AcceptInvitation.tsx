'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Lock, Loader2, CheckCircle2, UserCheck, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface AcceptInvitationProps {
    token: string;
}

export default function AcceptInvitation({ token }: AcceptInvitationProps) {
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            const { fetchAPI } = await import('@/services/api');
            const res = await fetchAPI('/auth/accept-invitation', {
                method: 'POST',
                body: JSON.stringify({
                    token,
                    name: formData.name,
                    username: formData.username,
                    password: formData.password
                })
            });

            if (res.success) {
                setSuccess(true);
                toast.success('Account created successfully!');
                setTimeout(() => {
                    router.push('/login');
                }, 3000);
            } else {
                toast.error(res.message || 'Failed to accept invitation');
            }
        } catch (error: any) {
            toast.error(error.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="w-full max-w-md mx-auto p-8 text-center space-y-6 animate-in fade-in zoom-in-95 duration-500">
                <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white font-display">Welcome Aboard!</h1>
                <p className="text-slate-500 dark:text-slate-400 text-lg">
                    Your account has been created successfully. You are being redirected to login...
                </p>
                <div className="pt-4">
                    <Link 
                        href="/login"
                        className="inline-block px-8 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold shadow-lg shadow-brand-500/25 transition-all"
                    >
                        Go to Login Now
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md mx-auto p-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 relative overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 rounded-full -mr-16 -mt-16 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/5 rounded-full -ml-16 -mb-16 blur-3xl" />

                <div className="relative z-10">
                    <div className="mb-10">
                        <div className="w-14 h-14 bg-brand-50 dark:bg-brand-900/20 rounded-2xl flex items-center justify-center mb-6">
                            <ShieldCheck className="w-7 h-7 text-brand-600 dark:text-brand-400" />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white font-display leading-tight">
                            Join the Team
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
                            Set up your profile to start managing the store.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Enter your full name"
                                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Username</label>
                            <div className="relative group">
                                <UserCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                                <input
                                    type="text"
                                    required
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    placeholder="Choose a username"
                                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                                <input
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="••••••••"
                                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Confirm Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                                <input
                                    type="password"
                                    required
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    placeholder="••••••••"
                                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-brand-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mt-4"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>Create Account <UserCheck className="w-5 h-5" /></>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
