"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  RefreshCcw,
  Star,
  Trash2,
} from "lucide-react";
import type { TenantDomain } from "../../types/domain";

interface DomainCardProps {
  domain: TenantDomain;
  verifyingId: string | null;
  removingId: string | null;
  primaryId: string | null;
  onVerify: (domainId: string) => void;
  onRemove: (domainId: string) => void;
  onSetPrimary: (domainId: string) => void;
}

const STATUS_BADGE: Record<string, string> = {
  active:   "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  verified: "bg-sky-100    text-sky-700    dark:bg-sky-900/30    dark:text-sky-400",
  pending:  "bg-amber-100  text-amber-700  dark:bg-amber-900/30  dark:text-amber-400",
  failed:   "bg-rose-100   text-rose-700   dark:bg-rose-900/30   dark:text-rose-400",
};

export function DomainCard({
  domain,
  verifyingId,
  removingId,
  primaryId,
  onVerify,
  onRemove,
  onSetPrimary,
}: DomainCardProps) {
  const isActive  = domain.status === "active";
  const isFailed  = domain.status === "failed";
  const isPending = domain.status === "pending" || domain.status === "verified";
  const badgeClass  = STATUS_BADGE[domain.status] ?? STATUS_BADGE.pending;
  const isVerifying = verifyingId === domain.id;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`p-6 bg-slate-50 dark:bg-slate-900/40 rounded-3xl border space-y-4 ${
        isFailed
          ? "border-rose-200 dark:border-rose-900/50"
          : "border-slate-100 dark:border-slate-800"
      }`}
    >
      {/* ── Header row ─────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-base font-semibold text-slate-800 dark:text-slate-200 font-mono">
              {domain.hostname}
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${badgeClass}`}
            >
              {domain.status}
            </span>
            {domain.isPrimary && (
              <span className="px-2 py-0.5 rounded bg-brand-100 text-brand-600 dark:bg-brand-900/40 text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                <Star className="w-2.5 h-2.5 fill-current" /> Primary
              </span>
            )}
          </div>
          {domain.createdAt && (
            <p className="text-xs text-slate-400">
              Added on {new Date(domain.createdAt).toLocaleDateString()}
            </p>
          )}
        </div>

        {/* ── Action buttons ──────────────────────────────────── */}
        <div className="flex items-center gap-3">
          {isActive && !domain.isPrimary && (
            <button
              type="button"
              onClick={() => onSetPrimary(domain.id)}
              disabled={!!primaryId}
              className="px-3.5 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-brand-500/50 hover:text-brand-600 text-xs font-bold rounded-xl transition-all flex items-center gap-2"
            >
              {primaryId === domain.id ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Star className="w-3.5 h-3.5" />
              )}
              Make Primary
            </button>
          )}

          {(isPending || isFailed) && (
            <button
              type="button"
              onClick={() => onVerify(domain.id)}
              disabled={!!verifyingId}
              className={`px-3.5 py-2 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-2 ${
                isFailed
                  ? "bg-rose-600 hover:bg-rose-700 shadow-rose-500/20"
                  : "bg-brand-600 hover:bg-brand-700 shadow-brand-500/20"
              }`}
            >
              {isVerifying ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : isFailed ? (
                <RefreshCcw className="w-3.5 h-3.5" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5" />
              )}
              {isFailed ? "Retry Verify" : "Verify DNS"}
            </button>
          )}

          <button
            type="button"
            onClick={() => onRemove(domain.id)}
            disabled={!!removingId}
            className="p-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-900/30 text-rose-600 rounded-xl transition-all flex items-center justify-center"
          >
            {removingId === domain.id ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* ── Pending: TXT instruction banner ────────────────────── */}
      {!isActive && !isFailed && domain.verificationToken && (
        <div className="p-5 bg-amber-500/5 border border-amber-500/10 rounded-2xl space-y-3">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-amber-100 text-amber-700 dark:bg-amber-950/30">
              Verification Required
            </span>
            <span className="text-xs text-slate-500">
              Create a <strong>TXT</strong> record at your DNS provider:
            </span>
          </div>
          <DnsTxtTable hostname={domain.hostname} token={domain.verificationToken} variant="amber" />
        </div>
      )}

      {/* ── Failed: error + TXT instruction banner ─────────────── */}
      {isFailed && (
        <div className="p-5 bg-rose-500/5 border border-rose-500/15 rounded-2xl space-y-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-rose-700 dark:text-rose-400">
                DNS Verification Failed
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                The TXT record was not found or did not match. Confirm the record
                below is live at your registrar, then click{" "}
                <strong>Retry Verify</strong>.
              </p>
            </div>
          </div>
          {domain.verificationToken && (
            <DnsTxtTable hostname={domain.hostname} token={domain.verificationToken} variant="rose" />
          )}
        </div>
      )}
    </motion.div>
  );
}

/* ─── Shared DNS table sub-component ──────────────────────────────────────── */
function DnsTxtTable({
  hostname,
  token,
  variant,
}: {
  hostname: string;
  token: string;
  variant: "amber" | "rose";
}) {
  const border =
    variant === "rose"
      ? "border-rose-200/50 dark:border-rose-900/30"
      : "border-slate-200/50 dark:border-slate-800";

  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono p-3 bg-white dark:bg-slate-900 rounded-xl border ${border}`}
    >
      <div>
        <span className="text-[9px] text-slate-400 block font-sans">Type</span>
        <span className="font-bold text-slate-700 dark:text-slate-300">TXT</span>
      </div>
      <div>
        <span className="text-[9px] text-slate-400 block font-sans">Host / Name</span>
        <span className="font-bold text-slate-700 dark:text-slate-300 break-all">
          _omnicart-verify.{hostname}
        </span>
      </div>
      <div>
        <span className="text-[9px] text-slate-400 block font-sans">Value / Content</span>
        <span className="font-bold text-slate-700 dark:text-slate-300 break-all select-all">
          {token}
        </span>
      </div>
    </div>
  );
}
