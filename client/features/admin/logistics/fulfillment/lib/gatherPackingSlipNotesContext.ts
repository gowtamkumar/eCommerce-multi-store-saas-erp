import { fetchAPI } from "@/services/api";
import {
  buildOrderSummary,
  buildPackingSlipNotesPayload,
  type FulfillmentTaskContext,
} from "./buildPackingSlipNotesContext";

async function fetchOrderSummary(orderId?: string): Promise<string> {
  if (!orderId) return "";

  try {
    const res = await fetchAPI(`/orders/${orderId}`);
    if (!res.success || !res.data) return "";

    const order = res.data;
    return buildOrderSummary({
      id: order.id,
      customerName: order.customerName,
      orderNotes: order.orderNotes,
      address: order.address,
      deliveryZone: order.deliveryZone,
      status: order.status,
    });
  } catch {
    return "";
  }
}

export async function gatherPackingSlipNotesContext(task: FulfillmentTaskContext) {
  const orderSummary =
    (await fetchOrderSummary(task.order?.id)) || buildOrderSummary(task.order);

  return buildPackingSlipNotesPayload(task, orderSummary || undefined);
}
