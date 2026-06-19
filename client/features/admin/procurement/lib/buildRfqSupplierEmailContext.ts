import type { RFQ } from "../types";

function formatDeadline(deadlineDate?: string): string {
  if (!deadlineDate) return "Not specified";
  return new Date(deadlineDate).toISOString().slice(0, 10);
}

function formatLineItems(rfq: RFQ): string {
  const items = rfq.purchaseRequisition?.items || [];
  if (!items.length) return "Line items not loaded — refer to linked requisition.";

  return items
    .map((item, index) => {
      const name = item.product?.name || "Product";
      const note = item.notes ? ` | spec: ${item.notes}` : "";
      return `${index + 1}. ${name} × ${item.quantity}${note}`;
    })
    .join("\n");
}

export function buildRfqSummary(rfq: RFQ): string {
  const pr = rfq.purchaseRequisition;
  const lines = [
    `RFQ number: ${rfq.rfqNumber}`,
    `Status: ${rfq.status}`,
    `Quote deadline: ${formatDeadline(rfq.deadlineDate)}`,
    rfq.createdBy?.name ? `Issued by: ${rfq.createdBy.name}` : null,
    pr?.prNumber ? `Linked requisition: ${pr.prNumber}` : "Linked requisition: none (ad-hoc sourcing)",
    pr?.requiredDate ? `Required delivery date: ${formatDeadline(pr.requiredDate)}` : null,
    pr?.justification ? `Business justification: ${pr.justification}` : null,
    `Existing bids received: ${rfq.quotations?.length || 0}`,
    "",
    "Requested items:",
    formatLineItems(rfq),
    "",
    "Ask suppliers to submit pricing, lead time, and terms by the quote deadline.",
  ].filter(Boolean) as string[];

  return lines.join("\n");
}

export function buildRfqSupplierEmailPayload(rfq: RFQ, supplierHint?: string) {
  const offerDetails = [
    "Email type: B2B procurement RFQ invitation to suppliers (not consumer marketing).",
    "Include: RFQ reference, quote deadline, summary of items, submission instructions, and professional call to action.",
    supplierHint?.trim() ? `Supplier context: ${supplierHint.trim()}` : null,
    "",
    buildRfqSummary(rfq),
  ]
    .filter(Boolean)
    .join("\n");

  return {
    campaignName: `Supplier RFQ — ${rfq.rfqNumber}`,
    audience: "Approved suppliers and vendor partners",
    offerDetails,
    channel: "email" as const,
    tone: "professional, clear, and procurement-friendly",
  };
}
