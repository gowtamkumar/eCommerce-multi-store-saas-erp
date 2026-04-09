import React from "react";
import { ImageIcon, Eye, EyeOff } from "lucide-react";
import DebouncedInput from "../../../pages/components/customizer/DebouncedInput";

interface ArchiveBannerProps {
    productsPage: any;
    onUpdate: (field: string, value: any) => void;
}

const ArchiveBanner = React.memo(({ productsPage, onUpdate }: ArchiveBannerProps) => {
    return (
        <div className="bg-slate-50 dark:bg-slate-800/40 rounded-[2.5rem] p-8 space-y-8 border border-slate-100 dark:border-slate-800 transition-all">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm">
                        <ImageIcon className="w-5 h-5 text-brand-500" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">Page Banner</h3>
                </div>
                <button
                    type="button"
                    onClick={() => onUpdate('bannerShow', !productsPage.bannerShow)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-bold text-xs transition-all ${productsPage.bannerShow
                        ? 'bg-brand-50 border-brand-200 text-brand-600'
                        : 'bg-white border-slate-200 text-slate-400 dark:bg-slate-900 dark:border-slate-800'
                        }`}
                >
                    {productsPage.bannerShow ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    {productsPage.bannerShow ? 'Banner Visible' : 'Banner Hidden'}
                </button>
            </div>

            {productsPage.bannerShow && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="space-y-4 md:col-span-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Banner Layout</label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => onUpdate('bannerFullWidth', false)}
                                className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${!productsPage.bannerFullWidth ? 'border-brand-500 bg-brand-50/50 text-brand-600' : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500'}`}
                            >
                                <div className="w-12 h-8 bg-slate-200 dark:bg-slate-700 rounded p-1">
                                    <div className="w-2/3 h-full bg-brand-400/30 mx-auto rounded-sm" />
                                </div>
                                <span className="text-xs font-bold">Contained</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => onUpdate('bannerFullWidth', true)}
                                className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${productsPage.bannerFullWidth ? 'border-brand-500 bg-brand-50/50 text-brand-600' : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500'}`}
                            >
                                <div className="w-12 h-8 bg-slate-200 dark:bg-slate-700 rounded p-1">
                                    <div className="w-full h-full bg-brand-400/30 rounded-sm" />
                                </div>
                                <span className="text-xs font-bold">Full Width</span>
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Headline</label>
                        <DebouncedInput
                            type="text"
                            value={productsPage.bannerHeadline || ''}
                            onChange={(val) => onUpdate('bannerHeadline', val)}
                            placeholder="e.g., Explore Our Collection"
                            className="w-full px-5 py-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-sm font-bold focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Tagline</label>
                        <DebouncedInput
                            type="text"
                            value={productsPage.bannerTagline || ''}
                            onChange={(val) => onUpdate('bannerTagline', val)}
                            placeholder="e.g., Quality you can trust"
                            className="w-full px-5 py-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-sm font-bold focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all"
                        />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Sub-headline / Description</label>
                        <DebouncedInput
                            as="textarea"
                            value={productsPage.bannerSubheadline || ''}
                            onChange={(val) => onUpdate('bannerSubheadline', val)}
                            placeholder="A brief description about your products..."
                            rows={3}
                            className="w-full px-5 py-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-sm font-bold focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all resize-none"
                        />
                    </div>

                    <div className="space-y-4 md:col-span-2 p-6 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                        <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                            <ImageIcon className="w-4 h-4 text-brand-500" />
                            Background & Styles
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Background Image URL</label>
                                <DebouncedInput
                                    type="text"
                                    value={productsPage.bannerImage || ''}
                                    onChange={(val) => onUpdate('bannerImage', val)}
                                    placeholder="Paste image URL here"
                                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-transparent focus:bg-white dark:focus:bg-slate-900 border-2 focus:border-brand-500 outline-none transition-all text-xs font-bold"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Background Color</label>
                                <div className="flex gap-3">
                                    <input
                                        type="color"
                                        value={productsPage.bannerBackgroundColor || '#f8fafc'}
                                        onChange={(e) => onUpdate('bannerBackgroundColor', e.target.value)}
                                        className="w-14 h-14 rounded-xl border-none cursor-pointer bg-transparent"
                                    />
                                    <DebouncedInput
                                        type="text"
                                        value={productsPage.bannerBackgroundColor || ''}
                                        onChange={(val) => onUpdate('bannerBackgroundColor', val)}
                                        placeholder="#HEX value"
                                        className="flex-1 px-5 py-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-transparent focus:bg-white dark:focus:bg-slate-900 border-2 focus:border-brand-500 outline-none transition-all text-xs font-bold"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Text Color</label>
                                <div className="flex gap-3">
                                    <input
                                        type="color"
                                        value={productsPage.bannerTextColor || '#0f172a'}
                                        onChange={(e) => onUpdate('bannerTextColor', e.target.value)}
                                        className="w-14 h-14 rounded-xl border-none cursor-pointer bg-transparent"
                                    />
                                    <DebouncedInput
                                        type="text"
                                        value={productsPage.bannerTextColor || ''}
                                        onChange={(val) => onUpdate('bannerTextColor', val)}
                                        placeholder="#HEX value"
                                        className="flex-1 px-5 py-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-transparent focus:bg-white dark:focus:bg-slate-900 border-2 focus:border-brand-500 outline-none transition-all text-xs font-bold"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center mb-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Overlay Opacity</label>
                                    <span className="text-[10px] font-black text-brand-600 bg-brand-50 px-2 py-0.5 rounded">{productsPage.bannerOverlayOpacity || 40}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={productsPage.bannerOverlayOpacity || 40}
                                    onChange={(e) => onUpdate('bannerOverlayOpacity', parseInt(e.target.value))}
                                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-500"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Banner Style Preset</label>
                        <select
                            value={productsPage.bannerStyle || 'modern'}
                            onChange={(e) => onUpdate('bannerStyle', e.target.value)}
                            className="w-full px-5 py-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-sm font-bold focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all appearance-none"
                        >
                            <option value="modern">✨ Modern Gradient (Default)</option>
                            <option value="minimal">🏳️ Minimalist Clean</option>
                            <option value="image">🖼️ Optimized for Background Image</option>
                        </select>
                    </div>
                </div>
            )}
        </div>
    );
});

export default ArchiveBanner;
