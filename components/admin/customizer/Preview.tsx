"use client";

import SectionRenderer from '@/components/core/SectionRenderer';
import { CustomizerSection } from '@/types/customizer';

interface PreviewProps {
  sections: CustomizerSection[];
  viewMode: 'desktop' | 'mobile';
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  typography?: {
    fontFamily: string;
    headingFont: string;
    baseFontSize: number;
    headingFontFamily?: string;
    headingFontWeight?: string;
    headingFontSize?: string;
    headingLineHeight?: string;
    paragraphFontFamily?: string;
    paragraphFontWeight?: string;
    paragraphFontSize?: string;
    paragraphLineHeight?: string;
  };
}

export default function Preview({ sections, viewMode, selectedId, onSelect, typography }: PreviewProps) {
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
      <div
        className="flex-1 overflow-y-auto scrollbar-hide flex flex-col"
        style={{
          fontFamily: typography?.fontFamily || 'Inter, sans-serif',
          fontSize: `${typography?.baseFontSize || 16}px`,
          ...(typography?.headingFont && { '--heading-font': typography.headingFont } as React.CSSProperties),
          ...(typography?.headingFontFamily && { '--heading-font-family': typography.headingFontFamily } as React.CSSProperties),
          ...(typography?.headingFontWeight && { '--heading-font-weight': typography.headingFontWeight } as React.CSSProperties),
          ...(typography?.headingFontSize && { '--heading-font-size': typography.headingFontSize } as React.CSSProperties),
          ...(typography?.headingLineHeight && { '--heading-line-height': typography.headingLineHeight } as React.CSSProperties),
          ...(typography?.paragraphFontFamily && { '--paragraph-font-family': typography.paragraphFontFamily } as React.CSSProperties),
          ...(typography?.paragraphFontWeight && { '--paragraph-font-weight': typography.paragraphFontWeight } as React.CSSProperties),
          ...(typography?.paragraphFontSize && { '--paragraph-font-size': typography.paragraphFontSize } as React.CSSProperties),
          ...(typography?.paragraphLineHeight && { '--paragraph-line-height': typography.paragraphLineHeight } as React.CSSProperties),
        }}
      >
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
