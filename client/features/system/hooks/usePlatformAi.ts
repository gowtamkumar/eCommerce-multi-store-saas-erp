"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { fetchSuperAdminAPI } from "@/services/superAdminApi";

export interface PlanDescriptionInput {
  planName: string;
  currency?: string;
  monthlyPrice?: number;
  yearlyPrice?: number;
  trialPeriodDays?: number;
  isPopular?: boolean;
  features?: string[];
  existingDescription?: string;
  tone?: string;
  quotaSummary?: string;
}

export interface PlanDescriptionResult {
  description: string;
}

export function usePlatformAi() {
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  const checkStatus = useCallback(async () => {
    try {
      const res = await fetchSuperAdminAPI("/super-admin/ai/status");
      setConfigured(!!res.data?.configured);
    } catch {
      setConfigured(false);
    }
  }, []);

  useEffect(() => {
    void checkStatus();
  }, [checkStatus]);

  const generatePlanDescription = async (
    payload: PlanDescriptionInput,
  ): Promise<PlanDescriptionResult | null> => {
    setLoading(true);
    try {
      const res = await fetchSuperAdminAPI("/super-admin/ai/generate/plan-description", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return res.data ?? null;
    } catch {
      toast.error("Failed to generate plan description");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    configured,
    loading,
    generatePlanDescription,
    refreshStatus: checkStatus,
  };
}
