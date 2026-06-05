import { Injectable, Logger } from '@nestjs/common'
import { DataSource, Between, MoreThanOrEqual } from 'typeorm'
import { TenantService } from '@/modules/system/tenant/tenant.service'
import { UserService } from '@/modules/admin/core/user/services/user.service'
import { ProductService } from '@/modules/admin/catalog/product/services/product.service'
import { OrderService } from '@/modules/admin/sales/order/services/order.service'
import { TrafficService } from './traffic.service'
import { ReviewEntity } from '@/modules/admin/catalog/review/entities/review.entity'
import { TenantEntity } from '@/modules/system/tenant/entities/tenant.entity'
import { UserEntity } from '@/modules/admin/core/user/entities/user.entity'
import { OrderEntity } from '@/modules/admin/sales/order/entities/order.entity'
import { SubscriptionInvoiceEntity } from '../subscription-billing/entities/subscription-invoice.entity'
import { PaymentStatus } from '@/common/enums/payment-status.enum'
import { TenantStatus } from '@/common/enums/tenant/tenant-status.enum'
import { SubscriptionStatus } from '@/common/enums/subscription/subscription-status.enum'

@Injectable()
export class SuperAdminService {
  private readonly logger = new Logger(SuperAdminService.name)

  constructor(
    private readonly userService: UserService,
    private readonly tenantService: TenantService,
    private readonly orderService: OrderService,
    private readonly trafficService: TrafficService,
    private readonly productService: ProductService,
    private readonly dataSource: DataSource,
  ) {}

  private async calculateTrendForRepository(repo: any, days: number): Promise<string | null> {
    try {
      const now = new Date()
      const currentStart = new Date()
      currentStart.setDate(now.getDate() - days)

      const prevStart = new Date()
      prevStart.setDate(now.getDate() - days * 2)

      const currentCount = await repo.count({
        where: {
          createdAt: MoreThanOrEqual(currentStart),
        },
      })

      const prevCount = await repo.count({
        where: {
          createdAt: Between(prevStart, currentStart),
        },
      })

      if (prevCount === 0) {
        return currentCount > 0 ? '+100%' : '0%'
      }

      const percent = ((currentCount - prevCount) / prevCount) * 100
      return `${percent >= 0 ? '+' : ''}${percent.toFixed(1)}%`
    } catch (e: any) {
      this.logger.error(`Error calculating trend: ${e.message}`)
      return null
    }
  }

  async getOverview(days?: number): Promise<any> {
    const daysNum = Number(days) || 7
    const [
      tenantOverview,
      userOverview,
      productOverview,
      orderOverview,
      traffic,
      totalReviews,
      tenantTrend,
      userTrend,
      orderTrend,
      reviewTrend,
    ] = await Promise.all([
      this.tenantService.tenantOverview(),
      this.userService.userOverview(),
      this.productService.productOverview(),
      this.orderService.orderOverview(),
      this.trafficService.getGlobalTrafficStats(daysNum),
      this.dataSource.getRepository(ReviewEntity).count(),
      this.calculateTrendForRepository(this.dataSource.getRepository(TenantEntity), daysNum),
      this.calculateTrendForRepository(this.dataSource.getRepository(UserEntity), daysNum),
      this.calculateTrendForRepository(this.dataSource.getRepository(OrderEntity), daysNum),
      this.calculateTrendForRepository(this.dataSource.getRepository(ReviewEntity), daysNum),
    ])

    const totalRequestsLast24h = traffic[0]?.requestCount || 0

    // Period comparison for real trend %
    const prevPeriodEnd = new Date()
    prevPeriodEnd.setDate(prevPeriodEnd.getDate() - daysNum)
    const prevPeriodStart = new Date(prevPeriodEnd)
    prevPeriodStart.setDate(prevPeriodStart.getDate() - daysNum)

    const prevTraffic = await this.trafficService.getGlobalTrafficStats(daysNum * 2)
    const prevTrafficCount = prevTraffic
      .slice(daysNum)
      .reduce((acc: number, t: any) => acc + (t.requestCount || 0), 0)
    const currTrafficCount = traffic.reduce((acc: number, t: any) => acc + (t.requestCount || 0), 0)
    const trafficTrend =
      prevTrafficCount > 0
        ? (((currTrafficCount - prevTrafficCount) / prevTrafficCount) * 100).toFixed(1)
        : null

    return {
      ...tenantOverview,
      ...userOverview,
      ...productOverview,
      ...orderOverview,
      totalReviews,
      traffic,
      totalRequestsLast24h,
      trends: {
        tenants: tenantTrend,
        users: userTrend,
        orders: orderTrend,
        reviews: reviewTrend,
        traffic: trafficTrend ? `${Number(trafficTrend) >= 0 ? '+' : ''}${trafficTrend}%` : null,
      },
    }
  }

  async getOverviewCompare(days?: number): Promise<any> {
    const daysNum = Number(days) || 7
    const [tenantTrend, userTrend, orderTrend, reviewTrend, traffic, prevTraffic] =
      await Promise.all([
        this.calculateTrendForRepository(this.dataSource.getRepository(TenantEntity), daysNum),
        this.calculateTrendForRepository(this.dataSource.getRepository(UserEntity), daysNum),
        this.calculateTrendForRepository(this.dataSource.getRepository(OrderEntity), daysNum),
        this.calculateTrendForRepository(this.dataSource.getRepository(ReviewEntity), daysNum),
        this.trafficService.getGlobalTrafficStats(daysNum),
        this.trafficService.getGlobalTrafficStats(daysNum * 2),
      ])

    const prevTrafficCount = prevTraffic
      .slice(daysNum)
      .reduce((acc: number, t: any) => acc + (t.requestCount || 0), 0)
    const currTrafficCount = traffic.reduce((acc: number, t: any) => acc + (t.requestCount || 0), 0)
    const trafficTrend =
      prevTrafficCount > 0
        ? (((currTrafficCount - prevTrafficCount) / prevTrafficCount) * 100).toFixed(1)
        : null

    return {
      tenants: tenantTrend,
      users: userTrend,
      orders: orderTrend,
      reviews: reviewTrend,
      traffic: trafficTrend ? `${Number(trafficTrend) >= 0 ? '+' : ''}${trafficTrend}%` : null,
    }
  }

  async getBillingOverview(): Promise<any> {
    const invoiceRepo = this.dataSource.getRepository(SubscriptionInvoiceEntity)

    // Total revenue (completed invoices)
    const totalRevenueResult = await invoiceRepo
      .createQueryBuilder('inv')
      .select('SUM(inv.amount)', 'total')
      .addSelect('inv.currency', 'currency')
      .where('inv.status = :status', { status: PaymentStatus.COMPLETED })
      .groupBy('inv.currency')
      .getRawMany()

    const totalRevenue = totalRevenueResult.reduce((acc, r) => acc + Number(r.total || 0), 0)

    // MRR (this month completed)
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const mrrResult = await invoiceRepo
      .createQueryBuilder('inv')
      .select('SUM(inv.amount)', 'mrr')
      .where('inv.status = :status', { status: PaymentStatus.COMPLETED })
      .andWhere('inv.billingDate >= :start', { start: monthStart })
      .getRawOne()
    const mrr = Number(mrrResult?.mrr || 0)

    // ARR = MRR * 12 (simplified)
    const arr = mrr * 12

    // Failed payments count
    const failedCount = await invoiceRepo.count({ where: { status: PaymentStatus.FAILED } })

    // Pending count
    const pendingCount = await invoiceRepo.count({ where: { status: PaymentStatus.PENDING } })

    // Total invoices
    const totalInvoices = await invoiceRepo.count()

    return {
      totalRevenue,
      mrr,
      arr,
      failedCount,
      pendingCount,
      totalInvoices,
    }
  }

  async getAllInvoices(
    page?: number,
    limit?: number,
    status?: string,
    search?: string,
  ): Promise<any> {
    const invoiceRepo = this.dataSource.getRepository(SubscriptionInvoiceEntity)
    const pageNum = Number(page) || 1
    const limitNum = Number(limit) || 20

    const qb = invoiceRepo
      .createQueryBuilder('inv')
      .leftJoinAndSelect('inv.tenant', 'tenant')
      .leftJoinAndSelect('inv.subscriptionPlan', 'plan')
      .orderBy('inv.billingDate', 'DESC')
      .skip((pageNum - 1) * limitNum)
      .take(limitNum)

    if (status && status !== 'ALL') {
      qb.andWhere('inv.status = :status', { status })
    }

    if (search) {
      qb.andWhere(
        '(tenant.storeName ILIKE :search OR inv.invoiceNumber ILIKE :search OR inv.transactionId ILIKE :search)',
        { search: `%${search}%` },
      )
    }

    const [invoices, total] = await qb.getManyAndCount()

    return {
      invoices,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    }
  }

  async getRevenueChart(months?: number): Promise<any[]> {
    const invoiceRepo = this.dataSource.getRepository(SubscriptionInvoiceEntity)
    const monthCount = Number(months) || 12

    const result = await invoiceRepo
      .createQueryBuilder('inv')
      .select("TO_CHAR(inv.billingDate, 'YYYY-MM')", 'month')
      .addSelect('SUM(inv.amount)', 'revenue')
      .addSelect('COUNT(*)', 'count')
      .where('inv.status = :status', { status: PaymentStatus.COMPLETED })
      .andWhere(`inv.billingDate >= NOW() - INTERVAL '${monthCount} months'`)
      .groupBy("TO_CHAR(inv.billingDate, 'YYYY-MM')")
      .orderBy("TO_CHAR(inv.billingDate, 'YYYY-MM')", 'ASC')
      .getRawMany()

    return result.map((r) => ({
      month: r.month,
      revenue: Number(r.revenue || 0),
      count: Number(r.count || 0),
    }))
  }

  async getChurnAnalytics(): Promise<any[]> {
    const tenants = await this.dataSource.getRepository(TenantEntity).find({
      relations: {
        activeSubscription: {
          subscriptionPlan: true,
        },
      },
    })

    const churned = tenants
      .filter((t) => {
        const subStatus = t.subscriptionStatus
        return (
          t.status === TenantStatus.SUSPENDED ||
          subStatus === SubscriptionStatus.EXPIRED ||
          subStatus === SubscriptionStatus.CANCELED ||
          subStatus === SubscriptionStatus.PAST_DUE
        )
      })
      .map((t) => ({
        id: t.id,
        storeName: t.storeName,
        subdomain: t.subdomain,
        plan: t.subscriptionPlan?.name || 'No Plan',
        status: t.status,
        subscriptionStatus: t.subscriptionStatus,
        endsAt: t.subscriptionEndsAt,
      }))

    return churned
  }

  async getInvoicesForExport(): Promise<SubscriptionInvoiceEntity[]> {
    const invoiceRepo = this.dataSource.getRepository(SubscriptionInvoiceEntity)
    return await invoiceRepo.find({
      relations: {
        tenant: true,
        subscriptionPlan: true,
      },
      order: { billingDate: 'DESC' },
      take: 5000,
    })
  }
}
