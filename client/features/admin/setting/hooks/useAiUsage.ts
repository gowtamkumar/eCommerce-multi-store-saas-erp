"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchAPI } from "@/services/api";
import type { AiUsageSummary } from "../types/ai-usage";

export function useAiUsage(enabled: boolean) {
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<AiUsageSummary | null>(null);

  const loadUsage = useCallback(
    async (period = days) => {
      if (!enabled) {
        setSummary(null);
        return;
      }

      setLoading(true);
      try {
        const res = await fetchAPI(`/ai/usage?days=${period}`);
        setSummary(res.data ?? null);
      } catch {
        setSummary(null);
      } finally {
        setLoading(false);
      }
    },
    [days, enabled],
  );

  useEffect(() => {
    void loadUsage(days);
  }, [days, enabled, loadUsage]);

  const refreshUsage = useCallback(() => loadUsage(days), [days, loadUsage]);

  return {
    days,
    setDays,
    loading,
    summary,
    refreshUsage,
  };
}
