import type {
  KpiMetric,
  PerformanceEmployee,
  PerformanceReviewForm,
} from "../hooks/usePerformanceManager";

export type PerformanceReviewFocus = "balanced" | "strengths" | "development";

function getScoreBand(score: number): string {
  if (score >= 4.5) return "exceptional (4.5-5.0)";
  if (score >= 3.5) return "strong (3.5-4.4)";
  if (score >= 2.5) return "meets expectations (2.5-3.4)";
  return "needs improvement (below 2.5)";
}

function buildKpiSummary(kpiRows: KpiMetric[]): string {
  const rows = kpiRows.filter((row) => row.metric_name.trim());
  if (!rows.length) return "KPI metrics: none specified";

  const lines = ["KPI metrics (no employee identifiers):"];
  rows.forEach((row, index) => {
    const target = Number(row.target) || 0;
    const achieved = Number(row.achieved) || 0;
    const attainment =
      target > 0 ? `${Math.round((achieved / target) * 100)}% of target` : "target not set";
    lines.push(`${index + 1}. ${row.metric_name.trim()} — achieved ${achieved}, target ${target} (${attainment})`);
  });
  return lines.join("\n");
}

export function buildPerformanceReviewSummary(
  form: PerformanceReviewForm,
  employees: PerformanceEmployee[],
): string {
  const employee = employees.find((item) => item.id === form.employeeId);
  const department = employee?.department?.name || "Unspecified department";
  const role = employee?.designation?.name || "Unspecified role";

  return [
    "Context: performance review phrase bank (PII minimized)",
    "Employee identifiers: excluded intentionally",
    `Department: ${department}`,
    `Role / designation: ${role}`,
    form.reviewPeriod.trim() ? `Review period: ${form.reviewPeriod.trim()}` : "Review period: unspecified",
    `Overall score: ${form.score} / 5 (${getScoreBand(form.score)})`,
    buildKpiSummary(form.kpiRows),
  ].join("\n");
}

export function buildPerformanceReviewPhrasesPayload(
  reviewSummary: string,
  focus: PerformanceReviewFocus = "balanced",
  existingDraft?: string,
) {
  return {
    reviewSummary,
    focus,
    existingDraft: existingDraft?.trim() || undefined,
  };
}
