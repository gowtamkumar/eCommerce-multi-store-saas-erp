import type { Supplier } from "../types";

interface SupplierFormData {
  name: string;
  code: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  category: string;
  rating: number;
  leadTimeDays: number;
  isActive: boolean;
}

interface CategoryOption {
  id: string;
  name: string;
}

function resolveCategoryName(
  categoryId: string,
  categories: CategoryOption[],
  supplier?: Supplier,
): string | undefined {
  if (supplier?.category?.name) return supplier.category.name;
  const match = categories.find((entry) => entry.id === categoryId);
  return match?.name;
}

export function buildSupplierSummary(
  form: SupplierFormData,
  categories: CategoryOption[],
  supplier?: Supplier,
): string {
  const categoryName = resolveCategoryName(form.category, categories, supplier);

  return [
    supplier?.id ? `Supplier ID: ${supplier.id}` : "Supplier ID: new (unsaved)",
    form.name ? `Company: ${form.name}` : "Company: not entered",
    form.code ? `Vendor code: ${form.code}` : null,
    categoryName ? `Category: ${categoryName}` : "Category: not set",
    form.isActive ? "Status: Active" : "Status: Inactive",
    form.contactName ? `Contact: ${form.contactName}` : null,
    form.email ? `Email: ${form.email}` : null,
    form.phone ? `Phone: ${form.phone}` : null,
    form.address ? `Address: ${form.address}` : null,
    `Rating: ${form.rating}/5`,
    `Lead time: ${form.leadTimeDays} days`,
    supplier?.outstandingBalance != null
      ? `Outstanding AP balance: ${supplier.outstandingBalance}`
      : null,
    supplier?.createdAt
      ? `Onboarded: ${new Date(supplier.createdAt).toISOString().slice(0, 10)}`
      : null,
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildSupplierProfileSummaryPayload(
  supplierSummary: string,
  existingSummary?: string,
) {
  return {
    supplierSummary,
    existingSummary: existingSummary?.trim() || undefined,
  };
}

export function buildSupplierProfileSummaryFromForm(
  form: SupplierFormData,
  categories: CategoryOption[],
  supplier?: Supplier,
  existingSummary?: string,
) {
  return buildSupplierProfileSummaryPayload(
    buildSupplierSummary(form, categories, supplier),
    existingSummary,
  );
}
