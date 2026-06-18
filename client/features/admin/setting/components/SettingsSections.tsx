'use client';

import { Globe, Mail, MapPin, Phone } from "lucide-react";
import React, { useEffect, useState } from 'react';
import { SectionProps } from '../types';
import ImageUploadField from "@/components/shared/ImageUploadField";
import { fetchAPI } from "@/services/api";
import { StoreSeoAiAssist } from './StoreSeoAiAssist';

export const BrandIdentitySection: React.FC<SectionProps> = React.memo(({ formData, setFormData }) => (
    <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
        <div className="flex items-center gap-2 mb-2">
            <Globe className="w-5 h-5 text-brand-600" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">Brand Identity</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5 md:col-span-2">
                <ImageUploadField
                    label="Store Logo"
                    value={formData.logo || ''}
                    onChange={(val) => setFormData({ ...formData, logo: val })}
                    uploadApi={fetchAPI}
                    aspectRatio="square"
                    showUrlInput={true}
                    description="Upload store logo or paste URL"
                />
            </div>
            <div className="space-y-1.5 md:col-span-2">
                <ImageUploadField
                    label="Favicon"
                    value={formData.favicon || ''}
                    onChange={(val) => setFormData({ ...formData, favicon: val })}
                    uploadApi={fetchAPI}
                    aspectRatio="square"
                    showUrlInput={true}
                    description="Upload browser tab icon or paste URL"
                />
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
            <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Timezone</label>
                <input
                    type="text"
                    value={formData.timezone || 'Asia/Dhaka'}
                    onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 hover:border-brand-500/50 outline-none transition-all duration-200"
                    placeholder="Asia/Dhaka"
                />
            </div>
            <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Locale</label>
                <input
                    type="text"
                    value={formData.locale || 'en-US'}
                    onChange={(e) => setFormData({ ...formData, locale: e.target.value })}
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 hover:border-brand-500/50 outline-none transition-all duration-200"
                    placeholder="en-US"
                />
            </div>
            <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Primary Color</label>
                <input
                    type="color"
                    value={formData.theme?.primaryColor || '#2563eb'}
                    onChange={(e) => setFormData({ ...formData, theme: { ...formData.theme, primaryColor: e.target.value } })}
                    className="w-full h-12 px-2 py-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50"
                />
            </div>
            <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Accent Color</label>
                <input
                    type="color"
                    value={formData.theme?.accentColor || '#0f172a'}
                    onChange={(e) => setFormData({ ...formData, theme: { ...formData.theme, accentColor: e.target.value } })}
                    className="w-full h-12 px-2 py-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50"
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
    const [localMetaTitle, setLocalMetaTitle] = useState(formData.metaTitle || '');

    useEffect(() => {
        setLocalRobots(formData.robotsTxt || '');
    }, [formData.robotsTxt]);

    useEffect(() => {
        setLocalDescription(formData.siteDescription || '');
    }, [formData.siteDescription]);

    useEffect(() => {
        setLocalMetaTitle(formData.metaTitle || '');
    }, [formData.metaTitle]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (
                localRobots !== formData.robotsTxt ||
                localDescription !== formData.siteDescription ||
                localMetaTitle !== formData.metaTitle
            ) {
                setFormData({
                    ...formData,
                    robotsTxt: localRobots,
                    siteDescription: localDescription,
                    metaTitle: localMetaTitle,
                });
            }
        }, 800);
        return () => clearTimeout(timer);
    }, [localRobots, localDescription, localMetaTitle, formData, setFormData]);

    return (
        <div className="space-y-6 pt-6 border-t border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-left-4 duration-1000">
            <div className="flex items-center gap-2 mb-2">
                <Globe className="w-5 h-5 text-emerald-600" />
                <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">SEO & Search</h2>
            </div>

            <StoreSeoAiAssist
                brandName={formData.brandName || ''}
                siteDescription={localDescription}
                onApply={(result) => {
                    setLocalMetaTitle(result.metaTitle);
                    setLocalDescription(result.metaDescription);
                    setFormData({
                        ...formData,
                        metaTitle: result.metaTitle,
                        siteDescription: result.metaDescription,
                    });
                }}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5 md:col-span-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Store Meta Title</label>
                    <input
                        type="text"
                        value={localMetaTitle}
                        onChange={(e) => setLocalMetaTitle(e.target.value)}
                        className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 hover:border-brand-500/50 outline-none transition-all duration-200 font-display"
                        placeholder="e.g. LuxeAudio | Premium Wireless Headphones"
                    />
                    <p className="text-[10px] text-slate-400">{localMetaTitle.length} / 60 chars recommended</p>
                </div>
                <div className="space-y-1.5 md:col-span-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Site Meta Description</label>
                    <textarea
                        rows={3}
                        value={localDescription}
                        onChange={(e) => setLocalDescription(e.target.value)}
                        className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 hover:border-brand-500/50 outline-none transition-all duration-200 resize-none font-display"
                        placeholder="Tell search engines what your store offers..."
                    />
                    <p className="text-[10px] text-slate-400">{localDescription.length} / 155 chars recommended</p>
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
