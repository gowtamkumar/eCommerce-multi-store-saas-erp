import { fetchAPI } from "./api";

export async function initializeAccounting() {
  return fetchAPI("/finance/accounting/init", { method: "POST" });
}

export async function getProfitAndLoss(params?: { startDate?: string; endDate?: string }) {
  const query = params ? '?' + new URLSearchParams(params).toString() : '';
  return fetchAPI(`/finance/accounting/reports/profit-loss${query}`);
}

export async function getBalanceSheet(params?: { asOfDate?: string }) {
  const query = params ? '?' + new URLSearchParams(params).toString() : '';
  return fetchAPI(`/finance/accounting/reports/balance-sheet${query}`);
}

export async function getCashFlow(params?: { startDate?: string; endDate?: string }) {
  const query = params ? '?' + new URLSearchParams(params).toString() : '';
  return fetchAPI(`/finance/accounting/reports/cash-flow${query}`);
}

export async function getAccounts() {
  return fetchAPI("/finance/accounting/accounts");
}

export async function createAccount(data: { code: string; name: string; type: string; category: string }) {
  return fetchAPI("/finance/accounting/accounts", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateAccount(id: string, data: { name: string; type: string; category: string }) {
  return fetchAPI(`/finance/accounting/accounts/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteAccount(id: string) {
  return fetchAPI(`/finance/accounting/accounts/${id}`, {
    method: "DELETE",
  });
}

export async function getFiscalPeriods() {
  return fetchAPI("/finance/accounting/fiscal-periods");
}

export async function createFiscalPeriod(data: { name: string; startDate: string; endDate: string }) {
  return fetchAPI("/finance/accounting/fiscal-periods", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateFiscalPeriodStatus(id: string, status: string) {
  return fetchAPI(`/finance/accounting/fiscal-periods/${id}/status`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
}

export async function getJournalEntries() {
  return fetchAPI("/finance/accounting/journal-entries");
}

export async function createJournalEntry(data: {
  date?: string;
  type: string;
  description: string;
  referenceType?: string;
  referenceId?: string;
  lines: { accountCode: string; side: "DEBIT" | "CREDIT"; amount: number }[];
}) {
  return fetchAPI("/finance/accounting/journal-entries", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function reverseJournalEntry(id: string) {
  return fetchAPI(`/finance/accounting/journal-entries/${id}/reverse`, {
    method: "POST",
  });
}

export async function initializeTaxRules() {
  return fetchAPI("/finance/tax/init", { method: "POST" });
}

export async function getTaxRules() {
  return fetchAPI("/finance/tax/rules");
}

export async function createTaxRule(data: { name: string; rate: number; country: string; state?: string; category: string }) {
  return fetchAPI("/finance/tax/rules", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateTaxRule(id: string, data: { name: string; rate: number; isActive: boolean }) {
  return fetchAPI(`/finance/tax/rules/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteTaxRule(id: string) {
  return fetchAPI(`/finance/tax/rules/${id}`, {
    method: "DELETE",
  });
}

export async function calculateTax(data: { country: string; state?: string; category?: string; baseAmount: number }) {
  return fetchAPI("/finance/tax/calculate", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getTaxFiling(params?: { startDate?: string; endDate?: string }) {
  const query = params ? '?' + new URLSearchParams(params).toString() : '';
  return fetchAPI(`/finance/tax/filing${query}`);
}
