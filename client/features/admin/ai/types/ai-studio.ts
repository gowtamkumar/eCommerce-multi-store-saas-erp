export type AiStudioTab = "chat" | "product" | "campaign" | "faq" | "pageSeo" | "storeSeo";

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
  sku?: string;
  barcode?: string;
  price?: number;
  wholesalePrice?: number;
  averageCost?: number;
  lowStockThreshold?: number;
  suggestedCategory?: string;
  suggestedBrand?: string;
  faqs?: Array<{ question: string; answer: string; order: number }>;
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

export interface CouponCodeSuggestionsResult {
  suggestions: string[];
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

export interface SupportConversationSummaryResult {
  handoffSummary: string;
  keyPoints: string[];
  suggestedNextSteps: string[];
  pendingVisitorRequests: string[];
}

export interface SupportMessageIntentsResult {
  messageIntents: Array<{
    messageId: string;
    intentTags: string[];
  }>;
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

export interface InventoryAnomalyResult {
  narrative: string;
  anomalyHighlights: string[];
}

export interface StockTransferReasonResult {
  reasonNotes: string;
  auditSummary: string;
}

export interface CycleCountVarianceResult {
  narrative: string;
  varianceHighlights: string[];
}

export interface PackingSlipNotesResult {
  packingSlipNotes: string;
  handlingNotes: string;
}

export interface BatchWasteReductionResult {
  wasteReductionTips: string;
  priorityActions: string[];
}

export interface RequisitionJustificationResult {
  justificationText: string;
  lineNotes: string[];
}

export interface PoCoverLetterResult {
  coverLetter: string;
  termsNotes: string;
}

export interface GrnDiscrepancyNotesResult {
  discrepancyNotes: string;
  lineHighlights: string[];
  supplierFollowUp: string;
}

export interface InvoiceOcrLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  lineTotal?: number;
  sku?: string;
}

export interface InvoiceOcrResult {
  invoiceNumber?: string;
  supplierName?: string;
  invoiceDate?: string;
  dueDate?: string;
  currency?: string;
  subtotal?: number;
  taxAmount?: number;
  totalAmount?: number;
  lineItems: InvoiceOcrLineItem[];
  extractionNotes: string;
  visionUsed?: boolean;
  unmatchedWarnings?: string[];
}

export interface DebitNoteDisputeResult {
  disputeLetter: string;
  internalNotes: string;
}

export interface SupplierProfileSummaryResult {
  profileSummary: string;
  supplierTags: string[];
}

export interface ArCollectionDraftResult {
  emailSubject: string;
  emailBody: string;
  internalNotes: string;
}

export interface ApPaymentReminderResult {
  reminderSubject: string;
  reminderBody: string;
  actionItems: string[];
}

export interface ExpenseCategorySuggestResult {
  suggestedCategory: string;
  confidence: "high" | "medium" | "low";
  reasoning: string;
}

export interface ReportExecutiveSummaryResult {
  headline: string;
  executiveSummary: string;
  highlights: string[];
  watchItems: string[];
}

export interface TaxRuleExplanationResult {
  ruleTitle: string;
  explanation: string;
  applicabilityNotes: string[];
  complianceReminders: string[];
}

export interface RecruitmentJobCopyResult {
  jobDescription: string;
  requirements: string[];
  screeningQuestions: string[];
}

export interface PerformanceReviewPhrasesResult {
  strengthsPhrases: string[];
  developmentPhrases: string[];
  summaryPhrases: string[];
  usageNotes: string[];
}

export interface PayslipExplanationResult {
  emailSubject: string;
  employeeMessage: string;
  breakdownBullets: string[];
  internalNotes: string[];
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

export type PosCashierAssistContext = "upsell" | "reconciliation" | "remarks";

export interface PosCashierAssistResult {
  upsellSuggestions?: Array<{
    productSuggest: string;
    pitchExplanation: string;
  }>;
  reconciliationSteps?: string[];
  suggestedRemarks?: string;
}

export interface LeaveFaqItem {
  question: string;
  answer: string;
}

export interface LeaveFaqResult {
  title: string;
  intro?: string;
  faqs: LeaveFaqItem[];
  reviewNotes: string[];
}

export type ApplicantScreeningStage = "initial" | "technical" | "cultural_fit" | "final";

export interface ScreeningQuestion {
  question: string;
  category: string;
  interviewerGuide?: string;
}

export interface ApplicantScreeningResult {
  questions: ScreeningQuestion[];
  suggestedDurationMinutes: number;
  complianceNotes: string[];
}
