"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import {
  addWarehouseBin,
  createBranch,
  createWarehouse,
  deleteBranch,
  deleteWarehouse,
  deleteWarehouseBin,
  getBranches,
  getWarehouses,
  updateBranch,
  updateWarehouse,
  updateWarehouseBin,
} from "@/services/organization";
import type {
  Branch,
  OrganizationFormData,
  OrganizationTab,
  Warehouse,
  WarehouseBin,
  WarehouseBinFormData,
} from "../types/organization";

const emptyOrganizationForm: OrganizationFormData = {
  name: "",
  code: "",
  address: "",
  phone: "",
  email: "",
  locationType: "CENTRAL",
  branchId: "",
};

const emptyBinForm: WarehouseBinFormData = {
  zone: "",
  binCode: "",
  isActive: true,
};

function buildBranchPayload(formData: OrganizationFormData) {
  return {
    name: formData.name,
    code: formData.code,
    address: formData.address,
    phone: formData.phone,
    email: formData.email,
  };
}

function buildWarehousePayload(formData: OrganizationFormData) {
  return {
    name: formData.name,
    code: formData.code,
    address: formData.address,
    locationType: formData.locationType,
    branchId: formData.branchId || undefined,
  };
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export function useOrganizationManager(defaultTab?: OrganizationTab) {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") as OrganizationTab | null;

  const [branches, setBranches] = useState<Branch[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<OrganizationTab>(
    tabParam === "branches" || tabParam === "warehouses"
      ? tabParam
      : defaultTab || "branches",
  );

  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [isWarehouseModalOpen, setIsWarehouseModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Branch | Warehouse | null>(null);
  const [formData, setFormData] = useState<OrganizationFormData>(emptyOrganizationForm);

  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const [isBinsModalOpen, setIsBinsModalOpen] = useState(false);
  const [editingBin, setEditingBin] = useState<WarehouseBin | null>(null);
  const [binFormData, setBinFormData] = useState<WarehouseBinFormData>(emptyBinForm);

  useEffect(() => {
    if (tabParam === "branches" || tabParam === "warehouses") {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const resetForm = useCallback(() => {
    setFormData(emptyOrganizationForm);
  }, []);

  const resetBinForm = useCallback(() => {
    setEditingBin(null);
    setBinFormData(emptyBinForm);
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [branchesRes, warehousesRes] = await Promise.all([getBranches(), getWarehouses()]);
      const nextBranches = (branchesRes.data || []) as Branch[];
      const nextWarehouses = (warehousesRes.data || []) as Warehouse[];
      setBranches(nextBranches);
      setWarehouses(nextWarehouses);
      setSelectedWarehouse((current) => {
        if (!current) return current;
        return nextWarehouses.find((warehouse) => warehouse.id === current.id) || current;
      });
    } catch {
      toast.error("Failed to fetch organization data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openCreateBranch = () => {
    resetForm();
    setEditingItem(null);
    setIsBranchModalOpen(true);
  };

  const openCreateWarehouse = () => {
    resetForm();
    setEditingItem(null);
    setIsWarehouseModalOpen(true);
  };

  const openEditBranch = (branch: Branch) => {
    setEditingItem(branch);
    setFormData({
      ...emptyOrganizationForm,
      name: branch.name,
      code: branch.code,
      address: branch.address || "",
      phone: branch.phone || "",
      email: branch.email || "",
    });
    setIsBranchModalOpen(true);
  };

  const openEditWarehouse = (warehouse: Warehouse) => {
    setEditingItem(warehouse);
    setFormData({
      ...emptyOrganizationForm,
      name: warehouse.name,
      code: warehouse.code,
      address: warehouse.address || "",
      locationType: warehouse.locationType,
      branchId: warehouse.branchId || "",
    });
    setIsWarehouseModalOpen(true);
  };

  const closeBranchModal = () => {
    setIsBranchModalOpen(false);
  };

  const closeWarehouseModal = () => {
    setIsWarehouseModalOpen(false);
  };

  const saveBranch = async () => {
    try {
      const payload = buildBranchPayload(formData);
      if (editingItem) {
        await updateBranch(editingItem.id, payload);
        toast.success("Branch updated successfully");
      } else {
        await createBranch(payload);
        toast.success("Branch created successfully");
      }
      setIsBranchModalOpen(false);
      setEditingItem(null);
      resetForm();
      await fetchData();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to save branch"));
    }
  };

  const saveWarehouse = async () => {
    try {
      const payload = buildWarehousePayload(formData);
      if (editingItem) {
        await updateWarehouse(editingItem.id, payload);
        toast.success("Warehouse updated successfully");
      } else {
        await createWarehouse(payload);
        toast.success("Warehouse created successfully");
      }
      setIsWarehouseModalOpen(false);
      setEditingItem(null);
      resetForm();
      await fetchData();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to save warehouse"));
    }
  };

  const deleteBranchById = async (id: string) => {
    if (!confirm("Are you sure? This will remove the branch.")) return;
    try {
      await deleteBranch(id);
      toast.success("Branch deleted");
      await fetchData();
    } catch {
      toast.error("Failed to delete branch");
    }
  };

  const deleteWarehouseById = async (id: string) => {
    if (!confirm("Are you sure? This will remove the warehouse.")) return;
    try {
      await deleteWarehouse(id);
      toast.success("Warehouse deleted");
      await fetchData();
    } catch {
      toast.error("Failed to delete warehouse");
    }
  };

  const openManageBins = (warehouse: Warehouse) => {
    setSelectedWarehouse(warehouse);
    setIsBinsModalOpen(true);
    resetBinForm();
  };

  const closeBinsModal = () => {
    setIsBinsModalOpen(false);
    setSelectedWarehouse(null);
  };

  const openEditBin = (bin: WarehouseBin) => {
    setEditingBin(bin);
    setBinFormData({
      zone: bin.zone,
      binCode: bin.binCode,
      isActive: bin.isActive,
    });
  };

  const saveBin = async () => {
    if (!selectedWarehouse) return;
    try {
      if (editingBin) {
        await updateWarehouseBin(editingBin.id, binFormData);
        toast.success("Bin updated successfully");
      } else {
        await addWarehouseBin(selectedWarehouse.id, binFormData);
        toast.success("Bin added successfully");
      }
      resetBinForm();
      await fetchData();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to save bin"));
    }
  };

  const deleteBinById = async (binId: string) => {
    if (!confirm("Are you sure? This will remove the bin.")) return;
    try {
      await deleteWarehouseBin(binId);
      toast.success("Bin deleted successfully");
      await fetchData();
    } catch {
      toast.error("Failed to delete bin");
    }
  };

  return {
    activeTab,
    setActiveTab,
    branches,
    warehouses,
    loading,
    formData,
    setFormData,
    editingItem,
    isBranchModalOpen,
    isWarehouseModalOpen,
    openCreateBranch,
    openCreateWarehouse,
    openEditBranch,
    openEditWarehouse,
    closeBranchModal,
    closeWarehouseModal,
    saveBranch,
    saveWarehouse,
    deleteBranchById,
    deleteWarehouseById,
    selectedWarehouse,
    isBinsModalOpen,
    editingBin,
    binFormData,
    setBinFormData,
    openManageBins,
    closeBinsModal,
    openEditBin,
    resetBinForm,
    saveBin,
    deleteBinById,
  };
}
