'use client';

import { useCallback, useEffect, useState } from 'react';
import { assignShift, createShift, deleteShift, getEmployees, getShifts, updateShift } from '@/services/hrm';

export interface Shift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  graceMinutes: number;
  isNightShift: boolean;
  workingDays?: number[];
}

export interface ShiftEmployee {
  id: string;
  user?: { name: string; email: string };
  department?: { name: string };
  designation?: { name: string };
}

export interface ShiftFormData {
  name: string;
  startTime: string;
  endTime: string;
  graceMinutes: number;
  isNightShift: boolean;
  workingDays: number[];
}

export interface AssignFormData {
  employeeId: string;
  shiftId: string;
  effectiveFrom: string;
}

const DEFAULT_SHIFT: ShiftFormData = {
  name: '',
  startTime: '09:00:00',
  endTime: '18:00:00',
  graceMinutes: 15,
  isNightShift: false,
  workingDays: [1, 2, 3, 4, 5],
};

export function formatTime12h(timeStr: string): string {
  if (!timeStr) return '';
  const parts = timeStr.split(':');
  if (parts.length < 2) return timeStr;
  let hour = parseInt(parts[0], 10);
  const minute = parts[1];
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12 || 12;
  return `${String(hour).padStart(2, '0')}:${minute} ${ampm}`;
}

export function useShiftManager() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [employees, setEmployees] = useState<ShiftEmployee[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showShiftForm, setShowShiftForm] = useState(false);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [shiftData, setShiftData] = useState<ShiftFormData>(DEFAULT_SHIFT);
  const [assignData, setAssignData] = useState<AssignFormData>({
    employeeId: '',
    shiftId: '',
    effectiveFrom: new Date().toISOString().split('T')[0],
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [shiftRes, empRes] = await Promise.all([getShifts(), getEmployees()]);
      setShifts((shiftRes as Shift[]) || []);
      setEmployees((empRes as ShiftEmployee[]) || []);
    } catch (err) {
      console.error('Failed to fetch shifts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void Promise.resolve().then(fetchData); }, [fetchData]);

  const openNewShiftForm = useCallback(() => {
    setEditingId(null);
    setShiftData(DEFAULT_SHIFT);
    setShowShiftForm(true);
  }, []);

  const openEditShiftForm = useCallback((shift: Shift) => {
    setEditingId(shift.id);
    setShiftData({
      name: shift.name,
      startTime: shift.startTime,
      endTime: shift.endTime,
      graceMinutes: shift.graceMinutes,
      isNightShift: shift.isNightShift,
      workingDays: shift.workingDays?.length ? shift.workingDays : [1, 2, 3, 4, 5],
    });
    setShowShiftForm(true);
  }, []);

  const toggleWorkingDay = useCallback((dayIdx: number) => {
    setShiftData((prev) => {
      const current = prev.workingDays || [];
      const next = current.includes(dayIdx)
        ? current.filter((x) => x !== dayIdx)
        : [...current, dayIdx].sort((a, b) => a - b);
      return { ...prev, workingDays: next };
    });
  }, []);

  const handleShiftSubmit = useCallback(async () => {
    if (!shiftData.name.trim()) return;
    try {
      setSubmitting(true);
      if (editingId) {
        await updateShift(editingId, shiftData);
      } else {
        await createShift(shiftData);
      }
      setShowShiftForm(false);
      setEditingId(null);
      setShiftData(DEFAULT_SHIFT);
      void fetchData();
    } catch (err) {
      console.error('Failed to save shift:', err);
    } finally {
      setSubmitting(false);
    }
  }, [shiftData, editingId, fetchData]);

  const handleAssignSubmit = useCallback(async () => {
    if (!assignData.employeeId || !assignData.shiftId) return;
    try {
      setSubmitting(true);
      await assignShift(assignData.employeeId, {
        shiftId: assignData.shiftId,
        effectiveFrom: assignData.effectiveFrom,
      });
      setShowAssignForm(false);
      setAssignData({ employeeId: '', shiftId: '', effectiveFrom: new Date().toISOString().split('T')[0] });
      alert('Shift assigned successfully!');
    } catch (err) {
      console.error('Failed to assign shift:', err);
    } finally {
      setSubmitting(false);
    }
  }, [assignData]);

  const handleDeleteShift = useCallback(async (id: string) => {
    if (!confirm('Delete this shift template?')) return;
    try {
      await deleteShift(id);
      void fetchData();
    } catch (err) {
      console.error('Failed to delete shift:', err);
    }
  }, [fetchData]);

  const filteredShifts = shifts.filter(s =>
    !searchQuery || s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return {
    loading,
    submitting,
    shifts,
    employees,
    filteredShifts,
    searchQuery,
    setSearchQuery,
    showShiftForm,
    setShowShiftForm,
    showAssignForm,
    setShowAssignForm,
    editingId,
    shiftData,
    setShiftData,
    assignData,
    setAssignData,
    openNewShiftForm,
    openEditShiftForm,
    toggleWorkingDay,
    handleShiftSubmit,
    handleAssignSubmit,
    handleDeleteShift,
  };
}
