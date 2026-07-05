import { Trash2 } from 'lucide-react';
import { DataTableColumn } from '@/components/shared/DataTable';
import { TaxBracket } from '../../hooks/useTaxBrackets';
import { useSettings } from '@/hooks/SettingsContext';
import { formatCurrency } from '@/lib/utils';

export function useTaxBracketColumns(
  onDelete: (id: string) => void,
): DataTableColumn<TaxBracket>[] {
  const { selectedCurrency } = useSettings();
  const currencySymbol = selectedCurrency?.symbol || '$';

  return [
    {
      key: 'range',
      header: 'Range',
      cell: (bracket) => (
        <>
          <p className="text-sm font-black text-slate-900 dark:text-white">
            {formatCurrency(bracket.minAmount, currencySymbol)} - {bracket.maxAmount === null ? 'No limit' : formatCurrency(bracket.maxAmount, currencySymbol)}
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
      cell: (bracket) => formatCurrency(bracket.flatTax || 0, currencySymbol),
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
