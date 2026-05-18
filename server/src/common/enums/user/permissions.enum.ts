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
} as const

export type SystemPermissionCode = typeof SystemPermissions[keyof typeof SystemPermissions]
