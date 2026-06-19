import type { CountLine } from "../hooks/useCycleCount";

interface WarehouseOption {
  id: string;
  name: string;
  code?: string;
}

function warehouseLabel(warehouses: WarehouseOption[], id: string): string {
  const w = warehouses.find((item) => item.id === id);
  if (!w) return id || "Not selected";
  return w.code ? `${w.name} (${w.code})` : w.name;
}

function formatLine(line: CountLine): string {
  const variant = line.variantLabel ? ` / ${line.variantLabel}` : "";
  const system = line.liveStock === null ? "?" : String(line.liveStock);
  const delta =
    line.delta === null
      ? "pending"
      : line.delta === 0
        ? "0 (match)"
        : `${line.delta > 0 ? "+" : ""}${line.delta}`;

  return `- ${line.productName}${variant} | system ${system} | counted ${line.countedQty} | delta ${delta}`;
}

export function buildCountSummary(
  warehouses: WarehouseOption[],
  warehouseId: string,
  countRef: string,
  lines: CountLine[],
): string {
  const readyLines = lines.filter((line) => line.liveStock !== null);
  const discrepancies = readyLines.filter((line) => line.delta !== 0);
  const matches = readyLines.filter((line) => line.delta === 0);
  const pending = lines.filter((line) => line.liveStock === null);

  const netDelta = readyLines.reduce((sum, line) => sum + (line.delta ?? 0), 0);
  const totalShort = readyLines
    .filter((line) => (line.delta ?? 0) < 0)
    .reduce((sum, line) => sum + Math.abs(line.delta ?? 0), 0);
  const totalOver = readyLines
    .filter((line) => (line.delta ?? 0) > 0)
    .reduce((sum, line) => sum + (line.delta ?? 0), 0);

  return [
    `Count reference: ${countRef}`,
    `Warehouse: ${warehouseLabel(warehouses, warehouseId)}`,
    `Total lines: ${lines.length}`,
    `Lines with system stock loaded: ${readyLines.length}`,
    `Pending stock fetch: ${pending.length}`,
    `Exact matches: ${matches.length}`,
    `Discrepancies: ${discrepancies.length}`,
    `Net delta (counted − system): ${netDelta > 0 ? "+" : ""}${netDelta}`,
    `Total units short: ${totalShort}`,
    `Total units over: ${totalOver}`,
  ].join("\n");
}

export function buildVarianceSummary(lines: CountLine[]): string {
  const ready = lines.filter((line) => line.liveStock !== null);
  if (!ready.length) {
    return "No count lines with system stock loaded yet.";
  }

  const withVariance = [...ready]
    .filter((line) => line.delta !== 0)
    .sort((a, b) => Math.abs(b.delta ?? 0) - Math.abs(a.delta ?? 0));

  const exactMatches = ready.filter((line) => line.delta === 0);

  const sections: string[] = [];

  if (withVariance.length) {
    sections.push("Discrepant lines (largest variance first):");
    sections.push(...withVariance.map(formatLine));
  } else {
    sections.push("All loaded lines match system stock exactly.");
  }

  if (exactMatches.length) {
    sections.push("");
    sections.push(`Matched lines (${exactMatches.length}):`);
    sections.push(...exactMatches.slice(0, 8).map(formatLine));
    if (exactMatches.length > 8) {
      sections.push(`… and ${exactMatches.length - 8} more matching lines.`);
    }
  }

  const pending = lines.filter((line) => line.liveStock === null);
  if (pending.length) {
    sections.push("");
    sections.push(`Lines still loading system stock (${pending.length}):`);
    sections.push(...pending.map((line) => `- ${line.productName}${line.variantLabel ? ` / ${line.variantLabel}` : ""}`));
  }

  return sections.join("\n");
}

export function buildRecentMovementsSummary(
  items: Array<{
    createdAt: string;
    type: string;
    quantity: number;
    balanceAfter?: number;
    referenceType?: string;
    product?: { name?: string };
    variant?: { combination?: Record<string, string> };
  }>,
): string {
  if (!items.length) return "";

  return items
    .slice(0, 12)
    .map((item) => {
      const name = item.product?.name || "Unknown product";
      const variant = item.variant?.combination
        ? ` (${Object.values(item.variant.combination).join("/")})`
        : "";
      const ref = item.referenceType ? ` ref:${item.referenceType}` : "";
      const date = new Date(item.createdAt).toISOString().slice(0, 16).replace("T", " ");
      return `- ${date} | ${item.type} | ${name}${variant} | qty ${item.quantity > 0 ? "+" : ""}${item.quantity}${ref}`;
    })
    .join("\n");
}

export function buildCycleCountVariancePayload(
  warehouses: WarehouseOption[],
  warehouseId: string,
  countRef: string,
  lines: CountLine[],
  recentMovementsSummary?: string,
) {
  return {
    countSummary: buildCountSummary(warehouses, warehouseId, countRef, lines),
    varianceSummary: buildVarianceSummary(lines),
    recentMovementsSummary: recentMovementsSummary || undefined,
  };
}
