'use client';

import { Dispatch, SetStateAction } from 'react';
import { Loader2, Video } from 'lucide-react';
import Modal from '@/components/shared/Modal';
import FormField, { fieldControlClass } from '@/components/shared/FormField';
import { InterviewFormData, RecruitmentEmployee } from '../../hooks/useRecruitmentManager';

interface ScheduleInterviewModalProps {
  applicantId: string | null;
  onClose: () => void;
  employees: RecruitmentEmployee[];
  interviewData: InterviewFormData;
  setInterviewData: Dispatch<SetStateAction<InterviewFormData>>;
  submitting: boolean;
  isValid: boolean;
  onSubmit: (applicantId: string) => void;
}

export default function ScheduleInterviewModal({
  applicantId,
  onClose,
  employees,
  interviewData,
  setInterviewData,
  submitting,
  isValid,
  onSubmit,
}: ScheduleInterviewModalProps) {
  return (
    <Modal
      open={!!applicantId}
      onClose={onClose}
      title={<>Schedule <span className="text-indigo-600">Interview</span></>}
    >
      <div className="space-y-6">
        <FormField label="Select Interviewer">
          <select
            value={interviewData.interviewerId}
            onChange={(e) => setInterviewData((prev) => ({ ...prev, interviewerId: e.target.value }))}
            className={fieldControlClass}
          >
            <option value="">Select Personnel...</option>
            {employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.user?.name}</option>)}
          </select>
        </FormField>
        <FormField label="Interview Date & Time">
          <input
            type="datetime-local"
            value={interviewData.interviewDate}
            onChange={(e) => setInterviewData((prev) => ({ ...prev, interviewDate: e.target.value }))}
            className={fieldControlClass}
          />
        </FormField>
        <FormField label="Meeting Link / Location">
          <input
            type="text"
            value={interviewData.location}
            onChange={(e) => setInterviewData((prev) => ({ ...prev, location: e.target.value }))}
            className={fieldControlClass}
          />
        </FormField>

        <button
          onClick={() => applicantId && onSubmit(applicantId)}
          disabled={submitting || !isValid}
          className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Video className="w-4 h-4" />}
          Confirm Interview
        </button>
      </div>
    </Modal>
  );
}
