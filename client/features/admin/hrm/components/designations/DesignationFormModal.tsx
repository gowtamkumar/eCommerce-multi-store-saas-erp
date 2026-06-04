'use client';

import { Loader2, Save } from 'lucide-react';
import Modal from '@/components/shared/Modal';
import FormField, { fieldControlClass } from '@/components/shared/FormField';
import { DesignationDepartment, DesignationFormData } from '../../types/designation';

interface DesignationFormModalProps {
  open: boolean;
  onClose: () => void;
  isEditing: boolean;
  submitting: boolean;
  formData: DesignationFormData;
  setFormData: (data: DesignationFormData) => void;
  departments: DesignationDepartment[];
  onSubmit: () => void;
}

export default function DesignationFormModal({
  open,
  onClose,
  isEditing,
  submitting,
  formData,
  setFormData,
  departments,
  onSubmit,
}: DesignationFormModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={<>{isEditing ? 'Edit' : 'New'} <span className="text-indigo-600">Designation</span></>}
    >
      <div className="space-y-6">
        <FormField label="Designation Title *">
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Senior Executive, Manager, Lead"
            className={fieldControlClass}
          />
        </FormField>
        <FormField label="Department *">
          <select
            value={formData.departmentId}
            onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
            className={fieldControlClass}
          >
            <option value="">Select Department</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>{dept.name}</option>
            ))}
          </select>
        </FormField>
        <FormField label="Grade Level">
          <input
            type="text"
            value={formData.grade || ''}
            onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
            placeholder="e.g. L1, L2, Executive, Senior"
            className={fieldControlClass}
          />
        </FormField>
        <FormField label="Salary Band">
          <input
            type="text"
            value={formData.salaryBand || ''}
            onChange={(e) => setFormData({ ...formData, salaryBand: e.target.value })}
            placeholder="e.g. $30k-$50k"
            className={fieldControlClass}
          />
        </FormField>
        <button
          onClick={onSubmit}
          disabled={submitting || !formData.name?.trim() || !formData.departmentId}
          className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isEditing ? 'Update Designation' : 'Create Designation'}
        </button>
      </div>
    </Modal>
  );
}
