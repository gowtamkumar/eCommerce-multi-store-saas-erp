'use client';

const TechSpecsRenderer = ({ section }: { section: any }) => {
    const { heading, subheading, description, items } = section.content;

    return (
        <div className="py-12">
            <div className="text-center max-w-3xl mx-auto mb-16">
                {heading && <h2 className="text-brand-600 dark:text-brand-400 font-semibold tracking-wide uppercase text-sm mb-3">{heading}</h2>}
                {subheading && <h3 className="text-3xl md:text-5xl font-bold font-display text-slate-900 dark:text-white mb-6">{subheading}</h3>}
                {description && <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">{description}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {items?.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-800">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">{item.label}</span>
                        <span className="text-slate-900 dark:text-white font-bold">{item.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TechSpecsRenderer;
