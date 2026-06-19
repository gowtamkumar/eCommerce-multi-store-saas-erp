import { fetchAPI } from "@/services/api";
import type { InvoiceOcrResult } from "@/features/admin/ai/types/ai-studio";
import type { Product } from "@/features/admin/product/types";
import type { PurchaseOrder } from "@/features/admin/purchase/types";
import type { Supplier } from "@/features/admin/supplier/types";
import type { Dispatch, SetStateAction } from "react";

export interface UploadedInvoiceFile {
  filename: string;
  mimetype: string;
  size: number;
  url: string;
}

export function isInvoiceVisionEligible(file: UploadedInvoiceFile | null): boolean {
  return Boolean(file?.mimetype?.startsWith("image/") && file.url);
}

export function buildInvoiceSummary(file: UploadedInvoiceFile | null): string {
  if (!file) return "No invoice file uploaded.";

  return [
    `Filename: ${file.filename}`,
    `MIME type: ${file.mimetype}`,
    `Size bytes: ${file.size}`,
    `URL: ${file.url}`,
  ].join("\n");
}

export function buildPoContextSummary(
  purchaseOrders: PurchaseOrder[],
  selectedPoId: string,
): string | undefined {
  const po = purchaseOrders.find((entry) => entry.id === selectedPoId);
  if (!po) return undefined;

  const lines = [
    `PO reference: ${po.referenceNumber || po.id}`,
    po.supplier?.name ? `Supplier: ${po.supplier.name}` : null,
    po.totalAmount != null ? `PO total: ${po.totalAmount}` : null,
  ].filter(Boolean) as string[];

  return lines.join("\n");
}

export function buildInvoiceOcrPayload(options: {
  file: UploadedInvoiceFile | null;
  invoiceText?: string;
  useVision: boolean;
  poContextSummary?: string;
}) {
  const useVision = options.useVision && isInvoiceVisionEligible(options.file);

  return {
    invoiceSummary: buildInvoiceSummary(options.file),
    invoiceText: options.invoiceText?.trim() || undefined,
    imageUrl: useVision ? options.file?.url : undefined,
    mimetype: options.file?.mimetype,
    useVision,
    poContextSummary: options.poContextSummary,
  };
}

export async function uploadInvoiceFile(file: File): Promise<UploadedInvoiceFile> {
  const presignedRes = await fetchAPI("/admin/media/presigned-url", {
    method: "POST",
    body: JSON.stringify({
      filename: file.name,
      mimetype: file.type,
      size: file.size,
    }),
  });

  if (!presignedRes.success || !presignedRes.data?.uploadUrl) {
    throw new Error("Could not open secure upload stream");
  }

  const { uploadUrl, downloadUrl } = presignedRes.data;
  const uploadRes = await fetch(uploadUrl, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": file.type,
    },
  });

  if (!uploadRes.ok) {
    throw new Error("Failed to upload invoice file");
  }

  return {
    filename: file.name,
    mimetype: file.type,
    size: file.size,
    url: downloadUrl,
  };
}

function normalizeText(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function toDateInputValue(value?: string): string {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toISOString().slice(0, 10);
}

export function matchSupplierByName(
  suppliers: Supplier[],
  supplierName?: string,
): Supplier | undefined {
  if (!supplierName?.trim()) return undefined;

  const target = normalizeText(supplierName);
  return suppliers.find((supplier) => {
    const name = normalizeText(supplier.name || "");
    return name === target || name.includes(target) || target.includes(name);
  });
}

function scoreProductMatch(product: Product, line: InvoiceOcrResult["lineItems"][number]): number {
  const description = normalizeText(line.description || "");
  const productName = normalizeText(product.name || "");
  const productSlug = normalizeText(product.slug || "");
  const sku = normalizeText(line.sku || "");

  if (sku && (productSlug === sku || productName.includes(sku))) return 100;
  if (description && productName && description === productName) return 90;
  if (description && productName && (description.includes(productName) || productName.includes(description))) {
    return 70;
  }
  return 0;
}

export function matchProductsToLines(
  products: Product[],
  lineItems: InvoiceOcrResult["lineItems"],
): Array<{
  line: InvoiceOcrResult["lineItems"][number];
  product?: Product;
}> {
  return lineItems.map((line) => {
    const ranked = products
      .map((product) => ({ product, score: scoreProductMatch(product, line) }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score);

    return {
      line,
      product: ranked[0]?.product,
    };
  });
}

export interface ApplyInvoiceOcrDraftResult {
  matchedCount: number;
  unmatchedCount: number;
}

export function applyInvoiceOcrDraft(options: {
  result: InvoiceOcrResult;
  suppliers: Supplier[];
  products: Product[];
  setInvoiceNumber: (value: string) => void;
  setSelectedSupplierId: (value: string) => void;
  setInvoiceDate: (value: string) => void;
  setDueDate: (value: string) => void;
  setAddedItems: Dispatch<
    SetStateAction<Array<{ productId: string; name: string; quantity: number; unitPrice: number }>>
  >;
}): ApplyInvoiceOcrDraftResult {
  if (options.result.invoiceNumber) {
    options.setInvoiceNumber(options.result.invoiceNumber);
  }

  const supplier = matchSupplierByName(options.suppliers, options.result.supplierName);
  if (supplier) {
    options.setSelectedSupplierId(supplier.id);
  }

  const invoiceDate = toDateInputValue(options.result.invoiceDate);
  if (invoiceDate) options.setInvoiceDate(invoiceDate);

  const dueDate = toDateInputValue(options.result.dueDate);
  if (dueDate) options.setDueDate(dueDate);

  const matchedLines = matchProductsToLines(options.products, options.result.lineItems || []);
  const mappedItems = matchedLines
    .filter((entry) => entry.product)
    .map((entry) => ({
      productId: entry.product!.id,
      name: entry.product!.name,
      quantity: Number(entry.line.quantity) || 1,
      unitPrice: Number(entry.line.unitPrice) || 0,
    }));

  if (mappedItems.length > 0) {
    options.setAddedItems(mappedItems);
  }

  return {
    matchedCount: mappedItems.length,
    unmatchedCount: matchedLines.length - mappedItems.length,
  };
}
