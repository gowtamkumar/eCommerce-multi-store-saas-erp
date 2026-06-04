'use client';

import { useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import DataTable, { DataTableColumn } from '@/components/shared/DataTable';
import { Calculator, CheckCircle2, Loader2, Plus, Receipt, Trash2, TrendingUp, X } from 'lucide-react';
import { useTaxBrackets, TaxBracket } from '../hooks/useTaxBrackets';

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

  const fields: Array<{ label: string; key: keyof typeof formData; step?: string; placeholder?: string }> = [
    { label: 'Fiscal Year',        key: 'fiscalYear' },
    { label: 'Minimum Amount',     key: 'minAmount' },
    { label: 'Maximum Amount',     key: 'maxAmount',   placeholder: 'Leave empty for no limit' },
    { label: 'Rate (0.10 = 10%)',  key: 'rate',        step: '0.0001' },
    { label: 'Flat Tax',           key: 'flatTax' },
    { label: 'Sort Order',         key: 'sortOrder' },
  ];

  const columns = useMemo<DataTableColumn<TaxBracket>[]>(() => [
    {
      key: 'range',
      header: 'Range',
      cell: (bracket) => (
        <>
          <p className="text-sm font-black text-slate-900 dark:text-white">
            {Number(bracket.minAmount).toLocaleString()} – {bracket.maxAmount === null ? 'No limit' : Number(bracket.maxAmount).toLocaleString()}
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
          onClick={() => handleDelete(bracket.id)}
          className="p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-xl transition-all"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      ),
    },
  ], [handleDelete]);

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-8">
      {/* Header */}
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-6">
          <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600">
            <Receipt className="w-8 h-8" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Fiscal Year</p>
            <input
              type="number"
              value={fiscalYear}
              onChange={(e) => setFiscalYear(Number(e.target.value) || new Date().getFullYear())}
              className="w-32 bg-transparent text-3xl font-black text-slate-900 dark:text-white outline-none"
            />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-6">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600">
            <Calculator className="w-8 h-8" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Brackets</p>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white">{brackets.length}</h3>
          </div>
        </div>
        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white flex items-center gap-6 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/20 blur-[60px] rounded-full" />
          <div className="w-16 h-16 rounded-3xl bg-white/10 flex items-center justify-center text-indigo-400 relative z-10">
            <TrendingUp className="w-8 h-8" />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Avg Rate</p>
            <h3 className="text-3xl font-black">{(effectiveRate * 100).toFixed(2)}%</h3>
          </div>
        </div>
      </div>

      {/* Table */}
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

      {/* Create Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowForm(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-xl bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl p-8">
              <button onClick={() => setShowForm(false)} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all">
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-8 italic">
                Add <span className="text-indigo-600">Tax Bracket</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fields.map(({ label, key, step, placeholder }) => (
                  <div key={key} className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
                    <input
                      type="number"
                      step={step || '1'}
                      value={formData[key] as number | string}
                      onChange={(e) => setFormData((prev) => ({
                        ...prev,
                        [key]: key === 'maxAmount' ? e.target.value : Number(e.target.value),
                      }))}
                      placeholder={placeholder}
                      className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none"
                    />
                    {key === 'rate' && (formData.rate < 0 || formData.rate > 1) && (
                      <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wider ml-1">
                        Must be between 0 and 1 (e.g., 0.10 for 10%)
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={handleCreate}
                disabled={submitting || formData.rate < 0 || formData.rate > 1 || formData.minAmount < 0}
                className="w-full mt-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Save Tax Bracket
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
