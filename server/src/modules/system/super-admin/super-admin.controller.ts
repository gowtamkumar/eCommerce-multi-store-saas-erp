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
import { FilterUserDto } from '@/modules/admin/core/user/dtos'
import { UserService } from '@/modules/admin/core/user/services/user.service'
import { CacheService } from '@/modules/admin/operations/infra/cache/cache.service'
import { OrderService } from '@/modules/admin/sales/order/services/order.service'
import { TenantService } from '@/modules/system/tenant/tenant.service'
import {
  Body,
  Controller,
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
import { TrafficService } from './traffic.service'

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
    private readonly cacheService: CacheService,
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
      { tenantId: 'system', userId: 'system' } as RequestContextDto,
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
          '/admin',
          '/admin/products',
          '/admin/categories',
          '/admin/brands',
          '/admin/media',
          '/admin/profile',
          '/admin/faqs',
          '/admin/pos',
        ],
        isActive: true,
        isPopular: false,
      },
      {
        name: 'Pro Seller',
        description: 'The essentials to get your store up and running with professional features.',
        price: 29,
        monthlyPrice: 29,
        yearlyPrice: 290,
        features: [
          '/admin',
          '/admin/products',
          '/admin/categories',
          '/admin/brands',
          '/admin/media',
          '/admin/profile',
          '/admin/faqs',
          '/admin/pos',
          '/admin/orders',
          '/admin/returns',
          '/admin/fulfillment',
          '/admin/couriers',
          '/admin/coupons',
          '/admin/promotions',
          '/admin/pages',
          '/admin/reviews',
          '/admin/expenses',
          '/admin/settings',
          '/admin/customers',
          '/admin/subscribers',
          '/admin/leads',
          '/admin/carts',
          '/admin/payments',
          '/admin/campaigns',
        ],
        isActive: true,
        isPopular: true,
      },
      {
        name: 'Enterprise',
        description: 'Scale your business with dedicated support and advanced infrastructure.',
        price: 99,
        monthlyPrice: 99,
        yearlyPrice: 990,
        features: [
          '/admin',
          '/admin/products',
          '/admin/categories',
          '/admin/brands',
          '/admin/media',
          '/admin/profile',
          '/admin/faqs',
          '/admin/pos',
          '/admin/orders',
          '/admin/returns',
          '/admin/fulfillment',
          '/admin/couriers',
          '/admin/coupons',
          '/admin/promotions',
          '/admin/pages',
          '/admin/reviews',
          '/admin/expenses',
          '/admin/settings',
          '/admin/customers',
          '/admin/subscribers',
          '/admin/leads',
          '/admin/carts',
          '/admin/payments',
          '/admin/campaigns',
          '/admin/warehouses',
          '/admin/hrm',
          '/admin/inventory',
          '/admin/finance',
          '/admin/finance/profit-loss',
          '/admin/finance/balance-sheet',
          '/admin/finance/ledger',
          '/admin/invoices',
          '/admin/purchases',
          '/admin/grn',
          '/admin/suppliers',
          '/admin/reports',
          '/admin/reports/sales',
          '/admin/reports/profit-loss',
          '/admin/reports/supplier-ledger',
          '/admin/reports/customer-ledger',
          '/admin/reports/cash-flow',
          '/admin/reports/export',
          '/admin/reports/finance',
        ],
        isActive: true,
        isPopular: false,
      },
    ]

    const existingPlans = await this.planService.findAllSubscriptionPlans()
    for (const planData of plansToSeed) {
      const existing = existingPlans.find((p) => p.name === planData.name)
      if (existing) {
        await this.planService.updateSubscriptionPlan(existing.id, planData)
      } else {
        await this.planService.createSubscriptionPlan(
          planData,
          { tenantId: 'system', userId: 'system' } as RequestContextDto,
        )
      }
    }

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
      this.logger.error(`[SuperAdmin] Error fetching detailed analytics for tenant ${id}:`, error)
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
      `Super Admin called clearCacheAll${tenantId ? ` for tenant ${tenantId}` : ''}.`,
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
}
