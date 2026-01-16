
'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Settings2, X } from 'lucide-react';
import { useState } from 'react';
import StyleControls from './StyleControls';
import { SectionSettings } from './types';

interface BuilderSectionProps {
    id: string;
    title: string;
    children: React.ReactNode;
    settings?: SectionSettings;
    onSettingsChange?: (settings: SectionSettings) => void;
    onRemove: () => void;
    isOverlay?: boolean;
}

export default function BuilderSection({ id, title, children, settings, onSettingsChange, onRemove, isOverlay }: BuilderSectionProps) {
    const [showSettings, setShowSettings] = useState(false);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        zIndex: isDragging || isOverlay ? 999 : 'auto',
        position: 'relative' as const,
    };

    return (
        <div ref={setNodeRef} style={style} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden group transition-all">
            {/* Header */}
            <div className={`flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-700 transition-colors ${showSettings ? 'bg-brand-50 dark:bg-brand-900/10' : 'bg-slate-50 dark:bg-slate-900'
                }`}>
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        className="cursor-move p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                        {...attributes}
                        {...listeners}
                    >
                        <GripVertical className="w-5 h-5" />
                    </button>
                    <span className="font-semibold text-sm text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                        {title}
                    </span>
                </div>

                <div className="flex items-center gap-1">
                    {onSettingsChange && (
                        <button
                            type="button"
                            onClick={() => setShowSettings(!showSettings)}
                            className={`p-1.5 rounded-lg transition-all ${showSettings
                                    ? 'bg-brand-100 text-brand-600 dark:bg-brand-900/50 dark:text-brand-400'
                                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                                }`}
                            title="Customize Styles"
                        >
                            <Settings2 className="w-4 h-4" />
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={onRemove}
                        className="p-1.5 text-slate-400 hover:text-red-600 transition-colors rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800"
                        title="Remove Section"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Content Body */}
            <div className="flex divide-x divide-slate-200 dark:divide-slate-700">
                <div className={`flex-1 p-4 ${showSettings ? 'w-2/3' : 'w-full'}`}>
                    {children}
                </div>

                {/* Settings Panel */}
                {showSettings && onSettingsChange && (
                    <div className="w-80 bg-slate-50/50 dark:bg-slate-900/50 p-4 animate-in slide-in-from-right-4 duration-200">
                        <StyleControls settings={settings} onChange={onSettingsChange} />
                    </div>
                )}
            </div>
        </div>
    );
}
