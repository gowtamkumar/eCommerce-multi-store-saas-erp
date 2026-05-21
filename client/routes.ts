import {
  BarChart3,
  Bell,
  BookOpen,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
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
    feature: "/admin/settings/general",
  },
  {
    icon: Globe,
    label: "General Info",
    href: "/admin/settings/general",
    feature: "/admin/settings/general",
  },
  {
    icon: Globe,
    label: "Custom Domain",
    href: "/admin/settings/domain",
    feature: "/admin/settings/domain",
  },
  {
    icon: Wallet,
    label: "Currencies",
    href: "/admin/settings/currencies",
    feature: "/admin/settings/currencies",
  },
  {
    icon: Share2,
    label: "Social Links",
    href: "/admin/settings/social",
    feature: "/admin/settings/social",
  },
  {
    icon: ShieldCheck,
    label: "Trust & Safety",
    href: "/admin/settings/trust",
    feature: "/admin/settings/trust",
  },
  {
    icon: TrendingUp,
    label: "SEO Settings",
    href: "/admin/settings/marketing",
    feature: "/admin/settings/marketing",
  },
  {
    icon: Tag,
    label: "Label Configuration",
    href: "/admin/settings/label",
    feature: "/admin/settings/label",
  },
  {
    icon: Building2,
    label: "Organization",
    href: "/admin/settings/organization",
    feature: "/admin/settings/organization",
  },

  {
    type: "header",
    label: "Integrations & Tools",
    feature: "/admin/settings/email",
  },
  {
    icon: Mail,
    label: "Email Config",
    href: "/admin/settings/email",
    feature: "/admin/settings/email",
  },
  {
    icon: MessageSquare,
    label: "SMS Configuration",
    href: "/admin/settings/sms",
    feature: "/admin/settings/sms",
  },
  {
    icon: CreditCard,
    label: "Payment Methods",
    href: "/admin/settings/payment",
    feature: "/admin/settings/payment",
  },
  {
    icon: Truck,
    label: "Courier Rules",
    href: "/admin/settings/courier",
    feature: "/admin/settings/courier",
  },
  {
    icon: Zap,
    label: "System & Performance",
    href: "/admin/settings/system",
    feature: "/admin/settings/system",
  },
];

export const uiSettings = [
  { type: "header", label: "Storefront UI", feature: "/admin/settings/navbar" },
  {
    icon: Menu,
    label: "Navbar Menu",
    href: "/admin/settings/navbar",
    feature: "/admin/settings/navbar",
  },
  {
    icon: Layout,
    label: "Footer Menu",
    href: "/admin/settings/footer",
    feature: "/admin/settings/footer",
  },
  {
    icon: Layout,
    label: "Product List UI",
    href: "/admin/settings/productsPage",
    feature: "/admin/settings/productsPage",
  },
  {
    icon: Layout,
    label: "Product Detail UI",
    href: "/admin/settings/singleProductPage",
    feature: "/admin/settings/singleProductPage",
  },
  {
    icon: Tag,
    label: "Offers Page UI",
    href: "/admin/settings/offersPage",
    feature: "/admin/settings/offersPage",
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
        feature: "/admin",
      },
      {
        icon: Bell,
        label: "Notifications",
        href: "/admin/notifications",
        feature: "/admin",
      },
    ],
  },
  // {
  //   title: "Organization",
  //   roles: [UserRole.ADMIN, UserRole.STORE_MANAGER, UserRole.SUPER_ADMIN],
  //   items: [
  //     {
  //       icon: Building2,
  //       label: "Branches",
  //       href: "/admin/branches",
  //       feature: "/admin/branches",
  //     },
  //   ],
  // },
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
        feature: "/admin/products",
      },
      {
        icon: Tag,
        label: "Categories",
        href: "/admin/categories",
        feature: "/admin/categories",
      },
      {
        icon: Globe,
        label: "Brands",
        href: "/admin/brands",
        feature: "/admin/brands",
      },
      {
        icon: User,
        label: "Media",
        href: "/admin/media",
        feature: "/admin/media",
      },
      {
        icon: Star,
        label: "Reviews",
        href: "/admin/reviews",
        feature: "/admin/reviews",
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
        feature: "/admin/pos",
      },
      {
        icon: ShoppingBag,
        label: "Orders",
        href: "/admin/orders",
        feature: "/admin/orders",
      },
      {
        icon: ShoppingBag,
        label: "Active Carts",
        href: "/admin/carts",
        feature: "/admin/carts",
      },
      {
        icon: RotateCcw,
        label: "Returns",
        href: "/admin/returns",
        feature: "/admin/returns",
      },
      {
        icon: CreditCard,
        label: "Payments",
        href: "/admin/payments",
        feature: "/admin/payments",
      },
      {
        icon: FileText,
        label: "Invoices",
        href: "/admin/invoices",
        feature: "/admin/invoices",
      },
      {
        icon: Users,
        label: "Customers",
        href: "/admin/customers",
        feature: "/admin/customers",
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
        feature: "/admin/purchases",
      },
      {
        icon: Users,
        label: "Suppliers (SRM)",
        href: "/admin/procurement/suppliers",
        feature: "/admin/suppliers",
      },
      {
        icon: FileText,
        label: "Requisitions",
        href: "/admin/procurement/requisitions",
        feature: "/admin/purchases",
      },
      {
        icon: Truck,
        label: "Purchase Orders",
        href: "/admin/procurement/purchases",
        feature: "/admin/purchases",
      },
      {
        icon: CheckCircle2,
        label: "Goods Received",
        href: "/admin/procurement/grn",
        feature: "/admin/grn",
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
        feature: "/admin/hrm",
      },
      {
        icon: Users,
        label: "Employees",
        href: "/admin/hrm/employees",
        feature: "/admin/hrm",
      },
      {
        icon: Building2,
        label: "Departments",
        href: "/admin/hrm/departments",
        feature: "/admin/hrm",
      },
      {
        icon: Briefcase,
        label: "Designations",
        href: "/admin/hrm/designations",
        feature: "/admin/hrm",
      },
      {
        icon: Clock,
        label: "Attendance",
        href: "/admin/hrm/attendance",
        feature: "/admin/hrm",
      },
      {
        icon: Calendar,
        label: "Leaves",
        href: "/admin/hrm/leaves",
        feature: "/admin/hrm",
      },
      {
        icon: Clock,
        label: "Shifts",
        href: "/admin/hrm/shifts",
        feature: "/admin/hrm",
      },
      {
        icon: Wallet,
        label: "Payroll",
        href: "/admin/hrm/payroll",
        feature: "/admin/hrm",
      },
      {
        icon: Briefcase,
        label: "Recruitment",
        href: "/admin/hrm/recruitment",
        feature: "/admin/hrm",
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
        icon: Warehouse,
        label: "Warehouses",
        href: "/admin/warehouses",
        feature: "/admin/warehouses",
      },
      {
        icon: Package,
        label: "Inventory",
        href: "/admin/inventory",
        feature: "/admin/inventory",
      },
      {
        icon: CheckCircle2,
        label: "Fulfillment",
        href: "/admin/fulfillment",
        feature: "/admin/fulfillment",
      },
      {
        icon: Truck,
        label: "Couriers",
        href: "/admin/couriers",
        feature: "/admin/couriers",
      },
      {
        icon: Receipt,
        label: "Expenses",
        href: "/admin/expenses",
        feature: "/admin/expenses",
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
        feature: "/admin/finance",
      },
      {
        icon: TrendingUp,
        label: "Profit & Loss",
        href: "/admin/finance/profit-loss",
        feature: "/admin/finance/profit-loss",
      },
      {
        icon: Scale,
        label: "Balance Sheet",
        href: "/admin/finance/balance-sheet",
        feature: "/admin/finance/balance-sheet",
      },
      {
        icon: BookOpen,
        label: "General Ledger",
        href: "/admin/finance/ledger",
        feature: "/admin/finance/ledger",
      },
      {
        icon: CreditCard,
        label: "Accounts Receivable",
        href: "/admin/finance/ar",
        feature: "/admin/finance/ar",
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
        icon: Tag,
        label: "Coupons",
        href: "/admin/coupons",
        feature: "/admin/coupons",
      },
      {
        icon: Megaphone,
        label: "Promotions",
        href: "/admin/promotions",
        feature: "/admin/promotions",
      },
      {
        icon: MessageSquare,
        label: "Newsletter",
        href: "/admin/leads",
        feature: "/admin/leads",
      },
      {
        icon: Mail,
        label: "Subscribers",
        href: "/admin/subscribers",
        feature: "/admin/subscribers",
      },
      {
        icon: Megaphone,
        label: "Messaging Campaigns",
        href: "/admin/campaigns",
        feature: "/admin/campaigns",
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
        feature: "/admin/reports/sales",
      },
      {
        icon: TrendingUp,
        label: "Finance Summary",
        href: "/admin/reports/finance",
        feature: "/admin/reports/finance",
      },
      {
        icon: FileText,
        label: "Profit & Loss",
        href: "/admin/reports/profit-loss",
        feature: "/admin/reports/profit-loss",
      },
      {
        icon: Users,
        label: "Supplier Ledger",
        href: "/admin/reports/supplier-ledger",
        feature: "/admin/reports/supplier-ledger",
      },
      {
        icon: Users,
        label: "Customer Ledger",
        href: "/admin/reports/customer-ledger",
        feature: "/admin/reports/customer-ledger",
      },
      {
        icon: Wallet,
        label: "Cash Flow",
        href: "/admin/reports/cash-flow",
        feature: "/admin/reports/cash-flow",
      },
      {
        icon: Download,
        label: "Export Center",
        href: "/admin/reports/export",
        feature: "/admin/reports/export",
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
        feature: "/admin/team",
      },
      {
        icon: ShieldCheck,
        label: "Roles & Permissions",
        href: "/admin/roles",
        feature: "/admin/roles",
      },
      {
        icon: FileText,
        label: "Audit Logs",
        href: "/admin/audit-logs",
        feature: "/admin/team",
      },
    ],
  },
  // {
  //   title: "User Account",
  //   roles: [
  //     UserRole.ADMIN,
  //     UserRole.STORE_MANAGER,
  //     UserRole.OPERATOR,
  //     UserRole.SUPPORT,
  //     UserRole.MARKETING,
  //     UserRole.SUPER_ADMIN,
  //   ],
  //   items: [
  //     {
  //       icon: User,
  //       label: "My Profile",
  //       href: "/admin/profile",
  //       feature: "/admin/profile",
  //     },
  //   ],
  // },
  {
    title: "System Settings",
    roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
    items: [
      {
        icon: CreditCard,
        label: "Subscription & Billing",
        href: "/admin/settings/billing",
        feature: "/admin/settings",
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
        feature: "/admin/pages",
      },
      {
        icon: HelpCircle,
        label: "FAQs",
        href: "/admin/faqs",
        feature: "/admin/faqs",
      },
      ...uiSettings,
    ],
  },
];

export function getFeatureDisplay(href: string) {
  for (const group of navGroups) {
    const found = group.items.find((item) => item.href === href);
    if (found) {
      return {
        label: found.label,
        icon: found.icon,
      };
    }
  }
  return {
    label: href,
    icon: CheckCircle2, // default fallback icon
  };
}
