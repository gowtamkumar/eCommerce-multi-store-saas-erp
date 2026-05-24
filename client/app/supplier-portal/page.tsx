'use client';

import { fetchAPI } from '@/services/api';
import {
  Award,
  Calendar,
  Clock,
  DollarSign,
  FileCheck,
  FileClock,
  FileText,
  HelpCircle,
  Percent,
  Star
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export default function SupplierDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchAPI('/supplier-portal/me'),
      fetchAPI('/supplier-portal/purchase-orders')
    ])
      .then(([profileRes, ordersRes]) => {
        if (profileRes.success && profileRes.data) {
          setProfile(profileRes.data);
        }
        if (ordersRes.success && ordersRes.data) {
          setOrders(ordersRes.data);
        }
      })
      .catch(() => {
        toast.error('Failed to load dashboard data');
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

  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const receivedOrders = orders.filter((o) => o.status === 'received');

  return (
    <div className="space-y-8">
      {/* Header and Welcome */}
      <div>
        <h1 className="text-2xl font-black text-white">Partner Dashboard</h1>
        <p className="text-xs text-slate-400 font-medium mt-1">Welcome back! Review your active purchase orders, fulfillment timelines, and metrics.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Outstanding AP</p>
            <h3 className="text-lg font-black text-brand-400 mt-2">${Number(profile?.currentBalance || 0).toFixed(2)}</h3>
          </div>
          <div className="w-12 h-12 bg-brand-500/10 rounded-2xl flex items-center justify-center border border-brand-500/15">
            <DollarSign className="w-5 h-5 text-brand-400" />
          </div>
        </div>

        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Pending Orders</p>
            <h3 className="text-lg font-black text-white mt-2">{pendingOrders.length}</h3>
          </div>
          <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center border border-amber-500/15">
            <FileClock className="w-5 h-5 text-amber-400" />
          </div>
        </div>

        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Fulfilled Orders</p>
            <h3 className="text-lg font-black text-emerald-400 mt-2">{receivedOrders.length}</h3>
          </div>
          <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/15">
            <FileCheck className="w-5 h-5 text-emerald-400" />
          </div>
        </div>

        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Performance Rating</p>
            <h3 className="text-lg font-black text-white mt-2 flex items-center gap-1.5">
              {Number(profile?.rating || 0).toFixed(1)}
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            </h3>
          </div>
          <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/15">
            <Award className="w-5 h-5 text-blue-400" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Active/Recent Purchase Orders */}
        <div className="lg:col-span-2 p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-black text-white uppercase tracking-wider">Latest Purchase Orders</h3>
            <Link
              href="/supplier-portal/purchase-orders"
              className="text-[10px] font-black text-brand-400 hover:text-brand-300 uppercase tracking-widest"
            >
              View All POs
            </Link>
          </div>

          <div className="divide-y divide-slate-800/60 space-y-2">
            {orders.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">No purchase orders found.</div>
            ) : (
              orders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex flex-wrap items-center justify-between py-4 first:pt-0 last:pb-0 gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-slate-850 rounded-xl flex items-center justify-center border border-slate-800">
                      <FileText className="w-4.5 h-4.5 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-white">{order.referenceNumber}</p>
                      <p className="text-[10px] text-slate-500 font-medium mt-0.5">Created: {new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-xs font-black text-brand-400">${Number(order.totalAmount).toFixed(2)}</p>
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Value</p>
                    </div>
                    <span className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-wider rounded-lg border ${
                      order.status === 'received'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : order.status === 'pending'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      {order.status}
                    </span>
                    <Link
                      href={`/supplier-portal/purchase-orders/${order.id}`}
                      className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-750 text-white font-black text-[10px] rounded-lg tracking-wider uppercase border border-slate-750"
                    >
                      Open
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Side: Supplier Details & Performance Metrics */}
        <div className="space-y-6">
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
            <h3 className="text-xs font-black text-white uppercase tracking-wider">Performance Audit</h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-400 mb-1.5">
                  <span>On-time Delivery</span>
                  <span className="text-white">{profile?.performance?.onTimeDeliveryRate || 100}%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-brand-500 h-full rounded-full" style={{ width: `${profile?.performance?.onTimeDeliveryRate || 100}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-400 mb-1.5">
                  <span>Order Fulfillment Rate</span>
                  <span className="text-white">{profile?.performance?.fulfillmentRate || 100}%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${profile?.performance?.fulfillmentRate || 100}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-400 mb-1.5">
                  <span>Quality Score</span>
                  <span className="text-white">{profile?.performance?.qualityScore || 100}%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full" style={{ width: `${profile?.performance?.qualityScore || 100}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
            <h3 className="text-xs font-black text-white uppercase tracking-wider">Partner Profiles</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-400">Category</span>
                <span className="text-white uppercase">{profile?.category}</span>
              </div>
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-400">Lead Time Float</span>
                <span className="text-white flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  {profile?.leadTimeDays || 3} days
                </span>
              </div>
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-400">Tax Registration</span>
                <span className="text-white">{profile?.taxId || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
