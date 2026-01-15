import { TEMPLATE_PRESETS, getTemplateSections } from "@/lib/page-templates";
import { PageBuilderSection } from "@/types/page-builder";
import { LayoutTemplate, X } from "lucide-react";

interface TemplateSelectorProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (sections: PageBuilderSection[]) => void;
}

export default function TemplateSelector({ isOpen, onClose, onSelect }: TemplateSelectorProps) {
    if (!isOpen) return null;

    const handleSelect = (templateId: string) => {
        if (confirm("Applying a template will overwrite your current sections. Continue?")) {
            const sections = getTemplateSections(templateId);
            onSelect(sections);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-brand-100 dark:bg-brand-900/30 text-brand-600 rounded-lg">
                            <LayoutTemplate className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Choose a Template</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Start with a pre-built layout</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-950/50">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {TEMPLATE_PRESETS.map((template) => (
                            <button
                                key={template.id}
                                onClick={() => handleSelect(template.id)}
                                className="group relative flex flex-col items-start text-left bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden hover:ring-2 hover:ring-brand-500 hover:border-transparent transition-all shadow-sm hover:shadow-lg h-full"
                            >
                                {/* Preview Placeholder */}
                                <div className="w-full aspect-video bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-400 group-hover:bg-brand-50 dark:group-hover:bg-slate-800 transition-colors">
                                    {/* In a real app, we'd have thumbnail images here */}
                                    <LayoutTemplate className="w-12 h-12 opacity-20 group-hover:opacity-50 group-hover:scale-110 transition-all" />
                                </div>

                                <div className="p-5 w-full flex-1 flex flex-col">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${template.category === 'business' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                                template.category === 'ecommerce' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                    'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                                            }`}>
                                            {template.category}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">{template.name}</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                        {template.description}
                                    </p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
                    Selecting a template will replace your current page sections.
                </div>
            </div>
        </div>
    );
}
