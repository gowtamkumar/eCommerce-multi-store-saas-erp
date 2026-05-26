'use client'
import { fetchAPI } from '@/services/api';
import { publicSaasApi } from '@/services/publicSaasApi ';
import { getFeatureDisplay } from '@/routes';
import * as Icons from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import MarketingFooter from './MarketingFooter';
import MarketingHero from './MarketingHero';
import MarketingNavbar from './MarketingNavbar';

export default function SaaSLanding() {
  const [settings, setSettings] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  // Compute real yearly savings % from the first paid plan that has both prices
  const yearlySavingsPct = (() => {
    const paidPlan = plans.find(
      (p: any) => parseFloat(p.monthlyPrice) > 0 && parseFloat(p.yearlyPrice) > 0
    );
    if (!paidPlan) return 20; // sensible default
    const annualIfMonthly = parseFloat(paidPlan.monthlyPrice) * 12;
    const annualIfYearly  = parseFloat(paidPlan.yearlyPrice);
    const savings = ((annualIfMonthly - annualIfYearly) / annualIfMonthly) * 100;
    return Math.round(savings);
  })();

  // Format a quota value: -1 means unlimited; renders the number+unit string or null
  const fmtQuota = (val: number | undefined | null, unit = '') => {
    if (!val || val === -1) return null;
    return unit ? `${val.toLocaleString()} ${unit}` : val.toLocaleString();
  };
  const isUnlimited = (val: number | undefined | null) => val === -1;

  useEffect(() => {
    async function loadData() {
      try {
        const [settingsRes, plansRes] = await Promise.all([
          fetchAPI('/platform/settings'),
          publicSaasApi('/plans')
        ]);

        setSettings(settingsRes.data);

        setPlans(plansRes.data || plansRes || []);
      } catch (error) {
        console.error('Failed to load platform data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);



  const features = settings?.features || [
    { icon: 'Globe', title: 'Multi-Tenant', description: 'Run separate stores for different brands or regions with isolated data.' },
    { icon: 'Zap', title: 'Instant Deployment', description: 'New stores are live in seconds with their own subdomain automatically.' },
    { icon: 'Shield', title: 'Secure Payments', description: 'Pre-integrated with SSLCommerz and more for secure transactions.' },
    { icon: 'BarChart3', title: 'Global Analytics', description: 'Monitor sales and customer behavior across all your stores.' },
    { icon: 'Users', title: 'User Management', description: 'Role-based access control for your team and store administrators.' },
    { icon: 'Target', title: 'SEO Optimized', description: 'Built-in SEO tools to help your products rank higher in search results.' },
  ];

  if (loading) {
    return <SaaSLandingSkeleton />;
  }


  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 overflow-x-hidden">
      <MarketingNavbar brandName={settings?.brandName} brandLogo={settings?.brandLogo} />
      <MarketingHero data={settings?.hero} />

      {/* Feature Section */}
      <section id="features" className="py-24 bg-slate-50 dark:bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold font-display text-slate-900 dark:text-white mb-4">
              Everything you need to scale
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Powerful tools at your fingertips to manage your entire eCommerce business from one place.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature: any, i: number) => {
              const IconComponent = (Icons as any)[feature.icon] || Icons.HelpCircle;
              return (
                <div key={i} className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:shadow-xl transition-all group">
                  <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center text-brand-600 dark:text-brand-400 mb-6 group-hover:scale-110 transition-transform">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{feature.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-1/4 -right-20 w-80 h-80 bg-brand-500/10 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-1/4 -left-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl opacity-50" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="mb-16">
            <h2 className="text-4xl lg:text-5xl font-black font-display text-slate-900 dark:text-white mb-6 tracking-tight">
              Simple, <span className="text-brand-600 dark:text-brand-400">transparent</span> pricing
            </h2>
            <p className="text-lg lg:text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto font-medium">
              Choose the perfect plan for your business and scale without limits.
            </p>

            {/* Premium Billing Cycle Slider */}
            <div className="inline-flex items-center justify-center p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl mb-16 shadow-inner relative z-10 border border-slate-200/40 dark:border-slate-700/50">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`relative px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 z-10 ${
                  billingCycle === 'monthly'
                    ? 'text-slate-900 dark:text-white'
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {billingCycle === 'monthly' && (
                  <motion.div
                    layoutId="billingToggle"
                    className="absolute inset-0 bg-white dark:bg-slate-700 rounded-xl shadow-md border border-slate-200/50 dark:border-slate-600/50 -z-10"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`relative px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 z-10 flex items-center gap-1.5 ${
                  billingCycle === 'yearly'
                    ? 'text-slate-900 dark:text-white'
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {billingCycle === 'yearly' && (
                  <motion.div
                    layoutId="billingToggle"
                    className="absolute inset-0 bg-white dark:bg-slate-700 rounded-xl shadow-md border border-slate-200/50 dark:border-slate-600/50 -z-10"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                Yearly
                <span className="text-[9px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-black normal-case">
                  {yearlySavingsPct > 0 ? `Save ${yearlySavingsPct}%` : 'Best Value'}
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
            {plans.length > 0 ? (
              plans.map((plan: any, idx: number) => {
                const price = billingCycle === 'yearly'
                  ? (plan.yearlyPrice || parseFloat(plan.price) * 0.8)
                  : (plan.monthlyPrice || parseFloat(plan.price));
                const name = plan.name.toLowerCase();
                const isStarter = name.includes('starter') || name.includes('free') || idx === 0;
                const isEnterprise = name.includes('enterprise') || idx === 2;
                const isPopular = !isStarter && !isEnterprise;

                return (
                  <div
                    key={plan.id}
                    className={`group p-10 rounded-[2.5rem] border transition-all duration-500 flex flex-col relative ${
                      isEnterprise
                        ? 'bg-slate-950 text-white border-slate-800/80 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.4)] scale-100 lg:hover:scale-[1.03] lg:-translate-y-1'
                        : isPopular
                        ? 'bg-white dark:bg-slate-900 border-brand-200 dark:border-brand-800/60 shadow-[0_32px_64px_-16px_rgba(79,70,229,0.12)] scale-100 lg:scale-105 z-10 lg:hover:scale-[1.08]'
                        : 'bg-white/60 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/60 hover:bg-white dark:hover:bg-slate-900 backdrop-blur-sm shadow-sm hover:shadow-xl lg:hover:scale-[1.03] lg:-translate-y-1'
                    }`}
                  >
                    {isPopular && (
                      <div className="absolute top-0 right-12 translate-y-[-50%] bg-gradient-to-r from-brand-600 to-indigo-600 text-white px-6 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-brand-500/30">
                        Most Popular
                      </div>
                    )}
                    {isEnterprise && (
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
                      }`}>${Number(price).toFixed(0)}</span>
                      <span className={`font-bold ${
                        isEnterprise ? 'text-slate-500' : 'text-slate-500 dark:text-slate-400'
                      }`}>/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                      {billingCycle === 'yearly' && parseFloat(plan.monthlyPrice) > 0 && (() => {
                        const savedPerYear = (parseFloat(plan.monthlyPrice) * 12) - parseFloat(plan.yearlyPrice);
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
                        {plan.trialPeriodDays ? `${plan.trialPeriodDays}-Day Trial` : 'Instant Access'}
                      </span>
                      <span className={`text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
                        isEnterprise
                          ? 'text-slate-300 bg-slate-800/80 border border-slate-700/30'
                          : 'text-slate-600 bg-slate-100 dark:bg-slate-800/60 dark:text-slate-300'
                      }`}>
                        {isUnlimited(plan.maxStorageMb)
                          ? '∞ Unlimited Storage'
                          : plan.maxStorageMb >= 1024
                            ? `${(plan.maxStorageMb / 1024).toFixed(0)} GB Storage`
                            : `${plan.maxStorageMb ?? 1024} MB Storage`}
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
                           {isUnlimited(plan.maxProducts)
                             ? <span className="text-violet-400">∞ Unlimited</span>
                             : (plan.maxProducts ?? 0).toLocaleString()}
                         </div>
                      </div>
                      <div className={`p-3 rounded-2xl border text-left ${
                        isEnterprise 
                          ? 'bg-slate-900/60 border-slate-800/80' 
                          : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800'
                      }`}>
                        <div className="text-[9px] uppercase font-black tracking-wider text-slate-400 mb-0.5">Orders / Mo</div>
                         <div className={`text-xs font-black ${isEnterprise ? 'text-slate-100' : 'text-slate-900 dark:text-white'}`}>
                           {isUnlimited(plan.maxMonthlyOrders)
                             ? <span className="text-violet-400">∞ Unlimited</span>
                             : (plan.maxMonthlyOrders ?? 0).toLocaleString()}
                         </div>
                      </div>
                      <div className={`p-3 rounded-2xl border text-left ${
                        isEnterprise 
                          ? 'bg-slate-900/60 border-slate-800/80' 
                          : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800'
                      }`}>
                        <div className="text-[9px] uppercase font-black tracking-wider text-slate-400 mb-0.5">Staff Accounts</div>
                         <div className={`text-xs font-black ${isEnterprise ? 'text-slate-100' : 'text-slate-900 dark:text-white'}`}>
                           {isUnlimited(plan.maxStaffUsers)
                             ? <span className="text-violet-400">∞ Unlimited</span>
                             : `${plan.maxStaffUsers ?? 0} Users`}
                         </div>
                      </div>
                      <div className={`p-3 rounded-2xl border text-left ${
                        isEnterprise 
                          ? 'bg-slate-900/60 border-slate-800/80' 
                          : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800'
                      }`}>
                        <div className="text-[9px] uppercase font-black tracking-wider text-slate-400 mb-0.5">Locations / WH</div>
                        <div className={`text-xs font-black ${isEnterprise ? 'text-slate-100' : 'text-slate-900 dark:text-white'}`}>
                          {isUnlimited(plan.maxBranches) ? '∞' : plan.maxBranches ?? 1} / {isUnlimited(plan.maxWarehouses) ? '∞' : plan.maxWarehouses ?? 1}
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
                            {visibleFeatures.map((item: string, idx: number) => {
                              const featureDisplay = getFeatureDisplay(item);
                              const FeatureIcon = featureDisplay.icon || Icons.Check;
                              return (
                                <li key={`${item}-${idx}`} className="flex items-center gap-3 text-sm group/item">
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

                    <Link
                      href={`/create-store?planId=${plan.id}&cycle=${billingCycle}`}
                      className={`block w-full py-5 rounded-2xl font-black text-[13px] uppercase tracking-widest transition-all shadow-xl text-center active:scale-[0.98] ${
                        isEnterprise
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 hover:from-amber-400 hover:to-yellow-500 hover:shadow-[0_0_24px_rgba(245,158,11,0.25)]'
                          : isPopular
                          ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white hover:from-brand-700 hover:to-indigo-700 shadow-brand-500/30 hover:shadow-brand-500/50'
                          : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100'
                      }`}
                    >
                      Step into success
                    </Link>
                  </div>
                );
              })
            ) : (
              // Default Fallback Plan
              <div className="max-w-md mx-auto p-10 rounded-[3rem] border-2 border-brand-500 bg-white dark:bg-slate-900 shadow-[0_32px_64px_-16px_rgba(79,70,229,0.2)] relative overflow-hidden col-span-full">
                <div className="absolute top-0 right-12 translate-y-[-50%] bg-gradient-to-r from-brand-600 to-indigo-600 text-white px-6 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
                  Luxe Standard
                </div>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-2 font-display">Pro Seller</h3>
                <div className="flex items-baseline justify-center gap-1 mb-6">
                  <span className="text-6xl font-black text-slate-900 dark:text-white">$29</span>
                  <span className="text-slate-500 dark:text-slate-400 font-bold">/mo</span>
                </div>
                <ul className="text-left space-y-4 mb-10">
                  {['Unlimited Products', 'Custom Domains', 'Advanced Analytics', 'Priority Support'].map((item: string) => (
                    <li key={item} className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                      <div className="w-6 h-6 rounded-full bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400">
                        <Icons.Check className="w-3.5 h-3.5" strokeWidth={3} />
                      </div>
                      <span className="text-base font-bold">{item}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/create-store"
                  className="block w-full py-5 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 text-white font-black text-[13px] uppercase tracking-widest hover:from-brand-700 hover:to-indigo-700 transition-all shadow-xl shadow-brand-500/40 active:scale-[0.98] text-center"
                >
                  Experience Excellence
                </Link>
              </div>
            )}
          </div>

          <div className="mt-16 text-center">
            <button
              onClick={() => setIsCompareOpen(true)}
              className="inline-flex items-center gap-2 px-8 py-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-black text-xs uppercase tracking-widest rounded-2xl transition-all border border-slate-200/40 dark:border-slate-700/50 shadow-md active:scale-95 cursor-pointer"
            >
              <Icons.BarChart3 className="w-4 h-4" />
              Compare All ERP Features
            </button>
          </div>
        </div>

        {/* Compare Modal */}
        {isCompareOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 overflow-y-auto">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCompareOpen(false)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
            />

            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col relative z-10"
            >
              {/* Modal Header */}
              <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="text-left">
                  <h3 className="text-2xl font-black font-display text-slate-900 dark:text-white">
                    ERP Feature Comparison Matrix
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    A side-by-side analysis of all features, capacities, and capabilities.
                  </p>
                </div>
                <button
                  onClick={() => setIsCompareOpen(false)}
                  className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-300 transition-all cursor-pointer"
                >
                  <Icons.X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content / Table */}
              <div className="flex-1 overflow-y-auto p-8">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800">
                        <th className="py-4 text-xs font-black uppercase tracking-widest text-slate-400">Features</th>
                        {plans.map((plan: any, idx: number) => {
                          const name = plan.name.toLowerCase();
                          const isEnterprise = name.includes('enterprise') || idx === plans.length - 1;
                          const isPopular = !isEnterprise && !name.includes('starter') && !name.includes('free') && idx > 0;
                          
                          return (
                            <th 
                              key={plan.id}
                              className={`py-4 px-4 text-xs font-black uppercase tracking-widest text-center w-1/4 ${
                                isEnterprise 
                                  ? 'text-amber-500' 
                                  : isPopular 
                                  ? 'text-brand-600 dark:text-brand-400' 
                                  : 'text-slate-900 dark:text-white'
                              }`}
                            >
                              {plan.name}
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {/* Category: Capacity & Quotas */}
                      <tr className="bg-slate-50/50 dark:bg-slate-800/20">
                        <td colSpan={plans.length + 1} className="py-3 px-2 text-xs font-black uppercase tracking-wider text-slate-400">
                          Limits & Quotas
                        </td>
                      </tr>
                      <tr className="border-b border-slate-100 dark:border-slate-800/60">
                        <td className="py-4 font-bold text-sm text-slate-700 dark:text-slate-300">Products SKU Limit</td>
                        {plans.map((plan: any) => (
                          <td key={plan.id} className="py-4 px-4 text-center text-sm font-bold">
                            {fmtQuota(plan.maxProducts, 'SKUs')}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-slate-100 dark:border-slate-800/60">
                        <td className="py-4 font-bold text-sm text-slate-700 dark:text-slate-300">Monthly Order Limit</td>
                        {plans.map((plan: any) => (
                          <td key={plan.id} className="py-4 px-4 text-center text-sm font-bold">
                            {fmtQuota(plan.maxMonthlyOrders, 'Orders')}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-slate-100 dark:border-slate-800/60">
                        <td className="py-4 font-bold text-sm text-slate-700 dark:text-slate-300">Active Staff Members</td>
                        {plans.map((plan: any) => (
                          <td key={plan.id} className="py-4 px-4 text-center text-sm font-bold">
                            {fmtQuota(plan.maxStaffUsers, 'Users')}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-slate-100 dark:border-slate-800/60">
                        <td className="py-4 font-bold text-sm text-slate-700 dark:text-slate-300">Physical Locations (Branches)</td>
                        {plans.map((plan: any) => (
                          <td key={plan.id} className="py-4 px-4 text-center text-sm font-bold">
                            {isUnlimited(plan.maxBranches)
                              ? <span className="text-violet-500 dark:text-violet-400 font-black">∞ Unlimited</span>
                              : <span className="text-slate-600 dark:text-slate-400">{plan.maxBranches ?? 1} {(plan.maxBranches ?? 1) === 1 ? 'Branch' : 'Branches'}</span>}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-slate-100 dark:border-slate-800/60">
                        <td className="py-4 font-bold text-sm text-slate-700 dark:text-slate-300">Warehouses Included</td>
                        {plans.map((plan: any) => (
                          <td key={plan.id} className="py-4 px-4 text-center text-sm font-bold">
                            {isUnlimited(plan.maxWarehouses)
                              ? <span className="text-violet-500 dark:text-violet-400 font-black">∞ Unlimited</span>
                              : <span className="text-slate-600 dark:text-slate-400">{plan.maxWarehouses ?? 1} {(plan.maxWarehouses ?? 1) === 1 ? 'Warehouse' : 'Warehouses'}</span>}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-slate-100 dark:border-slate-800/60">
                        <td className="py-4 font-bold text-sm text-slate-700 dark:text-slate-300">Storage Space</td>
                        {plans.map((plan: any) => (
                          <td key={plan.id} className="py-4 px-4 text-center text-sm font-bold">
                            {isUnlimited(plan.maxStorageMb)
                              ? <span className="text-violet-500 dark:text-violet-400 font-black">∞ Unlimited</span>
                              : <span className="text-slate-600 dark:text-slate-400">{plan.maxStorageMb >= 1024 ? `${(plan.maxStorageMb / 1024).toFixed(0)} GB` : `${plan.maxStorageMb ?? 1024} MB`}</span>}
                          </td>
                        ))}
                      </tr>

                      {/* Category: Dynamic Modules */}
                      <tr className="bg-slate-50/50 dark:bg-slate-800/20">
                        <td colSpan={plans.length + 1} className="py-3 px-2 text-xs font-black uppercase tracking-wider text-slate-400">
                          Included Modules & Capabilities
                        </td>
                      </tr>
                      {(() => {
                        const allFeatures = Array.from(
                          new Set(plans.flatMap((plan: any) => plan.features || []))
                        ).filter(
                          (item: string) => !['settings', 'header', 'footer', 'navbar'].includes(item.toLowerCase().trim())
                        ).sort((a, b) => {
                          const displayA = getFeatureDisplay(a).label;
                          const displayB = getFeatureDisplay(b).label;
                          return displayA.localeCompare(displayB);
                        });

                        return allFeatures.map((feature: string) => {
                          const display = getFeatureDisplay(feature);
                          return (
                            <tr key={feature} className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/30 dark:hover:bg-slate-800/10">
                              <td className="py-4 font-bold text-sm text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                <span className="text-slate-400 shrink-0">
                                  {(() => {
                                    const FeatureIcon = display.icon || Icons.Check;
                                    return <FeatureIcon className="w-4 h-4" />;
                                  })()}
                                </span>
                                {display.label}
                              </td>
                              {plans.map((plan: any, idx: number) => {
                                const hasFeature = (plan.features || []).includes(feature);
                                const name = plan.name.toLowerCase();
                                const isEnterprise = name.includes('enterprise') || idx === plans.length - 1;
                                const isPopular = !isEnterprise && !name.includes('starter') && !name.includes('free') && idx > 0;
                                
                                return (
                                  <td key={plan.id} className="py-4 px-4 text-center">
                                    {hasFeature ? (
                                      <Icons.Check className={`w-5 h-5 mx-auto ${
                                        isEnterprise ? 'text-amber-500' : isPopular ? 'text-brand-600 dark:text-brand-400' : 'text-emerald-500'
                                      }`} strokeWidth={3} />
                                    ) : (
                                      <Icons.Minus className="w-4 h-4 text-slate-350 dark:text-slate-705 mx-auto" strokeWidth={3} />
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Footer */}
              <div className="p-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-center flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  All plans include automated secure backups & updates.
                </span>
                <button
                  onClick={() => setIsCompareOpen(false)}
                  className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                >
                  Close Comparison
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </section>

      <MarketingFooter settings={{
        brandName: settings?.brandName,
        brandLogo: settings?.brandLogo,
        footerDescription: settings?.footer?.description,
        footerCopyright: settings?.footer?.copyright,
        socialLinks: settings?.footer?.socials
      }} />
    </div>
  );
}

function SaaSLandingSkeleton() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 overflow-x-hidden animate-pulse">
      {/* Navbar Skeleton */}
      <div className="h-20 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between px-4 lg:px-8">
        <div className="w-32 h-8 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        <div className="hidden md:flex gap-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="w-20 h-4 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          ))}
        </div>
        <div className="w-24 h-10 bg-slate-200 dark:bg-slate-800 rounded-xl" />
      </div>

      {/* Hero Skeleton */}
      <div className="max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8 flex flex-col items-center text-center space-y-8">
        <div className="w-32 h-8 bg-brand-100 dark:bg-brand-900/30 rounded-full" />
        <div className="space-y-4 w-full max-w-4xl">
          <div className="h-16 bg-slate-200 dark:bg-slate-800 rounded-3xl w-full" />
          <div className="h-16 bg-slate-200 dark:bg-slate-800 rounded-3xl w-3/4 mx-auto" />
        </div>
        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-xl w-2/3 max-w-2xl" />
        <div className="flex gap-4 pt-4">
          <div className="w-40 h-14 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="w-40 h-14 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        </div>
      </div>

      {/* Features Skeleton */}
      <div className="py-24 bg-slate-50 dark:bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-4">
            <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-2xl w-1/3 mx-auto" />
            <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-xl w-1/2 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
                <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
                <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-lg w-3/4" />
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-lg w-full" />
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-lg w-5/6" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
