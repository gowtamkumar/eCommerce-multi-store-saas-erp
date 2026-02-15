'use client';

import { fetchAPI } from '@/services/api';
import { Facebook, Heart, Instagram, Linkedin, Mail, Twitter } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface MarketingFooterProps {
  settings?: any;
}

export default function MarketingFooter({ settings }: MarketingFooterProps) {
  const brandName = settings?.brandName || "LuxeAudio"; // Fallback if not provided
  const footerDescription = settings?.footerDescription || "Empowering the next generation of eCommerce entrepreneurs with powerful tools and seamless scaling.";
  const footerCopyright = settings?.footerCopyright || `© ${new Date().getFullYear()} ${brandName}. Made with Heart by Gowtam Kumar.`;
  const social: any = settings?.socialLinks || {};

  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setSubmitting(true);
    try {
      const res = await fetchAPI('/subscribers', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });

      if (res.success || res.id) { // Adjust based on direct entity return or wrapper
        toast.success('Successfully subscribed to newsletter!');
        setEmail('');
      } else {
        toast.error(res.message || 'Failed to subscribe');
      }
    } catch (error: any) {
      // If the error message is about conflict, show a friendly message
      if (error.message?.includes('already subscribed')) {
        toast.error('You are already subscribed!');
      } else {
        toast.error('Something went wrong. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Column */}
          <div className="space-y-6">
            <Link href="/" className="text-2xl font-bold font-display text-slate-900 dark:text-white mb-6 block tracking-tight">
              {brandName}
            </Link>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              {footerDescription}
            </p>
            <div className="flex space-x-4">
              {social.facebook && (
                <a href={social.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:bg-[#1877F2] hover:text-white transition-all duration-300">
                  <Facebook className="w-5 h-5" />
                </a>
              )}
              {social.twitter && (
                <a href={social.twitter} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:bg-[#1DA1F2] hover:text-white transition-all duration-300">
                  <Twitter className="w-5 h-5" />
                </a>
              )}
              {social.instagram && (
                <a href={social.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:bg-[#E4405F] hover:text-white transition-all duration-300">
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {social.linkedin && (
                <a href={social.linkedin} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:bg-[#0A66C2] hover:text-white transition-all duration-300">
                  <Linkedin className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>

          {/* Product Column */}
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-6">Product</h4>
            <ul className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
              <li><Link href="#features" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Features</Link></li>
              <li><Link href="#pricing" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Pricing</Link></li>
              <li><Link href="/templates" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Templates</Link></li>
              <li><Link href="/integrations" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Integrations</Link></li>
              <li><Link href="/changelog" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Changelog</Link></li>
            </ul>
          </div>

          {/* Resources Column */}
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-6">Resources</h4>
            <ul className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
              <li><Link href="/docs" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Documentation</Link></li>
              <li><Link href="/api" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">API Reference</Link></li>
              <li><Link href="/blog" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Blog</Link></li>
              <li><Link href="/community" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Community</Link></li>
              <li><Link href="/help" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Help Center</Link></li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div className="space-y-6">
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-6">Stay Updated</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Subscribe to our newsletter for the latest updates and eCommerce tips.
              </p>
              <form className="space-y-3" onSubmit={handleSubscribe}>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 px-4 bg-brand-600 hover:bg-brand-700 disabled:opacity-70 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-brand-500/20"
                >
                  {submitting ? 'Subscribing...' : 'Subscribe'}
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500 dark:text-slate-500 flex items-center gap-1">
            {new Date().getFullYear()} {brandName}. All rights reserved. Made with <Heart className="w-4 h-4 text-red-500 fill-current" /> by Gowtam Kumar.
          </p>
          <div className="flex gap-6 text-sm text-slate-500 dark:text-slate-500">
            <Link href="/privacy" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Terms</Link>
            <Link href="/cookies" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
