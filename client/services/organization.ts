import { fetchAPI } from "./api";

export async function getBranches() {
  return fetchAPI("/system/branches");
}

export async function createBranch(data: any) {
  return fetchAPI("/system/branches", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateBranch(id: string, data: any) {
  return fetchAPI(`/system/branches/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteBranch(id: string) {
  return fetchAPI(`/system/branches/${id}`, {
    method: "DELETE",
  });
}

export async function getWarehouses() {
  return fetchAPI("/system/warehouses");
}

export async function createWarehouse(data: any) {
  return fetchAPI("/system/warehouses", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateWarehouse(id: string, data: any) {
  return fetchAPI(`/system/warehouses/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteWarehouse(id: string) {
  return fetchAPI(`/system/warehouses/${id}`, {
    method: "DELETE",
  });
}

export async function addWarehouseBin(warehouseId: string, data: any) {
  return fetchAPI(`/system/warehouses/${warehouseId}/bins`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}
