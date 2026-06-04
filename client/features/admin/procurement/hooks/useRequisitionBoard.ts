"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { getRequisitions, updateRequisitionStatus, deleteRequisition } from "@/services/procurement";
import { PR } from "../types";

export function useRequisitionBoard() {
  const [prs, setPrs] = useState<PR[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPr, setSelectedPr] = useState<PR | null>(null);

  const fetchPRs = async () => {
    try {
      setLoading(true);
      const data = await getRequisitions();
      console.debug("Fetched PRs from API:", data);
      setPrs(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load requisitions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchPRs();
  }, []);

  const filteredPRs = useMemo(() => {
    return prs.filter(
      (pr) =>
        pr.prNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (pr.justification &&
          pr.justification.toLowerCase().includes(searchQuery.toLowerCase())),
    );
  }, [prs, searchQuery]);

  const handleMovePR = async (id: string, newStatus: string) => {
    try {
      let rejectionReason: string | undefined = undefined;
      if (newStatus === "REJECTED") {
        const reason = prompt("Please specify a rejection reason (optional):");
        if (reason === null) return; // User cancelled
        rejectionReason = reason || undefined;
      }
      await updateRequisitionStatus(id, newStatus, rejectionReason);
      toast.success("Stage updated successfully");
      await fetchPRs();
      if (selectedPr && selectedPr.id === id) {
        setSelectedPr((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update stage");
    }
  };

  const handleDeletePR = async (id: string) => {
    if (!confirm("Are you sure you want to delete this requisition?")) return;
    try {
      await deleteRequisition(id);
      toast.success("Requisition deleted successfully");
      setSelectedPr(null);
      await fetchPRs();
    } catch (err) {
      console.error(err);
      toast.error(
        "Failed to delete requisition. Requisitions must be in Draft or Rejected status.",
      );
    }
  };

  return {
    prs,
    loading,
    searchQuery,
    setSearchQuery,
    selectedPr,
    setSelectedPr,
    fetchPRs,
    handleMovePR,
    handleDeletePR,
  };
}
