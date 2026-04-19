
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
    | "system";


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
    SYSTEM = "system",
}



export interface SectionProps {
    formData: any;
    setFormData: (data: any) => void;
}
