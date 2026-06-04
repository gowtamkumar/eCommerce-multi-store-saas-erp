'use client';

import ConfirmModal from '@/components/shared/ConfirmModal';
import CustomerList from './CustomerList';
import CustomerForm from './CustomerForm';
import { useCustomerDashboard } from '../hooks/useCustomerDashboard';

export default function Customer() {
    const {
        users,
        loading,
        searchQuery,
        setSearchQuery,
        pagination,
        isFormOpen,
        setIsFormOpen,
        selectedUser,
        confirmModal,
        setConfirmModal,
        handlePageChange,
        handleDelete,
        handleFormSubmit,
        handleEdit,
        handleAdd,
    } = useCustomerDashboard();

    return (
        <div className="pb-10">
            <CustomerList
                users={users}
                loading={loading}
                pagination={pagination}
                onPageChange={handlePageChange}
                onDelete={handleDelete}
                onEdit={handleEdit}
                onAdd={handleAdd}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
            />

            <CustomerForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSubmit={handleFormSubmit}
                initialData={selectedUser}
            />

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                isDangerous={confirmModal.isDangerous}
            />
        </div>
    );
}
