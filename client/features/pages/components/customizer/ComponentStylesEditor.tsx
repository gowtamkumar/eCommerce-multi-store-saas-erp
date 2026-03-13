import { ChevronDown, Monitor, Smartphone } from 'lucide-react';

interface ComponentStylesEditorProps {
    styles: Record<string, any>;
    onChange: (key: string, value: any) => void;
    viewMode: 'desktop' | 'mobile';
    nodeType: string;
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

export default function ComponentStylesEditor({ styles, onChange, viewMode, nodeType }: ComponentStylesEditorProps) {
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

    const isHeroType = nodeType === 'banner' || nodeType === 'offer-banner';

    return (
        <div className="space-y-5 pb-4">

            {/* Sizing */}
            <div>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    <span className="text-base">📏</span> Size & Dimension
                </p>
                <div className="grid grid-cols-2 gap-2">
                    {([
                        ['height', 'Height'],
                        ['width', 'Width'],
                        ['maxWidth', 'Max Width'],
                    ] as [string, string][]).map(([key, label]) => {
                        const { value } = getProp(key);
                        return (
                            <div key={key}>
                                <Label isResponsive viewMode={viewMode}>{label}</Label>
                                <NumberInput value={value || ''} onChange={v => handleUpdate(key, v)} unit={key === 'width' ? '%' : 'px'} />
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="h-px bg-slate-100 dark:bg-slate-800" />

            {/* Section Header Styling */}
            {['banner', 'product-slider', 'category-grid', 'brand-grid', 'review-slider', 'newsletter', 'faq-section', 'contact'].includes(nodeType) && (
                <>
                    <div>
                        <p className="text-[9px] font-bold text-brand-600 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                            <span className="text-base">📝</span> Section Title Styles
                        </p>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label>Title Color</Label>
                                    <ColorInput value={s.headlineColor || s.color || ''} onChange={v => onChange('headlineColor', v)} />
                                </div>
                                <div>
                                    <Label>Underline Color</Label>
                                    <ColorInput value={s.sublineColor || s.headlineColor || s.color || ''} onChange={v => onChange('sublineColor', v)} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label>Font Size</Label>
                                    <NumberInput value={s.headingFontSize || ''} onChange={v => onChange('headingFontSize', v)} />
                                </div>
                                <div>
                                    <Label>Font Weight</Label>
                                    <Select value={s.headingFontWeight || '900'} onChange={v => onChange('headingFontWeight', v)} options={[
                                        { value: '400', label: 'Normal' },
                                        { value: '500', label: 'Medium' },
                                        { value: '600', label: 'SemiBold' },
                                        { value: '700', label: 'Bold' },
                                        { value: '800', label: 'ExtraBold' },
                                        { value: '900', label: 'Black' },
                                    ]} />
                                </div>
                                <div>
                                    <Label>Line Height</Label>
                                    <NumberInput value={s.headingLineHeight || ''} onChange={v => onChange('headingLineHeight', v)} unit="" />
                                </div>
                                <div>
                                    <Label>Transform</Label>
                                    <Select value={s.textTransform || 'uppercase'} onChange={v => onChange('textTransform', v)} options={[
                                        { value: 'none', label: 'None' },
                                        { value: 'uppercase', label: 'Uppercase' },
                                        { value: 'capitalize', label: 'Capitalize' },
                                    ]} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="h-px bg-slate-100 dark:bg-slate-800" />
                </>
            )}

            {/* Card Layout Styles */}
            {['category-grid', 'brand-grid', 'review-slider', 'stats-counter'].includes(nodeType) && (
                <>
                    <div>
                        <p className="text-[9px] font-bold text-brand-600 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                            <span className="text-base">🎴</span> Card & Item Styles
                        </p>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label>Card Background</Label>
                                    <ColorInput value={s.cardBackgroundColor || ''} onChange={v => onChange('cardBackgroundColor', v)} />
                                </div>
                                <div>
                                    <Label>Card Radius</Label>
                                    <NumberInput value={s.cardRadius || ''} onChange={v => onChange('cardRadius', v)} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label>Card Border</Label>
                                    <Select value={s.cardBorder || 'none'} onChange={v => onChange('cardBorder', v)} options={[
                                        { value: 'none', label: 'None' },
                                        { value: 'thin', label: 'Thin (1px)' },
                                        { value: 'medium', label: 'Medium (2px)' },
                                        { value: 'thick', label: 'Thick (4px)' },
                                    ]} />
                                </div>
                                <div>
                                    <Label>Card Shadow</Label>
                                    <Select value={s.cardShadow || 'none'} onChange={v => onChange('cardShadow', v)} options={[
                                        { value: 'none', label: 'None' },
                                        { value: 'small', label: 'Small' },
                                        { value: 'medium', label: 'Medium' },
                                        { value: 'large', label: 'Large' },
                                    ]} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="h-px bg-slate-100 dark:bg-slate-800" />
                </>
            )}

            {/* Component Special Styles */}
            {isHeroType && (
                <>
                    <div>
                        <p className="text-[9px] font-bold text-brand-600 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                            <span className="text-base">💎</span> Offer Banner Styles
                        </p>
                        <div className="space-y-4">

                            {/* Min Height */}
                            <div>
                                <Label isResponsive viewMode={viewMode}>Min Height</Label>
                                <NumberInput value={s.minHeight || ''} onChange={v => handleUpdate('minHeight', v)} placeholder="200" />
                            </div>

                            {/* Overlay */}
                            <div>
                                <Label>Overlay Opacity ({s.overlayOpacity ?? 70}%)</Label>
                                <input
                                    type="range"
                                    min={0} max={100}
                                    value={s.overlayOpacity ?? 70}
                                    onChange={e => onChange('overlayOpacity', parseInt(e.target.value))}
                                    className="w-full accent-brand-600"
                                />
                            </div>

                            {/* Text alignment */}
                            <div>
                                <Label>Content Alignment</Label>
                                <Select value={s.textAlign || 'left'} onChange={v => onChange('textAlign', v)} options={[
                                    { value: 'left', label: 'Left' },
                                    { value: 'center', label: 'Center' },
                                    { value: 'right', label: 'Right' },
                                ]} />
                            </div>

                            {/* Font size */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label isResponsive viewMode={viewMode}>Font Size</Label>
                                    <NumberInput value={s.fontSize || ''} onChange={v => handleUpdate('fontSize', v)} placeholder="auto" />
                                </div>
                                <div>
                                    <Label>Font Weight</Label>
                                    <Select value={s.fontWeight || '900'} onChange={v => onChange('fontWeight', v)} options={[
                                        { value: '400', label: 'Normal' },
                                        { value: '600', label: 'SemiBold' },
                                        { value: '700', label: 'Bold' },
                                        { value: '800', label: 'ExtraBold' },
                                        { value: '900', label: 'Black' },
                                    ]} />
                                </div>
                            </div>

                            {/* Colors */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label>Headline Color</Label>
                                    <ColorInput value={s.headlineColor || ''} onChange={v => onChange('headlineColor', v)} />
                                </div>
                                <div>
                                    <Label>Subline Color</Label>
                                    <ColorInput value={s.sublineColor || ''} onChange={v => onChange('sublineColor', v)} />
                                </div>
                                <div>
                                    <Label>Icon Color</Label>
                                    <ColorInput value={s.iconColor || ''} onChange={v => onChange('iconColor', v)} />
                                </div>
                                <div>
                                    <Label>Icon Background</Label>
                                    <ColorInput value={s.iconBgColor || ''} onChange={v => onChange('iconBgColor', v)} />
                                </div>
                                <div>
                                    <Label>Button Color</Label>
                                    <ColorInput value={s.buttonColor || ''} onChange={v => onChange('buttonColor', v)} />
                                </div>
                                <div>
                                    <Label>Button Text Color</Label>
                                    <ColorInput value={s.buttonTextColor || ''} onChange={v => onChange('buttonTextColor', v)} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="h-px bg-slate-100 dark:bg-slate-800" />
                </>
            )}

            {/* Button-specific styles */}
            {['button', 'contact'].includes(nodeType) && (
                <>
                    <div>
                        <p className="text-[9px] font-bold text-brand-600 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                            <span className="text-base">🎨</span> Button Styles
                        </p>
                        <div className="space-y-4">

                            {/* Colors */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label>Background Color</Label>
                                    <ColorInput value={s.buttonColor || ''} onChange={v => onChange('buttonColor', v)} />
                                </div>
                                <div>
                                    <Label>Text Color</Label>
                                    <ColorInput value={s.buttonTextColor || ''} onChange={v => onChange('buttonTextColor', v)} />
                                </div>
                                <div>
                                    <Label>Border / Outline Color</Label>
                                    <ColorInput value={s.borderColor || ''} onChange={v => onChange('borderColor', v)} />
                                </div>
                                <div>
                                    <Label>Border Width</Label>
                                    <NumberInput value={s.borderWidth || ''} onChange={v => onChange('borderWidth', v)} />
                                </div>
                            </div>

                            {/* Shape */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label>Border Radius</Label>
                                    <NumberInput value={s.borderRadius || ''} onChange={v => onChange('borderRadius', v)} />
                                </div>
                                <div>
                                    <Label>Alignment</Label>
                                    <Select value={s.textAlign || 'center'} onChange={v => onChange('textAlign', v)} options={[
                                        { value: 'left', label: 'Left' },
                                        { value: 'center', label: 'Center' },
                                        { value: 'right', label: 'Right' },
                                    ]} />
                                </div>
                            </div>

                            {/* Typography */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label isResponsive viewMode={viewMode}>Font Size</Label>
                                    <NumberInput value={s.fontSize || ''} onChange={v => handleUpdate('fontSize', v)} />
                                </div>
                                <div>
                                    <Label>Font Weight</Label>
                                    <Select value={s.fontWeight || '800'} onChange={v => onChange('fontWeight', v)} options={[
                                        { value: '400', label: 'Normal' },
                                        { value: '500', label: 'Medium' },
                                        { value: '600', label: 'SemiBold' },
                                        { value: '700', label: 'Bold' },
                                        { value: '800', label: 'ExtraBold' },
                                        { value: '900', label: 'Black' },
                                    ]} />
                                </div>
                                <div>
                                    <Label>Letter Spacing</Label>
                                    <NumberInput value={s.letterSpacing || ''} onChange={v => onChange('letterSpacing', v)} unit="em" />
                                </div>
                                <div>
                                    <Label>Text Transform</Label>
                                    <Select value={s.textTransform || 'uppercase'} onChange={v => onChange('textTransform', v)} options={[
                                        { value: 'none', label: 'None' },
                                        { value: 'uppercase', label: 'Uppercase' },
                                        { value: 'capitalize', label: 'Capitalize' },
                                    ]} />
                                </div>
                            </div>

                            {/* Spacing overrides */}
                            <div className="grid grid-cols-2 gap-2">
                                {([
                                    ['paddingTop', 'Pad Top'],
                                    ['paddingBottom', 'Pad Bottom'],
                                    ['paddingLeft', 'Pad Left'],
                                    ['paddingRight', 'Pad Right'],
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
                    </div>
                    <div className="h-px bg-slate-100 dark:bg-slate-800" />
                </>
            )}

            {/* Spacing (for non-button types) */}
            <div>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    <span className="text-base">🚀</span> Spacing
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

            {/* Text */}
            {!['brand-grid'].includes(nodeType) && (
                <>
                    <div>
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                            <span className="text-base">✍️</span> Typography
                        </p>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label>Base Color</Label>
                                    <ColorInput value={s.color || s.textColor || ''} onChange={v => { onChange('color', v); onChange('textColor', v); }} />
                                </div>
                                <div>
                                    {(() => {
                                        const { value } = getProp('textAlign');
                                        return (
                                            <>
                                                <Label isResponsive viewMode={viewMode}>Align</Label>
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

                            <div className="grid grid-cols-2 gap-3">
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
                                    <Label>Font Weight</Label>
                                    <Select value={s.fontWeight} onChange={v => onChange('fontWeight', v)} options={[
                                        { value: '400', label: 'Normal' },
                                        { value: '500', label: 'Medium' },
                                        { value: '600', label: 'SemiBold' },
                                        { value: '700', label: 'Bold' },
                                        { value: '800', label: 'ExtraBold' },
                                        { value: '900', label: 'Black' },
                                    ]} />
                                </div>
                                <div>
                                    <Label>Line Height</Label>
                                    <NumberInput value={s.lineHeight || ''} onChange={v => onChange('lineHeight', v)} unit="" />
                                </div>
                                <div>
                                    <Label>Uppercase</Label>
                                    <Select value={s.textTransform} onChange={v => onChange('textTransform', v)} options={[
                                        { value: 'none', label: 'None' },
                                        { value: 'uppercase', label: 'Yes' },
                                    ]} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="h-px bg-slate-100 dark:bg-slate-800" />
                </>
            )}

            {/* FAQ-specific styles */}
            {nodeType === 'faq-section' && (
                <>
                    <div>
                        <p className="text-[9px] font-bold text-brand-600 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                            <span className="text-base">❓</span> FAQ Item Styles
                        </p>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label>Question Color</Label>
                                    <ColorInput value={s.questionColor || s.headlineColor || ''} onChange={v => onChange('questionColor', v)} />
                                </div>
                                <div>
                                    <Label>Answer Color</Label>
                                    <ColorInput value={s.answerColor || s.color || ''} onChange={v => onChange('answerColor', v)} />
                                </div>
                                <div>
                                    <Label>Icon Color</Label>
                                    <ColorInput value={s.iconColor || ''} onChange={v => onChange('iconColor', v)} />
                                </div>
                                <div>
                                    <Label>Icon Background</Label>
                                    <ColorInput value={s.iconBgColor || ''} onChange={v => onChange('iconBgColor', v)} />
                                </div>
                                <div>
                                    <Label>Item Background</Label>
                                    <ColorInput value={s.cardBackgroundColor || ''} onChange={v => onChange('cardBackgroundColor', v)} />
                                </div>
                                <div>
                                    <Label>Item Border</Label>
                                    <ColorInput value={s.borderColor || ''} onChange={v => onChange('borderColor', v)} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label>Item Radius</Label>
                                    <NumberInput value={s.cardRadius || ''} onChange={v => onChange('cardRadius', v)} />
                                </div>
                                <div>
                                    <Label>Font Size</Label>
                                    <NumberInput value={s.fontSize || ''} onChange={v => onChange('fontSize', v)} placeholder="auto" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="h-px bg-slate-100 dark:bg-slate-800" />
                </>
            )}
            {/* Contact-specific styles */}
            {nodeType === 'contact' && (
                <>
                    <div>
                        <p className="text-[9px] font-bold text-brand-600 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                            <span className="text-base">📞</span> Contact Page Styles
                        </p>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label>Heading Color</Label>
                                    <ColorInput value={s.cardHeadingColor || ''} onChange={v => onChange('cardHeadingColor', v)} />
                                </div>
                                <div>
                                    <Label>Heading Size</Label>
                                    <NumberInput value={s.cardHeadingSize || ''} onChange={v => onChange('cardHeadingSize', v)} />
                                </div>
                                <div>
                                    <Label>Heading Weight</Label>
                                    <Select value={s.cardHeadingWeight || '900'} onChange={v => onChange('cardHeadingWeight', v)} options={[
                                        { value: '400', label: 'Normal' },
                                        { value: '600', label: 'SemiBold' },
                                        { value: '700', label: 'Bold' },
                                        { value: '800', label: 'ExtraBold' },
                                        { value: '900', label: 'Black' },
                                    ]} />
                                </div>
                                <div>
                                    <Label>Info Card Bg</Label>
                                    <ColorInput value={s.cardBackgroundColor || ''} onChange={v => onChange('cardBackgroundColor', v)} />
                                </div>
                                <div>
                                    <Label>Form Card Bg</Label>
                                    <ColorInput value={s.formBgColor || ''} onChange={v => onChange('formBgColor', v)} />
                                </div>
                                <div>
                                    <Label>Icon Color</Label>
                                    <ColorInput value={s.iconColor || ''} onChange={v => onChange('iconColor', v)} />
                                </div>
                                <div>
                                    <Label>Icon Background</Label>
                                    <ColorInput value={s.iconBgColor || ''} onChange={v => onChange('iconBgColor', v)} />
                                </div>
                                <div>
                                    <Label>Input Background</Label>
                                    <ColorInput value={s.inputBgColor || ''} onChange={v => onChange('inputBgColor', v)} />
                                </div>
                                <div>
                                    <Label>Input Border</Label>
                                    <ColorInput value={s.inputBorderColor || ''} onChange={v => onChange('inputBorderColor', v)} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label>Card Radius</Label>
                                    <NumberInput value={s.cardRadius || ''} onChange={v => onChange('cardRadius', v)} />
                                </div>
                                <div>
                                    <Label>Gap Between</Label>
                                    <NumberInput value={s.gap || ''} onChange={v => onChange('gap', v)} />
                                </div>
                                <div>
                                    <Label>Title Align</Label>
                                    <Select value={s.titleAlign || 'left'} onChange={v => onChange('titleAlign', v)} options={[
                                        { value: 'left', label: 'Left' },
                                        { value: 'center', label: 'Center' },
                                        { value: 'right', label: 'Right' },
                                    ]} />
                                </div>
                                <div>
                                    <Label>Label Align</Label>
                                    <Select value={s.labelAlign || 'left'} onChange={v => onChange('labelAlign', v)} options={[
                                        { value: 'left', label: 'Left' },
                                        { value: 'center', label: 'Center' },
                                        { value: 'right', label: 'Right' },
                                    ]} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="h-px bg-slate-100 dark:bg-slate-800" />
                </>
            )}

            {/* Background */}
            <div>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    <span className="text-base">🎨</span> Background
                </p>
                <div className="space-y-2">
                    <Label>Section Background</Label>
                    <ColorInput value={s.backgroundColor || ''} onChange={v => onChange('backgroundColor', v)} />
                </div>
            </div>

            <div className="h-px bg-slate-100 dark:bg-slate-800" />

            {/* Border */}
            {!['brand-grid'].includes(nodeType) && (
                <>
                    <div>
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                            <span className="text-base">🔲</span> Border & Radius
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <Label>Radius</Label>
                                <NumberInput value={s.borderRadius || ''} onChange={v => onChange('borderRadius', v)} />
                            </div>
                            <div>
                                <Label>Width</Label>
                                <NumberInput value={s.borderWidth || ''} onChange={v => onChange('borderWidth', v)} />
                            </div>
                        </div>
                        <div className="mt-4 space-y-3">
                            <div>
                                <Label>Border Color</Label>
                                <ColorInput value={s.borderColor || ''} onChange={v => onChange('borderColor', v)} />
                            </div>
                            <div>
                                <Label>Border Style</Label>
                                <Select value={s.borderStyle} onChange={v => onChange('borderStyle', v)} options={[
                                    { value: 'solid', label: 'Solid' },
                                    { value: 'dashed', label: 'Dashed' },
                                    { value: 'dotted', label: 'Dotted' },
                                    { value: 'none', label: 'None' },
                                ]} />
                            </div>
                        </div>
                    </div>
                    <div className="h-px bg-slate-100 dark:bg-slate-800" />
                </>
            )}

            {/* Effects */}
            {!['brand-grid'].includes(nodeType) && (
                <>
                    <div>
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                            <span className="text-base">✨</span> Visual Effects
                        </p>
                        <div className="space-y-4">
                            <div>
                                <Label>Box Shadow</Label>
                                <input
                                    type="text"
                                    value={s.boxShadow || ''}
                                    onChange={e => onChange('boxShadow', e.target.value)}
                                    placeholder="0 4px 24px rgba(0,0,0,0.1)"
                                    className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all shadow-inner"
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
                </>
            )}

        </div>
    );
}
