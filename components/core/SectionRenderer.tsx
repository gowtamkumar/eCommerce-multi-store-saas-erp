import { CustomizerSection, FAQItem, ReviewItem } from "@/types/customizer";
import { MousePointer2, Plus, Star, Tag } from "lucide-react";
import React from "react";
import CategoryGrid from "../store/CategoryGrid";
import ProductSlider from "../store/ProductSlider";
import Link from "next/link";

interface SectionRendererProps {
  sections: CustomizerSection[];
}

const SectionRenderer: React.FC<SectionRendererProps> = ({ sections }) => {
  if (!sections || !Array.isArray(sections)) return null;

  return (
    <>
      {sections.map((section, index) => {
        const settings = section.settings as any;
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
                <div
                  style={{
                    ...styles,
                    backgroundImage: settings?.backgroundImage ? `url(${settings.backgroundImage})` : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                  className="relative min-h-[450px] md:min-h-[600px] flex items-center justify-center bg-slate-100 dark:bg-slate-800 transition-all overflow-hidden"
                >
                  <div className="absolute inset-0 bg-black/50 z-0" />
                  <div className="relative z-10 px-4 md:px-10 text-left w-full max-w-7xl mx-auto">
                    <span className="inline-block px-3 py-1 bg-brand-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-full mb-4">New Season</span>
                    <h1 className="text-4xl md:text-7xl font-extrabold text-white mb-4 leading-tight drop-shadow-lg">
                      {settings?.headline || 'Summer Collection 2026'}
                    </h1>
                    <p className="text-lg md:text-2xl text-white/90 max-w-2xl mb-8 leading-relaxed font-medium">
                      {settings?.subline || 'Discover the latest trends in luxury fashion and accessories.'}
                    </p>
                    <div className="flex flex-wrap gap-4">
                      {(settings?.primaryButtonText || settings?.primaryButtonLink) && (
                        <Link
                          href={settings.primaryButtonLink || "#"}
                          className="px-8 py-3 bg-white text-brand-600 font-bold rounded-lg shadow-xl hover:scale-105 transition-transform">
                          {settings.primaryButtonText || "Shop Now"}
                        </Link>
                      )}
                      {(settings?.secondaryButtonText || settings?.secondaryButtonLink) && (
                        <Link
                          href={settings.secondaryButtonLink || "#"}
                          className="px-8 py-3 bg-white/10 text-white border border-white/30 backdrop-blur-md font-bold rounded-lg hover:bg-white/20 transition-all">
                          {settings.secondaryButtonText || "Learn More"}
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );

            case "product-slider":
              return (
                <ProductSlider
                  headline={settings?.headline}
                  count={settings?.count}
                  collectionId={settings?.collectionId}
                  styles={styles}
                />
              );

            case "category-grid":
              return (
                <CategoryGrid
                  title={settings?.title}
                  count={settings?.count}
                  styles={styles}
                />
              );

            case "offer-banner":
              return (
                <div style={{ ...styles, backgroundColor: settings?.backgroundColor || styles.backgroundColor || '#6366f1' }} className="px-4 md:px-10 py-10 md:py-16 relative overflow-hidden text-white">
                  <div className="absolute top-0 right-0 w-1/3 h-full bg-white/10 skew-x-12 transform translate-x-1/2" />
                  <div className="absolute bottom-0 left-0 w-1/4 h-full bg-black/5 -skew-x-12 transform -translate-x-1/2" />
                  <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-10 relative z-10">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                      <div className="w-24 h-24 bg-white/20 backdrop-blur-xl rounded-[2rem] flex items-center justify-center shadow-2xl border border-white/30 rotate-3">
                        <Tag className="w-12 h-12 text-white" />
                      </div>
                      <div className="text-center md:text-left space-y-2">
                        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none">{settings?.headline || 'FLASH SALE'}</h2>
                        <p className="text-white/80 font-bold uppercase tracking-[0.3em] text-xs md:text-sm">{settings?.subline || 'Limited time offer'}</p>
                      </div>
                    </div>
                    {settings?.buttonText && (
                      <button className="px-12 py-5 bg-white text-brand-600 font-black rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] hover:scale-105 active:scale-95 transition-all uppercase tracking-[0.2em] text-sm whitespace-nowrap">
                        {settings.buttonText}
                      </button>
                    )}
                  </div>
                </div>
              );

            case "review-slider":
              return (
                <div style={styles} className="px-4 md:px-10 py-16 md:py-24 bg-slate-950 border-y border-white/5 overflow-hidden">
                  <div className="max-w-7xl mx-auto">
                    <h2 className="text-center text-white text-3xl font-black mb-16 uppercase tracking-widest">{settings?.title || 'Client Feedback'}</h2>
                    <div className="flex gap-8 overflow-x-auto pb-8 scrollbar-hide">
                      {(settings?.reviews || []).length > 0 ? (
                        settings.reviews.map((review: ReviewItem) => (
                          <div key={review.id} className="min-w-[400px] md:min-w-[500px] bg-white/5 backdrop-blur-xl p-10 rounded-[3rem] border border-white/10 shrink-0">
                            <div className="flex gap-1 mb-8">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`w-5 h-5 ${i < (review.rating || 5) ? 'fill-amber-400 text-amber-400' : 'text-white/10'}`} />
                              ))}
                            </div>
                            <blockquote className="text-2xl text-white/90 mb-10 italic leading-snug">"{review.text}"</blockquote>
                            <div className="flex items-center gap-5">
                              <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-3xl">👤</div>
                              <div>
                                <p className="text-xl font-black text-brand-500 uppercase tracking-tight">{review.author}</p>
                                <p className="text-[10px] text-slate-500 uppercase tracking-[0.3em] font-bold">Verified Luxury Client</p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="w-full py-20 text-center text-white/10 border-4 border-dashed border-white/5 rounded-[3rem]">
                          Add social proof in the customizer settings panel
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );

            case "text-block":
              return (
                <div style={styles} className={`px-4 md:px-10 py-16 md:py-24 flex ${settings?.alignment === 'left' ? 'justify-start text-left' : settings?.alignment === 'right' ? 'justify-end text-right' : 'justify-center text-center'}`}>
                  <div className="max-w-4xl w-full prose dark:prose-invert prose-brand lg:prose-2xl">
                    {settings?.html ? (
                      <div dangerouslySetInnerHTML={{ __html: settings.html }} className="space-y-8" />
                    ) : (
                      <div className="space-y-8">
                        <h2 className="text-5xl md:text-7xl font-black tracking-tight uppercase leading-none">{settings?.headline || 'The Art of Design'}</h2>
                        <div className={`w-32 h-2 bg-brand-600 rounded-full ${settings?.alignment === 'left' ? 'mr-auto' : settings?.alignment === 'right' ? 'ml-auto' : 'mx-auto'}`} />
                        <p className="text-xl md:text-3xl opacity-70 leading-relaxed font-medium">
                          Add meaningful storytelling content here to connect with your customers.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );

            case "image-block":
              return (
                <div style={styles} className="px-4 md:px-10 py-20 md:py-32">
                  <div className={`max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16 md:gap-24 ${settings?.layout === 'right' ? 'md:flex-row-reverse' : ''}`}>
                    <div className="flex-1 w-full relative group">
                      <div className="aspect-[4/5] bg-slate-100 dark:bg-slate-800 rounded-[4rem] border-[12px] border-white dark:border-slate-800 shadow-2xl flex items-center justify-center overflow-hidden transition-all duration-700">
                        {settings?.image ? (
                          <img src={settings.image} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-9xl grayscale group-hover:grayscale-0 transition-all duration-700">🖼️</span>
                        )}
                      </div>
                    </div>
                    <div className="flex-1 text-left space-y-10">
                      <div className="space-y-6">
                        <h2 className="text-6xl md:text-8xl font-black leading-[0.9] tracking-tighter">{settings?.headline || 'Pure Vision'}</h2>
                        <div className="w-16 h-2 bg-brand-600 rounded-full" />
                      </div>
                      <p className="text-xl md:text-2xl opacity-70 leading-relaxed font-medium">
                        {settings?.subline || 'Feature your most important brand assets or stories here with high-quality imagery.'}
                      </p>
                      {settings?.buttonText && (
                        <button className="px-12 py-5 bg-brand-600 text-white font-black rounded-2xl shadow-2xl hover:bg-brand-700 transition-all uppercase tracking-[0.3em] text-sm">
                          Explore More
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );

            case "button":
              return (
                <div style={styles} className="px-4 md:px-10 py-12 flex justify-center">
                  <button className={`
                    font-black rounded-[2rem] transition-all duration-300 uppercase tracking-[0.4em] flex items-center gap-4 group
                    ${settings?.variant === 'outline' ? 'border-4 border-brand-600 text-brand-600 bg-transparent' : 'bg-brand-600 text-white shadow-2xl'}
                    ${settings?.size === 'sm' ? 'px-8 py-3 text-xs' : settings?.size === 'lg' ? 'px-24 py-8 text-lg' : 'px-16 py-6 text-sm'}
                  `}>
                    <span>{settings?.text || 'Shop The Look'}</span>
                    <MousePointer2 className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </button>
                </div>
              );

            case "faq-section":
              return (
                <div style={styles} className="px-4 md:px-10 py-20 md:py-32 bg-slate-50 dark:bg-slate-900/30">
                  <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-20 space-y-4">
                      <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tighter leading-none">{settings?.title || 'Help Center'}</h2>
                      <div className="w-24 h-2 bg-brand-600 mx-auto rounded-full" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {(settings?.items || []).length > 0 ? (
                        settings.items.map((faq: FAQItem) => (
                          <div key={faq.id} className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 md:p-10 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer flex flex-col justify-between group h-fit">
                            <div>
                              <div className="flex items-center justify-between mb-6">
                                <h3 className="text-2xl font-bold leading-tight pr-4">{faq.question}</h3>
                                <div className="shrink-0 w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-700 flex items-center justify-center text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition-all duration-500">
                                  <Plus className="w-6 h-6 group-hover:rotate-45 transition-transform" />
                                </div>
                              </div>
                              <p className="text-slate-500 text-lg leading-relaxed opacity-0 group-hover:opacity-100 max-h-0 group-hover:max-h-40 transition-all duration-700 overflow-hidden">{faq.answer}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-full py-20 text-center text-slate-400 border-4 border-dashed border-slate-100 dark:border-slate-800 rounded-[3rem]">
                          Add questions to your FAQ in the customizer settings panel
                        </div>
                      )}
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
