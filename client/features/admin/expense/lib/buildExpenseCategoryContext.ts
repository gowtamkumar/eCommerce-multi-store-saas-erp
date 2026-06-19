export interface ExpenseCategoryFormFields {
  title: string;
  description?: string;
  amount?: string | number;
  referenceNumber?: string;
  currentCategory?: string;
}

export function buildExpenseCategorySummary(fields: ExpenseCategoryFormFields): string {
  const lines = [
    "Context: expense record for categorization",
    fields.title.trim() ? `Title: ${fields.title.trim()}` : null,
    fields.description?.trim() ? `Description: ${fields.description.trim()}` : null,
    fields.amount !== undefined && fields.amount !== ""
      ? `Amount: ${fields.amount}`
      : null,
    fields.referenceNumber?.trim() ? `Reference: ${fields.referenceNumber.trim()}` : null,
  ].filter(Boolean);

  return lines.length > 1 ? lines.join("\n") : "Context: expense record for categorization\nNo title or description provided.";
}

export function buildExpenseCategoryPayload(fields: ExpenseCategoryFormFields) {
  return {
    expenseSummary: buildExpenseCategorySummary(fields),
    currentCategory: fields.currentCategory?.trim() || undefined,
  };
}

export function normalizeExpenseCategoryValue(value: string): string {
  return value.trim().toLowerCase();
}
