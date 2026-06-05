'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { fetchAPI } from '@/services/api';
import { useDebounce } from '@/hooks/useDebounce';

export interface ApiListPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UseApiListOptions<T> {
  /** Static endpoint or function that builds the full path including query string. */
  buildEndpoint: (page: number) => string;
  pageSize?: number;
  /** Debounced search string; pass from parent state. */
  searchQuery?: string;
  debounceMs?: number;
  errorMessage?: string;
  /** When false, skips auto-fetch on mount/deps change. */
  enabled?: boolean;
  /** Abort in-flight requests when a newer one starts (recommended for filter-heavy lists). */
  useAbort?: boolean;
  /** Extract items and pagination from API response. */
  parseResponse?: (
    res: Record<string, unknown>,
    page: number,
    pageSize: number,
  ) => { items: T[]; pagination: ApiListPagination };
  /** Extra dependency keys that should trigger a refetch (filters, sort, etc.). */
  deps?: unknown[];
}

const defaultParseResponse = <T>(
  res: Record<string, unknown>,
  page: number,
  pageSize: number,
): { items: T[]; pagination: ApiListPagination } => {
  const data = res.data;
  if (res.data && typeof res.data === 'object' && !Array.isArray(res.data)) {
    const nested = res.data as { orders?: T[]; pagination?: ApiListPagination };
    if (Array.isArray(nested.orders)) {
      return {
        items: nested.orders,
        pagination: nested.pagination ?? {
          total: nested.orders.length,
          page,
          limit: pageSize,
          totalPages: 1,
        },
      };
    }
  }
  const items = Array.isArray(data) ? (data as T[]) : [];
  const pagination = (res.pagination as ApiListPagination | undefined) ?? {
    total: items.length,
    page,
    limit: pageSize,
    totalPages: 1,
  };
  return { items, pagination };
};

export function useApiList<T>({
  buildEndpoint,
  pageSize = 10,
  searchQuery = '',
  debounceMs = 400,
  errorMessage = 'Failed to load data',
  enabled = true,
  useAbort = false,
  parseResponse = defaultParseResponse,
  deps = [],
}: UseApiListOptions<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<ApiListPagination>({
    total: 0,
    page: 1,
    limit: pageSize,
    totalPages: 1,
  });

  const debouncedSearch = useDebounce(searchQuery, debounceMs);
  const requestIdRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);

  const fetchPage = useCallback(
    async (page: number) => {
      const requestId = ++requestIdRef.current;

      if (useAbort) {
        abortRef.current?.abort();
        abortRef.current = new AbortController();
      }

      setLoading(true);
      try {
        const endpoint = buildEndpoint(page);
        const options = useAbort && abortRef.current
          ? { signal: abortRef.current.signal }
          : {};
        const res = await fetchAPI(endpoint, options);

        if (requestId !== requestIdRef.current) return;

        if (res?.success !== false) {
          const parsed = parseResponse(res, page, pageSize);
          setItems(parsed.items);
          setPagination(parsed.pagination);
        }
      } catch (error) {
        if (useAbort && (error as Error)?.name === 'AbortError') return;
        if (requestId !== requestIdRef.current) return;
        console.error(errorMessage, error);
        toast.error(errorMessage);
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    },
    [buildEndpoint, errorMessage, pageSize, parseResponse, useAbort],
  );

  useEffect(() => {
    if (!enabled) return;
    const timer = window.setTimeout(() => {
      void fetchPage(pagination.page);
    }, 0);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchPage, pagination.page, debouncedSearch, enabled, ...deps]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const handlePageChange = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);

  const resetToFirstPage = useCallback(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  const refresh = useCallback(
    (page?: number) => {
      void fetchPage(page ?? pagination.page);
    },
    [fetchPage, pagination.page],
  );

  return {
    items,
    setItems,
    loading,
    pagination,
    setPagination,
    fetchPage,
    refresh,
    handlePageChange,
    resetToFirstPage,
  };
}
