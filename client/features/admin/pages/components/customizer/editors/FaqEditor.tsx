"use client";

import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import DebouncedInput from '../panels/DebouncedInput';

interface FaqEditorProps {
  settings: any;
  dbFaqs: any[];
  onUpdate: (key: string, value: any) => void;
  updateArrayItem: (key: string, itemId: string, itemData: any) => void;
  addArrayItem: (key: string, defaultItem: any) => void;
  removeArrayItem: (key: string, itemId: string) => void;
}

const FaqEditor = React.memo(({ settings, dbFaqs, onUpdate, updateArrayItem, addArrayItem, removeArrayItem }: FaqEditorProps) => {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-slate-500 uppercase">Section Headline</label>
        <DebouncedInput
          type="text"
          value={settings?.headline || ''}
          onChange={(val) => onUpdate('headline', val)}
          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-slate-500 uppercase">FAQ Source</label>
        <select
          value={settings?.source || 'page'}
          onChange={(e) => onUpdate('source', e.target.value)}
          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
        >
          <option value="page">Page Specific FAQs</option>
          <option value="global">All Global FAQs</option>
          <option value="specific">Manual Selection</option>
          <option value="custom">Custom Inline FAQs</option>
        </select>
      </div>

      {settings?.source === 'specific' && (
        <div className="space-y-4">
          <label className="text-[10px] font-bold text-slate-500 uppercase">Selected Global FAQs</label>
          <div className="space-y-2">
            {(settings?.faqIds || []).map((id: string, idx: number) => {
              const faq = dbFaqs.find(f => f.id === id);
              return (
                <div key={id} className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2">
                  <span className="text-xs truncate flex-1">{faq?.question || 'Unknown FAQ'}</span>
                  <button
                    onClick={() => onUpdate('faqIds', settings.faqIds.filter((f: string) => f !== id))}
                    className="p-1 text-red-500 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
          <select
            value=""
            onChange={(e) => {
              if (!e.target.value) return;
              const current = settings.faqIds || [];
              if (!current.includes(e.target.value)) onUpdate('faqIds', [...current, e.target.value]);
            }}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
          >
            <option value="">+ Add a global FAQ...</option>
            {dbFaqs.filter(f => !(settings.faqIds || []).includes(f.id)).map(f => (
              <option key={f.id} value={f.id}>{f.question}</option>
            ))}
          </select>
        </div>
      )}

      {settings?.source === 'custom' && (
        <div className="space-y-4">
          <label className="text-[10px] font-bold text-slate-500 uppercase">Custom FAQs</label>
          {(settings?.items || []).map((item: any, index: number) => (
            <div key={item.id} className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-800/50">
              <button
                onClick={() => toggleExpand(item.id)}
                className="w-full px-4 py-2 flex items-center justify-between text-left hover:bg-slate-50"
              >
                <span className="text-xs font-bold truncate">{item.question || 'New FAQ'}</span>
                {expandedItems.includes(item.id) ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {expandedItems.includes(item.id) && (
                <div className="p-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  <DebouncedInput
                    type="text"
                    value={item.question || ''}
                    onChange={(val) => updateArrayItem('items', item.id, { question: val })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border"
                    placeholder="Question"
                  />
                  <DebouncedInput
                    as="textarea"
                    value={item.answer || ''}
                    onChange={(val) => updateArrayItem('items', item.id, { answer: val })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border"
                    placeholder="Answer"
                  />
                  <button onClick={() => removeArrayItem('items', item.id)} className="w-full py-1 text-[9px] font-bold text-red-500 hover:bg-red-50 rounded-lg">
                    Remove
                  </button>
                </div>
              )}
            </div>
          ))}
          <button
            onClick={() => addArrayItem('items', { question: '', answer: '' })}
            className="w-full py-2 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-bold text-slate-500 hover:border-brand-500 hover:text-brand-600 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Custom FAQ
          </button>
        </div>
      )}
    </div>
  );
});

export default FaqEditor;
