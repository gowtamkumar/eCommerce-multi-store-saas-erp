"use client";

import { usePlatformAiConfig } from "@/features/system/hooks/usePlatformAiConfig";
import { fetchSuperAdminAPI } from "@/services/superAdminApi";
import { Headphones, Loader2, Rocket, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";

export function PlatformSupportAiPanel() {
  const { configured } = usePlatformAiConfig();
  const [ticketText, setTicketText] = useState("");
  const [tenantContext, setTenantContext] = useState("");
  const [storeName, setStoreName] = useState("");
  const [planName, setPlanName] = useState("");
  const [enabledFeatures, setEnabledFeatures] = useState("");
  const [ticketLoading, setTicketLoading] = useState(false);
  const [onboardingLoading, setOnboardingLoading] = useState(false);
  const [ticketResult, setTicketResult] = useState<{
    ticketSummary: string;
    customerIntentTags: string[];
    suggestedNextSteps: string[];
    escalationHint: string;
  } | null>(null);
  const [onboardingResult, setOnboardingResult] = useState<{
    welcomeSummary: string;
    setupChecklist: string[];
    firstWeekTips: string[];
    supportResourcesHint: string;
  } | null>(null);

  const generateTicketSummary = async () => {
    if (!ticketText.trim()) {
      toast.error("Paste a conversation or ticket notes first");
      return;
    }
    setTicketLoading(true);
    try {
      const res = await fetchSuperAdminAPI("/super-admin/ai/generate/support-ticket-summary", {
        method: "POST",
        body: JSON.stringify({
          conversationText: ticketText,
          tenantContext: tenantContext || undefined,
        }),
      });
      if (res.data) {
        setTicketResult(res.data);
        toast.success("Ticket summary drafted");
      }
    } catch {
      toast.error("Failed to generate ticket summary");
    } finally {
      setTicketLoading(false);
    }
  };

  const generateOnboardingHints = async () => {
    if (!storeName.trim()) {
      toast.error("Enter a store name for onboarding hints");
      return;
    }
    setOnboardingLoading(true);
    try {
      const res = await fetchSuperAdminAPI("/super-admin/ai/generate/onboarding-hints", {
        method: "POST",
        body: JSON.stringify({
          storeName,
          planName: planName || undefined,
          enabledFeatures: enabledFeatures || undefined,
        }),
      });
      if (res.data) {
        setOnboardingResult(res.data);
        toast.success("Onboarding hints generated");
      }
    } catch {
      toast.error("Failed to generate onboarding hints");
    } finally {
      setOnboardingLoading(false);
    }
  };

  if (configured === null) return null;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 p-6 shadow-sm space-y-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Headphones className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Platform support AI</h2>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Draft ticket summaries and new-tenant onboarding hints for Super Admin support — human review required.
        </p>
      </div>

      {!configured ? (
        <p className="text-xs text-amber-800 dark:text-amber-200">
          <Link href="/system/settings?tab=ai" className="font-bold underline">
            Configure Platform AI
          </Link>{" "}
          to enable support tooling.
        </p>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-3 rounded-2xl border border-slate-100 dark:border-slate-700 p-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              Ticket summary
            </h3>
            <textarea
              value={ticketText}
              onChange={(e) => setTicketText(e.target.value)}
              rows={5}
              placeholder="Paste support chat or ticket notes..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
            />
            <input
              value={tenantContext}
              onChange={(e) => setTenantContext(e.target.value)}
              placeholder="Tenant context (plan, status, subdomain — optional)"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
            />
            <button
              type="button"
              onClick={() => void generateTicketSummary()}
              disabled={ticketLoading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl disabled:opacity-60"
            >
              {ticketLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Summarize ticket
            </button>
            {ticketResult ? (
              <div className="text-sm space-y-2 text-slate-700 dark:text-slate-200">
                <p>{ticketResult.ticketSummary}</p>
                {ticketResult.customerIntentTags?.length ? (
                  <p className="text-xs">
                    <span className="font-bold uppercase tracking-wide text-slate-400">Intent: </span>
                    {ticketResult.customerIntentTags.join(" · ")}
                  </p>
                ) : null}
                {ticketResult.suggestedNextSteps?.length ? (
                  <ul className="text-xs space-y-1">
                    {ticketResult.suggestedNextSteps.map((step) => (
                      <li key={step}>→ {step}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="space-y-3 rounded-2xl border border-slate-100 dark:border-slate-700 p-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Rocket className="w-4 h-4 text-emerald-500" />
              Onboarding hints
            </h3>
            <input
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="Store name *"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
            />
            <input
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              placeholder="Plan name (optional)"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
            />
            <input
              value={enabledFeatures}
              onChange={(e) => setEnabledFeatures(e.target.value)}
              placeholder="Enabled modules (optional, comma-separated)"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
            />
            <button
              type="button"
              onClick={() => void generateOnboardingHints()}
              disabled={onboardingLoading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl disabled:opacity-60"
            >
              {onboardingLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
              Generate hints
            </button>
            {onboardingResult ? (
              <div className="text-sm space-y-2 text-slate-700 dark:text-slate-200">
                <p>{onboardingResult.welcomeSummary}</p>
                {onboardingResult.setupChecklist?.length ? (
                  <ul className="text-xs space-y-1">
                    {onboardingResult.setupChecklist.map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
