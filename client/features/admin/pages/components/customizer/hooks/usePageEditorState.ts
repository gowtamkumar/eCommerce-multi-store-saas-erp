"use client";

import { PageData } from '@/types/customizer';
import { useCallback, useEffect, useRef, useState } from 'react';

function stableSerialize(data: PageData): string {
  return JSON.stringify(data);
}

export type SaveStatus = 'saved' | 'unsaved' | 'saving';

interface HistoryState {
  past: string[];
  present: PageData;
  future: string[];
}

const HISTORY_LIMIT = 60;
const DEBOUNCE_MS = 250;

export function usePageEditorState(initialData: PageData) {
  const [history, setHistory] = useState<HistoryState>(() => ({
    past: [],
    present: initialData,
    future: [],
  }));
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const baselineRef = useRef(stableSerialize(initialData));
  const lastPushAt = useRef<number>(0);

  useEffect(() => {
    baselineRef.current = stableSerialize(initialData);
    setHistory({ past: [], present: initialData, future: [] });
    setSaveStatus('saved');
  }, [initialData]);

  /**
   * Coalesce rapid updates (typing) into a single history entry; commit a new
   * undo step once the user pauses or after a hard barrier.
   */
  const updateData = useCallback(
    (updater: PageData | ((prev: PageData) => PageData), opts?: { commit?: boolean }) => {
      setHistory((prev) => {
        const next = typeof updater === 'function' ? updater(prev.present) : updater;
        const now = Date.now();
        const shouldCommit = opts?.commit ?? now - lastPushAt.current > DEBOUNCE_MS;
        const prevSerialized = stableSerialize(prev.present);
        const nextSerialized = stableSerialize(next);
        if (prevSerialized === nextSerialized) return prev;
        if (nextSerialized !== baselineRef.current) {
          setSaveStatus((s) => (s === 'saving' ? s : 'unsaved'));
        }
        lastPushAt.current = now;
        const past = shouldCommit
          ? [...prev.past, prevSerialized].slice(-HISTORY_LIMIT)
          : prev.past;
        return { past, present: next, future: [] };
      });
    },
    [],
  );

  const undo = useCallback(() => {
    setHistory((prev) => {
      if (prev.past.length === 0) return prev;
      const past = prev.past.slice(0, -1);
      const previous = JSON.parse(prev.past[prev.past.length - 1]) as PageData;
      const future = [stableSerialize(prev.present), ...prev.future];
      const serialized = stableSerialize(previous);
      setSaveStatus(serialized === baselineRef.current ? 'saved' : 'unsaved');
      return { past, present: previous, future };
    });
  }, []);

  const redo = useCallback(() => {
    setHistory((prev) => {
      if (prev.future.length === 0) return prev;
      const [head, ...rest] = prev.future;
      const next = JSON.parse(head) as PageData;
      const past = [...prev.past, stableSerialize(prev.present)].slice(-HISTORY_LIMIT);
      const serialized = stableSerialize(next);
      setSaveStatus(serialized === baselineRef.current ? 'saved' : 'unsaved');
      return { past, present: next, future: rest };
    });
  }, []);

  const markSaving = useCallback(() => setSaveStatus('saving'), []);

  const markSaved = useCallback((saved: PageData) => {
    baselineRef.current = stableSerialize(saved);
    setHistory((prev) => ({ ...prev, present: saved }));
    setSaveStatus('saved');
  }, []);

  const markSaveFailed = useCallback(() => {
    setSaveStatus('unsaved');
  }, []);

  return {
    data: history.present,
    setData: updateData,
    undo,
    redo,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
    saveStatus,
    isDirty: saveStatus === 'unsaved',
    markSaving,
    markSaved,
    markSaveFailed,
  };
}
