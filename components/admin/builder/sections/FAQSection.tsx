
'use client';

import { Plus, X } from 'lucide-react';

interface FAQSectionProps {
    content: any;
    onChange: (content: any) => void;
}

export default function FAQSection({ content, onChange }: FAQSectionProps) {
    const styles = "w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all";

    const addFaq = () => {
        onChange({
            ...content,
            items: [...(content.items || []), { question: '', answer: '' }]
        });
    };

    const removeFaq = (index: number) => {
        const newItems = [...(content.items || [])];
        newItems.splice(index, 1);
        onChange({ ...content, items: newItems });
    };

    const updateFaq = (index: number, field: string, value: string) => {
        const newItems = [...(content.items || [])];
        newItems[index] = { ...newItems[index], [field]: value };
        onChange({ ...content, items: newItems });
    };

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Section Title</label>
                <input
                    value={content.title || ''}
                    onChange={(e) => onChange({ ...content, title: e.target.value })}
                    className={styles}
                    placeholder="Frequently Asked Questions"
                />
            </div>

            <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-500 uppercase">Questions & Answers</label>
                {(content.items || []).map((item: any, index: number) => (
                    <div key={index} className="p-3 bg-slate-50/50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-800 space-y-2">
                        <div className="flex gap-2">
                            <input
                                value={item.question}
                                onChange={(e) => updateFaq(index, 'question', e.target.value)}
                                className={styles}
                                placeholder="Question"
                            />
                            <button
                                type="button"
                                onClick={() => removeFaq(index)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <textarea
                            value={item.answer}
                            onChange={(e) => updateFaq(index, 'answer', e.target.value)}
                            className={styles}
                            rows={2}
                            placeholder="Answer"
                        />
                    </div>
                ))}
                <button
                    type="button"
                    onClick={addFaq}
                    className="flex items-center gap-2 text-sm text-brand-600 font-medium hover:underline"
                >
                    <Plus className="w-4 h-4" /> Add One More FAQ
                </button>
            </div>
        </div>
    );
}
