import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common'
import si from 'systeminformation';
import { Roles } from 'src/common/decorators/roles.decorator'
import { UserRole } from 'src/common/enums/user/user-role.enum'
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard'
import { RolesGuard } from 'src/common/guards/roles.guard'
import { UserService } from 'src/modules/admin/user/services/user.service'
import { OrderService } from 'src/modules/order/order.service'
import { PageService } from 'src/modules/page/page.service'
import { ProductService } from 'src/modules/product/product.service'
import { ReviewService } from 'src/modules/review/review.service'
import { TenantService } from 'src/modules/tenant/tenant.service'
import { TrafficService } from './traffic.service'


@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('super-admin')
export class SuperAdminController {
  constructor(
    private readonly userService: UserService,
    private readonly tenantService: TenantService,
    private readonly orderService: OrderService,
    private readonly reviewService: ReviewService,
    private readonly trafficService: TrafficService,
    private readonly productService: ProductService,
    private readonly pageService: PageService,
  ) { }

  @Post('/setup')
  async setup(@Body() body: any) {
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
      role: UserRole.SuperAdmin,
      isAdmin: true,
    })

    return {
      success: true,
      message: 'Super Admin created successfully',
      user: { name: superAdmin.name, username: superAdmin.username },
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SuperAdmin)
  @Get('/health')
  async getHealth() {

    const cpu = await si.cpu();
    const cpuLoad = await si.currentLoad();
    const mem = await si.mem();
    const disk = await si.fsSize();
    const network = await si.networkStats();
    const temp = await si.cpuTemperature();
    const osInfo = await si.osInfo();
    const time = await si.time();

    const processes = await si.processes();
    const docker = await si.dockerContainers(true); // Fetch all containers with full info

    const stats = {
      cpu: {
        manufacturer: cpu.manufacturer,
        brand: cpu.brand,
        cores: cpu.cores,
        physicalCores: cpu.physicalCores,
        usagePercent: cpuLoad.currentLoad.toFixed(2),
        loadAverage: Array.isArray(cpuLoad.avgLoad) ? cpuLoad.avgLoad.join(', ') : String(cpuLoad.avgLoad)
      },
      memory: {
        total: (mem.total / 1024 / 1024 / 1024).toFixed(2) + " GB",
        used: (mem.active / 1024 / 1024 / 1024).toFixed(2) + " GB",
        usagePercent: ((mem.active / mem.total) * 100).toFixed(2)
      },
      disk: disk.map(d => ({
        filesystem: d.fs,
        sizeGB: (d.size / 1024 / 1024 / 1024).toFixed(2),
        usedGB: (d.used / 1024 / 1024 / 1024).toFixed(2),
        usagePercent: d.use
      })),
      network: network.map(n => ({
        interface: n.iface,
        rx_bytes: n.rx_bytes,
        tx_bytes: n.tx_bytes
      })),
      temperature: temp.main,
      os: {
        platform: osInfo.platform,
        distro: osInfo.distro,
        release: osInfo.release,
        uptimeSeconds: time.uptime
      },
      docker: docker.map(c => ({
        id: c.id,
        name: c.name,
        image: c.image,
        state: c.state
      })),
      totalProcesses: processes.all
    };

    return {
      success: true,
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
  @Roles(UserRole.SuperAdmin)
  @Get('/overview')
  async getOverview(@Query('days') days?: number) {
    const [tenantOverview, userOverview, productOverview, orderOverview, traffic] = await Promise.all([
      this.tenantService.tenantOverview(),
      this.userService.userOverview(),
      this.productService.productOverview(),
      this.orderService.orderOverview(),
      this.trafficService.getGlobalTrafficStats(days || 7),
    ])

    const totalRequestsLast24h = traffic[0]?.requestCount || 0

    return {
      success: true,
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
  @Roles(UserRole.SuperAdmin)
  @Get('/traffic')
  async getTraffic(@Query('days') days?: number) {
    return {
      success: true,
      data: await this.trafficService.getGlobalTrafficStats(days || 7),
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SuperAdmin)
  @Get('/tenants')
  async getAllTenants() {
    return {
      success: true,
      data: await this.tenantService.findAll(),
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SuperAdmin)
  @Get('/tenants/analytics')
  async getTenantAnalytics() {
    try {
      const tenants = await this.tenantService.findAll()
      const traffic = await this.trafficService.getTrafficStats(30)

      const analytics = await Promise.all(
        tenants.map(async (tenant) => {
          const [users, products, orders, pages] = await Promise.all([
            this.userService.countByTenant(tenant.id),
            this.productService.countByTenant(tenant.id),
            this.orderService.countByTenant(tenant.id),
            this.pageService.countByTenant(tenant.id),
          ])

          const tenantTraffic = traffic.filter((t) => t.tenantId === tenant.id)
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

      return { success: true, data: analytics }
    } catch (error) {
      console.error('[SuperAdmin] Error fetching tenant analytics:', error)
      throw error
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SuperAdmin)
  @Get('/tenants/:id/analytics')
  async getDetailedTenantAnalytics(@Param('id') id: string) {
    try {
      const [users, products, orders, pages, pageTraffic] = await Promise.all([
        this.userService.countByTenant(id),
        this.productService.countByTenant(id),
        this.orderService.countByTenant(id),
        this.pageService.countByTenant(id),
        this.trafficService.getPageTrafficStats(id, 30),
      ])

      return {
        success: true,
        data: {
          counts: {
            users,
            products,
            orders,
            pages,
          },
          topPages: pageTraffic.map((pt) => ({
            path: pt.path,
            hits: pt.requestCount,
            lastUpdated: pt.lastUpdated,
          })),
        },
      }
    } catch (error) {
      console.error(`[SuperAdmin] Error fetching detailed analytics for tenant ${id}:`, error)
      throw error
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SuperAdmin)
  @Get('/users')
  async getAllUsers() {
    const users = await this.userService.findAllUsersCrossTenant()
    return {
      success: true,
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
  @Roles(UserRole.SuperAdmin)
  @Patch('/tenants/:id/status')
  async updateTenantStatus(@Param('id') id: string, @Body('status') status: string) {
    const tenant = await this.tenantService.updateStatus(id, status)
    return {
      success: true,
      message: `Tenant status updated to ${status}`,
      data: tenant,
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SuperAdmin)
  @Patch('/tenants/:id/plan')
  async updateTenantPlan(@Param('id') id: string, @Body('planId') planId: string) {
    // This would require a new method in TenantService to update the plan relation
    // For now, removing the legacy tier logic.
    return {
      success: true,
      message: 'Plan update logic to be implemented with dynamic plans',
    }
  }
}
