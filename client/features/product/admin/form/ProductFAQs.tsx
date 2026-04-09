'use client';

import React, { useState, useEffect, memo } from 'react';
import { MessageSquare, Plus, Trash2 } from 'lucide-react';
import { fetchAPI } from '@/services/api';

interface ProductFAQsProps {
  faqs: any[];
  faqSource: string;
  faqIds: string[];
  onChange: (faqs: any[], faqSource: string, faqIds: string[]) => void;
}

export const ProductFAQs = memo(({
  faqs,
  faqSource: initialSource,
  faqIds: initialFaqIds,
  onChange
}: ProductFAQsProps) => {
  const [source, setSource] = useState<string>(initialSource || 'manual');
  const [faqIds, setFaqIds] = useState<string[]>(initialFaqIds || []);
  const [dbFaqs, setDbFaqs] = useState<any[]>([]);

  useEffect(() => {
    fetchAPI('/faqs?limit=100')
      .then((res) => {
        if (res.success && res.data?.faqs) {
          setDbFaqs(res.data.faqs);
        }
      })
      .catch((err) => console.error('Error fetching FAQs:', err));
  }, []);

  useEffect(() => {
    onChange(faqs, source, faqIds);
  }, [source, faqIds]);

  const addFaq = () => {
    const updated = [...faqs, { question: '', answer: '', order: faqs.length }];
    onChange(updated, source, faqIds);
  };

  const removeFaq = (index: number) => {
    const updated = faqs.filter((_, i) => i !== index);
    onChange(updated, source, faqIds);
  };

  const updateFaq = (index: number, field: string, value: string) => {
    const newFaqs = [...faqs];
    newFaqs[index] = { ...newFaqs[index], [field]: value };
    onChange(newFaqs, source, faqIds);
  };

  const addFaqId = (id: string) => {
    if (!faqIds.includes(id)) {
      const updated = [...faqIds, id];
      setFaqIds(updated);
    }
  };

  const removeFaqId = (index: number) => {
    const updated = faqIds.filter((_, i) => i !== index);
    setFaqIds(updated);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-brand-500" /> Product FAQs
        </h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            FAQ Source
          </label>
          <select
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
          >
            <option value="manual">Manual Entry</option>
            <option value="selection">Select from Database</option>
          </select>
        </div>

        {source === 'selection' ? (
          <div className="space-y-4">
            <div className="space-y-2">
              {faqIds.map((id, idx) => {
                const faq = dbFaqs.find(f => f.id === id);
                return (
                  <div key={`${id}-${idx}`} className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
                    <span className="text-sm flex-1 truncate text-slate-900 dark:text-white">
                      {faq?.question || 'Unknown FAQ'}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFaqId(idx)}
                      className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>

            <select
              value=""
              onChange={(e) => {
                if (e.target.value) {
                  addFaqId(e.target.value);
                }
              }}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
            >
              <option value="">+ Select a FAQ from database...</option>
              {dbFaqs
                .filter(f => !faqIds.includes(f.id))
                .map((f: any) => (
                  <option key={f.id} value={f.id}>{f.question}</option>
                ))
              }
            </select>
          </div>
        ) : (
          <>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={addFaq}
                className="text-sm font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> Add Question
              </button>
            </div>

            <div className="space-y-4">
              {faqs.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 dark:bg-slate-900/50 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-400 text-sm">
                  No FAQs added yet.
                </div>
              ) : (
                faqs.map((faq, index) => (
                  <div key={index} className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 relative group">
                    <button
                      type="button"
                      onClick={() => removeFaq(index)}
                      className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors"
                      title="Remove FAQ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="space-y-3 pr-8">
                      <input
                        type="text"
                        placeholder="Question"
                        value={faq.question}
                        onChange={(e) => updateFaq(index, 'question', e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                      />
                      <textarea
                        placeholder="Answer"
                        value={faq.answer}
                        onChange={(e) => updateFaq(index, 'answer', e.target.value)}
                        rows={2}
                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-brand-500 outline-none resize-none"
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
});

ProductFAQs.displayName = 'ProductFAQs';
