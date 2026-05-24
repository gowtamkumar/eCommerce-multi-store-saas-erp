'use client';

import { fetchAPI } from '@/services/api';
import {
  ArrowLeft,
  Briefcase,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  FileCheck,
  FileText,
  Loader2,
  Package,
  Shield,
  Truck,
  XCircle
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export default function SupplierPurchaseOrderDetails() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [po, setPo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fulfillment selections
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    Promise.all([
      fetchAPI(`/supplier-portal/purchase-orders/${id}`),
      fetchAPI('/system/warehouses').catch(() => ({ success: true, data: [] })),
      fetchAPI('/system/branches').catch(() => ({ success: true, data: [] }))
    ])
      .then(([poRes, whRes, brRes]) => {
        if (poRes.success && poRes.data) {
          setPo(poRes.data);
        } else {
          toast.error(poRes.message || 'Failed to retrieve purchase order');
          router.push('/supplier-portal/purchase-orders');
        }

        if (whRes.success && whRes.data) {
          setWarehouses(whRes.data);
          if (whRes.data.length > 0) setSelectedWarehouse(whRes.data[0].id);
        }
        if (brRes.success && brRes.data) {
          setBranches(brRes.data);
          if (brRes.data.length > 0) setSelectedBranch(brRes.data[0].id);
        }
      })
      .catch(() => {
        toast.error('Error loading page details');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id, router]);

  const handleUpdateStatus = async (status: string) => {
    if (status === 'received') {
      if (!selectedWarehouse || !selectedBranch) {
        toast.error('Please select destination warehouse and branch to receive inventory');
        return;
      }
    }

    setSubmittingAction(true);
    try {
      const res = await fetchAPI(`/supplier-portal/purchase-orders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({
          status,
          warehouseId: selectedWarehouse || undefined,
          branchId: selectedBranch || undefined,
        }),
      });

      if (res.success && res.data) {
        setPo(res.data);
        toast.success(`Purchase order status updated to ${status}`);
      } else {
        toast.error(res.message || 'Status update failed');
      }
    } catch {
      toast.error('Error updating status');
    } finally {
      setSubmittingAction(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  if (!po) {
    return (
      <div className="text-center py-12 text-slate-400 text-xs">
        Purchase Order not found.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Back button */}
      <div>
        <Link
          href="/supplier-portal/purchase-orders"
          className="inline-flex items-center gap-2 text-xs font-black text-slate-450 hover:text-white uppercase tracking-widest transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Purchase Orders
        </Link>
      </div>

      {/* Main Details and Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Order Info & Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Purchase Order</p>
                <h2 className="text-xl font-black text-white mt-1">{po.referenceNumber}</h2>
              </div>
              <span className={`px-3 py-1 text-xs font-black uppercase tracking-wider rounded-xl border ${
                po.status === 'received'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : po.status === 'pending'
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  : 'bg-slate-850 text-slate-400 border-slate-700'
              }`}>
                {po.status}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t border-slate-800/80 text-xs font-bold text-slate-400">
              <div>
                <p className="text-[9px] uppercase tracking-wider text-slate-500">PO Date</p>
                <p className="text-white mt-1">{new Date(po.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-wider text-slate-500">Expected Delivery</p>
                <p className="text-white mt-1">{po.deliveryDate ? new Date(po.deliveryDate).toLocaleDateString() : 'Immediate'}</p>
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-wider text-slate-500">Payment status</p>
                <p className="text-brand-400 mt-1 uppercase tracking-wider">{po.paymentStatus}</p>
              </div>
            </div>
          </div>

          {/* Items Card */}
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
            <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Package className="w-4 h-4 text-brand-400" />
              Procurement Line Items
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800/80 text-[10px] uppercase tracking-wider text-slate-500 font-black">
                    <th className="pb-3">Product Name</th>
                    <th className="pb-3 text-center">Quantity</th>
                    <th className="pb-3 text-right">Unit Price</th>
                    <th className="pb-3 text-right">Total Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-bold">
                  {po.items?.map((item: any) => (
                    <tr key={item.id} className="text-slate-300">
                      <td className="py-4 pr-3">
                        <p className="text-white font-black">{item.product?.name || 'Product'}</p>
                        {item.variant && (
                          <p className="text-[10px] text-slate-500 uppercase tracking-wide mt-0.5">
                            Variant: {Object.entries(item.variant.combination).map(([k, v]) => `${k}:${v}`).join(', ')}
                          </p>
                        )}
                        <p className="text-[10px] text-slate-500 mt-0.5">SKU: {item.variant?.sku || item.product?.sku || 'N/A'}</p>
                      </td>
                      <td className="py-4 text-center text-white">{item.quantity}</td>
                      <td className="py-4 text-right">${Number(item.unitPrice).toFixed(2)}</td>
                      <td className="py-4 text-right text-brand-400">${(item.quantity * Number(item.unitPrice)).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Side: Financial & Delivery Actions */}
        <div className="space-y-6">
          {/* Financial summary */}
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
            <h3 className="text-xs font-black text-white uppercase tracking-wider">AP Balance Statement</h3>
            
            <div className="space-y-3 font-bold text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Total Purchase Value</span>
                <span className="text-white">${Number(po.totalAmount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Amount Paid</span>
                <span className="text-emerald-400">+${Number(po.paidAmount || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-slate-800 font-black">
                <span className="text-white">Net Due</span>
                <span className="text-brand-400">${(Number(po.totalAmount) - Number(po.paidAmount || 0)).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Supplier actions */}
          {po.status === 'pending' && (
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-6">
              <div>
                <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Truck className="w-4.5 h-4.5 text-brand-500" />
                  Shipment & Delivery Intake
                </h3>
                <p className="text-[10px] text-slate-500 font-medium mt-1">Select the target destination warehouse and branch for receiving inventory updates.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-[9px] font-black uppercase tracking-wider text-slate-500">Target Warehouse</label>
                  <select
                    value={selectedWarehouse}
                    onChange={(e) => setSelectedWarehouse(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-805 rounded-2xl text-xs font-bold text-white outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-[9px] font-black uppercase tracking-wider text-slate-500">Receiving Branch</label>
                  <select
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-805 rounded-2xl text-xs font-bold text-white outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => handleUpdateStatus('received')}
                  disabled={submittingAction}
                  className="w-full py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-black text-xs rounded-2xl transition-all shadow-lg hover:shadow-xl shadow-brand-500/10 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submittingAction ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Acknowledge & Receive Goods
                    </>
                  )}
                </button>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleUpdateStatus('verified')}
                    disabled={submittingAction}
                    className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-750 text-white font-black text-[10px] rounded-xl tracking-wider uppercase border border-slate-750 flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    Approve PO
                  </button>
                  <button
                    onClick={() => handleUpdateStatus('cancelled')}
                    disabled={submittingAction}
                    className="flex-1 py-2.5 bg-red-950 hover:bg-red-900 border border-red-900/30 text-red-400 font-black text-[10px] tracking-wider uppercase flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Cancel PO
                  </button>
                </div>
              </div>
            </div>
          )}

          {po.status === 'received' && (
            <div className="p-6 bg-emerald-950/20 border border-emerald-900/30 rounded-3xl flex gap-3.5 items-start">
              <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                <FileCheck className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-xs font-black text-emerald-400 uppercase tracking-wider">PO FULFILLED</h4>
                <p className="text-[10px] text-slate-400 font-medium mt-1">This procurement cycle is complete. Goods received notes have been signed and inventory updated.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
