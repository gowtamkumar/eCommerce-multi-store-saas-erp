"use client";

import { useAiGenerate } from "@/features/admin/ai/hooks/useAiGenerate";

/** @deprecated Prefer useAiGenerate — kept for product form compatibility */
export function useProductAi() {
  const { configured, loading, generateProductContent, refreshStatus } = useAiGenerate();
  return { configured, loading, generateProductContent, refreshStatus };
}
