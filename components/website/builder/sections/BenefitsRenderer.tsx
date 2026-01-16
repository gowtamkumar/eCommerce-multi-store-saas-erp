'use client';
import { motion } from 'framer-motion';
import { Activity, Battery, Bluetooth, Mic, Shield, Wifi } from 'lucide-react';

const BenefitsRenderer = ({ section }: { section: any }) => {
    const { heading, items } = section.content;

    // Helper to get icon component (Duplicated from ProductDetails, ideally centralized)
    const getIcon = (iconName: string) => {
        switch (iconName) {
            case 'bluetooth': return <Bluetooth className="w-6 h-6" />;
            case 'battery': return <Battery className="w-6 h-6" />;
            case 'mic': return <Mic className="w-6 h-6" />;
            case 'wifi': return <Wifi className="w-6 h-6" />;
            case 'shield': return <Shield className="w-6 h-6" />;
            case 'activity': return <Activity className="w-6 h-6" />;
            case 'star': return <Activity className="w-6 h-6" />;
            case 'heart': return <Activity className="w-6 h-6" />;
            default: return <Activity className="w-6 h-6" />;
        }
    };

    return (
        <div className="py-12">
            {heading && <h2 className="text-3xl font-bold text-center mb-12 text-slate-900 dark:text-white">{heading}</h2>}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {items?.map((benefit: any, idx: number) => (
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
            </div>
        </div>
    );
};

export default BenefitsRenderer;
