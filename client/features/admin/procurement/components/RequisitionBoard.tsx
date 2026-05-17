'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  Clock,
  FileText,
  Plus,
  Save,
  Search,
  Trash2,
  X
} from 'lucide-react';
import React, { useMemo, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getDepartments } from '@/services/hrm';

interface PR {
  id: string;
  title: string;
  status: string;
  date: string;
  amount: string;
  department: string;
  description?: string;
}

// const INITIAL_PRS: PR[] = [
//   { id: 'PR-2026-001', title: 'Q2 Office Supplies', status: 'DRAFT', date: 'May 16', amount: '$450', department: 'Admin', description: 'Procuring stationary, toner cartridges, and custom notebooks for head office staff.' },
//   { id: 'PR-2026-002', title: 'MacBook Pro Fleet', status: 'PENDING', date: 'May 14', amount: '$12,500', department: 'Engineering', description: 'Upgrading laptops for 5 new senior full-stack software engineer hires.' },
//   { id: 'PR-2026-003', title: 'Server Racks', status: 'APPROVED', date: 'May 10', amount: '$8,200', department: 'IT', description: 'Expanding server room capacity by adding 2 high-density server racks and accessories.' },
//   { id: 'PR-2026-004', title: 'Packaging Material', status: 'PO_CREATED', date: 'May 05', amount: '$3,100', department: 'Warehouse', description: 'Reordering custom branded retail shipping boxes and biodegradable bubble mailers.' },
// ];

export default function RequisitionBoard() {
  const [prs, setPrs] = useState<PR[]>([] as PR[]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedPr, setSelectedPr] = useState<PR | null>(null);

  // Form states
  const [newTitle, setNewTitle] = useState('');
  const [newDept, setNewDept] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const [liveDepartments, setLiveDepartments] = useState<{id: string, name: string}[]>([]);

  useEffect(() => {
    getDepartments().then(data => {
      if (Array.isArray(data)) {
        setLiveDepartments(data);
        if (data.length > 0 && !newDept) {
          setNewDept(data[0].name);
        }
      }
    }).catch(err => console.error('Failed to fetch departments for PR form:', err));
  }, []);

  const columns = [
    { id: 'DRAFT', title: 'Drafts', color: 'slate', dot: 'bg-slate-500' },
    { id: 'PENDING', title: 'Pending Approval', color: 'amber', dot: 'bg-amber-500' },
    { id: 'APPROVED', title: 'Approved', color: 'emerald', dot: 'bg-emerald-500' },
    { id: 'PO_CREATED', title: 'PO Generated', color: 'indigo', dot: 'bg-indigo-500' },
  ];

  // Filter PRs by search query
  const filteredPRs = useMemo(() => {
    return prs.filter(pr =>
      pr.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pr.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pr.department.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [prs, searchQuery]);

  const handleCreatePR = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      toast.error('Please enter a requisition title');
      return;
    }

    const prNumber = `PR-2026-0${prs.length + 1}`;
    const newPR: PR = {
      id: prNumber,
      title: newTitle,
      status: 'DRAFT',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit' }),
      amount: newAmount ? `$${parseFloat(newAmount).toLocaleString()}` : '$0',
      department: newDept,
      description: newDesc
    };

    setPrs([newPR, ...prs]);
    setIsCreateOpen(false);
    toast.success(`${prNumber} created as Draft`);

    // Reset Form
    setNewTitle('');
    setNewDept('Admin');
    setNewAmount('');
    setNewDesc('');
  };

  const handleMovePR = (id: string, newStatus: string) => {
    setPrs(prev => prev.map(pr => pr.id === id ? { ...pr, status: newStatus } : pr));
    if (selectedPr && selectedPr.id === id) {
      setSelectedPr(prev => prev ? { ...prev, status: newStatus } : null);
    }
    toast.success(`Moved to ${newStatus.replace('_', ' ')}`);
  };

  const handleDeletePR = (id: string) => {
    setPrs(prev => prev.filter(pr => pr.id !== id));
    setSelectedPr(null);
    toast.success('Purchase Requisition deleted');
  };

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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all shadow-sm"
            />
          </div>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-colors shadow-lg flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> New PR
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 flex gap-6 overflow-x-auto pb-4 custom-scrollbar items-stretch">
        {columns.map((col) => (
          <div key={col.id} className="w-[340px] shrink-0 flex flex-col bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] border border-slate-100 dark:border-slate-700/50">
            {/* Column Header */}
            <div className="p-6 pb-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full ${col.dot} shadow-lg shadow-indigo-500/10`} />
                <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">
                  {col.title}
                </h3>
              </div>
              <span className="px-2.5 py-1 bg-white dark:bg-slate-800 rounded-lg text-[10px] font-black text-slate-500 shadow-sm border border-slate-100 dark:border-slate-700">
                {filteredPRs.filter(pr => pr.status === col.id).length}
              </span>
            </div>

            {/* Cards Area */}
            <div className="flex-1 p-4 space-y-4 overflow-y-auto custom-scrollbar">
              <AnimatePresence>
                {filteredPRs.filter(pr => pr.status === col.id).map((pr, i) => (
                  <motion.div
                    key={pr.id}
                    layoutId={pr.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setSelectedPr(pr)}
                    className="bg-white dark:bg-slate-800 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md hover:border-indigo-100 dark:hover:border-indigo-900/50 transition-all cursor-pointer group"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded-md">
                        {pr.id}
                      </span>
                      <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        {col.id !== 'PO_CREATED' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const nextStatuses: Record<string, string> = {
                                'DRAFT': 'PENDING',
                                'PENDING': 'APPROVED',
                                'APPROVED': 'PO_CREATED'
                              };
                              handleMovePR(pr.id, nextStatuses[pr.status]);
                            }}
                            className="p-1 text-slate-400 hover:text-indigo-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                            title="Promote Stage"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePR(pr.id);
                          }}
                          className="p-1 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                          title="Delete Request"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h4 className="font-black text-slate-900 dark:text-white leading-tight mb-4 group-hover:text-indigo-600 transition-colors">
                      {pr.title}
                    </h4>

                    <div className="flex items-center justify-between text-xs mb-4">
                      <div className="flex items-center gap-1.5 text-slate-500 font-bold uppercase text-[10px] tracking-widest">
                        <Clock className="w-3 h-3" /> {pr.date}
                      </div>
                      <span className="font-black text-slate-700 dark:text-slate-300 font-mono">{pr.amount}</span>
                    </div>

                    <div className="h-px bg-slate-100 dark:bg-slate-700 mb-4" />

                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {pr.department}
                      </span>
                      <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 border-2 border-white dark:border-slate-800 flex items-center justify-center shadow-sm">
                        <span className="text-[8px] font-black">{pr.department.substring(0, 2).toUpperCase()}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Drawer Modal */}
      <AnimatePresence>
        {selectedPr && (
          <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              className="bg-white dark:bg-slate-800 w-full max-w-md h-full shadow-2xl flex flex-col border-l border-slate-100 dark:border-slate-700 p-8"
            >
              <div className="flex justify-between items-center mb-8">
                <span className="text-xs font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1.5 rounded-lg">
                  {selectedPr.id}
                </span>
                <button
                  onClick={() => setSelectedPr(null)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="flex-1 space-y-6 overflow-y-auto">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-tight uppercase tracking-tight">
                    {selectedPr.title}
                  </h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                    Department: {selectedPr.department}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 p-5 bg-slate-50 dark:bg-slate-900 rounded-3xl">
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Requested Amount</span>
                    <span className="text-lg font-black text-slate-900 dark:text-white font-mono">{selectedPr.amount}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Creation Date</span>
                    <span className="text-base font-black text-slate-900 dark:text-white">{selectedPr.date}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Stage Transitions</h4>
                  <div className="flex flex-wrap gap-2">
                    {columns.map(col => (
                      <button
                        key={col.id}
                        onClick={() => handleMovePR(selectedPr.id, col.id)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${selectedPr.status === col.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-500/20' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'}`}
                      >
                        {col.title.replace(' Approval', '').replace(' Generated', '')}
                      </button>
                    ))}
                  </div>
                </div>

                {selectedPr.description && (
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Requisition Notes</h4>
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 p-5 rounded-3xl leading-relaxed">
                      {selectedPr.description}
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-slate-100 dark:border-slate-700">
                <button
                  onClick={() => handleDeletePR(selectedPr.id)}
                  className="w-full py-4.5 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/30 rounded-2xl font-black text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2 border border-rose-100 dark:border-rose-900/30"
                >
                  <Trash2 className="w-4 h-4" /> Delete Requisition
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create PR Modal */}
      <AnimatePresence>
        {isCreateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden"
            >
              <div className="flex justify-between items-center p-8 border-b border-slate-50 dark:border-slate-700">
                <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-tight">
                  <FileText className="w-5 h-5 text-indigo-500" />
                  New Purchase Requisition
                </h2>
                <button
                  onClick={() => setIsCreateOpen(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <form onSubmit={handleCreatePR} className="p-8 space-y-5">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    PR Title / Project Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all font-bold text-xs"
                    placeholder="e.g. Q3 Packaging Materials Reorder"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                      Department
                    </label>
                    <select
                      value={newDept}
                      onChange={(e) => setNewDept(e.target.value)}
                      className="w-full px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all font-bold text-xs"
                    >
                      {liveDepartments.length === 0 && <option value="Admin">Admin</option>}
                      {liveDepartments.map((dept) => (
                        <option key={dept.id} value={dept.name}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                      Estimated Cost ($)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={newAmount}
                      onChange={(e) => setNewAmount(e.target.value)}
                      className="w-full px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all font-bold text-xs font-mono"
                      placeholder="e.g. 2500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                    Description & Specifications
                  </label>
                  <textarea
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    className="w-full px-5 py-3.5 rounded-[2rem] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all resize-none font-semibold text-xs leading-relaxed"
                    rows={4}
                    placeholder="Enter items, quantities, or specific supplier constraints..."
                  />
                </div>

                <div className="pt-4 flex gap-4">
                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
                    className="flex-1 py-4.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-black text-xs uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-[2] py-4.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" /> Save Requisition
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
