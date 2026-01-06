'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
    Banknote,
    Globe,
    Loader2,
    Mail,
    MapPin,
    MessageSquare,
    Phone,
    Plus,
    Save,
    Settings,
    Share2,
    TrendingUp,
    X
} from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

type TabType = 'general' | 'currencies' | 'social' | 'marketing';

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<TabType>('general');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        logo: '',
        brandName: '',
        siteDescription: '',
        contactEmail: '',
        contactPhone: '',
        address: '',
        whatsappPhone: '',
        currency: 'BDT',
        currencySymbol: '৳',
        supportedCurrencies: [] as Array<{ code: string; symbol: string; rate: number; name: string }>,
        socialLinks: {
            facebook: '',
            twitter: '',
            instagram: '',
            linkedin: '',
        },
        marketing: {
            googleAnalyticsId: '',
            googleSiteVerification: '',
            facebookPixelId: '',
            facebookDomainVerification: '',
        }
    });

    useEffect(() => {
        fetch('/api/settings')
            .then(res => res.json())
            .then(data => {
                if (data.success && data.data) {
                    setFormData({
                        logo: data.data.logo || '',
                        brandName: data.data.brandName || '',
                        siteDescription: data.data.siteDescription || '',
                        contactEmail: data.data.contactEmail || '',
                        contactPhone: data.data.contactPhone || '',
                        whatsappPhone: data.data.whatsappPhone || '',
                        address: data.data.address || '',
                        currency: data.data.currency || 'BDT',
                        currencySymbol: data.data.currencySymbol || '৳',
                        supportedCurrencies: data.data.supportedCurrencies || [],
                        socialLinks: {
                            facebook: data.data.socialLinks?.facebook || '',
                            twitter: data.data.socialLinks?.twitter || '',
                            instagram: data.data.socialLinks?.instagram || '',
                            linkedin: data.data.socialLinks?.linkedin || '',
                        },
                        marketing: {
                            googleAnalyticsId: data.data.marketing?.googleAnalyticsId || '',
                            googleSiteVerification: data.data.marketing?.googleSiteVerification || '',
                            facebookPixelId: data.data.marketing?.facebookPixelId || '',
                            facebookDomainVerification: data.data.marketing?.facebookDomainVerification || '',
                        }
                    });
                }
            })
            .finally(() => setLoading(false));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        const updatedData = {
            ...formData,
            currencySymbol: formData.supportedCurrencies.find(c => c.code === formData.currency)?.symbol || '$'
        };

        try {
            const res = await fetch('/api/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData),
            });

            if (res.ok) {
                toast.success('Settings saved successfully!');
            } else {
                toast.error('Failed to save settings');
            }
        } catch (error) {
            toast.error('Error saving settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
            </div>
        );
    }

    const tabs: { id: TabType; label: string; icon: any }[] = [
        { id: 'general', label: 'General Info', icon: Globe },
        { id: 'currencies', label: 'Localization', icon: Banknote },
        { id: 'social', label: 'Social Links', icon: Share2 },
        { id: 'marketing', label: 'Marketing & SEO', icon: TrendingUp },
    ];

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-brand-100 dark:bg-brand-900/30 rounded-2xl transition-all duration-300">
                        <Settings className="w-6 h-6 text-brand-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-display">Store Settings</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Configure your store's global parameters</p>
                    </div>
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={saving}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-brand-500/25 disabled:opacity-70 disabled:cursor-not-allowed group"
                >
                    {saving ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <>
                            <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            <span>Save Changes</span>
                        </>
                    )}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Navigation Sidebar */}
                <div className="lg:col-span-1 space-y-2">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group ${activeTab === tab.id
                                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20'
                                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-brand-600'
                                    }`}
                            >
                                <Icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-white' : 'text-slate-400 group-hover:text-brand-600'}`} />
                                <span className="font-semibold">{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Form Content Area */}
                <div className="lg:col-span-3">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 p-8 min-h-[500px]"
                    >
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <AnimatePresence mode="wait">
                                {activeTab === 'general' && (
                                    <motion.div
                                        key="general"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="space-y-6"
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <Globe className="w-5 h-5 text-brand-600" />
                                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">General Information</h2>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-1.5 md:col-span-2">
                                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Logo URL</label>
                                                <div className="flex gap-4 items-center">
                                                    {formData.logo && (
                                                        <img src={formData.logo} alt="Logo" className="w-16 h-16 object-contain rounded-lg border border-slate-200 dark:border-slate-700 bg-white" />
                                                    )}
                                                    <input
                                                        type="text"
                                                        value={formData.logo}
                                                        onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                                                        className="flex-1 px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                                                        placeholder="https://example.com/logo.png"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-1.5 md:col-span-2">
                                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Brand Name</label>
                                                <input
                                                    type="text"
                                                    value={formData.brandName}
                                                    onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                                                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                                                    placeholder="e.g., LuxeAudio"
                                                />
                                            </div>

                                            <div className="space-y-1.5 md:col-span-2">
                                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Site Description</label>
                                                <textarea
                                                    rows={3}
                                                    value={formData.siteDescription}
                                                    onChange={(e) => setFormData({ ...formData, siteDescription: e.target.value })}
                                                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all resize-none"
                                                    placeholder="Tell us about your store..."
                                                />
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                                    <Mail className="w-4 h-4 text-slate-400" /> Contact Email
                                                </label>
                                                <input
                                                    type="email"
                                                    value={formData.contactEmail}
                                                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                                                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                                                    placeholder="support@example.com"
                                                />
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                                    <Phone className="w-4 h-4 text-slate-400" /> Contact Phone
                                                </label>
                                                <input
                                                    type="tel"
                                                    value={formData.contactPhone}
                                                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                                                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                                                    placeholder="+1 (555) 000-0000"
                                                />
                                            </div>


                                            <div className="space-y-1.5">
                                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                                    <Phone className="w-4 h-4 text-slate-400" /> WhatsApp Phone
                                                </label>
                                                <input
                                                    type="tel"
                                                    value={formData.whatsappPhone}
                                                    onChange={(e) => setFormData({ ...formData, whatsappPhone: e.target.value })}
                                                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                                                    placeholder="+1 (555) 000-0000"
                                                />
                                            </div>

                                            <div className="space-y-1.5 md:col-span-2">
                                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                                    <MapPin className="w-4 h-4 text-slate-400" /> Address
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.address}
                                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                                                    placeholder="123 Store St, Sound City"
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === 'currencies' && (
                                    <motion.div
                                        key="currencies"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="space-y-6"
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <Banknote className="w-5 h-5 text-brand-600" />
                                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Localization & Currencies</h2>
                                        </div>

                                        {/* Supported Currencies List */}
                                        <div className="space-y-4">
                                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block">Manage Currencies</label>
                                            <div className="grid gap-4">
                                                {formData.supportedCurrencies?.map((currency, index) => (
                                                    <div
                                                        key={index}
                                                        className="bg-slate-50 dark:bg-slate-900/30 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 relative group transition-all"
                                                    >
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const newCurrencies = formData.supportedCurrencies.filter((_, i) => i !== index);
                                                                setFormData({ ...formData, supportedCurrencies: newCurrencies });
                                                            }}
                                                            className="absolute -top-2 -right-2 p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-10"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>

                                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                                            <div className="space-y-1">
                                                                <span className="text-[10px] font-bold uppercase text-slate-400">Name</span>
                                                                <input
                                                                    type="text"
                                                                    value={currency.name}
                                                                    onChange={(e) => {
                                                                        const next = [...formData.supportedCurrencies];
                                                                        next[index].name = e.target.value;
                                                                        setFormData({ ...formData, supportedCurrencies: next });
                                                                    }}
                                                                    className="w-full bg-white dark:bg-slate-800 border-none rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                                                                />
                                                            </div>
                                                            <div className="space-y-1">
                                                                <span className="text-[10px] font-bold uppercase text-slate-400">Code</span>
                                                                <input
                                                                    type="text"
                                                                    value={currency.code}
                                                                    onChange={(e) => {
                                                                        const next = [...formData.supportedCurrencies];
                                                                        next[index].code = e.target.value.toUpperCase();
                                                                        setFormData({ ...formData, supportedCurrencies: next });
                                                                    }}
                                                                    className="w-full bg-white dark:bg-slate-800 border-none rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                                                                />
                                                            </div>
                                                            <div className="space-y-1">
                                                                <span className="text-[10px] font-bold uppercase text-slate-400">Symbol</span>
                                                                <input
                                                                    type="text"
                                                                    value={currency.symbol}
                                                                    onChange={(e) => {
                                                                        const next = [...formData.supportedCurrencies];
                                                                        next[index].symbol = e.target.value;
                                                                        setFormData({ ...formData, supportedCurrencies: next });
                                                                    }}
                                                                    className="w-full bg-white dark:bg-slate-800 border-none rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                                                                />
                                                            </div>
                                                            <div className="space-y-1">
                                                                <span className="text-[10px] font-bold uppercase text-slate-400">Rate (vs Base)</span>
                                                                <input
                                                                    type="number"
                                                                    step="0.0001"
                                                                    value={currency.rate}
                                                                    onChange={(e) => {
                                                                        const next = [...formData.supportedCurrencies];
                                                                        next[index].rate = parseFloat(e.target.value);
                                                                        setFormData({ ...formData, supportedCurrencies: next });
                                                                    }}
                                                                    className="w-full bg-white dark:bg-slate-800 border-none rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setFormData({
                                                        ...formData,
                                                        supportedCurrencies: [
                                                            ...formData.supportedCurrencies,
                                                            { code: '', symbol: '', rate: 1, name: '' }
                                                        ]
                                                    });
                                                }}
                                                className="w-full py-4 border-2 border-dashed border-slate-200 dark:border-slate-700/50 rounded-2xl flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400 hover:border-brand-500 hover:text-brand-600 transition-all font-semibold"
                                            >
                                                <Plus className="w-5 h-5" />
                                                Add New Currency
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                                            <div className="space-y-1.5">
                                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Base Store Currency</label>
                                                <select
                                                    value={formData.currency}
                                                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                                                >
                                                    {formData.supportedCurrencies?.map(c => (
                                                        <option key={c.code} value={c.code}>{c.name} ({c.code})</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Default Symbol</label>
                                                <div className="px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 text-slate-500 font-bold">
                                                    {formData.supportedCurrencies?.find(c => c.code === formData.currency)?.symbol || '৳'}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === 'social' && (
                                    <motion.div
                                        key="social"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="space-y-6"
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <Share2 className="w-5 h-5 text-brand-600" />
                                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Social Presence</h2>
                                        </div>

                                        <div className="grid grid-cols-1 gap-6">
                                            {Object.keys(formData.socialLinks).map((key) => (
                                                <div key={key} className="space-y-1.5">
                                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 capitalize">{key} Profile URL</label>
                                                    <div className="relative group">
                                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors">
                                                            <Share2 className="w-4 h-4" />
                                                        </span>
                                                        <input
                                                            type="url"
                                                            value={(formData.socialLinks as any)[key]}
                                                            onChange={(e) => setFormData({
                                                                ...formData,
                                                                socialLinks: { ...formData.socialLinks, [key]: e.target.value }
                                                            })}
                                                            className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                                                            placeholder={`https://${key}.com/yourstore`}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === 'marketing' && (
                                    <motion.div
                                        key="marketing"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="space-y-6"
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <TrendingUp className="w-5 h-5 text-brand-600" />
                                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Analytics & Marketing</h2>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            {/* Google Analytics Section */}
                                            <div className="space-y-6 p-6 bg-slate-50 dark:bg-slate-900/40 rounded-3xl border border-slate-100 dark:border-slate-700/50">
                                                <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-700/50">
                                                    <Globe className="w-4 h-4 text-brand-500" />
                                                    <h3 className="font-bold text-slate-800 dark:text-slate-200">Google Services</h3>
                                                </div>
                                                <div className="space-y-4">
                                                    <div className="space-y-1.5">
                                                        <label className="text-[12px] font-bold text-slate-500 uppercase">Measurement ID</label>
                                                        <input
                                                            type="text"
                                                            value={formData.marketing.googleAnalyticsId}
                                                            onChange={(e) => setFormData({
                                                                ...formData,
                                                                marketing: { ...formData.marketing, googleAnalyticsId: e.target.value }
                                                            })}
                                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none text-sm"
                                                            placeholder="G-XXXXXXXXXX"
                                                        />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="text-[12px] font-bold text-slate-500 uppercase">Site Verification</label>
                                                        <input
                                                            type="text"
                                                            value={formData.marketing.googleSiteVerification}
                                                            onChange={(e) => setFormData({
                                                                ...formData,
                                                                marketing: { ...formData.marketing, googleSiteVerification: e.target.value }
                                                            })}
                                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none text-sm"
                                                            placeholder="Verification code"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Meta Section */}
                                            <div className="space-y-6 p-6 bg-slate-50 dark:bg-slate-900/40 rounded-3xl border border-slate-100 dark:border-slate-700/50">
                                                <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-700/50">
                                                    <MessageSquare className="w-4 h-4 text-blue-500" />
                                                    <h3 className="font-bold text-slate-800 dark:text-slate-200">Meta (Facebook)</h3>
                                                </div>
                                                <div className="space-y-4">
                                                    <div className="space-y-1.5">
                                                        <label className="text-[12px] font-bold text-slate-500 uppercase">Pixel ID</label>
                                                        <input
                                                            type="text"
                                                            value={formData.marketing.facebookPixelId}
                                                            onChange={(e) => setFormData({
                                                                ...formData,
                                                                marketing: { ...formData.marketing, facebookPixelId: e.target.value }
                                                            })}
                                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none text-sm"
                                                            placeholder="123456789..."
                                                        />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="text-[12px] font-bold text-slate-500 uppercase">Domain Verify</label>
                                                        <input
                                                            type="text"
                                                            value={formData.marketing.facebookDomainVerification}
                                                            onChange={(e) => setFormData({
                                                                ...formData,
                                                                marketing: { ...formData.marketing, facebookDomainVerification: e.target.value }
                                                            })}
                                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none text-sm"
                                                            placeholder="Verification string"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </form>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
