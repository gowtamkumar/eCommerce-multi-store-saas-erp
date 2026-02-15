"use client";

import { fetchAPI } from '@/services/api';
import { CustomizerSection, FAQItem, ReviewItem } from '@/types/customizer';
import { ChevronDown, ChevronUp, Eye, Monitor, Palette, Plus, Settings2, Smartphone, Trash2, Type, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface SettingsPanelProps {
  section: CustomizerSection;
  onUpdate: (section: CustomizerSection) => void;
  onClose: () => void;
}

export default function SettingsPanel({ section, onUpdate, onClose }: SettingsPanelProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [dbReviews, setDbReviews] = useState<any[]>([]);
  const [dbFaqs, setDbFaqs] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [catRes, revRes, faqRes, prodRes, brandRes] = await Promise.all([
          fetchAPI('/categories'),
          fetchAPI('/reviews/public'),
          fetchAPI('/faqs?limit=100'),
          fetchAPI('/products?limit=100'),
          fetchAPI('/brands')
        ]);

        if (catRes.success) setCategories(catRes.data);
        if (revRes.data) {
          setDbReviews(revRes.data.map((r: any) => ({
            id: r.id || r._id,
            author: r.customerName,
            text: r.comment,
            rating: r.rating
          })));
        }
        if (faqRes.success && faqRes.data?.faqs) {
          setDbFaqs(faqRes.data.faqs);
        }
        if (prodRes.success && prodRes.data?.products) {
          setProducts(prodRes.data.products);
        }
        if (brandRes.success) {
          setBrands(brandRes.data);
        }
      } catch (error) {
        console.error("Failed to load customizer data:", error);
      }
    }
    loadData();
  }, []);

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

  const updateVisibility = (key: 'desktop' | 'mobile', value: boolean) => {
    onUpdate({
      ...section,
      visibility: { ...{ desktop: true, mobile: true }, ...(section.visibility || {}), [key]: value },
    });
  };

  const getSectionTitle = (type: string) => {
    return type.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
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
              <label className="text-[10px] font-bold text-slate-500 uppercase">Banner Slides</label>

              {/* Migration Helper: If old fields exist but no slides, add them as first slide */}
              {(!settings?.slides || settings.slides.length === 0) && (settings?.headline || settings?.backgroundImage) && (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg mb-4">
                  <p className="text-xs text-yellow-600 dark:text-yellow-400 mb-2">
                    Legacy banner data detected. Click to migrate to slider format.
                  </p>
                  <button
                    onClick={() => {
                      const initialSlide = {
                        id: `slide-${Date.now()}`,
                        headline: settings.headline,
                        subline: settings.subline,
                        backgroundImage: settings.backgroundImage,
                        primaryButtonText: settings.primaryButtonText,
                        primaryButtonLink: settings.primaryButtonLink,
                        secondaryButtonText: settings.secondaryButtonText,
                        secondaryButtonLink: settings.secondaryButtonLink
                      };
                      updateSetting('slides', [initialSlide]);
                      // clear old keys to keep it clean, or keep them for fallback?
                      // keeping them doesn't hurt, but 'slides' will take precedence in renderer
                    }}
                    className="px-3 py-1.5 bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 text-xs font-bold rounded-md"
                  >
                    Migrate Data
                  </button>
                </div>
              )}

              {/* Slides List */}
              {((settings?.slides as any[]) || []).map((slide: any, index: number) => (
                <div key={slide.id || index} className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-800/50 shadow-sm">
                  <button
                    onClick={() => toggleExpand(slide.id)}
                    className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className="shrink-0 w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-500">
                        {index + 1}
                      </span>
                      <span className="text-sm font-bold truncate">{slide.headline || 'New Slide'}</span>
                    </div>
                    {expandedItems.includes(slide.id) ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {expandedItems.includes(slide.id) && (
                    <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Headline</label>
                        <input
                          type="text"
                          value={slide.headline || ''}
                          onChange={(e) => updateArrayItem('slides', slide.id, { headline: e.target.value })}
                          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                          placeholder="Headline"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Subline</label>
                        <textarea
                          value={slide.subline || ''}
                          onChange={(e) => updateArrayItem('slides', slide.id, { subline: e.target.value })}
                          rows={2}
                          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                          placeholder="Subtext description..."
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Image URL</label>
                        <input
                          type="text"
                          value={slide.backgroundImage || ''}
                          onChange={(e) => updateArrayItem('slides', slide.id, { backgroundImage: e.target.value })}
                          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                          placeholder="https://..."
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-500 uppercase">Primary Btn</label>
                          <input
                            type="text"
                            value={slide.primaryButtonText || ''}
                            onChange={(e) => updateArrayItem('slides', slide.id, { primaryButtonText: e.target.value })}
                            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                            placeholder="Text"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-500 uppercase">Link</label>
                          <input
                            type="text"
                            value={slide.primaryButtonLink || ''}
                            onChange={(e) => updateArrayItem('slides', slide.id, { primaryButtonLink: e.target.value })}
                            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                            placeholder="/shop"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-500 uppercase">Secondary Btn</label>
                          <input
                            type="text"
                            value={slide.secondaryButtonText || ''}
                            onChange={(e) => updateArrayItem('slides', slide.id, { secondaryButtonText: e.target.value })}
                            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                            placeholder="Text"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-500 uppercase">Link</label>
                          <input
                            type="text"
                            value={slide.secondaryButtonLink || ''}
                            onChange={(e) => updateArrayItem('slides', slide.id, { secondaryButtonLink: e.target.value })}
                            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                            placeholder="/about"
                          />
                        </div>
                      </div>

                      <button
                        onClick={() => removeArrayItem('slides', slide.id)}
                        className="w-full py-1.5 text-[10px] font-bold text-red-500 flex items-center justify-center gap-1 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg"
                      >
                        <Trash2 className="w-3 h-3" /> Remove Slide
                      </button>
                    </div>
                  )}
                </div>
              ))}

              <button
                onClick={() => addArrayItem('slides', {
                  headline: 'New Slide',
                  subline: 'Description goes here',
                  backgroundImage: '',
                  primaryButtonText: 'Shop Now',
                  primaryButtonLink: '/products'
                })}
                className="w-full py-2 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-bold text-slate-500 hover:border-brand-500 hover:text-brand-600 transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Slide
              </button>
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
                <label className="text-[10px] font-bold text-slate-500 uppercase">Product Source</label>
                <select
                  value={settings?.source || 'all'}
                  onChange={(e) => updateSetting('source', e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  <option value="all">All Products</option>
                  <option value="collection">Specific Collection</option>
                  <option value="manual">Manual Selection</option>
                </select>
              </div>

              {settings?.source === 'collection' && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Select Collection</label>
                  <select
                    value={settings?.collectionId || ''}
                    onChange={(e) => updateSetting('collectionId', e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    <option value="">Select a collection...</option>
                    {categories.map((cat: any) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {settings?.source === 'manual' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Selected Products</label>
                    <div className="space-y-2">
                      {(settings?.productIds || []).map((id: string, idx: number) => {
                        const product = products.find(p => p.id === id);
                        return (
                          <div key={`${id}-${idx}`} className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                            <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center overflow-hidden">
                              {product?.images?.[0] ? <img src={product.images[0]} alt="" className="w-full h-full object-cover" /> : <span>📦</span>}
                            </div>
                            <span className="text-xs flex-1 truncate">{product?.name || 'Unknown Product'}</span>
                            <button
                              onClick={() => {
                                const newIds = (settings.productIds || []).filter((_: any, i: number) => i !== idx);
                                updateSetting('productIds', newIds);
                              }}
                              className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    <select
                      value=""
                      onChange={(e) => {
                        if (!e.target.value) return;
                        const currentIds = settings.productIds || [];
                        if (!currentIds.includes(e.target.value)) {
                          updateSetting('productIds', [...currentIds, e.target.value]);
                        }
                      }}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    >
                      <option value="">+ Add a product...</option>
                      {products
                        .filter(p => !(settings.productIds || []).includes(p.id))
                        .map((p: any) => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))
                      }
                    </select>
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Layout</label>
                <select
                  value={settings?.layout || 'slider'}
                  onChange={(e) => updateSetting('layout', e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  <option value="slider">Post Slider</option>
                  <option value="grid">Grid View</option>
                </select>
              </div>

              {settings?.layout === 'grid' && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Items per row</label>
                  <select
                    value={settings?.columns || 4}
                    onChange={(e) => updateSetting('columns', parseInt(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    <option value={2}>2 Columns</option>
                    <option value={3}>3 Columns</option>
                    <option value={4}>4 Columns</option>
                  </select>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Max Products Count</label>
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
                <label className="text-[10px] font-bold text-slate-500 uppercase">Selection Source</label>
                <select
                  value={settings?.source || 'all'}
                  onChange={(e) => updateSetting('source', e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  <option value="all">All Categories</option>
                  <option value="manual">Manual Selection</option>
                </select>
              </div>

              {settings?.source === 'manual' ? (
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Selected Categories</label>
                  {(settings?.items || []).map((item: any, index: number) => (
                    <div key={item.id} className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-800/50 shadow-sm">
                      <button
                        onClick={() => toggleExpand(item.id)}
                        className="w-full px-4 py-2 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        <span className="text-xs font-bold truncate">
                          {categories.find(c => c.id === item.link)?.name || 'Select Category...'}
                        </span>
                        {expandedItems.includes(item.id) ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                      {expandedItems.includes(item.id) && (
                        <div className="p-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-400 uppercase">Category</label>
                            <select
                              value={item.link || ''}
                              onChange={(e) => updateArrayItem('items', item.id, { link: e.target.value })}
                              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                            >
                              <option value="">Choose collection...</option>
                              {categories.map((cat: any) => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                              ))}
                            </select>
                          </div>
                          <button
                            onClick={() => removeArrayItem('items', item.id)}
                            className="w-full py-1 text-[9px] font-bold text-red-500 flex items-center justify-center gap-1 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg"
                          >
                            <Trash2 className="w-3 h-3" /> Remove
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => addArrayItem('items', { label: 'Category', link: '' })}
                    className="w-full py-2 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-bold text-slate-500 hover:border-brand-500 hover:text-brand-600 transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Add Category
                  </button>
                </div>
              ) : (
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
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Items per row</label>
                <select
                  value={settings?.columns || 3}
                  onChange={(e) => updateSetting('columns', parseInt(e.target.value))}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  <option value={2}>2 Columns</option>
                  <option value={3}>3 Columns</option>
                  <option value={4}>4 Columns</option>
                </select>
              </div>

              <div className="space-y-1.5 pt-4 border-t border-slate-100 dark:border-slate-800">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Card Radius</label>
                <select
                  value={section.styles?.cardRadius || 'none'}
                  onChange={(e) => updateStyle('cardRadius', e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  <option value="none">None</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                  <option value="full">Full (Rounded)</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Card Border</label>
                <select
                  value={section.styles?.cardBorder || 'none'}
                  onChange={(e) => updateStyle('cardBorder', e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  <option value="none">None</option>
                  <option value="thin">Thin</option>
                  <option value="medium">Medium</option>
                  <option value="thick">Thick</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Card Shadow</label>
                <select
                  value={section.styles?.cardShadow || 'none'}
                  onChange={(e) => updateStyle('cardShadow', e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  <option value="none">None</option>
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>
            </div>
          )}

          {section.type === 'brand-grid' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Section Title</label>
                <input
                  type="text"
                  value={settings?.title || ''}
                  onChange={(e) => updateSetting('title', e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  placeholder="e.g. Shop by Brand"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Selection Source</label>
                <select
                  value={settings?.source || 'all'}
                  onChange={(e) => updateSetting('source', e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  <option value="all">All Brands</option>
                  <option value="manual">Manual Selection</option>
                </select>
              </div>

              {settings?.source === 'manual' ? (
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Selected Brands</label>
                  {(settings?.items || []).map((item: any, index: number) => (
                    <div key={item.id} className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-800/50 shadow-sm">
                      <button
                        onClick={() => toggleExpand(item.id)}
                        className="w-full px-4 py-2 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        <span className="text-xs font-bold truncate">
                          {brands.find(b => b.id === item.link)?.name || 'Select Brand...'}
                        </span>
                        {expandedItems.includes(item.id) ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                      {expandedItems.includes(item.id) && (
                        <div className="p-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-400 uppercase">Brand</label>
                            <select
                              value={item.link || ''}
                              onChange={(e) => updateArrayItem('items', item.id, { link: e.target.value })}
                              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                            >
                              <option value="">Choose brand...</option>
                              {brands.map((brand: any) => (
                                <option key={brand.id} value={brand.id}>{brand.name}</option>
                              ))}
                            </select>
                          </div>
                          <button
                            onClick={() => removeArrayItem('items', item.id)}
                            className="w-full py-1 text-[9px] font-bold text-red-500 flex items-center justify-center gap-1 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg"
                          >
                            <Trash2 className="w-3 h-3" /> Remove
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => addArrayItem('items', { label: 'Brand', link: '' })}
                    className="w-full py-2 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-bold text-slate-500 hover:border-brand-500 hover:text-brand-600 transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Add Brand
                  </button>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Brands Count</label>
                  <input
                    type="number"
                    value={settings?.count || 6}
                    onChange={(e) => updateSetting('count', parseInt(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    min="1"
                    max="12"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Items per row</label>
                <select
                  value={settings?.columns || 3}
                  onChange={(e) => updateSetting('columns', parseInt(e.target.value))}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  <option value={2}>2 Columns</option>
                  <option value={3}>3 Columns</option>
                  <option value={4}>4 Columns</option>
                </select>
              </div>
            </div>
          )}

          {section.type === 'newsletter' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Section Title</label>
                <input
                  type="text"
                  value={settings?.title || ''}
                  onChange={(e) => updateSetting('title', e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  placeholder="Join our Newsletter"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Description</label>
                <textarea
                  value={settings?.description || ''}
                  onChange={(e) => updateSetting('description', e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  placeholder="Get the latest updates..."
                  rows={3}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Input Placeholder</label>
                <input
                  type="text"
                  value={settings?.placeholder || ''}
                  onChange={(e) => updateSetting('placeholder', e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  placeholder="Enter your email"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Button Text</label>
                <input
                  type="text"
                  value={settings?.buttonText || ''}
                  onChange={(e) => updateSetting('buttonText', e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  placeholder="Subscribe"
                />
              </div>
            </div>
          )}

          {section.type === 'stats-counter' && (
            <div className="space-y-4">
              <div className="space-y-4">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Stat Items</label>
                {((settings?.items as any[]) || []).map((item: any, index: number) => (
                  <div key={item.id} className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-800/50 shadow-sm">
                    <button
                      onClick={() => toggleExpand(item.id)}
                      className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <span className="shrink-0 w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-500">
                          {index + 1}
                        </span>
                        <span className="text-sm font-bold truncate">{item.label || 'New Stat'}</span>
                      </div>
                      {expandedItems.includes(item.id) ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {expandedItems.includes(item.id) && (
                      <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-500 uppercase">Value</label>
                          <input
                            type="text"
                            value={item.value || ''}
                            onChange={(e) => updateArrayItem('items', item.id, { value: e.target.value })}
                            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                            placeholder="e.g. 10k+"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-500 uppercase">Label</label>
                          <input
                            type="text"
                            value={item.label || ''}
                            onChange={(e) => updateArrayItem('items', item.id, { label: e.target.value })}
                            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                            placeholder="e.g. Happy Customers"
                          />
                        </div>

                        <button
                          onClick={() => removeArrayItem('items', item.id)}
                          className="w-full py-1.5 text-[10px] font-bold text-red-500 flex items-center justify-center gap-1 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg"
                        >
                          <Trash2 className="w-3 h-3" /> Remove Stat
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                <button
                  onClick={() => addArrayItem('items', {
                    label: 'New Stat',
                    value: '100+'
                  })}
                  className="w-full py-2 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-bold text-slate-500 hover:border-brand-500 hover:text-brand-600 transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Add Stat
                </button>
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
                <label className="text-[10px] font-bold text-slate-500 uppercase">Offer Background Image</label>
                <input
                  type="text"
                  value={settings?.backgroundImage || ''}
                  onChange={(e) => updateSetting('backgroundImage', e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Offer Small Image</label>
                <input
                  type="text"
                  value={settings?.image || ''}
                  onChange={(e) => updateSetting('image', e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Layout</label>
                <select
                  value={settings?.layout || 'left'}
                  onChange={(e) => updateSetting('layout', e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  <option value="left">Content Left</option>
                  <option value="right">Content Right</option>
                </select>
              </div>

              <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Primary Button Text</label>
                  <input
                    type="text"
                    value={settings?.buttonText || ''}
                    onChange={(e) => updateSetting('buttonText', e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Primary Button Link</label>
                  <input
                    type="text"
                    value={settings?.buttonLink || ''}
                    onChange={(e) => updateSetting('buttonLink', e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Secondary Button Text</label>
                  <input
                    type="text"
                    value={settings?.secondaryButtonText || ''}
                    onChange={(e) => updateSetting('secondaryButtonText', e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Secondary Button Link</label>
                  <input
                    type="text"
                    value={settings?.secondaryButtonLink || ''}
                    onChange={(e) => updateSetting('secondaryButtonLink', e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Visibility Settings - Global */}
          <section className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 text-slate-400 mb-2">
              <Eye className="w-3.5 h-3.5" />
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Visibility</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => updateVisibility('desktop', section.visibility?.desktop === false ? true : false)}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${section.visibility?.desktop !== false
                  ? 'bg-brand-50 border-brand-200 text-brand-700 dark:bg-brand-900/20 dark:border-brand-800 dark:text-brand-400'
                  : 'bg-slate-50 border-slate-200 text-slate-400 dark:bg-slate-800 dark:border-slate-700'
                  }`}
              >
                <Monitor className="w-5 h-5" />
                <span className="text-xs font-bold">Desktop</span>
                <span className="text-[10px] opacity-70">{section.visibility?.desktop !== false ? 'Visible' : 'Hidden'}</span>
              </button>

              <button
                onClick={() => updateVisibility('mobile', section.visibility?.mobile === false ? true : false)}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${section.visibility?.mobile !== false
                  ? 'bg-brand-50 border-brand-200 text-brand-700 dark:bg-brand-900/20 dark:border-brand-800 dark:text-brand-400'
                  : 'bg-slate-50 border-slate-200 text-slate-400 dark:bg-slate-800 dark:border-slate-700'
                  }`}
              >
                <Smartphone className="w-5 h-5" />
                <span className="text-xs font-bold">Mobile</span>
                <span className="text-[10px] opacity-70">{section.visibility?.mobile !== false ? 'Visible' : 'Hidden'}</span>
              </button>
            </div>
            <p className="text-[10px] text-slate-400 text-center">
              Click to toggle visibility on specific devices.
            </p>
          </section>

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

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Content Source</label>
                <select
                  value={settings?.source || 'manual'}
                  onChange={(e) => updateSetting('source', e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  <option value="manual">Manual Entry</option>
                  <option value="all">All Reviews (DB)</option>
                  <option value="selection">Specific Selection</option>
                </select>
              </div>

              {(settings?.source === 'all' || settings?.source === 'selection') ? (
                <div className="space-y-4">
                  {settings?.source === 'selection' && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Selected Reviews</label>
                      <div className="space-y-2">
                        {(settings?.reviewIds || []).map((id: string, idx: number) => {
                          const review = dbReviews.find(r => r.id === id);
                          return (
                            <div key={`${id}-${idx}`} className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                              <span className="text-xs flex-1 truncate">{review?.author || 'Unknown Review'}</span>
                              <button
                                onClick={() => {
                                  const newIds = (settings.reviewIds || []).filter((_: any, i: number) => i !== idx);
                                  updateSetting('reviewIds', newIds);
                                }}
                                className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          );
                        })}
                      </div>

                      <select
                        value=""
                        onChange={(e) => {
                          if (!e.target.value) return;
                          const currentIds = settings.reviewIds || [];
                          if (!currentIds.includes(e.target.value)) {
                            updateSetting('reviewIds', [...currentIds, e.target.value]);
                          }
                        }}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                      >
                        <option value="">+ Add a review...</option>
                        {dbReviews
                          .filter(r => !(settings.reviewIds || []).includes(r.id))
                          .map((r: any) => (
                            <option key={r.id} value={r.id}>{r.author}: {r.text.substring(0, 30)}...</option>
                          ))
                        }
                      </select>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Max Reviews Count</label>
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
                      {settings?.source === 'selection'
                        ? 'Selected reviews are dynamically synced with your store feedback'
                        : 'Reviews are automatically fetched from your database'
                      }
                    </p>
                  </div>
                </div>
              ) : (
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
              )}

              <div className="h-px bg-slate-100 dark:bg-slate-800 my-2" />

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Layout</label>
                <select
                  value={settings?.layout || 'slider'}
                  onChange={(e) => updateSetting('layout', e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  <option value="slider">Carousel Slider</option>
                  <option value="grid">Grid View</option>
                </select>
              </div>

              {settings?.layout === 'grid' && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Items per row</label>
                  <select
                    value={settings?.columns || 3}
                    onChange={(e) => updateSetting('columns', parseInt(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    <option value={1}>1 Column</option>
                    <option value={2}>2 Columns</option>
                    <option value={3}>3 Columns</option>
                  </select>
                </div>
              )}
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
                <label className="text-[10px] font-bold text-slate-500 uppercase">Subline</label>
                <textarea
                  value={settings?.subline || ''}
                  onChange={(e) => updateSetting('subline', e.target.value)}
                  rows={8}
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Image URL</label>
                <input type="text" value={settings?.image || ''} onChange={(e) => updateSetting('image', e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800" />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Block Background Image</label>
                <input
                  type="text"
                  value={settings?.backgroundImage || ''}
                  onChange={(e) => updateSetting('backgroundImage', e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Button Text</label>
                <input
                  type="text"
                  value={settings?.buttonText || ''}
                  onChange={(e) => updateSetting('buttonText', e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Button URL</label>
                <input
                  type="text"
                  value={settings?.buttonUrl || ''}
                  onChange={(e) => updateSetting('buttonUrl', e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Secondary Button Text</label>
                  <input
                    type="text"
                    value={settings?.secondaryButtonText || ''}
                    onChange={(e) => updateSetting('secondaryButtonText', e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Secondary Button Link</label>
                  <input
                    type="text"
                    value={settings?.secondaryButtonLink || ''}
                    onChange={(e) => updateSetting('secondaryButtonLink', e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
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
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Button Link</label>
                <input
                  type="text"
                  value={settings?.link || ''}
                  onChange={(e) => updateSetting('link', e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  placeholder="/shop"
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

                <input
                  type="text"
                  value={settings?.subline || ''}
                  onChange={(e) => updateSetting('subline', e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />

              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Content Source</label>
                <select
                  value={settings?.source || 'manual'}
                  onChange={(e) => updateSetting('source', e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  <option value="manual">Manual Entry</option>
                  <option value="selection">Specific FAQs (DB)</option>
                </select>
              </div>

              {settings?.source === 'selection' ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Selected FAQs</label>
                    <div className="space-y-2">
                      {(settings?.faqIds || []).map((id: string, idx: number) => {
                        const faq = dbFaqs.find(f => f.id === id);
                        return (
                          <div key={`${id}-${idx}`} className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                            <span className="text-xs flex-1 truncate">{faq?.question || 'Unknown FAQ'}</span>
                            <button
                              onClick={() => {
                                const newIds = (settings.faqIds || []).filter((_: any, i: number) => i !== idx);
                                updateSetting('faqIds', newIds);
                              }}
                              className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    <select
                      value=""
                      onChange={(e) => {
                        if (!e.target.value) return;
                        const currentIds = settings.faqIds || [];
                        if (!currentIds.includes(e.target.value)) {
                          updateSetting('faqIds', [...currentIds, e.target.value]);
                        }
                      }}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    >
                      <option value="">+ Add a FAQ...</option>
                      {dbFaqs
                        .filter(f => !(settings.faqIds || []).includes(f.id))
                        .map((f: any) => (
                          <option key={f.id} value={f.id}>{f.question}</option>
                        ))
                      }
                    </select>
                  </div>

                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                      Selected FAQs are dynamically synced with your store FAQs
                    </p>
                  </div>
                </div>
              ) : (
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
              )}
            </div>
          )}

          {section.type === 'video-block' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Headline</label>
                <input
                  type="text"
                  value={settings?.headline || ''}
                  onChange={(e) => updateSetting('headline', e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  placeholder="Video Title"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Video URL</label>
                <input
                  type="text"
                  value={settings?.videoUrl || ''}
                  onChange={(e) => updateSetting('videoUrl', e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  placeholder="YouTube, Vimeo or MP4 URL"
                />
                <p className="text-[10px] text-slate-400 mt-1">Supports YouTube, Vimeo, and direct video links.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Aspect Ratio</label>
                <select
                  value={settings?.aspectRatio || '16/9'}
                  onChange={(e) => updateSetting('aspectRatio', e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  <option value="16/9">16:9 (Standard)</option>
                  <option value="4/3">4:3 (Classic)</option>
                  <option value="1/1">1:1 (Square)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                  <input
                    type="checkbox"
                    id="autoplay"
                    checked={settings?.autoplay || false}
                    onChange={(e) => updateSetting('autoplay', e.target.checked)}
                    className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
                  />
                  <label htmlFor="autoplay" className="text-[10px] font-bold text-slate-500 uppercase cursor-pointer">Autoplay</label>
                </div>
                <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                  <input
                    type="checkbox"
                    id="loop"
                    checked={settings?.loop || false}
                    onChange={(e) => updateSetting('loop', e.target.checked)}
                    className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
                  />
                  <label htmlFor="loop" className="text-[10px] font-bold text-slate-500 uppercase cursor-pointer">Loop</label>
                </div>
                <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                  <input
                    type="checkbox"
                    id="muted"
                    checked={settings?.muted || false}
                    onChange={(e) => updateSetting('muted', e.target.checked)}
                    className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
                  />
                  <label htmlFor="muted" className="text-[10px] font-bold text-slate-500 uppercase cursor-pointer">Muted</label>
                </div>
                <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                  <input
                    type="checkbox"
                    id="controls"
                    checked={settings?.controls !== false}
                    onChange={(e) => updateSetting('controls', e.target.checked)}
                    className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
                  />
                  <label htmlFor="controls" className="text-[10px] font-bold text-slate-500 uppercase cursor-pointer">Controls</label>
                </div>
                <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                  <input
                    type="checkbox"
                    id="fullWidth"
                    checked={settings?.fullWidth || false}
                    onChange={(e) => updateSetting('fullWidth', e.target.checked)}
                    className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
                  />
                  <label htmlFor="fullWidth" className="text-[10px] font-bold text-slate-500 uppercase cursor-pointer">Full Wide</label>
                </div>
              </div>
            </div>
          )}

          {section.type === 'contact' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Section Title</label>
                <input
                  type="text"
                  value={settings?.title || ''}
                  onChange={(e) => updateSetting('title', e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  placeholder="Get in Touch"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Subline</label>
                <textarea
                  value={settings?.subline || ''}
                  onChange={(e) => updateSetting('subline', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  placeholder="We'd love to hear from you."
                />
              </div>

              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Visibility</label>
                <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                  <input
                    type="checkbox"
                    id="showInfo"
                    checked={settings?.showInfo !== false}
                    onChange={(e) => updateSetting('showInfo', e.target.checked)}
                    className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
                  />
                  <label htmlFor="showInfo" className="text-xs font-medium cursor-pointer flex-1">Show Contact Info</label>
                </div>
                <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                  <input
                    type="checkbox"
                    id="showForm"
                    checked={settings?.showForm !== false}
                    onChange={(e) => updateSetting('showForm', e.target.checked)}
                    className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
                  />
                  <label htmlFor="showForm" className="text-xs font-medium cursor-pointer flex-1">Show Contact Form</label>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Layout</label>
                <select
                  value={settings?.cardLayout || 'left'}
                  onChange={(e) => updateSetting('cardLayout', e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  <option value="left">Info Left, Form Right</option>
                  <option value="right">Form Left, Info Right</option>
                </select>
              </div>

              <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Overrides (Optional)</h4>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Email Override</label>
                  <input
                    type="text"
                    value={settings?.email || ''}
                    onChange={(e) => updateSetting('email', e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    placeholder="Leave empty to use site settings"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Phone Override</label>
                  <input
                    type="text"
                    value={settings?.phone || ''}
                    onChange={(e) => updateSetting('phone', e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    placeholder="Leave empty to use site settings"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Address Override</label>
                  <textarea
                    value={settings?.address || ''}
                    onChange={(e) => updateSetting('address', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    placeholder="Leave empty to use site settings"
                  />
                </div>
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

          <div className="space-y-4 mb-4">

            {section.type === 'banner' && (
              <>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Banner Height</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range" min="300" max="1000" step="50"
                      value={section.styles?.height || 600}
                      onChange={(e) => updateStyle('height', parseInt(e.target.value))}
                      className="flex-1 accent-brand-600"
                    />
                    <span className="text-[10px] font-bold text-slate-500 w-10 text-right">{section.styles?.height || 600}px</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Overlay Opacity</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range" min="0" max="100" step="5"
                      value={section.styles?.overlayOpacity !== undefined ? section.styles.overlayOpacity : 40}
                      onChange={(e) => updateStyle('overlayOpacity', parseInt(e.target.value))}
                      className="flex-1 accent-brand-600"
                    />
                    <span className="text-[10px] font-bold text-slate-500 w-10 text-right">{section.styles?.overlayOpacity !== undefined ? section.styles.overlayOpacity : 40}%</span>
                  </div>
                </div>
              </>
            )}

            <div className="grid grid-cols-2 gap-4">
              {(section.type !== 'button' && section.type !== 'offer-banner') && (
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Headline Color</label>
                  <div className="flex items-center gap-2 p-1 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                    <input
                      type="color"
                      value={section.styles?.headlineColor || '#ffffff'}
                      onChange={(e) => updateStyle('headlineColor', e.target.value)}
                      className="w-8 h-8 rounded border-none bg-transparent"
                    />
                    <span className="text-[10px] font-mono text-slate-500 uppercase">{section.styles?.headlineColor || '#ffffff'}</span>
                  </div>
                </div>
              )}

              {section.type === 'image-block' && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Image Radius</label>
                    <select
                      value={section.styles?.imageRadius || 'none'}
                      onChange={(e) => updateStyle('imageRadius', e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    >
                      <option value="none">None</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                      <option value="full">Full (Circle)</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Image Border</label>
                    <select
                      value={section.styles?.imageBorder || 'none'}
                      onChange={(e) => updateStyle('imageBorder', e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    >
                      <option value="none">None</option>
                      <option value="thin">Thin (4px)</option>
                      <option value="thick">Thick (12px)</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Image Shadow</label>
                    <select
                      value={section.styles?.imageShadow || 'none'}
                      onChange={(e) => updateStyle('imageShadow', e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    >
                      <option value="none">None</option>
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                    </select>
                  </div>
                </>
              )}

              {section.type === 'banner' && (
                <>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Subline Color</label>
                    <div className="flex items-center gap-2 p-1 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                      <input
                        type="color"
                        value={section.styles?.sublineColor || '#ffffff'}
                        onChange={(e) => updateStyle('sublineColor', e.target.value)}
                        className="w-8 h-8 rounded border-none bg-transparent"
                      />
                      <span className="text-[10px] font-mono text-slate-500 uppercase">{section.styles?.sublineColor || '#ffffff'}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Button Color</label>
                    <div className="flex items-center gap-2 p-1 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                      <input
                        type="color"
                        value={section.styles?.buttonColor || '#2563eb'}
                        onChange={(e) => updateStyle('buttonColor', e.target.value)}
                        className="w-8 h-8 rounded border-none bg-transparent"
                      />
                      <span className="text-[10px] font-mono text-slate-500 uppercase">{section.styles?.buttonColor || '#2563eb'}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Button Text</label>
                    <div className="flex items-center gap-2 p-1 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                      <input
                        type="color"
                        value={section.styles?.buttonTextColor || '#ffffff'}
                        onChange={(e) => updateStyle('buttonTextColor', e.target.value)}
                        className="w-8 h-8 rounded border-none bg-transparent"
                      />
                      <span className="text-[10px] font-mono text-slate-500 uppercase">{section.styles?.buttonTextColor || '#ffffff'}</span>
                    </div>
                  </div>
                </>
              )}

              {section.type === 'contact' && (
                <>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Icon Color</label>
                    <div className="flex items-center gap-2 p-1 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                      <input
                        type="color"
                        value={section.styles?.iconColor || '#3b82f6'}
                        onChange={(e) => updateStyle('iconColor', e.target.value)}
                        className="w-8 h-8 rounded border-none bg-transparent"
                      />
                      <span className="text-[10px] font-mono text-slate-500 uppercase">{section.styles?.iconColor || '#3b82f6'}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Icon Background</label>
                    <div className="flex items-center gap-2 p-1 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                      <input
                        type="color"
                        value={section.styles?.iconBgColor || '#eff6ff'}
                        onChange={(e) => updateStyle('iconBgColor', e.target.value)}
                        className="w-8 h-8 rounded border-none bg-transparent"
                      />
                      <span className="text-[10px] font-mono text-slate-500 uppercase">{section.styles?.iconBgColor || '#eff6ff'}</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="h-px bg-slate-100 dark:bg-slate-800 my-4" />

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Text Alignment</label>
              <select
                value={section.styles?.textAlign || 'center'}
                onChange={(e) => updateStyle('textAlign', e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>

            <div className="h-px bg-slate-100 dark:bg-slate-800 my-4" />

            <div className="space-y-4">
              <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Typography</h4>

              {/* Headings Typography - Collapsible */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-800/30">
                <button
                  onClick={() => toggleExpand('typography-headings')}
                  className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-100 dark:hover:bg-slate-800/50"
                >
                  <h5 className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Headings</h5>
                  {expandedItems.includes('typography-headings') ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {expandedItems.includes('typography-headings') && (
                  <div className="p-4 border-t border-slate-200 dark:border-slate-700 space-y-4 bg-white dark:bg-slate-900">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Font Family</label>
                      <select
                        value={section.styles?.headingFontFamily || ''}
                        onChange={(e) => updateStyle('headingFontFamily', e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                      >
                        <option value="">Default</option>
                        <option value="Inter">Inter</option>
                        <option value="Poppins">Poppins</option>
                        <option value="Montserrat">Montserrat</option>
                        <option value="Playfair Display">Playfair Display</option>
                        <option value="Bebas Neue">Bebas Neue</option>
                        <option value="Oswald">Oswald</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Weight</label>
                        <select
                          value={section.styles?.headingFontWeight || '700'}
                          onChange={(e) => updateStyle('headingFontWeight', e.target.value)}
                          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                        >
                          <option value="400">Regular (400)</option>
                          <option value="500">Medium (500)</option>
                          <option value="600">Semibold (600)</option>
                          <option value="700">Bold (700)</option>
                          <option value="800">Extra Bold (800)</option>
                          <option value="900">Black (900)</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Size</label>
                        <input
                          type="text"
                          value={section.styles?.headingFontSize || ''}
                          onChange={(e) => updateStyle('headingFontSize', e.target.value)}
                          placeholder="2rem"
                          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Line Height</label>
                      <input
                        type="text"
                        value={section.styles?.headingLineHeight || ''}
                        onChange={(e) => updateStyle('headingLineHeight', e.target.value)}
                        placeholder="1.2"
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Paragraphs Typography - Collapsible */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-800/30">
                <button
                  onClick={() => toggleExpand('typography-paragraphs')}
                  className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-100 dark:hover:bg-slate-800/50"
                >
                  <h5 className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Paragraphs</h5>
                  {expandedItems.includes('typography-paragraphs') ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {expandedItems.includes('typography-paragraphs') && (
                  <div className="p-4 border-t border-slate-200 dark:border-slate-700 space-y-4 bg-white dark:bg-slate-900">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Font Family</label>
                      <select
                        value={section.styles?.paragraphFontFamily || ''}
                        onChange={(e) => updateStyle('paragraphFontFamily', e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                      >
                        <option value="">Default</option>
                        <option value="Inter">Inter</option>
                        <option value="Roboto">Roboto</option>
                        <option value="Open Sans">Open Sans</option>
                        <option value="Lato">Lato</option>
                        <option value="Poppins">Poppins</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Weight</label>
                        <select
                          value={section.styles?.paragraphFontWeight || '400'}
                          onChange={(e) => updateStyle('paragraphFontWeight', e.target.value)}
                          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                        >
                          <option value="300">Light (300)</option>
                          <option value="400">Regular (400)</option>
                          <option value="500">Medium (500)</option>
                          <option value="600">Semibold (600)</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Size</label>
                        <input
                          type="text"
                          value={section.styles?.paragraphFontSize || ''}
                          onChange={(e) => updateStyle('paragraphFontSize', e.target.value)}
                          placeholder="16px"
                          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Line Height</label>
                      <input
                        type="text"
                        value={section.styles?.paragraphLineHeight || ''}
                        onChange={(e) => updateStyle('paragraphLineHeight', e.target.value)}
                        placeholder="1.6"
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                      />
                    </div>
                  </div>
                )}
              </div>
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
