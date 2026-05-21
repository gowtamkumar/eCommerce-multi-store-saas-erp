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
                  Save 20%
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
                    </div>
                    <div className="mb-8 font-bold text-left">
                      <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-[0.2em] ${
                        isEnterprise
                          ? 'text-amber-400 bg-amber-950/40 border border-amber-900/30'
                          : 'text-brand-600 bg-brand-50/50 dark:bg-brand-900/30'
                      }`}>
                        14-Day Free Trial
                      </span>
                    </div>

                    <div className={`w-full h-px mb-8 ${
                      isEnterprise ? 'bg-slate-800' : 'bg-slate-100 dark:bg-slate-800'
                    }`} />

                    <ul className="text-left space-y-4 mb-10 flex-1">
                      {(plan.features || []).map((item: string, idx: number) => {
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
        </div>
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
