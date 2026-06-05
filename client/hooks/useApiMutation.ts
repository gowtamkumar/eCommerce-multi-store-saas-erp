'use client';

import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import { fetchAPI } from '@/services/api';

export interface UseApiMutationOptions {
  successMessage?: string;
  errorMessage?: string;
  loadingMessage?: string;
}

export function useApiMutation(defaultOptions: UseApiMutationOptions = {}) {
  const [mutating, setMutating] = useState(false);

  const mutate = useCallback(
    async <T = Record<string, unknown>>(
      endpoint: string,
      init: RequestInit = {},
      options: UseApiMutationOptions = {},
    ): Promise<{ success: boolean; data?: T; error?: string }> => {
      const merged = { ...defaultOptions, ...options };
      const toastId = merged.loadingMessage ? toast.loading(merged.loadingMessage) : undefined;

      setMutating(true);
      try {
        const res = await fetchAPI(endpoint, init);
        if (res?.success !== false) {
          if (merged.successMessage) {
            toast.success(merged.successMessage, toastId ? { id: toastId } : undefined);
          } else if (toastId) {
            toast.dismiss(toastId);
          }
          return { success: true, data: res?.data as T };
        }
        const err = (res?.error as string) || merged.errorMessage || 'Request failed';
        toast.error(err, toastId ? { id: toastId } : undefined);
        return { success: false, error: err };
      } catch (error) {
        const err = error instanceof Error ? error.message : merged.errorMessage || 'Request failed';
        toast.error(err, toastId ? { id: toastId } : undefined);
        return { success: false, error: err };
      } finally {
        setMutating(false);
      }
    },
    [defaultOptions],
  );

  return { mutate, mutating };
}
