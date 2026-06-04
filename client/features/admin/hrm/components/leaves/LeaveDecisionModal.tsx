'use client';

import { Dispatch, ReactNode, SetStateAction } from 'react';
import { Loader2, ThumbsDown, ThumbsUp } from 'lucide-react';
import Modal from '@/components/shared/Modal';
import FormField, { fieldControlClass } from '@/components/shared/FormField';
import {
  ApproveFormData,
  LeaveDecision,
  LeaveDecisionTarget,
  LeaveEmployee,
} from '../../hooks/useLeaveVault';

interface DecisionCopy {
  title: ReactNode;
  managerLabel: string;
  noteLabel: string;
  notePlaceholder: string;
  confirmLabel: string;
  icon: typeof ThumbsUp;
  buttonClass: string;
}

const DECISION_COPY: Record<LeaveDecision, DecisionCopy> = {
  approve: {
    title: <>Final <span className="text-emerald-600">Decision</span></>,
    managerLabel: 'Approving Manager',
    noteLabel: 'Manager Context (Optional)',
    notePlaceholder: 'Add any specific instructions or notes...',
    confirmLabel: 'Confirm Approval',
    icon: ThumbsUp,
    buttonClass: 'bg-emerald-600 hover:bg-emerald-700',
  },
  reject: {
    title: <>Reject <span className="text-rose-600">Application</span></>,
    managerLabel: 'Rejecting Manager',
    noteLabel: 'Rejection Reason',
    notePlaceholder: 'Explain the reason for rejecting this leave application...',
    confirmLabel: 'Confirm Rejection',
    icon: ThumbsDown,
    buttonClass: 'bg-rose-600 hover:bg-rose-700',
  },
};

interface LeaveDecisionModalProps {
  target: LeaveDecisionTarget | null;
  onClose: () => void;
  employees: LeaveEmployee[];
  approveData: ApproveFormData;
  setApproveData: Dispatch<SetStateAction<ApproveFormData>>;
  submitting: boolean;
  onConfirm: () => void;
}

export default function LeaveDecisionModal({
  target,
  onClose,
  employees,
  approveData,
  setApproveData,
  submitting,
  onConfirm,
}: LeaveDecisionModalProps) {
  const copy = target ? DECISION_COPY[target.type] : null;
  const Icon = copy?.icon;

  return (
    <Modal open={!!target} onClose={onClose} title={copy?.title}>
      {copy && Icon && (
        <div className="space-y-6">
          <FormField label={copy.managerLabel}>
            <select
              value={approveData.approvedById}
              onChange={(e) => setApproveData((prev) => ({ ...prev, approvedById: e.target.value }))}
              className={fieldControlClass}
            >
              <option value="">Select Manager...</option>
              {employees.map((e) => <option key={e.id} value={e.id}>{e.user?.name}</option>)}
            </select>
          </FormField>

          <FormField label={copy.noteLabel}>
            <textarea
              value={approveData.managerNote}
              onChange={(e) => setApproveData((prev) => ({ ...prev, managerNote: e.target.value }))}
              className={`${fieldControlClass} h-24 resize-none`}
              placeholder={copy.notePlaceholder}
            />
          </FormField>

          <button
            onClick={onConfirm}
            disabled={submitting || !approveData.approvedById}
            className={`w-full py-4 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 ${copy.buttonClass}`}
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Icon className="w-4 h-4" />}
            {copy.confirmLabel}
          </button>
        </div>
      )}
    </Modal>
  );
}
