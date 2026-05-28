import { fetchAPI } from "@/services/api";
import {
  convertPRToPO,
  createRequisition,
  deleteRequisition,
  getRequisitions,
  getSuppliers,
  updateRequisitionStatus,
} from "@/services/procurement";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  Clock,
  FileSpreadsheet,
  FileText,
  Plus,
  Save,
  Search,
  Trash2,
  X
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Supplier } from '@/features/admin/supplier/types';
import { Product } from '@/features/admin/product/types';
import { PR } from '@/features/admin/procurement/types';


export default function RequisitionBoard() {
  const [prs, setPrs] = useState<PR[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedPr, setSelectedPr] = useState<PR | null>(null);

  // Convert to PO state
  const [convertModalOpen, setConvertModalOpen] = useState(false);
  const [prToConvert, setPrToConvert] = useState<PR | null>(null);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState("");
  const [poReference, setPoReference] = useState("");

  // Form states
  const [justification, setJustification] = useState("");
  const [requiredDate, setRequiredDate] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedQty, setSelectedQty] = useState(1);
  const [selectedNotes, setSelectedNotes] = useState("");
  const [addedItems, setAddedItems] = useState<
    { productId: string; name: string; quantity: number; notes?: string }[]
  >([]);

  const fetchPRs = async () => {
    try {
      setLoading(true);
      const data = await getRequisitions();
      // Debug: log fetched PRs to inspect items payload

      console.debug('Fetched PRs from API:', data);
      setPrs(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load requisitions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPRs();

    // Fetch products for creation
    fetchAPI("/products?limit=100")
      .then((res) => {
        setProducts(res?.data || []);
      })
      .catch((err) => console.error("Failed to load products:", err));

    // Fetch suppliers for PO conversion
    getSuppliers()
      .then((data) => setSuppliers(data))
      .catch((err) => console.error("Failed to load suppliers:", err));
  }, []);

  const columns = [
    { id: "DRAFT", title: "Drafts", color: "slate", dot: "bg-slate-500" },
    {
      id: "PENDING_APPROVAL",
      title: "Pending Approval",
      color: "amber",
      dot: "bg-amber-500",
    },
    {
      id: "APPROVED",
      title: "Approved",
      color: "emerald",
      dot: "bg-emerald-500",
    },
    {
      id: "PO_CREATED",
      title: "PO Generated",
      color: "indigo",
      dot: "bg-indigo-500",
    },
    { id: "REJECTED", title: "Rejected", color: "rose", dot: "bg-rose-500" },
  ];

  const filteredPRs = useMemo(() => {
    return prs.filter(
      (pr) =>
        pr.prNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (pr.justification &&
          pr.justification.toLowerCase().includes(searchQuery.toLowerCase())),
    );
  }, [prs, searchQuery]);

  const handleAddItem = () => {
    if (!selectedProductId) {
      toast.error("Select a product first");
      return;
    }
    const product = products.find((p) => String(p.id) === String(selectedProductId));
    if (!product) return;

    if (addedItems.some((item) => String(item.productId) === String(selectedProductId))) {
      toast.error("Product already added");
      return;
    }

    setAddedItems([
      ...addedItems,
      {
        productId: String(selectedProductId),
        name: product.name,
        quantity: selectedQty,
        notes: selectedNotes,
      },
    ]);

    setSelectedProductId("");
    setSelectedQty(1);
    setSelectedNotes("");
  };

  const handleRemoveItem = (index: number) => {
    setAddedItems(addedItems.filter((_, i) => i !== index));
  };

  const handleCreatePR = async (e: React.FormEvent) => {
    e.preventDefault();

    const finalItems = [...addedItems];

    // Debug: log current items state to help reproduce empty-items issues
    // (remove once root cause is validated)

    console.debug('Creating PR - addedItems:', addedItems, 'selectedProductId:', selectedProductId);

    // Automatically add the currently selected product if the user forgot to click "Add"
    if (selectedProductId) {
      const product = products.find((p) => String(p.id) === String(selectedProductId));
      if (product && !addedItems.some((item) => String(item.productId) === String(selectedProductId))) {
        finalItems.push({
          productId: String(selectedProductId),
          name: product.name,
          quantity: selectedQty,
          notes: selectedNotes,
        });
      }
    }

    if (finalItems.length === 0) {
      toast.error("Add at least one product");
      return;
    }
    if (!requiredDate) {
      toast.error("Please enter a required date");
      return;
    }

    try {
      await createRequisition({
        justification,
        requiredDate: new Date(requiredDate).toISOString(),
        items: finalItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          notes: item.notes,
        })),
      });

      toast.success("Requisition submitted as Draft");
      setIsCreateOpen(false);
      setJustification("");
      setRequiredDate("");
      setAddedItems([]);
      setSelectedProductId("");
      setSelectedQty(1);
      setSelectedNotes("");
      fetchPRs();
    } catch (err) {
      console.error(err);
      toast.error("Failed to create requisition");
    }
  };

  const handleMovePR = async (id: string, newStatus: string) => {
    try {
      let rejectionReason = undefined;
      if (newStatus === "REJECTED") {
        const reason = prompt("Please specify a rejection reason (optional):");
        if (reason === null) return; // User cancelled the operation
        rejectionReason = reason || undefined;
      }
      await updateRequisitionStatus(id, newStatus, rejectionReason);
      toast.success(`Stage updated successfully`);
      fetchPRs();
      if (selectedPr && selectedPr.id === id) {
        setSelectedPr((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update stage");
    }
  };

  const handleConvertPR = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prToConvert || !selectedSupplierId) return;

    try {
      await convertPRToPO(
        prToConvert.id,
        selectedSupplierId,
        poReference || `PO-PR-${prToConvert.prNumber}`,
      );
      toast.success("Converted to Purchase Order successfully");
      setConvertModalOpen(false);
      setPrToConvert(null);
      fetchPRs();
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? (err as Error & { response?: { message?: string } }).response?.message || err.message : 'Failed to convert to PO';
      toast.error(msg);
    }
  };

  const handleDeletePR = async (id: string) => {
    if (!confirm("Are you sure you want to delete this requisition?")) return;
    try {
      await deleteRequisition(id);
      toast.success("Requisition deleted successfully");
      setSelectedPr(null);
      fetchPRs();
    } catch (err) {
      console.error(err);
      toast.error(
        "Failed to delete requisition. Requisitions must be in Draft or Rejected status.",
      );
    }
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 shrink-0">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight italic uppercase">
            Purchase <span className="text-indigo-600">Requisitions</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">
            Internal Sourcing Requests
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group hidden md:block w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500" />
            <input
              type="text"
              placeholder="Search PR..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all shadow-sm"
            />
          </div>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-colors shadow-lg flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> New PR
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      ) : (
        /* Kanban Board */
        <div className="flex-1 flex flex-col sm:flex-row gap-6 overflow-x-auto pb-4 custom-scrollbar items-stretch">
          {columns.map((col) => (
            <div
              key={col.id}
              className="w-full sm:w-[310px] shrink-0 flex flex-col bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] border border-slate-100 dark:border-slate-700/50"
            >
              {/* Column Header */}
              <div className="p-6 pb-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-700/50">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${col.dot} shadow-lg shadow-indigo-500/10`}
                  />
                  <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">
                    {col.title}
                  </h3>
                </div>
                <span className="px-2.5 py-1 bg-white dark:bg-slate-800 rounded-lg text-[10px] font-black text-slate-500 shadow-sm border border-slate-100 dark:border-slate-700">
                  {filteredPRs.filter((pr) => pr.status === col.id).length}
                </span>
              </div>

              {/* Cards Area */}
              <div className="flex-1 p-4 space-y-4 overflow-y-auto custom-scrollbar">
                <AnimatePresence>
                  {filteredPRs
                    .filter((pr) => pr.status === col.id)
                    .map((pr, i) => (
                      <motion.div
                        key={pr.id}
                        layoutId={pr.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => setSelectedPr(pr)}
                        className="bg-white dark:bg-slate-800 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md hover:border-indigo-100 dark:hover:border-indigo-900/50 transition-all cursor-pointer group"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded-md">
                            {pr.prNumber}
                          </span>
                          <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            {col.id === "DRAFT" && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMovePR(pr.id, "PENDING_APPROVAL");
                                }}
                                className="p-1 text-slate-400 hover:text-indigo-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                title="Submit for Approval"
                              >
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {col.id === "APPROVED" && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPrToConvert(pr);
                                  setPoReference(`PO-${pr.prNumber}`);
                                  setConvertModalOpen(true);
                                }}
                                className="p-1 text-slate-400 hover:text-indigo-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                title="Convert to Purchase Order"
                              >
                                <FileSpreadsheet className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {(col.id === "DRAFT" || col.id === "REJECTED") && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeletePR(pr.id);
                                }}
                                className="p-1 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                title="Delete Requisition"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        <h4 className="font-black text-slate-900 dark:text-white leading-tight mb-4 group-hover:text-indigo-600 transition-colors">
                          {pr.justification || "No justification provided"}
                        </h4>

                        <div className="flex items-center justify-between text-xs mb-4">
                          <div className="flex items-center gap-1.5 text-slate-500 font-bold uppercase text-[10px] tracking-widest">
                            <Clock className="w-3 h-3" /> Req:{" "}
                            {pr.requiredDate ? new Date(pr.requiredDate).toLocaleDateString() : 'N/A'}
                          </div>
                          <span className="font-black text-slate-700 dark:text-slate-300 font-mono">
                            {pr.items?.length || 0} Items
                          </span>
                        </div>

                        <div className="h-px bg-slate-100 dark:bg-slate-700 mb-4" />

                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {pr.requestedBy?.name || "Unknown User"}
                          </span>
                          <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 border-2 border-white dark:border-slate-800 flex items-center justify-center shadow-sm">
                            <span className="text-[8px] font-black">
                              {(pr.requestedBy?.name || "UN")
                                .substring(0, 2)
                                .toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Drawer Modal */}
      <AnimatePresence>
        {selectedPr && (
          <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              className="bg-white dark:bg-slate-800 w-full max-w-md h-full shadow-2xl flex flex-col border-l border-slate-100 dark:border-slate-700 p-8"
            >
              <div className="flex justify-between items-center mb-8">
                <span className="text-xs font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1.5 rounded-lg">
                  {selectedPr.prNumber}
                </span>
                <button
                  onClick={() => setSelectedPr(null)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="flex-1 space-y-6 overflow-y-auto pr-1">
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight uppercase tracking-tight">
                    {selectedPr.justification || "No justification provided"}
                  </h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                    Creator: {selectedPr.requestedBy?.name || "Unknown User"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 p-5 bg-slate-50 dark:bg-slate-900 rounded-3xl">
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                      Required Date
                    </span>
                    <span className="text-sm font-black text-slate-900 dark:text-white">
                      {selectedPr.requiredDate ? new Date(selectedPr.requiredDate).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                      Status
                    </span>
                    <span className="text-sm font-black text-indigo-600 uppercase tracking-widest">
                      {selectedPr.status}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Items Requested
                  </h4>
                  <div className="space-y-2">
                    {selectedPr.items?.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl flex justify-between items-center"
                      >
                        <div>
                          <div className="text-xs font-black text-slate-900 dark:text-white">
                            {item.product?.name || "Unknown Product"}
                          </div>
                          {item.notes && (
                            <div className="text-[10px] text-slate-400 mt-1 italic">
                              {item.notes}
                            </div>
                          )}
                        </div>
                        <div className="text-xs font-black bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 px-3 py-1 rounded-lg">
                          Qty: {item.quantity}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Stage Transitions
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedPr.status === "PENDING_APPROVAL" && (
                      <>
                        <button
                          onClick={() =>
                            handleMovePR(selectedPr.id, "APPROVED")
                          }
                          className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-emerald-700"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() =>
                            handleMovePR(selectedPr.id, "REJECTED")
                          }
                          className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-rose-700"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {selectedPr.status === "DRAFT" && (
                      <button
                        onClick={() =>
                          handleMovePR(selectedPr.id, "PENDING_APPROVAL")
                        }
                        className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-indigo-700"
                      >
                        Submit for Approval
                      </button>
                    )}
                    {selectedPr.status === "APPROVED" && (
                      <button
                        onClick={() => {
                          setPrToConvert(selectedPr);
                          setPoReference(`PO-${selectedPr.prNumber}`);
                          setConvertModalOpen(true);
                        }}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-indigo-700 flex items-center gap-2"
                      >
                        <FileSpreadsheet className="w-4 h-4" /> Convert to PO
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {(selectedPr.status === "DRAFT" ||
                selectedPr.status === "REJECTED") && (
                  <div className="pt-6 border-t border-slate-100 dark:border-slate-700">
                    <button
                      onClick={() => handleDeletePR(selectedPr.id)}
                      className="w-full py-4 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/30 rounded-2xl font-black text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2 border border-rose-100 dark:border-rose-900/30"
                    >
                      <Trash2 className="w-4 h-4" /> Delete Requisition
                    </button>
                  </div>
                )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create PR Modal */}
      <AnimatePresence>
        {isCreateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-800 w-full max-w-xl rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden"
            >
              <div className="flex justify-between items-center p-8 border-b border-slate-50 dark:border-slate-700">
                <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-tight">
                  <FileText className="w-5 h-5 text-indigo-500" />
                  New Purchase Requisition
                </h2>
                <button
                  onClick={() => setIsCreateOpen(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <form onSubmit={handleCreatePR} className="p-8 space-y-5">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                    Justification / Requisition Reason
                  </label>
                  <input
                    type="text"
                    required
                    value={justification}
                    onChange={(e) => setJustification(e.target.value)}
                    className="w-full px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all font-bold text-xs"
                    placeholder="e.g. Q3 Packaging Materials Reorder"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                    Required Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="date"
                      required
                      value={requiredDate}
                      onChange={(e) => setRequiredDate(e.target.value)}
                      className="w-full pl-12 pr-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all font-bold text-xs"
                    />
                  </div>
                </div>

                {/* Add Item Section */}
                <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-4">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Add Product Spec
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <select
                        value={selectedProductId}
                        onChange={(e) => setSelectedProductId(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none font-bold text-xs"
                      >
                        <option value="">Select Product</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min={1}
                        placeholder="Qty"
                        value={selectedQty}
                        onChange={(e) =>
                          setSelectedQty(parseInt(e.target.value) || 1)
                        }
                        className="w-20 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none font-bold text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Spec / Note"
                        value={selectedNotes}
                        onChange={(e) => setSelectedNotes(e.target.value)}
                        className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none font-bold text-xs"
                      />
                      <button
                        type="button"
                        onClick={handleAddItem}
                        className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  {/* Added Items List */}
                  {addedItems.length > 0 && (
                    <div className="space-y-2 mt-4 max-h-[150px] overflow-y-auto pr-1">
                      {addedItems.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700"
                        >
                          <div className="text-xs font-bold">
                            {item.name}{" "}
                            <span className="text-slate-400">
                              ({item.notes || "No note"})
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-black font-mono bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded text-indigo-600">
                              x{item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              className="text-rose-500 hover:bg-rose-50 p-1 rounded-lg"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-4 flex gap-4">
                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
                    className="flex-1 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-black text-xs uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-[2] py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" /> Save Requisition
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Convert Requisition to PO Modal */}
      <AnimatePresence>
        {convertModalOpen && prToConvert && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-800 w-full max-w-md rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden"
            >
              <div className="flex justify-between items-center p-8 border-b border-slate-50 dark:border-slate-700">
                <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-tight">
                  <FileSpreadsheet className="w-5 h-5 text-indigo-500" />
                  Generate PO from Requisition
                </h2>
                <button
                  onClick={() => setConvertModalOpen(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <form onSubmit={handleConvertPR} className="p-8 space-y-5">
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 p-4 rounded-2xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800 dark:text-amber-400 font-semibold leading-relaxed">
                    This will convert the approved items of{" "}
                    {prToConvert.prNumber} into a new Purchase Order.
                  </p>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                    Supplier Entity
                  </label>
                  <select
                    required
                    value={selectedSupplierId}
                    onChange={(e) => setSelectedSupplierId(e.target.value)}
                    className="w-full px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all font-bold text-xs"
                  >
                    <option value="">Select Supplier</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                    PO Reference Number
                  </label>
                  <input
                    type="text"
                    required
                    value={poReference}
                    onChange={(e) => setPoReference(e.target.value)}
                    className="w-full px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all font-mono text-xs font-bold uppercase tracking-wider"
                  />
                </div>

                <div className="pt-4 flex gap-4">
                  <button
                    type="button"
                    onClick={() => setConvertModalOpen(false)}
                    className="flex-1 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-black text-xs uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-[2] py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
                  >
                    Generate PO
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
