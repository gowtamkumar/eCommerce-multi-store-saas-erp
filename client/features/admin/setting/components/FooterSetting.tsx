import { motion } from "framer-motion";
import React, { useCallback } from "react";
import FooterPresets from "./footer/FooterPresets";
import FooterStyle from "./footer/FooterStyle";
import AdvancedFooterDesigner from "./footer/AdvancedFooterDesigner";
import FooterContent from "./footer/FooterContent";
import FooterSectionsManager from "./footer/FooterSectionsManager";

interface FooterSettingProps {
    formData: any;
    setFormData: (data: any) => void;
    setCollapsedFooterSections: (sections: Set<number>) => void;
    collapsedFooterSections: Set<number>;
}

const FooterSetting = React.memo(({
    formData,
    setFormData,
    setCollapsedFooterSections,
    collapsedFooterSections
}: FooterSettingProps) => {

    // Centralized update helper
    const updateFooter = useCallback((updates: any) => {
        setFormData((prev: any) => ({
            ...prev,
            footer: {
                ...(prev.footer || {}),
                ...updates
            }
        }));
    }, [setFormData]);

    // Field-specific update helper
    const updateFooterField = useCallback((key: string, value: any) => {
        updateFooter({ [key]: value });
    }, [updateFooter]);

    // Sections update helper
    const updateFooterSections = useCallback((sections: any[]) => {
        updateFooter({ sections });
    }, [updateFooter]);

    return (
        <motion.div
            key="footer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-8"
        >
            {/* Style Presets */}
            <FooterPresets 
                footerData={formData.footer} 
                onUpdate={updateFooter} 
            />

            <div className="h-px bg-slate-200 dark:bg-slate-800 my-8" />

            {/* Layout, Toggles, and Shadows */}
            <FooterStyle 
                footerData={formData.footer} 
                onUpdate={updateFooterField} 
            />

            {/* Advanced Aesthetics */}
            <AdvancedFooterDesigner 
                footerData={formData.footer} 
                onUpdate={updateFooterField} 
            />

            <div className="h-px bg-slate-200 dark:bg-slate-800 my-8" />

            {/* Global Content (Description, Copyright) */}
            <FooterContent 
                footerData={formData.footer} 
                onUpdate={updateFooterField} 
            />

            {/* Modular Sections and Links */}
            <FooterSectionsManager 
                footerData={formData.footer}
                collapsedFooterSections={collapsedFooterSections}
                setCollapsedFooterSections={setCollapsedFooterSections}
                onUpdateSections={updateFooterSections}
                brandName={formData.brandName}
            />
        </motion.div>
    );
});

export default FooterSetting;