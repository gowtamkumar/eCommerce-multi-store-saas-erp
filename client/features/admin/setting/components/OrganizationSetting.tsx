"use client";
import { getBranches, createBranch, updateBranch, deleteBranch, getWarehouses, createWarehouse, updateWarehouse, deleteWarehouse } from "@/services/organization";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, Warehouse, Plus, Trash2, Edit2, Check, X, Loader2, MapPin, Phone, Mail, Package } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export function OrganizationSetting() {
    const [branches, setBranches] = useState<any[]>([]);
    const [warehouses, setWarehouses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"branches" | "warehouses">("branches");

    // Modal/Form states
    const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
    const [isWarehouseModalOpen, setIsWarehouseModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [formData, setFormData] = useState<any>({
        name: "",
        code: "",
        address: "",
        phone: "",
        email: "",
        locationType: "CENTRAL",
        branchId: ""
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [branchesRes, warehousesRes] = await Promise.all([
                getBranches(),
                getWarehouses()
            ]);
            setBranches(branchesRes.data || []);
            setWarehouses(warehousesRes.data || []);
        } catch (error) {
            toast.error("Failed to fetch organization data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmitBranch = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingItem) {
                await updateBranch(editingItem.id, formData);
                toast.success("Branch updated successfully");
            } else {
                await createBranch(formData);
                toast.success("Branch created successfully");
            }
            setIsBranchModalOpen(false);
            setEditingItem(null);
            resetForm();
            fetchData();
        } catch (error: any) {
            toast.error(error.message || "Failed to save branch");
        }
    };

    const handleSubmitWarehouse = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingItem) {
                await updateWarehouse(editingItem.id, formData);
                toast.success("Warehouse updated successfully");
            } else {
                await createWarehouse(formData);
                toast.success("Warehouse created successfully");
            }
            setIsWarehouseModalOpen(false);
            setEditingItem(null);
            resetForm();
            fetchData();
        } catch (error: any) {
            toast.error(error.message || "Failed to save warehouse");
        }
    };

    const handleDeleteBranch = async (id: string) => {
        if (!confirm("Are you sure? This will remove the branch.")) return;
        try {
            await deleteBranch(id);
            toast.success("Branch deleted");
            fetchData();
        } catch (error) {
            toast.error("Failed to delete branch");
        }
    };

    const handleDeleteWarehouse = async (id: string) => {
        if (!confirm("Are you sure? This will remove the warehouse.")) return;
        try {
            await deleteWarehouse(id);
            toast.success("Warehouse deleted");
            fetchData();
        } catch (error) {
            toast.error("Failed to delete warehouse");
        }
    };

    const resetForm = () => {
        setFormData({
            name: "",
            code: "",
            address: "",
            phone: "",
            email: "",
            locationType: "CENTRAL",
            branchId: ""
        });
    };

    const openEditBranch = (branch: any) => {
        setEditingItem(branch);
        setFormData({
            name: branch.name,
            code: branch.code,
            address: branch.address || "",
            phone: branch.phone || "",
            email: branch.email || "",
        });
        setIsBranchModalOpen(true);
    };

    const openEditWarehouse = (wh: any) => {
        setEditingItem(wh);
        setFormData({
            name: wh.name,
            code: wh.code,
            address: wh.address || "",
            locationType: wh.locationType,
            branchId: wh.branchId || ""
        });
        setIsWarehouseModalOpen(true);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-brand-600" />
                        Organization Management
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                        Manage your branches, warehouses, and storage locations.
                    </p>
                </div>

                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                    <button
                        onClick={() => setActiveTab("branches")}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "branches" ? "bg-white dark:bg-slate-700 text-brand-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                    >
                        Branches
                    </button>
                    <button
                        onClick={() => setActiveTab("warehouses")}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "warehouses" ? "bg-white dark:bg-slate-700 text-brand-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                    >
                        Warehouses
                    </button>
                </div>
            </div>

            {activeTab === "branches" ? (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h4 className="text-lg font-bold text-slate-900 dark:text-white">Branches</h4>
                        <button
                            onClick={() => { resetForm(); setEditingItem(null); setIsBranchModalOpen(true); }}
                            className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-bold transition-all"
                        >
                            <Plus className="w-4 h-4" />
                            Add Branch
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {branches.map((branch) => (
                            <motion.div
                                key={branch.id}
                                layout
                                className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all group"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-brand-50 dark:bg-brand-900/20 rounded-2xl">
                                        <Building2 className="w-6 h-6 text-brand-600" />
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => openEditBranch(branch)} className="p-2 text-slate-400 hover:text-brand-600 transition-colors">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDeleteBranch(branch.id)} className="p-2 text-slate-400 hover:text-rose-600 transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <h5 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{branch.name}</h5>
                                <p className="text-xs font-mono text-slate-400 mb-4">{branch.code}</p>
                                
                                <div className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                                    {branch.address && (
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4" />
                                            <span className="truncate">{branch.address}</span>
                                        </div>
                                    )}
                                    {branch.phone && (
                                        <div className="flex items-center gap-2">
                                            <Phone className="w-4 h-4" />
                                            <span>{branch.phone}</span>
                                        </div>
                                    )}
                                    {branch.email && (
                                        <div className="flex items-center gap-2">
                                            <Mail className="w-4 h-4" />
                                            <span className="truncate">{branch.email}</span>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h4 className="text-lg font-bold text-slate-900 dark:text-white">Warehouses</h4>
                        <button
                            onClick={() => { resetForm(); setEditingItem(null); setIsWarehouseModalOpen(true); }}
                            className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-bold transition-all"
                        >
                            <Plus className="w-4 h-4" />
                            Add Warehouse
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {warehouses.map((wh) => (
                            <motion.div
                                key={wh.id}
                                layout
                                className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all group"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-brand-50 dark:bg-brand-900/20 rounded-2xl">
                                        <Warehouse className="w-6 h-6 text-brand-600" />
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => openEditWarehouse(wh)} className="p-2 text-slate-400 hover:text-brand-600 transition-colors">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDeleteWarehouse(wh.id)} className="p-2 text-slate-400 hover:text-rose-600 transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <h5 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{wh.name}</h5>
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="text-xs font-mono text-slate-400">{wh.code}</span>
                                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded text-[10px] font-bold uppercase">{wh.locationType}</span>
                                </div>
                                
                                {wh.branch && (
                                    <div className="mb-4 flex items-center gap-2 text-xs font-bold text-brand-600 bg-brand-50 dark:bg-brand-900/20 px-2 py-1 rounded-lg w-fit">
                                        <Building2 className="w-3 h-3" />
                                        {wh.branch.name}
                                    </div>
                                )}

                                <div className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                                    {wh.address && (
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4" />
                                            <span className="truncate">{wh.address}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <Package className="w-4 h-4" />
                                        <span>{wh.bins?.length || 0} Bins Defined</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* Branch Modal */}
            <AnimatePresence>
                {isBranchModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl border border-slate-100 dark:border-slate-800"
                        >
                            <h4 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                                {editingItem ? "Edit Branch" : "New Branch"}
                            </h4>
                            <form onSubmit={handleSubmitBranch} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-brand-500 transition-all"
                                        placeholder="Main Branch"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Code</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-brand-500 transition-all"
                                        placeholder="BR-001"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Address</label>
                                    <textarea
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-brand-500 transition-all"
                                        placeholder="123 Street..."
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Phone</label>
                                        <input
                                            type="text"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-brand-500 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Email</label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-brand-500 transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-4 mt-8">
                                    <button
                                        type="button"
                                        onClick={() => setIsBranchModalOpen(false)}
                                        className="flex-1 px-6 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold rounded-2xl hover:bg-slate-200 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-6 py-4 bg-brand-600 text-white font-bold rounded-2xl hover:bg-brand-700 shadow-lg shadow-brand-500/30 transition-all"
                                    >
                                        {editingItem ? "Update" : "Create"}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Warehouse Modal */}
            <AnimatePresence>
                {isWarehouseModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl border border-slate-100 dark:border-slate-800"
                        >
                            <h4 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                                {editingItem ? "Edit Warehouse" : "New Warehouse"}
                            </h4>
                            <form onSubmit={handleSubmitWarehouse} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-brand-500 transition-all"
                                        placeholder="Central Warehouse"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Code</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-brand-500 transition-all"
                                        placeholder="WH-001"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Type</label>
                                    <select
                                        value={formData.locationType}
                                        onChange={(e) => setFormData({ ...formData, locationType: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-brand-500 transition-all"
                                    >
                                        <option value="CENTRAL">Central</option>
                                        <option value="REGIONAL">Regional</option>
                                        <option value="TRANSIT">Transit</option>
                                        <option value="RETAIL">Retail Storefront</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Linked Branch (Optional)</label>
                                    <select
                                        value={formData.branchId}
                                        onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-brand-500 transition-all"
                                    >
                                        <option value="">No Linked Branch</option>
                                        {branches.map(b => (
                                            <option key={b.id} value={b.id}>{b.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Address</label>
                                    <textarea
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-brand-500 transition-all"
                                        placeholder="Warehouse location..."
                                    />
                                </div>
                                <div className="flex gap-4 mt-8">
                                    <button
                                        type="button"
                                        onClick={() => setIsWarehouseModalOpen(false)}
                                        className="flex-1 px-6 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold rounded-2xl hover:bg-slate-200 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-6 py-4 bg-brand-600 text-white font-bold rounded-2xl hover:bg-brand-700 shadow-lg shadow-brand-500/30 transition-all"
                                    >
                                        {editingItem ? "Update" : "Create"}
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
