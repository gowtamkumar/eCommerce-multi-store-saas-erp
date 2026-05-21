import { fetchAPI } from "./api";

export async function initializeAccounting() {
  return fetchAPI("/finance/accounting/init", { method: "POST" });
}

export async function getProfitAndLoss() {
  return fetchAPI("/finance/accounting/reports/profit-loss");
}

export async function getBalanceSheet() {
  return fetchAPI("/finance/accounting/reports/balance-sheet");
}

export async function getCashFlow() {
  return fetchAPI("/finance/accounting/reports/cash-flow");
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
