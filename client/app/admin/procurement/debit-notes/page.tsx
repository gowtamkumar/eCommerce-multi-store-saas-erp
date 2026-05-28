'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Receipt,
  Plus,
  Search,
  Calendar,
  X,
  DollarSign,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  FileText,
  User,
  Check
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getDebitNotes,
  createDebitNote,
  approveDebitNote,
  getSuppliers,
  getPurchaseOrders
} from '@/services/procurement';
import { Supplier } from '@/features/admin/supplier/types';
import { PurchaseOrder } from '@/features/admin/purchase/types';


interface DebitNote {
  id: string;
  debitNoteNumber: string;
  supplierId: string;
  supplier?: { name: string };
  purchaseOrderId: string;
  purchaseOrder?: { referenceNumber: string };
  amount: number;
  createdAt: string;
  reason: string;
  status: string;
}

export default function DebitNotePage() {
  const [debitNotes, setDebitNotes] = useState<DebitNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNote, setSelectedNote] = useState<DebitNote | null>(null);

  // Modals
  const [createOpen, setCreateOpen] = useState(false);

  // Form states - Create Debit Note
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [selectedPoId, setSelectedPoId] = useState('');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);


  const fetchDebitNotes = async () => {
    try {
      setLoading(true);
      const data = await getDebitNotes();
      setDebitNotes(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load debit notes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDebitNotes();

    // Fetch lists
    getSuppliers().then(setSuppliers).catch(console.error);
    getPurchaseOrders().then(setPurchaseOrders).catch(console.error);
  }, []);

  const filteredDebitNotes = useMemo(() => {
    return debitNotes.filter((n) =>
      n.debitNoteNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (n.supplier?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [debitNotes, searchQuery]);

  const handleCreateDebitNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplierId || !selectedPoId || !amount || !reason) {
      toast.error('Please enter all details');
      return;
    }

    try {
      await createDebitNote({
        supplierId: selectedSupplierId,
        purchaseOrderId: selectedPoId,
        amount: parseFloat(amount),
        reason,
      });

      toast.success('Debit Note generated as Draft');
      setCreateOpen(false);
      setSelectedSupplierId('');
      setSelectedPoId('');
      setAmount('');
      setReason('');
      fetchDebitNotes();
    } catch (err) {
      console.error(err);
      toast.error('Failed to create Debit Note');
    }
  };

  const handleApprove = async (id: string) => {
    if (!confirm('Are you sure you want to approve this debit note? This will perform write-locked accounts payable reductions and record general ledger entries.')) return;

    try {
      await approveDebitNote(id);
      toast.success('Debit note approved and posted to ledger successfully');
      setSelectedNote(null);
      fetchDebitNotes();
    } catch (err) {
      console.error(err);
      toast.error('Failed to approve debit note');
    }
  };

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
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all shadow-sm"
            />
          </div>
          <button
            onClick={() => setCreateOpen(true)}
            className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> New Debit Note
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      ) : (
        /* Debit Notes Table */
        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-700/30">
                  <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Note ID</th>
                  <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Supplier</th>
                  <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">PO Ref</th>
                  <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Adjustment Amount</th>
                  <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Issue Date</th>
                  <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                {filteredDebitNotes.map((note) => (
                  <tr
                    key={note.id}
                    onClick={() => setSelectedNote(note)}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors group cursor-pointer"
                  >
                    <td className="px-8 py-5">
                      <span className="text-xs font-black text-slate-900 dark:text-white font-mono">{note.debitNoteNumber}</span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{note.supplier?.name || 'Unknown'}</span>
                    </td>
                    <td className="px-8 py-5 font-mono text-xs text-slate-500">
                      {note.purchaseOrder?.referenceNumber || 'Unlinked'}
                    </td>
                    <td className="px-8 py-5 font-mono text-xs font-black text-indigo-600">
                      ${note.amount}
                    </td>
                    <td className="px-8 py-5 text-xs text-slate-500">
                      {note.createdAt ? new Date(note.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                        note.status === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-600'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {note.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 transition-colors inline-block" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Debit Note Detail Drawer */}
      <AnimatePresence>
        {selectedNote && (
          <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ x: 350, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 350, opacity: 0 }}
              className="bg-white dark:bg-slate-800 w-full max-w-lg h-full shadow-2xl flex flex-col border-l border-slate-100 dark:border-slate-700 p-8"
            >
              <div className="flex justify-between items-center mb-8 shrink-0">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1.5 rounded-lg">
                    {selectedNote.debitNoteNumber}
                  </span>
                  <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-[9px] font-black uppercase text-slate-600">
                    {selectedNote.status}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedNote(null)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="flex-1 space-y-6 overflow-y-auto pr-1">
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    {selectedNote.supplier?.name || 'Debit Note'}
                  </h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                    Related PO: {selectedNote.purchaseOrder?.referenceNumber || 'Unlinked'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 p-5 bg-slate-50 dark:bg-slate-900 rounded-3xl">
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Adjustment Value</span>
                    <span className="text-base font-black text-indigo-600 font-mono">${selectedNote.amount}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Issue Date</span>
                    <span className="text-sm font-black text-slate-900 dark:text-white">
                      {selectedNote.createdAt ? new Date(selectedNote.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reason / Memo</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 p-5 rounded-2xl leading-relaxed font-semibold">
                    {selectedNote.reason}
                  </p>
                </div>

                {selectedNote.status === 'APPROVED' && (
                  <div className="p-4 bg-emerald-50/10 border border-emerald-200 rounded-2xl flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-xs font-black text-slate-900 uppercase">Posted to General Ledger</h5>
                      <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                        Accounts Payable (2100) Liability debited, Inventory Asset (1100) credited. Supplier AP ledger has been adjusted.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {selectedNote.status === 'DRAFT' && (
                <div className="pt-6 border-t border-slate-100 dark:border-slate-700 shrink-0">
                  <button
                    onClick={() => handleApprove(selectedNote.id)}
                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" /> Approve & Post to Accounts
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create Debit Note Modal */}
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
                  <Receipt className="w-5 h-5 text-indigo-500" />
                  New Debit Note
                </h2>
                <button
                  onClick={() => setCreateOpen(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <form onSubmit={handleCreateDebitNote} className="p-8 space-y-5">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                    Supplier Entity
                  </label>
                  <select
                    required
                    value={selectedSupplierId}
                    onChange={(e) => setSelectedSupplierId(e.target.value)}
                    className="w-full px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none font-bold text-xs"
                  >
                    <option value="">Select Supplier</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                    Purchase Order Reference
                  </label>
                  <select
                    required
                    value={selectedPoId}
                    onChange={(e) => setSelectedPoId(e.target.value)}
                    className="w-full px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none font-bold text-xs"
                  >
                    <option value="">Select PO</option>
                    {purchaseOrders.map((po) => (
                      <option key={po.id} value={po.id}>
                        {po.referenceNumber}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                    Adjustment Amount ($)
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none font-mono font-bold text-xs"
                    placeholder="e.g. 150"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                    Reason / Return Memo
                  </label>
                  <textarea
                    required
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none font-bold text-xs"
                    rows={3}
                    placeholder="Damaged stock on arrival / short shipment"
                  />
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
                    className="flex-[2] py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    Generate Debit Note
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
