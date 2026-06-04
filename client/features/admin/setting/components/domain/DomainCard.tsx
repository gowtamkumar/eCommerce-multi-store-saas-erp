"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Loader2, Star, Trash2 } from "lucide-react";
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

export function DomainCard({
  domain,
  verifyingId,
  removingId,
  primaryId,
  onVerify,
  onRemove,
  onSetPrimary,
}: DomainCardProps) {
  const isActive = domain.status === "active";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="p-6 bg-slate-50 dark:bg-slate-900/40 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold text-slate-800 dark:text-slate-200 font-mono">
              {domain.hostname}
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${isActive ? "bg-green-100 text-green-600 dark:bg-green-900/30" : "bg-amber-100 text-amber-600 dark:bg-amber-900/30"}`}>
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

        <div className="flex items-center gap-3">
          {isActive && !domain.isPrimary && (
            <button
              type="button"
              onClick={() => onSetPrimary(domain.id)}
              disabled={!!primaryId}
              className="px-3.5 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-brand-500/50 hover:text-brand-600 text-xs font-bold rounded-xl transition-all flex items-center gap-2"
            >
              {primaryId === domain.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Star className="w-3.5 h-3.5" />}
              Make Primary
            </button>
          )}

          {!isActive && (
            <button
              type="button"
              onClick={() => onVerify(domain.id)}
              disabled={!!verifyingId}
              className="px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-brand-500/20 flex items-center gap-2"
            >
              {verifyingId === domain.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              Verify DNS
            </button>
          )}

          <button
            type="button"
            onClick={() => onRemove(domain.id)}
            disabled={!!removingId}
            className="p-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-900/30 text-rose-600 rounded-xl transition-all flex items-center justify-center"
          >
            {removingId === domain.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {!isActive && domain.verificationToken && (
        <div className="mt-4 p-5 bg-amber-500/5 border border-amber-500/10 rounded-2xl space-y-3">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-amber-100 text-amber-700 dark:bg-amber-950/30">
              Verification Required
            </span>
            <span className="text-xs text-slate-500">
              Create a <strong>TXT</strong> record at your domain registrar to verify ownership:
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/50 dark:border-slate-800">
            <div>
              <span className="text-[9px] text-slate-400 block font-sans">Type</span>
              <span className="font-bold text-slate-700 dark:text-slate-300">TXT</span>
            </div>
            <div>
              <span className="text-[9px] text-slate-400 block font-sans">Host / Name</span>
              <span className="font-bold text-slate-700 dark:text-slate-300 break-all">_omnicart-verify.{domain.hostname}</span>
            </div>
            <div>
              <span className="text-[9px] text-slate-400 block font-sans">Value / Content</span>
              <span className="font-bold text-slate-700 dark:text-slate-300 break-all select-all">{domain.verificationToken}</span>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
