'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { fetchAPI } from '@/services/api';
import { Page, PageDeleteTarget, PageStatusFilter } from '../type';
import { usePageOrderEditor } from './usePageOrderEditor';

const CLOSED_DELETE_TARGET: PageDeleteTarget = { isOpen: false, id: '', isHomePage: false };

export function usePagesManager() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<PageStatusFilter>('all');
  const [deleteTarget, setDeleteTarget] = useState<PageDeleteTarget>(CLOSED_DELETE_TARGET);

  const fetchPages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAPI('/pages');
      if (res.success) {
        setPages(res.data);
      } else {
        setError('Failed to load pages');
      }
    } catch (err) {
      console.error('Failed to fetch pages', err);
      setError('Failed to load pages');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchPages();
  }, [fetchPages]);

  const { updatingOrder, handleOrderInput, handleOrderBlur } = usePageOrderEditor({
    setPages,
    refetch: fetchPages,
  });

  const openDeleteModal = useCallback((page: Page) => {
    setDeleteTarget({ isOpen: true, id: page.id, isHomePage: page.isHomePage });
  }, []);

  const closeDeleteModal = useCallback(() => {
    setDeleteTarget(CLOSED_DELETE_TARGET);
  }, []);

  const handleDelete = useCallback(async () => {
    try {
      const res = await fetchAPI(`/pages/${deleteTarget.id}`, { method: 'DELETE' });
      if (res.success) {
        toast.success('Page deleted successfully');
        fetchPages();
      } else {
        toast.error('Failed to delete page');
      }
    } catch {
      toast.error('Error deleting page');
    }
    setDeleteTarget(CLOSED_DELETE_TARGET);
  }, [deleteTarget.id, fetchPages]);

  const filteredPages = useMemo(() => {
    const q = search.trim().toLowerCase();
    return pages.filter((page) => {
      if (statusFilter !== 'all' && page.status !== statusFilter) return false;
      if (!q) return true;
      return (
        page.title.toLowerCase().includes(q) ||
        (page.slug || '').toLowerCase().includes(q)
      );
    });
  }, [pages, search, statusFilter]);

  return {
    pages,
    loading,
    error,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    filteredPages,
    fetchPages,
    updatingOrder,
    handleOrderInput,
    handleOrderBlur,
    deleteTarget,
    openDeleteModal,
    closeDeleteModal,
    handleDelete,
  };
}
