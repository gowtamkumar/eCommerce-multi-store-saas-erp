import React from "react";
import { ToggleLeft, ToggleRight, List, Star, Package, CheckSquare, Share2, Tag, ShoppingCart, HelpCircle } from "lucide-react";

interface ProductModulesProps {
    singleProductPage: any;
    onUpdate: (field: string, value: any) => void;
}

const ProductModules = React.memo(({ singleProductPage, onUpdate }: ProductModulesProps) => {
    const modules = [
        {
            key: "showBreadcrumb",
            title: "Breadcrumb Navigation",
            description: "Show the category path above the product title.",
            icon: <List className="w-5 h-5" />
        },
        {
            key: "showRating",
            title: "Product Ratings",
            description: "Display star ratings and review counts.",
            icon: <Star className="w-5 h-5" />
        },
        {
            key: "showStock",
            title: "Stock Availability",
            description: "Show a badge indicating stock status.",
            icon: <Package className="w-5 h-5" />
        },
        {
            key: "showFeatures",
            title: "Key Features",
            description: "List the product's main features.",
            icon: <CheckSquare className="w-5 h-5" />
        },
        {
            key: "showShare",
            title: "Social Share Button",
            description: "Allow users to share the product.",
            icon: <Share2 className="w-5 h-5" />
        },
        {
            key: "showPromotions",
            title: "Active Promotions",
            description: "Highlight discounts or offers.",
            icon: <Tag className="w-5 h-5" />
        },
        {
            key: "showStickyCart",
            title: "Sticky Add to Cart",
            description: "Persistent cart bar on mobile devices.",
            icon: <ShoppingCart className="w-5 h-5" />
        },
        {
            key: "showProductReviews",
            title: "Customer Reviews",
            description: "Display reviews below product details.",
            icon: <Star className="w-5 h-5" />
        },
        {
            key: "showRelatedProducts",
            title: "Related Products",
            description: "Show a slider of similar items.",
            icon: <Package className="w-5 h-5" />
        },
        {
            key: "showProductFAQs",
            title: "Product FAQs",
            description: "Display frequently asked questions.",
            icon: <HelpCircle className="w-5 h-5" />
        }
    ];

    return (
        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-3xl p-6 md:p-8 border border-slate-100 dark:border-slate-800 transition-all">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                    <CheckSquare className="w-5 h-5 text-brand-500" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white font-display">Page Modules</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {modules.map((module) => {
                    const isEnabled = singleProductPage[module.key] !== false;
                    return (
                        <div
                            key={module.key}
                            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-4 ${isEnabled ? 'border-brand-500 bg-brand-50/50 text-brand-900 dark:text-white dark:bg-brand-900/10 shadow-sm' : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 opacity-60 hover:opacity-100'}`}
                            onClick={() => onUpdate(module.key, !isEnabled)}
                        >
                            <div className={`p-2 rounded-xl mt-0.5 ${isEnabled ? 'bg-brand-100 dark:bg-brand-800 text-brand-600 dark:text-brand-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                                {module.icon}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <h5 className="font-bold text-sm tracking-tight">{module.title}</h5>
                                    <div className="transition-transform duration-300">
                                        {isEnabled ? (
                                            <ToggleRight className="w-6 h-6 text-brand-500" />
                                        ) : (
                                            <ToggleLeft className="w-6 h-6 text-slate-400" />
                                        )}
                                    </div>
                                </div>
                                <p className={`text-[10px] leading-relaxed font-medium ${isEnabled ? 'text-brand-700/70 dark:text-brand-300/70' : 'text-slate-500'}`}>
                                    {module.description}
                                </p>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    );
});

export default ProductModules;
