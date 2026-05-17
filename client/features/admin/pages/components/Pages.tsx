"use client";
import ConfirmModal from "@/components/shared/ConfirmModal";
import { fetchAPI } from '@/services/api';
import { Eye, Home, Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Page } from "../type";


export default function PagesList() {
    const [pages, setPages] = useState<Page[]>([]);
    const [loading, setLoading] = useState(true);
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        id: "",
    });

    const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);

    useEffect(() => {
        fetchPages();
    }, []);

    const fetchPages = async () => {
        try {
            const res = await fetchAPI("/pages");
            if (res.success) {
                setPages(res.data);
            }
        } catch (error) {
            console.error("Failed to fetch pages", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOrderChange = async (id: string, newOrder: number) => {
        setUpdatingOrder(id);
        try {
            // Optimistic update
            const updatedPages = pages.map((p: any) =>
                p.id === id ? { ...p, order: newOrder } : p
            );
            setPages(updatedPages);

            const res = await fetchAPI(`/pages/${id}`, {
                method: 'PATCH',
                body: JSON.stringify({ order: newOrder }),
            });

            if (!res.success) {
                toast.error("Failed to update order");
                fetchPages(); // Revert on failure
            } else {
                toast.success("Order updated");
            }
        } catch (error) {
            toast.error("Error updating order");
            fetchPages();
        } finally {
            setUpdatingOrder(null);
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
        } catch (error) {
            toast.error("Error deleting page");
        }
        setConfirmModal({ isOpen: false, id: "" });
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-display">
                        Pages
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Manage your store's dynamic pages and homepage design.
                    </p>
                </div>
                <Link
                    href="/admin/pages/new"
                    className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg flex items-center gap-2 transition-colors font-bold shadow-lg shadow-brand-500/20"
                >
                    <Plus className="w-5 h-5" /> New Page
                </Link>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                            <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-200">
                                Title
                            </th>
                            <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-200">
                                URL Slug
                            </th>
                            <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-200">
                                Order
                            </th>
                            <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-200">
                                Status
                            </th>
                            <th className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-200 text-right">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                    Loading pages...
                                </td>
                            </tr>
                        ) : pages.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                    No pages found.
                                </td>
                            </tr>
                        ) : (
                            pages.map((page: any) => (
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
                                            /{page.isHomePage ? "" : page.slug}
                                        </code>
                                    </td>
                                    <td className="px-6 py-4">
                                        <input
                                            type="number"
                                            value={page.order || 0}
                                            onChange={(e) => handleOrderChange(page.id, parseInt(e.target.value))}
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
                                                href={page.isHomePage ? "/" : `/${page.slug}`}
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
                                                    setConfirmModal({ isOpen: true, id: page.id })
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
                onClose={() => setConfirmModal({ isOpen: false, id: "" })}
                onConfirm={handleDelete}
                title="Delete Page"
                message="Are you sure you want to delete this page? This action cannot be undone."
                isDangerous
            />
        </div>
    );
}
