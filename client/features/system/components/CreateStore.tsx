'use client';

import { fetchAPI } from '@/services/api';
import { publicSaasApi } from '@/services/publicSaasApi';
import { AnimatePresence, motion } from 'framer-motion';
import {
    ArrowRight,
    CheckCircle2,
    ChevronLeft,
    Clock,
    Coins,
    CreditCard,
    Globe,
    Layout,
    Loader2,
    Lock,
    Mail,
    MapPin,
    ShieldCheck,
    Sparkles,
    Store,
    User,
    Zap
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { SubscriptionPlan } from '../types/subscription-plan';

const COUNTRY_DEFAULTS = {
    US: { currency: 'USD', timezone: 'America/New_York' },
    GB: { currency: 'GBP', timezone: 'Europe/London' },
    DE: { currency: 'EUR', timezone: 'Europe/Berlin' },
    FR: { currency: 'EUR', timezone: 'Europe/Paris' },
    IN: { currency: 'INR', timezone: 'Asia/Kolkata' },
    BD: { currency: 'BDT', timezone: 'Asia/Dhaka' },
};

export default function CreateStore() {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [fetchingPlans, setFetchingPlans] = useState(true);
    const searchParams = useSearchParams();
    const planIdFromUrl = searchParams.get('planId');
    const cycleFromUrl = searchParams.get('cycle');

    const [formData, setFormData] = useState({
        storeName: '',
        subdomain: '',
        planId: '',
        subscriptionBillingCycle: cycleFromUrl || 'monthly',
        name: '',
        email: '',
        username: '',
        password: '',
        country: 'US',
        baseCurrency: 'USD',
        timezone: 'America/New_York',
    });

    useEffect(() => {
        async function getPlans() {
            try {
                const res = await publicSaasApi('/plans');
                if (res.success) {
                    setPlans(res.data);
                    const selectedPlanId = planIdFromUrl || (res.data.length > 0 ? res.data[0].id : '');
                    if (selectedPlanId) {
                        setFormData(prev => ({ ...prev, planId: selectedPlanId }));
                    }
                }
            } catch (err) {
                console.error('Failed to fetch plans', err);
            } finally {
                setFetchingPlans(false);
            }
        }
        getPlans();
    }, [planIdFromUrl]);

    const handleSubdomainChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
        setFormData({ ...formData, subdomain: value });
    };

    const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const country = e.target.value;
        const defaults = COUNTRY_DEFAULTS[country as keyof typeof COUNTRY_DEFAULTS] || { currency: 'USD', timezone: 'America/New_York' };
        setFormData({
            ...formData,
            country,
            baseCurrency: defaults.currency,
            timezone: defaults.timezone,
        });
    };

    const nextStep = () => {
        if (step === 1 && (!formData.storeName || !formData.subdomain)) {
            setError('Please name your store and choose a URL');
            return;
        }
        if (step === 2 && !formData.planId) {
            setError('Select a plan to continue');
            return;
        }
        setError('');
        setStep(step + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const prevStep = () => {
        setStep(step - 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const data = await fetchAPI('/onboard', {
                method: 'POST',
                body: JSON.stringify(formData),
            });

            if (data.success && data.subdomain) {
                const protocol = window.location.protocol;
                const hostname = window.location.hostname;
                const port = window.location.port ? `:${window.location.port}` : '';
                const adminUrl = `${protocol}//${data.subdomain}.${hostname}${port}/login`;
                window.location.href = adminUrl;
            } else {
                setError(data.message || 'Onboarding failed. Please try again.');
            }
        } catch {
            setError('Network error. Check your connection.');
        } finally {
            setLoading(false);
        }
    };

    const steps = [
        { id: 1, title: 'Store Details', icon: Store },
        { id: 2, title: 'Plan', icon: CreditCard },
        { id: 3, title: 'Account', icon: ShieldCheck },
    ];

    return (
        <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-[radial-gradient(circle_at_top_right,var(--color-brand-50),transparent_50%)] dark:bg-[radial-gradient(circle_at_top_right,var(--color-brand-900),transparent_50%)]">
            <div className="max-w-6xl mx-auto">
                {/* Header & Progress */}
                <div className="mb-12 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 text-xs font-bold uppercase tracking-widest mb-4"
                    >
                        <Sparkles className="w-3 h-3" />
                        Business Launchpad
                    </motion.div>
                    <h1 className="text-4xl md:text-5xl font-black font-display text-slate-900 dark:text-white mb-6">
                        Configure Your <span className="text-gradient">Empire</span>
                    </h1>

                    {/* Progress Steps */}
                    <div className="flex justify-center items-center max-w-xl mx-auto mt-10">
                        {steps.map((s, i) => (
                            <div key={s.id} className="flex items-center flex-1 last:flex-none">
                                <div className="relative flex flex-col items-center">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${step >= s.id
                                            ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/40 scale-100'
                                            : 'bg-white dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700 scale-90'
                                        }`}>
                                        <s.icon className={`w-5 h-5 ${step === s.id ? 'animate-bounce-subtle' : ''}`} />
                                    </div>
                                    <span className={`absolute -bottom-7 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${step >= s.id ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400'
                                        }`}>
                                        {s.title}
                                    </span>
                                </div>
                                {i < steps.length - 1 && (
                                    <div className="flex-1 h-[2px] mx-4 bg-slate-200 dark:bg-slate-800 relative overflow-hidden">
                                        <motion.div
                                            initial={{ width: '0%' }}
                                            animate={{ width: step > s.id ? '100%' : '0%' }}
                                            className="absolute inset-0 bg-brand-500"
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Content Card */}
                <div className="glass-card rounded-[2.5rem] overflow-hidden grid lg:grid-cols-12 gap-0">
                    {/* Left Feature Column */}
                    <div className="lg:col-span-4 bg-slate-900 dark:bg-black/40 p-10 text-white relative flex flex-col justify-between overflow-hidden">
                        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-brand-600/20 blur-[100px] rounded-full" />

                        <div className="relative z-10">
                            <div className="w-14 h-14 bg-brand-500/20 rounded-2xl backdrop-blur-xl flex items-center justify-center mb-8 border border-white/10">
                                <Zap className="w-7 h-7 text-brand-400" />
                            </div>
                            <h2 className="text-3xl font-bold mb-6 leading-[1.1]">Everything you need to <span className="text-brand-400">succeed.</span></h2>

                            <div className="space-y-6">
                                {[
                                    { title: 'Global Edge', desc: 'Enterprise-grade CDN for speed.' },
                                    { title: 'Secure Vault', desc: 'Military-grade data protection.' },
                                    { title: 'Auto Scaling', desc: 'Handles millions of requests.' },
                                    { title: 'AI Optimized', desc: 'Smart conversion features.' }
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-4 group">
                                        <div className="mt-1 w-5 h-5 rounded-full bg-brand-500/20 flex items-center justify-center border border-brand-500/30 transition-all group-hover:bg-brand-500 group-hover:border-brand-500">
                                            <CheckCircle2 className="w-3 h-3 text-brand-400 group-hover:text-white" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm">{item.title}</h4>
                                            <p className="text-xs text-slate-400 mt-1">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="relative z-10 mt-12 bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md">
                            <div className="flex items-center gap-3">
                                <div className="flex -space-x-2">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] font-bold">
                                            {String.fromCharCode(64 + i)}
                                        </div>
                                    ))}
                                </div>
                                <div className="text-[10px] font-medium text-slate-400">
                                    Trusted by <span className="text-white font-bold">2,500+</span> businesses worldwide
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Form Column */}
                    <div className="lg:col-span-8 p-8 md:p-14 bg-white/40 dark:bg-transparent">
                        <form onSubmit={handleSubmit}>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-4 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm rounded-2xl mb-8 flex items-center gap-3"
                                >
                                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                    {error}
                                </motion.div>
                            )}

                            <AnimatePresence mode="wait">
                                {step === 1 && (
                                    <motion.div
                                        key="step1"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-8"
                                    >
                                        <div className="space-y-6">
                                            <div className="group">
                                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">Store Name</label>
                                                <div className="relative">
                                                    <Layout className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                                                    <input
                                                        type="text"
                                                        required
                                                        value={formData.storeName}
                                                        onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                                                        className="w-full pl-14 pr-6 py-5 rounded-[1.25rem] border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all shadow-sm"
                                                        placeholder="e.g. Luxe Boutique"
                                                    />
                                                </div>
                                            </div>

                                            <div className="group">
                                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">Public URL</label>
                                                <div className="relative">
                                                    <Globe className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                                                    <input
                                                        type="text"
                                                        required
                                                        value={formData.subdomain}
                                                        onChange={handleSubdomainChange}
                                                        className="w-full pl-14 pr-6 py-5 rounded-[1.25rem] border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all shadow-sm"
                                                        placeholder="shop-name"
                                                    />
                                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase text-slate-500 tracking-wider">
                                                        .luxesaas.com
                                                    </div>
                                                </div>
                                                {formData.subdomain && (
                                                    <motion.p
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        className="mt-3 text-xs text-slate-500 ml-1 flex items-center gap-2"
                                                    >
                                                        <CheckCircle2 className="w-3 h-3 text-green-500" />
                                                        Your store will be live at <span className="text-brand-600 dark:text-brand-400 font-bold underline">{formData.subdomain}.luxesaas.com</span>
                                                    </motion.p>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                <div className="group">
                                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">Country</label>
                                                    <div className="relative">
                                                        <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                                                        <select
                                                            value={formData.country}
                                                            onChange={handleCountryChange}
                                                            className="w-full pl-14 pr-6 py-5 rounded-[1.25rem] border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all shadow-sm appearance-none"
                                                        >
                                                            <option value="US">United States</option>
                                                            <option value="GB">United Kingdom</option>
                                                            <option value="DE">Germany</option>
                                                            <option value="FR">France</option>
                                                            <option value="IN">India</option>
                                                            <option value="BD">Bangladesh</option>
                                                        </select>
                                                    </div>
                                                </div>

                                                <div className="group">
                                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">Base Currency</label>
                                                    <div className="relative">
                                                        <Coins className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                                                        <select
                                                            value={formData.baseCurrency}
                                                            onChange={(e) => setFormData({ ...formData, baseCurrency: e.target.value })}
                                                            className="w-full pl-14 pr-6 py-5 rounded-[1.25rem] border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all shadow-sm appearance-none"
                                                        >
                                                            <option value="USD">USD ($)</option>
                                                            <option value="GBP">GBP (£)</option>
                                                            <option value="EUR">EUR (€)</option>
                                                            <option value="INR">INR (₹)</option>
                                                            <option value="BDT">BDT (৳)</option>
                                                        </select>
                                                    </div>
                                                </div>

                                                <div className="group">
                                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">Timezone</label>
                                                    <div className="relative">
                                                        <Clock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                                                        <select
                                                            value={formData.timezone}
                                                            onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                                                            className="w-full pl-14 pr-6 py-5 rounded-[1.25rem] border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all shadow-sm appearance-none"
                                                        >
                                                            <option value="America/New_York">America/New York</option>
                                                            <option value="Europe/London">Europe/London</option>
                                                            <option value="Europe/Berlin">Europe/Berlin</option>
                                                            <option value="Europe/Paris">Europe/Paris</option>
                                                            <option value="Asia/Kolkata">Asia/Kolkata</option>
                                                            <option value="Asia/Dhaka">Asia/Dhaka</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={nextStep}
                                            className="w-full py-5 bg-brand-600 hover:bg-brand-700 text-white font-black rounded-2xl transition-all shadow-xl shadow-brand-500/25 flex justify-center items-center gap-3 group active:scale-[0.98]"
                                        >
                                            Explore Plans
                                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </motion.div>
                                )}

                                {step === 2 && (
                                    <motion.div
                                        key="step2"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-8"
                                    >
                                        <div className="flex justify-center flex-col items-center gap-4">
                                            <div className="bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl flex gap-1 border border-slate-200 dark:border-slate-800">
                                                {['monthly', 'yearly'].map((c) => (
                                                    <button
                                                        key={c}
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, subscriptionBillingCycle: c })}
                                                        className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all relative overflow-hidden ${formData.subscriptionBillingCycle === c
                                                            ? 'bg-white dark:bg-brand-600 text-brand-600 dark:text-white shadow-md'
                                                            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                                            }`}
                                                    >
                                                        {c}
                                                        {c === 'yearly' && (
                                                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                                            </span>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                            {formData.subscriptionBillingCycle === 'yearly' && (
                                                <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest">
                                                    Save up to 20% with yearly billing
                                                </p>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {fetchingPlans ? (
                                                <div className="col-span-full py-20 flex flex-col items-center gap-4">
                                                    <div className="relative">
                                                        <Loader2 className="w-10 h-10 animate-spin text-brand-600" />
                                                        <div className="absolute inset-0 blur-lg bg-brand-600/30 -z-10 animate-pulse" />
                                                    </div>
                                                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Pricing data is arriving...</p>
                                                </div>
                                            ) : (
                                                plans.map((plan) => (
                                                    <div
                                                        key={plan.id}
                                                        onClick={() => setFormData({ ...formData, planId: plan.id })}
                                                        className={`relative p-6 rounded-4xl border-2 cursor-pointer transition-all duration-300 ${formData.planId === plan.id
                                                            ? 'border-brand-500 bg-brand-500/5 dark:bg-brand-500/10 shadow-[0_0_40px_rgba(14,165,233,0.1)]'
                                                            : 'border-slate-100 dark:border-slate-800 hover:border-brand-200 dark:hover:border-slate-700'}`}
                                                    >
                                                        {formData.planId === plan.id && (
                                                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-brand-600 text-white text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-xl">
                                                                <CheckCircle2 className="w-3 h-3" />
                                                                Selected
                                                            </div>
                                                        )}
                                                        <div className="flex flex-col gap-4">
                                                            <div className="flex justify-between items-start">
                                                                <div>
                                                                    <h3 className="font-black text-xl text-slate-900 dark:text-white">{plan.name}</h3>
                                                                    <p className="text-xs font-medium text-slate-400 mt-1 line-clamp-1">{plan.description}</p>
                                                                </div>
                                                                <div className="text-right">
                                                                    <span className="text-2xl font-black text-slate-900 dark:text-white leading-none">
                                                                        ${formData.subscriptionBillingCycle === 'yearly' ? (plan.yearlyPrice ?? plan.price) : (plan.monthlyPrice ?? plan.price)}
                                                                    </span>
                                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">
                                                                        /{formData.subscriptionBillingCycle === 'yearly' ? 'yr' : 'mo'}
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            <div className="space-y-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
                                                                {plan.features?.slice(0, 3).map((f: string, idx: number) => (
                                                                    <div key={idx} className="flex items-center gap-2 text-[11px] font-bold text-slate-600 dark:text-slate-400">
                                                                        <CheckCircle2 className="w-3.5 h-3.5 text-brand-500" />
                                                                        {f}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>

                                        <div className="flex gap-4 pt-4">
                                            <button
                                                type="button"
                                                onClick={prevStep}
                                                className="flex-1 py-5 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 font-black rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                                            >
                                                <ChevronLeft className="w-5 h-5" />
                                                Back
                                            </button>
                                            <button
                                                type="button"
                                                onClick={nextStep}
                                                className="flex-2 py-5 bg-brand-600 hover:bg-brand-700 text-white font-black rounded-2xl transition-all shadow-xl shadow-brand-500/25 flex justify-center items-center gap-3 group active:scale-[0.98]"
                                            >
                                                Next Details
                                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                            </button>
                                        </div>
                                    </motion.div>
                                )}

                                {step === 3 && (
                                    <motion.div
                                        key="step3"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-8"
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="group">
                                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">Full Name</label>
                                                <div className="relative">
                                                    <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                                                    <input
                                                        type="text"
                                                        required
                                                        value={formData.name}
                                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                        className="w-full pl-14 pr-6 py-5 rounded-[1.25rem] border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all shadow-sm"
                                                        placeholder="John Sterling"
                                                    />
                                                </div>
                                            </div>
                                            <div className="group">
                                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">Account ID</label>
                                                <div className="relative">
                                                    <Sparkles className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                                                    <input
                                                        type="text"
                                                        required
                                                        value={formData.username}
                                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                                        className="w-full pl-14 pr-6 py-5 rounded-[1.25rem] border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all shadow-sm"
                                                        placeholder="john_ceo"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="group">
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">Work Email</label>
                                            <div className="relative">
                                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                                                <input
                                                    type="email"
                                                    required
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                    className="w-full pl-14 pr-6 py-5 rounded-[1.25rem] border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all shadow-sm"
                                                    placeholder="ceo@luxe.com"
                                                />
                                            </div>
                                        </div>

                                        <div className="group">
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">Secure Password</label>
                                            <div className="relative">
                                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                                                <input
                                                    type="password"
                                                    required
                                                    value={formData.password}
                                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                    className="w-full pl-14 pr-6 py-5 rounded-[1.25rem] border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all shadow-sm font-mono"
                                                    placeholder="••••••••••••"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex gap-4 pt-4">
                                            <button
                                                type="button"
                                                onClick={prevStep}
                                                className="flex-1 py-5 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 font-black rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                                            >
                                                <ChevronLeft className="w-5 h-5" />
                                                Back
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="flex-2 py-5 bg-brand-600 hover:bg-brand-700 text-white font-black rounded-2xl transition-all shadow-xl shadow-brand-500/25 flex justify-center items-center gap-3 disabled:opacity-70 active:scale-[0.98]"
                                            >
                                                {loading ? (
                                                    <>
                                                        <Loader2 className="w-5 h-5 animate-spin" />
                                                        Deploying Store...
                                                    </>
                                                ) : (
                                                    <>
                                                        Launch Empire
                                                        <CheckCircle2 className="w-5 h-5" />
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </form>
                    </div>
                </div>

                {/* Footer Info */}
                <div className="mt-12 text-center text-slate-400 text-xs font-bold uppercase tracking-[0.2em]">
                    Powered by <span className="text-slate-900 dark:text-white">LuxeSaaS Enterprise Engine</span>
                </div>
            </div>
        </div>
    );
}
