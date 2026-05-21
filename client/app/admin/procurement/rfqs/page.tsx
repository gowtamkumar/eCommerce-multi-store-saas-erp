'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeftRight,
  Plus,
  Search,
  Calendar,
  Clock,
  User,
  X,
  FileText,
  DollarSign,
  Briefcase,
  ChevronRight,
  Award,
  Send,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getRFQs,
  createRFQ,
  submitQuotation,
  awardQuotation,
  getSuppliers,
  getRequisitions
} from '@/services/procurement';

interface Quotation {
  id: string;
  supplierId: string;
  supplier?: { name: string };
  totalAmount: number;
  leadTimeDays: number;
  termsAndConditions?: string;
  status: string;
}

interface RFQ {
  id: string;
  rfqNumber: string;
  deadlineDate: string;
  status: string;
  prId?: string;
  purchaseRequisition?: { prNumber: string; justification?: string };
  createdBy?: { name: string };
  quotations: Quotation[];
}

export default function RFQPage() {
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRfq, setSelectedRfq] = useState<RFQ | null>(null);

  // Modals
  const [createOpen, setCreateOpen] = useState(false);
  const [bidOpen, setBidOpen] = useState(false);

  // Form states - Create RFQ
  const [deadlineDate, setDeadlineDate] = useState('');
  const [prId, setPrId] = useState('');
  const [requisitions, setRequisitions] = useState<any[]>([]);

  // Form states - Submit Bid
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [bidAmount, setBidAmount] = useState('');
  const [leadTime, setLeadTime] = useState('');
  const [terms, setTerms] = useState('');

  const fetchRFQs = async () => {
    try {
      setLoading(true);
      const data = await getRFQs();
      setRfqs(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load RFQs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRFQs();

    // Load extra dropdown info
    getSuppliers().then(setSuppliers).catch(console.error);
    getRequisitions().then((data) => {
      // Show only Approved requisitions that can be sourced
      setRequisitions(data.filter((r: any) => r.status === 'APPROVED'));
    }).catch(console.error);
  }, []);

  const filteredRfqs = useMemo(() => {
    return rfqs.filter((r) =>
      r.rfqNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.purchaseRequisition?.prNumber || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [rfqs, searchQuery]);

  const handleCreateRFQ = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deadlineDate) {
      toast.error('Deadline date is required');
      return;
    }

    try {
      await createRFQ({
        deadlineDate: new Date(deadlineDate).toISOString(),
        prId: prId || undefined,
      });
      toast.success('RFQ created successfully');
      setCreateOpen(false);
      setDeadlineDate('');
      setPrId('');
      fetchRFQs();
    } catch (err) {
      console.error(err);
      toast.error('Failed to create RFQ');
    }
  };

  const handleSubmittingBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRfq || !selectedSupplierId || !bidAmount) return;

    try {
      await submitQuotation(selectedRfq.id, {
        supplierId: selectedSupplierId,
        totalAmount: parseFloat(bidAmount),
        leadTimeDays: parseInt(leadTime) || 0,
        termsAndConditions: terms,
      });
      toast.success('Supplier Bid submitted successfully');
      setBidOpen(false);
      setSelectedSupplierId('');
      setBidAmount('');
      setLeadTime('');
      setTerms('');
      // Refresh current detail drawer
      const updatedRfqs = await getRFQs();
      setRfqs(updatedRfqs);
      const matchingRfq = updatedRfqs.find((r: any) => r.id === selectedRfq.id);
      if (matchingRfq) setSelectedRfq(matchingRfq);
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit bid');
    }
  };

  const handleAwardBid = async (quotationId: string) => {
    if (!confirm('Are you sure you want to award the contract to this supplier? This will automatically create a Purchase Order.')) return;

    try {
      await awardQuotation(quotationId);
      toast.success('RFQ awarded! Purchase Order created.');
      setSelectedRfq(null);
      fetchRFQs();
    } catch (err) {
      console.error(err);
      toast.error('Failed to award contract');
    }
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight italic uppercase">
            Supplier <span className="text-indigo-600">Quotations (RFQs)</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">
            Supplier Bids & Contract Awarding
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500" />
            <input
              type="text"
              placeholder="Search RFQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all shadow-sm"
            />
          </div>
          <button
            onClick={() => setCreateOpen(true)}
            className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> New RFQ
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      ) : (
        /* RFQ Grid list */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRfqs.map((rfq) => (
            <motion.div
              whileHover={{ y: -4 }}
              key={rfq.id}
              onClick={() => setSelectedRfq(rfq)}
              className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-700 hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1 rounded-md">
                    {rfq.rfqNumber}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                    rfq.status === 'OPEN'
                      ? 'bg-emerald-100 text-emerald-600'
                      : rfq.status === 'AWARDED'
                      ? 'bg-indigo-100 text-indigo-600'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {rfq.status}
                  </span>
                </div>

                <h3 className="text-base font-black text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 transition-colors">
                  {rfq.purchaseRequisition
                    ? `Source: ${rfq.purchaseRequisition.prNumber}`
                    : 'Ad-hoc Sourcing Proposal'}
                </h3>
                {rfq.purchaseRequisition?.justification && (
                  <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
                    {rfq.purchaseRequisition.justification}
                  </p>
                )}

                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Deadline: {new Date(rfq.deadlineDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                    <User className="w-3.5 h-3.5" />
                    <span>Created by: {rfq.createdBy?.name || 'Admin'}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-50 dark:border-slate-700/50 flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {rfq.quotations?.length || 0} Bids Submitted
                </span>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* RFQ Detail Drawer */}
      <AnimatePresence>
        {selectedRfq && (
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
                    {selectedRfq.rfqNumber}
                  </span>
                  <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-[9px] font-black uppercase text-slate-600">
                    {selectedRfq.status}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedRfq(null)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="flex-1 space-y-6 overflow-y-auto pr-1">
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    {selectedRfq.purchaseRequisition
                      ? `Requisition: ${selectedRfq.purchaseRequisition.prNumber}`
                      : 'Ad-hoc Sourcing Campaign'}
                  </h3>
                  {selectedRfq.purchaseRequisition?.justification && (
                    <p className="text-xs text-slate-500 mt-2 bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl font-medium leading-relaxed">
                      {selectedRfq.purchaseRequisition.justification}
                    </p>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Quotations & Bids</h4>
                    {selectedRfq.status === 'OPEN' && (
                      <button
                        onClick={() => setBidOpen(true)}
                        className="px-3.5 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-100 flex items-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" /> Submit Bid
                      </button>
                    )}
                  </div>

                  {selectedRfq.quotations?.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 dark:bg-slate-900 rounded-3xl">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">No bids submitted yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedRfq.quotations.map((q) => (
                        <div
                          key={q.id}
                          className={`p-5 rounded-3xl border flex justify-between items-center ${
                            q.status === 'ACCEPTED'
                              ? 'border-emerald-500 bg-emerald-50/10'
                              : 'border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900'
                          }`}
                        >
                          <div>
                            <div className="text-xs font-black text-slate-900 dark:text-white">
                              {q.supplier?.name || 'Unknown Supplier'}
                            </div>
                            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">
                              Lead Time: {q.leadTimeDays} days
                            </div>
                            {q.termsAndConditions && (
                              <div className="text-[10px] text-slate-500 mt-2 leading-relaxed">
                                {q.termsAndConditions}
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-black font-mono text-indigo-600">${q.totalAmount}</div>
                            {selectedRfq.status === 'OPEN' && (
                              <button
                                onClick={() => handleAwardBid(q.id)}
                                className="mt-2 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1"
                              >
                                <Award className="w-3 h-3" /> Award
                              </button>
                            )}
                            {q.status === 'ACCEPTED' && (
                              <span className="mt-2 inline-block px-2.5 py-0.5 bg-emerald-100 text-emerald-600 rounded-full text-[8px] font-black uppercase tracking-wider">
                                Accepted
                              </span>
                            )}
                            {q.status === 'REJECTED' && (
                              <span className="mt-2 inline-block px-2.5 py-0.5 bg-rose-100 text-rose-600 rounded-full text-[8px] font-black uppercase tracking-wider">
                                Rejected
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create RFQ Modal */}
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
                  <ArrowLeftRight className="w-5 h-5 text-indigo-500" />
                  New Sourcing RFQ
                </h2>
                <button
                  onClick={() => setCreateOpen(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <form onSubmit={handleCreateRFQ} className="p-8 space-y-5">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                    Sourcing Deadline
                  </label>
                  <input
                    type="date"
                    required
                    value={deadlineDate}
                    onChange={(e) => setDeadlineDate(e.target.value)}
                    className="w-full px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all font-bold text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                    Link Purchase Requisition (Optional)
                  </label>
                  <select
                    value={prId}
                    onChange={(e) => setPrId(e.target.value)}
                    className="w-full px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all font-bold text-xs"
                  >
                    <option value="">No Requisition Link</option>
                    {requisitions.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.prNumber} - {r.justification || 'General'}
                      </option>
                    ))}
                  </select>
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
                    Save RFQ Campaign
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Submit Bid Modal */}
      <AnimatePresence>
        {bidOpen && selectedRfq && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-800 w-full max-w-md rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden"
            >
              <div className="flex justify-between items-center p-8 border-b border-slate-50 dark:border-slate-700">
                <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-tight">
                  <Send className="w-5 h-5 text-indigo-500" />
                  Submit Supplier Quotation
                </h2>
                <button
                  onClick={() => setBidOpen(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <form onSubmit={handleSubmittingBid} className="p-8 space-y-5">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                    Supplier Entity
                  </label>
                  <select
                    required
                    value={selectedSupplierId}
                    onChange={(e) => setSelectedSupplierId(e.target.value)}
                    className="w-full px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all font-bold text-xs"
                  >
                    <option value="">Select Supplier</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                      Total Bid Amount ($)
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      step="0.01"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      className="w-full px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all font-mono font-bold text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                      Lead Time (Days)
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={leadTime}
                      onChange={(e) => setLeadTime(e.target.value)}
                      className="w-full px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all font-mono font-bold text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                    Terms & Conditions
                  </label>
                  <textarea
                    value={terms}
                    onChange={(e) => setTerms(e.target.value)}
                    className="w-full px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all font-bold text-xs"
                    rows={3}
                    placeholder="Enter terms, payment terms, or shipping constraints..."
                  />
                </div>

                <div className="pt-4 flex gap-4">
                  <button
                    type="button"
                    onClick={() => setBidOpen(false)}
                    className="flex-1 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-black text-xs uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-[2] py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg"
                  >
                    Submit Proposal
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
