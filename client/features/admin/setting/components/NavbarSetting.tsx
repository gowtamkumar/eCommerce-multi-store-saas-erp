import { motion } from "framer-motion";
import React, { useCallback } from "react";
import NavbarPresets from "./navbar/NavbarPresets";
import NavbarConfig from "./navbar/NavbarConfig";
import DesignTemplate from "./navbar/DesignTemplate";
import AdvancedDesigner from "./navbar/AdvancedDesigner";
import MenuManager from "./navbar/MenuManager";

interface NavbarSettingProps {
    formData: any;
    setFormData: (data: any) => void;
}

const NavbarSetting = React.memo(({
    formData,
    setFormData,
}: NavbarSettingProps) => {
    
    // Centralized update helper
    const updateNavbar = useCallback((updates: any) => {
        setFormData((prev: any) => ({
            ...prev,
            navbar: {
                ...(prev.navbar || {}),
                ...updates
            }
        }));
    }, [setFormData]);

    // Field-specific update helper
    const updateNavbarField = useCallback((key: string, value: any) => {
        updateNavbar({ [key]: value });
    }, [updateNavbar]);

    // Menu update helper
    const updateNavbarLinks = useCallback((links: any[]) => {
        updateNavbar({ links });
    }, [updateNavbar]);

    return (
        <motion.div
            key="navbar"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
        >
            {/* Presets Selection */}
            <NavbarPresets 
                navbarData={formData.navbar} 
                onUpdate={updateNavbar} 
            />

            <div className="h-px bg-slate-200 dark:bg-slate-800 my-8" />
            
            {/* Layout and Basic Config */}
            <NavbarConfig 
                navbarData={formData.navbar} 
                onUpdate={updateNavbarField} 
            />

            {/* Visual Templates */}
            <DesignTemplate 
                navbarData={formData.navbar} 
                onUpdate={updateNavbarField} 
            />

            <div className="h-px bg-slate-200 dark:bg-slate-800 my-8" />

            {/* Advanced Aesthetics */}
            <AdvancedDesigner 
                navbarData={formData.navbar} 
                onUpdate={updateNavbarField} 
            />

            <div className="h-px bg-slate-200 dark:bg-slate-800 my-8" />

            {/* Links and Menu Management */}
            <MenuManager 
                navbarData={formData.navbar} 
                onUpdate={updateNavbarLinks} 
            />
        </motion.div>
    );
});

export default NavbarSetting;