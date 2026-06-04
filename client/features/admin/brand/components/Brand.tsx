'use client';

import ConfirmModal from '@/components/shared/ConfirmModal';
import BrandForm from './BrandForm';
import BrandList from './BrandList';
import { useBrandDashboard } from '../hooks/useBrandDashboard';

export default function Brand() {
    const {
        brands,
        loading,
        isModalOpen,
        editingBrand,
        confirmModal,
        setConfirmModal,
        handleFormSubmit,
        handleDelete,
        openModal,
        closeModal,
    } = useBrandDashboard();

    return (
        <div className="space-y-8">
            <BrandList
                brands={brands}
                loading={loading}
                onEdit={openModal}
                onDelete={handleDelete}
                onAdd={() => openModal()}
            />

            <BrandForm
                isOpen={isModalOpen}
                onClose={closeModal}
                onSubmit={handleFormSubmit}
                initialData={editingBrand}
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
