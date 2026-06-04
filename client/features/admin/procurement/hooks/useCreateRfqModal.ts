"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getRequisitions, createRFQ } from "@/services/procurement";
import { PR } from "../types";

export function useCreateRfqModal(onSuccess: () => void, isOpen: boolean) {
  const [deadlineDate, setDeadlineDate] = useState("");
  const [prId, setPrId] = useState("");
  const [requisitions, setRequisitions] = useState<PR[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    getRequisitions()
      .then((data) => {
        // Show only Approved requisitions that can be sourced
        setRequisitions(data.filter((r: PR) => r.status === "APPROVED"));
      })
      .catch((err) => console.error("Failed to load requisitions:", err));
  }, [isOpen]);

  const handleCreateRFQ = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deadlineDate) {
      toast.error("Deadline date is required");
      return;
    }

    try {
      await createRFQ({
        deadlineDate: new Date(deadlineDate).toISOString(),
        prId: prId || undefined,
      });
      toast.success("RFQ created successfully");
      setDeadlineDate("");
      setPrId("");
      onSuccess();
    } catch (err) {
      console.error(err);
      toast.error("Failed to create RFQ");
    }
  };

  return {
    deadlineDate,
    setDeadlineDate,
    prId,
    setPrId,
    requisitions,
    handleCreateRFQ,
  };
}
