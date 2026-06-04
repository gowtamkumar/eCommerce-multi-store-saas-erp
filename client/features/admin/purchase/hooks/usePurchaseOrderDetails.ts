'use client';

import { fetchAPI } from '@/services/api';
import { PurchaseOrderStatus } from '@/lib/enums/purchase-order.type.enum';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import type { Warehouse, Branch } from '../types';

export function usePurchaseOrderDetails() {
    const { id } = useParams();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);

    const fetchOrder = async () => {
        try {
            const res = await fetchAPI(`/purchase-orders/${id}`);
            setOrder(res.data || res);
        } catch (error) {
            console.error('Failed to fetch purchase order', error);
            toast.error('Failed to load purchase order details');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) void fetchOrder();
    }, [id]);

    const openReceiveModal = async () => {
        try {
            const [whRes, brRes] = await Promise.all([
                fetchAPI('/system/warehouses'),
                fetchAPI('/system/branches'),
            ]);
            setWarehouses(
                Array.isArray(whRes.data) ? whRes.data : (whRes.data?.items || [])
            );
            setBranches(
                Array.isArray(brRes.data) ? brRes.data : (brRes.data?.items || [])
            );
            setIsReceiveModalOpen(true);
        } catch {
            toast.error('Could not load warehouses / branches');
        }
    };

    const handleReceive = async (warehouseId: string, branchId: string) => {
        const toastId = toast.loading('Receiving order — updating stock & AP ledger...');
        try {
            await fetchAPI(`/purchase-orders/${id}/status`, {
                method: 'PATCH',
                body: JSON.stringify({
                    status: PurchaseOrderStatus.RECEIVED,
                    warehouseId: warehouseId || undefined,
                    branchId: branchId || undefined,
                }),
            });
            toast.success('Order received! Stock updated & GRN created.', { id: toastId });
            setIsReceiveModalOpen(false);
            void fetchOrder();
        } catch (error: any) {
            toast.error(error?.message || 'Failed to receive order', { id: toastId });
        }
    };

    const handleRecordPayment = async (paymentData: {
        amount: string;
        paymentMethod: string;
        note: string;
        transactionId: string;
    }) => {
        const toastId = toast.loading('Recording payment...');
        try {
            await fetchAPI(`/purchase-orders/${id}/payments`, {
                method: 'POST',
                body: JSON.stringify({
                    ...paymentData,
                    amount: Number(paymentData.amount),
                }),
            });
            toast.success('Payment recorded successfully!', { id: toastId });
            setIsPaymentModalOpen(false);
            void fetchOrder();
        } catch (error) {
            console.error(error);
            toast.error('Failed to record payment', { id: toastId });
        }
    };

    const balance = Number(order?.totalAmount || 0) - Number(order?.paidAmount || 0);

    return {
        id: id as string,
        order,
        loading,
        isPaymentModalOpen,
        setIsPaymentModalOpen,
        isReceiveModalOpen,
        setIsReceiveModalOpen,
        warehouses,
        branches,
        balance,
        openReceiveModal,
        handleReceive,
        handleRecordPayment,
        fetchOrder,
    };
}
