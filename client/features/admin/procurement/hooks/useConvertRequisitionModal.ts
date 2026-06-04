"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getSuppliers, convertPRToPO } from "@/services/procurement";
import { Supplier } from "@/features/admin/supplier/types";
import { PR } from "../types";

export function useConvertRequisitionModal(
  pr: PR | null,
  isOpen: boolean,
  onSuccess: () => void,
) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState("");
  const [poReference, setPoReference] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    getSuppliers()
      .then((data) => setSuppliers(data))
      .catch((err) => console.error("Failed to load suppliers:", err));
  }, [isOpen]);

  useEffect(() => {
    if (pr) {
      setPoReference(`PO-${pr.prNumber}`);
    } else {
      setPoReference("");
    }
    setSelectedSupplierId("");
  }, [pr]);

  const handleConvertPR = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pr || !selectedSupplierId) {
      toast.error("Please select a supplier");
      return;
    }

    try {
      await convertPRToPO(
        pr.id,
        selectedSupplierId,
        poReference || `PO-PR-${pr.prNumber}`,
      );
      toast.success("Converted to Purchase Order successfully");
      onSuccess();
    } catch (err) {
      console.error(err);
      const msg =
        err instanceof Error
          ? (err as Error & { response?: { message?: string } }).response?.message || err.message
          : "Failed to convert to PO";
      toast.error(msg);
    }
  };

  return {
    suppliers,
    selectedSupplierId,
    setSelectedSupplierId,
    poReference,
    setPoReference,
    handleConvertPR,
  };
}
