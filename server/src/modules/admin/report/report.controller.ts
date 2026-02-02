import { Controller, Get, Request, UseGuards } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { OrderStatus } from '../../../common/enums/order-status.enum'
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard'
import { OrderService } from '../../order/order.service'
import { PageService } from '../../page/page.service'
import { PaymentService } from '../../payment/payment.service'
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
    private readonly paymentService: PaymentService,
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
  @ApiOperation({ summary: 'Get current tenant dashboard report' })
  async getDashboardReport(@Request() req: any) {
    const tenantId = req.user.tenantId

    // Fetch all data in parallel for backend processing
    const [orders, products, payments, pages] = await Promise.all([
      this.orderService.findAll({ page: 1, limit: 1000 }, tenantId),
      this.productService.findAll({ page: 1, limit: 1000 }, tenantId),
      this.paymentService.findAll(tenantId),
      this.pageService.findAll(tenantId),
    ])

    const paymentsData = payments || []
    const ordersData = orders.orders || []
    const productsData = products.products || []
    const pagesData = pages || []

    // 1. Basic Counts
    const activeOrders = ordersData.filter((o: any) => o.status === OrderStatus.PENDING).length
    const totalProducts = productsData.length
    const totalSales = paymentsData.reduce((sum: number, p: any) => sum + (+p.amount || 0), 0)
    const totalPages = pagesData.length

    // 2. Recent Items
    const recentPages = pagesData.slice(0, 5)
    const recentProducts = productsData.slice(0, 5)

    // 3. Monthly Growth
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1
    const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear

    const currentMonthSales = paymentsData
      .filter((p: any) => {
        const date = new Date(p.createdAt)
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear
      })
      .reduce((sum: number, p: any) => sum + (+p.amount || 0), 0)

    const previousMonthSales = paymentsData
      .filter((p: any) => {
        const date = new Date(p.createdAt)
        return date.getMonth() === previousMonth && date.getFullYear() === previousYear
      })
      .reduce((sum: number, p: any) => sum + (+p.amount || 0), 0)

    let monthlyGrowth: number | null = null
    if (previousMonthSales > 0) {
      monthlyGrowth = ((currentMonthSales - previousMonthSales) / previousMonthSales) * 100
    } else if (currentMonthSales > 0) {
      monthlyGrowth = 100
    }

    // 4. Sales Data (Last 7 Days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - i)
      return d.toISOString().split('T')[0]
    }).reverse()

    const salesData = last7Days.map((date) => {
      const daySales = paymentsData
        .filter((p: any) => {
          const createdAt = p.createdAt instanceof Date ? p.createdAt.toISOString() : p.createdAt
          return typeof createdAt === 'string' && createdAt.startsWith(date)
        })
        .reduce((sum: number, p: any) => sum + (+p.amount || 0), 0)
      return {
        name: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        sales: daySales,
      }
    })

    return {
      success: true,
      data: {
        totalSales,
        activeOrders,
        totalProducts,
        totalPages,
        recentPages,
        recentProducts,
        salesData,
        monthlyGrowth,
        counts: {
          users: await this.userService.countByTenant(tenantId),
          products: totalProducts,
          orders: ordersData.length,
          pages: totalPages,
        },
      },
    }
  }
}
