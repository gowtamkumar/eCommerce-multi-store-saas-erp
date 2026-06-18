"use client";

import { motion } from "framer-motion";
import { Bot, Eye, EyeOff, Loader2, Sparkles, Zap } from "lucide-react";
import { useState } from "react";
import { useAiConfig } from "../hooks/useAiConfig";
import { AI_API_KEY_UNCHANGED, AI_PROVIDER_OPTIONS } from "../types/ai-config";

function SecretInput({
  label,
  value,
  onChange,
  placeholder,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
}) {
  const [show, setShow] = useState(false);
  const isMasked = value === AI_API_KEY_UNCHANGED;

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">{label}</label>
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="text-slate-400 hover:text-brand-500 transition-colors"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      <input
        type={show ? "text" : "password"}
        value={isMasked ? "" : value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
        placeholder={isMasked ? "••••••••  (saved — leave blank to keep)" : placeholder}
      />
      {hint ? <p className="text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}

export function AiSetting() {
  const {
    loading,
    saving,
    testing,
    form,
    setForm,
    apiKeyPreview,
    saveConfig,
    testConnection,
    applyProviderPreset,
  } = useAiConfig();

  const selectedProvider = AI_PROVIDER_OPTIONS.find((p) => p.id === form.provider);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
      </div>
    );
  }

  return (
    <motion.div
      key="ai"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div className="flex items-center gap-2">
        <Bot className="w-5 h-5 text-brand-600" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">AI Provider</h2>
      </div>

      <div className="p-5 rounded-3xl border border-slate-100 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-900/40 flex items-start gap-4">
        <input
          type="checkbox"
          checked={form.enabled}
          onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
          className="mt-1 w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
        />
        <div>
          <p className="font-bold text-slate-800 dark:text-slate-100">Enable AI features for this store</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Connect your own API key (OpenRouter, OpenAI, or any OpenAI-compatible provider).
            Credentials are stored per tenant and never shared across stores.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Provider</label>
          <select
            value={form.provider}
            onChange={(e) => applyProviderPreset(e.target.value as typeof form.provider)}
            className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
          >
            {AI_PROVIDER_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
          {selectedProvider?.hint ? (
            <p className="text-xs text-slate-500">{selectedProvider.hint}</p>
          ) : null}
        </div>

        <div className="md:col-span-2">
          <SecretInput
            label="API Key"
            value={form.apiKey}
            onChange={(apiKey) => setForm({ ...form, apiKey })}
            placeholder="sk-or-..."
            hint={
              apiKeyPreview
                ? `Saved key: ${apiKeyPreview}. Enter a new key only to replace it.`
                : "Required for AI features. Stored securely on your tenant record."
            }
          />
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Base URL</label>
          <input
            type="text"
            value={form.baseUrl}
            onChange={(e) => setForm({ ...form, baseUrl: e.target.value })}
            className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none font-mono text-sm"
            placeholder="https://openrouter.ai/api/v1"
          />
          <p className="text-xs text-slate-500">Must expose an OpenAI-compatible POST /chat/completions endpoint.</p>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Default model</label>
          <input
            type="text"
            value={form.defaultModel}
            onChange={(e) => setForm({ ...form, defaultModel: e.target.value })}
            className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none font-mono text-sm"
            placeholder="openai/gpt-4o-mini"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Embedding model (optional)</label>
          <input
            type="text"
            value={form.embeddingModel}
            onChange={(e) => setForm({ ...form, embeddingModel: e.target.value })}
            className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none font-mono text-sm"
            placeholder="openai/text-embedding-3-small"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Site URL (OpenRouter header)</label>
          <input
            type="url"
            value={form.siteUrl}
            onChange={(e) => setForm({ ...form, siteUrl: e.target.value })}
            className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
            placeholder="https://your-store.com"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Site name (OpenRouter header)</label>
          <input
            type="text"
            value={form.siteName}
            onChange={(e) => setForm({ ...form, siteName: e.target.value })}
            className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
            placeholder="My Store"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Max tokens</label>
          <input
            type="number"
            min={1}
            max={8192}
            value={form.maxTokens}
            onChange={(e) => setForm({ ...form, maxTokens: Number(e.target.value) })}
            className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Temperature</label>
          <input
            type="number"
            min={0}
            max={2}
            step={0.1}
            value={form.temperature}
            onChange={(e) => setForm({ ...form, temperature: Number(e.target.value) })}
            className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={saveConfig}
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl transition-all disabled:opacity-60"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          Save AI settings
        </button>
        <button
          type="button"
          onClick={testConnection}
          disabled={testing || !form.enabled}
          className="inline-flex items-center gap-2 px-6 py-3 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all disabled:opacity-60"
        >
          {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
          Test connection
        </button>
      </div>
    </motion.div>
  );
}
