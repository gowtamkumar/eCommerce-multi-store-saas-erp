'use client';

import { LogIn, LogOut } from 'lucide-react';
import Modal from '@/components/shared/Modal';
import FormField, { fieldControlClass } from '@/components/shared/FormField';
import {
  ATTENDANCE_SOURCES,
  AttendanceEmployee,
  AttendanceSourceType,
} from '../../types/attendance';

interface ManualAttendanceModalProps {
  open: boolean;
  onClose: () => void;
  employees: AttendanceEmployee[];
  selectedEmp: string;
  onSelectEmp: (value: string) => void;
  manualSource: AttendanceSourceType;
  onSelectSource: (value: AttendanceSourceType) => void;
  isProcessing: boolean;
  onCheckIn: () => void;
  onCheckOut: () => void;
}

export default function ManualAttendanceModal({
  open,
  onClose,
  employees,
  selectedEmp,
  onSelectEmp,
  manualSource,
  onSelectSource,
  isProcessing,
  onCheckIn,
  onCheckOut,
}: ManualAttendanceModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={<>Manual <span className="text-indigo-600">Entry</span></>}
    >
      <div className="space-y-6">
        <FormField label="Select Employee">
          <select
            className={`${fieldControlClass} appearance-none`}
            onChange={(e) => onSelectEmp(e.target.value)}
            value={selectedEmp}
          >
            <option value="">Choose Personnel...</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>{e.user?.name || e.user?.email || e.id}</option>
            ))}
          </select>
        </FormField>

        <FormField label="Source">
          <div className="grid grid-cols-5 gap-2">
            {ATTENDANCE_SOURCES.map((src) => (
              <button
                type="button"
                key={src}
                onClick={() => onSelectSource(src)}
                className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${manualSource === src
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-50 dark:bg-slate-900 text-slate-400 border border-slate-100 dark:border-slate-700 hover:text-indigo-600'
                  }`}
              >
                {src}
              </button>
            ))}
          </div>
        </FormField>

        <div className="flex gap-4">
          <button
            onClick={onCheckIn}
            disabled={!selectedEmp || isProcessing}
            className="flex-1 py-5 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <LogIn className="w-4 h-4" /> Check In
          </button>
          <button
            onClick={onCheckOut}
            disabled={!selectedEmp || isProcessing}
            className="flex-1 py-5 bg-rose-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-700 transition-all shadow-xl flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <LogOut className="w-4 h-4" /> Check Out
          </button>
        </div>
      </div>
    </Modal>
  );
}
