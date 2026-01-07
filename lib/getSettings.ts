import dbConnect from '@/lib/mongodb';
import SiteSettings from '@/models/SiteSettings';
import { getTenantId } from './tenant';

export async function getSiteSettings() {
    try {
        await dbConnect();
        const tenantId = await getTenantId();

        if (!tenantId) {
            // Fallback or explicit error - for now, fallback to default structure but maybe warn
            return {
                logo: "",
                brandName: "LuxeSaaS",
                siteDescription: "The premium multi-tenant eCommerce platform.",
                contactEmail: "support@luxesaas.com",
                socialLinks: { facebook: "", twitter: "", instagram: "", linkedin: "" },
                productMode: "single",
                marketing: { googleAnalyticsId: "", googleSiteVerification: "", facebookPixelId: "", facebookDomainVerification: "" }
            };
        }

        let settings = await SiteSettings.findOne({ tenantId }).lean();
        if (!settings) {
            // Create default if not exists (though typically we might just return defaults without saving)
            // For now, let's just return a default object structure if DB is empty to avoid side effects in GET
            return {
                logo: "",
                brandName: "LuxeAudio",
                siteDescription: "Elevating your audio experience with premium sound and design.",
                contactEmail: "support@luxeaudio.com",
                socialLinks: { facebook: "", twitter: "", instagram: "", linkedin: "" },
                productMode: "single",
                marketing: { googleAnalyticsId: "", googleSiteVerification: "", facebookPixelId: "", facebookDomainVerification: "" }
            };
        }
        return JSON.parse(JSON.stringify(settings));
    } catch (error) {
        console.error("Failed to fetch site settings:", error);
        return {
            logo: "",
            brandName: "LuxeAudio",
            siteDescription: "Elevating your audio experience with premium sound and design.",
            contactEmail: "support@luxeaudio.com",
            socialLinks: { facebook: "", twitter: "", instagram: "", linkedin: "" },
            productMode: "single",
            marketing: { googleAnalyticsId: "", googleSiteVerification: "", facebookPixelId: "", facebookDomainVerification: "" }
        };
    }
}
