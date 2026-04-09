'use client';

import { Globe, Mail, MapPin, Phone } from "lucide-react";
import React, { useEffect, useState } from 'react';
import { SectionProps } from '../types';

export const BrandIdentitySection: React.FC<SectionProps> = React.memo(({ formData, setFormData }) => (
    <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
        <div className="flex items-center gap-2 mb-2">
            <Globe className="w-5 h-5 text-brand-600" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">Brand Identity</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Logo URL</label>
                <div className="flex gap-4 items-center">
                    {formData.logo && (
                        <div className="relative group">
                            <img
                                src={formData.logo}
                                alt="Logo"
                                className="w-16 h-16 object-contain rounded-xl border border-slate-200 dark:border-slate-700 bg-white transition-transform group-hover:scale-110"
                            />
                        </div>
                    )}
                    <input
                        type="text"
                        value={formData.logo || ''}
                        onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                        className="flex-1 px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 hover:border-brand-500/50 outline-none transition-all duration-200 font-display"
                        placeholder="https://example.com/logo.png"
                    />
                </div>
            </div>
            <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Brand Name</label>
                <input
                    type="text"
                    value={formData.brandName || ''}
                    onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 hover:border-brand-500/50 outline-none transition-all duration-200 font-display"
                    placeholder="e.g., LuxeAudio"
                />
            </div>
        </div>
    </div>
));

export const ContactSection: React.FC<SectionProps> = React.memo(({ formData, setFormData }) => (
    <div className="space-y-6 pt-6 border-t border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-left-4 duration-700">
        <div className="flex items-center gap-2 mb-2">
            <Mail className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">Contact Channels</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-400" /> Email Support
                </label>
                <input
                    type="email"
                    value={formData.contactEmail || ''}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 hover:border-brand-500/50 outline-none transition-all duration-200"
                    placeholder="support@example.com"
                />
            </div>
            <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400" /> Hotline
                </label>
                <input
                    type="tel"
                    value={formData.contactPhone || ''}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 hover:border-brand-500/50 outline-none transition-all duration-200"
                    placeholder="+1 (555) 000-0000"
                />
            </div>
            <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400" /> WhatsApp Business
                </label>
                <input
                    type="tel"
                    value={formData.whatsappPhone || ''}
                    onChange={(e) => setFormData({ ...formData, whatsappPhone: e.target.value })}
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 hover:border-brand-500/50 outline-none transition-all duration-200"
                    placeholder="+1 (555) 000-0000"
                />
            </div>
            <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400" /> Primary Address
                </label>
                <input
                    type="text"
                    value={formData.address || ''}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 hover:border-brand-500/50 outline-none transition-all duration-200 font-display"
                    placeholder="123 Store St, Sound City"
                />
            </div>
        </div>
    </div>
));

export const SEOSection: React.FC<SectionProps> = React.memo(({ formData, setFormData }) => {
    const [localRobots, setLocalRobots] = useState(formData.robotsTxt || '');
    const [localDescription, setLocalDescription] = useState(formData.siteDescription || '');

    // Sync local state with prop
    useEffect(() => {
        setLocalRobots(formData.robotsTxt || '');
    }, [formData.robotsTxt]);

    useEffect(() => {
        setLocalDescription(formData.siteDescription || '');
    }, [formData.siteDescription]);

    // Debounced update to global state
    useEffect(() => {
        const timer = setTimeout(() => {
            if (localRobots !== formData.robotsTxt || localDescription !== formData.siteDescription) {
                setFormData({ 
                    ...formData, 
                    robotsTxt: localRobots,
                    siteDescription: localDescription 
                });
            }
        }, 800);
        return () => clearTimeout(timer);
    }, [localRobots, localDescription, formData, setFormData]);

    return (
        <div className="space-y-6 pt-6 border-t border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-left-4 duration-1000">
            <div className="flex items-center gap-2 mb-2">
                <Globe className="w-5 h-5 text-emerald-600" />
                <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">SEO & Search</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5 md:col-span-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Site Meta Description</label>
                    <textarea
                        rows={3}
                        value={localDescription}
                        onChange={(e) => setLocalDescription(e.target.value)}
                        className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 hover:border-brand-500/50 outline-none transition-all duration-200 resize-none font-display"
                        placeholder="Tell us about your store..."
                    />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        Robots.txt <span className="text-[10px] font-black uppercase text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">Auto-saving...</span>
                    </label>
                    <textarea
                        rows={5}
                        value={localRobots}
                        onChange={(e) => setLocalRobots(e.target.value)}
                        className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-800 text-emerald-400 font-mono text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all duration-200 resize-none"
                        placeholder="User-agent: *\nDisallow: /admin"
                    />
                </div>
            </div>
        </div>
    );
});
