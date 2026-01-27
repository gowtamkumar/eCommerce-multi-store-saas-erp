"use client";

import BannerSlider from '@/components/store/BannerSlider';
import BuilderButton from '@/components/store/BuilderButton';
import CategoryGrid from '@/components/store/CategoryGrid';
import FAQSection from '@/components/store/FAQSection';
import ImageBlock from '@/components/store/ImageBlock';
import OfferBanner from '@/components/store/OfferBanner';
import ProductSlider from '@/components/store/ProductSlider';
import ReviewSection from '@/components/store/ReviewSection';
import TextBlock from '@/components/store/TextBlock';
import { CustomizerSection, FAQItem } from '@/types/customizer';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, MousePointer2, Plus, Tag } from 'lucide-react';
import { useEffect, useState } from 'react';

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
      return <BannerSlider settings={settings} styles={styles} />

    case 'product-slider':
      return (
        <ProductSlider
          headline={settings?.headline}
          count={settings?.count}
          collectionId={settings?.collectionId}
          styles={styles}
        />
      );

    case 'category-grid':
      return (
        <CategoryGrid
          title={settings?.title}
          count={settings?.count}
          styles={styles}
        />
      );

    case 'offer-banner':
      return (
        <OfferBanner buttonText={settings?.buttonText} headline={settings?.headline} subline={settings?.subline} backgroundColor={settings?.backgroundColor} styles={styles} />
      );

    case 'review-slider':
      return (
        <ReviewSection
          settings={settings}
          styles={styles}
        />
      );

    case "text-block":
      return (
        <TextBlock alignment={settings?.alignment} html={settings?.html} headline={settings?.headline} styles={styles} />
      );

    case "image-block":
      return (
        <ImageBlock image={settings?.image} headline={settings?.headline} subline={settings?.subline} styles={styles} buttonText={settings?.buttonText} />
      );

    case "button":
      return (
        <BuilderButton variant={settings?.variant} size={settings?.size} text={settings?.text} styles={styles} />
      );

    case "faq-section":
      return (
        <FAQSection items={settings?.items} headline={settings?.headline} subline={settings?.subline} styles={styles} buttonText={settings?.buttonText} />
      );
    default:
      return (
        <div style={styles} className="flex flex-col items-center justify-center min-h-[200px] bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-200 dark:border-slate-700">
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{section.type} Section</p>
        </div>
      );
  }
}
