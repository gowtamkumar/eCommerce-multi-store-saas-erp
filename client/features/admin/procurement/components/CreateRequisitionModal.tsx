"use client";

import React, { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Calendar, FileText, Save, X, Search, Loader2, Package } from "lucide-react";
import { CreateRequisitionModalProps } from "../types";
import { useCreateRequisitionModal } from "../hooks/useCreateRequisitionModal";
import { RequisitionJustificationAiAssist } from "./RequisitionJustificationAiAssist";

export default function CreateRequisitionModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateRequisitionModalProps) {
  const {
    justification,
    setJustification,
    requiredDate,
    setRequiredDate,
    products,
    searchQuery,
    setSearchQuery,
    searchLoading,
    selectedProductId,
    setSelectedProductId,
    selectedVariantId,
    setSelectedVariantId,
    selectedQty,
    setSelectedQty,
    selectedNotes,
    setSelectedNotes,
    addedItems,
    handleAddItem,
    handleRemoveItem,
    applyJustificationResult,
    handleCreatePR,
  } = useCreateRequisitionModal(onSuccess, isOpen);

  const selectedProduct = useMemo(() => {
    return products.find((p) => String(p.id) === String(selectedProductId));
  }, [products, selectedProductId]);

  const draftItemsForAi = useMemo(() => {
    const items = addedItems.map((item) => ({
      productName: item.name,
      quantity: item.quantity,
      notes: item.notes,
    }));

    if (
      selectedProductId &&
      !addedItems.some((item) => String(item.productId) === String(selectedProductId))
    ) {
      const product = products.find((p) => String(p.id) === String(selectedProductId));
      if (product) {
        items.push({
          productName: product.name,
          quantity: selectedQty,
          notes: selectedNotes,
        });
      }
    }

    return items;
  }, [addedItems, selectedProductId, selectedQty, selectedNotes, products]);

  return (
    <AnimatePresence>
      {isOpen && (
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
                New Purchase Requisition
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleCreatePR} className="p-8 space-y-5">
              <RequisitionJustificationAiAssist
                requiredDate={requiredDate}
                items={draftItemsForAi}
                existingJustification={justification}
                onApply={applyJustificationResult}
              />

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  Justification / Requisition Reason
                </label>
                <input
                  type="text"
                  required
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  className="w-full px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all font-bold text-xs"
                  placeholder="e.g. Q3 Packaging Materials Reorder"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  Required Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="date"
                    required
                    value={requiredDate}
                    onChange={(e) => setRequiredDate(e.target.value)}
                    className="w-full pl-12 pr-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all font-bold text-xs"
                  />
                </div>
              </div>

              {/* Add Item Section */}
              <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-4">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  Add Product Spec
                </h4>
                {!selectedProduct ? (
                  <div className="space-y-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-xs"
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1">
                      {searchLoading ? (
                        <div className="flex items-center justify-center py-6 gap-2 text-slate-400">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-xs font-medium">Searching products...</span>
                        </div>
                      ) : products.length === 0 ? (
                        <div className="flex flex-col items-center py-6 text-slate-400">
                          <Package className="w-8 h-8 mb-2 opacity-40" />
                          <span className="text-xs font-medium">No products found</span>
                        </div>
                      ) : (
                        products.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => setSelectedProductId(p.id)}
                            className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-indigo-500 hover:bg-indigo-50/10 transition-all text-left"
                          >
                            <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 overflow-hidden shrink-0 flex items-center justify-center">
                              {p.images?.[0] ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <Package className="w-4 h-4 text-slate-400" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-slate-900 dark:text-white text-xs truncate">{p.name}</p>
                              <p className="text-[10px] text-slate-500">Price: {p.price}</p>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Selected Product info */}
                    <div className="p-4 bg-indigo-50/20 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100/50 dark:border-indigo-900/30 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-100 dark:border-slate-700 flex items-center justify-center">
                          {selectedProduct.images?.[0] ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={selectedProduct.images[0]} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white text-xs">{selectedProduct.name}</h4>
                          <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">Price: {selectedProduct.price}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedProductId("");
                          setSelectedVariantId("");
                        }}
                        className="text-xs font-bold text-red-500 hover:underline"
                      >
                        Change
                      </button>
                    </div>

                    {/* Variant Selector */}
                    {selectedProduct.variants && selectedProduct.variants.length > 0 && (
                      <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">
                          Select Variant *
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedProduct.variants.map((v) => (
                            <button
                              key={v.id}
                              type="button"
                              onClick={() => setSelectedVariantId(v.id)}
                              className={`px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 ${
                                selectedVariantId === v.id
                                  ? "bg-indigo-600 border-indigo-600 text-white"
                                  : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:border-indigo-500"
                              }`}
                            >
                              {Object.values(v.combination || {}).join(" / ") || v.sku}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Quantity & Notes input */}
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min={1}
                        placeholder="Qty"
                        value={selectedQty}
                        onChange={(e) => setSelectedQty(parseInt(e.target.value) || 1)}
                        className="w-20 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none font-bold text-xs font-mono"
                      />
                      <input
                        type="text"
                        placeholder="Spec / Note"
                        value={selectedNotes}
                        onChange={(e) => setSelectedNotes(e.target.value)}
                        className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none font-bold text-xs"
                      />
                      <button
                        type="button"
                        onClick={handleAddItem}
                        className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 active:scale-95 transition-all"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                )}

                {/* Added Items List */}
                {addedItems.length > 0 && (
                  <div className="space-y-2 mt-4 max-h-[150px] overflow-y-auto pr-1">
                    {addedItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700"
                      >
                        <div className="text-xs font-bold">
                          {item.name}{" "}
                          <span className="text-slate-400">({item.notes || "No note"})</span>
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
                  className="flex-[2] py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" /> Save Requisition
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
