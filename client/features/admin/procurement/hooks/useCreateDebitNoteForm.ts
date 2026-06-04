'use client';

import React, { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  createDebitNote,
  getSuppliers,
  getPurchaseOrders
} from '@/services/procurement';
import { Supplier } from '@/features/admin/supplier/types';
import { PurchaseOrder } from '@/features/admin/purchase/types';

export function useCreateDebitNoteForm(onSuccess: () => void, onClose: () => void) {
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [selectedPoId, setSelectedPoId] = useState('');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loadingLists, setLoadingLists] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    setLoadingLists(true);
    
    Promise.all([
      getSuppliers().then((res) => {
        if (active) setSuppliers(res);
      }),
      getPurchaseOrders().then((res) => {
        if (active) setPurchaseOrders(res);
      })
    ])
      .catch((err) => {
        console.error(err);
        toast.error('Failed to load suppliers/purchase orders');
      })
      .finally(() => {
        if (active) setLoadingLists(false);
      });

    return () => {
      active = false;
    };
  }, []);

  // Auto-populate supplier when PO is selected
  useEffect(() => {
    if (!selectedPoId) return;

    const po = purchaseOrders.find((p) => p.id === selectedPoId);
    const supplierId = po?.supplierId || po?.supplier?.id;
    if (po && supplierId && !selectedSupplierId) {
      setSelectedSupplierId(supplierId);
    }
  }, [selectedPoId, purchaseOrders, selectedSupplierId]);

  const handleCreateDebitNote = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplierId || !selectedPoId || !amount || !reason) {
      toast.error('Please enter all details');
      return;
    }

    try {
      setSubmitting(true);
      await createDebitNote({
        supplierId: selectedSupplierId,
        purchaseOrderId: selectedPoId,
        amount: parseFloat(amount),
        reason,
      });

      toast.success('Debit Note generated as Draft');
      setSelectedSupplierId('');
      setSelectedPoId('');
      setAmount('');
      setReason('');
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Failed to create Debit Note');
    } finally {
      setSubmitting(false);
    }
  }, [selectedSupplierId, selectedPoId, amount, reason, onSuccess, onClose]);

  return {
    selectedSupplierId,
    setSelectedSupplierId,
    selectedPoId,
    setSelectedPoId,
    amount,
    setAmount,
    reason,
    setReason,
    suppliers,
    purchaseOrders,
    loadingLists,
    submitting,
    handleCreateDebitNote,
  };
}
