'use client';

import React, { useEffect, useState } from 'react';
import { Loader2, ArrowUpRight, ArrowDownRight, PackagePlus } from 'lucide-react';
import Link from 'next/link';
import { fetchAPI } from '@/services/api';
import dayjs from 'dayjs';

export enum InventoryTransactionType {
  PURCHASE = 'PURCHASE',
  SALE = 'SALE',
  RETURN = 'RETURN',
  ADJUSTMENT = 'ADJUSTMENT',
  TRANSFER_IN = 'TRANSFER_IN',
  TRANSFER_OUT = 'TRANSFER_OUT',
  DAMAGE = 'DAMAGE',
  INITIAL_BALANCE = 'INITIAL_BALANCE',
  RESERVATION = 'RESERVATION',
  RESERVATION_CANCEL = 'RESERVATION_CANCEL',
}

interface ProductInventoryLedgerProps {
  productId: string;
}

export const ProductInventoryLedger = ({ productId }: ProductInventoryLedgerProps) => {
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<any[]>([]);

  useEffect(() => {
    if (productId) {
      loadLedger();
    }
  }, [productId]);

  const loadLedger = async () => {
    try {
      setLoading(true);
      const res = await fetchAPI(`/inventory-ledger/product/${productId}`);
      const data = res?.data || res || [];
      setEntries(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load ledger', error);
    } finally {
      setLoading(false);
    }
  };

  const isIncrement = (type: string, quantity: number) => {
    return [
      InventoryTransactionType.PURCHASE,
      InventoryTransactionType.RETURN,
      InventoryTransactionType.INITIAL_BALANCE,
      InventoryTransactionType.TRANSFER_IN,
      InventoryTransactionType.RESERVATION_CANCEL,
    ].includes(type as any) || (type === InventoryTransactionType.ADJUSTMENT && quantity > 0);
  };

  if (!productId) return null;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Inventory Ledger</h3>
          <p className="text-sm text-slate-500">Audit trail of all physical stock movements.</p>
        </div>
        <Link
          href={`/admin/procurement/orders/new?productId=${productId}`}
          className="flex items-center gap-2 px-4 py-2 bg-brand-50 text-brand-600 hover:bg-brand-100 dark:bg-brand-500/10 dark:hover:bg-brand-500/20 rounded-xl font-semibold transition-colors text-sm"
        >
          <PackagePlus className="w-4 h-4" />
          Restock via Procurement
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-brand-600" />
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-8 text-slate-500 text-sm bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
          No inventory history found. Initializing stock requires a Goods Received Note.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-700">
                <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Ref</th>
                <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Change</th>
                <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Balance</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => {
                const isInc = isIncrement(entry.type, entry.quantity);
                return (
                  <tr key={entry.id} className="border-b border-slate-50 dark:border-slate-800/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-300">
                      {dayjs(entry.createdAt).format('MMM dd, yyyy HH:mm')}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {entry.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm font-mono text-slate-500">
                      {entry.referenceNumber || '-'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold">
                      {isInc ? (
                        <span className="text-emerald-600 dark:text-emerald-400 flex items-center justify-end gap-1">
                          <ArrowUpRight className="w-3 h-3" />
                          +{Math.abs(entry.quantity)}
                        </span>
                      ) : (
                        <span className="text-rose-600 dark:text-rose-400 flex items-center justify-end gap-1">
                          <ArrowDownRight className="w-3 h-3" />
                          -{Math.abs(entry.quantity)}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-black text-slate-900 dark:text-white">
                      {entry.balanceAfter}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
