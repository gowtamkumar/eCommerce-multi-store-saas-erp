'use client';

import { useCallback, useState } from 'react';
import { useApiList } from '@/hooks/useApiList';
import { useApiMutation } from '@/hooks/useApiMutation';
import type { Brand } from '../type';

export function useBrandDashboard() {
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [editingBrand, setEditingBrand] = useState<Brand | null>(null);

    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => {},
    });

    const { items: brands, setItems: setBrands, loading, refresh } = useApiList<Brand>({
        buildEndpoint: () => '/brands/stats',
        errorMessage: 'Failed to load brands',
    });

    const { mutate } = useApiMutation();

    const handleFormSubmit = async (formData: Brand) => {
        const url = editingBrand ? `/brands/${editingBrand.id}` : '/brands';
        const method = editingBrand ? 'PATCH' : 'POST';

        const result = await mutate(url, {
            method,
            body: JSON.stringify(formData),
        }, {
            successMessage: `Brand ${editingBrand ? 'updated' : 'created'} successfully`,
            errorMessage: 'Error saving brand',
        });

        if (result.success) {
            refresh();
            closeModal();
        }
    };

    const handleDelete = (id: string) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Brand',
            message: 'Are you sure you want to delete this brand? Products associated with this brand will be affected.',
            onConfirm: async () => {
                const result = await mutate(`/brands/${id}`, { method: 'DELETE' }, {
                    successMessage: 'Brand deleted successfully',
                    errorMessage: 'Error deleting brand',
                });
                if (result.success) {
                    setBrands(prev => prev.filter(b => b.id !== id));
                }
            },
        });
    };

    const openModal = useCallback((brand?: Brand) => {
        setEditingBrand(brand ?? null);
        setIsModalOpen(true);
    }, []);

    const closeModal = useCallback(() => {
        setIsModalOpen(false);
        setEditingBrand(null);
    }, []);

    return {
        brands,
        loading,
        isModalOpen,
        editingBrand,
        confirmModal,
        setConfirmModal,
        fetchBrands: refresh,
        handleFormSubmit,
        handleDelete,
        openModal,
        closeModal,
    };
}
