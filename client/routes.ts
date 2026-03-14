import { Banknote, BarChart3, ChevronDown, ChevronLeft, ChevronRight, CreditCard, Download, FileText, Globe, HelpCircle, History as HistoryIcon, Layout, LayoutDashboard, LogOut, Mail, Menu, MessageSquare, Package, Receipt, RotateCcw, Settings, Share2, ShoppingBag, ShoppingCart, Star, Tag, TrendingUp, Truck, User, Users, X, Megaphone, Wallet } from 'lucide-react';

export const navGroups = [
    {
        title: 'Business Insights',
        items: [
            { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
            { icon: Globe, label: 'Real-time Traffic', href: '/admin/analytics' },
        ]
    },

    {
        title: 'Catalog',
        items: [
            { icon: Package, label: 'Products', href: '/admin/products' },
            { icon: Tag, label: 'Categories', href: '/admin/categories' },
            { icon: Globe, label: 'Brands', href: '/admin/brands' },
        ]
    },

    {
        title: 'Sales & Finance',
        items: [
            { icon: ShoppingBag, label: 'Orders', href: '/admin/orders' },
            { icon: RotateCcw, label: 'Returns', href: '/admin/returns' },
            { icon: CreditCard, label: 'Payments', href: '/admin/payments' },
            { icon: FileText, label: 'Invoices', href: '/admin/invoices' },
            { icon: Receipt, label: 'Expenses', href: '/admin/expenses' },
            { icon: Tag, label: 'Coupons', href: '/admin/coupons' },
            { icon: Megaphone, label: 'Promotions', href: '/admin/promotions' },
        ]
    },
    {
        title: 'Supply Chain',
        items: [
            { icon: Package, label: 'Inventory', href: '/admin/inventory' },
            { icon: Users, label: 'Suppliers', href: '/admin/suppliers' },
            { icon: Truck, label: 'Purchase Orders', href: '/admin/purchases' },
            { icon: Truck, label: 'Couriers', href: '/admin/couriers' },
        ]
    },
    {
        title: 'People & CRM',
        items: [
            { icon: Users, label: 'Customers', href: '/admin/customers' },
            { icon: MessageSquare, label: 'Newsletter', href: '/admin/leads' },
            { icon: Star, label: 'Reviews', href: '/admin/reviews' },
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
        title: 'Content',
        items: [
            { icon: FileText, label: 'Pages', href: '/admin/pages' },
            { icon: Menu, label: 'Navbar', href: '/admin/pages' },
            { icon: User, label: 'Media', href: '/admin/media' },
            { icon: HelpCircle, label: 'FAQs', href: '/admin/faqs' },
        ]
    }
];

export const settingsItems = [
    { icon: Globe, label: 'General Info', tab: 'general' },
    { icon: Globe, label: 'Custom Domain', tab: 'domain' },
    { icon: Mail, label: 'Email Settings', tab: 'email' },
    { icon: CreditCard, label: 'Payment Credentials', tab: 'payment' },
    { icon: Banknote, label: 'Localization', tab: 'currencies' },
    { icon: Share2, label: 'Social Links', tab: 'social' },
    { icon: TrendingUp, label: 'Marketing & SEO', tab: 'marketing' },
    { icon: Menu, label: 'Navbar Menu', tab: 'navbar' },
    { icon: Layout, label: 'Footer Menu', tab: 'footer' },
    { icon: Truck, label: 'Courier Config', tab: 'courier' },
    { icon: Truck, label: 'Trust & Safety', tab: 'trust' },
    { icon: Layout, label: 'Products Archive', tab: 'productsPage' },
    { icon: Layout, label: 'Single Product Page', tab: 'singleProductPage' },
];