'use client';

import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Play } from 'lucide-react';
import Link from 'next/link';

export default function MarketingHero({ data }: { data?: any }) {
  const content = data || {
    badge: 'Next-Gen eCommerce Platform',
    title: 'Launch Your Store in Seconds, Not Days',
    description: 'The all-in-one multi-tenant platform for ambitious sellers. Manage orders, inventory, and customers across multiple stores with a single dashboard.',
    primaryBtnText: 'Start Your Free Trial',
    primaryBtnLink: '/create-store',
    secondaryBtnText: 'Watch Demo',
    secondaryBtnLink: '#',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop',
  };

  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-500/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[10%] right-[-5%] w-[35%] h-[35%] bg-blue-500/10 blur-[100px] rounded-full animate-pulse delay-700" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 text-sm font-semibold mb-8 border border-brand-100 dark:border-brand-800"
          >
            <span className="flex h-2 w-2 rounded-full bg-brand-600 animate-ping" />
            {content.badge}
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl lg:text-7xl font-bold font-display text-slate-900 dark:text-white mb-6 leading-[1.1]"
            dangerouslySetInnerHTML={{ __html: content.title.replace('Seconds', '<span class="bg-gradient-to-r from-brand-600 to-blue-600 bg-clip-text text-transparent">Seconds</span>') }}
          />

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg lg:text-xl text-slate-600 dark:text-slate-400 mb-10 leading-relaxed"
          >
            {content.description}
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Link
              href={content.primaryBtnLink}
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-2xl bg-brand-600 text-white font-bold text-lg hover:bg-brand-700 transition-all hover:shadow-2xl hover:shadow-brand-500/30 group"
            >
              {content.primaryBtnText}
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href={content.secondaryBtnLink}
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-2xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all group"
            >
              <Play className="mr-2 w-5 h-5 fill-current" />
              {content.secondaryBtnText}
            </Link>
          </motion.div>

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4"
          >
            {['No credit card required', '14-day free trial', 'Instant setup'].map((text) => (
              <div key={text} className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                <CheckCircle2 className="w-4 h-4 text-brand-600" />
                {text}
              </div>
            ))}
          </motion.div>
        </div>

        {/* Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-20 relative"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white dark:to-slate-900 h-1/2 bottom-0 z-10" />
          <div className="relative rounded-2xl lg:rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl">
            <img
              src={content.image}
              alt="Dashboard Preview"
              className="w-full h-auto"
            />
            <div className="absolute inset-0 bg-brand-600/5 mix-blend-multiply" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
