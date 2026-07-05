"use client";

import { useEffect, useState } from "react";
import { fetchAPI } from "@/services/api";
import { Users, FileText, Truck, DollarSign } from "lucide-react";
import { PurchaseOrder } from "@/features/admin/purchase/types";
import { StatItem, ChartItem, ProductWithStock } from "../types";
import { useSettings } from "@/hooks/SettingsContext";
import { formatCurrency } from "@/lib/utils";

export function useProcurementDashboard() {
  const { selectedCurrency } = useSettings();
  const currencySymbol = selectedCurrency?.symbol || '$';
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StatItem[]>([
    { label: "Active Suppliers", value: "0", subValue: "Registered SRM Vendors", icon: Users, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
    { label: "Pending PRs", value: "0", subValue: "Requires SCM Approval", icon: FileText, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
    { label: "Open POs", value: "0", subValue: "$0 committed", icon: Truck, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-100" },
    { label: "YTD Spend", value: "$0", subValue: "Total committed spend", icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
  ]);
  const [chartData, setChartData] = useState<ChartItem[]>([
    { name: "Jan", spend: 0 },
    { name: "Feb", spend: 0 },
    { name: "Mar", spend: 0 },
    { name: "Apr", spend: 0 },
    { name: "May", spend: 0 },
    { name: "Jun", spend: 0 },
  ]);
  const [delayedShipments, setDelayedShipments] = useState<PurchaseOrder[]>([]);
  const [lowStockWarnings, setLowStockWarnings] = useState<ProductWithStock[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [timeframe, setTimeframe] = useState<"YTD" | "Last 12 Months">("YTD");

  useEffect(() => {
    const fetchSCMData = async () => {
      try {
        setLoading(true);
        const [suppliersRes, poRes, productsRes] = await Promise.all([
          fetchAPI("/suppliers?limit=100").catch(() => null),
          fetchAPI("/purchase-orders?limit=100").catch(() => null),
          fetchAPI("/products?limit=100").catch(() => null),
        ]);

        let activeSuppliersCount = 0;
        if (suppliersRes && suppliersRes.success) {
          activeSuppliersCount = suppliersRes.data?.total || suppliersRes.data?.items?.length || 0;
        }

        let openPOsCount = 0;
        let ytdSpend = 0;
        let pendingRequisitionsCount = 0;

        if (poRes && poRes.success) {
          const poList: PurchaseOrder[] = poRes.data?.items || poRes.data?.list || poRes.data || [];
          setPurchaseOrders(poList);
          poList.forEach((po: PurchaseOrder) => {
            const status = po.status?.toUpperCase() || "";
            if (status === "ORDERED" || status === "PENDING" || status === "DRAFT") {
              openPOsCount++;
            }
            if (status === "PENDING") {
              pendingRequisitionsCount++;
            }
            ytdSpend += Number(po.totalAmount || 0);
          });

          const activePOs = poList.filter((po: PurchaseOrder) => po.status?.toUpperCase() === "PENDING");
          const delayedPOs = activePOs.filter((po: PurchaseOrder) => po.deliveryDate && new Date(po.deliveryDate) < new Date());
          setDelayedShipments(delayedPOs);
        }

        if (productsRes && productsRes.success) {
          const productList: ProductWithStock[] = productsRes.data || [];
          const lowStockItems = productList.filter((p: ProductWithStock) => Number(p.stock || 0) <= Number(p.lowStockThreshold || 5));
          setLowStockWarnings(lowStockItems);
        }

        setStats([
          {
            label: "Active Suppliers",
            value: activeSuppliersCount.toString(),
            subValue: "Registered SRM Vendors",
            icon: Users,
            color: "text-blue-600",
            bg: "bg-blue-50",
            border: "border-blue-100",
          },
          {
            label: "Pending PRs",
            value: pendingRequisitionsCount.toString(),
            subValue: "Requires SCM Approval",
            icon: FileText,
            color: "text-amber-600",
            bg: "bg-amber-50",
            border: "border-amber-100",
          },
          {
            label: "Open POs",
            value: openPOsCount.toString(),
            subValue: `${formatCurrency(ytdSpend, currencySymbol)} committed`,
            icon: Truck,
            color: "text-purple-600",
            bg: "bg-purple-50",
            border: "border-purple-100",
          },
          {
            label: "YTD Spend",
            value: formatCurrency(ytdSpend, currencySymbol),
            subValue: "Total committed spend",
            icon: DollarSign,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
            border: "border-emerald-100",
          },
        ]);
      } catch (error) {
        console.error("Failed to load dynamic SCM dashboard metrics:", error);
      } finally {
        setLoading(false);
      }
    };

    void fetchSCMData();
  }, []);

  useEffect(() => {
    if (purchaseOrders.length === 0) return;

    const allMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const today = new Date();
    const monthsList: { label: string; monthIndex: number; year: number }[] = [];

    if (timeframe === "YTD") {
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth();
      const numMonths = Math.max(6, currentMonth + 1);
      for (let i = 0; i < numMonths; i++) {
        monthsList.push({
          label: allMonths[i],
          monthIndex: i,
          year: currentYear,
        });
      }
    } else {
      for (let i = 11; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        monthsList.push({
          label: d.toLocaleString("default", { month: "short" }),
          monthIndex: d.getMonth(),
          year: d.getFullYear(),
        });
      }
    }

    const updatedChartData = monthsList.map(({ label, monthIndex, year }) => {
      let spend = 0;
      purchaseOrders.forEach((po: PurchaseOrder) => {
        if (po.createdAt) {
          const poDate = new Date(po.createdAt);
          if (poDate.getMonth() === monthIndex && poDate.getFullYear() === year) {
            spend += Number(po.totalAmount || 0);
          }
        }
      });
      return {
        name: timeframe === "YTD" ? label : `${label} ${year.toString().slice(-2)}`,
        spend,
      };
    });

    setChartData(updatedChartData);
  }, [purchaseOrders, timeframe]);

  return {
    loading,
    stats,
    chartData,
    delayedShipments,
    lowStockWarnings,
    timeframe,
    setTimeframe,
  };
}
