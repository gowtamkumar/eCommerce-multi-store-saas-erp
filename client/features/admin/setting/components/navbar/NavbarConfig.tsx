import React from "react";
import { Layout, Move } from "lucide-react";

interface NavbarConfigProps {
    navbarData: any;
    onUpdate: (key: string, value: any) => void;
}

const NavbarConfig = React.memo(({ navbarData, onUpdate }: NavbarConfigProps) => {
    return (
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
                            onClick={() => onUpdate('layout', layout.id)}
                            className={`px-4 py-3 rounded-xl border-2 transition-all text-sm font-bold ${navbarData?.layout === layout.id
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
                        checked={navbarData?.sticky !== false}
                        onChange={(e) => onUpdate('sticky', e.target.checked)}
                        className="w-5 h-5 text-brand-600 rounded-lg border-slate-300 focus:ring-brand-500"
                    />
                </label>
                <label className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer group">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Transparent on Hero</span>
                    <input
                        type="checkbox"
                        checked={navbarData?.transparent}
                        onChange={(e) => onUpdate('transparent', e.target.checked)}
                        className="w-5 h-5 text-brand-600 rounded-lg border-slate-300 focus:ring-brand-500"
                    />
                </label>
                <label className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer group">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Show Currency Switcher</span>
                    <input
                        type="checkbox"
                        checked={navbarData?.showCurrency !== false}
                        onChange={(e) => onUpdate('showCurrency', e.target.checked)}
                        className="w-5 h-5 text-brand-600 rounded-lg border-slate-300 focus:ring-brand-500"
                    />
                </label>
                <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Container Width</span>
                    <select
                        value={navbarData?.maxWidth || 'standard'}
                        onChange={(e) => onUpdate('maxWidth', e.target.value)}
                        className="bg-slate-100 dark:bg-slate-900 border-none text-xs font-bold rounded-lg px-2 py-1 outline-none"
                    >
                        <option value="standard">Standard</option>
                        <option value="full">Full Width</option>
                    </select>
                </div>
            </div>
        </div>
    );
});

export default NavbarConfig;
