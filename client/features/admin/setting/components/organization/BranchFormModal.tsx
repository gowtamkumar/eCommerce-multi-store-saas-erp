"use client";

import type { FormEvent } from "react";
import FormField, { fieldControlClass } from "@/components/shared/FormField";
import Modal from "@/components/shared/Modal";
import type { Branch, OrganizationFormData } from "../../types/organization";

interface BranchFormModalProps {
  open: boolean;
  editingItem: Branch | null;
  formData: OrganizationFormData;
  setFormData: (data: OrganizationFormData) => void;
  onClose: () => void;
  onSubmit: () => void;
}

export function BranchFormModal({
  open,
  editingItem,
  formData,
  setFormData,
  onClose,
  onSubmit,
}: BranchFormModalProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <Modal open={open} onClose={onClose} title={editingItem ? "Edit Branch" : "New Branch"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Name">
          <input
            type="text"
            required
            value={formData.name}
            onChange={(event) => setFormData({ ...formData, name: event.target.value })}
            className={fieldControlClass}
            placeholder="Main Branch"
          />
        </FormField>
        <FormField label="Code">
          <input
            type="text"
            required
            value={formData.code}
            onChange={(event) => setFormData({ ...formData, code: event.target.value })}
            className={fieldControlClass}
            placeholder="BR-001"
          />
        </FormField>
        <FormField label="Address">
          <textarea
            value={formData.address}
            onChange={(event) => setFormData({ ...formData, address: event.target.value })}
            className={fieldControlClass}
            placeholder="123 Street..."
          />
        </FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Phone">
            <input
              type="text"
              value={formData.phone}
              onChange={(event) => setFormData({ ...formData, phone: event.target.value })}
              className={fieldControlClass}
            />
          </FormField>
          <FormField label="Email">
            <input
              type="email"
              value={formData.email}
              onChange={(event) => setFormData({ ...formData, email: event.target.value })}
              className={fieldControlClass}
            />
          </FormField>
        </div>
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
