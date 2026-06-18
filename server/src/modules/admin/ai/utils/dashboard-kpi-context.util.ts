const DASHBOARD_COPILOT_SYSTEM_PROMPT = `You are a read-only dashboard copilot for an e-commerce store admin.
Answer questions using ONLY the KPI snapshot in the latest user message context.
Never invent sales figures, order counts, stock levels, or customer data.
If the snapshot does not contain enough data to answer, say what is missing.
Be concise and practical. Use short paragraphs or bullet points.
Do not recommend actions that change orders, inventory, prices, or finances — only explain metrics and suggest where to look in admin (e.g. Orders, Reports, Fulfillment).
Currency values are in the store's default currency.`

export function buildDashboardKpiSnapshot(stats: Record<string, any>, period: string) {
  return {
    period,
    asOf: new Date().toISOString(),
    sales: {
      periodSales: stats.periodSales,
      periodOrders: stats.periodOrders,
      periodGrowthPercent: stats.periodGrowth,
      avgOrderValue: stats.avgOrderValue,
      totalSalesAllTime: stats.totalSales,
      monthlyGrowthPercent: stats.monthlyGrowth,
    },
    operations: {
      activeOrders: stats.activeOrders,
      lowStockCount: stats.lowStockCount,
      fulfillmentPending: stats.fulfillment?.pending,
      fulfillmentPicking: stats.fulfillment?.picking,
    },
    finance: stats.financeSnapshot,
    catalogCounts: stats.counts,
    topProducts: (stats.topProducts || []).slice(0, 5).map((p: any) => ({
      name: p.name,
      quantitySold: p.quantity,
      revenue: p.revenue,
    })),
    topCustomers: (stats.topCustomers || []).slice(0, 5).map((c: any) => ({
      name: c.name,
      orderCount: c.orderCount,
      revenue: c.revenue,
    })),
    lowStockProducts: (stats.lowStockProducts || []).slice(0, 5).map((p: any) => ({
      name: p.name,
      stock: p.stock,
      threshold: p.threshold,
      variantName: p.variantName,
    })),
    recentOrders: (stats.recentOrders || []).slice(0, 5).map((o: any) => ({
      status: o.status,
      totalAmount: o.totalAmount,
      customerName: o.customerName,
    })),
    supplier: {
      totalSuppliers: stats.supplierStats?.totalSuppliers,
      openPurchaseOrders: stats.supplierStats?.totalPurchaseOrders,
      amountDue: stats.supplierStats?.totalAmountDue,
    },
    salesTrend: stats.salesData,
  }
}

export function buildDashboardCopilotMessages(
  snapshot: Record<string, unknown>,
  userMessage: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }> = [],
) {
  const contextBlock = `KPI snapshot (read-only, period=${snapshot.period}):\n${JSON.stringify(snapshot, null, 2)}`

  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    { role: 'system', content: DASHBOARD_COPILOT_SYSTEM_PROMPT },
  ]

  for (const item of history) {
    messages.push({ role: item.role, content: item.content })
  }

  messages.push({
    role: 'user',
    content: `${contextBlock}\n\nQuestion: ${userMessage}`,
  })

  return messages
}
