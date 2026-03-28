"use client";

import { useEffect, useState } from "react";
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Download,
  ArrowUpCircle,
  Clock,
  Zap,
  ShieldCheck,
  Check,
  RefreshCw
} from "lucide-react";
import { fetchAPI } from "@/services/api";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Plan, SubscriptionInfo, BillingInvoice } from "../../type";
import { useSearchParams } from "next/navigation";

dayjs.extend(relativeTime);

export default function BillingDashboard() {
  const [loading, setLoading] = useState(true);
  const [subInfo, setSubInfo] = useState<SubscriptionInfo | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [history, setHistory] = useState<BillingInvoice[]>([]);
  const [initiating, setInitiating] = useState<string | null>(null);
  const searchParams = useSearchParams();

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
  }, [searchParams]);

  const loadBillingData = async () => {
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
  };

  const handleUpgrade = async (planId: string) => {
    try {
      setInitiating(planId);
      const res = await fetchAPI("/billing/initiate", {
        method: "POST",
        body: JSON.stringify({ planId, frontendUrl: window.location.origin })
      });

      if (res.data.gatewayUrl && res.data.gatewayUrl !== '#') {
        window.location.href = res.data.gatewayUrl;
      }
    } catch (error) {
      toast.error("Failed to initiate upgrade");
    } finally {
      setInitiating(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-brand-600" />
        <p className="text-slate-500 font-medium animate-pulse">Loading billing details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-12">
      {/* Current Plan Overview */}
      <section className="relative overflow-hidden bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 border border-slate-200/60 dark:border-slate-700/50 shadow-sm transition-all duration-300">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/5 rounded-full -ml-32 -mb-32 blur-3xl" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-50 dark:bg-brand-900/20 rounded-full">
              <Zap className="w-4 h-4 text-brand-600" />
              <span className="text-xs font-black text-brand-700 dark:text-brand-400 uppercase tracking-widest">Current Subscription</span>
            </div>

            <div className="space-y-1">
              <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                {subInfo?.planName} Plan
              </h2>
              <p className="text-slate-500 dark:text-slate-400 flex items-center gap-2 font-medium">
                {subInfo?.isExpired ? (
                  <span className="flex items-center gap-1.5 text-rose-500 bg-rose-50 dark:bg-rose-900/20 px-3 py-1 rounded-full text-sm">
                    <AlertCircle className="w-4 h-4" />
                    Expired on {subInfo?.endsAt ? dayjs(subInfo.endsAt).format('MMMM DD, YYYY') : 'N/A'}
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-full text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    Active until {subInfo?.endsAt ? dayjs(subInfo.endsAt).format('MMMM DD, YYYY') : 'N/A'}
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="bg-slate-50 dark:bg-slate-900/40 p-5 rounded-3xl border border-slate-100 dark:border-slate-700/30 w-44">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 text-center">Billing Cycle</p>
              <p className="text-xl font-bold text-slate-700 dark:text-slate-200 text-center capitalize">{subInfo?.billingCycle}</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900/40 p-5 rounded-3xl border border-slate-100 dark:border-slate-700/30 w-44">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 text-center">Status</p>
              <p className="text-xl font-bold text-slate-700 dark:text-slate-200 text-center capitalize">{subInfo?.status}</p>
            </div>

            <button
              onClick={() => {
                const currentPlan = plans.find(p => p.name === subInfo?.planName);
                if (currentPlan) handleUpgrade(currentPlan.id);
              }}
              disabled={initiating !== null}
              className="bg-brand-600 text-white px-8 py-5 rounded-3xl font-black uppercase tracking-widest hover:bg-brand-700 transition-all flex items-center gap-3 shadow-xl shadow-brand-600/20 active:scale-95 disabled:opacity-50"
            >
              {initiating ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
              Renew Now
            </button>
          </div>
        </div>
      </section>

      {/* Available Plans */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-4">
          <div className="space-y-1">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Choose Your Growth Path</h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium italic">Scale your business with professional tools</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const isCurrent = plan.name === subInfo?.planName;
            return (
              <div
                key={plan.id}
                className={`relative group bg-white dark:bg-slate-800 rounded-[2rem] p-8 border-2 transition-all duration-500 ${isCurrent
                  ? 'border-brand-500 shadow-xl shadow-brand-500/10'
                  : 'border-slate-100 dark:border-slate-700/50 hover:border-brand-200 dark:hover:border-slate-600'
                  }`}
              >
                {isCurrent && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-brand-500 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg">
                    Current Choice
                  </div>
                )}

                <div className="space-y-6">
                  <div className="space-y-2 text-center">
                    <h4 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase">{plan.name}</h4>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-black text-slate-900 dark:text-white">${plan.price}</span>
                      <span className="text-slate-400 dark:text-slate-500 font-bold uppercase text-xs tracking-widest">/mo</span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium px-4 h-10 line-clamp-2">
                      {plan.description || "The perfect starting point for growing businesses."}
                    </p>
                  </div>

                  <div className="h-px bg-slate-100 dark:bg-slate-700/50 w-full" />

                  <ul className="space-y-4">
                    {plan.features?.map((feature, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300 font-medium">
                        <div className="p-1 bg-brand-50 dark:bg-brand-900/20 rounded-lg shrink-0">
                          <Check className="w-3 h-3 text-brand-600" />
                        </div>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={initiating !== null}
                    className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest transition-all duration-300 ${isCurrent
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-500/20'
                      : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-brand-600 hover:text-white dark:hover:bg-brand-600 dark:hover:text-white shadow-xl shadow-slate-900/5'
                      } active:scale-95 disabled:opacity-50 shadow-xl`}
                  >
                    {initiating === plan.id ? (
                      <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                    ) : isCurrent ? (
                      'Renew Now'
                    ) : (
                      'Upgrade Now'
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Billing History */}
      <section className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-200/60 dark:border-slate-700/50 overflow-hidden shadow-sm">
        <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-700/50 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
              <Clock className="w-5 h-5 text-indigo-600" />
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Billing History</h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-900/20">
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Invoice</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Plan</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {history.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-12 text-center text-slate-500 font-medium italic">
                    No billing history found. Your journey starts here!
                  </td>
                </tr>
              ) : (
                history.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors">
                    <td className="px-8 py-6">
                      <p className="font-bold text-slate-900 dark:text-white">#{invoice.invoiceNumber}</p>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-300 capitalize">{invoice.plan?.name}</p>
                    </td>
                    <td className="px-8 py-6">
                      <p className="font-black text-slate-900 dark:text-white">
                        {invoice.amount} {invoice.currency}
                      </p>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                        {dayjs(invoice.billingDate).format('MMM DD, YYYY')}
                      </p>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${invoice.status === 'PAID' || invoice.status === 'COMPLETED'
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
                        : 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400'
                        }`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all group">
                        <Download className="w-5 h-5 text-slate-400 group-hover:text-brand-600 transition-colors" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
