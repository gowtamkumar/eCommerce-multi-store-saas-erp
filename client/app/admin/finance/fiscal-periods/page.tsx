'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Plus,
  X,
  Lock,
  Unlock,
  AlertCircle,
  Clock,
  User,
  ShieldAlert
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getFiscalPeriods,
  createFiscalPeriod,
  updateFiscalPeriodStatus
} from '@/services/accounting';
import DataTable, { DataTableColumn } from '@/components/shared/DataTable';

interface FiscalPeriod {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: string;
}

export default function FiscalPeriodPage() {
  const [periods, setPeriods] = useState<FiscalPeriod[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [createOpen, setCreateOpen] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchPeriods = async () => {
    try {
      setLoading(true);
      const res = await getFiscalPeriods();
      setPeriods(res?.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load fiscal periods');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPeriods();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !startDate || !endDate) return;

    try {
      await createFiscalPeriod({ name, startDate, endDate });
      toast.success('Fiscal Period created successfully');
      setCreateOpen(false);
      setName('');
      setStartDate('');
      setEndDate('');
      fetchPeriods();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create period');
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'OPEN' ? 'CLOSED' : 'OPEN';
    const actionText = nextStatus === 'CLOSED'
      ? 'CLOSE this period? All journal postings to this date range will be BLOCKED.'
      : 'RE-OPEN this period? Transactions within this date range can be posted again.';

    if (!confirm(`Are you sure you want to ${actionText}`)) return;

    try {
      await updateFiscalPeriodStatus(id, nextStatus);
      toast.success(`Fiscal period is now ${nextStatus}`);
      fetchPeriods();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status');
    }
  };

  const columns = useMemo<DataTableColumn<FiscalPeriod>[]>(() => [
    {
      key: 'name',
      header: 'Period Name',
      cell: (fp) => (
        <span className="font-bold text-slate-800 dark:text-slate-200">
          {fp.name}
        </span>
      ),
    },
    {
      key: 'startDate',
      header: 'Start Date',
      cell: (fp) => (
        <span className="text-xs font-semibold text-slate-500">
          {new Date(fp.startDate).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'endDate',
      header: 'End Date',
      cell: (fp) => (
        <span className="text-xs font-semibold text-slate-500">
          {new Date(fp.endDate).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (fp) => (
        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
          fp.status === 'OPEN'
            ? 'bg-emerald-100 text-emerald-600'
            : 'bg-rose-100 text-rose-600'
        }`}>
          {fp.status}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      headerClassName: 'text-right',
      className: 'text-right',
      cell: (fp) => (
        <button
          onClick={() => handleToggleStatus(fp.id, fp.status)}
          className={`px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-1.5 border transition-all inline-flex ${
            fp.status === 'OPEN'
              ? 'border-rose-100 text-rose-600 bg-rose-50/10 hover:bg-rose-600 hover:text-white'
              : 'border-emerald-100 text-emerald-600 bg-emerald-50/10 hover:bg-emerald-600 hover:text-white'
          }`}
        >
          {fp.status === 'OPEN' ? (
            <>
              <Lock className="w-3.5 h-3.5" /> Lock Period
            </>
          ) : (
            <>
              <Unlock className="w-3.5 h-3.5" /> Unlock Period
            </>
          )}
        </button>
      ),
    },
  ], []);

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight italic uppercase">
            Fiscal <span className="text-indigo-600">Periods</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">
            Lock Postings & Enforce Financial Audit Control
          </p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-colors flex items-center gap-2 self-start"
        >
          <Plus className="w-4 h-4" /> New Fiscal Period
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Audit Warning Banner */}
        <div className="lg:col-span-1 bg-amber-50/20 border border-amber-200 p-8 rounded-[2rem] h-fit space-y-4">
          <ShieldAlert className="w-8 h-8 text-amber-600" />
          <h3 className="text-base font-black text-slate-900 dark:text-white uppercase">Fiscal Period Locks</h3>
          <p className="text-xs text-slate-500 leading-relaxed font-semibold">
            Closing a fiscal period prevents any cashier shifts, sales, inventory adjustments, purchase invoices, or journal vouchers from being backdated or posted to closed dates. 
          </p>
          <p className="text-xs text-slate-400 leading-relaxed">
            Ensure all reconciliations, inventory cycle counts, and payroll calculations are fully completed before locking a period.
          </p>
        </div>

        {/* Right Side: Periods Table */}
        <div className="lg:col-span-2">
          <DataTable
            data={periods}
            columns={columns}
            getRowKey={(fp) => fp.id}
            loading={loading}
            emptyLabel="No Fiscal Periods Defined Yet"
            minWidthClassName="min-w-[600px]"
            containerClassName="rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden"
          />
        </div>
      </div>

      {/* Create Fiscal Period Modal */}
      <AnimatePresence>
        {createOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-800 w-full max-w-md rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden"
            >
              <div className="flex justify-between items-center p-8 border-b border-slate-50 dark:border-slate-700">
                <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-tight">
                  <Calendar className="w-5 h-5 text-indigo-500" />
                  New Fiscal Period
                </h2>
                <button
                  onClick={() => setCreateOpen(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="p-8 space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                    Period Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none font-bold text-xs"
                    placeholder="e.g. Q2 2026 or June 2026"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none font-bold text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                      End Date
                    </label>
                    <input
                      type="date"
                      required
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none font-bold text-xs"
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-4">
                  <button
                    type="button"
                    onClick={() => setCreateOpen(false)}
                    className="flex-1 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-black text-xs uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-[2] py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg"
                  >
                    Save Period
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
