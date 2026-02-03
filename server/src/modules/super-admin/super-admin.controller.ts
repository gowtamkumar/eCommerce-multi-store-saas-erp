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
import { ApiOperation, ApiResponse } from '@nestjs/swagger'
import { Roles } from '../../common/decorators/roles.decorator'
import { UserRole } from '../../common/enums/user/user-role.enum'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { UserService } from '../admin/user/services/user.service'
import { OrderService } from '../order/order.service'
import { PageService } from '../page/page.service'
import { ProductService } from '../product/product.service'
import { ReviewService } from '../review/review.service'
import { TenantService } from '../tenant/tenant.service'

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
  ) {}

  @Post('/setup')
  @ApiOperation({ summary: 'Initial Super Admin setup' })
  @ApiResponse({ status: 201, description: 'Super Admin created successfully' })
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
    const [users, tenants, orders, reviews, traffic] = await Promise.all([
      this.userService.findAllUsersCrossTenant(),
      this.tenantService.findAll(),
      this.orderService.findAllOrders(),
      this.reviewService.findAllReviews(),
      this.trafficService.getTrafficStats(1), // Last 24h
    ])

    const totalRequestsLast24h = traffic.reduce((acc, t) => acc + t.requestCount, 0)

    const planStats = tenants.reduce(
      (acc, t) => {
        const planName = t.subscriptionPlan?.name || 'No Plan'
        acc[planName] = (acc[planName] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const statusStats = tenants.reduce(
      (acc, t) => {
        acc[t.status] = (acc[t.status] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return {
      success: true,
      data: {
        status: 'ok',
        health: {
          database: 'Connected',
          uptime: process.uptime(),
          version: '1.0.0',
        },
        stats: {
          totalTenants: tenants.length,
          totalUsers: users.length,
          totalOrders: orders.length,
          totalReviews: reviews.length,
          totalRequestsLast24h,
          plans: planStats,
          statuses: statusStats,
        },
        timestamp: new Date().toISOString(),
        service: 'eCommerce Multi-Tenant SaaS Backend',
      },
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SuperAdmin)
  @Get('/traffic')
  @ApiOperation({ summary: 'Get traffic stats for last 7 days' })
  async getTraffic(@Query('days') days?: number) {
    return {
      success: true,
      data: await this.trafficService.getTrafficStats(days || 7),
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SuperAdmin)
  @Get('/tenants')
  @ApiOperation({ summary: 'Get all tenants (SuperAdmin only)' })
  async getAllTenants() {
    return {
      success: true,
      data: await this.tenantService.findAll(),
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SuperAdmin)
  @Get('/tenants/analytics')
  @ApiOperation({ summary: 'Get per-tenant granular analytics' })
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
  @ApiOperation({ summary: 'Get detailed historical analytics for a specific tenant' })
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
  @ApiOperation({ summary: 'Update tenant status (Suspend/Activate)' })
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
  @ApiOperation({ summary: 'Update tenant subscription plan' })
  async updateTenantPlan(@Param('id') id: string, @Body('planId') planId: string) {
    // This would require a new method in TenantService to update the plan relation
    // For now, removing the legacy tier logic.
    return {
      success: true,
      message: 'Plan update logic to be implemented with dynamic plans',
    }
  }
}
