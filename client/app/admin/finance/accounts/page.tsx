'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Scale,
  Plus,
  Search,
  X,
  Edit2,
  Trash2,
  Database
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getAccounts,
  createAccount,
  updateAccount,
  deleteAccount,
  initializeAccounting
} from '@/services/accounting';
import DataTable, { DataTableColumn } from '@/components/shared/DataTable';

interface Account {
  id: string;
  code: string;
  name: string;
  type: string;
  category: string;
  balance: number;
  isSystem: boolean;
}

export default function ChartOfAccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  // Form states
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState('ASSET');
  const [category, setCategory] = useState('CASH_BANK');

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const res = await getAccounts();
      setAccounts(res?.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load Chart of Accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleInitCOA = async () => {
    try {
      await initializeAccounting();
      toast.success('Default Chart of Accounts seeded!');
      fetchAccounts();
    } catch (err) {
      console.error(err);
      toast.error('Failed to initialize accounts');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !name) return;

    try {
      await createAccount({ code, name, type, category });
      toast.success('Account created successfully');
      setCreateOpen(false);
      setCode('');
      setName('');
      fetchAccounts();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create account');
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccount || !name) return;

    try {
      await updateAccount(selectedAccount.id, { name, type, category });
      toast.success('Account updated successfully');
      setEditOpen(false);
      setSelectedAccount(null);
      setName('');
      fetchAccounts();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update account');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this account? This cannot be undone.')) return;

    try {
      await deleteAccount(id);
      toast.success('Account deleted successfully');
      fetchAccounts();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete account');
    }
  };

  const filteredAccounts = useMemo(() => {
    return accounts.filter(
      (a) =>
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.code.includes(searchQuery)
    );
  }, [accounts, searchQuery]);

  const columns = useMemo<DataTableColumn<Account>[]>(() => [
    {
      key: 'code',
      header: 'Account Code',
      cell: (acc) => (
        <span className="text-xs font-black text-slate-900 dark:text-white font-mono bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-700">
          {acc.code}
        </span>
      ),
    },
    {
      key: 'name',
      header: 'Account Name',
      cell: (acc) => (
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
          {acc.name}
        </span>
      ),
    },
    {
      key: 'type',
      header: 'Classification',
      cell: (acc) => (
        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
          acc.type === 'ASSET'
            ? 'bg-emerald-100 text-emerald-600'
            : acc.type === 'LIABILITY'
            ? 'bg-rose-100 text-rose-600'
            : acc.type === 'REVENUE'
            ? 'bg-indigo-100 text-indigo-600'
            : 'bg-slate-100 text-slate-600'
        }`}>
          {acc.type}
        </span>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      cell: (acc) => (
        <span className="text-xs text-slate-500 font-semibold">
          {acc.category}
        </span>
      ),
    },
    {
      key: 'balance',
      header: 'Current Balance',
      cell: (acc) => (
        <span className="text-xs font-black font-mono text-slate-900 dark:text-white">
          ${Number(acc.balance).toFixed(2)}
        </span>
      ),
    },
    {
      key: 'isSystem',
      header: 'Type',
      cell: (acc) => acc.isSystem ? (
        <span className="px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
          System Locked
        </span>
      ) : (
        <span className="px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider bg-slate-100 text-slate-500">
          Custom
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      headerClassName: 'text-right',
      className: 'text-right',
      cell: (acc) => !acc.isSystem ? (
        <div className="flex justify-end gap-2">
          <button
            onClick={() => {
              setSelectedAccount(acc);
              setName(acc.name);
              setType(acc.type);
              setCategory(acc.category);
              setEditOpen(true);
            }}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors inline-block"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          {Number(acc.balance) === 0 && (
            <button
              onClick={() => handleDelete(acc.id)}
              className="p-2 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-colors inline-block"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : null,
    },
  ], []);

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight italic uppercase">
            Chart of <span className="text-indigo-600">Accounts</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">
            General Ledger Structure & Account Classifications
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500" />
            <input
              type="text"
              placeholder="Search by code or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all shadow-sm"
            />
          </div>
          {accounts.length === 0 ? (
            <button
              onClick={handleInitCOA}
              className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              <Database className="w-4 h-4" /> Seed System COA
            </button>
          ) : (
            <button
              onClick={() => setCreateOpen(true)}
              className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Account
            </button>
          )}
        </div>
      </div>

      <DataTable
        data={filteredAccounts}
        columns={columns}
        getRowKey={(acc) => acc.id}
        loading={loading}
        emptyLabel="No Chart of Accounts matches the search filters."
        minWidthClassName="min-w-[1000px]"
        containerClassName="rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden"
      />

      {/* Create Account Modal */}
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
                  <Scale className="w-5 h-5 text-indigo-500" />
                  Add Custom Account
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
                    Account Code
                  </label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none font-mono font-bold text-xs"
                    placeholder="e.g. 6100"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                    Account Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none font-bold text-xs"
                    placeholder="e.g. Marketing Expense"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                      Account Type
                    </label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none font-bold text-xs"
                    >
                      <option value="ASSET">Asset</option>
                      <option value="LIABILITY">Liability</option>
                      <option value="EQUITY">Equity</option>
                      <option value="REVENUE">Revenue</option>
                      <option value="EXPENSE">Expense</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none font-bold text-xs"
                    >
                      <option value="CASH_BANK">Cash & Bank</option>
                      <option value="RECEIVABLE">Receivable</option>
                      <option value="INVENTORY">Inventory</option>
                      <option value="FIXED_ASSET">Fixed Asset</option>
                      <option value="PAYABLE">Payable</option>
                      <option value="EQUITY">Equity</option>
                      <option value="SALES">Sales</option>
                      <option value="COGS">COGS</option>
                      <option value="OPERATING_EXPENSE">Operating Expense</option>
                      <option value="OTHER">Other</option>
                    </select>
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
                    Save Account
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Account Modal */}
      <AnimatePresence>
        {editOpen && selectedAccount && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-800 w-full max-w-md rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden"
            >
              <div className="flex justify-between items-center p-8 border-b border-slate-50 dark:border-slate-700">
                <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-tight">
                  <Scale className="w-5 h-5 text-indigo-500" />
                  Edit Account: {selectedAccount.code}
                </h2>
                <button
                  onClick={() => {
                    setEditOpen(false);
                    setSelectedAccount(null);
                  }}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <form onSubmit={handleEdit} className="p-8 space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                    Account Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none font-bold text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                      Account Type
                    </label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none font-bold text-xs"
                    >
                      <option value="ASSET">Asset</option>
                      <option value="LIABILITY">Liability</option>
                      <option value="EQUITY">Equity</option>
                      <option value="REVENUE">Revenue</option>
                      <option value="EXPENSE">Expense</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none font-bold text-xs"
                    >
                      <option value="CASH_BANK">Cash & Bank</option>
                      <option value="RECEIVABLE">Receivable</option>
                      <option value="INVENTORY">Inventory</option>
                      <option value="FIXED_ASSET">Fixed Asset</option>
                      <option value="PAYABLE">Payable</option>
                      <option value="EQUITY">Equity</option>
                      <option value="SALES">Sales</option>
                      <option value="COGS">COGS</option>
                      <option value="OPERATING_EXPENSE">Operating Expense</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 flex gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setEditOpen(false);
                      setSelectedAccount(null);
                    }}
                    className="flex-1 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-black text-xs uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-[2] py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg"
                  >
                    Update Account
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
