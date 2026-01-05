"use client";

import LucideIcon from './LucideIcon';

interface FeaturesProps {
  product?: any;
}

const Features = ({ product }: FeaturesProps) => {
  // Default static features as fallback
  const defaultFeatures = [
    {
      name: 'Safe & Secure',
      description: 'Your data and transactions are protected by industry-leading security protocols.',
      icon: 'shield',
      color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    },
    {
      name: 'Fast Performance',
      description: 'Experience lightning-fast speeds and responsive interactions across all devices.',
      icon: 'zap',
      color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
    },
    {
      name: 'Premium Quality',
      description: 'Meticulously crafted with high-quality materials for a superior experience.',
      icon: 'star',
      color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    },
    {
      name: 'Lifetime Support',
      description: 'Our dedicated support team is available around the clock to help you.',
      icon: 'headphones',
      color: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400',
    },
  ];

  // Colors to cycle through if not provided
  const colors = [
    'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
    'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400',
    'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
  ];

  // Use keyBenefits if available, otherwise fallback to features string array, then default
  const displayFeatures = product?.keyBenefits && product.keyBenefits.length > 0
    ? product.keyBenefits
    : product?.features && product.features.length > 0
      ? product.features.map((feature: string, index: number) => ({
        name: feature,
        description: 'Experience premium quality with this standout feature.',
        icon: 'star',
        color: colors[index % colors.length],
      }))
      : defaultFeatures;

  return (
    <section id="features" className="py-32 bg-white dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
