export default function ImageBlock({ settings, styles }: { settings: any, styles: any }) {
    const {
        image,
    } = settings || {};

    return (
        <div className="w-full overflow-hidden">
            <div className={`max-w-7xl mx-auto flex justify-center relative z-10`}>
                <div className={`w-full relative group`}>
                    <div className={`aspect-auto bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden transition-all duration-700
                        ${styles?.imageRadius === 'medium' ? 'rounded-2xl' : ''}
                        ${styles?.imageRadius === 'large' ? 'rounded-[2rem]' : ''}
                        ${styles?.imageRadius === 'full' ? 'rounded-full' : ''}
                        ${!styles?.imageRadius || styles?.imageRadius === 'none' ? '' : ''}
                        ${styles?.imageBorder === 'thin' ? 'border-4 border-white dark:border-slate-700' : ''}
                        ${styles?.imageBorder === 'thick' ? 'border-[12px] border-white dark:border-slate-700' : ''}
                        ${styles?.imageShadow === 'small' ? 'shadow-lg' : ''}
                        ${styles?.imageShadow === 'medium' ? 'shadow-xl' : ''}
                        ${styles?.imageShadow === 'large' ? 'shadow-2xl' : ''}
                    `}>
                        {image ? (
                            <img src={image} alt="" className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-110" />
                        ) : (
                            <div className="p-20 text-center">
                                <span className="text-9xl grayscale group-hover:grayscale-0 transition-all duration-700">🖼️</span>
                                <p className="mt-4 text-slate-400 font-bold uppercase tracking-widest text-xs">No Image Selected</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}