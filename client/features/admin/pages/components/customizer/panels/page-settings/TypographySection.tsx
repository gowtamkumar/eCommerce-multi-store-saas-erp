import type { PageData } from '@/types/customizer';
import { ChevronDown, ChevronUp, Type } from 'lucide-react';
import { useState } from 'react';
import DebouncedInput from '../DebouncedInput';
import SectionHeading from './SectionHeading';

type Typography = NonNullable<PageData['typography']>;

interface TypographySectionProps {
  typography: PageData['typography'];
  // Patches use a Partial because the legacy required keys
  // (fontFamily, headingFont, baseFontSize) are filled in elsewhere; this
  // panel only ever toggles the optional per-role fields.
  onChange: (next: Partial<Typography>) => void;
}

const INPUT_CLASS =
  'w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-brand-500 outline-none transition-all';

const HEADING_FONTS = [
  'Inter',
  'Poppins',
  'Montserrat',
  'Raleway',
  'Playfair Display',
  'Bebas Neue',
  'Oswald',
  'Anton',
  'Lora',
  'Merriweather',
];

const PARAGRAPH_FONTS = [
  'Inter',
  'Roboto',
  'Open Sans',
  'Lato',
  'Poppins',
  'Nunito',
  'Work Sans',
];

const HEADING_WEIGHTS = [
  { value: '400', label: 'Regular (400)' },
  { value: '500', label: 'Medium (500)' },
  { value: '600', label: 'Semibold (600)' },
  { value: '700', label: 'Bold (700)' },
  { value: '800', label: 'Extra Bold (800)' },
  { value: '900', label: 'Black (900)' },
];

const PARAGRAPH_WEIGHTS = [
  { value: '300', label: 'Light (300)' },
  { value: '400', label: 'Regular (400)' },
  { value: '500', label: 'Medium (500)' },
  { value: '600', label: 'Semibold (600)' },
];

interface CollapsibleGroupProps {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function CollapsibleGroup({ title, expanded, onToggle, children }: CollapsibleGroupProps) {
  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-800/30">
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-100 dark:hover:bg-slate-800/50"
      >
        <h4 className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
          {title}
        </h4>
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {expanded && (
        <div className="p-4 border-t border-slate-200 dark:border-slate-700 space-y-4 bg-white dark:bg-slate-900">
          {children}
        </div>
      )}
    </div>
  );
}

/**
 * Headings + paragraphs + base font size. Each subgroup is collapsed by
 * default — typography is set once per theme, so we keep the panel quiet
 * until the user opens it.
 */
export default function TypographySection({
  typography,
  onChange,
}: TypographySectionProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggle = (key: string) =>
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));

  const patch = (delta: Partial<Typography>) =>
    onChange({ ...(typography || {}), ...delta });

  return (
    <section className="space-y-4">
      <SectionHeading icon={Type} label="Typography" />

      <div className="space-y-4">
        <CollapsibleGroup
          title="Headings"
          expanded={!!expanded.headings}
          onToggle={() => toggle('headings')}
        >
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Font Family</label>
            <select
              value={typography?.headingFontFamily || 'Inter'}
              onChange={(e) => patch({ headingFontFamily: e.target.value })}
              className={INPUT_CLASS}
            >
              {HEADING_FONTS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Weight</label>
              <select
                value={typography?.headingFontWeight || '700'}
                onChange={(e) => patch({ headingFontWeight: e.target.value })}
                className={INPUT_CLASS}
              >
                {HEADING_WEIGHTS.map((w) => (
                  <option key={w.value} value={w.value}>
                    {w.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Size</label>
              <DebouncedInput
                type="text"
                value={typography?.headingFontSize || ''}
                onChange={(val) => patch({ headingFontSize: val })}
                placeholder="2rem"
                className={INPUT_CLASS}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Line Height</label>
            <DebouncedInput
              type="text"
              value={typography?.headingLineHeight || ''}
              onChange={(val) => patch({ headingLineHeight: val })}
              placeholder="1.2"
              className={INPUT_CLASS}
            />
          </div>
        </CollapsibleGroup>

        <CollapsibleGroup
          title="Paragraphs"
          expanded={!!expanded.paragraphs}
          onToggle={() => toggle('paragraphs')}
        >
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Font Family</label>
            <select
              value={typography?.paragraphFontFamily || 'Inter'}
              onChange={(e) => patch({ paragraphFontFamily: e.target.value })}
              className={INPUT_CLASS}
            >
              {PARAGRAPH_FONTS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Weight</label>
              <select
                value={typography?.paragraphFontWeight || '400'}
                onChange={(e) => patch({ paragraphFontWeight: e.target.value })}
                className={INPUT_CLASS}
              >
                {PARAGRAPH_WEIGHTS.map((w) => (
                  <option key={w.value} value={w.value}>
                    {w.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Size</label>
              <DebouncedInput
                type="text"
                value={typography?.paragraphFontSize || ''}
                onChange={(val) => patch({ paragraphFontSize: val })}
                placeholder="16px"
                className={INPUT_CLASS}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Line Height</label>
            <DebouncedInput
              type="text"
              value={typography?.paragraphLineHeight || ''}
              onChange={(val) => patch({ paragraphLineHeight: val })}
              placeholder="1.6"
              className={INPUT_CLASS}
            />
          </div>
        </CollapsibleGroup>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase">Base Font Size</label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="12"
              max="24"
              step="1"
              value={typography?.baseFontSize || 16}
              onChange={(e) => patch({ baseFontSize: parseInt(e.target.value) })}
              className="flex-1 accent-brand-600"
            />
            <span className="text-[10px] font-bold text-slate-500 w-8 text-right">
              {typography?.baseFontSize || 16}px
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
