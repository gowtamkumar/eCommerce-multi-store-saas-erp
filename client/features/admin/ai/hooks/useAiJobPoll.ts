"use client";

import { fetchAPI } from "@/services/api";
import { useCallback } from "react";

export interface AiJobResponse {
  id: string;
  type: string;
  status: string;
  result?: Record<string, unknown> | null;
  error?: string | null;
}

export async function pollAiJob(
  jobId: string,
  options?: { maxAttempts?: number; intervalMs?: number },
): Promise<AiJobResponse> {
  const maxAttempts = options?.maxAttempts ?? 90;
  const intervalMs = options?.intervalMs ?? 2000;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
    const res = await fetchAPI(`/ai/jobs/${jobId}`);
    const job = res.data as AiJobResponse | undefined;
    const status = job?.status;

    if (status === "completed" && job) {
      return job;
    }

    if (status === "failed") {
      throw new Error(job?.error || "AI job failed");
    }
  }

  throw new Error("AI job is taking longer than expected");
}

export function useAiJobPoll() {
  const enqueueInvoiceOcr = useCallback(async (payload: Record<string, unknown>) => {
    const res = await fetchAPI("/ai/jobs/invoice-ocr", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    const jobId = res.data?.id as string | undefined;
    if (!jobId) {
      throw new Error("Missing job id");
    }
    return pollAiJob(jobId);
  }, []);

  const fetchLatestCartDraft = useCallback(async (cartId: string) => {
    const res = await fetchAPI(
      `/ai/jobs/latest?type=cart_abandoned_draft&cartId=${encodeURIComponent(cartId)}`,
    );
    return (res.data as AiJobResponse | null) ?? null;
  }, []);

  return { enqueueInvoiceOcr, fetchLatestCartDraft, pollAiJob };
}
