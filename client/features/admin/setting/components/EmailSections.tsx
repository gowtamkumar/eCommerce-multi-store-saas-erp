'use client';

import React from 'react';
import { Mail, Shield, Server, Lock, Send } from "lucide-react";

interface SMTPSectionProps {
    smtp: any;
    setFormData: (data: any) => void;
    formData: any;
}

export const SMTPServerSection: React.FC<SMTPSectionProps> = React.memo(({ smtp, setFormData, formData }) => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
        <div className="flex items-center gap-2 mb-2">
            <Server className="w-5 h-5 text-brand-600" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">Server Configuration</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">SMTP Host</label>
                <input
                    type="text"
                    value={smtp.host || ''}
                    onChange={(e) => setFormData({ ...formData, smtp: { ...smtp, host: e.target.value } })}
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 hover:border-brand-500/50 outline-none transition-all duration-200 font-display"
                    placeholder="smtp.example.com"
                />
            </div>
            <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">SMTP Port</label>
                <input
                    type="number"
                    value={smtp.port || ''}
                    onChange={(e) => setFormData({ ...formData, smtp: { ...smtp, port: parseInt(e.target.value) || 0 } })}
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 hover:border-brand-500/50 outline-none transition-all duration-200"
                    placeholder="587"
                />
            </div>
            <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Encryption (SSL/TLS)</label>
                <div className="flex items-center gap-4 h-[58px] bg-slate-50 dark:bg-slate-900/50 rounded-xl px-4 border border-slate-200 dark:border-slate-700">
                    <label className="flex items-center gap-2 cursor-pointer group">
                        <input
                            type="radio"
                            checked={smtp.secure === true}
                            onChange={() => setFormData({ ...formData, smtp: { ...smtp, secure: true } })}
                            className="w-4 h-4 text-brand-600 focus:ring-brand-500"
                        />
                        <span className="text-sm text-slate-700 dark:text-slate-300 font-medium group-hover:text-brand-600 transition-colors">SSL/TLS</span>
                    </label>
                    <div className="w-px h-6 bg-slate-200 dark:bg-slate-700" />
                    <label className="flex items-center gap-2 cursor-pointer group">
                        <input
                            type="radio"
                            checked={smtp.secure === false}
                            onChange={() => setFormData({ ...formData, smtp: { ...smtp, secure: false } })}
                            className="w-4 h-4 text-brand-600 focus:ring-brand-500"
                        />
                        <span className="text-sm text-slate-700 dark:text-slate-300 font-medium group-hover:text-brand-600 transition-colors">STARTTLS</span>
                    </label>
                </div>
            </div>
        </div>
    </div>
));

export const SMTPCredentialsSection: React.FC<SMTPSectionProps> = React.memo(({ smtp, setFormData, formData }) => (
    <div className="space-y-6 pt-6 border-t border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-right-4 duration-700">
        <div className="flex items-center gap-2 mb-2">
            <Lock className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">Authentication</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Username</label>
                <input
                    type="text"
                    value={smtp.user || ''}
                    onChange={(e) => setFormData({ ...formData, smtp: { ...smtp, user: e.target.value } })}
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 hover:border-brand-500/50 outline-none transition-all duration-200"
                    placeholder="user@example.com"
                />
            </div>
            <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Password</label>
                <input
                    type="password"
                    value={smtp.pass || ''}
                    onChange={(e) => setFormData({ ...formData, smtp: { ...smtp, pass: e.target.value } })}
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 hover:border-brand-500/50 outline-none transition-all duration-200"
                    placeholder="••••••••"
                />
            </div>
        </div>
    </div>
));

export const SenderIdentitySection: React.FC<SMTPSectionProps> = React.memo(({ smtp, setFormData, formData }) => (
    <div className="space-y-6 pt-6 border-t border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-right-4 duration-1000">
        <div className="flex items-center gap-2 mb-2">
            <Send className="w-5 h-5 text-emerald-600" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">Sender Identity</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Sender Email (From)</label>
                <input
                    type="email"
                    value={smtp.from || ''}
                    onChange={(e) => setFormData({ ...formData, smtp: { ...smtp, from: e.target.value } })}
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 hover:border-brand-500/50 outline-none transition-all duration-200"
                    placeholder="noreply@yourdomain.com"
                />
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-2 flex items-center gap-1.5">
                    <Shield className="w-3 h-3" /> System uses this as the canonical sender address
                </p>
            </div>
        </div>
    </div>
));
