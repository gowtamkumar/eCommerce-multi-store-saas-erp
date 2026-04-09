import { motion } from "framer-motion";
import React, { useCallback } from "react";
import { Layout } from "lucide-react";
import ArchiveBanner from "./products/ArchiveBanner";
import ArchiveLayout from "./products/ArchiveLayout";

interface ProductsPageSettingProps {
    formData: any;
    setFormData: (data: any) => void;
}

const ProductsPageSetting = React.memo(({ formData, setFormData }: ProductsPageSettingProps) => {
    
    const updateArchive = useCallback((field: string, value: any) => {
        setFormData((prev: any) => ({
            ...prev,
            productsPage: {
                ...(prev.productsPage || {}),
                [field]: value
            }
        }));
    }, [setFormData]);

    return (
        <motion.div
            key="productsPage"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-10 py-4"
        >
            <div className="space-y-2">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3 font-display">
                    <Layout className="w-6 h-6 text-brand-600" />
                    Products Archive Customization
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Fine-tune how your products catalog page looks and behaves for customers.</p>
            </div>

            {/* Banner Section */}
            <ArchiveBanner 
                productsPage={formData.productsPage || {}} 
                onUpdate={updateArchive} 
            />

            {/* Archive Layout & Filters Section */}
            <ArchiveLayout 
                productsPage={formData.productsPage || {}} 
                onUpdate={updateArchive} 
            />

            <div className="p-6 bg-brand-50/50 dark:bg-brand-900/10 rounded-3xl border border-brand-100 dark:border-brand-900/20">
                <p className="text-xs text-brand-700 dark:text-brand-300 font-medium italic">
                    💡 <strong>Pro Tip:</strong> Use the "Minimalist Clean" banner style if you have vibrant product photos to let the merchandise stand out.
                </p>
            </div>
        </motion.div>
    );
});

export default ProductsPageSetting;
