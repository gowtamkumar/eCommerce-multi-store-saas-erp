import { motion } from "framer-motion";
import { ChevronDown, Layout, Menu, Move, Palette, Plus, Search, Settings2, X } from "lucide-react";
import { useState } from "react";

export default function NavbarSetting({
    formData,
    setFormData,
}: {
    formData: any;
    setFormData: any;
}) {
    const [showAdvanced, setShowAdvanced] = useState(false);

    return <motion.div
        key="navbar"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="space-y-6"
    >
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <Layout className="w-5 h-5 text-brand-600" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Navbar Presets
                </h3>
            </div>
            <p className="text-sm text-slate-500">
                Choose a pre-designed navbar style to instantly update your store's header.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                    {
                        id: 'modern-digital',
                        label: 'Modern Digital',
                        desc: 'Glass effect with default layout',
                        settings: { layout: 'default', template: 'glass', sticky: true }
                    },
                    {
                        id: 'elegant-boutique',
                        label: 'Elegant Boutique',
                        desc: 'Centered logo with classic feel',
                        settings: { layout: 'centered', template: 'classic', sticky: true }
                    },
                    {
                        id: 'minimalist-store',
                        label: 'Minimalist Store',
                        desc: 'Clean minimal layout',
                        settings: { layout: 'minimal', template: 'classic', sticky: true }
                    },
                    {
                        id: 'creative-floating',
                        label: 'Creative Floating',
                        desc: 'Detached floating header',
                        settings: { layout: 'centered', template: 'floating', sticky: true }
                    },
                    {
                        id: 'bold-identity',
                        label: 'Bold Identity',
                        desc: 'Full-width gradient style',
                        settings: { layout: 'default', template: 'gradient', sticky: true }
                    }
                ].map((preset) => {
                    const isActive = formData.navbar?.layout === preset.settings.layout &&
                        formData.navbar?.template === preset.settings.template;

                    return (
                        <button
                            key={preset.id}
                            type="button"
                            onClick={() => setFormData({
                                ...formData,
                                navbar: {
                                    ...(formData.navbar || {}),
                                    ...preset.settings
                                }
                            })}
                            className={`flex flex-col text-left p-4 rounded-2xl border-2 transition-all ${isActive
                                ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-900/10 ring-2 ring-brand-500/20'
                                : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-200'
                                }`}
                        >
                            <span className="text-sm font-bold text-slate-900 dark:text-white">{preset.label}</span>
                            <span className="text-xs text-slate-500 mt-1">{preset.desc}</span>
                            <div className="mt-3 h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className={`h-full bg-brand-500 transition-all duration-500 ${isActive ? 'w-full' : 'w-0'}`} />
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>

        <div className="h-px bg-slate-200 dark:bg-slate-800 my-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-900/30 p-6 rounded-3xl border border-slate-100 dark:border-slate-800">
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <Layout className="w-5 h-5 text-brand-600" />
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        Layout Style
                    </h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    {[
                        { id: 'default', label: 'Default' },
                        { id: 'centered', label: 'Centered' },
                        { id: 'minimal', label: 'Minimal' }
                    ].map((layout) => (
                        <button
                            key={layout.id}
                            type="button"
                            onClick={() => setFormData({
                                ...formData,
                                navbar: { ...(formData.navbar || {}), layout: layout.id }
                            })}
                            className={`px-4 py-3 rounded-xl border-2 transition-all text-sm font-bold ${formData.navbar?.layout === layout.id
                                ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-600'
                                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 hover:border-slate-300'
                                }`}
                        >
                            {layout.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <Move className="w-5 h-5 text-brand-600" />
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        Configuration
                    </h3>
                </div>
                <label className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer group">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Sticky Navbar</span>
                    <input
                        type="checkbox"
                        checked={formData.navbar?.sticky !== false}
                        onChange={(e) => setFormData({
                            ...formData,
                            navbar: { ...(formData.navbar || {}), sticky: e.target.checked }
                        })}
                        className="w-5 h-5 text-brand-600 rounded-lg border-slate-300 focus:ring-brand-500"
                    />
                </label>
                <label className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer group">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Transparent on Hero</span>
                    <input
                        type="checkbox"
                        checked={formData.navbar?.transparent}
                        onChange={(e) => setFormData({
                            ...formData,
                            navbar: { ...(formData.navbar || {}), transparent: e.target.checked }
                        })}
                        className="w-5 h-5 text-brand-600 rounded-lg border-slate-300 focus:ring-brand-500"
                    />
                </label>
                <label className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer group">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Show Currency Switcher</span>
                    <input
                        type="checkbox"
                        checked={formData.navbar?.showCurrency !== false}
                        onChange={(e) => setFormData({
                            ...formData,
                            navbar: { ...(formData.navbar || {}), showCurrency: e.target.checked }
                        })}
                        className="w-5 h-5 text-brand-600 rounded-lg border-slate-300 focus:ring-brand-500"
                    />
                </label>
                <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Container Width</span>
                    <select
                        value={formData.navbar?.maxWidth || 'standard'}
                        onChange={(e) => setFormData({
                            ...formData,
                            navbar: { ...(formData.navbar || {}), maxWidth: e.target.value }
                        })}
                        className="bg-slate-100 dark:bg-slate-900 border-none text-xs font-bold rounded-lg px-2 py-1 outline-none"
                    >
                        <option value="standard">Standard</option>
                        <option value="full">Full Width</option>
                    </select>
                </div>
            </div>
        </div>

        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-brand-600" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Design Template
                </h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { id: 'classic', label: 'Classic', desc: 'Solid & Professional', preview: 'bg-white border-b' },
                    { id: 'glass', label: 'Glassmorphism', desc: 'Modern & Blurred', preview: 'bg-white/40 backdrop-blur-md' },
                    { id: 'floating', label: 'Floating', desc: 'Creative & Detached', preview: 'bg-white shadow-xl rounded-2xl mx-2' },
                    { id: 'gradient', label: 'Modern Gradient', desc: 'Vibrant & Bold', preview: 'bg-gradient-to-r from-brand-600 to-brand-400' }
                ].map((item) => (
                    <button
                        key={item.id}
                        type="button"
                        onClick={() => setFormData({
                            ...formData,
                            navbar: { ...(formData.navbar || {}), template: item.id }
                        })}
                        className={`flex flex-col gap-3 p-3 rounded-2xl border-2 transition-all group ${formData.navbar?.template === item.id
                            ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-900/10'
                            : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-200'
                            }`}
                    >
                        <div className={`w-full h-16 rounded-xl overflow-hidden relative border border-slate-100 dark:border-slate-800 ${item.id === 'gradient' ? item.preview : 'bg-slate-100 dark:bg-slate-800'}`}>
                            {item.id !== 'gradient' && (
                                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-6 border transition-all ${item.preview} ${formData.navbar?.template === item.id ? 'border-brand-200' : 'border-slate-200 dark:border-slate-700'}`}></div>
                            )}
                            {item.id === 'gradient' && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-12 h-1 bg-white/40 rounded-full"></div>
                                </div>
                            )}
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-bold text-slate-900 dark:text-white">{item.label}</p>
                            <p className="text-[10px] text-slate-500">{item.desc}</p>
                        </div>
                    </button>
                ))}
            </div>
        </div>

        <div className="h-px bg-slate-200 dark:bg-slate-800 my-8" />

        {/* Advanced Designer Section */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden mb-8">
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
                <div className="p-6 pt-0 space-y-8 border-t border-slate-100 dark:border-slate-700">
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
                                            value={formData.navbar?.backgroundColor || "#ffffff"}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                navbar: { ...(formData.navbar || {}), backgroundColor: e.target.value }
                                            })}
                                            className="w-10 h-10 rounded-lg cursor-pointer border-none p-0"
                                        />
                                        <input
                                            type="text"
                                            value={formData.navbar?.backgroundColor || ""}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                navbar: { ...(formData.navbar || {}), backgroundColor: e.target.value }
                                            })}
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
                                            value={formData.navbar?.textColor || "#000000"}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                navbar: { ...(formData.navbar || {}), textColor: e.target.value }
                                            })}
                                            className="w-10 h-10 rounded-lg cursor-pointer border-none p-0"
                                        />
                                        <input
                                            type="text"
                                            value={formData.navbar?.textColor || ""}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                navbar: { ...(formData.navbar || {}), textColor: e.target.value }
                                            })}
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
                                        onClick={() => setFormData({
                                            ...formData,
                                            navbar: { ...(formData.navbar || {}), shadowIntensity: intensity }
                                        })}
                                        className={`flex-1 py-2 text-[10px] font-bold uppercase rounded-lg transition-all ${formData.navbar?.shadowIntensity === intensity
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
                                        onClick={() => setFormData({
                                            ...formData,
                                            navbar: { ...(formData.navbar || {}), hoverEffect: effect.id }
                                        })}
                                        className={`py-3 rounded-xl border-2 text-[10px] font-bold uppercase transition-all ${formData.navbar?.hoverEffect === effect.id
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
                                        onClick={() => setFormData({
                                            ...formData,
                                            navbar: { ...(formData.navbar || {}), borderRadius: radius }
                                        })}
                                        className={`flex-1 py-2 text-[10px] font-bold uppercase rounded-lg transition-all ${formData.navbar?.borderRadius === radius
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
                                        onClick={() => setFormData({
                                            ...formData,
                                            navbar: { ...(formData.navbar || {}), bottomShape: shape.id }
                                        })}
                                        className={`flex flex-col items-center gap-2 p-2 rounded-xl border-2 transition-all ${formData.navbar?.bottomShape === shape.id
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
                                        onClick={() => setFormData({
                                            ...formData,
                                            navbar: { ...(formData.navbar || {}), backgroundPattern: pattern.id }
                                        })}
                                        className={`flex flex-col items-center gap-2 p-2 rounded-xl border-2 transition-all ${formData.navbar?.backgroundPattern === pattern.id
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

        <div className="h-px bg-slate-200 dark:bg-slate-800 my-8" />

        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
                <Menu className="w-5 h-5 text-brand-600" />
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Navbar Menu
                </h2>
            </div>
            <button
                type="button"
                onClick={() => {
                    const currentLinks = formData.navbar?.links || [];
                    setFormData({
                        ...formData,
                        navbar: {
                            ...(formData.navbar || {}),
                            links: [
                                ...currentLinks,
                                {
                                    label: "",
                                    href: "",
                                    order: currentLinks.length,
                                    isOpenInNewTab: false,
                                    isActive: true,
                                },
                            ],
                        }
                    });
                }}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-brand-500/20 flex items-center gap-2"
            >
                <Plus className="w-4 h-4" />
                Add Link
            </button>
        </div>

        <p className="text-sm text-slate-500 mb-6">
            Manage the main navigation links of your store. Leave
            empty to use default links (Home, Shop, Contact).
        </p>

        <div className="space-y-4">
            {(formData.navbar?.links || []).length === 0 ? (
                <div className="text-center py-12 bg-slate-50 dark:bg-slate-900/40 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
                    <Menu className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">
                        No custom links yet
                    </p>
                    <button
                        type="button"
                        onClick={() => {
                            setFormData({
                                ...formData,
                                navbar: {
                                    ...(formData.navbar || {}),
                                    links: [
                                        {
                                            label: "Home",
                                            href: "/",
                                            order: 0,
                                            isOpenInNewTab: false,
                                            isActive: true,
                                        },
                                        {
                                            label: "Shop",
                                            href: "/products",
                                            order: 1,
                                            isOpenInNewTab: false,
                                            isActive: true,
                                        },
                                        {
                                            label: "Contact",
                                            href: "/contact",
                                            order: 2,
                                            isOpenInNewTab: false,
                                            isActive: true,
                                        },
                                    ],
                                }
                            });
                        }}
                        className="mt-4 text-brand-600 font-bold hover:underline"
                    >
                        Initialize with defaults
                    </button>
                </div>
            ) : (
                <div className="grid gap-4">
                    {[...(formData.navbar?.links || [])]
                        .sort((a, b) => (a.order || 0) - (b.order || 0))
                        .map((link, index) => (
                            <div
                                key={index}
                                className="bg-slate-50 dark:bg-slate-900/30 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 group relative transition-all"
                            >
                                <button
                                    type="button"
                                    onClick={() => {
                                        const next = (formData.navbar?.links || []).filter(
                                            (_: any, i: number) => i !== index,
                                        );
                                        setFormData({
                                            ...formData,
                                            navbar: {
                                                ...(formData.navbar || {}),
                                                links: next
                                            }
                                        });
                                    }}
                                    className="absolute -top-2 -right-2 p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-10"
                                >
                                    <X className="w-4 h-4" />
                                </button>

                                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                                    <div className="md:col-span-4 space-y-1">
                                        <label className="text-[10px] font-bold uppercase text-slate-400">
                                            Label
                                        </label>
                                        <input
                                            type="text"
                                            value={link.label}
                                            onChange={(e) => {
                                                const next = [...(formData.navbar?.links || [])];
                                                next[index].label = e.target.value;
                                                setFormData({
                                                    ...formData,
                                                    navbar: {
                                                        ...(formData.navbar || {}),
                                                        links: next
                                                    }
                                                });
                                            }}
                                            placeholder="e.g. Products"
                                            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all duration-200"
                                        />
                                    </div>
                                    <div className="md:col-span-4 space-y-1">
                                        <label className="text-[10px] font-bold uppercase text-slate-400">
                                            URL / Path
                                        </label>
                                        <input
                                            type="text"
                                            value={link.href}
                                            onChange={(e) => {
                                                const next = [...(formData.navbar?.links || [])];
                                                next[index].href = e.target.value;
                                                setFormData({
                                                    ...formData,
                                                    navbar: {
                                                        ...(formData.navbar || {}),
                                                        links: next
                                                    }
                                                });
                                            }}
                                            placeholder="e.g. /products"
                                            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all duration-200"
                                        />
                                    </div>
                                    <div className="md:col-span-2 space-y-1">
                                        <label className="text-[10px] font-bold uppercase text-slate-400">
                                            Order
                                        </label>
                                        <input
                                            type="number"
                                            value={link.order}
                                            onChange={(e) => {
                                                const next = [...(formData.navbar?.links || [])];
                                                next[index].order =
                                                    parseInt(e.target.value) || 0;
                                                setFormData({
                                                    ...formData,
                                                    navbar: {
                                                        ...(formData.navbar || {}),
                                                        links: next
                                                    }
                                                });
                                            }}
                                            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all duration-200"
                                        />
                                    </div>
                                    <div className="md:col-span-2 flex items-center justify-around pb-2">
                                        <div className="flex flex-col items-center gap-1">
                                            <span className="text-[10px] font-bold uppercase text-slate-400">
                                                New Tab
                                            </span>
                                            <input
                                                type="checkbox"
                                                checked={link.isOpenInNewTab}
                                                onChange={(e) => {
                                                    const next = [...(formData.navbar?.links || [])];
                                                    next[index].isOpenInNewTab =
                                                        e.target.checked;
                                                    setFormData({
                                                        ...formData,
                                                        navbar: {
                                                            ...(formData.navbar || {}),
                                                            links: next
                                                        }
                                                    });
                                                }}
                                                className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500"
                                            />
                                        </div>
                                        <div className="flex flex-col items-center gap-1">
                                            <span className="text-[10px] font-bold uppercase text-slate-400">
                                                Active
                                            </span>
                                            <input
                                                type="checkbox"
                                                checked={link.isActive !== false}
                                                onChange={(e) => {
                                                    const next = [...(formData.navbar?.links || [])];
                                                    next[index].isActive =
                                                        e.target.checked;
                                                    setFormData({
                                                        ...formData,
                                                        navbar: {
                                                            ...(formData.navbar || {}),
                                                            links: next
                                                        }
                                                    });
                                                }}
                                                className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                </div>
            )}
        </div>
    </motion.div>
}