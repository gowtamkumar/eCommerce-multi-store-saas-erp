"use client";

import { CustomizerSection } from '@/types/customizer';
import { Palette, Settings2, Type, X } from 'lucide-react';

interface SettingsPanelProps {
  section: CustomizerSection;
  onUpdate: (section: CustomizerSection) => void;
  onClose: () => void;
}

export default function SettingsPanel({ section, onUpdate, onClose }: SettingsPanelProps) {
  const updateSetting = (key: string, value: any) => {
    onUpdate({
      ...section,
      settings: { ...section.settings, [key]: value },
    });
  };

  const updateStyle = (key: string, value: any) => {
    onUpdate({
      ...section,
      styles: { ...(section.styles || { paddingTop: 40, paddingBottom: 40 }), [key]: value },
    });
  };

  const getSectionTitle = (type: string) => {
    return type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800">
      <div className="h-14 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <div className="flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-brand-600" />
          <h2 className="text-sm font-bold truncate">{getSectionTitle(section.type)}</h2>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Content Settings */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <Type className="w-3.5 h-3.5" />
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Content</h3>
          </div>

          {section.type === 'banner' && (
            <>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Headline</label>
                <input
                  type="text"
                  value={section.settings?.headline || ''}
                  onChange={(e) => updateSetting('headline', e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                  placeholder="e.g. Summer Collection 2026"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Subline</label>
                <textarea
                  value={section.settings?.subline || ''}
                  onChange={(e) => updateSetting('subline', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                  placeholder="Short description under headline"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Button Text</label>
                <input
                  type="text"
                  value={section.settings?.buttonText || ''}
                  onChange={(e) => updateSetting('buttonText', e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                  placeholder="e.g. Shop Now"
                />
              </div>
            </>
          )}

          {section.type === 'product-slider' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Section Headline</label>
                <input
                  type="text"
                  value={section.settings?.headline || ''}
                  onChange={(e) => updateSetting('headline', e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                  placeholder="e.g. Trending Products"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Products Count</label>
                <input
                  type="number"
                  value={section.settings?.count || 4}
                  onChange={(e) => updateSetting('count', parseInt(e.target.value))}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                />
              </div>
            </div>
          )}

          {section.type === 'category-grid' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Grid Title</label>
                <input
                  type="text"
                  value={section.settings?.title || ''}
                  onChange={(e) => updateSetting('title', e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                  placeholder="e.g. Shop by Category"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Categories Count</label>
                <input
                  type="number"
                  value={section.settings?.count || 6}
                  onChange={(e) => updateSetting('count', parseInt(e.target.value))}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                />
              </div>
            </div>
          )}

          {section.type === 'offer-banner' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Main Title</label>
                <input
                  type="text"
                  value={section.settings?.headline || ''}
                  onChange={(e) => updateSetting('headline', e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                  placeholder="e.g. FLASH SALE: 50% OFF"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Offer Details</label>
                <input
                  type="text"
                  value={section.settings?.subline || ''}
                  onChange={(e) => updateSetting('subline', e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                  placeholder="e.g. Limited time offer"
                />
              </div>
            </div>
          )}

          {section.type === 'review-slider' && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Slider Headline</label>
              <input
                type="text"
                value={section.settings?.title || ''}
                onChange={(e) => updateSetting('title', e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                placeholder="e.g. Customer Stories"
              />
            </div>
          )}

          {section.type === 'text-block' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Block Title</label>
                <input
                  type="text"
                  value={section.settings?.headline || ''}
                  onChange={(e) => updateSetting('headline', e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Content (HTML)</label>
                <textarea
                  value={section.settings?.html || ''}
                  onChange={(e) => updateSetting('html', e.target.value)}
                  rows={8}
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                />
              </div>
            </div>
          )}

          {section.type === 'image-block' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Block Headline</label>
                <input
                  type="text"
                  value={section.settings?.headline || ''}
                  onChange={(e) => updateSetting('headline', e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Sub-headline</label>
                <textarea
                  value={section.settings?.subline || ''}
                  onChange={(e) => updateSetting('subline', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Layout</label>
                <select
                  value={section.settings?.layout || 'left'}
                  onChange={(e) => updateSetting('layout', e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                >
                  <option value="left">Image Left</option>
                  <option value="right">Image Right</option>
                </select>
              </div>
            </div>
          )}

          {section.type === 'button' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Button Label</label>
                <input
                  type="text"
                  value={section.settings?.text || ''}
                  onChange={(e) => updateSetting('text', e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Link URL</label>
                <input
                  type="text"
                  value={section.settings?.link || ''}
                  onChange={(e) => updateSetting('link', e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                  placeholder="/shop or https://..."
                />
              </div>
            </div>
          )}

          {section.type === 'faq-section' && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Section Title</label>
              <input
                type="text"
                value={section.settings?.title || ''}
                onChange={(e) => updateSetting('title', e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                placeholder="e.g. Frequently Asked Questions"
              />
            </div>
          )}
        </section>

        {/* Style Settings */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <Palette className="w-3.5 h-3.5" />
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Styling</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Padding Top</label>
              <div className="flex items-center gap-2">
                <input
                  type="range" min="0" max="200" step="10"
                  value={section.styles?.paddingTop || 0}
                  onChange={(e) => updateStyle('paddingTop', parseInt(e.target.value))}
                  className="flex-1 accent-brand-600"
                />
                <span className="text-[10px] font-bold text-slate-500 w-8">{section.styles?.paddingTop || 0}px</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Padding Bottom</label>
              <div className="flex items-center gap-2">
                <input
                  type="range" min="0" max="200" step="10"
                  value={section.styles?.paddingBottom || 0}
                  onChange={(e) => updateStyle('paddingBottom', parseInt(e.target.value))}
                  className="flex-1 accent-brand-600"
                />
                <span className="text-[10px] font-bold text-slate-500 w-8">{section.styles?.paddingBottom || 0}px</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Background</label>
              <div className="flex items-center gap-2 p-1 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <input
                  type="color"
                  value={section.styles?.backgroundColor || '#ffffff'}
                  onChange={(e) => updateStyle('backgroundColor', e.target.value)}
                  className="w-8 h-8 rounded border-none bg-transparent"
                />
                <span className="text-[10px] font-mono text-slate-500 uppercase">{section.styles?.backgroundColor || '#ffffff'}</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Text Color</label>
              <div className="flex items-center gap-2 p-1 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <input
                  type="color"
                  value={section.styles?.textColor || '#000000'}
                  onChange={(e) => updateStyle('textColor', e.target.value)}
                  className="w-8 h-8 rounded border-none bg-transparent"
                />
                <span className="text-[10px] font-mono text-slate-500 uppercase">{section.styles?.textColor || '#000000'}</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
        <button
          onClick={onClose}
          className="w-full py-2 text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-brand-600 transition-colors"
        >
          Done Editing
        </button>
      </div>
    </div>
  );
}
