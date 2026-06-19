'use client';

import { Dispatch, SetStateAction } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import Modal from '@/components/shared/Modal';
import FormField, { fieldControlClass } from '@/components/shared/FormField';
import { JobFormData, RecruitmentDepartment } from '../../hooks/useRecruitmentManager';
import RecruitmentJobCopyAiAssist from './RecruitmentJobCopyAiAssist';

interface PostJobModalProps {
  open: boolean;
  onClose: () => void;
  departments: RecruitmentDepartment[];
  jobFormData: JobFormData;
  setJobFormData: Dispatch<SetStateAction<JobFormData>>;
  submitting: boolean;
  isValid: boolean;
  onSubmit: () => void;
}

export default function PostJobModal({
  open,
  onClose,
  departments,
  jobFormData,
  setJobFormData,
  submitting,
  isValid,
  onSubmit,
}: PostJobModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={<>Post <span className="text-indigo-600">Requirement</span></>}
      maxWidthClassName="max-w-2xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <FormField label="Position Title">
          <input
            type="text"
            value={jobFormData.title}
            onChange={(e) => setJobFormData((prev) => ({ ...prev, title: e.target.value }))}
            className={fieldControlClass}
            placeholder="e.g. Senior Software Engineer"
          />
        </FormField>
        <FormField label="Department">
          <select
            value={jobFormData.departmentId}
            onChange={(e) => setJobFormData((prev) => ({ ...prev, departmentId: e.target.value }))}
            className={fieldControlClass}
          >
            <option value="">Select Dept...</option>
            {departments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}
          </select>
        </FormField>
        <FormField label="Salary Range">
          <input
            type="text"
            value={jobFormData.salaryRange}
            onChange={(e) => setJobFormData((prev) => ({ ...prev, salaryRange: e.target.value }))}
            className={fieldControlClass}
            placeholder="e.g. $80k - $120k"
          />
        </FormField>
        <FormField label="Work Setup">
          <select
            value={jobFormData.location}
            onChange={(e) => setJobFormData((prev) => ({ ...prev, location: e.target.value }))}
            className={fieldControlClass}
          >
            <option value="Remote">Remote</option>
            <option value="Hybrid">Hybrid</option>
            <option value="On-site">On-site</option>
          </select>
        </FormField>
      </div>

      <RecruitmentJobCopyAiAssist
        jobFormData={jobFormData}
        departments={departments}
        onApply={(result) =>
          setJobFormData((prev) => ({
            ...prev,
            description: result.jobDescription,
            requirements: result.requirements.join('\n'),
          }))
        }
      />

      <div className="space-y-6 mt-6">
        <FormField label="Job Description">
          <textarea
            value={jobFormData.description}
            onChange={(e) => setJobFormData((prev) => ({ ...prev, description: e.target.value }))}
            className={`${fieldControlClass} h-32 resize-none`}
          />
        </FormField>
        <FormField label="Key Requirements (One per line)">
          <textarea
            value={jobFormData.requirements}
            onChange={(e) => setJobFormData((prev) => ({ ...prev, requirements: e.target.value }))}
            className={`${fieldControlClass} h-32 resize-none`}
          />
        </FormField>

        <button
          onClick={onSubmit}
          disabled={submitting || !isValid}
          className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
          Publish Opening
        </button>
      </div>
    </Modal>
  );
}
