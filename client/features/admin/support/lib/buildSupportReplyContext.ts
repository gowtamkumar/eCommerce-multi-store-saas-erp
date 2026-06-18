import type { Conversation, Message } from "../types";

const MAX_MESSAGES = 12;
const MAX_FAQ_CHARS = 5000;
const MAX_ORDER_CHARS = 3500;

export function buildConversationSummary(messages: Message[], maxMessages = MAX_MESSAGES): string {
  const recent = messages.slice(-maxMessages);
  if (!recent.length) {
    return "No messages yet.";
  }

  return recent
    .map((msg) => {
      const speaker = msg.senderType === "AGENT" ? "Agent" : "Visitor";
      const time = new Date(msg.createdAt).toISOString();
      return `[${time}] ${speaker}: ${msg.message}`;
    })
    .join("\n");
}

export function getLastVisitorMessage(messages: Message[]): string {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    if (messages[i].senderType === "VISITOR") {
      return messages[i].message.trim();
    }
  }
  return "";
}

export function buildFaqSummary(
  faqs: Array<{ question: string; answer: string; category?: string }>,
): string {
  if (!faqs.length) return "";

  let output = "";
  for (const faq of faqs) {
    const block = `Q: ${faq.question}\nA: ${faq.answer}${
      faq.category ? `\nCategory: ${faq.category}` : ""
    }\n\n`;
    if (output.length + block.length > MAX_FAQ_CHARS) break;
    output += block;
  }
  return output.trim();
}

export function buildOrderSummary(orders: Array<Record<string, unknown>>): string {
  if (!orders.length) return "";

  const lines: string[] = [];
  for (const order of orders) {
    const id = String(order.id ?? "unknown");
    const shortId = id.length > 8 ? id.slice(-8) : id;
    const parts = [
      `Order #${shortId.toUpperCase()}`,
      order.status ? `status=${order.status}` : null,
      order.paymentStatus ? `payment=${order.paymentStatus}` : null,
      order.totalAmount != null ? `total=${order.totalAmount}` : null,
      order.trackingId ? `tracking=${order.trackingId}` : null,
      order.courierStatus ? `courier=${order.courierStatus}` : null,
      order.createdAt ? `placed=${new Date(String(order.createdAt)).toISOString()}` : null,
    ].filter(Boolean);

    const line = `- ${parts.join(", ")}`;
    if (lines.join("\n").length + line.length > MAX_ORDER_CHARS) break;
    lines.push(line);
  }

  return lines.join("\n");
}

export function getCustomerDisplayName(conversation: Conversation): string {
  return conversation.customer?.username || `Visitor #${conversation.visitorId.substring(0, 8)}`;
}

export function getCustomerEmail(conversation: Conversation): string | undefined {
  return conversation.customer?.email || undefined;
}
