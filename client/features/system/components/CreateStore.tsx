'use client';

import { fetchAPI } from '@/services/api';
import { publicSaasApi } from '@/services/publicSaasApi ';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Globe, Layers, Layout, Loader2, Lock, User } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { SubscriptionPlan } from '../type';



export default function CreateStore() {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [fetchingPlans, setFetchingPlans] = useState(true);
    const searchParams = useSearchParams();
    const planIdFromUrl = searchParams.get('planId');



    const [formData, setFormData] = useState({
        storeName: '',
        subdomain: '',
        planId: '',
        name: '',
        email: '',
        username: '',
        password: '',
    });



    useEffect(() => {
        async function getPlans() {
            try {
                const res = await publicSaasApi('/plans');
                if (res.success) {
                    setPlans(res.data);

                    // If planId is passed in URL, use it, otherwise default to first plan
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

    const nextStep = () => {
        if (step === 1 && (!formData.storeName || !formData.subdomain)) {
            setError('Please fill in both fields');
            return;
        }
        if (step === 2 && !formData.planId) {
            setError('Please select a subscription plan');
            return;
        }
        setError('');
        setStep(step + 1);
    };

    const prevStep = () => setStep(step - 1);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const data = await fetchAPI('/onboard', {
                method: 'POST',
                body: JSON.stringify(formData),
            });

            console.log("data res", data);

            if (data.success && data.subdomain) {
                // Successful onboarding
                const protocol = window.location.protocol;
                const hostname = window.location.hostname;
                const port = window.location.port ? `:${window.location.port}` : '';
                const adminUrl = `${protocol}//${data.subdomain}.${hostname}${port}/admin/login`;
                alert("Store created successfully! Redirecting to your admin dashboard...");
                window.location.href = adminUrl;
            }
            else {
                setError(data.message || 'Something went wrong');
            }

        } catch (err) {
            console.log("eee", err);
            setError('Failed to connect to server');
        } finally {
            setLoading(false);
        }
    };

    const renderStepInfo = () => {
        switch (step) {
            case 1: return { title: 'Configure Your Store', subtitle: 'Step 1 of 3 • Digital identity' };
            case 2: return { title: 'Choose Your Plan', subtitle: 'Step 2 of 3 • Scaling your business' };
            case 3: return { title: 'Create Admin Account', subtitle: 'Step 3 of 3 • Account security' };
            default: return { title: '', subtitle: '' };
        }
    };

    const stepInfo = renderStepInfo();

    return (
        <div className="w-full">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-bold font-display text-slate-900 dark:text-white mb-2Transition transition-all">
                    {stepInfo.title}
                </h1>
                <p className="text-slate-500 dark:text-slate-400">
                    {stepInfo.subtitle}
                </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="flex">
                    {/* Left Sidebar Info */}
                    <div className="hidden lg:flex w-72 bg-brand-600 p-10 flex-col justify-between text-white">
                        <div>
                            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md">
                                <Globe className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-bold mb-4 leading-tight">Your global business starts here.</h2>
                            <ul className="space-y-4">
                                {[
                                    'Instant setup',
                                    'Custom subdomain',
                                    'Secure payments',
                                    'Dynamic scaling'
                                ].map((item) => (
                                    <li key={item} className="flex items-center gap-3 text-sm font-medium opacity-90">
                                        <CheckCircle2 className="w-4 h-4" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="text-xs opacity-60">
                            © 2026 LuxeSaaS Platform
                        </div>
                    </div>

                    {/* Form Area */}
                    <div className="flex-1 p-8 lg:p-12">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-2xl text-center font-medium border border-red-100 dark:border-red-900/30">
                                    {error}
                                </div>
                            )}

                            <AnimatePresence mode="wait">
                                {step === 1 && (
                                    <motion.div
                                        key="step1"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-6"
                                    >
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Store Name</label>
                                            <div className="relative">
                                                <Layout className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                                <input
                                                    type="text"
                                                    required
                                                    value={formData.storeName}
                                                    onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                                                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                                                    placeholder="My Awesome Shop"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Store URL (Subdomain)</label>
                                            <div className="relative">
                                                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                                <input
                                                    type="text"
                                                    required
                                                    value={formData.subdomain}
                                                    onChange={handleSubdomainChange}
                                                    className="w-full pl-12 pr-32 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                                                    placeholder="myshop"
                                                />
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                                                    .gowtam.com
                                                </div>
                                            </div>
                                            <p className="mt-2 text-xs text-slate-400">Only letters, numbers, and hyphens allowed.</p>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={nextStep}
                                            className="w-full py-4 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-2xl transition-all shadow-xl shadow-brand-500/25 flex justify-center items-center gap-2 group"
                                        >
                                            Choose Plan
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
                                        className="space-y-6"
                                    >
                                        <div className="grid grid-cols-1 gap-4">
                                            {fetchingPlans ? (
                                                <div className="py-10 text-center flex flex-col items-center gap-2">
                                                    <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
                                                    <p className="text-sm font-medium text-slate-500">Retrieving available plans...</p>
                                                </div>
                                            ) : (
                                                plans.map((plan) => (
                                                    <div
                                                        key={plan.id}
                                                        onClick={() => setFormData({ ...formData, planId: plan.id })}
                                                        className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${formData.planId === plan.id
                                                            ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-900/20'
                                                            : 'border-slate-100 dark:border-slate-700 hover:border-brand-200'}`}
                                                    >
                                                        <div className="flex justify-between items-start">
                                                            <div className="flex gap-4">
                                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${formData.planId === plan.id ? 'bg-brand-600 text-white' : 'bg-slate-100 dark:bg-slate-900 text-slate-400'}`}>
                                                                    <Layers className="w-5 h-5" />
                                                                </div>
                                                                <div>
                                                                    <h3 className="font-bold text-slate-900 dark:text-white">{plan.name}</h3>
                                                                    <p className="text-xs text-slate-500 mt-1">{plan.description}</p>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-lg font-black text-brand-600">${plan.price}</p>
                                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">per month</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>

                                        <div className="flex gap-4">
                                            <button
                                                type="button"
                                                onClick={prevStep}
                                                className="flex-1 py-4 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 font-bold rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                                            >
                                                Back
                                            </button>
                                            <button
                                                type="button"
                                                onClick={nextStep}
                                                className="flex-[2] py-4 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-2xl transition-all shadow-xl shadow-brand-500/25 flex justify-center items-center gap-2 group"
                                            >
                                                Setup Account
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
                                        className="space-y-6"
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Full Name</label>
                                                <div className="relative">
                                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                                    <input
                                                        type="text"
                                                        required
                                                        value={formData.name}
                                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                        className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                                                        placeholder="John Doe"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Username</label>
                                                <div className="relative">
                                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                                    <input
                                                        type="text"
                                                        required
                                                        value={formData.username}
                                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                                        className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                                                        placeholder="johndoe"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
                                            <div className="relative">
                                                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                                <input
                                                    type="email"
                                                    required
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                                                    placeholder="john@example.com"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Password</label>
                                            <div className="relative">
                                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                                <input
                                                    type="password"
                                                    required
                                                    value={formData.password}
                                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                                                    placeholder="••••••••"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex gap-4">
                                            <button
                                                type="button"
                                                onClick={prevStep}
                                                className="flex-1 py-4 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 font-bold rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                                            >
                                                Back
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="flex-[2] py-4 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-2xl transition-all shadow-xl shadow-brand-500/25 flex justify-center items-center gap-2 disabled:opacity-70"
                                            >
                                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Launch My Store'}
                                                {!loading && <CheckCircle2 className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
