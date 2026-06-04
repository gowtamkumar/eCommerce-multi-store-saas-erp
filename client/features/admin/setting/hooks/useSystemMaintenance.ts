"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { fetchAPI } from "@/services/api";

export function useSystemMaintenance() {
  const [clearing, setClearing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const clearCache = async () => {
    setClearing(true);
    try {
      await fetchAPI("/settings/cache/clear", {
        method: "POST",
      });
      toast.success("Store cache cleared successfully!");
      setShowConfirm(false);
    } catch (error) {
      console.error("Failed to clear cache", error);
      toast.error("Failed to clear store cache");
    } finally {
      setClearing(false);
    }
  };

  return {
    clearing,
    showConfirm,
    setShowConfirm,
    clearCache,
  };
}
