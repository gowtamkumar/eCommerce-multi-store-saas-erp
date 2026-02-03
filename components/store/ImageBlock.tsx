import Link from "next/link";

export default function ImageBlock({ image, headline, subline, styles, buttonText, buttonUrl, layout }: { image: string, headline: string, subline: string, styles: any, buttonText: string, buttonUrl: string, layout: string }) {
    return (
        <section
            style={{
                ...styles, // Spread ALL styles including CSS custom properties
                paddingTop: styles?.paddingTop,
                paddingBottom: styles?.paddingBottom,
                backgroundColor: styles?.backgroundColor,
                color: styles?.color
            }}
            className={`px-4 md:px-10 ${!styles?.paddingTop && !styles?.paddingBottom ? 'py-20 md:py-32' : ''}`}
        >
            <div className={`max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16 md:gap-24 ${layout === 'right' ? 'md:flex-row-reverse' : ''}`}>
                <div className="flex-1 w-full relative group">
                    <div className="aspect-[4/5] bg-slate-100 dark:bg-slate-800 rounded-[4rem] border-[12px] border-white dark:border-slate-800 shadow-2xl flex items-center justify-center overflow-hidden transition-all duration-700">
                        {image ? (
                            <img src={image} alt="" className="w-full h-full object-cover" />
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
                            className="text-6xl md:text-8xl font-black leading-[0.9] tracking-tighter"
                            style={{ color: styles?.headlineColor || styles?.color }}
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
                        className="text-xl md:text-2xl opacity-70 leading-relaxed font-medium"
                        style={{ color: styles?.color }}
                    >
                        {subline || 'Feature your most important brand assets or stories here with high-quality imagery.'}
                    </p>
                    {buttonText && (
                        <Link
                            href={buttonUrl}
                            className="px-12 py-5 font-black rounded-2xl shadow-2xl hover:opacity-90 transition-all uppercase tracking-[0.3em] text-sm"
                            style={{
                                backgroundColor: styles?.buttonColor || '#4f46e5',
                                color: styles?.buttonTextColor || '#ffffff'
                            }}
                        >
                            {buttonText}
                        </Link>
                    )}
                </div>
            </div>
        </section>
    )

}