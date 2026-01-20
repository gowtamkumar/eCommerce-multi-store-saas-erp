"use client";

import { CustomizerSection } from '@/types/customizer';
import { Image as ImageIcon, Palette, Settings2, Type, X } from 'lucide-react';

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
      styles: { ...section.styles, [key]: value },
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

          {section.type === 'hero-banner' && (
            <>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Headline</label>
                <input
                  type="text"
                  value={section.settings.headline || ''}
                  onChange={(e) => updateSetting('headline', e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                  placeholder="The primary title"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Subline</label>
                <textarea
                  value={section.settings.subline || ''}
                  onChange={(e) => updateSetting('subline', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                  placeholder="Short description"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase text-center block mb-2">Banner Image</label>
                <div className="aspect-video bg-slate-100 dark:bg-slate-800 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-brand-500 transition-all p-4 group">
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-full shadow-sm group-hover:scale-110 transition-transform">
                    <ImageIcon className="w-5 h-5 text-slate-400 group-hover:text-brand-600" />
                  </div>
                  <p className="text-[10px] font-bold text-slate-500">Select Image</p>
                </div>
              </div>
            </>
          )}

          {section.type === 'featured-collection' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Collection Title</label>
                <input
                  type="text"
                  value={section.settings.title || ''}
                  onChange={(e) => updateSetting('title', e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                  placeholder="e.g. Best Sellers"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Select Collection</label>
                <select
                  value={section.settings.collectionId || ''}
                  onChange={(e) => updateSetting('collectionId', e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                >
                  <option value="">Select a collection</option>
                  <option value="all">All Products</option>
                  <option value="new">New Arrivals</option>
                  <option value="summer">Summer Collection</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Products Count</label>
                <input
                  type="number"
                  value={section.settings.count || 4}
                  onChange={(e) => updateSetting('count', parseInt(e.target.value))}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                />
              </div>
            </div>
          )}

          {section.type === 'product-slider' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Headline</label>
                <input
                  type="text"
                  value={section.settings.headline || ''}
                  onChange={(e) => updateSetting('headline', e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                  placeholder="e.g. Featured Products"
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Auto-play Slider</span>
                  <span className="text-[9px] text-slate-400">Scroll products automatically</span>
                </div>
                <button
                  onClick={() => updateSetting('autoplay', !section.settings.autoplay)}
                  className={`w-10 h-5 rounded-full relative transition-colors ${section.settings.autoplay ? 'bg-brand-600' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${section.settings.autoplay ? 'left-6' : 'left-1'}`} />
                </button>
              </div>
            </div>
          )}

          {section.type === 'image-with-text' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Headline</label>
                <input
                  type="text"
                  value={section.settings.headline || ''}
                  onChange={(e) => updateSetting('headline', e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                  placeholder="e.g. Our Heritage"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Description</label>
                <textarea
                  value={section.settings.subline || ''}
                  onChange={(e) => updateSetting('subline', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                  placeholder="Tell your story"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Image Alignment</label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                  <button
                    onClick={() => updateSetting('layout', 'left')}
                    className={`py-1 text-[10px] font-bold rounded ${section.settings.layout !== 'right' ? 'bg-white dark:bg-slate-700 shadow-sm text-brand-600' : 'text-slate-500'}`}
                  >
                    Image Left
                  </button>
                  <button
                    onClick={() => updateSetting('layout', 'right')}
                    className={`py-1 text-[10px] font-bold rounded ${section.settings.layout === 'right' ? 'bg-white dark:bg-slate-700 shadow-sm text-brand-600' : 'text-slate-500'}`}
                  >
                    Image Right
                  </button>
                </div>
              </div>
            </div>
          )}

          {section.type === 'rich-text' && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase">HTML Content</label>
              <textarea
                value={section.settings.html || ''}
                onChange={(e) => updateSetting('html', e.target.value)}
                rows={10}
                className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                placeholder="<p>Your content here</p>"
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
                  value={section.styles.paddingTop}
                  onChange={(e) => updateStyle('paddingTop', parseInt(e.target.value))}
                  className="flex-1 accent-brand-600"
                />
                <span className="text-[10px] font-bold text-slate-500 w-8">{section.styles.paddingTop}px</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Padding Bottom</label>
              <div className="flex items-center gap-2">
                <input
                  type="range" min="0" max="200" step="10"
                  value={section.styles.paddingBottom}
                  onChange={(e) => updateStyle('paddingBottom', parseInt(e.target.value))}
                  className="flex-1 accent-brand-600"
                />
                <span className="text-[10px] font-bold text-slate-500 w-8">{section.styles.paddingBottom}px</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Background</label>
              <div className="flex items-center gap-2 p-1 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <input
                  type="color"
                  value={section.styles.backgroundColor || '#ffffff'}
                  onChange={(e) => updateStyle('backgroundColor', e.target.value)}
                  className="w-8 h-8 rounded border-none bg-transparent"
                />
                <span className="text-[10px] font-mono text-slate-500 uppercase">{section.styles.backgroundColor || '#ffffff'}</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Text Color</label>
              <div className="flex items-center gap-2 p-1 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <input
                  type="color"
                  value={section.styles.textColor || '#000000'}
                  onChange={(e) => updateStyle('textColor', e.target.value)}
                  className="w-8 h-8 rounded border-none bg-transparent"
                />
                <span className="text-[10px] font-mono text-slate-500 uppercase">{section.styles.textColor || '#000000'}</span>
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
