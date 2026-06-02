"use client";

import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import DebouncedInput from '../panels/DebouncedInput';

interface InteractiveEditorProps {
  section: any;
  onUpdate: (key: string, value: any) => void;
  updateArrayItem: (key: string, itemId: string, itemData: any) => void;
  addArrayItem: (key: string, defaultItem: any) => void;
  removeArrayItem: (key: string, itemId: string) => void;
}

const InteractiveEditor = React.memo(({
  section,
  onUpdate,
  updateArrayItem,
  addArrayItem,
  removeArrayItem
}: InteractiveEditorProps) => {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const settings = section.settings || {};

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  if (section.type === 'newsletter') {
    return (
      <div className="space-y-4">
        <label className="text-[10px] font-bold text-slate-500 uppercase">Heading</label>
        <DebouncedInput
          type="text"
          value={settings?.headline || ''}
          onChange={(val) => onUpdate('headline', val)}
          className="w-full px-3 py-2 text-sm rounded-lg border"
        />
        <label className="text-[10px] font-bold text-slate-500 uppercase">Description</label>
        <DebouncedInput
          type="text"
          value={settings?.subline || ''}
          onChange={(val) => onUpdate('subline', val)}
          className="w-full px-3 py-2 text-sm rounded-lg border"
        />
        <label className="text-[10px] font-bold text-slate-500 uppercase">Button Text</label>
        <DebouncedInput
          type="text"
          value={settings?.buttonText || ''}
          onChange={(val) => onUpdate('buttonText', val)}
          className="w-full px-3 py-2 text-sm rounded-lg border"
        />
      </div>
    );
  }

  if (section.type === 'contact') {
    return (
      <div className="space-y-4">
        <label className="text-[10px] font-bold text-slate-500 uppercase">Section Title</label>
        <DebouncedInput type="text" value={settings?.title || ''} onChange={(val) => onUpdate('title', val)} className="w-full px-3 py-2 text-sm rounded-lg border" />
        <label className="text-[10px] font-bold text-slate-500 uppercase">Subline</label>
        <DebouncedInput as="textarea" value={settings?.subline || ''} onChange={(val) => onUpdate('subline', val)} className="w-full px-3 py-2 text-sm rounded-lg border" />

        <div className="space-y-3 pt-2 border-t">
          {['showInfo', 'showForm'].map(f => (
            <div key={f} className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border">
              <input type="checkbox" id={f} checked={settings[f] !== false} onChange={(e) => onUpdate(f, e.target.checked)} className="w-4 h-4 text-brand-600 rounded" />
              <label htmlFor={f} className="text-xs font-medium cursor-pointer flex-1 capitalize">{f.replace(/([A-Z])/g, ' $1')}</label>
            </div>
          ))}
          <select value={settings?.cardLayout || 'left'} onChange={(e) => onUpdate('cardLayout', e.target.value)} className="w-full px-3 py-2 text-xs rounded-lg border">
            <option value="left">Info Left, Form Right</option>
            <option value="right">Form Left, Info Right</option>
          </select>
        </div>

        <div className="space-y-4 pt-2 border-t">
          <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Overrides (Optional)</h4>
          {['email', 'phone', 'address'].map(f => (
            <div key={f} className="space-y-1">
              <label className="text-[9px] font-bold text-slate-400 uppercase capitalize">{f}</label>
              <DebouncedInput type="text" value={settings[f] || ''} onChange={(val) => onUpdate(f, val)} className="w-full px-2 py-1.5 text-xs rounded-lg border" placeholder="Use site settings..." />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (section.type === 'stats-counter') {
    return (
      <div className="space-y-4">
        <label className="text-[10px] font-bold text-slate-500 uppercase">Counters</label>
        {(settings?.items || []).map((item: any) => (
          <div key={item.id} className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-800/50 shadow-sm">
            <button onClick={() => toggleExpand(item.id)} className="w-full px-4 py-2 flex items-center justify-between text-left hover:bg-slate-50">
              <span className="text-xs font-bold truncate">{item.label || 'New Counter'}</span>
              {expandedItems.includes(item.id) ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {expandedItems.includes(item.id) && (
              <div className="p-3 border-t space-y-3">
                <DebouncedInput type="text" placeholder="Value (e.g. 10k+)" value={item.value} onChange={(val) => updateArrayItem('items', item.id, { value: val })} className="w-full px-3 py-2 text-xs rounded-lg border" />
                <DebouncedInput type="text" placeholder="Label" value={item.label} onChange={(val) => updateArrayItem('items', item.id, { label: val })} className="w-full px-3 py-2 text-xs rounded-lg border" />
                <button onClick={() => removeArrayItem('items', item.id)} className="w-full py-1 text-[9px] font-bold text-red-500 hover:bg-red-50 rounded-lg">Remove</button>
              </div>
            )}
          </div>
        ))}
        <button onClick={() => addArrayItem('items', { value: '0', label: 'Counter' })} className="w-full py-2 border-2 border-dashed rounded-xl text-[10px] font-bold text-slate-500 hover:border-brand-500 transition-all flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" /> Add Counter
        </button>
      </div>
    );
  }

  if (section.type === 'review-slider') {
    return (
      <div className="space-y-4">
        <label className="text-[10px] font-bold text-slate-500 uppercase">Headline</label>
        <DebouncedInput type="text" value={settings?.headline || ''} onChange={(val) => onUpdate('headline', val)} className="w-full px-3 py-2 text-sm rounded-lg border" />
        <select value={settings?.source || 'db'} onChange={(e) => onUpdate('source', e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border">
          <option value="db">Store Reviews (Sync)</option>
          <option value="manual">Manual Entry</option>
        </select>
        {settings?.source === 'manual' && (
          <div className="space-y-4">
            {(settings?.items || []).map((rev: any) => (
              <div key={rev.id} className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-800/50">
                <button onClick={() => toggleExpand(rev.id)} className="w-full px-4 py-2 flex items-center justify-between text-left hover:bg-slate-50">
                  <span className="text-xs font-bold truncate">{rev.author || 'Anonymous'}</span>
                  {expandedItems.includes(rev.id) ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {expandedItems.includes(rev.id) && (
                  <div className="p-3 border-t space-y-3">
                    <DebouncedInput type="text" placeholder="Author" value={rev.author} onChange={(val) => updateArrayItem('items', rev.id, { author: val })} className="w-full px-3 py-2 text-xs rounded-lg border" />
                    <DebouncedInput as="textarea" placeholder="Review text" value={rev.text} onChange={(val) => updateArrayItem('items', rev.id, { text: val })} className="w-full px-3 py-2 text-xs rounded-lg border" />
                    <select value={rev.rating} onChange={(e) => updateArrayItem('items', rev.id, { rating: parseInt(e.target.value) })} className="w-full px-3 py-2 text-xs rounded-lg border">
                      {[5, 4, 3, 2, 1].map(r => <option key={r} value={r}>{r} Stars</option>)}
                    </select>
                    <button onClick={() => removeArrayItem('items', rev.id)} className="w-full py-1 text-[9px] font-bold text-red-500 hover:bg-red-50 rounded-lg">Remove</button>
                  </div>
                )}
              </div>
            ))}
            <button onClick={() => addArrayItem('items', { author: '', text: '', rating: 5 })} className="w-full py-2 border-2 border-dashed rounded-xl text-[10px] font-bold text-slate-500 hover:border-brand-500 transition-all flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" /> Add Review
            </button>
          </div>
        )}
      </div>
    );
  }

  if (section.type === 'offer-banner') {
    return (
      <div className="space-y-4">
        <label className="text-[10px] font-bold text-slate-500 uppercase">Offer Text</label>
        <DebouncedInput type="text" value={settings?.text || ''} onChange={(val) => onUpdate('text', val)} className="w-full px-3 py-2 text-sm rounded-lg border" />
        <label className="text-[10px] font-bold text-slate-500 uppercase">Button Text</label>
        <DebouncedInput type="text" value={settings?.buttonText || ''} onChange={(val) => onUpdate('buttonText', val)} className="w-full px-3 py-2 text-sm rounded-lg border" />
        <label className="text-[10px] font-bold text-slate-500 uppercase">Link</label>
        <DebouncedInput type="text" value={settings?.link || ''} onChange={(val) => onUpdate('link', val)} className="w-full px-3 py-2 text-sm rounded-lg border" />
      </div>
    );
  }

  if (section.type === 'checkout') {
    return (
      <div className="space-y-4">
        <label className="text-[10px] font-bold text-slate-500 uppercase">Heading</label>
        <DebouncedInput type="text" value={settings?.title || ''} onChange={(val) => onUpdate('title', val)} className="w-full px-3 py-2 text-sm rounded-lg border" />
        <label className="text-[10px] font-bold text-slate-500 uppercase">Button Label</label>
        <DebouncedInput type="text" value={settings?.buttonText || ''} onChange={(val) => onUpdate('buttonText', val)} className="w-full px-3 py-2 text-sm rounded-lg border" />
        <label className="text-[10px] font-bold text-slate-500 uppercase">Product Selection</label>
        <p className="text-[10px] text-slate-400">Checkout components typically focus on the primary store offering. Ensure your product IDs are correctly set in the global page context if needed.</p>
      </div>
    );
  }

  return null;
});

export default InteractiveEditor;
