export interface AiUsageByOperation {
  operation: string;
  totalTokens: number;
  requestCount: number;
}

export interface AiUsageByEndpoint {
  endpoint: string;
  totalTokens: number;
  requestCount: number;
}

export interface AiUsageByDay {
  date: string;
  totalTokens: number;
  requestCount: number;
}

export interface AiUsageSummary {
  days: number;
  totalTokens: number;
  totalRequests: number;
  byOperation: AiUsageByOperation[];
  byEndpoint: AiUsageByEndpoint[];
  byDay: AiUsageByDay[];
}

export const AI_USAGE_PERIOD_OPTIONS = [
  { value: 7, label: "Last 7 days" },
  { value: 30, label: "Last 30 days" },
  { value: 90, label: "Last 90 days" },
] as const;

const ENDPOINT_LABELS: Record<string, string> = {
  chat: "Chat (unspecified)",
  embeddings: "Embeddings",
  "embeddings/sync": "Embedding reindex",
  "embeddings/query": "Semantic search query",
  "ai/chat": "AI Studio chat",
  "ai/copilot/dashboard": "Dashboard copilot",
  "ai/copilot/admin": "Admin copilot",
  "ai/copilot/admin/plan": "Admin copilot (planning)",
  "ai-config/test": "AI connection test",
  "products/storefront-ai/chat": "Storefront assistant",
  "products/slug/ask": "Product Q&A",
  "ai/generate/product-content": "Product content",
  "ai/generate/campaign-copy": "Campaign copy",
  "ai/generate/faq": "FAQ generator",
  "ai/generate/page-seo": "Page SEO",
  "ai/generate/store-seo": "Store SEO",
  "ai/generate/support-reply": "Support reply assist",
  "ai/generate/support-conversation-summary": "Support handoff summary",
};

export function formatAiUsageEndpoint(endpoint: string): string {
  if (ENDPOINT_LABELS[endpoint]) {
    return ENDPOINT_LABELS[endpoint];
  }
  if (endpoint.startsWith("ai/generate/")) {
    const slug = endpoint.slice("ai/generate/".length).replace(/-/g, " ");
    return slug.charAt(0).toUpperCase() + slug.slice(1);
  }
  return endpoint;
}

/** @deprecated Use formatAiUsageEndpoint — kept for legacy summaries */
export function formatAiUsageOperation(operation: string): string {
  switch (operation) {
    case "chat":
      return "Chat & generation";
    case "embedding":
      return "Embeddings & search";
    default:
      return operation;
  }
}

export function formatTokenCount(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}k`;
  }
  return value.toLocaleString();
}
