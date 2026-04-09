import React, { useState } from "react";
import { Box, ChevronDown, Palette, Paintbrush, Settings2 } from "lucide-react";

interface AdvancedFooterDesignerProps {
    footerData: any;
    onUpdate: (key: string, value: any) => void;
}

const AdvancedFooterDesigner = React.memo(({ footerData, onUpdate }: AdvancedFooterDesignerProps) => {
    const [showAdvanced, setShowAdvanced] = useState(false);

    return (
        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm transition-all duration-300">
            <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full flex items-center justify-between p-6 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
            >
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-brand-500 text-white rounded-2xl shadow-lg shadow-brand-500/20">
                        <Settings2 className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight font-display">Advanced Designer</h3>
                        <p className="text-xs text-slate-500 font-medium tracking-wide">Fine-tune colors, rounding, shapes and patterns</p>
                    </div>
                </div>
                <div className={`p-2 rounded-full bg-slate-100 dark:bg-slate-900/50 transition-transform duration-500 ${showAdvanced ? 'rotate-180' : ''}`}>
                    <ChevronDown className="w-5 h-5 text-slate-500" />
                </div>
            </button>

            {showAdvanced && (
                <div className="p-8 pt-0 space-y-10 border-t border-slate-100 dark:border-slate-700 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-8">
                        {/* Custom Colors */}
                        <div className="space-y-6">
                            <h4 className="text-[10px] font-black text-brand-600 dark:text-brand-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Palette className="w-4 h-4" /> Color Palette
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[
                                    { id: 'backgroundColor', label: 'Background', default: '#0f172a' },
                                    { id: 'textColor', label: 'Text Color', default: '#f8fafc' },
                                    { id: 'brandColor', label: 'Brand Highlight', default: '#6366f1' },
                                    { id: 'borderColor', label: 'Top Border', default: '#1e293b' }
                                ].map((color) => (
                                    <div key={color.id} className="space-y-2">
                                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pl-1">{color.label}</label>
                                        <div className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700">
                                            <input
                                                type="color"
                                                value={footerData?.[color.id] || color.default}
                                                onChange={(e) => onUpdate(color.id, e.target.value)}
                                                className="w-8 h-8 rounded-lg cursor-pointer border-none p-0 bg-transparent"
                                            />
                                            <input
                                                type="text"
                                                value={footerData?.[color.id] || ""}
                                                onChange={(e) => onUpdate(color.id, e.target.value)}
                                                placeholder="#HEX"
                                                className="min-w-0 flex-1 bg-transparent border-none p-0 text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest outline-none"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Rounding & Patterns */}
                        <div className="space-y-6">
                            <h4 className="text-[10px] font-black text-brand-600 dark:text-brand-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Box className="w-4 h-4" /> Radii & Transparency
                            </h4>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pl-1">Corner Rounding</span>
                                    <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl border border-slate-100 dark:border-slate-800">
                                        {['none', 'md', 'xl', '3xl', 'full'].map((radius) => (
                                            <button
                                                key={radius}
                                                type="button"
                                                onClick={() => onUpdate('borderRadius', radius)}
                                                className={`flex-1 py-1.5 text-[9px] font-black uppercase rounded-xl transition-all ${footerData?.borderRadius === radius
                                                    ? 'bg-white dark:bg-slate-800 text-brand-600 shadow-md ring-1 ring-slate-200 dark:ring-slate-700'
                                                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                                                    }`}
                                            >
                                                {radius}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <label className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-2 border-slate-100 dark:border-slate-800 cursor-pointer hover:border-brand-500/20 active:scale-[0.98] transition-all group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-brand-500 group-hover:scale-150 transition-transform"></div>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Glassmorphism</span>
                                            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest leading-none mt-1">Enable blurring effects</span>
                                        </div>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={footerData?.glassEffect}
                                        onChange={(e) => onUpdate('glassEffect', e.target.checked)}
                                        className="w-5 h-5 text-brand-600 rounded-lg border-slate-300 focus:ring-brand-500"
                                    />
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {/* Top Shape */}
                        <div className="space-y-6">
                            <h4 className="text-[10px] font-black text-brand-600 dark:text-brand-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Paintbrush className="w-4 h-4" /> Decorative Edge
                            </h4>
                            <div className="grid grid-cols-5 gap-3">
                                {[
                                    { id: 'none', label: 'None' },
                                    { id: 'wave', label: 'Wave' },
                                    { id: 'curve', label: 'Curve' },
                                    { id: 'slant', label: 'Slant' },
                                    { id: 'notch', label: 'Notch' }
                                ].map((shape) => (
                                    <button
                                        key={shape.id}
                                        type="button"
                                        onClick={() => onUpdate('topShape', shape.id)}
                                        className={`flex flex-col items-center gap-3 p-3 rounded-2xl border-2 transition-all ${footerData?.topShape === shape.id
                                            ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-900/10 text-brand-600 shadow-lg'
                                            : 'border-slate-100 dark:border-slate-800 text-slate-400 hover:border-slate-200'
                                            }`}
                                    >
                                        <div className={`w-10 h-6 rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 overflow-hidden relative rotate-180 shadow-inner`}>
                                            {shape.id === 'wave' && <div className="absolute bottom-0 w-full h-3 bg-brand-500/20 rounded-t-full" />}
                                            {shape.id === 'curve' && <div className="absolute bottom-0 w-full h-3 bg-brand-500/20 rounded-[100%]" />}
                                            {shape.id === 'slant' && <div className="absolute bottom-0 w-full h-3 bg-brand-500/20 -skew-y-12 origin-bottom-left" />}
                                            {shape.id === 'notch' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-2.5 bg-brand-500/20 rounded-t-lg" />}
                                        </div>
                                        <span className="text-[8px] font-black uppercase tracking-tighter leading-none">{shape.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Background Pattern */}
                        <div className="space-y-6">
                            <h4 className="text-[10px] font-black text-brand-600 dark:text-brand-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Palette className="w-4 h-4" /> Pattern Texture
                            </h4>
                            <div className="grid grid-cols-5 gap-3">
                                {[
                                    { id: 'none', label: 'None' },
                                    { id: 'dots', label: 'Dots' },
                                    { id: 'mesh', label: 'Mesh' },
                                    { id: 'grid', label: 'Grid' },
                                    { id: 'stripes', label: 'Stripes' }
                                ].map((pattern) => (
                                    <button
                                        key={pattern.id}
                                        type="button"
                                        onClick={() => onUpdate('backgroundPattern', pattern.id)}
                                        className={`flex flex-col items-center gap-3 p-3 rounded-2xl border-2 transition-all ${footerData?.backgroundPattern === pattern.id
                                            ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-900/10 text-brand-600 shadow-lg'
                                            : 'border-slate-100 dark:border-slate-800 text-slate-400 hover:border-slate-200'
                                            }`}
                                    >
                                        <div className={`w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden relative shadow-inner`}>
                                            {pattern.id === 'dots' && <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#000 1.5px, transparent 0)', backgroundSize: '6px 6px' }} />}
                                            {pattern.id === 'mesh' && <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(45deg, #000 25%, transparent 25%), linear-gradient(-45deg, #000 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #000 75%), linear-gradient(-45deg, transparent 75%, #000 75%)', backgroundSize: '10px 10px' }} />}
                                            {pattern.id === 'grid' && <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '10px 10px' }} />}
                                            {pattern.id === 'stripes' && <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #000, #000 2px, transparent 2px, transparent 10px)' }} />}
                                        </div>
                                        <span className="text-[8px] font-black uppercase tracking-tighter leading-none">{pattern.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
});

export default AdvancedFooterDesigner;
