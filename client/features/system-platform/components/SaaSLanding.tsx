'use client'
import { fetchAPI } from '@/services/api';
import { publicSaasApi } from '@/services/publicSaasApi ';
import * as Icons from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import MarketingFooter from './MarketingFooter';
import MarketingHero from './MarketingHero';
import MarketingNavbar from './MarketingNavbar';

export default function SaaSLanding() {
  const [settings, setSettings] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    async function loadData() {
      try {
        const [settingsRes, plansRes] = await Promise.all([
          fetchAPI('/platform/settings'),
          publicSaasApi('/plans')
        ]);

        setSettings(settingsRes.data);
        console.log('Platform Settings Data:', settingsRes);

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
      <MarketingNavbar />
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
      <section id="pricing" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold font-display text-slate-900 dark:text-white mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-12">
            Start for free, upgrade as you grow.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {plans.length > 0 ? (
              plans.map((plan: any) => (
                <div key={plan.id} className={`p-8 rounded-3xl border-2 bg-white dark:bg-slate-900 shadow-xl relative overflow-hidden flex flex-col ${plan.isPopular ? 'border-brand-600 scale-105 z-10' : 'border-slate-100 dark:border-slate-800'}`}>
                  {plan.isPopular && <div className="absolute top-0 right-0 bg-brand-600 text-white px-4 py-1 text-xs font-bold rounded-bl-xl">POPULAR</div>}
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{plan.name}</h3>
                  <div className="flex items-end justify-center gap-1 mb-6">
                    <span className="text-4xl font-bold text-slate-900 dark:text-white">${parseFloat(plan.price).toFixed(0)}</span>
                    <span className="text-slate-600 dark:text-slate-400 mb-1">/mo</span>
                  </div>
                  <p className="text-slate-500 text-sm mb-6">{plan.description}</p>
                  <ul className="text-left space-y-4 mb-8 flex-1">
                    {(plan.features || []).map((item: string) => (
                      <li key={item} className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <Icons.Zap className="w-4 h-4 text-brand-600" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={`/create-store?planId=${plan.id}`}
                    className={`block w-full py-4 rounded-2xl font-bold transition-all shadow-lg text-center ${plan.isPopular ? 'bg-brand-600 text-white hover:bg-brand-700 shadow-brand-500/25' : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                  >
                    Get Started
                  </Link>
                </div>
              ))
            ) : (
              // Default Fallback Plan if none found in DB
              <div className="max-w-md mx-auto p-8 rounded-3xl border-2 border-brand-600 bg-white dark:bg-slate-900 shadow-2xl relative overflow-hidden col-span-full">
                <div className="absolute top-0 right-0 bg-brand-600 text-white px-4 py-1 text-xs font-bold rounded-bl-xl">POPULAR</div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Pro Seller</h3>
                <div className="flex items-end justify-center gap-1 mb-6">
                  <span className="text-4xl font-bold text-slate-900 dark:text-white">$29</span>
                  <span className="text-slate-600 dark:text-slate-400 mb-1">/mo</span>
                </div>
                <ul className="text-left space-y-4 mb-8">
                  {['Unlimited Products', 'Custom Domains', 'Advanced Analytics', 'Priority Support'].map((item: string) => (
                    <li key={item} className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <Icons.Zap className="w-4 h-4 text-brand-600" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/create-store"
                  className="block w-full py-4 rounded-2xl bg-brand-600 text-white font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/25 text-center"
                >
                  Get Started Now
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      <MarketingFooter settings={{
        brandName: settings?.hero?.title?.split(' ')?.[0] || 'SaaS',
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
