import { MousePointer2 } from "lucide-react";
import Link from "next/link";

export default function BuilderButton({ variant, size, text, styles, link }: { variant: string, size: string, text: string, styles: any, link?: string }) {
    const alignment = styles?.textAlign === 'left' ? 'justify-start' : styles?.textAlign === 'right' ? 'justify-end' : 'justify-center';

    const cardRadiusClass = styles?.cardRadius === 'small' ? 'rounded-lg' :
        styles?.cardRadius === 'large' ? 'rounded-[2rem]' :
            styles?.cardRadius === 'full' ? 'rounded-full' :
                styles?.cardRadius === 'none' ? 'rounded-none' : 'rounded-xl';

    const buttonStyle: any = {
        borderRadius: styles?.borderRadius || undefined,
        letterSpacing: styles?.letterSpacing || undefined,
        fontWeight: styles?.fontWeight || undefined,
        fontSize: styles?.fontSize || undefined,
    };

    if (variant === 'outline') {
        if (styles?.buttonColor) {
            buttonStyle.borderColor = styles.buttonColor;
            buttonStyle.color = styles.buttonColor;
        }
    } else {
        if (styles?.buttonColor) buttonStyle.backgroundColor = styles.buttonColor;
        if (styles?.buttonTextColor) buttonStyle.color = styles.buttonTextColor;
    }

    const buttonClasses = `
        transition-all duration-300 flex items-center gap-4 group uppercase tracking-widest
        ${cardRadiusClass}
        ${variant === 'outline' ? 'border-2' : 'shadow-lg'}
        ${size === 'sm' ? 'px-6 py-2 text-xs' : size === 'lg' ? 'px-16 py-5 text-lg' : 'px-10 py-3 text-sm'}
    `;

    return (
        <div className={`w-full flex ${alignment}`}>
            {link ? (
                <Link href={link || '#'} style={buttonStyle} className={buttonClasses}>
                    <span>{text || 'Shop Now'}</span>
                    <MousePointer2 className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </Link>
            ) : (
                <button
                    style={buttonStyle}
                    className={buttonClasses}
                >
                    <span>{text || 'Shop Now'}</span>
                    <MousePointer2 className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </button>
            )}
        </div>
    );
}