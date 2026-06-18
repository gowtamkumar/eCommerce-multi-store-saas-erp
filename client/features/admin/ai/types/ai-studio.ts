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

export type StoreSeoResult = PageSeoResult;

export interface MarketingDescriptionResult {
  description: string;
}

export interface LoyaltyProgramCopyResult {
  programDescription: string;
  referralMessage: string;
}

export interface LoyaltyRuleCopyResult {
  name: string;
}

export type LeadFollowUpIntent = "welcome" | "follow_up" | "nurture" | "conversion";

export interface LeadFollowUpResult {
  emailSubject: string;
  emailBody: string;
  smsText?: string;
}

export type OrderAssistContext = "status" | "email";

export type OrderEmailTemplate =
  | "status_update"
  | "shipped"
  | "delay"
  | "cancellation"
  | "payment_issue"
  | "general";

export interface OrderAssistResult {
  explanation?: string;
  emailSubject?: string;
  emailBody?: string;
}

export type ReturnLetterTemplate =
  | "approved"
  | "rejected"
  | "refunded"
  | "received"
  | "exchange"
  | "pending"
  | "general";

export interface ReturnAssistResult {
  emailSubject: string;
  emailBody: string;
}

export interface SupportReplyResult {
  suggestedReply: string;
}

export interface CustomerProfileResult {
  supportSummary: string;
  segmentLabels: string[];
}

export type ToxicityLevel = "none" | "low" | "medium" | "high";

export interface ReviewAssistResult {
  publicReply: string;
  toxicityLevel: ToxicityLevel;
  toxicityReason: string;
  needsAttention: boolean;
}

export type AbandonedCartMessageTemplate =
  | "gentle_reminder"
  | "incentive"
  | "urgency"
  | "win_back"
  | "general";

export interface AbandonedCartMessageResult {
  emailSubject: string;
  emailBody: string;
  smsText?: string;
}

export interface PriceBookRationaleResult {
  rationaleNotes: string;
  usageGuidance: string;
}

export interface MediaAssistResult {
  altText: string;
  suggestedFilename: string;
  visionUsed?: boolean;
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
