"use client";

import { fetchAPI } from "@/lib/api";
export const dynamic = "force-dynamic";

import { AnimatePresence, motion } from "framer-motion";
import {
    Banknote,
    CreditCard,
    Globe,
    Layout,
    Loader2,
    Mail,
    MapPin,
    Menu,
    MessageSquare,
    Phone,
    Plus,
    Save,
    Settings,
    Share2,
    TrendingUp,
    X,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import toast from "react-hot-toast";

type TabType =
    | "general"
    | "domain"
    | "email"
    | "payment"
    | "currencies"
    | "social"
    | "marketing"
    | "navbar"
    | "footer"
    | "courier";

export default function SettingsPage() {
    // This is the settings inner page for the admin dashboard. It includes a nice design while preserving the existing functionality.

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
            sandboxMode: false,
        },
        steadfastCourier: {
            apiKey: "",
            secretKey: "",
        },
        navbarLinks: [] as Array<{
            label: string;
            href: string;
            order: number;
            isOpenInNewTab: boolean;
            isActive: boolean;
        }>,
        footerDescription: "",
        footerCopyright: "",
        footerSections: [] as Array<{
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
    });

    const searchParams = useSearchParams();

    useEffect(() => {
        const tab = searchParams.get("tab") as TabType;
        if (
            tab &&
            [
                "general",
                "domain",
                "email",
                "payment",
                "currencies",
                "social",
                "marketing",
                "navbar",
                "footer",
                "courier",
            ].includes(tab)
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
                            sandboxMode: data.pathaoCourier?.sandboxMode || false
                        },
                        steadfastCourier: {
                            apiKey: data.steadfastCourier?.apiKey || "",
                            secretKey: data.steadfastCourier?.secretKey || "",
                        },
                        navbarLinks: data.navbarLinks || [],
                        footerDescription: data.footerDescription || "",
                        footerCopyright: data.footerCopyright || "",
                        footerSections: data.footerSections || [],
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

    const DomainSettings = () => {
        const [tenantInfo, setTenantInfo] = useState<any>(null);
        const [domainInput, setDomainInput] = useState("");
        const [isVerifying, setIsVerifying] = useState(false);
        const [isUpdating, setIsUpdating] = useState(false);

        useEffect(() => {
            const fetchTenant = async () => {
                try {
                    const res = await fetchAPI("/tenants/info");
                    setTenantInfo(res);
                    setDomainInput(res.customDomain || "");
                } catch (err) {
                    console.error("Failed to fetch tenant info", err);
                }
            };
            fetchTenant();
        }, []);

        const handleUpdateDomain = async () => {
            if (!domainInput) return;
            setIsUpdating(true);
            try {
                const res = await fetchAPI("/tenants/custom-domain", {
                    method: "PUT",
                    body: JSON.stringify({ customDomain: domainInput }),
                });
                setTenantInfo(res);
                toast.success("Custom domain updated!");
            } catch (err: any) {
                toast.error(err.message || "Failed to update domain");
            } finally {
                setIsUpdating(false);
            }
        };

        const handleVerifyStatus = async () => {
            setIsVerifying(true);
            try {
                const res = await fetchAPI("/tenants/custom-domain/verify", {
                    method: "POST",
                });
                setTenantInfo(res);
                toast.success("Domain status updated!");
            } catch (err: any) {
                toast.error(err.message || "Verification failed");
            } finally {
                setIsVerifying(false);
            }
        };

        if (!tenantInfo)
            return (
                <div className="animate-pulse h-64 bg-slate-100 dark:bg-slate-800 rounded-3xl" />
            );

        return (
            <div className="space-y-8">
                {/* Current Status */}
                <div className="p-6 bg-slate-50 dark:bg-slate-900/40 rounded-3xl border border-slate-100 dark:border-slate-700/50">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="space-y-1">
                            <h3 className="font-bold text-slate-900 dark:text-white">
                                Domain Status
                            </h3>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-slate-500 font-mono">
                                    {tenantInfo.customDomain || "No custom domain set"}
                                </span>
                                {tenantInfo.customDomain && (
                                    <span
                                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${tenantInfo.customDomainStatus === "active"
                                            ? "bg-green-100 text-green-600 dark:bg-green-900/30"
                                            : tenantInfo.customDomainStatus === "verified"
                                                ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30"
                                                : "bg-amber-100 text-amber-600 dark:bg-amber-900/30"
                                            }`}
                                    >
                                        {tenantInfo.customDomainStatus}
                                    </span>
                                )}
                            </div>
                        </div>
                        {tenantInfo.customDomain &&
                            tenantInfo.customDomainStatus !== "active" && (
                                <button
                                    type="button"
                                    onClick={handleVerifyStatus}
                                    disabled={isVerifying}
                                    className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-brand-500/20 flex items-center gap-2 disabled:opacity-70"
                                >
                                    {isVerifying ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        "Check Status"
                                    )}
                                </button>
                            )}
                    </div>
                </div>

                {/* Edit Domain */}
                <div className="space-y-4">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Set Custom Domain
                    </label>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <input
                            type="text"
                            value={domainInput}
                            onChange={(e) => setDomainInput(e.target.value.toLowerCase())}
                            placeholder="e.g., shop.yourbrand.com"
                            className="flex-1 px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 hover:border-brand-500/50 outline-none transition-all duration-200"
                        />
                        <button
                            type="button"
                            onClick={handleUpdateDomain}
                            disabled={
                                isUpdating ||
                                !domainInput ||
                                domainInput === tenantInfo.customDomain
                            }
                            className="px-6 py-3.5 bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all disabled:opacity-50"
                        >
                            Update Custom Domain
                        </button>
                    </div>
                    <p className="text-xs text-slate-500">
                        Updating your domain will reset your verification status. You will
                        need to verify your DNS again.
                    </p>
                </div>

                {/* DNS Instructions */}
                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <h3 className="font-bold text-slate-900 dark:text-white">
                        DNS Setup Instructions
                    </h3>
                    <p className="text-sm text-slate-500">
                        To link your custom domain, add the following DNS records through
                        your domain provider (e.g., GoDaddy, Namecheap).
                    </p>

                    <div className="grid gap-4">
                        <div className="p-5 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-700/50 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    Recommended (CNAME)
                                </span>
                                <span className="text-[10px] font-bold text-brand-500 uppercase">
                                    Subdomains
                                </span>
                            </div>
                            <div className="grid grid-cols-3 gap-4 text-sm font-mono p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/50 dark:border-slate-700">
                                <div className="text-slate-400">Type</div>
                                <div className="text-slate-400">Host</div>
                                <div className="text-slate-400">Value</div>
                                <div className="text-slate-600 dark:text-slate-300">CNAME</div>
                                <div className="text-slate-600 dark:text-slate-300">@</div>
                                <div className="text-slate-600 dark:text-slate-300">
                                    cname.your-saas.com
                                </div>
                            </div>
                        </div>

                        <div className="p-5 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-700/50 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    Alternative (A Record)
                                </span>
                                <span className="text-[10px] font-bold text-amber-500 uppercase">
                                    Root Domains
                                </span>
                            </div>
                            <div className="grid grid-cols-3 gap-4 text-sm font-mono p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/50 dark:border-slate-700">
                                <div className="text-slate-400">Type</div>
                                <div className="text-slate-400">Host</div>
                                <div className="text-slate-400">Value</div>
                                <div className="text-slate-600 dark:text-slate-300">A</div>
                                <div className="text-slate-600 dark:text-slate-300">@</div>
                                <div className="text-slate-600 dark:text-slate-300">
                                    76.76.21.21
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

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

            <div className="max-w-4xl mx-auto">
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
                                    <motion.div
                                        key="general"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="space-y-6"
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <Globe className="w-5 h-5 text-brand-600" />
                                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                                General Information
                                            </h2>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-1.5 md:col-span-2">
                                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                    Logo URL
                                                </label>
                                                <div className="flex gap-4 items-center">
                                                    {formData.logo && (
                                                        <img
                                                            src={formData.logo}
                                                            alt="Logo"
                                                            className="w-16 h-16 object-contain rounded-lg border border-slate-200 dark:border-slate-700 bg-white"
                                                        />
                                                    )}
                                                    <input
                                                        type="text"
                                                        value={formData.logo}
                                                        onChange={(e) =>
                                                            setFormData({ ...formData, logo: e.target.value })
                                                        }
                                                        className="flex-1 px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 hover:border-brand-500/50 outline-none transition-all duration-200"
                                                        placeholder="https://example.com/logo.png"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-1.5 md:col-span-2">
                                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                    Brand Name
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.brandName}
                                                    onChange={(e) =>
                                                        setFormData({
                                                            ...formData,
                                                            brandName: e.target.value,
                                                        })
                                                    }
                                                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 hover:border-brand-500/50 outline-none transition-all duration-200"
                                                    placeholder="e.g., LuxeAudio"
                                                />
                                            </div>

                                            <div className="space-y-1.5 md:col-span-2">
                                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                    Site Description
                                                </label>
                                                <textarea
                                                    rows={3}
                                                    value={formData.siteDescription}
                                                    onChange={(e) =>
                                                        setFormData({
                                                            ...formData,
                                                            siteDescription: e.target.value,
                                                        })
                                                    }
                                                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 hover:border-brand-500/50 outline-none transition-all duration-200 resize-none"
                                                    placeholder="Tell us about your store..."
                                                />
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                                    <Mail className="w-4 h-4 text-slate-400" /> Contact
                                                    Email
                                                </label>
                                                <input
                                                    type="email"
                                                    value={formData.contactEmail}
                                                    onChange={(e) =>
                                                        setFormData({
                                                            ...formData,
                                                            contactEmail: e.target.value,
                                                        })
                                                    }
                                                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 hover:border-brand-500/50 outline-none transition-all duration-200"
                                                    placeholder="support@example.com"
                                                />
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                                    <Phone className="w-4 h-4 text-slate-400" /> Contact
                                                    Phone
                                                </label>
                                                <input
                                                    type="tel"
                                                    value={formData.contactPhone}
                                                    onChange={(e) =>
                                                        setFormData({
                                                            ...formData,
                                                            contactPhone: e.target.value,
                                                        })
                                                    }
                                                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 hover:border-brand-500/50 outline-none transition-all duration-200"
                                                    placeholder="+1 (555) 000-0000"
                                                />
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                                    <Phone className="w-4 h-4 text-slate-400" /> WhatsApp
                                                    Phone
                                                </label>
                                                <input
                                                    type="tel"
                                                    value={formData.whatsappPhone}
                                                    onChange={(e) =>
                                                        setFormData({
                                                            ...formData,
                                                            whatsappPhone: e.target.value,
                                                        })
                                                    }
                                                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 hover:border-brand-500/50 outline-none transition-all duration-200"
                                                    placeholder="+1 (555) 000-0000"
                                                />
                                            </div>

                                            <div className="space-y-1.5 md:col-span-2">
                                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                                    <MapPin className="w-4 h-4 text-slate-400" /> Address
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.address}
                                                    onChange={(e) =>
                                                        setFormData({
                                                            ...formData,
                                                            address: e.target.value,
                                                        })
                                                    }
                                                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 hover:border-brand-500/50 outline-none transition-all duration-200"
                                                    placeholder="123 Store St, Sound City"
                                                />
                                            </div>

                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === "domain" && (
                                    <motion.div
                                        key="domain"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="space-y-8"
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <Globe className="w-5 h-5 text-brand-600" />
                                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                                Custom Domain
                                            </h2>
                                        </div>

                                        <DomainSettings />
                                    </motion.div>
                                )}

                                {activeTab === "email" && (
                                    <motion.div
                                        key="email"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="space-y-6"
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <Mail className="w-5 h-5 text-brand-600" />
                                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                                SMTP Configuration
                                            </h2>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-1.5 md:col-span-2">
                                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                    SMTP Host
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.smtp.host}
                                                    onChange={(e) =>
                                                        setFormData({
                                                            ...formData,
                                                            smtp: { ...formData.smtp, host: e.target.value },
                                                        })
                                                    }
                                                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 hover:border-brand-500/50 outline-none transition-all duration-200"
                                                    placeholder="smtp.example.com"
                                                />
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                    SMTP Port
                                                </label>
                                                <input
                                                    type="number"
                                                    value={formData.smtp.port}
                                                    onChange={(e) =>
                                                        setFormData({
                                                            ...formData,
                                                            smtp: {
                                                                ...formData.smtp,
                                                                port: parseInt(e.target.value),
                                                            },
                                                        })
                                                    }
                                                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 hover:border-brand-500/50 outline-none transition-all duration-200"
                                                    placeholder="587"
                                                />
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                    Encryption (SSL/TLS)
                                                </label>
                                                <div className="flex items-center gap-4 h-[58px]">
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            checked={formData.smtp.secure}
                                                            onChange={() =>
                                                                setFormData({
                                                                    ...formData,
                                                                    smtp: { ...formData.smtp, secure: true },
                                                                })
                                                            }
                                                            className="w-4 h-4 text-brand-600"
                                                        />
                                                        <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                                                            SSL/TLS
                                                        </span>
                                                    </label>
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            checked={!formData.smtp.secure}
                                                            onChange={() =>
                                                                setFormData({
                                                                    ...formData,
                                                                    smtp: { ...formData.smtp, secure: false },
                                                                })
                                                            }
                                                            className="w-4 h-4 text-brand-600"
                                                        />
                                                        <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                                                            STARTTLS
                                                        </span>
                                                    </label>
                                                </div>
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                    Username
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.smtp.user}
                                                    onChange={(e) =>
                                                        setFormData({
                                                            ...formData,
                                                            smtp: { ...formData.smtp, user: e.target.value },
                                                        })
                                                    }
                                                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 hover:border-brand-500/50 outline-none transition-all duration-200"
                                                    placeholder="user@example.com"
                                                />
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                    Password
                                                </label>
                                                <input
                                                    type="password"
                                                    value={formData.smtp.pass}
                                                    onChange={(e) =>
                                                        setFormData({
                                                            ...formData,
                                                            smtp: { ...formData.smtp, pass: e.target.value },
                                                        })
                                                    }
                                                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 hover:border-brand-500/50 outline-none transition-all duration-200"
                                                    placeholder="••••••••"
                                                />
                                            </div>

                                            <div className="space-y-1.5 md:col-span-2">
                                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                    Sender Email (From)
                                                </label>
                                                <input
                                                    type="email"
                                                    value={formData.smtp.from}
                                                    onChange={(e) =>
                                                        setFormData({
                                                            ...formData,
                                                            smtp: { ...formData.smtp, from: e.target.value },
                                                        })
                                                    }
                                                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 hover:border-brand-500/50 outline-none transition-all duration-200"
                                                    placeholder="noreply@yourdomain.com"
                                                />
                                                <p className="text-xs text-slate-500">
                                                    The email address that will appear in the "From" field
                                                    of outgoing emails.
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === "payment" && (
                                    <motion.div
                                        key="payment"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="space-y-6"
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <CreditCard className="w-5 h-5 text-brand-600" />
                                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                                Payment Credentials
                                            </h2>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Stripe Section */}
                                            <div className="space-y-1.5 md:col-span-2">
                                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                                                    Stripe Configuration
                                                </h3>
                                                <div className="space-y-4">
                                                    <div className="space-y-1.5">
                                                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                            Publishable Key
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={formData.payment.stripePublishableKey}
                                                            onChange={(e) =>
                                                                setFormData({
                                                                    ...formData,
                                                                    payment: {
                                                                        ...formData.payment,
                                                                        stripePublishableKey: e.target.value,
                                                                    },
                                                                })
                                                            }
                                                            className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 hover:border-brand-500/50 outline-none transition-all duration-200"
                                                            placeholder="pk_test_..."
                                                        />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                            Secret Key
                                                        </label>
                                                        <input
                                                            type="password"
                                                            value={formData.payment.stripeSecretKey}
                                                            onChange={(e) =>
                                                                setFormData({
                                                                    ...formData,
                                                                    payment: {
                                                                        ...formData.payment,
                                                                        stripeSecretKey: e.target.value,
                                                                    },
                                                                })
                                                            }
                                                            className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 hover:border-brand-500/50 outline-none transition-all duration-200"
                                                            placeholder="sk_test_..."
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="w-full h-px bg-slate-200 dark:bg-slate-800 md:col-span-2" />

                                            {/* SSL Commerce Section */}
                                            <div className="space-y-1.5 md:col-span-2">
                                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                                                    SSL Commerce Configuration
                                                </h3>
                                                <div className="space-y-4">
                                                    <div className="space-y-1.5">
                                                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                            Store ID
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={formData.payment.sslCommerzStoreId}
                                                            onChange={(e) =>
                                                                setFormData({
                                                                    ...formData,
                                                                    payment: {
                                                                        ...formData.payment,
                                                                        sslCommerzStoreId: e.target.value,
                                                                    },
                                                                })
                                                            }
                                                            className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 hover:border-brand-500/50 outline-none transition-all duration-200"
                                                            placeholder="Enter Store ID"
                                                        />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                            Store Password
                                                        </label>
                                                        <input
                                                            type="password"
                                                            value={formData.payment.sslCommerzStorePassword}
                                                            onChange={(e) =>
                                                                setFormData({
                                                                    ...formData,
                                                                    payment: {
                                                                        ...formData.payment,
                                                                        sslCommerzStorePassword: e.target.value,
                                                                    },
                                                                })
                                                            }
                                                            className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 hover:border-brand-500/50 outline-none transition-all duration-200"
                                                            placeholder="Enter Store Password"
                                                        />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={formData.payment.sslCommerzIsSandbox}
                                                                onChange={(e) =>
                                                                    setFormData({
                                                                        ...formData,
                                                                        payment: {
                                                                            ...formData.payment,
                                                                            sslCommerzIsSandbox: e.target.checked,
                                                                        },
                                                                    })
                                                                }
                                                                className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500"
                                                            />
                                                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                                Sandbox Mode
                                                            </span>
                                                        </label>
                                                        <p className="text-xs text-slate-500 pl-6">
                                                            Enable this for testing payments without real
                                                            transactions.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === "currencies" && (
                                    <motion.div
                                        key="currencies"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="space-y-6"
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <Banknote className="w-5 h-5 text-brand-600" />
                                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                                Localization & Currencies
                                            </h2>
                                        </div>

                                        {/* Supported Currencies List */}
                                        <div className="space-y-4">
                                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block">
                                                Manage Currencies
                                            </label>
                                            <div className="grid gap-4">
                                                {formData.supportedCurrencies?.map(
                                                    (currency, index) => (
                                                        <div
                                                            key={index}
                                                            className="bg-slate-50 dark:bg-slate-900/30 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 relative group transition-all"
                                                        >
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const newCurrencies =
                                                                        formData.supportedCurrencies.filter(
                                                                            (_, i) => i !== index,
                                                                        );
                                                                    setFormData({
                                                                        ...formData,
                                                                        supportedCurrencies: newCurrencies,
                                                                    });
                                                                }}
                                                                className="absolute -top-2 -right-2 p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-10"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>

                                                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                                                <div className="space-y-1">
                                                                    <span className="text-[10px] font-bold uppercase text-slate-400">
                                                                        Name
                                                                    </span>
                                                                    <input
                                                                        type="text"
                                                                        value={currency.name}
                                                                        onChange={(e) => {
                                                                            const next = [
                                                                                ...formData.supportedCurrencies,
                                                                            ];
                                                                            next[index].name = e.target.value;
                                                                            setFormData({
                                                                                ...formData,
                                                                                supportedCurrencies: next,
                                                                            });
                                                                        }}
                                                                        className="w-full bg-white dark:bg-slate-800 border border-transparent focus:border-brand-500/50 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500/20 outline-none transition-all duration-200"
                                                                    />
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <span className="text-[10px] font-bold uppercase text-slate-400">
                                                                        Code
                                                                    </span>
                                                                    <input
                                                                        type="text"
                                                                        value={currency.code}
                                                                        onChange={(e) => {
                                                                            const next = [
                                                                                ...formData.supportedCurrencies,
                                                                            ];
                                                                            next[index].code =
                                                                                e.target.value.toUpperCase();
                                                                            setFormData({
                                                                                ...formData,
                                                                                supportedCurrencies: next,
                                                                            });
                                                                        }}
                                                                        className="w-full bg-white dark:bg-slate-800 border border-transparent focus:border-brand-500/50 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500/20 outline-none transition-all duration-200"
                                                                    />
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <span className="text-[10px] font-bold uppercase text-slate-400">
                                                                        Symbol
                                                                    </span>
                                                                    <input
                                                                        type="text"
                                                                        value={currency.symbol}
                                                                        onChange={(e) => {
                                                                            const next = [
                                                                                ...formData.supportedCurrencies,
                                                                            ];
                                                                            next[index].symbol = e.target.value;
                                                                            setFormData({
                                                                                ...formData,
                                                                                supportedCurrencies: next,
                                                                            });
                                                                        }}
                                                                        className="w-full bg-white dark:bg-slate-800 border border-transparent focus:border-brand-500/50 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500/20 outline-none transition-all duration-200"
                                                                    />
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <span className="text-[10px] font-bold uppercase text-slate-400">
                                                                        Rate (vs Base)
                                                                    </span>
                                                                    <input
                                                                        type="number"
                                                                        step="0.0001"
                                                                        value={currency.rate}
                                                                        onChange={(e) => {
                                                                            const next = [
                                                                                ...formData.supportedCurrencies,
                                                                            ];
                                                                            next[index].rate = parseFloat(
                                                                                e.target.value,
                                                                            );
                                                                            setFormData({
                                                                                ...formData,
                                                                                supportedCurrencies: next,
                                                                            });
                                                                        }}
                                                                        className="w-full bg-white dark:bg-slate-800 border border-transparent focus:border-brand-500/50 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500/20 outline-none transition-all duration-200"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ),
                                                )}
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setFormData({
                                                        ...formData,
                                                        supportedCurrencies: [
                                                            ...formData.supportedCurrencies,
                                                            { code: "", symbol: "", rate: 1, name: "" },
                                                        ],
                                                    });
                                                }}
                                                className="w-full py-4 border-2 border-dashed border-slate-200 dark:border-slate-700/50 rounded-2xl flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400 hover:border-brand-500 hover:text-brand-600 transition-all font-semibold"
                                            >
                                                <Plus className="w-5 h-5" />
                                                Add New Currency
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                                            <div className="space-y-1.5">
                                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                    Base Store Currency
                                                </label>
                                                <select
                                                    value={formData.currency}
                                                    onChange={(e) =>
                                                        setFormData({
                                                            ...formData,
                                                            currency: e.target.value,
                                                        })
                                                    }
                                                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 hover:border-brand-500/50 outline-none transition-all duration-200"
                                                >
                                                    {formData.supportedCurrencies?.map((c) => (
                                                        <option key={c.code} value={c.code}>
                                                            {c.name} ({c.code})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                    Default Symbol
                                                </label>
                                                <div className="px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 text-slate-500 font-bold">
                                                    {formData.supportedCurrencies?.find(
                                                        (c) => c.code === formData.currency,
                                                    )?.symbol || "৳"}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === "social" && (
                                    <motion.div
                                        key="social"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="space-y-6"
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <Share2 className="w-5 h-5 text-brand-600" />
                                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                                Social Presence
                                            </h2>
                                        </div>

                                        <div className="grid grid-cols-1 gap-6">
                                            {Object.keys(formData.socialLinks).map((key) => (
                                                <div key={key} className="space-y-1.5">
                                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 capitalize">
                                                        {key} Profile URL
                                                    </label>
                                                    <div className="relative group">
                                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors">
                                                            <Share2 className="w-4 h-4" />
                                                        </span>
                                                        <input
                                                            type="url"
                                                            value={(formData.socialLinks as any)[key]}
                                                            onChange={(e) =>
                                                                setFormData({
                                                                    ...formData,
                                                                    socialLinks: {
                                                                        ...formData.socialLinks,
                                                                        [key]: e.target.value,
                                                                    },
                                                                })
                                                            }
                                                            className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 hover:border-brand-500/50 outline-none transition-all duration-200"
                                                            placeholder={`https://${key}.com/yourstore`}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === "marketing" && (
                                    <motion.div
                                        key="marketing"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="space-y-6"
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <TrendingUp className="w-5 h-5 text-brand-600" />
                                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                                Analytics & Marketing
                                            </h2>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            {/* Google Analytics Section */}
                                            <div className="space-y-6 p-6 bg-slate-50 dark:bg-slate-900/40 rounded-3xl border border-slate-100 dark:border-slate-700/50">
                                                <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-700/50">
                                                    <Globe className="w-4 h-4 text-brand-500" />
                                                    <h3 className="font-bold text-slate-800 dark:text-slate-200">
                                                        Google Services
                                                    </h3>
                                                </div>
                                                <div className="space-y-4">
                                                    <div className="space-y-1.5">
                                                        <label className="text-[12px] font-bold text-slate-500 uppercase">
                                                            Measurement ID
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={formData.marketing.googleAnalyticsId}
                                                            onChange={(e) =>
                                                                setFormData({
                                                                    ...formData,
                                                                    marketing: {
                                                                        ...formData.marketing,
                                                                        googleAnalyticsId: e.target.value,
                                                                    },
                                                                })
                                                            }
                                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none text-sm"
                                                            placeholder="G-XXXXXXXXXX"
                                                        />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="text-[12px] font-bold text-slate-500 uppercase">
                                                            Site Verification
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={formData.marketing.googleSiteVerification}
                                                            onChange={(e) =>
                                                                setFormData({
                                                                    ...formData,
                                                                    marketing: {
                                                                        ...formData.marketing,
                                                                        googleSiteVerification: e.target.value,
                                                                    },
                                                                })
                                                            }
                                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none text-sm"
                                                            placeholder="Verification code"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Meta Section */}
                                            <div className="space-y-6 p-6 bg-slate-50 dark:bg-slate-900/40 rounded-3xl border border-slate-100 dark:border-slate-700/50">
                                                <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-700/50">
                                                    <MessageSquare className="w-4 h-4 text-blue-500" />
                                                    <h3 className="font-bold text-slate-800 dark:text-slate-200">
                                                        Meta (Facebook)
                                                    </h3>
                                                </div>
                                                <div className="space-y-4">
                                                    <div className="space-y-1.5">
                                                        <label className="text-[12px] font-bold text-slate-500 uppercase">
                                                            Pixel ID
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={formData.marketing.facebookPixelId}
                                                            onChange={(e) =>
                                                                setFormData({
                                                                    ...formData,
                                                                    marketing: {
                                                                        ...formData.marketing,
                                                                        facebookPixelId: e.target.value,
                                                                    },
                                                                })
                                                            }
                                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none text-sm"
                                                            placeholder="123456789..."
                                                        />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="text-[12px] font-bold text-slate-500 uppercase">
                                                            Domain Verify
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={
                                                                formData.marketing.facebookDomainVerification
                                                            }
                                                            onChange={(e) =>
                                                                setFormData({
                                                                    ...formData,
                                                                    marketing: {
                                                                        ...formData.marketing,
                                                                        facebookDomainVerification: e.target.value,
                                                                    },
                                                                })
                                                            }
                                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none text-sm"
                                                            placeholder="Verification string"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === "navbar" && (
                                    <motion.div
                                        key="navbar"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="space-y-6"
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2">
                                                <Menu className="w-5 h-5 text-brand-600" />
                                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                                    Navbar Menu
                                                </h2>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setFormData({
                                                        ...formData,
                                                        navbarLinks: [
                                                            ...formData.navbarLinks,
                                                            {
                                                                label: "",
                                                                href: "",
                                                                order: formData.navbarLinks.length,
                                                                isOpenInNewTab: false,
                                                                isActive: true,
                                                            },
                                                        ],
                                                    });
                                                }}
                                                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-brand-500/20 flex items-center gap-2"
                                            >
                                                <Plus className="w-4 h-4" />
                                                Add Link
                                            </button>
                                        </div>

                                        <p className="text-sm text-slate-500 mb-6">
                                            Manage the main navigation links of your store. Leave
                                            empty to use default links (Home, Shop, Contact).
                                        </p>

                                        <div className="space-y-4">
                                            {formData.navbarLinks.length === 0 ? (
                                                <div className="text-center py-12 bg-slate-50 dark:bg-slate-900/40 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
                                                    <Menu className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                                    <p className="text-slate-500 font-medium">
                                                        No custom links yet
                                                    </p>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setFormData({
                                                                ...formData,
                                                                navbarLinks: [
                                                                    {
                                                                        label: "Home",
                                                                        href: "/",
                                                                        order: 0,
                                                                        isOpenInNewTab: false,
                                                                        isActive: true,
                                                                    },
                                                                    {
                                                                        label: "Shop",
                                                                        href: "/products",
                                                                        order: 1,
                                                                        isOpenInNewTab: false,
                                                                        isActive: true,
                                                                    },
                                                                    {
                                                                        label: "Contact",
                                                                        href: "/contact",
                                                                        order: 2,
                                                                        isOpenInNewTab: false,
                                                                        isActive: true,
                                                                    },
                                                                ],
                                                            });
                                                        }}
                                                        className="mt-4 text-brand-600 font-bold hover:underline"
                                                    >
                                                        Initialize with defaults
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="grid gap-4">
                                                    {[...formData.navbarLinks]
                                                        .sort((a, b) => a.order - b.order)
                                                        .map((link, index) => (
                                                            <div
                                                                key={index}
                                                                className="bg-slate-50 dark:bg-slate-900/30 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 group relative transition-all"
                                                            >
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const next = formData.navbarLinks.filter(
                                                                            (_, i) => i !== index,
                                                                        );
                                                                        setFormData({
                                                                            ...formData,
                                                                            navbarLinks: next,
                                                                        });
                                                                    }}
                                                                    className="absolute -top-2 -right-2 p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-10"
                                                                >
                                                                    <X className="w-4 h-4" />
                                                                </button>

                                                                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                                                                    <div className="md:col-span-4 space-y-1">
                                                                        <label className="text-[10px] font-bold uppercase text-slate-400">
                                                                            Label
                                                                        </label>
                                                                        <input
                                                                            type="text"
                                                                            value={link.label}
                                                                            onChange={(e) => {
                                                                                const next = [...formData.navbarLinks];
                                                                                next[index].label = e.target.value;
                                                                                setFormData({
                                                                                    ...formData,
                                                                                    navbarLinks: next,
                                                                                });
                                                                            }}
                                                                            placeholder="e.g. Products"
                                                                            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all duration-200"
                                                                        />
                                                                    </div>
                                                                    <div className="md:col-span-4 space-y-1">
                                                                        <label className="text-[10px] font-bold uppercase text-slate-400">
                                                                            URL / Path
                                                                        </label>
                                                                        <input
                                                                            type="text"
                                                                            value={link.href}
                                                                            onChange={(e) => {
                                                                                const next = [...formData.navbarLinks];
                                                                                next[index].href = e.target.value;
                                                                                setFormData({
                                                                                    ...formData,
                                                                                    navbarLinks: next,
                                                                                });
                                                                            }}
                                                                            placeholder="e.g. /products"
                                                                            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all duration-200"
                                                                        />
                                                                    </div>
                                                                    <div className="md:col-span-2 space-y-1">
                                                                        <label className="text-[10px] font-bold uppercase text-slate-400">
                                                                            Order
                                                                        </label>
                                                                        <input
                                                                            type="number"
                                                                            value={link.order}
                                                                            onChange={(e) => {
                                                                                const next = [...formData.navbarLinks];
                                                                                next[index].order =
                                                                                    parseInt(e.target.value) || 0;
                                                                                setFormData({
                                                                                    ...formData,
                                                                                    navbarLinks: next,
                                                                                });
                                                                            }}
                                                                            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all duration-200"
                                                                        />
                                                                    </div>
                                                                    <div className="md:col-span-2 flex items-center justify-around pb-2">
                                                                        <div className="flex flex-col items-center gap-1">
                                                                            <span className="text-[10px] font-bold uppercase text-slate-400">
                                                                                New Tab
                                                                            </span>
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={link.isOpenInNewTab}
                                                                                onChange={(e) => {
                                                                                    const next = [
                                                                                        ...formData.navbarLinks,
                                                                                    ];
                                                                                    next[index].isOpenInNewTab =
                                                                                        e.target.checked;
                                                                                    setFormData({
                                                                                        ...formData,
                                                                                        navbarLinks: next,
                                                                                    });
                                                                                }}
                                                                                className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500"
                                                                            />
                                                                        </div>
                                                                        <div className="flex flex-col items-center gap-1">
                                                                            <span className="text-[10px] font-bold uppercase text-slate-400">
                                                                                Active
                                                                            </span>
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={link.isActive !== false}
                                                                                onChange={(e) => {
                                                                                    const next = [
                                                                                        ...formData.navbarLinks,
                                                                                    ];
                                                                                    next[index].isActive =
                                                                                        e.target.checked;
                                                                                    setFormData({
                                                                                        ...formData,
                                                                                        navbarLinks: next,
                                                                                    });
                                                                                }}
                                                                                className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === "footer" && (
                                    <motion.div
                                        key="footer"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="space-y-8"
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2">
                                                <Layout className="w-5 h-5 text-brand-600" />
                                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                                    Footer Configuration
                                                </h2>
                                            </div>
                                        </div>

                                        {/* General Footer Settings */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-slate-50 dark:bg-slate-900/40 rounded-3xl border border-slate-100 dark:border-slate-700/50">
                                            <div className="space-y-1.5">
                                                <label className="text-[12px] font-bold text-slate-500 uppercase">
                                                    Footer Description
                                                </label>
                                                <textarea
                                                    value={formData.footerDescription}
                                                    onChange={(e) =>
                                                        setFormData({
                                                            ...formData,
                                                            footerDescription: e.target.value,
                                                        })
                                                    }
                                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none text-sm min-h-[100px]"
                                                    placeholder="Short bio for the footer..."
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[12px] font-bold text-slate-500 uppercase">
                                                    Copyright Text
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.footerCopyright}
                                                    onChange={(e) =>
                                                        setFormData({
                                                            ...formData,
                                                            footerCopyright: e.target.value,
                                                        })
                                                    }
                                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none text-sm"
                                                    placeholder="© 2026 Your Store. All rights reserved."
                                                />
                                                <p className="text-[10px] text-slate-400 mt-1 italic">
                                                    Include "Heart" keyword to keep the animated heart
                                                    icon.
                                                </p>
                                            </div>
                                        </div>

                                        {/* Footer Sections */}
                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-bold text-slate-800 dark:text-slate-200 uppercase text-xs tracking-wider">
                                                    Footer Sections
                                                </h3>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setFormData({
                                                            ...formData,
                                                            footerSections: [
                                                                ...formData.footerSections,
                                                                {
                                                                    title: "",
                                                                    order: formData.footerSections.length,
                                                                    links: [],
                                                                },
                                                            ],
                                                        });
                                                    }}
                                                    className="px-3 py-1.5 text-xs bg-brand-50 text-brand-600 hover:bg-brand-100 rounded-lg font-bold transition-all flex items-center gap-1"
                                                >
                                                    <Plus className="w-3 h-3" />
                                                    Add Section
                                                </button>
                                            </div>

                                            {formData.footerSections.length === 0 ? (
                                                <div className="text-center py-12 bg-slate-50/50 dark:bg-slate-900/20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                                                    <Layout className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                                    <p className="text-slate-500 font-medium">
                                                        No footer sections configured
                                                    </p>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setFormData({
                                                                ...formData,
                                                                footerDescription:
                                                                    "Elevating your audio experience with premium sound and design.",
                                                                footerCopyright: `© ${new Date().getFullYear()} ${formData.brandName}. Made with Heart by Gowtam Kumar.`,
                                                                footerSections: [
                                                                    {
                                                                        title: "Shop Categories",
                                                                        order: 0,
                                                                        links: [
                                                                            {
                                                                                label: "All Products",
                                                                                href: "/products",
                                                                                order: 0,
                                                                                isOpenInNewTab: false,
                                                                                isActive: true,
                                                                            },
                                                                            {
                                                                                label: "Headphones",
                                                                                href: "/products?category=headphones",
                                                                                order: 1,
                                                                                isOpenInNewTab: false,
                                                                                isActive: true,
                                                                            },
                                                                            {
                                                                                label: "Speakers",
                                                                                href: "/products?category=speakers",
                                                                                order: 2,
                                                                                isOpenInNewTab: false,
                                                                                isActive: true,
                                                                            },
                                                                        ],
                                                                    },
                                                                    {
                                                                        title: "Company",
                                                                        order: 1,
                                                                        links: [
                                                                            {
                                                                                label: "About Us",
                                                                                href: "/",
                                                                                order: 0,
                                                                                isOpenInNewTab: false,
                                                                                isActive: true,
                                                                            },
                                                                            {
                                                                                label: "Contact",
                                                                                href: "/contact",
                                                                                order: 1,
                                                                                isOpenInNewTab: false,
                                                                                isActive: true,
                                                                            },
                                                                            {
                                                                                label: "Privacy Policy",
                                                                                href: "/privacy",
                                                                                order: 2,
                                                                                isOpenInNewTab: false,
                                                                                isActive: true,
                                                                            },
                                                                        ],
                                                                    },
                                                                ],
                                                            });
                                                        }}
                                                        className="mt-4 text-brand-600 font-bold hover:underline"
                                                    >
                                                        Initialize with defaults
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="space-y-8">
                                                    {[...formData.footerSections]
                                                        .sort((a, b) => a.order - b.order)
                                                        .map((section, sIdx) => (
                                                            <div
                                                                key={sIdx}
                                                                className="bg-slate-50/50 dark:bg-slate-800/20 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 relative group/section"
                                                            >
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const next = formData.footerSections.filter(
                                                                            (_, i) => i !== sIdx,
                                                                        );
                                                                        setFormData({
                                                                            ...formData,
                                                                            footerSections: next,
                                                                        });
                                                                    }}
                                                                    className="absolute -top-2 -right-2 p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-red-500 rounded-full opacity-0 group-hover/section:opacity-100 transition-opacity shadow-sm z-10"
                                                                >
                                                                    <X className="w-4 h-4" />
                                                                </button>

                                                                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
                                                                    <div className="md:col-span-8 space-y-1">
                                                                        <label className="text-[10px] font-bold uppercase text-slate-400">
                                                                            Section Title
                                                                        </label>
                                                                        <input
                                                                            type="text"
                                                                            value={section.title}
                                                                            onChange={(e) => {
                                                                                const next = [
                                                                                    ...formData.footerSections,
                                                                                ];
                                                                                next[sIdx].title = e.target.value;
                                                                                setFormData({
                                                                                    ...formData,
                                                                                    footerSections: next,
                                                                                });
                                                                            }}
                                                                            placeholder="e.g. Shop categories"
                                                                            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all duration-200"
                                                                        />
                                                                    </div>
                                                                    <div className="md:col-span-4 space-y-1">
                                                                        <label className="text-[10px] font-bold uppercase text-slate-400">
                                                                            Order
                                                                        </label>
                                                                        <input
                                                                            type="number"
                                                                            value={section.order}
                                                                            onChange={(e) => {
                                                                                const next = [
                                                                                    ...formData.footerSections,
                                                                                ];
                                                                                next[sIdx].order =
                                                                                    parseInt(e.target.value) || 0;
                                                                                setFormData({
                                                                                    ...formData,
                                                                                    footerSections: next,
                                                                                });
                                                                            }}
                                                                            className="w-full bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                                                                        />
                                                                    </div>
                                                                </div>

                                                                {/* Nested Links */}
                                                                <div className="space-y-4 pl-4 border-l-2 border-slate-200 dark:border-slate-700 mt-4">
                                                                    <div className="flex items-center justify-between mb-2">
                                                                        <span className="text-[10px] font-bold uppercase text-slate-500">
                                                                            Links in this section
                                                                        </span>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                const next = [
                                                                                    ...formData.footerSections,
                                                                                ];
                                                                                next[sIdx].links.push({
                                                                                    label: "",
                                                                                    href: "",
                                                                                    order: next[sIdx].links.length,
                                                                                    isOpenInNewTab: false,
                                                                                    isActive: true,
                                                                                });
                                                                                setFormData({
                                                                                    ...formData,
                                                                                    footerSections: next,
                                                                                });
                                                                            }}
                                                                            className="text-[10px] font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                                                                        >
                                                                            <Plus className="w-3 h-3" /> Add Link
                                                                        </button>
                                                                    </div>

                                                                    <div className="grid gap-3">
                                                                        {section.links
                                                                            .sort((a, b) => a.order - b.order)
                                                                            .map((link, lIdx) => (
                                                                                <div
                                                                                    key={lIdx}
                                                                                    className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end bg-white dark:bg-slate-900/40 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50 group/link relative"
                                                                                >
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={() => {
                                                                                            const next = [
                                                                                                ...formData.footerSections,
                                                                                            ];
                                                                                            next[sIdx].links = next[
                                                                                                sIdx
                                                                                            ].links.filter(
                                                                                                (_, i) => i !== lIdx,
                                                                                            );
                                                                                            setFormData({
                                                                                                ...formData,
                                                                                                footerSections: next,
                                                                                            });
                                                                                        }}
                                                                                        className="absolute -top-1 -right-1 p-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-red-500 rounded-full opacity-0 group-hover/link:opacity-100 transition-opacity z-10"
                                                                                    >
                                                                                        <X className="w-3 h-3" />
                                                                                    </button>
                                                                                    <div className="md:col-span-4 space-y-1">
                                                                                        <label className="text-[9px] font-bold uppercase text-slate-400">
                                                                                            Label
                                                                                        </label>
                                                                                        <input
                                                                                            type="text"
                                                                                            value={link.label}
                                                                                            onChange={(e) => {
                                                                                                const next = [
                                                                                                    ...formData.footerSections,
                                                                                                ];
                                                                                                next[sIdx].links[lIdx].label =
                                                                                                    e.target.value;
                                                                                                setFormData({
                                                                                                    ...formData,
                                                                                                    footerSections: next,
                                                                                                });
                                                                                            }}
                                                                                            className="w-full bg-slate-50 dark:bg-slate-800/80 border border-transparent focus:border-brand-500/50 rounded-lg px-2 py-1.5 text-[13px] focus:ring-2 focus:ring-brand-500/20 outline-none transition-all duration-200"
                                                                                        />
                                                                                    </div>
                                                                                    <div className="md:col-span-4 space-y-1">
                                                                                        <label className="text-[9px] font-bold uppercase text-slate-400">
                                                                                            URL
                                                                                        </label>
                                                                                        <input
                                                                                            type="text"
                                                                                            value={link.href}
                                                                                            onChange={(e) => {
                                                                                                const next = [
                                                                                                    ...formData.footerSections,
                                                                                                ];
                                                                                                next[sIdx].links[lIdx].href =
                                                                                                    e.target.value;
                                                                                                setFormData({
                                                                                                    ...formData,
                                                                                                    footerSections: next,
                                                                                                });
                                                                                            }}
                                                                                            className="w-full bg-slate-50 dark:bg-slate-800/80 border border-transparent focus:border-brand-500/50 rounded-lg px-2 py-1.5 text-[13px] focus:ring-2 focus:ring-brand-500/20 outline-none transition-all duration-200"
                                                                                        />
                                                                                    </div>
                                                                                    <div className="md:col-span-2 space-y-1">
                                                                                        <label className="text-[9px] font-bold uppercase text-slate-400">
                                                                                            Order
                                                                                        </label>
                                                                                        <input
                                                                                            type="number"
                                                                                            value={link.order}
                                                                                            onChange={(e) => {
                                                                                                const next = [
                                                                                                    ...formData.footerSections,
                                                                                                ];
                                                                                                next[sIdx].links[lIdx].order =
                                                                                                    parseInt(e.target.value) || 0;
                                                                                                setFormData({
                                                                                                    ...formData,
                                                                                                    footerSections: next,
                                                                                                });
                                                                                            }}
                                                                                            className="w-full bg-slate-50 dark:bg-slate-800/80 border border-transparent focus:border-brand-500/50 rounded-lg px-2 py-1.5 text-[13px] focus:ring-2 focus:ring-brand-500/20 outline-none transition-all duration-200"
                                                                                        />
                                                                                    </div>
                                                                                    <div className="md:col-span-2 flex items-center justify-around pb-1.5">
                                                                                        <div className="flex flex-col items-center gap-1">
                                                                                            <span className="text-[9px] font-bold uppercase text-slate-400">
                                                                                                New Tab
                                                                                            </span>
                                                                                            <input
                                                                                                type="checkbox"
                                                                                                checked={link.isOpenInNewTab}
                                                                                                onChange={(e) => {
                                                                                                    const next = [
                                                                                                        ...formData.footerSections,
                                                                                                    ];
                                                                                                    next[sIdx].links[
                                                                                                        lIdx
                                                                                                    ].isOpenInNewTab =
                                                                                                        e.target.checked;
                                                                                                    setFormData({
                                                                                                        ...formData,
                                                                                                        footerSections: next,
                                                                                                    });
                                                                                                }}
                                                                                                className="w-3.5 h-3.5 text-brand-600 rounded"
                                                                                            />
                                                                                        </div>
                                                                                        <div className="flex flex-col items-center gap-1">
                                                                                            <span className="text-[9px] font-bold uppercase text-slate-400">
                                                                                                Active
                                                                                            </span>
                                                                                            <input
                                                                                                type="checkbox"
                                                                                                checked={
                                                                                                    link.isActive !== false
                                                                                                }
                                                                                                onChange={(e) => {
                                                                                                    const next = [
                                                                                                        ...formData.footerSections,
                                                                                                    ];
                                                                                                    next[sIdx].links[
                                                                                                        lIdx
                                                                                                    ].isActive = e.target.checked;
                                                                                                    setFormData({
                                                                                                        ...formData,
                                                                                                        footerSections: next,
                                                                                                    });
                                                                                                }}
                                                                                                className="w-3.5 h-3.5 text-brand-600 rounded"
                                                                                            />
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            ))}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === "courier" && (
                                    <motion.div
                                        key="courier"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.2 }}
                                        className="space-y-6"
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="p-2 bg-brand-100 dark:bg-brand-900/30 rounded-lg">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    className="w-5 h-5 text-brand-600"
                                                >
                                                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                                                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                                                </svg>
                                            </div>
                                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                                Courier Configuration
                                            </h2>
                                        </div>

                                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {/* <div className="space-y-1.5 md:col-span-2">
                                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                        Pathao Base URL
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={formData.pathaoCourier.pathaoBaseUrl}
                                                        onChange={(e) =>
                                                            setFormData({
                                                                ...formData,
                                                                pathaoCourier: {
                                                                    ...formData.pathaoCourier,
                                                                    pathaoBaseUrl: e.target.value,
                                                                },
                                                            })
                                                        }
                                                        className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 hover:border-brand-500/50 outline-none transition-all duration-200"
                                                        placeholder="https://api-hermes.pathao.com"
                                                    />
                                                </div> */}

                                                <div className="space-y-1.5">
                                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                        Pathao Client ID
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={formData.pathaoCourier.pathaoClientId}
                                                        onChange={(e) =>
                                                            setFormData({
                                                                ...formData,
                                                                pathaoCourier: {
                                                                    ...formData.pathaoCourier,
                                                                    pathaoClientId: e.target.value,
                                                                },
                                                            })
                                                        }
                                                        className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 hover:border-brand-500/50 outline-none transition-all duration-200"
                                                        placeholder="Enter Client ID"
                                                    />
                                                </div>

                                                <div className="space-y-1.5">
                                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                        Pathao Client Secret
                                                    </label>
                                                    <input
                                                        type="password"
                                                        value={formData.pathaoCourier.pathaoClientSecret}
                                                        onChange={(e) =>
                                                            setFormData({
                                                                ...formData,
                                                                pathaoCourier: {
                                                                    ...formData.pathaoCourier,
                                                                    pathaoClientSecret: e.target.value,
                                                                },
                                                            })
                                                        }
                                                        className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 hover:border-brand-500/50 outline-none transition-all duration-200"
                                                        placeholder="Enter Client Secret"
                                                    />
                                                </div>

                                                <div className="space-y-1.5">
                                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                        Pathao Username
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={formData.pathaoCourier.pathaoUsername}
                                                        onChange={(e) =>
                                                            setFormData({
                                                                ...formData,
                                                                pathaoCourier: {
                                                                    ...formData.pathaoCourier,
                                                                    pathaoUsername: e.target.value,
                                                                },
                                                            })
                                                        }
                                                        className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 hover:border-brand-500/50 outline-none transition-all duration-200"
                                                        placeholder="Enter Username"
                                                    />
                                                </div>

                                                <div className="space-y-1.5">
                                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                        Pathao Password
                                                    </label>
                                                    <input
                                                        type="password"
                                                        value={formData.pathaoCourier.pathaoPassword}
                                                        onChange={(e) =>
                                                            setFormData({
                                                                ...formData,
                                                                pathaoCourier: {
                                                                    ...formData.pathaoCourier,
                                                                    pathaoPassword: e.target.value,
                                                                },
                                                            })
                                                        }
                                                        className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 hover:border-brand-500/50 outline-none transition-all duration-200"
                                                        placeholder="Enter Password"
                                                    />
                                                </div>

                                                <div className="space-y-1.5">
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={formData.pathaoCourier.sandboxMode}
                                                            onChange={(e) =>
                                                                setFormData({
                                                                    ...formData,
                                                                    pathaoCourier: {
                                                                        ...formData.pathaoCourier,
                                                                        sandboxMode: e.target.checked,
                                                                    },
                                                                })
                                                            }
                                                            className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500"
                                                        />
                                                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                            Sandbox Mode
                                                        </span>
                                                    </label>
                                                    <p className="text-xs text-slate-500 pl-6">
                                                        Enable this for testing configation without real
                                                        transactions.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Steadfast Courier Section */}
                                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm mt-6">
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Steadfast Courier Settings</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                                <div className="space-y-1.5">
                                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                        API Key
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={formData.steadfastCourier.apiKey}
                                                        onChange={(e) =>
                                                            setFormData({
                                                                ...formData,
                                                                steadfastCourier: {
                                                                    ...formData.steadfastCourier,
                                                                    apiKey: e.target.value,
                                                                },
                                                            })
                                                        }
                                                        className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 hover:border-brand-500/50 outline-none transition-all duration-200"
                                                        placeholder="Enter API Key"
                                                    />
                                                </div>

                                                <div className="space-y-1.5">
                                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                        Secret Key
                                                    </label>
                                                    <input
                                                        type="password"
                                                        value={formData.steadfastCourier.secretKey}
                                                        onChange={(e) =>
                                                            setFormData({
                                                                ...formData,
                                                                steadfastCourier: {
                                                                    ...formData.steadfastCourier,
                                                                    secretKey: e.target.value,
                                                                },
                                                            })
                                                        }
                                                        className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 hover:border-brand-500/50 outline-none transition-all duration-200"
                                                        placeholder="Enter Secret Key"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </form>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
