import { motion } from "framer-motion";
import { ChevronDown, ChevronUp, Layout, Plus, Settings2, X, Palette, Move, Columns, Box, Paintbrush } from "lucide-react";
import { useState } from "react";

export default function FooterSetting({ formData, setFormData, setCollapsedFooterSections, collapsedFooterSections }: any) {
    const [showAdvanced, setShowAdvanced] = useState(false);

    const templates = [
        { id: 'classic', label: 'Classic', desc: 'Standard solid background' },
        { id: 'modern', label: 'Modern', desc: 'Dark sleek finish' },
        { id: 'elegant', label: 'Elegant', desc: 'Serif fonts & gradients' },
        { id: 'corporate', label: 'Corporate', desc: 'Clean white professional' },
        { id: 'glass', label: 'Glass', desc: 'Transparent blur effect' },
        { id: 'floating', label: 'Floating', desc: 'Floating rounded island' },
    ];

    return <motion.div
        key="footer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="space-y-8"
    >
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
                <Layout className="w-5 h-5 text-brand-600" />
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Footer Style Presets
                </h2>
            </div>
        </div>

        <p className="text-sm text-slate-500">
            Choose a professional preset to instantly transform your storefront footer.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
                {
                    id: 'modern-dark',
                    label: 'Modern Dark',
                    desc: 'Deep slate with high contrast',
                    settings: { template: 'modern', backgroundColor: '#0f172a', textColor: '#f8fafc', glassEffect: false, topShape: 'none' }
                },
                {
                    id: 'glass-luxe',
                    label: 'Glass Luxe',
                    desc: 'Frosted transparent effect',
                    settings: { template: 'glass', glassEffect: true, shadowIntensity: 'medium', topShape: 'none' }
                },
                {
                    id: 'floating-island',
                    label: 'Floating Island',
                    desc: 'Contemporary detached design',
                    settings: { template: 'floating', borderRadius: '3xl', shadowIntensity: 'strong', topShape: 'none' }
                },
                {
                    id: 'elegant-night',
                    label: 'Elegant Indigo',
                    desc: 'Sophisticated curve & serif',
                    settings: { template: 'elegant', topShape: 'curve', brandColor: '#818cf8', backgroundPattern: 'mesh' }
                },
                {
                    id: 'corporate-clean',
                    label: 'Corporate Clean',
                    desc: 'Minimalist white professional',
                    settings: { template: 'corporate', backgroundColor: '#ffffff', textColor: '#1e293b', borderColor: '#e2e8f0', topShape: 'none' }
                },
                {
                    id: 'creative-wave',
                    label: 'Creative Wave',
                    desc: 'Dynamic wave with patterns',
                    settings: { template: 'classic', topShape: 'wave', backgroundPattern: 'dots', backgroundColor: '#4f46e5', textColor: '#ffffff' }
                }
            ].map((preset) => {
                const isActive = formData.footer?.template === preset.settings.template &&
                    (preset.settings.topShape ? formData.footer?.topShape === preset.settings.topShape : true);

                return (
                    <button
                        key={preset.id}
                        type="button"
                        onClick={() => setFormData({
                            ...formData,
                            footer: {
                                ...(formData.footer || {}),
                                ...preset.settings
                            }
                        })}
                        className={`flex flex-col text-left p-4 rounded-2xl border-2 transition-all group ${isActive
                            ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-900/10 ring-2 ring-brand-500/20 shadow-lg'
                            : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-200'
                            }`}
                    >
                        <span className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-brand-600 transition-colors">{preset.label}</span>
                        <span className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">{preset.desc}</span>
                        <div className="mt-3 h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className={`h-full bg-brand-500 transition-all duration-700 ${isActive ? 'w-full' : 'w-0'}`} />
                        </div>
                    </button>
                );
            })}
        </div>

        <div className="h-px bg-slate-200 dark:bg-slate-800 my-8" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-slate-50 dark:bg-slate-900/30 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-6">
                <div className="flex items-center gap-2">
                    <Box className="w-5 h-5 text-brand-600" />
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        Template & Layout
                    </h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2 space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Base Template</label>
                        <select
                            value={formData.footer?.template || 'classic'}
                            onChange={(e) => setFormData({
                                ...formData,
                                footer: { ...(formData.footer || {}), template: e.target.value }
                            })}
                            className="w-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-brand-500 transition-all outline-none"
                        >
                            {templates.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                        </select>
                    </div>
                </div>
                <div className="grid grid-cols-4 gap-2">
                    {['1', '2', '3', '4'].map((col) => (
                        <button
                            key={col}
                            type="button"
                            onClick={() => setFormData({
                                ...formData,
                                footer: { ...(formData.footer || {}), columns: col }
                            })}
                            className={`py-2 rounded-xl border-2 transition-all text-xs font-bold ${formData.footer?.columns === col
                                ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-600'
                                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 hover:border-slate-300'
                                }`}
                        >
                            {col} Col
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/30 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-6">
                <div className="flex items-center gap-2">
                    <Move className="w-5 h-5 text-brand-600" />
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        Visibility & Depth
                    </h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <label className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-brand-300 dark:hover:border-brand-800 transition-colors">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Socials</span>
                        <input
                            type="checkbox"
                            checked={formData.footer?.showSocialLinks !== false}
                            onChange={(e) => setFormData({
                                ...formData,
                                footer: { ...(formData.footer || {}), showSocialLinks: e.target.checked }
                            })}
                            className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
                        />
                    </label>
                    <label className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-brand-300 dark:hover:border-brand-800 transition-colors">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Newsletter</span>
                        <input
                            type="checkbox"
                            checked={formData.footer?.showNewsletter !== false}
                            onChange={(e) => setFormData({
                                ...formData,
                                footer: { ...(formData.footer || {}), showNewsletter: e.target.checked }
                            })}
                            className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
                        />
                    </label>
                </div>
                <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Shadow Depth</span>
                    <div className="flex bg-slate-200 dark:bg-slate-800 p-1 rounded-xl">
                        {['none', 'subtle', 'medium', 'strong'].map((intensity) => (
                            <button
                                key={intensity}
                                type="button"
                                onClick={() => setFormData({
                                    ...formData,
                                    footer: { ...(formData.footer || {}), shadowIntensity: intensity }
                                })}
                                className={`flex-1 py-1.5 text-[9px] font-bold uppercase rounded-lg transition-all ${formData.footer?.shadowIntensity === intensity
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

        {/* Advanced Designer Section */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
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
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">Advanced Designer</h3>
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
                            <h4 className="text-xs font-black text-brand-600 dark:text-brand-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Palette className="w-4 h-4" /> Color Palette
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Background</label>
                                    <div className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                                        <input
                                            type="color"
                                            value={formData.footer?.backgroundColor || "#0f172a"}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                footer: { ...(formData.footer || {}), backgroundColor: e.target.value }
                                            })}
                                            className="w-8 h-8 rounded-lg cursor-pointer border-none p-0 bg-transparent"
                                        />
                                        <input
                                            type="text"
                                            value={formData.footer?.backgroundColor || ""}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                footer: { ...(formData.footer || {}), backgroundColor: e.target.value }
                                            })}
                                            placeholder="#HEX"
                                            className="min-w-0 flex-1 bg-transparent border-none p-0 text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Text Color</label>
                                    <div className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                                        <input
                                            type="color"
                                            value={formData.footer?.textColor || "#f8fafc"}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                footer: { ...(formData.footer || {}), textColor: e.target.value }
                                            })}
                                            className="w-8 h-8 rounded-lg cursor-pointer border-none p-0 bg-transparent"
                                        />
                                        <input
                                            type="text"
                                            value={formData.footer?.textColor || ""}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                footer: { ...(formData.footer || {}), textColor: e.target.value }
                                            })}
                                            placeholder="#HEX"
                                            className="min-w-0 flex-1 bg-transparent border-none p-0 text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Brand Highlight</label>
                                    <div className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                                        <input
                                            type="color"
                                            value={formData.footer?.brandColor || "#6366f1"}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                footer: { ...(formData.footer || {}), brandColor: e.target.value }
                                            })}
                                            className="w-8 h-8 rounded-lg cursor-pointer border-none p-0 bg-transparent"
                                        />
                                        <input
                                            type="text"
                                            value={formData.footer?.brandColor || ""}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                footer: { ...(formData.footer || {}), brandColor: e.target.value }
                                            })}
                                            placeholder="#HEX"
                                            className="min-w-0 flex-1 bg-transparent border-none p-0 text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Top Border</label>
                                    <div className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                                        <input
                                            type="color"
                                            value={formData.footer?.borderColor || "#1e293b"}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                footer: { ...(formData.footer || {}), borderColor: e.target.value }
                                            })}
                                            className="w-8 h-8 rounded-lg cursor-pointer border-none p-0 bg-transparent"
                                        />
                                        <input
                                            type="text"
                                            value={formData.footer?.borderColor || ""}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                footer: { ...(formData.footer || {}), borderColor: e.target.value }
                                            })}
                                            placeholder="#HEX"
                                            className="min-w-0 flex-1 bg-transparent border-none p-0 text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Rounding & Patterns */}
                        <div className="space-y-6">
                            <h4 className="text-xs font-black text-brand-600 dark:text-brand-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Box className="w-4 h-4" /> Radii & Transparency
                            </h4>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Corner Rounding</span>
                                    <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl border border-slate-200 dark:border-slate-800">
                                        {['none', 'md', 'xl', '3xl', 'full'].map((radius) => (
                                            <button
                                                key={radius}
                                                type="button"
                                                onClick={() => setFormData({
                                                    ...formData,
                                                    footer: { ...(formData.footer || {}), borderRadius: radius }
                                                })}
                                                className={`flex-1 py-1.5 text-[9px] font-black uppercase rounded-xl transition-all ${formData.footer?.borderRadius === radius
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
                                            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Enable blurring effects</span>
                                        </div>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={formData.footer?.glassEffect}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            footer: { ...(formData.footer || {}), glassEffect: e.target.checked }
                                        })}
                                        className="w-5 h-5 text-brand-600 rounded-lg border-slate-300 focus:ring-brand-500"
                                    />
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {/* Top Shape */}
                        <div className="space-y-6">
                            <h4 className="text-xs font-black text-brand-600 dark:text-brand-400 uppercase tracking-[0.2em] flex items-center gap-2">
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
                                        onClick={() => setFormData({
                                            ...formData,
                                            footer: { ...(formData.footer || {}), topShape: shape.id }
                                        })}
                                        className={`flex flex-col items-center gap-3 p-3 rounded-2xl border-2 transition-all ${formData.footer?.topShape === shape.id
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
                                        <span className="text-[9px] font-black uppercase tracking-tighter">{shape.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Background Pattern */}
                        <div className="space-y-6">
                            <h4 className="text-xs font-black text-brand-600 dark:text-brand-400 uppercase tracking-[0.2em] flex items-center gap-2">
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
                                        onClick={() => setFormData({
                                            ...formData,
                                            footer: { ...(formData.footer || {}), backgroundPattern: pattern.id }
                                        })}
                                        className={`flex flex-col items-center gap-3 p-3 rounded-2xl border-2 transition-all ${formData.footer?.backgroundPattern === pattern.id
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
                                        <span className="text-[9px] font-black uppercase tracking-tighter">{pattern.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>

        <div className="h-px bg-slate-200 dark:bg-slate-800 my-8" />

        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
                <Columns className="w-5 h-5 text-brand-600" />
                <h2 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                    Footer Content
                </h2>
            </div>
        </div>

        {/* General Footer Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 bg-slate-50 dark:bg-slate-900/40 rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-800/50 shadow-inner">
            <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest pl-2">
                    Visual Description
                </label>
                <textarea
                    value={formData.footer?.description || ""}
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            footer: { ...(formData.footer || {}), description: e.target.value }
                        })
                    }
                    className="w-full px-5 py-4 rounded-[1.5rem] border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none text-sm min-h-[120px] transition-all"
                    placeholder="Tell your story..."
                />
            </div>
            <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest pl-2">
                    Copyright Label
                </label>
                <input
                    type="text"
                    value={formData.footer?.copyright || ""}
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            footer: { ...(formData.footer || {}), copyright: e.target.value }
                        })
                    }
                    className="w-full px-5 py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none text-sm transition-all font-bold placeholder:font-normal"
                    placeholder="© 2026 LuxeAudio Store."
                />
                <div className="flex items-start gap-2 p-3 bg-brand-50 dark:bg-brand-900/10 rounded-xl border border-brand-100 dark:border-brand-800/50 mt-4">
                    <div className="p-1 bg-brand-500 rounded-full mt-0.5 animate-pulse"></div>
                    <p className="text-[10px] text-brand-600 dark:text-brand-400 font-bold leading-relaxed">
                        TIP: Keep the phrase "Made with Heart" in your copyright to enable the exclusive animated pulse icon for Gowtam Kumar.
                    </p>
                </div>
            </div>
        </div>

        {/* Footer Sections */}
        <div className="space-y-8 mt-12">
            <div className="flex items-center justify-between px-2">
                <div className="flex flex-col">
                    <h3 className="font-black text-slate-900 dark:text-white uppercase text-xs tracking-[0.2em]">
                        Modular Sections
                    </h3>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Manage your footer links and columns</span>
                </div>
                <button
                    type="button"
                    onClick={() => {
                        const currentSections = formData.footer?.sections || [];
                        setFormData({
                            ...formData,
                            footer: {
                                ...(formData.footer || {}),
                                sections: [
                                    ...currentSections,
                                    {
                                        title: "",
                                        order: currentSections.length,
                                        links: [],
                                    },
                                ]
                            }
                        });
                    }}
                    className="px-5 py-2.5 text-xs bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-brand-600 hover:text-white rounded-2xl font-black transition-all flex items-center gap-2 shadow-xl active:scale-95"
                >
                    <Plus className="w-4 h-4" />
                    Create New Section
                </button>
            </div>

            {
                (formData.footer?.sections || []).length === 0 ? (
                    <div className="group text-center py-20 bg-slate-50 dark:bg-slate-900/40 rounded-[3rem] border-4 border-dashed border-slate-200 dark:border-slate-800 hover:border-brand-500/30 transition-all duration-500">
                        <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl group-hover:rotate-6 transition-transform">
                            <Layout className="w-10 h-10 text-brand-500" />
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest text-sm mb-4">
                            Your footer is empty
                        </p>
                        <button
                            type="button"
                            onClick={() => {
                                setFormData({
                                    ...formData,
                                    footer: {
                                        ...(formData.footer || {}),
                                        description: "Elevating your daily experience with premium sound and state-of-the-art design.",
                                        copyright: `© ${new Date().getFullYear()} ${formData.brandName}. Made with Heart by Gowtam Kumar.`,
                                        sections: [
                                            {
                                                title: "Shop Categories",
                                                order: 0,
                                                links: [
                                                    { label: "All Products", href: "/products", order: 0, isOpenInNewTab: false, isActive: true },
                                                    { label: "Hot Releases", href: "/products?sort=newest", order: 1, isOpenInNewTab: false, isActive: true },
                                                    { label: "Flash Sales", href: "/products", order: 2, isOpenInNewTab: false, isActive: true },
                                                ],
                                            },
                                            {
                                                title: "Support",
                                                order: 1,
                                                links: [
                                                    { label: "Track Order", href: "/profile", order: 0, isOpenInNewTab: false, isActive: true },
                                                    { label: "Help Center", href: "/contact", order: 1, isOpenInNewTab: false, isActive: true },
                                                    { label: "Return Policy", href: "/privacy", order: 2, isOpenInNewTab: false, isActive: true },
                                                ],
                                            },
                                        ]
                                    }
                                });
                            }}
                            className="px-8 py-3 bg-brand-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-brand-500/30 hover:shadow-brand-500/50 hover:scale-105 active:scale-95 transition-all"
                        >
                            Smart Initialize
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {[...(formData.footer?.sections || [])]
                            .sort((a, b) => a.order - b.order)
                            .map((section, sIdx) => {
                                // Find the original index in the unsorted array
                                const originalIndex = formData.footer.sections.findIndex((s: any) => s === section);

                                return (
                                    <div
                                        key={sIdx}
                                        className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-700 relative group/section shadow-sm hover:shadow-2xl hover:border-brand-500/10 transition-all duration-500"
                                    >
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const next = formData.footer.sections.filter(
                                                    (_: any, i: number) => i !== originalIndex,
                                                );
                                                setFormData({
                                                    ...formData,
                                                    footer: { ...(formData.footer || {}), sections: next }
                                                });
                                            }}
                                            className="absolute -top-3 -right-3 p-2.5 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 text-red-500 rounded-2xl opacity-0 group-hover/section:opacity-100 transition-all shadow-xl z-20 hover:bg-red-50 dark:hover:bg-red-900/20 active:scale-90"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>

                                        <div className="flex items-center gap-4">
                                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 flex-1">
                                                <div className="md:col-span-8 space-y-2">
                                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-2">
                                                        Header
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={section.title}
                                                        onChange={(e) => {
                                                            const next = [...formData.footer.sections];
                                                            next[originalIndex].title = e.target.value;
                                                            setFormData({
                                                                ...formData,
                                                                footer: { ...(formData.footer || {}), sections: next }
                                                            });
                                                        }}
                                                        placeholder="Section Name"
                                                        className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-2xl px-5 py-3 text-sm font-bold focus:border-brand-500 focus:bg-white transition-all outline-none"
                                                    />
                                                </div>
                                                <div className="md:col-span-4 space-y-2">
                                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-2">
                                                        Rank
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={section.order}
                                                        onChange={(e) => {
                                                            const next = [...formData.footer.sections];
                                                            next[originalIndex].order = parseInt(e.target.value) || 0;
                                                            setFormData({
                                                                ...formData,
                                                                footer: { ...(formData.footer || {}), sections: next }
                                                            });
                                                        }}
                                                        className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-2xl px-5 py-3 text-sm font-black focus:border-brand-500 focus:bg-white transition-all outline-none"
                                                    />
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newCollapsed = new Set(collapsedFooterSections);
                                                    if (newCollapsed.has(originalIndex)) {
                                                        newCollapsed.delete(originalIndex);
                                                    } else {
                                                        newCollapsed.add(originalIndex);
                                                    }
                                                    setCollapsedFooterSections(newCollapsed);
                                                }}
                                                className={`p-3 rounded-2xl mt-6 transition-all ${collapsedFooterSections.has(originalIndex) ? 'bg-slate-100 dark:bg-slate-900' : 'bg-brand-500 text-white shadow-lg shadow-brand-500/20'}`}
                                            >
                                                {collapsedFooterSections.has(originalIndex) ? (
                                                    <ChevronDown className="w-5 h-5" />
                                                ) : (
                                                    <ChevronUp className="w-5 h-5" />
                                                )}
                                            </button>
                                        </div>

                                        {/* Nested Links */}
                                        {!collapsedFooterSections.has(originalIndex) && (
                                            <div className="space-y-6 pt-8 mt-8 border-t-2 border-slate-50 dark:border-slate-900/50">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-1 h-3 bg-brand-500 rounded-full"></div>
                                                        <span className="text-[11px] font-black uppercase text-slate-500 tracking-[0.2em]">
                                                            Managed Links
                                                        </span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const next = [...formData.footer.sections];
                                                            next[originalIndex].links.push({
                                                                label: "",
                                                                href: "",
                                                                order: next[originalIndex].links.length,
                                                                isOpenInNewTab: false,
                                                                isActive: true,
                                                            });
                                                            setFormData({
                                                                ...formData,
                                                                footer: { ...(formData.footer || {}), sections: next }
                                                            });
                                                        }}
                                                        className="px-4 py-2 bg-brand-50 dark:bg-brand-900/10 text-brand-600 dark:text-brand-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-600 hover:text-white transition-all flex items-center gap-2"
                                                    >
                                                        <Plus className="w-3.5 h-3.5" /> New Item
                                                    </button>
                                                </div>

                                                <div className="grid gap-3">
                                                    {(section.links || [])
                                                        .sort((a: any, b: any) => a.order - b.order)
                                                        .map((link: any, lIdx: number) => {
                                                            const originalLinkIndex = section.links.findIndex((l: any) => l === link);

                                                            return (
                                                                <div
                                                                    key={lIdx}
                                                                    className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-slate-50 dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 group/link relative transition-all hover:bg-white dark:hover:bg-slate-900 hover:shadow-xl hover:scale-[1.01]"
                                                                >
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            const next = [...formData.footer.sections];
                                                                            next[originalIndex].links = next[originalIndex].links.filter(
                                                                                (_: any, i: number) => i !== originalLinkIndex,
                                                                            );
                                                                            setFormData({
                                                                                ...formData,
                                                                                footer: { ...(formData.footer || {}), sections: next }
                                                                            });
                                                                        }}
                                                                        className="absolute -top-1.5 -right-1.5 p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-red-500 rounded-full opacity-0 group-hover/link:opacity-100 transition-all z-10 shadow-lg hover:bg-red-500 hover:text-white active:scale-90"
                                                                    >
                                                                        <X className="w-3.5 h-3.5" />
                                                                    </button>
                                                                    <div className="md:col-span-4 flex flex-col gap-1.5">
                                                                        <span className="text-[8px] font-black uppercase text-slate-400 tracking-tighter pl-1">Label</span>
                                                                        <input
                                                                            type="text"
                                                                            value={link.label}
                                                                            onChange={(e) => {
                                                                                const next = [...formData.footer.sections];
                                                                                next[originalIndex].links[originalLinkIndex].label = e.target.value;
                                                                                setFormData({
                                                                                    ...formData,
                                                                                    footer: { ...(formData.footer || {}), sections: next }
                                                                                });
                                                                            }}
                                                                            placeholder="e.g Home"
                                                                            className="w-full bg-white dark:bg-slate-800 border-2 border-transparent focus:border-brand-500/30 rounded-xl px-3 py-2 text-xs font-bold outline-none shadow-sm"
                                                                        />
                                                                    </div>
                                                                    <div className="md:col-span-4 flex flex-col gap-1.5">
                                                                        <span className="text-[8px] font-black uppercase text-slate-400 tracking-tighter pl-1">Target Path</span>
                                                                        <input
                                                                            type="text"
                                                                            value={link.href}
                                                                            onChange={(e) => {
                                                                                const next = [...formData.footer.sections];
                                                                                next[originalIndex].links[originalLinkIndex].href = e.target.value;
                                                                                setFormData({
                                                                                    ...formData,
                                                                                    footer: { ...(formData.footer || {}), sections: next }
                                                                                });
                                                                            }}
                                                                            placeholder="/"
                                                                            className="w-full bg-white dark:bg-slate-800 border-2 border-transparent focus:border-brand-500/30 rounded-xl px-3 py-2 text-xs font-bold outline-none shadow-sm"
                                                                        />
                                                                    </div>
                                                                    <div className="md:col-span-2 flex flex-col gap-1.5">
                                                                        <span className="text-[8px] font-black uppercase text-slate-400 tracking-tighter pl-1">Seq</span>
                                                                        <input
                                                                            type="number"
                                                                            value={link.order}
                                                                            onChange={(e) => {
                                                                                const next = [...formData.footer.sections];
                                                                                next[originalIndex].links[originalLinkIndex].order = parseInt(e.target.value) || 0;
                                                                                setFormData({
                                                                                    ...formData,
                                                                                    footer: { ...(formData.footer || {}), sections: next }
                                                                                });
                                                                            }}
                                                                            className="w-full bg-white dark:bg-slate-800 border-2 border-transparent focus:border-brand-500/30 rounded-xl px-3 py-2 text-xs font-black outline-none shadow-sm"
                                                                        />
                                                                    </div>
                                                                    <div className="md:col-span-2 flex items-center justify-around gap-2 pt-4">
                                                                        <div className="flex flex-col items-center gap-1.5">
                                                                            <span className="text-[7px] font-black text-slate-400 uppercase">Window</span>
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={link.isOpenInNewTab}
                                                                                onChange={(e) => {
                                                                                    const next = [...formData.footer.sections];
                                                                                    next[originalIndex].links[originalLinkIndex].isOpenInNewTab = e.target.checked;
                                                                                    setFormData({
                                                                                        ...formData,
                                                                                        footer: { ...(formData.footer || {}), sections: next }
                                                                                    });
                                                                                }}
                                                                                className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500 transition-all cursor-pointer"
                                                                            />
                                                                        </div>
                                                                        <div className="flex flex-col items-center gap-1.5">
                                                                            <span className="text-[7px] font-black text-slate-400 uppercase">Status</span>
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={link.isActive !== false}
                                                                                onChange={(e) => {
                                                                                    const next = [...formData.footer.sections];
                                                                                    next[originalIndex].links[originalLinkIndex].isActive = e.target.checked;
                                                                                    setFormData({
                                                                                        ...formData,
                                                                                        footer: { ...(formData.footer || {}), sections: next }
                                                                                    });
                                                                                }}
                                                                                className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500 transition-all cursor-pointer"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                    </div>
                )
            }
        </div>
    </motion.div>;
}