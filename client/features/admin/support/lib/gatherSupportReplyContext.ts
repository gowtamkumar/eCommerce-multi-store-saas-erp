import { fetchAPI } from "@/services/api";
import type { Conversation } from "../types";
import {
  buildConversationSummary,
  buildFaqSummary,
  buildOrderSummary,
  getCustomerDisplayName,
  getCustomerEmail,
  getLastVisitorMessage,
} from "./buildSupportReplyContext";
import type { Message } from "../types";

export interface SupportReplyContextPayload {
  conversationSummary: string;
  customerName: string;
  customerEmail?: string;
  faqSummary?: string;
  orderSummary?: string;
}

async function fetchRelevantFaqs(searchHint: string): Promise<string> {
  try {
    const params = new URLSearchParams({
      status: "active",
      limit: "15",
    });
    if (searchHint) {
      params.set("q", searchHint.slice(0, 120));
    }

    const response = await fetchAPI(`/faqs?${params.toString()}`);
    const faqs = Array.isArray(response.data) ? response.data : response.data?.faqs;
    if (!response.success || !Array.isArray(faqs) || faqs.length === 0) {
      return "";
    }

    return buildFaqSummary(
      faqs.map((faq: { question: string; answer: string; category?: string }) => ({
        question: faq.question,
        answer: faq.answer,
        category: faq.category,
      })),
    );
  } catch {
    return "";
  }
}

async function fetchOrdersForConversation(
  conversation: Conversation,
  orderLookupId?: string,
): Promise<string> {
  try {
    if (orderLookupId?.trim()) {
      const response = await fetchAPI(`/orders/${orderLookupId.trim()}`);
      if (response.success && response.data) {
        return buildOrderSummary([response.data]);
      }
      return "";
    }

    if (conversation.customerId) {
      const response = await fetchAPI(
        `/orders/user/${conversation.customerId}?limit=5&page=1`,
      );
      const orders = response.data?.orders;
      if (response.success && Array.isArray(orders) && orders.length > 0) {
        return buildOrderSummary(orders);
      }
    }

    const email = getCustomerEmail(conversation);
    if (email) {
      const params = new URLSearchParams({
        search: email,
        limit: "5",
        page: "1",
      });
      const response = await fetchAPI(`/orders?${params.toString()}`);
      const orders = response.data?.orders;
      if (response.success && Array.isArray(orders) && orders.length > 0) {
        return buildOrderSummary(orders);
      }
    }
  } catch {
    return "";
  }

  return "";
}

export async function gatherSupportReplyContext(
  conversation: Conversation,
  messages: Message[],
  orderLookupId?: string,
): Promise<SupportReplyContextPayload> {
  const lastVisitorMessage = getLastVisitorMessage(messages);
  const [faqSummary, orderSummary] = await Promise.all([
    fetchRelevantFaqs(lastVisitorMessage),
    fetchOrdersForConversation(conversation, orderLookupId),
  ]);

  return {
    conversationSummary: buildConversationSummary(messages),
    customerName: getCustomerDisplayName(conversation),
    customerEmail: getCustomerEmail(conversation),
    faqSummary: faqSummary || undefined,
    orderSummary: orderSummary || undefined,
  };
}
