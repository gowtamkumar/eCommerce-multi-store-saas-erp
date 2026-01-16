'use client';

import Price from "@/components/Price";
import { useSettings } from "@/contexts/SettingsContext";
import { motion } from 'framer-motion';
import { Activity, Battery, Bluetooth, Mic, Shield, Wifi } from 'lucide-react';
import Image from 'next/image';

interface ProductDetailsProps {
  product: any;
}

const ProductDetails = ({ product }: { product: any }) => {
  const { selectedCurrency, formatPrice, convertPrice } = useSettings();
  if (!product) return null;


  // Helper to get icon component
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'bluetooth': return <Bluetooth className="w-6 h-6" />;
      case 'battery': return <Battery className="w-6 h-6" />;
      case 'mic': return <Mic className="w-6 h-6" />;
      case 'wifi': return <Wifi className="w-6 h-6" />;
      case 'shield': return <Shield className="w-6 h-6" />;
      case 'activity': return <Activity className="w-6 h-6" />;
      case 'star': return <Activity className="w-6 h-6" />; // Fallback/Generic
      case 'heart': return <Activity className="w-6 h-6" />; // Fallback/Generic
      default: return <Activity className="w-6 h-6" />;
    }
  };

  // Use dynamic benefits or fallback to empty array
  const benefits = product.keyBenefits && product.keyBenefits.length > 0
    ? product.keyBenefits
    : [];

  // Use dynamic specs or fallback to empty array
  const specs = product.specifications && product.specifications.length > 0
    ? product.specifications
    : [];

  return (
    <section className="py-24 bg-slate-50 dark:bg-slate-900/50 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-brand-600 dark:text-brand-400 font-semibold tracking-wide uppercase text-sm mb-3">
            {product.sections?.techSpecs?.heading || "Specifications"}
          </h2>
          <h3 className="text-3xl md:text-5xl font-bold font-display text-slate-900 dark:text-white mb-6">
            {product.sections?.techSpecs?.subheading ? (
              <span dangerouslySetInnerHTML={{ __html: product.sections.techSpecs.subheading.replace('Perfection', '<span class="text-gradient">Perfection</span>') }} />
            ) : (
              <>Engineered for <span className="text-gradient">Perfection</span></>
            )}
          </h3>
          <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
            {product.sections?.techSpecs?.description || "Every component has been meticulously designed to deliver an unparalleled experience."}
          </p>

          {/* New Discount Highlight in Details */}
          {product.discountAmount > 0 && (
            <div className="mt-8 inline-flex items-center gap-4 p-4 rounded-2xl bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20">
              <div className="w-12 h-12 rounded-xl bg-green-500 text-white flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              <div className="text-left">
                <p className="text-green-700 dark:text-green-400 font-bold">Special Offer</p>
                <div className="text-green-600 dark:text-green-500 text-sm">
                  Save <Price amount={product.discountAmount} className="font-bold" /> for a limited time.
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative order-2 lg:order-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
              {benefits.map((benefit: any, idx: number) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-brand-200 dark:hover:border-brand-800 transition-colors shadow-sm hover:shadow-md group"
                >
                  <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center text-brand-600 dark:text-brand-400 mb-4 group-hover:scale-110 transition-transform">
                    {getIcon(benefit.icon)}
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{benefit.title}</h4>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{benefit.description}</p>
                </motion.div>
              ))}
              {benefits.length === 0 && (
                <div className="col-span-2 text-center text-slate-500 italic">
                  No key benefits added yet.
                </div>
              )}
            </div>

            {/* Additional Features List */}
            {product.features && product.features.length > 0 && (
              <div className="bg-slate-100 dark:bg-slate-800/50 rounded-3xl p-8">
                <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Additional Features</h4>
                <ul className="grid sm:grid-cols-2 gap-4">
                  {product.features.map((feature: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-3 text-slate-600 dark:text-slate-300">
                      <div className="w-6 h-6 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400 flex-shrink-0 mt-0.5">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="relative order-1 lg:order-2 h-[600px] rounded-3xl overflow-hidden bg-slate-100 dark:bg-slate-800 group">
            <Image
              src={product?.images?.[0] || "https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=1000&auto=format&fit=crop"}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />

            <div className="absolute bottom-0 left-0 right-0 p-8">
              <div className="glass p-6 rounded-2xl border-white/10">
                <div className="grid grid-cols-2 gap-4">
                  {product.discountAmount > 0 && (
                    <>
                      <div className="flex items-center gap-3">
                        <div className="px-3 py-1 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 text-sm font-bold">
                          Special Offer
                        </div>
                        <Price
                          amount={product.price}
                          className="text-white/80 line-through text-sm font-normal"
                        />
                      </div>
                      <div className="text-right">
                        <p className="text-white/80 text-sm mb-1">Current Price</p>
                        <Price
                          amount={product.price - (product.discountAmount || 0)}
                          className="text-white text-xl font-bold"
                        />
                      </div>
                    </>
                  )}
                  {specs.length > 0 ? specs.map((spec: any, idx: number) => (
                    <div key={idx} className={idx % 2 === 1 ? "text-right" : ""}>
                      <p className="text-white/80 text-sm mb-1">{spec.label}</p>
                      <p className="text-white text-xl font-bold">{spec.value}</p>
                    </div>
                  )) : (
                    <>
                      <div>
                        <p className="text-white/80 text-sm mb-1">Status</p>
                        <p className="text-white text-xl font-bold">Premium Quality</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white/80 text-sm mb-1">Availability</p>
                        <p className="text-white text-xl font-bold">In Stock</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductDetails;
