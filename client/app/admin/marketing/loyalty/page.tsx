"use client";

import { getCustomerLoyaltyHistory, getLoyaltyConfig, LoyaltyConfig, LoyaltyLedgerEntry, manualCreditPoints, manualDebitPoints, updateLoyaltyConfig } from "@/services/loyalty";
import { ArrowDownRight, ArrowUpRight, RefreshCw, Save, Users } from "lucide-react";
import { useEffect, useState } from "react";

export default function AdminLoyaltyPage() {
  const [activeSubTab, setActiveSubTab] = useState<"rules" | "adjust">("rules");
  const [config, setConfig] = useState<LoyaltyConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

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

  const loadConfig = async () => {
    setLoading(true);
    try {
      const data = await getLoyaltyConfig();
      setConfig(data);
    } catch (err: any) {
      console.error(err);
      setMessage({ text: err.message || "Failed to load loyalty settings", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;
    setSaving(true);
    setMessage({ text: "", type: "" });
    try {
      const updated = await updateLoyaltyConfig(config);
      setConfig(updated);
      setMessage({ text: "Loyalty program settings updated successfully!", type: "success" });
    } catch (err: any) {
      console.error(err);
      setMessage({ text: err.message || "Failed to save settings", type: "error" });
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
    } catch (err: any) {
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
    } catch (err: any) {
      console.error(err);
      setAdjustMessage({ text: err.message || "Adjustment failed", type: "error" });
    } finally {
      setLoadingHistory(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase tracking-wider text-2xl">
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
                        onChange={(e: any) => setConfig({ ...config, referralRewardType: e.target.value })}
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
                      Input a valid customer ID in the balance adjustment tool and click "Find" or perform adjustments to view their immutable transaction logs.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-[1.5rem] border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-950">
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
        </>
      )}
    </div>
  );
}
