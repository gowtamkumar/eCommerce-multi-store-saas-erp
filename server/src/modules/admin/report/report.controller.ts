import { Controller, Get, Request, UseGuards } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard'
import { OrderService } from '../../order/order.service'
import { PageService } from '../../page/page.service'
import { ProductService } from '../../product/product.service'
import { TrafficService } from '../../super-admin/traffic.service'
import { UserService } from '../user/services/user.service'

@ApiTags('Admin Report')
@Controller('report')
@UseGuards(JwtAuthGuard)
export class ReportController {
  constructor(
    private readonly trafficService: TrafficService,
    private readonly userService: UserService,
    private readonly productService: ProductService,
    private readonly orderService: OrderService,
    private readonly pageService: PageService,
  ) {}

  @Get("/analytics")
  @ApiOperation({ summary: 'Get current tenant analytics' })
  async getAnalytics(@Request() req: any) {
    const tenantId = req.user.tenantId

    // Parallelize for performance
    const [users, products, orders, pages, pageTraffic] = await Promise.all([
      this.userService.countByTenant(tenantId),
      this.productService.countByTenant(tenantId),
      this.orderService.countByTenant(tenantId),
      this.pageService.countByTenant(tenantId),
      // Filter out API and Admin routes for Tenant Admin view
      this.trafficService.getPageTrafficStats(tenantId, 30, ['/api', '/admin', '/super-admin']),
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
  }

  @Get('/dashboard')
  @ApiOperation({ summary: 'Get current tenant analytics' })
  async getDashboardReport(@Request() req: any) {
    const tenantId = req.user.tenantId

    // Parallelize for performance
    const [users, products, orders, pages] = await Promise.all([
      this.userService.countByTenant(tenantId),
      this.productService.countByTenant(tenantId),
      this.orderService.countByTenant(tenantId),
      this.pageService.countByTenant(tenantId),
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
      
      },
    }
  }
}
