import dbConnect from '@/lib/mongodb';
import SiteSettings from '@/models/SiteSettings';

export async function getSiteSettings() {
    try {
        await dbConnect();
        let settings = await SiteSettings.findOne().lean();
        if (!settings) {
            // Create default if not exists (though typically we might just return defaults without saving)
            // For now, let's just return a default object structure if DB is empty to avoid side effects in GET
            return {
                brandName: "LuxeAudio",
                siteDescription: "Elevating your audio experience with premium sound and design.",
                contactEmail: "support@luxeaudio.com",
                socialLinks: { facebook: "", twitter: "", instagram: "", linkedin: "" },
                marketing: { googleAnalyticsId: "", googleSiteVerification: "", facebookPixelId: "", facebookDomainVerification: "" }
            };
        }
        return JSON.parse(JSON.stringify(settings));
    } catch (error) {
        console.error("Failed to fetch site settings:", error);
        return {
            brandName: "LuxeAudio",
            siteDescription: "Elevating your audio experience with premium sound and design.",
            contactEmail: "support@luxeaudio.com",
            socialLinks: { facebook: "", twitter: "", instagram: "", linkedin: "" },
            marketing: { googleAnalyticsId: "", googleSiteVerification: "", facebookPixelId: "", facebookDomainVerification: "" }
        };
    }
}
