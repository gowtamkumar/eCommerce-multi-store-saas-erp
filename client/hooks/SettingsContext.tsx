"use client";

import { setClientStoreId } from '@/lib/store-store-id';
import { formatCurrency } from '@/lib/utils';
import { fetchAPI } from '@/services/api';
import { usePathname } from 'next/navigation';
import { createContext, useContext, useEffect, useState } from 'react';
import { DEFAULT_SETTINGS } from '../services/defaultSettings';

interface SiteSettings {
  logo: string;
  favicon?: string;
  brandName: string;
  siteDescription: string;
  metaTitle?: string;
  contactEmail: string;
  contactPhone: string;
  whatsappPhone: string;
  address: string;
  currency: string;
  currencySymbol: string;
  supportedCurrencies: Array<{
    code: string;
    symbol: string;
    rate: number;
    name: string;
  }>;
  socialLinks: {
    facebook: string;
    twitter: string;
    instagram: string;
    linkedin: string;
  };
  marketing?: {
    googleAnalyticsId?: string;
    facebookPixelId?: string;
    googleSiteVerification?: string;
    facebookDomainVerification?: string;
    requireConsent?: boolean;
  };
  navbar?: {
    layout?: 'default' | 'centered' | 'minimal' | 'sidebar';
    template?: 'classic' | 'glass' | 'floating' | 'gradient';
    backgroundColor?: string;
    textColor?: string;
    shadowIntensity?: 'none' | 'subtle' | 'medium' | 'strong';
    hoverEffect?: 'underline' | 'glow' | 'background';
    borderRadius?: string;
    sticky?: boolean;
    maxWidth?: 'standard' | 'full';
    bottomShape?: 'none' | 'wave' | 'curve' | 'slant' | 'notch';
    backgroundPattern?: 'none' | 'dots' | 'mesh' | 'grid' | 'stripes';
    transparent?: boolean;
    showCurrency?: boolean;
    links?: {
      label: string;
      href: string;
      order: number;
      isOpenInNewTab: boolean;
      isActive: boolean;
    }[];
  };
  trustBadges?: Array<{
    icon: string;
    title: string;
    description: string;
  }>;
  pathaoCourier?: {
    pathaoClientId?: string;
    pathaoStoreId?: string;
    sandboxMode?: boolean;
  };
  steadfastCourier?: {
    apiKey?: string;
  };
  shippingConfig?: {
    insideCityFee?: number;
    outsideCityFee?: number;
    freeShippingThreshold?: number;
  };
  footer?: {
    template?: 'classic' | 'glass' | 'modern' | 'elegant' | 'corporate';
    backgroundColor?: string;
    textColor?: string;
    brandColor?: string;
    borderColor?: string;
    shadowIntensity?: 'none' | 'subtle' | 'medium' | 'strong';
    borderRadius?: string;
    topShape?: 'none' | 'wave' | 'curve' | 'slant' | 'notch';
    backgroundPattern?: 'none' | 'dots' | 'mesh' | 'grid' | 'stripes';
    glassEffect?: boolean;
    columns?: '1' | '2' | '3' | '4';
    showSocialLinks?: boolean;
    showNewsletter?: boolean;
    description?: string;
    copyright?: string;
    sections?: Array<{
      title: string;
      order: number;
      links: Array<{
        label: string;
        href: string;
        order: number;
        isOpenInNewTab: boolean;
        isActive: boolean;
      }>;
    }>;
  };
  productsPage?: {
    bannerHeadline?: string;
    bannerSubheadline?: string;
    bannerTagline?: string;
    bannerShow?: boolean;
    bannerStyle?: "modern" | "minimal" | "image" | string;
    productsPerRow?: number;
    sidebarStyle?: "modern" | "minimal" | string;
    showSearch?: boolean;
    showCategories?: boolean;
    showBrands?: boolean;
    showPriceFilter?: boolean;
    bannerImage?: string;
    bannerBackgroundColor?: string;
    bannerOverlayOpacity?: number;
    bannerTextColor?: string;
    bannerFullWidth?: boolean;
  };
  singleProductPage?: {
    showBreadcrumb?: boolean;
    showRating?: boolean;
    showStock?: boolean;
    showFeatures?: boolean;
    showShare?: boolean;
    showPromotions?: boolean;
    showStickyCart?: boolean;
    showRelatedProducts?: boolean;
    showProductReviews?: boolean;
    showProductFAQs?: boolean;
    relatedProductsPerRow?: number;
  };
  offersPage?: {
    bannerShow?: boolean;
    bannerHeadline?: string;
    bannerSubheadline?: string;
    showFilters?: boolean;
    productsPerRow?: number;
    bannerHeight?: number;
    bannerFullWidth?: boolean;
    bannerImage?: string;
    bannerBackgroundColor?: string;
    bannerTextColor?: string;
  };
  robotsTxt?: string;
  labelSettings?: {
    newArrivalText?: string;
    bestSellerText?: string;
  };
  timezone?: string;
  locale?: string;
  theme?: {
    mode?: 'system' | 'light' | 'dark';
    primaryColor?: string;
    accentColor?: string;
    fontFamily?: string;
  };
  defaultBranchId?: string;
  branding?: {
    footerText?: string;
    brandMarkUrl?: string;
    showPoweredBy?: boolean;
  };
  status?: string;
  isSaaS?: boolean;
  storeId?: string;
  removeBranding?: boolean;
}

interface SettingsContextType {
  settings: SiteSettings | null;
  loading: boolean;
  selectedCurrency: { code: string; symbol: string; rate: number };
  setCurrency: (code: string) => void;
  refreshSettings: () => Promise<void>;
  convertPrice: (amount: number) => number;
  formatPrice: (amount: number) => string;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

type StoreCurrency = { code: string; symbol: string; rate: number };

function getBaseCurrency(settings: SiteSettings | null | undefined): StoreCurrency {
  if (!settings?.currency) {
    return {
      code: DEFAULT_SETTINGS.currency,
      symbol: DEFAULT_SETTINGS.currencySymbol,
      rate: 1,
    };
  }
  const base = settings.supportedCurrencies?.find((c) => c.code === settings.currency);
  return base || { code: settings.currency, symbol: settings.currencySymbol, rate: 1 };
}

function isAdminPath(pathname?: string | null): boolean {
  const currentPath =
    pathname ?? (typeof window !== 'undefined' ? window.location.pathname : '');
  return (
    currentPath.startsWith('/admin') ||
    currentPath.startsWith('/supplier-portal')
  );
}

function readSavedCurrency(
  settings: SiteSettings | null | undefined,
  storageKey: string,
): StoreCurrency | null {
  if (typeof window === 'undefined' || !settings) return null;

  const savedCurrency = localStorage.getItem(storageKey);
  if (!savedCurrency) return null;

  try {
    const parsed = JSON.parse(savedCurrency);
    const exists = settings.supportedCurrencies?.find((c) => c.code === parsed.code);
    return exists ?? null;
  } catch {
    return null;
  }
}

function resolveSelectedCurrency(
  settings: SiteSettings | null | undefined,
  pathname?: string | null,
): StoreCurrency {
  if (isAdminPath(pathname)) {
    return (
      readSavedCurrency(settings, 'adminSelectedCurrency') ??
      getBaseCurrency(settings)
    );
  }

  return (
    readSavedCurrency(settings, 'selectedCurrency') ??
    getBaseCurrency(settings)
  );
}

export function SettingsProvider({
  children,
  initialSettings
}: {
  children: React.ReactNode,
  initialSettings?: SiteSettings | null
}) {
  const pathname = usePathname();
  const [settings, setSettings] = useState<SiteSettings | null>(initialSettings || null);
  const [loading, setLoading] = useState(!initialSettings);
  const [selectedCurrency, setSelectedCurrency] = useState<StoreCurrency>(() =>
    getBaseCurrency(initialSettings || null),
  );

  const fetchSettings = async () => {
    try {
      const data = await fetchAPI('/settings');

      if (data.success) {
        const settings = data.data;
        const mergedSettings = {
          ...DEFAULT_SETTINGS,
          ...settings,
          socialLinks: {
            ...DEFAULT_SETTINGS.socialLinks,
            ...settings?.socialLinks,
          },
          marketing: { ...DEFAULT_SETTINGS.marketing, ...settings?.marketing },
          navbar: { ...DEFAULT_SETTINGS.navbar, ...settings?.navbar },
          footer: { ...DEFAULT_SETTINGS.footer, ...settings?.footer },
          productsPage: { ...DEFAULT_SETTINGS.productsPage, ...settings?.productsPage },
          singleProductPage: { ...DEFAULT_SETTINGS.singleProductPage, ...settings?.singleProductPage },
          offersPage: { ...DEFAULT_SETTINGS.offersPage, ...settings?.offersPage },
          labelSettings: { ...DEFAULT_SETTINGS.labelSettings, ...settings?.labelSettings },
          theme: { ...DEFAULT_SETTINGS.theme, ...settings?.theme },
          branding: { ...DEFAULT_SETTINGS.branding, ...settings?.branding },
          shippingConfig: {
            insideCityFee: 60,
            outsideCityFee: 120,
            freeShippingThreshold: 5000,
            ...settings?.shippingConfig
          },
        };
        setSettings(mergedSettings);
        if (settings?.storeId) {
          setClientStoreId(settings.storeId);
        }

        setSelectedCurrency(resolveSelectedCurrency(mergedSettings, pathname));
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialSettings?.storeId) {
      setClientStoreId(initialSettings.storeId);
    }
  }, [initialSettings?.storeId]);

  useEffect(() => {
    if (!initialSettings && !settings) {
      fetchSettings();
    }
  }, [initialSettings, settings]);

  useEffect(() => {
    const effectiveSettings = settings ?? initialSettings;
    if (effectiveSettings) {
      setSelectedCurrency(resolveSelectedCurrency(effectiveSettings, pathname));
    }
  }, [initialSettings, settings, pathname]);

  const setCurrency = (code: string) => {
    if (!settings?.supportedCurrencies) return;
    const currency = settings.supportedCurrencies.find(c => c.code === code);
    if (currency) {
      setSelectedCurrency(currency);
      const storageKey = isAdminPath(pathname)
        ? 'adminSelectedCurrency'
        : 'selectedCurrency';
      localStorage.setItem(storageKey, JSON.stringify(currency));
    }
  };

  const refreshSettings = async () => {
    setLoading(true);
    await fetchSettings();
  };

  const convertPrice = (amount: number) => {
    if (!settings || !selectedCurrency) return amount;
    // Definition: 1 Selected Unit = Rate Base Units
    // Price_in_Selected = Price_in_Base / Rate
    return amount / (selectedCurrency.rate || 1);
  };

  const formatPrice = (amount: number) => {
    const converted = convertPrice(amount);
    const num = typeof converted === 'number' && !isNaN(converted) ? converted : 0;

    const isAdminRoute = isAdminPath(pathname);

    if (isAdminRoute) {
      return formatCurrency(num, selectedCurrency.symbol);
    }

    if (typeof converted !== 'number' || isNaN(converted)) {
      try {
        const locale = settings?.locale || 'en-US';
        return new Intl.NumberFormat(locale, {
          style: 'currency',
          currency: selectedCurrency.code,
        }).format(0);
      } catch {
        return `${selectedCurrency.symbol}0.00`;
      }
    }
    try {
      const locale = settings?.locale || 'en-US';
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: selectedCurrency.code,
      }).format(converted);
    } catch {
      return `${selectedCurrency.symbol}${converted.toFixed(2)}`;
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        loading,
        selectedCurrency,
        setCurrency,
        refreshSettings,
        convertPrice,
        formatPrice
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
