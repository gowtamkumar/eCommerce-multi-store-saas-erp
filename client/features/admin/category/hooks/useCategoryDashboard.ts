'use client';

import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { fetchAPI } from '@/services/api';
import type { Category } from '../type';

export function useCategoryDashboard() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => {},
    });

    const fetchCategories = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetchAPI('/categories/stats');
            if (res.success) {
                setCategories(res.data);
            }
        } catch (error) {
            toast.error('Failed to load categories');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void fetchCategories();
    }, [fetchCategories]);

    const handleFormSubmit = async (formData: Category) => {
        try {
            const url = editingCategory ? `/categories/${editingCategory.id}` : '/categories';
            const method = editingCategory ? 'PATCH' : 'POST';

            const res = await fetchAPI(url, {
                method,
                body: JSON.stringify(formData),
            });

            if (res.success) {
                toast.success(`Category ${editingCategory ? 'updated' : 'created'} successfully`);
                void fetchCategories();
                closeModal();
            }
        } catch (error) {
            toast.error('Error saving category');
        }
    };

    const handleDelete = (id: string) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Category',
            message: 'Are you sure you want to delete this category? Products in this category will become uncategorized.',
            onConfirm: async () => {
                try {
                    await fetchAPI(`/categories/${id}`, { method: 'DELETE' });
                    setCategories(prev => prev.filter(c => c.id !== id));
                    toast.success('Category deleted successfully');
                } catch (error) {
                    toast.error('Error deleting category');
                }
            },
        });
    };

    const openModal = (category?: Category) => {
        if (category) {
            setEditingCategory(category);
        } else {
            setEditingCategory(null);
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingCategory(null);
    };

    return {
        categories,
        loading,
        isModalOpen,
        editingCategory,
        confirmModal,
        setConfirmModal,
        fetchCategories,
        handleFormSubmit,
        handleDelete,
        openModal,
        closeModal,
    };
}
