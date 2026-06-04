import { PayrollBatch } from '../../hooks/usePayrollManager';

export const PAYROLL_STATUS_STYLES: Record<string, string> = {
  DRAFT: 'bg-slate-100 text-slate-600',
  PENDING_APPROVAL: 'bg-amber-50 text-amber-700',
  APPROVED: 'bg-blue-50 text-blue-700',
  PAID: 'bg-emerald-50 text-emerald-700',
  CANCELLED: 'bg-rose-50 text-rose-700',
};

export const formatPayrollStatus = (status?: string) => status?.replace('_', ' ') || 'Unknown';

export const getPayrollStatusClassName = (status?: string) =>
  PAYROLL_STATUS_STYLES[status || ''] || 'bg-slate-100 text-slate-600';

export const getPaymentActionLabel = (batch: PayrollBatch | null, processing: boolean) => {
  if (processing) return 'Processing...';
  if (!batch) return 'Release Payment';
  if (batch.status === 'PAID') return 'Settled';
  if (batch.status === 'APPROVED') return 'Release Payment';
  return 'Awaiting Approval';
};

export const getPayrollStatusCounts = (batches: PayrollBatch[]) => [
  {
    label: 'Pending Approval',
    count: batches.filter((batch) => batch.status === 'PENDING_APPROVAL').length,
    color: 'text-amber-400',
  },
  {
    label: 'Approved (Awaiting Pay)',
    count: batches.filter((batch) => batch.status === 'APPROVED').length,
    color: 'text-blue-400',
  },
  {
    label: 'Settled',
    count: batches.filter((batch) => batch.status === 'PAID').length,
    color: 'text-emerald-400',
  },
];
