'use client';

import { Check, Loader2 } from 'lucide-react';
import React, { useMemo } from 'react';
import { Plan, PlanCardProps, SubscriptionInfo } from '../../type';
import { getFeatureDisplay } from '@/routes';


const PlanCard: React.FC<PlanCardProps> = ({
    plan,
    isCurrent,
    billingCycle,
    handleUpgrade,
    initiating
}) => {
    const priceDisplay = useMemo(() => {
        const p = plan as any;
        const amount = billingCycle === 'yearly'
            ? (p.yearlyPrice > 0 ? p.yearlyPrice : p.monthlyPrice * 12)
            : p.monthlyPrice;
        return {
            amount,
            cycle: billingCycle === 'yearly' ? 'yr' : 'mo'
        };
    }, [plan, billingCycle]);

    return (
        <div
            className={`relative group bg-white dark:bg-slate-800 rounded-[2rem] p-8 border-2 transition-all duration-500 ${isCurrent
                ? 'border-brand-500 shadow-xl shadow-brand-500/10'
                : 'border-slate-100 dark:border-slate-700/50 hover:border-brand-200 dark:hover:border-slate-600'
                }`}
        >
            {isCurrent && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-brand-500 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg">
                    Current Choice
                </div>
            )}

            <div className="space-y-6">
                <div className="space-y-2 text-center">
                    <h4 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase">{plan.name}</h4>
                    <div className="flex items-baseline justify-center gap-1">
                        <span className="text-4xl font-black text-slate-900 dark:text-white">
                            ${priceDisplay.amount}
                        </span>
                        <span className="text-slate-400 dark:text-slate-500 font-bold uppercase text-xs tracking-widest">
                            /{priceDisplay.cycle}
                        </span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium px-4 h-10 line-clamp-2">
                        {plan.description || "The perfect starting point for growing businesses."}
                    </p>
                </div>

                <div className="h-px bg-slate-100 dark:bg-slate-700/50 w-full" />

                <ul className="space-y-4">
                    {plan.features?.map((featurePath: string, i: number) => {
                        const featureDisplay = getFeatureDisplay(featurePath);
                        const FeatureIcon = featureDisplay.icon || Check;
                        return (
                            <li key={i} className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300 font-medium font-display">
                                <div className="p-1.5 bg-brand-50 dark:bg-brand-900/20 rounded-lg shrink-0">
                                    <FeatureIcon className="w-3.5 h-3.5 text-brand-600" />
                                </div>
                                {featureDisplay.label}
                            </li>
                        );
                    })}
                </ul>

                <button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={initiating !== null}
                    className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest transition-all duration-300 ${isCurrent
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-500/20'
                        : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-brand-600 hover:text-white dark:hover:bg-brand-600 dark:hover:text-white shadow-xl shadow-slate-900/5'
                        } active:scale-95 disabled:opacity-50 shadow-xl font-display`}
                >
                    {initiating === plan.id ? (
                        <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                    ) : isCurrent ? (
                        'Renew Now'
                    ) : (
                        'Upgrade Now'
                    )}
                </button>
            </div>
        </div>
    );
};

const MemoizedPlanCard = React.memo(PlanCard);

interface PlanGridProps {
    plans: Plan[];
    subInfo: SubscriptionInfo | null;
    billingCycle: 'monthly' | 'yearly';
    setBillingCycle: (cycle: 'monthly' | 'yearly') => void;
    handleUpgrade: (id: string) => void;
    initiating: string | null;
}

const PlanGrid: React.FC<PlanGridProps> = ({
    plans,
    subInfo,
    billingCycle,
    setBillingCycle,
    handleUpgrade,
    initiating
}) => {
    return (
        <section className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-4">
                <div className="space-y-1">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Choose Your Growth Path</h3>
                    <p className="text-slate-500 dark:text-slate-400 font-medium italic">Scale your business with professional tools</p>
                </div>

                <div className="bg-slate-100 dark:bg-slate-900/50 p-1 rounded-2xl flex gap-1 self-center font-display">
                    {['monthly', 'yearly'].map((c) => (
                        <button
                            key={c}
                            onClick={() => setBillingCycle(c as any)}
                            className={`px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${billingCycle === c
                                ? 'bg-white dark:bg-brand-600 text-brand-600 dark:text-white shadow-xl shadow-brand-500/10'
                                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                }`}
                        >
                            {c}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan) => (
                    <MemoizedPlanCard
                        key={plan.id}
                        plan={plan}
                        isCurrent={plan.name === subInfo?.planName}
                        billingCycle={billingCycle}
                        handleUpgrade={handleUpgrade}
                        initiating={initiating}
                    />
                ))}
            </div>
        </section>
    );
};

export default React.memo(PlanGrid);
