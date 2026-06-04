'use client';

import { Dispatch, SetStateAction } from 'react';
import { ChevronRight, Loader2 } from 'lucide-react';
import Modal from '@/components/shared/Modal';
import FormField, { fieldControlClass } from '@/components/shared/FormField';
import { LeaveEmployee, LeaveFormData, LeaveType } from '../../hooks/useLeaveVault';

interface LeaveRequestModalProps {
  open: boolean;
  onClose: () => void;
  employees: LeaveEmployee[];
  formData: LeaveFormData;
  setFormData: Dispatch<SetStateAction<LeaveFormData>>;
  computedDays: number;
  submitting: boolean;
  onSubmit: () => void;
}

export default function LeaveRequestModal({
  open,
  onClose,
  employees,
  formData,
  setFormData,
  computedDays,
  submitting,
  onSubmit,
}: LeaveRequestModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={<>New <span className="text-indigo-600">Application</span></>}
    >
      <div className="space-y-6">
        <FormField label="Personnel Selection">
          <select
            value={formData.employeeId}
            onChange={(e) => setFormData((prev) => ({ ...prev, employeeId: e.target.value }))}
            className={fieldControlClass}
          >
            <option value="">Select Employee...</option>
            {employees.map((e) => <option key={e.id} value={e.id}>{e.user?.name}</option>)}
          </select>
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Type">
            <select
              value={formData.leaveType}
              onChange={(e) => setFormData((prev) => ({ ...prev, leaveType: e.target.value as LeaveType }))}
              className={fieldControlClass}
            >
              {Object.values(LeaveType).map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </FormField>
          <FormField label="Computed Duration">
            <div className={`${fieldControlClass} text-indigo-600 dark:text-indigo-400 font-black`}>
              {computedDays} day(s)
            </div>
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Start Date">
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))}
              className={fieldControlClass}
            />
          </FormField>
          <FormField label="End Date">
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData((prev) => ({ ...prev, endDate: e.target.value }))}
              className={fieldControlClass}
            />
          </FormField>
        </div>

        <FormField label="Reason / Context">
          <textarea
            value={formData.reason}
            onChange={(e) => setFormData((prev) => ({ ...prev, reason: e.target.value }))}
            className={`${fieldControlClass} h-24 resize-none`}
            placeholder="Explain the necessity for this leave..."
          />
        </FormField>

        <button
          onClick={onSubmit}
          disabled={submitting || !formData.employeeId || !formData.reason}
          className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
          Submit Application
        </button>
      </div>
    </Modal>
  );
}
