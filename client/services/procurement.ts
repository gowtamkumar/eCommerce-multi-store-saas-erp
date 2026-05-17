import { fetchAPI } from './api';

// --- Suppliers ---
export async function getSuppliers() {
  const res = await fetchAPI('/suppliers?limit=100');
  return Array.isArray(res.data) ? res.data : (res.data?.items || []);
}

export async function createSupplier(data: any) {
  const res = await fetchAPI('/suppliers', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res.data;
}

// --- Purchase Orders ---
export async function createPurchaseOrder(data: any) {
  const res = await fetchAPI('/purchase-orders', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res.data;
}

// --- GRN ---
export async function processGRN(data: any) {
  const res = await fetchAPI('/operations/logistics/grn', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res.data;
}
