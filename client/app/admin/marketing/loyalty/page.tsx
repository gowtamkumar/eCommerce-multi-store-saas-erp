"use client";

import {
  getCustomerLoyaltyHistory,
  getLoyaltyConfig,
  LoyaltyConfig,
  LoyaltyLedgerEntry,
  manualCreditPoints,
  manualDebitPoints,
  updateLoyaltyConfig,
  getLoyaltyRules,
  createLoyaltyRule,
  updateLoyaltyRule,
  deleteLoyaltyRule,
  LoyaltyRule,
  getLoyaltyLiability,
  LoyaltyLiability
} from "@/services/loyalty";
import { ArrowDownRight, ArrowUpRight, RefreshCw, Save, Users, Plus, Trash2, Edit2, Calendar, X, Award } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

type LoyaltyRuleType = "CATEGORY_MULTIPLIER" | "MIN_SPEND_BONUS" | "WEEKEND_MULTIPLIER";

function getErrorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

export default function AdminLoyaltyPage() {
  const [activeSubTab, setActiveSubTab] = useState<"rules" | "adjust" | "dynamic">("rules");
  const [config, setConfig] = useState<LoyaltyConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [liability, setLiability] = useState<LoyaltyLiability | null>(null);

  // Dynamic rules states
  const [rules, setRules] = useState<LoyaltyRule[]>([]);
  const [loadingRules, setLoadingRules] = useState(false);
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [editingRule, setEditingRule] = useState<Partial<LoyaltyRule> | null>(null);

  // Form states for rule
  const [ruleName, setRuleName] = useState("");
  const [ruleType, setRuleType] = useState<LoyaltyRuleType>("CATEGORY_MULTIPLIER");
  const [ruleValue, setRuleValue] = useState<number>(2);
  const [ruleCategoryId, setRuleCategoryId] = useState("");
  const [ruleMinSpend, setRuleMinSpend] = useState<number>(100);
  const [ruleIsActive, setRuleIsActive] = useState(true);
  const [ruleStartDate, setRuleStartDate] = useState("");
  const [ruleEndDate, setRuleEndDate] = useState("");
  const [submittingRule, setSubmittingRule] = useState(false);

  // Adjustment tool states
  const [customerId, setCustomerId] = useState("");
  const [adjustPoints, setAdjustPoints] = useState(100);
  const [adjustNote, setAdjustNote] = useState("");
  const [customerHistory, setCustomerHistory] = useState<LoyaltyLedgerEntry[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [adjustMessage, setAdjustMessage] = useState({ text: "", type: "" });


  useEffect(() => {
    loadConfig();
  }, []);

  useEffect(() => {
    if (activeSubTab === "dynamic") {
      loadRules();
    }
  }, [activeSubTab]);

  async function loadRules() {
    setLoadingRules(true);
    try {
      const data = await getLoyaltyRules();
      setRules(data);
    } catch (err: unknown) {
      console.error(err);
      toast.error(getErrorMessage(err, "Failed to load dynamic rules"));
    } finally {
      setLoadingRules(false);
    }
  }

  const handleDeleteRule = async (id: string) => {
    if (!confirm("Are you sure you want to delete this rule?")) return;
    try {
      await deleteLoyaltyRule(id);
      toast.success("Loyalty rule deleted successfully");
      loadRules();
    } catch (err: unknown) {
      console.error(err);
      toast.error(getErrorMessage(err, "Failed to delete rule"));
    }
  };

  const handleOpenRuleModal = (rule: Partial<LoyaltyRule> | null = null) => {
    setEditingRule(rule);
    if (rule) {
      setRuleName(rule.name || "");
      setRuleType(rule.type || "CATEGORY_MULTIPLIER");
      setRuleValue(rule.value || 2);
      setRuleCategoryId(rule.conditions?.categoryId || "");
      setRuleMinSpend(rule.conditions?.minSpend || rule.conditions?.threshold || 100);
      setRuleIsActive(rule.isActive !== false);
      setRuleStartDate(rule.startDate ? new Date(rule.startDate).toISOString().slice(0, 16) : "");
      setRuleEndDate(rule.endDate ? new Date(rule.endDate).toISOString().slice(0, 16) : "");
    } else {
      setRuleName("");
      setRuleType("CATEGORY_MULTIPLIER");
      setRuleValue(2);
      setRuleCategoryId("");
      setRuleMinSpend(100);
      setRuleIsActive(true);
      setRuleStartDate("");
      setRuleEndDate("");
    }
    setShowRuleModal(true);
  };

  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleName.trim()) {
      toast.error("Rule name is required");
      return;
    }
    setSubmittingRule(true);

    const conditions: Record<string, unknown> = {};
    if (ruleType === "CATEGORY_MULTIPLIER") {
      conditions.categoryId = ruleCategoryId.trim();
    } else if (ruleType === "MIN_SPEND_BONUS") {
      conditions.minSpend = Number(ruleMinSpend);
    }

    const payload: Partial<LoyaltyRule> = {
      name: ruleName.trim(),
      type: ruleType,
      value: Number(ruleValue),
      conditions,
      isActive: ruleIsActive,
      startDate: ruleStartDate ? new Date(ruleStartDate).toISOString() : undefined,
      endDate: ruleEndDate ? new Date(ruleEndDate).toISOString() : undefined,
    };

    try {
      if (editingRule && editingRule.id) {
        await updateLoyaltyRule(editingRule.id, payload);
        toast.success("Loyalty rule updated successfully");
      } else {
        await createLoyaltyRule(payload);
        toast.success("Loyalty rule created successfully");
      }
      setShowRuleModal(false);
      loadRules();
    } catch (err: unknown) {
      console.error(err);
      toast.error(getErrorMessage(err, "Failed to save loyalty rule"));
    } finally {
      setSubmittingRule(false);
    }
  };


  async function loadConfig() {
    setLoading(true);
    try {
      const [data, liabilityData] = await Promise.all([
        getLoyaltyConfig(),
        getLoyaltyLiability().catch(() => null),
      ]);
      setConfig(data);
      setLiability(liabilityData);
    } catch (err: unknown) {
      console.error(err);
      setMessage({ text: getErrorMessage(err, "Failed to load loyalty settings"), type: "error" });
    } finally {
      setLoading(false);
    }
  }

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;
    setSaving(true);
    setMessage({ text: "", type: "" });
    try {
      const updated = await updateLoyaltyConfig(config);
      setConfig(updated);
      setMessage({ text: "Loyalty program settings updated successfully!", type: "success" });
    } catch (err: unknown) {
      console.error(err);
      setMessage({ text: getErrorMessage(err, "Failed to save settings"), type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleFetchCustomerHistory = async () => {
    if (!customerId.trim()) return;
    setLoadingHistory(true);
    setAdjustMessage({ text: "", type: "" });
    try {
      const history = await getCustomerLoyaltyHistory(customerId.trim());
      setCustomerHistory(history);
    } catch (err: unknown) {
      console.error(err);
      setAdjustMessage({ text: "Failed to fetch ledger for this customer ID. Verify it is correct.", type: "error" });
      setCustomerHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleAdjustment = async (action: "credit" | "debit") => {
    if (!customerId.trim()) {
      setAdjustMessage({ text: "Customer ID is required", type: "error" });
      return;
    }
    if (adjustPoints <= 0) {
      setAdjustMessage({ text: "Points value must be greater than 0", type: "error" });
      return;
    }
    if (!adjustNote.trim()) {
      setAdjustMessage({ text: "A detailed explanation note is required for ledger audits", type: "error" });
      return;
    }

    setLoadingHistory(true);
    setAdjustMessage({ text: "", type: "" });
    try {
      if (action === "credit") {
        await manualCreditPoints(customerId.trim(), adjustPoints, adjustNote.trim());
        setAdjustMessage({ text: `Successfully credited ${adjustPoints} points!`, type: "success" });
      } else {
        await manualDebitPoints(customerId.trim(), adjustPoints, adjustNote.trim());
        setAdjustMessage({ text: `Successfully debited ${adjustPoints} points!`, type: "success" });
      }
      setAdjustNote("");
      // Reload history to verify balance changes
      const history = await getCustomerLoyaltyHistory(customerId.trim());
      setCustomerHistory(history);
    } catch (err: unknown) {
      console.error(err);
      setAdjustMessage({ text: getErrorMessage(err, "Adjustment failed"), type: "error" });
    } finally {
      setLoadingHistory(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-wider">
            Loyalty & Referrals Engine
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Configure points conversion rates, membership tier thresholds, and award manually managed points adjustments.
          </p>
        </div>
        <div className="flex bg-white dark:bg-slate-800 rounded-2xl p-1.5 border border-slate-200/50 dark:border-slate-700 shadow-sm shrink-0">
          <button
            onClick={() => setActiveSubTab("rules")}
            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${activeSubTab === "rules"
              ? "bg-brand-600 text-white shadow-md shadow-brand-500/10"
              : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
          >
            Program Rules
          </button>
          <button
            onClick={() => setActiveSubTab("adjust")}
            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${activeSubTab === "adjust"
              ? "bg-brand-600 text-white shadow-md shadow-brand-500/10"
              : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
          >
            Points Adjustment
          </button>
          <button
            onClick={() => setActiveSubTab("dynamic")}
            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${activeSubTab === "dynamic"
              ? "bg-brand-600 text-white shadow-md shadow-brand-500/10"
              : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
          >
            Dynamic Rules
          </button>
        </div>
      </div>

      {/* Global Loading state */}
      {loading && activeSubTab === "rules" ? (
        <div className="flex flex-col items-center justify-center p-24 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200/50 dark:border-slate-850">
          <RefreshCw className="w-8 h-8 text-brand-600 animate-spin" />
          <p className="text-sm font-bold text-slate-500 mt-4 uppercase tracking-widest animate-pulse">Loading engine configurations...</p>
        </div>
      ) : (
        <>
          {/* Rules Tab */}
          {activeSubTab === "rules" && config && (
            <form onSubmit={handleSaveConfig} className="space-y-6">
              {/* Notification toast */}
              {message.text && (
                <div className={`p-4 rounded-2xl text-xs font-bold border ${message.type === "success"
                  ? "bg-emerald-50 border-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900/50 dark:text-emerald-400"
                  : "bg-rose-50 border-rose-100 text-rose-700 dark:bg-rose-950/20 dark:border-rose-900/50 dark:text-rose-400"
                  }`}>
                  {message.text}
                </div>
              )}

              {/* Switch Toggle */}
              <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 border border-slate-200/50 dark:border-slate-850 flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-base font-black text-slate-900 dark:text-white">Active Status</h3>
                  <p className="text-xs text-slate-400">Toggle the entire points & rewards program on or off globally.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setConfig({ ...config, isEnabled: !config.isEnabled })}
                  className={`w-14 h-8 rounded-full transition-colors relative flex items-center p-1 ${config.isEnabled ? "bg-brand-600" : "bg-slate-350 dark:bg-slate-700"
                    }`}
                >
                  <span className={`w-6 h-6 bg-white rounded-full shadow-sm transform transition-transform ${config.isEnabled ? "translate-x-6" : "translate-x-0"
                    }`} />
                </button>
              </div>

              <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${!config.isEnabled ? "opacity-50 pointer-events-none" : ""}`}>
                {/* points rates card */}
                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 md:p-8 border border-slate-200/50 dark:border-slate-850 space-y-6">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
                    Conversion Settings
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Points Earned per $1 Spent</label>
                      <input
                        type="number"
                        value={config.pointsPerCurrencySpent}
                        onChange={(e) => setConfig({ ...config, pointsPerCurrencySpent: Number(e.target.value) })}
                        className="w-full mt-2 px-4 py-3 text-sm rounded-xl border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-slate-950 dark:text-white"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Points Required per $1 Discount</label>
                      <input
                        type="number"
                        value={config.pointsRequiredPerCurrencyDiscount}
                        onChange={(e) => setConfig({ ...config, pointsRequiredPerCurrencyDiscount: Number(e.target.value) })}
                        className="w-full mt-2 px-4 py-3 text-sm rounded-xl border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-slate-950 dark:text-white"
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Points Expire After Days</label>
                      <input
                        type="number"
                        value={config.pointsExpireAfterDays ?? ""}
                        placeholder="Never"
                        onChange={(e) => setConfig({ ...config, pointsExpireAfterDays: e.target.value ? Number(e.target.value) : null })}
                        className="w-full mt-2 px-4 py-3 text-sm rounded-xl border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-slate-950 dark:text-white"
                        min="1"
                      />
                      <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Blank means points never expire.</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="rounded-2xl bg-brand-50 dark:bg-brand-950/20 p-4 border border-brand-100 dark:border-brand-900/50">
                      <p className="text-[10px] font-black text-brand-500 uppercase tracking-widest">Outstanding Liability</p>
                      <p className="text-2xl font-black text-slate-900 dark:text-white">{(liability?.outstandingPoints ?? 0).toLocaleString()}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 dark:bg-slate-950 p-4 border border-slate-100 dark:border-slate-800">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Customers Holding Points</p>
                      <p className="text-2xl font-black text-slate-900 dark:text-white">{(liability?.customers ?? 0).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* referrals config card */}
                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 md:p-8 border border-slate-200/50 dark:border-slate-850 space-y-6">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
                    Referral Rewards
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-1">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Reward Channel</label>
                      <select
                        value={config.referralRewardType}
                        onChange={(e) => setConfig({ ...config, referralRewardType: e.target.value as "WALLET" | "POINTS" })}
                        className="w-full mt-2 px-4 py-3 text-sm rounded-xl border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-slate-950 dark:text-white"
                      >
                        <option value="POINTS">Loyalty Points</option>
                        <option value="WALLET">Wallet Credit</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Reward Value</label>
                      <input
                        type="number"
                        value={config.referralRewardAmount}
                        onChange={(e) => setConfig({ ...config, referralRewardAmount: Number(e.target.value) })}
                        className="w-full mt-2 px-4 py-3 text-sm rounded-xl border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-slate-950 dark:text-white"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Referee Min Order</label>
                      <input
                        type="number"
                        value={config.refereeMinPurchase}
                        onChange={(e) => setConfig({ ...config, refereeMinPurchase: Number(e.target.value) })}
                        className="w-full mt-2 px-4 py-3 text-sm rounded-xl border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-slate-950 dark:text-white"
                        min="0"
                      />
                    </div>
                  </div>
                </div>

                {/* Tier Thresholds card */}
                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 md:p-8 border border-slate-200/50 dark:border-slate-850 space-y-6 lg:col-span-2">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
                    Membership Tier Spending Levels & Multipliers
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Silver */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 space-y-4">
                      <h4 className="text-sm font-black text-slate-700 dark:text-slate-350">SILVER TIER</h4>
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Min 12m Spending</label>
                        <input
                          type="number"
                          value={config.silverTierThreshold}
                          onChange={(e) => setConfig({ ...config, silverTierThreshold: Number(e.target.value) })}
                          className="w-full mt-1.5 px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-brand-500 text-slate-950 dark:text-white"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Multiplier Boost</label>
                        <input
                          type="number"
                          step="0.05"
                          value={config.silverMultiplier}
                          onChange={(e) => setConfig({ ...config, silverMultiplier: Number(e.target.value) })}
                          className="w-full mt-1.5 px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-brand-500 text-slate-950 dark:text-white"
                          min="1.0"
                        />
                      </div>
                    </div>

                    {/* Gold */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 space-y-4">
                      <h4 className="text-sm font-black text-slate-700 dark:text-slate-350">GOLD TIER</h4>
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Min 12m Spending</label>
                        <input
                          type="number"
                          value={config.goldTierThreshold}
                          onChange={(e) => setConfig({ ...config, goldTierThreshold: Number(e.target.value) })}
                          className="w-full mt-1.5 px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-brand-500 text-slate-950 dark:text-white"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Multiplier Boost</label>
                        <input
                          type="number"
                          step="0.05"
                          value={config.goldMultiplier}
                          onChange={(e) => setConfig({ ...config, goldMultiplier: Number(e.target.value) })}
                          className="w-full mt-1.5 px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-brand-500 text-slate-950 dark:text-white"
                          min="1.0"
                        />
                      </div>
                    </div>

                    {/* Platinum */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 space-y-4">
                      <h4 className="text-sm font-black text-slate-700 dark:text-slate-350">PLATINUM TIER</h4>
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Min 12m Spending</label>
                        <input
                          type="number"
                          value={config.platinumTierThreshold}
                          onChange={(e) => setConfig({ ...config, platinumTierThreshold: Number(e.target.value) })}
                          className="w-full mt-1.5 px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-brand-500 text-slate-950 dark:text-white"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Multiplier Boost</label>
                        <input
                          type="number"
                          step="0.05"
                          value={config.platinumMultiplier}
                          onChange={(e) => setConfig({ ...config, platinumMultiplier: Number(e.target.value) })}
                          className="w-full mt-1.5 px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-brand-500 text-slate-950 dark:text-white"
                          min="1.0"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Save button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-8 py-4 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl font-black uppercase tracking-wider text-xs flex items-center gap-2 shadow-xl shadow-brand-500/10 transition-all active:scale-95 disabled:opacity-50"
                >
                  {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Rules Config
                </button>
              </div>
            </form>
          )}

          {/* Points Adjustment Tab */}
          {activeSubTab === "adjust" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Search & Tool Card */}
              <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 border border-slate-200/50 dark:border-slate-850 space-y-6 h-fit">
                <h3 className="text-lg font-black text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
                  Balance Adjustment
                </h3>

                {adjustMessage.text && (
                  <div className={`p-4 rounded-xl text-xs font-bold border ${adjustMessage.type === "success"
                    ? "bg-emerald-50 border-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900/50 dark:text-emerald-400"
                    : "bg-rose-50 border-rose-100 text-rose-700 dark:bg-rose-950/20 dark:border-rose-900/50 dark:text-rose-400"
                    }`}>
                    {adjustMessage.text}
                  </div>
                )}

                {/* Customer Search Box */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Customer ID (UUID)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Paste User ID..."
                      value={customerId}
                      onChange={(e) => setCustomerId(e.target.value)}
                      className="flex-1 px-4 py-3 text-sm rounded-xl border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-slate-950 dark:text-white font-mono"
                    />
                    <button
                      onClick={handleFetchCustomerHistory}
                      disabled={loadingHistory}
                      className="px-4 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors"
                    >
                      Find
                    </button>
                  </div>
                </div>

                {/* adjustment fields */}
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Point Amount</label>
                    <input
                      type="number"
                      value={adjustPoints}
                      onChange={(e) => setAdjustPoints(Math.max(1, Math.round(Number(e.target.value))))}
                      className="w-full mt-2 px-4 py-3 text-sm rounded-xl border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-slate-950 dark:text-white"
                      min="1"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Audit / Ledger Note</label>
                    <textarea
                      placeholder="E.g., Customer points mismatch reconciliation"
                      value={adjustNote}
                      onChange={(e) => setAdjustNote(e.target.value)}
                      className="w-full mt-2 px-4 py-3 text-sm rounded-xl border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-slate-950 dark:text-white h-24 resize-none"
                    />
                  </div>
                </div>

                {/* Actions buttons */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => handleAdjustment("credit")}
                    disabled={loadingHistory}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors shadow-lg shadow-emerald-500/10 active:scale-95 disabled:opacity-50"
                  >
                    Credit Points
                  </button>
                  <button
                    onClick={() => handleAdjustment("debit")}
                    disabled={loadingHistory}
                    className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors shadow-lg shadow-rose-500/10 active:scale-95 disabled:opacity-50"
                  >
                    Debit Points
                  </button>
                </div>
              </div>

              {/* Audit History Log */}
              <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 md:p-8 border border-slate-200/50 dark:border-slate-850 space-y-6">
                <h3 className="text-lg font-black text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
                  <span>Audit Ledger</span>
                  {customerId.trim() && (
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-mono">User: {customerId.slice(0, 8)}...</span>
                  )}
                </h3>

                {loadingHistory ? (
                  <div className="flex flex-col items-center justify-center p-16">
                    <RefreshCw className="w-6 h-6 text-brand-600 animate-spin" />
                    <p className="text-xs font-bold text-slate-500 mt-2">Loading Customer History...</p>
                  </div>
                ) : customerHistory.length === 0 ? (
                  <div className="p-16 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl space-y-3">
                    <Users className="w-10 h-10 text-slate-400 mx-auto" />
                    <h4 className="text-sm font-black text-slate-700 dark:text-slate-300">No Ledger Retrieved</h4>
                    <p className="text-xs text-slate-450 max-w-sm mx-auto leading-relaxed">
                      Input a valid customer ID in the balance adjustment tool and click &quot;Find&quot; or perform adjustments to view their immutable transaction logs.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-3xl border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-950">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-900/50 text-[9px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-100 dark:border-slate-800">
                          <th className="px-5 py-3">Date</th>
                          <th className="px-5 py-3">Action</th>
                          <th className="px-5 py-3">Note</th>
                          <th className="px-5 py-3 text-right">Points Changed</th>
                          <th className="px-5 py-3 text-right">Balance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                        {customerHistory.map((entry) => {
                          const isEarn = entry.points > 0;
                          return (
                            <tr key={entry.id} className="text-xs text-slate-750 dark:text-slate-350 hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                              <td className="px-5 py-3.5 font-mono text-[11px] text-slate-500">
                                {new Date(entry.createdAt).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </td>
                              <td className="px-5 py-3.5">
                                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${isEarn
                                  ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400"
                                  : "bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400"
                                  }`}>
                                  {isEarn ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                                  {entry.type.replace(/_/g, " ")}
                                </span>
                              </td>
                              <td className="px-5 py-3.5 font-medium text-slate-500 dark:text-slate-450 max-w-[180px] truncate" title={entry.note || ""}>
                                {entry.note || "N/A"}
                              </td>
                              <td className={`px-5 py-3.5 text-right font-black font-mono text-xs ${isEarn ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                                }`}>
                                {isEarn ? "+" : ""}{entry.points.toLocaleString()}
                              </td>
                              <td className="px-5 py-3.5 text-right font-black font-mono text-xs text-slate-900 dark:text-white">
                                {entry.balanceAfter.toLocaleString()}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
          {/* Dynamic Rules Tab */}
          {activeSubTab === "dynamic" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Dynamic Rules & Multipliers</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Create dynamic points rules based on item categories, minimum order spends, or weekend triggers.
                  </p>
                </div>
                <button
                  onClick={() => handleOpenRuleModal(null)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white transition-all text-sm font-bold shadow-md shadow-brand-500/10 active:scale-95 animate-in fade-in"
                >
                  <Plus className="w-4 h-4" /> Add Rule
                </button>
              </div>

              {loadingRules && rules.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-24 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200/50 dark:border-slate-850">
                  <RefreshCw className="w-8 h-8 text-brand-600 animate-spin" />
                  <p className="text-sm font-bold text-slate-500 mt-4 uppercase tracking-widest animate-pulse">Loading rules...</p>
                </div>
              ) : rules.length === 0 ? (
                <div className="p-16 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-[2.5rem] bg-white dark:bg-slate-900 space-y-3">
                  <Award className="w-12 h-12 text-slate-400 mx-auto animate-pulse" />
                  <h4 className="text-sm font-black text-slate-700 dark:text-slate-350">No Dynamic Rules Defined</h4>
                  <p className="text-xs text-slate-450 max-w-sm mx-auto leading-relaxed">
                    Set up category points multipliers, weekend multipliers, or minimum spend points bonuses to drive customer behavior.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {rules.map((rule) => {
                    const isCategory = rule.type === "CATEGORY_MULTIPLIER";
                    const isSpend = rule.type === "MIN_SPEND_BONUS";
                    const isWeekend = rule.type === "WEEKEND_MULTIPLIER";

                    let badgeColor = "";
                    let typeLabel = "";
                    let valueDisplay = "";

                    if (isCategory) {
                      badgeColor = "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400";
                      typeLabel = "Category Multiplier";
                      valueDisplay = `${Number(rule.value)}x Points`;
                    } else if (isSpend) {
                      badgeColor = "bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400";
                      typeLabel = "Min Spend Bonus";
                      valueDisplay = `+${Number(rule.value).toLocaleString()} Points`;
                    } else if (isWeekend) {
                      badgeColor = "bg-purple-50 text-purple-600 dark:bg-purple-950/20 dark:text-purple-400";
                      typeLabel = "Weekend Multiplier";
                      valueDisplay = `${Number(rule.value)}x Points`;
                    }

                    return (
                      <div
                        key={rule.id}
                        className="bg-white dark:bg-slate-900 rounded-4xl p-6 border border-slate-200/50 dark:border-slate-850 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                      >
                        <div className="space-y-4">
                          <div className="flex justify-between items-start">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${badgeColor}`}>
                              {typeLabel}
                            </span>
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${
                                rule.isActive
                                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400"
                                  : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                              }`}
                            >
                              {rule.isActive ? "Active" : "Inactive"}
                            </span>
                          </div>

                          <div>
                            <h4 className="text-base font-black text-slate-900 dark:text-white line-clamp-1">{rule.name}</h4>
                            <p className="text-2xl font-black text-brand-600 dark:text-brand-400 font-mono mt-1">{valueDisplay}</p>
                          </div>

                          <div className="space-y-2 text-xs border-t border-slate-150 dark:border-slate-800 pt-3">
                            {isCategory && (
                              <p className="text-slate-500 dark:text-slate-400 flex items-start gap-1.5 font-mono text-[11px] break-all">
                                <span className="font-bold text-slate-700 dark:text-slate-350">Category ID:</span>
                                {rule.conditions?.categoryId || "Any"}
                              </p>
                            )}
                            {isSpend && (
                              <p className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                <span className="font-bold text-slate-700 dark:text-slate-350">Min Spend Required:</span>
                                <strong className="text-slate-800 dark:text-white font-mono">${(rule.conditions?.minSpend || rule.conditions?.threshold || 0).toLocaleString()}</strong>
                              </p>
                            )}
                            {isWeekend && (
                              <p className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                <span className="font-bold text-slate-700 dark:text-slate-350">Weekend Days:</span>
                                Saturday & Sunday
                              </p>
                            )}

                            {(rule.startDate || rule.endDate) && (
                              <div className="space-y-1 text-[11px] text-slate-400 dark:text-slate-500">
                                {rule.startDate && (
                                  <p className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" /> Start: {new Date(rule.startDate).toLocaleString()}
                                  </p>
                                )}
                                {rule.endDate && (
                                  <p className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" /> End: {new Date(rule.endDate).toLocaleString()}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2 justify-end mt-6 border-t border-slate-150 dark:border-slate-800 pt-3.5">
                          <button
                            onClick={() => handleOpenRuleModal(rule)}
                            className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all"
                            title="Edit Rule"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteRule(rule.id!)}
                            className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition-all"
                            title="Delete Rule"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Rule CRUD Modal */}
      {showRuleModal && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onClick={() => setShowRuleModal(false)} />
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/20 flex items-center justify-center text-brand-600">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">
                    {editingRule ? "Edit Loyalty Rule" : "Create Loyalty Rule"}
                  </h3>
                  <p className="text-xs text-slate-500">Configure parameters for custom point evaluations</p>
                </div>
              </div>
              <button
                onClick={() => setShowRuleModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRule} className="flex-1 overflow-y-auto p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Rule Name</label>
                <input
                  required
                  type="text"
                  placeholder="E.g., Double Points for Electronics"
                  value={ruleName}
                  onChange={(e) => setRuleName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all text-sm font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Rule Type</label>
                <select
                  value={ruleType}
                  onChange={(e) => setRuleType(e.target.value as LoyaltyRuleType)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all text-sm font-semibold"
                >
                  <option value="CATEGORY_MULTIPLIER">Category Multiplier</option>
                  <option value="MIN_SPEND_BONUS">Min Spend Bonus</option>
                  <option value="WEEKEND_MULTIPLIER">Weekend Multiplier</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  {ruleType === "MIN_SPEND_BONUS" ? "Bonus Points Amount" : "Multiplier Value (e.g. 1.5, 2.0)"}
                </label>
                <input
                  required
                  type="number"
                  step={ruleType === "MIN_SPEND_BONUS" ? "1" : "0.05"}
                  min="0.1"
                  value={ruleValue}
                  onChange={(e) => setRuleValue(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all text-sm font-mono font-semibold"
                />
              </div>

              {ruleType === "CATEGORY_MULTIPLIER" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Category ID (UUID)</label>
                  <input
                    required
                    type="text"
                    placeholder="Enter category UUID..."
                    value={ruleCategoryId}
                    onChange={(e) => setRuleCategoryId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all text-sm font-mono"
                  />
                </div>
              )}

              {ruleType === "MIN_SPEND_BONUS" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Min Spend Threshold ($)</label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={ruleMinSpend}
                    onChange={(e) => setRuleMinSpend(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all text-sm font-mono font-semibold"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Start Date (Optional)</label>
                  <input
                    type="datetime-local"
                    value={ruleStartDate}
                    onChange={(e) => setRuleStartDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all text-sm font-medium"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">End Date (Optional)</label>
                  <input
                    type="datetime-local"
                    value={ruleEndDate}
                    onChange={(e) => setRuleEndDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all text-sm font-medium"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="space-y-0.5">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-950 dark:text-white">Active Status</label>
                  <p className="text-[10px] text-slate-450">Active rules will apply during checkout.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setRuleIsActive(!ruleIsActive)}
                  className={`w-12 h-7 rounded-full transition-colors relative flex items-center p-1 ${
                    ruleIsActive ? "bg-brand-600" : "bg-slate-300 dark:bg-slate-700"
                  }`}
                >
                  <span
                    className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform ${
                      ruleIsActive ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowRuleModal(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 text-slate-650 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingRule}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black bg-brand-600 hover:bg-brand-700 text-white disabled:opacity-50 transition-all shadow-lg shadow-brand-500/10 uppercase tracking-wider"
                >
                  {submittingRule && <RefreshCw className="w-4 h-4 animate-spin" />}
                  {editingRule ? "Save Changes" : "Create Rule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
