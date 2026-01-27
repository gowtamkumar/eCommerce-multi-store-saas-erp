import { MousePointer2 } from "lucide-react";

export default function BuilderButton({ variant, size, text, styles }: { variant: string, size: string, text: string, styles: any }) {
    return (
        <div style={styles} className="px-4 md:px-10 py-12 flex justify-center">
            <button className={`
                    font-black rounded-[2rem] transition-all duration-300 uppercase tracking-[0.4em] flex items-center gap-4 group
                    ${variant === 'outline' ? 'border-4 border-brand-600 text-brand-600 bg-transparent' : 'bg-brand-600 text-white shadow-2xl'}
                    ${size === 'sm' ? 'px-8 py-3 text-xs' : size === 'lg' ? 'px-24 py-8 text-lg' : 'px-16 py-6 text-sm'}
                  `}>
                <span>{text || 'Shop The Look'}</span>
                <MousePointer2 className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </button>
        </div>
    )

}