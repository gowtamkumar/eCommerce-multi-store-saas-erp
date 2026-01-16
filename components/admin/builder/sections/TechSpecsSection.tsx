
'use client';

import { Plus, X } from 'lucide-react';

interface TechSpecsSectionProps {
    content: any;
    onChange: (content: any) => void;
}

export default function TechSpecsSection({ content, onChange }: TechSpecsSectionProps) {
    const styles = "w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all";

    const addItem = () => {
        onChange({
            ...content,
            items: [...(content.items || []), { label: '', value: '' }]
        });
    };

    const removeItem = (index: number) => {
        const newItems = [...(content.items || [])];
        newItems.splice(index, 1);
        onChange({ ...content, items: newItems });
    };

    const updateItem = (index: number, field: string, value: string) => {
        const newItems = [...(content.items || [])];
        newItems[index] = { ...newItems[index], [field]: value };
        onChange({ ...content, items: newItems });
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Heading</label>
                    <input
                        value={content.heading || ''}
                        onChange={(e) => onChange({ ...content, heading: e.target.value })}
                        className={styles}
                        placeholder="Section Heading"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Subheading</label>
                    <input
                        value={content.subheading || ''}
                        onChange={(e) => onChange({ ...content, subheading: e.target.value })}
                        className={styles}
                        placeholder="Section Subheading"
                    />
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description</label>
                <textarea
                    value={content.description || ''}
                    onChange={(e) => onChange({ ...content, description: e.target.value })}
                    className={styles}
                    rows={2}
                    placeholder="Brief description"
                />
            </div>

            <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase">Specifications Table</label>
                {(content.items || []).map((item: any, index: number) => (
                    <div key={index} className="flex gap-2">
                        <input
                            value={item.label}
                            onChange={(e) => updateItem(index, 'label', e.target.value)}
                            className={`${styles} flex-1`}
                            placeholder="Label (e.g. Battery)"
                        />
                        <input
                            value={item.value}
                            onChange={(e) => updateItem(index, 'value', e.target.value)}
                            className={`${styles} flex-1`}
                            placeholder="Value (e.g. 20h)"
                        />
                        <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ))}
                <button
                    type="button"
                    onClick={addItem}
                    className="flex items-center gap-2 text-sm text-brand-600 font-medium hover:underline mt-2"
                >
                    <Plus className="w-4 h-4" /> Add Specification
                </button>
            </div>
        </div>
    );
}
