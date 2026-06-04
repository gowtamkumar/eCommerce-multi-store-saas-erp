'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import { fetchAPI } from '@/services/api';

export type BatchStatus = 'ACTIVE' | 'EXPIRED' | 'HOLD' | 'DELETED';

export interface ProductVariant {
  id: string;
  sku?: string;
  combination?: Record<string, string>;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  images?: string[];
  stock: number;
  price: number;
  variants?: ProductVariant[];
}

export interface ProductBatch {
  id: string;
  batchNumber: string;
  manufactureDate: string | null;
  expiryDate: string;
  initialQuantity: number;
  currentQuantity: number;
  status: BatchStatus;
  productId: string;
  variantId: string | null;
  product: {
    name: string;
    images?: string[];
  };
  variant?: {
    id?: string;
    combination?: Record<string, string>;
    sku?: string;
  } | null;
  createdAt: string;
}

export function useBatchRegistry() {
  const [batches, setBatches] = useState<ProductBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expiringSoonFilter, setExpiringSoonFilter] = useState(false);

  // Pagination states
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<ProductBatch | null>(null);

  // Sweep loading state
  const [sweeping, setSweeping] = useState(false);

  const fetchBatches = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '15',
        q: searchQuery,
      });
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      if (expiringSoonFilter) {
        params.append('expiringSoon', 'true');
      }

      const res = await fetchAPI(`/product-batches?${params.toString()}`);
      if (res.success) {
        setBatches(res.data.items || []);
        setTotalPages(res.data.totalPages || 1);
        setTotalItems(res.data.total || 0);
      }
    } catch (error) {
      console.error('Failed to fetch batches', error);
      toast.error('Failed to load product batches.');
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, statusFilter, expiringSoonFilter]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchBatches();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [fetchBatches]);

  const handleSweepExpired = useCallback(async () => {
    setSweeping(true);
    try {
      const res = await fetchAPI('/product-batches/sweep-expired', { method: 'POST' });
      if (res.success) {
        toast.success(`Sweep complete. ${res.data.affected} batches marked as expired.`);
        void fetchBatches();
      }
    } catch {
      toast.error('Failed to perform expired batch sweep.');
    } finally {
      setSweeping(false);
    }
  }, [fetchBatches]);

  const stats = useMemo(() => {
    const total = totalItems;
    const active = batches.filter(b => b.status === 'ACTIVE').length;
    const expired = batches.filter(b => b.status === 'EXPIRED').length;

    // Check expiring soon within 30 days
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);

    const nearExpiry = batches.filter(b => {
      const expDate = new Date(b.expiryDate);
      return b.status === 'ACTIVE' && expDate <= thirtyDaysFromNow && expDate > now;
    }).length;

    return { total, active, expired, nearExpiry };
  }, [batches, totalItems]);

  return {
    batches,
    loading,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    expiringSoonFilter,
    setExpiringSoonFilter,
    page,
    setPage,
    totalPages,
    totalItems,
    isCreateModalOpen,
    setIsCreateModalOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    selectedBatch,
    setSelectedBatch,
    sweeping,
    fetchBatches,
    handleSweepExpired,
    stats,
  };
}
