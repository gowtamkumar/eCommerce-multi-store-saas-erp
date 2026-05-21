import { fetchAPI } from "./api";

export interface WalletTransaction {
  id: string;
  type: string;
  amount: number;
  balanceAfter: number;
  currency: string;
  referenceType?: string;
  referenceId?: string;
  note?: string;
  createdAt: string;
}

export interface WalletSummary {
  balance: number;
  history: WalletTransaction[];
}

/**
 * Storefront: Fetches the logged-in customer's own wallet balance + history.
 * Uses GET /store/wallet/me — no admin permission required.
 */
export async function getMyWallet(): Promise<WalletSummary> {
  const res = await fetchAPI(`/store/wallet/me`);
  if (!res.success) {
    throw new Error(res.message || "Failed to fetch wallet summary");
  }
  return res.data;
}

/**
 * Admin: Fetches the wallet balance and ledger history for a given customer.
 * Requires ACCOUNTING_READ permission.
 */
export async function getCustomerWallet(customerId: string): Promise<WalletSummary> {
  const res = await fetchAPI(`/finance/wallet/${customerId}`);
  if (!res.success) {
    throw new Error(res.message || "Failed to fetch wallet summary");
  }
  return res.data;
}

/**
 * Manually credits a customer's wallet.
 */
export async function manualCreditWallet(customerId: string, amount: number, note?: string): Promise<any> {
  const res = await fetchAPI("/finance/wallet/credit", {
    method: "POST",
    body: JSON.stringify({ customerId, amount, note }),
  });
  if (!res.success) {
    throw new Error(res.message || "Failed to credit wallet");
  }
  return res.data;
}

/**
 * Manually debits a customer's wallet.
 */
export async function manualDebitWallet(customerId: string, amount: number, note?: string): Promise<any> {
  const res = await fetchAPI("/finance/wallet/debit", {
    method: "POST",
    body: JSON.stringify({ customerId, amount, note }),
  });
  if (!res.success) {
    throw new Error(res.message || "Failed to debit wallet");
  }
  return res.data;
}
