'use client';

import { useMemo } from 'react';
import DataTable from '@/components/shared/DataTable';
import { Plus, Receipt } from 'lucide-react';
import { useTaxBrackets } from '../hooks/useTaxBrackets';
import TaxBracketStats from './tax-brackets/TaxBracketStats';
import TaxBracketFormModal from './tax-brackets/TaxBracketFormModal';
import { buildTaxBracketColumns } from './tax-brackets/taxBracketColumns';

export default function TaxBracketsPage() {
  const {
    loading,
    submitting,
    fiscalYear,
    setFiscalYear,
    brackets,
    effectiveRate,
    showForm,
    setShowForm,
    formData,
    setFormData,
    openCreateForm,
    handleCreate,
    handleDelete,
  } = useTaxBrackets();

  const columns = useMemo(() => buildTaxBracketColumns(handleDelete), [handleDelete]);

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight italic uppercase leading-none">
            Tax <span className="text-indigo-600">Brackets</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-2">
            Configure tenant-specific payroll income tax rates per fiscal year
          </p>
        </div>
        <button
          onClick={openCreateForm}
          className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all hover:scale-105 active:scale-95 shadow-xl"
        >
          <Plus className="w-4 h-4" />
          Add Bracket
        </button>
      </div>

      <TaxBracketStats
        fiscalYear={fiscalYear}
        setFiscalYear={setFiscalYear}
        bracketCount={brackets.length}
        effectiveRate={effectiveRate}
      />

      <DataTable
        data={brackets}
        columns={columns}
        getRowKey={(b) => b.id}
        loading={loading}
        loadingLabel="Loading tax brackets..."
        emptyLabel={
          <div className="flex flex-col items-center gap-2">
            <Receipt className="w-12 h-12 text-slate-200" />
            <p className="text-sm font-bold text-slate-400 italic uppercase">No tax brackets configured</p>
          </div>
        }
        containerClassName="rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-700"
        rowClassName="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-all group"
        minWidthClassName="min-w-[640px]"
      />

      <TaxBracketFormModal
        open={showForm}
        onClose={() => setShowForm(false)}
        formData={formData}
        setFormData={setFormData}
        submitting={submitting}
        onSubmit={handleCreate}
      />
    </div>
  );
}
