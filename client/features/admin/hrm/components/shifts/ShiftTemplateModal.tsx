'use client';

import { Dispatch, SetStateAction } from 'react';
import { Loader2, Save } from 'lucide-react';
import Modal from '@/components/shared/Modal';
import FormField, { fieldControlClass } from '@/components/shared/FormField';
import { ShiftFormData } from '../../hooks/useShiftManager';
import { DAYS } from './shiftDays';

interface ShiftTemplateModalProps {
  open: boolean;
  onClose: () => void;
  editing: boolean;
  shiftData: ShiftFormData;
  setShiftData: Dispatch<SetStateAction<ShiftFormData>>;
  toggleWorkingDay: (dayIdx: number) => void;
  submitting: boolean;
  onSubmit: () => void;
}

export default function ShiftTemplateModal({
  open,
  onClose,
  editing,
  shiftData,
  setShiftData,
  toggleWorkingDay,
  submitting,
  onSubmit,
}: ShiftTemplateModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={<>{editing ? 'Modify' : 'Create'} <span className="text-indigo-600">Shift</span></>}
    >
      <div className="space-y-6">
        <FormField label="Template Name">
          <input
            type="text"
            value={shiftData.name}
            onChange={(e) => setShiftData((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="e.g. Standard Day Shift"
            className={fieldControlClass}
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Start Time">
            <input
              type="time"
              step="1"
              value={shiftData.startTime}
              onChange={(e) => setShiftData((prev) => ({ ...prev, startTime: e.target.value }))}
              className={fieldControlClass}
            />
          </FormField>
          <FormField label="End Time">
            <input
              type="time"
              step="1"
              value={shiftData.endTime}
              onChange={(e) => setShiftData((prev) => ({ ...prev, endTime: e.target.value }))}
              className={fieldControlClass}
            />
          </FormField>
        </div>

        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700">
          <div>
            <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">Night Shift</p>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Crosses midnight boundary</p>
          </div>
          <button
            onClick={() => setShiftData((prev) => ({ ...prev, isNightShift: !prev.isNightShift }))}
            className={`w-12 h-6 rounded-full transition-all relative ${shiftData.isNightShift ? 'bg-indigo-600' : 'bg-slate-300'}`}
          >
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${shiftData.isNightShift ? 'right-1' : 'left-1'}`} />
          </button>
        </div>

        <FormField label="Grace Period (Minutes)">
          <input
            type="number"
            value={shiftData.graceMinutes}
            onChange={(e) => setShiftData((prev) => ({ ...prev, graceMinutes: parseInt(e.target.value) || 0 }))}
            className={fieldControlClass}
          />
        </FormField>

        <FormField
          label="Working Days"
          hint={
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              Days marked off are treated as scheduled rest (not absences) by payroll.
            </p>
          }
        >
          <div className="grid grid-cols-7 gap-2">
            {DAYS.map((d) => {
              const active = (shiftData.workingDays || []).includes(d.idx);
              return (
                <button
                  type="button"
                  key={d.idx}
                  onClick={() => toggleWorkingDay(d.idx)}
                  className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${active ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-50 dark:bg-slate-900 text-slate-400 border border-slate-100 dark:border-slate-700 hover:text-indigo-600'}`}
                >
                  {d.label}
                </button>
              );
            })}
          </div>
        </FormField>

        <button
          onClick={onSubmit}
          disabled={submitting || !shiftData.name.trim()}
          className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Finalize Template
        </button>
      </div>
    </Modal>
  );
}
