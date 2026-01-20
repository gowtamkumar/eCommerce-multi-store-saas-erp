"use client";

import { CategoryItem, CustomizerSection, FAQItem, ReviewItem } from '@/types/customizer';
import { MousePointer2, Plus, Star, Tag } from 'lucide-react';

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
  const settings = section.settings as any;
  const styles = {
    paddingTop: `${section.styles?.paddingTop || 0}px`,
    paddingBottom: `${section.styles?.paddingBottom || 0}px`,
    backgroundColor: section.styles?.backgroundColor,
    color: section.styles?.textColor,
  };

  switch (section.type) {
    case 'banner':
      return (
        <section
          style={{
            ...styles,
            backgroundImage: settings?.backgroundImage ? `url(${settings.backgroundImage})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
          className="relative min-h-[450px] flex items-center justify-center bg-slate-100 dark:bg-slate-800 transition-all"
        >
          <div className="absolute inset-0 bg-black/50 z-0" />
          <div className="relative z-10 px-10 text-left w-full max-w-4xl">
            <span className="inline-block px-3 py-1 bg-brand-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-full mb-4">New Season</span>
            <h1 className="text-5xl font-extrabold text-white mb-4 leading-tight drop-shadow-lg">
              {settings?.headline || 'Summer Collection 2026'}
            </h1>
            <p className="text-xl text-white/90 max-w-xl mb-8 leading-relaxed font-medium">
              {settings?.subline || 'Discover the latest trends in luxury fashion and accessories.'}
            </p>
            <div className="flex gap-4">
              {settings?.primaryButtonText && (
                <button className="px-8 py-3 bg-white text-brand-600 font-bold rounded-lg shadow-xl hover:scale-105 transition-transform">
                  {settings.primaryButtonText}
                </button>
              )}
              {settings?.secondaryButtonText && (
                <button className="px-8 py-3 bg-white/10 text-white border border-white/30 backdrop-blur-md font-bold rounded-lg hover:bg-white/20 transition-all">
                  {settings.secondaryButtonText}
                </button>
              )}
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
                <h2 className="text-3xl font-bold">{settings?.headline || 'Trending Products'}</h2>
                <div className="w-20 h-1 bg-brand-500 rounded-full" />
              </div>
              <div className="flex gap-2">
                <button className="w-12 h-12 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm">←</button>
                <button className="w-12 h-12 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm">→</button>
              </div>
            </div>
            <div className="flex gap-8 overflow-x-auto pb-4 scrollbar-hide">
              {[...Array(settings?.count || 4)].map((_, i) => (
                <div key={i} className="min-w-[280px] flex-1 group">
                  <div className="aspect-square bg-white dark:bg-slate-800 rounded-[2rem] mb-6 flex items-center justify-center border border-slate-100 dark:border-slate-700 shadow-sm group-hover:shadow-xl transition-all relative overflow-hidden">
                    <span className="text-5xl transform group-hover:scale-110 transition-transform duration-500">👟</span>
                    <div className="absolute bottom-4 right-4 bg-brand-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <Plus className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="px-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Luxury Item</p>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 group-hover:text-brand-600 transition-colors truncate">Product {i + 1}</h3>
                    <div className="flex items-center gap-2">
                      <p className="text-xl font-black text-brand-600">$99.00</p>
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
              <h2 className="text-3xl font-bold mb-3">{settings?.title || 'Explore Collections'}</h2>
              <p className="text-slate-500 font-medium">Carefully curated selections</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              {(settings?.items || []).length > 0 ? (
                settings.items.map((item: CategoryItem) => (
                  <div key={item.id} className="relative aspect-[4/5] rounded-[2.5rem] bg-slate-100 dark:bg-slate-800 flex flex-col items-center justify-center group overflow-hidden border border-slate-200 dark:border-slate-700">
                    {item.image ? (
                      <img src={item.image} alt={item.label} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center grayscale group-hover:grayscale-0 group-hover:scale-120 transition-all duration-700">
                        <span className="text-7xl opacity-40 group-hover:opacity-100 transition-opacity">📦</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8">
                      <h3 className="text-2xl font-bold text-white mb-2">{item.label}</h3>
                      <button className="text-white text-xs font-bold uppercase tracking-widest hover:underline text-left">Shop Now →</button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-12 text-center text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2.5rem]">
                  Add items to your grid in the settings panel
                </div>
              )}
            </div>
          </div>
        </section>
      );

    case 'offer-banner':
      return (
        <section style={{ ...styles, backgroundColor: settings?.backgroundColor || styles.backgroundColor || '#6366f1' }} className="px-10 py-8 relative overflow-hidden text-white">
          <div className="absolute top-0 right-0 w-64 h-full bg-white/10 skew-x-12 transform translate-x-32" />
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                <Tag className="w-8 h-8 text-white" />
              </div>
              <div className="text-center md:text-left">
                <h2 className="text-2xl font-black uppercase tracking-tighter">{settings?.headline || 'FLASH SALE'}</h2>
                <p className="text-white/80 font-bold uppercase tracking-widest text-[10px]">{settings?.subline || 'Limited time offer'}</p>
              </div>
            </div>
            {settings?.buttonText && (
              <button className="px-10 py-4 bg-white text-brand-600 font-black rounded-xl shadow-2xl hover:scale-105 transition-transform uppercase tracking-widest text-sm">
                {settings.buttonText}
              </button>
            )}
          </div>
        </section>
      );

    case 'review-slider':
      return (
        <section style={styles} className="px-10 py-16 bg-slate-900 border-y border-white/5">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-center text-white text-2xl font-bold mb-12">{settings?.title || 'Happy Customers'}</h2>
            <div className="flex gap-8 overflow-x-auto pb-4 scrollbar-hide">
              {(settings?.reviews || []).length > 0 ? (
                settings.reviews.map((review: ReviewItem) => (
                  <div key={review.id} className="min-w-[400px] flex-1 bg-white/5 backdrop-blur-sm p-8 rounded-[2rem] border border-white/10 shrink-0">
                    <div className="flex gap-1 mb-6">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-white/20'}`} />
                      ))}
                    </div>
                    <p className="text-lg text-white/90 mb-8 italic leading-relaxed">"{review.text}"</p>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-xl">👤</div>
                      <div>
                        <p className="font-bold text-white">{review.author}</p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Verified Purchase</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="w-full py-12 text-center text-white/20 border-2 border-dashed border-white/5 rounded-[2rem]">
                  Add reviews to your slider
                </div>
              )}
            </div>
          </div>
        </section>
      );

    case 'text-block':
      return (
        <section style={styles} className={`px-10 py-16 flex ${settings?.alignment === 'left' ? 'justify-start text-left' : settings?.alignment === 'right' ? 'justify-end text-right' : 'justify-center text-center'}`}>
          <div className="max-w-3xl w-full prose dark:prose-invert prose-brand lg:prose-xl">
            {settings?.html ? (
              <div dangerouslySetInnerHTML={{ __html: settings.html }} />
            ) : (
              <div className="space-y-6">
                <h2 className="text-4xl font-black tracking-tight uppercase">{settings?.headline || 'Our Craft'}</h2>
                <p className="text-xl opacity-70 leading-relaxed font-medium">
                  Add meaningful content about your store here.
                </p>
                <div className={`w-24 h-1 bg-brand-600 rounded-full ${settings?.alignment === 'left' ? 'mr-auto' : settings?.alignment === 'right' ? 'ml-auto' : 'mx-auto'}`} />
              </div>
            )}
          </div>
        </section>
      );

    case 'image-block':
      return (
        <section style={styles} className={`px-10 py-20 flex flex-col md:flex-row items-center gap-16 ${settings?.layout === 'right' ? 'md:flex-row-reverse' : ''}`}>
          <div className="flex-1 w-full relative group">
            <div className="aspect-[4/5] bg-slate-100 dark:bg-slate-800 rounded-[3rem] border-8 border-white dark:border-slate-800 shadow-2xl flex items-center justify-center overflow-hidden">
              {settings?.image ? (
                <img src={settings.image} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-8xl">🖼️</span>
              )}
            </div>
          </div>
          <div className="flex-1 text-left space-y-8">
            <div className="space-y-4">
              <h2 className="text-5xl font-black leading-[1.1]">{settings?.headline || 'Uncompromised Design'}</h2>
              <div className="w-16 h-2 bg-brand-600 rounded-full" />
            </div>
            <p className="text-xl opacity-70 leading-relaxed font-medium">
              {settings?.subline || 'Use this area to feature a specific collection or tell your brand story.'}
            </p>
            {settings?.buttonText && <button className="px-10 py-4 bg-brand-600 text-white font-black rounded-xl shadow-xl">{settings.buttonText}</button>}
          </div>
        </section>
      );

    case 'button':
      return (
        <section style={styles} className="px-10 py-8 flex justify-center">
          <button className={`
            font-black rounded-2xl transition-all uppercase tracking-[0.2em] flex items-center gap-3
            ${settings?.variant === 'outline' ? 'border-2 border-brand-600 text-brand-600 bg-transparent' : 'bg-brand-600 text-white shadow-xl'}
            ${settings?.size === 'sm' ? 'px-6 py-2.5 text-[10px]' : settings?.size === 'lg' ? 'px-16 py-6 text-base' : 'px-12 py-5 text-sm'}
          `}>
            <span>{settings?.text || 'Shop Collection'}</span>
            <MousePointer2 className="w-4 h-4" />
          </button>
        </section>
      );

    case 'faq-section':
      return (
        <section style={styles} className="px-10 py-16 bg-slate-50 dark:bg-slate-900/30">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-black mb-4 uppercase tracking-tight">{settings?.title || 'FAQ'}</h2>
            </div>
            <div className="space-y-4">
              {(settings?.items || []).length > 0 ? (
                settings.items.map((faq: FAQItem) => (
                  <div key={faq.id} className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between group">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold">{faq.question}</h3>
                      <p className="text-slate-500 mt-2 text-sm leading-relaxed hidden group-hover:block transition-all">{faq.answer}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-700 flex items-center justify-center text-brand-600 transition-transform group-hover:rotate-45">
                      <Plus className="w-5 h-5" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
                  Add questions to your FAQ in the settings panel
                </div>
              )}
            </div>
          </div>
        </section>
      );

    default:
      return (
        <div style={styles} className="flex flex-col items-center justify-center min-h-[200px] bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-200 dark:border-slate-700">
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{section.type} Section</p>
        </div>
      );
  }
}
