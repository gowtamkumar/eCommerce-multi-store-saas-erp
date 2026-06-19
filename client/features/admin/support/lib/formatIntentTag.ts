const INTENT_LABELS: Record<string, string> = {
  order_status: "Order status",
  shipping: "Shipping",
  return_refund: "Return / refund",
  billing: "Billing",
  product_question: "Product",
  pricing: "Pricing",
  account: "Account",
  complaint: "Complaint",
  technical: "Technical",
  warranty: "Warranty",
  general: "General",
};

export function formatIntentTag(tag: string): string {
  const normalized = tag.trim().toLowerCase().replace(/\s+/g, "_");
  if (INTENT_LABELS[normalized]) {
    return INTENT_LABELS[normalized];
  }
  return normalized
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function intentTagChipClass(tag: string): string {
  const normalized = tag.trim().toLowerCase();
  if (normalized.includes("complaint") || normalized.includes("refund")) {
    return "bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-200";
  }
  if (normalized.includes("shipping") || normalized.includes("order")) {
    return "bg-sky-100 text-sky-800 dark:bg-sky-950/50 dark:text-sky-200";
  }
  if (normalized.includes("billing") || normalized.includes("pricing")) {
    return "bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-200";
  }
  return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
}
