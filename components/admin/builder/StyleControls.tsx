
'use client';

import { AlignCenter, AlignJustify, AlignLeft, Layout, Palette, Type } from 'lucide-react';
import { SectionSettings } from './types';

interface StyleControlsProps {
    settings?: SectionSettings;
    onChange: (settings: SectionSettings) => void;
}

export default function StyleControls({ settings = {}, onChange }: StyleControlsProps) {
    const handleChange = (key: keyof SectionSettings, value: string) => {
        onChange({ ...settings, [key]: value });
    };

    return (
        <div className="space-y-6 pt-2">
            <div>
                <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase mb-3">
                    <Palette className="w-3 h-3" /> Appearance
                </label>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <span className="block text-xs text-slate-500 mb-1.5">Background</span>
                        <select
                            value={settings.backgroundColor || 'bg-white dark:bg-slate-900'}
                            onChange={(e) => handleChange('backgroundColor', e.target.value)}
                            className="w-full px-2 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                        >
                            <option value="bg-white dark:bg-slate-900">Default (White/Dark)</option>
                            <option value="bg-slate-50 dark:bg-slate-800/50">Subtle (Gray)</option>
                            <option value="bg-brand-50 dark:bg-brand-900/20">Brand Tint</option>
                            <option value="bg-slate-900 text-white dark:bg-black">Dark Inverted</option>
                            <option value="bg-brand-600 text-white">Brand Solid</option>
                        </select>
                    </div>
                    <div>
                        <span className="block text-xs text-slate-500 mb-1.5">Text Color</span>
                        <select
                            value={settings.textColor || ''}
                            onChange={(e) => handleChange('textColor', e.target.value)}
                            className="w-full px-2 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                        >
                            <option value="">Default</option>
                            <option value="text-slate-900 dark:text-white">High Contrast</option>
                            <option value="text-slate-600 dark:text-slate-300">Muted</option>
                            <option value="text-brand-600 dark:text-brand-400">Brand Color</option>
                        </select>
                    </div>
                </div>
            </div>

            <div>
                <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase mb-3">
                    <Layout className="w-3 h-3" /> Layout & Spacing
                </label>
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <span className="block text-xs text-slate-500 mb-1.5">Padding Top</span>
                        <select
                            value={settings.paddingTop || 'py-12'}
                            onChange={(e) => handleChange('paddingTop', e.target.value)}
                            className="w-full px-2 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                        >
                            <option value="pt-0">None</option>
                            <option value="pt-8">Small</option>
                            <option value="pt-16">Medium</option>
                            <option value="pt-24">Large</option>
                        </select>
                    </div>
                    <div>
                        <span className="block text-xs text-slate-500 mb-1.5">Padding Bottom</span>
                        <select
                            value={settings.paddingBottom || 'pb-12'}
                            onChange={(e) => handleChange('paddingBottom', e.target.value)}
                            className="w-full px-2 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                        >
                            <option value="pb-0">None</option>
                            <option value="pb-8">Small</option>
                            <option value="pb-16">Medium</option>
                            <option value="pb-24">Large</option>
                        </select>
                    </div>
                </div>

                <div>
                    <span className="block text-xs text-slate-500 mb-1.5">Container Width</span>
                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                        <button
                            type="button"
                            onClick={() => handleChange('containerWidth', 'standard')}
                            className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-medium rounded-md transition-all ${(settings.containerWidth || 'standard') === 'standard'
                                    ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white'
                                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                                }`}
                        >
                            <AlignJustify className="w-3 h-3" /> Standard
                        </button>
                        <button
                            type="button"
                            onClick={() => handleChange('containerWidth', 'full')}
                            className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-medium rounded-md transition-all ${settings.containerWidth === 'full'
                                    ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white'
                                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                                }`}
                        >
                            <Layout className="w-3 h-3" /> Full Width
                        </button>
                    </div>
                </div>
            </div>

            <div>
                <span className="block text-xs text-slate-500 mb-1.5">Custom CSS Class</span>
                <input
                    type="text"
                    value={settings.customClass || ''}
                    onChange={(e) => handleChange('customClass', e.target.value)}
                    placeholder="e.g. my-custom-section"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                />
            </div>
        </div>
    );
}
