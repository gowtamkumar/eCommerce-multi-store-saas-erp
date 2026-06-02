"use client";
import ConfirmModal from "@/components/shared/ConfirmModal";
import { getPagePublicPath } from "@/lib/page-url";
import { fetchAPI } from '@/services/api';
import { Eye, Home, Pencil, Plus, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Page } from "../type";

type StatusFilter = "all" | "draft" | "published";

export default function PagesList() {
    const [pages, setPages] = useState<Page[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        id: "",
        isHomePage: false,
    });
    const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);
    const orderDraftRef = useRef<Record<string, number>>({});
    const orderTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

    const fetchPages = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetchAPI("/pages");
            if (res.success) {
                setPages(res.data);
            } else {
                setError("Failed to load pages");
            }
        } catch (err) {
            console.error("Failed to fetch pages", err);
            setError("Failed to load pages");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const timers = orderTimersRef.current;
        void Promise.resolve().then(fetchPages);
        return () => {
            Object.values(timers).forEach(clearTimeout);
        };
    }, [fetchPages]);

    const commitOrderChange = useCallback(async (id: string, newOrder: number) => {
        setUpdatingOrder(id);
        try {
            const res = await fetchAPI(`/pages/${id}`, {
                method: 'PATCH',
                body: JSON.stringify({ order: newOrder }),
            });

            if (!res.success) {
                toast.error("Failed to update order");
                fetchPages();
            }
        } catch {
            toast.error("Error updating order");
            fetchPages();
        } finally {
            setUpdatingOrder(null);
        }
    }, [fetchPages]);

    const handleOrderInput = (id: string, raw: string) => {
        const newOrder = Number.isFinite(parseInt(raw, 10)) ? parseInt(raw, 10) : 0;
        orderDraftRef.current[id] = newOrder;
        setPages((prev) =>
            prev.map((p) => (p.id === id ? { ...p, order: newOrder } : p)),
        );

        if (orderTimersRef.current[id]) clearTimeout(orderTimersRef.current[id]);
        orderTimersRef.current[id] = setTimeout(() => {
            commitOrderChange(id, orderDraftRef.current[id] ?? newOrder);
        }, 600);
    };

    const handleOrderBlur = (id: string) => {
        if (orderTimersRef.current[id]) {
            clearTimeout(orderTimersRef.current[id]);
            delete orderTimersRef.current[id];
        }
        const value = orderDraftRef.current[id];
        if (value !== undefined) {
            commitOrderChange(id, value);
        }
    };

    const handleDelete = async () => {
        try {
            const res = await fetchAPI(`/pages/${confirmModal.id}`, {
                method: "DELETE",
            });
            if (res.success) {
                toast.success("Page deleted successfully");
                fetchPages();
            } else {
                toast.error("Failed to delete page");
            }
        } catch {
            toast.error("Error deleting page");
        }
        setConfirmModal({ isOpen: false, id: "", isHomePage: false });
    };

    const filteredPages = useMemo(() => {
        const q = search.trim().toLowerCase();
        return pages.filter((page) => {
            if (statusFilter !== "all" && page.status !== statusFilter) return false;
            if (!q) return true;
            return (
                page.title.toLowerCase().includes(q) ||
                (page.slug || "").toLowerCase().includes(q)
            );
        });
    }, [pages, search, statusFilter]);

    return (
        <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-display">
                        Pages
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Manage your store&apos;s dynamic pages and homepage design.
                    </p>
                </div>
                <Link
                    href="/admin/pages/new"
                    className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors font-bold shadow-lg shadow-brand-500/20 shrink-0"
                >
                    <Plus className="w-5 h-5" /> New Page
                </Link>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by title or slug..."
                        className="w-full pl-10 pr-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-brand-500 outline-none"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                    className="px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-brand-500 outline-none"
                >
                    <option value="all">All statuses</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                </select>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                            <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-200">Title</th>
                            <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-200">URL Slug</th>
                            <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-200">Order</th>
                            <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-200">Status</th>
                            <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-200 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                    Loading pages...
                                </td>
                            </tr>
                        ) : error ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center">
                                    <p className="text-red-500 mb-3">{error}</p>
                                    <button
                                        type="button"
                                        onClick={fetchPages}
                                        className="text-sm font-bold text-brand-600 hover:underline"
                                    >
                                        Retry
                                    </button>
                                </td>
                            </tr>
                        ) : filteredPages.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center">
                                    {pages.length === 0 ? (
                                        <div className="space-y-3">
                                            <p className="text-slate-500">No pages yet.</p>
                                            <Link
                                                href="/admin/pages/new"
                                                className="inline-flex items-center gap-2 text-sm font-bold text-brand-600 hover:underline"
                                            >
                                                <Plus className="w-4 h-4" /> Create your first page
                                            </Link>
                                        </div>
                                    ) : (
                                        <p className="text-slate-400">No pages match your filters.</p>
                                    )}
                                </td>
                            </tr>
                        ) : (
                            filteredPages.map((page) => (
                                <tr
                                    key={page.id}
                                    className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <span className="font-semibold text-slate-900 dark:text-white">
                                                {page.title}
                                            </span>
                                            {page.isHomePage && (
                                                <span className="flex items-center gap-1 px-2 py-0.5 bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 text-[10px] font-bold rounded-full uppercase tracking-wider">
                                                    <Home className="w-3 h-3" /> Home
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <code className="text-xs bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded text-slate-600 dark:text-slate-400">
                                            {getPagePublicPath(page)}
                                        </code>
                                    </td>
                                    <td className="px-6 py-4">
                                        <input
                                            type="number"
                                            value={page.order ?? 0}
                                            onChange={(e) => handleOrderInput(page.id, e.target.value)}
                                            onBlur={() => handleOrderBlur(page.id)}
                                            className="w-16 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                                        />
                                        {updatingOrder === page.id && (
                                            <span className="ml-2 text-xs text-brand-600 animate-pulse">Saving...</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${page.status === "published"
                                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                                : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                                }`}
                                        >
                                            {page.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-end gap-2">
                                            <Link
                                                href={getPagePublicPath(page)}
                                                target="_blank"
                                                className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-xl transition-all"
                                                title="View Live"
                                            >
                                                <Eye className="w-5 h-5" />
                                            </Link>
                                            <Link
                                                href={`/admin/pages/${page.id}`}
                                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all"
                                                title="Edit Design"
                                            >
                                                <Pencil className="w-5 h-5" />
                                            </Link>
                                            <button
                                                onClick={() =>
                                                    setConfirmModal({
                                                        isOpen: true,
                                                        id: page.id,
                                                        isHomePage: page.isHomePage,
                                                    })
                                                }
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false, id: "", isHomePage: false })}
                onConfirm={handleDelete}
                title="Delete Page"
                message={
                    confirmModal.isHomePage
                        ? "This is your home page. Deleting it will remove your storefront homepage. Are you sure?"
                        : "Are you sure you want to delete this page? This action cannot be undone."
                }
                isDangerous
            />
        </div>
    );
}
