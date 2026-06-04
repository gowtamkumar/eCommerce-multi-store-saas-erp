'use client';

import { EmployeeStatus } from '../../types/employee';

interface EmployeeStatusBadgeProps {
  status: EmployeeStatus;
}

const STATUS_STYLES: Record<EmployeeStatus, string> = {
  [EmployeeStatus.ACTIVE]: 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400',
  [EmployeeStatus.PROBATION]: 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400',
  [EmployeeStatus.ON_LEAVE]: 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400',
  [EmployeeStatus.TERMINATED]: 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-900/20 dark:text-rose-400',
  [EmployeeStatus.SUSPENDED]: 'bg-slate-50 text-slate-700 border-slate-100 dark:bg-slate-900/20 dark:text-slate-400',
};

export default function EmployeeStatusBadge({ status }: EmployeeStatusBadgeProps) {
  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${STATUS_STYLES[status]}`}>
      {status}
    </span>
  );
}
