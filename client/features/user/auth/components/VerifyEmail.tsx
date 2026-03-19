'use client';

import { fetchAPI } from '@/services/api';
export const dynamic = 'force-dynamic';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function VerifyEmail() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Invalid or missing verification token.');
            return;
        }

        const verifyToken = async () => {
            try {
                await fetchAPI('/auth/verify', {
                    method: 'POST',
                    body: JSON.stringify({ token }),
                });
                setStatus('success');
                setMessage('Your email has been successfully verified! You can now log in to your account.');
            } catch (err: any) {
                setStatus('error');
                setMessage(err.message || 'Verification failed. The link may be expired or invalid.');
            }
        };

        verifyToken();
    }, [token]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
            <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 p-8 text-center">
                {status === 'loading' && (
                    <div className="space-y-4">
                        <Loader2 className="w-12 h-12 text-brand-600 animate-spin mx-auto" />
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Verifying your email...</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Please wait while we activate your account.</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="space-y-6">
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto text-green-600 dark:text-green-400">
                            <CheckCircle2 className="w-10 h-10" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Email Verified!</h1>
                        <p className="text-slate-600 dark:text-slate-300">{message}</p>
                        <Link
                            href="/login"
                            className="block w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-brand-500/25"
                        >
                            Back to Login
                        </Link>
                    </div>
                )}

                {status === 'error' && (
                    <div className="space-y-6">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto text-red-600 dark:text-red-400">
                            <XCircle className="w-10 h-10" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Verification Failed</h1>
                        <p className="text-red-600 dark:text-red-400 text-sm font-medium">{message}</p>
                        <div className="flex flex-col gap-3">
                            <Link
                                href="/register"
                                className="block w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl transition-all"
                            >
                                Register Again
                            </Link>
                            <Link
                                href="/login"
                                className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-sm font-medium"
                            >
                                Back to Login
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
