/**
 * ERP-Grade Granular Permission Registry
 *
 * Format: `module:action`
 * Convention: actions are verbs (read, write, delete, approve, export, override, etc.)
 * used by @RequirePermissions() guard on every controller method.
 *
 * All codes here must have a matching entry in UserService.seedPermissions().
 */
export const SystemPermissions = {
  // ─── Access Control / Users ─────────────────────────────────────────────────
  USERS_READ: 'users:read',
  USERS_WRITE: 'users:write',
  USERS_INVITE: 'users:invite',
  USERS_DELETE: 'users:delete',
  USERS_ROLES_ASSIGN: 'users:assign-roles',
  USERS_PERMISSIONS_OVERRIDE: 'users:override-permissions',

  // ─── POS & Retail ────────────────────────────────────────────────────────────
  POS_SALE_CREATE: 'pos:create-sale',
  POS_SHIFT_MANAGE: 'pos:manage-shifts',
  POS_PRICE_OVERRIDE: 'pos:override-price', // ERP-specific: Can change line price at POS
  POS_DISCOUNT_APPLY: 'pos:apply-discount', // ERP-specific: Can apply ad-hoc discounts
  POS_VOID_TRANSACTION: 'pos:void-transaction', // ERP-specific: Can void/cancel a completed sale
  POS_SALE_REFUND: 'pos:refund-sale',
  POS_CASH_DRAWER_MANAGE: 'pos:manage-cash-drawer',
  POS_REPORT_VIEW: 'pos:view-reports', // View shift/daily Z-report

  // ─── Catalog / Products ──────────────────────────────────────────────────────
  CATALOG_READ: 'catalog:read',
  CATALOG_WRITE: 'catalog:write', // Create/edit product info
  CATALOG_DELETE: 'catalog:delete', // ERP: delete products (destructive)
  CATALOG_PRICE_EDIT: 'catalog:edit-price', // ERP-specific: editing sell price
  CATALOG_COST_VIEW: 'catalog:view-cost', // ERP-specific: see supplier cost
  CATALOG_PUBLISH: 'catalog:publish', // Publish/unpublish product on store
  CATALOG_FEATURED: 'catalog:featured',
  CATALOG_IMPORT: 'catalog:import', // Bulk import products (risk: data corruption)
  CATALOG_EXPORT: 'catalog:export',

  // ─── Inventory ───────────────────────────────────────────────────────────────
  INVENTORY_READ: 'inventory:read',
  INVENTORY_WRITE: 'inventory:write', // Stock in, GRN receive
  INVENTORY_ADJUST: 'inventory:adjust', // ERP-specific: manual adjustment (shrinkage)
  INVENTORY_TRANSFER: 'inventory:transfer', // Inter-branch/warehouse stock transfer
  INVENTORY_DELETE: 'inventory:delete', // Delete inventory records (critical)
  INVENTORY_CYCLE_COUNT: 'inventory:cycle-count', // ERP-specific: approve cycle count results
  INVENTORY_REPORT: 'inventory:report',

  // ─── Purchasing / Procurement ────────────────────────────────────────────────
  PURCHASING_READ: 'purchasing:read',
  PURCHASING_WRITE: 'purchasing:write', // Create requisitions, PO
  PURCHASING_APPROVE: 'purchasing:approve', // ERP-specific: approve PO for issuing
  PURCHASING_RECEIVE_GRN: 'purchasing:receive-grn', // ERP-specific: receive goods (GRN)
  PURCHASING_DELETE: 'purchasing:delete',
  SUPPLIER_MANAGE: 'supplier:manage',
  SUPPLIER_VIEW_PRICING: 'supplier:view-pricing', // ERP: see supplier pricelist

  // ─── Orders & Sales ──────────────────────────────────────────────────────────
  ORDERS_READ: 'orders:read',
  ORDERS_WRITE: 'orders:write',
  ORDERS_CANCEL: 'orders:cancel', // ERP-specific: can cancel confirmed orders
  ORDERS_APPROVE: 'orders:approve', // ERP: approve high-value or special orders
  ORDERS_EXPORT: 'orders:export',

  // ─── Returns & Refunds ───────────────────────────────────────────────────────
  RETURNS_READ: 'returns:read',
  RETURNS_WRITE: 'returns:write',
  RETURNS_APPROVE: 'returns:approve', // ERP-specific: approve refund/credit note

  // ─── Payments ────────────────────────────────────────────────────────────────
  PAYMENTS_READ: 'payments:read',
  PAYMENTS_WRITE: 'payments:write', // Process payments, record receipts
  PAYMENTS_VOID: 'payments:void', // ERP-specific: void a payment record
  PAYMENTS_RECONCILE: 'payments:reconcile', // ERP-specific: bank reconciliation

  // ─── Finance & Ledger ────────────────────────────────────────────────────────
  FINANCE_LEDGER_READ: 'finance:read-ledger',
  FINANCE_EXPENSE_WRITE: 'finance:write-expense',
  FINANCE_JOURNAL_POST: 'finance:post-journal', // ERP: manually post GL journal entries
  FINANCE_JOURNAL_REVERSE: 'finance:reverse-journal', // ERP: reverse/void a journal entry
  FINANCE_PERIOD_CLOSE: 'finance:close-period', // ERP: close accounting period (critical)
  FINANCE_BUDGET_MANAGE: 'finance:manage-budget',

  // ─── Accounting & Invoicing ──────────────────────────────────────────────────
  ACCOUNTING_READ: 'accounting:read',
  ACCOUNTING_WRITE: 'accounting:write',
  ACCOUNTING_COA_MANAGE: 'accounting:manage-coa', // ERP: manage Chart of Accounts
  INVOICES_MANAGE: 'invoices:manage',
  INVOICES_APPROVE: 'invoices:approve', // ERP: approve invoices before dispatch

  // ─── HRM ─────────────────────────────────────────────────────────────────────
  HRM_ATTENDANCE_CLOCK: 'hrm:clock-attendance',
  HRM_ATTENDANCE_CORRECT: 'hrm:correct-attendance', // ERP: manually correct an attendance record
  HRM_ATTENDANCE_REPORT: 'hrm:view-attendance-report',
  HRM_PAYROLL_PROCESS: 'hrm:process-payroll',
  HRM_PAYROLL_APPROVE: 'hrm:approve-payroll', // ERP: approve payroll batch (4-eyes)
  HRM_PAYROLL_VIEW_SLIP: 'hrm:view-payslip', // View another employee's payslip
  HRM_EMPLOYEE_MANAGE: 'hrm:manage-employees',
  HRM_EMPLOYEE_DELETE: 'hrm:delete-employee', // Delete employee records (critical)
  HRM_LEAVE_APPROVE: 'hrm:approve-leave', // ERP: approve leave requests
  HRM_DOCUMENT_MANAGE: 'hrm:manage-documents', // Upload/manage HR documents vault

  // ─── CRM & Customers ─────────────────────────────────────────────────────────
  CRM_READ: 'crm:read',
  CRM_WRITE: 'crm:write',
  CRM_DELETE: 'crm:delete',
  CRM_SEGMENT: 'crm:segment', // Manage customer segments (ERP targeted pricing)
  CRM_CREDIT_LIMIT: 'crm:credit-limit', // ERP: set B2B credit limits

  // ─── Marketing ───────────────────────────────────────────────────────────────
  MARKETING_MANAGE: 'marketing:manage',
  COUPONS_MANAGE: 'coupons:manage',
  PROMOTIONS_MANAGE: 'promotions:manage',
  MARKETING_EXPORT: 'marketing:export', // Export subscriber lists (privacy-sensitive)

  // ─── Reports & Analytics ─────────────────────────────────────────────────────
  REPORTS_READ: 'reports:read',
  REPORTS_FINANCIAL_VIEW: 'reports:view-financial', // ERP: P&L, Balance Sheet (sensitive)
  REPORTS_EXPORT: 'reports:export', // Export data to CSV/PDF
  REPORTS_SCHEDULE: 'reports:schedule', // Schedule automated reports

  // ─── Logistics & Fulfillment ─────────────────────────────────────────────────
  LOGISTICS_MANAGE: 'logistics:manage',
  FULFILLMENT_MANAGE: 'fulfillment:manage',
  SHIPPING_MANAGE: 'shipping:manage', // Manage carrier integrations

  // ─── Settings ────────────────────────────────────────────────────────────────
  SETTINGS_MANAGE: 'settings:manage',
  SETTINGS_INTEGRATIONS: 'settings:integrations', // ERP: manage third-party integrations
  SETTINGS_BILLING: 'settings:billing', // View/manage subscription & billing

  // ─── Content ─────────────────────────────────────────────────────────────────
  CONTENT_MANAGE: 'content:manage',
  CONTENT_PUBLISH: 'content:publish', // Publish public-facing content

  // ─── AI ──────────────────────────────────────────────────────────────────────
  AI_USE: 'ai:use',
  AI_MANAGE: 'ai:manage',
  /** Granular scope: use AI features specifically in HRM module (leave, recruitment, payroll) */
  AI_USE_HRM: 'ai:use:hrm',
  /** Granular scope: use AI features specifically in Finance module (AR, AP, tax, reports) */
  AI_USE_FINANCE: 'ai:use:finance',
} as const

export type SystemPermissionCode = (typeof SystemPermissions)[keyof typeof SystemPermissions]
