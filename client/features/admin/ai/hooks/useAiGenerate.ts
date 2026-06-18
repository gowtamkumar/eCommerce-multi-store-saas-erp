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
  };
}
