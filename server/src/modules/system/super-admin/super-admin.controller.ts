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
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common'
import si from 'systeminformation'
import { SubscriptionPlanService } from '../subscription-plan/subscription-plan.service'
import { AddonCatalogService } from '../addon-catalog/addon-catalog.service'
import { TrafficService } from './traffic.service'

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
    private readonly orderService: OrderService,
    private readonly trafficService: TrafficService,
    private readonly productService: ProductService,
    private readonly pageService: PageService,
    private readonly planService: SubscriptionPlanService,
    private readonly addonCatalogService: AddonCatalogService,
    private readonly cacheService: CacheService,
    private readonly authService: AuthService,
  ) { }

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
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        service: 'eCommerce Multi-Tenant SaaS Backend',
      },
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Get('/overview')
  async getOverview(@Query('days') days?: number): Promise<BaseApiSuccessResponse<any>> {
    const [tenantOverview, userOverview, productOverview, orderOverview, traffic] =
      await Promise.all([
        this.tenantService.tenantOverview(),
        this.userService.userOverview(),
        this.productService.productOverview(),
        this.orderService.orderOverview(),
        this.trafficService.getGlobalTrafficStats(days || 7),
      ])

    const totalRequestsLast24h = traffic[0]?.requestCount || 0

    return {
      success: true,
      statusCode: 200,
      message: 'Global system overview retrieved successfully',
      data: {
        ...tenantOverview,
        ...userOverview,
        ...productOverview,
        ...orderOverview,
        traffic,
        totalRequestsLast24h,
      },
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
  async getAllTenants(): Promise<BaseApiSuccessResponse<any[]>> {
    const tenants = await this.tenantService.findAllTenants()
    return {
      success: true,
      statusCode: 200,
      message: 'All tenants retrieved successfully',
      data: tenants as any,
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
    } catch (error) {
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
    } catch (error) {
      this.logger.error(`[SuperAdmin] Error fetching detailed analytics for tenant ${sanitizeLog(id)}:`, error)
      throw error
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Get('/users')
  async getAllUsers(@Query() filterDto: FilterUserDto): Promise<BaseApiSuccessResponse<any>> {
    const [users, total] = await this.userService.findAllUsersCrossTenant(filterDto)
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
    @Param('id') id: string,
    @Body('status') status: TenantStatus,
  ): Promise<BaseApiSuccessResponse<any>> {
    const tenant = await this.tenantService.updateTenantStatus(id, status as any)
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
    @Param('id') id: string,
    @Body('planId') planId: string,
  ): Promise<BaseApiSuccessResponse<null>> {
    await this.tenantService.updateTenantPlan(id, planId)
    return {
      success: true,
      statusCode: 200,
      message: 'Plan updated successfully',
      data: null,
    }
  }

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

    // 3. Construct redirect URL
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
    let redirectUrl = `${frontendUrl}/login?impersonateToken=${impersonateToken}`
    if (user.tenant?.subdomain) {
      try {
        const url = new URL(frontendUrl)
        url.hostname = `${user.tenant.subdomain}.${url.hostname}`
        redirectUrl = `${url.origin}/login?impersonateToken=${impersonateToken}`
      } catch (e) {
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
    @Param('id') id: string,
    @Body() body: { featureSlug: string; overrideValue: boolean | null },
  ): Promise<BaseApiSuccessResponse<any>> {
    const result = await this.tenantService.updateTenantFeatureOverride(
      id,
      body.featureSlug,
      body.overrideValue,
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
