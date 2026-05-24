'use client';

import { fetchAPI } from '@/services/api';
import {
  Calendar,
  ChevronRight,
  Clock,
  DollarSign,
  FileText,
  Search
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export default function SupplierPurchaseOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'received'>('all');

  useEffect(() => {
    fetchAPI('/supplier-portal/purchase-orders')
      .then((res) => {
        if (res.success && res.data) {
          setOrders(res.data);
        }
      })
      .catch(() => {
        toast.error('Failed to retrieve purchase orders');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  // Filter orders by tab and search
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.referenceNumber.toLowerCase().includes(search.toLowerCase()) ||
      (o.id && o.id.toLowerCase().includes(search.toLowerCase()));

    const matchesTab =
      activeTab === 'all' ||
      (activeTab === 'pending' && o.status === 'pending') ||
      (activeTab === 'received' && o.status === 'received');

    return matchesSearch && matchesTab;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Purchase Orders</h1>
          <p className="text-xs text-slate-400 font-medium mt-1">Accept, track shipments, and request fulfillment for active procurements.</p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search PO reference..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-900 gap-6">
        {(['all', 'pending', 'received'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-4 text-xs font-black uppercase tracking-wider transition-all relative ${
              activeTab === tab ? 'text-white' : 'text-slate-500 hover:text-slate-400'
            }`}
          >
            {tab}
            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden divide-y divide-slate-800/60">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">No purchase orders match your criteria.</div>
        ) : (
          filteredOrders.map((order) => (
            <Link
              key={order.id}
              href={`/supplier-portal/purchase-orders/${order.id}`}
              className="flex items-center justify-between p-6 hover:bg-slate-850/30 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-850 rounded-2xl flex items-center justify-center border border-slate-800">
                  <FileText className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-xs font-black text-white">{order.referenceNumber}</h3>
                    <span className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-wider rounded border ${
                      order.status === 'received'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : order.status === 'pending'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        : 'bg-slate-850 text-slate-400 border-slate-700'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] text-slate-500 font-medium mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                    {order.deliveryDate && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        Due: {new Date(order.deliveryDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs font-black text-brand-400">${Number(order.totalAmount).toFixed(2)}</p>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Value</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
