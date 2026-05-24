import { TaxVatDashboard } from "@/features/admin/finance/components/tax/TaxVatDashboard";

export const metadata = {
  title: "Tax & VAT Management | ERP Admin",
  description: "Automated multi-jurisdiction regional tax rules, VAT calculations and filings.",
};

export default function AdminTaxPage() {
  return <TaxVatDashboard />;
}
