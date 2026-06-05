'use client';

import { useDebounce } from '@/hooks/useDebounce';
import { LeadStatus } from '@/lib/enums/lead-status.enum';
import { fetchAPI } from '@/services/api';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import type { Pagination } from '../../customer/type';
import { buildLeadsCsv, downloadCsv } from '../lib/leadCsv';
import type { LeadMessage } from '../type';

const PAGE_SIZE = 20;
const EXPORT_LIMIT = 5000;

const DEFAULT_PAGINATION: Pagination = {
    total: 0,
    page: 1,
    limit: PAGE_SIZE,
    totalPages: 1,
};

function buildLeadParams(page: number, limit: number, search: string, status: string) {
    return new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search,
        status,
    });
}

interface LeadsApiResponse {
    success?: boolean;
    data?: LeadMessage[] | { leads?: LeadMessage[] };
    pagination?: Pagination;
}

function getLeadsFromResponse(response: LeadsApiResponse): LeadMessage[] {
    if (!response.success || !response.data) return [];
    return Array.isArray(response.data) ? response.data : (response.data.leads || []);
}

export function useLeadManager() {
    const [leads, setLeads] = useState<LeadMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [pagination, setPagination] = useState<Pagination>(DEFAULT_PAGINATION);
    const [statusFilter, setStatusFilter] = useState('');
    const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const debouncedSearch = useDebounce(searchQuery, 500);

    const fetchLeads = useCallback(async (page: number, search: string, status: string) => {
        setLoading(true);
        try {
            const params = buildLeadParams(page, PAGE_SIZE, search, status);
            const res = await fetchAPI(`/leads?${params}`);

            const response = res as LeadsApiResponse;
            if (response.success && response.data) {
                setLeads(getLeadsFromResponse(response));
                setPagination(response.pagination || DEFAULT_PAGINATION);
            }
        } catch (error) {
            console.error('Failed to fetch leads', error);
            toast.error('Failed to fetch leads');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void fetchLeads(1, debouncedSearch, statusFilter);
    }, [debouncedSearch, statusFilter, fetchLeads]);

    const handlePageChange = useCallback((newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            void fetchLeads(newPage, debouncedSearch, statusFilter);
        }
    }, [pagination.totalPages, debouncedSearch, statusFilter, fetchLeads]);

    const handleStatusUpdate = useCallback(async (id: string, newStatus: LeadStatus) => {
        setUpdatingStatus(id);
        try {
            const res = await fetchAPI(`/leads/${id}`, {
                method: 'PATCH',
                body: JSON.stringify({ status: newStatus }),
            });

            if (res.success) {
                toast.success('Status updated');
                setLeads((prev) => prev.map((lead) => (
                    lead.id === id ? { ...lead, status: newStatus } : lead
                )));
            } else {
                toast.error('Update failed');
            }
        } catch (error) {
            toast.error('Failed to update status');
        } finally {
            setUpdatingStatus(null);
        }
    }, []);

    const handleExport = useCallback(async () => {
        setExporting(true);
        try {
            const params = buildLeadParams(1, EXPORT_LIMIT, debouncedSearch, statusFilter);
            const res = await fetchAPI(`/leads?${params}`);
            const response = res as LeadsApiResponse;
            const exportLeads = getLeadsFromResponse(response);

            if (response.success) {
                const date = new Date().toISOString().split('T')[0];
                downloadCsv(buildLeadsCsv(exportLeads), `newsletter_export_${date}.csv`);
                toast.success('Newsletter exported successfully');
            }
        } catch (error) {
            console.error('Export failed', error);
            toast.error('Failed to export leads');
        } finally {
            setExporting(false);
        }
    }, [debouncedSearch, statusFilter]);

    return {
        leads,
        loading,
        exporting,
        pagination,
        statusFilter,
        updatingStatus,
        searchQuery,
        setSearchQuery,
        setStatusFilter,
        handlePageChange,
        handleStatusUpdate,
        handleExport,
    };
}
