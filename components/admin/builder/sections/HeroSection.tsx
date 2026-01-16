
'use client';

import { Plus, X } from 'lucide-react';
import { useState } from 'react';
import LucideIcon from '../../../LucideIcon';
import IconPicker from '../../IconPicker';

interface HeroSectionProps {
    content: any;
    onChange: (content: any) => void;
}

export default function HeroSection({ content, onChange }: HeroSectionProps) {
    const [iconPickerIndex, setIconPickerIndex] = useState<number | null>(null);
    const styles = "w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all";

    const addHighlight = () => {
        onChange({
            ...content,
            highlights: [...(content.highlights || []), { icon: 'check', label: '', value: '', color: 'blue' }]
        });
    };

    const removeHighlight = (index: number) => {
        const newHighlights = [...(content.highlights || [])];
        newHighlights.splice(index, 1);
        onChange({ ...content, highlights: newHighlights });
    };

    const updateHighlight = (index: number, field: string, value: string) => {
        const newHighlights = [...(content.highlights || [])];
        newHighlights[index] = { ...newHighlights[index], [field]: value };
        onChange({ ...content, highlights: newHighlights });
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tagline</label>
                    <input
                        value={content.tagline || ''}
                        onChange={(e) => onChange({ ...content, tagline: e.target.value })}
                        className={styles}
                        placeholder="e.g. Innovates"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Badge Text</label>
                    <input
                        value={content.badgeText || ''}
                        onChange={(e) => onChange({ ...content, badgeText: e.target.value })}
                        className={styles}
                        placeholder="e.g. New Release"
                    />
                </div>
            </div>

            <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-500 uppercase">Hero Highlights</label>
                {(content.highlights || []).map((item: any, index: number) => (
                    <div key={index} className="flex gap-2 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 items-end">
                        <div className="flex-1 space-y-1">
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
                        <div className="flex-[2] space-y-1">
                            <label className="text-[10px] font-bold uppercase text-slate-400">Label</label>
                            <input
                                value={item.label}
                                onChange={(e) => updateHighlight(index, 'label', e.target.value)}
                                className={styles}
                                placeholder="e.g. Battery"
                            />
                        </div>
                        <div className="flex-[2] space-y-1">
                            <label className="text-[10px] font-bold uppercase text-slate-400">Value</label>
                            <input
                                value={item.value}
                                onChange={(e) => updateHighlight(index, 'value', e.target.value)}
                                className={styles}
                                placeholder="e.g. 24h"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={() => removeHighlight(index)}
                            className="p-2.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ))}
                <button type="button" onClick={addHighlight} className="flex items-center gap-2 text-sm text-brand-600 font-medium hover:underline">
                    <Plus className="w-4 h-4" /> Add Highlight
                </button>
            </div>

            <IconPicker
                isOpen={iconPickerIndex !== null}
                value={iconPickerIndex !== null ? content.highlights[iconPickerIndex]?.icon : ''}
                onClose={() => setIconPickerIndex(null)}
                onChange={(iconName) => {
                    if (iconPickerIndex !== null) {
                        updateHighlight(iconPickerIndex, 'icon', iconName);
                        setIconPickerIndex(null);
                    }
                }}
            />
        </div>
    );
}
