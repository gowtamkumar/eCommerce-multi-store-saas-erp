'use client';

import { useSettings } from '@/hooks/SettingsContext';
import { fetchAPI } from '@/services/api';
import { Facebook, Heart, Instagram, Linkedin, Twitter, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

// ─── Newsletter ──────────────────────────────────────────────────────────────
// Extracted to a top-level component so that hook calls are never
// placed after a conditional early return (rules-of-hooks).
interface NewsletterProps {
  show: boolean;
  textColor?: string;
  brandBgStyle: React.CSSProperties;
  brandColor?: string;
}

const Newsletter = ({ show, textColor, brandBgStyle, brandColor }: NewsletterProps) => {
  // ✅ All hooks are declared unconditionally at the top
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Conditional render AFTER all hooks
  if (!show) return null;

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setSubscribing(true);
    setMessage({ text: '', type: '' });

    try {
      const res = await fetchAPI('/subscribers', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });

      if (res.success) {
        setMessage({ text: 'Successfully subscribed!', type: 'success' });
        setEmail('');
      } else {
        setMessage({ text: res.message || 'Failed to subscribe.', type: 'error' });
      }
    } catch {
      setMessage({ text: 'An error occurred. Please try again.', type: 'error' });
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <div className="mb-20 p-8 sm:p-12 rounded-[2.5rem] bg-white/5 dark:bg-slate-800/30 border border-white/10 dark:border-slate-700/50 relative overflow-hidden group">
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand-500/10 blur-[80px] rounded-full group-hover:bg-brand-500/20 transition-all duration-700 pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
        <div className="max-w-xl space-y-4">
          <h4 className="text-3xl font-black tracking-tight" style={{ color: textColor || undefined }}>Stay in the Loop</h4>
          <p className="text-base opacity-60 leading-relaxed font-medium">
            Join our community and get exclusive early access to new arrivals, limited editions, and curated audio experiences.
          </p>
        </div>
        <div className="flex-1 max-w-lg flex flex-col gap-2">
          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              required
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white/10 dark:bg-slate-900/50 border border-white/10 dark:border-slate-700 focus:ring-2 focus:ring-brand-500 rounded-2xl text-sm flex-1 px-6 py-4 outline-none transition-all placeholder:text-slate-500 text-slate-900 dark:text-white"
            />
            <button
              type="submit"
              disabled={subscribing}
              style={brandBgStyle}
              className={`px-8 py-4 ${!brandColor ? 'bg-brand-600 hover:bg-brand-500' : ''} text-white font-bold rounded-2xl transition-all active:scale-95 shadow-xl shadow-brand-500/20 flex items-center justify-center gap-2 group/btn whitespace-nowrap disabled:opacity-70 disabled:cursor-not-allowed`}
            >
              {subscribing ? 'Subscribing...' : 'Subscribe'}
              {!subscribing && <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />}
            </button>
          </form>
          {message.text && (
            <p className={`text-sm font-medium pl-2 ${message.type === 'success' ? 'text-emerald-500' : 'text-rose-500'}`}>
              {message.text}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
// ─────────────────────────────────────────────────────────────────────────────

const Footer = ({ settings: propSettings }: { settings?: any }) => {
  const { settings: contextSettings } = useSettings();

  // Use prop settings if available (e.g. from SaaSLanding), otherwise fall back to context
  const settings = propSettings || contextSettings;
  const footerSettings = settings?.footer;
  const footerTemplate = footerSettings?.template || 'classic';

  const brandName = settings?.brandName || "LuxeAudio";
  const footerDescription = footerSettings?.description || settings?.siteDescription;
  const footerCopyright = footerSettings?.copyright || `© ${new Date().getFullYear()} ${brandName}. Made with Heart by Gowtam Kumar.`;
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

  const getPatternStyles = () => {
    const pattern = footerSettings?.backgroundPattern;
    if (!pattern || pattern === 'none') return {};

    const color = (footerTemplate === 'glass' || footerTemplate === 'elegant' || (footerSettings?.backgroundColor && footerSettings.backgroundColor !== '#ffffff'))
      ? 'rgba(255,255,255,0.03)'
      : 'rgba(0,0,0,0.02)';

    switch (pattern) {
      case 'dots':
        return { backgroundImage: `radial-gradient(${color} 1px, transparent 0)`, backgroundSize: '10px 10px' };
      case 'mesh':
        return { backgroundImage: `linear-gradient(45deg, ${color} 25%, transparent 25%), linear-gradient(-45deg, ${color} 25%, transparent 25%), linear-gradient(45deg, transparent 75%, ${color} 75%), linear-gradient(-45deg, transparent 75%, ${color} 75%)`, backgroundSize: '16px 16px' };
      case 'grid':
        return { backgroundImage: `linear-gradient(${color} 1px, transparent 1px), linear-gradient(90deg, ${color} 1px, transparent 1px)`, backgroundSize: '20px 20px' };
      case 'stripes':
        return { backgroundImage: `repeating-linear-gradient(45deg, ${color}, ${color} 2px, transparent 2px, transparent 10px)` };
      default:
        return {};
    }
  };

  const TopShape = () => {
    const shape = footerSettings?.topShape;
    if (!shape || shape === 'none') return null;

    let color = footerSettings?.backgroundColor || '#0f172a';

    // Adjust shape color for specific templates if no custom bg is set
    if (!footerSettings?.backgroundColor) {
      if (footerTemplate === 'elegant') color = '#1e1b4b'; // deep indigo
      if (footerTemplate === 'corporate') color = '#ffffff';
      if (footerTemplate === 'glass') color = 'transparent';
    }

    if (footerTemplate === 'glass' || footerTemplate === 'floating') return null;

    return (
      <div className="absolute bottom-[99%] left-0 w-full overflow-hidden leading-[0] z-[1] pointer-events-none">
        {shape === 'wave' && (
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full sm:h-[40px] h-[25px]" fill={color}>
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V0C48.1,6,110,24.49,168.69,37.23,212.06,46.67,265,56.44,321.39,56.44Z" transform="rotate(180 600 60)"></path>
          </svg>
        )}
        {shape === 'curve' && (
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full sm:h-[50px] h-[30px]" fill={color}>
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5,73.84-4.36,147.54,16.88,218.2,35.26,69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" transform="rotate(180 600 60)"></path>
          </svg>
        )}
        {shape === 'slant' && (
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full sm:h-[50px] h-[30px]" fill={color}>
            <path d="M1200 120L0 16.48V0h1200v120z" transform="rotate(180 600 60)"></path>
          </svg>
        )}
        {shape === 'notch' && (
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full sm:h-[30px] h-[18px]" fill={color}>
            <path d="M0 0h450l50 30h200l50-30h450v120H0z" transform="rotate(180 600 60)"></path>
          </svg>
        )}
      </div>
    );
  };

  const radiusClasses: Record<string, string> = {
    none: 'rounded-none',
    md: 'rounded-md',
    xl: 'rounded-xl',
    '3xl': 'rounded-[2rem]',
    full: 'rounded-[4rem]'
  };

  const getFooterBaseStyles = () => {
    let baseStyles = "relative py-24 transition-all duration-700 ";
    const radiusClass = radiusClasses[footerSettings?.borderRadius || 'none'];

    switch (footerTemplate) {
      case 'floating':
        baseStyles += `mx-4 sm:mx-8 mb-8 mt-20 ${radiusClass} bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-white/20 shadow-2xl `;
        break;
      case 'glass':
        baseStyles += "bg-white/10 dark:bg-slate-900/40 backdrop-blur-2xl border-t border-white/10 ";
        break;
      case 'elegant':
        baseStyles += "bg-gradient-to-b from-slate-900 to-indigo-950 text-slate-100 border-t border-indigo-500/30 ";
        break;
      case 'modern':
        baseStyles += "bg-slate-950 text-white border-t border-slate-800 ";
        break;
      case 'corporate':
        baseStyles += "bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-t border-slate-200 dark:border-slate-800 ";
        break;
      case 'classic':
      default:
        baseStyles += "bg-slate-900 text-white border-t border-slate-800 ";
        break;
    }

    return baseStyles;
  };

  const footerCustomStyle = {
    backgroundColor: footerSettings?.backgroundColor || undefined,
    color: footerSettings?.textColor || undefined,
    borderTopColor: footerSettings?.borderColor || undefined,
    ...getPatternStyles()
  };

  const shadowClasses: Record<string, string> = {
    none: '',
    subtle: 'shadow-[0_-5px_15px_rgba(0,0,0,0.05)]',
    medium: 'shadow-[0_-15px_30px_rgba(0,0,0,0.1)]',
    strong: 'shadow-[0_-25px_50px_rgba(0,0,0,0.2)]'
  };

  const shadowClass = shadowClasses[footerSettings?.shadowIntensity || 'none'];

  const brandColorStyle = { color: footerSettings?.brandColor || footerSettings?.textColor || undefined };
  const brandBgStyle = { backgroundColor: footerSettings?.brandColor || undefined };




  const colCount = parseInt(footerSettings?.columns || '4') || 4;

  const gridColsClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  }[colCount] || 'lg:grid-cols-4';

  const brandClasses = footerTemplate === 'elegant' ? "font-serif" : "font-black";


  return (
    <footer
      className={`${getFooterBaseStyles()} ${shadowClass}`}
      style={footerCustomStyle}
    >
      {TopShape()}

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Newsletter
          show={footerSettings?.showNewsletter !== false}
          textColor={footerSettings?.textColor}
          brandBgStyle={brandBgStyle}
          brandColor={footerSettings?.brandColor}
        />

        <div className={`grid ${gridColsClass} gap-12 lg:gap-16 mb-20`}>
          <div className="space-y-8">
            <Link href="/" className={`text-5xl ${brandClasses} tracking-tighter hover:opacity-80 transition-opacity inline-block`} style={brandColorStyle}>
              {brandName}
            </Link>
            <p className="opacity-60 max-w-sm leading-relaxed text-sm font-medium">
              {footerDescription}
            </p>

            {(footerSettings?.showSocialLinks !== false) && (
              <div className="flex gap-4">
                {[
                  { name: social.facebook, icon: Facebook, color: 'hover:bg-blue-600' },
                  { name: social.twitter, icon: Twitter, color: 'hover:bg-sky-500' },
                  { name: social.instagram, icon: Instagram, color: 'hover:bg-pink-600' },
                  { name: social.linkedin, icon: Linkedin, color: 'hover:bg-blue-700' }
                ].map((item, id) => item.name && (
                  <a
                    key={id}
                    href={item.name}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-11 h-11 rounded-2xl bg-white/5 dark:bg-slate-800/50 flex items-center justify-center border border-white/10 dark:border-slate-700/50 ${item.color} hover:border-transparent transition-all duration-300 group hover:-translate-y-1 hover:shadow-lg`}
                  >
                    <item.icon className="w-5 h-5 opacity-60 group-hover:opacity-100 group-hover:text-white transition-all" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {footerSettings?.sections && footerSettings.sections.length > 0 ? (
            footerSettings.sections
              .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
              .map((section: any, idx: number) => (
                <div key={idx} className="space-y-8">
                  <h4 className="font-bold text-lg tracking-tight uppercase" style={{ color: footerSettings?.textColor || undefined }}>{section.title}</h4>
                  <ul className="space-y-4 opacity-70 font-medium text-sm">
                    {section.links
                      ?.filter((link: any) => link.isActive !== false)
                      .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
                      .map((link: any, lIdx: number) => (
                        <li key={lIdx}>
                          <Link
                            href={link.href}
                            target={link.isOpenInNewTab ? "_blank" : undefined}
                            rel={link.isOpenInNewTab ? "noopener noreferrer" : undefined}
                            className="hover:text-brand-500 hover:translate-x-1.5 transition-all inline-block group"
                          >
                            <span className="relative">
                              {link.label}
                              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-500 transition-all group-hover:w-full opacity-50"></span>
                            </span>
                          </Link>
                        </li>
                      ))}
                  </ul>
                </div>
              ))
          ) : (
            <div className="space-y-8">
              <h4 className="font-bold text-lg tracking-tight uppercase" style={{ color: footerSettings?.textColor || undefined }}>Quick Links</h4>
              <ul className="space-y-4 opacity-70 font-medium text-sm">
                {pages.map((page: any) => (
                  <li key={page.id}>
                    <Link
                      href={page.isHomePage ? "/" : `/${page.slug}`}
                      className="hover:text-brand-500 hover:translate-x-1.5 transition-all inline-block"
                    >
                      {page.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="border-t border-white/10 dark:border-slate-800 pt-12 flex flex-col md:flex-row justify-between items-center opacity-40 text-[10px] font-black gap-8 uppercase tracking-[0.2em]">
          <div className="flex items-center gap-2">
            {footerCopyright.includes('Heart') ? (
              <span className="flex items-center gap-2">
                &copy; {new Date().getFullYear()} {brandName}. Crafted with <Heart className="w-4 h-4 text-red-500 fill-current animate-pulse" /> by Gowtam Kumar.
              </span>
            ) : (
              footerCopyright
            )}
          </div>
          <div className="flex flex-wrap justify-center gap-x-10 gap-y-4">
            <a href="#" className="hover:opacity-100 transition-opacity">Privacy Policy</a>
            <a href="#" className="hover:opacity-100 transition-opacity">Terms of Service</a>
            <a href="#" className="hover:opacity-100 transition-opacity">Cookies</a>
            <Link href="/doc" className="hover:opacity-100 transition-opacity">Documentation</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
