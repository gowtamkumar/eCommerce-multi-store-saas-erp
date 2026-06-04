"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, ChevronRight, Plus, Search, User } from "lucide-react";
import { useRfqBoard } from "../hooks/useRfqBoard";
import CreateRfqModal from "./CreateRfqModal";
import SubmitBidModal from "./SubmitBidModal";
import RfqDetailDrawer from "./RfqDetailDrawer";

export default function RfqBoard() {
  const {
    loading,
    searchQuery,
    setSearchQuery,
    selectedRfq,
    setSelectedRfq,
    filteredRfqs,
    fetchRFQs,
    handleAwardBid,
    refreshSelectedRfq,
  } = useRfqBoard();

  const [createOpen, setCreateOpen] = useState(false);
  const [bidOpen, setBidOpen] = useState(false);

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight italic uppercase">
            Supplier <span className="text-indigo-600">Quotations (RFQs)</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">
            Supplier Bids & Contract Awarding
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500" />
            <input
              type="text"
              placeholder="Search RFQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all shadow-sm"
            />
          </div>
          <button
            onClick={() => setCreateOpen(true)}
            className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> New RFQ
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      ) : (
        /* RFQ Grid list */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRfqs.map((rfq) => (
            <motion.div
              whileHover={{ y: -4 }}
              key={rfq.id}
              onClick={() => setSelectedRfq(rfq)}
              className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-700 hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1 rounded-md">
                    {rfq.rfqNumber}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                      rfq.status === "OPEN"
                        ? "bg-emerald-100 text-emerald-600"
                        : rfq.status === "AWARDED"
                          ? "bg-indigo-100 text-indigo-600"
                          : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {rfq.status}
                  </span>
                </div>

                <h3 className="text-base font-black text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 transition-colors">
                  {rfq.purchaseRequisition
                    ? `Source: ${rfq.purchaseRequisition.prNumber}`
                    : "Ad-hoc Sourcing Proposal"}
                </h3>
                {rfq.purchaseRequisition?.justification && (
                  <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
                    {rfq.purchaseRequisition.justification}
                  </p>
                )}

                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      Deadline:{" "}
                      {rfq.deadlineDate ? new Date(rfq.deadlineDate).toLocaleDateString() : "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                    <User className="w-3.5 h-3.5" />
                    <span>Created by: {rfq.createdBy?.name || "Admin"}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-50 dark:border-slate-700/50 flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {rfq.quotations?.length || 0} Bids Submitted
                </span>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* RFQ Detail Drawer */}
      <RfqDetailDrawer
        rfq={selectedRfq}
        onClose={() => setSelectedRfq(null)}
        onOpenBidModal={() => setBidOpen(true)}
        onAwardBid={handleAwardBid}
      />

      {/* Create RFQ Modal */}
      <CreateRfqModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={() => {
          setCreateOpen(false);
          void fetchRFQs();
        }}
      />

      {/* Submit Bid Modal */}
      <SubmitBidModal
        isOpen={bidOpen}
        onClose={() => setBidOpen(false)}
        rfq={selectedRfq}
        onSuccess={() => {
          setBidOpen(false);
          void refreshSelectedRfq();
        }}
      />
    </div>
  );
}
