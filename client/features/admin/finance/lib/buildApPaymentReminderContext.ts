import type { ApAgingRow, UnpaidInvoice } from "../types";

export function getApOverdueAmount(row: ApAgingRow): number {
  return (
    Number(row.aging["1-30"] || 0) +
    Number(row.aging["31-60"] || 0) +
    Number(row.aging["61-90"] || 0) +
    Number(row.aging["90+"] || 0)
  );
}

export function getOldestApAgingBucket(row: ApAgingRow): string {
  if (Number(row.aging["90+"]) > 0) return "90+ days overdue";
  if (Number(row.aging["61-90"]) > 0) return "61-90 days overdue";
  if (Number(row.aging["31-60"]) > 0) return "31-60 days overdue";
  if (Number(row.aging["1-30"]) > 0) return "1-30 days overdue";
  return "Not yet due";
}

export function buildSupplierApSummary(row: ApAgingRow): string {
  const overdueAmount = getApOverdueAmount(row);

  return [
    "Context: supplier AP aging row",
    `Supplier: ${row.supplierName}`,
    row.email ? `Email: ${row.email}` : null,
    row.phone ? `Phone: ${row.phone}` : null,
    `Total outstanding: ${row.totalOutstanding}`,
    `Overdue amount (excl. not-yet-due): ${overdueAmount}`,
    `Oldest overdue bucket: ${getOldestApAgingBucket(row)}`,
    "",
    "Aging buckets:",
    `- Not yet due: ${row.aging.current}`,
    `- 1-30 days: ${row.aging["1-30"]}`,
    `- 31-60 days: ${row.aging["31-60"]}`,
    `- 61-90 days: ${row.aging["61-90"]}`,
    `- 90+ days: ${row.aging["90+"]}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildBatchApSummary(invoices: UnpaidInvoice[]): string {
  const totalOutstanding = invoices.reduce(
    (sum, invoice) => sum + (Number(invoice.totalAmount) - Number(invoice.paidAmount || 0)),
    0,
  );
  const supplierNames = [...new Set(invoices.map((invoice) => invoice.supplier?.name || "Unknown"))];

  return [
    "Context: batch payment approval request",
    `Selected invoices: ${invoices.length}`,
    `Total outstanding selected: ${totalOutstanding}`,
    `Suppliers involved: ${supplierNames.join(", ")}`,
  ].join("\n");
}

function getOutstandingAmount(invoice: UnpaidInvoice): number {
  return Number(invoice.totalAmount) - Number(invoice.paidAmount || 0);
}

function getDaysOverdue(dueDate: string): number {
  const due = new Date(dueDate);
  if (Number.isNaN(due.getTime())) return 0;
  const diff = Date.now() - due.getTime();
  return diff > 0 ? Math.ceil(diff / (1000 * 60 * 60 * 24)) : 0;
}

export function buildUnpaidInvoicesSummary(invoices: UnpaidInvoice[]): string {
  if (!invoices.length) {
    return "No unpaid supplier invoice lines provided.";
  }

  const lines = [`Unpaid supplier invoices (${invoices.length}):`];

  invoices.forEach((invoice, index) => {
    const outstanding = getOutstandingAmount(invoice);
    const daysOverdue = getDaysOverdue(invoice.dueDate);
    lines.push(
      `${index + 1}. ${invoice.invoiceNumber} | ${invoice.supplier?.name || "Supplier"} | outstanding ${outstanding} | due ${new Date(invoice.dueDate).toISOString().slice(0, 10)}${daysOverdue > 0 ? ` | ${daysOverdue} days overdue` : ""} | match ${invoice.matchStatus} | status ${invoice.status}`,
    );
  });

  return lines.join("\n");
}

export function buildApPaymentReminderPayload(
  apSummary: string,
  invoicesSummary: string,
  existingDraft?: string,
) {
  return {
    apSummary,
    invoicesSummary,
    existingDraft: existingDraft?.trim() || undefined,
  };
}

export function buildSupplierApReminderContext(
  row: ApAgingRow,
  unpaidInvoices: UnpaidInvoice[] = [],
) {
  const supplierInvoices = unpaidInvoices.filter(
    (invoice) =>
      invoice.supplierId === row.supplierId &&
      invoice.status !== "PAID" &&
      invoice.status !== "CANCELLED",
  );

  return buildApPaymentReminderPayload(
    buildSupplierApSummary(row),
    supplierInvoices.length
      ? buildUnpaidInvoicesSummary(supplierInvoices)
      : "Invoice-level detail not loaded — refer to aging bucket totals in AP summary.",
  );
}

export function buildBatchApReminderContext(invoices: UnpaidInvoice[]) {
  return buildApPaymentReminderPayload(
    buildBatchApSummary(invoices),
    buildUnpaidInvoicesSummary(invoices),
  );
}

export function filterOverdueUnpaidInvoices(invoices: UnpaidInvoice[]): UnpaidInvoice[] {
  return invoices.filter(
    (invoice) =>
      invoice.status !== "PAID" &&
      invoice.status !== "CANCELLED" &&
      getDaysOverdue(invoice.dueDate) > 0,
  );
}
