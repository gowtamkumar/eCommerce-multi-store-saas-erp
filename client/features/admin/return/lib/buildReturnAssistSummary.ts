import type { ReturnLetterTemplate } from "@/features/admin/ai/types/ai-studio";

export interface ReturnAssistInput {
  id: string;
  orderId: string;
  status: string;
  returnType?: string;
  refundMethod?: string;
  reason: string;
  adminComment?: string;
  refundAmount?: number;
  exchangeOrderId?: string | null;
  receivedAt?: string | null;
  items: Array<{
    productId?: string;
    variantId?: string;
    quantity: number;
  }>;
  createdAt: string;
  user?: {
    email?: string;
  };
  order?: {
    customerName?: string;
    customerEmail?: string;
    items?: ReadonlyArray<{
      productId?: string;
      variantId?: string;
      product?: { id?: string } | null;
      variant?: { id?: string } | null;
      snapshot?: { productId?: string };
    }>;
  };
}

export function buildReturnAssistSummary(returnRequest: ReturnAssistInput): string {
  const lines = [
    `Return ID: ${returnRequest.id}`,
    `Order ID: ${returnRequest.orderId}`,
    `Requested: ${new Date(returnRequest.createdAt).toISOString()}`,
    `Status: ${returnRequest.status}`,
    `Type: ${returnRequest.returnType ?? "refund"}`,
    `Reason: ${returnRequest.reason}`,
  ];

  if (returnRequest.refundAmount != null) {
    lines.push(`Refund amount: ${returnRequest.refundAmount}`);
  }
  if (returnRequest.refundMethod) {
    lines.push(`Refund method: ${returnRequest.refundMethod}`);
  }
  if (returnRequest.adminComment) {
    lines.push(`Admin notes: ${returnRequest.adminComment}`);
  }
  if (returnRequest.receivedAt) {
    lines.push(`Items received: ${new Date(returnRequest.receivedAt).toISOString()}`);
  }
  if (returnRequest.exchangeOrderId) {
    lines.push(`Exchange order ID: ${returnRequest.exchangeOrderId}`);
  }

  const itemLines = returnRequest.items.map((item, index) => {
    const orderItem = returnRequest.order?.items?.find((oi) => {
      const orderProductId = oi.productId ?? oi.product?.id ?? oi.snapshot?.productId;
      const orderVariantId = oi.variantId ?? oi.variant?.id;
      return (
        orderProductId === item.productId &&
        (orderVariantId === item.variantId || (!orderVariantId && !item.variantId))
      );
    });
    const label = orderItem
      ? `product ${item.productId}${item.variantId ? ` / variant ${item.variantId}` : ""}`
      : `item ${index + 1}`;
    return `- ${label} x${item.quantity}`;
  });

  if (itemLines.length) {
    lines.push("Returned items:", ...itemLines);
  }

  if (returnRequest.order?.customerName) {
    lines.push(`Customer: ${returnRequest.order.customerName}`);
  }

  return lines.join("\n");
}

export function defaultLetterTemplateForStatus(status: string): ReturnLetterTemplate {
  switch (status.toLowerCase()) {
    case "approved":
      return "approved";
    case "rejected":
      return "rejected";
    case "refunded":
      return "refunded";
    case "received":
      return "received";
    case "exchanged":
      return "exchange";
    case "pending":
      return "pending";
    default:
      return "general";
  }
}
