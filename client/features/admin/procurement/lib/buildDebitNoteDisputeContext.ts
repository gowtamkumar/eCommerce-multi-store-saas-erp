import type { DebitNote } from "../types";
import type { PurchaseOrder } from "@/features/admin/purchase/types";
import type { Supplier } from "@/features/admin/supplier/types";

interface DraftDebitNoteForm {
  supplierId: string;
  purchaseOrderId: string;
  amount: string;
  reason: string;
}

export function buildDraftDebitNoteSummary(
  form: DraftDebitNoteForm,
  suppliers: Supplier[],
  purchaseOrders: PurchaseOrder[],
): string {
  const supplier = suppliers.find((entry) => entry.id === form.supplierId);
  const purchaseOrder = purchaseOrders.find((entry) => entry.id === form.purchaseOrderId);

  return [
    "Status: DRAFT (not yet submitted)",
    supplier ? `Supplier: ${supplier.name}` : "Supplier: not selected",
    purchaseOrder?.referenceNumber
      ? `PO reference: ${purchaseOrder.referenceNumber}`
      : "PO reference: not selected",
    form.amount ? `Adjustment amount: ${form.amount}` : "Adjustment amount: not entered",
    form.reason ? `Reason / return memo: ${form.reason}` : "Reason / return memo: not entered",
  ].join("\n");
}

export function buildDebitNoteSummary(note: DebitNote): string {
  return [
    `Debit note: ${note.debitNoteNumber}`,
    `Status: ${note.status}`,
    note.supplier?.name ? `Supplier: ${note.supplier.name}` : null,
    note.purchaseOrder?.referenceNumber
      ? `PO reference: ${note.purchaseOrder.referenceNumber}`
      : null,
    note.amount != null ? `Adjustment amount: ${note.amount}` : null,
    note.reason ? `Reason / return memo: ${note.reason}` : null,
    note.createdAt
      ? `Created: ${new Date(note.createdAt).toISOString().slice(0, 16).replace("T", " ")}`
      : null,
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildDebitNoteDisputePayload(
  debitNoteSummary: string,
  existingDisputeLetter?: string,
) {
  return {
    debitNoteSummary,
    existingDisputeLetter: existingDisputeLetter?.trim() || undefined,
  };
}

export function buildDraftDebitNoteDisputePayload(
  form: DraftDebitNoteForm,
  suppliers: Supplier[],
  purchaseOrders: PurchaseOrder[],
  existingDisputeLetter?: string,
) {
  return buildDebitNoteDisputePayload(
    buildDraftDebitNoteSummary(form, suppliers, purchaseOrders),
    existingDisputeLetter,
  );
}

export function buildExistingDebitNoteDisputePayload(
  note: DebitNote,
  existingDisputeLetter?: string,
) {
  return buildDebitNoteDisputePayload(buildDebitNoteSummary(note), existingDisputeLetter);
}
