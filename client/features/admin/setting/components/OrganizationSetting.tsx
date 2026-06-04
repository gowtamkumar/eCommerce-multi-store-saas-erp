"use client";

import { Loader2 } from "lucide-react";
import { useOrganizationManager } from "../hooks/useOrganizationManager";
import type { Branch, OrganizationTab, Warehouse } from "../types/organization";
import { BranchesPanel } from "./organization/BranchesPanel";
import { BranchFormModal } from "./organization/BranchFormModal";
import { OrganizationHeader } from "./organization/OrganizationHeader";
import { WarehouseBinsModal } from "./organization/WarehouseBinsModal";
import { WarehouseFormModal } from "./organization/WarehouseFormModal";
import { WarehousesPanel } from "./organization/WarehousesPanel";

export function OrganizationSetting({ defaultTab }: { defaultTab?: OrganizationTab }) {
  const organization = useOrganizationManager(defaultTab);

  if (organization.loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <OrganizationHeader activeTab={organization.activeTab} onTabChange={organization.setActiveTab} />

      {organization.activeTab === "branches" ? (
        <BranchesPanel
          branches={organization.branches}
          onCreate={organization.openCreateBranch}
          onEdit={organization.openEditBranch}
          onDelete={organization.deleteBranchById}
        />
      ) : (
        <WarehousesPanel
          warehouses={organization.warehouses}
          onCreate={organization.openCreateWarehouse}
          onEdit={organization.openEditWarehouse}
          onDelete={organization.deleteWarehouseById}
          onManageBins={organization.openManageBins}
        />
      )}

      <BranchFormModal
        open={organization.isBranchModalOpen}
        editingItem={organization.isBranchModalOpen ? (organization.editingItem as Branch | null) : null}
        formData={organization.formData}
        setFormData={organization.setFormData}
        onClose={organization.closeBranchModal}
        onSubmit={organization.saveBranch}
      />

      <WarehouseFormModal
        open={organization.isWarehouseModalOpen}
        editingItem={organization.isWarehouseModalOpen ? (organization.editingItem as Warehouse | null) : null}
        branches={organization.branches}
        formData={organization.formData}
        setFormData={organization.setFormData}
        onClose={organization.closeWarehouseModal}
        onSubmit={organization.saveWarehouse}
      />

      <WarehouseBinsModal
        open={organization.isBinsModalOpen}
        warehouse={organization.selectedWarehouse}
        editingBin={organization.editingBin}
        formData={organization.binFormData}
        setFormData={organization.setBinFormData}
        onClose={organization.closeBinsModal}
        onSubmit={organization.saveBin}
        onEdit={organization.openEditBin}
        onDelete={organization.deleteBinById}
        onCancelEdit={organization.resetBinForm}
      />
    </div>
  );
}
