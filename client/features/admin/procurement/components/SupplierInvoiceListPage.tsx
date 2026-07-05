'use client';

import React, { useMemo } from 'react';
import DataTable, { DataTableColumn } from '@/components/shared/DataTable';
import {
  FileText,
  Plus,
  Search,
  ChevronRight
} from 'lucide-react';
import type { SupplierInvoice, SupplierInvoiceListPageProps } from '../types';
import { useSettings } from '@/hooks/SettingsContext';
import { formatCurrency } from '@/lib/utils';

export default function SupplierInvoiceListPage({
  invoices,
  loading,
  searchQuery,
  onSearchQueryChange,
  onSelectInvoice,
  onOpenCreateModal,
}: SupplierInvoiceListPageProps) {
  const { selectedCurrency } = useSettings();
  const currencySymbol = selectedCurrency?.symbol || '$';

  const filteredInvoices = useMemo(() => {
    return invoices.filter((i) =>
      i.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (i.supplier?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [invoices, searchQuery]);

  const columns = useMemo<DataTableColumn<SupplierInvoice>[]>(() => [
    {
      key: 'invoiceNumber',
      header: 'Invoice ID',
      cell: (inv) => (
        <span className="text-xs font-black text-slate-900 dark:text-white font-mono">{inv.invoiceNumber}</span>
      ),
    },
    {
      key: 'supplier',
      header: 'Supplier',
      cell: (inv) => (
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{inv.supplier?.name || 'Unknown'}</span>
      ),
    },
    {
      key: 'purchaseOrder',
      header: 'PO Ref',
      cell: (inv) => (
        <span className="font-mono text-xs text-slate-500">
          {inv.purchaseOrder?.referenceNumber || 'Unlinked'}
        </span>
      ),
    },
    {
      key: 'totalAmount',
      header: 'Total Amount',
      cell: (inv) => (
        <>
          <span className="text-xs font-black text-slate-900 dark:text-white font-mono">{formatCurrency(inv.totalAmount, currencySymbol)}</span>
          <span className="text-[10px] text-slate-400 block font-semibold mt-0.5">Paid: {formatCurrency(inv.paidAmount, currencySymbol)}</span>
        </>
      ),
    },
    {
      key: 'matchStatus',
      header: '3-Way Match',
      cell: (inv) => (
        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
          inv.matchStatus === 'MATCHED'
            ? 'bg-emerald-100 text-emerald-600'
            : inv.matchStatus === 'DISCREPANCY'
            ? 'bg-rose-100 text-rose-600'
            : 'bg-amber-100 text-amber-600'
        }`}>
          {inv.matchStatus}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (inv) => (
        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
          inv.status === 'PAID'
            ? 'bg-emerald-100 text-emerald-600'
            : inv.status === 'DISCREPANCY'
            ? 'bg-rose-100 text-rose-600'
            : 'bg-slate-100 text-slate-600'
        }`}>
          {inv.status}
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
            Supplier <span className="text-indigo-600">Invoices</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">
            Accounts Payable Matching & Audit (3-Way Matching)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500" />
            <input
              type="text"
              placeholder="Search invoices..."
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all shadow-sm"
            />
          </div>
          <button
            onClick={onOpenCreateModal}
            className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Receive Invoice
          </button>
        </div>
      </div>

      <DataTable
        data={filteredInvoices}
        columns={columns}
        getRowKey={(inv) => inv.id}
        loading={loading}
        loadingLabel="Auditing ledger transactions..."
        emptyLabel={
          <div className="flex flex-col items-center gap-2 py-6 opacity-40">
            <FileText className="w-12 h-12 text-slate-300 dark:text-slate-700" />
            <p className="text-sm font-bold text-slate-400 italic uppercase">No supplier invoices found</p>
          </div>
        }
        containerClassName="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden"
        minWidthClassName="min-w-[1000px]"
        onRowClick={onSelectInvoice}
      />
    </div>
  );
}
