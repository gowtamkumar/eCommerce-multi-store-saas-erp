export const SystemPermissions = {
  // Users & Staff
  USERS_READ: 'users:read',
  USERS_WRITE: 'users:write',
  USERS_INVITE: 'users:invite',

  // POS & Retail
  POS_SALE_CREATE: 'pos:create-sale',
  POS_SHIFT_MANAGE: 'pos:manage-shifts',

  // Finance & Ledger
  FINANCE_LEDGER_READ: 'finance:read-ledger',
  FINANCE_EXPENSE_WRITE: 'finance:write-expense',

  // HRM & Staff
  HRM_ATTENDANCE_CLOCK: 'hrm:clock-attendance',
  HRM_PAYROLL_PROCESS: 'hrm:process-payroll',
  HRM_EMPLOYEE_MANAGE: 'hrm:manage-employees',

  // Orders & Sales
  ORDERS_READ: 'orders:read',
  ORDERS_WRITE: 'orders:write',

  // Returns & Refunds
  RETURNS_READ: 'returns:read',
  RETURNS_WRITE: 'returns:write',

  // Payments
  PAYMENTS_READ: 'payments:read',

  // Coupons & Promotions
  COUPONS_MANAGE: 'coupons:manage',
  PROMOTIONS_MANAGE: 'promotions:manage',

  // Catalog
  CATALOG_READ: 'catalog:read',
  CATALOG_WRITE: 'catalog:write',
  CATALOG_FEATURED: 'catalog:featured',

  // Marketing & CRM
  MARKETING_MANAGE: 'marketing:manage',
  CRM_READ: 'crm:read',
  CRM_WRITE: 'crm:write',

  // Purchasing & Inventory
  PURCHASING_READ: 'purchasing:read',
  PURCHASING_WRITE: 'purchasing:write',
  INVENTORY_READ: 'inventory:read',
  INVENTORY_WRITE: 'inventory:write',
  SUPPLIER_MANAGE: 'supplier:manage',

  // Accounting & Invoicing
  ACCOUNTING_READ: 'accounting:read',
  ACCOUNTING_WRITE: 'accounting:write',
  INVOICES_MANAGE: 'invoices:manage',

  // Reports & Analytics
  REPORTS_READ: 'reports:read',

  // Logistics
  LOGISTICS_MANAGE: 'logistics:manage',
  FULFILLMENT_MANAGE: 'fulfillment:manage',

  // Settings
  SETTINGS_MANAGE: 'settings:manage',

  // Content
  CONTENT_MANAGE: 'content:manage',
} as const

export type SystemPermissionCode = (typeof SystemPermissions)[keyof typeof SystemPermissions]
