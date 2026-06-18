'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  /** Builds the full path including query string for the given page. */
  buildEndpoint: (page: number) => string;
  pageSize?: number;
  /** Raw search input; debounced internally unless `debounceMs` is 0. */
  searchQuery?: string;
  debounceMs?: number;
  errorMessage?: string;
  enabled?: boolean;
  useAbort?: boolean;
  parseResponse?: (
    res: Record<string, unknown>,
    page: number,
    pageSize: number,
  ) => { items: T[]; pagination: ApiListPagination };
  /** Filter/sort keys that reset pagination to page 1 when changed. */
  deps?: readonly unknown[];
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
  const buildEndpointRef = useRef(buildEndpoint);
  const parseResponseRef = useRef(parseResponse);
  buildEndpointRef.current = buildEndpoint;
  parseResponseRef.current = parseResponse;

  const filtersKey = useMemo(
    () => JSON.stringify([debouncedSearch, ...deps]),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- deps is a tuple of primitives
    [debouncedSearch, ...deps],
  );

  const prevFiltersKeyRef = useRef<string | null>(null);
  const skipNextPageFetchRef = useRef(false);
  const paginationPageRef = useRef(1);
  paginationPageRef.current = pagination.page;

  const fetchPage = useCallback(async (page: number) => {
    const requestId = ++requestIdRef.current;

    if (useAbort) {
      abortRef.current?.abort();
      abortRef.current = new AbortController();
    }

    setLoading(true);
    try {
      const endpoint = buildEndpointRef.current(page);
      const options = useAbort && abortRef.current
        ? { signal: abortRef.current.signal }
        : {};
      const res = await fetchAPI(endpoint, options);

      if (requestId !== requestIdRef.current) return;

      if (res?.success !== false) {
        const parsed = parseResponseRef.current(res, page, pageSize);
        setItems(parsed.items);
        setPagination((prev) => {
          const next = parsed.pagination;
          if (
            prev.page === next.page &&
            prev.limit === next.limit &&
            prev.total === next.total &&
            prev.totalPages === next.totalPages
          ) {
            return prev;
          }
          return next;
        });
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
  }, [errorMessage, pageSize, useAbort]);

  const fetchPageRef = useRef(fetchPage);
  fetchPageRef.current = fetchPage;

  useEffect(() => {
    if (!enabled) return;

    const filtersChanged =
      prevFiltersKeyRef.current !== null && prevFiltersKeyRef.current !== filtersKey;
    prevFiltersKeyRef.current = filtersKey;

    if (filtersChanged) {
      if (paginationPageRef.current !== 1) {
        skipNextPageFetchRef.current = true;
        setPagination((prev) => (prev.page === 1 ? prev : { ...prev, page: 1 }));
      }
      const timer = window.setTimeout(() => {
        void fetchPageRef.current(1);
      }, 0);
      return () => window.clearTimeout(timer);
    }

    if (skipNextPageFetchRef.current) {
      skipNextPageFetchRef.current = false;
      return;
    }

    const timer = window.setTimeout(() => {
      void fetchPageRef.current(paginationPageRef.current);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [enabled, filtersKey, pagination.page]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const handlePageChange = useCallback((page: number) => {
    setPagination((prev) => (prev.page === page ? prev : { ...prev, page }));
  }, []);

  const resetToFirstPage = useCallback(() => {
    setPagination((prev) => (prev.page === 1 ? prev : { ...prev, page: 1 }));
  }, []);

  const refresh = useCallback((page?: number) => {
    void fetchPageRef.current(page ?? paginationPageRef.current);
  }, []);

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
