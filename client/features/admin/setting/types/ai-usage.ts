export interface AiUsageByOperation {
  operation: string;
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
  byDay: AiUsageByDay[];
}

export const AI_USAGE_PERIOD_OPTIONS = [
  { value: 7, label: "Last 7 days" },
  { value: 30, label: "Last 30 days" },
  { value: 90, label: "Last 90 days" },
] as const;

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
