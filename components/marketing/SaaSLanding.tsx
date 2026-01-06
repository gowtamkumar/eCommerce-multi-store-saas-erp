import Footer from '@/components/Footer';
import { BarChart3, Globe, Shield, Target, Users, Zap } from 'lucide-react';
import MarketingHero from './MarketingHero';
import MarketingNavbar from './MarketingNavbar';

export default function SaaSLanding() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 overflow-x-hidden">
      <MarketingNavbar />
      <MarketingHero />

      {/* Feature Section Placeholder */}
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
            {features.map((feature, i) => (
              <div key={i} className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:shadow-xl transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center text-brand-600 dark:text-brand-400 mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section Placeholder */}
      <section id="pricing" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold font-display text-slate-900 dark:text-white mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-12">
            Start for free, upgrade as you grow.
          </p>

          <div className="max-w-md mx-auto p-8 rounded-3xl border-2 border-brand-600 bg-white dark:bg-slate-900 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-brand-600 text-white px-4 py-1 text-xs font-bold rounded-bl-xl">POPULAR</div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Pro Seller</h3>
            <div className="flex items-end justify-center gap-1 mb-6">
              <span className="text-4xl font-bold text-slate-900 dark:text-white">$29</span>
              <span className="text-slate-600 dark:text-slate-400 mb-1">/mo</span>
            </div>
            <ul className="text-left space-y-4 mb-8">
              {['Unlimited Products', 'Custom Domains', 'Advanced Analytics', 'Priority Support'].map(item => (
                <li key={item} className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <Zap className="w-4 h-4 text-brand-600" />
                  {item}
                </li>
              ))}
            </ul>
            <button className="w-full py-4 rounded-2xl bg-brand-600 text-white font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/25">
              Get Started Now
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

const features = [
  { icon: Globe, title: 'Multi-Tenant', description: 'Run separate stores for different brands or regions with isolated data.' },
  { icon: Zap, title: 'Instant Deployment', description: 'New stores are live in seconds with their own subdomain automatically.' },
  { icon: Shield, title: 'Secure Payments', description: 'Pre-integrated with SSLCommerz and more for secure transactions.' },
  { icon: BarChart3, title: 'Global Analytics', description: 'Monitor sales and customer behavior across all your stores.' },
  { icon: Users, title: 'User Management', description: 'Role-based access control for your team and store administrators.' },
  { icon: Target, title: 'SEO Optimized', description: 'Built-in SEO tools to help your products rank higher in search results.' },
];
