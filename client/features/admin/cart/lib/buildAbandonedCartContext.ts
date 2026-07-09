import type { AbandonedCartMessageTemplate } from "@/features/admin/ai/types/ai-studio";
import type { CartSummary } from "../types";

export function buildAbandonedCartSummary(
  cart: CartSummary,
  formatAmount: (amount: number) => string = (amount) => String(amount),
): string {
  const lines = [
    `Cart ID: ${cart.id}`,
    `Customer: ${cart.customerName}`,
    `Items in cart: ${cart.itemCount}`,
    `Estimated value: ${formatAmount(cart.totalAmount ?? 0)}`,
    `Last updated: ${cart.updatedAt ? new Date(cart.updatedAt).toISOString() : "unknown"}`,
  ];

  if (cart.customerEmail) lines.push(`Email: ${cart.customerEmail}`);
  if (cart.customerPhone) lines.push(`Phone: ${cart.customerPhone}`);

  const itemLines = (cart.items ?? []).map(
    (item) =>
      `- ${item.productName ?? "Item"} x${item.quantity}${
        item.basePrice != null ? ` @ ${formatAmount(item.basePrice)}` : ""
      }`,
  );

  if (itemLines.length) {
    lines.push("", "Cart items:", ...itemLines);
  }

  return lines.join("\n");
}

export function buildAbandonedCartMessagePayload(
  cart: CartSummary,
  messageTemplate: AbandonedCartMessageTemplate,
  brandName?: string,
  formatAmount?: (amount: number) => string,
) {
  return {
    cartSummary: buildAbandonedCartSummary(cart, formatAmount),
    customerName: cart.customerName || "Customer",
    customerEmail: cart.customerEmail,
    customerPhone: cart.customerPhone,
    messageTemplate,
    brandName,
  };
}

export function defaultMessageTemplateForCart(cart: CartSummary): AbandonedCartMessageTemplate {
  if (!cart.updatedAt) return "general";

  const hoursSinceUpdate =
    (Date.now() - new Date(cart.updatedAt).getTime()) / (1000 * 60 * 60);

  if (hoursSinceUpdate >= 72) return "win_back";
  if (hoursSinceUpdate >= 24) return "urgency";
  if ((cart.totalAmount ?? 0) >= 100) return "incentive";
  return "gentle_reminder";
}
