'use client';
import { Loader2, Lock } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getSession, signIn } from 'next-auth/react';
import toast from 'react-hot-toast';
import { UserRole } from '@/lib/enums/user-role.enum';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();
    const searchParams = useSearchParams();
    const impersonateToken = searchParams.get('impersonateToken');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await signIn('credentials', {
                username,
                password,
                redirect: false,
            });

            if (res?.error) {
                setError(res.error);
            }
            // Fetch the session after successful login
            const session = await getSession();
            if (session?.user) {
                const userRole = session.user.role;
                toast.success(`Logged in as ${userRole || UserRole.USER}`);
                if (userRole === UserRole.SUPER_ADMIN) {
                    router.push('/system');
                } else if ([UserRole.ADMIN, UserRole.STORE_MANAGER, UserRole.OPERATOR, UserRole.SUPPORT, UserRole.MARKETING, UserRole.EMPLOYEE].includes(userRole)) {
                    router.push('/admin');
                } else {
                    router.push('/');
                }
            } else {
                console.error("Session missing user after login success. Session content:", JSON.stringify(session));

            }


        } catch (err) {
            setError('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (impersonateToken) {
            const autoLogin = async () => {
                setLoading(true);
                setError('');
                try {
                    const res = await signIn('credentials', {
                        impersonateToken,
                        redirect: false,
                    });

                    if (res?.error) {
                        setError(res.error);
                        toast.error(res.error || 'Impersonation failed');
                        return;
                    }

                    const session = await getSession();
                    if (session?.user) {
                        const userRole = session.user.role;
                        toast.success(`Impersonated successfully as ${userRole || UserRole.USER}`);
                        if (userRole === UserRole.SUPER_ADMIN) {
                            router.push('/system');
                        } else if ([UserRole.ADMIN, UserRole.STORE_MANAGER, UserRole.OPERATOR, UserRole.SUPPORT, UserRole.MARKETING, UserRole.EMPLOYEE].includes(userRole)) {
                            router.push('/admin');
                        } else {
                            router.push('/');
                        }
                    } else {
                        setError('Impersonation failed: Session missing user context');
                    }
                } catch (err) {
                    setError('Something went wrong during impersonation');
                } finally {
                    setLoading(false);
                }
            };
            autoLogin();
        }
    }, [impersonateToken, router]);

    if (impersonateToken && loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
                <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 p-8 text-center space-y-6">
                    <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto text-amber-600 dark:text-amber-400 animate-pulse">
                        <Lock className="w-8 h-8" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-display">Establishing Secure Link</h2>
                        <p className="text-slate-500 dark:text-slate-400">Verifying administrative credentials and synchronizing session...</p>
                    </div>
                    <div className="flex justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
            <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 p-8">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-brand-100 dark:bg-brand-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-brand-600 dark:text-brand-400">
                        <Lock className="w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-display">Login</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">Sign in to your account</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    {error && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg text-center font-medium">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email or Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                            placeholder="Email or Username"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <div className="flex justify-end">
                        <Link
                            href="/forgot-password"
                            className="text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
                        >
                            Forgot your password?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-brand-500/25 flex justify-center items-center gap-2 disabled:opacity-70"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                        Don't have an account?{' '}
                        <Link href="/register" className="text-brand-600 hover:text-brand-700 font-semibold">
                            Create one
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
