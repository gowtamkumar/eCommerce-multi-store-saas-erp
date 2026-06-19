import type { GrnData, GrnItem } from "../types";

function formatVariantLabel(item: GrnItem): string {
  if (item.variant?.name) return ` / ${item.variant.name}`;
  if (item.variant?.combination && Object.keys(item.variant.combination).length > 0) {
    const combo = Object.entries(item.variant.combination)
      .map(([key, value]) => `${key}: ${value}`)
      .join(", ");
    return ` / ${combo}`;
  }
  if (item.variant?.sku) return ` / SKU ${item.variant.sku}`;
  return "";
}

function formatLineLabel(item: GrnItem): string {
  const product = item.product?.name || "Product";
  return `${product}${formatVariantLabel(item)}`;
}

function quantitiesMatch(orderedQty: number, receivedQty: number): boolean {
  return Number(orderedQty) === Number(receivedQty);
}

export function buildDiscrepancySummary(items: GrnItem[]): string {
  if (!items.length) return "No line items on this GRN.";

  const discrepancies = items.filter((item) => !quantitiesMatch(item.orderedQty, item.receivedQty));
  const matches = items.filter((item) => quantitiesMatch(item.orderedQty, item.receivedQty));

  const lines: string[] = [
    `Total lines: ${items.length}`,
    `Matching lines: ${matches.length}`,
    `Discrepant lines: ${discrepancies.length}`,
    "",
  ];

  if (discrepancies.length === 0) {
    lines.push("All lines match ordered quantities — no quantity discrepancies detected.");
  } else {
    lines.push("Discrepant lines (ordered → received, delta):");
    discrepancies.forEach((item, index) => {
      const delta = item.receivedQty - item.orderedQty;
      const deltaLabel = delta > 0 ? `+${delta} over` : `${delta} short`;
      lines.push(
        `${index + 1}. ${formatLineLabel(item)} | ordered ${item.orderedQty} → received ${item.receivedQty} (${deltaLabel}) @ unit cost ${item.unitCost}`,
      );
    });
  }

  if (matches.length > 0 && discrepancies.length > 0) {
    lines.push("", "Fully matched lines:");
    matches.forEach((item, index) => {
      lines.push(`${index + 1}. ${formatLineLabel(item)} | ${item.orderedQty} units @ ${item.unitCost}`);
    });
  }

  return lines.join("\n");
}

export function buildGrnSummary(grn: GrnData): string {
  return [
    `GRN: ${grn.grnNumber}`,
    `Status: ${grn.status}`,
    grn.purchaseOrder?.referenceNumber ? `PO reference: ${grn.purchaseOrder.referenceNumber}` : null,
    grn.supplier?.name ? `Supplier: ${grn.supplier.name}` : null,
    grn.warehouse?.name ? `Warehouse: ${grn.warehouse.name}` : null,
    grn.branch?.name ? `Branch: ${grn.branch.name}` : null,
    grn.receivedByUser?.name ? `Received by: ${grn.receivedByUser.name}` : null,
    grn.receivedDate
      ? `Received date: ${new Date(grn.receivedDate).toISOString().slice(0, 16).replace("T", " ")}`
      : null,
    grn.notes ? `Saved internal notes: ${grn.notes}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildGrnDiscrepancyPayload(grn: GrnData, existingNotes?: string) {
  return {
    grnSummary: buildGrnSummary(grn),
    discrepancySummary: buildDiscrepancySummary(grn.items || []),
    existingNotes: existingNotes?.trim() || grn.notes?.trim() || undefined,
  };
}
