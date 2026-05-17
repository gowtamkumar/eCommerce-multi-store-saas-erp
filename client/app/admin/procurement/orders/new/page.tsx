'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Package, 
  Plus, 
  Trash2, 
  Save, 
  ArrowLeft, 
  Calendar, 
  Building, 
  DollarSign,
  FileText,
  Calculator
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { getSuppliers, createPurchaseOrder } from '@/services/procurement';
import { fetchAPI } from '@/services/api';

export default function NewPurchaseOrder() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryProductId = searchParams.get('productId');
  
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [orderData, setOrderData] = useState({
    supplierId: '',
    branchId: 'BRANCH-001', // Mock default
    orderDate: new Date().toISOString().split('T')[0],
    expectedDeliveryDate: '',
    notes: '',
    items: [
      { productId: '', productName: '', quantityOrdered: 1, unitPrice: 0, totalPrice: 0 }
    ]
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      const data = await getSuppliers();
      setSuppliers(data);

      if (queryProductId) {
        try {
          const productRes = await fetchAPI(`/products/${queryProductId}`);
          if (productRes) {
            setOrderData((prev) => ({
              ...prev,
              supplierId: productRes.supplierId || prev.supplierId || '',
              items: [
                {
                  productId: productRes.id,
                  productName: productRes.name,
                  quantityOrdered: 10, // Recommended standard restock level
                  unitPrice: Number(productRes.price || 0),
                  totalPrice: Number(productRes.price || 0) * 10,
                }
              ]
            }));
          }
        } catch (err) {
          console.error('Failed to pre-populate product in PO:', err);
        }
      }
    };
    fetchInitialData();
  }, [queryProductId]);

  const addItem = () => {
    setOrderData({
      ...orderData,
      items: [...orderData.items, { productId: `P-00${orderData.items.length + 1}`, productName: '', quantityOrdered: 1, unitPrice: 0, totalPrice: 0 }]
    });
  };

  const removeItem = (index: number) => {
    const newItems = orderData.items.filter((_, i) => i !== index);
    setOrderData({ ...orderData, items: newItems });
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...orderData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Auto-calculate total
    if (field === 'quantityOrdered' || field === 'unitPrice') {
      newItems[index].totalPrice = newItems[index].quantityOrdered * newItems[index].unitPrice;
    }
    
    setOrderData({ ...orderData, items: newItems });
  };

  const grandTotal = orderData.items.reduce((sum, item) => sum + item.totalPrice, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createPurchaseOrder({
        ...orderData,
        totalAmount: grandTotal
      });
      router.push('/admin/procurement');
    } catch (err) {
      console.error('Failed to create PO:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-[1200px] mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/procurement" className="p-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 hover:bg-slate-50 transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight italic uppercase">
              New <span className="text-indigo-600">Purchase Order</span>
            </h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Create an official procurement document</p>
          </div>
        </div>
        <button 
          onClick={handleSubmit}
          disabled={loading}
          className="px-8 py-4 bg-indigo-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-all flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {loading ? 'EXECUTING...' : 'SAVE & SEND PO'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-slate-800 p-10 rounded-[3rem] shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-8">
              <FileText className="w-5 h-5 text-indigo-600" />
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Order Details</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Supplier</label>
                <div className="relative">
                  <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <select 
                    required
                    value={orderData.supplierId}
                    onChange={(e) => setOrderData({...orderData, supplierId: e.target.value})}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-700 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-none transition-all appearance-none"
                  >
                    <option value="">CHOOSE VENDOR...</option>
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Order Date</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input 
                    type="date" 
                    value={orderData.orderDate}
                    onChange={(e) => setOrderData({...orderData, orderDate: e.target.value})}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-700 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-10 rounded-[3rem] shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Package className="w-5 h-5 text-indigo-600" />
                <h2 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Order Items</h2>
              </div>
              <button 
                onClick={addItem}
                className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {orderData.items.map((item, index) => (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={index} 
                  className="grid grid-cols-12 gap-4 items-end p-6 bg-slate-50 dark:bg-slate-700/50 rounded-[2rem] group"
                >
                  <div className="col-span-5 space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Product Description</label>
                    <input 
                      type="text" 
                      placeholder="ENTER PRODUCT NAME..."
                      value={item.productName}
                      onChange={(e) => updateItem(index, 'productName', e.target.value)}
                      className="w-full px-5 py-4 bg-white dark:bg-slate-800 border-none rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Qty</label>
                    <input 
                      type="number" 
                      value={item.quantityOrdered}
                      onChange={(e) => updateItem(index, 'quantityOrdered', parseInt(e.target.value))}
                      className="w-full px-5 py-4 bg-white dark:bg-slate-800 border-none rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Price</label>
                    <input 
                      type="number" 
                      value={item.unitPrice}
                      onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value))}
                      className="w-full px-5 py-4 bg-white dark:bg-slate-800 border-none rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                    />
                  </div>
                  <div className="col-span-2 text-right pb-4">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Subtotal</p>
                    <p className="text-xs font-black text-slate-900 dark:text-white font-mono">${item.totalPrice.toFixed(2)}</p>
                  </div>
                  <div className="col-span-1 pb-3 text-right">
                    {orderData.items.length > 1 && (
                      <button 
                        onClick={() => removeItem(index)}
                        className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar: Summary */}
        <div className="space-y-8">
          <div className="bg-slate-900 dark:bg-slate-800/50 p-10 rounded-[3rem] shadow-2xl text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full -mr-16 -mt-16 blur-3xl"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                <Calculator className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-black uppercase tracking-[0.2em]">Order Summary</h3>
              </div>
              
              <div className="space-y-6">
                <div className="flex justify-between items-center text-slate-400">
                  <span className="text-[10px] font-black uppercase tracking-widest">Subtotal</span>
                  <span className="text-sm font-bold font-mono">${grandTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span className="text-[10px] font-black uppercase tracking-widest">Tax (0%)</span>
                  <span className="text-sm font-bold font-mono">$0.00</span>
                </div>
                <div className="pt-6 border-t border-slate-800 dark:border-slate-700 flex justify-between items-center">
                  <span className="text-xs font-black uppercase tracking-[0.2em]">Grand Total</span>
                  <span className="text-2xl font-black text-indigo-400 font-mono tracking-tighter">${grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-10 rounded-[3rem] shadow-sm border border-slate-100 dark:border-slate-700">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-3 block">Additional Notes</label>
            <textarea 
              value={orderData.notes}
              onChange={(e) => setOrderData({...orderData, notes: e.target.value})}
              placeholder="ENTER DELIVERY INSTRUCTIONS OR TERMS..."
              className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-700 border-none rounded-2xl text-xs font-bold h-32 outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
            ></textarea>
          </div>
        </div>
      </div>
    </div>
  );
}
