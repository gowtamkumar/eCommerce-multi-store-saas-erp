import { FAQItem } from "@/types/customizer";
import { Plus } from "lucide-react";

export default function FAQSection({ items, headline, subline, styles, buttonText }: { items: FAQItem[], headline: string, subline: string, styles: any, buttonText: string }) {
    return (
        <section
            style={{
                ...styles, // Spread ALL styles including CSS custom properties
                paddingTop: styles?.paddingTop,
                paddingBottom: styles?.paddingBottom,
                backgroundColor: styles?.backgroundColor,
                color: styles?.color
            }}
            className={`px-4 md:px-10 ${!styles?.paddingTop && !styles?.paddingBottom ? 'py-20 md:py-32' : ''} ${!styles?.backgroundColor ? 'bg-slate-50 dark:bg-slate-900/30' : ''}`}
        >
            <div className="max-w-5xl mx-auto">
                <div className={`mb-20 space-y-4
                    ${styles?.textAlign === 'center' ? 'text-center' : ''}
                    ${styles?.textAlign === 'right' ? 'text-right' : ''}
                    ${!styles?.textAlign || styles?.textAlign === 'left' ? 'text-left' : ''}
                `}>
                    <h2
                        className="text-5xl md:text-6xl font-black uppercase tracking-tighter leading-none"
                        style={{ color: styles?.headlineColor || styles?.color }}
                    >
                        {headline || 'Help Center'}
                    </h2>
                    <div
                        className={`w-24 h-2 rounded-full
                            ${styles?.textAlign === 'center' ? 'mx-auto' : ''}
                            ${styles?.textAlign === 'right' ? 'ml-auto' : ''}
                            ${!styles?.textAlign || styles?.textAlign === 'left' ? 'mr-auto' : ''}
                        `}
                        style={{ backgroundColor: styles?.sublineColor || '#4f46e5' }}
                    />
                    {subline && (
                        <p
                            className={`text-lg leading-relaxed max-w-2xl
                                ${styles?.textAlign === 'center' ? 'mx-auto' : ''}
                                ${styles?.textAlign === 'right' ? 'ml-auto' : ''}
                                ${!styles?.textAlign || styles?.textAlign === 'left' ? 'mr-auto' : ''}
                            `}
                            style={{ color: styles?.color }}
                        >
                            {subline}
                        </p>
                    )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {(items || []).length > 0 ? (
                        items.map((faq: FAQItem) => (
                            <div key={faq.id} className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 md:p-10 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer flex flex-col justify-between group h-fit">
                                <div>
                                    <div className="flex items-center justify-between mb-6">
                                        <h3
                                            className="text-2xl font-bold leading-tight pr-4"
                                            style={{ color: styles?.color }}
                                        >
                                            {faq.question}
                                        </h3>
                                        <div className="shrink-0 w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-700 flex items-center justify-center text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition-all duration-500">
                                            <Plus className="w-6 h-6 group-hover:rotate-45 transition-transform" />
                                        </div>
                                    </div>
                                    <p
                                        className={`text-lg leading-relaxed opacity-0 group-hover:opacity-100 max-h-0 group-hover:max-h-40 transition-all duration-700 overflow-hidden ${!styles?.color ? 'text-slate-500' : ''}`}
                                        style={{ color: styles?.color }}
                                    >
                                        {faq.answer}
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center text-slate-400 border-4 border-dashed border-slate-100 dark:border-slate-800 rounded-[3rem]">
                            Add questions to your FAQ in the customizer settings panel
                        </div>
                    )}
                </div>
            </div>
        </section>
    )

}