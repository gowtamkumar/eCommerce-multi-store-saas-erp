import { Calendar, FileText, Mail } from 'lucide-react';
import { DataTableColumn } from '@/components/shared/DataTable';
import { Applicant, ApplicantStatus } from '../../hooks/useRecruitmentManager';
import { getApplicantStatusClassName } from './recruitmentUi';

interface BuildApplicantColumnsArgs {
  onStatusChange: (id: string, status: ApplicantStatus) => void;
  onScheduleInterview: (id: string) => void;
}

export function buildApplicantColumns({
  onStatusChange,
  onScheduleInterview,
}: BuildApplicantColumnsArgs): DataTableColumn<Applicant>[] {
  return [
    {
      key: 'applicant',
      header: 'Applicant Name',
      cell: (app) => (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 font-black italic">
            {app.firstName.charAt(0)}
          </div>
          <div>
            <p className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-sm">
              {`${app.firstName} ${app.lastName}`}
            </p>
            <div className="flex gap-2 mt-1">
              <Mail className="w-3 h-3 text-slate-300" />
              <span className="text-[10px] font-bold text-slate-400 tracking-tight">{app.email}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'position',
      header: 'Target Position',
      cell: (app) => (
        <p className="text-sm font-black text-slate-900 dark:text-white italic uppercase">{app.jobPosting?.title}</p>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (app) => (
        <select
          value={app.status}
          onChange={(e) => onStatusChange(app.id, e.target.value as ApplicantStatus)}
          className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border outline-none ${getApplicantStatusClassName(app.status)}`}
        >
          {Object.values(ApplicantStatus).map((status) => <option key={status} value={status}>{status}</option>)}
        </select>
      ),
    },
    {
      key: 'date',
      header: 'Application Date',
      cell: (app) => (
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          {new Date(app.createdAt).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      ),
    },
    {
      key: 'actions',
      header: 'Pipeline Control',
      headerClassName: 'text-right',
      className: 'text-right',
      cell: (app) => (
        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onScheduleInterview(app.id)}
            className="p-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
            title="Schedule Interview"
          >
            <Calendar className="w-4 h-4" />
          </button>
          <a
            href={app.resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-sm"
            title="View Resume"
          >
            <FileText className="w-4 h-4" />
          </a>
        </div>
      ),
    },
  ];
}
