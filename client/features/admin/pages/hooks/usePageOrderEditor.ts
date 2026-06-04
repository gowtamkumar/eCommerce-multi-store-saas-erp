'use client';

import { Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { fetchAPI } from '@/services/api';
import { Page } from '../type';

interface UsePageOrderEditorArgs {
  setPages: Dispatch<SetStateAction<Page[]>>;
  refetch: () => void;
}

const COMMIT_DELAY_MS = 600;

export function usePageOrderEditor({ setPages, refetch }: UsePageOrderEditorArgs) {
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);
  const orderDraftRef = useRef<Record<string, number>>({});
  const orderTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    const timers = orderTimersRef.current;
    return () => {
      Object.values(timers).forEach(clearTimeout);
    };
  }, []);

  const commitOrderChange = useCallback(async (id: string, newOrder: number) => {
    setUpdatingOrder(id);
    try {
      const res = await fetchAPI(`/pages/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ order: newOrder }),
      });

      if (!res.success) {
        toast.error('Failed to update order');
        refetch();
      }
    } catch {
      toast.error('Error updating order');
      refetch();
    } finally {
      setUpdatingOrder(null);
    }
  }, [refetch]);

  const handleOrderInput = useCallback((id: string, raw: string) => {
    const parsed = parseInt(raw, 10);
    const newOrder = Number.isFinite(parsed) ? parsed : 0;
    orderDraftRef.current[id] = newOrder;
    setPages((prev) => prev.map((page) => (page.id === id ? { ...page, order: newOrder } : page)));

    if (orderTimersRef.current[id]) clearTimeout(orderTimersRef.current[id]);
    orderTimersRef.current[id] = setTimeout(() => {
      commitOrderChange(id, orderDraftRef.current[id] ?? newOrder);
    }, COMMIT_DELAY_MS);
  }, [commitOrderChange, setPages]);

  const handleOrderBlur = useCallback((id: string) => {
    if (orderTimersRef.current[id]) {
      clearTimeout(orderTimersRef.current[id]);
      delete orderTimersRef.current[id];
    }
    const value = orderDraftRef.current[id];
    if (value !== undefined) {
      commitOrderChange(id, value);
    }
  }, [commitOrderChange]);

  return {
    updatingOrder,
    handleOrderInput,
    handleOrderBlur,
  };
}
