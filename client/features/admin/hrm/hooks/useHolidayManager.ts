'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { createHoliday, deleteHoliday, getHolidays, updateHoliday } from '@/services/hrm';
import { getBranches } from '@/services/organization';

export interface Holiday {
  id: string;
  date: string;
  name: string;
  description?: string;
  isOptional: boolean;
  branchId?: string | null;
  branch?: { name: string };
}

export interface HolidayBranch {
  id: string;
  name: string;
}

export interface HolidayForm {
  date: string;
  name: string;
  description: string;
  branchId: string;
  isOptional: boolean;
}

export type HolidayCalendarView = 'month' | 'year' | 'decade' | 'century';

const getErrorMessage = (error: unknown, fallback: string) => (
  error instanceof Error ? error.message : fallback
);

const defaultForm = (): HolidayForm => ({
  date: new Date().toISOString().split('T')[0],
  name: '',
  description: '',
  branchId: '',
  isOptional: false,
});

export function useHolidayManager() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [branches, setBranches] = useState<HolidayBranch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null);
  const [formData, setFormData] = useState<HolidayForm>(defaultForm);

  const currentYear = calendarDate.getFullYear();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [holidayRes, branchRes] = await Promise.all([
        getHolidays({ year: currentYear, branchId: selectedBranch || undefined }),
        getBranches(),
      ]);
      setHolidays((holidayRes || []) as Holiday[]);
      setBranches(branchRes?.data || []);
    } catch (err) {
      console.error('Failed to fetch holidays:', err);
    } finally {
      setLoading(false);
    }
  }, [currentYear, selectedBranch]);

  useEffect(() => {
    void Promise.resolve().then(fetchData);
  }, [fetchData]);

  const holidaysByDate = useMemo(() => {
    const map = new Map<string, Holiday[]>();
    for (const holiday of holidays) {
      const key = dayjs(holiday.date).format('YYYY-MM-DD');
      map.set(key, [...(map.get(key) || []), holiday]);
    }
    return map;
  }, [holidays]);

  const upcomingHolidays = useMemo(() => {
    const now = dayjs().startOf('day');
    return [...holidays]
      .filter((holiday) => dayjs(holiday.date).isSame(now) || dayjs(holiday.date).isAfter(now))
      .sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf())
      .slice(0, 6);
  }, [holidays]);

  const stats = useMemo(() => ({
    total: holidays.length,
    global: holidays.filter((holiday) => !holiday.branchId).length,
    branchSpecific: holidays.filter((holiday) => holiday.branchId).length,
  }), [holidays]);

  const openCreateForm = useCallback((date?: Date) => {
    setEditingHoliday(null);
    setFormData({
      ...defaultForm(),
      date: dayjs(date || calendarDate).format('YYYY-MM-DD'),
      branchId: selectedBranch,
    });
    setShowForm(true);
  }, [calendarDate, selectedBranch]);

  const openEditForm = useCallback((holiday: Holiday) => {
    setEditingHoliday(holiday);
    setFormData({
      date: dayjs(holiday.date).format('YYYY-MM-DD'),
      name: holiday.name,
      description: holiday.description || '',
      branchId: holiday.branchId || '',
      isOptional: holiday.isOptional,
    });
    setShowForm(true);
  }, []);

  const closeForm = useCallback(() => setShowForm(false), []);

  const handleSubmit = useCallback(async () => {
    if (!formData.name.trim() || !formData.date) return;

    const payload = {
      date: formData.date,
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      branchId: formData.branchId || null,
      isOptional: formData.isOptional,
    };

    try {
      setSubmitting(true);
      if (editingHoliday) {
        await updateHoliday(editingHoliday.id, payload);
      } else {
        await createHoliday(payload);
      }
      setShowForm(false);
      setEditingHoliday(null);
      await fetchData();
    } catch (err: unknown) {
      alert(getErrorMessage(err, 'Failed to save holiday'));
    } finally {
      setSubmitting(false);
    }
  }, [editingHoliday, fetchData, formData]);

  const handleDelete = useCallback(async (holiday: Holiday) => {
    if (!confirm(`Delete "${holiday.name}"?`)) return;
    try {
      await deleteHoliday(holiday.id);
      setShowForm(false);
      setEditingHoliday(null);
      await fetchData();
    } catch (err: unknown) {
      alert(getErrorMessage(err, 'Failed to delete holiday'));
    }
  }, [fetchData]);

  const goToPreviousMonth = useCallback(() => {
    setCalendarDate((current) => dayjs(current).subtract(1, 'month').toDate());
  }, []);

  const goToToday = useCallback(() => setCalendarDate(new Date()), []);

  const goToNextMonth = useCallback(() => {
    setCalendarDate((current) => dayjs(current).add(1, 'month').toDate());
  }, []);

  return {
    loading,
    submitting,
    holidays,
    branches,
    selectedBranch,
    setSelectedBranch,
    calendarDate,
    setCalendarDate,
    showForm,
    editingHoliday,
    formData,
    setFormData,
    holidaysByDate,
    upcomingHolidays,
    stats,
    openCreateForm,
    openEditForm,
    closeForm,
    handleSubmit,
    handleDelete,
    goToPreviousMonth,
    goToToday,
    goToNextMonth,
  };
}
