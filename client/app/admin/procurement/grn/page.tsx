'use client';

import GrnListPage from '@/features/admin/grn/components/GrnListPage';
import { fetchAPI } from '@/services/api';
import { useEffect, useState } from 'react';

// const MOCK_GRNS = [
//   {
//     id: 'grn-1',
//     createdAt: new Date('2026-05-15').toISOString(),
//     grnNumber: 'GRN-2026-001',
//     purchaseOrder: { referenceNumber: 'PO-2026-042' },
//     supplier: { name: 'Acme Wood & Lumbers' },
//     warehouse: { name: 'Primary Distribution Center' },
//     status: GrnStatus.RECEIVED,
//     items: [
//       { receivedQty: 100, unitCost: 15.5 },
//       { receivedQty: 50, unitCost: 45.0 }
//     ]
//   },
//   {
//     id: 'grn-2',
//     createdAt: new Date('2026-05-12').toISOString(),
//     grnNumber: 'GRN-2026-002',
//     purchaseOrder: { referenceNumber: 'PO-2026-039' },
//     supplier: { name: 'Vibrant Packaging Solutions' },
//     warehouse: { name: 'Secondary Sorting Hub' },
//     status: GrnStatus.RECEIVED,
//     items: [
//       { receivedQty: 500, unitCost: 2.25 }
//     ]
//   },
//   {
//     id: 'grn-3',
//     createdAt: new Date('2026-05-10').toISOString(),
//     grnNumber: 'GRN-2026-003',
//     purchaseOrder: { referenceNumber: 'PO-2026-045' },
//     supplier: { name: 'Global Tech & Electronics' },
//     warehouse: { name: 'Primary Distribution Center' },
//     status: GrnStatus.DRAFT,
//     items: [
//       { receivedQty: 10, unitCost: 850.00 }
//     ]
//   },
//   {
//     id: 'grn-4',
//     createdAt: new Date('2026-05-08').toISOString(),
//     grnNumber: 'GRN-2026-004',
//     purchaseOrder: { referenceNumber: 'PO-2026-031' },
//     supplier: { name: 'Sovereign Logistics Inc' },
//     warehouse: { name: 'Primary Distribution Center' },
//     status: GrnStatus.REJECTED,
//     items: [
//       { receivedQty: 250, unitCost: 12.00 }
//     ]
//   }
// ];

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
      const response = await fetchAPI(`operations/logistics/grn?${params.toString()}`);
      if (response.success && response.data?.items && response.data.items.length > 0) {
        setGrns(response.data.items);
        setPagination({
          page: response.data.page || page,
          totalPages: response.data.totalPages || 1,
          total: response.data.total
        });
      } else {
        // Return beautiful mock items as a warm, functional sandbox fallback
        let filteredMocks: any = [];
        if (searchQuery) {
          filteredMocks = filteredMocks.filter((g: any) =>
            g.grnNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            g.supplier.name.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }
        if (statusFilter) {
          filteredMocks = filteredMocks.filter((g: any) => g.status === statusFilter);
        }
        setGrns(filteredMocks as any);
        setPagination({
          page: 1,
          totalPages: 1,
          total: filteredMocks.length
        });
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
