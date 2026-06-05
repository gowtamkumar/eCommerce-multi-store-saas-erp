import { RiskLevel } from '@/common/enums/risk-level.enum'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { UserRole } from '@/common/enums/user/user-role.enum'
import { CacheService } from '@/modules/admin/operations/infra/cache/cache.service'
import { Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { CreateUserDto, FilterUserDto, UpdatePasswordDto, UpdateUserDto } from '../dtos'
import { StaffInvitationEntity } from '../entities/staff-invitation.entity'
import { UserEntity } from '../entities/user.entity'
import { PermissionEntity } from '../entities/permission.entity'
import { UserRepository } from '../repositories/user.repository'
import { StaffInvitationService } from './staff-invitation.service'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { OnApplicationBootstrap } from '@nestjs/common'

@Injectable()
export class UserService implements OnApplicationBootstrap {
  private readonly logger = new Logger(UserService.name)

  constructor(
    private readonly userRepo: UserRepository,
    private readonly cacheService: CacheService,
    private readonly invitationService: StaffInvitationService,
    @InjectRepository(PermissionEntity)
    private readonly permissionRepo: Repository<PermissionEntity>,
  ) {}

  async onApplicationBootstrap() {
    await this.seedPermissions()
  }

  async seedPermissions(): Promise<void> {
    this.logger.log('Seeding system permissions...')
    const permissionsToSeed = [
      // ─── Access Control ────────────────────────────────────────
      {
        code: 'users:read',
        name: 'View Users',
        description: 'Can view user accounts and team members',
        module: 'Access Control',
        feature: 'users',
        action: 'read',
        riskLevel: RiskLevel.LOW,
      },
      {
        code: 'users:write',
        name: 'Manage Users',
        description: 'Can create, edit users',
        module: 'Access Control',
        feature: 'users',
        action: 'write',
        riskLevel: RiskLevel.MEDIUM,
      },
      {
        code: 'users:invite',
        name: 'Invite Staff',
        description: 'Can invite staff members via email',
        module: 'Access Control',
        feature: 'users',
        action: 'invite',
        riskLevel: RiskLevel.LOW,
      },
      {
        code: 'users:delete',
        name: 'Delete Users',
        description: 'Can permanently delete user accounts',
        module: 'Access Control',
        feature: 'users',
        action: 'delete',
        riskLevel: RiskLevel.CRITICAL,
      },
      {
        code: 'users:assign-roles',
        name: 'Assign Roles',
        description: 'Can assign and revoke roles from staff',
        module: 'Access Control',
        feature: 'users',
        action: 'assign-roles',
        riskLevel: RiskLevel.HIGH,
      },
      {
        code: 'users:override-permissions',
        name: 'Override Permissions',
        description: 'Can add explicit ALLOW/DENY overrides for individual users',
        module: 'Access Control',
        feature: 'users',
        action: 'override-permissions',
        riskLevel: RiskLevel.CRITICAL,
      },
      // ─── POS & Retail ──────────────────────────────────────────
      {
        code: 'pos:create-sale',
        name: 'Create POS Sale',
        description: 'Can run POS register sales',
        module: 'POS',
        feature: 'pos',
        action: 'create-sale',
        riskLevel: RiskLevel.LOW,
      },
      {
        code: 'pos:manage-shifts',
        name: 'Manage POS Shifts',
        description: 'Can open, close, and manage register shifts',
        module: 'POS',
        feature: 'pos',
        action: 'manage-shifts',
        riskLevel: RiskLevel.LOW,
      },
      {
        code: 'pos:override-price',
        name: 'Override POS Price',
        description: 'Can manually change a product price at point of sale',
        module: 'POS',
        feature: 'pos',
        action: 'override-price',
        riskLevel: RiskLevel.HIGH,
      },
      {
        code: 'pos:apply-discount',
        name: 'Apply POS Discount',
        description: 'Can apply ad-hoc percentage or fixed discounts on a sale',
        module: 'POS',
        feature: 'pos',
        action: 'apply-discount',
        riskLevel: RiskLevel.MEDIUM,
      },
      {
        code: 'pos:void-transaction',
        name: 'Void Transaction',
        description: 'Can void or cancel a completed POS transaction',
        module: 'POS',
        feature: 'pos',
        action: 'void-transaction',
        riskLevel: RiskLevel.HIGH,
      },
      {
        code: 'pos:refund-sale',
        name: 'POS Refund',
        description: 'Can issue refunds directly at the POS terminal',
        module: 'POS',
        feature: 'pos',
        action: 'refund-sale',
        riskLevel: RiskLevel.MEDIUM,
      },
      {
        code: 'pos:manage-cash-drawer',
        name: 'Manage Cash Drawer',
        description: 'Can perform float in/out and reconcile end-of-shift cash',
        module: 'POS',
        feature: 'pos',
        action: 'manage-cash-drawer',
        riskLevel: RiskLevel.HIGH,
      },
      {
        code: 'pos:view-reports',
        name: 'View POS Reports',
        description: 'Can view shift Z-reports and daily POS summaries',
        module: 'POS',
        feature: 'pos',
        action: 'view-reports',
        riskLevel: RiskLevel.LOW,
      },
      // ─── Catalog ───────────────────────────────────────────────
      {
        code: 'catalog:read',
        name: 'View Catalog',
        description: 'Can view products, categories, and brands',
        module: 'Catalog',
        feature: 'catalog',
        action: 'read',
        riskLevel: RiskLevel.LOW,
      },
      {
        code: 'catalog:write',
        name: 'Manage Catalog',
        description: 'Can create and edit products and categories',
        module: 'Catalog',
        feature: 'catalog',
        action: 'write',
        riskLevel: RiskLevel.MEDIUM,
      },
      {
        code: 'catalog:delete',
        name: 'Delete Products',
        description: 'Can permanently delete products from the catalog',
        module: 'Catalog',
        feature: 'catalog',
        action: 'delete',
        riskLevel: RiskLevel.HIGH,
      },
      {
        code: 'catalog:edit-price',
        name: 'Edit Product Price',
        description: 'Can change the selling price of a product',
        module: 'Catalog',
        feature: 'catalog',
        action: 'edit-price',
        riskLevel: RiskLevel.HIGH,
      },
      {
        code: 'catalog:view-cost',
        name: 'View Cost Price',
        description: 'Can view the supplier/landed cost for products',
        module: 'Catalog',
        feature: 'catalog',
        action: 'view-cost',
        riskLevel: RiskLevel.MEDIUM,
      },
      {
        code: 'catalog:publish',
        name: 'Publish Products',
        description: 'Can publish or unpublish products on the storefront',
        module: 'Catalog',
        feature: 'catalog',
        action: 'publish',
        riskLevel: RiskLevel.MEDIUM,
      },
      {
        code: 'catalog:featured',
        name: 'Manage Featured Items',
        description: 'Can manage featured products and homepage sliders',
        module: 'Catalog',
        feature: 'catalog',
        action: 'featured',
        riskLevel: RiskLevel.LOW,
      },
      {
        code: 'catalog:import',
        name: 'Bulk Import Products',
        description: 'Can import products via CSV/Excel (risk of bulk data change)',
        module: 'Catalog',
        feature: 'catalog',
        action: 'import',
        riskLevel: RiskLevel.HIGH,
      },
      {
        code: 'catalog:export',
        name: 'Export Catalog',
        description: 'Can export product data to CSV/Excel',
        module: 'Catalog',
        feature: 'catalog',
        action: 'export',
        riskLevel: RiskLevel.MEDIUM,
      },
      // ─── Inventory ─────────────────────────────────────────────
      {
        code: 'inventory:read',
        name: 'View Inventory',
        description: 'Can view inventory ledgers and stock levels',
        module: 'Inventory',
        feature: 'inventory',
        action: 'read',
        riskLevel: RiskLevel.LOW,
      },
      {
        code: 'inventory:write',
        name: 'Manage Inventory',
        description: 'Can receive stock, update GRN records',
        module: 'Inventory',
        feature: 'inventory',
        action: 'write',
        riskLevel: RiskLevel.MEDIUM,
      },
      {
        code: 'inventory:adjust',
        name: 'Adjust Stock',
        description: 'Can create manual stock adjustments (shrinkage, damage write-off)',
        module: 'Inventory',
        feature: 'inventory',
        action: 'adjust',
        riskLevel: RiskLevel.HIGH,
      },
      {
        code: 'inventory:transfer',
        name: 'Transfer Stock',
        description: 'Can initiate and approve inter-branch/warehouse transfers',
        module: 'Inventory',
        feature: 'inventory',
        action: 'transfer',
        riskLevel: RiskLevel.MEDIUM,
      },
      {
        code: 'inventory:delete',
        name: 'Delete Inventory Records',
        description: 'Can delete inventory transactions (irreversible)',
        module: 'Inventory',
        feature: 'inventory',
        action: 'delete',
        riskLevel: RiskLevel.CRITICAL,
      },
      {
        code: 'inventory:cycle-count',
        name: 'Approve Cycle Count',
        description: 'Can finalize and post cycle count results to the ledger',
        module: 'Inventory',
        feature: 'inventory',
        action: 'cycle-count',
        riskLevel: RiskLevel.HIGH,
      },
      {
        code: 'inventory:report',
        name: 'Inventory Reports',
        description: 'Can view inventory valuation and movement reports',
        module: 'Inventory',
        feature: 'inventory',
        action: 'report',
        riskLevel: RiskLevel.LOW,
      },
      // ─── Purchasing ────────────────────────────────────────────
      {
        code: 'purchasing:read',
        name: 'View Purchasing',
        description: 'Can view purchase orders and requisitions',
        module: 'Purchasing',
        feature: 'purchasing',
        action: 'read',
        riskLevel: RiskLevel.LOW,
      },
      {
        code: 'purchasing:write',
        name: 'Manage Purchasing',
        description: 'Can create and edit purchase requisitions and orders',
        module: 'Purchasing',
        feature: 'purchasing',
        action: 'write',
        riskLevel: RiskLevel.MEDIUM,
      },
      {
        code: 'purchasing:approve',
        name: 'Approve Purchase Orders',
        description: 'Can formally approve POs for issuance to suppliers',
        module: 'Purchasing',
        feature: 'purchasing',
        action: 'approve',
        riskLevel: RiskLevel.HIGH,
      },
      {
        code: 'purchasing:receive-grn',
        name: 'Receive GRN',
        description: 'Can mark goods as received and create a GRN record',
        module: 'Purchasing',
        feature: 'purchasing',
        action: 'receive-grn',
        riskLevel: RiskLevel.MEDIUM,
      },
      {
        code: 'purchasing:delete',
        name: 'Delete Purchase Records',
        description: 'Can delete purchase orders and related records',
        module: 'Purchasing',
        feature: 'purchasing',
        action: 'delete',
        riskLevel: RiskLevel.HIGH,
      },
      {
        code: 'supplier:manage',
        name: 'Manage Suppliers',
        description: 'Can create and edit supplier profiles',
        module: 'Purchasing',
        feature: 'supplier',
        action: 'manage',
        riskLevel: RiskLevel.MEDIUM,
      },
      {
        code: 'supplier:view-pricing',
        name: 'View Supplier Pricing',
        description: 'Can view supplier cost pricelists and contracts',
        module: 'Purchasing',
        feature: 'supplier',
        action: 'view-pricing',
        riskLevel: RiskLevel.MEDIUM,
      },
      // ─── Orders ────────────────────────────────────────────────
      {
        code: 'orders:read',
        name: 'View Orders',
        description: 'Can view all customer orders',
        module: 'Orders',
        feature: 'orders',
        action: 'read',
        riskLevel: RiskLevel.LOW,
      },
      {
        code: 'orders:write',
        name: 'Manage Orders',
        description: 'Can create and update orders',
        module: 'Orders',
        feature: 'orders',
        action: 'write',
        riskLevel: RiskLevel.MEDIUM,
      },
      {
        code: 'orders:cancel',
        name: 'Cancel Orders',
        description: 'Can cancel confirmed customer orders',
        module: 'Orders',
        feature: 'orders',
        action: 'cancel',
        riskLevel: RiskLevel.HIGH,
      },
      {
        code: 'orders:approve',
        name: 'Approve Orders',
        description: 'Can approve high-value or flagged orders for fulfilment',
        module: 'Orders',
        feature: 'orders',
        action: 'approve',
        riskLevel: RiskLevel.MEDIUM,
      },
      {
        code: 'orders:export',
        name: 'Export Orders',
        description: 'Can export order data to CSV/PDF',
        module: 'Orders',
        feature: 'orders',
        action: 'export',
        riskLevel: RiskLevel.MEDIUM,
      },
      // ─── Returns ───────────────────────────────────────────────
      {
        code: 'returns:read',
        name: 'View Returns',
        description: 'Can view return and refund requests',
        module: 'Orders',
        feature: 'returns',
        action: 'read',
        riskLevel: RiskLevel.LOW,
      },
      {
        code: 'returns:write',
        name: 'Manage Returns',
        description: 'Can create and update return requests',
        module: 'Orders',
        feature: 'returns',
        action: 'write',
        riskLevel: RiskLevel.MEDIUM,
      },
      {
        code: 'returns:approve',
        name: 'Approve Refunds',
        description: 'Can approve refunds and credit notes for customer returns',
        module: 'Orders',
        feature: 'returns',
        action: 'approve',
        riskLevel: RiskLevel.HIGH,
      },
      // ─── Payments ──────────────────────────────────────────────
      {
        code: 'payments:read',
        name: 'View Payments',
        description: 'Can view payment transactions and history',
        module: 'Finance',
        feature: 'payments',
        action: 'read',
        riskLevel: RiskLevel.LOW,
      },
      {
        code: 'payments:write',
        name: 'Process Payments',
        description: 'Can process payments and record customer receipts',
        module: 'Finance',
        feature: 'payments',
        action: 'write',
        riskLevel: RiskLevel.HIGH,
      },
      {
        code: 'payments:void',
        name: 'Void Payments',
        description: 'Can void or reverse a payment record',
        module: 'Finance',
        feature: 'payments',
        action: 'void',
        riskLevel: RiskLevel.CRITICAL,
      },
      {
        code: 'payments:reconcile',
        name: 'Reconcile Payments',
        description: 'Can perform bank-to-ledger reconciliation',
        module: 'Finance',
        feature: 'payments',
        action: 'reconcile',
        riskLevel: RiskLevel.HIGH,
      },
      // ─── Finance & Ledger ──────────────────────────────────────
      {
        code: 'finance:read-ledger',
        name: 'View Ledger',
        description: 'Can view books and general ledger',
        module: 'Finance',
        feature: 'finance',
        action: 'read-ledger',
        riskLevel: RiskLevel.LOW,
      },
      {
        code: 'finance:write-expense',
        name: 'Record Expense',
        description: 'Can create new expense entries',
        module: 'Finance',
        feature: 'finance',
        action: 'write-expense',
        riskLevel: RiskLevel.MEDIUM,
      },
      {
        code: 'finance:post-journal',
        name: 'Post Journal Entry',
        description: 'Can manually create and post double-entry GL journal entries',
        module: 'Finance',
        feature: 'finance',
        action: 'post-journal',
        riskLevel: RiskLevel.CRITICAL,
      },
      {
        code: 'finance:reverse-journal',
        name: 'Reverse Journal Entry',
        description: 'Can reverse/void a previously posted journal entry',
        module: 'Finance',
        feature: 'finance',
        action: 'reverse-journal',
        riskLevel: RiskLevel.CRITICAL,
      },
      {
        code: 'finance:close-period',
        name: 'Close Accounting Period',
        description: 'Can lock a financial period to prevent future edits',
        module: 'Finance',
        feature: 'finance',
        action: 'close-period',
        riskLevel: RiskLevel.CRITICAL,
      },
      {
        code: 'finance:manage-budget',
        name: 'Manage Budget',
        description: 'Can set and update departmental budgets',
        module: 'Finance',
        feature: 'finance',
        action: 'manage-budget',
        riskLevel: RiskLevel.HIGH,
      },
      // ─── Accounting ────────────────────────────────────────────
      {
        code: 'accounting:read',
        name: 'View Accounting',
        description: 'Can view accounting reports and trial balance',
        module: 'Accounting',
        feature: 'accounting',
        action: 'read',
        riskLevel: RiskLevel.LOW,
      },
      {
        code: 'accounting:write',
        name: 'Manage Accounting',
        description: 'Can post accounting transactions',
        module: 'Accounting',
        feature: 'accounting',
        action: 'write',
        riskLevel: RiskLevel.MEDIUM,
      },
      {
        code: 'accounting:manage-coa',
        name: 'Manage Chart of Accounts',
        description: 'Can add, edit, or deactivate GL accounts in the Chart of Accounts',
        module: 'Accounting',
        feature: 'accounting',
        action: 'manage-coa',
        riskLevel: RiskLevel.HIGH,
      },
      {
        code: 'invoices:manage',
        name: 'Manage Invoices',
        description: 'Can create and update invoices',
        module: 'Accounting',
        feature: 'invoices',
        action: 'manage',
        riskLevel: RiskLevel.MEDIUM,
      },
      {
        code: 'invoices:approve',
        name: 'Approve Invoices',
        description: 'Can approve invoices before dispatch to customers',
        module: 'Accounting',
        feature: 'invoices',
        action: 'approve',
        riskLevel: RiskLevel.HIGH,
      },
      // ─── HRM ───────────────────────────────────────────────────
      {
        code: 'hrm:clock-attendance',
        name: 'Clock Attendance',
        description: 'Can clock in/out for shift attendance',
        module: 'HRM',
        feature: 'hrm',
        action: 'clock-attendance',
        riskLevel: RiskLevel.LOW,
      },
      {
        code: 'hrm:correct-attendance',
        name: 'Correct Attendance Record',
        description: 'Can manually correct or override an attendance session record',
        module: 'HRM',
        feature: 'hrm',
        action: 'correct-attendance',
        riskLevel: RiskLevel.HIGH,
      },
      {
        code: 'hrm:view-attendance-report',
        name: 'View Attendance Report',
        description: 'Can view attendance reports for all employees',
        module: 'HRM',
        feature: 'hrm',
        action: 'view-attendance-report',
        riskLevel: RiskLevel.LOW,
      },
      {
        code: 'hrm:process-payroll',
        name: 'Process Payroll',
        description: 'Can run payroll cycles and generate payslips',
        module: 'HRM',
        feature: 'hrm',
        action: 'process-payroll',
        riskLevel: RiskLevel.HIGH,
      },
      {
        code: 'hrm:approve-payroll',
        name: 'Approve Payroll Batch',
        description: 'Can approve a payroll batch for disbursement (4-eyes control)',
        module: 'HRM',
        feature: 'hrm',
        action: 'approve-payroll',
        riskLevel: RiskLevel.CRITICAL,
      },
      {
        code: 'hrm:view-payslip',
        name: 'View Other Employee Payslips',
        description: "Can view another employee's payslip (sensitive personal data)",
        module: 'HRM',
        feature: 'hrm',
        action: 'view-payslip',
        riskLevel: RiskLevel.HIGH,
      },
      {
        code: 'hrm:manage-employees',
        name: 'Manage Employees',
        description: 'Can create and edit employee profiles',
        module: 'HRM',
        feature: 'hrm',
        action: 'manage-employees',
        riskLevel: RiskLevel.MEDIUM,
      },
      {
        code: 'hrm:delete-employee',
        name: 'Delete Employee',
        description: 'Can permanently delete an employee record (critical)',
        module: 'HRM',
        feature: 'hrm',
        action: 'delete-employee',
        riskLevel: RiskLevel.CRITICAL,
      },
      {
        code: 'hrm:approve-leave',
        name: 'Approve Leave Requests',
        description: 'Can approve or reject employee leave requests',
        module: 'HRM',
        feature: 'hrm',
        action: 'approve-leave',
        riskLevel: RiskLevel.MEDIUM,
      },
      {
        code: 'hrm:manage-documents',
        name: 'Manage HR Documents',
        description: 'Can upload, view, and delete employee contract documents',
        module: 'HRM',
        feature: 'hrm',
        action: 'manage-documents',
        riskLevel: RiskLevel.MEDIUM,
      },
      // ─── CRM ───────────────────────────────────────────────────
      {
        code: 'crm:read',
        name: 'View Customers',
        description: 'Can view customer and lead info',
        module: 'CRM',
        feature: 'crm',
        action: 'read',
        riskLevel: RiskLevel.LOW,
      },
      {
        code: 'crm:write',
        name: 'Manage Customers',
        description: 'Can create and edit customer profiles',
        module: 'CRM',
        feature: 'crm',
        action: 'write',
        riskLevel: RiskLevel.MEDIUM,
      },
      {
        code: 'crm:delete',
        name: 'Delete Customers',
        description: 'Can permanently delete customer records',
        module: 'CRM',
        feature: 'crm',
        action: 'delete',
        riskLevel: RiskLevel.HIGH,
      },
      {
        code: 'crm:segment',
        name: 'Manage Customer Segments',
        description: 'Can create customer segments for targeted pricing or campaigns',
        module: 'CRM',
        feature: 'crm',
        action: 'segment',
        riskLevel: RiskLevel.MEDIUM,
      },
      {
        code: 'crm:credit-limit',
        name: 'Set B2B Credit Limit',
        description: 'Can set or modify the credit limit for a B2B customer account',
        module: 'CRM',
        feature: 'crm',
        action: 'credit-limit',
        riskLevel: RiskLevel.HIGH,
      },
      // ─── Marketing ─────────────────────────────────────────────
      {
        code: 'marketing:manage',
        name: 'Manage Marketing',
        description: 'Can manage campaigns and subscriber lists',
        module: 'Marketing',
        feature: 'marketing',
        action: 'manage',
        riskLevel: RiskLevel.MEDIUM,
      },
      {
        code: 'coupons:manage',
        name: 'Manage Coupons',
        description: 'Can create, edit, and delete discount coupons',
        module: 'Marketing',
        feature: 'coupons',
        action: 'manage',
        riskLevel: RiskLevel.MEDIUM,
      },
      {
        code: 'promotions:manage',
        name: 'Manage Promotions',
        description: 'Can create and manage promotions and price rules',
        module: 'Marketing',
        feature: 'promotions',
        action: 'manage',
        riskLevel: RiskLevel.MEDIUM,
      },
      {
        code: 'marketing:export',
        name: 'Export Subscriber Lists',
        description: 'Can export subscriber and contact email lists (privacy-sensitive)',
        module: 'Marketing',
        feature: 'marketing',
        action: 'export',
        riskLevel: RiskLevel.HIGH,
      },
      // ─── Reports ───────────────────────────────────────────────
      {
        code: 'reports:read',
        name: 'View Reports',
        description: 'Can view standard analytical reports',
        module: 'Reports',
        feature: 'reports',
        action: 'read',
        riskLevel: RiskLevel.LOW,
      },
      {
        code: 'reports:view-financial',
        name: 'View Financial Reports',
        description: 'Can view P&L, Balance Sheet, and cash flow statements',
        module: 'Reports',
        feature: 'reports',
        action: 'view-financial',
        riskLevel: RiskLevel.HIGH,
      },
      {
        code: 'reports:export',
        name: 'Export Reports',
        description: 'Can export report data to CSV or PDF',
        module: 'Reports',
        feature: 'reports',
        action: 'export',
        riskLevel: RiskLevel.MEDIUM,
      },
      {
        code: 'reports:schedule',
        name: 'Schedule Reports',
        description: 'Can configure and schedule automated report delivery',
        module: 'Reports',
        feature: 'reports',
        action: 'schedule',
        riskLevel: RiskLevel.LOW,
      },
      // ─── Logistics & Fulfillment ───────────────────────────────
      {
        code: 'logistics:manage',
        name: 'Manage Logistics',
        description: 'Can manage logistics and carrier integrations',
        module: 'Logistics',
        feature: 'logistics',
        action: 'manage',
        riskLevel: RiskLevel.MEDIUM,
      },
      {
        code: 'fulfillment:manage',
        name: 'Manage Fulfillment',
        description: 'Can manage order picking, packing, and dispatch',
        module: 'Logistics',
        feature: 'fulfillment',
        action: 'manage',
        riskLevel: RiskLevel.MEDIUM,
      },
      {
        code: 'shipping:manage',
        name: 'Manage Shipping',
        description: 'Can configure shipping zones, rates, and carrier accounts',
        module: 'Logistics',
        feature: 'shipping',
        action: 'manage',
        riskLevel: RiskLevel.MEDIUM,
      },
      // ─── Settings ──────────────────────────────────────────────
      {
        code: 'settings:manage',
        name: 'Manage Settings',
        description: 'Can manage general system and store settings',
        module: 'Settings',
        feature: 'settings',
        action: 'manage',
        riskLevel: RiskLevel.MEDIUM,
      },
      {
        code: 'settings:integrations',
        name: 'Manage Integrations',
        description: 'Can connect and configure third-party integrations (payment, shipping)',
        module: 'Settings',
        feature: 'settings',
        action: 'integrations',
        riskLevel: RiskLevel.HIGH,
      },
      {
        code: 'settings:billing',
        name: 'Manage Billing',
        description: 'Can view and manage the subscription plan and billing details',
        module: 'Settings',
        feature: 'settings',
        action: 'billing',
        riskLevel: RiskLevel.CRITICAL,
      },
      // ─── Content ───────────────────────────────────────────────
      {
        code: 'content:manage',
        name: 'Manage Content',
        description: 'Can manage pages, FAQs, and blog posts',
        module: 'Content',
        feature: 'content',
        action: 'manage',
        riskLevel: RiskLevel.MEDIUM,
      },
      {
        code: 'content:publish',
        name: 'Publish Content',
        description: 'Can publish or unpublish public-facing CMS content',
        module: 'Content',
        feature: 'content',
        action: 'publish',
        riskLevel: RiskLevel.MEDIUM,
      },
    ]

    for (const p of permissionsToSeed) {
      const existing = await this.permissionRepo.findOne({ where: { code: p.code } })
      if (!existing) {
        await this.permissionRepo.save(this.permissionRepo.create(p))
      }
    }
    this.logger.log('Permissions seeded successfully.')
  }

  async getUsers(
    filterUserDto: FilterUserDto,
    ctx: RequestContextDto,
  ): Promise<{ users: UserEntity[]; total: number }> {
    this.logger.log(`${this.getUsers.name} Service Called`)
    const tenantId = ctx.tenantId
    const [users, total] = await this.userRepo.findAllWithFilters(filterUserDto, tenantId)
    return { users, total }
  }

  async getUser(id: string): Promise<UserEntity> {
    this.logger.log(`${this.getUser.name} Service Called`)
    const user = await this.userRepo.findById(id)
    if (!user) throw new NotFoundException(`User of id ${id} not found`)
    return user
  }

  async findOneUser(id: string, ctx: RequestContextDto): Promise<UserEntity> {
    this.logger.log(`${this.findOneUser.name} Service Called`)
    const tenantId = ctx.tenantId
    const user = await this.userRepo.findByIdAndTenant(id, tenantId)
    if (!user) throw new NotFoundException(`User with id ${id} not found in this tenant.`)
    return user
  }

  async findUserById(id: string): Promise<UserEntity | null> {
    this.logger.log(`${this.findUserById.name} Service Called for ID: ${id}`)
    const cacheKey = `user:profile:${id}`

    // Attempt to fetch from cache with logging
    const cachedUser = await this.cacheService.getCache<UserEntity>(cacheKey)
    if (cachedUser) {
      this.logger.verbose(`Cache HIT for ${cacheKey}`)
      return cachedUser
    }

    this.logger.verbose(`Cache MISS for ${cacheKey}. Fetching from DB...`)
    const user = await this.userRepo.findById(id)

    if (user) {
      await this.cacheService.setCache(cacheKey, user, 3600)
    }

    return user
  }

  async findUserByUsername(username: string, tenantId?: string): Promise<UserEntity | null> {
    this.logger.log(`${this.findUserByUsername.name} Service Called`)
    return this.userRepo.findByUsername(username, tenantId)
  }

  async findUserByEmail(email: string, tenantId?: string): Promise<UserEntity | null> {
    this.logger.log(`${this.findUserByEmail.name} Service Called`)
    return this.userRepo.findByEmail(email, tenantId)
  }

  async createUser(createUserDto: CreateUserDto, ctx: RequestContextDto): Promise<UserEntity> {
    this.logger.log(`${this.createUser.name} Service Called`)
    const hashPassword = await bcrypt.hash(createUserDto.password, 10)
    const user = await this.userRepo.createAndSave(
      {
        ...createUserDto,
        password: hashPassword,
      } as any,
      ctx,
    )
    if (ctx.tenantId) {
      await this.cacheService.delCache('team:members', ctx.tenantId)
    }
    return user
  }

  async updateUser(
    id: string,
    updateUserDto: UpdateUserDto,
    ctx?: RequestContextDto,
  ): Promise<UserEntity> {
    this.logger.log(`${this.updateUser.name} Service Called for ID: ${id}`)
    const user = ctx?.tenantId ? await this.findOneUser(id, ctx) : await this.getUser(id)
    const result = await this.userRepo.updateAndSave(user, updateUserDto)

    const cacheKey = `user:profile:${id}`
    await this.cacheService.delCache(cacheKey)
    this.logger.verbose(`Cache INVALIDATED for ${cacheKey} due to profile update`)

    if (user.tenantId) {
      await this.cacheService.delCache('team:members', user.tenantId)
    }

    return result
  }

  async updatePassword(
    id: string,
    updatePasswordDto: UpdatePasswordDto,
    ctx?: RequestContextDto,
  ): Promise<UserEntity> {
    this.logger.log(`${this.updatePassword.name} Service Called`)
    const { currentPassword, newPassword } = updatePasswordDto
    const user = ctx?.tenantId ? await this.findOneUser(id, ctx) : await this.getUser(id)

    const valid = await this.validateUser(user, currentPassword)
    if (!valid) throw new UnauthorizedException('Password is not valid')

    const newHashedPassword = await bcrypt.hash(newPassword, 10)
    const result = await this.userRepo.updateAndSave(user, { password: newHashedPassword } as any)
    await this.cacheService.delCache(`user:profile:${id}`)
    return result
  }

  async resetPassword(id: string, password: string): Promise<UserEntity> {
    this.logger.log(`${this.resetPassword.name} Service Called`)
    const user = await this.getUser(id)
    const newHashedPassword = await bcrypt.hash(password, 10)
    return this.userRepo.updateAndSave(user, { password: newHashedPassword } as any)
  }

  async deleteUser(id: string, ctx?: RequestContextDto): Promise<UserEntity> {
    this.logger.log(`${this.deleteUser.name} Service Called`)
    const user = ctx?.tenantId ? await this.findOneUser(id, ctx) : await this.getUser(id)
    const result = await this.userRepo.deleteUser(user)
    if (user.tenantId) {
      await this.cacheService.delCache('team:members', user.tenantId)
    }
    return result
  }

  validateUser(user: UserEntity, password: string): Promise<boolean> {
    this.logger.log(`${this.validateUser.name} Service Called`)
    return bcrypt.compare(password, user.password)
  }

  async verifyUser(id: string): Promise<UserEntity> {
    this.logger.log(`${this.verifyUser.name} Service Called`)
    const user = await this.getUser(id)
    return this.userRepo.updateAndSave(user, { isEmailVerified: true })
  }

  async verifyUserByToken(token: string): Promise<UserEntity> {
    this.logger.log(`${this.verifyUserByToken.name} Service Called`)
    const user = await this.userRepo.findByVerificationToken(token)
    if (!user) throw new NotFoundException('Invalid or expired verification token')
    return this.userRepo.updateAndSave(user, {
      isEmailVerified: true,
      emailVerificationToken: null,
    } as any)
  }

  async updateResetToken(userId: string, token: string, expires: Date): Promise<UserEntity> {
    this.logger.log(`${this.updateResetToken.name} Service Called`)
    const user = await this.getUser(userId)
    return this.userRepo.updateAndSave(user, {
      resetPasswordToken: token,
      resetPasswordExpires: expires,
    } as any)
  }

  async resetUserPasswordByToken(token: string, password: string): Promise<UserEntity> {
    this.logger.log(`${this.resetUserPasswordByToken.name} Service Called`)
    const user = await this.userRepo.findByResetToken(token)

    if (!user || !user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
      throw new NotFoundException('Invalid or expired reset token')
    }

    const newHashedPassword = await bcrypt.hash(password, 10)
    return this.userRepo.updateAndSave(user, {
      password: newHashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    } as any)
  }

  async countByTenant(ctx: RequestContextDto): Promise<number> {
    this.logger.log(`${this.countByTenant.name} Service Called`)
    const tenantId = ctx.tenantId
    return await this.userRepo.countByTenant(tenantId)
  }

  async setCurrentRefreshToken(refreshToken: string, userId: string): Promise<void> {
    this.logger.log(`${this.setCurrentRefreshToken.name} Service Called`)
    const currentRefreshToken = await bcrypt.hash(refreshToken, 10)
    await this.userRepo.updateRefreshToken(userId, currentRefreshToken)
  }

  async getUserIfRefreshTokenMatches(
    refreshToken: string,
    userId: string,
  ): Promise<UserEntity | null> {
    this.logger.log(`${this.getUserIfRefreshTokenMatches.name} Service Called`)
    const user = await this.userRepo.findUserWithRefreshToken(userId)

    if (!user || !user.refreshToken) return null

    const isRefreshTokenMatching = await bcrypt.compare(refreshToken, user.refreshToken)
    if (isRefreshTokenMatching) return user
    return null
  }

  async removeRefreshToken(userId: string): Promise<void> {
    this.logger.log(`${this.removeRefreshToken.name} Service Called`)
    await this.userRepo.updateRefreshToken(userId, null)
  }

  async userOverview(): Promise<any> {
    this.logger.log(`${this.userOverview.name} Service Called`)
    return this.userRepo.getOverviewStats()
  }

  // Staff invitation methods are now handled by StaffInvitationService

  async getTeamMembers(
    ctx: RequestContextDto,
  ): Promise<{ members: UserEntity[]; pendingInvitations: StaffInvitationEntity[] }> {
    this.logger.log(`${this.getTeamMembers.name} Service Called`)
    const tenantId = ctx.tenantId
    const cacheKey = 'team:members'

    return this.cacheService.rememberCache(
      cacheKey,
      async () => {
        const [members, pendingInvitations] = await Promise.all([
          this.userRepo.findTeamMembers(tenantId),
          this.invitationService.findPendingByTenant(ctx),
        ])
        return { members, pendingInvitations }
      },
      600, // 10 min cache
      tenantId,
    )
  }

  async updateTeamMemberRole(
    memberId: string,
    role: UserRole,
    ctx: RequestContextDto,
  ): Promise<UserEntity> {
    this.logger.log(`${this.updateTeamMemberRole.name} Service Called`)
    const tenantId = ctx.tenantId
    const user = await this.userRepo.findByIdAndTenant(memberId, tenantId)
    if (!user) throw new NotFoundException('Team member not found.')
    const result = await this.userRepo.updateAndSave(user, { role })
    await this.cacheService.delCache('team:members', tenantId)
    await this.cacheService.delCache(`rbac:manifest:${tenantId}:${memberId}`)
    return result
  }
}
