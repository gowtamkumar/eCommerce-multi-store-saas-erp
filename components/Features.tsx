"use client";

import LucideIcon from './LucideIcon';

interface FeaturesProps {
  product?: any;
  isBuilderSection?: boolean;
}

const Features = ({ product, isBuilderSection = false }: FeaturesProps) => {
  // ... (features data logic remains same)

  // ... (displayFeatures logic remains same)

  const sectionClasses = isBuilderSection ? 'w-full' : 'py-32 bg-white dark:bg-slate-900';
  const containerClasses = isBuilderSection ? 'w-full' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8';

  return (
    <section id={!isBuilderSection ? "features" : undefined} className={sectionClasses}>
      <div className={containerClasses}>
        <div className="text-center mb-20">
          <h2 className="text-base text-brand-600 dark:text-brand-400 font-semibold tracking-wide uppercase mb-2">
            {product?.sections?.features?.heading || "Features"}
          </h2>
          <h3 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
            {product?.sections?.features?.subheading || `Why Choose ${product?.name || 'Us'}?`}
          </h3>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            {product?.sections?.features?.description || "Packed with premium features to elevate your experience to new heights."}
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {displayFeatures.map((feature: any, index: number) => (
            <div key={index} className="group bg-slate-50 dark:bg-slate-800/50 p-8 rounded-3xl hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-transparent hover:border-slate-100 dark:hover:border-slate-700">
              <div className={`w-14 h-14 ${feature.color || colors[index % colors.length]} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <LucideIcon name={feature.icon} className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                {feature.title || feature.name}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
