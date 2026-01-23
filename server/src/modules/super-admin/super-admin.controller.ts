import { Body, Controller, Get, Param, Patch, Post, Query, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserRole } from '../../common/enums/user/user-role.enum';
import { Roles } from '../admin/auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../admin/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../admin/auth/guards/roles.guard';
import { UserService } from '../admin/user/services/user.service';
import { OrderService } from '../order/order.service';
import { ReviewService } from '../review/review.service';
import { TenantService } from '../tenant/tenant.service';
import { ProductService } from '../product/product.service';
import { PageService } from '../page/page.service';

import { TrafficService } from './traffic.service';

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
    @ApiOperation({ summary: 'Initial Super Admin setup' })
    @ApiResponse({ status: 201, description: 'Super Admin created successfully' })
    async setup(@Body() body: any) {
        const { name, email, password, username, setupKey } = body;

        // Security check
        const expectedKey = process.env.SuperAdmin_SETUP_KEY || 'super-setup-2026';
        if (setupKey !== expectedKey) {
            throw new UnauthorizedException('Invalid setup key');
        }

        const superAdmin = await this.userService.createUser({
            name,
            email,
            password,
            username,
            role: UserRole.SuperAdmin,
            isAdmin: true,
        });

        return {
            success: true,
            message: 'Super Admin created successfully',
            user: { name: superAdmin.name, username: superAdmin.username },
        };
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
        ]);

        const totalRequestsLast24h = traffic.reduce((acc, t) => acc + t.requestCount, 0);

        const planStats = tenants.reduce((acc, t) => {
            acc[t.planTier] = (acc[t.planTier] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const statusStats = tenants.reduce((acc, t) => {
            acc[t.status] = (acc[t.status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

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
            }
        };
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SuperAdmin)
    @Get('/traffic')
    @ApiOperation({ summary: 'Get traffic stats for last 7 days' })
    async getTraffic(@Query('days') days?: number) {
        return {
            success: true,
            data: await this.trafficService.getTrafficStats(days || 7),
        };
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SuperAdmin)
    @Get('/tenants')
    @ApiOperation({ summary: 'Get all tenants (SuperAdmin only)' })
    async getAllTenants() {
        return {
            success: true,
            data: await this.tenantService.findAll(),
        };
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SuperAdmin)
    @Get('/tenants/analytics')
    @ApiOperation({ summary: 'Get per-tenant granular analytics' })
    async getTenantAnalytics() {
        const [tenants, users, products, orders, pages, traffic] = await Promise.all([
            this.tenantService.findAll(),
            this.userService.findAllUsersCrossTenant(),
            this.productService.findAllProductsCrossTenant(),
            this.orderService.findAllOrders(),
            this.pageService.findAllPagesCrossTenant(),
            this.trafficService.getTrafficStats(30), // Last 30 days
        ]);

        const analytics = tenants.map(tenant => {
            const tenantUsers = users.filter(u => u.tenantId === tenant.id);
            const tenantProducts = products.filter(p => p.tenantId === tenant.id);
            const tenantOrders = orders.filter(o => o.tenantId === tenant.id);
            const tenantPages = pages.filter(p => p.tenantId === tenant.id);
            const tenantTraffic = traffic.filter(t => t.tenantId === tenant.id);

            const totalTraffic = tenantTraffic.reduce((acc, t) => acc + t.requestCount, 0);

            return {
                id: tenant.id,
                storeName: tenant.storeName,
                subdomain: tenant.subdomain,
                planTier: tenant.planTier,
                status: tenant.status,
                stats: {
                    users: tenantUsers.length,
                    products: tenantProducts.length,
                    orders: tenantOrders.length,
                    pages: tenantPages.length,
                    traffic: totalTraffic,
                }
            };
        });

        return {
            success: true,
            data: analytics,
        };
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SuperAdmin)
    @Get('/tenants/:id/analytics')
    @ApiOperation({ summary: 'Get detailed historical analytics for a specific tenant' })
    async getDetailedTenantAnalytics(@Param('id') id: string) {
        const [users, products, orders, pages, pageTraffic] = await Promise.all([
            this.userService.findAllUsersCrossTenant(), // Can be filtered in service but for now filter here
            this.productService.findAllProductsCrossTenant(),
            this.orderService.findAllOrders(),
            this.pageService.findAllPagesCrossTenant(),
            this.trafficService.getPageTrafficStats(id, 30),
        ]);

        const tenantUsers = users.filter(u => u.tenantId === id);
        const tenantProducts = products.filter(p => p.tenantId === id);
        const tenantOrders = orders.filter(o => o.tenantId === id);
        const tenantPages = pages.filter(p => p.tenantId === id);

        return {
            success: true,
            data: {
                counts: {
                    users: tenantUsers.length,
                    products: tenantProducts.length,
                    orders: tenantOrders.length,
                    pages: tenantPages.length,
                },
                topPages: pageTraffic.map(pt => ({
                    path: pt.path,
                    hits: pt.requestCount,
                    lastUpdated: pt.lastUpdated
                })),
                // Add more historical growth data here if needed
            }
        };
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SuperAdmin)
    @Get('/users')
    async getAllUsers() {
        const users = await this.userService.findAllUsersCrossTenant();
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
        };
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SuperAdmin)
    @Patch('/tenants/:id/status')
    @ApiOperation({ summary: 'Update tenant status (Suspend/Activate)' })
    async updateTenantStatus(@Param('id') id: string, @Body('status') status: string) {
        const tenant = await this.tenantService.updateStatus(id, status);
        return {
            success: true,
            message: `Tenant status updated to ${status}`,
            data: tenant,
        };
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SuperAdmin)
    @Patch('/tenants/:id/plan')
    @ApiOperation({ summary: 'Update tenant plan tier' })
    async updateTenantPlan(@Param('id') id: string, @Body('planTier') planTier: string) {
        const tenant = await this.tenantService.updatePlanTier(id, planTier);
        return {
            success: true,
            message: `Tenant plan updated to ${planTier}`,
            data: tenant,
        };
    }
}
