"use client";

import { CustomizerSection } from '@/types/customizer';

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
    paddingTop: `${section.styles.paddingTop}px`,
    paddingBottom: `${section.styles.paddingBottom}px`,
    backgroundColor: section.styles.backgroundColor,
    color: section.styles.textColor,
  };

  switch (section.type) {
    case 'hero-banner':
      return (
        <section style={styles} className="relative min-h-[400px] flex items-center justify-center bg-slate-100 dark:bg-slate-800">
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent z-0" />
          <div className="relative z-10 px-10 text-left w-full max-w-4xl">
            <h1 className="text-4xl font-extrabold text-white mb-4 leading-tight drop-shadow-lg">
              {section.settings.headline || 'Your Masterpiece Headline'}
            </h1>
            <p className="text-lg text-white/90 max-w-xl mb-8 leading-relaxed font-medium">
              {section.settings.subline || 'Experience the future of eCommerce with our premium Shopify-like customizer.'}
            </p>
            <button className="px-8 py-3 bg-white text-brand-600 font-bold rounded-lg shadow-xl hover:scale-105 transition-transform">
              Shop Now
            </button>
          </div>
        </section>
      );

    case 'featured-collection':
      return (
        <section style={styles} className="px-10 py-12">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold mb-8 text-center">{section.settings.title || 'Featured Collection'}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(section.settings.count || 4)].map((_, i) => (
                <div key={i} className="group cursor-pointer">
                  <div className="aspect-[3/4] bg-slate-100 dark:bg-slate-800 rounded-2xl mb-4 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-700">
                    <span className="text-4xl grayscale opacity-30 group-hover:grayscale-0 group-hover:opacity-100 transition-all group-hover:scale-110">🛍️</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Premium Product {i + 1}</h3>
                  <p className="text-sm font-bold text-brand-600">$99.00</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      );

    case 'product-slider':
      return (
        <section style={styles} className="px-10 py-12 bg-slate-50 dark:bg-slate-900/50 overflow-hidden">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">{section.settings.headline || 'Trending Now'}</h2>
              <div className="flex gap-2">
                <button className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-white dark:hover:bg-slate-800 transition-colors">←</button>
                <button className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-white dark:hover:bg-slate-800 transition-colors">→</button>
              </div>
            </div>
            <div className="flex gap-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="min-w-[240px] flex-1">
                  <div className="aspect-square bg-white dark:bg-slate-800 rounded-2xl mb-4 flex items-center justify-center border border-slate-100 dark:border-slate-700 shadow-sm">
                    <span className="text-4xl">👟</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Luxury Sneaker {i + 1}</h3>
                  <p className="text-sm font-bold text-brand-600">$149.00</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      );

    case 'image-with-text':
      return (
        <section style={styles} className={`px-10 py-16 flex flex-col md:flex-row items-center gap-12 ${section.settings.layout === 'right' ? 'md:flex-row-reverse' : ''}`}>
          <div className="flex-1 w-full aspect-video bg-slate-100 dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden">
            <span className="text-6xl opacity-20">🖼️</span>
          </div>
          <div className="flex-1 text-left">
            <h2 className="text-3xl font-bold mb-4">{section.settings.headline || 'Impactful Storytelling'}</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
              {section.settings.subline || 'Pair large text with an image to tell a story, explain a product detail, or describe a new collection.'}
            </p>
            <button className="px-6 py-2.5 bg-brand-600 text-white font-bold rounded-lg shadow-lg">Learn More</button>
          </div>
        </section>
      );

    case 'rich-text':
      return (
        <section style={styles} className="px-10">
          <div className="max-w-3xl mx-auto prose dark:prose-invert">
            {section.settings.html ? (
              <div dangerouslySetInnerHTML={{ __html: section.settings.html }} />
            ) : (
              <div className="text-center py-10 opacity-50 italic">
                <p>Welcome to our brand story. We believe in quality, craftsmanship, and the art of modern eCommerce architecture.</p>
              </div>
            )}
          </div>
        </section>
      );

    case 'newsletter':
      return (
        <section style={{ ...styles, backgroundColor: section.styles.backgroundColor || '#6366f1', color: section.styles.textColor || '#ffffff' }} className="px-10 text-center">
          <div className="max-w-2xl mx-auto py-10">
            <h2 className="text-3xl font-bold mb-3">Join the Community</h2>
            <p className="mb-8 opacity-90 font-medium">Be the first to know about new collection launches and exclusive events.</p>
            <div className="flex gap-2 max-w-md mx-auto">
              <input type="email" placeholder="email@address.com" className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/50" />
              <button className="px-6 py-3 bg-white text-indigo-600 font-bold rounded-lg shadow-lg">Subscribe</button>
            </div>
          </div>
        </section>
      );

    default:
      return (
        <div style={styles} className="flex flex-col items-center justify-center min-h-[200px] bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-200 dark:border-slate-700">
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{section.type?.replace('-', ' ')} Section</p>
          <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-widest opacity-50">Content Rendering Coming Soon</p>
        </div>
      );
  }
}
