"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Award, Send, X } from "lucide-react";
import { RfqDetailDrawerProps } from "../types";

export default function RfqDetailDrawer({
  rfq,
  onClose,
  onOpenBidModal,
  onAwardBid,
}: RfqDetailDrawerProps) {
  return (
    <AnimatePresence>
      {rfq && (
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
                  {rfq.rfqNumber}
                </span>
                <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-900 rounded-lg text-[9px] font-black uppercase text-slate-600 dark:text-slate-400">
                  {rfq.status}
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto pr-1">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  {rfq.purchaseRequisition
                    ? `Requisition: ${rfq.purchaseRequisition.prNumber}`
                    : "Ad-hoc Sourcing Campaign"}
                </h3>
                {rfq.purchaseRequisition?.justification && (
                  <p className="text-xs text-slate-500 mt-2 bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl font-medium leading-relaxed">
                    {rfq.purchaseRequisition.justification}
                  </p>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Quotations & Bids
                  </h4>
                  {rfq.status === "OPEN" && (
                    <button
                      onClick={onOpenBidModal}
                      className="px-3.5 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-100 flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" /> Submit Bid
                    </button>
                  )}
                </div>

                {rfq.quotations?.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 dark:bg-slate-900 rounded-3xl">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">
                      No bids submitted yet
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {rfq.quotations.map((q) => (
                      <div
                        key={q.id}
                        className={`p-5 rounded-3xl border flex justify-between items-center ${
                          q.status === "ACCEPTED"
                            ? "border-emerald-500 bg-emerald-50/10"
                            : "border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                        }`}
                      >
                        <div>
                          <div className="text-xs font-black text-slate-900 dark:text-white">
                            {q.supplier?.name || "Unknown Supplier"}
                          </div>
                          <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">
                            Lead Time: {q.leadTimeDays} days
                          </div>
                          {q.termsAndConditions && (
                            <div className="text-[10px] text-slate-500 mt-2 leading-relaxed">
                              {q.termsAndConditions}
                            </div>
                          )}
                        </div>
                        <div className="text-right shrink-0 ml-4">
                          <div className="text-sm font-black font-mono text-indigo-600">
                            ${q.totalAmount}
                          </div>
                          {rfq.status === "OPEN" && (
                            <button
                              onClick={() => void onAwardBid(q.id)}
                              className="mt-2 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1"
                            >
                              <Award className="w-3 h-3" /> Award
                            </button>
                          )}
                          {q.status === "ACCEPTED" && (
                            <span className="mt-2 inline-block px-2.5 py-0.5 bg-emerald-100 text-emerald-600 rounded-full text-[8px] font-black uppercase tracking-wider">
                              Accepted
                            </span>
                          )}
                          {q.status === "REJECTED" && (
                            <span className="mt-2 inline-block px-2.5 py-0.5 bg-rose-100 text-rose-600 rounded-full text-[8px] font-black uppercase tracking-wider">
                              Rejected
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
