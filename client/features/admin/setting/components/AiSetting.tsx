"use client";

import { motion } from "framer-motion";
import { Bot, Eye, EyeOff, Loader2, MessageCircle, Search, Sparkles, Zap } from "lucide-react";
import { useState } from "react";
import { useAiConfig } from "../hooks/useAiConfig";
import { useAiUsage } from "../hooks/useAiUsage";
import { AI_API_KEY_UNCHANGED, AI_PROVIDER_OPTIONS } from "../types/ai-config";
import { AiUsageDashboard } from "./AiUsageDashboard";

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

function FeatureStatusBadge({ active, label }: { active: boolean; label: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${active
        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
        }`}
    >
      {label}: {active ? "Live" : "Off"}
    </span>
  );
}

function StorefrontToggle({
  checked,
  onChange,
  title,
  description,
  disabled,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  title: string;
  description: string;
  disabled?: boolean;
}) {
  return (
    <label
      className={`flex items-start gap-3 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3 ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:bg-white/60 dark:hover:bg-slate-900/40"
        }`}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
      />
      <div>
        <p className="font-semibold text-slate-800 dark:text-slate-100">{title}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
      </div>
    </label>
  );
}

export function AiSetting() {
  const {
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
  } = useAiConfig();

  const {
    days: usageDays,
    setDays: setUsageDays,
    loading: usageLoading,
    summary: usageSummary,
    refreshUsage,
  } = useAiUsage(form.enabled);

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
            Connect OpenRouter, OpenAI, Anthropic, Google Gemini, Azure OpenAI, or a custom provider.
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
            placeholder={selectedProvider?.apiKeyPlaceholder || "API key"}
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
            placeholder={selectedProvider?.baseUrl || "https://api.example.com/v1"}
          />
          <p className="text-xs text-slate-500">
            {form.provider === "azure_openai"
              ? "Azure deployment URL, e.g. https://RESOURCE.openai.azure.com/openai/deployments/DEPLOYMENT"
              : form.provider === "google"
                ? "Google Gemini API base (usually leave as default)."
                : form.provider === "anthropic"
                  ? "Anthropic API base (usually leave as default)."
                  : "API base URL for the selected provider."}
          </p>
        </div>

        {selectedProvider?.showApiVersion ? (
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">API version (Azure)</label>
            <input
              type="text"
              value={form.apiVersion}
              onChange={(e) => setForm({ ...form, apiVersion: e.target.value })}
              className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none font-mono text-sm"
              placeholder="2024-08-01-preview"
            />
          </div>
        ) : null}

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Default model</label>
          <input
            type="text"
            value={form.defaultModel}
            onChange={(e) => setForm({ ...form, defaultModel: e.target.value })}
            className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none font-mono text-sm"
            placeholder={selectedProvider?.defaultModel || "model-name"}
          />
        </div>

        {selectedProvider?.showEmbeddingModel !== false ? (
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Embedding model (optional)</label>
            <input
              type="text"
              value={form.embeddingModel}
              onChange={(e) => setForm({ ...form, embeddingModel: e.target.value })}
              className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none font-mono text-sm"
              placeholder={selectedProvider?.embeddingModel || "embedding-model"}
            />
          </div>
        ) : null}

        {selectedProvider?.showOpenRouterHeaders ? (
          <>
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
          </>
        ) : null}

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

      <AiUsageDashboard
        enabled={form.enabled}
        days={usageDays}
        onDaysChange={setUsageDays}
        loading={usageLoading}
        summary={usageSummary}
        onRefresh={() => void refreshUsage()}
      />

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/40 p-5 space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="space-y-1 flex-1">
            <h3 className="font-bold text-slate-900 dark:text-white">Storefront AI</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Control which AI features shoppers see on your storefront. Requires AI provider above
              to be enabled; semantic search also needs a catalog reindex.
            </p>
            {storefrontAiStatus ? (
              <div className="flex flex-wrap gap-2 pt-2">
                <FeatureStatusBadge
                  active={storefrontAiStatus.shoppingAssistantAvailable}
                  label="Shopping assistant"
                />
                <FeatureStatusBadge
                  active={storefrontAiStatus.productQaAvailable}
                  label="Product Q&A"
                />
                <FeatureStatusBadge
                  active={storefrontAiStatus.semanticSearchAvailable}
                  label="Semantic search"
                />
              </div>
            ) : null}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-1">
          <StorefrontToggle
            checked={form.storefront.shoppingAssistantEnabled}
            onChange={(value) => setStorefrontFlag("shoppingAssistantEnabled", value)}
            disabled={!form.enabled}
            title="Shopping assistant chat"
            description="Floating assistant widget (bottom-left) that answers catalog and FAQ questions. No checkout or order changes."
          />
          <StorefrontToggle
            checked={form.storefront.productQaEnabled}
            onChange={(value) => setStorefrontFlag("productQaEnabled", value)}
            disabled={!form.enabled}
            title="Product Q&A"
            description="“Ask about this product” widget on product detail pages, grounded in that product’s data."
          />
          <StorefrontToggle
            checked={form.storefront.semanticSearchEnabled}
            onChange={(value) => setStorefrontFlag("semanticSearchEnabled", value)}
            disabled={!form.enabled}
            title="Semantic product search"
            description="Hybrid keyword + vector search when shoppers use the catalog search bar."
          />
        </div>

        {!form.enabled ? (
          <p className="text-xs text-slate-500 flex items-center gap-1.5">
            <MessageCircle className="w-3.5 h-3.5" />
            Enable AI provider above to configure storefront features.
          </p>
        ) : null}
      </div>

      {form.enabled && form.embeddingModel ? (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/40 p-5 space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300">
              <Search className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900 dark:text-white">Storefront semantic search</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Index active products for hybrid keyword + vector search on the storefront catalog.
                Re-run after bulk catalog changes.
              </p>
            </div>
          </div>

          {embeddingStatus ? (
            <div className="grid gap-3 sm:grid-cols-3 text-sm">
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3">
                <p className="text-slate-500">Indexed products</p>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {embeddingStatus.indexedCount} / {embeddingStatus.activeProductCount}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3">
                <p className="text-slate-500">Embedding model</p>
                <p className="font-mono text-xs font-semibold text-slate-900 dark:text-white truncate">
                  {embeddingStatus.embeddingModel || form.embeddingModel}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3">
                <p className="text-slate-500">Hybrid search</p>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {embeddingStatus.hybridSearchReady ? "Ready on storefront" : "Needs reindex or config"}
                </p>
              </div>
            </div>
          ) : null}

          <button
            type="button"
            onClick={async () => {
              await reindexCatalogEmbeddings();
              void refreshUsage();
            }}
            disabled={reindexing || !form.enabled}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl transition-all disabled:opacity-60"
          >
            {reindexing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Reindex product catalog
          </button>
        </div>
      ) : null}

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
          onClick={async () => {
            await testConnection();
            void refreshUsage();
          }}
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
