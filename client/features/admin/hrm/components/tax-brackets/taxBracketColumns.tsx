import { Trash2 } from 'lucide-react';
import { DataTableColumn } from '@/components/shared/DataTable';
import { TaxBracket } from '../../hooks/useTaxBrackets';

export function buildTaxBracketColumns(
  onDelete: (id: string) => void,
): DataTableColumn<TaxBracket>[] {
  return [
    {
      key: 'range',
      header: 'Range',
      cell: (bracket) => (
        <>
          <p className="text-sm font-black text-slate-900 dark:text-white">
            {Number(bracket.minAmount).toLocaleString()} - {bracket.maxAmount === null ? 'No limit' : Number(bracket.maxAmount).toLocaleString()}
          </p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Fiscal year {bracket.fiscalYear}</p>
        </>
      ),
    },
    {
      key: 'rate',
      header: 'Rate',
      cell: (bracket) => (
        <span className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl text-[10px] font-black uppercase tracking-widest">
          {(Number(bracket.rate) * 100).toFixed(2)}%
        </span>
      ),
    },
    {
      key: 'flatTax',
      header: 'Flat Tax',
      className: 'text-sm font-black text-slate-900 dark:text-white',
      cell: (bracket) => Number(bracket.flatTax || 0).toLocaleString(),
    },
    {
      key: 'order',
      header: 'Order',
      className: 'text-sm font-black text-slate-500',
      cell: (bracket) => bracket.sortOrder,
    },
    {
      key: 'actions',
      header: 'Actions',
      headerClassName: 'text-right',
      className: 'text-right',
      cell: (bracket) => (
        <button
          onClick={() => onDelete(bracket.id)}
          className="p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-xl transition-all"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      ),
    },
  ];
}
