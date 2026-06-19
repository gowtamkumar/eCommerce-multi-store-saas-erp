export const ADMIN_COPILOT_TOOL_NAMES = [
  'listOrders',
  'getOrder',
  'getStockLevel',
  'listLowStock',
  'getDashboardSummary',
] as const

export type AdminCopilotToolName = (typeof ADMIN_COPILOT_TOOL_NAMES)[number]

export interface AdminCopilotToolDefinition {
  name: AdminCopilotToolName
  description: string
  args: Record<string, string>
}

export const ADMIN_COPILOT_TOOLS: AdminCopilotToolDefinition[] = [
  {
    name: 'listOrders',
    description: 'List recent orders with optional status or search filter',
    args: {
      status: 'optional order status: pending, processing, confirmed, shipped, completed, cancelled',
      search: 'optional customer name, email, phone, or order id fragment',
      limit: 'optional max rows (1-10, default 5)',
    },
  },
  {
    name: 'getOrder',
    description: 'Fetch one order by id with line items',
    args: { orderId: 'order uuid' },
  },
  {
    name: 'getStockLevel',
    description: 'Look up product stock by productId, sku, or search query',
    args: {
      productId: 'optional product uuid',
      sku: 'optional SKU',
      query: 'optional name/sku search (returns top match)',
    },
  },
  {
    name: 'listLowStock',
    description: 'List products at or below low-stock threshold',
    args: { limit: 'optional max rows (1-15, default 8)' },
  },
  {
    name: 'getDashboardSummary',
    description: 'KPI snapshot for day, week, or month',
    args: { period: 'optional day | week | month (default month)' },
  },
]

export function isAdminCopilotToolName(value: string): value is AdminCopilotToolName {
  return (ADMIN_COPILOT_TOOL_NAMES as readonly string[]).includes(value)
}
