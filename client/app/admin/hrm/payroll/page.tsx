'use client';

import { getPayrollBatches, getPayrollSlips, processPayroll, payPayrollBatch } from '@/services/hrm';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  Banknote,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Download,
  FileText,
  Loader2,
  MoreVertical,
  Plus,
  Printer,
  Search,
  TrendingUp,
  User,
  X
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface PayrollBatch {
  id: string;
  name: string;
  period: string;
  totalAmount: number;
  status: string;
  processedAt?: string;
  createdAt: string;
}

interface PayrollSlip {
  id: string;
  employeeId: string;
  basicSalary: number;
  totalAllowances: number;
  totalDeductions: number;
  netSalary: number;
  employee?: {
    user?: { name: string; email: string };
    department?: { name: string };
    designation?: { name: string };
  };
}

export default function PayrollManagementPage() {
  const [loading, setLoading] = useState(true);
  const [batches, setBatches] = useState<PayrollBatch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<PayrollBatch | null>(null);
  const [slips, setSlips] = useState<PayrollSlip[]>([]);
  const [loadingSlips, setLoadingSlips] = useState(false);

  const [showProcessModal, setShowProcessModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [processData, setProcessData] = useState({
    period: new Date().toISOString().slice(0, 7), // YYYY-MM
    name: `Payroll ${new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}`
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getPayrollBatches();
      setBatches(res || []);
    } catch (err) {
      console.error('Failed to fetch payroll batches:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleProcessPayroll = async () => {
    try {
      setProcessing(true);
      await processPayroll(processData.period, processData.name);
      setShowProcessModal(false);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Payroll processing failed');
    } finally {
      setProcessing(false);
    }
  };

  const handlePayBatch = async () => {
    if (!selectedBatch) return;
    try {
      setProcessing(true);
      const updatedBatch = await payPayrollBatch(selectedBatch.id);
      setSelectedBatch(updatedBatch);
      fetchData();
      alert('Payroll batch disbursed and GL journal entries successfully created!');
    } catch (err: any) {
      alert(err.message || 'Payment release failed');
    } finally {
      setProcessing(false);
    }
  };

  const handleViewSlips = async (batch: PayrollBatch) => {
    setSelectedBatch(batch);
    setLoadingSlips(true);
    try {
      const res = await getPayrollSlips(batch.id);
      setSlips(res || []);
    } catch (err) {
      console.error('Failed to fetch slips:', err);
    } finally {
      setLoadingSlips(false);
    }
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight italic uppercase leading-none">
            Financial <span className="text-indigo-600">Disbursement</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-2">
            Managing payroll cycles, tax compliance, and net compensation
          </p>
        </div>
        <button
          onClick={() => setShowProcessModal(true)}
          className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all hover:scale-105 active:scale-95 shadow-xl"
        >
          <Plus className="w-4 h-4" />
          Process New Cycle
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: History & Batches */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden">
            <div className="p-8 border-b border-slate-50 dark:border-slate-700 flex justify-between items-center">
              <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">Payment History</h2>
              <div className="flex gap-2">
                <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500">2026 CY</div>
              </div>
            </div>

            <div className="divide-y divide-slate-50 dark:divide-slate-700/50">
              {loading ? (
                <div className="p-20 text-center">
                  <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto" />
                </div>
              ) : batches.length === 0 ? (
                <div className="p-20 text-center opacity-40">
                  <Banknote className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                  <p className="text-sm font-bold uppercase tracking-widest italic">No payroll cycles processed yet</p>
                </div>
              ) : (
                batches.map((batch) => (
                  <div
                    key={batch.id}
                    className="group p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-all cursor-pointer"
                    onClick={() => handleViewSlips(batch)}
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-all">
                        <Calendar className="w-7 h-7" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic leading-none mb-1">{batch.name}</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{batch.period} • {new Date(batch.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-12 ml-auto">
                      <div className="text-right">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Disbursement</p>
                        <p className="text-lg font-black text-slate-900 dark:text-white">${batch.totalAmount.toLocaleString()}</p>
                      </div>
                      <div className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest ${batch.status === 'PAID' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                        {batch.status}
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-600 transition-all" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right: Insights */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/30 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
            <TrendingUp className="w-10 h-10 text-indigo-400 mb-8" />
            <h4 className="text-3xl font-black italic uppercase tracking-tighter leading-none mb-4">Total <br />Compensated</h4>
            <p className="text-5xl font-black text-indigo-400 mb-8">${batches.reduce((sum, b) => sum + b.totalAmount, 0).toLocaleString()}</p>
            <div className="space-y-4 pt-8 border-t border-white/10">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                <span>Active Staff</span>
                <span className="text-white">Active Only</span>
              </div>
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                <span>Tax Compliance</span>
                <span className="text-emerald-400">100% Verified</span>
              </div>
            </div>
          </div>

          <div className="p-8 bg-indigo-50 dark:bg-indigo-900/20 rounded-[2.5rem] border border-indigo-100 dark:border-indigo-800/50">
            <h5 className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-4">Pro Tip</h5>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold leading-relaxed italic">
              "Payroll processing automatically generates General Ledger entries in the Finance module for salary expenses and liabilities."
            </p>
          </div>
        </div>
      </div>

      {/* Slips Drawer (Simulated as Modal) */}
      <AnimatePresence>
        {selectedBatch && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedBatch(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-3xl bg-white dark:bg-slate-900 shadow-2xl h-full flex flex-col"
            >
              <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic leading-none">{selectedBatch.name}</h2>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Individual Compensation Slips</p>
                </div>
                <button onClick={() => setSelectedBatch(null)} className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl hover:bg-rose-50 hover:text-rose-600 transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-4">
                {loadingSlips ? (
                  <div className="flex flex-col items-center justify-center h-full gap-4">
                    <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400 italic">Assembling Slips...</p>
                  </div>
                ) : slips.map((slip) => (
                  <div key={slip.id} className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-700 flex items-center justify-between group">
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-700 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-all shadow-sm">
                        <User className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-sm">{slip.employee?.user?.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{slip.employee?.designation?.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Net Pay</p>
                        <p className="text-base font-black text-indigo-600 dark:text-indigo-400">${slip.netSalary.toLocaleString()}</p>
                      </div>
                      <button className="p-3 text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all">
                        <Printer className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-8 border-t border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex gap-4">
                <button 
                  onClick={handlePayBatch}
                  disabled={processing || selectedBatch.status === 'PAID'}
                  className="flex-1 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-xl disabled:opacity-50"
                >
                  {processing ? 'Processing...' : selectedBatch.status === 'PAID' ? 'PAID / SETTLED' : 'Release Payroll Payment'}
                </button>
                <button className="px-8 py-4 bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-slate-100 dark:border-slate-700 hover:text-indigo-600 transition-all">
                  Export PDF
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Process Modal */}
      <AnimatePresence>
        {showProcessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowProcessModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl p-10">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic mb-8">Execute <span className="text-indigo-600">Cycle</span></h2>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pay Cycle Name</label>
                  <input
                    type="text" value={processData.name} onChange={e => setProcessData({ ...processData, name: e.target.value })}
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Period (YYYY-MM)</label>
                  <input
                    type="month" value={processData.period} onChange={e => setProcessData({ ...processData, period: e.target.value })}
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none"
                  />
                </div>

                <div className="p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-3xl border border-indigo-100 dark:border-indigo-800/50 flex items-start gap-4">
                  <AlertCircle className="w-5 h-5 text-indigo-600 mt-1" />
                  <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 leading-relaxed italic">
                    By confirming, the system will aggregate all active employee salaries, attendance deductions, and approved leaves for the selected period. This will also create accounting entries.
                  </p>
                </div>

                <button
                  onClick={handleProcessPayroll}
                  disabled={processing}
                  className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  Confirm & Process
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
