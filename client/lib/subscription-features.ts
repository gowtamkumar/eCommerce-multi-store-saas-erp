export interface SubscriptionFeature {
    key: string;
    label: string;
    group: string;
}

export const MASTER_SUBSCRIPTION_FEATURES: SubscriptionFeature[] = [
    // Insights
    { key: 'insights:dashboard', label: 'Dashboard Access', group: 'Insights' },

    // Catalog
    { key: 'catalog:products', label: 'Products Management', group: 'Catalog' },
    { key: 'catalog:categories', label: 'Categories Management', group: 'Catalog' },
    { key: 'catalog:brands', label: 'Brands Management', group: 'Catalog' },
    { key: 'catalog:media', label: 'Media Gallery', group: 'Catalog' },
    { key: 'catalog:reviews', label: 'Product Reviews', group: 'Catalog' },

    // Sales & CRM
    { key: 'sales:orders', label: 'Order Management', group: 'Sales & CRM' },
    { key: 'sales:carts', label: 'Active Carts Tracking', group: 'Sales & CRM' },
    { key: 'sales:returns', label: 'Returns Management', group: 'Sales & CRM' },
    { key: 'sales:payments', label: 'Payments Tracking', group: 'Sales & CRM' },
    { key: 'sales:invoices', label: 'Invoice Generation', group: 'Sales & CRM' },
    { key: 'sales:customers', label: 'Customer Directory', group: 'Sales & CRM' },

    // Operations
    { key: 'operations:inventory', label: 'Inventory Management', group: 'Operations' },
    { key: 'operations:suppliers', label: 'Suppliers Management', group: 'Operations' },
    { key: 'operations:purchases', label: 'Purchase Orders', group: 'Operations' },
    { key: 'operations:couriers', label: 'Couriers Integration', group: 'Operations' },
    { key: 'operations:expenses', label: 'Expense Tracking', group: 'Operations' },

    // Marketing
    { key: 'marketing:coupons', label: 'Coupons Engine', group: 'Marketing' },
    { key: 'marketing:promotions', label: 'Promotions Management', group: 'Marketing' },
    { key: 'marketing:leads', label: 'Newsletter Leads', group: 'Marketing' },
    { key: 'marketing:subscribers', label: 'Subscribers List', group: 'Marketing' },
    { key: 'marketing:campaigns', label: 'Messaging Campaigns', group: 'Marketing' },

    // Reports
    { key: 'reports:sales', label: 'Sales Analysis', group: 'Reports' },
    { key: 'reports:finance', label: 'Finance Summary', group: 'Reports' },
    { key: 'reports:profit-loss', label: 'Profit & Loss', group: 'Reports' },
    { key: 'reports:supplier-ledger', label: 'Supplier Ledger', group: 'Reports' },
    { key: 'reports:customer-ledger', label: 'Customer Ledger', group: 'Reports' },
    { key: 'reports:cash-flow', label: 'Cash Flow Analysis', group: 'Reports' },
    { key: 'reports:export', label: 'Data Export Center', group: 'Reports' },

    // Access Control
    { key: 'access:team', label: 'Staff Accounts & Roles', group: 'Access Control' },

    // Storefront & UI
    { key: 'ui:pages', label: 'Custom Pages Builder', group: 'Storefront & UI' },
    { key: 'ui:navbar', label: 'Navbar Customization', group: 'Storefront & UI' },
    { key: 'ui:footer', label: 'Footer Customization', group: 'Storefront & UI' },
    { key: 'ui:products-page', label: 'Product List UI Config', group: 'Storefront & UI' },
    { key: 'ui:single-product', label: 'Product Detail UI Config', group: 'Storefront & UI' },
    { key: 'ui:offers-page', label: 'Offers Page UI Config', group: 'Storefront & UI' },
    { key: 'ui:faqs', label: 'FAQs Management', group: 'Storefront & UI' },

    // System Settings
    { key: 'settings:domain', label: 'Custom Domain Support', group: 'System Settings' },
    { key: 'settings:email', label: 'Custom Email SMTP Config', group: 'System Settings' },
    { key: 'settings:sms', label: 'SMS Gateway Config', group: 'System Settings' },
    { key: 'settings:payment', label: 'Payment Methods Config', group: 'System Settings' },
    { key: 'settings:courier', label: 'Courier Rules Config', group: 'System Settings' },
    { key: 'settings:label', label: 'Custom Labels Config', group: 'System Settings' },
    { key: 'settings:trust', label: 'Trust & Safety Badges', group: 'System Settings' },
    { key: 'settings:seo', label: 'Advanced SEO Settings', group: 'System Settings' },
    { key: 'settings:system', label: 'Cache & Performance Settings', group: 'System Settings' },
];

export const GROUPED_FEATURES = MASTER_SUBSCRIPTION_FEATURES.reduce((acc, feature) => {
    if (!acc[feature.group]) {
        acc[feature.group] = [];
    }
    acc[feature.group].push(feature);
    return acc;
}, {} as Record<string, SubscriptionFeature[]>);
