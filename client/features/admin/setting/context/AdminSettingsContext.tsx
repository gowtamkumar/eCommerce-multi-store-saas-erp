"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { fetchAPI } from "@/services/api";
import toast from "react-hot-toast";
import { TabType } from "../types";

interface AdminSettingsContextType {
    formData: any;
    setFormData: (data: any) => void;
    loading: boolean;
    saving: boolean;
    handleSubmit: (e?: React.FormEvent) => Promise<void>;
    refreshSettings: () => Promise<void>;
    collapsedFooterSections: Set<number>;
    setCollapsedFooterSections: (sections: Set<number>) => void;
}

const AdminSettingsContext = createContext<AdminSettingsContextType | undefined>(undefined);

export function AdminSettingsProvider({ children }: { children: React.ReactNode }) {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [collapsedFooterSections, setCollapsedFooterSections] = useState<Set<number>>(new Set());
    const [formData, setFormData] = useState({
        logo: "",
        favicon: "",
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
            requireConsent: true,
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
        sms: {
            apiKey: "",
            senderId: "",
        },
        shippingConfig: {
            insideCityFee: 60,
            outsideCityFee: 120,
            freeShippingThreshold: 5000,
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
            showCurrency: true,
            links: [] as any[],
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
            sections: [] as any[],
        },
        trustBadges: [] as any[],
        productsPage: {
            bannerHeadline: "",
            bannerSubheadline: "",
            bannerTagline: "",
            bannerShow: true,
            bannerStyle: "modern" as "modern" | "minimal",
            productsPerRow: 4,
            sidebarStyle: "modern" as "modern" | "minimal",
            showSearch: true,
            showCategories: true,
            showBrands: true,
            showPriceFilter: true,
        },
        singleProductPage: {
            showBreadcrumb: true,
            showRating: true,
            showStock: true,
            showFeatures: true,
            showShare: true,
            showPromotions: true,
            showStickyCart: true,
            showRelatedProducts: true,
            showProductReviews: true,
            showProductFAQs: true,
            relatedProductsPerRow: 4,
        },
        offersPage: {
            bannerShow: true,
            bannerHeadline: "",
            bannerSubheadline: "",
            showFilters: true,
            productsPerRow: 5,
        },
        labelSettings: {
            newArrivalText: "New",
            bestSellerText: "Best Seller",
        },
        timezone: "Asia/Dhaka",
        locale: "en-US",
        theme: {
            mode: "system" as "system" | "light" | "dark",
            primaryColor: "#2563eb",
            accentColor: "#0f172a",
            fontFamily: "Inter",
        },
        defaultBranchId: "",
        branding: {
            footerText: "",
            brandMarkUrl: "",
            showPoweredBy: true,
        },
    });

    const loadSettings = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetchAPI("/settings");
            if (res.data) {
                const data = res.data;
                setFormData({
                    logo: data.logo || "",
                    favicon: data.favicon || "",
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
                        googleSiteVerification: data.marketing?.googleSiteVerification || "",
                        facebookPixelId: data.marketing?.facebookPixelId || "",
                        facebookDomainVerification: data.marketing?.facebookDomainVerification || "",
                        requireConsent: data.marketing?.requireConsent !== false,
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
                        sslCommerzStorePassword: data.payment?.sslCommerzStorePassword || "",
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
                    sms: {
                        apiKey: data.sms?.apiKey || "",
                        senderId: data.sms?.senderId || "",
                    },
                    shippingConfig: {
                        insideCityFee: data.shippingConfig?.insideCityFee || 60,
                        outsideCityFee: data.shippingConfig?.outsideCityFee || 120,
                        freeShippingThreshold: data.shippingConfig?.freeShippingThreshold || 5000,
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
                        showCurrency: data.navbar?.showCurrency !== false,
                        links: data.navbar?.links || []
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
                    productsPage: data.productsPage || {
                        bannerHeadline: "",
                        bannerSubheadline: "",
                        bannerTagline: "",
                        bannerShow: true,
                        bannerStyle: "modern",
                        productsPerRow: 4,
                        sidebarStyle: "modern",
                        showSearch: true,
                        showCategories: true,
                        showBrands: true,
                        showPriceFilter: true,
                    },
                    singleProductPage: data.singleProductPage || {
                        showBreadcrumb: true,
                        showRating: true,
                        showStock: true,
                        showFeatures: true,
                        showShare: true,
                        showPromotions: true,
                        showStickyCart: true,
                        showRelatedProducts: true,
                        showProductReviews: true,
                        showProductFAQs: true,
                        relatedProductsPerRow: 4,
                    },
                    offersPage: data.offersPage || {
                        bannerShow: true,
                        bannerHeadline: "",
                        bannerSubheadline: "",
                        showFilters: true,
                        productsPerRow: 5,
                    },
                    labelSettings: data.labelSettings || {
                        newArrivalText: "New",
                        bestSellerText: "Best Seller",
                    },
                    timezone: data.timezone || "Asia/Dhaka",
                    locale: data.locale || "en-US",
                    theme: data.theme || {
                        mode: "system",
                        primaryColor: "#2563eb",
                        accentColor: "#0f172a",
                        fontFamily: "Inter",
                    },
                    defaultBranchId: data.defaultBranchId || "",
                    branding: data.branding || {
                        footerText: "",
                        brandMarkUrl: "",
                        showPoweredBy: true,
                    },
                });
            }
        } catch (error) {
            console.error("Failed to load settings", error);
            toast.error("Failed to load settings");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadSettings();
    }, [loadSettings]);

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setSaving(true);

        const updatedData = {
            ...formData,
            currencySymbol:
                formData.supportedCurrencies.find((c: any) => c.code === formData.currency)
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

    return (
        <AdminSettingsContext.Provider
            value={{
                formData,
                setFormData,
                loading,
                saving,
                handleSubmit,
                refreshSettings: loadSettings,
                collapsedFooterSections,
                setCollapsedFooterSections
            }}
        >
            {children}
        </AdminSettingsContext.Provider>
    );
}

export function useAdminSettings() {
    const context = useContext(AdminSettingsContext);
    if (context === undefined) {
        throw new Error("useAdminSettings must be used within an AdminSettingsProvider");
    }
    return context;
}
