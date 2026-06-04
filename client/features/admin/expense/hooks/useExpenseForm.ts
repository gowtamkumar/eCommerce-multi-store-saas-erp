'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchAPI } from '@/services/api';
import toast from 'react-hot-toast';
import type { Expense } from '../types';

export function useExpenseForm(isOpen: boolean, initialData: Expense | null | undefined, onClose: () => void, onSuccess: () => void) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        amount: '',
        category: 'OTHER',
        expenseDate: new Date().toISOString().split('T')[0],
        referenceNumber: '',
        description: '',
        attachmentUrl: '',
        recurrence: 'NONE',
        status: 'APPROVED',
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title,
                amount: initialData.amount.toString(),
                category: initialData.category,
                expenseDate: initialData.expenseDate.split('T')[0],
                referenceNumber: initialData.referenceNumber || '',
                description: initialData.description || '',
                attachmentUrl: (initialData as any).attachmentUrl || '',
                recurrence: (initialData as any).recurrence || 'NONE',
                status: (initialData as any).status || 'APPROVED',
            });
        } else {
            setFormData({
                title: '',
                amount: '',
                category: 'OTHER',
                expenseDate: new Date().toISOString().split('T')[0],
                referenceNumber: '',
                description: '',
                attachmentUrl: '',
                recurrence: 'NONE',
                status: 'APPROVED',
            });
        }
    }, [initialData, isOpen]);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const payload: Record<string, any> = {
            ...formData,
            amount: parseFloat(formData.amount),
        };
        if (!payload.attachmentUrl) delete payload.attachmentUrl;

        try {
            const url = initialData ? `/expenses/${initialData.id}` : '/expenses';
            const method = initialData ? 'PATCH' : 'POST';

            await fetchAPI(url, {
                method,
                body: JSON.stringify(payload),
            });

            toast.success(`Expense ${initialData ? 'updated' : 'recorded'} successfully`);
            onSuccess();
        } catch (error) {
            console.error('Failed to save expense', error);
            toast.error('Failed to save expense');
        } finally {
            setIsSubmitting(false);
        }
    }, [formData, initialData, onSuccess]);

    return {
        isSubmitting,
        formData,
        setFormData,
        handleSubmit,
    };
}
