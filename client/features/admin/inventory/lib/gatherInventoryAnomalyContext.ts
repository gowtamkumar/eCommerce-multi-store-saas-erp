import { fetchAPI } from "@/services/api";
import type { FilterType, InventoryStats, ProductStock } from "../type";
import {
  buildInventoryAnomalyPayload,
  buildRecentMovementsSummary,
} from "./buildInventoryAnomalyContext";

export async function gatherInventoryAnomalyContext(
  products: ProductStock[],
  stats: InventoryStats,
  formattedTotalValue: string,
  filter: FilterType,
) {
  let recentMovementsSummary = "";

  try {
    const params = new URLSearchParams({ page: "1", limit: "15" });
    const res = await fetchAPI(`/inventory-ledger?${params.toString()}`);
    const items = res.data?.items;
    if (res.success && Array.isArray(items)) {
      recentMovementsSummary = buildRecentMovementsSummary(items);
    }
  } catch {
    recentMovementsSummary = "";
  }

  return buildInventoryAnomalyPayload(
    products,
    stats,
    formattedTotalValue,
    filter,
    recentMovementsSummary || undefined,
  );
}
