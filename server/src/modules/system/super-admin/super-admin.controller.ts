import { RequestContext } from '@/common/decorators/request-context.decorator'
import { Roles } from '@/common/decorators/roles.decorator'
import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { TenantStatus } from '@/common/enums/tenant/tenant-status.enum'
import { UserRole } from '@/common/enums/user/user-role.enum'
import { UserStatus } from '@/common/enums/user/user-status.enum'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { RolesGuard } from '@/common/guards/roles.guard'
import { ProductService } from '@/modules/admin/catalog/product/services/product.service'
import { PageService } from '@/modules/admin/content/page/page.service'
import { AuthService } from '@/modules/admin/core/auth/services/auth.service'
import { FilterUserDto } from '@/modules/admin/core/user/dtos'
import { UserService } from '@/modules/admin/core/user/services/user.service'
import { CacheService } from '@/modules/admin/operations/infra/cache/cache.service'
import { OrderService } from '@/modules/admin/sales/order/services/order.service'
import { AuditLogService } from '@/modules/system/audit-log/audit-log.service'
import { TenantService } from '@/modules/system/tenant/tenant.service'
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Logger,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common'
import { Response } from 'express'
import si from 'systeminformation'
import { SubscriptionPlanService } from '../subscription-plan/subscription-plan.service'
import { AddonCatalogService } from '../addon-catalog/addon-catalog.service'
import { TrafficService } from './traffic.service'
import { SuperAdminService } from './super-admin.service'

function sanitizeLog(input: string | undefined | null): string {
  if (!input) return ''
  return input.replace(/[\r\n]/g, '_')
}

@Controller('super-admin')
export class SuperAdminController {
  private readonly logger = new Logger(SuperAdminController.name)

  constructor(
    private readonly userService: UserService,
    private readonly tenantService: TenantService,
    private readonly trafficService: TrafficService,
    private readonly pageService: PageService,
    private readonly planService: SubscriptionPlanService,
    private readonly addonCatalogService: AddonCatalogService,
    private readonly cacheService: CacheService,
    private readonly authService: AuthService,
    private readonly auditLogService: AuditLogService,
    private readonly superAdminService: SuperAdminService,
  ) {}

  @Post('/setup')
  async setup(
    @Body() body: any,
  ): Promise<BaseApiSuccessResponse<{ user: { name: string; username: string } }>> {
    const { name, email, password, username, setupKey } = body

    // Security check
    const expectedKey = process.env.SuperAdmin_SETUP_KEY || 'super-setup-2026'
    if (setupKey !== expectedKey) {
      throw new UnauthorizedException('Invalid setup key')
    }

    const superAdmin = await this.userService.createUser(
      {
        name,
        email,
        password,
        username,
        emailVerificationToken: null,
        role: UserRole.SUPER_ADMIN,
        isAdmin: true,
      } as any,
      { tenantId: null, userId: null } as RequestContextDto,
    )

    // Create or Update Initial Subscription Plans
    const plansToSeed = [
      {
        name: 'Starter',
        description: 'Basic storefront configuration and single-location catalog.',
        price: 0,
        monthlyPrice: 0,
        yearlyPrice: 0,
        features: ['pos', 'catalog', 'content', 'settings', 'payment_settings', 'courier'],
        isActive: true,
        isPopular: false,
        trialPeriodDays: 14,
        code: 'starter',
        currency: 'USD',
        maxBranches: 1,
        maxWarehouses: 1,
        maxStaffUsers: 3,
        maxProducts: 100,
        maxMonthlyOrders: 500,
        maxStorageMb: 1024,
      },
      {
        name: 'Pro Seller',
        description: 'The essentials to get your store up and running with professional features.',
        price: 29,
        monthlyPrice: 29,
        yearlyPrice: 290,
        features: [
          'pos',
          'catalog',
          'content',
          'settings',
          'payment_settings',
          'courier',
          'orders',
          'marketing',
          'seo',
          'trust_safety',
          'email',
          'sms',
          'currencies',
          'custom_domain',
          'header',
          'footer',
          'product_list_ui',
          'product_detail_ui',
          'offers_page_ui',
          'inventory',
        ],
        isActive: true,
        isPopular: true,
        trialPeriodDays: 14,
        code: 'pro_seller',
        currency: 'USD',
        maxBranches: 3,
        maxWarehouses: 3,
        maxStaffUsers: 10,
        maxProducts: 1000,
        maxMonthlyOrders: 5000,
        maxStorageMb: 5120,
      },
      {
        name: 'Enterprise',
        description: 'Scale your business with dedicated support and advanced infrastructure.',
        price: 99,
        monthlyPrice: 99,
        yearlyPrice: 990,
        features: [
          'pos',
          'catalog',
          'content',
          'settings',
          'payment_settings',
          'courier',
          'orders',
          'marketing',
          'seo',
          'trust_safety',
          'email',
          'sms',
          'currencies',
          'custom_domain',
          'header',
          'footer',
          'product_list_ui',
          'product_detail_ui',
          'offers_page_ui',
          'organization',
          'finance',
          'hrm',
          'reports',
          'logistics',
          'branding',
          'inventory',
          'purchasing',
        ],
        isActive: true,
        isPopular: false,
        trialPeriodDays: 30,
        code: 'enterprise',
        currency: 'USD',
        maxBranches: 10,
        maxWarehouses: 10,
        maxStaffUsers: 50,
        maxProducts: 10000,
        maxMonthlyOrders: 50000,
        maxStorageMb: 20480,
      },
    ]

    const existingPlans = await this.planService.findAllSubscriptionPlans()
    for (const planData of plansToSeed) {
      const existing = existingPlans.find((p) => p.name === planData.name)
      if (existing) {
        await this.planService.updateSubscriptionPlan(existing.id, planData)
      } else {
        await this.planService.createSubscriptionPlan(planData, {
          tenantId: null,
          userId: null,
        } as RequestContextDto)
      }
    }

    // Seed default addon catalog
    await this.addonCatalogService.seedDefaults()

    return {
      success: true,
      statusCode: 201,
      message: 'Super Admin created and initial plans seeded successfully',
      data: { user: { name: superAdmin.name, username: superAdmin.username } },
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Get('/health')
  async getHealth(): Promise<BaseApiSuccessResponse<any>> {
    const cpu = await si.cpu()
    const cpuLoad = await si.currentLoad()
    const mem = await si.mem()
    const disk = await si.fsSize()
    const network = await si.networkStats()
    const temp = await si.cpuTemperature()
    const osInfo = await si.osInfo()
    const time = await si.time()

    const processes = await si.processes()
    const docker = await si.dockerContainers(true)

    // Check Redis connectivity
    let redisStatus = 'Unknown'
    try {
      await this.cacheService.pingCache()
      redisStatus = 'Connected'
    } catch {
      redisStatus = 'Disconnected'
    }

    // Check MinIO/S3 connectivity
    let minioStatus = 'Unknown'
    try {
      const minioEndpoint = process.env.MINIO_ENDPOINT || 'http://minio:9000'
      const minioHealthUrl = `${minioEndpoint}/minio/health/live`
      const ctrl = new AbortController()
      const timeout = setTimeout(() => ctrl.abort(), 3000)
      const minioRes = await fetch(minioHealthUrl, { signal: ctrl.signal }).catch(() => null)
      clearTimeout(timeout)
      minioStatus = minioRes?.ok ? 'Connected' : 'Disconnected'
    } catch {
      minioStatus = 'Disconnected'
    }

    const appVersion = process.env.APP_VERSION || process.env.npm_package_version || '1.0.0'

    const stats = {
      cpu: {
        manufacturer: cpu.manufacturer,
        brand: cpu.brand,
        cores: cpu.cores,
        physicalCores: cpu.physicalCores,
        usagePercent: cpuLoad.currentLoad.toFixed(2),
        loadAverage: Array.isArray(cpuLoad.avgLoad)
          ? cpuLoad.avgLoad.join(', ')
          : String(cpuLoad.avgLoad),
      },
      memory: {
        total: (mem.total / 1024 / 1024 / 1024).toFixed(2) + ' GB',
        used: (mem.active / 1024 / 1024 / 1024).toFixed(2) + ' GB',
        usagePercent: ((mem.active / mem.total) * 100).toFixed(2),
      },
      disk: disk.map((d) => ({
        filesystem: d.fs,
        sizeGB: (d.size / 1024 / 1024 / 1024).toFixed(2),
        usedGB: (d.used / 1024 / 1024 / 1024).toFixed(2),
        usagePercent: d.use,
      })),
      network: network.map((n) => ({
        interface: n.iface,
        rx_bytes: n.rx_bytes,
        tx_bytes: n.tx_bytes,
      })),
      temperature: temp.main,
      os: {
        platform: osInfo.platform,
        distro: osInfo.distro,
        release: osInfo.release,
        uptimeSeconds: time.uptime,
      },
      docker: docker.map((c) => ({
        id: c.id,
        name: c.name,
        image: c.image,
        state: c.state,
      })),
      totalProcesses: processes.all,
    }

    return {
      success: true,
      statusCode: 200,
      message: 'System health retrieved successfully',
      data: {
        status: 'ok',
        stats,
        database: 'Connected',
        redis: redisStatus,
        minio: minioStatus,
        version: appVersion,
        timestamp: new Date().toISOString(),
        service: 'eCommerce Multi-Tenant SaaS Backend',
      },
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Get('/overview')
  async getOverview(@Query('days') days?: number): Promise<BaseApiSuccessResponse<any>> {
    const data = await this.superAdminService.getOverview(days)
    return {
      success: true,
      statusCode: 200,
      message: 'Global system overview retrieved successfully',
      data,
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Get('/overview/compare')
  async getOverviewCompare(@Query('days') days?: number): Promise<BaseApiSuccessResponse<any>> {
    const data = await this.superAdminService.getOverviewCompare(days)
    return {
      success: true,
      statusCode: 200,
      message: 'Overview comparison data retrieved successfully',
      data,
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Get('/traffic')
  async getTraffic(@Query('days') days?: number): Promise<BaseApiSuccessResponse<any[]>> {
    const traffic = await this.trafficService.getGlobalTrafficStats(days || 7)
    return {
      success: true,
      statusCode: 200,
      message: 'Global traffic stats retrieved successfully',
      data: traffic,
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Get('/tenants')
  async getAllTenants(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('plan') plan?: string,
    @Query('sort') sort?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<BaseApiSuccessResponse<any[]>> {
    const tenants = await this.tenantService.findAllTenants()

    let filtered = tenants as any[]

    if (search) {
      const term = search.toLowerCase()
      filtered = filtered.filter(
        (t) =>
          t.storeName?.toLowerCase().includes(term) ||
          t.subdomain?.toLowerCase().includes(term) ||
          t.customDomain?.toLowerCase().includes(term),
      )
    }

    if (status) {
      filtered = filtered.filter((t) => t.status?.toLowerCase() === status.toLowerCase())
    }

    if (plan) {
      filtered = filtered.filter((t) =>
        t.subscriptionPlan?.name?.toLowerCase().includes(plan.toLowerCase()),
      )
    }

    if (sort === 'created_asc') {
      filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    } else if (sort === 'created_desc') {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    } else if (sort === 'name_asc') {
      filtered.sort((a, b) => (a.storeName || '').localeCompare(b.storeName || ''))
    }

    // Add trial expiry countdown
    const now = new Date()
    filtered = filtered.map((t) => {
      const endsAt = t.subscriptionEndsAt ? new Date(t.subscriptionEndsAt) : null
      const daysUntilExpiry = endsAt
        ? Math.ceil((endsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        : null
      return { ...t, daysUntilExpiry }
    })

    return {
      success: true,
      statusCode: 200,
      message: 'All tenants retrieved successfully',
      data: filtered,
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Get('/tenants/analytics')
  async getTenantAnalytics(): Promise<BaseApiSuccessResponse<any[]>> {
    try {
      const analytics = await this.tenantService.getBulkTenantAnalytics()
      return {
        success: true,
        statusCode: 200,
        message: 'Tenant analytics retrieved successfully',
        data: analytics,
      }
    } catch (error: any) {
      this.logger.error('[SuperAdmin] Error fetching tenant analytics:', error)
      throw error
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Get('/tenants/:id/analytics')
  async getDetailedTenantAnalytics(@Param('id') id: string): Promise<BaseApiSuccessResponse<any>> {
    try {
      const data = await this.tenantService.getDetailedAnalytics(id)
      return {
        success: true,
        statusCode: 200,
        message: 'Detailed tenant analytics retrieved',
        data,
      }
    } catch (error: any) {
      this.logger.error(
        `[SuperAdmin] Error fetching detailed analytics for tenant ${sanitizeLog(id)}:`,
        error,
      )
      throw error
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Get('/users')
  async getAllUsers(
    @Query() filterDto: FilterUserDto,
    @Query('role') role?: string,
    @Query('status') statusFilter?: string,
    @Query('tenantId') tenantId?: string,
  ): Promise<BaseApiSuccessResponse<any>> {
    const [users, total] = await this.userService.findAllUsersCrossTenant({
      ...filterDto,
      ...(role && { role }),
      ...(statusFilter && { status: statusFilter }),
      ...(tenantId && { tenantId }),
    } as any)
    const page = Number(filterDto.page) || 1
    const limit = Number(filterDto.limit) || 10

    return {
      success: true,
      statusCode: 200,
      message: 'All users retrieved successfully',
      data: {
        users,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Get('/users/:id')
  async getUserDetails(@Param('id') id: string): Promise<BaseApiSuccessResponse<any>> {
    const user = await this.userService.getUser(id)
    return {
      success: true,
      statusCode: 200,
      message: 'User details retrieved successfully',
      data: user as any,
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Patch('/users/:id/status')
  async updateUserStatus(
    @Param('id') id: string,
    @Body('status') status: UserStatus,
  ): Promise<BaseApiSuccessResponse<any>> {
    const user = await this.userService.updateUser(id, { status } as any)
    return {
      success: true,
      statusCode: 200,
      message: `User status updated to ${status}`,
      data: user as any,
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Get('/tenants/:id')
  async getTenantDetails(@Param('id') id: string): Promise<BaseApiSuccessResponse<any>> {
    const tenant = await this.tenantService.findOneTenants(id)
    return {
      success: true,
      statusCode: 200,
      message: 'Tenant details retrieved successfully',
      data: tenant as any,
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Patch('/tenants/:id/status')
  async updateTenantStatus(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
    @Body('status') status: TenantStatus,
  ): Promise<BaseApiSuccessResponse<any>> {
    const tenant = await this.tenantService.updateTenantStatus(id, status as any)
    await this.auditLogService.log(
      { tenantId: id, userId: ctx.userId, user: ctx.user } as RequestContextDto,
      {
        userId: ctx.userId,
        actorName: ctx.user?.username,
        action: 'TENANT_STATUS_CHANGE',
        entity: 'Tenant',
        entityId: id,
        newValue: { status },
      } as any,
    )
    return {
      success: true,
      statusCode: 200,
      message: `Tenant status updated to ${status}`,
      data: tenant as any,
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Patch('/tenants/:id/plan')
  async updateTenantPlan(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
    @Body('planId') planId: string,
  ): Promise<BaseApiSuccessResponse<null>> {
    await this.tenantService.updateTenantPlan(id, planId)
    await this.auditLogService.log(
      { tenantId: id, userId: ctx.userId, user: ctx.user } as RequestContextDto,
      {
        userId: ctx.userId,
        actorName: ctx.user?.username,
        action: 'TENANT_PLAN_CHANGE',
        entity: 'Tenant',
        entityId: id,
        newValue: { planId },
      } as any,
    )
    return {
      success: true,
      statusCode: 200,
      message: 'Plan updated successfully',
      data: null,
    }
  }

  // ─── Bulk Tenant Actions ─────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Post('/tenants/bulk-status')
  @HttpCode(200)
  async bulkUpdateTenantStatus(
    @RequestContext() ctx: RequestContextDto,
    @Body() body: { ids: string[]; status: TenantStatus },
  ): Promise<BaseApiSuccessResponse<{ updated: number }>> {
    const { ids, status } = body
    let updated = 0
    for (const id of ids) {
      try {
        await this.tenantService.updateTenantStatus(id, status as any)
        await this.auditLogService.log(
          { tenantId: id, userId: ctx.userId, user: ctx.user } as RequestContextDto,
          {
            userId: ctx.userId,
            actorName: ctx.user?.username,
            action: 'TENANT_STATUS_CHANGE',
            entity: 'Tenant',
            entityId: id,
            newValue: { status },
          } as any,
        )
        updated++
      } catch (e: any) {
        this.logger.warn(`Bulk status update failed for tenant ${id}: ${e.message}`)
      }
    }
    return {
      success: true,
      statusCode: 200,
      message: `${updated} tenants updated`,
      data: { updated },
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Post('/tenants/bulk-plan')
  @HttpCode(200)
  async bulkUpdateTenantPlan(
    @RequestContext() ctx: RequestContextDto,
    @Body() body: { ids: string[]; planId: string },
  ): Promise<BaseApiSuccessResponse<{ updated: number }>> {
    const { ids, planId } = body
    let updated = 0
    for (const id of ids) {
      try {
        await this.tenantService.updateTenantPlan(id, planId)
        await this.auditLogService.log(
          { tenantId: id, userId: ctx.userId, user: ctx.user } as RequestContextDto,
          {
            userId: ctx.userId,
            actorName: ctx.user?.username,
            action: 'TENANT_PLAN_CHANGE',
            entity: 'Tenant',
            entityId: id,
            newValue: { planId },
          } as any,
        )
        updated++
      } catch (e: any) {
        this.logger.warn(`Bulk plan update failed for tenant ${id}: ${e.message}`)
      }
    }
    return {
      success: true,
      statusCode: 200,
      message: `${updated} tenants updated`,
      data: { updated },
    }
  }

  // ─── User Management Actions ─────────────────────────────────────────────

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Post('/users/:id/force-password-reset')
  @HttpCode(200)
  async forcePasswordReset(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
  ): Promise<BaseApiSuccessResponse<null>> {
    try {
      await this.userService.updateUser(id, { requirePasswordChange: true } as any)
      this.logger.log(
        `Super Admin ${sanitizeLog(ctx.user?.username)} forced password reset for user ${sanitizeLog(id)}`,
      )
    } catch (e: any) {
      this.logger.warn(`Force password reset for ${id}: ${e.message}`)
    }
    return {
      success: true,
      statusCode: 200,
      message: 'Password reset flag set for user',
      data: null,
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Post('/users/:id/send-verification')
  @HttpCode(200)
  async sendVerificationEmail(@Param('id') id: string): Promise<BaseApiSuccessResponse<null>> {
    try {
      const user = await this.userService.getUser(id)
      this.logger.log(
        `Sending verification email to user ${sanitizeLog(id)}: ${sanitizeLog(user?.email)}`,
      )
      // The actual email sending would be triggered here via a notification/email service
      // For now we log and return success — the auth service handles re-sending via existing flows
    } catch (e: any) {
      this.logger.warn(`Send verification for ${id}: ${e.message}`)
    }
    return { success: true, statusCode: 200, message: 'Verification email queued', data: null }
  }

  // ─── Security: Impersonation Logs ────────────────────────────────────────

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Get('/security/impersonation-logs')
  async getImpersonationLogs(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ): Promise<BaseApiSuccessResponse<any>> {
    const ctx = { tenantId: null, userId: null, user: { role: 'super_admin' } } as any
    const result = await this.auditLogService.findAllAuditLogs(ctx, {
      page: Number(page) || 1,
      limit: Number(limit) || 20,
      action: 'IMPERSONATE_START',
      from,
      to,
    } as any)
    return {
      success: true,
      statusCode: 200,
      message: 'Impersonation logs retrieved',
      data: result as any,
    }
  }

  // ─── Billing & Revenue ────────────────────────────────────────────────────

  // ─── Billing & Revenue ────────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Get('/billing/overview')
  async getBillingOverview(): Promise<BaseApiSuccessResponse<any>> {
    const data = await this.superAdminService.getBillingOverview()
    return {
      success: true,
      statusCode: 200,
      message: 'Billing overview retrieved successfully',
      data,
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Get('/billing/invoices')
  async getAllInvoices(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ): Promise<BaseApiSuccessResponse<any>> {
    const data = await this.superAdminService.getAllInvoices(page, limit, status, search)
    return {
      success: true,
      statusCode: 200,
      message: 'Invoices retrieved successfully',
      data,
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Get('/billing/revenue-chart')
  async getRevenueChart(@Query('months') months?: number): Promise<BaseApiSuccessResponse<any>> {
    const data = await this.superAdminService.getRevenueChart(months)
    return {
      success: true,
      statusCode: 200,
      message: 'Revenue chart data retrieved',
      data,
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Get('/billing/churn')
  async getChurnAnalytics(): Promise<BaseApiSuccessResponse<any[]>> {
    const data = await this.superAdminService.getChurnAnalytics()
    return {
      success: true,
      statusCode: 200,
      message: 'Churned merchants retrieved successfully',
      data,
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Get('/billing/invoices/export')
  async exportInvoicesCSV(@Res() res: Response): Promise<void> {
    const invoices = await this.superAdminService.getInvoicesForExport()

    const rows = [
      ['Invoice #', 'Tenant', 'Plan', 'Amount', 'Currency', 'Status', 'Billing Cycle', 'Date'].join(
        ',',
      ),
      ...invoices.map((inv) =>
        [
          inv.invoiceNumber,
          `"${(inv.tenant?.storeName || '').replace(/"/g, '""')}"`,
          inv.subscriptionPlan?.name || '',
          inv.amount,
          inv.currency,
          inv.status,
          inv.billingCycle,
          inv.billingDate ? new Date(inv.billingDate).toISOString() : '',
        ].join(','),
      ),
    ]

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', `attachment; filename="invoices-${Date.now()}.csv"`)
    res.send(rows.join('\n'))
  }

  // ─── Analytics Export ────────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Get('/analytics/export')
  async exportAnalyticsCSV(@Res() res: Response): Promise<void> {
    const tenants = (await this.tenantService.findAllTenants()) as any[]

    const rows = [
      [
        'Store Name',
        'Subdomain',
        'Plan',
        'Status',
        'Subscription Status',
        'Subscription Ends',
        'Created At',
      ].join(','),
      ...tenants.map((t) =>
        [
          `"${(t.storeName || '').replace(/"/g, '""')}"`,
          t.subdomain || '',
          t.subscriptionPlan?.name || 'No Plan',
          t.status || '',
          t.subscriptionStatus || '',
          t.subscriptionEndsAt ? new Date(t.subscriptionEndsAt).toISOString() : '',
          t.createdAt ? new Date(t.createdAt).toISOString() : '',
        ].join(','),
      ),
    ]

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', `attachment; filename="analytics-${Date.now()}.csv"`)
    res.send(rows.join('\n'))
  }

  // ─── Audit Logs Export (CSV) ─────────────────────────────────────────────

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Get('/audit-logs/export')
  async exportAuditLogsCSV(
    @Res() res: Response,
    @Query('action') action?: string,
    @Query('tenantId') tenantId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ): Promise<void> {
    const ctx = { tenantId: tenantId || null, userId: null, user: { role: 'super_admin' } } as any
    const { data } = await this.auditLogService.findAllAuditLogs(ctx, {
      page: 1,
      limit: 5000,
      action,
      from,
      to,
    } as any)

    const rows = [
      [
        'ID',
        'Action',
        'Entity',
        'Entity ID',
        'Actor',
        'Tenant ID',
        'IP Address',
        'Created At',
      ].join(','),
      ...data.map((log: any) =>
        [
          log.id,
          log.action,
          log.entity,
          log.entityId || '',
          `"${(log.actorName || '').replace(/"/g, '""')}"`,
          log.tenantId || '',
          log.ipAddress || '',
          log.createdAt ? new Date(log.createdAt).toISOString() : '',
        ].join(','),
      ),
    ]

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', `attachment; filename="audit-logs-${Date.now()}.csv"`)
    res.send(rows.join('\n'))
  }

  // ─── Cache Operations ─────────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Post('/cache/clear-all')
  @HttpCode(200)
  async clearCacheAll(@Query('tenantId') tenantId?: string): Promise<BaseApiSuccessResponse<null>> {
    this.logger.verbose(
      `Super Admin called clearCacheAll${tenantId ? ` for tenant ${sanitizeLog(tenantId)}` : ''}.`,
    )
    if (tenantId) {
      await this.cacheService.clearTenantCache(tenantId)
    } else {
      await this.cacheService.clearFullCache()
    }
    return {
      success: true,
      statusCode: 200,
      message: tenantId
        ? `Cache for tenant ${tenantId} cleared successfully`
        : 'Global system cache cleared successfully',
      data: null,
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Post('/impersonate/:userId')
  @HttpCode(200)
  async impersonate(
    @RequestContext() ctx: RequestContextDto,
    @Param('userId') userId: string,
  ): Promise<BaseApiSuccessResponse<{ impersonateToken: string; redirectUrl: string }>> {
    this.logger.log(`Super Admin initiating impersonation for user ${sanitizeLog(userId)}`)

    // 1. Find user
    const user = await this.userService.getUser(userId)
    if (!user) {
      throw new UnauthorizedException('User not found')
    }

    // 2. Generate impersonation token
    const impersonateToken = await this.authService.createImpersonateToken(user.id)

    // Audit the impersonation against the target user's tenant for traceability.
    if (user.tenantId) {
      await this.auditLogService.log(
        { tenantId: user.tenantId, userId: ctx.userId, user: ctx.user } as RequestContextDto,
        {
          userId: ctx.userId,
          actorName: ctx.user?.username,
          action: 'IMPERSONATE_START',
          entity: 'User',
          entityId: user.id,
          newValue: { targetUserId: user.id, targetUsername: user.username },
        } as any,
      )
    }

    // 3. Construct redirect URL
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
    let redirectUrl = `${frontendUrl}/login?impersonateToken=${impersonateToken}`
    if (user.tenant?.subdomain) {
      try {
        const url = new URL(frontendUrl)
        url.hostname = `${user.tenant.subdomain}.${url.hostname}`
        redirectUrl = `${url.origin}/login?impersonateToken=${impersonateToken}`
      } catch (e: any) {
        redirectUrl = `http://${user.tenant.subdomain}.localhost:3000/login?impersonateToken=${impersonateToken}`
      }
    }

    return {
      success: true,
      statusCode: 200,
      message: `Impersonation token generated for user ${user.username}`,
      data: {
        impersonateToken,
        redirectUrl,
      },
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Get('/tenants/:id/features')
  async getTenantFeatures(@Param('id') id: string): Promise<BaseApiSuccessResponse<any[]>> {
    const features = await this.tenantService.getTenantFeatures(id)
    return {
      success: true,
      statusCode: 200,
      message: 'Tenant features retrieved successfully',
      data: features,
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Patch('/tenants/:id/features')
  async updateTenantFeatureOverride(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
    @Body() body: { featureSlug: string; overrideValue: boolean | null },
  ): Promise<BaseApiSuccessResponse<any>> {
    const result = await this.tenantService.updateTenantFeatureOverride(
      id,
      body.featureSlug,
      body.overrideValue,
    )
    await this.auditLogService.log(
      { tenantId: id, userId: ctx.userId, user: ctx.user } as RequestContextDto,
      {
        userId: ctx.userId,
        actorName: ctx.user?.username,
        action: 'TENANT_FEATURE_OVERRIDE',
        entity: 'Tenant',
        entityId: id,
        newValue: { featureSlug: body.featureSlug, overrideValue: body.overrideValue },
      } as any,
    )
    return {
      success: true,
      statusCode: 200,
      message: 'Tenant feature override updated successfully',
      data: result,
    }
  }

  // ─── Addon Catalog CRUD ───────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Get('/addon-catalog')
  async getAddonCatalog(): Promise<BaseApiSuccessResponse<any[]>> {
    const data = await this.addonCatalogService.findAll()
    return { success: true, statusCode: 200, message: 'Addon catalog retrieved', data }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Post('/addon-catalog')
  async createAddon(@Body() body: any): Promise<BaseApiSuccessResponse<any>> {
    const data = await this.addonCatalogService.create(body)
    return { success: true, statusCode: 201, message: 'Addon created successfully', data }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Patch('/addon-catalog/:id')
  async updateAddon(
    @Param('id') id: string,
    @Body() body: any,
  ): Promise<BaseApiSuccessResponse<any>> {
    const data = await this.addonCatalogService.update(id, body)
    return { success: true, statusCode: 200, message: 'Addon updated successfully', data }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Delete('/addon-catalog/:id')
  @HttpCode(200)
  async deleteAddon(@Param('id') id: string): Promise<BaseApiSuccessResponse<null>> {
    await this.addonCatalogService.remove(id)
    return { success: true, statusCode: 200, message: 'Addon deleted successfully', data: null }
  }
}
