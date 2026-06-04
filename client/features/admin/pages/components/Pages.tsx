"use client";

import { useMemo } from "react";
import ConfirmModal from "@/components/shared/ConfirmModal";
import DataTable from "@/components/shared/DataTable";
import { usePagesManager } from "../hooks/usePagesManager";
import PagesHeader from "./pages/PagesHeader";
import PagesFilters from "./pages/PagesFilters";
import PagesEmptyState from "./pages/PagesEmptyState";
import { buildPageColumns } from "./pages/pageColumns";

export default function PagesList() {
    const {
        pages,
        loading,
        error,
        search,
        setSearch,
        statusFilter,
        setStatusFilter,
        filteredPages,
        fetchPages,
        updatingOrder,
        handleOrderInput,
        handleOrderBlur,
        deleteTarget,
        openDeleteModal,
        closeDeleteModal,
        handleDelete,
    } = usePagesManager();

    const columns = useMemo(
        () => buildPageColumns({
            updatingOrder,
            onOrderInput: handleOrderInput,
            onOrderBlur: handleOrderBlur,
            onDelete: openDeleteModal,
        }),
        [updatingOrder, handleOrderInput, handleOrderBlur, openDeleteModal],
    );

    return (
        <div className="p-6">
            <PagesHeader />

            <PagesFilters
                search={search}
                onSearchChange={setSearch}
                statusFilter={statusFilter}
                onStatusChange={setStatusFilter}
            />

            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                <DataTable
                    data={filteredPages}
                    columns={columns}
                    getRowKey={(page) => page.id}
                    loading={loading}
                    loadingLabel="Loading pages..."
                    emptyLabel={
                        <PagesEmptyState
                            error={error}
                            hasPages={pages.length > 0}
                            onRetry={fetchPages}
                        />
                    }
                    containerClassName="border-0 shadow-none rounded-t-none bg-transparent"
                    rowClassName="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group"
                />
            </div>

            <ConfirmModal
                isOpen={deleteTarget.isOpen}
                onClose={closeDeleteModal}
                onConfirm={handleDelete}
                title="Delete Page"
                message={
                    deleteTarget.isHomePage
                        ? "This is your home page. Deleting it will remove your storefront homepage. Are you sure?"
                        : "Are you sure you want to delete this page? This action cannot be undone."
                }
                isDangerous
            />
        </div>
    );
}
