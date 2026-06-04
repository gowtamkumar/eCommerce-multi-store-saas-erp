'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { getProfitAndLoss, getBalanceSheet, initializeAccounting } from "@/services/accounting";
import toast from "react-hot-toast";
import type { BalanceSheetData, FinancialView, ProfitLossSummary } from '../types';

export type { ProfitLossSummary, BalanceSheetData } from '../types';

export function useFinancialDashboard() {
    const searchParams = useSearchParams();
    const viewParam = searchParams.get("view");

    const [plData, setPlData] = useState<ProfitLossSummary | null>(null);
    const [bsData, setBsData] = useState<BalanceSheetData | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeView, setActiveView] = useState<FinancialView>(
        viewParam === "balance" ? "balance" : "overview"
    );
    const [initializing, setInitializing] = useState(false);

    useEffect(() => {
        setActiveView(viewParam === "balance" ? "balance" : "overview");
    }, [viewParam]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [plRes, bsRes] = await Promise.all([getProfitAndLoss(), getBalanceSheet()]);
            setPlData(plRes?.data || null);
            setBsData(bsRes?.data || null);
        } catch {
            // If 404, COA may not be initialized yet
            setPlData(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void fetchData();
    }, [fetchData]);

    const handleInit = useCallback(async () => {
        setInitializing(true);
        try {
            await initializeAccounting();
            toast.success("Chart of Accounts initialized!");
            await fetchData();
        } catch {
            toast.error("Initialization failed.");
        } finally {
            setInitializing(false);
        }
    }, [fetchData]);

    const grossMargin = plData ? (plData.grossProfit / (plData.revenue || 1)) * 100 : 0;
    const netMargin = plData ? (plData.netProfit / (plData.revenue || 1)) * 100 : 0;
    const isProfitable = (plData?.netProfit || 0) >= 0;

    return {
        plData,
        bsData,
        loading,
        activeView,
        setActiveView,
        initializing,
        fetchData,
        handleInit,
        grossMargin,
        netMargin,
        isProfitable,
    };
}
