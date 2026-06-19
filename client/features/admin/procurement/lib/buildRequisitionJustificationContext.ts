import type { PR } from "../types";

export interface RequisitionDraftItem {
  productName: string;
  quantity: number;
  notes?: string;
}

function formatLineItems(items: RequisitionDraftItem[]): string {
  if (!items.length) return "No line items added yet.";

  return items
    .map(
      (item, index) =>
        `${index + 1}. ${item.productName} | qty ${item.quantity}${item.notes ? ` | existing note: ${item.notes}` : ""}`,
    )
    .join("\n");
}

export function buildDraftRequisitionSummary(
  requiredDate: string,
  items: RequisitionDraftItem[],
): string {
  const lines = [
    "Document status: DRAFT (creating new requisition)",
    requiredDate
      ? `Required by: ${new Date(requiredDate).toISOString().slice(0, 10)}`
      : "Required by: not set",
    `Line count: ${items.length}`,
    "",
    "Requested items:",
    formatLineItems(items),
  ];

  return lines.join("\n");
}

export function buildRequisitionSummary(pr: PR): string {
  const lines = [
    `PR number: ${pr.prNumber}`,
    `Status: ${pr.status}`,
    pr.requiredDate
      ? `Required by: ${new Date(pr.requiredDate).toISOString().slice(0, 10)}`
      : null,
    pr.requestedBy?.name ? `Requested by: ${pr.requestedBy.name}` : null,
    pr.createdAt
      ? `Created: ${new Date(pr.createdAt).toISOString().slice(0, 16).replace("T", " ")}`
      : null,
    "",
    "Requested items:",
  ].filter(Boolean) as string[];

  if (!pr.items?.length) {
    lines.push("No line items.");
  } else {
    pr.items.forEach((item, index) => {
      lines.push(
        `${index + 1}. ${item.product?.name || "Product"} | qty ${item.quantity}${item.notes ? ` | existing note: ${item.notes}` : ""}`,
      );
    });
  }

  return lines.join("\n");
}

export function buildRequisitionJustificationPayload(
  requisitionSummary: string,
  existingJustification?: string,
) {
  return {
    requisitionSummary,
    existingJustification: existingJustification?.trim() || undefined,
  };
}

export function buildDraftRequisitionJustificationPayload(
  requiredDate: string,
  items: RequisitionDraftItem[],
  existingJustification?: string,
) {
  return buildRequisitionJustificationPayload(
    buildDraftRequisitionSummary(requiredDate, items),
    existingJustification,
  );
}

export function buildExistingRequisitionJustificationPayload(pr: PR) {
  return buildRequisitionJustificationPayload(
    buildRequisitionSummary(pr),
    pr.justification,
  );
}
