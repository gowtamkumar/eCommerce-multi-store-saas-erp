import { Controller, Get, Post, Body, UseGuards, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../admin/auth/guards/jwt-auth.guard';
import { UserRole } from '../../common/enums/user/user-role.enum';
import { UserService } from '../admin/user/services/user.service';
import { RolesGuard } from '../admin/auth/guards/roles.guard';
import { Roles } from '../admin/auth/decorators/roles.decorator';
import { TenantService } from '../tenant/tenant.service';
import { OrderService } from '../order/order.service';
import { ReviewService } from '../review/review.service';

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
        };
    }

    @Get('/users')
    async getAllUsers() {
        const users = await this.userService.findAllUsersCrossTenant();
        return {
            users,
            pagination: {
                total: users.length,
                page: 1,
                limit: users.length,
                totalPages: 1,
            },
        };
    }
}
