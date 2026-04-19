import { BarChart3, CreditCard, Download, FileText, Globe, HelpCircle, Layout, LayoutDashboard, Mail, Megaphone, Menu, MessageSquare, Package, Receipt, RotateCcw, Share2, ShieldCheck, ShoppingBag, Star, Tag, TrendingUp, Truck, User, Users, Wallet, Zap } from 'lucide-react';
import { UserRole } from './lib/enums/user-role.enum';

export const navGroups = [
    {
        title: 'Insights',
        roles: [UserRole.ADMIN, UserRole.STORE_MANAGER, UserRole.OPERATOR, UserRole.SUPER_ADMIN],
        items: [
            { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
        ]
    },
    {
        title: 'Catalog',
        roles: [UserRole.ADMIN, UserRole.STORE_MANAGER, UserRole.OPERATOR, UserRole.MARKETING, UserRole.SUPER_ADMIN],
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
        roles: [UserRole.ADMIN, UserRole.STORE_MANAGER, UserRole.OPERATOR, UserRole.SUPPORT, UserRole.SUPER_ADMIN],
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
        roles: [UserRole.ADMIN, UserRole.STORE_MANAGER, UserRole.OPERATOR, UserRole.SUPER_ADMIN],
        items: [
            { icon: Package, label: 'Inventory', href: '/admin/inventory' },
            { icon: Users, label: 'Suppliers', href: '/admin/suppliers', roles: [UserRole.ADMIN, UserRole.STORE_MANAGER, UserRole.SUPER_ADMIN] },
            { icon: Truck, label: 'Purchase Orders', href: '/admin/purchases', roles: [UserRole.ADMIN, UserRole.STORE_MANAGER, UserRole.SUPER_ADMIN] },
            { icon: Truck, label: 'Couriers', href: '/admin/couriers' },
            { icon: Receipt, label: 'Expenses', href: '/admin/expenses', roles: [UserRole.ADMIN, UserRole.STORE_MANAGER, UserRole.SUPER_ADMIN] },
        ]
    },
    {
        title: 'Marketing',
        roles: [UserRole.ADMIN, UserRole.STORE_MANAGER, UserRole.MARKETING, UserRole.SUPER_ADMIN],
        items: [
            { icon: Tag, label: 'Coupons', href: '/admin/coupons' },
            { icon: Megaphone, label: 'Promotions', href: '/admin/promotions' },
            { icon: MessageSquare, label: 'Newsletter', href: '/admin/leads' },
            { icon: Mail, label: 'Subscribers', href: '/admin/subscribers' },
        ]
    },
    {
        title: 'Reports',
        roles: [UserRole.ADMIN, UserRole.STORE_MANAGER, UserRole.SUPER_ADMIN],
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
        roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
        items: [
            { icon: ShieldCheck, label: 'Staff Accounts', href: '/admin/team' },
        ]
    },
    {
        title: 'User Account',
        roles: [UserRole.ADMIN, UserRole.STORE_MANAGER, UserRole.OPERATOR, UserRole.SUPPORT, UserRole.MARKETING, UserRole.SUPER_ADMIN],
        items: [
            { icon: User, label: 'My Profile', href: '/admin/profile' },
        ]
    },
    {
        title: 'System Settings',
        roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
        items: [
            { icon: CreditCard, label: 'Subscription & Billing', href: '/admin/settings/billing' },
            { icon: Globe, label: 'General Info', href: '/admin/settings?tab=general' },
            { icon: Globe, label: 'Custom Domain', href: '/admin/settings?tab=domain' },
            { icon: Mail, label: 'Email Config', href: '/admin/settings?tab=email' },
            { icon: CreditCard, label: 'Payment Methods', href: '/admin/settings?tab=payment' },
            { icon: Truck, label: 'Courier Rules', href: '/admin/settings?tab=courier' },
            { icon: Share2, label: 'Social Links', href: '/admin/settings?tab=social' },
            { icon: ShieldCheck, label: 'Trust & Safety', href: '/admin/settings?tab=trust' },
            { icon: TrendingUp, label: 'SEO Settings', href: '/admin/settings?tab=marketing' },
            { icon: Tag, label: 'Label Configuration', href: '/admin/settings?tab=label' },
            { icon: Zap, label: 'Cache & Performance', href: '/admin/settings?tab=system' },
        ]
    },
    {
        title: 'Storefront & UI',
        roles: [UserRole.ADMIN, UserRole.STORE_MANAGER, UserRole.MARKETING, UserRole.SUPER_ADMIN],
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