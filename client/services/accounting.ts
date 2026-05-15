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
