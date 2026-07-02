"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { fetchAPI } from "@/services/api";
import type { StoreDomain, StoreInfo } from "../types/domain";

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export function useDomainManager() {
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null);
  const [domainInput, setDomainInput] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [primaryId, setPrimaryId] = useState<string | null>(null);

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const response = await fetchAPI("/stores/info");
        setStoreInfo(response.data);
      } catch (error) {
        console.error("Failed to fetch store info", error);
      }
    };

    fetchStore();
  }, []);

  const addDomain = async () => {
    if (!domainInput) return;
    setIsUpdating(true);
    try {
      const response = await fetchAPI("/stores/custom-domain", {
        method: "PATCH",
        body: JSON.stringify({ customDomain: domainInput }),
      });
      setStoreInfo(response.data);
      setDomainInput("");
      toast.success("Custom domain added successfully!");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to add domain"));
    } finally {
      setIsUpdating(false);
    }
  };

  const verifyDomain = async (domainId: string) => {
    setVerifyingId(domainId);
    try {
      const response = await fetchAPI(`/stores/custom-domain/verify/${domainId}`, {
        method: "POST",
      });
      setStoreInfo(response.data);
      toast.success("Domain verified successfully!");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Verification failed"));
    } finally {
      setVerifyingId(null);
    }
  };

  const removeDomain = async (domainId: string) => {
    if (!confirm("Are you sure you want to remove this custom domain? This will stop all traffic routing to it.")) return;
    setRemovingId(domainId);
    try {
      const response = await fetchAPI(`/stores/custom-domain/${domainId}`, {
        method: "DELETE",
      });
      setStoreInfo(response.data);
      toast.success("Custom domain removed!");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to remove domain"));
    } finally {
      setRemovingId(null);
    }
  };

  const setPrimaryDomain = async (domainId: string) => {
    setPrimaryId(domainId);
    try {
      const response = await fetchAPI(`/stores/custom-domain/primary/${domainId}`, {
        method: "PATCH",
      });
      setStoreInfo(response.data);
      toast.success("Primary domain updated!");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to set primary domain"));
    } finally {
      setPrimaryId(null);
    }
  };

  const domains = (storeInfo?.domains || []) as StoreDomain[];

  return {
    storeInfo,
    domains,
    domainInput,
    setDomainInput,
    isUpdating,
    verifyingId,
    removingId,
    primaryId,
    addDomain,
    verifyDomain,
    removeDomain,
    setPrimaryDomain,
  };
}
