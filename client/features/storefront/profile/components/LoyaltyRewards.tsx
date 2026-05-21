"use client";

import { useEffect, useState } from "react";
import { getMyLoyalty, MyLoyaltySummary } from "@/services/loyalty";
import { Award, Copy, Check, Gift, RefreshCw, Calendar, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { motion } from "framer-motion";

export default function LoyaltyRewards() {
  const [data, setData] = useState<MyLoyaltySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
    loadLoyaltyData();
  }, []);

  const loadLoyaltyData = async () => {
    setLoading(true);
    setError("");
    try {
      const summary = await getMyLoyalty();
      setData(summary);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load loyalty profile");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, setCopiedState: (val: boolean) => void) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedState(true);
      setTimeout(() => setCopiedState(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 space-y-4">
        <RefreshCw className="w-8 h-8 text-brand-600 animate-spin" />
        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest animate-pulse">Loading Loyalty Account...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 rounded-2xl">
        <p className="text-rose-600 dark:text-rose-400 font-bold mb-4">{error || "Failed to retrieve loyalty data"}</p>
        <button
          onClick={loadLoyaltyData}
          className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  const referralLink = `${origin}/register?ref=${data.referralCode}`;

  // Multiplier mapping
  const tierMultipliers: Record<string, string> = {
    BRONZE: "1.0x",
    SILVER: "1.1x",
    GOLD: "1.25x",
    PLATINUM: "1.5x",
  };

  const tierColors: Record<string, { bg: string; text: string; border: string; glow: string }> = {
    BRONZE: {
      bg: "bg-orange-50 dark:bg-orange-950/20",
      text: "text-orange-600 dark:text-orange-400",
      border: "border-orange-200/50 dark:border-orange-900/30",
      glow: "shadow-[0_0_15px_rgba(234,88,12,0.15)]",
    },
    SILVER: {
      bg: "bg-slate-50 dark:bg-slate-900/20",
      text: "text-slate-600 dark:text-slate-300",
      border: "border-slate-200/50 dark:border-slate-800/30",
      glow: "shadow-[0_0_15px_rgba(148,163,184,0.15)]",
    },
    GOLD: {
      bg: "bg-amber-50 dark:bg-amber-950/20",
      text: "text-amber-600 dark:text-amber-400",
      border: "border-amber-200/50 dark:border-amber-900/30",
      glow: "shadow-[0_0_15px_rgba(217,119,6,0.2)]",
    },
    PLATINUM: {
      bg: "bg-purple-50 dark:bg-purple-950/20",
      text: "text-purple-600 dark:text-purple-400",
      border: "border-purple-200/50 dark:border-purple-900/30",
      glow: "shadow-[0_0_15px_rgba(147,51,234,0.2)]",
    },
  };

  const currentColors = tierColors[data.membershipTier] || tierColors.BRONZE;

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Tier & Balance Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tier Card */}
        <div className={`col-span-1 lg:col-span-2 p-6 rounded-[2rem] border ${currentColors.border} ${currentColors.bg} ${currentColors.glow} relative overflow-hidden flex flex-col justify-between min-h-[160px]`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 blur-[50px] -mr-16 -mt-16" />
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Membership Class</span>
              <h4 className={`text-3xl font-black mt-1 ${currentColors.text}`}>{data.membershipTier}</h4>
            </div>
            <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200/50 dark:border-slate-800">
              <Award className={`w-8 h-8 ${currentColors.text}`} />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-200/30 dark:border-slate-800/30 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Tier Multiplier Boost</span>
            <span className={`text-sm font-black ${currentColors.text}`}>{tierMultipliers[data.membershipTier] || "1.0x"} Points</span>
          </div>
        </div>

        {/* Balance Card */}
        <div className="p-6 rounded-[2rem] bg-gradient-to-br from-brand-600 to-indigo-600 shadow-xl shadow-brand-500/10 text-white flex flex-col justify-between min-h-[160px]">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-brand-200">Current Balance</span>
            <h4 className="text-4xl font-black mt-1 font-mono">{data.pointsBalance.toLocaleString()}</h4>
          </div>
          <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
            <span className="text-xs font-bold text-brand-200">Redeemable discount</span>
            <span className="text-sm font-black bg-white/15 px-3 py-1 rounded-full font-mono">${data.currencyValue.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Referrals Program section */}
      {data.referralCode && (
        <div className="p-6 md:p-8 rounded-[2rem] bg-slate-50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 blur-[50px] -mr-16 -mt-16" />
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-brand-50 dark:bg-brand-900/20 rounded-2xl">
              <Gift className="w-6 h-6 text-brand-600 dark:text-brand-400" />
            </div>
            <div>
              <h4 className="text-lg font-black text-slate-900 dark:text-white">Invite Friends & Earn Rewards</h4>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1 max-w-xl leading-relaxed">
                Invite friends to register. When they place their first purchase matching or exceeding the program minimum, you will instantly receive your bonus reward!
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Referral Code Box */}
            <div className="p-4 bg-white dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Your Code</p>
                <p className="text-base font-black text-slate-900 dark:text-white mt-0.5 tracking-wider font-mono">{data.referralCode}</p>
              </div>
              <button
                onClick={() => copyToClipboard(data.referralCode, setCopiedCode)}
                className="p-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-850 rounded-xl transition-all border border-slate-100 dark:border-slate-800 flex items-center justify-center"
              >
                {copiedCode ? <Check className="w-4 h-4 text-green-500 animate-scale" /> : <Copy className="w-4 h-4 text-slate-500" />}
              </button>
            </div>

            {/* Referral Link Box */}
            <div className="p-4 bg-white dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
              <div className="overflow-hidden flex-1 mr-2">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Referral Link</p>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5 truncate font-mono">{referralLink}</p>
              </div>
              <button
                onClick={() => copyToClipboard(referralLink, setCopiedLink)}
                className="p-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-850 rounded-xl transition-all border border-slate-100 dark:border-slate-800 flex items-center justify-center shrink-0"
              >
                {copiedLink ? <Check className="w-4 h-4 text-green-500 animate-scale" /> : <Copy className="w-4 h-4 text-slate-500" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Point History / Logs */}
      <div className="space-y-4">
        <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider text-xs">Points ledger history</h4>
        
        {data.history.length === 0 ? (
          <div className="p-12 text-center bg-slate-55 dark:bg-slate-900/20 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
            <Calendar className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-500">No point logs available</p>
            <p className="text-xs text-slate-400 mt-1">Earn points by purchasing items in our catalog.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-[1.5rem] border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-950">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50 text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-100 dark:border-slate-800">
                  <th className="px-6 py-4">Transaction Date</th>
                  <th className="px-6 py-4">Adjustment Cause</th>
                  <th className="px-6 py-4">Notes</th>
                  <th className="px-6 py-4 text-right">Points Changed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {data.history.map((entry) => {
                  const isEarn = entry.points > 0;
                  return (
                    <tr key={entry.id} className="text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                      <td className="px-6 py-4 font-medium font-mono text-slate-500">
                        {new Date(entry.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                          isEarn
                            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400"
                            : "bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400"
                        }`}>
                          {isEarn ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                          {entry.type.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400 max-w-xs truncate">
                        {entry.note || "No comments"}
                      </td>
                      <td className={`px-6 py-4 text-right font-black font-mono text-sm ${
                        isEarn ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                      }`}>
                        {isEarn ? "+" : ""}{entry.points.toLocaleString()}
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
  );
}
