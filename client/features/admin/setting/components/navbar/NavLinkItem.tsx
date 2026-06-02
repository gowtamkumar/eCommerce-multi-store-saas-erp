import React from "react";
import { X } from "lucide-react";
import DebouncedInput from "../../../pages/components/customizer/panels/DebouncedInput";

interface NavLinkItemProps {
    link: any;
    index: number;
    onUpdate: (index: number, field: string, value: any) => void;
    onRemove: (index: number) => void;
}

const NavLinkItem = React.memo(({ link, index, onUpdate, onRemove }: NavLinkItemProps) => {
    return (
        <div className="bg-slate-50 dark:bg-slate-900/30 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 group relative transition-all">
            <button
                type="button"
                onClick={() => onRemove(index)}
                className="absolute -top-2 -right-2 p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-10"
            >
                <X className="w-4 h-4" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                <div className="md:col-span-4 space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-400">
                        Label
                    </label>
                    <DebouncedInput
                        type="text"
                        value={link.label}
                        onChange={(val) => onUpdate(index, 'label', val)}
                        placeholder="e.g. Products"
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all duration-200"
                    />
                </div>
                <div className="md:col-span-4 space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-400">
                        URL / Path
                    </label>
                    <DebouncedInput
                        type="text"
                        value={link.href}
                        onChange={(val) => onUpdate(index, 'href', val)}
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
                        onChange={(e) => onUpdate(index, 'order', parseInt(e.target.value) || 0)}
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
                            onChange={(e) => onUpdate(index, 'isOpenInNewTab', e.target.checked)}
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
                            onChange={(e) => onUpdate(index, 'isActive', e.target.checked)}
                            className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
});

export default NavLinkItem;
