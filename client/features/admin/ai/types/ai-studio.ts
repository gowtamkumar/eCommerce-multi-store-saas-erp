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
  pushTitle?: string;
  pushBody?: string;
}

export interface FaqContentResult {
  question: string;
  answer: string;
}

export interface PageSeoResult {
  metaTitle: string;
  metaDescription: string;
}

export interface MarketingDescriptionResult {
  description: string;
}

export interface CatalogContentResult {
  description: string;
  seoTitle: string;
  seoDescription: string;
}

export type PageBlockType = "heading" | "paragraph" | "button" | "text-block";

export interface PageBlockContentResult {
  text?: string;
  headline?: string;
  subline?: string;
  html?: string;
  link?: string;
}
