import mongoose, { Document, Model, Schema } from "mongoose";

export interface ISiteSettings extends Document {
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
    marketing: {
        googleAnalyticsId: string;
        googleSiteVerification: string;
        facebookPixelId: string;
        facebookDomainVerification: string;
    };
    tenantId: mongoose.Types.ObjectId;
}

const SiteSettingsSchema: Schema = new Schema(
    {
        brandName: { type: String, default: "LuxeAudio" },
        siteDescription: { type: String, default: "Elevating your audio experience with premium sound and design." },
        contactEmail: { type: String, default: "support@luxeaudio.com" },
        contactPhone: { type: String, default: "+1 (555) 123-4567" },
        whatsappPhone: { type: String, default: "+1 (555) 123-4567" },
        address: { type: String, default: "123 Audio Street, Sound City, SC 90210" },
        currency: { type: String, default: 'BDT' },
        currencySymbol: { type: String, default: "৳" },
        supportedCurrencies: [
            {
                code: { type: String, default: 'BDT' },
                symbol: { type: String, default: "৳" },
                rate: { type: Number, default: 1 },
                name: { type: String, default: "Bangladeshi Taka" }
            },
            {
                code: { type: String, default: "USD" },
                symbol: { type: String, default: "$" },
                rate: { type: Number, default: 120 },
                name: { type: String, default: "US Dollar" }
            }
        ],
        socialLinks: {
            facebook: { type: String, default: "" },
            twitter: { type: String, default: "" },
            instagram: { type: String, default: "" },
            linkedin: { type: String, default: "" },
        },
        marketing: {
            googleAnalyticsId: { type: String, default: "" },
            googleSiteVerification: { type: String, default: "" },
            facebookPixelId: { type: String, default: "" },
            facebookDomainVerification: { type: String, default: "" },
        },
        tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
    },
    { timestamps: true }
);

const SiteSettings: Model<ISiteSettings> =
    mongoose.models.SiteSettings || mongoose.model<ISiteSettings>("SiteSettings", SiteSettingsSchema);

export default SiteSettings;
