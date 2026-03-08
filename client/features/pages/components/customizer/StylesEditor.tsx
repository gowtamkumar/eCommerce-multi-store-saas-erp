import { ChevronDown, ChevronRight, Monitor, Smartphone } from 'lucide-react';
import { useState } from 'react';

interface StylesEditorProps {
    styles: Record<string, any>;
    onChange: (key: string, value: any) => void;
    onBatchChange?: (updates: Record<string, any>) => void;
    nodeType?: 'section' | 'row' | 'column' | string;
    viewMode: 'desktop' | 'mobile';
}

// ─── Layout Preset Definitions ────────────────────────────────────────────────
type LayoutPreset = 'container' | 'container-full' | 'grid';

const PRESET_ICONS: Record<LayoutPreset, React.ReactNode> = {
    'container': (
        <svg viewBox="0 0 40 24" className="w-10 h-6">
            <rect x="4" y="2" width="32" height="20" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <rect x="7" y="5" width="26" height="14" rx="1" fill="currentColor" fillOpacity="0.15" />
        </svg>
    ),
    'container-full': (
        <svg viewBox="0 0 40 24" className="w-10 h-6">
            <rect x="1" y="2" width="38" height="20" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <rect x="1" y="2" width="38" height="20" rx="2" fill="currentColor" fillOpacity="0.15" />
        </svg>
    ),
    'grid': (
        <svg viewBox="0 0 40 24" className="w-10 h-6">
            <rect x="2" y="2" width="11" height="20" rx="1.5" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.5" />
            <rect x="15" y="2" width="11" height="20" rx="1.5" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.5" />
            <rect x="28" y="2" width="11" height="20" rx="1.5" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.5" />
        </svg>
    ),
};

const PRESET_LABELS: Record<LayoutPreset, string> = {
    'container': 'Container',
    'container-full': 'Full Width',
    'grid': 'Grid',
};


// ─── Reusable Controls ────────────────────────────────────────────────────────

function Label({ children, isResponsive, viewMode }: { children: React.ReactNode; isResponsive?: boolean; viewMode?: 'desktop' | 'mobile' }) {
    return (
        <div className="flex items-center gap-1.5 mb-1.5">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{children}</p>
            {isResponsive && (
                viewMode === 'mobile'
                    ? <Smartphone className="w-2.5 h-2.5 text-brand-500" />
                    : <Monitor className="w-2.5 h-2.5 text-slate-300" />
            )}
        </div>
    );
}

function InputRow({ label, children, isResponsive, viewMode }: { label: string; children: React.ReactNode; isResponsive?: boolean; viewMode?: 'desktop' | 'mobile' }) {
    return (
        <div className="space-y-1">
            <Label isResponsive={isResponsive} viewMode={viewMode}>{label}</Label>
            {children}
        </div>
    );
}

function TextInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
    return (
        <input
            type="text"
            value={value || ''}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder || '—'}
            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
    );
}

function NumberInput({ value, onChange, unit = 'px', min, max }: { value: string | number; onChange: (v: string) => void; unit?: string; min?: number; max?: number }) {
    const raw = typeof value === 'string' ? value?.replace(/[^0-9.-]/g, '') : value;
    return (
        <div className="flex">
            <input
                type="number"
                value={raw ?? ''}
                min={min}
                max={max}
                onChange={e => onChange(e.target.value ? `${e.target.value}${unit}` : '')}
                placeholder="—"
                className="w-full px-2.5 py-1.5 text-xs rounded-l-lg border border-r-0 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
            <span className="px-2 py-1.5 text-[10px] text-slate-400 bg-slate-50 dark:bg-slate-800 border border-l-0 border-slate-200 dark:border-slate-700 rounded-r-lg select-none">{unit}</span>
        </div>
    );
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
    return (
        <select
            value={value || ''}
            onChange={e => onChange(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500"
        >
            <option value="">—</option>
            {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
    );
}

function ColorInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    return (
        <div className="flex gap-2 items-center">
            <input
                type="color"
                value={value || '#000000'}
                onChange={e => onChange(e.target.value)}
                className="h-7 w-10 rounded cursor-pointer border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
            />
            <input
                type="text"
                value={value || ''}
                onChange={e => onChange(e.target.value)}
                placeholder="#000000 / rgba(...)"
                className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
        </div>
    );
}

// ─── 4-Side spacing shorthand ─────────────────────────────────────────────────
function FourSideInput({ label, prop, styles, onChange }: { label: string; prop: string; styles: Record<string, any>; onChange: (k: string, v: any) => void }) {
    const sides = ['Top', 'Right', 'Bottom', 'Left'] as const;
    return (
        <div>
            <Label>{label}</Label>
            <div className="grid grid-cols-2 gap-1.5">
                {sides.map(side => (
                    <div key={side} className="space-y-0.5">
                        <p className="text-[8px] text-slate-400">{side}</p>
                        <NumberInput
                            value={styles[`${prop}${side}`] || ''}
                            onChange={v => onChange(`${prop}${side}`, v)}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Group Accordion ──────────────────────────────────────────────────────────
function Group({ title, emoji, children, defaultOpen = false }: { title: string; emoji: string; children: React.ReactNode; defaultOpen?: boolean }) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden">
            <button
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-center justify-between px-3 py-2.5 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <span className="text-sm">{emoji}</span>
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{title}</span>
                </div>
                {open ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
            </button>
            {open && (
                <div className="p-3 space-y-3 bg-white dark:bg-slate-900">
                    {children}
                </div>
            )}
        </div>
    );
}

// ─── Layout Preset Picker ─────────────────────────────────────────────────────
function LayoutPresetPicker({ styles, onChange, onBatchChange, viewMode }: { styles: Record<string, any>; onChange: (k: string, v: any) => void; onBatchChange?: (updates: Record<string, any>) => void; viewMode: 'desktop' | 'mobile' }) {
    const current = styles.layoutPreset as LayoutPreset | undefined;

    // Desktop vs Mobile column counts
    const gridCols = styles.gridColumns || 3;
    const mobileGridCols = styles.mobileGridColumns || 1;

    // Active columns based on viewMode
    const activeCols = viewMode === 'mobile' ? mobileGridCols : gridCols;

    const applyPreset = (preset: LayoutPreset) => {
        const isMobile = viewMode === 'mobile';
        const prefix = isMobile ? 'mobile' : '';
        const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
        const k = (key: string) => isMobile ? `${prefix}${cap(key)}` : key;

        const updates: Record<string, any> = { layoutPreset: preset };

        if (preset === 'container') {
            Object.assign(updates, {
                [k('display')]: 'flex',
                maxWidth: '1280px',
                width: '100%',
                marginLeft: 'auto',
                marginRight: 'auto',
                paddingLeft: '16px',
                paddingRight: '16px',
                [k('gridTemplateColumns')]: '',
            });
        } else if (preset === 'container-full') {
            Object.assign(updates, {
                [k('display')]: 'flex',
                maxWidth: '100%',
                width: '100%',
                marginLeft: '',
                marginRight: '',
                paddingLeft: '',
                paddingRight: '',
                [k('gridTemplateColumns')]: '',
            });
        } else if (preset === 'grid') {
            const cols = isMobile ? mobileGridCols : gridCols;
            Object.assign(updates, {
                [k('display')]: 'grid',
                [k('gridTemplateColumns')]: `repeat(${cols}, 1fr)`,
                maxWidth: '1280px',
                marginLeft: 'auto',
                marginRight: 'auto',
            });
        }

        if (onBatchChange) {
            onBatchChange(updates);
        } else {
            Object.entries(updates).forEach(([key, v]) => onChange(key, v));
        }
    };

    return (
        <div className="space-y-3">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Layout Preset</p>
            <div className="grid grid-cols-3 gap-2">
                {(['container', 'container-full', 'grid'] as LayoutPreset[]).map(preset => (
                    <button
                        key={preset}
                        onClick={() => applyPreset(preset)}
                        className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border-2 transition-all ${current === preset
                            ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400'
                            : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:hover:border-slate-600'
                            }`}
                    >
                        {PRESET_ICONS[preset]}
                        <span className="text-[9px] font-bold uppercase tracking-wide leading-none">{PRESET_LABELS[preset]}</span>
                    </button>
                ))}
            </div>

            {/* Grid column selector — only shown when Grid preset is active */}
            {current === 'grid' && (
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 space-y-2">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                        Columns
                        {viewMode === 'mobile' ? <Smartphone className="w-2.5 h-2.5 text-brand-500" /> : <Monitor className="w-2.5 h-2.5 text-slate-300" />}
                    </p>
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5, 6].map(n => (
                            <button
                                key={n}
                                onClick={() => {
                                    const updates: Record<string, any> = {};
                                    if (viewMode === 'mobile') {
                                        updates.mobileGridColumns = n;
                                        updates.mobileGridTemplateColumns = `repeat(${n}, 1fr)`;
                                    } else {
                                        updates.gridColumns = n;
                                        updates.gridTemplateColumns = `repeat(${n}, 1fr)`;
                                    }

                                    if (onBatchChange) {
                                        onBatchChange(updates);
                                    } else {
                                        Object.entries(updates).forEach(([k, v]) => onChange(k, v));
                                    }
                                }}
                                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${activeCols === n
                                    ? 'bg-brand-500 text-white'
                                    : 'bg-white dark:bg-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600'
                                    }`}
                            >
                                {n}
                            </button>
                        ))}
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-1">
                        <div>
                            <p className="text-[9px] text-slate-400 mb-1">Row Gap</p>
                            <NumberInput value={styles.rowGap || ''} onChange={v => onChange('rowGap', v)} />
                        </div>
                        <div>
                            <p className="text-[9px] text-slate-400 mb-1">Column Gap</p>
                            <NumberInput value={styles.columnGap || ''} onChange={v => onChange('columnGap', v)} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Main Editor ──────────────────────────────────────────────────────────────
export default function StylesEditor({ styles, onChange, onBatchChange, nodeType, viewMode }: StylesEditorProps) {
    const s = styles || {};
    const isRow = nodeType === 'row';

    const getProp = (baseKey: string) => {
        if (viewMode === 'mobile') {
            const mobileKey = `mobile${baseKey.charAt(0).toUpperCase()}${baseKey.slice(1)}`;
            // If mobile value exists (not undefined and not empty string), return it. Otherwise return desktop value as fallback for display.
            const hasMobile = s[mobileKey] !== undefined && s[mobileKey] !== '';
            return {
                key: mobileKey,
                value: hasMobile ? s[mobileKey] : s[baseKey]
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
        <div className="space-y-2 pb-8">

            {/* Layout Preset — Row only */}
            {isRow && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 mb-3">
                    <LayoutPresetPicker styles={s} onChange={onChange} onBatchChange={onBatchChange} viewMode={viewMode} />
                </div>
            )}

            {/* 1. Layout */}
            <Group title="Layout" emoji="📐" defaultOpen>
                <div className="grid grid-cols-2 gap-2">
                    <InputRow label="Display" isResponsive viewMode={viewMode}>
                        <Select value={getProp('display').value} onChange={v => handleUpdate('display', v)} options={[
                            { value: 'block', label: 'Block' },
                            { value: 'flex', label: 'Flex' },
                            { value: 'grid', label: 'Grid' },
                            { value: 'inline-block', label: 'Inline Block' },
                            { value: 'inline-flex', label: 'Inline Flex' },
                            { value: 'none', label: 'None' },
                        ]} />
                    </InputRow>
                    <InputRow label="Position">
                        <Select value={s.position} onChange={v => onChange('position', v)} options={[
                            { value: 'static', label: 'Static' },
                            { value: 'relative', label: 'Relative' },
                            { value: 'absolute', label: 'Absolute' },
                            { value: 'fixed', label: 'Fixed' },
                            { value: 'sticky', label: 'Sticky' },
                        ]} />
                    </InputRow>
                    <InputRow label="Overflow">
                        <Select value={s.overflow} onChange={v => onChange('overflow', v)} options={[
                            { value: 'visible', label: 'Visible' },
                            { value: 'hidden', label: 'Hidden' },
                            { value: 'scroll', label: 'Scroll' },
                            { value: 'auto', label: 'Auto' },
                        ]} />
                    </InputRow>
                    <InputRow label="Z-Index">
                        <TextInput value={s.zIndex} onChange={v => onChange('zIndex', v)} placeholder="0" />
                    </InputRow>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    {['top', 'right', 'bottom', 'left'].map(side => (
                        <InputRow key={side} label={side.charAt(0).toUpperCase() + side.slice(1)}>
                            <NumberInput value={s[side] || ''} onChange={v => onChange(side, v)} />
                        </InputRow>
                    ))}
                </div>
            </Group>

            {/* 2. Flexbox */}
            <Group title="Flexbox" emoji="🔀">
                <div className="grid grid-cols-2 gap-2">
                    <InputRow label="Direction" isResponsive viewMode={viewMode}>
                        <Select value={getProp('flexDirection').value} onChange={v => handleUpdate('flexDirection', v)} options={[
                            { value: 'row', label: 'Row →' },
                            { value: 'row-reverse', label: 'Row ←' },
                            { value: 'column', label: 'Column ↓' },
                            { value: 'column-reverse', label: 'Column ↑' },
                        ]} />
                    </InputRow>
                    <InputRow label="Wrap">
                        <Select value={s.flexWrap} onChange={v => onChange('flexWrap', v)} options={[
                            { value: 'nowrap', label: 'No Wrap' },
                            { value: 'wrap', label: 'Wrap' },
                            { value: 'wrap-reverse', label: 'Wrap Reverse' },
                        ]} />
                    </InputRow>
                    <InputRow label="Justify Content" isResponsive viewMode={viewMode}>
                        <Select value={getProp('justifyContent').value} onChange={v => handleUpdate('justifyContent', v)} options={[
                            { value: 'flex-start', label: 'Start' },
                            { value: 'center', label: 'Center' },
                            { value: 'flex-end', label: 'End' },
                            { value: 'space-between', label: 'Space Between' },
                            { value: 'space-around', label: 'Space Around' },
                            { value: 'space-evenly', label: 'Space Evenly' },
                        ]} />
                    </InputRow>
                    <InputRow label="Align Items" isResponsive viewMode={viewMode}>
                        <Select value={getProp('alignItems').value} onChange={v => handleUpdate('alignItems', v)} options={[
                            { value: 'stretch', label: 'Stretch' },
                            { value: 'flex-start', label: 'Start' },
                            { value: 'center', label: 'Center' },
                            { value: 'flex-end', label: 'End' },
                            { value: 'baseline', label: 'Baseline' },
                        ]} />
                    </InputRow>
                    <InputRow label="Gap" isResponsive viewMode={viewMode}>
                        <NumberInput value={getProp('gap').value || ''} onChange={v => handleUpdate('gap', v)} />
                    </InputRow>
                    <InputRow label="Flex Grow">
                        <TextInput value={s.flexGrow} onChange={v => onChange('flexGrow', v)} placeholder="0" />
                    </InputRow>
                    <InputRow label="Flex Shrink">
                        <TextInput value={s.flexShrink} onChange={v => onChange('flexShrink', v)} placeholder="1" />
                    </InputRow>
                    <InputRow label="Flex Basis">
                        <NumberInput value={s.flexBasis || ''} onChange={v => onChange('flexBasis', v)} unit="%" />
                    </InputRow>
                </div>
            </Group>

            {/* 3. Grid */}
            <Group title="Grid" emoji="⬛">
                <InputRow label="Template Columns" isResponsive viewMode={viewMode}>
                    <TextInput value={getProp('gridTemplateColumns').value} onChange={v => handleUpdate('gridTemplateColumns', v)} placeholder="repeat(3, 1fr)" />
                </InputRow>
                <InputRow label="Template Rows">
                    <TextInput value={s.gridTemplateRows} onChange={v => onChange('gridTemplateRows', v)} placeholder="auto" />
                </InputRow>
                <div className="grid grid-cols-2 gap-2">
                    <InputRow label="Gap" isResponsive viewMode={viewMode}>
                        <NumberInput value={getProp('gridGap').value || ''} onChange={v => handleUpdate('gridGap', v)} />
                    </InputRow>
                    <InputRow label="Column Gap">
                        <NumberInput value={s.columnGap || ''} onChange={v => onChange('columnGap', v)} />
                    </InputRow>
                    <InputRow label="Grid Column">
                        <TextInput value={s.gridColumn} onChange={v => onChange('gridColumn', v)} placeholder="span 2" />
                    </InputRow>
                    <InputRow label="Grid Row">
                        <TextInput value={s.gridRow} onChange={v => onChange('gridRow', v)} placeholder="span 1" />
                    </InputRow>
                </div>
            </Group>

            {/* 4. Spacing */}
            <Group title="Spacing" emoji="📏">
                <div className="space-y-4">
                    <div>
                        <Label isResponsive viewMode={viewMode}>Padding</Label>
                        <div className="grid grid-cols-2 gap-2">
                            {['Top', 'Right', 'Bottom', 'Left'].map(side => {
                                const baseKey = `padding${side}`;
                                const { value } = getProp(baseKey);
                                return (
                                    <div key={side} className="space-y-0.5">
                                        <p className="text-[8px] text-slate-400 capitalize">{side}</p>
                                        <NumberInput value={value || ''} onChange={v => handleUpdate(baseKey, v)} />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div>
                        <Label isResponsive viewMode={viewMode}>Margin</Label>
                        <div className="grid grid-cols-2 gap-2">
                            {['Top', 'Right', 'Bottom', 'Left'].map(side => {
                                const baseKey = `margin${side}`;
                                const { value } = getProp(baseKey);
                                return (
                                    <div key={side} className="space-y-0.5">
                                        <p className="text-[8px] text-slate-400 capitalize">{side}</p>
                                        <NumberInput value={value || ''} onChange={v => handleUpdate(baseKey, v)} />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </Group>

            {/* 5. Size */}
            <Group title="Size" emoji="📦">
                <div className="grid grid-cols-2 gap-2">
                    <InputRow label="Width" isResponsive viewMode={viewMode}>
                        <NumberInput value={getProp('width').value || ''} onChange={v => handleUpdate('width', v)} unit="%" />
                    </InputRow>
                    <InputRow label="Height" isResponsive viewMode={viewMode}>
                        <NumberInput value={getProp('height').value || ''} onChange={v => handleUpdate('height', v)} />
                    </InputRow>
                    <InputRow label="Min Width">
                        <NumberInput value={s.minWidth || ''} onChange={v => onChange('minWidth', v)} />
                    </InputRow>
                    <InputRow label="Max Width">
                        <NumberInput value={s.maxWidth || ''} onChange={v => onChange('maxWidth', v)} />
                    </InputRow>
                    <InputRow label="Min Height">
                        <NumberInput value={s.minHeight || ''} onChange={v => onChange('minHeight', v)} />
                    </InputRow>
                    <InputRow label="Max Height">
                        <NumberInput value={s.maxHeight || ''} onChange={v => onChange('maxHeight', v)} />
                    </InputRow>
                </div>
            </Group>

            {/* 6. Typography */}
            <Group title="Typography" emoji="✍️">
                <InputRow label="Font Family">
                    <Select value={s.fontFamily} onChange={v => onChange('fontFamily', v)} options={[
                        { value: 'Inter, sans-serif', label: 'Inter' },
                        { value: 'Roboto, sans-serif', label: 'Roboto' },
                        { value: 'Outfit, sans-serif', label: 'Outfit' },
                        { value: 'Poppins, sans-serif', label: 'Poppins' },
                        { value: 'Playfair Display, serif', label: 'Playfair Display' },
                        { value: 'Georgia, serif', label: 'Georgia' },
                        { value: 'monospace', label: 'Monospace' },
                    ]} />
                </InputRow>
                <div className="grid grid-cols-2 gap-2">
                    <InputRow label="Font Size" isResponsive viewMode={viewMode}>
                        <NumberInput value={getProp('fontSize').value || ''} onChange={v => handleUpdate('fontSize', v)} />
                    </InputRow>
                    <InputRow label="Font Weight">
                        <Select value={s.fontWeight} onChange={v => onChange('fontWeight', v)} options={[
                            { value: '300', label: 'Light (300)' },
                            { value: '400', label: 'Regular (400)' },
                            { value: '500', label: 'Medium (500)' },
                            { value: '600', label: 'Semibold (600)' },
                            { value: '700', label: 'Bold (700)' },
                            { value: '800', label: 'ExtraBold (800)' },
                            { value: '900', label: 'Black (900)' },
                        ]} />
                    </InputRow>
                    <InputRow label="Line Height">
                        <NumberInput value={s.lineHeight || ''} onChange={v => onChange('lineHeight', v)} unit="" />
                    </InputRow>
                    <InputRow label="Letter Spacing">
                        <NumberInput value={s.letterSpacing || ''} onChange={v => onChange('letterSpacing', v)} unit="em" />
                    </InputRow>
                    <InputRow label="Text Align" isResponsive viewMode={viewMode}>
                        <Select value={getProp('textAlign').value} onChange={v => handleUpdate('textAlign', v)} options={[
                            { value: 'left', label: 'Left' },
                            { value: 'center', label: 'Center' },
                            { value: 'right', label: 'Right' },
                            { value: 'justify', label: 'Justify' },
                        ]} />
                    </InputRow>
                    <InputRow label="Text Transform">
                        <Select value={s.textTransform} onChange={v => onChange('textTransform', v)} options={[
                            { value: 'none', label: 'None' },
                            { value: 'uppercase', label: 'UPPERCASE' },
                            { value: 'lowercase', label: 'lowercase' },
                            { value: 'capitalize', label: 'Capitalize' },
                        ]} />
                    </InputRow>
                </div>
                <InputRow label="Color">
                    <ColorInput value={s.color || ''} onChange={v => onChange('color', v)} />
                </InputRow>
            </Group>

            {/* 7. Background */}
            <Group title="Background" emoji="🎨">
                <InputRow label="Background Color">
                    <ColorInput value={s.backgroundColor || ''} onChange={v => onChange('backgroundColor', v)} />
                </InputRow>
                <InputRow label="Background Image URL">
                    <TextInput value={s.backgroundImage} onChange={v => onChange('backgroundImage', v ? `url(${v})` : '')} placeholder="https://..." />
                </InputRow>
                <div className="grid grid-cols-2 gap-2">
                    <InputRow label="Size">
                        <Select value={s.backgroundSize} onChange={v => onChange('backgroundSize', v)} options={[
                            { value: 'cover', label: 'Cover' },
                            { value: 'contain', label: 'Contain' },
                            { value: 'auto', label: 'Auto' },
                            { value: '100% 100%', label: 'Stretch' },
                        ]} />
                    </InputRow>
                    <InputRow label="Position">
                        <Select value={s.backgroundPosition} onChange={v => onChange('backgroundPosition', v)} options={[
                            { value: 'center', label: 'Center' },
                            { value: 'top', label: 'Top' },
                            { value: 'bottom', label: 'Bottom' },
                            { value: 'left', label: 'Left' },
                            { value: 'right', label: 'Right' },
                            { value: 'top left', label: 'Top Left' },
                            { value: 'top right', label: 'Top Right' },
                        ]} />
                    </InputRow>
                    <InputRow label="Repeat">
                        <Select value={s.backgroundRepeat} onChange={v => onChange('backgroundRepeat', v)} options={[
                            { value: 'no-repeat', label: 'No Repeat' },
                            { value: 'repeat', label: 'Repeat' },
                            { value: 'repeat-x', label: 'Repeat X' },
                            { value: 'repeat-y', label: 'Repeat Y' },
                        ]} />
                    </InputRow>
                </div>
            </Group>

            {/* 8. Border */}
            <Group title="Border" emoji="🔲">
                <div className="grid grid-cols-2 gap-2">
                    <InputRow label="Border Width">
                        <NumberInput value={s.borderWidth || ''} onChange={v => onChange('borderWidth', v)} />
                    </InputRow>
                    <InputRow label="Border Style">
                        <Select value={s.borderStyle} onChange={v => onChange('borderStyle', v)} options={[
                            { value: 'solid', label: 'Solid' },
                            { value: 'dashed', label: 'Dashed' },
                            { value: 'dotted', label: 'Dotted' },
                            { value: 'double', label: 'Double' },
                            { value: 'none', label: 'None' },
                        ]} />
                    </InputRow>
                    <InputRow label="Border Radius">
                        <NumberInput value={s.borderRadius || ''} onChange={v => onChange('borderRadius', v)} />
                    </InputRow>
                </div>
                <InputRow label="Border Color">
                    <ColorInput value={s.borderColor || ''} onChange={v => onChange('borderColor', v)} />
                </InputRow>
            </Group>

            {/* 9. Effects */}
            <Group title="Shadow & Effects" emoji="✨">
                <InputRow label="Box Shadow">
                    <TextInput value={s.boxShadow} onChange={v => onChange('boxShadow', v)} placeholder="0 4px 24px rgba(0,0,0,0.1)" />
                </InputRow>
                <InputRow label="Opacity">
                    <div className="flex items-center gap-2">
                        <input
                            type="range"
                            min={0}
                            max={1}
                            step={0.01}
                            value={s.opacity ?? 1}
                            onChange={e => onChange('opacity', parseFloat(e.target.value))}
                            className="flex-1 accent-brand-600"
                        />
                        <span className="text-xs text-slate-500 w-8 text-right">{Math.round((s.opacity ?? 1) * 100)}%</span>
                    </div>
                </InputRow>
                <InputRow label="Blur Filter">
                    <NumberInput value={s.filter?.replace('blur(', '').replace(')', '') || ''} onChange={v => onChange('filter', v ? `blur(${v})` : '')} />
                </InputRow>
            </Group>

            {/* 10. Animation */}
            <Group title="Animation & Transition" emoji="🎬">
                <InputRow label="Transition">
                    <TextInput value={s.transition} onChange={v => onChange('transition', v)} placeholder="all 0.3s ease" />
                </InputRow>
                <InputRow label="Transform">
                    <TextInput value={s.transform} onChange={v => onChange('transform', v)} placeholder="rotate(0deg) scale(1)" />
                </InputRow>
                <div className="grid grid-cols-3 gap-2">
                    <InputRow label="Scale">
                        <TextInput value={s._scale} onChange={v => onChange('_scale', v)} placeholder="1" />
                    </InputRow>
                    <InputRow label="Rotate">
                        <TextInput value={s._rotate} onChange={v => onChange('_rotate', v)} placeholder="0deg" />
                    </InputRow>
                    <InputRow label="Translate X">
                        <NumberInput value={s._translateX || ''} onChange={v => onChange('_translateX', v)} />
                    </InputRow>
                </div>
            </Group>


        </div>
    );
}
