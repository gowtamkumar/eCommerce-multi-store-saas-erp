'use client';

import * as Icons from 'lucide-react';
import { motion } from 'framer-motion';
import React, { useMemo } from 'react';
import { Plan, PlanCardProps, SubscriptionInfo } from '../../type';
import { getFeatureDisplay } from '@/routes';

interface PlanGridCardProps extends PlanCardProps {
  idx: number;
}

const PlanCard: React.FC<PlanGridCardProps> = ({
  plan,
  isCurrent,
  billingCycle,
  handleUpgrade,
  initiating,
  idx
}) => {
  const isUnlimited = (val: number | undefined | null) => val === -1;

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

  const p = plan as any;
  const nameLower = plan.name.toLowerCase();
  const isStarter = nameLower.includes('starter') || nameLower.includes('free') || idx === 0;
  const isEnterprise = nameLower.includes('enterprise') || idx === 2;
  const isPopular = !isStarter && !isEnterprise;

  return (
    <div
      className={`group p-10 rounded-[2.5rem] border transition-all duration-500 flex flex-col relative ${
        isEnterprise
          ? 'bg-slate-950 text-white border-slate-800/80 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.4)] scale-100 lg:hover:scale-[1.03] lg:-translate-y-1'
          : isPopular
          ? 'bg-white dark:bg-slate-900 border-brand-200 dark:border-brand-800/60 shadow-[0_32px_64px_-16px_rgba(79,70,229,0.12)] scale-100 lg:scale-105 z-10 lg:hover:scale-[1.08]'
          : 'bg-white/60 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/60 hover:bg-white dark:hover:bg-slate-900 backdrop-blur-sm shadow-sm hover:shadow-xl lg:hover:scale-[1.03] lg:-translate-y-1'
      }`}
    >
      {isCurrent && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg z-20">
          Current Plan
        </div>
      )}
      {!isCurrent && isPopular && (
        <div className="absolute top-0 right-12 translate-y-[-50%] bg-gradient-to-r from-brand-600 to-indigo-600 text-white px-6 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-brand-500/30">
          Most Popular
        </div>
      )}
      {!isCurrent && isEnterprise && (
        <div className="absolute top-0 right-12 translate-y-[-50%] bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 px-6 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-amber-500/20">
          Ultimate Tier
        </div>
      )}

      <div className="mb-8 text-left">
        <h3 className={`text-2xl font-black mb-2 font-display tracking-tight ${
          isEnterprise
            ? 'bg-gradient-to-r from-amber-200 via-amber-300 to-yellow-500 bg-clip-text text-transparent font-black uppercase'
            : 'text-slate-900 dark:text-white'
        }`}>{plan.name}</h3>
        <p className={`text-sm leading-relaxed ${
          isEnterprise ? 'text-slate-400' : 'text-slate-500 dark:text-slate-400'
        }`}>{plan.description || "The essentials to get your store up and running."}</p>
      </div>

      <div className="flex items-baseline gap-1 mb-2 font-display text-left">
        <span className={`text-5xl font-black tracking-tight ${
          isEnterprise ? 'text-white' : 'text-slate-900 dark:text-white'
        }`}>${Number(priceDisplay.amount).toFixed(0)}</span>
        <span className={`font-bold ${
          isEnterprise ? 'text-slate-500' : 'text-slate-500 dark:text-slate-400'
        }`}>/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
        {billingCycle === 'yearly' && parseFloat(p.monthlyPrice) > 0 && (() => {
          const savedPerYear = (parseFloat(p.monthlyPrice) * 12) - parseFloat(p.yearlyPrice);
          return savedPerYear > 0 ? (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`ml-1.5 text-[10px] font-black px-2.5 py-1 rounded-full ${
                isEnterprise
                  ? 'bg-amber-950/50 text-amber-400 border border-amber-900/40'
                  : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
              }`}
            >
              Save ${savedPerYear.toFixed(0)}/yr
            </motion.span>
          ) : null;
        })()}
      </div>

      <div className="mb-6 font-bold text-left flex flex-wrap gap-2">
        <span className={`text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
          isEnterprise
            ? 'text-amber-400 bg-amber-950/40 border border-amber-900/30'
            : 'text-brand-600 bg-brand-50/50 dark:bg-brand-900/30'
        }`}>
          {p.trialPeriodDays ? `${p.trialPeriodDays}-Day Trial` : 'Instant Access'}
        </span>
        <span className={`text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
          isEnterprise
            ? 'text-slate-300 bg-slate-800/80 border border-slate-700/30'
            : 'text-slate-600 bg-slate-100 dark:bg-slate-800/60 dark:text-slate-300'
        }`}>
          {isUnlimited(p.maxStorageMb)
            ? '∞ Unlimited Storage'
            : p.maxStorageMb >= 1024
              ? `${(p.maxStorageMb / 1024).toFixed(0)} GB Storage`
              : `${p.maxStorageMb ?? 1024} MB Storage`}
        </span>
      </div>

      {/* Quota Highlights Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className={`p-3 rounded-2xl border text-left ${
          isEnterprise 
            ? 'bg-slate-900/60 border-slate-800/80' 
            : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800'
        }`}>
          <div className="text-[9px] uppercase font-black tracking-wider text-slate-400 mb-0.5">Products</div>
          <div className={`text-xs font-black ${isEnterprise ? 'text-slate-100' : 'text-slate-900 dark:text-white'}`}>
            {isUnlimited(p.maxProducts)
              ? <span className="text-violet-400 font-bold">∞ Unlimited</span>
              : (p.maxProducts ?? 0).toLocaleString()}
          </div>
        </div>
        <div className={`p-3 rounded-2xl border text-left ${
          isEnterprise 
            ? 'bg-slate-900/60 border-slate-800/80' 
            : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800'
        }`}>
          <div className="text-[9px] uppercase font-black tracking-wider text-slate-400 mb-0.5">Orders / Mo</div>
          <div className={`text-xs font-black ${isEnterprise ? 'text-slate-100' : 'text-slate-900 dark:text-white'}`}>
            {isUnlimited(p.maxMonthlyOrders)
              ? <span className="text-violet-400 font-bold">∞ Unlimited</span>
              : (p.maxMonthlyOrders ?? 0).toLocaleString()}
          </div>
        </div>
        <div className={`p-3 rounded-2xl border text-left ${
          isEnterprise 
            ? 'bg-slate-900/60 border-slate-800/80' 
            : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800'
        }`}>
          <div className="text-[9px] uppercase font-black tracking-wider text-slate-400 mb-0.5">Staff Accounts</div>
          <div className={`text-xs font-black ${isEnterprise ? 'text-slate-100' : 'text-slate-900 dark:text-white'}`}>
            {isUnlimited(p.maxStaffUsers)
              ? <span className="text-violet-400 font-bold">∞ Unlimited</span>
              : `${p.maxStaffUsers ?? 0} Users`}
          </div>
        </div>
        <div className={`p-3 rounded-2xl border text-left ${
          isEnterprise 
            ? 'bg-slate-900/60 border-slate-800/80' 
            : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800'
        }`}>
          <div className="text-[9px] uppercase font-black tracking-wider text-slate-400 mb-0.5">Locations / WH</div>
          <div className={`text-xs font-black ${isEnterprise ? 'text-slate-100' : 'text-slate-900 dark:text-white'}`}>
            {isUnlimited(p.maxBranches) ? '∞' : p.maxBranches ?? 1} / {isUnlimited(p.maxWarehouses) ? '∞' : p.maxWarehouses ?? 1}
          </div>
        </div>
      </div>

      <div className={`w-full h-px mb-6 ${
        isEnterprise ? 'bg-slate-800' : 'bg-slate-100 dark:bg-slate-800'
      }`} />

      <ul className="text-left space-y-4 mb-10 flex-1">
        {(() => {
          const marketingFeatures = (plan.features || []).filter(
            (item: string) => !['settings', 'header', 'footer', 'navbar'].includes(item.toLowerCase().trim())
          );
          const visibleFeatures = marketingFeatures.slice(0, 6);
          const remainingCount = marketingFeatures.length - visibleFeatures.length;

          return (
            <>
              {visibleFeatures.map((item: string, fIdx: number) => {
                const featureDisplay = getFeatureDisplay(item);
                const FeatureIcon = featureDisplay.icon || Icons.Check;
                return (
                  <li key={`${item}-${fIdx}`} className="flex items-center gap-3 text-sm group/item">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors shrink-0 ${
                      isEnterprise
                        ? 'bg-amber-950/40 text-amber-400 border border-amber-900/30'
                        : isPopular
                        ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                    }`}>
                      <FeatureIcon className="w-3.5 h-3.5" strokeWidth={2.5} />
                    </div>
                    <span className={`font-bold transition-colors ${
                      isEnterprise
                        ? 'text-slate-200 group-hover/item:text-amber-300'
                        : 'text-slate-600 dark:text-slate-300 group-hover/item:text-slate-900 dark:group-hover/item:text-white'
                    }`}>{featureDisplay.label}</span>
                  </li>
                );
              })}
              {remainingCount > 0 && (
                <li className="flex items-center gap-3 text-sm pl-9">
                  <span className={`text-[10px] font-black uppercase tracking-wider ${
                    isEnterprise ? 'text-slate-400' : 'text-brand-500/80 dark:text-brand-400/80'
                  }`}>
                    + {remainingCount} more features
                  </span>
                </li>
              )}
            </>
          );
        })()}
      </ul>

      <button
        onClick={() => handleUpgrade(plan.id)}
        disabled={initiating !== null}
        className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest transition-all duration-300 ${
          isCurrent
            ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-500/20'
            : isEnterprise
            ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 hover:from-amber-600 hover:to-yellow-700 shadow-xl'
            : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-brand-600 hover:text-white dark:hover:bg-brand-600 dark:hover:text-white shadow-xl shadow-slate-900/5'
        } active:scale-95 disabled:opacity-50 shadow-xl font-display`}
      >
        {initiating === plan.id ? (
          <Icons.Loader2 className="w-5 h-5 animate-spin mx-auto" />
        ) : isCurrent ? (
          'Renew Now'
        ) : (
          'Upgrade Now'
        )}
      </button>
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
  // Compute real yearly savings % from the first paid plan that has both prices
  const yearlySavingsPct = useMemo(() => {
    const paidPlan = plans.find(
      (p: any) => parseFloat(p.monthlyPrice) > 0 && parseFloat(p.yearlyPrice) > 0
    );
    if (!paidPlan) return 20; // sensible default
    const annualIfMonthly = parseFloat((paidPlan as any).monthlyPrice) * 12;
    const annualIfYearly  = parseFloat((paidPlan as any).yearlyPrice);
    if (!annualIfMonthly) return 20;
    const savings = ((annualIfMonthly - annualIfYearly) / annualIfMonthly) * 100;
    return Math.round(savings);
  }, [plans]);

  return (
    <section className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-4">
        <div className="space-y-1">
          <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Choose Your Growth Path</h3>
          <p className="text-slate-500 dark:text-slate-400 font-medium italic">Scale your business with professional tools</p>
        </div>

        <div className="bg-slate-100 dark:bg-slate-900/50 p-1 rounded-2xl flex gap-1 self-center font-display relative z-0">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 relative ${
              billingCycle === 'monthly'
                ? 'text-brand-600 dark:text-white font-black'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            {billingCycle === 'monthly' && (
              <motion.div
                layoutId="billingToggleBillingGrid"
                className="absolute inset-0 bg-white dark:bg-brand-600 rounded-xl shadow-md -z-10"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            Monthly
          </button>

          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 relative flex items-center gap-1.5 ${
              billingCycle === 'yearly'
                ? 'text-brand-600 dark:text-white font-black'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            {billingCycle === 'yearly' && (
              <motion.div
                layoutId="billingToggleBillingGrid"
                className="absolute inset-0 bg-white dark:bg-brand-600 rounded-xl shadow-md -z-10"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            Yearly
            <span className={`text-[9px] px-2 py-0.5 rounded-full font-black normal-case ${
              billingCycle === 'yearly'
                ? 'bg-brand-600 text-white dark:bg-emerald-950/60 dark:text-emerald-400'
                : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
            }`}>
              {yearlySavingsPct > 0 ? `Save ${yearlySavingsPct}%` : 'Best Value'}
            </span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
        {plans.map((plan, planIdx) => (
          <MemoizedPlanCard
            key={plan.id}
            plan={plan}
            idx={planIdx}
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
