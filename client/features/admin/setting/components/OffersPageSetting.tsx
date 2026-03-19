import { Layout, ToggleLeft, ToggleRight, Tag, Image, Type, Grid } from "lucide-react";

interface OffersPageSettingProps {
    formData: any;
    setFormData: (data: any) => void;
}

const OffersPageSetting = ({ formData, setFormData }: OffersPageSettingProps) => {
    const offersPage = formData.offersPage || {};

    const handleChange = (field: string, value: any) => {
        setFormData({
            ...formData,
            offersPage: {
                ...formData.offersPage,
                [field]: value,
            },
        });
    };

    const toggles = [
        {
            key: "bannerShow",
            title: "Show Hero Banner",
            description: "Display the promotional hero banner at the top of the offers page.",
            icon: <Image className="w-5 h-5" />
        },
        {
            key: "showFilters",
            title: "Show Promotion Filters",
            description: "Allow users to filter products by specific promotional offers.",
            icon: <Tag className="w-5 h-5" />
        }
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div>
                <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center mb-4 border border-brand-100 dark:border-brand-800">
                    <Tag className="w-6 h-6 text-brand-600 dark:text-brand-400" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
                    Offers Page Customization
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm max-w-2xl">
                    Configure how your promotional offers are presented. Control banner content, filter visibility, and product grid density.
                </p>
            </div>

            {/* Visibility Toggles */}
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-3xl p-6 md:p-8 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3 mb-6">
                    <Layout className="w-5 h-5 text-slate-400" />
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white">Page Visibility</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {toggles.map((toggle) => {
                        const isEnabled = offersPage[toggle.key] !== false;
                        return (
                            <div
                                key={toggle.key}
                                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-4 ${isEnabled ? 'border-brand-500 bg-brand-50/50 text-brand-900 dark:text-white dark:bg-brand-900/10' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 opacity-60 hover:opacity-100'}`}
                                onClick={() => handleChange(toggle.key, !isEnabled)}
                            >
                                <div className={`p-2 rounded-xl mt-0.5 ${isEnabled ? 'bg-brand-100 dark:bg-brand-800 text-brand-600 dark:text-brand-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                                    {toggle.icon}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <h5 className="font-bold text-sm">{toggle.title}</h5>
                                        {isEnabled ? (
                                            <ToggleRight className="w-6 h-6 text-brand-500" />
                                        ) : (
                                            <ToggleLeft className="w-6 h-6 text-slate-400" />
                                        )}
                                    </div>
                                    <p className={`text-xs ${isEnabled ? 'text-brand-700/70 dark:text-brand-300/70' : 'text-slate-500'}`}>
                                        {toggle.description}
                                    </p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Banner Content & Styling */}
            <div className={`bg-slate-50 dark:bg-slate-900/50 rounded-3xl p-6 md:p-8 border border-slate-100 dark:border-slate-800 transition-all ${offersPage.bannerShow === false ? 'opacity-40 grayscale pointer-events-none scale-[0.98]' : ''}`}>
                <div className="flex items-center gap-3 mb-6">
                    <Type className="w-5 h-5 text-slate-400" />
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white">Banner Content & Styling</h4>
                </div>
                
                <div className="space-y-8">
                    {/* Basic Content */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                Banner Headline
                            </label>
                            <input
                                type="text"
                                value={offersPage.bannerHeadline || ""}
                                onChange={(e) => handleChange('bannerHeadline', e.target.value)}
                                placeholder="e.g. 🔥 Special Deals & Offers"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                Banner Subheadline
                            </label>
                            <input
                                type="text"
                                value={offersPage.bannerSubheadline || ""}
                                onChange={(e) => handleChange('bannerSubheadline', e.target.value)}
                                placeholder="e.g. Save big on our hottest promotions..."
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Image & Background */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                Banner Image URL
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={offersPage.bannerImage || ""}
                                    onChange={(e) => handleChange('bannerImage', e.target.value)}
                                    placeholder="https://example.com/image.jpg"
                                    className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                                />
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1 italic">Leave empty to use default gradient background.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    BG Color
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={offersPage.bannerBackgroundColor || "#0f172a"}
                                        onChange={(e) => handleChange('bannerBackgroundColor', e.target.value)}
                                        className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-none"
                                    />
                                    <input
                                        type="text"
                                        value={offersPage.bannerBackgroundColor || ""}
                                        onChange={(e) => handleChange('bannerBackgroundColor', e.target.value)}
                                        placeholder="#0f172a"
                                        className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    Text Color
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={offersPage.bannerTextColor || "#ffffff"}
                                        onChange={(e) => handleChange('bannerTextColor', e.target.value)}
                                        className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-none"
                                    />
                                    <input
                                        type="text"
                                        value={offersPage.bannerTextColor || ""}
                                        onChange={(e) => handleChange('bannerTextColor', e.target.value)}
                                        placeholder="#ffffff"
                                        className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Dimensions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Banner Height</label>
                                <span className="px-3 py-1 bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 font-bold rounded-lg text-sm">
                                    {offersPage.bannerHeight || 400}px
                                </span>
                            </div>
                            <input
                                type="range"
                                min="200"
                                max="800"
                                step="50"
                                value={offersPage.bannerHeight || 400}
                                onChange={(e) => handleChange('bannerHeight', parseInt(e.target.value))}
                                className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-600"
                            />
                            <div className="flex justify-between text-[10px] font-medium text-slate-400 mt-2">
                                <span>Short (200px)</span>
                                <span>Tall (800px)</span>
                            </div>
                        </div>

                        <div 
                            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-4 ${offersPage.bannerFullWidth ? 'border-brand-500 bg-brand-50/50 text-brand-900 dark:text-white dark:bg-brand-900/10' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 opacity-80 hover:opacity-100'}`}
                            onClick={() => handleChange('bannerFullWidth', !offersPage.bannerFullWidth)}
                        >
                            <div className={`p-2 rounded-xl ${offersPage.bannerFullWidth ? 'bg-brand-100 dark:bg-brand-800 text-brand-600 dark:text-brand-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                                <Layout className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <h5 className="font-bold text-sm">Full Width Banner</h5>
                                <p className="text-[10px] text-slate-500">Make the banner bleed to the edges of the screen.</p>
                            </div>
                            {offersPage.bannerFullWidth ? (
                                <ToggleRight className="w-6 h-6 text-brand-500" />
                            ) : (
                                <ToggleLeft className="w-6 h-6 text-slate-400" />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid Options */}
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-3xl p-6 md:p-8 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3 mb-6">
                    <Grid className="w-5 h-5 text-slate-400" />
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white">Grid Layout</h4>
                </div>
                
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-bold text-slate-900 dark:text-white">Products Per Row</label>
                        <span className="px-3 py-1 bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 font-bold rounded-lg text-sm">
                            {offersPage.productsPerRow || 5}
                        </span>
                    </div>
                    <p className="text-xs text-slate-500 mb-4">Control the product grid density on larger screens (desktop).</p>
                    <input
                        type="range"
                        min="2"
                        max="6"
                        step="1"
                        value={offersPage.productsPerRow || 5}
                        onChange={(e) => handleChange('productsPerRow', parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-600"
                    />
                    <div className="flex justify-between text-xs font-bold text-slate-400 mt-2">
                        <span>2</span>
                        <span>3</span>
                        <span>4</span>
                        <span>5</span>
                        <span>6</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OffersPageSetting;
