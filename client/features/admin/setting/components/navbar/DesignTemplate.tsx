import React from "react";
import { Palette } from "lucide-react";

interface DesignTemplateProps {
    navbarData: any;
    onUpdate: (key: string, value: any) => void;
}

const DesignTemplate = React.memo(({ navbarData, onUpdate }: DesignTemplateProps) => {
    const templates = [
        { id: 'classic', label: 'Classic', desc: 'Solid & Professional', preview: 'bg-white border-b' },
        { id: 'glass', label: 'Glassmorphism', desc: 'Modern & Blurred', preview: 'bg-white/40 backdrop-blur-md' },
        { id: 'floating', label: 'Floating', desc: 'Creative & Detached', preview: 'bg-white shadow-xl rounded-2xl mx-2' },
        { id: 'gradient', label: 'Modern Gradient', desc: 'Vibrant & Bold', preview: 'bg-gradient-to-r from-brand-600 to-brand-400' }
    ];

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-brand-600" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Design Template
                </h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {templates.map((item) => (
                    <button
                        key={item.id}
                        type="button"
                        onClick={() => onUpdate('template', item.id)}
                        className={`flex flex-col gap-3 p-3 rounded-2xl border-2 transition-all group ${navbarData?.template === item.id
                            ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-900/10'
                            : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-200'
                            }`}
                    >
                        <div className={`w-full h-16 rounded-xl overflow-hidden relative border border-slate-100 dark:border-slate-800 ${item.id === 'gradient' ? item.preview : 'bg-slate-100 dark:bg-slate-800'}`}>
                            {item.id !== 'gradient' && (
                                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-6 border transition-all ${item.preview} ${navbarData?.template === item.id ? 'border-brand-200' : 'border-slate-200 dark:border-slate-700'}`}></div>
                            )}
                            {item.id === 'gradient' && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-12 h-1 bg-white/40 rounded-full"></div>
                                </div>
                            )}
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-bold text-slate-900 dark:text-white">{item.label}</p>
                            <p className="text-[10px] text-slate-500">{item.desc}</p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
});

export default DesignTemplate;
