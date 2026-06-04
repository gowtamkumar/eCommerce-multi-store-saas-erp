'use client';

import { Dispatch, SetStateAction } from 'react';
import { Loader2, Plus } from 'lucide-react';
import Modal from '@/components/shared/Modal';
import FormField, { fieldControlClass } from '@/components/shared/FormField';
import { ApplyFormData } from '../../hooks/useRecruitmentManager';

interface AddApplicantModalProps {
  jobId: string | null;
  onClose: () => void;
  applyFormData: ApplyFormData;
  setApplyFormData: Dispatch<SetStateAction<ApplyFormData>>;
  submitting: boolean;
  onSubmit: () => void;
}

export default function AddApplicantModal({
  jobId,
  onClose,
  applyFormData,
  setApplyFormData,
  submitting,
  onSubmit,
}: AddApplicantModalProps) {
  return (
    <Modal
      open={!!jobId}
      onClose={onClose}
      title={<>Add <span className="text-indigo-600">Applicant</span></>}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="First Name">
            <input
              type="text"
              value={applyFormData.firstName}
              onChange={(e) => setApplyFormData((prev) => ({ ...prev, firstName: e.target.value }))}
              className={`${fieldControlClass} py-3`}
              placeholder="John"
            />
          </FormField>
          <FormField label="Last Name">
            <input
              type="text"
              value={applyFormData.lastName}
              onChange={(e) => setApplyFormData((prev) => ({ ...prev, lastName: e.target.value }))}
              className={`${fieldControlClass} py-3`}
              placeholder="Doe"
            />
          </FormField>
        </div>
        <FormField label="Email Address">
          <input
            type="email"
            value={applyFormData.email}
            onChange={(e) => setApplyFormData((prev) => ({ ...prev, email: e.target.value }))}
            className={`${fieldControlClass} py-3`}
            placeholder="john@example.com"
          />
        </FormField>
        <FormField label="Phone Number">
          <input
            type="text"
            value={applyFormData.phone}
            onChange={(e) => setApplyFormData((prev) => ({ ...prev, phone: e.target.value }))}
            className={`${fieldControlClass} py-3`}
            placeholder="+1..."
          />
        </FormField>
        <FormField label="Source">
          <select
            value={applyFormData.source}
            onChange={(e) => setApplyFormData((prev) => ({ ...prev, source: e.target.value }))}
            className={`${fieldControlClass} py-3`}
          >
            <option value="LinkedIn">LinkedIn</option>
            <option value="Referral">Referral</option>
            <option value="Website">Website</option>
            <option value="Job Board">Job Board</option>
          </select>
        </FormField>

        <button
          onClick={onSubmit}
          disabled={submitting}
          className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl flex items-center justify-center gap-2 mt-4"
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Register Applicant
        </button>
      </div>
    </Modal>
  );
}
