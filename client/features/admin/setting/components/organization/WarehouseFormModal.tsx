"use client";

import type { FormEvent } from "react";
import FormField, { fieldControlClass } from "@/components/shared/FormField";
import Modal from "@/components/shared/Modal";
import type { Branch, OrganizationFormData, Warehouse } from "../../types/organization";

interface WarehouseFormModalProps {
  open: boolean;
  editingItem: Warehouse | null;
  branches: Branch[];
  formData: OrganizationFormData;
  setFormData: (data: OrganizationFormData) => void;
  onClose: () => void;
  onSubmit: () => void;
}

export function WarehouseFormModal({
  open,
  editingItem,
  branches,
  formData,
  setFormData,
  onClose,
  onSubmit,
}: WarehouseFormModalProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <Modal open={open} onClose={onClose} title={editingItem ? "Edit Warehouse" : "New Warehouse"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Name">
          <input
            type="text"
            required
            value={formData.name}
            onChange={(event) => setFormData({ ...formData, name: event.target.value })}
            className={fieldControlClass}
            placeholder="Central Warehouse"
          />
        </FormField>
        <FormField label="Code">
          <input
            type="text"
            required
            value={formData.code}
            onChange={(event) => setFormData({ ...formData, code: event.target.value })}
            className={fieldControlClass}
            placeholder="WH-001"
          />
        </FormField>
        <FormField label="Location Type">
          <select
            value={formData.locationType}
            onChange={(event) => setFormData({ ...formData, locationType: event.target.value as OrganizationFormData["locationType"] })}
            className={fieldControlClass}
          >
            <option value="CENTRAL">Central</option>
            <option value="REGIONAL">Regional</option>
            <option value="TRANSIT">Transit</option>
            <option value="RETAIL">Retail Storefront</option>
          </select>
        </FormField>
        <FormField label="Linked Branch (Optional)">
          <select
            value={formData.branchId}
            onChange={(event) => setFormData({ ...formData, branchId: event.target.value })}
            className={fieldControlClass}
          >
            <option value="">No Linked Branch</option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Address">
          <textarea
            value={formData.address}
            onChange={(event) => setFormData({ ...formData, address: event.target.value })}
            className={fieldControlClass}
            placeholder="Warehouse location..."
          />
        </FormField>
        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-6 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold rounded-2xl hover:bg-slate-200 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 px-6 py-4 bg-brand-600 text-white font-bold rounded-2xl hover:bg-brand-700 shadow-lg shadow-brand-500/30 transition-all"
          >
            {editingItem ? "Update" : "Create"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
