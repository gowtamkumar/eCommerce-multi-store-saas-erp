import { Tag } from "lucide-react";
import Link from "next/link";

export default function OfferBanner({ settings, styles }: { settings: any, styles: any }) {
    const {
        headline,
        subline,
        buttonText,
        buttonLink,
        secondaryButtonText,
        secondaryButtonLink,
        image,
        backgroundImage,
        layout = 'left'
    } = settings || {};

    return (
        <section style={{
            ...styles,
            height: styles?.height ? `${styles.height}px` : 'auto',
            paddingTop: styles?.paddingTop,
            paddingBottom: styles?.paddingBottom,
            backgroundColor: styles?.backgroundColor || '#6366f1',
            color: styles?.color || (backgroundImage ? '#ffffff' : undefined),
            backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
        }}
            className={`relative overflow-hidden group 
                ${!styles?.paddingTop && !styles?.paddingBottom ? 'px-10 py-16' : 'px-10'}
                ${styles?.textAlign === 'center' ? 'text-center' : ''}
                ${styles?.textAlign === 'right' ? 'text-right' : ''}
            `}
        >
            {backgroundImage && (
                <div
                    className="absolute inset-0 bg-black/40 z-0"
                    style={{ opacity: (styles?.overlayOpacity ?? 40) / 100 }}
                />
            )}

            <div className="absolute top-0 right-0 w-64 h-full bg-white/10 skew-x-12 transform translate-x-32 z-0" />

            <div className={`max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12 relative z-10 
                ${layout === 'right' ? 'md:flex-row-reverse' : ''}
                ${styles?.textAlign === 'center' ? 'justify-center' : 'justify-between'}
            `}>
                <div className={`flex flex-col md:flex-row items-center gap-8 flex-1
                    ${layout === 'right' ? 'md:flex-row-reverse' : ''}
                    ${styles?.textAlign === 'center' ? 'text-center' : styles?.textAlign === 'right' ? 'text-right md:items-end' : 'text-left md:items-start'}
                `}>
                    {image ? (
                        <div className="w-32 h-32 md:w-48 md:h-48 rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20 shrink-0">
                            <img src={image} alt="" className="w-full h-full object-cover" />
                        </div>
                    ) : (
                        <div className="w-20 h-20 rounded-2xl flex items-center justify-center backdrop-blur-md shrink-0"
                            style={{
                                backgroundColor: styles?.iconBgColor || 'rgba(255, 255, 255, 0.2)',
                                border: styles?.iconBorder || 'none'
                            }}>
                            <Tag className="w-10 h-10" style={{ color: styles?.iconColor || styles?.color || '#ffffff' }} />
                        </div>
                    )}

                    <div className="space-y-4">
                        <h2
                            className="text-3xl md:text-5xl font-black uppercase tracking-tighter drop-shadow-lg"
                            style={{ color: styles?.headlineColor || styles?.color || '#ffffff' }}
                        >
                            {headline || 'FLASH SALE'}
                        </h2>
                        <p
                            className="font-bold uppercase tracking-widest text-xs md:text-base opacity-90"
                            style={{ color: styles?.sublineColor || styles?.color || 'rgba(255, 255, 255, 0.8)' }}
                        >
                            {subline || 'Limited time offer'}
                        </p>
                    </div>
                </div>

                <div className={`flex flex-wrap gap-4
                    ${styles?.textAlign === 'center' ? 'justify-center w-full md:w-auto' : ''}
                    ${styles?.textAlign === 'right' ? 'justify-end' : 'justify-start md:justify-end'}
                `}>
                    {buttonText && (
                        <Link
                            href={buttonLink || '#'}
                            className="px-10 py-4 font-black rounded-xl shadow-2xl hover:scale-105 transition-transform uppercase tracking-widest text-sm whitespace-nowrap text-center"
                            style={{
                                backgroundColor: styles?.buttonColor || '#ffffff',
                                color: styles?.buttonTextColor || '#2563eb'
                            }}
                        >
                            {buttonText}
                        </Link>
                    )}
                    {secondaryButtonText && (
                        <Link
                            href={secondaryButtonLink || '#'}
                            className="px-10 py-4 font-black rounded-xl border-2 border-white/30 backdrop-blur-md hover:bg-white/10 transition-all uppercase tracking-widest text-sm whitespace-nowrap text-center text-white"
                        >
                            {secondaryButtonText}
                        </Link>
                    )}
                </div>
            </div>
        </section>
    );
}   