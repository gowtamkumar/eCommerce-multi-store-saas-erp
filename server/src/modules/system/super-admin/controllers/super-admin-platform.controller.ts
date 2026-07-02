import { RequestContext } from '@/common/decorators/request-context.decorator'
import { Roles } from '@/common/decorators/roles.decorator'
import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { UserRole } from '@/common/enums/user/user-role.enum'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { RolesGuard } from '@/common/guards/roles.guard'
import { AuthService } from '@/modules/admin/core/auth/services/auth.service'
import { UserService } from '@/modules/admin/core/user/services/user.service'
import { CacheService } from '@/modules/admin/operations/infra/cache/cache.service'
import { AuditLogService } from '@/modules/system/audit-log/audit-log.service'
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
import { AddonCatalogService } from '../../addon-catalog/addon-catalog.service'
import { SubscriptionPlanService } from '../../subscription-plan/subscription-plan.service'
import { SuperAdminService } from '../super-admin.service'
import { TrafficService } from '../traffic.service'

function sanitizeLog(input: string | undefined | null): string {
  if (!input) return ''
  return input.replace(/[\r\n]/g, '_')
}

@Controller('super-admin')
export class SuperAdminPlatformController {
  private readonly logger = new Logger(SuperAdminPlatformController.name)

  constructor(
    private readonly userService: UserService,
    private readonly trafficService: TrafficService,
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

    // Security check. The setup key MUST be configured via env; there is no
    // insecure default. If it is unset the bootstrap endpoint is disabled.
    const expectedKey = process.env.SuperAdmin_SETUP_KEY
    if (!expectedKey || expectedKey.trim() === '') {
      throw new UnauthorizedException('Super admin setup is disabled')
    }
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
      { storeId: null, userId: null } as RequestContextDto,
    )

    // Create or Update Initial Subscription Plans
    const plansToSeed = [
      {
        name: 'Starter',
        description: 'Basic storefront configuration and single-location catalog.',
        price: 0,
        monthlyPrice: 0,
        yearlyPrice: 0,
        features: [
          'pos',
          'catalog',
          'content',
          'settings',
          'payment_settings',
          'courier',
          'ai',
          'reports',
        ],
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
          'ai',
          'reports',
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
          'ai',
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
          storeId: null,
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
        service: 'eCommerce Multi-Store SaaS Backend',
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
    const ctx = { storeId: null, userId: null, user: { role: 'super_admin' } } as any
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

  // ─── Audit Logs Export (CSV) ─────────────────────────────────────────────

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Get('/audit-logs/export')
  async exportAuditLogsCSV(
    @Res() res: Response,
    @Query('action') action?: string,
    @Query('storeId') storeId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ): Promise<void> {
    const ctx = { storeId: storeId || null, userId: null, user: { role: 'super_admin' } } as any
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
        'Store ID',
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
          log.storeId || '',
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
  async clearCacheAll(@Query('storeId') storeId?: string): Promise<BaseApiSuccessResponse<null>> {
    this.logger.verbose(
      `Super Admin called clearCacheAll${storeId ? ` for store ${sanitizeLog(storeId)}` : ''}.`,
    )
    if (storeId) {
      await this.cacheService.clearStoreCache(storeId)
    } else {
      await this.cacheService.clearFullCache()
    }
    return {
      success: true,
      statusCode: 200,
      message: storeId
        ? `Cache for store ${storeId} cleared successfully`
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

    // Audit the impersonation against the target user's store for traceability.
    if (user.storeId) {
      await this.auditLogService.log(
        { storeId: user.storeId, userId: ctx.userId, user: ctx.user } as RequestContextDto,
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
    if (user.store?.subdomain) {
      try {
        const url = new URL(frontendUrl)
        url.hostname = `${user.store.subdomain}.${url.hostname}`
        redirectUrl = `${url.origin}/login?impersonateToken=${impersonateToken}`
      } catch (e: any) {
        redirectUrl = `http://${user.store.subdomain}.localhost:3000/login?impersonateToken=${impersonateToken}`
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
