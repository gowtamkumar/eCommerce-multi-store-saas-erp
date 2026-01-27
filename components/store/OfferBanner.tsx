import { Tag } from "lucide-react";

export default function OfferBanner({ buttonText, headline, subline, backgroundColor, styles }: { buttonText: string, headline: string, subline: string, backgroundColor: string, styles: any }) {
    return (
        <section style={{ ...styles, backgroundColor: backgroundColor || styles.backgroundColor || '#6366f1' }} className="px-10 py-8 relative overflow-hidden text-white">
            <div className="absolute top-0 right-0 w-64 h-full bg-white/10 skew-x-12 transform translate-x-32" />
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                        <Tag className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-center md:text-left">
                        <h2 className="text-2xl font-black uppercase tracking-tighter">{headline || 'FLASH SALE'}</h2>
                        <p className="text-white/80 font-bold uppercase tracking-widest text-[10px]">{subline || 'Limited time offer'}</p>
                    </div>
                </div>
                {buttonText && (
                    <button className="px-10 py-4 bg-white text-brand-600 font-black rounded-xl shadow-2xl hover:scale-105 transition-transform uppercase tracking-widest text-sm">
                        {buttonText}
                    </button>
                )}
            </div>
        </section>
    )
}   