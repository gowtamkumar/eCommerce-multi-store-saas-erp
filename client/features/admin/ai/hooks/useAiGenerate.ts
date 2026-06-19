"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { fetchAPI } from "@/services/api";
import type {
  CampaignCopyResult,
  CatalogContentResult,
  FaqContentResult,
  LoyaltyProgramCopyResult,
  LoyaltyRuleCopyResult,
  LeadFollowUpIntent,
  LeadFollowUpResult,
  OrderAssistContext,
  OrderAssistResult,
  OrderEmailTemplate,
  ReturnAssistResult,
  ReturnLetterTemplate,
  SupportReplyResult,
  CustomerProfileResult,
  ReviewAssistResult,
  AbandonedCartMessageResult,
  AbandonedCartMessageTemplate,
  PriceBookRationaleResult,
  MediaAssistResult,
  InventoryAnomalyResult,
  StockTransferReasonResult,
  CycleCountVarianceResult,
  PackingSlipNotesResult,
  BatchWasteReductionResult,
  RequisitionJustificationResult,
  PoCoverLetterResult,
  GrnDiscrepancyNotesResult,
  InvoiceOcrResult,
  DebitNoteDisputeResult,
  SupplierProfileSummaryResult,
  ArCollectionDraftResult,
  MarketingDescriptionResult,
  PageSeoResult,
  PageBlockContentResult,
  PageBlockType,
  ProductContentResult,
  StoreSeoResult,
} from "../types/ai-studio";

export function useAiGenerate() {
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  const checkStatus = useCallback(async () => {
    try {
      const res = await fetchAPI("/ai/status");
      setConfigured(!!res.data?.configured);
    } catch {
      setConfigured(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void checkStatus();
    }, 0);
    return () => clearTimeout(timer);
  }, [checkStatus]);

  const withGenerate = async <T>(endpoint: string, payload: unknown): Promise<T | null> => {
    setLoading(true);
    try {
      const res = await fetchAPI(endpoint, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return res.data ?? null;
    } catch {
      toast.error("AI generation failed. Check Settings → AI Configuration.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const generateProductContent = (payload: {
    productName: string;
    keywords?: string;
    existingDescription?: string;
    tone?: string;
  }) => withGenerate<ProductContentResult>("/ai/generate/product-content", payload);

  const generateCatalogContent = (payload: {
    entityType: "category" | "brand";
    name: string;
    context?: string;
    keywords?: string;
    existingDescription?: string;
    tone?: string;
  }) => withGenerate<CatalogContentResult>("/ai/generate/catalog-content", payload);

  const generateCampaignCopy = (payload: {
    campaignName: string;
    audience?: string;
    offerDetails?: string;
    channel?: "email" | "sms" | "both" | "push";
    tone?: string;
  }) => withGenerate<CampaignCopyResult>("/ai/generate/campaign-copy", payload);

  const generateFaq = (payload: { topic: string; category?: string; tone?: string }) =>
    withGenerate<FaqContentResult>("/ai/generate/faq", payload);

  const generatePageSeo = (payload: {
    pageTitle: string;
    keywords?: string;
    tone?: string;
  }) => withGenerate<PageSeoResult>("/ai/generate/page-seo", payload);

  const generateStoreSeo = (payload: {
    brandName: string;
    keywords?: string;
    existingDescription?: string;
    tone?: string;
  }) => withGenerate<StoreSeoResult>("/ai/generate/store-seo", payload);

  const generatePageBlockContent = (payload: {
    blockType: PageBlockType;
    pageTitle?: string;
    topic?: string;
    keywords?: string;
    existingText?: string;
    tone?: string;
  }) => withGenerate<PageBlockContentResult>("/ai/generate/page-block-content", payload);

  const generateMarketingDescription = (payload: {
    name: string;
    offerSummary?: string;
    context?: "coupon" | "promotion";
    tone?: string;
  }) => withGenerate<MarketingDescriptionResult>("/ai/generate/marketing-description", payload);

  const generateLoyaltyCopy = (payload: {
    context: "program" | "rule";
    offerSummary?: string;
    ruleType?: string;
    tone?: string;
  }) =>
    withGenerate<LoyaltyProgramCopyResult | LoyaltyRuleCopyResult>(
      "/ai/generate/loyalty-copy",
      payload,
    );

  const generateLeadFollowUp = (payload: {
    leadName: string;
    leadEmail: string;
    subject?: string;
    message?: string;
    status?: string;
    intent?: LeadFollowUpIntent;
    brandName?: string;
    tone?: string;
  }) => withGenerate<LeadFollowUpResult>("/ai/generate/lead-follow-up", payload);

  const generateOrderAssist = (payload: {
    context: OrderAssistContext;
    orderSummary: string;
    customerName: string;
    customerEmail?: string;
    orderStatus: string;
    paymentStatus?: string;
    emailTemplate?: OrderEmailTemplate;
    tone?: string;
  }) => withGenerate<OrderAssistResult>("/ai/generate/order-assist", payload);

  const generateReturnAssist = (payload: {
    returnSummary: string;
    customerName: string;
    customerEmail?: string;
    returnStatus: string;
    returnType?: string;
    refundMethod?: string;
    letterTemplate?: ReturnLetterTemplate;
    tone?: string;
  }) => withGenerate<ReturnAssistResult>("/ai/generate/return-assist", payload);

  const generateSupportReply = (payload: {
    conversationSummary: string;
    customerName: string;
    customerEmail?: string;
    faqSummary?: string;
    orderSummary?: string;
    tone?: string;
  }) => withGenerate<SupportReplyResult>("/ai/generate/support-reply", payload);

  const generateCustomerProfile = (payload: {
    customerSummary: string;
    ordersSummary?: string;
    returnsSummary?: string;
    walletSummary?: string;
    loyaltySummary?: string;
    tone?: string;
  }) => withGenerate<CustomerProfileResult>("/ai/generate/customer-profile", payload);

  const generateReviewAssist = (payload: {
    reviewSummary: string;
    reviewerName: string;
    rating: number;
    reviewStatus?: string;
    productName?: string;
    tone?: string;
  }) => withGenerate<ReviewAssistResult>("/ai/generate/review-assist", payload);

  const generateAbandonedCartMessage = (payload: {
    cartSummary: string;
    customerName: string;
    customerEmail?: string;
    customerPhone?: string;
    messageTemplate?: AbandonedCartMessageTemplate;
    brandName?: string;
    tone?: string;
  }) => withGenerate<AbandonedCartMessageResult>("/ai/generate/abandoned-cart-message", payload);

  const generatePriceBookRationale = (payload: {
    priceBookSummary: string;
    catalogSummary?: string;
    tone?: string;
  }) => withGenerate<PriceBookRationaleResult>("/ai/generate/price-book-rationale", payload);

  const generateMediaAssist = (payload: {
    mediaSummary: string;
    filename: string;
    mimetype?: string;
    imageUrl?: string;
    useVision?: boolean;
    contextHint?: string;
    tone?: string;
  }) => withGenerate<MediaAssistResult>("/ai/generate/media-assist", payload);

  const generateInventoryAnomaly = (payload: {
    statsSummary: string;
    stockSummary: string;
    recentMovementsSummary?: string;
    activeFilter?: string;
    tone?: string;
  }) => withGenerate<InventoryAnomalyResult>("/ai/generate/inventory-anomaly", payload);

  const generateStockTransferReason = (payload: {
    transferSummary: string;
    existingRemarks?: string;
    tone?: string;
  }) => withGenerate<StockTransferReasonResult>("/ai/generate/stock-transfer-reason", payload);

  const generateCycleCountVariance = (payload: {
    countSummary: string;
    varianceSummary: string;
    recentMovementsSummary?: string;
    tone?: string;
  }) => withGenerate<CycleCountVarianceResult>("/ai/generate/cycle-count-variance", payload);

  const generatePackingSlipNotes = (payload: {
    fulfillmentSummary: string;
    orderSummary?: string;
    tone?: string;
  }) => withGenerate<PackingSlipNotesResult>("/ai/generate/packing-slip-notes", payload);

  const generateBatchWasteReduction = (payload: {
    statsSummary: string;
    batchSummary: string;
    activeFilter?: string;
    tone?: string;
  }) => withGenerate<BatchWasteReductionResult>("/ai/generate/batch-waste-reduction", payload);

  const generateRequisitionJustification = (payload: {
    requisitionSummary: string;
    existingJustification?: string;
    tone?: string;
  }) => withGenerate<RequisitionJustificationResult>("/ai/generate/requisition-justification", payload);

  const generatePoCoverLetter = (payload: {
    purchaseOrderSummary: string;
    existingCoverLetter?: string;
    tone?: string;
  }) => withGenerate<PoCoverLetterResult>("/ai/generate/po-cover-letter", payload);

  const generateGrnDiscrepancyNotes = (payload: {
    grnSummary: string;
    discrepancySummary: string;
    existingNotes?: string;
    tone?: string;
  }) => withGenerate<GrnDiscrepancyNotesResult>("/ai/generate/grn-discrepancy-notes", payload);

  const generateInvoiceOcr = (payload: {
    invoiceSummary: string;
    invoiceText?: string;
    imageUrl?: string;
    mimetype?: string;
    useVision?: boolean;
    poContextSummary?: string;
  }) => withGenerate<InvoiceOcrResult>("/ai/generate/invoice-ocr", payload);

  const generateDebitNoteDispute = (payload: {
    debitNoteSummary: string;
    existingDisputeLetter?: string;
    tone?: string;
  }) => withGenerate<DebitNoteDisputeResult>("/ai/generate/debit-note-dispute", payload);

  const generateSupplierProfileSummary = (payload: {
    supplierSummary: string;
    existingSummary?: string;
    tone?: string;
  }) => withGenerate<SupplierProfileSummaryResult>("/ai/generate/supplier-profile-summary", payload);

  const generateArCollectionDraft = (payload: {
    customerSummary: string;
    overdueInvoicesSummary: string;
    existingDraft?: string;
    tone?: string;
  }) => withGenerate<ArCollectionDraftResult>("/ai/generate/ar-collection-draft", payload);

  return {
    configured,
    loading,
    refreshStatus: checkStatus,
    generateProductContent,
    generateCatalogContent,
    generateCampaignCopy,
    generateFaq,
    generatePageSeo,
    generateStoreSeo,
    generatePageBlockContent,
    generateMarketingDescription,
    generateLoyaltyCopy,
    generateLeadFollowUp,
    generateOrderAssist,
    generateReturnAssist,
    generateSupportReply,
    generateCustomerProfile,
    generateReviewAssist,
    generateAbandonedCartMessage,
    generatePriceBookRationale,
    generateMediaAssist,
    generateInventoryAnomaly,
    generateStockTransferReason,
    generateCycleCountVariance,
    generatePackingSlipNotes,
    generateBatchWasteReduction,
    generateRequisitionJustification,
    generatePoCoverLetter,
    generateGrnDiscrepancyNotes,
    generateInvoiceOcr,
    generateDebitNoteDispute,
    generateSupplierProfileSummary,
    generateArCollectionDraft,
  };
}
