"use client";
import CourierSetting from "@/features/setting/components/CourierSetting";
import CurrenciesSetting from "@/features/setting/components/CurrenciesSetting";
import { DomainSetting } from "@/features/setting/components/DomainSetting";
import { EmailSetting } from "@/features/setting/components/EmailSetting";
import FooterSetting from "@/features/setting/components/FooterSetting";
import GeneralSettings from "@/features/setting/components/GeneralSettings";
import MarketingSetting from "@/features/setting/components/MarketingSetting";
import NavbarSetting from "@/features/setting/components/NavbarSetting";
import PaymentSetting from "@/features/setting/components/PaymentSetting";
import SocialSetting from "@/features/setting/components/SocialSetting";
import TrustDelivery from "@/features/setting/components/Trust&Delivery";
import { fetchAPI } from "@/services/api";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Save, Settings } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { TabType, TabTypeEnum } from "../types";
export const dynamic = "force-dynamic";


export default function SettingsPage() {
    return (
        <Suspense
            fallback={
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
                </div>
            }
        >
            <SettingsContent />
        </Suspense>
    );
}

function SettingsContent() {
    const [activeTab, setActiveTab] = useState<TabType>("general");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [collapsedFooterSections, setCollapsedFooterSections] = useState<Set<number>>(new Set());
    const [formData, setFormData] = useState({
        logo: "",
        brandName: "",
        siteDescription: "",
        contactEmail: "",
        contactPhone: "",
        address: "",
        whatsappPhone: "",
        currency: "BDT",
        currencySymbol: "৳",
        supportedCurrencies: [] as Array<{
            code: string;
            symbol: string;
            rate: number;
            name: string;
        }>,
        socialLinks: {
            facebook: "",
            twitter: "",
            instagram: "",
            linkedin: "",
        },
        marketing: {
            googleAnalyticsId: "",
            googleSiteVerification: "",
            facebookPixelId: "",
            facebookDomainVerification: "",
        },
        smtp: {
            host: "",
            port: 587,
            secure: false,
            user: "",
            pass: "",
            from: "",
        },
        payment: {
            stripePublishableKey: "",
            stripeSecretKey: "",
            sslCommerzStoreId: "",
            sslCommerzStorePassword: "",
            sslCommerzIsSandbox: false,
        },
        pathaoCourier: {
            pathaoClientId: "",
            pathaoClientSecret: "",
            pathaoUsername: "",
            pathaoPassword: "",
            pathaoStoreId: "",
            sandboxMode: false,
        },
        steadfastCourier: {
            apiKey: "",
            secretKey: "",
        },
        navbar: {
            layout: "default",
            template: "classic",
            backgroundColor: "",
            textColor: "",
            shadowIntensity: "subtle",
            hoverEffect: "underline",
            borderRadius: "xl",
            sticky: true,
            maxWidth: "standard",
            bottomShape: "none",
            backgroundPattern: "none",
            transparent: false,
            links: [] as Array<{
                label: string;
                href: string;
                order: number;
                isOpenInNewTab: boolean;
                isActive: boolean;
            }>,
        },
        footer: {
            template: 'classic',
            backgroundColor: '',
            textColor: '',
            brandColor: '',
            borderColor: '',
            shadowIntensity: 'none',
            borderRadius: 'none',
            topShape: 'none',
            backgroundPattern: 'none',
            glassEffect: false,
            columns: '4',
            showSocialLinks: true,
            showNewsletter: true,
            description: '',
            copyright: '',
            sections: [] as Array<{
                title: string;
                order: number;
                links: Array<{
                    label: string;
                    href: string;
                    order: number;
                    isOpenInNewTab: boolean;
                    isActive: boolean;
                }>;
            }>,
        },
        trustBadges: [] as Array<{
            icon: string;
            title: string;
            description: string;
        }>,
    });

    const searchParams = useSearchParams();

    useEffect(() => {
        const tab = searchParams.get("tab") as TabType;
        if (
            tab &&
            Object.values(TabTypeEnum).includes(tab as TabTypeEnum)
        ) {
            setActiveTab(tab);
        }
    }, [searchParams]);

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const res = await fetchAPI("/settings");
                if (res.data) {
                    const data = res.data;
                    setFormData({
                        logo: data.logo || "",
                        brandName: data.brandName || "",
                        siteDescription: data.siteDescription || "",
                        contactEmail: data.contactEmail || "",
                        contactPhone: data.contactPhone || "",
                        whatsappPhone: data.whatsappPhone || "",
                        address: data.address || "",
                        currency: data.currency || "BDT",
                        currencySymbol: data.currencySymbol || "৳",
                        supportedCurrencies: data.supportedCurrencies || [],
                        socialLinks: {
                            facebook: data.socialLinks?.facebook || "",
                            twitter: data.socialLinks?.twitter || "",
                            instagram: data.socialLinks?.instagram || "",
                            linkedin: data.socialLinks?.linkedin || "",
                        },
                        marketing: {
                            googleAnalyticsId: data.marketing?.googleAnalyticsId || "",
                            googleSiteVerification:
                                data.marketing?.googleSiteVerification || "",
                            facebookPixelId: data.marketing?.facebookPixelId || "",
                            facebookDomainVerification:
                                data.marketing?.facebookDomainVerification || "",
                        },
                        smtp: {
                            host: data.smtp?.host || "",
                            port: data.smtp?.port || 587,
                            secure: !!data.smtp?.secure,
                            user: data.smtp?.user || "",
                            pass: data.smtp?.pass || "",
                            from: data.smtp?.from || "",
                        },
                        payment: {
                            stripePublishableKey: data.payment?.stripePublishableKey || "",
                            stripeSecretKey: data.payment?.stripeSecretKey || "",
                            sslCommerzStoreId: data.payment?.sslCommerzStoreId || "",
                            sslCommerzStorePassword:
                                data.payment?.sslCommerzStorePassword || "",
                            sslCommerzIsSandbox: data.payment?.sslCommerzIsSandbox || false,
                        },
                        pathaoCourier: {
                            pathaoClientId: data.pathaoCourier?.pathaoClientId || "",
                            pathaoClientSecret: data.pathaoCourier?.pathaoClientSecret || "",
                            pathaoUsername: data.pathaoCourier?.pathaoUsername || "",
                            pathaoPassword: data.pathaoCourier?.pathaoPassword || "",
                            pathaoStoreId: data.pathaoCourier?.pathaoStoreId || "",
                            sandboxMode: data.pathaoCourier?.sandboxMode || false
                        },
                        steadfastCourier: {
                            apiKey: data.steadfastCourier?.apiKey || "",
                            secretKey: data.steadfastCourier?.secretKey || "",
                        },
                        navbar: data.navbar || {
                            layout: "default",
                            template: "classic",
                            backgroundColor: "",
                            textColor: "",
                            shadowIntensity: "subtle",
                            hoverEffect: "underline",
                            borderRadius: "xl",
                            sticky: true,
                            maxWidth: "standard",
                            bottomShape: "none",
                            backgroundPattern: "none",
                            transparent: false,
                            links: []
                        },
                        footer: data.footer || {
                            template: 'classic',
                            backgroundColor: '',
                            textColor: '',
                            brandColor: '',
                            borderColor: '',
                            shadowIntensity: 'none',
                            borderRadius: 'none',
                            topShape: 'none',
                            backgroundPattern: 'none',
                            glassEffect: false,
                            columns: '4',
                            showSocialLinks: true,
                            showNewsletter: true,
                            description: '',
                            copyright: '',
                            sections: []
                        },
                        trustBadges: data.trustBadges || [],
                    });
                }
            } catch (error) {
                console.error("Failed to load settings", error);
                toast.error("Failed to load settings");
            } finally {
                setLoading(false);
            }
        };
        loadSettings();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        const updatedData = {
            ...formData,
            currencySymbol:
                formData.supportedCurrencies.find((c) => c.code === formData.currency)
                    ?.symbol || "$",
        };

        try {
            await fetchAPI("/settings", {
                method: "PUT",
                body: JSON.stringify(updatedData),
            });
            toast.success("Settings saved successfully!");
        } catch (error) {
            toast.error("Error saving settings");
        } finally {
            setSaving(false);
        }
    };



    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
            </div>
        );
    }

    return (
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-brand-100 dark:bg-brand-900/30 rounded-2xl transition-all duration-300">
                        <Settings className="w-6 h-6 text-brand-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-display">
                            Store Settings
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">
                            Configure your store's global parameters
                        </p>
                    </div>
                </div>

                <button
                    onClick={handleSubmit}
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
            </div>

            <div className="max-w-6xl mx-auto">
                {/* Form Content Area */}
                <div className="w-full">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className="bg-white dark:bg-slate-800 rounded-3xl shadow-md border border-slate-200/60 dark:border-slate-700/50 p-8 min-h-[500px]"
                    >
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <AnimatePresence mode="wait">
                                {activeTab === "general" && (
                                    <GeneralSettings formData={formData} setFormData={setFormData} />
                                )}

                                {activeTab === "domain" && (
                                    <DomainSetting />
                                )}

                                {activeTab === "email" && (
                                    <EmailSetting formData={formData} setFormData={setFormData} />
                                )}

                                {activeTab === "payment" && (
                                    <PaymentSetting formData={formData} setFormData={setFormData} />
                                )}

                                {activeTab === "currencies" && (
                                    <CurrenciesSetting formData={formData} setFormData={setFormData} />
                                )}

                                {activeTab === "social" && (
                                    <SocialSetting formData={formData} setFormData={setFormData} />
                                )}

                                {activeTab === "marketing" && (
                                    <MarketingSetting formData={formData} setFormData={setFormData} />
                                )}

                                {activeTab === "navbar" && (
                                    <NavbarSetting formData={formData} setFormData={setFormData} />
                                )}

                                {activeTab === "footer" && (
                                    <FooterSetting formData={formData} setFormData={setFormData} setCollapsedFooterSections={setCollapsedFooterSections} collapsedFooterSections={collapsedFooterSections} />
                                )}

                                {activeTab === "courier" && (
                                    <CourierSetting formData={formData} setFormData={setFormData} />
                                )}
                                {activeTab === "trust" && (
                                    <TrustDelivery formData={formData} setFormData={setFormData} />
                                )}
                            </AnimatePresence>
                        </form>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
