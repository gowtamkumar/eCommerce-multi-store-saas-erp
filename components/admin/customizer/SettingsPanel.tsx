"use client";

import { CustomizerSection, FAQItem, ReviewItem } from '@/types/customizer';
import { ChevronDown, ChevronUp, Palette, Plus, Settings2, Trash2, Type, X } from 'lucide-react';
import { useState } from 'react';

interface SettingsPanelProps {
  section: CustomizerSection;
  onUpdate: (section: CustomizerSection) => void;
  onClose: () => void;
}

export default function SettingsPanel({ section, onUpdate, onClose }: SettingsPanelProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

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

  const settings = section.settings as any;

  const updateArrayItem = (key: string, itemId: string, itemData: any) => {
    const list = (section.settings as any)[key] || [];
    const newList = list.map((item: any) => item.id === itemId ? { ...item, ...itemData } : item);
    updateSetting(key, newList);
  };

  const addArrayItem = (key: string, defaultItem: any) => {
    const list = (section.settings as any)[key] || [];
    const newItem = { ...defaultItem, id: `item-${Date.now()}` };
    updateSetting(key, [...list, newItem]);
    setExpandedItems(prev => [...prev, newItem.id]);
  };

  const removeArrayItem = (key: string, itemId: string) => {
    const list = (section.settings as any)[key] || [];
    updateSetting(key, list.filter((item: any) => item.id !== itemId));
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
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Headline</label>
                <input
                  type="text"
                  value={settings?.headline || ''}
                  onChange={(e) => updateSetting('headline', e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  placeholder="e.g. Summer Collection 2026"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Background Image URL</label>
                <input
                  type="text"
                  value={settings?.backgroundImage || ''}
                  onChange={(e) => updateSetting('backgroundImage', e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Primary BTN</label>
                  <input
                    type="text"
                    value={settings?.primaryButtonText || ''}
                    onChange={(e) => updateSetting('primaryButtonText', e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Secondary BTN</label>
                  <input
                    type="text"
                    value={settings?.secondaryButtonText || ''}
                    onChange={(e) => updateSetting('secondaryButtonText', e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>
            </div>
          )}

          {section.type === 'product-slider' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Section Headline</label>
                <input
                  type="text"
                  value={settings?.headline || ''}
                  onChange={(e) => updateSetting('headline', e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Products Count</label>
                <input
                  type="number"
                  value={settings?.count || 4}
                  onChange={(e) => updateSetting('count', parseInt(e.target.value))}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
            </div>
          )}

          {section.type === 'category-grid' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Section Title</label>
                <input
                  type="text"
                  value={settings?.title || ''}
                  onChange={(e) => updateSetting('title', e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  placeholder="e.g. Explore Collections"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Categories Count</label>
                <input
                  type="number"
                  value={settings?.count || 6}
                  onChange={(e) => updateSetting('count', parseInt(e.target.value))}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  min="1"
                  max="12"
                />
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  Categories are automatically fetched from your database
                </p>
              </div>
            </div>
          )}

          {section.type === 'offer-banner' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Main Title</label>
                <input
                  type="text"
                  value={settings?.headline || ''}
                  onChange={(e) => updateSetting('headline', e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Offer Details</label>
                <input
                  type="text"
                  value={settings?.subline || ''}
                  onChange={(e) => updateSetting('subline', e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
            </div>
          )}

          {section.type === 'review-slider' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Slider Headline</label>
                <input
                  type="text"
                  value={settings?.title || ''}
                  onChange={(e) => updateSetting('title', e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Reviews</label>
                {((section.settings as any).reviews || []).map((review: ReviewItem) => (
                  <div key={review.id} className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-800/50 shadow-sm">
                    <button onClick={() => toggleExpand(review.id)} className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800">
                      <span className="text-sm font-bold truncate">{review.author || 'Anonymous'}</span>
                      {expandedItems.includes(review.id) ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    {expandedItems.includes(review.id) && (
                      <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                        <input type="text" placeholder="Author Name" value={review.author} onChange={(e) => updateArrayItem('reviews', review.id, { author: e.target.value })} className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800" />
                        <textarea placeholder="Review Text" value={review.text} onChange={(e) => updateArrayItem('reviews', review.id, { text: e.target.value })} rows={3} className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800" />
                        <input type="number" placeholder="Rating (1-5)" min="1" max="5" value={review.rating} onChange={(e) => updateArrayItem('reviews', review.id, { rating: parseInt(e.target.value) })} className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800" />
                        <button onClick={() => removeArrayItem('reviews', review.id)} className="w-full py-1.5 text-[10px] font-bold text-red-500 flex items-center justify-center gap-1 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg">
                          <Trash2 className="w-3 h-3" /> Remove Review
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                <button onClick={() => addArrayItem('reviews', { author: 'Alexander Wright', text: 'Amazing quality!', rating: 5 })} className="w-full py-2 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-bold text-slate-500 hover:border-brand-500 hover:text-brand-600 transition-all flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" /> Add Review
                </button>
              </div>
            </div>
          )}

          {section.type === 'text-block' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Block Title</label>
                <input
                  type="text"
                  value={settings?.headline || ''}
                  onChange={(e) => updateSetting('headline', e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Alignment</label>
                <select value={settings?.alignment || 'center'} onChange={(e) => updateSetting('alignment', e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Content (HTML)</label>
                <textarea
                  value={settings?.html || ''}
                  onChange={(e) => updateSetting('html', e.target.value)}
                  rows={8}
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
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
                  value={settings?.headline || ''}
                  onChange={(e) => updateSetting('headline', e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Image URL</label>
                <input type="text" value={settings?.image || ''} onChange={(e) => updateSetting('image', e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Layout</label>
                <select
                  value={settings?.layout || 'left'}
                  onChange={(e) => updateSetting('layout', e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
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
                  value={settings?.text || ''}
                  onChange={(e) => updateSetting('text', e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Variant</label>
                  <select value={settings?.variant || 'solid'} onChange={(e) => updateSetting('variant', e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                    <option value="solid">Solid</option>
                    <option value="outline">Outline</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Size</label>
                  <select value={settings?.size || 'md'} onChange={(e) => updateSetting('size', e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                    <option value="sm">Small</option>
                    <option value="md">Medium</option>
                    <option value="lg">Large</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {section.type === 'faq-section' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Section Title</label>
                <input
                  type="text"
                  value={settings?.title || ''}
                  onChange={(e) => updateSetting('title', e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Questions</label>
                {((section.settings as any).items || []).map((faq: FAQItem) => (
                  <div key={faq.id} className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-800/50 shadow-sm">
                    <button onClick={() => toggleExpand(faq.id)} className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800">
                      <span className="text-sm font-bold truncate">{faq.question || 'New Question'}</span>
                      {expandedItems.includes(faq.id) ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    {expandedItems.includes(faq.id) && (
                      <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                        <input type="text" placeholder="Question" value={faq.question} onChange={(e) => updateArrayItem('items', faq.id, { question: e.target.value })} className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800" />
                        <textarea placeholder="Answer" value={faq.answer} onChange={(e) => updateArrayItem('items', faq.id, { answer: e.target.value })} rows={3} className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800" />
                        <button onClick={() => removeArrayItem('items', faq.id)} className="w-full py-1.5 text-[10px] font-bold text-red-500 flex items-center justify-center gap-1 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg">
                          <Trash2 className="w-3 h-3" /> Remove Question
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                <button onClick={() => addArrayItem('items', { question: 'New Question', answer: 'Answer goes here' })} className="w-full py-2 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-bold text-slate-500 hover:border-brand-500 hover:text-brand-600 transition-all flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" /> Add Question
                </button>
              </div>
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
