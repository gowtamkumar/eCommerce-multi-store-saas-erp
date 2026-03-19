export default function ImageBlock({ settings, styles }: { settings: any, styles: any }) {
    const {
        image,
    } = settings || {};

    const cardRadiusClass = styles?.imageRadius === 'small' ? 'rounded-lg' :
        styles?.imageRadius === 'medium' ? 'rounded-2xl' :
            styles?.imageRadius === 'large' ? 'rounded-[3rem]' :
                styles?.imageRadius === 'full' ? 'rounded-full' : 'rounded-none';

    const shadowClass = styles?.imageShadow === 'small' ? 'shadow-md' :
        styles?.imageShadow === 'medium' ? 'shadow-xl' :
            styles?.imageShadow === 'large' ? 'shadow-2xl' : '';

    const borderClass = styles?.imageBorder === 'thin' ? 'border-4 border-white/20' :
        styles?.imageBorder === 'thick' ? 'border-8 border-white/20' : '';

    return (
        <div className="w-full">
            <div className={`w-full flex ${styles?.textAlign === 'left' ? 'justify-start' : styles?.textAlign === 'right' ? 'justify-end' : 'justify-center'}`}>
                <div className={`w-full relative overflow-hidden transition-all duration-700 ${cardRadiusClass} ${shadowClass} ${borderClass}`}>
                    {image ? (
                        <img
                            src={image}
                            alt=""
                            className="w-full h-auto object-cover transition-transform duration-700 hover:scale-105"
                            style={{ borderRadius: 'inherit' }}
                        />
                    ) : (
                        <div className="py-20 px-10 text-center bg-slate-100 dark:bg-slate-800">
                            <span className="text-6xl md:text-8xl block mb-4">🖼️</span>
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No Image Selected</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
