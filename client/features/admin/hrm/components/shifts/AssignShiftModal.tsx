'use client';

import { Dispatch, SetStateAction } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import Modal from '@/components/shared/Modal';
import FormField, { fieldControlClass } from '@/components/shared/FormField';
import { AssignFormData, Shift, ShiftEmployee, formatTime12h } from '../../hooks/useShiftManager';

interface AssignShiftModalProps {
  open: boolean;
  onClose: () => void;
  employees: ShiftEmployee[];
  shifts: Shift[];
  assignData: AssignFormData;
  setAssignData: Dispatch<SetStateAction<AssignFormData>>;
  submitting: boolean;
  onSubmit: () => void;
}

export default function AssignShiftModal({
  open,
  onClose,
  employees,
  shifts,
  assignData,
  setAssignData,
  submitting,
  onSubmit,
}: AssignShiftModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={<>Assign <span className="text-indigo-600">Personnel</span></>}
    >
      <div className="space-y-6">
        <FormField label="Select Employee">
          <select
            value={assignData.employeeId}
            onChange={(e) => setAssignData((prev) => ({ ...prev, employeeId: e.target.value }))}
            className={`${fieldControlClass} appearance-none`}
          >
            <option value="">Select Employee...</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>{emp.user?.name} ({emp.designation?.name})</option>
            ))}
          </select>
        </FormField>

        <FormField label="Select Shift Template">
          <select
            value={assignData.shiftId}
            onChange={(e) => setAssignData((prev) => ({ ...prev, shiftId: e.target.value }))}
            className={`${fieldControlClass} appearance-none`}
          >
            <option value="">Select Template...</option>
            {shifts.map((s) => (
              <option key={s.id} value={s.id}>{s.name} ({formatTime12h(s.startTime)} - {formatTime12h(s.endTime)})</option>
            ))}
          </select>
        </FormField>

        <FormField label="Effective From">
          <input
            type="date"
            value={assignData.effectiveFrom}
            onChange={(e) => setAssignData((prev) => ({ ...prev, effectiveFrom: e.target.value }))}
            className={fieldControlClass}
          />
        </FormField>

        <button
          onClick={onSubmit}
          disabled={submitting || !assignData.employeeId || !assignData.shiftId}
          className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
          Assign Schedule
        </button>
      </div>
    </Modal>
  );
}
