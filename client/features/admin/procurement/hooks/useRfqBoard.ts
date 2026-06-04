"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { getRFQs, awardQuotation } from "@/services/procurement";
import { RFQ } from "../types";

export function useRfqBoard() {
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRfq, setSelectedRfq] = useState<RFQ | null>(null);

  const fetchRFQs = async () => {
    try {
      setLoading(true);
      const data = await getRFQs();
      console.debug("Fetched RFQs:", data);
      setRfqs(data);
    } catch (err) {
      console.error("Failed to load RFQs:", err);
      const msg = err instanceof Error ? err.message : "Failed to load RFQs";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchRFQs();
  }, []);

  const filteredRfqs = useMemo(() => {
    return rfqs.filter(
      (r) =>
        r.rfqNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.purchaseRequisition?.prNumber || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase()),
    );
  }, [rfqs, searchQuery]);

  const handleAwardBid = async (quotationId: string) => {
    if (
      !confirm(
        "Are you sure you want to award the contract to this supplier? This will automatically create a Purchase Order.",
      )
    )
      return;

    try {
      await awardQuotation(quotationId);
      toast.success("RFQ awarded! Purchase Order created.");
      setSelectedRfq(null);
      await fetchRFQs();
    } catch (err) {
      console.error(err);
      toast.error("Failed to award contract");
    }
  };

  const refreshSelectedRfq = async () => {
    if (!selectedRfq) return;
    try {
      const data = await getRFQs();
      setRfqs(data);
      const matchingRfq = data.find((r: RFQ) => r.id === selectedRfq.id);
      if (matchingRfq) {
        setSelectedRfq(matchingRfq);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return {
    rfqs,
    loading,
    searchQuery,
    setSearchQuery,
    selectedRfq,
    setSelectedRfq,
    filteredRfqs,
    fetchRFQs,
    handleAwardBid,
    refreshSelectedRfq,
  };
}
