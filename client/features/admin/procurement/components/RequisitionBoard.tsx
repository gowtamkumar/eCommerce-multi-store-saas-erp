"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Clock,
  FileSpreadsheet,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { PR } from "../types";
import { useRequisitionBoard } from "../hooks/useRequisitionBoard";
import CreateRequisitionModal from "./CreateRequisitionModal";
import ConvertRequisitionModal from "./ConvertRequisitionModal";
import RequisitionDetailDrawer from "./RequisitionDetailDrawer";

export default function RequisitionBoard() {
  const {
    prs,
    loading,
    searchQuery,
    setSearchQuery,
    selectedPr,
    setSelectedPr,
    fetchPRs,
    handleMovePR,
    handleDeletePR,
  } = useRequisitionBoard();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [convertModalOpen, setConvertModalOpen] = useState(false);
  const [prToConvert, setPrToConvert] = useState<PR | null>(null);

  const columns = [
    { id: "DRAFT", title: "Drafts", color: "slate", dot: "bg-slate-500" },
    {
      id: "PENDING_APPROVAL",
      title: "Pending Approval",
      color: "amber",
      dot: "bg-amber-500",
    },
    {
      id: "APPROVED",
      title: "Approved",
      color: "emerald",
      dot: "bg-emerald-500",
    },
    {
      id: "PO_CREATED",
      title: "PO Generated",
      color: "indigo",
      dot: "bg-indigo-500",
    },
    { id: "REJECTED", title: "Rejected", color: "rose", dot: "bg-rose-500" },
  ];

  const filteredPRs = prs.filter(
    (pr) =>
      pr.prNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (pr.justification &&
        pr.justification.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 shrink-0">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight italic uppercase">
            Purchase <span className="text-indigo-600">Requisitions</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">
            Internal Sourcing Requests
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group hidden md:block w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500" />
            <input
              type="text"
              placeholder="Search PR..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all shadow-sm"
            />
          </div>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-colors shadow-lg flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> New PR
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      ) : (
        /* Kanban Board */
        <div className="flex-1 flex flex-col sm:flex-row gap-6 overflow-x-auto pb-4 custom-scrollbar items-stretch">
          {columns.map((col) => (
            <div
              key={col.id}
              className="w-full sm:w-[310px] shrink-0 flex flex-col bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] border border-slate-100 dark:border-slate-700/50"
            >
              {/* Column Header */}
              <div className="p-6 pb-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-700/50">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${col.dot} shadow-lg shadow-indigo-500/10`}
                  />
                  <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">
                    {col.title}
                  </h3>
                </div>
                <span className="px-2.5 py-1 bg-white dark:bg-slate-800 rounded-lg text-[10px] font-black text-slate-500 shadow-sm border border-slate-100 dark:border-slate-700">
                  {filteredPRs.filter((pr) => pr.status === col.id).length}
                </span>
              </div>

              {/* Cards Area */}
              <div className="flex-1 p-4 space-y-4 overflow-y-auto custom-scrollbar">
                <AnimatePresence>
                  {filteredPRs
                    .filter((pr) => pr.status === col.id)
                    .map((pr, i) => (
                      <motion.div
                        key={pr.id}
                        layoutId={pr.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => setSelectedPr(pr)}
                        className="bg-white dark:bg-slate-800 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md hover:border-indigo-100 dark:hover:border-indigo-900/50 transition-all cursor-pointer group"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded-md">
                            {pr.prNumber}
                          </span>
                          <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            {col.id === "DRAFT" && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  void handleMovePR(pr.id, "PENDING_APPROVAL");
                                }}
                                className="p-1 text-slate-400 hover:text-indigo-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                title="Submit for Approval"
                              >
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {col.id === "APPROVED" && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPrToConvert(pr);
                                  setConvertModalOpen(true);
                                }}
                                className="p-1 text-slate-400 hover:text-indigo-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                title="Convert to Purchase Order"
                              >
                                <FileSpreadsheet className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {(col.id === "DRAFT" || col.id === "REJECTED") && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  void handleDeletePR(pr.id);
                                }}
                                className="p-1 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                title="Delete Requisition"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        <h4 className="font-black text-slate-900 dark:text-white leading-tight mb-4 group-hover:text-indigo-600 transition-colors">
                          {pr.justification || "No justification provided"}
                        </h4>

                        <div className="flex items-center justify-between text-xs mb-4">
                          <div className="flex items-center gap-1.5 text-slate-500 font-bold uppercase text-[10px] tracking-widest">
                            <Clock className="w-3 h-3" /> Req:{" "}
                            {pr.requiredDate ? new Date(pr.requiredDate).toLocaleDateString() : "N/A"}
                          </div>
                          <span className="font-black text-slate-700 dark:text-slate-300 font-mono">
                            {pr.items?.length || 0} Items
                          </span>
                        </div>

                        <div className="h-px bg-slate-100 dark:bg-slate-700 mb-4" />

                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {pr.requestedBy?.name || "Unknown User"}
                          </span>
                          <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 border-2 border-white dark:border-slate-800 flex items-center justify-center shadow-sm">
                            <span className="text-[8px] font-black">
                              {(pr.requestedBy?.name || "UN")
                                .substring(0, 2)
                                .toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Drawer Modal */}
      <RequisitionDetailDrawer
        pr={selectedPr}
        onClose={() => setSelectedPr(null)}
        onMovePR={handleMovePR}
        onDeletePR={handleDeletePR}
        onOpenConvertModal={(pr) => {
          setPrToConvert(pr);
          setConvertModalOpen(true);
        }}
      />

      {/* Create PR Modal */}
      <CreateRequisitionModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => {
          setIsCreateOpen(false);
          void fetchPRs();
        }}
      />

      {/* Convert Requisition to PO Modal */}
      <ConvertRequisitionModal
        isOpen={convertModalOpen}
        onClose={() => {
          setConvertModalOpen(false);
          setPrToConvert(null);
        }}
        pr={prToConvert}
        onSuccess={() => {
          setConvertModalOpen(false);
          setPrToConvert(null);
          void fetchPRs();
        }}
      />
    </div>
  );
}
