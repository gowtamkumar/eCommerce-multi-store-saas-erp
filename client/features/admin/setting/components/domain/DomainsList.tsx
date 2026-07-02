"use client";

import { AnimatePresence } from "framer-motion";
import { Globe } from "lucide-react";
import type { StoreDomain } from "../../types/domain";
import { DomainCard } from "./DomainCard";

interface DomainsListProps {
  domains: StoreDomain[];
  verifyingId: string | null;
  removingId: string | null;
  primaryId: string | null;
  onVerify: (domainId: string) => void;
  onRemove: (domainId: string) => void;
  onSetPrimary: (domainId: string) => void;
}

export function DomainsList(props: DomainsListProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
        Configured Domains
      </h3>

      {props.domains.length === 0 ? (
        <div className="p-8 text-center bg-slate-50 dark:bg-slate-900/40 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
          <Globe className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
          <p className="text-sm text-slate-500">No custom domains configured yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {props.domains.map((domain) => (
              <DomainCard
                key={domain.id}
                domain={domain}
                verifyingId={props.verifyingId}
                removingId={props.removingId}
                primaryId={props.primaryId}
                onVerify={props.onVerify}
                onRemove={props.onRemove}
                onSetPrimary={props.onSetPrimary}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
