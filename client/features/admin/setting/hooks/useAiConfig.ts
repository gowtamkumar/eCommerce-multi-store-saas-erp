"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { fetchAPI } from "@/services/api";
import {
  AI_API_KEY_UNCHANGED,
  AI_PROVIDER_OPTIONS,
  DEFAULT_AI_CONFIG_FORM,
  DEFAULT_AUTOMATION_AI_CONFIG,
  DEFAULT_STOREFRONT_AI_CONFIG,
  EmbeddingIndexStatus,
  StorefrontAiStatus,
  TenantAiConfigForm,
  TenantAiConfigResponse,
} from "../types/ai-config";

function mapResponseToForm(data: TenantAiConfigResponse): TenantAiConfigForm {
  const preset = AI_PROVIDER_OPTIONS.find((p) => p.id === data.provider);

  return {
    enabled: data.enabled ?? false,
    provider: (data.provider as TenantAiConfigForm["provider"]) || "openai",
    apiKey: data.hasApiKey ? AI_API_KEY_UNCHANGED : "",
    baseUrl: data.baseUrl || preset?.baseUrl || DEFAULT_AI_CONFIG_FORM.baseUrl,
    defaultModel: data.defaultModel || preset?.defaultModel || "",
    embeddingModel: data.embeddingModel || preset?.embeddingModel || "",
    apiVersion: data.apiVersion || preset?.apiVersion || "2024-08-01-preview",
    siteUrl: data.siteUrl || "",
    siteName: data.siteName || "",
    maxTokens: data.maxTokens ?? 1024,
    temperature: data.temperature ?? 0.7,
    storefront: {
      ...DEFAULT_STOREFRONT_AI_CONFIG,
      ...data.storefront,
    },
    automation: {
      ...DEFAULT_AUTOMATION_AI_CONFIG,
      ...data.automation,
    },
  };
}

export function useAiConfig() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [reindexing, setReindexing] = useState(false);
  const [reindexingAsync, setReindexingAsync] = useState(false);
  const [reindexJobStatus, setReindexJobStatus] = useState<string | null>(null);
  const [embeddingStatus, setEmbeddingStatus] = useState<EmbeddingIndexStatus | null>(null);
  const [storefrontAiStatus, setStorefrontAiStatus] = useState<StorefrontAiStatus | null>(null);
  const [form, setForm] = useState<TenantAiConfigForm>(DEFAULT_AI_CONFIG_FORM);
  const [apiKeyPreview, setApiKeyPreview] = useState<string | null>(null);

  const loadConfig = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchAPI("/tenants/ai-config");
      if (res.data) {
        setForm(mapResponseToForm(res.data));
        setApiKeyPreview(res.data.apiKeyPreview || null);
      }
    } catch {
      toast.error("Failed to load AI configuration");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const loadEmbeddingStatus = useCallback(async () => {
    try {
      const res = await fetchAPI("/products/embeddings/status");
      if (res.data) {
        setEmbeddingStatus(res.data);
      }
    } catch {
      setEmbeddingStatus(null);
    }
  }, []);

  const loadStorefrontAiStatus = useCallback(async () => {
    try {
      const res = await fetchAPI("/products/storefront-ai/status");
      if (res.data) {
        setStorefrontAiStatus(res.data);
      }
    } catch {
      setStorefrontAiStatus(null);
    }
  }, []);

  useEffect(() => {
    if (!loading && form.enabled) {
      loadEmbeddingStatus();
      loadStorefrontAiStatus();
    }
  }, [loading, form.enabled, loadEmbeddingStatus, loadStorefrontAiStatus]);

  const saveConfig = async () => {
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        enabled: form.enabled,
        provider: form.provider,
        baseUrl: form.baseUrl,
        defaultModel: form.defaultModel,
        embeddingModel: form.embeddingModel || undefined,
        apiVersion: form.apiVersion || undefined,
        siteUrl: form.siteUrl || undefined,
        siteName: form.siteName || undefined,
        maxTokens: form.maxTokens,
        temperature: form.temperature,
        storefront: form.storefront,
        automation: form.automation,
      };

      if (form.apiKey && form.apiKey !== AI_API_KEY_UNCHANGED) {
        payload.apiKey = form.apiKey;
      } else if (form.apiKey === AI_API_KEY_UNCHANGED) {
        payload.apiKey = AI_API_KEY_UNCHANGED;
      }

      const res = await fetchAPI("/tenants/ai-config", {
        method: "PATCH",
        body: JSON.stringify(payload),
      });

      if (res.data) {
        setForm(mapResponseToForm(res.data));
        setApiKeyPreview(res.data.apiKeyPreview || null);
      }
      toast.success("AI configuration saved");
      await loadStorefrontAiStatus();
      await loadEmbeddingStatus();
    } catch {
      toast.error("Failed to save AI configuration");
    } finally {
      setSaving(false);
    }
  };

  const testConnection = async () => {
    setTesting(true);
    try {
      if (form.apiKey && form.apiKey !== AI_API_KEY_UNCHANGED) {
        await fetchAPI("/tenants/ai-config", {
          method: "PATCH",
          body: JSON.stringify({
            enabled: true,
            provider: form.provider,
            apiKey: form.apiKey,
            baseUrl: form.baseUrl,
            defaultModel: form.defaultModel,
            embeddingModel: form.embeddingModel || undefined,
            apiVersion: form.apiVersion || undefined,
            siteUrl: form.siteUrl || undefined,
            siteName: form.siteName || undefined,
            maxTokens: form.maxTokens,
            temperature: form.temperature,
            storefront: form.storefront,
          }),
        });
      }

      const res = await fetchAPI("/tenants/ai-config/test", {
        method: "POST",
        body: JSON.stringify({ prompt: "Reply with exactly: OK" }),
      });

      toast.success(`Connected (${res.data?.model}): ${res.data?.reply}`);
      await loadConfig();
    } catch {
      toast.error("AI connection test failed");
    } finally {
      setTesting(false);
    }
  };

  const applyProviderPreset = (providerId: TenantAiConfigForm["provider"]) => {
    const preset = AI_PROVIDER_OPTIONS.find((p) => p.id === providerId);
    if (!preset) return;

    setForm((prev) => ({
      ...prev,
      provider: providerId,
      baseUrl: preset.baseUrl,
      defaultModel: preset.defaultModel,
      embeddingModel: preset.showEmbeddingModel === false ? "" : preset.embeddingModel || prev.embeddingModel,
      apiVersion: preset.apiVersion || prev.apiVersion,
      siteUrl: preset.showOpenRouterHeaders ? prev.siteUrl : "",
      siteName: preset.showOpenRouterHeaders ? prev.siteName : "",
    }));
  };

  const pollReindexJob = async (jobId: string) => {
    for (let attempt = 0; attempt < 90; attempt += 1) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const res = await fetchAPI(`/ai/jobs/${jobId}`);
      const status = res.data?.status as string | undefined;
      setReindexJobStatus(status ?? null);

      if (status === "completed") {
        const result = res.data?.result as
          | { indexed?: number; skipped?: number; failed?: number }
          | undefined;
        toast.success(
          `Background reindex done: ${result?.indexed ?? 0} updated, ${result?.skipped ?? 0} unchanged`,
        );
        await loadEmbeddingStatus();
        await loadStorefrontAiStatus();
        return;
      }

      if (status === "failed") {
        toast.error(res.data?.error || "Background reindex failed");
        return;
      }
    }

    toast.error("Background reindex is taking longer than expected. Check job status later.");
  };

  const reindexCatalogEmbeddings = async () => {
    setReindexing(true);
    try {
      const res = await fetchAPI("/products/embeddings/reindex", {
        method: "POST",
      });
      const summary = res.data;
      toast.success(
        `Catalog indexed: ${summary?.indexed ?? 0} updated, ${summary?.skipped ?? 0} unchanged`,
      );
      await loadEmbeddingStatus();
      await loadStorefrontAiStatus();
    } catch {
      toast.error("Failed to reindex product catalog for semantic search");
    } finally {
      setReindexing(false);
    }
  };

  const reindexCatalogEmbeddingsAsync = async () => {
    setReindexingAsync(true);
    setReindexJobStatus("queued");
    try {
      const res = await fetchAPI("/products/embeddings/reindex/async", {
        method: "POST",
      });
      const jobId = res.data?.id as string | undefined;
      if (!jobId) {
        throw new Error("Missing job id");
      }
      toast.success("Catalog reindex queued — running in background");
      await pollReindexJob(jobId);
    } catch {
      toast.error("Failed to queue background reindex");
      setReindexJobStatus(null);
    } finally {
      setReindexingAsync(false);
    }
  };

  const setStorefrontFlag = (
    key: keyof TenantAiConfigForm["storefront"],
    value: boolean,
  ) => {
    setForm((prev) => ({
      ...prev,
      storefront: { ...prev.storefront, [key]: value },
    }));
  };

  const setAutomationFlag = (
    key: keyof TenantAiConfigForm["automation"],
    value: boolean,
  ) => {
    setForm((prev) => ({
      ...prev,
      automation: { ...prev.automation, [key]: value },
    }));
  };

  return {
    loading,
    saving,
    testing,
    reindexing,
    reindexingAsync,
    reindexJobStatus,
    embeddingStatus,
    storefrontAiStatus,
    form,
    setForm,
    setStorefrontFlag,
    setAutomationFlag,
    apiKeyPreview,
    saveConfig,
    testConnection,
    reindexCatalogEmbeddings,
    reindexCatalogEmbeddingsAsync,
    applyProviderPreset,
    refreshConfig: loadConfig,
  };
}
