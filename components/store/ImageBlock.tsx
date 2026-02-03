import Link from "next/link";

export default function ImageBlock({ settings, styles }: { settings: any, styles: any }) {
    const {
        image,
        headline,
        subline,
        buttonText,
        buttonUrl,
        secondaryButtonText,
        secondaryButtonLink,
        layout = 'left',
        backgroundImage: settingsBackgroundImage
    } = settings || {};

    const backgroundImage = settingsBackgroundImage || styles?.backgroundImage;

    return (
        <section
            style={{
                ...styles,
                paddingTop: styles?.paddingTop,
                paddingBottom: styles?.paddingBottom,
                backgroundColor: styles?.backgroundColor,
                color: styles?.color || (backgroundImage ? '#ffffff' : undefined)
            }}
            className={`relative overflow-hidden px-4 md:px-10 ${!styles?.paddingTop && !styles?.paddingBottom ? 'py-20 md:py-32' : ''}`}
        >
            {backgroundImage && (
                <>
                    <div
                        className="absolute inset-0 w-full h-full bg-cover bg-center z-0"
                        style={{
                            backgroundImage: `url("${backgroundImage}")`,
                        }}
                    />
                    <div
                        className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-0"
                        style={{ opacity: (styles?.overlayOpacity ?? 60) / 100 }}
                    />
                </>
            )}

            <div className={`max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16 md:gap-24 relative z-10 ${layout === 'right' ? 'md:flex-row-reverse' : ''}`}>
                <div className="flex-1 w-full relative group">
                    <div className="aspect-[4/5] bg-slate-100 dark:bg-slate-800 rounded-3xl md:rounded-[4rem] border-8 md:border-[12px] border-white dark:border-slate-800 shadow-2xl flex items-center justify-center overflow-hidden transition-all duration-700">
                        {image ? (
                            <img src={image} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        ) : (
                            <span className="text-9xl grayscale group-hover:grayscale-0 transition-all duration-700">🖼️</span>
                        )}
                    </div>
                </div>
                <div className={`flex-1 space-y-10
                    ${styles?.textAlign === 'center' ? 'text-center' : ''}
                    ${styles?.textAlign === 'right' ? 'text-right' : ''}
                    ${!styles?.textAlign || styles?.textAlign === 'left' ? 'text-left' : ''}
                `}>
                    <div className="space-y-6">
                        <h2
                            className="text-5xl md:text-8xl font-black leading-[0.9] tracking-tighter drop-shadow-2xl"
                            style={{ color: styles?.headlineColor || (backgroundImage ? '#ffffff' : styles?.color) }}
                        >
                            {headline || 'Pure Vision'}
                        </h2>
                        <div
                            className={`w-16 h-2 rounded-full
                                ${styles?.textAlign === 'center' ? 'mx-auto' : ''}
                                ${styles?.textAlign === 'right' ? 'ml-auto' : ''}
                                ${!styles?.textAlign || styles?.textAlign === 'left' ? 'mr-auto' : ''}
                            `}
                            style={{ backgroundColor: styles?.sublineColor || '#4f46e5' }}
                        />
                    </div>
                    <p
                        className="text-xl md:text-2xl opacity-80 leading-relaxed font-medium drop-shadow-md"
                        style={{ color: backgroundImage ? 'rgba(255, 255, 255, 0.9)' : styles?.color }}
                    >
                        {subline || 'Feature your most important brand assets or stories here with high-quality imagery.'}
                    </p>
                    <div className={`flex flex-wrap gap-4
                        ${styles?.textAlign === 'center' ? 'justify-center' : ''}
                        ${styles?.textAlign === 'right' ? 'justify-end' : 'justify-start'}
                    `}>
                        {buttonText && (
                            <Link
                                href={buttonUrl || '#'}
                                className="px-12 py-5 font-black rounded-2xl shadow-2xl hover:scale-105 transition-all uppercase tracking-[0.3em] text-sm text-center"
                                style={{
                                    backgroundColor: styles?.buttonColor || '#4f46e5',
                                    color: styles?.buttonTextColor || '#ffffff'
                                }}
                            >
                                {buttonText}
                            </Link>
                        )}
                        {secondaryButtonText && (
                            <Link
                                href={secondaryButtonLink || '#'}
                                className={`px-12 py-5 font-black rounded-2xl border-4 transition-all uppercase tracking-[0.3em] text-sm text-center
                                    ${backgroundImage ? 'border-white/30 text-white hover:bg-white/10' : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'}
                                `}
                                style={{
                                    color: backgroundImage ? undefined : styles?.color
                                }}
                            >
                                {secondaryButtonText}
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}