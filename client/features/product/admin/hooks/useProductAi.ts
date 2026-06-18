"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { fetchAPI } from "@/services/api";
import type { ProductContentResult } from "@/features/admin/ai/types/ai-studio";

export function useProductAi() {
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  const checkStatus = useCallback(async () => {
    try {
      const res = await fetchAPI("/ai/status");
      setConfigured(!!res.data?.configured);
    } catch {
      setConfigured(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void checkStatus();
    }, 0);
    return () => clearTimeout(timer);
  }, [checkStatus]);

  const generateProductContent = async (payload: {
    productName: string;
    keywords?: string;
    existingDescription?: string;
    tone?: string;
  }): Promise<ProductContentResult | null> => {
    setLoading(true);
    try {
      const res = await fetchAPI("/ai/generate/product-content", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return res.data ?? null;
    } catch {
      toast.error("AI generation failed. Check Settings → AI Configuration.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { configured, loading, generateProductContent, refreshStatus: checkStatus };
}
