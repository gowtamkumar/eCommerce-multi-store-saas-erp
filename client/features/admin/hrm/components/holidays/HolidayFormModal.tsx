'use client';

import { Dispatch, SetStateAction } from 'react';
import { CheckCircle2, Loader2, Trash2 } from 'lucide-react';
import Modal from '@/components/shared/Modal';
import FormField, { fieldControlClass } from '@/components/shared/FormField';
import { Holiday, HolidayBranch, HolidayForm } from '../../hooks/useHolidayManager';

interface HolidayFormModalProps {
  open: boolean;
  onClose: () => void;
  editingHoliday: Holiday | null;
  formData: HolidayForm;
  setFormData: Dispatch<SetStateAction<HolidayForm>>;
  branches: HolidayBranch[];
  submitting: boolean;
  onSubmit: () => void;
  onDelete: (holiday: Holiday) => void;
}

export default function HolidayFormModal({
  open,
  onClose,
  editingHoliday,
  formData,
  setFormData,
  branches,
  submitting,
  onSubmit,
  onDelete,
}: HolidayFormModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={<>{editingHoliday ? 'Edit' : 'Add'} <span className="text-indigo-600">Holiday</span></>}
      maxWidthClassName="max-w-xl"
    >
      <div className="space-y-5">
        <FormField label="Holiday Name">
          <input
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="e.g. Eid Holiday"
            className={fieldControlClass}
          />
        </FormField>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Date">
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
              className={fieldControlClass}
            />
          </FormField>
          <FormField label="Branch Scope">
            <select
              value={formData.branchId}
              onChange={(e) => setFormData((prev) => ({ ...prev, branchId: e.target.value }))}
              className={fieldControlClass}
            >
              <option value="">Global holiday</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>{branch.name}</option>
              ))}
            </select>
          </FormField>
        </div>

        <FormField label="Description">
          <textarea
            value={formData.description}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            className={`${fieldControlClass} h-24 resize-none`}
            placeholder="Optional notes for HR and payroll reviewers..."
          />
        </FormField>

        <button
          type="button"
          onClick={() => setFormData((prev) => ({ ...prev, isOptional: !prev.isOptional }))}
          className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700"
        >
          <span>
            <span className="block text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">Optional Holiday</span>
            <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Informational only, not a mandatory closure</span>
          </span>
          <span className={`w-12 h-6 rounded-full transition-all relative ${formData.isOptional ? 'bg-indigo-600' : 'bg-slate-300'}`}>
            <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${formData.isOptional ? 'right-1' : 'left-1'}`} />
          </span>
        </button>

        <div className="flex gap-3 pt-2">
          {editingHoliday && (
            <button
              onClick={() => onDelete(editingHoliday)}
              className="px-5 py-4 bg-rose-50 text-rose-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onSubmit}
            disabled={submitting || !formData.name.trim() || !formData.date}
            className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            Save Holiday
          </button>
        </div>
      </div>
    </Modal>
  );
}
