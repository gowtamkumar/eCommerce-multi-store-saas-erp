'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Briefcase,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Award
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getCashFlow } from '@/services/accounting';

interface FlowData {
  inflows: number;
  outflows: number;
  net: number;
}

interface CashFlowReport {
  operating: FlowData;
  investing: FlowData;
  financing: FlowData;
  netChange: number;
  startingBalance: number;
  endingBalance: number;
}

export default function CashFlowPage() {
  const [report, setReport] = useState<CashFlowReport | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await getCashFlow();
      setReport(res?.data || null);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load Cash Flow Statement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="p-8 text-center text-slate-400 font-bold uppercase tracking-widest">
        Failed to load statement
      </div>
    );
  }

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight italic uppercase">
          Cash Flow <span className="text-indigo-600">Statement</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">
          Statement of Cash Flows (Direct Method)
        </p>
      </div>

      {/* Main Balance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-between"
        >
          <div>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Starting Balance</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
              ${report.startingBalance.toFixed(2)}
            </span>
          </div>
          <DollarSign className="w-8 h-8 text-slate-400" />
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-between"
        >
          <div>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Net Change in Cash</span>
            <span className={`text-2xl font-black font-mono flex items-center gap-1 ${
              report.netChange >= 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}>
              {report.netChange >= 0 ? '+' : ''}${report.netChange.toFixed(2)}
            </span>
          </div>
          {report.netChange >= 0 ? (
            <ArrowUpRight className="w-8 h-8 text-emerald-600" />
          ) : (
            <ArrowDownRight className="w-8 h-8 text-rose-600" />
          )}
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-between"
        >
          <div>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Ending Cash Balance</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
              ${report.endingBalance.toFixed(2)}
            </span>
          </div>
          <TrendingUp className="w-8 h-8 text-indigo-600" />
        </motion.div>
      </div>

      {/* Activities Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Operating Activities */}
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 space-y-6">
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-indigo-500" />
            <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">Operating Activities</h3>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-slate-50 dark:border-slate-700/50">
              <span className="text-xs font-bold text-slate-500">Cash Receipts (Sales & AR)</span>
              <span className="text-xs font-black font-mono text-emerald-600">+${report.operating.inflows.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-slate-50 dark:border-slate-700/50">
              <span className="text-xs font-bold text-slate-500">Cash Paid (Suppliers & Operating)</span>
              <span className="text-xs font-black font-mono text-rose-600">-${report.operating.outflows.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center pt-3">
              <span className="text-xs font-black text-slate-900 dark:text-white uppercase">Net Operating Cash</span>
              <span className={`text-sm font-black font-mono ${
                report.operating.net >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}>
                ${report.operating.net.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Investing Activities */}
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 space-y-6">
          <div className="flex items-center gap-3">
            <Briefcase className="w-5 h-5 text-indigo-500" />
            <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">Investing Activities</h3>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-slate-50 dark:border-slate-700/50">
              <span className="text-xs font-bold text-slate-500">Sale of Fixed Assets</span>
              <span className="text-xs font-black font-mono text-emerald-600">+${report.investing.inflows.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-slate-50 dark:border-slate-700/50">
              <span className="text-xs font-bold text-slate-500">Acquisition of Assets</span>
              <span className="text-xs font-black font-mono text-rose-600">-${report.investing.outflows.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center pt-3">
              <span className="text-xs font-black text-slate-900 dark:text-white uppercase">Net Investing Cash</span>
              <span className={`text-sm font-black font-mono ${
                report.investing.net >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}>
                ${report.investing.net.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Financing Activities */}
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 space-y-6">
          <div className="flex items-center gap-3">
            <Layers className="w-5 h-5 text-indigo-500" />
            <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">Financing Activities</h3>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-slate-50 dark:border-slate-700/50">
              <span className="text-xs font-bold text-slate-500">Capital Injection / Loans</span>
              <span className="text-xs font-black font-mono text-emerald-600">+${report.financing.inflows.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-slate-50 dark:border-slate-700/50">
              <span className="text-xs font-bold text-slate-500">Loan Repayments / Dividends</span>
              <span className="text-xs font-black font-mono text-rose-600">-${report.financing.outflows.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center pt-3">
              <span className="text-xs font-black text-slate-900 dark:text-white uppercase">Net Financing Cash</span>
              <span className={`text-sm font-black font-mono ${
                report.financing.net >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}>
                ${report.financing.net.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
