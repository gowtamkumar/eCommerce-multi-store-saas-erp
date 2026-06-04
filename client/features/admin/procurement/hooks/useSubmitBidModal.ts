"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getSuppliers, submitQuotation } from "@/services/procurement";
import { Supplier } from "@/features/admin/supplier/types";
import { RFQ } from "../types";

export function useSubmitBidModal(
  rfq: RFQ | null,
  isOpen: boolean,
  onSuccess: () => void,
) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState("");
  const [bidAmount, setBidAmount] = useState("");
  const [leadTime, setLeadTime] = useState("");
  const [terms, setTerms] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    getSuppliers()
      .then(setSuppliers)
      .catch((err) => console.error("Failed to load suppliers:", err));
  }, [isOpen]);

  // Reset form when rfq changes or modal closes
  useEffect(() => {
    setSelectedSupplierId("");
    setBidAmount("");
    setLeadTime("");
    setTerms("");
  }, [rfq, isOpen]);

  const handleSubmittingBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rfq || !selectedSupplierId || !bidAmount) return;

    try {
      await submitQuotation(rfq.id, {
        supplierId: selectedSupplierId,
        totalAmount: parseFloat(bidAmount),
        leadTimeDays: parseInt(leadTime) || 0,
        termsAndConditions: terms,
      });
      toast.success("Supplier Bid submitted successfully");
      setSelectedSupplierId("");
      setBidAmount("");
      setLeadTime("");
      setTerms("");
      onSuccess();
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit bid");
    }
  };

  return {
    suppliers,
    selectedSupplierId,
    setSelectedSupplierId,
    bidAmount,
    setBidAmount,
    leadTime,
    setLeadTime,
    terms,
    setTerms,
    handleSubmittingBid,
  };
}
