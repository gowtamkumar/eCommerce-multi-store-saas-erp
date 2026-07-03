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
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Tag,
  TrendingUp,
  Truck,
  User,
  Users,
  Wallet,
  Warehouse,
} from "lucide-react";
import type { ComponentType } from "react";

export type AdminNavItem = {
  type?: "header";
  icon?: ComponentType<{ className?: string }>;
  label?: string;
  href?: string;
  feature?: string;
  /** Required RBAC slug — must exist in login `permissionManifest.permissions` */
  permission?: string;
  /** Any one of these login-granted slugs allows access (OR) */
  permissions?: string[];
};

export type AdminNavGroup = {
  title: string;
  items: AdminNavItem[];
};

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
    permission: "settings:manage",
  },
  {
    icon: Globe,
    label: "Custom Domain",
    href: "/admin/settings/domain",
    feature: "settings",
    permission: "settings:manage",
  },
  {
    icon: Wallet,
    label: "Currencies",
    href: "/admin/settings/currencies",
    feature: "currencies",
    permission: "settings:manage",
  },
  {
    icon: ShieldCheck,
    label: "Trust & Labels",
    href: "/admin/settings/trust",
    feature: "trust_safety",
    permission: "settings:manage",
  },
  {
    icon: TrendingUp,
    label: "SEO & Marketing",
    href: "/admin/settings/marketing",
    feature: "seo",
    permission: "settings:manage",
  },
  {
    icon: Building2,
    label: "Organization",
    href: "/admin/settings/organization",
    feature: "organization",
    permission: "settings:manage",
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
    permission: "settings:integrations",
  },
  {
    icon: MessageSquare,
    label: "SMS Configuration",
    href: "/admin/settings/sms",
    feature: "sms",
    permission: "settings:integrations",
  },
  {
    icon: Bot,
    label: "AI Configuration",
    href: "/admin/settings/ai",
    feature: "settings",
    permission: "settings:manage",
  },
  {
    icon: CreditCard,
    label: "Payment Methods",
    href: "/admin/settings/payment",
    feature: "payment_settings",
    permission: "settings:manage",
  },
  {
    icon: Truck,
    label: "Courier Rules",
    href: "/admin/settings/courier",
    feature: "courier",
    permission: "logistics:manage",
  },
];

export const uiSettings = [
  { type: "header", label: "Storefront UI", feature: "settings" },
  {
    icon: Menu,
    label: "Navbar Menu",
    href: "/admin/settings/navbar",
    feature: "header",
    permission: "content:manage",
  },
  {
    icon: Layout,
    label: "Footer Menu",
    href: "/admin/settings/footer",
    feature: "footer",
    permission: "content:manage",
  },
  {
    icon: Layout,
    label: "Product List UI",
    href: "/admin/settings/productsPage",
    feature: "product_list_ui",
    permission: "content:manage",
  },
  {
    icon: Layout,
    label: "Product Detail UI",
    href: "/admin/settings/singleProductPage",
    feature: "product_detail_ui",
    permission: "content:manage",
  },
  {
    icon: Tag,
    label: "Offers Page UI",
    href: "/admin/settings/offersPage",
    feature: "offers_page_ui",
    permission: "content:manage",
  },
];

export const navGroups = [
  {
    title: "Insights",
    items: [
      {
        icon: LayoutDashboard,
        label: "Dashboard",
        href: "/admin",
        feature: "dashboard",
        permissions: ["reports:read", "orders:read", "catalog:read"],
      },
      {
        icon: Bell,
        label: "Notifications",
        href: "/admin/notifications",
        feature: "notifications",
      },
    ],
  },
  {
    title: "Catalog",
    items: [
      {
        icon: Package,
        label: "Products",
        href: "/admin/products",
        feature: "catalog",
        permission: "catalog:read",
      },
      {
        icon: Tag,
        label: "Categories",
        href: "/admin/categories",
        feature: "catalog",
        permission: "catalog:read",
      },
      {
        icon: Globe,
        label: "Brands",
        href: "/admin/brands",
        feature: "catalog",
        permission: "catalog:read",
      },
      {
        icon: Scale,
        label: "Price Books",
        href: "/admin/price-books",
        feature: "catalog",
        permission: "catalog:read",
      },
      {
        icon: User,
        label: "Media",
        href: "/admin/media",
        feature: "catalog",
        permission: "catalog:read",
      },
      {
        icon: Star,
        label: "Reviews",
        href: "/admin/reviews",
        feature: "catalog",
        permission: "catalog:read",
      },
    ],
  },
  {
    title: "Sales & CRM",
    items: [
      {
        icon: ShoppingBag,
        label: "Point of Sale (POS)",
        href: "/admin/pos",
        feature: "pos",
        permission: "pos:create-sale",
      },
      {
        icon: Monitor,
        label: "POS Terminals",
        href: "/admin/pos-registers",
        feature: "pos",
        permission: "pos:manage-shifts",
      },
      {
        icon: ShoppingBag,
        label: "Orders",
        href: "/admin/orders",
        feature: "orders",
        permission: "orders:read",
      },
      {
        icon: ShoppingBag,
        label: "Active Carts",
        href: "/admin/carts",
        feature: "orders",
        permission: "orders:read",
      },
      {
        icon: RotateCcw,
        label: "Returns",
        href: "/admin/returns",
        feature: "orders",
        permission: "returns:read",
      },
      {
        icon: CreditCard,
        label: "Payments",
        href: "/admin/payments",
        feature: "orders",
        permission: "payments:read",
      },
      {
        icon: FileText,
        label: "Invoices",
        href: "/admin/invoices",
        feature: "orders",
        permission: "invoices:manage",
      },
      {
        icon: Users,
        label: "Customers",
        href: "/admin/customers",
        feature: "orders",
        permission: "crm:read",
      },
      {
        icon: MessageSquare,
        label: "Live Chat",
        href: "/admin/support",
        permission: "crm:read",
      },
    ],
  },
  {
    title: "Procurement",
    items: [
      {
        icon: LayoutDashboard,
        label: "SCM Dashboard",
        href: "/admin/procurement/dashboard",
        feature: "purchasing",
        permission: "purchasing:read",
      },
      {
        icon: Users,
        label: "Suppliers (SRM)",
        href: "/admin/procurement/suppliers",
        feature: "purchasing",
        permission: "supplier:manage",
      },
      {
        icon: FileText,
        label: "Requisitions",
        href: "/admin/procurement/requisitions",
        feature: "purchasing",
        permission: "purchasing:read",
      },
      {
        icon: ArrowLeftRight,
        label: "RFQs & Bids",
        href: "/admin/procurement/rfqs",
        feature: "purchasing",
        permission: "purchasing:read",
      },
      {
        icon: Truck,
        label: "Purchase Orders",
        href: "/admin/procurement/purchases",
        feature: "purchasing",
        permission: "purchasing:read",
      },
      {
        icon: CheckCircle2,
        label: "Goods Received",
        href: "/admin/procurement/grn",
        feature: "purchasing",
        permission: "purchasing:read",
      },
      {
        icon: FileText,
        label: "Supplier Invoices",
        href: "/admin/procurement/invoices",
        feature: "purchasing",
        permission: "purchasing:read",
      },
      {
        icon: Receipt,
        label: "Debit Notes",
        href: "/admin/procurement/debit-notes",
        feature: "purchasing",
        permission: "purchasing:read",
      },
    ],
  },
  {
    title: "Human Resources",
    items: [
      {
        icon: LayoutDashboard,
        label: "Dashboard",
        href: "/admin/hrm/dashboard",
        feature: "hrm",
        permission: "hrm:view-attendance-report",
      },
      {
        icon: Users,
        label: "Employees",
        href: "/admin/hrm/employees",
        feature: "hrm",
        permission: "hrm:manage-employees",
      },
      {
        icon: Building2,
        label: "Departments",
        href: "/admin/hrm/departments",
        feature: "hrm",
        permission: "hrm:manage-employees",
      },
      {
        icon: Briefcase,
        label: "Designations",
        href: "/admin/hrm/designations",
        feature: "hrm",
        permission: "hrm:manage-employees",
      },
      {
        icon: Clock,
        label: "Attendance",
        href: "/admin/hrm/attendance",
        feature: "hrm",
        permissions: ["hrm:view-attendance-report", "hrm:clock-attendance"],
      },
      {
        icon: Calendar,
        label: "Leaves",
        href: "/admin/hrm/leaves",
        feature: "hrm",
        permissions: ["hrm:approve-leave", "hrm:clock-attendance"],
      },
      {
        icon: Clock,
        label: "Shifts",
        href: "/admin/hrm/shifts",
        feature: "hrm",
        permission: "hrm:manage-employees",
      },
      {
        icon: Wallet,
        label: "Payroll",
        href: "/admin/hrm/payroll",
        feature: "hrm",
        permission: "hrm:process-payroll",
      },
      {
        icon: Briefcase,
        label: "Recruitment",
        href: "/admin/hrm/recruitment",
        feature: "hrm",
        permission: "hrm:manage-employees",
      },
      {
        icon: Award,
        label: "Performance",
        href: "/admin/hrm/performance",
        feature: "hrm",
        permission: "hrm:manage-employees",
      },
      {
        icon: Calendar,
        label: "Holidays",
        href: "/admin/hrm/holidays",
        feature: "hrm",
        permission: "hrm:manage-employees",
      },
      {
        icon: Receipt,
        label: "Tax Brackets",
        href: "/admin/hrm/tax-brackets",
        feature: "hrm",
        permission: "hrm:process-payroll",
      },
    ],
  },
  {
    title: "Operations",
    items: [
      {
        icon: Package,
        label: "Inventory",
        href: "/admin/inventory",
        feature: "inventory",
        permission: "inventory:read",
      },
      {
        icon: ArrowLeftRight,
        label: "Stock Transfers",
        href: "/admin/stock-transfers",
        feature: "inventory",
        permission: "inventory:transfer",
      },
      {
        icon: ClipboardList,
        label: "Batch & Expiry",
        href: "/admin/batches",
        feature: "inventory",
        permission: "inventory:read",
      },
      {
        icon: ClipboardList,
        label: "Cycle Count",
        href: "/admin/cycle-count",
        feature: "inventory",
        permission: "inventory:cycle-count",
      },
      {
        icon: CheckCircle2,
        label: "Fulfillment",
        href: "/admin/fulfillment",
        feature: "logistics",
        permission: "fulfillment:manage",
      },
      {
        icon: Truck,
        label: "Couriers",
        href: "/admin/couriers",
        feature: "logistics",
        permission: "logistics:manage",
      },
      {
        icon: Receipt,
        label: "Expenses",
        href: "/admin/expenses",
        feature: "finance",
        permission: "finance:write-expense",
      },
    ],
  },
  {
    title: "Finance",
    items: [
      {
        icon: BarChart3,
        label: "Financial Dashboard",
        href: "/admin/finance",
        feature: "finance",
        permission: "finance:read-ledger",
      },
      {
        icon: TrendingUp,
        label: "Profit & Loss",
        href: "/admin/finance/profit-loss",
        feature: "finance",
        permission: "finance:read-ledger",
      },
      {
        icon: Scale,
        label: "Balance Sheet",
        href: "/admin/finance/balance-sheet",
        feature: "finance",
        permission: "accounting:read",
      },
      {
        icon: BookOpen,
        label: "General Ledger",
        href: "/admin/finance/ledger",
        feature: "finance",
        permission: "finance:read-ledger",
      },
      {
        icon: CreditCard,
        label: "Accounts Receivable",
        href: "/admin/finance/ar",
        feature: "finance",
        permission: "accounting:read",
      },
      {
        icon: CreditCard,
        label: "Accounts Payable",
        href: "/admin/finance/ap",
        feature: "finance",
        permission: "accounting:read",
      },
      {
        icon: Wallet,
        label: "Customer Wallets",
        href: "/admin/finance/wallet",
        feature: "finance",
        permission: "finance:read-ledger",
      },
      {
        icon: Scale,
        label: "Chart of Accounts",
        href: "/admin/finance/accounts",
        feature: "finance",
        permission: "accounting:read",
      },
      {
        icon: BarChart3,
        label: "Cash Flow",
        href: "/admin/finance/cash-flow",
        feature: "finance",
        permission: "finance:read-ledger",
      },
      {
        icon: Calendar,
        label: "Fiscal Periods",
        href: "/admin/finance/fiscal-periods",
        feature: "finance",
        permission: "accounting:read",
      },
      {
        icon: Scale,
        label: "Tax & VAT Engine",
        href: "/admin/finance/tax",
        feature: "finance",
        permission: "accounting:read",
      },
    ],
  },
  {
    title: "Marketing",
    items: [
      {
        icon: BarChart3,
        label: "Marketing Dashboard",
        href: "/admin/reports/marketing",
        feature: "marketing",
        permission: "marketing:manage",
      },
      {
        icon: Tag,
        label: "Coupons",
        href: "/admin/coupons",
        feature: "marketing",
        permission: "coupons:manage",
      },
      {
        icon: Megaphone,
        label: "Promotions",
        href: "/admin/promotions",
        feature: "marketing",
        permission: "promotions:manage",
      },
      {
        icon: MessageSquare,
        label: "Newsletter",
        href: "/admin/leads",
        feature: "marketing",
        permission: "crm:read",
      },
      {
        icon: Mail,
        label: "Subscribers",
        href: "/admin/subscribers",
        feature: "marketing",
        permission: "marketing:manage",
      },
      {
        icon: Megaphone,
        label: "Messaging Campaigns",
        href: "/admin/campaigns",
        feature: "marketing",
        permission: "marketing:manage",
      },
      {
        icon: Sparkles,
        label: "AI Studio",
        href: "/admin/ai",
        feature: "ai",
        permission: "ai:use",
      },
      {
        icon: Award,
        label: "Loyalty & Referrals",
        href: "/admin/marketing/loyalty",
        feature: "marketing",
        permission: "marketing:manage",
      },
    ],
  },
  {
    title: "Reports",
    items: [
      {
        icon: BarChart3,
        label: "Sales Analysis",
        href: "/admin/reports/sales",
        feature: "reports",
        permission: "reports:read",
      },
      {
        icon: Warehouse,
        label: "Warehouse Stock",
        href: "/admin/reports/warehouse-stock",
        feature: "reports",
        permission: "reports:read",
      },
      {
        icon: TrendingUp,
        label: "Finance Summary",
        href: "/admin/reports/finance",
        feature: "reports",
        permission: "reports:read",
      },
      {
        icon: FileText,
        label: "Profit & Loss",
        href: "/admin/reports/profit-loss",
        feature: "reports",
        permission: "reports:read",
      },
      {
        icon: Users,
        label: "Supplier Ledger",
        href: "/admin/reports/supplier-ledger",
        feature: "reports",
        permission: "reports:read",
      },
      {
        icon: Users,
        label: "Customer Ledger",
        href: "/admin/reports/customer-ledger",
        feature: "reports",
        permission: "reports:read",
      },
      {
        icon: Wallet,
        label: "Cash Flow",
        href: "/admin/reports/cash-flow",
        feature: "reports",
        permission: "reports:read",
      },
      {
        icon: Download,
        label: "Export Center",
        href: "/admin/reports/export",
        feature: "reports",
        permission: "reports:export",
      },
    ],
  },
  {
    title: "Access Control",
    items: [
      {
        icon: ShieldCheck,
        label: "Staff Accounts",
        href: "/admin/team",
        feature: "settings",
        permission: "users:read",
      },
      {
        icon: ShieldCheck,
        label: "Roles & Permissions",
        href: "/admin/roles",
        feature: "settings",
        permission: "users:assign-roles",
      },
      {
        icon: FileText,
        label: "Audit Logs",
        href: "/admin/audit-logs",
        feature: "settings",
        permission: "users:read",
      },
    ],
  },
  {
    title: "System Settings",
    items: [
      {
        icon: CreditCard,
        label: "Subscription & Billing",
        href: "/admin/settings/billing",
        feature: "settings",
        permission: "settings:billing",
      },
      ...storeSettings,
    ],
  },
  {
    title: "Storefront & UI",
    items: [
      {
        icon: Layout,
        label: "Pages Builder",
        href: "/admin/pages",
        feature: "content",
        permission: "content:manage",
      },
      {
        icon: HelpCircle,
        label: "FAQs",
        href: "/admin/faqs",
        feature: "content",
        permission: "content:manage",
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
  ai: { label: "AI Studio", icon: Sparkles },
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
