
export type TabType =
    | "general"
    | "domain"
    | "email"
    | "payment"
    | "currencies"
    | "social"
    | "marketing"
    | "navbar"
    | "footer"
    | "courier"
    | "trust"
    | "productsPage"
    | "singleProductPage"
    | "offersPage"
    | "label"
    | "sms"
    | "billing"
    | "system"
    | "organization";


export enum TabTypeEnum {
    GENERAL = "general",
    DOMAIN = "domain",
    EMAIL = "email",
    PAYMENT = "payment",
    CURRENCIES = "currencies",
    SOCIAL = "social",
    MARKETING = "marketing",
    NAVBAR = "navbar",
    FOOTER = "footer",
    COURIER = "courier",
    TRUST = "trust",
    PRODUCTS_PAGE = "productsPage",
    SINGLE_PRODUCT_PAGE = "singleProductPage",
    OFFERS_PAGE = "offersPage",
    LABEL = "label",
    SMS = "sms",
    BILLING = "billing",
    SYSTEM = "system",
    ORGANIZATION = "organization",
}



export interface SectionProps {
    formData: any;
    setFormData: (data: any) => void;
}
