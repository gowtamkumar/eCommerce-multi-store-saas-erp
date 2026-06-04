"use client";

import { motion } from "framer-motion";
import { useDomainManager } from "../hooks/useDomainManager";
import { AddDomainForm } from "./domain/AddDomainForm";
import { DnsInstructions } from "./domain/DnsInstructions";
import { DomainHeader } from "./domain/DomainHeader";
import { DomainsList } from "./domain/DomainsList";

export const DomainSetting = () => {
  const domain = useDomainManager();

  if (!domain.tenantInfo) {
    return <div className="animate-pulse h-64 bg-slate-100 dark:bg-slate-800 rounded-3xl" />;
  }

  return (
    <motion.div
      key="domain"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-8"
    >
      <DomainHeader />

      <div className="space-y-8">
        <DomainsList
          domains={domain.domains}
          verifyingId={domain.verifyingId}
          removingId={domain.removingId}
          primaryId={domain.primaryId}
          onVerify={domain.verifyDomain}
          onRemove={domain.removeDomain}
          onSetPrimary={domain.setPrimaryDomain}
        />

        <AddDomainForm
          domainInput={domain.domainInput}
          isUpdating={domain.isUpdating}
          onDomainInputChange={domain.setDomainInput}
          onAddDomain={domain.addDomain}
        />

        <DnsInstructions />
      </div>
    </motion.div>
  );
};