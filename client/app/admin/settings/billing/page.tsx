import { Metadata } from 'next';
import BillingDashboard from "@/features/admin/settings/billing/components/BillingDashboard";
import { CreditCard } from "lucide-react";

export const metadata: Metadata = {
  title: 'Subscription & Billing | Antigravity Commerce',
  description: 'Manage your store subscription and billing history',
};

export default function BillingPage() {
  return (
    <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-brand-100 dark:bg-brand-900/30 rounded-2xl transition-all duration-300">
            <CreditCard className="w-6 h-6 text-brand-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-display uppercase tracking-tight">
              Subscription & Billing
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium italic">
              Empower your business with premium features
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        <BillingDashboard />
      </div>
    </div>
  );
}
