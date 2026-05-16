import { fetchAPI } from './api';

// --- Suppliers ---
export async function getSuppliers() {
  const res = await fetchAPI('/operations/procurement/suppliers');
  return res.data;
}

export async function createSupplier(data: any) {
  const res = await fetchAPI('/operations/procurement/suppliers', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res.data;
}

// --- Purchase Orders ---
export async function createPurchaseOrder(data: any) {
  const res = await fetchAPI('/operations/procurement/orders', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res.data;
}

// --- GRN ---
export async function processGRN(data: any) {
  const res = await fetchAPI('/operations/procurement/grn', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res.data;
}
