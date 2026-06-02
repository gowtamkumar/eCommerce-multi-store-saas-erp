"use client";

import { SectionType } from '@/types/customizer';
import { useCallback, useEffect, useState } from 'react';

const KEY = 'pageBuilder:recentBlocks';
const LIMIT = 6;

function readStorage(): SectionType[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SectionType[];
    return Array.isArray(parsed) ? parsed.slice(0, LIMIT) : [];
  } catch {
    return [];
  }
}

export function useRecentBlocks() {
  const [recent, setRecent] = useState<SectionType[]>(() => readStorage());

  useEffect(() => {
    setRecent(readStorage());
  }, []);

  const push = useCallback((type: SectionType) => {
    setRecent((prev) => {
      const next = [type, ...prev.filter((t) => t !== type)].slice(0, LIMIT);
      try {
        window.localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        /* ignore storage errors */
      }
      return next;
    });
  }, []);

  return { recent, push };
}
