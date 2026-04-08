import { CacheService } from '@/modules/admin/operations/infra/cache/cache.service'
import { BadRequestException, Injectable, Logger, Query } from '@nestjs/common'


import { ProductService } from '@/modules/admin/catalog/product/product.service'
import { PageService } from '@/modules/admin/content/page/page.service'
import { UserService } from '@/modules/admin/core/user/services/user.service'
import { ExpenseService } from '@/modules/admin/operations/finance/expense/expense.service'
import { PurchaseOrderService } from '@/modules/admin/operations/finance/purchase/purchase-order.service'
import { SupplierService } from '@/modules/admin/operations/finance/supplier/supplier.service'
import { OrderService } from '@/modules/admin/sales/order/order.service'
import { PaymentService } from '@/modules/admin/sales/payment/payment.service'
import { ReportRepository } from './report.repository'

@Injectable()
export class ReportService {
  private readonly logger = new Logger(ReportService.name)

  constructor(
    private readonly userService: UserService,
    private readonly productService: ProductService,
    private readonly orderService: OrderService,
    private readonly pageService: PageService,
    private readonly paymentService: PaymentService,
    private readonly supplierService: SupplierService,
    private readonly purchaseOrderService: PurchaseOrderService,
    private readonly expenseService: ExpenseService,
    private readonly reportRepo: ReportRepository,
    private readonly cacheService: CacheService,
  ) {}

  async getAnalytics(tenantId: string) {
    const cacheKey = `analytics` // CacheService handled tenantId prefixing
    const cachedData = await this.cacheService.getCache<any>(cacheKey, tenantId)
    if (cachedData) return cachedData

    const counts = await this.reportRepo.getGlobalCounts(tenantId)

    const result = {
        counts: {
          users: parseInt(counts.users, 10),
          products: parseInt(counts.products, 10),
          orders: parseInt(counts.orders, 10),
          pages: parseInt(counts.pages, 10),
        },
        topPages: [], // Removed page tracking feature, return empty array for backwards compatibility
    }

    await this.cacheService.setCache(cacheKey, result, 600000) // 10 mins cache
    return result
  }

  async getDashboardReport(tenantId: string, period: string = 'month') {
    const cacheKey = `dashboard:${period}`
    const cachedData = await this.cacheService.getCache<any>(cacheKey, tenantId)
    if (cachedData) return cachedData

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

    // Fetch optimized stats from SQL (parallelized)
    const [stats, chartData, monthlySales, lowStockProductsRaw, products, recentPurchaseOrders] = await Promise.all([
      this.reportRepo.getDashboardStats(tenantId, startDate),
      this.reportRepo.getSalesChartData(tenantId, 7),
      this.reportRepo.getMonthlyGrowth(tenantId),
      this.reportRepo.getLowStockProducts(tenantId, 10),
      this.productService.findAllProducts({ page: 1, limit: 5 }, tenantId),
      this.reportRepo.getRecentPurchaseOrders(tenantId, 5),
    ])

    const recentProducts = products.products || []
    
    // Calculate growth
    let monthlyGrowth: number | null = null
    if (monthlySales.length >= 2) {
      const currentMonthSales = parseFloat(monthlySales[0].sales)
      const prevMonthSales = parseFloat(monthlySales[1].sales)
      if (prevMonthSales > 0) {
        monthlyGrowth = ((currentMonthSales - prevMonthSales) / prevMonthSales) * 100
      } else if (currentMonthSales > 0) {
        monthlyGrowth = 100
      }
    }

    // Format chart data for UI
    const salesData = chartData.map((d: any) => ({
      name: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      sales: parseFloat(d.sales),
    }))

    const lowStockProducts = lowStockProductsRaw.map((p: any) => ({
      id: p.id,
      name: p.name,
      image: p.images?.[0],
      stock: p.stock,
      threshold: p.threshold,
      variantName: p.variantCombination 
        ? Object.values(p.variantCombination).join(' / ') 
        : null,
    }))

    const result = {
      totalSales: parseFloat(stats.totalSales),
      periodSales: parseFloat(stats.periodSales),
      periodOrders: parseInt(stats.periodOrders, 10),
      activeOrders: parseInt(stats.activeOrders, 10),
      totalProducts: parseInt(stats.totalProducts, 10),
      totalPages: parseInt(stats.totalPages, 10),
      salesData,
      monthlyGrowth,
      recentProducts,
      lowStockProducts,
      supplierStats: {
        totalSuppliers: parseInt(stats.totalSuppliers, 10),
        totalPurchaseOrders: parseInt(stats.totalPurchaseOrders, 10),
        totalAmountDue: parseFloat(stats.totalAmountDue),
        recentPurchaseOrders: recentPurchaseOrders.map((po: any) => ({
          ...po,
          supplier: { name: po.supplierName } // For frontend compatibility
        })),
      },
      counts: {
        users: parseInt(stats.totalUsers, 10),
        products: parseInt(stats.totalProducts, 10),
        orders: parseInt(stats.periodOrders, 10), // This should probably be total orders count, but keeping consistency with existing keys
        pages: parseInt(stats.totalPages, 10),
        suppliers: parseInt(stats.totalSuppliers, 10),
        purchaseOrders: parseInt(stats.totalPurchaseOrders, 10),
      },
      lowStockCount: parseInt(stats.lowStockCount, 10),
    }

    await this.cacheService.setCache(cacheKey, result, 600000) // 10 mins cache
    return result
  }

  async getProfitLossReport(tenantId: string, startDateStr?: string, endDateStr?: string) {
    const [orders, payments, expenses, purchaseOrders] = await Promise.all([
      this.orderService.findAllOrders({ page: 1, limit: 1000 }, tenantId),
      this.paymentService.findAllPaymentsRaw(tenantId),
      this.expenseService.findAllExpenses(tenantId),
      this.purchaseOrderService.findAllPurchaseOrders(tenantId),
    ])

    const ordersData = orders.orders || []
    const paymentsData = payments || []
    const expensesData = expenses || []
    const purchaseOrdersData = purchaseOrders || []

    let startDate = startDateStr
      ? new Date(startDateStr)
      : new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    let endDate = endDateStr ? new Date(endDateStr) : new Date()

    // Set end date to end of day to include full day
    endDate.setHours(23, 59, 59, 999)

    // Filter data by date range
    const filterByDate = (item: any, dateField: string = 'createdAt') => {
      const itemDate = new Date(item[dateField])
      return itemDate >= startDate && itemDate <= endDate
    }

    const filteredOrders = ordersData.filter((o: any) => filterByDate(o))
    const filteredPayments = paymentsData.filter((p: any) => filterByDate(p))
    const filteredExpenses = expensesData.filter((e: any) => filterByDate(e, 'expenseDate'))
    const filteredPurchaseOrders = purchaseOrdersData.filter((po: any) => filterByDate(po))

    // Calculate Sales Revenue
    // Revenue can be either Total Value of Completed/Delivered Orders or sum of Payments depending on accounting logic.
    // Using Payment amounts (completed transactions) is standard for cash-based accounting.
    const revenue = filteredPayments.reduce((sum: number, p: any) => sum + (+p.amount || 0), 0)

    // Calculate COGS (Cost of Goods Sold)
    // Using actual Purchase Orders that are completed or approved
    const cogs = filteredPurchaseOrders
      .filter((po: any) => po.status !== 'cancelled')
      .reduce((sum: number, po: any) => sum + (+po.totalAmount || 0), 0)

    const grossProfit = revenue - cogs

    // Calculate Operating Expenses
    const categorizedExpenses = filteredExpenses.reduce((acc: Record<string, number>, exp: any) => {
      const cat = exp.category
      acc[cat] = (acc[cat] || 0) + Number(exp.amount || 0)
      return acc
    }, {})

    const totalOperatingExpenses = filteredExpenses.reduce(
      (sum: number, exp: any) => sum + (+exp.amount || 0),
      0,
    )

    const netProfit = grossProfit - totalOperatingExpenses
    const profitMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0

    return {
        period: {
          startDate,
          endDate,
        },
        revenue: {
          total: revenue,
          orderCount: filteredOrders.length,
        },
        cogs: {
          total: cogs,
          purchaseOrderCount: filteredPurchaseOrders.length,
        },
        grossProfit,
        operatingExpenses: {
          total: totalOperatingExpenses,
          breakdown: Object.keys(categorizedExpenses)
            .map((category) => ({
              category,
              amount: categorizedExpenses[category],
            }))
            .sort((a, b) => b.amount - a.amount),
        },
        netProfit,
        profitMargin,
    }
  }

  async getSupplierLedger(tenantId: string, supplierId: string) {
    const [supplier, pos, payments] = await Promise.all([
      this.supplierService.findOneSupplier(supplierId, tenantId),
      this.purchaseOrderService.findAllBySupplier(supplierId, tenantId),
      this.purchaseOrderService.findAllPaymentsBySupplier(supplierId, tenantId),
    ])

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
        note: p.note,
      })),
    ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    // Calculate running balance and summary
    let runningBalance = 0
    const ledger = transactions.map((tx) => {
      runningBalance += tx.debit - tx.credit
      return { ...tx, balance: runningBalance }
    })

    const totalOrders = pos.reduce((sum, po) => sum + (+po.totalAmount || 0), 0)
    const totalPaid = payments.reduce((sum, p) => sum + (+p.amount || 0), 0)

    return {
        supplier: {
          id: supplier.id,
          name: supplier.name,
          email: supplier.email,
          phone: supplier.phone,
        },
        summary: {
          totalOrders,
          totalPaid,
          balance: runningBalance,
        },
        ledger: ledger.reverse(), // Newest first for UI
    }
  }

  async getCustomerLedger(tenantId: string, customerId: string) {
    const [customer, orders, payments] = await Promise.all([
      this.userService.findOneUser(customerId, tenantId),
      this.orderService.findByUserId(customerId, tenantId),
      this.paymentService.findAllPaymentsByCustomer(customerId, tenantId),
    ])

    // Combine and sort chronologically
    const transactions: any[] = [
      ...orders.map((order: any) => ({
        id: order.id,
        date: order.createdAt,
        type: 'ORDER',
        reference: `ORD-${order.id}`,
        amount: +order.totalAmount,
        debit: +order.totalAmount, // Order increases due amount
        credit: 0,
        status: order.status,
      })),
      ...payments.map((p: any) => ({
        id: p.id,
        date: p.createdAt,
        type: 'PAYMENT',
        reference: p.transactionId || 'Payment',
        amount: +p.amount,
        debit: 0,
        credit: +p.amount, // Payment decreases due amount
        method: p.method,
        note: p.gatewayResponse?.note || '',
      })),
    ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    // Calculate running balance and summary
    let runningBalance = 0
    const ledger = transactions.map((tx) => {
      runningBalance += tx.debit - tx.credit
      return { ...tx, balance: runningBalance }
    })

    const totalOrders = orders.reduce((sum, order) => sum + (+order.totalAmount || 0), 0)
    const totalPaid = payments
      .filter((p: any) => p.status === 'SUCCESS')
      .reduce((sum, p) => sum + (+p.amount || 0), 0)

    return {
        customer: {
          id: customer.id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
        },
        summary: {
          totalOrders,
          totalPaid,
          balance: runningBalance,
        },
        ledger: ledger.reverse(), // Newest first for UI
    }
  }

  async getCashFlow(tenantId: string, @Query('period') period: string = 'last30days') {
    const [customerPayments, expenses, supplierPayments] = await Promise.all([
      this.paymentService.findAllPaymentsRaw(tenantId),
      this.expenseService.findAllExpenses(tenantId),
      this.purchaseOrderService.findAllPaymentsByPurchaseOrder(tenantId),
    ])

    const inflow = customerPayments.filter((p: any) => p.status === 'completed')
    const outflowExpenses = expenses
    const outflowSuppliers = supplierPayments

    // Combine all movements
    const movements: any[] = [
      ...inflow.map((p) => ({
        date: p.createdAt,
        amount: +p.amount,
        type: 'INFLOW',
        category: 'Sales',
        reference: p.transactionId,
      })),
      ...outflowExpenses.map((e) => ({
        date: e.expenseDate,
        amount: +e.amount,
        type: 'OUTFLOW',
        category: e.category,
        reference: e.description,
      })),
      ...outflowSuppliers.map((sp) => ({
        date: sp.paymentDate,
        amount: +sp.amount,
        type: 'OUTFLOW',
        category: 'Supplier Payment',
        reference: sp.transactionId || 'Vendor Payout',
      })),
    ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    // Group by day for the last 30 days
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - i)
      return d.toISOString().split('T')[0]
    }).reverse()

    const chartData = last30Days.map((date) => {
      const dayMovements = movements.filter((m) => {
        const d = m.date instanceof Date ? m.date.toISOString() : m.date
        return typeof d === 'string' && d.startsWith(date)
      })

      const dayInflow = dayMovements
        .filter((m) => m.type === 'INFLOW')
        .reduce((sum, m) => sum + m.amount, 0)
      const dayOutflow = dayMovements
        .filter((m) => m.type === 'OUTFLOW')
        .reduce((sum, m) => sum + m.amount, 0)

      return {
        date,
        displayDate: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        inflow: dayInflow,
        outflow: dayOutflow,
        net: dayInflow - dayOutflow,
      }
    })

    const totalInflow = inflow.reduce((sum, p) => sum + (+p.amount || 0), 0)
    const totalOutflow =
      outflowExpenses.reduce((sum, e) => sum + (+e.amount || 0), 0) +
      outflowSuppliers.reduce((sum, sp) => sum + (+sp.amount || 0), 0)

    return {
        summary: {
          totalInflow,
          totalOutflow,
          netCashFlow: totalInflow - totalOutflow,
        },
        chartData,
        recentMovements: movements.reverse().slice(0, 10),
    }
  }

  async exportReport(
    tenantId: string,
    type: string,
    startDateStr?: string,
    endDateStr?: string,
    supplierId?: string,
    customerId?: string,
  ) {
    const startDate = startDateStr ? new Date(startDateStr) : new Date(0)
    const endDate = endDateStr ? new Date(endDateStr) : new Date()
    endDate.setHours(23, 59, 59, 999)

    let csvContent = ''
    let filename = `report-${type}-${new Date().toISOString().split('T')[0]}.csv`

    switch (type) {
      case 'sales': {
        const payments = await this.paymentService.findAllPaymentsRaw(tenantId)
        const filtered = payments.filter(
          (p: any) =>
            p.status === 'completed' &&
            new Date(p.createdAt) >= startDate &&
            new Date(p.createdAt) <= endDate,
        )
        csvContent = 'Date,Transaction ID,Order ID,Amount,Currency,Method\n'
        filtered.forEach((p: any) => {
          csvContent += `${p.createdAt},${p.transactionId},${p.orderId},${p.amount},${p.currency},${p.method}\n`
        })
        break
      }
      case 'expenses': {
        const expenses = await this.expenseService.findAllExpenses(tenantId)
        const filtered = expenses.filter(
          (e: any) => new Date(e.expenseDate) >= startDate && new Date(e.expenseDate) <= endDate,
        )
        csvContent = 'Date,Category,Description,Amount,Tenant ID\n'
        filtered.forEach((e: any) => {
          csvContent += `${e.expenseDate},${e.category},"${e.description || ''}",${e.amount},${e.tenantId}\n`
        })
        break
      }
      case 'supplier-ledger': {
        if (!supplierId) throw new BadRequestException('Supplier ID required')
        const data = await this.getSupplierLedger(tenantId, supplierId)
        csvContent = `Supplier: ${data.supplier.name}\nDate,Type,Reference,Debit,Credit,Balance,Status,Note\n`
        data.ledger.forEach((tx: any) => {
          csvContent += `${tx.date},${tx.type},${tx.reference},${tx.debit},${tx.credit},${tx.balance},${tx.status || ''},"${tx.note || ''}"\n`
        })
        break
      }
      case 'customer-ledger': {
        if (!customerId) throw new BadRequestException('Customer ID required')
        const data = await this.getCustomerLedger(tenantId, customerId)
        csvContent = `Customer: ${data.customer.name}\nDate,Type,Reference,Debit,Credit,Balance,Status,Note\n`
        data.ledger.forEach((tx: any) => {
          csvContent += `${tx.date},${tx.type},${tx.reference},${tx.debit},${tx.credit},${tx.balance},${tx.status || ''},"${tx.note || ''}"\n`
        })
        break
      }
      case 'cash-flow': {
        const data = await this.getCashFlow(tenantId)
        csvContent = 'Date,Type,Category,Reference,Amount\n'
        data.recentMovements.forEach((m: any) => {
          csvContent += `${m.date},${m.type},${m.category},"${m.reference || ''}",${m.amount}\n`
        })
        break
      }
      default:
        throw new BadRequestException('Invalid export type')
    }

    return {
        csv: csvContent,
        filename,
    }
  }

  async getFinanceSummary(tenantId: string) {
    const [customerPayments, expenses, supplierPayments, purchaseOrders] = await Promise.all([
      this.paymentService.findAllPaymentsRaw(tenantId),
      this.expenseService.findAllExpenses(tenantId),
      this.purchaseOrderService.findAllPaymentsByPurchaseOrder(tenantId),
      this.purchaseOrderService.findAllPurchaseOrders(tenantId),
    ])

    const inflow = customerPayments.filter((p: any) => p.status === 'completed')
    const totalRevenue = inflow.reduce((sum, p) => sum + (+p.amount || 0), 0)
    const totalOpExpenses = expenses.reduce((sum, e) => sum + (+e.amount || 0), 0)
    const totalSupplierPayments = supplierPayments.reduce((sum, sp) => sum + (+sp.amount || 0), 0)
    const totalExpenses = totalOpExpenses + totalSupplierPayments
    const totalAmountDue = purchaseOrders.reduce(
      (sum: number, po: any) => sum + (po.totalAmount - (po.paidAmount || 0)),
      0,
    )

    // Monthly Trend (Last 6 Months)
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date()
      d.setMonth(d.getMonth() - i)
      return d.toISOString().substring(0, 7) // YYYY-MM
    }).reverse()

    const chartData = months.map((month) => {
      const monthInflow = inflow
        .filter((p) => p.createdAt.toString().startsWith(month))
        .reduce((sum, p) => sum + (+p.amount || 0), 0)
      const monthOpEx = expenses
        .filter((e) => e.expenseDate.toString().startsWith(month))
        .reduce((sum, e) => sum + (+e.amount || 0), 0)
      const monthSuppEx = supplierPayments
        .filter((sp) => sp.paymentDate.toString().startsWith(month))
        .reduce((sum, sp) => sum + (+sp.amount || 0), 0)

      return {
        name: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short' }),
        revenue: monthInflow,
        expense: monthOpEx + monthSuppEx,
        profit: monthInflow - (monthOpEx + monthSuppEx),
      }
    })

    // Categorized Expenses
    const categories: Record<string, number> = {}
    expenses.forEach((e) => {
      categories[e.category] = (categories[e.category] || 0) + (+e.amount || 0)
    })
    categories['Supplier Payouts'] = totalSupplierPayments

    return {
        kpis: {
          totalRevenue,
          totalExpenses,
          netProfit: totalRevenue - totalExpenses,
          margin: totalRevenue > 0 ? ((totalRevenue - totalExpenses) / totalRevenue) * 100 : 0,
          totalAmountDue,
        },
        chartData,
        expenseBreakdown: Object.entries(categories)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value),
        supplierStats: {
          totalSuppliers: (await this.supplierService.findAllSuppliers(tenantId)).length,
          totalPurchaseOrders: purchaseOrders.length,
          recentPurchaseOrders: purchaseOrders.slice(0, 5),
        },
    }
  }
}
