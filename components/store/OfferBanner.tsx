import { Tag } from "lucide-react";

export default function OfferBanner({ buttonText, headline, subline, backgroundColor, styles }: { buttonText: string, headline: string, subline: string, backgroundColor: string, styles: any }) {

    return (
        <section style={{
            ...styles,
            height: styles?.height ? `${styles.height}px` : 'auto',
            paddingTop: styles?.paddingTop,
            paddingBottom: styles?.paddingBottom,
            backgroundColor: backgroundColor || styles?.backgroundColor || '#6366f1',
            color: styles?.color
        }}
            className={`relative overflow-hidden group 
                ${!styles?.paddingTop && !styles?.paddingBottom ? 'px-10 py-8' : 'px-10'}
                ${styles?.textAlign === 'center' ? 'text-center' : ''}
                ${styles?.textAlign === 'right' ? 'text-right' : ''}
            `}
        >
            <div className="absolute top-0 right-0 w-64 h-full bg-white/10 skew-x-12 transform translate-x-32" />
            <div className={`max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-6 relative z-10 
                ${styles?.textAlign === 'center' ? 'justify-center' : 'justify-between'}
                ${styles?.textAlign === 'right' ? 'flex-row-reverse justify-end' : ''}
            `}>
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center backdrop-blur-md"
                        style={{
                            backgroundColor: styles?.iconBgColor || 'rgba(255, 255, 255, 0.2)',
                            border: styles?.iconBorder || 'none'
                        }}>
                        <Tag className="w-8 h-8" style={{ color: styles?.iconColor || styles?.color || '#ffffff' }} />
                    </div>
                    <div className={`${styles?.textAlign === 'center' ? 'text-center' : 'text-center md:text-left'}`}>
                        <h2
                            className="text-2xl font-black uppercase tracking-tighter drop-shadow-lg"
                            style={{ color: styles?.headlineColor || styles?.color || '#ffffff' }}
                        >
                            {headline || 'FLASH SALE'}
                        </h2>
                        <p
                            className="font-bold uppercase tracking-widest text-[10px]"
                            style={{ color: styles?.sublineColor || styles?.color || 'rgba(255, 255, 255, 0.8)' }}
                        >
                            {subline || 'Limited time offer'}
                        </p>
                    </div>
                </div>
                {buttonText && (
                    <button
                        className="px-10 py-4 font-black rounded-xl shadow-2xl hover:scale-105 transition-transform uppercase tracking-widest text-sm whitespace-nowrap"
                        style={{
                            backgroundColor: styles?.buttonColor || '#ffffff',
                            color: styles?.buttonTextColor || '#2563eb'
                        }}
                    >
                        {buttonText}
                    </button>
                )}
            </div>
        </section>
    )
}   