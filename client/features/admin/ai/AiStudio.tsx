"use client";

import { Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { AiChatPanel, AiSetupBanner } from "./components/AiChatPanel";
import { CampaignCopyGenerator } from "./components/CampaignCopyGenerator";
import { FaqContentGenerator } from "./components/FaqContentGenerator";
import { PageSeoContentGenerator } from "./components/PageSeoContentGenerator";
import { ProductContentGenerator } from "./components/ProductContentGenerator";
import { StoreSeoContentGenerator } from "./components/StoreSeoContentGenerator";
import { useAiStudio } from "./hooks/useAiStudio";
import type { AiStudioTab } from "./types/ai-studio";

const TABS: Array<{ id: AiStudioTab; label: string }> = [
  { id: "chat", label: "Assistant" },
  { id: "product", label: "Product content" },
  { id: "campaign", label: "Campaign copy" },
  { id: "faq", label: "FAQ generator" },
  { id: "pageSeo", label: "Page SEO" },
  { id: "storeSeo", label: "Store SEO" },
];

export default function AiStudio() {
  const [activeTab, setActiveTab] = useState<AiStudioTab>("chat");
  const {
    status,
    loadingStatus,
    chatLoading,
    productLoading,
    campaignLoading,
    faqLoading,
    pageSeoLoading,
    storeSeoLoading,
    messages,
    sendChat,
    clearChat,
    generateProductContent,
    generateCampaignCopy,
    generateFaq,
    generatePageSeo,
    generateStoreSeo,
  } = useAiStudio();

  const disabled = !status?.configured;

  if (loadingStatus) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-brand-600" />
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">AI Studio</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Chat assistant, product descriptions, campaign copy, FAQs, and SEO tools — powered by your tenant AI config.
          </p>
        </div>
        {status?.configured ? (
          <div className="text-xs font-mono px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {status.provider} · {status.defaultModel}
          </div>
        ) : null}
      </div>

      <AiSetupBanner configured={!!status?.configured} />

      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
              activeTab === tab.id
                ? "bg-brand-600 text-white"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "chat" ? (
        <AiChatPanel
          messages={messages}
          loading={chatLoading}
          disabled={disabled}
          onSend={sendChat}
          onClear={clearChat}
        />
      ) : null}

      {activeTab === "product" ? (
        <ProductContentGenerator
          loading={productLoading}
          disabled={disabled}
          onGenerate={generateProductContent}
        />
      ) : null}

      {activeTab === "campaign" ? (
        <CampaignCopyGenerator
          loading={campaignLoading}
          disabled={disabled}
          onGenerate={generateCampaignCopy}
        />
      ) : null}

      {activeTab === "faq" ? (
        <FaqContentGenerator
          loading={faqLoading}
          disabled={disabled}
          onGenerate={generateFaq}
        />
      ) : null}

      {activeTab === "pageSeo" ? (
        <PageSeoContentGenerator
          loading={pageSeoLoading}
          disabled={disabled}
          onGenerate={generatePageSeo}
        />
      ) : null}

      {activeTab === "storeSeo" ? (
        <StoreSeoContentGenerator
          loading={storeSeoLoading}
          disabled={disabled}
          onGenerate={generateStoreSeo}
        />
      ) : null}
    </div>
  );
}
