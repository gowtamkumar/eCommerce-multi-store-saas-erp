'use client';

import { Loader2, Save } from 'lucide-react';
import Modal from '@/components/shared/Modal';
import FormField, { fieldControlClass } from '@/components/shared/FormField';
import { DepartmentFormData } from '../../types/department';

interface DepartmentFormModalProps {
  open: boolean;
  onClose: () => void;
  isEditing: boolean;
  submitting: boolean;
  formData: DepartmentFormData;
  setFormData: (data: DepartmentFormData) => void;
  onSubmit: () => void;
}

export default function DepartmentFormModal({
  open,
  onClose,
  isEditing,
  submitting,
  formData,
  setFormData,
  onSubmit,
}: DepartmentFormModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={<>{isEditing ? 'Edit' : 'New'} <span className="text-indigo-600">Department</span></>}
    >
      <div className="space-y-6">
        <FormField label="Department Name *">
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Finance, Logistics, Marketing"
            className={fieldControlClass}
          />
        </FormField>
        <FormField label="Department Code">
          <input
            type="text"
            value={formData.code || ''}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            placeholder="e.g. FIN, LOG, MKT"
            className={fieldControlClass}
          />
        </FormField>
        <FormField label="Description">
          <textarea
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Brief description of this department's role"
            rows={3}
            className={`${fieldControlClass} resize-none`}
          />
        </FormField>
        <button
          onClick={onSubmit}
          disabled={submitting || !formData.name?.trim()}
          className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isEditing ? 'Update Department' : 'Create Department'}
        </button>
      </div>
    </Modal>
  );
}
