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
import StorageAddons from "./StorageAddons";
import { motion } from "framer-motion";

export default function BillingDashboard() {
  const [loading, setLoading] = useState(true);
  const [subInfo, setSubInfo] = useState<SubscriptionInfo | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [history, setHistory] = useState<BillingInvoice[]>([]);
  const [addonCatalog, setAddonCatalog] = useState<any[]>([]);
  const [initiating, setInitiating] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [activeTab, setActiveTab] = useState<'plans' | 'history'>('plans');
  const searchParams = useSearchParams();

  const loadBillingData = useCallback(async () => {
    try {
      setLoading(true);
      const [infoRes, plansRes, historyRes, catalogRes] = await Promise.all([
        fetchAPI("/billing/current"),
        fetchAPI("/billing/plans"),
        fetchAPI("/billing/history"),
        fetchAPI("/billing/addon-catalog"),
      ]);

      setSubInfo(infoRes.data);
      setPlans(plansRes.data);
      setHistory(historyRes.data);
      setAddonCatalog(catalogRes.data || []);
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

  const handlePurchaseAddon = useCallback(async (addonSlug: string) => {
    try {
      const res = await fetchAPI("/billing/purchase-addon", {
        method: "POST",
        body: JSON.stringify({ addonSlug })
      });
      if (res.success) {
        toast.success("Storage addon activated successfully!");
        await loadBillingData();
      } else {
        toast.error(res.message || "Failed to purchase storage addon");
      }
    } catch (error: any) {
      console.error("Failed to purchase storage addon", error);
      toast.error(error.message || "Failed to purchase storage addon");
    }
  }, [loadBillingData]);

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
        addonCatalog={addonCatalog}
      />

      {/* Tabs Switcher */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-8">
        <button
          onClick={() => setActiveTab('plans')}
          className={`pb-4 text-sm font-black uppercase tracking-widest transition-all relative ${
            activeTab === 'plans'
              ? 'text-brand-600 dark:text-brand-400 font-black'
              : 'text-slate-405 hover:text-slate-600 dark:hover:text-slate-350'
          }`}
        >
          Subscription & Addons
          {activeTab === 'plans' && (
            <motion.div
              layoutId="activeBillingTabLine"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600 dark:bg-brand-400"
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            />
          )}
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`pb-4 text-sm font-black uppercase tracking-widest transition-all relative ${
            activeTab === 'history'
              ? 'text-brand-600 dark:text-brand-400 font-black'
              : 'text-slate-405 hover:text-slate-600 dark:hover:text-slate-350'
          }`}
        >
          Billing History
          {activeTab === 'history' && (
            <motion.div
              layoutId="activeBillingTabLine"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600 dark:bg-brand-400"
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            />
          )}
        </button>
      </div>

      {activeTab === 'plans' ? (
        <>
          <PlanGrid 
            plans={plans}
            subInfo={subInfo}
            billingCycle={billingCycle}
            setBillingCycle={setBillingCycle}
            handleUpgrade={handleUpgrade}
            initiating={initiating}
          />

          <StorageAddons 
            subInfo={subInfo}
            onPurchaseAddon={handlePurchaseAddon}
            addonCatalog={addonCatalog}
          />
        </>
      ) : (
        <InvoiceHistory history={history} />
      )}
    </div>
  );
}
