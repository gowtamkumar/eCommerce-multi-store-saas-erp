interface DraftPoItem {
  name: string;
  variantLabel?: string;
  sku?: string;
  quantity: number;
  unitPrice: number;
}

interface DraftPoForm {
  supplierId: string;
  referenceNumber: string;
  items: DraftPoItem[];
}

interface SupplierOption {
  id: string;
  name: string;
  email?: string;
  contactName?: string;
}

function formatLineItems(items: DraftPoItem[]): string {
  if (!items.length) return "No line items.";

  return items
    .map((item, index) => {
      const variant = item.variantLabel ? ` / ${item.variantLabel}` : "";
      const sku = item.sku ? ` | SKU ${item.sku}` : "";
      return `${index + 1}. ${item.name}${variant}${sku} × ${item.quantity} @ ${item.unitPrice}`;
    })
    .join("\n");
}

export function buildDraftPoSummary(
  formData: DraftPoForm,
  suppliers: SupplierOption[],
  totalAmount: number,
): string {
  const supplier = suppliers.find((s) => s.id === formData.supplierId);

  return [
    `PO reference: ${formData.referenceNumber}`,
    "Status: DRAFT (not yet submitted)",
    supplier ? `Supplier: ${supplier.name}` : "Supplier: not selected",
    supplier?.contactName ? `Supplier contact: ${supplier.contactName}` : null,
    supplier?.email ? `Supplier email: ${supplier.email}` : null,
    `Total amount: ${totalAmount}`,
    `Line count: ${formData.items.length}`,
    "",
    "Line items:",
    formatLineItems(formData.items),
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildPoSummary(order: {
  referenceNumber?: string;
  status?: string;
  totalAmount?: number;
  paidAmount?: number;
  paymentStatus?: string;
  deliveryDate?: string;
  createdAt?: string;
  supplier?: {
    name?: string;
    email?: string;
    contactName?: string;
    phone?: string;
    address?: string;
  };
  items?: Array<{
    quantity?: number;
    unitPrice?: number;
    product?: { name?: string; slug?: string };
    variant?: { sku?: string; combination?: Record<string, string> };
  }>;
}): string {
  const lines = [
    `PO reference: ${order.referenceNumber || "N/A"}`,
    order.status ? `Status: ${order.status}` : null,
    order.createdAt
      ? `Created: ${new Date(order.createdAt).toISOString().slice(0, 16).replace("T", " ")}`
      : null,
    order.deliveryDate
      ? `Expected delivery: ${new Date(order.deliveryDate).toISOString().slice(0, 10)}`
      : null,
    order.supplier?.name ? `Supplier: ${order.supplier.name}` : null,
    order.supplier?.contactName ? `Contact: ${order.supplier.contactName}` : null,
    order.supplier?.email ? `Email: ${order.supplier.email}` : null,
    order.supplier?.phone ? `Phone: ${order.supplier.phone}` : null,
    order.supplier?.address ? `Address: ${order.supplier.address}` : null,
    order.totalAmount != null ? `Total amount: ${order.totalAmount}` : null,
    order.paidAmount != null ? `Paid to date: ${order.paidAmount}` : null,
    order.paymentStatus ? `Payment status: ${order.paymentStatus}` : null,
    "",
    "Line items:",
  ].filter(Boolean) as string[];

  const items = order.items || [];
  if (!items.length) {
    lines.push("No line items.");
  } else {
    items.forEach((item, index) => {
      const name = item.product?.name || "Product";
      const variant = item.variant?.combination
        ? ` / ${Object.entries(item.variant.combination)
            .map(([k, v]) => `${k}: ${v}`)
            .join(", ")}`
        : "";
      const sku = item.variant?.sku || item.product?.slug || "";
      lines.push(
        `${index + 1}. ${name}${variant} | SKU ${sku} × ${item.quantity} @ ${item.unitPrice}`,
      );
    });
  }

  return lines.join("\n");
}

export function buildPoCoverLetterPayload(
  purchaseOrderSummary: string,
  existingCoverLetter?: string,
) {
  return {
    purchaseOrderSummary,
    existingCoverLetter: existingCoverLetter?.trim() || undefined,
  };
}

export function buildDraftPoCoverLetterPayload(
  formData: DraftPoForm,
  suppliers: SupplierOption[],
  totalAmount: number,
  existingCoverLetter?: string,
) {
  return buildPoCoverLetterPayload(
    buildDraftPoSummary(formData, suppliers, totalAmount),
    existingCoverLetter,
  );
}

export function buildExistingPoCoverLetterPayload(
  order: Parameters<typeof buildPoSummary>[0],
  existingCoverLetter?: string,
) {
  return buildPoCoverLetterPayload(buildPoSummary(order), existingCoverLetter);
}
