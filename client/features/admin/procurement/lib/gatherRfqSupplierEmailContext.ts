import { fetchAPI } from "@/services/api";
import type { RFQ } from "../types";
import { buildRfqSupplierEmailPayload } from "./buildRfqSupplierEmailContext";

export async function gatherRfqSupplierEmailContext(rfq: RFQ, supplierHint?: string) {
  let enriched = rfq;

  try {
    const res = await fetchAPI(`/rfqs/${rfq.id}`);
    if (res.success && res.data) {
      enriched = {
        ...rfq,
        ...res.data,
        purchaseRequisition: {
          ...rfq.purchaseRequisition,
          ...res.data.purchaseRequisition,
          items:
            res.data.purchaseRequisition?.items || rfq.purchaseRequisition?.items,
        },
        quotations: res.data.quotations || rfq.quotations,
      };
    }
  } catch {
    enriched = rfq;
  }

  return buildRfqSupplierEmailPayload(enriched, supplierHint);
}
