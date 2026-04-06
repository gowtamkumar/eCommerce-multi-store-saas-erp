'use client';

import ConfirmModal from '@/components/shared/ConfirmModal';
import { fetchAPI } from '@/services/api';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import type { Brand } from '../type';
import BrandForm from './BrandForm';
import BrandList from './BrandList';

export default function Brand() {
    const [brands, setBrands] = useState<Brand[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
    });

    useEffect(() => {
        fetchBrands();
    }, []);

    const fetchBrands = async () => {
        setLoading(true);
        try {
            const res = await fetchAPI('/brands');
            if (res.success) {
                setBrands(res.data);
            }
        } catch (error) {
            toast.error('Failed to load brands');
        } finally {
            setLoading(false);
        }
    };

    const handleFormSubmit = async (formData: Brand) => {
        try {
            const url = editingBrand ? `/brands/${editingBrand.id}` : '/brands';
            const method = editingBrand ? 'PATCH' : 'POST';

            const res = await fetchAPI(url, {
                method,
                body: JSON.stringify(formData),
            });

            if (res.success) {
                toast.success(`Brand ${editingBrand ? 'updated' : 'created'} successfully`);
                fetchBrands();
                closeModal();
            }
        } catch (error) {
            toast.error('Error saving brand');
        }
    };

    const handleDelete = (id: string) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Brand',
            message: 'Are you sure you want to delete this brand? Products associated with this brand will be affected.',
            onConfirm: async () => {
                try {
                    await fetchAPI(`/brands/${id}`, { method: 'DELETE' });
                    setBrands(prev => prev.filter(b => b.id !== id));
                    toast.success('Brand deleted successfully');
                } catch (error) {
                    toast.error('Error deleting brand');
                }
            },
        });
    };

    const openModal = (brand?: Brand) => {
        if (brand) {
            setEditingBrand(brand);
        } else {
            setEditingBrand(null);
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingBrand(null);
    };

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
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                isDangerous={true}
            />
        </div>
    );
}
