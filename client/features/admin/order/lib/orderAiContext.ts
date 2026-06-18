import type { Order } from "@/types/order";

export function buildOrderAssistSummary(order: Order): string {
  const lines = [
    `Order ID: ${order.id}`,
    `Placed: ${new Date(order.createdAt).toISOString()}`,
    `Status: ${order.status}`,
    `Payment: ${order.paymentStatus} via ${order.paymentMethod}`,
    `Total: ${order.totalAmount}`,
  ];

  if (order.trackingId) lines.push(`Tracking ID: ${order.trackingId}`);
  if (order.courierStatus) lines.push(`Courier status: ${order.courierStatus}`);
  if (order.transactionId) lines.push(`Transaction ID: ${order.transactionId}`);
  if (order.shippingFee != null) lines.push(`Shipping fee: ${order.shippingFee}`);
  if (order.taxAmount != null) lines.push(`Tax: ${order.taxAmount}`);
  if (order.appliedCoupon) {
    lines.push(`Coupon: ${order.appliedCoupon} (-${order.couponDiscountAmount ?? 0})`);
  }
  if (order.orderNotes) lines.push(`Customer notes: ${order.orderNotes}`);

  const itemLines = (order.items || []).map((item) => {
    const name = item.snapshot?.productName || item.product?.name || "Item";
    const variant = item.snapshot?.variantSku || item.variant?.sku;
    return `- ${name}${variant ? ` (${variant})` : ""} x${item.quantity} @ ${item.unitPrice}`;
  });

  if (itemLines.length) {
    lines.push("Items:", ...itemLines);
  }

  if (order.returns?.length) {
    lines.push(
      "Returns:",
      ...order.returns.map((r) => `- Return ${r.id.slice(-8)}: ${r.status}`),
    );
  }

  return lines.join("\n");
}
