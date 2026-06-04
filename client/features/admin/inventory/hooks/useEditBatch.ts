'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { fetchAPI } from '@/services/api';
import { ProductBatch, BatchStatus } from './useBatchRegistry';

export function useEditBatch(batch: ProductBatch | null, onSuccess: () => void) {
  const [loading, setLoading] = useState(false);
  const [batchNumber, setBatchNumber] = useState('');
  const [manufactureDate, setManufactureDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [status, setStatus] = useState<BatchStatus>('ACTIVE');

  useEffect(() => {
    if (!batch) return;

    const timer = window.setTimeout(() => {
      setBatchNumber(batch.batchNumber);
      setManufactureDate(batch.manufactureDate ? batch.manufactureDate.split('T')[0] : '');
      setExpiryDate(batch.expiryDate.split('T')[0]);
      setStatus(batch.status);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [batch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batch) return;

    setLoading(true);
    try {
      const res = await fetchAPI(`/product-batches/${batch.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          batchNumber,
          manufactureDate: manufactureDate || null,
          expiryDate,
          status,
        }),
      });

      if (res.success) {
        toast.success('Batch updated successfully');
        onSuccess();
      }
    } catch {
      toast.error('Failed to update batch.');
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    batchNumber,
    setBatchNumber,
    manufactureDate,
    setManufactureDate,
    expiryDate,
    setExpiryDate,
    status,
    setStatus,
    handleSubmit,
  };
}
