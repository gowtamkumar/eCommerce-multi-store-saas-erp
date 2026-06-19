'use client';

import DataTable, { DataTableColumn } from '@/components/shared/DataTable';
import React, { useMemo } from 'react';
import {
  Package, Search, AlertTriangle, XCircle, CheckCircle, Calendar, Plus, X,
  Edit2, Loader2, Clock, Save, ClipboardList, ShieldAlert
} from 'lucide-react';
import { useBatchRegistry, ProductBatch, BatchStatus } from '../hooks/useBatchRegistry';
import { useCreateBatch } from '../hooks/useCreateBatch';
import { useEditBatch } from '../hooks/useEditBatch';
import BatchWasteReductionPanel from './BatchWasteReductionPanel';

const getDaysRemaining = (expiryDateStr: string) => {
  const diffTime = new Date(expiryDateStr).getTime() - new Date().getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export default function BatchRegistry() {
  const {
    batches,
    loading,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    expiringSoonFilter,
    setExpiringSoonFilter,
    page,
    setPage,
    totalPages,
    totalItems,
    isCreateModalOpen,
    setIsCreateModalOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    selectedBatch,
    setSelectedBatch,
    sweeping,
    fetchBatches,
    handleSweepExpired,
    stats,
  } = useBatchRegistry();

  const columns = useMemo<DataTableColumn<ProductBatch>[]>(() => [
    {
      key: 'product',
      header: 'Product / Item Details',
      cell: (batch) => (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-600 flex items-center justify-center">
            {batch.product.images?.[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={batch.product.images[0]} alt="" className="w-full h-full object-cover" />
            ) : (
              <Package className="w-5 h-5 text-slate-400" />
            )}
          </div>
          <div>
            <p className="font-black text-slate-900 dark:text-white leading-tight uppercase tracking-tight">{batch.product.name}</p>
            {batch.variant && (
              <p className="text-[10px] text-slate-400 font-mono mt-0.5 uppercase tracking-tighter">
                {Object.values(batch.variant.combination || {}).join(' / ')}
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'batchNumber',
      header: 'Batch Number',
      className: 'font-mono font-black text-xs text-slate-700 dark:text-slate-300',
      cell: (batch) => batch.batchNumber,
    },
    {
      key: 'manufactured',
      header: 'Manufactured',
      className: 'text-xs text-slate-600 dark:text-slate-400 font-medium',
      cell: (batch) => batch.manufactureDate ? new Date(batch.manufactureDate).toLocaleDateString() : '-',
    },
    {
      key: 'expiry',
      header: 'Expiration Date',
      className: 'text-xs font-bold',
      cell: (batch) => {
        const daysLeft = getDaysRemaining(batch.expiryDate);
        const isSoon = daysLeft > 0 && daysLeft <= 30;
        const isPast = daysLeft <= 0;
        return (
          <div className="flex flex-col">
            <span>{new Date(batch.expiryDate).toLocaleDateString()}</span>
            {batch.status === 'ACTIVE' && isSoon && (
              <span className="text-[9px] text-orange-500 font-bold mt-0.5">Expiring in {daysLeft} days</span>
            )}
            {batch.status === 'ACTIVE' && isPast && (
              <span className="text-[9px] text-red-500 font-bold mt-0.5">Expired</span>
            )}
          </div>
        );
      },
    },
    {
      key: 'initialQty',
      header: 'Initial Qty',
      className: 'text-xs text-slate-600 dark:text-slate-400 font-mono',
      cell: (batch) => batch.initialQuantity,
    },
    {
      key: 'currentQty',
      header: 'Current Qty',
      className: 'font-mono text-xs font-bold text-slate-900 dark:text-white',
      cell: (batch) => batch.currentQuantity,
    },
    {
      key: 'status',
      header: 'Status',
      cell: (batch) => {
        const daysLeft = getDaysRemaining(batch.expiryDate);
        const isSoon = daysLeft > 0 && daysLeft <= 30;
        return (
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest border ${batch.status === 'ACTIVE'
            ? isSoon
              ? 'bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-950/30'
              : 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/30'
            : batch.status === 'EXPIRED'
              ? 'bg-red-50 text-red-600 border-red-200 dark:bg-red-950/30'
              : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800'
            }`}>
            {batch.status === 'ACTIVE' && isSoon ? 'Expiring Soon' : batch.status}
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      headerClassName: 'text-right',
      className: 'text-right',
      cell: (batch) => (
        <button
          onClick={() => {
            setSelectedBatch(batch);
            setIsEditModalOpen(true);
          }}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-xl text-slate-400 hover:text-brand-500 transition-all active:scale-90"
          title="Edit Batch"
        >
          <Edit2 className="w-4 h-4" />
        </button>
      ),
    },
  ], [setSelectedBatch, setIsEditModalOpen]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Upper header action bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Batch & Expiry Management</h2>
          <p className="text-xs text-slate-500 font-medium mt-1">Track product batches, manufacture/expiration dates, and FEFO stock allocations.</p>
          <p className="text-[10px] text-slate-400 font-medium mt-1 uppercase tracking-widest">
            ⓘ Auto-sweep runs daily at 02:00; expired batches are written off as DAMAGE entries automatically.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSweepExpired}
            disabled={sweeping}
            className="px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border-2 border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:border-red-500 hover:text-red-500 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
          >
            {sweeping ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldAlert className="w-4 h-4 text-red-500" />}
            Sweep Expired
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Register Batch
          </button>
        </div>
      </div>

      {/* Summary Widgets */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm transition-all hover:shadow-md group">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 rounded-xl transition-transform group-hover:scale-110">
              <ClipboardList className="w-5 h-5" />
            </div>
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Batches</p>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight font-mono">{stats.total}</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm transition-all hover:shadow-md group">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl transition-transform group-hover:scale-110">
              <CheckCircle className="w-5 h-5" />
            </div>
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active Batches</p>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight font-mono">{stats.active}</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border shadow-sm transition-all hover:shadow-md group border-orange-100 dark:border-orange-900/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-xl transition-transform group-hover:scale-110">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Expiring Soon</p>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight font-mono">{stats.nearExpiry}</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border shadow-sm transition-all hover:shadow-md group border-red-100 dark:border-red-900/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl transition-transform group-hover:scale-110">
              <XCircle className="w-5 h-5" />
            </div>
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Expired Batches</p>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight font-mono">{stats.expired}</p>
        </div>
      </div>

      <BatchWasteReductionPanel
        batches={batches}
        stats={stats}
        totalItems={totalItems}
        statusFilter={statusFilter}
        expiringSoonFilter={expiringSoonFilter}
        disabled={loading}
      />

      {/* Filter and Search Section */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex flex-wrap gap-2.5">
          {['all', 'ACTIVE', 'EXPIRED', 'HOLD'].map(status => (
            <button
              key={status}
              onClick={() => {
                setStatusFilter(status);
                setPage(1);
              }}
              className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${statusFilter === status && !expiringSoonFilter
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl scale-105'
                : 'bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-brand-500'
                }`}
            >
              {status === 'all' ? 'All Status' : status}
            </button>
          ))}
          <button
            onClick={() => {
              setExpiringSoonFilter(!expiringSoonFilter);
              setPage(1);
            }}
            className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${expiringSoonFilter
              ? 'bg-orange-500 text-white shadow-xl scale-105'
              : 'bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 text-orange-500 hover:border-orange-500'
              }`}
          >
            <Clock className="w-3 h-3" />
            Expiring in 30 Days
          </button>
        </div>

        <div className="relative w-full lg:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
          <input
            type="text"
            placeholder="Search batch number, product name..."
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="w-full pl-12 pr-6 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all shadow-sm font-medium"
          />
        </div>
      </div>

      <DataTable
        data={batches}
        columns={columns}
        getRowKey={(batch) => batch.id}
        loading={loading && batches.length === 0}
        loadingLabel="Loading batches..."
        emptyLabel={
          <div className="flex flex-col items-center gap-4 max-w-xs mx-auto">
            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mb-2">
              <Calendar className="w-8 h-8 text-slate-200" strokeWidth={1} />
            </div>
            <div>
              <p className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">No Batches Registered</p>
              <p className="text-xs text-slate-500 font-medium">Create a product batch to track manufacture and expiry schedules.</p>
            </div>
          </div>
        }
        containerClassName="rounded-[2.5rem] transition-all hover:shadow-md"
        pagination={{
          page,
          total: totalItems,
          totalPages,
          onPageChange: setPage,
        }}
        paginationSummary={
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-wider">
            Showing {batches.length} of {totalItems} registered batches
          </p>
        }
      />

      {/* CREATE MODAL */}
      <CreateBatchModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          setIsCreateModalOpen(false);
          void fetchBatches();
        }}
      />

      {/* EDIT MODAL */}
      <EditBatchModal
        isOpen={isEditModalOpen}
        batch={selectedBatch}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedBatch(null);
        }}
        onSuccess={() => {
          setIsEditModalOpen(false);
          setSelectedBatch(null);
          void fetchBatches();
        }}
      />
    </div>
  );
}

function CreateBatchModal({ isOpen, onClose, onSuccess }: { isOpen: boolean; onClose: () => void; onSuccess: () => void }) {
  const {
    loading,
    searchQuery,
    setSearchQuery,
    products,
    selectedProduct,
    setSelectedProduct,
    selectedVariant,
    setSelectedVariant,
    batchNumber,
    setBatchNumber,
    manufactureDate,
    setManufactureDate,
    expiryDate,
    setExpiryDate,
    initialQuantity,
    setInitialQuantity,
    handleSubmit,
    resetForm,
  } = useCreateBatch(isOpen, onSuccess);

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-100 dark:bg-brand-900/30 rounded-xl">
              <Calendar className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Register Product Batch</h3>
              <p className="text-xs text-slate-500 font-medium">Record a new manufacturing run & expiry</p>
            </div>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!selectedProduct ? (
            <div className="space-y-4">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Select Product</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                />
              </div>
              <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-2">
                {products.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedProduct(p)}
                    className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-brand-500 hover:bg-brand-50/10 transition-all text-left"
                  >
                    <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 overflow-hidden shrink-0">
                      {p.images?.[0] && <img src={p.images[0]} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 dark:text-white truncate">{p.name}</p>
                      <p className="text-[10px] text-slate-500">Current Stock: {p.stock}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Product Info */}
              <div className="p-4 bg-brand-50/20 dark:bg-brand-900/10 rounded-2xl border border-brand-100/50 dark:border-brand-900/30 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-100 dark:border-slate-700">
                    {selectedProduct.images?.[0] && <img src={selectedProduct.images[0]} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">{selectedProduct.name}</h4>
                    <span className="text-xs text-brand-600 dark:text-brand-400 font-bold">In-Stock: {selectedProduct.stock}</span>
                  </div>
                </div>
                <button type="button" onClick={() => { setSelectedProduct(null); setSelectedVariant(null); }} className="text-xs font-bold text-red-500 hover:underline">
                  Change
                </button>
              </div>

              {/* Variant Selector */}
              {selectedProduct.variants && selectedProduct.variants.length > 0 && (
                <div className="space-y-2">
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-500">Select Variant</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.variants.map(v => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelectedVariant(v)}
                        className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all ${selectedVariant?.id === v.id
                          ? 'bg-slate-900 border-slate-900 text-white dark:bg-white dark:border-white dark:text-slate-900'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                          }`}
                      >
                        {Object.values(v.combination || {}).join(' / ')}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Batch Inputs */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-500">Batch Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BATCH-2026-A1"
                    value={batchNumber}
                    onChange={e => setBatchNumber(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500 text-sm font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-500">Initial Quantity</label>
                  <input
                    type="number"
                    min="0"
                    value={initialQuantity}
                    onChange={e => setInitialQuantity(Math.max(0, Number(e.target.value)))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500 text-sm font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-500">Manufacture Date</label>
                  <input
                    type="date"
                    value={manufactureDate}
                    onChange={e => setManufactureDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-500">Expiry Date *</label>
                  <input
                    type="date"
                    required
                    value={expiryDate}
                    onChange={e => setExpiryDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                  />
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3">
          <button onClick={handleClose} className="px-5 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl transition-all border border-slate-200 dark:border-slate-700">
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !selectedProduct || !batchNumber || !expiryDate}
            onClick={handleSubmit}
            className="px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl disabled:opacity-50 flex items-center gap-2 transition-all shadow-md hover:scale-105 active:scale-95"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Batch
          </button>
        </div>
      </div>
    </div>
  );
}

function EditBatchModal({ isOpen, batch, onClose, onSuccess }: { isOpen: boolean; batch: ProductBatch | null; onClose: () => void; onSuccess: () => void }) {
  const {
    loading,
    batchNumber,
    setBatchNumber,
    manufactureDate,
    setManufactureDate,
    expiryDate,
    setExpiryDate,
    status,
    setStatus,
    handleSubmit,
  } = useEditBatch(batch, onSuccess);

  if (!isOpen || !batch) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-100 dark:bg-brand-900/30 rounded-xl">
              <Edit2 className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Edit Batch: {batch.batchNumber}</h3>
              <p className="text-xs text-slate-500 font-medium">Update batch attributes and status</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-500">Batch Number</label>
              <input
                type="text"
                required
                value={batchNumber}
                onChange={e => setBatchNumber(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500 text-sm font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500">Manufacture Date</label>
                <input
                  type="date"
                  value={manufactureDate}
                  onChange={e => setManufactureDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500">Expiry Date</label>
                <input
                  type="date"
                  required
                  value={expiryDate}
                  onChange={e => setExpiryDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-500">Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as BatchStatus)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500 text-sm font-bold"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="EXPIRED">EXPIRED</option>
                <option value="HOLD">HOLD</option>
                <option value="DELETED">DELETED</option>
              </select>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl transition-all border border-slate-200 dark:border-slate-700">
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            onClick={handleSubmit}
            className="px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl disabled:opacity-50 flex items-center gap-2 transition-all shadow-md hover:scale-105 active:scale-95"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
