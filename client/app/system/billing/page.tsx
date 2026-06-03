import { Suspense } from "react";
import BillingDashboard from "@/features/system/components/BillingDashboard";

function BillingSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="flex justify-between items-center">
        <div>
          <div className="h-8 w-64 bg-slate-200 dark:bg-slate-700 rounded-xl" />
          <div className="h-4 w-48 bg-slate-100 dark:bg-slate-800 rounded-lg mt-2" />
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-32 bg-slate-200 dark:bg-slate-700 rounded-xl" />
          <div className="h-10 w-32 bg-indigo-200 dark:bg-indigo-900 rounded-xl" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 p-5 rounded-[2rem] border border-slate-100 dark:border-slate-700 h-28" />
        ))}
      </div>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-[2rem] h-80 border border-slate-100 dark:border-slate-700" />
        <div className="bg-white dark:bg-slate-800 rounded-[2rem] h-80 border border-slate-100 dark:border-slate-700" />
      </div>
    </div>
  );
}

export default function SuperAdminBillingPage() {
  return (
    <Suspense fallback={<BillingSkeleton />}>
      <BillingDashboard />
    </Suspense>
  );
}
