import type { TaxRule, TaxRuleFormData } from "../types";

function formatRate(rate: number | string | undefined): string {
  if (rate === undefined || rate === null || rate === "") return "unknown";
  return `${Number(rate)}%`;
}

export function buildTaxRuleSummary(rule: Pick<TaxRule, "name" | "rate" | "country" | "state" | "category" | "isActive" | "isSystem">): string {
  return [
    "Context: store tax rule",
    `Name: ${rule.name}`,
    `Rate: ${formatRate(rule.rate)}`,
    `Country: ${rule.country}`,
    `State / region: ${rule.state || "National (no state)"}`,
    `Category: ${rule.category}`,
    `Active: ${rule.isActive ? "yes" : "no"}`,
    `System rule: ${rule.isSystem ? "yes (locked)" : "no (custom)"}`,
  ].join("\n");
}

export function buildTaxRuleFormSummary(form: TaxRuleFormData): string {
  return [
    "Context: tax rule being configured (not yet saved)",
    `Name: ${form.name || "unspecified"}`,
    `Rate: ${form.rate ? formatRate(form.rate) : "unspecified"}`,
    `Country: ${form.country || "unspecified"}`,
    `State / region: ${form.state || "National (no state)"}`,
    `Category: ${form.category || "STANDARD"}`,
  ].join("\n");
}

export function buildRelatedTaxRulesSummary(rules: TaxRule[], excludeId?: string): string {
  const others = rules.filter((rule) => rule.id !== excludeId);
  if (!others.length) return "No other store tax rules configured.";

  const lines = [`Other store tax rules (${others.length}):`];
  others.forEach((rule, index) => {
    lines.push(
      `${index + 1}. ${rule.name} | ${rule.country}${rule.state ? `/${rule.state}` : ""} | ${rule.category} | ${formatRate(rule.rate)} | ${rule.isSystem ? "system" : "custom"}`,
    );
  });
  return lines.join("\n");
}

export function buildTaxRuleExplanationPayload(
  ruleSummary: string,
  relatedRulesSummary?: string,
  existingDraft?: string,
) {
  return {
    ruleSummary,
    relatedRulesSummary: relatedRulesSummary?.trim() || undefined,
    existingDraft: existingDraft?.trim() || undefined,
  };
}
