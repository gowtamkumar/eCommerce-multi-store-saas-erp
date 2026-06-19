import { RequestContextDto } from '@/common/dto/request-context.dto'
import { OrderStatus } from '@/common/enums/order-status.enum'
import { FilterOrderDto } from '@/modules/admin/sales/order/dto/filter-order.dto'
import { OrderService } from '@/modules/admin/sales/order/services/order.service'
import { ProductRepository } from '@/modules/admin/catalog/product/repositories/product.repository'
import { ReportService } from '@/modules/admin/operations/finance/report/report.service'
import { buildDashboardKpiSnapshot } from '../utils/dashboard-kpi-context.util'
import {
  AdminCopilotToolName,
  isAdminCopilotToolName,
} from '../copilot/admin-copilot-tool.registry'
import { Injectable, Logger } from '@nestjs/common'
import { ModuleRef } from '@nestjs/core'

@Injectable()
export class AdminCopilotToolService {
  private readonly logger = new Logger(AdminCopilotToolService.name)

  constructor(
    private readonly moduleRef: ModuleRef,
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(
    tool: string,
    args: Record<string, unknown>,
    ctx: RequestContextDto,
  ): Promise<unknown> {
    if (!isAdminCopilotToolName(tool)) {
      return { error: `Unknown tool: ${tool}` }
    }

    try {
      switch (tool) {
        case 'listOrders':
          return await this.listOrders(args, ctx)
        case 'getOrder':
          return await this.getOrder(args, ctx)
        case 'getStockLevel':
          return await this.getStockLevel(args, ctx)
        case 'listLowStock':
          return await this.listLowStock(args, ctx)
        case 'getDashboardSummary':
          return await this.getDashboardSummary(args, ctx)
        default:
          return { error: `Tool not implemented: ${tool}` }
      }
    } catch (error) {
      this.logger.warn(`Admin copilot tool ${tool} failed`, error)
      return {
        error: error instanceof Error ? error.message : 'Tool execution failed',
      }
    }
  }

  private getOrderService(): OrderService | null {
    return this.moduleRef.get(OrderService, { strict: false })
  }

  private getReportService(): ReportService | null {
    return this.moduleRef.get(ReportService, { strict: false })
  }

  private clampLimit(value: unknown, fallback: number, max: number): number {
    const parsed = Number(value)
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return fallback
    }
    return Math.min(Math.floor(parsed), max)
  }

  private async listOrders(args: Record<string, unknown>, ctx: RequestContextDto) {
    const orderService = this.getOrderService()
    if (!orderService) {
      return { error: 'Order service unavailable' }
    }

    const limit = this.clampLimit(args.limit, 5, 10)
    const filter: FilterOrderDto = {
      page: 1,
      limit,
      search: args.search ? String(args.search) : undefined,
    }

    if (args.status && Object.values(OrderStatus).includes(args.status as OrderStatus)) {
      filter.status = args.status as OrderStatus
    }

    const { orders, total } = await orderService.findAllOrders(filter, ctx)

    return {
      total,
      orders: orders.map((order) => ({
        id: order.id,
        status: order.status,
        paymentStatus: order.paymentStatus,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        totalAmount: order.totalAmount,
        createdAt: order.createdAt,
        itemCount: order.items?.length ?? 0,
      })),
    }
  }

  private async getOrder(args: Record<string, unknown>, ctx: RequestContextDto) {
    const orderService = this.getOrderService()
    if (!orderService) {
      return { error: 'Order service unavailable' }
    }

    const orderId = String(args.orderId ?? '').trim()
    if (!orderId) {
      return { error: 'orderId is required' }
    }

    const order = await orderService.findOneOrder(orderId, ctx)

    return {
      id: order.id,
      status: order.status,
      paymentStatus: order.paymentStatus,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt,
      items: (order.items ?? []).map((item) => ({
        productName: item.snapshot?.name || item.product?.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalAmount: item.totalAmount,
      })),
    }
  }

  private async getStockLevel(args: Record<string, unknown>, ctx: RequestContextDto) {
    const tenantId = ctx.tenantId

    if (args.productId) {
      const product = await this.productRepository.findProductById(String(args.productId), tenantId)
      if (!product) {
        return { error: 'Product not found' }
      }
      return this.mapProductStock(product)
    }

    const search = String(args.sku || args.query || '').trim()
    if (!search) {
      return { error: 'Provide productId, sku, or query' }
    }

    const [products] = await this.productRepository.findAllWithFilters(
      { q: search, page: 1, limit: 3 },
      tenantId,
    )

    if (!products.length) {
      return { error: 'No matching product found', query: search }
    }

    return {
      matches: products.map((product) => this.mapProductStock(product)),
    }
  }

  private mapProductStock(product: {
    id: string
    name: string
    sku?: string
    stock?: number
    lowStockThreshold?: number
    status?: string
    variants?: Array<{ id: string; sku?: string; stock?: number; lowStockThreshold?: number }>
  }) {
    return {
      productId: product.id,
      name: product.name,
      sku: product.sku,
      stock: product.stock,
      lowStockThreshold: product.lowStockThreshold,
      status: product.status,
      variants: (product.variants ?? []).map((variant) => ({
        id: variant.id,
        sku: variant.sku,
        stock: variant.stock,
        lowStockThreshold: variant.lowStockThreshold,
      })),
    }
  }

  private async listLowStock(args: Record<string, unknown>, ctx: RequestContextDto) {
    const reportService = this.getReportService()
    if (!reportService) {
      return { error: 'Report service unavailable' }
    }

    const limit = this.clampLimit(args.limit, 8, 15)
    const stats = await reportService.getDashboardReport(ctx, 'month')
    const products = (stats.lowStockProducts ?? []).slice(0, limit)

    return {
      count: products.length,
      products: products.map((p: { id?: string; name?: string; stock?: number; threshold?: number }) => ({
        productId: p.id,
        name: p.name,
        stock: p.stock,
        lowStockThreshold: p.threshold,
      })),
    }
  }

  private async getDashboardSummary(args: Record<string, unknown>, ctx: RequestContextDto) {
    const reportService = this.getReportService()
    if (!reportService) {
      return { error: 'Report service unavailable' }
    }

    const period = ['day', 'week', 'month'].includes(String(args.period))
      ? String(args.period)
      : 'month'

    const stats = await reportService.getDashboardReport(ctx, period)
    return buildDashboardKpiSnapshot(stats, period)
  }
}
