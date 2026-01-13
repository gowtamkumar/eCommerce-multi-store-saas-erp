import { Body, Controller, Get, Post, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserRole } from '../../common/enums/user/user-role.enum';
import { Roles } from '../admin/auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../admin/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../admin/auth/guards/roles.guard';
import { UserService } from '../admin/user/services/user.service';
import { OrderService } from '../order/order.service';
import { ReviewService } from '../review/review.service';
import { TenantService } from '../tenant/tenant.service';

@Controller('super-admin')
export class SuperAdminController {
    constructor(
        private readonly userService: UserService,
        private readonly tenantService: TenantService,
        private readonly orderService: OrderService,
        private readonly reviewService: ReviewService,
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
        const [users, tenants, orders, reviews] = await Promise.all([
            this.userService.findAllUsersCrossTenant(),
            this.tenantService.findAll(),
            this.orderService.findAllOrders(),
            this.reviewService.findAllReviews(),
        ]);

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
                    tenants: tenants.length,
                    users: users.length,
                    orders: orders.length,
                    reviews: reviews.length,
                },
                timestamp: new Date().toISOString(),
                service: 'eCommerce Multi-Tenant SaaS Backend',
            }
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
}
