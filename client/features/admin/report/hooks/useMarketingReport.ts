"use client";

import { fetchAPI } from "@/services/api";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { buildMarketingCsv, downloadCsv } from "../lib/marketing";
import type {
  LoyaltyConfig,
  LoyaltyRule,
  MarketingCampaign,
  MarketingCoupon,
  MarketingCustomer,
  MarketingDiscountTotals,
  MarketingMetrics,
  MarketingOrder,
} from "../types";

// Server caps `limit` at 100 - walk pages until we have everything (capped at
// 10k orders / 100 pages so a runaway store doesn't freeze the page).
async function fetchAllOrders(): Promise<MarketingOrder[]> {
  const PAGE_SIZE = 100;
  const PAGE_HARD_CAP = 100;
  const collected: MarketingOrder[] = [];
  let page = 1;
  let totalPages = 1;

  do {
    try {
      const res = await fetchAPI(`/orders?page=${page}&limit=${PAGE_SIZE}`);
      if (!res?.success) break;
      const chunk = res.data?.orders || res.data || [];
      collected.push(...chunk);
      totalPages = res.data?.totalPages ?? 1;
    } catch {
      break;
    }
    page += 1;
  } while (page <= totalPages && page <= PAGE_HARD_CAP);

  return collected;
}

export function useMarketingReport() {
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
  const [coupons, setCoupons] = useState<MarketingCoupon[]>([]);
  const [orders, setOrders] = useState<MarketingOrder[]>([]);
  const [loyaltyConfig, setLoyaltyConfig] = useState<LoyaltyConfig | null>(
    null,
  );
  const [loyaltyRules, setLoyaltyRules] = useState<LoyaltyRule[]>([]);
  const [customers, setCustomers] = useState<MarketingCustomer[]>([]);
  const [subscribersCount, setSubscribersCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [campaignSearch, setCampaignSearch] = useState("");
  const [couponSearch, setCouponSearch] = useState("");

  const loadMarketingData = useCallback(async () => {
    setLoading(true);
    try {
      const [
        campaignsRes,
        couponsRes,
        subscribersRes,
        allOrders,
        loyaltyConfigRes,
        loyaltyRulesRes,
        customersRes,
      ] = await Promise.all([
        fetchAPI("/campaigns").catch(() => ({ success: false, data: [] })),
        fetchAPI("/coupons").catch(() => ({
          success: false,
          data: { coupons: [] },
        })),
        fetchAPI("/subscribers?limit=1").catch(() => ({
          success: false,
          meta: { total: 0 },
        })),
        fetchAllOrders().catch(() => [] as MarketingOrder[]),
        fetchAPI("/marketing/loyalty/config").catch(() => ({
          success: false,
          data: null,
        })),
        fetchAPI("/marketing/loyalty/rules").catch(() => ({
          success: false,
          data: [],
        })),
        fetchAPI("/customer?limit=100").catch(() => ({
          success: false,
          data: { items: [] },
        })),
      ]);

      if (campaignsRes.success) setCampaigns(campaignsRes.data || []);
      if (couponsRes.success)
        setCoupons(couponsRes.data?.coupons || couponsRes.data || []);
      if (subscribersRes.success)
        setSubscribersCount(
          subscribersRes.meta?.total || subscribersRes.total || 0,
        );
      setOrders(allOrders);
      if (loyaltyConfigRes.success) setLoyaltyConfig(loyaltyConfigRes.data);
      if (loyaltyRulesRes.success) setLoyaltyRules(loyaltyRulesRes.data || []);
      if (customersRes.success) setCustomers(customersRes.data?.items || []);
    } catch (error) {
      console.error("Failed to load marketing dashboard details", error);
      toast.error("Failed to load marketing metrics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadMarketingData();
  }, [loadMarketingData]);

  const filteredCampaigns = useMemo(() => {
    const query = campaignSearch.toLowerCase();
    return campaigns.filter((c) => c.name.toLowerCase().includes(query));
  }, [campaigns, campaignSearch]);

  const filteredCoupons = useMemo(() => {
    const query = couponSearch.toLowerCase();
    return coupons.filter((c) => c.code.toLowerCase().includes(query));
  }, [coupons, couponSearch]);

  const financialDiscounts = useMemo<MarketingDiscountTotals>(() => {
    let couponDiscountTotal = 0;
    let promoDiscountTotal = 0;

    orders.forEach((order) => {
      couponDiscountTotal +=
        parseFloat(String(order.couponDiscountAmount)) || 0;

      if (Array.isArray(order.items)) {
        order.items.forEach((item) => {
          const itemPromoDiscount =
            parseFloat(String(item.discountAmount)) || 0;
          promoDiscountTotal += itemPromoDiscount * (item.quantity || 1);
        });
      }
    });

    return {
      couponDiscountTotal,
      promoDiscountTotal,
      totalSaved: couponDiscountTotal + promoDiscountTotal,
    };
  }, [orders]);

  const metrics = useMemo<MarketingMetrics>(() => {
    const totalSent = campaigns.reduce((sum, c) => sum + (c.sentCount || 0), 0);
    const totalFailed = campaigns.reduce(
      (sum, c) => sum + (c.failedCount || 0),
      0,
    );
    const totalReach = campaigns.reduce(
      (sum, c) => sum + (c.totalAudience || 0),
      0,
    );
    const attempts = totalSent + totalFailed;

    return {
      totalCampaigns: campaigns.length,
      totalReach,
      deliverySuccessRate: attempts > 0 ? (totalSent / attempts) * 100 : 100,
      totalCoupons: coupons.length,
      activeCoupons: coupons.filter((c) => c.isActive).length,
      totalRedemptions: coupons.reduce((sum, c) => sum + (c.usedCount || 0), 0),
      totalPointsHeld: customers.reduce(
        (sum, cust) => sum + (cust.loyaltyPointsBalance || 0),
        0,
      ),
    };
  }, [campaigns, coupons, customers]);

  const topLoyalCustomers = useMemo(() => {
    return [...customers]
      .sort(
        (a, b) => (b.loyaltyPointsBalance || 0) - (a.loyaltyPointsBalance || 0),
      )
      .slice(0, 5);
  }, [customers]);

  const exportCsv = useCallback(() => {
    try {
      const csv = buildMarketingCsv(campaigns, coupons);
      downloadCsv(csv, "unified-marketing-performance-report.csv");
      toast.success("Unified marketing report exported");
    } catch (error) {
      console.error("Failed to export unified report", error);
      toast.error("Failed to export report");
    }
  }, [campaigns, coupons]);

  const canExport = campaigns.length > 0 || coupons.length > 0;

  return {
    loading,
    campaigns,
    coupons,
    loyaltyConfig,
    loyaltyRules,
    subscribersCount,
    campaignSearch,
    couponSearch,
    setCampaignSearch,
    setCouponSearch,
    filteredCampaigns,
    filteredCoupons,
    financialDiscounts,
    metrics,
    topLoyalCustomers,
    canExport,
    loadMarketingData,
    exportCsv,
  };
}
