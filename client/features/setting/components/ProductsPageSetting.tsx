import { motion } from "framer-motion";
import { Layout, Image as ImageIcon, Eye, EyeOff, Search, Tags, Filter, SlidersHorizontal, Grid3X3 } from "lucide-react";

export default function ProductsPageSetting({ formData, setFormData }: { formData: any, setFormData: any }) {
    const productsPage = formData.productsPage || {};

    const handleChange = (field: string, value: any) => {
        setFormData({
            ...formData,
            productsPage: {
                ...productsPage,
                [field]: value
            }
        });
    };

    const Toggle = ({ enabled, onChange, label, icon: Icon }: any) => (
        <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${enabled ? 'bg-brand-100 text-brand-600' : 'bg-slate-100 text-slate-400'} transition-colors`}>
                    <Icon className="w-5 h-5" />
                </div>
                <span className="font-bold text-slate-700 dark:text-slate-200 text-sm">{label}</span>
            </div>
            <button
                type="button"
                onClick={() => onChange(!enabled)}
                className={`w-12 h-6 rounded-full transition-all duration-300 relative ${enabled ? 'bg-brand-500' : 'bg-slate-300 dark:bg-slate-700'}`}
            >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 shadow-sm ${enabled ? 'left-7' : 'left-1'}`} />
            </button>
        </div>
    );

    return (
        <motion.div
            key="productsPage"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-10 py-4"
        >
            <div className="space-y-2">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                    <Layout className="w-6 h-6 text-brand-600" />
                    Products Archive Customization
                </h2>
                <p className="text-slate-500 text-sm">Fine-tune how your products catalog page looks and behaves for customers.</p>
            </div>

            {/* Banner Customization */}
            <div className="bg-slate-50 dark:bg-slate-800/40 rounded-[2.5rem] p-8 space-y-8 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm">
                            <ImageIcon className="w-5 h-5 text-brand-500" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Page Banner</h3>
                    </div>
                    <button
                        type="button"
                        onClick={() => handleChange('bannerShow', !productsPage.bannerShow)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-bold text-xs transition-all ${productsPage.bannerShow
                            ? 'bg-brand-50 border-brand-200 text-brand-600'
                            : 'bg-white border-slate-200 text-slate-400'
                            }`}
                    >
                        {productsPage.bannerShow ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        {productsPage.bannerShow ? 'Banner Visible' : 'Banner Hidden'}
                    </button>
                </div>

                {productsPage.bannerShow && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                        <div className="space-y-4 md:col-span-2">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Banner Layout</label>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => handleChange('bannerFullWidth', false)}
                                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${!productsPage.bannerFullWidth ? 'border-brand-500 bg-brand-50/50 text-brand-600' : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500'}`}
                                >
                                    <div className="w-12 h-8 bg-slate-200 dark:bg-slate-700 rounded p-1">
                                        <div className="w-2/3 h-full bg-brand-400/30 mx-auto rounded-sm" />
                                    </div>
                                    <span className="text-xs font-bold">Contained</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleChange('bannerFullWidth', true)}
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
                            <input
                                type="text"
                                value={productsPage.bannerHeadline || ''}
                                onChange={(e) => handleChange('bannerHeadline', e.target.value)}
                                placeholder="e.g., Explore Our Collection"
                                className="w-full px-5 py-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-sm font-bold focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Tagline</label>
                            <input
                                type="text"
                                value={productsPage.bannerTagline || ''}
                                onChange={(e) => handleChange('bannerTagline', e.target.value)}
                                placeholder="e.g., Quality you can trust"
                                className="w-full px-5 py-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-sm font-bold focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Sub-headline / Description</label>
                            <textarea
                                value={productsPage.bannerSubheadline || ''}
                                onChange={(e) => handleChange('bannerSubheadline', e.target.value)}
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
                                    <input
                                        type="text"
                                        value={productsPage.bannerImage || ''}
                                        onChange={(e) => handleChange('bannerImage', e.target.value)}
                                        placeholder="Paste image URL here"
                                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-transparent focus:bg-white dark:focus:bg-slate-900 border-2 focus:border-brand-500 outline-none transition-all text-xs"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Background Color</label>
                                    <div className="flex gap-3">
                                        <input
                                            type="color"
                                            value={productsPage.bannerBackgroundColor || '#f8fafc'}
                                            onChange={(e) => handleChange('bannerBackgroundColor', e.target.value)}
                                            className="w-14 h-14 rounded-xl border-none cursor-pointer bg-transparent"
                                        />
                                        <input
                                            type="text"
                                            value={productsPage.bannerBackgroundColor || ''}
                                            onChange={(e) => handleChange('bannerBackgroundColor', e.target.value)}
                                            placeholder="#HEX value"
                                            className="flex-1 px-5 py-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-transparent focus:bg-white dark:focus:bg-slate-900 border-2 focus:border-brand-500 outline-none transition-all text-xs"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Text Color</label>
                                    <div className="flex gap-3">
                                        <input
                                            type="color"
                                            value={productsPage.bannerTextColor || '#0f172a'}
                                            onChange={(e) => handleChange('bannerTextColor', e.target.value)}
                                            className="w-14 h-14 rounded-xl border-none cursor-pointer bg-transparent"
                                        />
                                        <input
                                            type="text"
                                            value={productsPage.bannerTextColor || ''}
                                            onChange={(e) => handleChange('bannerTextColor', e.target.value)}
                                            placeholder="#HEX value"
                                            className="flex-1 px-5 py-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-transparent focus:bg-white dark:focus:bg-slate-900 border-2 focus:border-brand-500 outline-none transition-all text-xs"
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
                                        onChange={(e) => handleChange('bannerOverlayOpacity', parseInt(e.target.value))}
                                        className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-500"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Banner Style Preset</label>
                            <select
                                value={productsPage.bannerStyle || 'modern'}
                                onChange={(e) => handleChange('bannerStyle', e.target.value)}
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

            {/* Archive Layout Controls */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-slate-50 dark:bg-slate-800/40 rounded-[2.5rem] p-8 space-y-6 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm">
                            <Grid3X3 className="w-5 h-5 text-brand-500" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Grid Density</h3>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                            <span>Comfortable</span>
                            <span className="bg-brand-600 text-white px-3 py-1 rounded-full text-[12px]">{productsPage.productsPerRow || 4} Columns</span>
                            <span>Compact</span>
                        </div>
                        <input
                            type="range"
                            min="2"
                            max="6"
                            step="1"
                            value={productsPage.productsPerRow || 4}
                            onChange={(e) => handleChange('productsPerRow', parseInt(e.target.value))}
                            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-500"
                        />
                        <p className="text-xs text-slate-500 italic">Determines how many products are shown per row on desktop screens.</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <Toggle 
                        enabled={productsPage.showSearch} 
                        onChange={(v: boolean) => handleChange('showSearch', v)} 
                        label="Product Search Bar" 
                        icon={Search} 
                    />
                    <Toggle 
                        enabled={productsPage.showCategories} 
                        onChange={(v: boolean) => handleChange('showCategories', v)} 
                        label="Categories Filter" 
                        icon={Tags} 
                    />
                    <Toggle 
                        enabled={productsPage.showBrands} 
                        onChange={(v: boolean) => handleChange('showBrands', v)} 
                        label="Brands Filter" 
                        icon={Filter} 
                    />
                    <Toggle 
                        enabled={productsPage.showPriceFilter} 
                        onChange={(v: boolean) => handleChange('showPriceFilter', v)} 
                        label="Price Range Filter" 
                        icon={SlidersHorizontal} 
                    />
                </div>
            </div>

            <div className="p-6 bg-brand-50/50 dark:bg-brand-900/10 rounded-3xl border border-brand-100 dark:border-brand-900/20">
                <p className="text-xs text-brand-700 dark:text-brand-300 font-medium italic">
                    💡 <strong>Pro Tip:</strong> Use the "Minimalist Clean" banner style if you have vibrant product photos to let the merchandise stand out.
                </p>
            </div>
        </motion.div>
    );
}
