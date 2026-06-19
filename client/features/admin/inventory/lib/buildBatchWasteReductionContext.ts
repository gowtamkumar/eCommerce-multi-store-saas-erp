import type { ProductBatch } from "../hooks/useBatchRegistry";

export interface BatchRegistryStats {
  total: number;
  active: number;
  expired: number;
  nearExpiry: number;
}

function daysUntilExpiry(expiryDate: string): number {
  const diff = new Date(expiryDate).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function formatVariant(batch: ProductBatch): string {
  if (!batch.variant) return "";
  const combo = batch.variant.combination
    ? Object.entries(batch.variant.combination)
        .map(([k, v]) => `${k}: ${v}`)
        .join(", ")
    : "";
  return combo || batch.variant.sku || "";
}

function formatBatchLine(batch: ProductBatch): string {
  const days = daysUntilExpiry(batch.expiryDate);
  const variant = formatVariant(batch);
  const depletion =
    batch.initialQuantity > 0
      ? Math.round((1 - batch.currentQuantity / batch.initialQuantity) * 100)
      : 0;

  return `- ${batch.product.name}${variant ? ` / ${variant}` : ""} | batch ${batch.batchNumber} | status ${batch.status} | expires ${new Date(batch.expiryDate).toISOString().slice(0, 10)} (${days > 0 ? `${days}d left` : "past due"}) | qty ${batch.currentQuantity}/${batch.initialQuantity} | ${depletion}% depleted`;
}

function dedupeBatches(batches: ProductBatch[]): ProductBatch[] {
  const seen = new Set<string>();
  return batches.filter((batch) => {
    if (seen.has(batch.id)) return false;
    seen.add(batch.id);
    return true;
  });
}

export function buildStatsSummary(stats: BatchRegistryStats, totalItems: number): string {
  const expiryRiskPct =
    stats.total > 0 ? Math.round((stats.nearExpiry / stats.total) * 100) : 0;

  return [
    `Total batches (registry): ${totalItems}`,
    `Active: ${stats.active}`,
    `Expiring within 30 days: ${stats.nearExpiry} (${expiryRiskPct}% of visible page sample)`,
    `Expired status: ${stats.expired}`,
    "FEFO: fulfillment allocates oldest expiry-first when batches are configured.",
  ].join("\n");
}

export function buildBatchSummary(batches: ProductBatch[]): string {
  const unique = dedupeBatches(batches);
  if (!unique.length) {
    return "No batch records in context.";
  }

  const now = Date.now();
  const sorted = [...unique].sort((a, b) => {
    const aDays = daysUntilExpiry(a.expiryDate);
    const bDays = daysUntilExpiry(b.expiryDate);
    const aRisk = a.status === "ACTIVE" && a.currentQuantity > 0 ? aDays : 9999;
    const bRisk = b.status === "ACTIVE" && b.currentQuantity > 0 ? bDays : 9999;
    if (aRisk !== bRisk) return aRisk - bRisk;
    return b.currentQuantity - a.currentQuantity;
  });

  const atRisk = sorted.filter(
    (batch) =>
      batch.currentQuantity > 0 &&
      (batch.status === "EXPIRED" ||
        batch.status === "ACTIVE" ||
        (batch.status === "HOLD" && new Date(batch.expiryDate).getTime() <= now + 30 * 86400000)),
  );

  const lines: string[] = [];

  const expiringSoon = atRisk.filter(
    (batch) => batch.status === "ACTIVE" && daysUntilExpiry(batch.expiryDate) > 0 && daysUntilExpiry(batch.expiryDate) <= 30,
  );
  if (expiringSoon.length) {
    lines.push("Near-expiry batches (priority):");
    lines.push(...expiringSoon.slice(0, 15).map(formatBatchLine));
  }

  const expiredWithStock = atRisk.filter(
    (batch) => batch.status === "EXPIRED" && batch.currentQuantity > 0,
  );
  if (expiredWithStock.length) {
    lines.push("", "Expired batches with remaining quantity:");
    lines.push(...expiredWithStock.slice(0, 10).map(formatBatchLine));
  }

  const highStock = atRisk
    .filter((batch) => batch.status === "ACTIVE" && batch.currentQuantity >= 10)
    .slice(0, 10);
  if (highStock.length) {
    lines.push("", "High-quantity active batches:");
    lines.push(...highStock.map(formatBatchLine));
  }

  if (!lines.length) {
    lines.push("At-risk batch lines:");
    lines.push(...sorted.slice(0, 20).map(formatBatchLine));
  }

  if (atRisk.length > 25) {
    lines.push("", `… and ${atRisk.length - 25} more batches not listed above.`);
  }

  return lines.join("\n");
}

export function buildActiveFilterLabel(
  statusFilter: string,
  expiringSoonFilter: boolean,
): string {
  const parts: string[] = [];
  if (statusFilter !== "all") parts.push(`Status: ${statusFilter}`);
  if (expiringSoonFilter) parts.push("Expiring soon only");
  return parts.length ? parts.join(" · ") : "All batches";
}

export function buildBatchWasteReductionPayload(
  batches: ProductBatch[],
  stats: BatchRegistryStats,
  totalItems: number,
  statusFilter: string,
  expiringSoonFilter: boolean,
) {
  return {
    statsSummary: buildStatsSummary(stats, totalItems),
    batchSummary: buildBatchSummary(batches),
    activeFilter: buildActiveFilterLabel(statusFilter, expiringSoonFilter),
  };
}
