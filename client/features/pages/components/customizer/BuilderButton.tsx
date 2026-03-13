import { MousePointer2 } from "lucide-react";
import Link from "next/link";

interface BuilderButtonProps {
    variant?: string;
    size?: string;
    text?: string;
    styles?: any;
    link?: string;
}

/* ── Resolve a px/number value ── */
function px(v: string | number | undefined): string | undefined {
    if (v === undefined || v === "" || v === null) return undefined;
    return typeof v === "number" ? `${v}px` : String(v);
}

export default function BuilderButton({ variant = 'solid', size = 'md', text, styles, link }: BuilderButtonProps) {

    /* ── Alignment (page builder textAlign) ── */
    const alignment =
        styles?.textAlign === 'left' ? 'justify-start' :
            styles?.textAlign === 'right' ? 'justify-end' : 'justify-center';

    /* ── Border radius: page builder borderRadius > cardRadius preset ── */
    const resolvedRadius = px(styles?.borderRadius) || (
        styles?.cardRadius === 'small' ? '8px' :
            styles?.cardRadius === 'large' ? '2rem' :
                styles?.cardRadius === 'full' ? '9999px' :
                    styles?.cardRadius === 'none' ? '0' : '12px'
    );

    /* ── Size classes — 3-step responsive ── */
    const sizeClasses =
        size === 'sm'
            ? 'px-4 py-1.5 text-xs gap-2'
            : size === 'lg'
                ? 'px-6 py-3 sm:px-10 sm:py-4 md:px-14 md:py-5 text-sm sm:text-base md:text-lg gap-3'
                : 'px-5 py-2.5 sm:px-8 sm:py-3 md:px-10 md:py-3.5 text-xs sm:text-sm gap-2.5';

    /* ── Override size padding if page builder sets explicit padding ── */
    const hasPad = styles?.paddingTop !== undefined || styles?.paddingLeft !== undefined;
    const customPadding: React.CSSProperties = hasPad ? {
        paddingTop: px(styles?.paddingTop),
        paddingBottom: px(styles?.paddingBottom),
        paddingLeft: px(styles?.paddingLeft),
        paddingRight: px(styles?.paddingRight),
    } : {};

    /* ── Icon size matches button size ── */
    const iconClass =
        size === 'sm' ? 'w-3.5 h-3.5' :
            size === 'lg' ? 'w-5 h-5 sm:w-6 sm:h-6' : 'w-4 h-4 sm:w-5 sm:h-5';

    /* ── Button inline style — all page builder tokens applied ── */
    const buttonStyle: React.CSSProperties = {
        borderRadius: resolvedRadius,
        /* Typography */
        fontSize: px(styles?.fontSize),
        fontWeight: styles?.fontWeight || 800,
        letterSpacing: styles?.letterSpacing,
        lineHeight: styles?.lineHeight,
        textTransform: (styles?.textTransform as React.CSSProperties['textTransform']) || 'uppercase',
        /* Custom padding override */
        ...customPadding,
    };

    /* ── Variant-specific colors ── */
    if (variant === 'outline') {
        buttonStyle.background = 'transparent';
        const outlineColor = styles?.borderColor || styles?.buttonColor || styles?.color || '#6366f1';
        buttonStyle.borderColor = outlineColor;
        buttonStyle.color = styles?.buttonTextColor || outlineColor;
        if (styles?.borderWidth) buttonStyle.borderWidth = `${typeof styles.borderWidth === 'number' ? styles.borderWidth : parseInt(styles.borderWidth) || 2}px`;
    } else if (variant === 'ghost') {
        buttonStyle.background = 'transparent';
        buttonStyle.color = styles?.buttonColor || styles?.color || '#6366f1';
    } else {
        // solid (default)
        buttonStyle.backgroundColor = styles?.buttonColor || styles?.backgroundColor || '#6366f1';
        buttonStyle.color = styles?.buttonTextColor || '#ffffff';
        if (styles?.borderColor) { buttonStyle.borderColor = styles.borderColor; buttonStyle.borderStyle = 'solid'; }
        if (styles?.borderWidth) buttonStyle.borderWidth = `${typeof styles.borderWidth === 'number' ? styles.borderWidth : parseInt(styles.borderWidth) || 0}px`;
    }

    /* ── Outer wrapper margin — from page builder margin controls ── */
    const wrapperStyle: React.CSSProperties = {
        marginTop: px(styles?.marginTop),
        marginBottom: px(styles?.marginBottom),
        marginLeft: px(styles?.marginLeft),
        marginRight: px(styles?.marginRight),
    };

    /* ── Base classes ── */
    const baseClasses = [
        'relative inline-flex items-center font-bold',
        'transition-all duration-300',
        'hover:scale-105 active:scale-95 hover:shadow-xl',
        'overflow-hidden group',
        hasPad ? '' : sizeClasses,   // skip Tailwind size padding if custom padding set
        variant === 'outline' ? 'border-2' : '',
    ].filter(Boolean).join(' ');

    const inner = (
        <>
            {/* Shimmer sweep on hover (solid only) */}
            {variant === 'solid' && (
                <span
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{ background: 'linear-gradient(90deg,transparent 0%,rgba(255,255,255,.2) 50%,transparent 100%)' }}
                />
            )}
            <span className="relative">{text || 'Shop Now'}</span>
            <MousePointer2
                className={`${iconClass} relative flex-shrink-0 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1`}
            />
        </>
    );

    return (
        <div className={`w-full flex ${alignment}`} style={wrapperStyle}>
            {link ? (
                <Link href={link} style={buttonStyle} className={baseClasses}>
                    {inner}
                </Link>
            ) : (
                <button type="button" style={buttonStyle} className={baseClasses}>
                    {inner}
                </button>
            )}
        </div>
    );
}