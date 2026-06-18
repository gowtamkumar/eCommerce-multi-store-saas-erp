
export type TabType =
    | "general"
    | "domain"
    | "email"
    | "payment"
    | "currencies"
    | "marketing"
    | "navbar"
    | "footer"
    | "courier"
    | "trust"
    | "productsPage"
    | "singleProductPage"
    | "offersPage"
    | "sms"
    | "ai"
    | "billing"
    | "system"
    | "organization";


export enum TabTypeEnum {
    GENERAL = "general",
    DOMAIN = "domain",
    EMAIL = "email",
    PAYMENT = "payment",
    CURRENCIES = "currencies",
    MARKETING = "marketing",
    NAVBAR = "navbar",
    FOOTER = "footer",
    COURIER = "courier",
    TRUST = "trust",
    PRODUCTS_PAGE = "productsPage",
    SINGLE_PRODUCT_PAGE = "singleProductPage",
    OFFERS_PAGE = "offersPage",
    SMS = "sms",
    AI = "ai",
    BILLING = "billing",
    SYSTEM = "system",
    ORGANIZATION = "organization",
}



export interface SectionProps {
    formData: any;
    setFormData: (data: any) => void;
}

export type {
    Branch,
    OrganizationFormData,
    OrganizationTab,
    Warehouse,
    WarehouseBin,
    WarehouseBinFormData,
    WarehouseLocationType,
} from "./types/organization";

export type {
    DomainStatus,
    TenantDomain,
    TenantInfo,
} from "./types/domain";
