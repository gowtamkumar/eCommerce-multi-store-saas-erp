"use client";

import { useSettings } from "@/contexts/SettingsContext";
import { fetchAPI } from "@/lib/api";
import { Check, X } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface ReturnRequest {
  id: string;
  orderId: string;
  status: string;
  reason: string;
  users: {
    name: string;
    email: string;
  };
  order: {
    id: string;
    customerName: string;
  };
  items: any[];
  createdAt: string;
  adminComment?: string;
}

export default function ReturnsPage() {
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { formatPrice } = useSettings();

  useEffect(() => {
    fetchReturns();
  }, []);

  const fetchReturns = async () => {
    try {
      const res = await fetchAPI("/returns");
      console.log("returns", res);
      if (Array.isArray(res.data)) {
        setReturns(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch returns", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    if (!confirm(`Are you sure you want to mark this as ${status}?`)) return;

    try {
      const res = await fetchAPI(`/returns/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });

      if (res.id) {
        toast.success(`Return request ${status}`);
        fetchReturns();
      } else {
        toast.error("Failed to update status");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  if (loading) return <div className="p-8">Loading returns...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
        Return Requests
      </h1>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 text-sm">
                <th className="p-4 font-medium">Order ID</th>
                <th className="p-4 font-medium">Customer</th>
                <th className="p-4 font-medium">Items</th>
                <th className="p-4 font-medium">Reason</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {returns.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No return requests found.
                  </td>
                </tr>
              ) : (
                returns.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="p-4 font-mono text-sm">
                      #{req.order?.id?.slice(-8).toUpperCase() || "N/A"}
                    </td>
                    <td className="p-4 text-sm">
                      <div className="font-medium text-slate-900 dark:text-white">
                        {req.order?.customerName || "Unknown"}
                      </div>
                      <div className="text-xs text-slate-500">
                        {req.users?.email}
                      </div>
                    </td>
                    <td className="p-4 text-sm max-w-xs">
                      <div className="space-y-1">
                        {req.items.map((item, i) => (
                          <div key={i} className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded inline-block mr-1">
                            Qty: {item.quantity}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-600 dark:text-slate-300">
                      {req.reason}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${req.status === "approved"
                          ? "bg-green-100 text-green-700"
                          : req.status === "rejected"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                          }`}
                      >
                        {req.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-slate-500">
                      {new Date(req.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      {req.status === "pending" && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleStatusUpdate(req.id, "approved")}
                            className="p-1.5 bg-green-100 text-green-600 rounded hover:bg-green-200 transition-colors"
                            title="Approve"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(req.id, "rejected")}
                            className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                            title="Reject"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
