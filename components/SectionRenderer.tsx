import { CustomizerSection } from "@/types/customizer";
import { MousePointer2, Plus, Tag } from "lucide-react";
import React from "react";

interface SectionRendererProps {
  sections: CustomizerSection[];
}

const SectionRenderer: React.FC<SectionRendererProps> = ({ sections }) => {
  if (!sections || !Array.isArray(sections)) return null;

  return (
    <>
      {sections.map((section, index) => {
        const styles = {
          paddingTop: `${section.styles?.paddingTop || 0}px`,
          paddingBottom: `${section.styles?.paddingBottom || 0}px`,
          backgroundColor: section.styles?.backgroundColor,
          color: section.styles?.textColor,
        };

        const renderContent = () => {
          switch (section.type) {
            case "banner":
              return (
                <div style={styles} className="relative min-h-[450px] md:min-h-[600px] flex items-center justify-center bg-slate-100 dark:bg-slate-800 transition-all overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent z-0" />
                  <div className="relative z-10 px-4 md:px-10 text-left w-full max-w-7xl mx-auto">
                    <span className="inline-block px-3 py-1 bg-brand-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-full mb-4">New Season</span>
                    <h1 className="text-4xl md:text-7xl font-extrabold text-white mb-4 leading-tight drop-shadow-lg">
                      {section.settings?.headline || 'Summer Collection 2026'}
                    </h1>
                    <p className="text-lg md:text-2xl text-white/90 max-w-2xl mb-8 leading-relaxed font-medium">
                      {section.settings?.subline || 'Discover the latest trends in luxury fashion and accessories.'}
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <button className="px-8 py-3 bg-white text-brand-600 font-bold rounded-lg shadow-xl hover:scale-105 transition-transform">Shop Men</button>
                      <button className="px-8 py-3 bg-white/10 text-white border border-white/30 backdrop-blur-md font-bold rounded-lg hover:bg-white/20 transition-all">Shop Women</button>
                    </div>
                  </div>
                </div>
              );

            case "product-slider":
              return (
                <div style={styles} className="px-4 md:px-10 py-16 md:py-24 bg-slate-50 dark:bg-slate-900/40 overflow-hidden">
                  <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between mb-10 md:mb-16">
                      <div className="space-y-1">
                        <h2 className="text-3xl md:text-4xl font-black tracking-tight">{section.settings?.headline || 'Trending Products'}</h2>
                        <div className="w-20 h-1.5 bg-brand-500 rounded-full" />
                      </div>
                      <div className="hidden md:flex gap-3">
                        <button className="w-14 h-14 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm">←</button>
                        <button className="w-14 h-14 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm">→</button>
                      </div>
                    </div>
                    <div className="flex gap-6 md:gap-10 overflow-x-auto pb-8 scrollbar-hide">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="min-w-[280px] md:min-w-[320px] flex-1 group cursor-pointer">
                          <div className="aspect-square bg-white dark:bg-slate-800 rounded-[2.5rem] mb-6 flex items-center justify-center border border-slate-100 dark:border-slate-700 shadow-sm group-hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
                            <span className="text-6xl transform group-hover:scale-110 transition-transform duration-700">👟</span>
                            <div className="absolute bottom-6 right-6 bg-brand-600 text-white p-3 rounded-full opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-xl">
                              <Plus className="w-6 h-6" />
                            </div>
                          </div>
                          <div className="px-2">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Premium Edition</p>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1 group-hover:text-brand-600 transition-colors truncate">Luxury Sneaker {i}</h3>
                            <div className="flex items-center gap-3">
                              <p className="text-2xl font-black text-brand-600">$199.00</p>
                              <p className="text-base text-slate-400 line-through font-medium">$299.00</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );

            case "category-grid":
              return (
                <div style={styles} className="px-4 md:px-10 py-16 md:py-24">
                  <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16 space-y-4">
                      <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase">{section.settings?.title || 'Explore Collections'}</h2>
                      <div className="w-24 h-1.5 bg-brand-600 mx-auto rounded-full" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                      {['Modern Footwear', 'Elegant Watches', 'Minimalist Bags', 'Premium Tech', 'Limited Drops', 'Essentials'].slice(0, section.settings?.count || 6).map((cat, i) => (
                        <div key={i} className="relative aspect-[4/5] rounded-[3rem] bg-slate-100 dark:bg-slate-800 flex flex-col items-center justify-center group overflow-hidden border border-slate-200 dark:border-slate-700 transition-all hover:-translate-y-2">
                          <div className="w-full h-full flex items-center justify-center grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000">
                            <span className="text-8xl opacity-30 group-hover:opacity-100 transition-opacity">📦</span>
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-10">
                            <h3 className="text-3xl font-black text-white mb-3 uppercase tracking-tight">{cat}</h3>
                            <button className="text-white text-sm font-bold uppercase tracking-[0.2em] hover:text-brand-400 transition-colors text-left flex items-center gap-2">
                              Shop Collection <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );

            case "offer-banner":
              return (
                <div style={styles} className="px-4 md:px-10 py-10 md:py-16 bg-brand-600 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-1/3 h-full bg-white/10 skew-x-12 transform translate-x-1/2" />
                  <div className="absolute bottom-0 left-0 w-1/4 h-full bg-black/5 -skew-x-12 transform -translate-x-1/2" />
                  <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-10 relative z-10">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                      <div className="w-24 h-24 bg-white/20 backdrop-blur-xl rounded-[2rem] flex items-center justify-center shadow-2xl border border-white/30 rotate-3">
                        <Tag className="w-12 h-12 text-white" />
                      </div>
                      <div className="text-center md:text-left space-y-2">
                        <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter leading-none">{section.settings?.headline || 'FLASH SALE: 70% OFF'}</h2>
                        <p className="text-white/80 font-bold uppercase tracking-[0.3em] text-xs md:text-sm">Exclusive weekend offer. Use code: LUXE70</p>
                      </div>
                    </div>
                    <button className="px-12 py-5 bg-white text-brand-600 font-black rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] hover:scale-105 active:scale-95 transition-all uppercase tracking-[0.2em] text-sm whitespace-nowrap">Redeem Offer Now</button>
                  </div>
                </div>
              );

            case "review-slider":
              return (
                <div style={styles} className="px-4 md:px-10 py-20 md:py-32 bg-slate-950 border-y border-white/5 flex items-center justify-center overflow-hidden relative">
                  <div className="absolute top-10 left-10 text-9xl text-white/5 font-serif">"</div>
                  <div className="absolute bottom-10 right-10 text-9xl text-white/5 font-serif rotate-180">"</div>
                  <div className="max-w-5xl mx-auto text-center relative z-10">
                    <div className="flex justify-center gap-2 mb-10">
                      {[...Array(5)].map((_, i) => <span key={i} className="text-amber-400 text-3xl">★</span>)}
                    </div>
                    <blockquote className="text-3xl md:text-5xl font-black text-white mb-16 leading-tight tracking-tight max-w-4xl mx-auto">
                      "One of the most seamless shopping experiences. The attention to detail in every product is simply remarkable."
                    </blockquote>
                    <div className="flex flex-col items-center gap-5">
                      <div className="w-20 h-20 rounded-full bg-slate-800 border-4 border-brand-500 shadow-brand-500/20 shadow-2xl flex items-center justify-center text-4xl">📸</div>
                      <div className="space-y-1">
                        <p className="text-2xl font-black text-brand-500 uppercase tracking-tight">Alexander Wright</p>
                        <p className="text-xs text-slate-500 uppercase tracking-[0.4em] font-bold">Elite Member Since 2021</p>
                      </div>
                    </div>
                  </div>
                </div>
              );

            case "text-block":
              return (
                <div style={styles} className="px-4 md:px-10 py-16 md:py-24 flex justify-center">
                  <div className="max-w-4xl w-full prose dark:prose-invert prose-brand lg:prose-2xl text-center">
                    {section.settings?.html ? (
                      <div dangerouslySetInnerHTML={{ __html: section.settings.html }} className="space-y-8" />
                    ) : (
                      <div className="space-y-8">
                        <h2 className="text-5xl md:text-7xl font-black tracking-tight text-slate-900 dark:text-white uppercase leading-none">{section.settings?.headline || 'Crafting Excellence'}</h2>
                        <div className="w-32 h-2 bg-brand-600 mx-auto rounded-full" />
                        <p className="text-xl md:text-3xl text-slate-600 dark:text-slate-400 leading-relaxed font-medium max-w-3xl mx-auto">
                          Our mission is to redefine luxury for the modern consumer by combining traditional craftsmanship with cutting-edge innovation.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );

            case "image-block":
              return (
                <div style={styles} className="px-4 md:px-10 py-20 md:py-32">
                  <div className={`max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24 items-center ${section.settings?.layout === 'right' ? 'lg:flex-row-reverse' : ''}`}>
                    <div className="relative group lg:order-last">
                      <div className="aspect-[4/5] bg-slate-100 dark:bg-slate-800 rounded-[4rem] border-[12px] border-white dark:border-slate-800 shadow-[0_50px_100px_rgba(0,0,0,0.15)] flex items-center justify-center overflow-hidden transition-all duration-1000 group-hover:shadow-[0_80px_150px_rgba(0,0,0,0.25)]">
                        <span className="text-9xl transform group-hover:scale-110 transition-transform duration-1000 grayscale group-hover:grayscale-0">💎</span>
                      </div>
                      <div className="absolute -bottom-12 -left-12 w-56 h-56 bg-brand-600 rounded-[3rem] flex flex-col items-center justify-center text-white border-[12px] border-slate-50 dark:border-slate-900 shadow-2xl animate-pulse">
                        <p className="text-4xl font-black">7/24</p>
                        <p className="text-xs font-bold uppercase tracking-widest mt-1">Luxe Support</p>
                      </div>
                    </div>
                    <div className="text-left space-y-10 lg:order-first">
                      <div className="space-y-6">
                        <span className="text-brand-600 font-bold uppercase tracking-[0.5em] text-sm">Our Promise</span>
                        <h2 className="text-6xl md:text-8xl font-black text-slate-900 dark:text-white leading-[0.9] tracking-tighter">{section.settings?.headline || 'Uncompromised Quality'}</h2>
                      </div>
                      <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                        {section.settings?.subline || 'Every material is sourced from verified sustainable partners. We believe in products that last a lifetime, not just a season.'}
                      </p>
                      <button className="px-12 py-5 bg-brand-600 text-white font-black rounded-2xl shadow-2xl hover:bg-brand-700 hover:shadow-brand-600/30 transition-all uppercase tracking-[0.3em] text-sm group">
                        Discover More <Plus className="w-4 h-4 inline-block ml-2 group-hover:rotate-90 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              );

            case "button":
              return (
                <div style={styles} className="px-4 md:px-10 py-12 flex justify-center">
                  <button className="px-16 py-6 bg-brand-600 text-white font-black rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:shadow-brand-600/40 hover:scale-[1.05] transition-all duration-300 uppercase tracking-[0.4em] text-sm flex items-center gap-4 group">
                    <span>{section.settings?.text || 'Explore Collection'}</span>
                    <MousePointer2 className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </button>
                </div>
              );

            case "faq-section":
              return (
                <div style={styles} className="px-4 md:px-10 py-20 md:py-32 bg-slate-50 dark:bg-slate-900/30">
                  <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-20 space-y-4">
                      <h2 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">{section.settings?.title || 'Common Questions'}</h2>
                      <div className="w-24 h-2 bg-brand-600 mx-auto rounded-full" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {[
                        { q: "Global Shipping?", a: "We deliver to over 150 countries within 48-72 hours." },
                        { q: "Secure Payments?", a: "Your transactions are encrypted with military-grade SSL standards." },
                        { q: "Member Benefits?", a: "Enjoy 20% off your first purchase and early access to drops." },
                        { q: "Quality Control?", a: "Triple-inspection process for every single item before shipping." }
                      ].map((faq, i) => (
                        <div key={i} className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 md:p-10 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer flex flex-col justify-between group h-fit">
                          <div>
                            <div className="flex items-center justify-between mb-6">
                              <h3 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight pr-4">{faq.q}</h3>
                              <div className="shrink-0 w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-700 flex items-center justify-center text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition-all duration-500">
                                <Plus className="w-6 h-6 group-hover:rotate-45 transition-transform" />
                              </div>
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed opacity-0 group-hover:opacity-100 max-h-0 group-hover:max-h-40 transition-all duration-700 overflow-hidden">{faq.a}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            default:
              return null;
          }
        };

        return (
          <div key={section.id || index}>
            {renderContent()}
          </div>
        );
      })}
    </>
  );
};

export default SectionRenderer;
