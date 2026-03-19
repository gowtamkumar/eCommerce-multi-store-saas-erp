import { Banknote, BarChart3, ChevronDown, ChevronLeft, ChevronRight, CreditCard, Download, FileText, Globe, HelpCircle, History as HistoryIcon, Layout, LayoutDashboard, LogOut, Mail, Menu, MessageSquare, Package, Receipt, RotateCcw, Settings, Share2, ShieldCheck, ShoppingBag, ShoppingCart, Star, Tag, TrendingUp, Truck, User, Users, X, Megaphone, Wallet } from 'lucide-react';

export const navGroups = [
    {
        title: 'Insights',
        items: [
            { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
        ]
    },
    {
        title: 'Catalog & Content',
        items: [
            { icon: Package, label: 'Products', href: '/admin/products' },
            { icon: Tag, label: 'Categories', href: '/admin/categories' },
            { icon: Globe, label: 'Brands', href: '/admin/brands' },
            { icon: Layout, label: 'Pages', href: '/admin/pages' },
            { icon: Menu, label: 'Navbar', href: '/admin/pages' },
            { icon: User, label: 'Media', href: '/admin/media' },
            { icon: HelpCircle, label: 'FAQs', href: '/admin/faqs' },
        ]
    },
    {
        title: 'Sales & CRM',
        items: [
            { icon: ShoppingBag, label: 'Orders', href: '/admin/orders' },
            { icon: RotateCcw, label: 'Returns', href: '/admin/returns' },
            { icon: CreditCard, label: 'Payments', href: '/admin/payments' },
            { icon: FileText, label: 'Invoices', href: '/admin/invoices' },
            { icon: Users, label: 'Customers', href: '/admin/customers' },
            { icon: Star, label: 'Reviews', href: '/admin/reviews' },

        ]
    },
    {
        title: 'Operations',
        items: [
            { icon: Package, label: 'Inventory', href: '/admin/inventory' },
            { icon: Users, label: 'Suppliers', href: '/admin/suppliers' },
            { icon: Truck, label: 'Purchase Orders', href: '/admin/purchases' },
            { icon: Truck, label: 'Couriers', href: '/admin/couriers' },
            { icon: Receipt, label: 'Expenses', href: '/admin/expenses' },
        ]
    },
    {
        title: 'Marketing',
        items: [
            { icon: Tag, label: 'Coupons', href: '/admin/coupons' },
            { icon: Megaphone, label: 'Promotions', href: '/admin/promotions' },
            { icon: MessageSquare, label: 'Newsletter', href: '/admin/leads' },
            { icon: Mail, label: 'Subscribers', href: '/admin/subscribers' },
        ]
    },
    {
        title: 'Financial Reports',
        items: [
            { icon: BarChart3, label: 'Sales Analysis', href: '/admin/reports/sales' },
            { icon: TrendingUp, label: 'Finance Summary', href: '/admin/reports/finance' },
            { icon: FileText, label: 'Profit & Loss', href: '/admin/reports/profit-loss' },
            { icon: Users, label: 'Supplier Ledger', href: '/admin/reports/supplier-ledger' },
            { icon: Wallet, label: 'Cash Flow', href: '/admin/reports/cash-flow' },
            { icon: Download, label: 'Export Center', href: '/admin/reports/export' },
        ]
    },
    {
        title: 'Access Control',
        items: [
            { icon: ShieldCheck, label: 'Team Management', href: '/admin/team' },
        ]
    },
];

export const settingsItems = [
    // General
    { icon: Globe, label: 'General Info', tab: 'general', category: 'General' },
    { icon: Globe, label: 'Custom Domain', tab: 'domain', category: 'General' },
    { icon: Share2, label: 'Social Links', tab: 'social', category: 'General' },

    // Technical
    { icon: Mail, label: 'Email Settings', tab: 'email', category: 'Technical' },
    { icon: CreditCard, label: 'Payment Credentials', tab: 'payment', category: 'Technical' },
    { icon: Truck, label: 'Courier Config', tab: 'courier', category: 'Technical' },
    { icon: ShieldCheck, label: 'Trust & Safety', tab: 'trust', category: 'Technical' },

    // Storefront
    { icon: Menu, label: 'Navbar Menu', tab: 'navbar', category: 'Storefront' },
    { icon: Layout, label: 'Footer Menu', tab: 'footer', category: 'Storefront' },
    { icon: Layout, label: 'Products Archive', tab: 'productsPage', category: 'Storefront' },
    { icon: Layout, label: 'Single Product Page', tab: 'singleProductPage', category: 'Storefront' },
    { icon: Tag, label: 'Offers Page', tab: 'offersPage', category: 'Storefront' },

    // Growth
    { icon: TrendingUp, label: 'Marketing & SEO', tab: 'marketing', category: 'Growth' },
];