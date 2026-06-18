import { fetchAPI } from "@/services/api";
import type { User } from "../type";
import {
  buildCustomerSummary,
  buildLoyaltySummary,
  buildOrdersSummary,
  buildReturnsSummary,
  buildWalletSummary,
} from "./buildCustomerProfileContext";

export interface CustomerProfileContextPayload {
  customerSummary: string;
  ordersSummary?: string;
  returnsSummary?: string;
  walletSummary?: string;
  loyaltySummary?: string;
}

async function fetchOrdersSummary(user: User): Promise<string> {
  try {
    const response = await fetchAPI(`/orders/user/${user.id}?limit=10&page=1`);
    const orders = response.data?.orders;
    if (!response.success || !Array.isArray(orders)) return "";
    return buildOrdersSummary(orders);
  } catch {
    return "";
  }
}

async function fetchReturnsSummary(user: User): Promise<string> {
  try {
    const params = new URLSearchParams({
      search: user.email,
      limit: "5",
      page: "1",
    });
    const response = await fetchAPI(`/returns?${params.toString()}`);
    const returns = response.data?.data;
    if (!response.success || !Array.isArray(returns)) return "";
    return buildReturnsSummary(returns);
  } catch {
    return "";
  }
}

async function fetchWalletSummary(userId: string): Promise<string> {
  try {
    const response = await fetchAPI(`/finance/wallet/${userId}`);
    if (!response.success || !response.data) return "";
    return buildWalletSummary(response.data);
  } catch {
    return "";
  }
}

async function fetchLoyaltySummary(userId: string): Promise<string> {
  try {
    const response = await fetchAPI(`/marketing/loyalty/history/${userId}`);
    if (!response.success || !Array.isArray(response.data) || response.data.length === 0) {
      return "";
    }
    return buildLoyaltySummary(response.data);
  } catch {
    return "";
  }
}

export async function gatherCustomerProfileContext(
  user: User,
): Promise<CustomerProfileContextPayload> {
  const [ordersSummary, returnsSummary, walletSummary, loyaltySummary] = await Promise.all([
    fetchOrdersSummary(user),
    fetchReturnsSummary(user),
    fetchWalletSummary(user.id),
    fetchLoyaltySummary(user.id),
  ]);

  return {
    customerSummary: buildCustomerSummary(user),
    ordersSummary: ordersSummary || undefined,
    returnsSummary: returnsSummary || undefined,
    walletSummary: walletSummary || undefined,
    loyaltySummary: loyaltySummary || undefined,
  };
}
