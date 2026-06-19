import { fetchAPI } from "@/services/api";
import type { ProductBatch } from "../hooks/useBatchRegistry";
import {
  buildBatchWasteReductionPayload,
  type BatchRegistryStats,
} from "./buildBatchWasteReductionContext";

async function fetchExpiringSoonBatches(): Promise<ProductBatch[]> {
  try {
    const params = new URLSearchParams({
      page: "1",
      limit: "25",
      expiringSoon: "true",
    });
    const res = await fetchAPI(`/product-batches?${params.toString()}`);
    if (res.success && Array.isArray(res.data?.items)) {
      return res.data.items;
    }
  } catch {
    /* best-effort */
  }
  return [];
}

async function fetchExpiredBatches(): Promise<ProductBatch[]> {
  try {
    const params = new URLSearchParams({
      page: "1",
      limit: "10",
      status: "EXPIRED",
    });
    const res = await fetchAPI(`/product-batches?${params.toString()}`);
    if (res.success && Array.isArray(res.data?.items)) {
      return res.data.items;
    }
  } catch {
    /* best-effort */
  }
  return [];
}

export async function gatherBatchWasteReductionContext(
  visibleBatches: ProductBatch[],
  stats: BatchRegistryStats,
  totalItems: number,
  statusFilter: string,
  expiringSoonFilter: boolean,
) {
  const [expiringSoon, expired] = await Promise.all([
    expiringSoonFilter ? Promise.resolve([]) : fetchExpiringSoonBatches(),
    statusFilter === "EXPIRED" ? Promise.resolve([]) : fetchExpiredBatches(),
  ]);

  const merged = [...visibleBatches, ...expiringSoon, ...expired];

  return buildBatchWasteReductionPayload(
    merged,
    stats,
    totalItems,
    statusFilter,
    expiringSoonFilter,
  );
}
