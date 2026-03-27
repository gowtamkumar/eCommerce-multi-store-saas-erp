'use client';

import { fetchAPI } from '@/services/api';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { FAQ, FAQProps } from '../type';


export default function FAQ({ title, description, faqs: customFaqs, isBuilderSection = false }: FAQProps) {
  const [faqs, setFaqs] = useState({} as any);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    if (customFaqs && customFaqs.length > 0) {
      // Use custom FAQs from page builder
      setFaqs({ faqs: customFaqs });
      setLoading(false);
    } else {
      // Fetch from API
      fetchFAQs();
    }
  }, [customFaqs]);

  const fetchFAQs = async () => {
    try {
      const data = await fetchAPI('/faqs?status=active');

      if (data.success) {
        setFaqs(data.data);
      }
    } catch (error) {
      console.error('Error fetching FAQs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (faqs?.faqs?.length === 0) {
    return null;
  }


  const categories = ['all', ...Array.from(new Set(faqs?.faqs?.map((faq: any) => faq.category)))];
  const filteredFAQs = selectedCategory === 'all'
    ? faqs?.faqs
    : faqs?.faqs?.filter((faq: any) => faq.category === selectedCategory);

  if (loading) {
    return (
      <section className="py-24 bg-slate-50 dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
          </div>
        </div>
      </section>
    );
  }

  const Wrapper = isBuilderSection ? 'div' : 'section';
  // If isBuilderSection, remove default padding/bg/relative. Allow SectionRenderer to handle it.
  const sectionClasses = isBuilderSection
    ? 'w-full'
    : 'py-24 bg-slate-50 dark:bg-slate-900 relative overflow-hidden';

  const containerClasses = isBuilderSection
    ? 'w-full' // SectionRenderer handles container width
    : 'container mx-auto px-4 relative z-10';

  return (
    <Wrapper id={!isBuilderSection ? 'faq' : undefined} className={sectionClasses}>
      {/* Background Decoration - Only show if standard section */}
      {!isBuilderSection && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        </div>
      )}

      <div className={containerClasses}>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 rounded-full text-sm font-semibold mb-6">
            <HelpCircle className="w-4 h-4" />
            FAQ
          </div>
          <h2 className="text-4xl md:text-5xl font-bold font-display text-slate-900 dark:text-white mb-6">
            {title || "Frequently Asked Questions"}
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            {description || "Find answers to common questions about our products and services"}
          </p>
        </motion.div>

        {/* Category Filter */}
        {categories.length > 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-wrap justify-center gap-3 mb-12"
          >
            {categories.map((category: any) => (
              <button
                key={category}
                onClick={() => {
                  setSelectedCategory(category);
                  setActiveIndex(null);
                }}
                className={`px-6 py-2.5 rounded-full font-medium transition-all ${selectedCategory === category
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 border border-slate-200 dark:border-slate-700'
                  }`}
              >
                {category === 'all' ? 'All' : category}
              </button>
            ))}
          </motion.div>
        )}

        {/* FAQ Accordion */}
        <div className="max-w-4xl mx-auto space-y-4">
          {(filteredFAQs || [])?.map((faq: any, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <button
                onClick={() => setActiveIndex(activeIndex === index ? null : index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
              >
                <span className="font-semibold text-slate-900 dark:text-white pr-8">
                  {faq.question}
                </span>
                <motion.div
                  animate={{ rotate: activeIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex-shrink-0"
                >
                  <ChevronDown className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                </motion.div>
              </button>

              <AnimatePresence>
                {activeIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-5 text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-700 pt-4">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Still have questions?
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-8 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-brand-600/30 hover:shadow-xl hover:shadow-brand-600/40 hover:-translate-y-0.5"
          >
            Contact Us
          </Link>
        </motion.div>
      </div>
    </Wrapper>
  );
}
