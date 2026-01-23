import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../admin/auth/guards/jwt-auth.guard';
import { TrafficService } from '../../super-admin/traffic.service';
import { UserService } from '../../admin/user/services/user.service';
import { ProductService } from '../../product/product.service';
import { OrderService } from '../../order/order.service';
import { PageService } from '../../page/page.service';

@ApiTags('Admin Analytics')
@Controller('admin/analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
    constructor(
        private readonly trafficService: TrafficService,
        private readonly userService: UserService,
        private readonly productService: ProductService,
        private readonly orderService: OrderService,
        private readonly pageService: PageService,
    ) { }

    @Get()
    @ApiOperation({ summary: 'Get current tenant analytics' })
    async getAnalytics(@Request() req: any) {
        const tenantId = req.user.tenantId;

        // Parallelize for performance
        const [users, products, orders, pages, pageTraffic] = await Promise.all([
            this.userService.countByTenant(tenantId),
            this.productService.countByTenant(tenantId),
            this.orderService.countByTenant(tenantId),
            this.pageService.countByTenant(tenantId),
            this.trafficService.getPageTrafficStats(tenantId, 30),
        ]);

        return {
            success: true,
            data: {
                counts: {
                    users,
                    products,
                    orders,
                    pages,
                },
                topPages: pageTraffic.map(pt => ({
                    path: pt.path,
                    hits: pt.requestCount,
                    lastUpdated: pt.lastUpdated
                })),
            }
        };
    }
}
