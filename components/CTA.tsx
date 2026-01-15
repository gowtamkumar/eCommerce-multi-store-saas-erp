'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface CTAProps {
  headline?: string;
  subline?: string;
  buttonLabel?: string;
  buttonLink?: string;
  isBuilderSection?: boolean;
}

export default function CTA({
  headline = "Ready to Get Started?",
  subline = "Join thousands of satisfied customers and experience the difference today.",
  buttonLabel = "Shop Now",
  buttonLink = "/products",
  isBuilderSection = false
}: CTAProps) {
  const Wrapper = isBuilderSection ? 'div' : 'section';
  const sectionClasses = isBuilderSection
    ? 'w-full'
    : 'py-24 bg-brand-600 dark:bg-brand-900 relative overflow-hidden';

  const containerClasses = isBuilderSection
    ? 'w-full'
    : 'container mx-auto px-4 relative z-10 text-center';

  return (
    <Wrapper className={sectionClasses}>
      {/* Background Decor - Only for standard sections */}
      {!isBuilderSection && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        </div>
      )}

      <div className={containerClasses}>
        <motion.div
          // ... rest of content remains same
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto space-y-8"
        >
          <h2 className="text-4xl md:text-5xl font-bold font-display text-white leading-tight">
            {headline}
          </h2>
          <p className="text-xl text-brand-100 leading-relaxed max-w-2xl mx-auto">
            {subline}
          </p>
          <div className="pt-4">
            <Link
              href={buttonLink}
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-brand-600 font-bold rounded-xl hover:bg-brand-50 transition-all shadow-xl shadow-black/10 hover:scale-105 group"
            >
              {buttonLabel}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
