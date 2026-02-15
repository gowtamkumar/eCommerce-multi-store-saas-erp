'use client';

import { useSettings } from '@/hooks/SettingsContext';
import { fetchAPI } from '@/services/api';
import { Facebook, Heart, Instagram, Linkedin, Twitter } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const Footer = ({ settings: propSettings }: { settings?: any }) => {
  const { settings: contextSettings } = useSettings();

  // Use prop settings if available (e.g. from SaaSLanding), otherwise fall back to context
  const settings = propSettings || contextSettings;

  const brandName = settings?.brandName || "LuxeAudio";
  const footerDescription = settings?.footerDescription || settings?.siteDescription;
  const footerCopyright = settings?.footerCopyright || `© ${new Date().getFullYear()} ${brandName}. Made with Heart by Gowtam Kumar.`;
  const social: any = settings?.socialLinks || {};

  const [pages, setPages] = useState<any[]>([]);

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const res = await fetchAPI("/pages?status=published");
      if (res.success) {
        setPages(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch footer pages", error);
    }
  };

  return (
    <footer className="bg-slate-900 text-white py-16 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="text-3xl font-bold text-white mb-6 block tracking-tight">
              {brandName}
            </Link>
            <p className="text-slate-400 max-w-sm leading-relaxed mb-8">
              {footerDescription}
            </p>
            <div className="flex space-x-4">
              {social.facebook && (
                <a href={social.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all duration-300">
                  <Facebook className="w-5 h-5" />
                </a>
              )}
              {social.twitter && (
                <a href={social.twitter} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-blue-400 hover:text-white transition-all duration-300">
                  <Twitter className="w-5 h-5" />
                </a>
              )}
              {social.instagram && (
                <a href={social.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-pink-600 hover:text-white transition-all duration-300">
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {social.linkedin && (
                <a href={social.linkedin} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-blue-700 hover:text-white transition-all duration-300">
                  <Linkedin className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>
          {(
            <>
              <div>
                <h4 className="font-bold text-lg mb-6 text-white">Pages</h4>
                <ul className="space-y-4 text-slate-400">
                  {pages.map((page) => (
                    <li key={page.id}>
                      <Link
                        href={page.isHomePage ? "/" : `/${page.slug}`}
                        className="hover:text-brand-400 transition-colors"
                      >
                        {page.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

            </>
          )}
        </div>
        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-slate-500 text-sm">
          <div className="flex items-center gap-1">
            {footerCopyright.includes('Heart') ? (
              <>
                &copy; {new Date().getFullYear()} {brandName}. Made with <Heart className="w-4 h-4 text-red-500 fill-current" /> by Gowtam Kumar.
              </>
            ) : (
              footerCopyright
            )}
          </div>
          <div className="flex space-x-8 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
            <Link href="/doc" className="hover:text-white transition-colors">Doc</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
