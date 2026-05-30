import { fetchAPI } from "./api";

// --- Suppliers ---
export async function getSuppliers() {
  const res = await fetchAPI("/suppliers?limit=100");
  return Array.isArray(res.data) ? res.data : res.data?.items || [];
}

export async function createSupplier(data: any) {
  const res = await fetchAPI("/suppliers", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.data;
}

// --- Purchase Orders ---
export async function createPurchaseOrder(data: any) {
  const res = await fetchAPI("/purchase-orders", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function getPurchaseOrders() {
  const res = await fetchAPI("/purchase-orders?limit=100");
  return Array.isArray(res.data) ? res.data : res.data?.items || [];
}

// --- GRN ---
export async function processGRN(data: any) {
  const res = await fetchAPI("/operations/logistics/grn", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.data;
}

// --- Purchase Requisitions ---
export async function getRequisitions() {
  const res = await fetchAPI("/purchase-requisitions?limit=100");
  return res.data?.items || [];
}

export async function createRequisition(data: any) {
  const res = await fetchAPI("/purchase-requisitions", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function updateRequisitionStatus(
  id: string,
  status: string,
  rejectionReason?: string,
) {
  const res = await fetchAPI(`/purchase-requisitions/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status, rejectionReason }),
  });
  return res.data;
}

export async function convertPRToPO(
  id: string,
  supplierId: string,
  referenceNumber: string,
) {
  const res = await fetchAPI(`/purchase-requisitions/${id}/convert`, {
    method: "POST",
    body: JSON.stringify({ supplierId, referenceNumber }),
  });
  return res.data;
}

export async function deleteRequisition(id: string) {
  const res = await fetchAPI(`/purchase-requisitions/${id}`, {
    method: "DELETE",
  });
  return res.data;
}

// --- RFQs & Quotations ---
export async function getRFQs() {
  try {
    const res = await fetchAPI("/rfqs?limit=100");
    // Debug: log raw response for RFQ listing issues
    // eslint-disable-next-line no-console
    console.debug("getRFQs response:", res);
    return res?.data?.items || [];
  } catch (err) {
    // Log and return empty list so UI can render gracefully
    // eslint-disable-next-line no-console
    console.error("getRFQs failed:", err);
    return [];
  }
}

export async function createRFQ(data: any) {
  const res = await fetchAPI("/rfqs", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function submitQuotation(rfqId: string, data: any) {
  const res = await fetchAPI(`/rfqs/${rfqId}/quotations`, {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function awardQuotation(quotationId: string) {
  const res = await fetchAPI(`/rfqs/quotations/${quotationId}/award`, {
    method: "POST",
  });
  return res.data;
}

// --- Debit Notes ---
export async function getDebitNotes(page: number = 1, limit: number = 10, status: string = "") {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(status && { status }),
  });
  const res = await fetchAPI(`/debit-notes?${params.toString()}`);
  return res;
}

export async function createDebitNote(data: any) {
  const res = await fetchAPI("/debit-notes", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function approveDebitNote(id: string) {
  const res = await fetchAPI(`/debit-notes/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status: "APPROVED" }),
  });
  return res.data;
}

// --- Supplier Invoices ---
export async function getSupplierInvoices() {
  const res = await fetchAPI("/supplier-invoices?limit=100");
  return res.data?.items || [];
}

export async function createSupplierInvoice(data: any) {
  const res = await fetchAPI("/supplier-invoices", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function paySupplierInvoice(id: string, paymentData: any) {
  const res = await fetchAPI(`/supplier-invoices/${id}/payments`, {
    method: "POST",
    body: JSON.stringify(paymentData),
  });
  return res.data;
}
