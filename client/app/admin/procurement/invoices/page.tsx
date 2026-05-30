'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Plus,
  Search,
  Calendar,
  X,
  DollarSign,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  CreditCard,
  Layers,
  ShoppingBag,
  Clock
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getSupplierInvoices,
  createSupplierInvoice,
  paySupplierInvoice,
  getSuppliers,
  getPurchaseOrders
} from '@/services/procurement';
import { fetchAPI } from '@/services/api';
import { Supplier } from '@/features/admin/supplier/types';
import { PurchaseOrder } from '@/features/admin/purchase/types';
import { Product } from '@/features/admin/product/types';


interface InvoiceItem {
  id: string;
  productId: string;
  product?: { name: string };
  quantity: number;
  unitPrice: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  supplierId: string;
  supplier?: { name: string };
  purchaseOrderId: string;
  purchaseOrder?: { referenceNumber: string };
  invoiceDate: string;
  dueDate: string;
  totalAmount: number;
  paidAmount: number;
  status: string;
  matchStatus: string;
  discrepancyNotes?: string;
  items: InvoiceItem[];
}

export default function SupplierInvoicePage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Modals
  const [createOpen, setCreateOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);

  // Form states - Create Invoice
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [selectedPoId, setSelectedPoId] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);

  // Item selections in Create
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [qty, setQty] = useState(1);
  const [unitPrice, setUnitPrice] = useState('');
  const [addedItems, setAddedItems] = useState<{ productId: string; name: string; quantity: number; unitPrice: number }[]>([]);

  // Form states - Record Payment
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('BANK_TRANSFER');
  const [transactionId, setTransactionId] = useState('');
  const [paymentNote, setPaymentNote] = useState('');

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const data = await getSupplierInvoices();
      setInvoices(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load supplier invoices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();

    // Fetch lists
    getSuppliers().then(setSuppliers).catch(console.error);
    getPurchaseOrders().then(setPurchaseOrders).catch(console.error);
    fetchAPI('/products?limit=100')
      .then((res) => setProducts(res?.data || []))
      .catch(console.error);
  }, []);

  // Load Purchase Order items when PO is selected
  useEffect(() => {
    if (!selectedPoId) {
      setAddedItems([]);
      return;
    }

    const po = purchaseOrders.find((p) => p.id === selectedPoId);
    const supplierId = po?.supplierId || po?.supplier?.id;
    if (po && supplierId && !selectedSupplierId) {
      setSelectedSupplierId(supplierId);
    }

    const loadPoItems = async () => {
      try {
        const res = await fetchAPI(`/purchase-orders/${selectedPoId}`);
        if (res.success && res.data && Array.isArray(res.data.items)) {
          setAddedItems(
            res.data.items.map((item: any) => ({
              productId: item.productId,
              name: item.product?.name || 'Unknown Product',
              quantity: item.quantity,
              unitPrice: Number(item.unitPrice),
            }))
          );
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to load purchase order items');
      }
    };
    loadPoItems();
  }, [selectedPoId, purchaseOrders, selectedSupplierId]);

  const filteredInvoices = useMemo(() => {
    return invoices.filter((i) =>
      i.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (i.supplier?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [invoices, searchQuery]);

  const handleAddItem = () => {
    if (!selectedProductId || !unitPrice) {
      toast.error('Select product and enter unit price');
      return;
    }
    const product = products.find((p) => p.id === selectedProductId);
    if (!product) return;

    if (addedItems.some((item) => item.productId === selectedProductId)) {
      toast.error('Product already added');
      return;
    }

    setAddedItems([
      ...addedItems,
      {
        productId: selectedProductId,
        name: product.name,
        quantity: qty,
        unitPrice: parseFloat(unitPrice),
      },
    ]);

    setSelectedProductId('');
    setQty(1);
    setUnitPrice('');
  };

  const handleRemoveItem = (index: number) => {
    setAddedItems(addedItems.filter((_, i) => i !== index));
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceNumber || !selectedSupplierId || !selectedPoId || !invoiceDate || !dueDate) {
      toast.error('Please fill in all header details');
      return;
    }
    if (addedItems.length === 0) {
      toast.error('Add at least one item');
      return;
    }

    try {
      await createSupplierInvoice({
        invoiceNumber,
        supplierId: selectedSupplierId,
        purchaseOrderId: selectedPoId,
        invoiceDate: new Date(invoiceDate).toISOString(),
        dueDate: new Date(dueDate).toISOString(),
        items: addedItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      });

      toast.success('Invoice submitted successfully');
      setCreateOpen(false);
      setInvoiceNumber('');
      setSelectedSupplierId('');
      setSelectedPoId('');
      setInvoiceDate('');
      setDueDate('');
      setAddedItems([]);
      fetchInvoices();
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit invoice');
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice || !paymentAmount) return;

    try {
      await paySupplierInvoice(selectedInvoice.id, {
        amount: parseFloat(paymentAmount),
        paymentMethod,
        transactionId,
        note: paymentNote,
      });

      toast.success('Invoice payment recorded successfully');
      setPayOpen(false);
      setPaymentAmount('');
      setTransactionId('');
      setPaymentNote('');

      // Refresh current details
      const updatedInvoices = await getSupplierInvoices();
      setInvoices(updatedInvoices);
      const matchingInvoice = updatedInvoices.find((i: Invoice) => i.id === selectedInvoice.id);
      if (matchingInvoice) setSelectedInvoice(matchingInvoice);
    } catch (err) {
      console.error(err);
      toast.error('Failed to record payment');
    }
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight italic uppercase">
            Supplier <span className="text-indigo-600">Invoices</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">
            Accounts Payable Matching & Audit (3-Way Matching)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500" />
            <input
              type="text"
              placeholder="Search invoices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all shadow-sm"
            />
          </div>
          <button
            onClick={() => setCreateOpen(true)}
            className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Receive Invoice
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      ) : (
        /* Invoice Table */
        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-700/30">
                  <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Invoice ID</th>
                  <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Supplier</th>
                  <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">PO Ref</th>
                  <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Amount</th>
                  <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">3-Way Match</th>
                  <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                {filteredInvoices.map((inv) => (
                  <tr
                    key={inv.id}
                    onClick={() => setSelectedInvoice(inv)}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors group cursor-pointer"
                  >
                    <td className="px-8 py-5">
                      <span className="text-xs font-black text-slate-900 dark:text-white font-mono">{inv.invoiceNumber}</span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{inv.supplier?.name || 'Unknown'}</span>
                    </td>
                    <td className="px-8 py-5 font-mono text-xs text-slate-500">
                      {inv.purchaseOrder?.referenceNumber || 'Unlinked'}
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-xs font-black text-slate-900 dark:text-white font-mono">${inv.totalAmount}</span>
                      <span className="text-[10px] text-slate-400 block font-semibold mt-0.5">Paid: ${inv.paidAmount}</span>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                        inv.matchStatus === 'MATCHED'
                          ? 'bg-emerald-100 text-emerald-600'
                          : inv.matchStatus === 'DISCREPANCY'
                          ? 'bg-rose-100 text-rose-600'
                          : 'bg-amber-100 text-amber-600'
                      }`}>
                        {inv.matchStatus}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                        inv.status === 'PAID'
                          ? 'bg-emerald-100 text-emerald-600'
                          : inv.status === 'DISCREPANCY'
                          ? 'bg-rose-100 text-rose-600'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {inv.status}
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

      {/* Invoice Detail Drawer */}
      <AnimatePresence>
        {selectedInvoice && (
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
                    {selectedInvoice.invoiceNumber}
                  </span>
                  <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-[9px] font-black uppercase text-slate-600">
                    {selectedInvoice.status}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="flex-1 space-y-6 overflow-y-auto pr-1">
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    {selectedInvoice.supplier?.name || 'Supplier Invoice'}
                  </h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                    Related PO: {selectedInvoice.purchaseOrder?.referenceNumber || 'Unlinked'}
                  </p>
                </div>

                {/* Match Status Card */}
                <div className={`p-5 rounded-3xl border flex items-start gap-4 ${
                  selectedInvoice.matchStatus === 'MATCHED'
                    ? 'border-emerald-200 bg-emerald-50/10'
                    : 'border-rose-200 bg-rose-50/10'
                }`}>
                  {selectedInvoice.matchStatus === 'MATCHED' ? (
                    <>
                      <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-black text-slate-950 uppercase tracking-widest">3-Way Match Passed</h4>
                        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                          Invoice prices and quantities match the original Purchase Order and actual warehouse GRN intake perfectly.
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-black text-slate-950 uppercase tracking-widest">3-Way Match Discrepancy</h4>
                        <p className="text-[11px] text-rose-600 font-semibold mt-2 leading-relaxed whitespace-pre-line">
                          {selectedInvoice.discrepancyNotes || 'Quantities or unit prices mismatch PO or Goods Received Note receipts.'}
                        </p>
                      </div>
                    </>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 p-5 bg-slate-50 dark:bg-slate-900 rounded-3xl">
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Total Bill Amount</span>
                    <span className="text-base font-black text-slate-900 dark:text-white font-mono">${selectedInvoice.totalAmount}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Due Date</span>
                    <span className="text-sm font-black text-slate-900 dark:text-white">
                      {selectedInvoice.dueDate ? new Date(selectedInvoice.dueDate).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Invoice Items */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Invoice Line Items</h4>
                  <div className="space-y-2">
                    {selectedInvoice.items?.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl flex justify-between items-center"
                      >
                        <div className="text-xs font-black text-slate-900 dark:text-white">
                          {item.product?.name || 'Unknown Product'}
                        </div>
                        <div className="text-xs font-black text-slate-700 dark:text-slate-300 font-mono">
                          {item.quantity} x ${item.unitPrice}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {selectedInvoice.status !== 'PAID' && (
                <div className="pt-6 border-t border-slate-100 dark:border-slate-700 shrink-0">
                  <button
                    onClick={() => setPayOpen(true)}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                  >
                    <CreditCard className="w-4 h-4" /> Record Payment
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Receive Invoice Modal */}
      <AnimatePresence>
        {createOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-800 w-full max-w-xl rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden"
            >
              <div className="flex justify-between items-center p-8 border-b border-slate-50 dark:border-slate-700">
                <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-tight">
                  <FileText className="w-5 h-5 text-indigo-500" />
                  Receive Supplier Invoice
                </h2>
                <button
                  onClick={() => setCreateOpen(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <form onSubmit={handleCreateInvoice} className="p-8 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                      Invoice Number
                    </label>
                    <input
                      type="text"
                      required
                      value={invoiceNumber}
                      onChange={(e) => setInvoiceNumber(e.target.value)}
                      className="w-full px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none font-bold text-xs"
                      placeholder="INV-5563"
                    />
                  </div>
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                      PO Reference
                    </label>
                    <select
                      required
                      value={selectedPoId}
                      onChange={(e) => setSelectedPoId(e.target.value)}
                      className="w-full px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none font-bold text-xs"
                    >
                      <option value="">Select PO</option>
                      {(selectedSupplierId
                        ? purchaseOrders.filter((po) => (po.supplierId || po.supplier?.id) === selectedSupplierId)
                        : purchaseOrders
                      ).map((po) => (
                        <option key={po.id} value={po.id}>
                          {po.referenceNumber}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                      Invoice Date
                    </label>
                    <input
                      type="date"
                      required
                      value={invoiceDate}
                      onChange={(e) => setInvoiceDate(e.target.value)}
                      className="w-full px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none font-bold text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                      Due Date
                    </label>
                    <input
                      type="date"
                      required
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none font-bold text-xs"
                    />
                  </div>
                </div>

                {/* Add Item Section */}
                <div className="bg-slate-50 dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-4">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Add Invoice Item</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select
                      value={selectedProductId}
                      onChange={(e) => setSelectedProductId(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none font-bold text-xs"
                    >
                      <option value="">Select Product</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>

                    <div className="flex gap-2">
                      <input
                        type="number"
                        min={1}
                        placeholder="Qty"
                        value={qty}
                        onChange={(e) => setQty(parseInt(e.target.value) || 1)}
                        className="w-20 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none font-bold text-xs"
                      />
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        placeholder="Unit Price ($)"
                        value={unitPrice}
                        onChange={(e) => setUnitPrice(e.target.value)}
                        className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none font-mono font-bold text-xs"
                      />
                      <button
                        type="button"
                        onClick={handleAddItem}
                        className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  {addedItems.length > 0 && (
                    <div className="space-y-2 mt-4 max-h-[120px] overflow-y-auto pr-1">
                      {addedItems.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700"
                        >
                          <div className="text-xs font-bold">
                            {item.name} <span className="text-indigo-600 font-mono">(${item.unitPrice}/unit)</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-black font-mono bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded text-indigo-600">
                              x{item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              className="text-rose-500 hover:bg-rose-50 p-1 rounded-lg"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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
                    Match & Save Invoice
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Record Payment Modal */}
      <AnimatePresence>
        {payOpen && selectedInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-800 w-full max-w-md rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden"
            >
              <div className="flex justify-between items-center p-8 border-b border-slate-50 dark:border-slate-700">
                <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-tight">
                  <CreditCard className="w-5 h-5 text-indigo-500" />
                  Record Supplier Payment
                </h2>
                <button
                  onClick={() => setPayOpen(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <form onSubmit={handlePayment} className="p-8 space-y-5">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                    Payment Amount ($)
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    step="0.01"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="w-full px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none font-mono font-bold text-xs"
                    placeholder="e.g. 500"
                  />
                  <span className="text-[10px] text-slate-400 block mt-1 font-semibold">
                    Outstanding: ${Number(selectedInvoice.totalAmount) - Number(selectedInvoice.paidAmount)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                      Payment Method
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none font-bold text-xs"
                    >
                      <option value="BANK_TRANSFER">Bank Transfer</option>
                      <option value="CASH">Cash</option>
                      <option value="MOBILE_PAYMENT">Mobile Payment</option>
                      <option value="CHEQUE">Cheque</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                      Transaction ID
                    </label>
                    <input
                      type="text"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      className="w-full px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none font-mono font-bold text-xs"
                      placeholder="TXN5562"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                    Note / Remark
                  </label>
                  <input
                    type="text"
                    value={paymentNote}
                    onChange={(e) => setPaymentNote(e.target.value)}
                    className="w-full px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none font-bold text-xs"
                    placeholder="Clear balance on delivery"
                  />
                </div>

                <div className="pt-4 flex gap-4">
                  <button
                    type="button"
                    onClick={() => setPayOpen(false)}
                    className="flex-1 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-black text-xs uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-[2] py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg"
                  >
                    Record Payment
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
