import { Roles } from '@/common/decorators/roles.decorator'
import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'
import { TenantStatus } from '@/common/enums/tenant/tenant-status.enum'
import { UserRole } from '@/common/enums/user/user-role.enum'
import { UserStatus } from '@/common/enums/user/user-status.enum'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { RolesGuard } from '@/common/guards/roles.guard'
import { ProductService } from '@/modules/admin/catalog/product/product.service'
import { PageService } from '@/modules/admin/content/page/page.service'
import { UserService } from '@/modules/admin/core/user/services/user.service'
import { OrderService } from '@/modules/admin/sales/order/order.service'
import { TenantService } from '@/modules/system/tenant/tenant.service'
import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Patch,
  Post,
  Query,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common'
import si from 'systeminformation'
import { TrafficService } from './traffic.service'
import { SubscriptionPlanService } from '../subscription-plan/subscription-plan.service'
import { SubscriptionBillingCycle } from '@/common/enums/subscription/billing-cycle.enum'

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
  ) { }

  @Post('/setup')
  async setup(@Body() body: any): Promise<BaseApiSuccessResponse<{ user: { name: string, username: string } }>> {
    const { name, email, password, username, setupKey } = body

    // Security check
    const expectedKey = process.env.SuperAdmin_SETUP_KEY || 'super-setup-2026'
    if (setupKey !== expectedKey) {
      throw new UnauthorizedException('Invalid setup key')
    }

    const superAdmin = await this.userService.createUser({
      name,
      email,
      password,
      username,
      emailVerificationToken: null,
      role: UserRole.SUPER_ADMIN,
      isAdmin: true,
    })

    // Create Initial Subscription Plans if none exist
    const existingPlans = await this.planService.findAllSubscriptionPlans()
    if (existingPlans.length === 0) {
      await this.planService.createSubscriptionPlan({
        name: 'Pro Seller',
        description: 'The essentials to get your store up and running with professional features.',
        price: 29,
        monthlyPrice: 29,
        yearlyPrice: 290,
        features: ['Unlimited Products', 'Custom Domains', 'Advanced Analytics', 'Priority Support'],
        isActive: true,
        isPopular: true,
      })

      await this.planService.createSubscriptionPlan({
        name: 'Enterprise',
        description: 'Scale your business with dedicated support and advanced infrastructure.',
        price: 99,
        monthlyPrice: 99,
        yearlyPrice: 990,
        features: ['Priority 24/7 Support', 'Dedicated Account Manager', 'Custom API Access', 'SLA Guarantee'],
        isActive: true,
        isPopular: false,
      })
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
      const tenants = await this.tenantService.findAllTenants()
      const traffic = await this.trafficService.getTrafficStats(30)

      const analytics = await Promise.all(
        tenants.map(async (tenant) => {
          const [users, products, orders, pages] = await Promise.all([
            this.userService.countByTenant(tenant.id),
            this.productService.countByTenant(tenant.id),
            this.orderService.countByTenant(tenant.id),
            this.pageService.countByTenant(tenant.id),
          ])

          const tenantTraffic = traffic.filter((t: any) => t.tenantId === tenant.id)
          const totalTraffic = tenantTraffic.reduce((acc, t) => acc + t.requestCount, 0)

          return {
            id: tenant.id,
            storeName: tenant.storeName,
            subdomain: tenant.subdomain,
            subscriptionPlan: tenant.subscriptionPlan,
            status: tenant.status,
            stats: {
              users,
              products,
              orders,
              pages,
              traffic: totalTraffic,
            },
          }
        }),
      )

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
  async getDetailedTenantAnalytics(
    @Param('id') id: string,
  ): Promise<BaseApiSuccessResponse<any>> {
    try {
      const [users, products, orders, pages] = await Promise.all([
        this.userService.countByTenant(id),
        this.productService.countByTenant(id),
        this.orderService.countByTenant(id),
        this.pageService.countByTenant(id),
      ])

      return {
        success: true,
        statusCode: 200,
        message: 'Detailed tenant analytics retrieved',
        data: {
          counts: {
            users,
            products,
            orders,
            pages,
          },
          topPages: [], // Page tracking disabled per user request
        },
      }
    } catch (error) {
      this.logger.error(`[SuperAdmin] Error fetching detailed analytics for tenant ${id}:`, error)
      throw error
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Get('/users')
  async getAllUsers(): Promise<BaseApiSuccessResponse<any>> {
    const users = await this.userService.findAllUsersCrossTenant()
    return {
      success: true,
      statusCode: 200,
      message: 'All users retrieved successfully',
      data: {
        users,
        pagination: {
          total: users.length,
          page: 1,
          limit: users.length,
          totalPages: 1,
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
    // This would require a new method in TenantService to update the plan relation
    // For now, removing the legacy tier logic.
    return {
      success: true,
      statusCode: 200,
      message: 'Plan update logic to be implemented with dynamic plans',
      data: null,
    }
  }
}
