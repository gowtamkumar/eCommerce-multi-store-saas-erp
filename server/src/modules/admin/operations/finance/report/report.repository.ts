import { OrderStatus } from '@/common/enums/order-status.enum'
import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'

@Injectable()
export class ReportRepository {
  constructor(private readonly dataSource: DataSource) {}

  async getDashboardStats(tenantId: string, startDate: Date) {
    const query = `
      SELECT
        (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE tenant_id = $1 AND status = 'completed') as "totalSales",
        (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE tenant_id = $1 AND status = 'completed' AND created_at >= $2) as "periodSales",
        (SELECT COUNT(*) FROM orders WHERE tenant_id = $1 AND created_at >= $2) as "periodOrders",
        (SELECT COUNT(*) FROM orders WHERE tenant_id = $1 AND status = $3) as "activeOrders",
        (SELECT COUNT(*) FROM products WHERE tenant_id = $1) as "totalProducts",
        (SELECT COUNT(*) FROM pages WHERE tenant_id = $1) as "totalPages",
        (SELECT COUNT(*) FROM products p 
         LEFT JOIN product_variants v ON v.product_id = p.id
         WHERE p.tenant_id = $1 AND (
           (v.id IS NOT NULL AND (SELECT COALESCE(SUM(quantity), 0) FROM inventory_ledger WHERE variant_id = v.id) <= COALESCE(v.low_stock_threshold, 5)) OR
           (v.id IS NULL AND (SELECT COALESCE(SUM(quantity), 0) FROM inventory_ledger WHERE product_id = p.id AND variant_id IS NULL) <= COALESCE(p.low_stock_threshold, 5))
         )) as "lowStockCount",
        (SELECT COUNT(*) FROM users WHERE tenant_id = $1) as "totalUsers",
        (SELECT COUNT(*) FROM suppliers WHERE tenant_id = $1) as "totalSuppliers",
        (SELECT COUNT(*) FROM purchase_orders WHERE tenant_id = $1) as "totalPurchaseOrders",
        (SELECT COALESCE(SUM(total_amount - COALESCE(paid_amount, 0)), 0) FROM purchase_orders WHERE tenant_id = $1 AND status != 'cancelled') as "totalAmountDue",
        0 as "pendingFulfillment",
        0 as "pickingFulfillment"
    `
    const result = await this.dataSource.query(query, [tenantId, startDate, OrderStatus.PENDING])
    return result[0]
  }

  async getSalesChartData(tenantId: string, days: number = 7) {
    const query = `
      WITH RECURSIVE days AS (
        SELECT CURRENT_DATE - INTERVAL '1 day' * (n - 1) as day_date
        FROM generate_series(1, $2) n
      )
      SELECT 
        d.day_date as date,
        COALESCE(SUM(p.amount), 0) as sales
      FROM days d
      LEFT JOIN payments p ON p.created_at::date = d.day_date AND p.tenant_id = $1 AND p.status = 'completed'
      GROUP BY d.day_date
      ORDER BY d.day_date ASC
    `
    return this.dataSource.query(query, [tenantId, days])
  }

  async getMonthlyGrowth(tenantId: string) {
    const query = `
      WITH monthly_sales AS (
        SELECT 
          date_trunc('month', created_at) as month,
          SUM(amount) as sales
        FROM payments
        WHERE tenant_id = $1 AND status = 'completed'
          AND created_at >= date_trunc('month', CURRENT_DATE) - INTERVAL '1 month'
        GROUP BY 1
      )
      SELECT 
        month,
        sales
      FROM monthly_sales
      ORDER BY month DESC
    `
    return this.dataSource.query(query, [tenantId])
  }

  async getLowStockProducts(tenantId: string, limit: number = 10) {
    const query = `
      SELECT 
        p.id,
        p.name,
        p.images,
        CASE 
          WHEN v.id IS NOT NULL THEN (SELECT COALESCE(SUM(quantity), 0) FROM inventory_ledger WHERE variant_id = v.id)
          ELSE (SELECT COALESCE(SUM(quantity), 0) FROM inventory_ledger WHERE product_id = p.id AND variant_id IS NULL)
        END as stock,
        CASE 
          WHEN v.id IS NOT NULL THEN COALESCE(v.low_stock_threshold, 5)
          ELSE COALESCE(p.low_stock_threshold, 5)
        END as threshold,
        CASE 
          WHEN v.id IS NOT NULL THEN v.combination
          ELSE NULL 
        END as "variantCombination"
      FROM products p
      LEFT JOIN product_variants v ON v.product_id = p.id
      WHERE p.tenant_id = $1 AND (
        (v.id IS NOT NULL AND (SELECT COALESCE(SUM(quantity), 0) FROM inventory_ledger WHERE variant_id = v.id) <= COALESCE(v.low_stock_threshold, 5)) OR
        (v.id IS NULL AND (SELECT COALESCE(SUM(quantity), 0) FROM inventory_ledger WHERE product_id = p.id AND variant_id IS NULL) <= COALESCE(p.low_stock_threshold, 5))
      )
      LIMIT $2
    `
    return this.dataSource.query(query, [tenantId, limit])
  }

  async getGlobalCounts(tenantId: string) {
    const query = `
      SELECT
        (SELECT COUNT(*) FROM users WHERE tenant_id = $1) as users,
        (SELECT COUNT(*) FROM products WHERE tenant_id = $1) as products,
        (SELECT COUNT(*) FROM orders WHERE tenant_id = $1) as orders,
        (SELECT COUNT(*) FROM pages WHERE tenant_id = $1) as pages
    `
    const result = await this.dataSource.query(query, [tenantId])
    return result[0]
  }

  async getRecentPurchaseOrders(tenantId: string, limit: number = 5) {
    const query = `
      SELECT 
        po.id,
        po.reference_number as "referenceNumber",
        po.total_amount as "totalAmount",
        po.status,
        po.paid_amount as "paidAmount",
        po.created_at as "createdAt",
        s.name as "supplierName"
      FROM purchase_orders po
      LEFT JOIN suppliers s ON s.id = po.supplier_id
      WHERE po.tenant_id = $1
      ORDER BY po.created_at DESC
      LIMIT $2
    `
    return this.dataSource.query(query, [tenantId, limit])
  }

  async getOrderCountInRange(tenantId: string, startDate: Date, endDate: Date): Promise<number> {
    const result = await this.dataSource.query(
      `SELECT COUNT(*) as count FROM orders WHERE tenant_id = $1 AND created_at >= $2 AND created_at <= $3`,
      [tenantId, startDate, endDate]
    )
    return +result[0]?.count || 0
  }

  async getCogsInRange(tenantId: string, startDate: Date, endDate: Date): Promise<number> {
    const result = await this.dataSource.query(
      `SELECT COALESCE(SUM(cogs_amount), 0) as "totalCogs" 
       FROM inventory_ledger 
       WHERE tenant_id = $1 AND created_at >= $2 AND created_at <= $3`,
      [tenantId, startDate, endDate]
    )
    return +result[0]?.totalCogs || 0
  }
}
