import { fetchAPI } from "./api";

export interface LoyaltyLedgerEntry {
  id: string;
  type: string;
  points: number;
  balanceAfter: number;
  referenceType?: string;
  referenceId?: string;
  note?: string;
  createdAt: string;
}

export interface LoyaltyConfig {
  id?: string;
  isEnabled: boolean;
  pointsPerCurrencySpent: number;
  pointsRequiredPerCurrencyDiscount: number;
  silverTierThreshold: number;
  goldTierThreshold: number;
  platinumTierThreshold: number;
  silverMultiplier: number;
  goldMultiplier: number;
  platinumMultiplier: number;
  referralRewardType: "WALLET" | "POINTS";
  referralRewardAmount: number;
  refereeMinPurchase: number;
}

export interface MyLoyaltySummary {
  pointsBalance: number;
  currencyValue: number;
  membershipTier: string;
  referralCode: string;
  history: LoyaltyLedgerEntry[];
  rules: {
    pointsRequiredPerCurrencyDiscount: number;
    pointsPerCurrencySpent: number;
  };
}

/**
 * Storefront: Fetches the logged-in customer's own loyalty summary (tier, balance, history).
 */
export async function getMyLoyalty(): Promise<MyLoyaltySummary> {
  const res = await fetchAPI(`/store/loyalty/me`);
  if (!res.success) {
    throw new Error(res.message || "Failed to fetch loyalty profile");
  }
  return res.data;
}

/**
 * Admin: Fetch current tenant's loyalty configurations.
 */
export async function getLoyaltyConfig(): Promise<LoyaltyConfig> {
  const res = await fetchAPI(`/marketing/loyalty/config`);
  if (!res.success) {
    throw new Error(res.message || "Failed to fetch loyalty config");
  }
  return res.data;
}

/**
 * Admin: Update loyalty configurations.
 */
export async function updateLoyaltyConfig(dto: Partial<LoyaltyConfig>): Promise<LoyaltyConfig> {
  const res = await fetchAPI(`/marketing/loyalty/config`, {
    method: "PUT",
    body: JSON.stringify(dto),
  });
  if (!res.success) {
    throw new Error(res.message || "Failed to update loyalty config");
  }
  return res.data;
}

/**
 * Admin: Fetch point history ledger for a specific customer.
 */
export async function getCustomerLoyaltyHistory(customerId: string): Promise<LoyaltyLedgerEntry[]> {
  const res = await fetchAPI(`/marketing/loyalty/history/${customerId}`);
  if (!res.success) {
    throw new Error(res.message || "Failed to fetch customer loyalty ledger");
  }
  return res.data;
}

/**
 * Admin: Manually credit loyalty points.
 */
export async function manualCreditPoints(customerId: string, points: number, note: string): Promise<any> {
  const res = await fetchAPI(`/marketing/loyalty/credit`, {
    method: "POST",
    body: JSON.stringify({ customerId, points, note }),
  });
  if (!res.success) {
    throw new Error(res.message || "Failed to manually credit points");
  }
  return res.data;
}

/**
 * Admin: Manually debit loyalty points.
 */
export async function manualDebitPoints(customerId: string, points: number, note: string): Promise<any> {
  const res = await fetchAPI(`/marketing/loyalty/debit`, {
    method: "POST",
    body: JSON.stringify({ customerId, points, note }),
  });
  if (!res.success) {
    throw new Error(res.message || "Failed to manually debit points");
  }
  return res.data;
}

export interface LoyaltyRule {
  id?: string;
  name: string;
  type: "CATEGORY_MULTIPLIER" | "MIN_SPEND_BONUS" | "WEEKEND_MULTIPLIER";
  value: number;
  conditions: Record<string, any>;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
}

/**
 * Admin: Fetch all loyalty rules for the current tenant.
 */
export async function getLoyaltyRules(): Promise<LoyaltyRule[]> {
  const res = await fetchAPI(`/marketing/loyalty/rules`);
  if (!res.success) {
    throw new Error(res.message || "Failed to fetch loyalty rules");
  }
  return res.data;
}

/**
 * Admin: Create a new loyalty rule.
 */
export async function createLoyaltyRule(dto: Partial<LoyaltyRule>): Promise<LoyaltyRule> {
  const res = await fetchAPI(`/marketing/loyalty/rules`, {
    method: "POST",
    body: JSON.stringify(dto),
  });
  if (!res.success) {
    throw new Error(res.message || "Failed to create loyalty rule");
  }
  return res.data;
}

/**
 * Admin: Update an existing loyalty rule.
 */
export async function updateLoyaltyRule(id: string, dto: Partial<LoyaltyRule>): Promise<LoyaltyRule> {
  const res = await fetchAPI(`/marketing/loyalty/rules/${id}`, {
    method: "PUT",
    body: JSON.stringify(dto),
  });
  if (!res.success) {
    throw new Error(res.message || "Failed to update loyalty rule");
  }
  return res.data;
}

/**
 * Admin: Delete a loyalty rule.
 */
export async function deleteLoyaltyRule(id: string): Promise<any> {
  const res = await fetchAPI(`/marketing/loyalty/rules/${id}`, {
    method: "DELETE",
  });
  if (!res.success) {
    throw new Error(res.message || "Failed to delete loyalty rule");
  }
  return res.data;
}

