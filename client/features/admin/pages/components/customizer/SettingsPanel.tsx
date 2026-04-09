"use client";

import { CustomizerSection } from '@/types/customizer';
import { Eye, Monitor, Settings2, Smartphone, Type, X } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import ComponentStylesEditor from './ComponentStylesEditor';
import DebouncedInput from './DebouncedInput';
import StylesEditor from './StylesEditor';
import BannerEditor from './editors/BannerEditor';
import FaqEditor from './editors/FaqEditor';
import ProductGridEditor from './editors/ProductGridEditor';
import GridEditor from './editors/GridEditor';
import MediaEditor from './editors/MediaEditor';
import InteractiveEditor from './editors/InteractiveEditor';
import SimpleContentEditor from './editors/SimpleContentEditor';
import { useCustomizerData } from './hooks/useCustomizerData';

interface SettingsPanelProps {
  section: CustomizerSection;
  viewMode: 'desktop' | 'mobile';
  onUpdate: (section: CustomizerSection) => void;
  onClose: () => void;
}

const SettingsPanel = React.memo(({ section, viewMode, onUpdate, onClose }: SettingsPanelProps) => {
  const { categories, dbReviews, dbFaqs, products, brands, loading } = useCustomizerData();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const isStructural = useMemo(() => ['section', 'row', 'column'].includes(section.type), [section.type]);
  const [activeTab, setActiveTab] = useState<'content' | 'styles' | 'visibility'>(
    isStructural ? 'styles' : 'content'
  );

  useEffect(() => {
    setActiveTab(isStructural ? 'styles' : 'content');
  }, [section.id, isStructural]);

  const toggleExpand = useCallback((id: string) => {
    setExpandedItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  }, []);

  const updateSetting = useCallback((key: string, value: any) => {
    onUpdate({
      ...section,
      settings: { ...section.settings, [key]: value },
    });
  }, [section, onUpdate]);

  const updateStyle = useCallback((key: string, value: any) => {
    onUpdate({
      ...section,
      styles: { ...(section.styles || { paddingTop: 40, paddingBottom: 40 }), [key]: value },
    });
  }, [section, onUpdate]);

  const updateStyles = useCallback((updates: Record<string, any>) => {
    onUpdate({
      ...section,
      styles: {
        ...(section.styles || { paddingTop: 40, paddingBottom: 40 }),
        ...updates
      },
    });
  }, [section, onUpdate]);

  const updateVisibility = useCallback((key: 'desktop' | 'mobile', value: boolean) => {
    onUpdate({
      ...section,
      visibility: { ...{ desktop: true, mobile: true }, ...(section.visibility || {}), [key]: value },
    });
  }, [section, onUpdate]);

  const updateArrayItem = useCallback((key: string, itemId: string, itemData: any) => {
    const list = (section.settings as any)[key] || [];
    const newList = list.map((item: any) => item.id === itemId ? { ...item, ...itemData } : item);
    updateSetting(key, newList);
  }, [section.settings, updateSetting]);

  const addArrayItem = useCallback((key: string, defaultItem: any) => {
    const list = (section.settings as any)[key] || [];
    const newItem = { ...defaultItem, id: `item-${Date.now()}` };
    updateSetting(key, [...list, newItem]);
    setExpandedItems(prev => [...prev, newItem.id]);
  }, [section.settings, updateSetting]);

  const removeArrayItem = useCallback((key: string, itemId: string) => {
    const list = (section.settings as any)[key] || [];
    updateSetting(key, list.filter((item: any) => item.id !== itemId));
  }, [section.settings, updateSetting]);

  const getSectionTitle = (type: string) => {
    return type.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const settings = section.settings as any;

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800">
      <div className="h-14 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <div className="flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-brand-600" />
          <h2 className="text-sm font-bold truncate">{getSectionTitle(section.type)}</h2>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex border-b border-slate-200 dark:border-slate-800 shrink-0">
        {!isStructural && (
          <button
            onClick={() => setActiveTab('content')}
            className={`flex-1 py-2.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${activeTab === 'content' ? 'text-brand-600 border-b-2 border-brand-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Content
          </button>
        )}
        <button
          onClick={() => setActiveTab('styles')}
          className={`flex-1 py-2.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${activeTab === 'styles' ? 'text-brand-600 border-b-2 border-brand-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Styles
        </button>
        <button
          onClick={() => setActiveTab('visibility')}
          className={`flex-1 py-2.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${activeTab === 'visibility' ? 'text-brand-600 border-b-2 border-brand-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Visibility
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === 'styles' && (
          isStructural
            ? <StylesEditor styles={section.styles as Record<string, any> || {}} onChange={updateStyle} onBatchChange={updateStyles} nodeType={section.type} viewMode={viewMode} />
            : <ComponentStylesEditor styles={section.styles as Record<string, any> || {}} onChange={updateStyle} viewMode={viewMode} nodeType={section.type} />
        )}

        {activeTab === 'visibility' && (
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-slate-400 mb-2">
              <Eye className="w-3.5 h-3.5" />
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Visibility</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => updateVisibility('desktop', !section.visibility?.desktop)}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${section.visibility?.desktop !== false ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300' : 'border-slate-200 dark:border-slate-700 text-slate-400'}`}
              >
                <Monitor className="w-4 h-4" />
                <span className="text-xs font-bold">Desktop</span>
              </button>
              <button
                onClick={() => updateVisibility('mobile', !section.visibility?.mobile)}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${section.visibility?.mobile !== false ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300' : 'border-slate-200 dark:border-slate-700 text-slate-400'}`}
              >
                <Smartphone className="w-4 h-4" />
                <span className="text-xs font-bold">Mobile</span>
              </button>
            </div>
          </section>
        )}

        {activeTab === 'content' && (
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-slate-400 mb-2">
              <Type className="w-3.5 h-3.5" />
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Content</h3>
            </div>

            {section.type === 'banner' && (
              <BannerEditor settings={settings} onUpdate={updateSetting} updateArrayItem={updateArrayItem} addArrayItem={addArrayItem} removeArrayItem={removeArrayItem} />
            )}

            {(section.type === 'new-arrivals' || section.type === 'product-slider') && (
              <ProductGridEditor settings={settings} viewMode={viewMode} products={products} categories={categories} onUpdate={updateSetting} />
            )}

            {section.type === 'faq-section' && (
              <FaqEditor settings={settings} dbFaqs={dbFaqs} onUpdate={updateSetting} updateArrayItem={updateArrayItem} addArrayItem={addArrayItem} removeArrayItem={removeArrayItem} />
            )}

            {(section.type === 'category-grid' || section.type === 'brand-grid') && (
              <GridEditor section={section} categories={categories} brands={brands} viewMode={viewMode} onUpdate={updateSetting} updateArrayItem={updateArrayItem} addArrayItem={addArrayItem} removeArrayItem={removeArrayItem} />
            )}

            {(section.type === 'image-block' || section.type === 'video-block') && (
              <MediaEditor section={section} onUpdate={updateSetting} />
            )}

            {(['newsletter', 'contact', 'offer-banner', 'stats-counter', 'review-slider', 'checkout'].includes(section.type)) && (
              <InteractiveEditor section={section} onUpdate={updateSetting} updateArrayItem={updateArrayItem} addArrayItem={addArrayItem} removeArrayItem={removeArrayItem} />
            )}

            {(['heading', 'paragraph', 'button', 'divider', 'spacer', 'text-block'].includes(section.type)) && (
              <SimpleContentEditor section={section} onUpdate={updateSetting} />
            )}
          </section>
        )}
      </div>

      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
        <button onClick={onClose} className="w-full py-2 text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-brand-600 transition-colors">
          Done Editing
        </button>
      </div>
    </div>
  );
});

export default SettingsPanel;
