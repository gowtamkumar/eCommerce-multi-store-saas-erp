import React from "react";
import { Grid3X3, Search, Tags, Filter, SlidersHorizontal } from "lucide-react";

interface ArchiveLayoutProps {
    productsPage: any;
    onUpdate: (field: string, value: any) => void;
}

const Toggle = React.memo(({ enabled, onChange, label, icon: Icon }: any) => (
    <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${enabled ? 'bg-brand-100 text-brand-600 dark:bg-brand-900/40 dark:text-brand-400' : 'bg-slate-100 text-slate-400 dark:bg-slate-800'} transition-colors`}>
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
));

const ArchiveLayout = React.memo(({ productsPage, onUpdate }: ArchiveLayoutProps) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-slate-50 dark:bg-slate-800/40 rounded-[2.5rem] p-8 space-y-6 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm">
                        <Grid3X3 className="w-5 h-5 text-brand-500" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">Grid Density</h3>
                </div>
                
                <div className="space-y-4">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <span>Comfortable</span>
                        <span className="bg-brand-600 dark:bg-brand-500 text-white px-3 py-1 rounded-full text-[12px] shadow-lg shadow-brand-500/20">{productsPage.productsPerRow || 4} Columns</span>
                        <span>Compact</span>
                    </div>
                    <input
                        type="range"
                        min="2"
                        max="6"
                        step="1"
                        value={productsPage.productsPerRow || 4}
                        onChange={(e) => onUpdate('productsPerRow', parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-500"
                    />
                    <p className="text-xs text-slate-500 italic">Determines how many products are shown per row on desktop screens.</p>
                </div>
            </div>

            <div className="space-y-4">
                <Toggle 
                    enabled={productsPage.showSearch} 
                    onChange={(v: boolean) => onUpdate('showSearch', v)} 
                    label="Product Search Bar" 
                    icon={Search} 
                />
                <Toggle 
                    enabled={productsPage.showCategories} 
                    onChange={(v: boolean) => onUpdate('showCategories', v)} 
                    label="Categories Filter" 
                    icon={Tags} 
                />
                <Toggle 
                    enabled={productsPage.showBrands} 
                    onChange={(v: boolean) => onUpdate('showBrands', v)} 
                    label="Brands Filter" 
                    icon={Filter} 
                />
                <Toggle 
                    enabled={productsPage.showPriceFilter} 
                    onChange={(v: boolean) => onUpdate('showPriceFilter', v)} 
                    label="Price Range Filter" 
                    icon={SlidersHorizontal} 
                />
            </div>
        </div>
    );
});

export default ArchiveLayout;
