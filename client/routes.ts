/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ArrowLeftRight,
  Award,
  BarChart3,
  Bell,
  BookOpen,
  Bot,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  ClipboardList,
  Clock,
  CreditCard,
  Download,
  FileText,
  Globe,
  HelpCircle,
  Layout,
  LayoutDashboard,
  Mail,
  Megaphone,
  Menu,
  MessageSquare,
  Monitor,
  Package,
  Receipt,
  RotateCcw,
  Scale,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Star,
  Tag,
  TrendingUp,
  Truck,
  User,
  Users,
  Wallet,
  Warehouse,
  Zap,
} from "lucide-react";
import { UserRole } from "./lib/enums/user-role.enum";

export const storeSettings = [
  {
    type: "header",
    label: "Store Configuration",
    feature: "settings",
  },
  {
    icon: Globe,
    label: "General Info",
    href: "/admin/settings/general",
    feature: "settings",
  },
  {
    icon: Globe,
    label: "Custom Domain",
    href: "/admin/settings/domain",
    feature: "custom_domain",
  },
  {
    icon: Wallet,
    label: "Currencies",
    href: "/admin/settings/currencies",
    feature: "currencies",
  },
  {
    icon: ShieldCheck,
    label: "Trust & Labels",
    href: "/admin/settings/trust",
    feature: "trust_safety",
  },
  {
    icon: TrendingUp,
    label: "SEO & Marketing",
    href: "/admin/settings/marketing",
    feature: "seo",
  },
  {
    icon: Building2,
    label: "Organization",
    href: "/admin/settings/organization",
    feature: "organization",
  },

  {
    type: "header",
    label: "Integrations & Tools",
    feature: "settings",
  },
  {
    icon: Mail,
    label: "Email Config",
    href: "/admin/settings/email",
    feature: "email",
  },
  {
    icon: MessageSquare,
    label: "SMS Configuration",
    href: "/admin/settings/sms",
    feature: "sms",
  },
  {
    icon: Bot,
    label: "AI Configuration",
    href: "/admin/settings/ai",
    feature: "settings",
  },
  {
    icon: CreditCard,
    label: "Payment Methods",
    href: "/admin/settings/payment",
    feature: "payment_settings",
  },
  {
    icon: Truck,
    label: "Courier Rules",
    href: "/admin/settings/courier",
    feature: "courier",
  },
  // Caching controls have been moved strictly to the Super Admin platform settings
  // {
  //   icon: Zap,
  //   label: "System & Performance",
  //   href: "/admin/settings/system",
  //   feature: "/admin/settings/system",
  // },
];

export const uiSettings = [
  { type: "header", label: "Storefront UI", feature: "settings" },
  {
    icon: Menu,
    label: "Navbar Menu",
    href: "/admin/settings/navbar",
    feature: "header",
  },
  {
    icon: Layout,
    label: "Footer Menu",
    href: "/admin/settings/footer",
    feature: "footer",
  },
  {
    icon: Layout,
    label: "Product List UI",
    href: "/admin/settings/productsPage",
    feature: "product_list_ui",
  },
  {
    icon: Layout,
    label: "Product Detail UI",
    href: "/admin/settings/singleProductPage",
    feature: "product_detail_ui",
  },
  {
    icon: Tag,
    label: "Offers Page UI",
    href: "/admin/settings/offersPage",
    feature: "offers_page_ui",
  },
];

export const navGroups = [
  {
    title: "Insights",
    roles: [
      UserRole.ADMIN,
      UserRole.STORE_MANAGER,
      UserRole.OPERATOR,
      UserRole.SUPER_ADMIN,
    ],
    items: [
      {
        icon: LayoutDashboard,
        label: "Dashboard",
        href: "/admin",
      },
      {
        icon: Bell,
        label: "Notifications",
        href: "/admin/notifications",
      },
    ],
  },
  {
    title: "Catalog",
    roles: [
      UserRole.ADMIN,
      UserRole.STORE_MANAGER,
      UserRole.OPERATOR,
      UserRole.MARKETING,
      UserRole.SUPER_ADMIN,
    ],
    items: [
      {
        icon: Package,
        label: "Products",
        href: "/admin/products",
        feature: "catalog",
      },
      {
        icon: Tag,
        label: "Categories",
        href: "/admin/categories",
        feature: "catalog",
      },
      {
        icon: Globe,
        label: "Brands",
        href: "/admin/brands",
        feature: "catalog",
      },
      {
        icon: Scale,
        label: "Price Books",
        href: "/admin/price-books",
        feature: "catalog",
      },
      {
        icon: User,
        label: "Media",
        href: "/admin/media",
        feature: "catalog",
      },
      {
        icon: Star,
        label: "Reviews",
        href: "/admin/reviews",
        feature: "catalog",
      },
    ],
  },
  {
    title: "Sales & CRM",
    roles: [
      UserRole.ADMIN,
      UserRole.STORE_MANAGER,
      UserRole.OPERATOR,
      UserRole.SUPPORT,
      UserRole.SUPER_ADMIN,
    ],
    items: [
      {
        icon: ShoppingBag,
        label: "Point of Sale (POS)",
        href: "/admin/pos",
        feature: "pos",
      },
      {
        icon: Monitor,
        label: "POS Terminals",
        href: "/admin/pos-registers",
        feature: "pos",
      },
      {
        icon: ShoppingBag,
        label: "Orders",
        href: "/admin/orders",
        feature: "orders",
      },
      {
        icon: ShoppingBag,
        label: "Active Carts",
        href: "/admin/carts",
        feature: "orders",
      },
      {
        icon: RotateCcw,
        label: "Returns",
        href: "/admin/returns",
        feature: "orders",
      },
      {
        icon: CreditCard,
        label: "Payments",
        href: "/admin/payments",
        feature: "orders",
      },
      {
        icon: FileText,
        label: "Invoices",
        href: "/admin/invoices",
        feature: "orders",
      },
      {
        icon: Users,
        label: "Customers",
        href: "/admin/customers",
        feature: "orders",
      },
      {
        icon: MessageSquare,
        label: "Live Chat",
        href: "/admin/support",
      },
    ],
  },
  {
    title: "Procurement",
    roles: [
      UserRole.ADMIN,
      UserRole.STORE_MANAGER,
      UserRole.OPERATOR,
      UserRole.SUPER_ADMIN,
    ],
    items: [
      {
        icon: LayoutDashboard,
        label: "SCM Dashboard",
        href: "/admin/procurement/dashboard",
        feature: "purchasing",
      },
      {
        icon: Users,
        label: "Suppliers (SRM)",
        href: "/admin/procurement/suppliers",
        feature: "purchasing",
      },
      {
        icon: FileText,
        label: "Requisitions",
        href: "/admin/procurement/requisitions",
        feature: "purchasing",
      },
      {
        icon: ArrowLeftRight,
        label: "RFQs & Bids",
        href: "/admin/procurement/rfqs",
        feature: "purchasing",
      },
      {
        icon: Truck,
        label: "Purchase Orders",
        href: "/admin/procurement/purchases",
        feature: "purchasing",
      },
      {
        icon: CheckCircle2,
        label: "Goods Received",
        href: "/admin/procurement/grn",
        feature: "purchasing",
      },
      {
        icon: FileText,
        label: "Supplier Invoices",
        href: "/admin/procurement/invoices",
        feature: "purchasing",
      },
      {
        icon: Receipt,
        label: "Debit Notes",
        href: "/admin/procurement/debit-notes",
        feature: "purchasing",
      },
    ],
  },
  {
    title: "Human Resources",
    roles: [UserRole.ADMIN, UserRole.STORE_MANAGER, UserRole.SUPER_ADMIN],
    items: [
      {
        icon: LayoutDashboard,
        label: "Dashboard",
        href: "/admin/hrm/dashboard",
        feature: "hrm",
      },
      {
        icon: Users,
        label: "Employees",
        href: "/admin/hrm/employees",
        feature: "hrm",
      },
      {
        icon: Building2,
        label: "Departments",
        href: "/admin/hrm/departments",
        feature: "hrm",
      },
      {
        icon: Briefcase,
        label: "Designations",
        href: "/admin/hrm/designations",
        feature: "hrm",
      },
      {
        icon: Clock,
        label: "Attendance",
        href: "/admin/hrm/attendance",
        feature: "hrm",
      },
      {
        icon: Calendar,
        label: "Leaves",
        href: "/admin/hrm/leaves",
        feature: "hrm",
      },
      {
        icon: Clock,
        label: "Shifts",
        href: "/admin/hrm/shifts",
        feature: "hrm",
      },
      {
        icon: Wallet,
        label: "Payroll",
        href: "/admin/hrm/payroll",
        feature: "hrm",
      },
      {
        icon: Briefcase,
        label: "Recruitment",
        href: "/admin/hrm/recruitment",
        feature: "hrm",
      },
      {
        icon: Award,
        label: "Performance",
        href: "/admin/hrm/performance",
        feature: "hrm",
      },
      {
        icon: Calendar,
        label: "Holidays",
        href: "/admin/hrm/holidays",
        feature: "hrm",
      },
      {
        icon: Receipt,
        label: "Tax Brackets",
        href: "/admin/hrm/tax-brackets",
        feature: "hrm",
      },
    ],
  },
  {
    title: "Operations",
    roles: [
      UserRole.ADMIN,
      UserRole.STORE_MANAGER,
      UserRole.OPERATOR,
      UserRole.SUPER_ADMIN,
    ],
    items: [
      {
        icon: Package,
        label: "Inventory",
        href: "/admin/inventory",
        feature: "inventory",
      },
      {
        icon: ArrowLeftRight,
        label: "Stock Transfers",
        href: "/admin/stock-transfers",
        feature: "inventory",
      },
      {
        icon: ClipboardList,
        label: "Batch & Expiry",
        href: "/admin/batches",
        feature: "inventory",
      },
      {
        icon: ClipboardList,
        label: "Cycle Count",
        href: "/admin/cycle-count",
        feature: "inventory",
      },
      {
        icon: CheckCircle2,
        label: "Fulfillment",
        href: "/admin/fulfillment",
        feature: "logistics",
      },
      {
        icon: Truck,
        label: "Couriers",
        href: "/admin/couriers",
        feature: "logistics",
      },
      {
        icon: Receipt,
        label: "Expenses",
        href: "/admin/expenses",
        feature: "finance",
      },
    ],
  },
  {
    title: "Finance",
    roles: [UserRole.ADMIN, UserRole.STORE_MANAGER, UserRole.SUPER_ADMIN],
    items: [
      {
        icon: BarChart3,
        label: "Financial Dashboard",
        href: "/admin/finance",
        feature: "finance",
      },
      {
        icon: TrendingUp,
        label: "Profit & Loss",
        href: "/admin/finance/profit-loss",
        feature: "finance",
      },
      {
        icon: Scale,
        label: "Balance Sheet",
        href: "/admin/finance/balance-sheet",
        feature: "finance",
      },
      {
        icon: BookOpen,
        label: "General Ledger",
        href: "/admin/finance/ledger",
        feature: "finance",
      },
      {
        icon: CreditCard,
        label: "Accounts Receivable",
        href: "/admin/finance/ar",
        feature: "finance",
      },
      {
        icon: CreditCard,
        label: "Accounts Payable",
        href: "/admin/finance/ap",
        feature: "finance",
      },
      {
        icon: Wallet,
        label: "Customer Wallets",
        href: "/admin/finance/wallet",
        feature: "finance",
      },
      {
        icon: Scale,
        label: "Chart of Accounts",
        href: "/admin/finance/accounts",
        feature: "finance",
      },
      {
        icon: BarChart3,
        label: "Cash Flow",
        href: "/admin/finance/cash-flow",
        feature: "finance",
      },
      {
        icon: Calendar,
        label: "Fiscal Periods",
        href: "/admin/finance/fiscal-periods",
        feature: "finance",
      },
      {
        icon: Scale,
        label: "Tax & VAT Engine",
        href: "/admin/finance/tax",
        feature: "finance",
      },
    ],
  },
  {
    title: "Marketing",
    roles: [
      UserRole.ADMIN,
      UserRole.STORE_MANAGER,
      UserRole.MARKETING,
      UserRole.SUPER_ADMIN,
    ],
    items: [
      {
        icon: BarChart3,
        label: "Marketing Dashboard",
        href: "/admin/reports/marketing",
        feature: "marketing",
      },
      {
        icon: Tag,
        label: "Coupons",
        href: "/admin/coupons",
        feature: "marketing",
      },
      {
        icon: Megaphone,
        label: "Promotions",
        href: "/admin/promotions",
        feature: "marketing",
      },
      {
        icon: MessageSquare,
        label: "Newsletter",
        href: "/admin/leads",
        feature: "marketing",
      },
      {
        icon: Mail,
        label: "Subscribers",
        href: "/admin/subscribers",
        feature: "marketing",
      },
      {
        icon: Megaphone,
        label: "Messaging Campaigns",
        href: "/admin/campaigns",
        feature: "marketing",
      },
      {
        icon: Award,
        label: "Loyalty & Referrals",
        href: "/admin/marketing/loyalty",
        feature: "marketing",
      },
    ],
  },
  {
    title: "Reports",
    roles: [UserRole.ADMIN, UserRole.STORE_MANAGER, UserRole.SUPER_ADMIN],
    items: [
      {
        icon: BarChart3,
        label: "Sales Analysis",
        href: "/admin/reports/sales",
        feature: "reports",
      },
      {
        icon: Warehouse,
        label: "Warehouse Stock",
        href: "/admin/reports/warehouse-stock",
        feature: "reports",
      },
      {
        icon: TrendingUp,
        label: "Finance Summary",
        href: "/admin/reports/finance",
        feature: "reports",
      },
      {
        icon: FileText,
        label: "Profit & Loss",
        href: "/admin/reports/profit-loss",
        feature: "reports",
      },
      {
        icon: Users,
        label: "Supplier Ledger",
        href: "/admin/reports/supplier-ledger",
        feature: "reports",
      },
      {
        icon: Users,
        label: "Customer Ledger",
        href: "/admin/reports/customer-ledger",
        feature: "reports",
      },
      {
        icon: Wallet,
        label: "Cash Flow",
        href: "/admin/reports/cash-flow",
        feature: "reports",
      },
      {
        icon: Download,
        label: "Export Center",
        href: "/admin/reports/export",
        feature: "reports",
      },
    ],
  },
  {
    title: "Access Control",
    roles: [UserRole.ADMIN, UserRole.STORE_MANAGER, UserRole.SUPER_ADMIN],
    items: [
      {
        icon: ShieldCheck,
        label: "Staff Accounts",
        href: "/admin/team",
        feature: "settings",
      },
      {
        icon: ShieldCheck,
        label: "Roles & Permissions",
        href: "/admin/roles",
        feature: "settings",
      },
      {
        icon: FileText,
        label: "Audit Logs",
        href: "/admin/audit-logs",
        feature: "settings",
      },
    ],
  },
  {
    title: "System Settings",
    roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
    items: [
      {
        icon: CreditCard,
        label: "Subscription & Billing",
        href: "/admin/settings/billing",
        feature: "settings",
      },
      ...storeSettings,
    ],
  },
  {
    title: "Storefront & UI",
    roles: [
      UserRole.ADMIN,
      UserRole.STORE_MANAGER,
      UserRole.MARKETING,
      UserRole.SUPER_ADMIN,
    ],
    items: [
      {
        icon: Layout,
        label: "Pages Builder",
        href: "/admin/pages",
        feature: "content",
      },
      {
        icon: HelpCircle,
        label: "FAQs",
        href: "/admin/faqs",
        feature: "content",
      },
      ...uiSettings,
    ],
  },
];

const FEATURE_DISPLAY_MAP: Record<string, { label: string; icon: any }> = {
  pos: { label: "Point of Sale (POS)", icon: ShoppingBag },
  catalog: { label: "Product Catalog", icon: Package },
  orders: { label: "Order Management", icon: ClipboardList },
  marketing: { label: "Marketing Campaigns", icon: Megaphone },
  finance: { label: "Finance & Accounts", icon: Wallet },
  hrm: { label: "HRM & Payroll", icon: Users },
  inventory: { label: "Inventory Control", icon: Warehouse },
  purchasing: { label: "Purchases & Suppliers", icon: Truck },
  settings: { label: "Store Settings", icon: LayoutDashboard },
  header: { label: "Custom Navbar/Header", icon: Menu },
  footer: { label: "Custom Footer", icon: Layout },
  reports: { label: "Advanced Reports", icon: BarChart3 },
  logistics: { label: "Shipping & Logistics", icon: Truck },
  branding: { label: "Whitelabel Branding", icon: Award },
  content: { label: "CMS Content Manager", icon: BookOpen },
  // Settings-level features
  currencies: { label: "Multi-Currency Settings", icon: Wallet },
  trust_safety: { label: "Trust Badges & Labels", icon: ShieldCheck },
  seo: { label: "SEO & Analytics", icon: TrendingUp },
  organization: { label: "Multi-Branch & Warehouse", icon: Building2 },
  email: { label: "Custom SMTP Configuration", icon: Mail },
  sms: { label: "SMS Gateway Integration", icon: MessageSquare },
  payment_settings: { label: "Payment Gateways", icon: CreditCard },
  courier: { label: "Courier Integration Rules", icon: Truck },
  // UI-level features
  product_list_ui: { label: "Product Listing UI Customizer", icon: Layout },
  product_detail_ui: { label: "Product Detail UI Customizer", icon: Layout },
  offers_page_ui: { label: "Offers Page UI Customizer", icon: Tag },
  // Legacy & specific aliases
  staff_accounts: { label: "Staff Accounts", icon: Users },
  unlimited_products: { label: "Unlimited Products", icon: Package },
  navbar: { label: "Custom Navbar", icon: Menu },
  custom_domain: { label: "Custom Domain", icon: Globe },
};

export function getFeatureDisplay(href: string) {
  const normalizedKey = href.toLowerCase().trim();
  if (FEATURE_DISPLAY_MAP[normalizedKey]) {
    return FEATURE_DISPLAY_MAP[normalizedKey];
  }
  for (const group of navGroups) {
    const found = group.items.find((item) => item.href === href);
    if (found) {
      return {
        label: found.label,
        icon: found.icon,
      };
    }
  }
  const fallbackLabel = href
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
  return {
    label: fallbackLabel,
    icon: CheckCircle2, // default fallback icon
  };
}
