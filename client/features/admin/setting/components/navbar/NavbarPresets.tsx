import React from "react";
import { Layout } from "lucide-react";

interface NavbarPresetsProps {
    navbarData: any;
    onUpdate: (settings: any) => void;
}

const NavbarPresets = React.memo(({ navbarData, onUpdate }: NavbarPresetsProps) => {
    const presets = [
        {
            id: 'modern-digital',
            label: 'Modern Digital',
            desc: 'Glass effect with default layout',
            settings: { layout: 'default', template: 'glass', sticky: true }
        },
        {
            id: 'elegant-boutique',
            label: 'Elegant Boutique',
            desc: 'Centered logo with classic feel',
            settings: { layout: 'centered', template: 'classic', sticky: true }
        },
        {
            id: 'minimalist-store',
            label: 'Minimalist Store',
            desc: 'Clean minimal layout',
            settings: { layout: 'minimal', template: 'classic', sticky: true }
        },
        {
            id: 'creative-floating',
            label: 'Creative Floating',
            desc: 'Detached floating header',
            settings: { layout: 'centered', template: 'floating', sticky: true }
        },
        {
            id: 'bold-identity',
            label: 'Bold Identity',
            desc: 'Full-width gradient style',
            settings: { layout: 'default', template: 'gradient', sticky: true }
        }
    ];

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <Layout className="w-5 h-5 text-brand-600" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Navbar Presets
                </h3>
            </div>
            <p className="text-sm text-slate-500">
                Choose a pre-designed navbar style to instantly update your store's header.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {presets.map((preset) => {
                    const isActive = navbarData?.layout === preset.settings.layout &&
                        navbarData?.template === preset.settings.template;

                    return (
                        <button
                            key={preset.id}
                            type="button"
                            onClick={() => onUpdate(preset.settings)}
                            className={`flex flex-col text-left p-4 rounded-2xl border-2 transition-all ${isActive
                                ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-900/10 ring-2 ring-brand-500/20'
                                : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-200'
                                }`}
                        >
                            <span className="text-sm font-bold text-slate-900 dark:text-white">{preset.label}</span>
                            <span className="text-xs text-slate-500 mt-1">{preset.desc}</span>
                            <div className="mt-3 h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className={`h-full bg-brand-500 transition-all duration-500 ${isActive ? 'w-full' : 'w-0'}`} />
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
});

export default NavbarPresets;
