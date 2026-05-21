'use client';

import { fetchAPI } from '@/services/api';
import { getUsers } from '@/services/user';
import { getCustomerWallet, manualCreditWallet, manualDebitWallet, WalletTransaction } from '@/services/wallet';
import { useEffect, useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import {
  Wallet, ArrowDownLeft, ArrowUpRight, Search, RefreshCw,
  Plus, Minus, Clock, FileText, User, ChevronRight, X, Loader2
} from 'lucide-react';

interface CustomerRow {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  walletBalance?: number;
}

export default function WalletManagement() {
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Selected Customer Details State
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [selectedCustomerWallet, setSelectedCustomerWallet] = useState<{ balance: number; history: WalletTransaction[] } | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Modal Adjustment States
  const [showAdjustModal, setShowAdjustModal] = useState<'credit' | 'debit' | null>(null);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustNote, setAdjustNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Load all customers initially
  const loadCustomers = async () => {
    setLoading(true);
    try {
      const users = await getUsers();
      // Filter out admin users or non-customer profiles if necessary, keep list simple
      const list = (users || []).map((u: any) => ({
        id: u.id,
        name: u.name || 'Unnamed Customer',
        email: u.email || 'N/A',
        phone: u.phone,
        role: u.role,
        walletBalance: 0 // Will fetch dynamically on click
      }));
      setCustomers(list);
    } catch (e: any) {
      toast.error(e.message || 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  // Fetch individual customer wallet history & current balance
  const fetchWalletDetails = async (customerId: string) => {
    setHistoryLoading(true);
    try {
      const summary = await getCustomerWallet(customerId);
      setSelectedCustomerWallet(summary);
      // Update balance in local customers list state
      setCustomers(prev => prev.map(c => c.id === customerId ? { ...c, walletBalance: summary.balance } : c));
    } catch (e: any) {
      toast.error(e.message || 'Failed to fetch customer wallet details');
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleSelectCustomer = (customerId: string) => {
    setSelectedCustomerId(customerId);
    fetchWalletDetails(customerId);
  };

  const handleAdjustmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) return;
    const amount = parseFloat(adjustAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount greater than 0');
      return;
    }

    setSubmitting(true);
    try {
      if (showAdjustModal === 'credit') {
        await manualCreditWallet(selectedCustomerId, amount, adjustNote || 'Admin manual top-up');
        toast.success(`Credited $${amount.toFixed(2)} to customer wallet`);
      } else {
        await manualDebitWallet(selectedCustomerId, amount, adjustNote || 'Admin manual debit adjustment');
        toast.success(`Debited $${amount.toFixed(2)} from customer wallet`);
      }
      // Reload wallet details and close modal
      await fetchWalletDetails(selectedCustomerId);
      setShowAdjustModal(null);
      setAdjustAmount('');
      setAdjustNote('');
    } catch (e: any) {
      toast.error(e.message || 'Adjustment failed');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCustomers = useMemo(() => {
    return customers.filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      (c.phone && c.phone.includes(search))
    );
  }, [customers, search]);

  const selectedCustomerInfo = useMemo(() => {
    return customers.find(c => c.id === selectedCustomerId);
  }, [customers, selectedCustomerId]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-display">Store Credit & Wallet</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage customer wallets, credit refunds, and track store credit liability ledger.
          </p>
        </div>
        <button
          onClick={loadCustomers}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-sm font-semibold disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Customer List */}
        <div className="lg:col-span-5 space-y-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search customer by name, email, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all text-sm"
            />
          </div>

          <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden max-h-[600px] overflow-y-auto">
            {loading ? (
              <div className="flex justify-center items-center py-20 text-slate-400 gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-brand-600" />
                Loading customers...
              </div>
            ) : filteredCustomers.length === 0 ? (
              <div className="py-20 text-center text-slate-400">
                <User className="w-8 h-8 mx-auto mb-2 opacity-50" />
                No customers found
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {filteredCustomers.map(customer => (
                  <button
                    key={customer.id}
                    onClick={() => handleSelectCustomer(customer.id)}
                    className={`w-full text-left p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center justify-between transition-colors ${
                      selectedCustomerId === customer.id ? 'bg-brand-50/50 dark:bg-brand-900/10 border-l-4 border-brand-600' : ''
                    }`}
                  >
                    <div className="min-w-0 flex-1 pr-4">
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate">{customer.name}</h4>
                      <p className="text-xs text-slate-400 truncate">{customer.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Wallet Ledger details */}
        <div className="lg:col-span-7">
          {selectedCustomerId ? (
            <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden p-6 space-y-6">
              {/* Profile Card Summary */}
              {selectedCustomerInfo && (
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-600">
                      <Wallet className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base">{selectedCustomerInfo.name}</h3>
                      <p className="text-xs text-slate-400">{selectedCustomerInfo.email}</p>
                    </div>
                  </div>
                  <div className="text-right sm:text-right">
                    <p className="text-xs text-slate-400 uppercase font-black tracking-wider">Available Balance</p>
                    <p className="text-2xl font-black text-brand-600 font-mono mt-0.5">
                      ${Number(selectedCustomerWallet?.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              )}

              {/* Adjust Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAdjustModal('credit')}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all text-sm shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Credit Wallet
                </button>
                <button
                  onClick={() => setShowAdjustModal('debit')}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold bg-rose-600 hover:bg-rose-700 text-white transition-all text-sm shadow-sm"
                >
                  <Minus className="w-4 h-4" /> Debit Wallet
                </button>
              </div>

              {/* Transaction Ledger List */}
              <div className="space-y-4">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  Transaction History (Ledger)
                </h4>

                {historyLoading ? (
                  <div className="flex justify-center items-center py-16 text-slate-400 gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Loading ledger...
                  </div>
                ) : !selectedCustomerWallet || selectedCustomerWallet.history.length === 0 ? (
                  <div className="py-16 text-center text-slate-400 border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    No wallet transactions found for this customer
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                    {selectedCustomerWallet.history.map((tx) => {
                      const isCredit = tx.amount > 0;
                      return (
                        <div key={tx.id} className="py-3.5 flex justify-between items-start gap-4">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                isCredit ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400'
                              }`}>
                                {isCredit ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                                {tx.type}
                              </span>
                              <span className="text-[11px] text-slate-400">{new Date(tx.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1 font-medium">{tx.note || 'Adjustment transaction'}</p>
                            {tx.referenceId && (
                              <p className="text-[10px] text-slate-400 font-mono mt-0.5">Ref: {tx.referenceType} ({tx.referenceId.slice(0, 8)})</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className={`text-sm font-bold font-mono ${isCredit ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {isCredit ? '+' : '-'}${Math.abs(tx.amount).toFixed(2)}
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">Bal: ${tx.balanceAfter.toFixed(2)}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-sm p-20 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
              <Wallet className="w-12 h-12 text-slate-300 dark:text-slate-600" />
              <div>
                <h3 className="font-bold text-slate-800 dark:text-white text-base">No Customer Selected</h3>
                <p className="text-xs text-slate-500 mt-1">Select a customer from the left sidebar to view their wallet balance and transaction ledger.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Manual Credit / Debit Adjustment Modal */}
      {showAdjustModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowAdjustModal(null)} />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  showAdjustModal === 'credit' ? 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600' : 'bg-rose-100 dark:bg-rose-950/30 text-rose-600'
                }`}>
                  {showAdjustModal === 'credit' ? <Plus className="w-5 h-5" /> : <Minus className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white capitalize">Manual Wallet {showAdjustModal}</h3>
                  <p className="text-xs text-slate-500">For {selectedCustomerInfo?.name}</p>
                </div>
              </div>
              <button
                onClick={() => setShowAdjustModal(null)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdjustmentSubmit} className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Amount (USD)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                  <input
                    required
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={adjustAmount}
                    onChange={(e) => setAdjustAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                    placeholder="0.00"
                    autoFocus
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Adjustment Note / Reason</label>
                <textarea
                  required
                  value={adjustNote}
                  onChange={(e) => setAdjustNote(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all text-sm"
                  placeholder={showAdjustModal === 'credit' ? 'e.g. Goodwill store credit top-up' : 'e.g. Manual correction debit'}
                  rows={3}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white disabled:opacity-50 transition-all shadow-lg ${
                  showAdjustModal === 'credit' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20' : 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/20'
                }`}
              >
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                Confirm {showAdjustModal === 'credit' ? 'Credit' : 'Debit'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
