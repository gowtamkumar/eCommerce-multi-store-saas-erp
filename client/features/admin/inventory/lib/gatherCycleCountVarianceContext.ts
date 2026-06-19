import { fetchAPI } from "@/services/api";
import type { CountLine } from "../hooks/useCycleCount";
import {
  buildCycleCountVariancePayload,
  buildRecentMovementsSummary,
} from "./buildCycleCountVarianceContext";

interface WarehouseOption {
  id: string;
  name: string;
  code?: string;
}

export async function gatherCycleCountVarianceContext(
  warehouses: WarehouseOption[],
  warehouseId: string,
  countRef: string,
  lines: CountLine[],
) {
  let recentMovementsSummary = "";

  if (warehouseId) {
    try {
      const params = new URLSearchParams({
        page: "1",
        limit: "12",
        warehouseId,
      });
      const res = await fetchAPI(`/inventory-ledger?${params.toString()}`);
      const items = res.data?.items;
      if (res.success && Array.isArray(items)) {
        recentMovementsSummary = buildRecentMovementsSummary(items);
      }
    } catch {
      recentMovementsSummary = "";
    }
  }

  return buildCycleCountVariancePayload(
    warehouses,
    warehouseId,
    countRef,
    lines,
    recentMovementsSummary || undefined,
  );
}
