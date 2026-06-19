"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { fetchAPI } from "@/services/api";
import {
  AI_API_KEY_UNCHANGED,
  AI_PROVIDER_OPTIONS,
  DEFAULT_AI_CONFIG_FORM,
  DEFAULT_STOREFRONT_AI_CONFIG,
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
  };
}

export function useAiConfig() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [reindexing, setReindexing] = useState(false);
  const [embeddingStatus, setEmbeddingStatus] = useState<{
    indexedCount: number;
    activeProductCount: number;
    hybridSearchReady: boolean;
    embeddingModel?: string;
  } | null>(null);
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

  const setStorefrontFlag = (
    key: keyof TenantAiConfigForm["storefront"],
    value: boolean,
  ) => {
    setForm((prev) => ({
      ...prev,
      storefront: { ...prev.storefront, [key]: value },
    }));
  };

  return {
    loading,
    saving,
    testing,
    reindexing,
    embeddingStatus,
    storefrontAiStatus,
    form,
    setForm,
    setStorefrontFlag,
    apiKeyPreview,
    saveConfig,
    testConnection,
    reindexCatalogEmbeddings,
    applyProviderPreset,
    refreshConfig: loadConfig,
  };
}
