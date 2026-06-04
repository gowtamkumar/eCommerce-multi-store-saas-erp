export type OrganizationTab = "branches" | "warehouses";

export type WarehouseLocationType = "CENTRAL" | "REGIONAL" | "TRANSIT" | "RETAIL";

export interface Branch {
  id: string;
  name: string;
  code: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  isActive?: boolean;
}

export interface WarehouseBin {
  id: string;
  zone: string;
  binCode: string;
  isActive: boolean;
}

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  locationType: WarehouseLocationType;
  address?: string | null;
  branchId?: string | null;
  branch?: Branch | null;
  bins?: WarehouseBin[];
  isActive?: boolean;
}

export interface OrganizationFormData {
  name: string;
  code: string;
  address: string;
  phone: string;
  email: string;
  locationType: WarehouseLocationType;
  branchId: string;
}

export interface WarehouseBinFormData {
  zone: string;
  binCode: string;
  isActive: boolean;
}
