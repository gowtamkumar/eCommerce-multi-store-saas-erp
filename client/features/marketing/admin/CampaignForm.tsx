'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, MessageSquare, Send, Calendar, Save, Percent, Image, Users } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Campaign, CampaignType } from '../types';
import { createCampaign } from '@/services/campaign';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';

// Dynamically import RichEditor as it's quite heavy
const RichEditor = dynamic(() => import('@/components/shared/RichEditor'), { ssr: false });

interface CampaignFormProps {
    campaign?: Campaign | null;
    onClose: () => void;
    onSuccess: () => void;
}

export default function CampaignForm({ campaign, onClose, onSuccess }: CampaignFormProps) {
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<CampaignType>(campaign?.type || CampaignType.EMAIL);
    const [formData, setFormData] = useState({
        name: campaign?.name || '',
        subject: campaign?.messages?.[0]?.subject || '',
        htmlContent: campaign?.messages?.[0]?.htmlContent || '',
        text: campaign?.messages?.[0]?.text || '',
        title: campaign?.messages?.[0]?.title || '',
        body: campaign?.messages?.[0]?.body || '',
        imageUrl: campaign?.messages?.[0]?.imageUrl || '',
        scheduleTime: campaign?.scheduleTime ? new Date(campaign.scheduleTime).toISOString().slice(0, 16) : '',
        targetUsers: campaign?.targetUsers ?? true,
        targetSubscribers: campaign?.targetSubscribers ?? false,
        targetLeads: campaign?.targetLeads ?? false,
    });

    const isEdit = !!campaign;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                ...formData,
                type: activeTab,
            };

            const res = await createCampaign(payload);
            if (res.success) {
                toast.success(isEdit ? 'Campaign updated' : 'Campaign created successfully');
                onSuccess();
            } else {
                toast.error(res.message || 'Failed to save campaign');
            }
        } catch (error: any) {
            toast.error(error instanceof Error ? error.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                onClick={onClose}
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
                {/* Header */}
                <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
                            {isEdit ? 'Edit Campaign' : 'Create Campaign'}
                        </h2>
                        <p className="text-xs text-slate-500 font-medium tracking-wide">{isEdit ? 'Refine your marketing message' : 'Reach your audience across multiple channels'}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
                        <X className="w-6 h-6 text-slate-400" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8">
                    <form id="campaignForm" onSubmit={handleSubmit} className="space-y-8">
                        {/* Channel Selection */}
                        {!isEdit && (
                            <div className="grid grid-cols-3 gap-4">
                                {[
                                    { type: CampaignType.EMAIL, icon: Mail, label: 'Email' },
                                    { type: CampaignType.SMS, icon: MessageSquare, label: 'SMS' },
                                    { type: CampaignType.PUSH, icon: Send, label: 'Push' },
                                ].map((item) => (
                                    <button
                                        key={item.type}
                                        type="button"
                                        onClick={() => setActiveTab(item.type)}
                                        className={`flex flex-col items-center gap-3 p-6 rounded-3xl border-2 transition-all ${
                                            activeTab === item.type 
                                            ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/10 text-brand-600' 
                                            : 'border-slate-100 dark:border-slate-800 text-slate-400 hover:border-slate-200 dark:hover:border-slate-700'
                                        }`}
                                    >
                                        <item.icon className={`w-8 h-8 ${activeTab === item.type ? 'text-brand-500' : ''}`} />
                                        <span className="text-sm font-bold uppercase tracking-widest">{item.label}</span>
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Left Column: Basic Info */}
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Campaign Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g. Summer Flash Sale 2024"
                                        className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-transparent focus:border-brand-500 focus:bg-white dark:focus:bg-slate-800 outline-none transition-all font-bold text-slate-900 dark:text-white"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Scheduling (Optional)</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            type="datetime-local"
                                            value={formData.scheduleTime}
                                            onChange={(e) => setFormData({ ...formData, scheduleTime: e.target.value })}
                                            className="w-full pl-14 pr-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-transparent focus:border-brand-500 focus:bg-white dark:focus:bg-slate-800 outline-none transition-all font-bold text-slate-900 dark:text-white"
                                        />
                                    </div>
                                    <p className="text-[10px] text-slate-400 ml-1">Leave empty to send as soon as you hit &quot;Start Campaign&quot; in the list.</p>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Target Audience</label>
                                    <div className="grid grid-cols-1 gap-3">
                                        {[
                                            { id: 'targetUsers', label: 'Registered Users', count: 'All Active' },
                                            { id: 'targetSubscribers', label: 'Newsletter Subscribers', count: 'Subscribers' },
                                            { id: 'targetLeads', label: 'Marketing Leads', count: 'Contact Form' },
                                        ].map((audience) => (
                                            <label 
                                                key={audience.id}
                                                className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                                                    (formData as any)[audience.id]
                                                    ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-900/10 text-brand-600'
                                                    : 'border-slate-100 dark:border-slate-800 text-slate-400 hover:border-slate-200'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <input 
                                                        type="checkbox"
                                                        className="hidden"
                                                        checked={(formData as any)[audience.id]}
                                                        onChange={(e) => setFormData({ ...formData, [audience.id]: e.target.checked })}
                                                    />
                                                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                                                        (formData as any)[audience.id] ? 'bg-brand-500 border-brand-500' : 'border-slate-300 dark:border-slate-700'
                                                    }`}>
                                                        {(formData as any)[audience.id] && <div className="w-2 h-2 bg-white rounded-full" />}
                                                    </div>
                                                    <span className="text-sm font-bold">{audience.label}</span>
                                                </div>
                                                <span className="text-[10px] font-black uppercase opacity-50">{audience.count}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Channel Specific Content */}
                            <div className="space-y-6">
                                <AnimatePresence mode="wait">
                                    {activeTab === CampaignType.EMAIL && (
                                        <motion.div 
                                            key="email"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="space-y-6"
                                        >
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Subject</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={formData.subject}
                                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                                    placeholder="Don't miss out on these deals!"
                                                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-transparent focus:border-brand-500 outline-none transition-all font-bold text-slate-900 dark:text-white"
                                                />
                                            </div>
                                        </motion.div>
                                    )}

                                    {activeTab === CampaignType.SMS && (
                                        <motion.div 
                                            key="sms"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="space-y-2"
                                        >
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">SMS Content</label>
                                            <textarea
                                                required
                                                rows={4}
                                                value={formData.text}
                                                onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                                                placeholder="Enter your text message..."
                                                className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-transparent focus:border-brand-500 outline-none transition-all font-bold text-slate-900 dark:text-white resize-none"
                                            />
                                            <div className="flex justify-end pr-2">
                                                <span className="text-[10px] font-black text-slate-400 tracking-widest">{formData.text.length} / 160 chars</span>
                                            </div>
                                        </motion.div>
                                    )}

                                    {activeTab === CampaignType.PUSH && (
                                        <motion.div 
                                            key="push"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="space-y-6"
                                        >
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Notification Title</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={formData.title}
                                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                    placeholder="Breaking News!"
                                                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-transparent focus:border-brand-500 outline-none transition-all font-bold text-slate-900 dark:text-white"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Message Body</label>
                                                <textarea
                                                    required
                                                    rows={3}
                                                    value={formData.body}
                                                    onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                                                    placeholder="The sale you've been waiting for is live..."
                                                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-transparent focus:border-brand-500 outline-none transition-all font-bold text-slate-900 dark:text-white resize-none"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Image URL (Optional)</label>
                                                <div className="relative">
                                                    <Image className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                                    <input
                                                        type="text"
                                                        value={formData.imageUrl}
                                                        onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                                                        placeholder="https://example.com/banner.png"
                                                        className="w-full pl-14 pr-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-transparent focus:border-brand-500 outline-none transition-all font-bold text-slate-900 dark:text-white"
                                                    />
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Email Content Editor (Full Width) */}
                        {activeTab === CampaignType.EMAIL && (
                            <div className="space-y-4 pt-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 text-center block">Email Body Design</label>
                                <div className="rounded-[2rem] border-2 border-slate-100 dark:border-slate-800 overflow-hidden min-h-[400px]">
                                    <RichEditor
                                        content={formData.htmlContent}
                                        onChange={(content: string) => setFormData({ ...formData, htmlContent: content })}
                                    />
                                </div>
                            </div>
                        )}
                    </form>
                </div>

                {/* Footer Actions */}
                <div className="px-8 py-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-inherit flex items-center justify-between">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="campaignForm"
                        disabled={loading}
                        className="flex items-center gap-3 px-10 py-5 bg-brand-600 hover:bg-brand-700 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-brand-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                {isEdit ? 'Update Details' : 'Initialize Campaign'}
                            </>
                        )}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
