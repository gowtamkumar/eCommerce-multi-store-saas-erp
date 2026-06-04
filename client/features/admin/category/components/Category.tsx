'use client';

import ConfirmModal from '@/components/shared/ConfirmModal';
import CategoryForm from './CategoryForm';
import CategoryList from './CategoryList';
import { useCategoryDashboard } from '../hooks/useCategoryDashboard';

export default function Categories() {
    const {
        categories,
        loading,
        isModalOpen,
        editingCategory,
        confirmModal,
        setConfirmModal,
        handleFormSubmit,
        handleDelete,
        openModal,
        closeModal,
    } = useCategoryDashboard();

    return (
        <div className="space-y-8">
            <CategoryList
                categories={categories}
                loading={loading}
                onEdit={openModal}
                onDelete={handleDelete}
                onAdd={() => openModal()}
            />

            <CategoryForm
                isOpen={isModalOpen}
                onClose={closeModal}
                onSubmit={handleFormSubmit}
                initialData={editingCategory}
                allCategories={categories}
            />

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                isDangerous={true}
            />
        </div>
    );
}
