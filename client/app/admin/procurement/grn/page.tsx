'use client';

import GrnListPage from '@/features/admin/grn/components/GrnListPage';
import { fetchAPI } from '@/services/api';
import { useEffect, useState } from 'react';

export default function GrnsPage() {
  const [grns, setGrns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  const fetchGrns = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(searchQuery && { q: searchQuery }),
        ...(statusFilter && { status: statusFilter })
      });
      const response = await fetchAPI(`/operations/logistics/grn?${params.toString()}`);
      if (response.success && response.data?.items && response.data.items.length > 0) {
        setGrns(response.data.items);
        setPagination({
          page: response.data.page || page,
          totalPages: response.data.totalPages || 1,
          total: response.data.total
        });
      } else {
        setGrns([]);
        setPagination({ page: 1, totalPages: 1, total: 0 });
      }
    } catch (error) {
      console.error('Failed to fetch GRNs:', error);
      // Graceful safe fallback on network errors
      setGrns([]);
      setPagination({ page: 1, totalPages: 1, total: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchGrns(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, statusFilter]);

  return (
    <GrnListPage
      grns={grns}
      loading={loading}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      statusFilter={statusFilter}
      onStatusFilterChange={setStatusFilter}
      pagination={pagination}
      onPageChange={fetchGrns}
    />
  );
}
