"use client";

import { DEFAULT_SETTINGS } from '../services/getSettings';
import { fetchAPI } from '@/services/api';
import { createContext, useContext, useEffect, useState } from 'react';

interface SiteSettings {
  logo: string;
  brandName: string;
  siteDescription: string;
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

export function SettingsProvider({
  children,
  initialSettings
}: {
  children: React.ReactNode,
  initialSettings?: SiteSettings | null
}) {
  const [settings, setSettings] = useState<SiteSettings | null>(initialSettings || null);
  const [loading, setLoading] = useState(!initialSettings);
  const [selectedCurrency, setSelectedCurrency] = useState<{
    code: string;
    symbol: string;
    rate: number
  }>({ code: 'USD', symbol: '$', rate: 1 });

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
        };
        setSettings(mergedSettings);

        // Initialize currency from localStorage or default
        const savedCurrency = localStorage.getItem('selectedCurrency');
        if (savedCurrency) {
          try {
            const parsed = JSON.parse(savedCurrency);
            const exists = mergedSettings.supportedCurrencies?.find((c: any) => c.code === parsed.code);
            if (exists) {
              setSelectedCurrency(exists);
            } else {
              const base = mergedSettings.supportedCurrencies?.find((c: any) => c.code === mergedSettings.currency);
              setSelectedCurrency(base || { code: mergedSettings.currency, symbol: mergedSettings.currencySymbol, rate: 1 });
            }
          } catch (e) {
            console.error('Failed to parse saved currency:', e);
          }
        } else {
          const base = mergedSettings.supportedCurrencies?.find((c: any) => c.code === mergedSettings.currency);
          setSelectedCurrency(base || { code: mergedSettings.currency, symbol: mergedSettings.currencySymbol, rate: 1 });
        }
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialSettings) {
      fetchSettings();
    } else {
      // Even if we have initial settings, we should check for local currency preference
      const savedCurrency = localStorage.getItem('selectedCurrency');
      if (savedCurrency) {
        try {
          const parsed = JSON.parse(savedCurrency);
          const exists = initialSettings.supportedCurrencies?.find((c: any) => c.code === parsed.code);
          if (exists) {
            setSelectedCurrency(exists);
          }
        } catch (e) { }
      }
    }
  }, [initialSettings]);

  const setCurrency = (code: string) => {
    if (!settings?.supportedCurrencies) return;
    const currency = settings.supportedCurrencies.find(c => c.code === code);
    if (currency) {
      setSelectedCurrency(currency);
      localStorage.setItem('selectedCurrency', JSON.stringify(currency));
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
    if (typeof converted !== 'number' || isNaN(converted)) {
      return `${selectedCurrency.symbol}0.00`;
    }
    return `${selectedCurrency.symbol}${converted.toFixed(2)}`;
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
