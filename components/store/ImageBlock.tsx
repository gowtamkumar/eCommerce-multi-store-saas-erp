export default function ImageBlock({ image, headline, subline, styles, buttonText }: { image: string, headline: string, subline: string, styles: any, buttonText: string }) {
    return (
        <section style={styles} className="px-4 md:px-10 py-20 md:py-32">
            <div className={`max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16 md:gap-24 ${styles?.layout === 'right' ? 'md:flex-row-reverse' : ''}`}>
                <div className="flex-1 w-full relative group">
                    <div className="aspect-[4/5] bg-slate-100 dark:bg-slate-800 rounded-[4rem] border-[12px] border-white dark:border-slate-800 shadow-2xl flex items-center justify-center overflow-hidden transition-all duration-700">
                        {image ? (
                            <img src={image} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-9xl grayscale group-hover:grayscale-0 transition-all duration-700">🖼️</span>
                        )}
                    </div>
                </div>
                <div className="flex-1 text-left space-y-10">
                    <div className="space-y-6">
                        <h2 className="text-6xl md:text-8xl font-black leading-[0.9] tracking-tighter">{headline || 'Pure Vision'}</h2>
                        <div className="w-16 h-2 bg-brand-600 rounded-full" />
                    </div>
                    <p className="text-xl md:text-2xl opacity-70 leading-relaxed font-medium">
                        {subline || 'Feature your most important brand assets or stories here with high-quality imagery.'}
                    </p>
                    {buttonText && (
                        <button className="px-12 py-5 bg-brand-600 text-white font-black rounded-2xl shadow-2xl hover:bg-brand-700 transition-all uppercase tracking-[0.3em] text-sm">
                            {buttonText}
                        </button>
                    )}
                </div>
            </div>
        </section>
    )

}