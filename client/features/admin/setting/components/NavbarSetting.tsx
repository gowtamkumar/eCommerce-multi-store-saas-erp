import { motion } from "framer-motion";
import React from "react";
import { useNavbarSettings } from "../hooks/useNavbarSettings";
import AdvancedDesigner from "./navbar/AdvancedDesigner";
import DesignTemplate from "./navbar/DesignTemplate";
import MenuManager from "./navbar/MenuManager";
import NavbarConfig from "./navbar/NavbarConfig";
import NavbarPresets from "./navbar/NavbarPresets";


interface NavbarSettingProps {
    formData: any;
    setFormData: (data: any) => void;
}

const NavbarSetting = React.memo(({
    formData,
    setFormData,
}: NavbarSettingProps) => {

    const { updateNavbar, updateNavbarField, updateNavbarLinks } = useNavbarSettings(
        formData,
        setFormData
    );

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

NavbarSetting.displayName = "NavbarSetting";

export default NavbarSetting;