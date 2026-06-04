import { ApplicantStatus, RecruitmentView } from '../../hooks/useRecruitmentManager';

export const getApplicantStatusClassName = (status: ApplicantStatus) => {
  if (status === ApplicantStatus.JOINED) return 'bg-emerald-50 text-emerald-700 border-emerald-100';
  if (status === ApplicantStatus.REJECTED) return 'bg-rose-50 text-rose-700 border-rose-100';
  if (status === ApplicantStatus.INTERVIEW) return 'bg-indigo-50 text-indigo-700 border-indigo-100';
  return 'bg-amber-50 text-amber-700 border-amber-100';
};

export const getPipelineDotClassName = (status: ApplicantStatus) => {
  if (status === ApplicantStatus.JOINED) return 'bg-emerald-500';
  if (status === ApplicantStatus.REJECTED) return 'bg-rose-500';
  if (status === ApplicantStatus.OFFER) return 'bg-indigo-500';
  return 'bg-amber-500';
};

export const getJobStatusClassName = (status: string) => {
  if (status === 'PUBLISHED' || status === 'Active') return 'bg-emerald-50 text-emerald-600 border border-emerald-100';
  if (status === 'DRAFT' || status === 'Draft') return 'bg-slate-100 text-slate-500 border border-slate-200';
  return 'bg-rose-50 text-rose-600 border border-rose-100';
};

export const getSearchPlaceholder = (view: RecruitmentView) =>
  `Search ${view === 'BOARD' ? 'open positions' : 'applicants'}...`;
