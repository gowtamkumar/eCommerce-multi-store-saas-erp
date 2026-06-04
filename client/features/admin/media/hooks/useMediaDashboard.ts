'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { fetchAPI } from '@/services/api';
import { Pagination as PaginationType } from '../../customer/type';
import { MediaItem, RawMediaFile } from '../type';
import { copyToClipboard } from '../utils/mediaHelpers';

export function useMediaDashboard() {
    const [media, setMedia] = useState<MediaItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [bulkDeleting, setBulkDeleting] = useState(false);
    const [pagination, setPagination] = useState<PaginationType>({
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 1
    });

    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        isDangerous: false,
    });

    const [debouncedSearch, setDebouncedSearch] = useState(search);
    const requestIdRef = useRef(0);

    const fetchMedia = useCallback(async (page: number, searchQuery: string) => {
        const requestId = ++requestIdRef.current;
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '20'
            });
            if (searchQuery.trim()) params.set('q', searchQuery.trim());

            const res = await fetchAPI(`/admin/media?${params}`);
            if (requestId !== requestIdRef.current) return;

            if (res.data && res.data.items) {
                const mappedMedia: MediaItem[] = (res.data.items as RawMediaFile[]).map((f) => {
                    // Extract timestamp from filename (timestamp_name.ext)
                    let createdAt = new Date().toISOString();
                    const parts = f.filename?.split('_');
                    if (parts && parts.length > 1 && !isNaN(Number(parts[0]))) {
                        createdAt = new Date(Number(parts[0])).toISOString();
                    }
                    return {
                        _id: f.id,
                        filename: f.originalname || f.filename || 'Untitled',
                        url: f.path || '',
                        mimetype: f.mimetype || '',
                        size: f.size || 0,
                        createdAt: f.createdAt || createdAt
                    };
                });

                setMedia(mappedMedia);
                setSelectedIds(new Set());
                setPagination({
                    total: res.data.total,
                    page: res.data.page,
                    limit: res.data.limit,
                    totalPages: res.data.totalPages || 1
                });
            } else {
                setMedia([]);
                setSelectedIds(new Set());
            }
        } catch (error) {
            if (requestId !== requestIdRef.current) return;
            console.error('Error fetching media:', error);
            toast.error('Failed to load media library');
        } finally {
            if (requestId === requestIdRef.current) setLoading(false);
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        const t = setTimeout(() => {
            void fetchMedia(1, debouncedSearch);
        }, 0);
        return () => clearTimeout(t);
    }, [debouncedSearch, fetchMedia]);

    const refetchAfterDelete = useCallback((removedCount: number) => {
        // Step back a page if we just emptied the current one.
        if (media.length === removedCount && pagination.page > 1) {
            void fetchMedia(pagination.page - 1, debouncedSearch);
        } else {
            void fetchMedia(pagination.page, debouncedSearch);
        }
    }, [media.length, pagination.page, debouncedSearch, fetchMedia]);

    const handleDelete = useCallback((id: string) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Image',
            message: 'Are you sure you want to delete this image? This action cannot be undone.',
            isDangerous: true,
            onConfirm: async () => {
                try {
                    await fetchAPI(`/admin/media/${id}`, { method: 'DELETE' });
                    toast.success('Image deleted successfully');
                    refetchAfterDelete(1);
                } catch (error) {
                    console.error('Error deleting:', error);
                    toast.error('Error deleting image');
                }
            },
        });
    }, [refetchAfterDelete]);

    const handleBulkDelete = useCallback(() => {
        const ids = Array.from(selectedIds);
        if (ids.length === 0) return;
        setConfirmModal({
            isOpen: true,
            title: `Delete ${ids.length} image${ids.length > 1 ? 's' : ''}`,
            message: `Are you sure you want to delete ${ids.length} selected image${ids.length > 1 ? 's' : ''}? This action cannot be undone.`,
            isDangerous: true,
            onConfirm: async () => {
                setBulkDeleting(true);
                try {
                    const results = await Promise.allSettled(
                        ids.map((id) => fetchAPI(`/admin/media/${id}`, { method: 'DELETE' }))
                    );
                    const failed = results.filter((r) => r.status === 'rejected').length;
                    const succeeded = ids.length - failed;
                    if (succeeded > 0) toast.success(`${succeeded} image${succeeded > 1 ? 's' : ''} deleted`);
                    if (failed > 0) toast.error(`${failed} image${failed > 1 ? 's' : ''} failed to delete`);
                    refetchAfterDelete(succeeded);
                } catch (error) {
                    console.error('Error during bulk delete:', error);
                    toast.error('Bulk delete failed');
                } finally {
                    setBulkDeleting(false);
                }
            },
        });
    }, [selectedIds, refetchAfterDelete]);

    const toggleSelect = useCallback((id: string) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, []);

    const toggleSelectAll = useCallback(() => {
        setSelectedIds((prev) =>
            prev.size === media.length ? new Set() : new Set(media.map((m) => m._id))
        );
    }, [media]);

    const handleCopyToClipboard = useCallback(async (url: string, id: string) => {
        const success = await copyToClipboard(url);
        if (success) {
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        } else {
            toast.error('Failed to copy URL');
        }
    }, []);

    const allSelected = media.length > 0 && selectedIds.size === media.length;

    return {
        media,
        loading,
        copiedId,
        search,
        setSearch,
        selectedIds,
        setSelectedIds,
        bulkDeleting,
        pagination,
        confirmModal,
        setConfirmModal,
        debouncedSearch,
        fetchMedia,
        handleDelete,
        handleBulkDelete,
        toggleSelect,
        toggleSelectAll,
        handleCopyToClipboard,
        allSelected,
    };
}
