'use client';

import React, { useMemo } from 'react';
import {
  Receipt,
  Plus,
  Search,
  ChevronRight
} from 'lucide-react';
import DataTable, { DataTableColumn } from '@/components/shared/DataTable';
import { DebitNote, DebitNoteListPageProps } from '../types';
import { useSettings } from '@/hooks/SettingsContext';
import { formatCurrency } from '@/lib/utils';

export function DebitNoteListPage({
  debitNotes,
  loading,
  searchQuery,
  onSearchQueryChange,
  pagination,
  onSelectNote,
  onPageChange,
  onOpenCreateModal
}: DebitNoteListPageProps) {
  const { selectedCurrency } = useSettings();
  const currencySymbol = selectedCurrency?.symbol || '$';
  
  const filteredDebitNotes = useMemo(() => {
    return debitNotes.filter((n) =>
      n.debitNoteNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (n.supplier?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [debitNotes, searchQuery]);

  const columns = useMemo<DataTableColumn<DebitNote>[]>(() => [
    {
      key: 'debitNoteNumber',
      header: 'Note ID',
      cell: (note) => (
        <span className="text-xs font-black text-slate-900 dark:text-white font-mono">{note.debitNoteNumber}</span>
      ),
    },
    {
      key: 'supplier',
      header: 'Supplier',
      cell: (note) => (
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{note.supplier?.name || 'Unknown'}</span>
      ),
    },
    {
      key: 'purchaseOrder',
      header: 'PO Ref',
      cell: (note) => (
        <span className="font-mono text-xs text-slate-500">
          {note.purchaseOrder?.referenceNumber || 'Unlinked'}
        </span>
      ),
    },
    {
      key: 'amount',
      header: 'Adjustment Amount',
      cell: (note) => (
        <span className="font-mono text-xs font-black text-indigo-600">
          {formatCurrency(note.amount, currencySymbol)}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Issue Date',
      cell: (note) => (
        <span className="text-xs text-slate-500">
          {note.createdAt ? new Date(note.createdAt).toLocaleDateString() : 'N/A'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (note) => (
        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
          note.status === 'APPROVED'
            ? 'bg-emerald-100 text-emerald-600'
            : 'bg-slate-100 text-slate-600'
        }`}>
          {note.status}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Action',
      headerClassName: 'text-right',
      className: 'text-right',
      cell: () => (
        <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 transition-colors inline-block" />
      ),
    },
  ], [currencySymbol]);

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight italic uppercase">
            Debit <span className="text-indigo-600">Notes</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">
            Supplier Returns, Claims & Accounts Payable Ledger Deductions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500" />
            <input
              type="text"
              placeholder="Search debit notes..."
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all shadow-sm"
            />
          </div>
          <button
            onClick={onOpenCreateModal}
            className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> New Debit Note
          </button>
        </div>
      </div>

      <DataTable
        data={filteredDebitNotes}
        columns={columns}
        getRowKey={(note) => note.id}
        loading={loading}
        loadingLabel="Syncing ledger logs..."
        emptyLabel={
          <div className="flex flex-col items-center gap-2 py-6 opacity-40">
            <Receipt className="w-12 h-12 text-slate-300 dark:text-slate-700" />
            <p className="text-sm font-bold text-slate-400 italic uppercase">No debit notes found</p>
          </div>
        }
        containerClassName="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden"
        minWidthClassName="min-w-[1000px]"
        onRowClick={onSelectNote}
        pagination={{
          page: pagination.page,
          total: pagination.total,
          totalPages: pagination.totalPages,
          onPageChange: onPageChange,
        }}
        paginationSummary={
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest text-center sm:text-left">
            Page {pagination.page} of {pagination.totalPages}
          </p>
        }
      />
    </div>
  );
}
