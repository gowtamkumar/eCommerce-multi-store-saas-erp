"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, FileSpreadsheet, Trash2 } from "lucide-react";
import { RequisitionDetailDrawerProps } from "../types";
import type { RequisitionJustificationResult } from "@/features/admin/ai/types/ai-studio";
import { RequisitionJustificationReadOnly } from "./RequisitionJustificationReadOnly";

export default function RequisitionDetailDrawer({
  pr,
  onClose,
  onMovePR,
  onDeletePR,
  onOpenConvertModal,
}: RequisitionDetailDrawerProps) {
  const [draftResult, setDraftResult] = useState<RequisitionJustificationResult | null>(null);

  useEffect(() => {
    setDraftResult(null);
  }, [pr?.id]);

  return (
    <AnimatePresence>
      {pr && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/40 backdrop-blur-sm">
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            className="bg-white dark:bg-slate-800 w-full max-w-md h-full shadow-2xl flex flex-col border-l border-slate-100 dark:border-slate-700 p-8"
          >
            <div className="flex justify-between items-center mb-8">
              <span className="text-xs font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1.5 rounded-lg">
                {pr.prNumber}
              </span>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto pr-1">
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight uppercase tracking-tight">
                  {pr.justification || "No justification provided"}
                </h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                  Creator: {pr.requestedBy?.name || "Unknown User"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 p-5 bg-slate-50 dark:bg-slate-900 rounded-3xl">
                <div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                    Required Date
                  </span>
                  <span className="text-sm font-black text-slate-900 dark:text-white">
                    {pr.requiredDate ? new Date(pr.requiredDate).toLocaleDateString() : "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                    Status
                  </span>
                  <span className="text-sm font-black text-indigo-600 uppercase tracking-widest">
                    {pr.status}
                  </span>
                </div>
              </div>

              <RequisitionJustificationReadOnly pr={pr} onApply={setDraftResult} />

              {draftResult ? (
                <div className="rounded-2xl border border-indigo-100 dark:border-indigo-900/40 bg-indigo-50/50 dark:bg-indigo-950/20 p-4 space-y-3">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                      Suggested justification
                    </p>
                    <p className="text-sm text-slate-800 dark:text-slate-100 font-semibold">
                      {draftResult.justificationText}
                    </p>
                  </div>
                  {draftResult.lineNotes.some((note) => note.trim()) ? (
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                        Suggested line notes
                      </p>
                      <ul className="space-y-1 text-sm text-slate-600 dark:text-slate-300">
                        {pr.items?.map((item, index) =>
                          draftResult.lineNotes[index]?.trim() ? (
                            <li key={item.id}>
                              <span className="font-bold">{item.product?.name}:</span>{" "}
                              {draftResult.lineNotes[index]}
                            </li>
                          ) : null,
                        )}
                      </ul>
                    </div>
                  ) : null}
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Draft only — does not update the requisition record.
                  </p>
                </div>
              ) : null}

              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Items Requested
                </h4>
                <div className="space-y-2">
                  {pr.items?.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl flex justify-between items-center"
                    >
                      <div>
                        <div className="text-xs font-black text-slate-900 dark:text-white">
                          {item.product?.name || "Unknown Product"}
                          {(item as any).variant && (
                            <span className="text-[10px] text-slate-400 font-mono block mt-0.5 uppercase tracking-tight">
                              {Object.values((item as any).variant.combination || {}).join(" / ") || (item as any).variant.sku}
                            </span>
                          )}
                        </div>
                        {item.notes && (
                          <div className="text-[10px] text-slate-400 mt-1 italic">{item.notes}</div>
                        )}
                      </div>
                      <div className="text-xs font-black bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 px-3 py-1 rounded-lg">
                        Qty: {item.quantity}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Stage Transitions
                </h4>
                <div className="flex flex-wrap gap-2">
                  {pr.status === "PENDING_APPROVAL" && (
                    <>
                      <button
                        onClick={() => onMovePR(pr.id, "APPROVED")}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-emerald-700"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => onMovePR(pr.id, "REJECTED")}
                        className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-rose-700"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {pr.status === "DRAFT" && (
                    <button
                      onClick={() => onMovePR(pr.id, "PENDING_APPROVAL")}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-indigo-700"
                    >
                      Submit for Approval
                    </button>
                  )}
                  {pr.status === "APPROVED" && (
                    <button
                      onClick={() => onOpenConvertModal(pr)}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-indigo-700 flex items-center gap-2"
                    >
                      <FileSpreadsheet className="w-4 h-4" /> Convert to PO
                    </button>
                  )}
                </div>
              </div>
            </div>

            {(pr.status === "DRAFT" || pr.status === "REJECTED") && (
              <div className="pt-6 border-t border-slate-100 dark:border-slate-700">
                <button
                  onClick={() => onDeletePR(pr.id)}
                  className="w-full py-4 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/30 rounded-2xl font-black text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2 border border-rose-100 dark:border-rose-900/30"
                >
                  <Trash2 className="w-4 h-4" /> Delete Requisition
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
