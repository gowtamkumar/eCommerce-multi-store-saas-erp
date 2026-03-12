import { ChevronDown, Monitor, Smartphone } from 'lucide-react';

interface ComponentStylesEditorProps {
    styles: Record<string, any>;
    onChange: (key: string, value: any) => void;
    viewMode: 'desktop' | 'mobile';
}

function Label({ children, isResponsive, viewMode }: { children: React.ReactNode; isResponsive?: boolean; viewMode?: 'desktop' | 'mobile' }) {
    return (
        <div className="flex items-center gap-2 mb-2">
            <p className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-[0.1em]">{children}</p>
            {isResponsive && (
                <div className="p-1 rounded-md bg-slate-50 dark:bg-slate-800/50">
                    {viewMode === 'mobile'
                        ? <Smartphone className="w-3 h-3 text-brand-500" />
                        : <Monitor className="w-3 h-3 text-slate-400" />
                    }
                </div>
            )}
        </div>
    );
}

function ColorInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    return (
        <div className="group flex gap-2.5 items-center p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:border-brand-500/30 transition-all duration-300">
            <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm">
                <input
                    type="color"
                    value={value || '#000000'}
                    onChange={e => onChange(e.target.value)}
                    className="absolute inset-0 w-full h-full scale-150 cursor-pointer bg-transparent"
                />
            </div>
            <input
                type="text"
                value={value || ''}
                onChange={e => onChange(e.target.value)}
                placeholder="Hex/RGBA"
                className="flex-1 w-full bg-transparent text-[11px] font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
            />
        </div>
    );
}

function NumberInput({ value, onChange, unit = 'px', placeholder = '0' }: { value: string | number; onChange: (v: string) => void; unit?: string; placeholder?: string }) {
    const raw = typeof value === 'string' ? value?.replace(/[^0-9.-]/g, '') : value;
    return (
        <div className="group flex items-center p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:border-brand-500/30 transition-all duration-300">
            <input
                type="number"
                value={raw ?? ''}
                onChange={e => onChange(e.target.value ? `${e.target.value}${unit}` : '')}
                placeholder={placeholder}
                className="flex-1 w-full bg-transparent text-[11px] font-bold text-slate-700 dark:text-slate-300 focus:outline-none px-1.5"
            />
            <span className="px-2 py-1 text-[9px] font-black text-slate-400 uppercase tracking-tighter select-none opacity-50">{unit}</span>
        </div>
    );
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
    return (
        <div className="group relative rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:border-brand-500/30 transition-all duration-300 overflow-hidden">
            <select
                value={value || ''}
                onChange={e => onChange(e.target.value)}
                className="w-full bg-transparent px-3 py-2 text-[11px] font-bold text-slate-700 dark:text-slate-300 focus:outline-none appearance-none cursor-pointer"
            >
                <option value="" className="dark:bg-slate-900">— Default —</option>
                {options.map(o => <option key={o.value} value={o.value} className="dark:bg-slate-900">{o.label}</option>)}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-40 group-hover:opacity-100 transition-opacity">
                <ChevronDown className="w-3.5 h-3.5" />
            </div>
        </div>
    );
}

export default function ComponentStylesEditor({ styles, onChange, viewMode }: ComponentStylesEditorProps) {
    const s = styles || {};

    const getProp = (baseKey: string) => {
        if (viewMode === 'mobile') {
            const mobileKey = `mobile${baseKey.charAt(0).toUpperCase()}${baseKey.slice(1)}`;
            return {
                key: mobileKey,
                value: s[mobileKey] !== undefined && s[mobileKey] !== '' ? s[mobileKey] : s[baseKey]
            };
        }
        return { key: baseKey, value: s[baseKey] };
    };

    const handleUpdate = (baseKey: string, val: any) => {
        if (viewMode === 'mobile') {
            const mobileKey = `mobile${baseKey.charAt(0).toUpperCase()}${baseKey.slice(1)}`;
            onChange(mobileKey, val);
        } else {
            onChange(baseKey, val);
        }
    };

    return (
        <div className="space-y-5 pb-4">

            {/* Spacing */}
            <div>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    <span className="text-base">📏</span> Spacing
                </p>
                <div className="grid grid-cols-2 gap-2">
                    {([
                        ['paddingTop', 'Padding Top'],
                        ['paddingBottom', 'Padding Bottom'],
                        ['paddingLeft', 'Padding Left'],
                        ['paddingRight', 'Padding Right'],
                        ['marginTop', 'Margin Top'],
                        ['marginBottom', 'Margin Bottom'],
                    ] as [string, string][]).map(([key, label]) => {
                        const { value } = getProp(key);
                        return (
                            <div key={key}>
                                <Label isResponsive viewMode={viewMode}>{label}</Label>
                                <NumberInput value={value || ''} onChange={v => handleUpdate(key, v)} />
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="h-px bg-slate-100 dark:bg-slate-800" />

            {/* Background */}
            <div>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    <span className="text-base">🎨</span> Background
                </p>
                <div className="space-y-2">
                    <Label>Background Color</Label>
                    <ColorInput value={s.backgroundColor || ''} onChange={v => onChange('backgroundColor', v)} />
                </div>
            </div>

            <div className="h-px bg-slate-100 dark:bg-slate-800" />

            {/* Text */}
            <div>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    <span className="text-base">✍️</span> Text
                </p>
                <div className="space-y-3">
                    <div>
                        <Label>Text Color</Label>
                        <ColorInput value={s.color || s.textColor || ''} onChange={v => { onChange('color', v); onChange('textColor', v); }} />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            {(() => {
                                const { value } = getProp('fontSize');
                                return (
                                    <>
                                        <Label isResponsive viewMode={viewMode}>Font Size</Label>
                                        <NumberInput value={value || ''} onChange={v => handleUpdate('fontSize', v)} />
                                    </>
                                );
                            })()}
                        </div>
                        <div>
                            {(() => {
                                const { value } = getProp('textAlign');
                                return (
                                    <>
                                        <Label isResponsive viewMode={viewMode}>Text Align</Label>
                                        <Select value={value} onChange={v => handleUpdate('textAlign', v)} options={[
                                            { value: 'left', label: 'Left' },
                                            { value: 'center', label: 'Center' },
                                            { value: 'right', label: 'Right' },
                                        ]} />
                                    </>
                                );
                            })()}
                        </div>
                    </div>
                </div>
            </div>

            <div className="h-px bg-slate-100 dark:bg-slate-800" />

            {/* Border */}
            <div>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    <span className="text-base">🔲</span> Border
                </p>
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <Label>Border Radius</Label>
                        <NumberInput value={s.borderRadius || ''} onChange={v => onChange('borderRadius', v)} />
                    </div>
                    <div>
                        <Label>Border Width</Label>
                        <NumberInput value={s.borderWidth || ''} onChange={v => onChange('borderWidth', v)} />
                    </div>
                </div>
                <div className="mt-2 space-y-2">
                    <Label>Border Color</Label>
                    <ColorInput value={s.borderColor || ''} onChange={v => onChange('borderColor', v)} />
                </div>
                <div className="mt-2">
                    <Label>Border Style</Label>
                    <Select value={s.borderStyle} onChange={v => onChange('borderStyle', v)} options={[
                        { value: 'solid', label: 'Solid' },
                        { value: 'dashed', label: 'Dashed' },
                        { value: 'dotted', label: 'Dotted' },
                        { value: 'none', label: 'None' },
                    ]} />
                </div>
            </div>

            <div className="h-px bg-slate-100 dark:bg-slate-800" />

            {/* Effects */}
            <div>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    <span className="text-base">✨</span> Effects
                </p>
                <div className="space-y-3">
                    <div>
                        <Label>Box Shadow</Label>
                        <input
                            type="text"
                            value={s.boxShadow || ''}
                            onChange={e => onChange('boxShadow', e.target.value)}
                            placeholder="0 4px 24px rgba(0,0,0,0.1)"
                            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500"
                        />
                    </div>
                    <div>
                        <Label>Opacity — {Math.round((s.opacity ?? 1) * 100)}%</Label>
                        <input
                            type="range"
                            min={0} max={1} step={0.01}
                            value={s.opacity ?? 1}
                            onChange={e => onChange('opacity', parseFloat(e.target.value))}
                            className="w-full accent-brand-600"
                        />
                    </div>
                </div>
            </div>

        </div>
    );
}
