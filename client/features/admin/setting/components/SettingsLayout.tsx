"use client";

import { motion } from "framer-motion";
import { Loader2, Save, Settings } from "lucide-react";
import { usePathname } from "next/navigation";
import { TabType } from "../types";
import { useAdminSettings } from "../context/AdminSettingsContext";

export function SettingsLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const currentTab = (pathname.split("/").pop() as TabType) || "general";
    
    const { loading, saving, handleSubmit } = useAdminSettings();

    const tabConfigs: Record<TabType, { title: string; description: string; showSave?: boolean }> = {
        general: { title: "Store Settings", description: "Configure your store's global parameters", showSave: true },
        domain: { title: "Custom Domain", description: "Manage your store's web address", showSave: false },
        email: { title: "Email Configuration", description: "Set up your SMTP server for transactional emails", showSave: true },
        payment: { title: "Payment Gateways", description: "Configure your payment provider credentials", showSave: true },
        currencies: { title: "Currency Settings", description: "Manage supported currencies and exchange rates", showSave: true },
        social: { title: "Social Profiles", description: "Connect your store to your social media accounts", showSave: true },
        marketing: { title: "Marketing & SEO", description: "Configure tracking pixels and SEO meta tags", showSave: true },
        navbar: { title: "Navigation Menu", description: "Customize your store's top navigation bar", showSave: true },
        footer: { title: "Footer Layout", description: "Design your store's footer and links", showSave: true },
        courier: { title: "Shipping & Courier", description: "Configure delivery methods and shipping fees", showSave: true },
        trust: { title: "Trust & Safety", description: "Manage trust badges and delivery assurances", showSave: true },
        productsPage: { title: "Product Listing UI", description: "Customize how products are displayed on listing pages", showSave: true },
        singleProductPage: { title: "Product Detail UI", description: "Configure the layout of individual product pages", showSave: true },
        offersPage: { title: "Offers Page UI", description: "Manage the look and feel of your promotional pages", showSave: true },
        label: { title: "Label Settings", description: "Customize dynamic labels for products", showSave: true },
        sms: { title: "SMS Configuration", description: "Connect your SMS gateway for notifications", showSave: true },
        billing: { title: "Subscription & Billing", description: "Manage your plan, billing cycle and invoices", showSave: false },
        system: { title: "System & Performance", description: "Monitor store health and manage cache", showSave: false },
    };

    const currentConfig = tabConfigs[currentTab] || tabConfigs.general;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-brand-100 dark:bg-brand-900/30 rounded-2xl transition-all duration-300">
                        <Settings className="w-6 h-6 text-brand-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-display">
                            {currentConfig.title}
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">
                            {currentConfig.description}
                        </p>
                    </div>
                </div>

                {currentConfig.showSave && (
                    <button
                        onClick={() => handleSubmit()}
                        disabled={saving}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-brand-500/25 disabled:opacity-70 disabled:cursor-not-allowed group"
                    >
                        {saving ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                <span>Save Changes</span>
                            </>
                        )}
                    </button>
                )}
            </div>

            <div className="max-w-6xl mx-auto">
                <div className="w-full">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className="bg-white dark:bg-slate-800 rounded-3xl shadow-md border border-slate-200/60 dark:border-slate-700/50 p-8 min-h-[500px]"
                    >
                        {children}
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
