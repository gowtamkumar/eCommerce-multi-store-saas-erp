"use client";

import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQEditorProps {
  content: any;
  onUpdate: (key: string, value: any) => void;
}

export default function FAQEditor({ content, onUpdate }: FAQEditorProps) {
  const [faqs, setFaqs] = useState<FAQItem[]>(content?.faqs || []);

  const addFAQ = () => {
    const newFaqs = [...faqs, { question: '', answer: '' }];
    setFaqs(newFaqs);
    onUpdate('faqs', newFaqs);
  };

  const removeFAQ = (index: number) => {
    const newFaqs = faqs.filter((_, i) => i !== index);
    setFaqs(newFaqs);
    onUpdate('faqs', newFaqs);
  };

  const updateFAQ = (index: number, field: 'question' | 'answer', value: string) => {
    const newFaqs = [...faqs];
    newFaqs[index][field] = value;
    setFaqs(newFaqs);
    onUpdate('faqs', newFaqs);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
          Section Title (Optional)
        </label>
        <input
          type="text"
          placeholder="Frequently Asked Questions"
          value={content?.title || ''}
          onChange={(e) => onUpdate('title', e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
          Description (Optional)
        </label>
        <textarea
          placeholder="Find answers to common questions"
          value={content?.description || ''}
          onChange={(e) => onUpdate('description', e.target.value)}
          rows={2}
          className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
        />
      </div>

      <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
            FAQ Items ({faqs.length})
          </label>
          <button
            type="button"
            onClick={addFAQ}
            className="flex items-center gap-2 px-3 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add FAQ
          </button>
        </div>

        {faqs.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm bg-slate-50 dark:bg-slate-900/50 rounded-lg">
            No FAQ items yet. Click "Add FAQ" to create one.
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900/30 space-y-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase">
                    Item #{index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFAQ(index)}
                    className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Remove FAQ"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <input
                  type="text"
                  placeholder="Question"
                  value={faq.question}
                  onChange={(e) => updateFAQ(index, 'question', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                />

                <textarea
                  placeholder="Answer"
                  value={faq.answer}
                  onChange={(e) => updateFAQ(index, 'answer', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
