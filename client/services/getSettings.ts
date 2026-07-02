import nestApiUrl from "../lib/api-url";
import { getTenantId } from "./tenant";
import { DEFAULT_SETTINGS } from "./defaultSettings";

export async function getSiteSettings() {
  try {
    const tenantId = await getTenantId();

    if (!tenantId) {
      return {
        ...DEFAULT_SETTINGS,
        brandName: "LuxeSaaS",
        siteDescription: "The premium multi-tenant eCommerce platform.",
        contactEmail: "support@gowtam.com",
        isSaaS: true,
      };
    }

    // Cache per-tenant public settings briefly instead of no-store. Next keys
    // the Data Cache on URL + request headers, so the x-tenant-id header keeps
    // each tenant's settings isolated. The "site-settings" tag allows targeted
    // revalidation (revalidateTag) when settings change.
    const res = await fetch(`${nestApiUrl}/settings/public`, {
      headers: {
        "x-tenant-id": tenantId,
      },
      next: { revalidate: 60, tags: [`site-settings:${tenantId}`] },
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
        navbar: { ...DEFAULT_SETTINGS.navbar, ...settings?.navbar },
        footer: { ...DEFAULT_SETTINGS.footer, ...settings?.footer },
        productsPage: { ...DEFAULT_SETTINGS.productsPage, ...settings?.productsPage },
        singleProductPage: { ...DEFAULT_SETTINGS.singleProductPage, ...settings?.singleProductPage },
        offersPage: { ...DEFAULT_SETTINGS.offersPage, ...settings?.offersPage },
        labelSettings: { ...DEFAULT_SETTINGS.labelSettings, ...settings?.labelSettings },
        theme: { ...DEFAULT_SETTINGS.theme, ...settings?.theme },
        branding: { ...DEFAULT_SETTINGS.branding, ...settings?.branding },
      };
    }

    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error("Failed to fetch site settings:", error);
    return DEFAULT_SETTINGS;
  }
}
