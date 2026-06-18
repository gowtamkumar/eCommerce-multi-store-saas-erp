export type AiStudioTab = "chat" | "product" | "campaign";

export interface AiStatus {
  enabled: boolean;
  configured: boolean;
  provider: string;
  defaultModel?: string;
  hasApiKey: boolean;
}

export interface AiChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ProductContentResult {
  title: string;
  shortDescription: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
  tags: string[];
}

export interface CampaignCopyResult {
  emailSubject?: string;
  emailBody?: string;
  smsText?: string;
}
