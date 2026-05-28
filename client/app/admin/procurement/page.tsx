'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Package,
  Truck,
  Users,
  DollarSign,
  Plus,
  ChevronRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { getSuppliers, getPurchaseOrders } from '@/services/procurement';
import { fetchAPI } from '@/services/api';
import { Supplier } from '@/features/admin/supplier/types';
import { PurchaseOrder } from '@/features/admin/purchase/types';
import { Product } from '@/features/admin/product/types';
import Link from 'next/link';

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  subValue: string;
}

const StatCard = ({ label, value, icon: Icon, color, subValue }: StatCardProps) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700 transition-all hover:shadow-xl group"
  >
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-2xl ${color} bg-opacity-10 group-hover:scale-110 transition-transform`}>
        <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
      </div>
      <div className="flex flex-col items-end">
        <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">
          {label}
        </p>
        <h3 className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
          {value}
        </h3>
      </div>
    </div>
    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-50 dark:border-slate-700/50">
      <TrendingUp className="w-3 h-3 text-emerald-500" />
      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
        {subValue}
      </span>
    </div>
  </motion.div>
);

export default function ProcurementDashboard() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [suppliersData, ordersData, productsRes] = await Promise.all([
          getSuppliers(),
          getPurchaseOrders(),
          fetchAPI('/products?limit=100').catch(() => null),
        ]);
        setSuppliers(suppliersData);
        setPurchaseOrders(ordersData);

        let lowStock = 0;
        if (productsRes && productsRes.success) {
          const productList: (Product & { stock?: number; lowStockThreshold?: number })[] = productsRes.data || [];
          const lowStockItems = productList.filter(
            p => Number(p.stock || 0) <= Number(p.lowStockThreshold || 5)
          );
          lowStock = lowStockItems.length;
        }
        setLowStockCount(lowStock);
      } catch (err) {
        console.error('Failed to fetch procurement data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  // Calculate dynamic stats
  const totalSpend = purchaseOrders.reduce((sum, po) => sum + Number(po.totalAmount || 0), 0);
  
  const activeOrders = purchaseOrders.filter(po => {
    const status = po.status?.toUpperCase() || '';
    return status === 'PENDING' || status === 'DRAFT';
  });
  
  const delayedOrdersCount = activeOrders.filter(po => 
    po.deliveryDate && new Date(po.deliveryDate) < new Date()
  ).length;

  const pendingReceiptsCount = purchaseOrders.filter(po => 
    po.status?.toUpperCase() === 'PENDING'
  ).length;

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight italic uppercase">
            Procurement <span className="text-indigo-600">& Supply</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">
            Global Sourcing & Inventory Logistics Control
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/procurement/suppliers">
            <button className="px-6 py-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl font-black text-xs uppercase tracking-widest border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all flex items-center gap-2">
              <Users className="w-4 h-4" />
              Suppliers
            </button>
          </Link>
          <Link href="/admin/procurement/purchases/new">
            <button className="px-6 py-3 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-colors flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New Purchase Order
            </button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Total Spend" 
          value={`$${totalSpend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
          icon={DollarSign} 
          color="bg-indigo-500" 
          subValue="Total committed procurement spend" 
        />
        <StatCard 
          label="Active Orders" 
          value={activeOrders.length.toString()} 
          icon={Package} 
          color="bg-amber-500" 
          subValue={`${delayedOrdersCount} orders delayed`} 
        />
        <StatCard 
          label="Total Suppliers" 
          value={suppliers.length.toString()} 
          icon={Users} 
          color="bg-emerald-500" 
          subValue="Registered SRM Vendors" 
        />
        <StatCard 
          label="Pending Receipts" 
          value={pendingReceiptsCount.toString()} 
          icon={Truck} 
          color="bg-rose-500" 
          subValue="Warehouse inbound queue" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders Table */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
          <div className="p-8 border-b border-slate-50 dark:border-slate-700/50 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                Recent <span className="text-indigo-600">Purchase Orders</span>
              </h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                Latest execution records and delivery status
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            {purchaseOrders.length === 0 ? (
              <div className="p-8 text-center text-xs font-bold text-slate-400 uppercase">
                No purchase orders found
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-700/30">
                    <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Order ID</th>
                    <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Supplier</th>
                    <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                    <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-8 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                  {purchaseOrders.slice(0, 5).map((po) => (
                    <tr key={po.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors group">
                      <td className="px-8 py-5">
                        <span className="text-xs font-black text-slate-900 dark:text-white font-mono">{po.referenceNumber}</span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-[10px] font-black text-indigo-600">
                            {po.supplier?.name?.charAt(0) || 'S'}
                          </div>
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{po.supplier?.name || 'Unknown Supplier'}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 font-mono text-xs font-bold">${Number(po.totalAmount || 0).toLocaleString()}</td>
                      <td className="px-8 py-5">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                          po.status?.toUpperCase() === 'RECEIVED' ? 'bg-emerald-100 text-emerald-600' :
                          po.status?.toUpperCase() === 'PENDING' ? 'bg-amber-100 text-amber-600' :
                          po.status?.toUpperCase() === 'CANCELLED' ? 'bg-rose-100 text-rose-600' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {po.status}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <Link href={`/admin/procurement/purchases/${po.id}`}>
                          <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Sidebar: Suppliers & Performance */}
        <div className="space-y-8">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                Top <span className="text-indigo-600">Suppliers</span>
              </h2>
              <Link href="/admin/procurement/suppliers" className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:underline">
                View All
              </Link>
            </div>
            <div className="space-y-4">
              {suppliers.length === 0 ? (
                <div className="p-4 text-center text-xs font-bold text-slate-400 uppercase">
                  No suppliers registered
                </div>
              ) : (
                suppliers.slice(0, 4).map((s, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-700/50 hover:bg-white dark:hover:bg-slate-700 hover:shadow-md transition-all cursor-pointer group">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-xs font-black text-white">
                      {s.name?.charAt(0) || 'S'}
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white">{s.name}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                        {typeof s.category === 'object' ? s.category?.name : s.category || 'General'}
                      </p>
                    </div>
                    <div className="ml-auto text-right">
                      <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Score</p>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {s.rating ? `${Math.round(s.rating * 20)}%` : '98%'}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className={`p-8 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden group transition-all ${
            lowStockCount > 0 ? 'bg-indigo-600' : 'bg-emerald-600'
          }`}>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mb-16 blur-2xl group-hover:scale-110 transition-transform"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className={`w-5 h-5 ${lowStockCount > 0 ? 'text-indigo-200' : 'text-emerald-200'}`} />
                <h3 className="text-sm font-black uppercase tracking-[0.2em]">
                  {lowStockCount > 0 ? 'Inventory Alert' : 'Inventory Optimal'}
                </h3>
              </div>
              <p className="text-xl font-black italic mb-4 leading-tight">
                {lowStockCount > 0 ? (
                  <>Critical stock levels detected for <span className="text-indigo-200">{lowStockCount} items.</span></>
                ) : (
                  "All warehouse items are within healthy parameters."
                )}
              </p>
              {lowStockCount > 0 ? (
                <Link href="/admin/procurement/requisitions">
                  <button className="px-6 py-2 bg-white text-indigo-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-50 transition-colors">
                    Restock Now
                  </button>
                </Link>
              ) : (
                <Link href="/admin/procurement/requisitions">
                  <button className="px-6 py-2 bg-white text-emerald-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-50 transition-colors">
                    Create Requisition
                  </button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
