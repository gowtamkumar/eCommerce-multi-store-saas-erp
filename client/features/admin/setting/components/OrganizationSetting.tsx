"use client";
import {
    getBranches,
    createBranch,
    updateBranch,
    deleteBranch,
    getWarehouses,
    createWarehouse,
    updateWarehouse,
    deleteWarehouse,
    addWarehouseBin,
    updateWarehouseBin,
    deleteWarehouseBin
} from "@/services/organization";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, Warehouse, Plus, Trash2, Edit2, Check, X, Loader2, MapPin, Phone, Mail, Package } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

export function OrganizationSetting({ defaultTab }: { defaultTab?: "branches" | "warehouses" }) {
    const searchParams = useSearchParams();
    const tabParam = searchParams.get("tab") as "branches" | "warehouses";
    
    const [branches, setBranches] = useState<any[]>([]);
    const [warehouses, setWarehouses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"branches" | "warehouses">(tabParam || defaultTab || "branches");

    // Warehouse Bin Management States
    const [selectedWarehouse, setSelectedWarehouse] = useState<any>(null);
    const [isBinsModalOpen, setIsBinsModalOpen] = useState(false);
    const [editingBin, setEditingBin] = useState<any>(null);
    const [binFormData, setBinFormData] = useState({
        zone: "",
        binCode: "",
        isActive: true
    });

    useEffect(() => {
        if (tabParam && (tabParam === "branches" || tabParam === "warehouses")) {
            setActiveTab(tabParam);
        }
    }, [tabParam]);

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
            const updatedBranches = branchesRes.data || [];
            const updatedWarehouses = warehousesRes.data || [];
            setBranches(updatedBranches);
            setWarehouses(updatedWarehouses);

            if (selectedWarehouse) {
                const updatedWh = updatedWarehouses.find((w: any) => w.id === selectedWarehouse.id);
                if (updatedWh) {
                    setSelectedWarehouse(updatedWh);
                }
            }
        } catch (error) {
            toast.error("Failed to fetch organization data");
        } finally {
            setLoading(false);
        }
    };

    const openManageBins = (wh: any) => {
        setSelectedWarehouse(wh);
        setIsBinsModalOpen(true);
        resetBinForm();
    };

    const resetBinForm = () => {
        setEditingBin(null);
        setBinFormData({
            zone: "",
            binCode: "",
            isActive: true
        });
    };

    const handleSaveBin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedWarehouse) return;
        try {
            if (editingBin) {
                await updateWarehouseBin(editingBin.id, binFormData);
                toast.success("Bin updated successfully");
            } else {
                await addWarehouseBin(selectedWarehouse.id, binFormData);
                toast.success("Bin added successfully");
            }
            resetBinForm();
            await fetchData();
        } catch (error: any) {
            toast.error(error.message || "Failed to save bin");
        }
    };

    const handleDeleteBin = async (binId: string) => {
        if (!confirm("Are you sure? This will remove the bin.")) return;
        try {
            await deleteWarehouseBin(binId);
            toast.success("Bin deleted successfully");
            await fetchData();
        } catch (error) {
            toast.error("Failed to delete bin");
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
                                <button
                                    onClick={() => openManageBins(wh)}
                                    className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all border border-slate-100 dark:border-slate-800/30"
                                >
                                    <Package className="w-3.5 h-3.5" />
                                    Manage Bins
                                </button>
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

            {/* Warehouse Bins Modal */}
            <AnimatePresence>
                {isBinsModalOpen && selectedWarehouse && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 w-full max-w-2xl shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col max-h-[85vh]"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h4 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <Package className="w-6 h-6 text-brand-600" />
                                        Warehouse Bins
                                    </h4>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                                        Bins in warehouse: <span className="font-bold text-slate-700 dark:text-slate-300">{selectedWarehouse.name} ({selectedWarehouse.code})</span>
                                    </p>
                                </div>
                                <button
                                    onClick={() => { setIsBinsModalOpen(false); setSelectedWarehouse(null); }}
                                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 overflow-hidden flex-1">
                                {/* Left Side: Add/Edit Form */}
                                <div className="md:col-span-2 space-y-4 border-r border-slate-100 dark:border-slate-850 pr-0 md:pr-6">
                                    <h5 className="font-bold text-slate-800 dark:text-slate-205 text-sm">
                                        {editingBin ? "Edit Bin Details" : "Create New Bin"}
                                    </h5>
                                    <form onSubmit={handleSaveBin} className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Zone</label>
                                            <input
                                                type="text"
                                                required
                                                value={binFormData.zone}
                                                onChange={(e) => setBinFormData({ ...binFormData, zone: e.target.value })}
                                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-brand-500 transition-all text-sm"
                                                placeholder="Zone-A"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Bin Code</label>
                                            <input
                                                type="text"
                                                required
                                                value={binFormData.binCode}
                                                onChange={(e) => setBinFormData({ ...binFormData, binCode: e.target.value })}
                                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-brand-500 transition-all text-sm"
                                                placeholder="A-01-05"
                                            />
                                        </div>
                                        <div className="flex items-center gap-2 pt-2">
                                            <input
                                                type="checkbox"
                                                id="bin-active"
                                                checked={binFormData.isActive}
                                                onChange={(e) => setBinFormData({ ...binFormData, isActive: e.target.checked })}
                                                className="rounded border-slate-350 text-brand-600 focus:ring-brand-500"
                                            />
                                            <label htmlFor="bin-active" className="text-sm text-slate-700 dark:text-slate-300 font-bold cursor-pointer">Active / Available</label>
                                        </div>

                                        <div className="flex gap-3 pt-4">
                                            {editingBin && (
                                                <button
                                                    type="button"
                                                    onClick={resetBinForm}
                                                    className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-805 text-slate-600 dark:text-slate-400 font-bold rounded-xl text-xs hover:bg-slate-200 transition-all"
                                                >
                                                    Cancel
                                                </button>
                                            )}
                                            <button
                                                type="submit"
                                                className="flex-1 px-4 py-2.5 bg-brand-600 text-white font-bold rounded-xl text-xs hover:bg-brand-700 transition-all shadow-md shadow-brand-500/20"
                                            >
                                                {editingBin ? "Update" : "Add"}
                                            </button>
                                        </div>
                                    </form>
                                </div>

                                {/* Right Side: Bins List */}
                                <div className="md:col-span-3 flex flex-col overflow-hidden min-h-[250px]">
                                    <h5 className="font-bold text-slate-850 dark:text-slate-205 text-sm mb-3">
                                        Defined Bins ({selectedWarehouse.bins?.length || 0})
                                    </h5>
                                    
                                    <div className="flex-1 overflow-y-auto pr-1 space-y-3">
                                        {!selectedWarehouse.bins || selectedWarehouse.bins.length === 0 ? (
                                            <div className="text-center py-12 text-slate-400 text-sm">
                                                No bins defined in this warehouse yet.
                                            </div>
                                        ) : (
                                            selectedWarehouse.bins.map((bin: any) => (
                                                <div
                                                    key={bin.id}
                                                    className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100/50 dark:border-slate-800/30"
                                                >
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-bold text-slate-900 dark:text-white text-sm">
                                                                {bin.binCode}
                                                            </span>
                                                            <span className="text-xs text-slate-400 font-mono">
                                                                ({bin.zone})
                                                            </span>
                                                        </div>
                                                        <span className={`inline-block mt-1 text-[10px] font-bold px-1.5 py-0.5 rounded ${bin.isActive ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600" : "bg-slate-100 dark:bg-slate-800 text-slate-400"}`}>
                                                            {bin.isActive ? "Active" : "Inactive"}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            onClick={() => {
                                                                setEditingBin(bin);
                                                                setBinFormData({
                                                                    zone: bin.zone,
                                                                    binCode: bin.binCode,
                                                                    isActive: bin.isActive
                                                                });
                                                            }}
                                                            className="p-2 text-slate-400 hover:text-brand-600 transition-colors"
                                                            title="Edit Bin"
                                                        >
                                                            <Edit2 className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteBin(bin.id)}
                                                            className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                                                            title="Delete Bin"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
