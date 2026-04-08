'use client';

import ConfirmModal from '@/components/shared/ConfirmModal';
import { fetchAPI } from '@/services/api';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import type { Category } from '../type';
import CategoryForm from './CategoryForm';
import CategoryList from './CategoryList';

export default function Categories() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
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
    };

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
                fetchCategories();
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
            />

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                isDangerous={true}
            />
        </div>
    );
}
