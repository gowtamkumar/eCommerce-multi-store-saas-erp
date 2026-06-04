'use client';

import { paySupplierInvoice } from '@/services/procurement';
import React, { useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import type { SupplierInvoice } from '../types';

export function useRecordPaymentForm(
    invoice: SupplierInvoice | null,
    onSuccess: () => void,
    onClose: () => void
) {
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('BANK_TRANSFER');
    const [transactionId, setTransactionId] = useState('');
    const [paymentNote, setPaymentNote] = useState('');

    const handlePayment = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!invoice || !paymentAmount) return;

        try {
            await paySupplierInvoice(invoice.id, {
                amount: parseFloat(paymentAmount),
                paymentMethod,
                transactionId,
                note: paymentNote,
            });

            toast.success('Invoice payment recorded successfully');
            setPaymentAmount('');
            setTransactionId('');
            setPaymentNote('');
            onSuccess();
            onClose();
        } catch (err) {
            console.error(err);
            toast.error('Failed to record payment');
        }
    }, [invoice, paymentAmount, paymentMethod, transactionId, paymentNote, onSuccess, onClose]);

    return {
        paymentAmount,
        setPaymentAmount,
        paymentMethod,
        setPaymentMethod,
        transactionId,
        setTransactionId,
        paymentNote,
        setPaymentNote,
        handlePayment,
    };
}
