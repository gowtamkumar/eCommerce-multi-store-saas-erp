import type { StockTransferDoc, TransferLine } from "../hooks/useStockTransfer";

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

function formatLineItems(lines: TransferLine[]): string {
  if (!lines.length) return "No line items added yet.";

  return lines
    .map((line) => {
      const variant = line.variantLabel ? ` / ${line.variantLabel}` : "";
      return `- ${line.productName}${variant} × ${line.quantityRequested}`;
    })
    .join("\n");
}

function formatTransferItems(transfer: StockTransferDoc): string {
  const items = transfer.items || [];
  if (!items.length) return "No line items on document.";

  return items
    .map((item) => {
      const name = item.product?.name || "Unknown product";
      const variant = item.variant?.combination
        ? ` / ${Object.entries(item.variant.combination)
            .map(([k, v]) => `${k}: ${v}`)
            .join(", ")}`
        : "";
      const received =
        transfer.status === "RECEIVED"
          ? ` | received ${item.quantityReceived}`
          : "";
      return `- ${name}${variant} × requested ${item.quantityRequested}${received}`;
    })
    .join("\n");
}

export function buildDraftTransferSummary(
  warehouses: WarehouseOption[],
  sourceId: string,
  destId: string,
  lines: TransferLine[],
): string {
  const totalUnits = lines.reduce((sum, line) => sum + line.quantityRequested, 0);

  return [
    "Document status: DRAFT (not yet submitted)",
    `Route: ${warehouseLabel(warehouses, sourceId)} → ${warehouseLabel(warehouses, destId)}`,
    `Line count: ${lines.length}`,
    `Total units requested: ${totalUnits}`,
    "",
    "Requested items:",
    formatLineItems(lines),
  ].join("\n");
}

export function buildTransferDocSummary(transfer: StockTransferDoc): string {
  const source = transfer.sourceWarehouse
    ? `${transfer.sourceWarehouse.name} (${transfer.sourceWarehouse.code})`
    : transfer.sourceWarehouseId;
  const dest = transfer.destinationWarehouse
    ? `${transfer.destinationWarehouse.name} (${transfer.destinationWarehouse.code})`
    : transfer.destinationWarehouseId;

  const lines = [
    `Transfer number: ${transfer.transferNumber}`,
    `Status: ${transfer.status}`,
    `Route: ${source} → ${dest}`,
    transfer.createdAt
      ? `Created: ${new Date(transfer.createdAt).toISOString().slice(0, 16).replace("T", " ")}`
      : null,
    transfer.user?.username ? `Created by: ${transfer.user.username}` : null,
    "",
    "Transfer items:",
    formatTransferItems(transfer),
  ].filter(Boolean);

  return lines.join("\n");
}

export function buildStockTransferReasonPayload(
  transferSummary: string,
  existingRemarks?: string,
) {
  return {
    transferSummary,
    existingRemarks: existingRemarks?.trim() || undefined,
  };
}

export function buildDraftStockTransferReasonPayload(
  warehouses: WarehouseOption[],
  sourceId: string,
  destId: string,
  lines: TransferLine[],
  existingRemarks?: string,
) {
  return buildStockTransferReasonPayload(
    buildDraftTransferSummary(warehouses, sourceId, destId, lines),
    existingRemarks,
  );
}

export function buildDocStockTransferReasonPayload(
  transfer: StockTransferDoc,
) {
  return buildStockTransferReasonPayload(
    buildTransferDocSummary(transfer),
    transfer.remarks || undefined,
  );
}
