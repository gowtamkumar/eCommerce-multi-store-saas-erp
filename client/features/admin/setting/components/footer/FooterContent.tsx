import React from "react";
import { Columns } from "lucide-react";
import DebouncedInput from "../../../pages/components/customizer/panels/DebouncedInput";

interface FooterContentProps {
    footerData: any;
    onUpdate: (key: string, value: any) => void;
}

const FooterContent = React.memo(({ footerData, onUpdate }: FooterContentProps) => {
    return (
        <div className="space-y-8 mt-12">
            <div className="flex items-center gap-2">
                <Columns className="w-5 h-5 text-brand-600" />
                <h2 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight font-display">
                    Footer Content
                </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 bg-slate-50 dark:bg-slate-900/40 rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-800/50 shadow-inner">
                <div className="space-y-3">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest pl-2">
                        Visual Description
                    </label>
                    <DebouncedInput
                        as="textarea"
                        value={footerData?.description || ""}
                        onChange={(val) => onUpdate('description', val)}
                        placeholder="Tell your story..."
                        className="w-full px-5 py-4 rounded-[1.5rem] border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none text-sm min-h-[120px] transition-all"
                    />
                </div>
                <div className="space-y-3">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest pl-2">
                        Copyright Label
                    </label>
                    <DebouncedInput
                        type="text"
                        value={footerData?.copyright || ""}
                        onChange={(val) => onUpdate('copyright', val)}
                        placeholder="© 2026 LuxeAudio Store."
                        className="w-full px-5 py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none text-sm transition-all font-bold placeholder:font-normal"
                    />
                    <div className="flex items-start gap-3 p-4 bg-brand-50 dark:bg-brand-900/10 rounded-2xl border border-brand-100 dark:border-brand-800/50 mt-4">
                        <div className="p-1.5 bg-brand-500 rounded-full mt-0.5 animate-pulse shadow-sm shadow-brand-500/30"></div>
                        <p className="text-[10px] text-brand-700 dark:text-brand-300 font-bold leading-relaxed uppercase tracking-wider">
                            TIP: Keep the phrase "Made with Heart" in your copyright to enable the exclusive animated pulse icon for Gowtam Kumar.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default FooterContent;
