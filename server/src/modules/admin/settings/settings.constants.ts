import { UpdateSiteSettingsDto } from './dto/settings.dto';

export const BASIC_DEFAULT_SETTINGS: UpdateSiteSettingsDto = {
  logo: "",
  favicon: "",
  brandName: "LuxeAudio",
  siteDescription: "Elevating your audio experience with premium sound and design.",
  metaTitle: "",
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
  timezone: "Asia/Dhaka",
  locale: "en-US",
  defaultBranchId: "",
  probationDays: 90,
  documentExpiryAlertDays: 30,
};
