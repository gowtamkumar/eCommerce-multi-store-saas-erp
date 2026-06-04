'use client';

import SupplierList from '@/features/admin/supplier/components/SupplierList';
import SupplierModal from '@/features/admin/supplier/components/SupplierModal';
import { useSuppliers } from '@/features/admin/supplier/hooks/useSuppliers';

export default function SuppliersPage() {
    const {
        suppliers,
        loading,
        searchQuery,
        setSearchQuery,
        isSearchLoading,
        setPage,
        pagination,
        isModalOpen,
        setIsModalOpen,
        editingSupplier,
        handleAdd,
        handleEdit,
        handleDelete,
        handleSuccess,
    } = useSuppliers();

    return (
        <div className="p-8 max-w-[1600px] mx-auto">
            <SupplierList
                suppliers={suppliers}
                loading={loading}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                pagination={pagination}
                onPageChange={setPage}
                onAdd={handleAdd}
                onEdit={handleEdit}
                onDelete={handleDelete}
                isSearchLoading={isSearchLoading}
            />

            <SupplierModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleSuccess}
                supplier={editingSupplier}
            />
        </div>
    );
}
