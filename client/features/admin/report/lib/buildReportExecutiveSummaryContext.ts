import type {
  CashFlowData,
  FinanceDashboardData,
  ProfitLossData,
} from "../types";

export type ReportExecutiveSummaryType = "profit-loss" | "finance-summary" | "cash-flow";

function formatReportDate(value: string | Date | undefined): string {
  if (!value) return "unknown";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toISOString().slice(0, 10);
}

function formatAmount(value: number | undefined | null): string {
  if (value === undefined || value === null || Number.isNaN(Number(value))) return "0";
  return Number(value).toFixed(2);
}

function formatPercent(value: number | undefined | null): string {
  if (value === undefined || value === null || Number.isNaN(Number(value))) return "0.00";
  return Number(value).toFixed(2);
}

export function buildProfitLossReportSummary(data: ProfitLossData | null | undefined): string {
  if (!data) return "No profit and loss report data loaded.";

  const lines = [
    "Context: profit and loss report",
    `Period: ${formatReportDate(data.period?.startDate)} to ${formatReportDate(data.period?.endDate)}`,
    "",
    "Revenue:",
    `- Total revenue: ${formatAmount(data.revenue?.total)}`,
    `- Order count: ${data.revenue?.orderCount ?? 0}`,
    "",
    "Cost of goods sold:",
    `- COGS total: ${formatAmount(data.cogs?.total)}`,
    `- Purchase order count: ${data.cogs?.purchaseOrderCount ?? 0}`,
    "",
    "Profitability:",
    `- Gross profit: ${formatAmount(data.grossProfit)}`,
    `- Net profit: ${formatAmount(data.netProfit)}`,
    `- Profit margin (%): ${formatPercent(data.profitMargin)}`,
    "",
    "Operating expenses:",
    `- Total operating expenses: ${formatAmount(data.operatingExpenses?.total)}`,
  ];

  if (data.operatingExpenses?.breakdown?.length) {
    lines.push("- Breakdown by category:");
    data.operatingExpenses.breakdown.forEach((item) => {
      lines.push(`  • ${item.category}: ${formatAmount(item.amount)}`);
    });
  } else {
    lines.push("- Breakdown by category: none recorded");
  }

  return lines.join("\n");
}

export function buildFinanceSummaryReportSummary(
  data: FinanceDashboardData | null | undefined,
): string {
  if (!data) return "No finance summary report data loaded.";

  const lines = [
    "Context: finance summary dashboard",
    "",
    "KPIs:",
    `- Total revenue: ${formatAmount(data.kpis?.totalRevenue)}`,
    `- Total expenses: ${formatAmount(data.kpis?.totalExpenses)}`,
    `- Net profit: ${formatAmount(data.kpis?.netProfit)}`,
    `- Margin (%): ${formatPercent(data.kpis?.margin)}`,
    `- Amount due to suppliers: ${formatAmount(data.kpis?.totalAmountDue)}`,
    "",
    "Supplier stats:",
    `- Total suppliers: ${data.supplierStats?.totalSuppliers ?? 0}`,
    `- Total purchase orders: ${data.supplierStats?.totalPurchaseOrders ?? 0}`,
  ];

  if (data.chartData?.length) {
    lines.push("", "Monthly trend (last 6 months):");
    data.chartData.forEach((point) => {
      lines.push(
        `- ${point.name}: revenue ${formatAmount(point.revenue)}, expense ${formatAmount(point.expense)}, profit ${formatAmount(typeof point.profit === "number" ? point.profit : Number(point.revenue) - Number(point.expense))}`,
      );
    });
  }

  if (data.expenseBreakdown?.length) {
    lines.push("", "Expense breakdown:");
    data.expenseBreakdown.forEach((item) => {
      lines.push(`- ${item.name}: ${formatAmount(item.value)}`);
    });
  }

  return lines.join("\n");
}

export function buildCashFlowReportSummary(data: CashFlowData | null | undefined): string {
  if (!data) return "No cash flow report data loaded.";

  const lines = [
    "Context: cash flow report (last 30 days)",
    "",
    "Summary:",
    `- Total inflow: ${formatAmount(data.summary?.totalInflow)}`,
    `- Total outflow: ${formatAmount(data.summary?.totalOutflow)}`,
    `- Net cash flow: ${formatAmount(data.summary?.netCashFlow)}`,
  ];

  if (data.chartData?.length) {
    const activeDays = data.chartData.filter(
      (point) => Number(point.inflow) > 0 || Number(point.outflow) > 0,
    );
    lines.push("", `Daily activity: ${activeDays.length} days with movement (of ${data.chartData.length} days)`);

    const topInflowDays = [...data.chartData]
      .sort((a, b) => Number(b.inflow) - Number(a.inflow))
      .slice(0, 3)
      .filter((point) => Number(point.inflow) > 0);
    if (topInflowDays.length) {
      lines.push("Top inflow days:");
      topInflowDays.forEach((point) => {
        lines.push(`- ${point.displayDate || point.date}: inflow ${formatAmount(point.inflow)}`);
      });
    }
  }

  if (data.recentMovements?.length) {
    lines.push("", "Recent movements (latest 10):");
    data.recentMovements.forEach((movement, index) => {
      lines.push(
        `${index + 1}. ${formatReportDate(movement.date)} | ${movement.type} | ${movement.category} | ${formatAmount(movement.amount)} | ref ${movement.reference || "n/a"}`,
      );
    });
  }

  return lines.join("\n");
}

export function buildReportExecutiveSummaryPayload(
  reportType: ReportExecutiveSummaryType,
  reportSummary: string,
  existingDraft?: string,
) {
  return {
    reportType,
    reportSummary,
    existingDraft: existingDraft?.trim() || undefined,
  };
}
