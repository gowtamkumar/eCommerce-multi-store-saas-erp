"use client";

import { CustomizerSection } from '@/types/customizer';
import { MousePointer2, Plus, Tag } from 'lucide-react';

interface PreviewProps {
  sections: CustomizerSection[];
  viewMode: 'desktop' | 'mobile';
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

export default function Preview({ sections, viewMode, selectedId, onSelect }: PreviewProps) {
  return (
    <div className={`bg-white dark:bg-slate-900 shadow-2xl transition-all duration-500 overflow-hidden flex flex-col ${viewMode === 'mobile' ? 'w-[375px] h-[667px] rounded-[40px] border-[12px] border-slate-800 dark:border-slate-800' : 'w-full h-full rounded-xl'}`}>
      {/* Canvas Header (only if not mobile frame) */}
      {viewMode === 'desktop' && (
        <div className="h-8 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center px-4 gap-1.5 shrink-0">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
          <div className="ml-4 flex-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Live Store Preview</div>
        </div>
      )}

      {/* Actual Content Area */}
      <div className="flex-1 overflow-y-auto scrollbar-hide flex flex-col">
        {sections.map((section) => (
          <div
            key={section.id}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(section.id);
            }}
            className={`relative group cursor-pointer border-2 transition-all ${selectedId === section.id ? 'border-brand-500 z-10 scale-[1.01] shadow-lg' : 'border-transparent hover:border-brand-500/30'}`}
          >
            {/* Selection Label */}
            {selectedId === section.id && (
              <div className="absolute top-0 left-0 bg-brand-500 text-white text-[10px] font-bold px-2 py-0.5 z-20 uppercase tracking-wider rounded-br-lg">
                Selected: {(section.type as string).replace('-', ' ')}
              </div>
            )}

            <SectionRenderer section={section} />
          </div>
        ))}

        {sections.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center p-10 text-center text-slate-400">
            <div className="w-20 h-20 rounded-full border-4 border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center mb-6">
              <span className="text-4xl text-slate-200 dark:text-slate-800">🛍️</span>
            </div>
            <h3 className="text-xl font-bold text-slate-300 dark:text-slate-700 mb-2 font-display">Your Store Canvas</h3>
            <p className="max-w-[240px] text-xs font-bold uppercase tracking-wider text-slate-400/50">Add sections from the left sidebar to start building your storefront</p>
          </div>
        )}
      </div>
    </div>
  );
}

function SectionRenderer({ section }: { section: CustomizerSection }) {
  const styles = {
    paddingTop: `${section.styles?.paddingTop || 0}px`,
    paddingBottom: `${section.styles?.paddingBottom || 0}px`,
    backgroundColor: section.styles?.backgroundColor,
    color: section.styles?.textColor,
  };

  switch (section.type) {
    case 'banner':
      return (
        <section style={styles} className="relative min-h-[450px] flex items-center justify-center bg-slate-100 dark:bg-slate-800 transition-all">
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent z-0" />
          <div className="relative z-10 px-10 text-left w-full max-w-4xl">
            <span className="inline-block px-3 py-1 bg-brand-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-full mb-4">New Season</span>
            <h1 className="text-5xl font-extrabold text-white mb-4 leading-tight drop-shadow-lg">
              {section.settings?.headline || 'Summer Collection 2026'}
            </h1>
            <p className="text-xl text-white/90 max-w-xl mb-8 leading-relaxed font-medium">
              {section.settings?.subline || 'Discover the latest trends in luxury fashion and accessories.'}
            </p>
            <div className="flex gap-4">
              <button className="px-8 py-3 bg-white text-brand-600 font-bold rounded-lg shadow-xl hover:scale-105 transition-transform">Shop Men</button>
              <button className="px-8 py-3 bg-white/10 text-white border border-white/30 backdrop-blur-md font-bold rounded-lg hover:bg-white/20 transition-all">Shop Women</button>
            </div>
          </div>
        </section>
      );

    case 'product-slider':
      return (
        <section style={styles} className="px-10 py-16 bg-slate-50 dark:bg-slate-900/50 overflow-hidden">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-10">
              <div className="space-y-1">
                <h2 className="text-3xl font-bold">{section.settings?.headline || 'Trending Products'}</h2>
                <div className="w-20 h-1 bg-brand-500 rounded-full" />
              </div>
              <div className="flex gap-2">
                <button className="w-12 h-12 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm">←</button>
                <button className="w-12 h-12 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm">→</button>
              </div>
            </div>
            <div className="flex gap-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="min-w-[280px] flex-1 group">
                  <div className="aspect-square bg-white dark:bg-slate-800 rounded-[2rem] mb-6 flex items-center justify-center border border-slate-100 dark:border-slate-700 shadow-sm group-hover:shadow-xl transition-all relative overflow-hidden">
                    <span className="text-5xl transform group-hover:scale-110 transition-transform duration-500">👟</span>
                    <div className="absolute bottom-4 right-4 bg-brand-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <Plus className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="px-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Luxury Brand</p>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 group-hover:text-brand-600 transition-colors truncate">Elite Runner {i + 1}</h3>
                    <div className="flex items-center gap-2">
                      <p className="text-xl font-black text-brand-600">$189.00</p>
                      <p className="text-sm text-slate-400 line-through font-medium">$249.00</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      );

    case 'category-grid':
      return (
        <section style={styles} className="px-10 py-16">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-3">{section.settings?.title || 'Shop by Category'}</h2>
              <p className="text-slate-500 font-medium">Explore our curated selections for every style</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              {['Footwear', 'Accessories', 'Outerwear', 'Streetwear', 'Formal', 'Essentials'].slice(0, section.settings?.count || 6).map((cat, i) => (
                <div key={i} className="relative aspect-[4/5] rounded-[2.5rem] bg-slate-100 dark:bg-slate-800 flex flex-col items-center justify-center group overflow-hidden border border-slate-200 dark:border-slate-700">
                  <div className="w-full h-full flex items-center justify-center grayscale group-hover:grayscale-0 group-hover:scale-120 transition-all duration-700">
                    <span className="text-7xl opacity-40 group-hover:opacity-100 transition-opacity">📦</span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8">
                    <h3 className="text-2xl font-bold text-white mb-2">{cat}</h3>
                    <button className="text-white text-xs font-bold uppercase tracking-widest hover:underline text-left">Browse Collection →</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      );

    case 'offer-banner':
      return (
        <section style={styles} className="px-10 py-8 bg-brand-600 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-full bg-white/10 skew-x-12 transform translate-x-32" />
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                <Tag className="w-8 h-8 text-white" />
              </div>
              <div className="text-center md:text-left">
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter">FLASH SALE: 50% OFF</h2>
                <p className="text-white/80 font-bold uppercase tracking-widest text-[10px]">Limited time offer on all premium accessories</p>
              </div>
            </div>
            <button className="px-10 py-4 bg-white text-brand-600 font-black rounded-xl shadow-2xl hover:scale-105 transition-transform uppercase tracking-widest text-sm">Grab The Deal</button>
          </div>
        </section>
      );

    case 'review-slider':
      return (
        <section style={styles} className="px-10 py-20 bg-slate-900 border-y border-white/5">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center gap-1 mb-8">
              {[...Array(5)].map((_, i) => <span key={i} className="text-amber-400 text-2xl">★</span>)}
            </div>
            <blockquote className="text-3xl font-bold text-white mb-10 leading-snug italic">
              "Providing the best shopping experience I've ever had. The quality of products and the speed of delivery is just unmatched. Highly recommended!"
            </blockquote>
            <div className="flex items-center justify-center gap-4">
              <div className="w-14 h-14 rounded-full bg-slate-800 border-2 border-brand-500 flex items-center justify-center text-2xl">👤</div>
              <div className="text-left">
                <p className="text-lg font-bold text-brand-500">Sarah Jenkins</p>
                <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">Verified Customer</p>
              </div>
            </div>
          </div>
        </section>
      );

    case 'text-block':
      return (
        <section style={styles} className="px-10 py-16 flex justify-center">
          <div className="max-w-3xl w-full prose dark:prose-invert prose-brand lg:prose-xl">
            {section.settings?.html ? (
              <div dangerouslySetInnerHTML={{ __html: section.settings.html }} />
            ) : (
              <div className="space-y-6 text-center">
                <h2 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white uppercase">Brand philosophy</h2>
                <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                  We believe that every interaction with a digital store should be as tactile and rewarding as visiting a high-end boutique in Milan. Our architecture reflects this dedication to quality.
                </p>
                <div className="w-24 h-1 bg-brand-600 mx-auto rounded-full" />
              </div>
            )}
          </div>
        </section>
      );

    case 'image-block':
      return (
        <section style={styles} className={`px-10 py-20 container mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center ${section.settings?.layout === 'right' ? 'md:flex-row-reverse' : ''}`}>
          <div className="relative group">
            <div className="aspect-[4/5] bg-slate-100 dark:bg-slate-800 rounded-[3rem] border-8 border-white dark:border-slate-800 shadow-2xl flex items-center justify-center overflow-hidden transition-transform duration-700 group-hover:scale-[0.98]">
              <span className="text-8xl transform group-hover:scale-110 transition-transform duration-700">🖼️</span>
            </div>
            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-brand-600 rounded-full flex flex-col items-center justify-center text-white border-8 border-white dark:border-slate-900 animate-bounce">
              <p className="text-2xl font-black">2026</p>
              <p className="text-[10px] font-bold uppercase tracking-widest">New Arrival</p>
            </div>
          </div>
          <div className="text-left space-y-8">
            <div className="space-y-4">
              <h2 className="text-5xl font-black text-slate-900 dark:text-white leading-[1.1]">{section.settings?.headline || 'Designed for the Elite'}</h2>
              <div className="w-16 h-2 bg-brand-600 rounded-full" />
            </div>
            <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              {section.settings?.subline || 'Every stitch, every pixel, every interaction is crafted with meticulous attention to detail. Experience the peak of modern eCommerce design.'}
            </p>
            <button className="px-10 py-4 bg-brand-600 text-white font-black rounded-xl shadow-xl hover:shadow-2xl hover:bg-brand-700 transition-all uppercase tracking-widest text-sm">Explore Details</button>
          </div>
        </section>
      );

    case 'button':
      return (
        <section style={styles} className="px-10 py-8 flex justify-center">
          <button className={`px-12 py-5 bg-brand-600 text-white font-black rounded-2xl shadow-xl hover:shadow-brand-600/30 hover:scale-105 transition-all uppercase tracking-[0.2em] text-sm flex items-center gap-3 active:scale-95`}>
            <span>{section.settings?.text || 'Click To Shop'}</span>
            <MousePointer2 className="w-4 h-4" />
          </button>
        </section>
      );

    case 'faq-section':
      return (
        <section style={styles} className="px-10 py-16 bg-slate-50 dark:bg-slate-900/30">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tight">Need Help?</h2>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Everything you need to know about our service</p>
            </div>
            <div className="space-y-4">
              {[
                { q: "How fast is delivery?", a: "We offer worldwide shipping with tracked delivery within 3-5 business days." },
                { q: "Can I return products?", a: "Yes, we offer a 30-day no-questions-asked return policy for all our premium items." },
                { q: "Are the products authentic?", a: "All products are verified by our expert team to ensure 100% authenticity." }
              ].map((faq, i) => (
                <div key={i} className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex items-center justify-between group">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{faq.q}</h3>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm leading-relaxed hidden group-hover:block animate-in fade-in slide-in-from-top-2">{faq.a}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-700 flex items-center justify-center text-brand-600 transition-transform group-hover:rotate-45">
                    <Plus className="w-5 h-5" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      );

    default:
      return (
        <div style={styles} className="flex flex-col items-center justify-center min-h-[200px] bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-200 dark:border-slate-700">
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{(section.type as any)?.replace('-', ' ')} Section</p>
          <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-widest opacity-50">Content Rendering Coming Soon</p>
        </div>
      );
  }
}
