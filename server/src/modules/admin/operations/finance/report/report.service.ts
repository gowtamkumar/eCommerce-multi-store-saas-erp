import { CacheService } from '@/modules/admin/operations/infra/cache/cache.service'
import { BadRequestException, Injectable, Logger } from '@nestjs/common'

import { RequestContextDto } from '@/common/dto/request-context.dto'
import { ProductService } from '@/modules/admin/catalog/product/services/product.service'
import { PageService } from '@/modules/admin/content/page/page.service'
import { UserService } from '@/modules/admin/core/user/services/user.service'
import { ExpenseService } from '@/modules/admin/operations/finance/expense/expense.service'
import { PurchaseOrderService } from '@/modules/admin/operations/finance/purchase/services/purchase-order.service'
import { SupplierService } from '@/modules/admin/operations/finance/supplier/supplier.service'
import { OrderService } from '@/modules/admin/sales/order/services/order.service'
import { PaymentService } from '@/modules/admin/sales/payment/services/payment.service'
import { csvRow, isSuccessfulPaymentStatus } from './report-export.util'
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

  async getAnalytics(ctx: RequestContextDto) {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called getAnalytics.`)
    const tenantId = ctx.tenantId
    const cacheKey = `analytics` // CacheService handled tenantId prefixing
    return this.cacheService.rememberCache(
      cacheKey,
      async () => {
        const counts = await this.reportRepo.getGlobalCounts(tenantId)
        return {
          counts: {
            users: parseInt(counts.users, 10),
            products: parseInt(counts.products, 10),
            orders: parseInt(counts.orders, 10),
            pages: parseInt(counts.pages, 10),
          },
          topPages: [], // Removed page tracking feature, return empty array for backwards compatibility
        }
      },
      600, // 10 mins cache
      tenantId,
    )
  }

  async getDashboardReport(ctx: RequestContextDto, period: string = 'month') {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called getDashboardReport.`)
    const tenantId = ctx.tenantId
    const cacheKey = `dashboard:${period}`
    return this.cacheService.rememberCache(
      cacheKey,
      async () => {
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

        // Equal-length trailing window used to compute period-over-period growth.
        const windowMs = Math.max(now.getTime() - startDate.getTime(), 1)
        const prevStartDate = new Date(startDate.getTime() - windowMs)

        // Fetch optimized stats from SQL (parallelized)
        const [
          stats,
          chartData,
          monthlySales,
          lowStockProductsRaw,
          products,
          recentPurchaseOrders,
          recentOrders,
          prevPeriodSales,
          periodCogs,
          periodExpenses,
          topProductsRaw,
          topCustomersRaw,
        ] = await Promise.all([
          this.reportRepo.getDashboardStats(tenantId, startDate),
          this.reportRepo.getSalesChartData(tenantId, period),
          this.reportRepo.getMonthlyGrowth(tenantId),
          this.reportRepo.getLowStockProducts(tenantId, 10),
          this.productService.findAllProducts(ctx),
          this.reportRepo.getRecentPurchaseOrders(tenantId, 5),
          this.reportRepo.getRecentOrders(tenantId, 5),
          this.reportRepo.getSalesSumInRange(tenantId, prevStartDate, startDate),
          this.reportRepo.getCogsInRange(tenantId, startDate, now),
          this.expenseService.findAllExpensesRaw(ctx, startDate, now),
          this.reportRepo.getTopProducts(tenantId, startDate, 5),
          this.reportRepo.getTopCustomers(tenantId, startDate, 5),
        ])

        const recentProducts = products.products || []

        // Month-over-month growth (kept for backward compatibility)
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

        // Period-over-period growth aligned with the selected period.
        const periodSalesValue = parseFloat(stats.periodSales)
        let periodGrowth: number | null = null
        if (prevPeriodSales > 0) {
          periodGrowth = ((periodSalesValue - prevPeriodSales) / prevPeriodSales) * 100
        } else if (periodSalesValue > 0) {
          periodGrowth = 100
        }

        // Average order value for the selected period.
        const periodOrdersValue = parseInt(stats.periodOrders, 10)
        const avgOrderValue = periodOrdersValue > 0 ? periodSalesValue / periodOrdersValue : 0
        const operatingExpenses = (periodExpenses || []).reduce(
          (sum: number, expense: any) => sum + (+expense.amount || 0),
          0,
        )
        const grossProfit = periodSalesValue - periodCogs
        const netProfit = grossProfit - operatingExpenses
        const profitMargin = periodSalesValue > 0 ? (netProfit / periodSalesValue) * 100 : 0

        // Format chart data for UI (label granularity depends on period).
        const salesData = chartData.map((d: any) => {
          const date = new Date(d.date)
          const name =
            d.granularity === 'hour'
              ? date.toLocaleTimeString('en-US', { hour: 'numeric' })
              : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          return { name, sales: parseFloat(d.sales) }
        })

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
        const topProducts = topProductsRaw.map((p: any) => ({
          id: p.id,
          name: p.name,
          image: p.images?.[0],
          quantity: parseInt(p.quantity || '0', 10),
          revenue: parseFloat(p.revenue || '0'),
        }))
        const topCustomers = topCustomersRaw.map((c: any) => ({
          id: c.id,
          name: c.name || 'Walk-in Customer',
          email: c.email || null,
          orderCount: parseInt(c.orderCount || '0', 10),
          revenue: parseFloat(c.revenue || '0'),
        }))

        return {
          totalSales: parseFloat(stats.totalSales),
          periodSales: periodSalesValue,
          periodOrders: periodOrdersValue,
          activeOrders: parseInt(stats.activeOrders, 10),
          totalProducts: parseInt(stats.totalProducts, 10),
          totalPages: parseInt(stats.totalPages, 10),
          salesData,
          monthlyGrowth,
          periodGrowth,
          avgOrderValue,
          recentProducts,
          recentOrders,
          topProducts,
          topCustomers,
          lowStockProducts,
          financeSnapshot: {
            revenue: periodSalesValue,
            cogs: periodCogs,
            grossProfit,
            operatingExpenses,
            netProfit,
            profitMargin,
          },
          supplierStats: {
            totalSuppliers: parseInt(stats.totalSuppliers, 10),
            totalPurchaseOrders: parseInt(stats.totalPurchaseOrders, 10),
            totalAmountDue: parseFloat(stats.totalAmountDue),
            recentPurchaseOrders: recentPurchaseOrders.map((po: any) => ({
              ...po,
              supplier: { name: po.supplierName }, // For frontend compatibility
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
          fulfillment: {
            pending: parseInt(stats.pendingFulfillment || '0', 10),
            picking: parseInt(stats.pickingFulfillment || '0', 10),
          },
        }
      },
      600, // 10 mins cache
      tenantId,
    )
  }

  async getProfitLossReport(ctx: RequestContextDto, startDateStr?: string, endDateStr?: string) {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called getProfitLossReport.`)
    const tenantId = ctx.tenantId
    const cacheKey = `pnl:${startDateStr || 'none'}:${endDateStr || 'none'}`
    return this.cacheService.rememberCache(
      cacheKey,
      async () => {
        let startDate = startDateStr
          ? new Date(startDateStr)
          : new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        let endDate = endDateStr ? new Date(endDateStr) : new Date()

        // Set end date to end of day to include full day
        endDate.setHours(23, 59, 59, 999)

        const [payments, expenses, purchaseOrders, orderCount, cogs] = (await Promise.all([
          this.paymentService.findAllPaymentsRaw(ctx),
          this.expenseService.findAllExpensesRaw(ctx),
          this.purchaseOrderService.findAllPurchaseOrdersRaw(ctx),
          this.reportRepo.getOrderCountInRange(tenantId, startDate, endDate),
          this.reportRepo.getCogsInRange(tenantId, startDate, endDate),
        ])) as [any, any, any, number, number]

        const paymentsData = payments || []
        const expensesData = expenses || []
        const purchaseOrdersData = purchaseOrders || []

        // Filter data by date range
        const filterByDate = (item: any, dateField: string = 'createdAt') => {
          const itemDate = new Date(item[dateField])
          return itemDate >= startDate && itemDate <= endDate
        }

        const filteredPayments = paymentsData.filter(
          (p: any) => isSuccessfulPaymentStatus(p.status) && filterByDate(p),
        )
        const filteredExpenses = expensesData.filter((e: any) => filterByDate(e, 'expenseDate'))
        const filteredPurchaseOrders = purchaseOrdersData.filter((po: any) => filterByDate(po))

        // Calculate Sales Revenue
        // Using Payment amounts (completed transactions) is standard for cash-based accounting.
        const revenue = filteredPayments.reduce((sum: number, p: any) => sum + (+p.amount || 0), 0)

        // Calculate Gross Profit based on true COGS from ledger
        const grossProfit = revenue - cogs

        // Calculate Operating Expenses
        const categorizedExpenses = filteredExpenses.reduce(
          (acc: Record<string, number>, exp: any) => {
            const cat = exp.category
            acc[cat] = (acc[cat] || 0) + Number(exp.amount || 0)
            return acc
          },
          {},
        )

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
            orderCount,
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
      },
      600, // 10 mins cache
      tenantId,
    )
  }

  async getSupplierLedger(ctx: RequestContextDto, supplierId: string) {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called getSupplierLedger.`)
    const tenantId = ctx.tenantId
    const cacheKey = `ledger:supplier:${supplierId}`
    return this.cacheService.rememberCache(
      cacheKey,
      async () => {
        const [supplier, pos, payments] = await Promise.all([
          this.supplierService.findOneSupplier(supplierId, ctx),
          this.purchaseOrderService.findAllBySupplier(supplierId, ctx),
          this.purchaseOrderService.findAllPaymentsBySupplier(supplierId, ctx),
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
        ].sort((a, b) => {
          const dateA = a.date ? new Date(a.date).getTime() : 0
          const dateB = b.date ? new Date(b.date).getTime() : 0
          return dateA - dateB
        })

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
      },
      600, // 10 mins cache
      tenantId,
    )
  }

  async getCustomerLedger(ctx: RequestContextDto, customerId: string) {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called getCustomerLedger.`)
    const tenantId = ctx.tenantId
    const cacheKey = `ledger:customer:${customerId}`
    return this.cacheService.rememberCache(
      cacheKey,
      async () => {
        const [customer, ordersResult, payments] = await Promise.all([
          this.userService.findOneUser(customerId, ctx),
          this.orderService.findByUserId(customerId, ctx),
          this.paymentService.findAllPaymentsByCustomer(customerId, ctx),
        ])

        const orders = ordersResult?.orders || []

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
        ].sort((a, b) => {
          const dateA = a.date ? new Date(a.date).getTime() : 0
          const dateB = b.date ? new Date(b.date).getTime() : 0
          return dateA - dateB
        })

        // Calculate running balance and summary
        let runningBalance = 0
        const ledger = transactions.map((tx) => {
          runningBalance += tx.debit - tx.credit
          return { ...tx, balance: runningBalance }
        })

        const totalOrders = orders.reduce((sum, order) => sum + (+order.totalAmount || 0), 0)
        const totalPaid = payments
          .filter((p: any) => isSuccessfulPaymentStatus(p.status))
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
      },
      600, // 10 mins cache
      tenantId,
    )
  }

  async getCashFlow(ctx: RequestContextDto, period: string = 'last30days') {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called getCashFlow.`)
    const tenantId = ctx.tenantId
    const cacheKey = `cashflow:${period}`
    return this.cacheService.rememberCache(
      cacheKey,
      async () => {
        const [customerPayments, expenses, supplierPayments] = await Promise.all([
          this.paymentService.findAllPaymentsRaw(ctx),
          this.expenseService.findAllExpensesRaw(ctx),
          this.purchaseOrderService.findAllPaymentsByPurchaseOrder(ctx),
        ])

        const inflow = customerPayments.filter((p: any) => isSuccessfulPaymentStatus(p.status))

        // Combine all movements into a single array
        const movements: any[] = [
          ...inflow.map((p) => ({
            date: p.createdAt,
            amount: +p.amount,
            type: 'INFLOW',
            category: 'Sales',
            reference: p.transactionId,
          })),
          ...expenses.map((e) => ({
            date: e.expenseDate,
            amount: +e.amount,
            type: 'OUTFLOW',
            category: e.category,
            reference: e.description,
          })),
          ...supplierPayments.map((sp) => ({
            date: sp.paymentDate,
            amount: +sp.amount,
            type: 'OUTFLOW',
            category: 'Supplier Payment',
            reference: sp.transactionId || 'Vendor Payout',
          })),
        ].sort((a, b) => {
          const dateA = a.date ? new Date(a.date).getTime() : 0
          const dateB = b.date ? new Date(b.date).getTime() : 0
          return dateA - dateB
        })

        // Optimization: Single-pass grouping by date (O(N) instead of O(Days * N))
        const dailyAggregates = new Map<string, { inflow: number; outflow: number }>()

        movements.forEach((m) => {
          if (!m.date) return
          const mDate = m.date instanceof Date ? m.date : new Date(m.date)
          if (isNaN(mDate.getTime())) return
          const dateStr = mDate.toISOString().split('T')[0]

          if (!dailyAggregates.has(dateStr)) {
            dailyAggregates.set(dateStr, { inflow: 0, outflow: 0 })
          }

          const aggregate = dailyAggregates.get(dateStr)!
          if (m.type === 'INFLOW') {
            aggregate.inflow += m.amount
          } else {
            aggregate.outflow += m.amount
          }
        })

        // Generate the last 30 days time series
        const last30Days = Array.from({ length: 30 }, (_, i) => {
          const d = new Date()
          d.setDate(d.getDate() - i)
          return d.toISOString().split('T')[0]
        }).reverse()

        const chartData = last30Days.map((date) => {
          const agg = dailyAggregates.get(date) || { inflow: 0, outflow: 0 }
          return {
            date,
            displayDate: new Date(date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            }),
            inflow: agg.inflow,
            outflow: agg.outflow,
            net: agg.inflow - agg.outflow,
          }
        })

        const totalInflow = inflow.reduce((sum, p) => sum + (+p.amount || 0), 0)
        const totalOutflow =
          expenses.reduce((sum, e) => sum + (+e.amount || 0), 0) +
          supplierPayments.reduce((sum, sp) => sum + (+sp.amount || 0), 0)

        return {
          summary: {
            totalInflow,
            totalOutflow,
            netCashFlow: totalInflow - totalOutflow,
          },
          chartData,
          recentMovements: movements.reverse().slice(0, 10),
        }
      },
      600, // 10 mins cache
      tenantId,
    )
  }

  async exportReport(
    ctx: RequestContextDto,
    type: string,
    startDateStr?: string,
    endDateStr?: string,
    supplierId?: string,
    customerId?: string,
  ) {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called exportReport.`)
    const tenantId = ctx.tenantId
    const startDate = startDateStr ? new Date(startDateStr) : new Date(0)
    const endDate = endDateStr ? new Date(endDateStr) : new Date()
    endDate.setHours(23, 59, 59, 999)

    let csvContent = ''
    let filename = `report-${type}-${new Date().toISOString().split('T')[0]}.csv`

    switch (type) {
      case 'sales': {
        const filtered = await this.paymentService.findAllPaymentsRaw(ctx, startDate, endDate)
        csvContent = csvRow(['Date', 'Transaction ID', 'Order ID', 'Amount', 'Currency', 'Method'])
        filtered.forEach((p: any) => {
          csvContent += csvRow([
            p.createdAt,
            p.transactionId,
            p.orderId,
            p.amount,
            p.currency,
            p.method,
          ])
        })
        break
      }
      case 'expenses': {
        const filtered = await this.expenseService.findAllExpensesRaw(ctx, startDate, endDate)
        csvContent = csvRow(['Date', 'Category', 'Description', 'Amount', 'Tenant ID'])
        filtered.forEach((e: any) => {
          csvContent += csvRow([
            e.expenseDate,
            e.category,
            e.description || '',
            e.amount,
            e.tenantId,
          ])
        })
        break
      }
      case 'supplier-ledger': {
        if (!supplierId) throw new BadRequestException('Supplier ID required')
        const data = await this.getSupplierLedger(ctx, supplierId)
        csvContent = csvRow([`Supplier: ${data.supplier.name}`])
        csvContent += csvRow([
          'Date',
          'Type',
          'Reference',
          'Debit',
          'Credit',
          'Balance',
          'Status',
          'Note',
        ])
        data.ledger.forEach((tx: any) => {
          csvContent += csvRow([
            tx.date,
            tx.type,
            tx.reference,
            tx.debit,
            tx.credit,
            tx.balance,
            tx.status || '',
            tx.note || '',
          ])
        })
        break
      }
      case 'customer-ledger': {
        if (!customerId) throw new BadRequestException('Customer ID required')
        const data = await this.getCustomerLedger(ctx, customerId)
        csvContent = csvRow([`Customer: ${data.customer.name}`])
        csvContent += csvRow([
          'Date',
          'Type',
          'Reference',
          'Debit',
          'Credit',
          'Balance',
          'Status',
          'Note',
        ])
        data.ledger.forEach((tx: any) => {
          csvContent += csvRow([
            tx.date,
            tx.type,
            tx.reference,
            tx.debit,
            tx.credit,
            tx.balance,
            tx.status || '',
            tx.note || '',
          ])
        })
        break
      }
      case 'cash-flow': {
        const [customerPayments, expenses, supplierPayments] = await Promise.all([
          this.paymentService.findAllPaymentsRaw(ctx, startDate, endDate),
          this.expenseService.findAllExpensesRaw(ctx, startDate, endDate),
          this.purchaseOrderService.findAllPaymentsByPurchaseOrder(ctx),
        ])

        const inflow = customerPayments.filter((p: any) => isSuccessfulPaymentStatus(p.status))

        const filterByDate = (dateVal: any) => {
          if (!dateVal) return false
          const d = new Date(dateVal)
          return d >= startDate && d <= endDate
        }

        const movements: any[] = [
          ...inflow.map((p) => ({
            date: p.createdAt,
            amount: +p.amount,
            type: 'INFLOW',
            category: 'Sales',
            reference: p.transactionId,
          })),
          ...expenses.map((e) => ({
            date: e.expenseDate,
            amount: +e.amount,
            type: 'OUTFLOW',
            category: e.category,
            reference: e.description,
          })),
          ...supplierPayments
            .filter((sp: any) => filterByDate(sp.paymentDate))
            .map((sp) => ({
              date: sp.paymentDate,
              amount: +sp.amount,
              type: 'OUTFLOW',
              category: 'Supplier Payment',
              reference: sp.transactionId || 'Vendor Payout',
            })),
        ].sort((a, b) => {
          const dateA = a.date ? new Date(a.date).getTime() : 0
          const dateB = b.date ? new Date(b.date).getTime() : 0
          return dateB - dateA
        })

        csvContent = csvRow(['Date', 'Type', 'Category', 'Reference', 'Amount'])
        movements.forEach((m: any) => {
          csvContent += csvRow([m.date, m.type, m.category, m.reference || '', m.amount])
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

  async getFinanceSummary(ctx: RequestContextDto, startDateStr?: string, endDateStr?: string) {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called getFinanceSummary.`)
    const tenantId = ctx.tenantId
    const cacheKey = `finance:summary:${startDateStr || 'none'}:${endDateStr || 'none'}`
    return this.cacheService.rememberCache(
      cacheKey,
      async () => {
        const [customerPayments, expenses, supplierPayments, purchaseOrders] = (await Promise.all([
          this.paymentService.findAllPaymentsRaw(ctx),
          this.expenseService.findAllExpensesRaw(ctx),
          this.purchaseOrderService.findAllPaymentsByPurchaseOrder(ctx),
          this.purchaseOrderService.findAllPurchaseOrdersRaw(ctx),
        ])) as [any, any, any, any]

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

        const filteredCustomerPayments = customerPayments || []
        const filteredExpensesData = expenses || []
        const filteredSupplierPaymentsData = supplierPayments || []
        const filteredPurchaseOrders = purchaseOrders || []

        const inflow = filteredCustomerPayments.filter(
          (p: any) => isSuccessfulPaymentStatus(p.status) && filterByDate(p),
        )
        const totalRevenue = inflow.reduce((sum, p) => sum + (+p.amount || 0), 0)

        const filteredExpenses = filteredExpensesData.filter((e: any) =>
          filterByDate(e, 'expenseDate'),
        )
        const totalOpExpenses = filteredExpenses.reduce((sum, e) => sum + (+e.amount || 0), 0)

        const filteredSupplierPayments = filteredSupplierPaymentsData.filter((sp: any) =>
          filterByDate(sp, 'paymentDate'),
        )
        const totalSupplierPayments = filteredSupplierPayments.reduce(
          (sum, sp) => sum + (+sp.amount || 0),
          0,
        )
        const totalExpenses = totalOpExpenses + totalSupplierPayments
        const totalAmountDue = filteredPurchaseOrders
          .filter((po: any) => filterByDate(po))
          .reduce((sum: number, po: any) => sum + (po.totalAmount - (po.paidAmount || 0)), 0)

        // Monthly Trend (Last 6 Months)
        const months = Array.from({ length: 6 }, (_, i) => {
          const d = new Date()
          d.setDate(1) // Avoid month overflow bugs (e.g., Feb 30th)
          d.setMonth(d.getMonth() - i)
          return d.toISOString().substring(0, 7) // YYYY-MM
        }).reverse()

        const getYearMonthString = (dateInput: any) => {
          if (!dateInput) return ''
          const d = dateInput instanceof Date ? dateInput : new Date(dateInput)
          if (isNaN(d.getTime())) return ''
          return d.toISOString().substring(0, 7) // Returns YYYY-MM
        }

        const chartData = months.map((month) => {
          const monthInflow = customerPayments
            .filter(
              (p: any) =>
                isSuccessfulPaymentStatus(p.status) && getYearMonthString(p.createdAt) === month,
            )
            .reduce((sum, p) => sum + (+p.amount || 0), 0)
          const monthOpEx = expenses
            .filter((e: any) => getYearMonthString(e.expenseDate) === month)
            .reduce((sum, e) => sum + (+e.amount || 0), 0)
          const monthSuppEx = supplierPayments
            .filter((sp) => getYearMonthString(sp.paymentDate) === month)
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
        filteredExpenses.forEach((e: any) => {
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
            totalSuppliers: (await this.supplierService.findAllSuppliersRaw(ctx)).length,
            totalPurchaseOrders: purchaseOrders.length,
            recentPurchaseOrders: purchaseOrders.slice(0, 5),
          },
        }
      },
      600, // 10 mins cache
      tenantId,
    )
  }
}
