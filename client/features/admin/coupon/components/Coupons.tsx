'use client';

import { fetchAPI } from '@/services/api';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import CouponForm from './CouponForm';
import CouponList from './CouponList';
import type { Coupon } from '../types';

export default function Coupons() {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);

    const loadCoupons = async () => {
        setLoading(true);
        try {
            const res = await fetchAPI(`/coupons?search=${searchTerm}`, { method: 'GET' });
            if (res.success) {
                setCoupons(res.data.coupons || []);
            }
        } catch (error) {
            console.error('Error loading coupons:', error);
            toast.error('Failed to load coupons');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCoupons();
    }, [searchTerm]);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this coupon?')) return;

        try {
            const res = await fetchAPI(`/coupons/${id}`, { method: 'DELETE' });
            if (res.success) {
                toast.success('Coupon deleted');
                loadCoupons();
            } else {
                toast.error(res.message || 'Failed to delete coupon');
            }
        } catch (error) {
            toast.error('Failed to delete coupon');
        }
    };

    const handleEdit = (coupon: Coupon) => {
        setSelectedCoupon(coupon);
        setIsFormOpen(true);
    };

    return (
        <>
            <CouponList
                coupons={coupons}
                loading={loading}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onAdd={() => { setSelectedCoupon(null); setIsFormOpen(true); }}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
            />

            <CouponForm
                isOpen={isFormOpen}
                initialData={selectedCoupon}
                onClose={() => setIsFormOpen(false)}
                onSuccess={() => {
                    setIsFormOpen(false);
                    loadCoupons();
                }}
            />
        </>
    );
}
