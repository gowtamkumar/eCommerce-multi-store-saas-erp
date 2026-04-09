import React, { useCallback } from "react";
import { Layout } from "lucide-react";
import ProductModules from "./products/ProductModules";
import ProductLayout from "./products/ProductLayout";

interface SingleProductPageSettingProps {
    formData: any;
    setFormData: (data: any) => void;
}

const SingleProductPageSetting = React.memo(({ formData, setFormData }: SingleProductPageSettingProps) => {

    const updateSingleProduct = useCallback((field: string, value: any) => {
        setFormData((prev: any) => ({
            ...prev,
            singleProductPage: {
                ...(prev.singleProductPage || {}),
                [field]: value,
            },
        }));
    }, [setFormData]);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 py-4">
            {/* Header */}
            <div className="px-1">
                <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center mb-4 border border-brand-100 dark:border-brand-800 shadow-sm shadow-brand-500/10">
                    <Layout className="w-6 h-6 text-brand-600 dark:text-brand-400" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 font-display">
                    Single Product Page Controls
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm max-w-2xl leading-relaxed">
                    Customize the layout and visible sections of the individual product details page. Turn modules on or off to create the perfect shopping experience.
                </p>
            </div>

            {/* Modules Grid Section */}
            <ProductModules 
                singleProductPage={formData.singleProductPage || {}} 
                onUpdate={updateSingleProduct} 
            />

            {/* Layout Options Section */}
            <ProductLayout 
                singleProductPage={formData.singleProductPage || {}} 
                onUpdate={updateSingleProduct} 
            />
        </div>
    );
});

export default SingleProductPageSetting;
