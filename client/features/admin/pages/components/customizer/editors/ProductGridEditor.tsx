"use client";

import { Monitor, Smartphone, Trash2 } from 'lucide-react';
import React from 'react';
import DebouncedInput from '../panels/DebouncedInput';

interface ProductGridEditorProps {
  settings: any;
  viewMode: 'desktop' | 'tablet' | 'mobile';
  products: any[];
  categories: any[];
  onUpdate: (key: string, value: any) => void;
}

const ProductGridEditor = React.memo(({ settings, viewMode, products, categories, onUpdate }: ProductGridEditorProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-slate-500 uppercase">Heading Title</label>
        <DebouncedInput
          type="text"
          placeholder="New Arrivals"
          value={settings?.headline || ''}
          onChange={(val) => onUpdate('headline', val)}
          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-slate-500 uppercase">Product Source</label>
        <div className="grid grid-cols-3 gap-1">
          {['all', 'collection', 'manual'].map((s: any) => (
            <button
              key={s}
              onClick={() => onUpdate('source', s)}
              className={`py-2 text-[9px] font-bold uppercase rounded-md border transition-all ${settings?.source === s ? 'bg-brand-600 border-brand-600 text-white shadow-lg' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-brand-200'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {settings?.source === 'collection' && (
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase">Select Collection</label>
          <select
            value={settings?.collectionId || ''}
            onChange={(e) => onUpdate('collectionId', e.target.value)}
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
                      onUpdate('productIds', newIds);
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
                onUpdate('productIds', [...currentIds, e.target.value]);
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
      )}

      <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-1.5 mb-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase">Items per row</label>
          {viewMode === 'mobile' ? <Smartphone className="w-2.5 h-2.5 text-brand-500" /> : <Monitor className="w-2.5 h-2.5 text-slate-300" />}
        </div>
        <select
          value={viewMode === 'mobile' ? (settings?.mobileColumns || 2) : (settings?.columns || 4)}
          onChange={(e) => onUpdate(viewMode === 'mobile' ? 'mobileColumns' : 'columns', parseInt(e.target.value))}
          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
        >
          {[1, 2, 3, 4, 5, 6].map(c => <option key={c} value={c}>{c} Columns</option>)}
        </select>
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-slate-500 uppercase">Max Products Count</label>
        <DebouncedInput
          type="number"
          value={settings?.count || 8}
          onChange={(val) => onUpdate('count', parseInt(val))}
          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
        />
      </div>
    </div>
  );
});

export default ProductGridEditor;
