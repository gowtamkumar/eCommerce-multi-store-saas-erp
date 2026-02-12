"use client";

import { useSettings } from "@/hooks/SettingsContext";
import { fetchAPI } from "@/services/api";
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
    items?: any[];
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

  const [selectedReturn, setSelectedReturn] = useState<ReturnRequest | null>(null);

  const handleStatusUpdate = async (id: string, status: string, comment?: string) => {
    try {
      const res = await fetchAPI(`/returns/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status, comment }),
      });


      if (res.id) {
        toast.success(`Return request ${status}`);
        fetchReturns();
        setSelectedReturn(null);
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
                            : req.status === "refunded"
                              ? "bg-blue-100 text-blue-700"
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
                      <button
                        onClick={() => setSelectedReturn(req)}
                        className="text-brand-600 hover:text-brand-700 font-medium text-sm"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Return Details Modal */}
      {selectedReturn && (
        <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-white/10 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Return Request Details
              </h3>
              <button
                onClick={() => setSelectedReturn(null)}
                className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="bg-slate-50 dark:bg-slate-700/30 p-4 rounded-xl space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Order ID:</span>
                  <span className="font-mono font-medium text-slate-900 dark:text-white">
                    #{selectedReturn.order?.id?.slice(-8).toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Customer:</span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {selectedReturn.order?.customerName}
                  </span>
                </div>
                <div className="flex justify-between text-sm items-center">
                  <span className="text-slate-500 dark:text-slate-400">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${selectedReturn.status === "approved" ? "bg-green-100 text-green-700" :
                    selectedReturn.status === "rejected" ? "bg-red-100 text-red-700" :
                      selectedReturn.status === "refunded" ? "bg-blue-100 text-blue-700" :
                        "bg-yellow-100 text-yellow-700"
                    }`}>
                    {selectedReturn.status}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-3">Items Being Returned</h4>
                <div className="space-y-3">
                  {selectedReturn.items.map((returnItem: any, index: number) => {
                    // Find the actual order item to get product details
                    const orderItem = selectedReturn.order?.items?.find(
                      (oi: any) => oi.productId === returnItem.productId &&
                        (oi.variantId === returnItem.variantId || (!oi.variantId && !returnItem.variantId))
                    );

                    const productName = orderItem?.product?.name || "Product Unavailable";
                    const productImage = orderItem?.product?.images?.[0];
                    const variantSku = orderItem?.variant?.sku;
                    const variantOptions = orderItem?.variant?.combination;

                    return (
                      <div key={index} className="flex gap-4 p-3 border border-slate-100 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900/30">
                        {productImage && (
                          <div className="w-16 h-16 flex-shrink-0 bg-white dark:bg-slate-800 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                            <img src={productImage} alt={productName} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-slate-900 dark:text-white text-sm">{productName}</p>
                          {variantSku && (
                            <p className="text-xs font-bold text-brand-600 uppercase mt-1">SKU: {variantSku}</p>
                          )}
                          {variantOptions && (
                            <p className="text-xs text-slate-500 italic mt-0.5">
                              {Object.entries(variantOptions).map(([key, value]) => `${key}: ${value}`).join(", ")}
                            </p>
                          )}
                          <p className="text-xs text-slate-500 mt-1">Quantity: {returnItem.quantity}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Reason</h4>
                <p className="text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg">
                  {selectedReturn.reason}
                </p>
              </div>

              {selectedReturn.status === "pending" && (
                <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                  <button
                    onClick={() => handleStatusUpdate(selectedReturn.id, "rejected")}
                    className="flex-1 py-3 bg-red-50 text-red-600 font-semibold rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" /> Reject Return
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(selectedReturn.id, "approved")}
                    className="flex-1 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" /> Approve Return
                  </button>
                </div>
              )}
              {selectedReturn.status === "approved" && (
                <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                  <button
                    onClick={() => handleStatusUpdate(selectedReturn.id, "refunded")}
                    className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" /> Mark as Refunded
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
