"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { fetchAPI } from "@/services/api";
import toast from "react-hot-toast";
import { Plan, SubscriptionInfo, BillingInvoice } from "../../type";
import { useSearchParams } from "next/navigation";
import SubscriptionOverview from "./SubscriptionOverview";
import PlanGrid from "./PlanGrid";
import InvoiceHistory from "./InvoiceHistory";

export default function BillingDashboard() {
  const [loading, setLoading] = useState(true);
  const [subInfo, setSubInfo] = useState<SubscriptionInfo | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [history, setHistory] = useState<BillingInvoice[]>([]);
  const [initiating, setInitiating] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const searchParams = useSearchParams();

  const loadBillingData = useCallback(async () => {
    try {
      setLoading(true);
      const [infoRes, plansRes, historyRes] = await Promise.all([
        fetchAPI("/billing/current"),
        fetchAPI("/billing/plans"),
        fetchAPI("/billing/history")
      ]);

      setSubInfo(infoRes.data);
      setPlans(plansRes.data);
      setHistory(historyRes.data);
    } catch (error) {
      console.error("Failed to load billing data", error);
      toast.error("Failed to load billing information");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const success = searchParams.get("success");
    const error = searchParams.get("error");

    if (success === "true") {
      toast.success("Subscription updated successfully!");
      loadBillingData();
    } else if (error) {
      if (error === "payment_failed") {
        toast.error("Payment failed. Please try again.");
      } else if (error === "payment_cancelled") {
        toast.error("Payment cancelled.");
      } else {
        toast.error("An error occurred during payment.");
      }
      loadBillingData();
    } else {
      loadBillingData();
    }
  }, [searchParams, loadBillingData]);

  const handleUpgrade = useCallback(async (planId: string) => {
    try {
      setInitiating(planId);
      const res = await fetchAPI("/billing/initiate", {
        method: "POST",
        body: JSON.stringify({
          planId,
          billingCycle,
          frontendUrl: window.location.origin
        })
      });

      if (res.data.gatewayUrl && res.data.gatewayUrl !== '#') {
        window.location.href = res.data.gatewayUrl;
      }
    } catch (error: any) {
      console.log("error", error);
      toast.error(error.message || "Failed to initiate upgrade");
    } finally {
      setInitiating(null);
    }
  }, [billingCycle]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-brand-600" />
        <p className="text-slate-500 font-medium animate-pulse">Loading billing details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-12 animate-in fade-in duration-700">
      <SubscriptionOverview 
        subInfo={subInfo}
        plans={plans}
        handleUpgrade={handleUpgrade}
        initiating={initiating}
      />

      <PlanGrid 
        plans={plans}
        subInfo={subInfo}
        billingCycle={billingCycle}
        setBillingCycle={setBillingCycle}
        handleUpgrade={handleUpgrade}
        initiating={initiating}
      />

      <InvoiceHistory history={history} />
    </div>
  );
}
