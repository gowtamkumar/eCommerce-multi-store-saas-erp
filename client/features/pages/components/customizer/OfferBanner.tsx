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
        backgroundImage: settingsBackgroundImage,
        layout = 'left'
    } = settings || {};

    const backgroundImage = settingsBackgroundImage || styles?.backgroundImage;

    return (
        <div className="w-full overflow-hidden">
            <div className="w-full overflow-hidden">
                {backgroundImage && (
                    <div
                        className="absolute inset-0 w-full h-full bg-cover bg-center z-0"
                        style={{
                            backgroundImage: `url("${backgroundImage}")`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                        }}
                    />
                )}

                {backgroundImage && (
                    <div
                        className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-0"
                        style={{ opacity: (styles?.overlayOpacity ?? 60) / 100 }}
                    />
                )}

                <div className="absolute top-0 right-0 w-64 h-full bg-white/10 skew-x-12 transform translate-x-32 z-0" />

                <div className={`max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12 relative z-10 
                    ${layout === 'right' ? 'md:flex-row-reverse' : ''}
                    ${styles?.textAlign === 'center' ? 'justify-center' : 'justify-between'}
                `}>
                    {image && (
                        <div className="flex-1 w-full md:w-auto flex justify-center">
                            <div className="w-48 h-48 md:w-64 md:h-64 rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20 shrink-0">
                                <img src={image} alt="" className="w-full h-full object-cover" />
                            </div>
                        </div>
                    )}

                    {!image && (
                        <div className="flex justify-center md:justify-start">
                            <div className="w-20 h-20 rounded-2xl flex items-center justify-center backdrop-blur-md shrink-0"
                                style={{
                                    backgroundColor: styles?.iconBgColor || 'rgba(255, 255, 255, 0.2)',
                                    border: styles?.iconBorder || 'none'
                                }}>
                                <Tag className="w-10 h-10" style={{ color: styles?.iconColor || styles?.color || '#ffffff' }} />
                            </div>
                        </div>
                    )}

                    <div className={`flex-1 space-y-8 w-full
                        ${styles?.textAlign === 'center' ? 'text-center' : styles?.textAlign === 'right' ? 'text-right' : 'text-left'}
                    `}>
                        <div className="space-y-4">
                            <h2
                                className="text-3xl md:text-6xl font-black uppercase tracking-tighter drop-shadow-2xl"
                                style={{ color: styles?.headlineColor || (backgroundImage ? '#ffffff' : styles?.color) }}
                            >
                                {headline || 'FLASH SALE'}
                            </h2>
                            <p
                                className="font-bold uppercase tracking-widest text-sm md:text-xl opacity-90 drop-shadow-md"
                                style={{ color: styles?.sublineColor || (backgroundImage ? 'rgba(255, 255, 255, 0.9)' : styles?.color) }}
                            >
                                {subline || 'Limited time offer'}
                            </p>
                        </div>

                        <div className={`flex flex-wrap gap-4
                            ${styles?.textAlign === 'center' ? 'justify-center' : styles?.textAlign === 'right' ? 'justify-end' : 'justify-start'}
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
                </div>
            </div>
        </div>
    );
}