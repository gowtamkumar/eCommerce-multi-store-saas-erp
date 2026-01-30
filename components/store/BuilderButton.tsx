import { MousePointer2 } from "lucide-react";
import Link from "next/link";

export default function BuilderButton({ variant, size, text, styles, link }: { variant: string, size: string, text: string, styles: any, link?: string }) {
    const alignment = styles?.textAlign === 'left' ? 'justify-start' : styles?.textAlign === 'right' ? 'justify-end' : 'justify-center';

    const buttonStyle: any = {};
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
        font-black rounded-[2rem] transition-all duration-300 uppercase tracking-[0.4em] flex items-center gap-4 group
        ${variant === 'outline' ? 'border-4 border-brand-600 text-brand-600 bg-transparent' : 'bg-brand-600 text-white shadow-2xl'}
        ${size === 'sm' ? 'px-8 py-3 text-xs' : size === 'lg' ? 'px-24 py-8 text-lg' : 'px-16 py-6 text-sm'}
    `;

    return (
        <div
            style={{
                ...styles,
                paddingTop: styles?.paddingTop,
                paddingBottom: styles?.paddingBottom,
                backgroundColor: styles?.backgroundColor
            }}
            className={`px-4 md:px-10 flex ${alignment} ${!styles?.paddingTop && !styles?.paddingBottom ? 'py-12' : ''}`}
        >
            {link ? (
                <Link href={link} style={buttonStyle} className={buttonClasses}>
                    <span>{text || 'Shop The Look'}</span>
                    <MousePointer2 className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </Link>
            ) : (
                <button
                    style={buttonStyle}
                    className={buttonClasses}
                >
                    <span>{text || 'Shop The Look'}</span>
                    <MousePointer2 className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </button>
            )}
        </div>
    )


}