import nestApiUrl from "../lib/api-url";
import { getTenantId } from "./tenant";

export const DEFAULT_SETTINGS = {
  logo: "",
  brandName: "LuxeAudio",
  siteDescription:
    "Elevating your audio experience with premium sound and design.",
  contactEmail: "support@luxesaas.com",
  contactPhone: "+8801722222222",
  whatsappPhone: "+8801722222222",
  address: "123 Audio Street, Sound City, SC 90210",
  currency: "BDT",
  currencySymbol: "৳",
  supportedCurrencies: [
    { code: "BDT", symbol: "৳", rate: 1, name: "Bangladeshi Taka" },
    { code: "USD", symbol: "$", rate: 120, name: "US Dollar" },
  ],
  socialLinks: { facebook: "", twitter: "", instagram: "", linkedin: "" },
  marketing: {
    googleAnalyticsId: "",
    googleSiteVerification: "",
    facebookPixelId: "",
    facebookDomainVerification: "",
  },
};

export async function getSiteSettings() {
  try {
    const tenantId = await getTenantId();

    if (!tenantId) {
      return {
        ...DEFAULT_SETTINGS,
        brandName: "LuxeSaaS",
        siteDescription: "The premium multi-tenant eCommerce platform.",
        contactEmail: "support@luxesaas.com",
      };
    }

    const res = await fetch(`${nestApiUrl}/settings`, {
      headers: {
        "x-tenant-id": tenantId,
      },
      // Removed cache: 'no-store' to allow Next.js deduplication and caching
      next: { revalidate: 60 }, // Cache settings for 60 seconds
    });

    if (res.ok) {
      const data = await res.json();
      const settings = data.success ? data.data : data;

      // Merge with defaults to ensure all fields exist
      return {
        ...DEFAULT_SETTINGS,
        ...settings,
        // Deep merge objects if necessary, but surface level spread often sufficient for these nested objects
        socialLinks: {
          ...DEFAULT_SETTINGS.socialLinks,
          ...settings?.socialLinks,
        },
        marketing: { ...DEFAULT_SETTINGS.marketing, ...settings?.marketing },
      };
    }

    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error("Failed to fetch site settings:", error);
    return DEFAULT_SETTINGS;
  }
}
