'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, X } from 'lucide-react';
import { useReceiveInvoiceForm } from '../hooks/useReceiveInvoiceForm';
import type { ReceiveInvoiceModalProps } from '../types';
import { InvoiceOcrAssist } from './InvoiceOcrAssist';

export default function ReceiveInvoiceModal({
  isOpen,
  onClose,
  onSuccess,
}: ReceiveInvoiceModalProps) {
  const {
    invoiceNumber,
    setInvoiceNumber,
    selectedSupplierId,
    setSelectedSupplierId,
    selectedPoId,
    setSelectedPoId,
    invoiceDate,
    setInvoiceDate,
    dueDate,
    setDueDate,
    suppliers,
    purchaseOrders,
    products,
    selectedProductId,
    setSelectedProductId,
    qty,
    setQty,
    unitPrice,
    setUnitPrice,
        addedItems,
        handleAddItem,
        handleRemoveItem,
        handleCreateInvoice,
        setAddedItems,
    } = useReceiveInvoiceForm(onSuccess, onClose);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden"
          >
            <div className="flex justify-between items-center p-8 border-b border-slate-50 dark:border-slate-700">
              <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-tight">
                <FileText className="w-5 h-5 text-indigo-500" />
                Receive Supplier Invoice
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="p-8 space-y-4 max-h-[70vh] overflow-y-auto">
              <InvoiceOcrAssist
                suppliers={suppliers}
                products={products}
                purchaseOrders={purchaseOrders}
                selectedPoId={selectedPoId}
                setInvoiceNumber={setInvoiceNumber}
                setSelectedSupplierId={setSelectedSupplierId}
                setInvoiceDate={setInvoiceDate}
                setDueDate={setDueDate}
                setAddedItems={setAddedItems}
              />

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
                  onClick={onClose}
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
  );
}
