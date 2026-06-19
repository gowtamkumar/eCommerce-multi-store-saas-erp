import { fetchAPI } from "@/services/api";
import type { ArAgingRow } from "@/features/admin/customer/type";

interface ArLedgerEntry {
  type?: string;
  amount?: number | string;
  dueDate?: string | null;
  createdAt?: string;
  referenceType?: string | null;
  referenceId?: string | null;
  balanceAfter?: number | string;
}

export function getOverdueAmount(row: ArAgingRow): number {
  return (
    Number(row.aging["1-30"] || 0) +
    Number(row.aging["31-60"] || 0) +
    Number(row.aging["61-90"] || 0) +
    Number(row.aging["90+"] || 0)
  );
}

export function getOldestAgingBucket(row: ArAgingRow): string {
  if (Number(row.aging["90+"]) > 0) return "90+ days overdue";
  if (Number(row.aging["61-90"]) > 0) return "61-90 days overdue";
  if (Number(row.aging["31-60"]) > 0) return "31-60 days overdue";
  if (Number(row.aging["1-30"]) > 0) return "1-30 days overdue";
  return "Current (not yet due)";
}

export function buildCustomerAgingSummary(row: ArAgingRow): string {
  const overdueAmount = getOverdueAmount(row);

  return [
    `Customer: ${row.customerName}`,
    `Email: ${row.customerEmail}`,
    row.companyName ? `Company: ${row.companyName}` : null,
    `Total outstanding: ${row.totalOutstanding}`,
    `Overdue amount (excl. current): ${overdueAmount}`,
    `Oldest overdue bucket: ${getOldestAgingBucket(row)}`,
    `Credit limit: ${row.creditLimit}`,
    row.creditHold ? "Credit hold: YES" : "Credit hold: no",
    "",
    "Aging buckets:",
    `- Current: ${row.aging.current}`,
    `- 1-30 days: ${row.aging["1-30"]}`,
    `- 31-60 days: ${row.aging["31-60"]}`,
    `- 61-90 days: ${row.aging["61-90"]}`,
    `- 90+ days: ${row.aging["90+"]}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildOverdueInvoicesSummary(entries: ArLedgerEntry[]): string {
  const now = Date.now();
  const invoices = entries.filter(
    (entry) => entry.type === "INVOICE" && Number(entry.amount) > 0,
  );

  if (!invoices.length) {
    return "No open invoice ledger lines found for this customer.";
  }

  const lines = [`Open invoice lines (${invoices.length}):`];

  invoices.forEach((invoice, index) => {
    const dueDate = invoice.dueDate ? new Date(invoice.dueDate) : null;
    const createdAt = invoice.createdAt ? new Date(invoice.createdAt) : null;
    const effectiveDue = dueDate || createdAt;
    const daysOverdue =
      effectiveDue && effectiveDue.getTime() < now
        ? Math.ceil((now - effectiveDue.getTime()) / (1000 * 60 * 60 * 24))
        : 0;

    const ref =
      invoice.referenceType && invoice.referenceId
        ? `${invoice.referenceType} ${invoice.referenceId}`
        : invoice.referenceId || "No reference";

    lines.push(
      `${index + 1}. ${ref} | amount ${invoice.amount}${effectiveDue ? ` | due ${effectiveDue.toISOString().slice(0, 10)}` : ""}${daysOverdue > 0 ? ` | ${daysOverdue} days overdue` : " | not yet due"}`,
    );
  });

  return lines.join("\n");
}

export async function gatherArCollectionContext(row: ArAgingRow) {
  let overdueInvoicesSummary = "Ledger detail unavailable.";

  try {
    const res = await fetchAPI(`/finance/ar/customer/${row.customerId}`);
    if (res.success && Array.isArray(res.data)) {
      overdueInvoicesSummary = buildOverdueInvoicesSummary(res.data);
    }
  } catch {
    overdueInvoicesSummary = "Failed to load customer AR ledger lines.";
  }

  return {
    customerSummary: buildCustomerAgingSummary(row),
    overdueInvoicesSummary,
  };
}

export function buildArCollectionDraftPayload(
  context: { customerSummary: string; overdueInvoicesSummary: string },
  existingDraft?: string,
) {
  return {
    customerSummary: context.customerSummary,
    overdueInvoicesSummary: context.overdueInvoicesSummary,
    existingDraft: existingDraft?.trim() || undefined,
  };
}
