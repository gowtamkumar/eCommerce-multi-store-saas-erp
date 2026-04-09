import React from "react";
import { Layout } from "lucide-react";

interface FooterPresetsProps {
    footerData: any;
    onUpdate: (settings: any) => void;
}

const FooterPresets = React.memo(({ footerData, onUpdate }: FooterPresetsProps) => {
    const presets = [
        {
            id: 'modern-dark',
            label: 'Modern Dark',
            desc: 'Deep slate with high contrast',
            settings: { template: 'modern', backgroundColor: '#0f172a', textColor: '#f8fafc', glassEffect: false, topShape: 'none' }
        },
        {
            id: 'glass-luxe',
            label: 'Glass Luxe',
            desc: 'Frosted transparent effect',
            settings: { template: 'glass', glassEffect: true, shadowIntensity: 'medium', topShape: 'none' }
        },
        {
            id: 'floating-island',
            label: 'Floating Island',
            desc: 'Contemporary detached design',
            settings: { template: 'floating', borderRadius: '3xl', shadowIntensity: 'strong', topShape: 'none' }
        },
        {
            id: 'elegant-night',
            label: 'Elegant Indigo',
            desc: 'Sophisticated curve & serif',
            settings: { template: 'elegant', topShape: 'curve', brandColor: '#818cf8', backgroundPattern: 'mesh' }
        },
        {
            id: 'corporate-clean',
            label: 'Corporate Clean',
            desc: 'Minimalist white professional',
            settings: { template: 'corporate', backgroundColor: '#ffffff', textColor: '#1e293b', borderColor: '#e2e8f0', topShape: 'none' }
        },
        {
            id: 'creative-wave',
            label: 'Creative Wave',
            desc: 'Dynamic wave with patterns',
            settings: { template: 'classic', topShape: 'wave', backgroundPattern: 'dots', backgroundColor: '#4f46e5', textColor: '#ffffff' }
        }
    ];

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <Layout className="w-5 h-5 text-brand-600" />
                <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">
                    Footer Style Presets
                </h2>
            </div>
            <p className="text-sm text-slate-500">
                Choose a professional preset to instantly transform your storefront footer.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {presets.map((preset) => {
                    const isActive = footerData?.template === preset.settings.template &&
                        (preset.settings.topShape ? footerData?.topShape === preset.settings.topShape : true);

                    return (
                        <button
                            key={preset.id}
                            type="button"
                            onClick={() => onUpdate(preset.settings)}
                            className={`flex flex-col text-left p-4 rounded-2xl border-2 transition-all group ${isActive
                                ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-900/10 ring-2 ring-brand-500/20 shadow-lg'
                                : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-200'
                                }`}
                        >
                            <span className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-brand-600 transition-colors">{preset.label}</span>
                            <span className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">{preset.desc}</span>
                            <div className="mt-3 h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className={`h-full bg-brand-500 transition-all duration-700 ${isActive ? 'w-full' : 'w-0'}`} />
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
});

export default FooterPresets;
