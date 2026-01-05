'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Check,
    Store,
    User,
    CreditCard,
    ChevronRight,
    ChevronLeft,
    Loader2,
    AlertCircle
} from 'lucide-react';
import Link from 'next/link';

// Types
type PlanTier = 'basic' | 'pro' | 'enterprise';

interface WizardData {
    plan: PlanTier;
    storeName: string;
    subdomain: string;
    customDomain: string;
    name: string;
    email: string;
    username: string;
    password: string;
}

const PLANS = [
    {
        id: 'basic',
        name: 'Basic',
        price: '$29',
        description: 'Perfect for small businesses just starting out.',
        features: ['Up to 100 Products', 'Basic Analytics', 'Standard Support', '1 Admin User'],
    },
    {
        id: 'pro',
        name: 'Pro',
        price: '$79',
        description: 'Everything you need to grow your business.',
        features: ['Unlimited Products', 'Advanced Analytics', 'Priority Support', '5 Admin Users', 'Custom Domain'],
        popular: true,
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        price: '$299',
        description: 'For large-scale operations and high volume.',
        features: ['Unlimited Everything', '24/7 Phone Support', 'Dedicated Account Manager', 'Custom Integrations', 'SLA'],
    },
] as const;

export default function CreateStorePage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [data, setData] = useState<WizardData>({
        plan: 'basic',
        storeName: '',
        subdomain: '',
        customDomain: '',
        name: '',
        email: '',
        username: '',
        password: '',
    });

    const updateData = (updates: Partial<WizardData>) => {
        setData(prev => ({ ...prev, ...updates }));
        setError('');
    };

    const handleNext = async () => {
        if (step === 2) {
            if (!data.storeName || !data.subdomain) {
                setError('Please fill in all required fields');
                return;
            }
            // Basic validation for subdomain
            if (!/^[a-z0-9-]+$/.test(data.subdomain)) {
                setError('Subdomain can only contain lowercase letters, numbers, and hyphens');
                return;
            }
        }

        if (step < 3) {
            setStep(prev => prev + 1);
            setError('');
        } else {
            await handleSubmit();
        }
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(prev => prev - 1);
            setError('');
        }
    };

    const handleSubmit = async () => {
        if (!data.name || !data.email || !data.username || !data.password) {
            setError('Please fill in all required fields');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // 1. Create Tenant
            const tenantRes = await fetch('/api/tenants', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    storeName: data.storeName,
                    subdomain: data.subdomain,
                    customDomain: data.customDomain || undefined,
                    planTier: data.plan,
                }),
            });

            const tenantResult = await tenantRes.json();

            if (!tenantRes.ok) {
                throw new Error(tenantResult.error || 'Failed to create store');
            }

            const tenantId = tenantResult.tenant._id;

            // 2. Create Admin User linked to Tenant
            const userRes = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-tenant-id': tenantId
                },
                body: JSON.stringify({
                    name: data.name,
                    email: data.email,
                    username: data.username,
                    password: data.password,
                }),
            });

            const userResult = await userRes.json();

            if (!userRes.ok) {
                // If user creation fails, we technically have an orphaned tenant.
                // In a production app, we should probably rollback the tenant creation.
                throw new Error(userResult.error || 'Failed to create admin account');
            }

            // Success!
            router.push('/login?registered=true');
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Something went wrong');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full">
            {/* Progress Steps */}
            <div className="mb-8 md:mb-12">
                <div className="flex items-center justify-center space-x-4 md:space-x-8">
                    <StepIndicator current={step} number={1} label="Choose Plan" icon={CreditCard} />
                    <div className={`w-12 h-0.5 transition-colors ${step >= 2 ? 'bg-brand-600' : 'bg-slate-200 dark:bg-slate-700'}`} />
                    <StepIndicator current={step} number={2} label="Store Details" icon={Store} />
                    <div className={`w-12 h-0.5 transition-colors ${step >= 3 ? 'bg-brand-600' : 'bg-slate-200 dark:bg-slate-700'}`} />
                    <StepIndicator current={step} number={3} label="Admin Account" icon={User} />
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden">

                {/* Header */}
                <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-700 text-center bg-slate-50/50 dark:bg-slate-800/50">
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white font-display">
                        {step === 1 && "Select Your Plan"}
                        {step === 2 && "Name Your Store"}
                        {step === 3 && "Create Admin Account"}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">
                        {step === 1 && "Choose the perfect plan for your business needs."}
                        {step === 2 && "Let's set up your store's identity and domain."}
                        {step === 3 && "You'll use these credentials to manage your store."}
                    </p>
                </div>

                <div className="p-6 md:p-10">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                        >
                            {error && (
                                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3 text-red-700 dark:text-red-400">
                                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                    <p>{error}</p>
                                </div>
                            )}

                            {step === 1 && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {PLANS.map((plan) => (
                                        <div
                                            key={plan.id}
                                            onClick={() => updateData({ plan: plan.id as PlanTier })}
                                            className={`relative rounded-xl border-2 p-6 cursor-pointer transition-all hover:shadow-lg ${data.plan === plan.id
                                                ? 'border-brand-600 bg-brand-50/30 dark:bg-brand-900/10 dark:border-brand-500'
                                                : 'border-slate-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-700'
                                                }`}
                                        >
                                            {plan.popular && (
                                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-brand-600 to-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                                                    MOST POPULAR
                                                </div>
                                            )}
                                            <h3 className="text-xl font-bold text-slate-900 dark:text-white capitalize">{plan.name}</h3>
                                            <div className="mt-2 mb-4">
                                                <span className="text-3xl font-bold text-slate-900 dark:text-white">{plan.price}</span>
                                                <span className="text-slate-500 text-sm">/month</span>
                                            </div>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 min-h-[40px]">{plan.description}</p>

                                            <ul className="space-y-3">
                                                {plan.features.map((feature, i) => (
                                                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                                                        <Check className="w-4 h-4 text-brand-600 mt-0.5 flex-shrink-0" />
                                                        <span>{feature}</span>
                                                    </li>
                                                ))}
                                            </ul>

                                            <div className={`mt-6 w-full py-2 rounded-lg font-semibold text-center transition-colors ${data.plan === plan.id
                                                ? 'bg-brand-600 text-white'
                                                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                                                }`}>
                                                {data.plan === plan.id ? 'Selected' : 'Select Plan'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {step === 2 && (
                                <div className="max-w-2xl mx-auto space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Store Name</label>
                                        <input
                                            type="text"
                                            value={data.storeName}
                                            onChange={(e) => {
                                                const name = e.target.value;
                                                // Auto-slugify for subdomain if empty or untouched (simplified logic)
                                                const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
                                                updateData({ storeName: name, subdomain: slug });
                                            }}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                                            placeholder="My Awesome Store"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Subdomain</label>
                                        <div className="flex items-center">
                                            <input
                                                type="text"
                                                value={data.subdomain}
                                                onChange={(e) => updateData({ subdomain: e.target.value.toLowerCase() })}
                                                className="flex-1 px-4 py-3 rounded-l-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                                                placeholder="my-store"
                                            />
                                            <div className="px-4 py-3 bg-slate-100 dark:bg-slate-700 border-y border-r border-slate-200 dark:border-slate-600 rounded-r-xl text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">
                                                .example.com
                                            </div>
                                        </div>
                                        <p className="mt-1.5 text-xs text-slate-500">Your store will be accessible at https://{data.subdomain || 'your-store'}.example.com</p>
                                    </div>

                                    {data.plan === 'pro' || data.plan === 'enterprise' ? (
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                Custom Domain <span className="text-slate-400 font-normal">(Optional)</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={data.customDomain}
                                                onChange={(e) => updateData({ customDomain: e.target.value })}
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                                                placeholder="www.mystore.com"
                                            />
                                        </div>
                                    ) : (
                                        <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-between">
                                            <div className="flex items-center gap-3 text-slate-500">
                                                <AlertCircle className="w-5 h-5" />
                                                <span className="text-sm">Custom domains are available on Pro plans and above.</span>
                                            </div>
                                            <button onClick={() => setStep(1)} className="text-sm text-brand-600 hover:underline">Upgrade Plan</button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {step === 3 && (
                                <div className="max-w-2xl mx-auto space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Full Name</label>
                                            <input
                                                type="text"
                                                value={data.name}
                                                onChange={(e) => updateData({ name: e.target.value })}
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                                                placeholder="John Doe"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Username</label>
                                            <input
                                                type="text"
                                                value={data.username}
                                                onChange={(e) => updateData({ username: e.target.value })}
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                                                placeholder="johndoe"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
                                        <input
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => updateData({ email: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                                            placeholder="john@example.com"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Password</label>
                                        <input
                                            type="password"
                                            value={data.password}
                                            onChange={(e) => updateData({ password: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    {/* Actions */}
                    <div className="mt-10 flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-700">
                        {step > 1 ? (
                            <button
                                onClick={handleBack}
                                className="px-6 py-3 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 font-medium transition-colors flex items-center gap-2"
                            >
                                <ChevronLeft className="w-4 h-4" /> Back
                            </button>
                        ) : (
                            <Link href="/" className="px-6 py-3 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 font-medium transition-colors">
                                Cancel
                            </Link>
                        )}

                        <button
                            onClick={handleNext}
                            disabled={loading}
                            className="px-8 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-brand-500/25 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    {step === 3 ? 'Create Store' : 'Continue'}
                                    <ChevronRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}

function StepIndicator({ current, number, label, icon: Icon }: { current: number; number: number; label: string; icon: React.ElementType }) {
    const isActive = current >= number;
    const isCurrent = current === number;

    return (
        <div className={`flex flex-col items-center gap-2 ${isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400 dark:text-slate-600'}`}>
            <div className={`
                w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
                ${isCurrent
                    ? 'bg-brand-600 border-brand-600 text-white shadow-lg shadow-brand-500/30 scale-110'
                    : isActive
                        ? 'bg-white dark:bg-slate-800 border-brand-600 text-brand-600'
                        : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-300 dark:text-slate-600'}
            `}>
                <Icon className="w-5 h-5" />
            </div>
            <span className={`text-xs md:text-sm font-medium whitespace-nowrap transition-colors ${isCurrent ? 'text-slate-900 dark:text-white' : ''}`}>
                {label}
            </span>
        </div>
    );
}
