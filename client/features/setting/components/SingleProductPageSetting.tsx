import { Layout, ToggleLeft, ToggleRight, List, Star, Package, CheckSquare, Share2, Tag, ShoppingCart, HelpCircle } from "lucide-react";

interface SingleProductPageSettingProps {
    formData: any;
    setFormData: (data: any) => void;
}

const SingleProductPageSetting = ({ formData, setFormData }: SingleProductPageSettingProps) => {
    const singleProductPage = formData.singleProductPage || {};

    const handleChange = (field: string, value: any) => {
        setFormData({
            ...formData,
            singleProductPage: {
                ...formData.singleProductPage,
                [field]: value,
            },
        });
    };

    const modules = [
        {
            key: "showBreadcrumb",
            title: "Breadcrumb Navigation",
            description: "Show the category path above the product title (e.g., Home > Electronics > Audio).",
            icon: <List className="w-5 h-5" />
        },
        {
            key: "showRating",
            title: "Product Ratings",
            description: "Display star ratings and review counts under the title.",
            icon: <Star className="w-5 h-5" />
        },
        {
            key: "showStock",
            title: "Stock Availability",
            description: "Show a badge indicating if the item is in stock and how many are left.",
            icon: <Package className="w-5 h-5" />
        },
        {
            key: "showFeatures",
            title: "Key Features",
            description: "List the product's main features (bullets with checkmarks).",
            icon: <CheckSquare className="w-5 h-5" />
        },
        {
            key: "showShare",
            title: "Social Share Button",
            description: "Allow users to share the product via link or social media.",
            icon: <Share2 className="w-5 h-5" />
        },
        {
            key: "showPromotions",
            title: "Active Promotions",
            description: "Highlight any active discounts or offers for this product.",
            icon: <Tag className="w-5 h-5" />
        },
        {
            key: "showStickyCart",
            title: "Sticky Add to Cart (Mobile)",
            description: "Show a persistent add to cart bar at the bottom on mobile devices.",
            icon: <ShoppingCart className="w-5 h-5" />
        },
        {
            key: "showProductReviews",
            title: "Customer Reviews Section",
            description: "Display full customer reviews below the product details.",
            icon: <Star className="w-5 h-5" />
        },
        {
            key: "showRelatedProducts",
            title: "Related Products",
            description: "Show a slider of similar products at the bottom of the page.",
            icon: <Layout className="w-5 h-5" />
        },
        {
            key: "showProductFAQs",
            title: "Product FAQs",
            description: "Display frequently asked questions related to this item.",
            icon: <HelpCircle className="w-5 h-5" />
        }
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div>
                <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center mb-4 border border-brand-100 dark:border-brand-800">
                    <Layout className="w-6 h-6 text-brand-600 dark:text-brand-400" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
                    Single Product Page Controls
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm max-w-2xl">
                    Customize the layout and visible sections of the individual product details page. Turn modules on or off to create the perfect shopping experience.
                </p>
            </div>

            {/* Modules Grid */}
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-3xl p-6 md:p-8 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3 mb-6">
                    <Layout className="w-5 h-5 text-slate-400" />
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white">Page Modules</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {modules.map((module) => {
                        const isEnabled = singleProductPage[module.key] !== false; // Default to true if undefined
                        return (
                            <div
                                key={module.key}
                                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-4 ${isEnabled ? 'border-brand-500 bg-brand-50/50 text-brand-900 dark:text-white dark:bg-brand-900/10' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 opacity-60 hover:opacity-100'}`}
                                onClick={() => handleChange(module.key, !isEnabled)}
                            >
                                <div className={`p-2 rounded-xl mt-0.5 ${isEnabled ? 'bg-brand-100 dark:bg-brand-800 text-brand-600 dark:text-brand-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                                    {module.icon}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <h5 className="font-bold text-sm">{module.title}</h5>
                                        {isEnabled ? (
                                            <ToggleRight className="w-6 h-6 text-brand-500" />
                                        ) : (
                                            <ToggleLeft className="w-6 h-6 text-slate-400" />
                                        )}
                                    </div>
                                    <p className={`text-xs ${isEnabled ? 'text-brand-700/70 dark:text-brand-300/70' : 'text-slate-500'}`}>
                                        {module.description}
                                    </p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Layout Options */}
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-3xl p-6 md:p-8 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3 mb-6">
                    <Layout className="w-5 h-5 text-slate-400" />
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white">Layout Options</h4>
                </div>
                
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-bold text-slate-900 dark:text-white">Related Products Per Row</label>
                        <span className="px-3 py-1 bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 font-bold rounded-lg text-sm">
                            {singleProductPage.relatedProductsPerRow || 4}
                        </span>
                    </div>
                    <p className="text-xs text-slate-500 mb-4">Choose how many related products to display per row (desktop).</p>
                    <input
                        type="range"
                        min="2"
                        max="6"
                        step="1"
                        value={singleProductPage.relatedProductsPerRow || 4}
                        onChange={(e) => handleChange('relatedProductsPerRow', parseInt(e.target.value))}
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

export default SingleProductPageSetting;
