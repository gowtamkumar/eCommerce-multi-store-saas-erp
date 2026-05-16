'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Plus, 
  Search, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Truck,
  ArrowRight,
  MoreVertical
} from 'lucide-react';

export default function RequisitionBoard() {
  const columns = [
    { id: 'DRAFT', title: 'Drafts', color: 'slate' },
    { id: 'PENDING', title: 'Pending Approval', color: 'amber' },
    { id: 'APPROVED', title: 'Approved', color: 'emerald' },
    { id: 'PO_CREATED', title: 'PO Generated', color: 'indigo' },
  ];

  const mockPRs = [
    { id: 'PR-2026-001', title: 'Q2 Office Supplies', status: 'DRAFT', date: 'May 16', amount: '$450', department: 'Admin' },
    { id: 'PR-2026-002', title: 'MacBook Pro Fleet', status: 'PENDING', date: 'May 14', amount: '$12,500', department: 'Engineering' },
    { id: 'PR-2026-003', title: 'Server Racks', status: 'APPROVED', date: 'May 10', amount: '$8,200', department: 'IT' },
    { id: 'PR-2026-004', title: 'Packaging Material', status: 'PO_CREATED', date: 'May 05', amount: '$3,100', department: 'Warehouse' },
  ];

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 shrink-0">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight italic uppercase">
            Purchase <span className="text-indigo-600">Requisitions</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">
            Internal Sourcing Requests
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group hidden md:block w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500" />
            <input
              type="text"
              placeholder="Search PR..."
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all shadow-sm"
            />
          </div>
          <button className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-colors shadow-lg flex items-center gap-2">
            <Plus className="w-4 h-4" /> New PR
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 flex gap-6 overflow-x-auto pb-4 custom-scrollbar">
        {columns.map((col) => (
          <div key={col.id} className="w-[350px] shrink-0 flex flex-col bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border border-slate-100 dark:border-slate-700/50">
            {/* Column Header */}
            <div className="p-6 pb-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full bg-${col.color}-500 shadow-lg shadow-${col.color}-500/50`} />
                <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">
                  {col.title}
                </h3>
              </div>
              <span className="px-2.5 py-1 bg-white dark:bg-slate-800 rounded-lg text-[10px] font-black text-slate-500 shadow-sm border border-slate-100 dark:border-slate-700">
                {mockPRs.filter(pr => pr.status === col.id).length}
              </span>
            </div>

            {/* Cards Area */}
            <div className="flex-1 p-4 space-y-4 overflow-y-auto custom-scrollbar">
              <AnimatePresence>
                {mockPRs.filter(pr => pr.status === col.id).map((pr, i) => (
                  <motion.div
                    key={pr.id}
                    layoutId={pr.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white dark:bg-slate-800 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md hover:border-indigo-100 dark:hover:border-indigo-900/50 transition-all cursor-pointer group"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded-md">
                        {pr.id}
                      </span>
                      <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors opacity-0 group-hover:opacity-100">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <h4 className="font-black text-slate-900 dark:text-white leading-tight mb-4">
                      {pr.title}
                    </h4>
                    
                    <div className="flex items-center justify-between text-xs mb-4">
                      <div className="flex items-center gap-1.5 text-slate-500 font-bold uppercase text-[10px] tracking-widest">
                        <Clock className="w-3 h-3" /> {pr.date}
                      </div>
                      <span className="font-black text-slate-700 dark:text-slate-300">{pr.amount}</span>
                    </div>

                    <div className="h-px bg-slate-100 dark:bg-slate-700 mb-4" />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {pr.department}
                      </span>
                      <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 border-2 border-white dark:border-slate-800 flex items-center justify-center shadow-sm">
                        <span className="text-[8px] font-black">AD</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
