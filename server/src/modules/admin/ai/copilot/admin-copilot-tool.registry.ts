export const ADMIN_COPILOT_TOOL_NAMES = [
  'listOrders',
  'getOrder',
  'getStockLevel',
  'listLowStock',
  'getDashboardSummary',
] as const

export type AdminCopilotToolName = (typeof ADMIN_COPILOT_TOOL_NAMES)[number]

export interface ToolArgDefinition {
  type: 'string' | 'integer' | 'number' | 'boolean'
  description: string
  required?: boolean
}

export interface AdminCopilotToolDefinition {
  name: AdminCopilotToolName
  description: string
  args: Record<string, ToolArgDefinition>
}

export const ADMIN_COPILOT_TOOLS: AdminCopilotToolDefinition[] = [
  {
    name: 'listOrders',
    description: 'List recent orders with optional status or search filter',
    args: {
      status: {
        type: 'string',
        description: 'order status: pending, processing, confirmed, shipped, completed, cancelled',
        required: false,
      },
      search: {
        type: 'string',
        description: 'customer name, email, phone, or order id fragment',
        required: false,
      },
      limit: {
        type: 'integer',
        description: 'max rows (1-10, default 5)',
        required: false,
      },
    },
  },
  {
    name: 'getOrder',
    description: 'Fetch one order by id with line items',
    args: {
      orderId: {
        type: 'string',
        description: 'order uuid',
        required: true,
      },
    },
  },
  {
    name: 'getStockLevel',
    description: 'Look up product stock by productId, sku, or search query',
    args: {
      productId: {
        type: 'string',
        description: 'product uuid',
        required: false,
      },
      sku: {
        type: 'string',
        description: 'SKU',
        required: false,
      },
      query: {
        type: 'string',
        description: 'name/sku search (returns top match)',
        required: false,
      },
    },
  },
  {
    name: 'listLowStock',
    description: 'List products at or below low-stock threshold',
    args: {
      limit: {
        type: 'integer',
        description: 'max rows (1-15, default 8)',
        required: false,
      },
    },
  },
  {
    name: 'getDashboardSummary',
    description: 'KPI snapshot for day, week, or month',
    args: {
      period: {
        type: 'string',
        description: 'day | week | month (default month)',
        required: false,
      },
    },
  },
]

export function isAdminCopilotToolName(value: string): value is AdminCopilotToolName {
  return (ADMIN_COPILOT_TOOL_NAMES as readonly string[]).includes(value)
}
