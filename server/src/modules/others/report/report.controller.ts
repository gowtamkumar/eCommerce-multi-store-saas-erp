import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common'
import { OrderStatus } from 'src/common/enums/order-status.enum'
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard'
import { OrderService } from 'src/modules/order/order.service'
import { PageService } from 'src/modules/page/page.service'
import { PaymentService } from 'src/modules/payment/payment.service'
import { ProductService } from 'src/modules/product/product.service'
import { TrafficService } from 'src/modules/system-platform/super-admin/traffic.service'
import { UserService } from '../../admin/user/services/user.service'
import { SupplierService } from '../supplier/supplier.service'
import { PurchaseOrderService } from '../purchase/purchase-order.service'
import { ExpenseService } from '../expense/expense.service'
import { InvoiceService } from '../invoice/invoice.service'

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
    private readonly supplierService: SupplierService,
    private readonly purchaseOrderService: PurchaseOrderService,
    private readonly expenseService: ExpenseService,
    private readonly invoiceService: InvoiceService,
  ) { }

  @Get('/analytics')
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
  async getDashboardReport(@Request() req: any, @Query('period') period: string = 'month') {
    const tenantId = req.user.tenantId

    // Fetch all data in parallel for backend processing
    const [orders, products, payments, pages, suppliers, purchaseOrders] = await Promise.all([
      this.orderService.findAll({ page: 1, limit: 1000 }, tenantId),
      this.productService.findAll({ page: 1, limit: 1000 }, tenantId),
      this.paymentService.findAll(tenantId),
      this.pageService.findAll(tenantId),
      this.supplierService.findAll(tenantId),
      this.purchaseOrderService.findAll(tenantId),
    ])

    const paymentsData = payments || []
    const ordersData = orders.orders || []
    const productsData = products.products || []
    const pagesData = pages || []

    // 1. Basic Counts (All Time)
    const activeOrders = ordersData.filter((o: any) => o.status === OrderStatus.PENDING).length
    const totalProducts = productsData.length
    const totalSales = paymentsData.reduce((sum: number, p: any) => sum + (+p.amount || 0), 0)
    const totalPages = pagesData.length

    // 2. Recent Items
    const recentPages = pagesData.slice(0, 5)
    const recentProducts = productsData.slice(0, 5)

    // 3. Dynamic Period Calculation
    const now = new Date()
    let startDate: Date

    switch (period) {
      case 'day':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        break
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
    }

    const filteredPayments = paymentsData.filter((p: any) => new Date(p.createdAt) >= startDate)
    const filteredOrders = ordersData.filter((o: any) => new Date(o.createdAt) >= startDate)

    const periodSales = filteredPayments.reduce((sum: number, p: any) => sum + (+p.amount || 0), 0)
    const periodOrders = filteredOrders.length

    // 4. Monthly Growth (Always calculate for context)
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1
    const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear

    const previousMonthSales = paymentsData
      .filter((p: any) => {
        const date = new Date(p.createdAt)
        return date.getMonth() === previousMonth && date.getFullYear() === previousYear
      })
      .reduce((sum: number, p: any) => sum + (+p.amount || 0), 0)

    let monthlyGrowth: number | null = null
    const thisMonthSales = paymentsData
      .filter((p: any) => {
        const date = new Date(p.createdAt)
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear
      })
      .reduce((sum: number, p: any) => sum + (+p.amount || 0), 0)

    if (previousMonthSales > 0) {
      monthlyGrowth = ((thisMonthSales - previousMonthSales) / previousMonthSales) * 100
    } else if (thisMonthSales > 0) {
      monthlyGrowth = 100
    }

    // 5. Sales Data (Last 7 Days for Chart)
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
        periodSales,
        periodOrders,
        activeOrders,
        totalProducts,
        totalPages,
        recentPages,
        recentProducts,
        salesData,
        monthlyGrowth,
        supplierStats: {
          totalSuppliers: suppliers.length,
          totalPurchaseOrders: purchaseOrders.length,
          totalAmountDue: purchaseOrders.reduce((sum: number, po: any) => sum + (po.totalAmount - (po.paidAmount || 0)), 0),
          recentPurchaseOrders: purchaseOrders.slice(0, 5),
        },
        counts: {
          users: await this.userService.countByTenant(tenantId),
          products: totalProducts,
          orders: ordersData.length,
          pages: totalPages,
          suppliers: suppliers.length,
          purchaseOrders: purchaseOrders.length,
        },
        lowStockCount: productsData.filter((p: any) => {
          if (p.variants && p.variants.length > 0) {
            return p.variants.some((v: any) => v.stock <= 5)
          }
          return p.stock <= 5
        }).length,
        lowStockProducts: productsData
          .filter((p: any) => {
            if (p.variants && p.variants.length > 0) {
              return p.variants.some((v: any) => v.stock <= 5)
            }
            return p.stock <= 5
          })
          .slice(0, 5),
      },
    }
  }

  @Get('/profit-loss')
  async getProfitLossReport(@Request() req: any, @Query('startDate') startDateStr?: string, @Query('endDate') endDateStr?: string) {
    const tenantId = req.user.tenantId;

    const [orders, payments, expenses, purchaseOrders] = await Promise.all([
      this.orderService.findAll({ page: 1, limit: 1000 }, tenantId),
      this.paymentService.findAll(tenantId),
      this.expenseService.findAll(tenantId),
      this.purchaseOrderService.findAll(tenantId),
    ]);

    const ordersData = orders.orders || [];
    const paymentsData = payments || [];
    const expensesData = expenses || [];
    const purchaseOrdersData = purchaseOrders || [];

    let startDate = startDateStr ? new Date(startDateStr) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    let endDate = endDateStr ? new Date(endDateStr) : new Date();

    // Set end date to end of day to include full day
    endDate.setHours(23, 59, 59, 999);

    // Filter data by date range
    const filterByDate = (item: any, dateField: string = 'createdAt') => {
      const itemDate = new Date(item[dateField]);
      return itemDate >= startDate && itemDate <= endDate;
    };

    const filteredOrders = ordersData.filter((o: any) => filterByDate(o));
    const filteredPayments = paymentsData.filter((p: any) => filterByDate(p));
    const filteredExpenses = expensesData.filter((e: any) => filterByDate(e, 'expenseDate'));
    const filteredPurchaseOrders = purchaseOrdersData.filter((po: any) => filterByDate(po));

    // Calculate Sales Revenue
    // Revenue can be either Total Value of Completed/Delivered Orders or sum of Payments depending on accounting logic.
    // Using Payment amounts (completed transactions) is standard for cash-based accounting.
    const revenue = filteredPayments.reduce((sum: number, p: any) => sum + (+p.amount || 0), 0);

    // Calculate COGS (Cost of Goods Sold)
    // Using actual Purchase Orders that are completed or approved
    const cogs = filteredPurchaseOrders
      .filter((po: any) => po.status !== 'CANCELLED')
      .reduce((sum: number, po: any) => sum + (+po.totalAmount || 0), 0);

    const grossProfit = revenue - cogs;

    // Calculate Operating Expenses
    const categorizedExpenses = filteredExpenses.reduce((acc: Record<string, number>, exp: any) => {
      const cat = exp.category;
      acc[cat] = (acc[cat] || 0) + Number(exp.amount || 0);
      return acc;
    }, {});

    const totalOperatingExpenses = filteredExpenses.reduce((sum: number, exp: any) => sum + (+exp.amount || 0), 0);

    const netProfit = grossProfit - totalOperatingExpenses;
    const profitMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;

    return {
      success: true,
      data: {
        period: {
          startDate,
          endDate
        },
        revenue: {
          total: revenue,
          orderCount: filteredOrders.length
        },
        cogs: {
          total: cogs,
          purchaseOrderCount: filteredPurchaseOrders.length
        },
        grossProfit,
        operatingExpenses: {
          total: totalOperatingExpenses,
          breakdown: Object.keys(categorizedExpenses).map(category => ({
            category,
            amount: categorizedExpenses[category]
          })).sort((a, b) => b.amount - a.amount)
        },
        netProfit,
        profitMargin
      }
    };
  }
}
