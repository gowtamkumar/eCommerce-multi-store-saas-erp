
'use client';

import { Plus, X } from 'lucide-react';
import { useState } from 'react';
import LucideIcon from '../../../LucideIcon';
import IconPicker from '../../IconPicker';

interface BenefitsSectionProps {
    content: any;
    onChange: (content: any) => void;
}

export default function BenefitsSection({ content, onChange }: BenefitsSectionProps) {
    const [iconPickerIndex, setIconPickerIndex] = useState<number | null>(null);

    const styles = "w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all";

    const addItem = () => {
        onChange({
            ...content,
            items: [...(content.items || []), { icon: 'star', title: '', description: '', color: 'bg-blue-100 text-blue-600' }]
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
                        placeholder="Key Benefits"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Subheading</label>
                    <input
                        value={content.subheading || ''}
                        onChange={(e) => onChange({ ...content, subheading: e.target.value })}
                        className={styles}
                    />
                </div>
            </div>

            <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-500 uppercase">Benefit Cards</label>
                {(content.items || []).map((item: any, index: number) => (
                    <div key={index} className="p-3 bg-slate-50/50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-800 space-y-3">
                        <div className="flex gap-4 items-end">
                            <div className="w-1/4 space-y-1">
                                <label className="text-[10px] font-bold uppercase text-slate-400">Icon</label>
                                <button
                                    type="button"
                                    onClick={() => setIconPickerIndex(index)}
                                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm hover:border-brand-500 transition-colors"
                                >
                                    <span className="flex items-center gap-2 truncate">
                                        <LucideIcon name={item.icon} className="w-4 h-4" />
                                        {item.icon}
                                    </span>
                                </button>
                            </div>
                            <div className="w-1/4 space-y-1">
                                <label className="text-[10px] font-bold uppercase text-slate-400">Color</label>
                                <select
                                    value={item.color}
                                    onChange={(e) => updateItem(index, 'color', e.target.value)}
                                    className={styles}
                                >
                                    <option value="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">Blue</option>
                                    <option value="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400">Yellow</option>
                                    <option value="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">Purple</option>
                                    <option value="bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400">Pink</option>
                                    <option value="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">Green</option>
                                    <option value="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">Orange</option>
                                </select>
                            </div>
                            <div className="flex-1 space-y-1">
                                <label className="text-[10px] font-bold uppercase text-slate-400">Title</label>
                                <input
                                    value={item.title}
                                    onChange={(e) => updateItem(index, 'title', e.target.value)}
                                    className={styles}
                                    placeholder="Title"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() => removeItem(index)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors mb-0.5"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <textarea
                            value={item.description}
                            onChange={(e) => updateItem(index, 'description', e.target.value)}
                            className={styles}
                            rows={2}
                            placeholder="Description"
                        />
                    </div>
                ))}
                <button type="button" onClick={addItem} className="flex items-center gap-2 text-sm text-brand-600 font-medium hover:underline">
                    <Plus className="w-4 h-4" /> Add Benefit
                </button>
            </div>

            <IconPicker
                isOpen={iconPickerIndex !== null}
                value={iconPickerIndex !== null ? content.items[iconPickerIndex]?.icon : ''}
                onClose={() => setIconPickerIndex(null)}
                onChange={(iconName) => {
                    if (iconPickerIndex !== null) {
                        updateItem(iconPickerIndex, 'icon', iconName);
                        setIconPickerIndex(null);
                    }
                }}
            />
        </div>
    );
}
