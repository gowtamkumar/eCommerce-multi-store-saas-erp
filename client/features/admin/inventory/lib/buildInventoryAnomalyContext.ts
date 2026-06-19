import type { FilterType, InventoryStats, ProductStock, VariantStock } from "../type";

const FILTER_LABELS: Record<FilterType, string> = {
  all: "All products",
  inStock: "In stock only",
  lowStock: "Low stock only",
  outOfStock: "Out of stock only",
};

function formatVariantLabel(variant: VariantStock): string {
  const attrs = variant.combination
    ? Object.entries(variant.combination)
        .map(([k, v]) => `${k}: ${v}`)
        .join(", ")
    : "";
  return attrs ? `${variant.sku || "variant"} (${attrs})` : variant.sku || "variant";
}

function productReserved(product: ProductStock): number {
  if (product.hasVariants) {
    return (product.variants || []).reduce((sum, v) => sum + (v.reservedStock || 0), 0);
  }
  return (product as ProductStock & { reservedStock?: number }).reservedStock || 0;
}

function skuLines(product: ProductStock): string[] {
  const lines: string[] = [];
  const reserved = productReserved(product);
  const available = product.stock - reserved;

  if (product.outOfStock) {
    lines.push(
      `- OUT OF STOCK: ${product.name} | total stock ${product.stock} | category: ${product.categoryName || "n/a"} | supplier: ${product.supplierName || "n/a"}`,
    );
  } else if (product.lowStock) {
    lines.push(
      `- LOW STOCK: ${product.name} | stock ${product.stock} | available ${available} | reserved ${reserved} | category: ${product.categoryName || "n/a"}`,
    );
  }

  if (product.hasVariants) {
    for (const variant of product.variants || []) {
      const vReserved = variant.reservedStock || 0;
      const vAvailable = variant.stock - vReserved;
      const threshold = variant.lowStockThreshold || 5;

      if (variant.stock === 0) {
        lines.push(
          `  · variant depleted: ${product.name} / ${formatVariantLabel(variant)} | stock 0`,
        );
      } else if (variant.stock <= threshold) {
        lines.push(
          `  · variant critical: ${product.name} / ${formatVariantLabel(variant)} | stock ${variant.stock} | available ${vAvailable} | reserved ${vReserved}`,
        );
      } else if (vReserved > 0 && vAvailable <= threshold) {
        lines.push(
          `  · high reservation: ${product.name} / ${formatVariantLabel(variant)} | stock ${variant.stock} | reserved ${vReserved} | available ${vAvailable}`,
        );
      }
    }
  } else if (
    reserved > 0 &&
    available <= ((product as ProductStock & { lowStockThreshold?: number }).lowStockThreshold ?? 5)
  ) {
    lines.push(
      `- HIGH RESERVATION: ${product.name} | stock ${product.stock} | reserved ${reserved} | available ${available}`,
    );
  }

  return lines;
}

export function buildStatsSummary(stats: InventoryStats, formattedTotalValue: string): string {
  const pctOut =
    stats.totalProducts > 0
      ? Math.round((stats.outOfStockCount / stats.totalProducts) * 100)
      : 0;
  const pctLow =
    stats.totalProducts > 0
      ? Math.round((stats.lowStockCount / stats.totalProducts) * 100)
      : 0;

  return [
    `Total products tracked: ${stats.totalProducts}`,
    `Estimated inventory asset value: ${formattedTotalValue}`,
    `In stock: ${stats.inStockCount}`,
    `Low stock alerts: ${stats.lowStockCount} (${pctLow}% of catalog)`,
    `Out of stock / depleted: ${stats.outOfStockCount} (${pctOut}% of catalog)`,
  ].join("\n");
}

export function buildStockSummary(products: ProductStock[]): string {
  const lines: string[] = [];

  const atRisk = products.filter((p) => p.outOfStock || p.lowStock);
  const sorted = [...atRisk].sort((a, b) => {
    if (a.outOfStock !== b.outOfStock) return a.outOfStock ? -1 : 1;
    if (a.lowStock !== b.lowStock) return a.lowStock ? -1 : 1;
    return (b.stockValue || 0) - (a.stockValue || 0);
  });

  const top = sorted.slice(0, 25);
  for (const product of top) {
    lines.push(...skuLines(product));
  }

  if (lines.length === 0) {
    return "No out-of-stock or low-stock SKUs in the current snapshot. All tracked products appear adequately stocked.";
  }

  const categoryCounts = new Map<string, number>();
  for (const p of atRisk) {
    const cat = p.categoryName || "Uncategorized";
    categoryCounts.set(cat, (categoryCounts.get(cat) || 0) + 1);
  }
  const categoryLine = [...categoryCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([cat, count]) => `${cat}: ${count}`)
    .join("; ");

  if (categoryLine) {
    lines.unshift(`At-risk by category (top): ${categoryLine}`, "");
  }

  if (atRisk.length > top.length) {
    lines.push("", `… and ${atRisk.length - top.length} more at-risk products not listed above.`);
  }

  return lines.join("\n");
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
    warehouse?: { name?: string };
  }>,
): string {
  if (!items.length) return "";

  return items
    .slice(0, 15)
    .map((item) => {
      const name = item.product?.name || "Unknown product";
      const variant = item.variant?.combination
        ? ` (${Object.values(item.variant.combination).join("/")})`
        : "";
      const warehouse = item.warehouse?.name ? ` @ ${item.warehouse.name}` : "";
      const ref = item.referenceType ? ` ref:${item.referenceType}` : "";
      const date = new Date(item.createdAt).toISOString().slice(0, 16).replace("T", " ");
      return `- ${date} | ${item.type} | ${name}${variant} | qty ${item.quantity > 0 ? "+" : ""}${item.quantity} | balance ${item.balanceAfter ?? "?"}${warehouse}${ref}`;
    })
    .join("\n");
}

export function buildInventoryAnomalyPayload(
  products: ProductStock[],
  stats: InventoryStats,
  formattedTotalValue: string,
  filter: FilterType,
  recentMovementsSummary?: string,
) {
  return {
    statsSummary: buildStatsSummary(stats, formattedTotalValue),
    stockSummary: buildStockSummary(products),
    recentMovementsSummary: recentMovementsSummary || undefined,
    activeFilter: FILTER_LABELS[filter],
  };
}
