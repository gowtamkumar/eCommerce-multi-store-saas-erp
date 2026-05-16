'use client';

import React, { useState } from 'react';
import { 
  DollarSign, 
  Plus, 
  FileCheck, 
  CreditCard, 
  PieChart,
  ArrowRight,
  TrendingUp,
  Download,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function PayrollManager() {
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);

  const handleRunPayroll = () => {
    setProcessing(true);
    setTimeout(() => setProcessing(false), 2000);
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight italic uppercase leading-none">
            Financial <span className="text-indigo-600">Disbursement</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-2">
            Automated Payroll Engine & Ledger Integration
          </p>
        </div>
        <button 
          onClick={handleRunPayroll}
          disabled={processing}
          className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.15em] transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-3 active:scale-95 disabled:opacity-50"
        >
          {processing ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : <DollarSign className="w-5 h-5" />}
          Run New Payroll Batch
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Payroll Summary Stats */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700">
            <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight mb-6">
              Current <span className="text-indigo-600">Period</span>
            </h2>
            <div className="flex flex-col items-center py-6">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">May 2026</p>
              <h3 className="text-5xl font-black text-slate-900 dark:text-white italic tracking-tighter">
                $124,500
              </h3>
              <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mt-2 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +2.4% from April
              </p>
            </div>
            
            <div className="h-px bg-slate-100 dark:bg-slate-700 my-6"></div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-400 uppercase">Salaries</span>
                <span className="font-black text-slate-900 dark:text-white">$98,000</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-400 uppercase">Allowances</span>
                <span className="font-black text-slate-900 dark:text-white">$22,500</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-400 uppercase">Taxes & Ded.</span>
                <span className="font-black text-rose-500">-$4,000</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 dark:bg-slate-950 p-8 rounded-[2.5rem] shadow-xl text-white">
            <div className="flex items-center gap-3 mb-6">
              <FileCheck className="w-5 h-5 text-indigo-400" />
              <h3 className="text-xs font-black uppercase tracking-widest">Accounting Status</h3>
            </div>
            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              <div>
                <p className="text-xs font-black uppercase tracking-widest">Ledger Sync</p>
                <p className="text-[10px] text-slate-400 font-bold italic">Last sync: 10 mins ago</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Batches List */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
              Payroll <span className="text-indigo-600">History</span>
            </h2>
            <div className="flex gap-2">
              <button className="p-2 bg-slate-50 dark:bg-slate-700 rounded-xl text-slate-400 hover:text-indigo-600 transition-colors">
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {[
              { id: 'PAY-0526', name: 'May 2026 Monthly', amount: '$124,500', status: 'PAID', date: '15 May 2026' },
              { id: 'PAY-0426', name: 'April 2026 Monthly', amount: '$121,200', status: 'PAID', date: '28 Apr 2026' },
              { id: 'PAY-0326', name: 'March 2026 Monthly', amount: '$118,000', status: 'PAID', date: '27 Mar 2026' },
              { id: 'BON-0326', name: 'Q1 Performance Bonus', amount: '$45,000', status: 'PAID', date: '15 Mar 2026' },
            ].map((batch, i) => (
              <div key={i} className="group flex items-center justify-between p-6 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all rounded-[2rem] border border-transparent hover:border-slate-100 dark:hover:border-slate-700 cursor-pointer">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center group-hover:bg-white transition-colors shadow-sm">
                    <CreditCard className="w-6 h-6 text-slate-400 group-hover:text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-black text-slate-900 dark:text-white uppercase tracking-tight">{batch.name}</p>
                    <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{batch.id}</p>
                  </div>
                </div>
                <div className="text-right flex items-center gap-8">
                  <div className="hidden md:block">
                    <p className="text-sm font-black text-slate-900 dark:text-white italic">{batch.amount}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{batch.date}</p>
                  </div>
                  <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-[0.15em] border border-emerald-100 dark:border-emerald-800/50">
                    {batch.status}
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors group-hover:translate-x-1" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
