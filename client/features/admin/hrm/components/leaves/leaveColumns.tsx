import { Calendar, ThumbsDown, ThumbsUp } from 'lucide-react';
import { DataTableColumn } from '@/components/shared/DataTable';
import { LeaveRequest, LeaveStatus } from '../../hooks/useLeaveVault';

const STATUS_STYLES: Record<LeaveStatus, string> = {
  [LeaveStatus.APPROVED]: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  [LeaveStatus.REJECTED]: 'bg-rose-50 text-rose-700 border-rose-100',
  [LeaveStatus.PENDING]: 'bg-amber-50 text-amber-700 border-amber-100',
};

const formatDay = (value: string) =>
  new Date(value).toLocaleDateString([], { month: 'short', day: 'numeric' });

interface BuildColumnsArgs {
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export function buildLeaveColumns({ onApprove, onReject }: BuildColumnsArgs): DataTableColumn<LeaveRequest>[] {
  return [
    {
      key: 'employee',
      header: 'Employee',
      cell: (request) => (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 font-black italic">
            {request.employee?.user?.name?.charAt(0)}
          </div>
          <div>
            <p className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-sm">
              {request.employee?.user?.name}
            </p>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
              {request.employee?.department?.name}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'leaveType',
      header: 'Leave Details',
      cell: (request) => (
        <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-black uppercase tracking-widest rounded-lg">
          {request.leaveType}
        </span>
      ),
    },
    {
      key: 'duration',
      header: 'Duration',
      cell: (request) => (
        <>
          <div className="flex items-center gap-2">
            <Calendar className="w-3 h-3 text-indigo-500" />
            <span className="text-sm font-black text-slate-900 dark:text-white italic">
              {request.totalDays} Days
            </span>
          </div>
          <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
            {formatDay(request.startDate)} → {formatDay(request.endDate)}
          </p>
        </>
      ),
    },
    {
      key: 'reason',
      header: 'Reason',
      cell: (request) => (
        <p
          className="text-xs font-bold text-slate-600 dark:text-slate-400 italic max-w-[200px] truncate"
          title={request.reason}
        >
          &ldquo;{request.reason}&rdquo;
        </p>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (request) => (
        <span
          className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${STATUS_STYLES[request.status]}`}
        >
          {request.status}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      headerClassName: 'text-right',
      className: 'text-right',
      cell: (request) => {
        if (request.status === LeaveStatus.PENDING) {
          return (
            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onApprove(request.id)}
                className="p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all"
                title="Approve"
              >
                <ThumbsUp className="w-4 h-4" />
              </button>
              <button
                onClick={() => onReject(request.id)}
                className="p-3 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all"
                title="Reject"
              >
                <ThumbsDown className="w-4 h-4" />
              </button>
            </div>
          );
        }
        return (
          <div className="flex flex-col items-end">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Decision By</p>
            <p className="text-[11px] font-bold text-slate-900 dark:text-white italic">
              {request.approvedBy?.user?.name || 'System'}
            </p>
          </div>
        );
      },
    },
  ];
}
