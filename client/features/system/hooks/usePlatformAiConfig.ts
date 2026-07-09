"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { fetchAPI } from "@/services/api";
import {
  AI_API_KEY_UNCHANGED,
  AI_PROVIDER_OPTIONS,
  DEFAULT_PLATFORM_AI_CONFIG_FORM,
  PlatformAiConfigForm,
  PlatformAiConfigResponse,
} from "../types/platform-ai-config";

function mapResponseToForm(data: PlatformAiConfigResponse): PlatformAiConfigForm {
  const preset = AI_PROVIDER_OPTIONS.find((p) => p.id === data.provider);

  return {
    enabled: data.enabled ?? false,
    provider: (data.provider as PlatformAiConfigForm["provider"]) || "openai",
    apiKey: data.hasApiKey ? AI_API_KEY_UNCHANGED : "",
    baseUrl: data.baseUrl || preset?.baseUrl || DEFAULT_PLATFORM_AI_CONFIG_FORM.baseUrl,
    defaultModel: data.defaultModel || preset?.defaultModel || "",
    siteUrl: data.siteUrl || "",
    siteName: data.siteName || "",
    maxTokens: data.maxTokens ?? 1024,
    temperature: data.temperature ?? 0.7,
  };
}

export function usePlatformAiConfig() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [form, setForm] = useState<PlatformAiConfigForm>(DEFAULT_PLATFORM_AI_CONFIG_FORM);
  const [apiKeyPreview, setApiKeyPreview] = useState<string | null>(null);
  const [configured, setConfigured] = useState<boolean | null>(null);

  const loadConfig = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchAPI("/platform/settings/ai-config");
      if (res.data) {
        setForm(mapResponseToForm(res.data));
        setApiKeyPreview(res.data.apiKeyPreview || null);
        setConfigured(!!(res.data.enabled && res.data.hasApiKey && res.data.defaultModel));
      }
    } catch {
      toast.error("Failed to load platform AI configuration");
      setConfigured(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadConfig();
  }, [loadConfig]);

  const saveConfig = async () => {
    setSaving(true);
    try {
const payload: Record<string, unknown> = {
      enabled: form.enabled,
      provider: form.provider,
      baseUrl: form.baseUrl,
      defaultModel: form.defaultModel,
      siteUrl: form.siteUrl || undefined,
      siteName: form.siteName || undefined,
      maxTokens: form.maxTokens,
      temperature: form.temperature,
    };

      if (form.apiKey && form.apiKey !== AI_API_KEY_UNCHANGED) {
        payload.apiKey = form.apiKey;
      } else if (form.apiKey === AI_API_KEY_UNCHANGED) {
        payload.apiKey = AI_API_KEY_UNCHANGED;
      }

      const res = await fetchAPI("/platform/settings/ai-config", {
        method: "PATCH",
        body: JSON.stringify(payload),
      });

      if (res.data) {
        setForm(mapResponseToForm(res.data));
        setApiKeyPreview(res.data.apiKeyPreview || null);
        setConfigured(!!(res.data.enabled && res.data.hasApiKey && res.data.defaultModel));
      }
      toast.success("Platform AI configuration saved");
    } catch {
      toast.error("Failed to save platform AI configuration");
    } finally {
      setSaving(false);
    }
  };

  const testConnection = async () => {
    setTesting(true);
    try {
      if (form.apiKey && form.apiKey !== AI_API_KEY_UNCHANGED) {
        await fetchAPI("/platform/settings/ai-config", {
          method: "PATCH",
          body: JSON.stringify({
            enabled: true,
            provider: form.provider,
            apiKey: form.apiKey,
            baseUrl: form.baseUrl,
            defaultModel: form.defaultModel,
            siteUrl: form.siteUrl || undefined,
            siteName: form.siteName || undefined,
            maxTokens: form.maxTokens,
            temperature: form.temperature,
          }),
        });
      }

      const res = await fetchAPI("/platform/settings/ai-config/test", {
        method: "POST",
        body: JSON.stringify({ prompt: "Reply with exactly: OK" }),
      });

      toast.success(`Connected (${res.data?.model}): ${res.data?.reply}`);
      await loadConfig();
    } catch {
      toast.error("Platform AI connection test failed");
    } finally {
      setTesting(false);
    }
  };

  const applyProviderPreset = (providerId: PlatformAiConfigForm["provider"]) => {
    const preset = AI_PROVIDER_OPTIONS.find((p) => p.id === providerId);
    if (!preset) return;

    setForm((prev) => ({
      ...prev,
      provider: providerId,
      baseUrl: preset.baseUrl,
      defaultModel: preset.defaultModel,
      siteUrl: preset.showOpenRouterHeaders ? prev.siteUrl : "",
      siteName: preset.showOpenRouterHeaders ? prev.siteName : "",
    }));
  };

  return {
    loading,
    saving,
    testing,
    configured,
    form,
    setForm,
    apiKeyPreview,
    saveConfig,
    testConnection,
    applyProviderPreset,
    refreshConfig: loadConfig,
  };
}
