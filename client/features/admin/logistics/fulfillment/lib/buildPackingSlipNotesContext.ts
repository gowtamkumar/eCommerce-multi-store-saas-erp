export interface FulfillmentTaskContext {
  id: string;
  status: string;
  createdAt?: string;
  warehouse?: { name?: string; code?: string };
  assignedToUser?: { name?: string };
  order?: {
    id?: string;
    customerName?: string;
    orderNotes?: string;
    address?: string;
    deliveryZone?: string;
    status?: string;
  };
  items?: Array<{
    id: string;
    quantity: number;
    pickedQuantity?: number;
    status?: string;
    product?: { name?: string };
    variant?: { sku?: string; combination?: Record<string, string> };
    bin?: { name?: string; code?: string };
  }>;
}

function formatVariant(variant?: { sku?: string; combination?: Record<string, string> }): string {
  if (!variant) return "";
  const attrs = variant.combination
    ? Object.entries(variant.combination)
        .map(([k, v]) => `${k}: ${v}`)
        .join(", ")
    : "";
  if (attrs && variant.sku) return `${variant.sku} (${attrs})`;
  return variant.sku || attrs || "";
}

export function buildFulfillmentSummary(task: FulfillmentTaskContext): string {
  const pickedCount = (task.items || []).filter((item) => item.status === "PICKED").length;
  const totalUnits = (task.items || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const warehouse = task.warehouse
    ? `${task.warehouse.name || "Warehouse"}${task.warehouse.code ? ` (${task.warehouse.code})` : ""}`
    : "Unassigned warehouse";

  const lines = [
    `Task ID: ${task.id}`,
    `Status: ${task.status}`,
    task.createdAt
      ? `Created: ${new Date(task.createdAt).toISOString().slice(0, 16).replace("T", " ")}`
      : null,
    `Warehouse: ${warehouse}`,
    task.assignedToUser?.name ? `Assigned to: ${task.assignedToUser.name}` : "Assigned to: unassigned",
    `SKUs: ${task.items?.length || 0} (${pickedCount} picked)`,
    `Total units: ${totalUnits}`,
    "",
    "Line items:",
  ].filter(Boolean) as string[];

  for (const item of task.items || []) {
    const variant = formatVariant(item.variant);
    const bin = item.bin?.name || item.bin?.code || "Unassigned bin";
    lines.push(
      `- ${item.product?.name || "Product"}${variant ? ` / ${variant}` : ""} | qty ${item.quantity} | picked ${item.pickedQuantity ?? 0} | status ${item.status || "PENDING"} | bin ${bin}`,
    );
  }

  if (!task.items?.length) {
    lines.push("- No line items");
  }

  return lines.join("\n");
}

export function buildOrderSummary(order?: FulfillmentTaskContext["order"]): string {
  if (!order) return "";

  const lines = [
    order.id ? `Order ID: ${order.id}` : null,
    order.customerName ? `Customer: ${order.customerName}` : null,
    order.status ? `Order status: ${order.status}` : null,
    order.deliveryZone ? `Delivery zone: ${order.deliveryZone}` : null,
    order.address ? `Ship-to address: ${order.address}` : null,
    order.orderNotes ? `Customer order notes: ${order.orderNotes}` : null,
  ].filter(Boolean) as string[];

  return lines.join("\n");
}

export function buildPackingSlipNotesPayload(
  task: FulfillmentTaskContext,
  orderSummary?: string,
) {
  return {
    fulfillmentSummary: buildFulfillmentSummary(task),
    orderSummary: orderSummary || buildOrderSummary(task.order) || undefined,
  };
}
