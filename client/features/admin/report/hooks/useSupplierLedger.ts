"use client";

import { fetchAPI } from "@/services/api";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import type { SupplierLedgerData, SupplierOption } from "../types";
import { useReportExport } from "./useReportExport";

export function useSupplierLedger() {
  const [suppliers, setSuppliers] = useState<SupplierOption[]>([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState("");
  const [ledgerData, setLedgerData] = useState<SupplierLedgerData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const { exportReport, isExporting } = useReportExport();

  const searchParams = useSearchParams();

  useEffect(() => {
    const loadSuppliers = async () => {
      try {
        const res = await fetchAPI("/suppliers");
        setSuppliers(res?.data?.items || []);

        const supplierIdParam = searchParams.get("supplierId");
        if (supplierIdParam) {
          setSelectedSupplierId(supplierIdParam);
        }
      } catch (error) {
        console.error("Failed to load suppliers", error);
        toast.error("Failed to load suppliers");
      } finally {
        setIsInitialLoading(false);
      }
    };
    void loadSuppliers();
  }, [searchParams]);

  const fetchLedger = useCallback(async (supplierId: string) => {
    if (!supplierId) {
      setLedgerData(null);
      return;
    }
    try {
      setIsLoading(true);
      const res = await fetchAPI(`/report/supplier-ledger/${supplierId}`);
      setLedgerData(res?.data || null);
    } catch (error) {
      console.error("Ledger fetch error:", error);
      toast.error("Failed to load ledger data");
      setLedgerData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedSupplierId) {
      void fetchLedger(selectedSupplierId);
    } else {
      setLedgerData(null);
    }
  }, [selectedSupplierId, fetchLedger]);

  const handleSupplierChange = useCallback((id: string) => {
    setSelectedSupplierId(id);
  }, []);

  const handleExportCsv = useCallback(() => {
    if (!selectedSupplierId) return;
    void exportReport({
      type: "supplier-ledger",
      supplierId: selectedSupplierId,
    });
  }, [exportReport, selectedSupplierId]);

  return {
    suppliers,
    selectedSupplierId,
    ledgerData,
    isLoading,
    isInitialLoading,
    isExporting,
    handleSupplierChange,
    handleExportCsv,
  };
}
