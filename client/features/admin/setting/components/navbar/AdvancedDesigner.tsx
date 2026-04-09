import React, { useState } from "react";
import { ChevronDown, Settings2 } from "lucide-react";

interface AdvancedDesignerProps {
    navbarData: any;
    onUpdate: (key: string, value: any) => void;
}

const AdvancedDesigner = React.memo(({ navbarData, onUpdate }: AdvancedDesignerProps) => {
    const [showAdvanced, setShowAdvanced] = useState(false);

    return (
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden mb-8 shadow-sm">
            <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full flex items-center justify-between p-6 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-brand-100 dark:bg-brand-900/30 rounded-xl">
                        <Settings2 className="w-5 h-5 text-brand-600" />
                    </div>
                    <div className="text-left">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Advanced Designer</h3>
                        <p className="text-xs text-slate-500">Fine-tune colors, shadows, and effects</p>
                    </div>
                </div>
                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${showAdvanced ? 'rotate-180' : ''}`} />
            </button>

            {showAdvanced && (
                <div className="p-6 pt-0 space-y-8 border-t border-slate-100 dark:border-slate-700 animate-in fade-in slide-in-from-top-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                        {/* Custom Colors */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Custom Colors</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-slate-500">Background Color</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            value={navbarData?.backgroundColor || "#ffffff"}
                                            onChange={(e) => onUpdate('backgroundColor', e.target.value)}
                                            className="w-10 h-10 rounded-lg cursor-pointer border-none p-0"
                                        />
                                        <input
                                            type="text"
                                            value={navbarData?.backgroundColor || ""}
                                            onChange={(e) => onUpdate('backgroundColor', e.target.value)}
                                            placeholder="Default (Auto)"
                                            className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-slate-500">Text Color</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            value={navbarData?.textColor || "#000000"}
                                            onChange={(e) => onUpdate('textColor', e.target.value)}
                                            className="w-10 h-10 rounded-lg cursor-pointer border-none p-0"
                                        />
                                        <input
                                            type="text"
                                            value={navbarData?.textColor || ""}
                                            onChange={(e) => onUpdate('textColor', e.target.value)}
                                            placeholder="Default (Auto)"
                                            className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Shadow Intensity */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Shadow Intensity</h4>
                            <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
                                {['none', 'subtle', 'medium', 'strong'].map((intensity) => (
                                    <button
                                        key={intensity}
                                        type="button"
                                        onClick={() => onUpdate('shadowIntensity', intensity)}
                                        className={`flex-1 py-2 text-[10px] font-bold uppercase rounded-lg transition-all ${navbarData?.shadowIntensity === intensity
                                            ? 'bg-white dark:bg-slate-800 text-brand-600 shadow-sm'
                                            : 'text-slate-500 hover:text-slate-700'
                                            }`}
                                    >
                                        {intensity}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Hover Effect */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Link Hover Effect</h4>
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { id: 'underline', label: 'Underline' },
                                    { id: 'glow', label: 'Glow' },
                                    { id: 'background', label: 'Capsule' }
                                ].map((effect) => (
                                    <button
                                        key={effect.id}
                                        type="button"
                                        onClick={() => onUpdate('hoverEffect', effect.id)}
                                        className={`py-3 rounded-xl border-2 text-[10px] font-bold uppercase transition-all ${navbarData?.hoverEffect === effect.id
                                            ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-600'
                                            : 'border-slate-100 dark:border-slate-800 text-slate-500'
                                            }`}
                                    >
                                        {effect.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Rounding / Border Radius */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Corner Rounding</h4>
                            <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
                                {['none', 'md', 'xl', '3xl', 'full'].map((radius) => (
                                    <button
                                        key={radius}
                                        type="button"
                                        onClick={() => onUpdate('borderRadius', radius)}
                                        className={`flex-1 py-2 text-[10px] font-bold uppercase rounded-lg transition-all ${navbarData?.borderRadius === radius
                                            ? 'bg-white dark:bg-slate-800 text-brand-600 shadow-sm'
                                            : 'text-slate-500 hover:text-slate-700'
                                            }`}
                                    >
                                        {radius}
                                    </button>
                                ))}
                            </div>
                            <p className="text-[10px] text-slate-500 italic">Rounding is mostly visible on 'Floating' and 'Capsule' styles.</p>
                        </div>
                    </div>

                    <div className="h-px bg-slate-100 dark:bg-slate-700 mx-auto w-1/2" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Bottom Shape */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Bottom Shape</h4>
                            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
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
                                        onClick={() => onUpdate('bottomShape', shape.id)}
                                        className={`flex flex-col items-center gap-2 p-2 rounded-xl border-2 transition-all ${navbarData?.bottomShape === shape.id
                                                ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-600'
                                                : 'border-slate-100 dark:border-slate-800 text-slate-500'
                                            }`}
                                    >
                                        <div className={`w-8 h-4 rounded-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden relative`}>
                                            {shape.id === 'wave' && <div className="absolute bottom-0 w-full h-2 bg-brand-200 rounded-t-full" />}
                                            {shape.id === 'curve' && <div className="absolute bottom-0 w-full h-2 bg-brand-200 rounded-[100%]" />}
                                            {shape.id === 'slant' && <div className="absolute bottom-0 w-full h-2 bg-brand-200 -skew-y-6 origin-bottom-left" />}
                                            {shape.id === 'notch' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-2 bg-brand-200 rounded-t-lg" />}
                                        </div>
                                        <span className="text-[9px] font-bold uppercase">{shape.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Background Pattern */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Background Pattern</h4>
                            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
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
                                        className={`flex flex-col items-center gap-2 p-2 rounded-xl border-2 transition-all ${navbarData?.backgroundPattern === pattern.id
                                                ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-600'
                                                : 'border-slate-100 dark:border-slate-800 text-slate-500'
                                            }`}
                                    >
                                        <div className={`w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden relative`}>
                                            {pattern.id === 'dots' && <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 0)', backgroundSize: '4px 4px' }} />}
                                            {pattern.id === 'mesh' && <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(45deg, #000 25%, transparent 25%), linear-gradient(-45deg, #000 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #000 75%), linear-gradient(-45deg, transparent 75%, #000 75%)', backgroundSize: '8px 8px' }} />}
                                            {pattern.id === 'grid' && <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '8px 8px' }} />}
                                            {pattern.id === 'stripes' && <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #000, #000 2px, transparent 2px, transparent 8px)' }} />}
                                        </div>
                                        <span className="text-[9px] font-bold uppercase">{pattern.label}</span>
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

export default AdvancedDesigner;
