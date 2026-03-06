import { Controller, Get, Param, Query, Request, UseGuards } from '@nestjs/common'
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
    const [orders, products, payments, pages, suppliers, purchaseOrders, traffic] = await Promise.all([
      this.orderService.findAll({ page: 1, limit: 1000 }, tenantId),
      this.productService.findAll({ page: 1, limit: 1000 }, tenantId),
      this.paymentService.findAll(tenantId),
      this.pageService.findAll(tenantId),
      this.supplierService.findAll(tenantId),
      this.purchaseOrderService.findAll(tenantId),
      this.trafficService.getGlobalTrafficStats(7),
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
        traffic: {
          totalHits: traffic.reduce((sum, t) => sum + t.requestCount, 0),
          recentHits: traffic.slice(0, 7)
        }
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

  @Get('/supplier-ledger/:supplierId')
  async getSupplierLedger(@Request() req: any, @Param('supplierId') supplierId: string) {
    const tenantId = req.user.tenantId;

    const [supplier, pos, payments] = await Promise.all([
      this.supplierService.findOne(supplierId, tenantId),
      this.purchaseOrderService.findAllBySupplier(supplierId, tenantId),
      this.purchaseOrderService.findAllPaymentsBySupplier(supplierId, tenantId),
    ]);

    // Combine and sort chronologically
    const transactions: any[] = [
      ...pos.map((po: any) => ({
        id: po.id,
        date: po.createdAt,
        type: 'PURCHASE_ORDER',
        reference: po.referenceNumber,
        amount: +po.totalAmount,
        debit: +po.totalAmount, // PO increases due amount
        credit: 0,
        status: po.status,
      })),
      ...payments.map((p: any) => ({
        id: p.id,
        date: p.paymentDate,
        type: 'PAYMENT',
        reference: p.transactionId || 'Payment',
        amount: +p.amount,
        debit: 0,
        credit: +p.amount, // Payment decreases due amount
        method: p.paymentMethod,
        note: p.note
      }))
    ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Calculate running balance and summary
    let runningBalance = 0;
    const ledger = transactions.map(tx => {
      runningBalance += (tx.debit - tx.credit);
      return { ...tx, balance: runningBalance };
    });

    const totalOrders = pos.reduce((sum, po) => sum + (+po.totalAmount || 0), 0);
    const totalPaid = payments.reduce((sum, p) => sum + (+p.amount || 0), 0);

    return {
      success: true,
      data: {
        supplier: {
          id: supplier.id,
          name: supplier.name,
          email: supplier.email,
          phone: supplier.phone
        },
        summary: {
          totalOrders,
          totalPaid,
          balance: runningBalance
        },
        ledger: ledger.reverse() // Newest first for UI
      }
    };
  }

  @Get('/cash-flow')
  async getCashFlow(@Request() req: any, @Query('period') period: string = 'last30days') {
    const tenantId = req.user.tenantId;

    const [customerPayments, expenses, supplierPayments] = await Promise.all([
      this.paymentService.findAll(tenantId),
      this.expenseService.findAll(tenantId),
      this.purchaseOrderService.findAllPayments(tenantId),
    ]);

    const inflow = customerPayments.filter((p: any) => p.status === 'SUCCESS');
    const outflowExpenses = expenses;
    const outflowSuppliers = supplierPayments;

    // Combine all movements
    const movements: any[] = [
      ...inflow.map(p => ({
        date: p.createdAt,
        amount: +p.amount,
        type: 'INFLOW',
        category: 'Sales',
        reference: p.transactionId
      })),
      ...outflowExpenses.map(e => ({
        date: e.expenseDate,
        amount: +e.amount,
        type: 'OUTFLOW',
        category: e.category,
        reference: e.description
      })),
      ...outflowSuppliers.map(sp => ({
        date: sp.paymentDate,
        amount: +sp.amount,
        type: 'OUTFLOW',
        category: 'Supplier Payment',
        reference: sp.transactionId || 'Vendor Payout'
      }))
    ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Group by day for the last 30 days
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    const chartData = last30Days.map(date => {
      const dayMovements = movements.filter(m => {
        const d = m.date instanceof Date ? m.date.toISOString() : m.date;
        return typeof d === 'string' && d.startsWith(date);
      });

      const dayInflow = dayMovements.filter(m => m.type === 'INFLOW').reduce((sum, m) => sum + m.amount, 0);
      const dayOutflow = dayMovements.filter(m => m.type === 'OUTFLOW').reduce((sum, m) => sum + m.amount, 0);

      return {
        date,
        displayDate: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        inflow: dayInflow,
        outflow: dayOutflow,
        net: dayInflow - dayOutflow
      };
    });

    const totalInflow = inflow.reduce((sum, p) => sum + (+p.amount || 0), 0);
    const totalOutflow = outflowExpenses.reduce((sum, e) => sum + (+e.amount || 0), 0) +
      outflowSuppliers.reduce((sum, sp) => sum + (+sp.amount || 0), 0);

    return {
      success: true,
      data: {
        summary: {
          totalInflow,
          totalOutflow,
          netCashFlow: totalInflow - totalOutflow
        },
        chartData,
        recentMovements: movements.reverse().slice(0, 10)
      }
    };
  }

  @Get('/export/:type')
  async exportReport(
    @Request() req: any,
    @Param('type') type: string,
    @Query('startDate') startDateStr?: string,
    @Query('endDate') endDateStr?: string,
    @Query('supplierId') supplierId?: string
  ) {
    const tenantId = req.user.tenantId;
    const startDate = startDateStr ? new Date(startDateStr) : new Date(0);
    const endDate = endDateStr ? new Date(endDateStr) : new Date();
    endDate.setHours(23, 59, 59, 999);

    let csvContent = '';
    let filename = `report-${type}-${new Date().toISOString().split('T')[0]}.csv`;

    switch (type) {
      case 'sales': {
        const payments = await this.paymentService.findAll(tenantId);
        const filtered = payments.filter((p: any) => p.status === 'SUCCESS' && new Date(p.createdAt) >= startDate && new Date(p.createdAt) <= endDate);
        csvContent = 'Date,Transaction ID,Order ID,Amount,Currency,Method\n';
        filtered.forEach((p: any) => {
          csvContent += `${p.createdAt},${p.transactionId},${p.orderId},${p.amount},${p.currency},${p.method}\n`;
        });
        break;
      }
      case 'expenses': {
        const expenses = await this.expenseService.findAll(tenantId);
        const filtered = expenses.filter((e: any) => new Date(e.expenseDate) >= startDate && new Date(e.expenseDate) <= endDate);
        csvContent = 'Date,Category,Description,Amount,Tenant ID\n';
        filtered.forEach((e: any) => {
          csvContent += `${e.expenseDate},${e.category},"${e.description || ''}",${e.amount},${e.tenantId}\n`;
        });
        break;
      }
      case 'supplier-ledger': {
        if (!supplierId) return { success: false, message: 'Supplier ID required' };
        const res = await this.getSupplierLedger(req, supplierId);
        const data = res.data;
        csvContent = `Supplier: ${data.supplier.name}\nDate,Type,Reference,Debit,Credit,Balance,Status,Note\n`;
        data.ledger.forEach((tx: any) => {
          csvContent += `${tx.date},${tx.type},${tx.reference},${tx.debit},${tx.credit},${tx.balance},${tx.status || ''},"${tx.note || ''}"\n`;
        });
        break;
      }
      case 'cash-flow': {
        const res = await this.getCashFlow(req);
        const data = res.data;
        csvContent = 'Date,Type,Category,Reference,Amount\n';
        data.recentMovements.forEach((m: any) => {
          csvContent += `${m.date},${m.type},${m.category},"${m.reference || ''}",${m.amount}\n`;
        });
        break;
      }
      default:
        return { success: false, message: 'Invalid export type' };
    }

    return {
      success: true,
      data: {
        csv: csvContent,
        filename
      }
    };
  }

  @Get('/finance-summary')
  async getFinanceSummary(@Request() req: any) {
    const tenantId = req.user.tenantId;

    const [customerPayments, expenses, supplierPayments, purchaseOrders] = await Promise.all([
      this.paymentService.findAll(tenantId),
      this.expenseService.findAll(tenantId),
      this.purchaseOrderService.findAllPayments(tenantId),
      this.purchaseOrderService.findAll(tenantId),
    ]);

    const inflow = customerPayments.filter((p: any) => p.status === 'SUCCESS');
    const totalRevenue = inflow.reduce((sum, p) => sum + (+p.amount || 0), 0);
    const totalOpExpenses = expenses.reduce((sum, e) => sum + (+e.amount || 0), 0);
    const totalSupplierPayments = supplierPayments.reduce((sum, sp) => sum + (+sp.amount || 0), 0);
    const totalExpenses = totalOpExpenses + totalSupplierPayments;
    const totalAmountDue = purchaseOrders.reduce((sum: number, po: any) => sum + (po.totalAmount - (po.paidAmount || 0)), 0);

    // Monthly Trend (Last 6 Months)
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      return d.toISOString().substring(0, 7); // YYYY-MM
    }).reverse();

    const chartData = months.map(month => {
      const monthInflow = inflow.filter(p => p.createdAt.toString().startsWith(month)).reduce((sum, p) => sum + (+p.amount || 0), 0);
      const monthOpEx = expenses.filter(e => e.expenseDate.toString().startsWith(month)).reduce((sum, e) => sum + (+e.amount || 0), 0);
      const monthSuppEx = supplierPayments.filter(sp => sp.paymentDate.toString().startsWith(month)).reduce((sum, sp) => sum + (+sp.amount || 0), 0);

      return {
        name: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short' }),
        revenue: monthInflow,
        expense: monthOpEx + monthSuppEx,
        profit: monthInflow - (monthOpEx + monthSuppEx)
      };
    });

    // Categorized Expenses
    const categories: Record<string, number> = {};
    expenses.forEach(e => {
      categories[e.category] = (categories[e.category] || 0) + (+e.amount || 0);
    });
    categories['Supplier Payouts'] = totalSupplierPayments;

    return {
      success: true,
      data: {
        kpis: {
          totalRevenue,
          totalExpenses,
          netProfit: totalRevenue - totalExpenses,
          margin: totalRevenue > 0 ? ((totalRevenue - totalExpenses) / totalRevenue) * 100 : 0,
          totalAmountDue
        },
        chartData,
        expenseBreakdown: Object.entries(categories).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value),
        supplierStats: {
          totalSuppliers: (await this.supplierService.findAll(tenantId)).length,
          totalPurchaseOrders: purchaseOrders.length,
          recentPurchaseOrders: purchaseOrders.slice(0, 5)
        }
      }
    };
  }
}
