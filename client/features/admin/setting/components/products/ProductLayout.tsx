import React from "react";
import { Layout } from "lucide-react";

interface ProductLayoutProps {
    singleProductPage: any;
    onUpdate: (field: string, value: any) => void;
}

const ProductLayout = React.memo(({ singleProductPage, onUpdate }: ProductLayoutProps) => {
    return (
        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-3xl p-6 md:p-8 border border-slate-100 dark:border-slate-800 transition-all">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                    <Layout className="w-5 h-5 text-brand-500" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white font-display">Layout Options</h4>
            </div>
            
            <div className="p-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm transition-all hover:shadow-md">
                <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">Related Products Per Row</label>
                    <span className="px-3 py-1 bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 font-bold rounded-lg text-sm shadow-sm ring-1 ring-brand-100 dark:ring-brand-900/50">
                        {singleProductPage.relatedProductsPerRow || 4}
                    </span>
                </div>
                <p className="text-xs text-slate-500 font-medium mb-6">Choose how many related products to display per row (desktop).</p>
                <div className="px-1">
                    <input
                        type="range"
                        min="2"
                        max="6"
                        step="1"
                        value={singleProductPage.relatedProductsPerRow || 4}
                        onChange={(e) => onUpdate('relatedProductsPerRow', parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500"
                    />
                    <div className="flex justify-between text-[10px] font-black text-slate-400 mt-4 tracking-tighter uppercase pl-1">
                        <span>2 Columns</span>
                        <span>3</span>
                        <span>4</span>
                        <span>5</span>
                        <span>6 Columns</span>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default ProductLayout;
