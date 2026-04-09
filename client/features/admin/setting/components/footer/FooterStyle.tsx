import React from "react";
import { Box, Move } from "lucide-react";

interface FooterStyleProps {
    footerData: any;
    onUpdate: (key: string, value: any) => void;
}

const FooterStyle = React.memo(({ footerData, onUpdate }: FooterStyleProps) => {
    const templates = [
        { id: 'classic', label: 'Classic' },
        { id: 'modern', label: 'Modern' },
        { id: 'elegant', label: 'Elegant' },
        { id: 'corporate', label: 'Corporate' },
        { id: 'glass', label: 'Glass' },
        { id: 'floating', label: 'Floating' },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            <div className="bg-slate-50 dark:bg-slate-900/30 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-6">
                <div className="flex items-center gap-2">
                    <Box className="w-5 h-5 text-brand-600" />
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">
                        Template & Layout
                    </h3>
                </div>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none pl-1">Base Template</label>
                        <select
                            value={footerData?.template || 'classic'}
                            onChange={(e) => onUpdate('template', e.target.value)}
                            className="w-full bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none"
                        >
                            {templates.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none pl-1">Columns</label>
                        <div className="grid grid-cols-4 gap-2">
                            {['1', '2', '3', '4'].map((col) => (
                                <button
                                    key={col}
                                    type="button"
                                    onClick={() => onUpdate('columns', col)}
                                    className={`py-2.5 rounded-xl border-2 transition-all text-xs font-bold ${footerData?.columns === col
                                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-600 shadow-sm'
                                        : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-500 hover:border-slate-200'
                                        }`}
                                >
                                    {col} Col
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/30 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-6">
                <div className="flex items-center gap-2">
                    <Move className="w-5 h-5 text-brand-600" />
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">
                        Visibility & Depth
                    </h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <label className="flex items-center justify-between p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 cursor-pointer hover:border-brand-200 dark:hover:border-brand-800 transition-all">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Socials</span>
                        <input
                            type="checkbox"
                            checked={footerData?.showSocialLinks !== false}
                            onChange={(e) => onUpdate('showSocialLinks', e.target.checked)}
                            className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
                        />
                    </label>
                    <label className="flex items-center justify-between p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 cursor-pointer hover:border-brand-200 dark:hover:border-brand-800 transition-all">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Newsletter</span>
                        <input
                            type="checkbox"
                            checked={footerData?.showNewsletter !== false}
                            onChange={(e) => onUpdate('showNewsletter', e.target.checked)}
                            className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
                        />
                    </label>
                </div>
                <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Shadow Intensity</span>
                    <div className="flex bg-slate-200 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                        {['none', 'subtle', 'medium', 'strong'].map((intensity) => (
                            <button
                                key={intensity}
                                type="button"
                                onClick={() => onUpdate('shadowIntensity', intensity)}
                                className={`flex-1 py-1.5 text-[9px] font-bold uppercase rounded-lg transition-all ${footerData?.shadowIntensity === intensity
                                    ? 'bg-white dark:bg-slate-700 text-brand-600 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                {intensity}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
});

export default FooterStyle;
