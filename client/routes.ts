import { Banknote, BarChart3, ChevronDown, ChevronLeft, ChevronRight, CreditCard, Download, FileText, Globe, HelpCircle, History as HistoryIcon, Layout, LayoutDashboard, LogOut, Mail, Menu, MessageSquare, Package, Receipt, RotateCcw, Settings, Share2, ShieldCheck, ShoppingBag, ShoppingCart, Star, Tag, TrendingUp, Truck, User, Users, X, Megaphone, Wallet } from 'lucide-react';

export const navGroups = [
    {
        title: 'Insights',
        roles: ['Admin', 'StoreManager', 'Operator', 'SuperAdmin'],
        items: [
            { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
        ]
    },
    {
        title: 'Catalog',
        roles: ['Admin', 'StoreManager', 'Operator', 'Marketing', 'SuperAdmin'],
        items: [
            { icon: Package, label: 'Products', href: '/admin/products' },
            { icon: Tag, label: 'Categories', href: '/admin/categories' },
            { icon: Globe, label: 'Brands', href: '/admin/brands' },
            { icon: User, label: 'Media', href: '/admin/media' },
            { icon: Star, label: 'Reviews', href: '/admin/reviews' },
        ]
    },
    {
        title: 'Sales & CRM',
        roles: ['Admin', 'StoreManager', 'Operator', 'Support', 'SuperAdmin'],
        items: [
            { icon: ShoppingBag, label: 'Orders', href: '/admin/orders' },
            { icon: RotateCcw, label: 'Returns', href: '/admin/returns' },
            { icon: CreditCard, label: 'Payments', href: '/admin/payments' },
            { icon: FileText, label: 'Invoices', href: '/admin/invoices' },
            { icon: Users, label: 'Customers', href: '/admin/customers' },
        ]
    },
    {
        title: 'Operations',
        roles: ['Admin', 'StoreManager', 'Operator', 'SuperAdmin'],
        items: [
            { icon: Package, label: 'Inventory', href: '/admin/inventory' },
            { icon: Users, label: 'Suppliers', href: '/admin/suppliers', roles: ['Admin', 'StoreManager', 'SuperAdmin'] },
            { icon: Truck, label: 'Purchase Orders', href: '/admin/purchases', roles: ['Admin', 'StoreManager', 'SuperAdmin'] },
            { icon: Truck, label: 'Couriers', href: '/admin/couriers' },
            { icon: Receipt, label: 'Expenses', href: '/admin/expenses', roles: ['Admin', 'StoreManager', 'SuperAdmin'] },
        ]
    },
    {
        title: 'Marketing',
        roles: ['Admin', 'StoreManager', 'Marketing', 'SuperAdmin'],
        items: [
            { icon: Tag, label: 'Coupons', href: '/admin/coupons' },
            { icon: Megaphone, label: 'Promotions', href: '/admin/promotions' },
            { icon: MessageSquare, label: 'Newsletter', href: '/admin/leads' },
            { icon: Mail, label: 'Subscribers', href: '/admin/subscribers' },
        ]
    },
    {
        title: 'Reports',
        roles: ['Admin', 'StoreManager', 'SuperAdmin'],
        items: [
            { icon: BarChart3, label: 'Sales Analysis', href: '/admin/reports/sales' },
            { icon: TrendingUp, label: 'Finance Summary', href: '/admin/reports/finance' },
            { icon: FileText, label: 'Profit & Loss', href: '/admin/reports/profit-loss' },
            { icon: Users, label: 'Supplier Ledger', href: '/admin/reports/supplier-ledger' },
            { icon: Users, label: 'Customer Ledger', href: '/admin/reports/customer-ledger' },
            { icon: Wallet, label: 'Cash Flow', href: '/admin/reports/cash-flow' },
            { icon: Download, label: 'Export Center', href: '/admin/reports/export' },
        ]
    },
    {
        title: 'Access Control',
        roles: ['Admin', 'SuperAdmin'],
        items: [
            { icon: ShieldCheck, label: 'Staff Accounts', href: '/admin/team' },
        ]
    },
    {
        title: 'User Account',
        roles: ['Admin', 'StoreManager', 'Operator', 'Support', 'Marketing', 'SuperAdmin'],
        items: [
            { icon: User, label: 'My Profile', href: '/admin/profile' },
        ]
    },
    {
        title: 'System Settings',
        roles: ['Admin', 'SuperAdmin'],
        items: [
            { icon: Globe, label: 'General Info', href: '/admin/settings?tab=general' },
            { icon: Globe, label: 'Custom Domain', href: '/admin/settings?tab=domain' },
            { icon: Mail, label: 'Email Config', href: '/admin/settings?tab=email' },
            { icon: CreditCard, label: 'Payment Methods', href: '/admin/settings?tab=payment' },
            { icon: Truck, label: 'Courier Rules', href: '/admin/settings?tab=courier' },
            { icon: Share2, label: 'Social Links', href: '/admin/settings?tab=social' },
            { icon: ShieldCheck, label: 'Trust & Safety', href: '/admin/settings?tab=trust' },
            { icon: TrendingUp, label: 'SEO Settings', href: '/admin/settings?tab=marketing' },
            { icon: Tag, label: 'Label Configuration', href: '/admin/settings?tab=label' },
        ]
    },
    {
        title: 'Storefront & UI',
        roles: ['Admin', 'StoreManager', 'Marketing', 'SuperAdmin'],
        items: [
            { icon: Layout, label: 'Pages Builder', href: '/admin/pages' },
            { icon: Menu, label: 'Navbar Menu', href: '/admin/settings?tab=navbar' },
            { icon: Layout, label: 'Footer Menu', href: '/admin/settings?tab=footer' },
            { icon: Layout, label: 'Product List UI', href: '/admin/settings?tab=productsPage' },
            { icon: Layout, label: 'Product Detail UI', href: '/admin/settings?tab=singleProductPage' },
            { icon: Tag, label: 'Offers Page UI', href: '/admin/settings?tab=offersPage' },
            { icon: HelpCircle, label: 'FAQs', href: '/admin/faqs' },
        ]
    },
];

export const settingsItems: any[] = [];