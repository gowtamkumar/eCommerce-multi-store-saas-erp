import React, { useCallback } from "react";
import { ChevronDown, ChevronUp, Plus, X } from "lucide-react";
import DebouncedInput from "../../../pages/components/customizer/DebouncedInput";

interface FooterLinkItemProps {
    link: any;
    sectionIndex: number;
    linkIndex: number;
    onUpdateLink: (sIdx: number, lIdx: number, field: string, value: any) => void;
    onRemoveLink: (sIdx: number, lIdx: number) => void;
}

const FooterLinkItem = React.memo(({ link, sectionIndex, linkIndex, onUpdateLink, onRemoveLink }: FooterLinkItemProps) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-slate-50 dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 group/link relative transition-all hover:bg-white dark:hover:bg-slate-900 hover:shadow-xl hover:scale-[1.01]">
            <button
                type="button"
                onClick={() => onRemoveLink(sectionIndex, linkIndex)}
                className="absolute -top-1.5 -right-1.5 p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-red-500 rounded-full opacity-0 group-hover/link:opacity-100 transition-all z-10 shadow-lg hover:bg-red-500 hover:text-white active:scale-90"
            >
                <X className="w-3.5 h-3.5" />
            </button>
            <div className="md:col-span-4 flex flex-col gap-1.5">
                <span className="text-[8px] font-black uppercase text-slate-400 tracking-tighter pl-1">Label</span>
                <DebouncedInput
                    type="text"
                    value={link.label}
                    onChange={(val) => onUpdateLink(sectionIndex, linkIndex, 'label', val)}
                    placeholder="e.g Home"
                    className="w-full bg-white dark:bg-slate-800 border-2 border-transparent focus:border-brand-500/30 rounded-xl px-3 py-2 text-xs font-bold outline-none shadow-sm transition-all"
                />
            </div>
            <div className="md:col-span-4 flex flex-col gap-1.5">
                <span className="text-[8px] font-black uppercase text-slate-400 tracking-tighter pl-1">Target Path</span>
                <DebouncedInput
                    type="text"
                    value={link.href}
                    onChange={(val) => onUpdateLink(sectionIndex, linkIndex, 'href', val)}
                    placeholder="/"
                    className="w-full bg-white dark:bg-slate-800 border-2 border-transparent focus:border-brand-500/30 rounded-xl px-3 py-2 text-xs font-bold outline-none shadow-sm transition-all"
                />
            </div>
            <div className="md:col-span-2 flex flex-col gap-1.5">
                <span className="text-[8px] font-black uppercase text-slate-400 tracking-tighter pl-1">Seq</span>
                <input
                    type="number"
                    value={link.order}
                    onChange={(e) => onUpdateLink(sectionIndex, linkIndex, 'order', parseInt(e.target.value) || 0)}
                    className="w-full bg-white dark:bg-slate-800 border-2 border-transparent focus:border-brand-500/30 rounded-xl px-3 py-2 text-xs font-black outline-none shadow-sm transition-all"
                />
            </div>
            <div className="md:col-span-2 flex items-center justify-around gap-2 pt-4">
                <div className="flex flex-col items-center gap-1.5">
                    <span className="text-[7px] font-black text-slate-400 uppercase">Window</span>
                    <input
                        type="checkbox"
                        checked={link.isOpenInNewTab}
                        onChange={(e) => onUpdateLink(sectionIndex, linkIndex, 'isOpenInNewTab', e.target.checked)}
                        className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
                    />
                </div>
                <div className="flex flex-col items-center gap-1.5">
                    <span className="text-[7px] font-black text-slate-400 uppercase">Status</span>
                    <input
                        type="checkbox"
                        checked={link.isActive !== false}
                        onChange={(e) => onUpdateLink(sectionIndex, linkIndex, 'isActive', e.target.checked)}
                        className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
                    />
                </div>
            </div>
        </div>
    );
});

interface FooterSectionItemProps {
    section: any;
    index: number;
    isCollapsed: boolean;
    onToggleCollapse: (index: number) => void;
    onUpdateSection: (index: number, field: string, value: any) => void;
    onRemoveSection: (index: number) => void;
    onAddLink: (index: number) => void;
    onUpdateLink: (sIdx: number, lIdx: number, field: string, value: any) => void;
    onRemoveLink: (sIdx: number, lIdx: number) => void;
}

const FooterSectionItem = React.memo(({
    section,
    index,
    isCollapsed,
    onToggleCollapse,
    onUpdateSection,
    onRemoveSection,
    onAddLink,
    onUpdateLink,
    onRemoveLink
}: FooterSectionItemProps) => {
    return (
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-700 relative group/section shadow-sm hover:shadow-2xl hover:border-brand-500/10 transition-all duration-500">
            <button
                type="button"
                onClick={() => onRemoveSection(index)}
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
                        <DebouncedInput
                            type="text"
                            value={section.title}
                            onChange={(val) => onUpdateSection(index, 'title', val)}
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
                            onChange={(e) => onUpdateSection(index, 'order', parseInt(e.target.value) || 0)}
                            className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-2xl px-5 py-3 text-sm font-black focus:border-brand-500 focus:bg-white transition-all outline-none"
                        />
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => onToggleCollapse(index)}
                    className={`p-3 rounded-2xl mt-6 transition-all ${isCollapsed ? 'bg-slate-100 dark:bg-slate-900 text-slate-500' : 'bg-brand-500 text-white shadow-lg shadow-brand-500/20'}`}
                >
                    {isCollapsed ? (
                        <ChevronDown className="w-5 h-5" />
                    ) : (
                        <ChevronUp className="w-5 h-5" />
                    )}
                </button>
            </div>

            {/* Nested Links */}
            {!isCollapsed && (
                <div className="space-y-6 pt-8 mt-8 border-t-2 border-slate-50 dark:border-slate-900/50 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <div className="w-1 h-3 bg-brand-500 rounded-full"></div>
                            <span className="text-[11px] font-black uppercase text-slate-500 tracking-[0.2em]">
                                Managed Links
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={() => onAddLink(index)}
                            className="px-4 py-2 bg-brand-50 dark:bg-brand-900/10 text-brand-600 dark:text-brand-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-600 hover:text-white transition-all flex items-center gap-2"
                        >
                            <Plus className="w-3.5 h-3.5" /> New Item
                        </button>
                    </div>

                    <div className="grid gap-3">
                        {[...(section.links || [])]
                            .sort((a, b) => (a.order || 0) - (b.order || 0))
                            .map((link, lIdx) => (
                                <FooterLinkItem
                                    key={lIdx}
                                    link={link}
                                    sectionIndex={index}
                                    linkIndex={lIdx}
                                    onUpdateLink={onUpdateLink}
                                    onRemoveLink={onRemoveLink}
                                />
                            ))}
                        {(section.links || []).length === 0 && (
                            <div className="text-center py-8 bg-slate-50 dark:bg-slate-900/20 rounded-2xl border-2 border-dashed border-slate-100 dark:border-slate-800">
                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">No links added</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
});

export default FooterSectionItem;
