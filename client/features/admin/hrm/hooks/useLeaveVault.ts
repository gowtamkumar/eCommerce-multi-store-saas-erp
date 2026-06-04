'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { approveLeave, getEmployees, getLeaveRequests, requestLeave, rejectLeave } from '@/services/hrm';

export enum LeaveStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum LeaveType {
  SICK = 'SICK',
  CASUAL = 'CASUAL',
  ANNUAL = 'ANNUAL',
  UNPAID = 'UNPAID',
  MATERNITY = 'MATERNITY',
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: LeaveStatus;
  managerNote?: string;
  employee?: {
    user?: { name: string; email: string };
    department?: { name: string };
    designation?: { name: string };
  };
  approvedBy?: {
    user?: { name: string };
  };
}

export interface LeaveEmployee {
  id: string;
  user?: { name: string; email: string };
}

export interface LeaveFormData {
  employeeId: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
}

export interface ApproveFormData {
  managerNote: string;
  approvedById: string;
}

export type LeaveDecision = 'approve' | 'reject';

export interface LeaveDecisionTarget {
  id: string;
  type: LeaveDecision;
}

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

const TODAY = new Date().toISOString().split('T')[0];

const diffInDays = (start: string, end: string) =>
  Math.max(1, Math.floor((new Date(end).getTime() - new Date(start).getTime()) / 86_400_000) + 1);

export function useLeaveVault() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [employees, setEmployees] = useState<LeaveEmployee[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [decisionTarget, setDecisionTarget] = useState<LeaveDecisionTarget | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<LeaveFormData>({
    employeeId: '',
    leaveType: LeaveType.ANNUAL,
    startDate: TODAY,
    endDate: TODAY,
    reason: '',
  });

  const [approveData, setApproveData] = useState<ApproveFormData>({
    managerNote: '',
    approvedById: '',
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [leavesRes, empRes] = await Promise.all([
        getLeaveRequests(),
        getEmployees(),
      ]);
      setRequests((leavesRes as LeaveRequest[]) || []);
      setEmployees((empRes as LeaveEmployee[]) || []);
    } catch (err) {
      console.error('Failed to fetch leave data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void Promise.resolve().then(fetchData); }, [fetchData]);

  const handleRequestSubmit = useCallback(async () => {
    if (!formData.employeeId || !formData.reason) return;
    try {
      setSubmitting(true);
      await requestLeave(formData.employeeId, formData);
      setShowRequestForm(false);
      void fetchData();
    } catch (err: unknown) {
      alert(getErrorMessage(err, 'Request failed'));
    } finally {
      setSubmitting(false);
    }
  }, [formData, fetchData]);

  const openDecision = useCallback((id: string, type: LeaveDecision) => {
    setApproveData({ managerNote: '', approvedById: '' });
    setDecisionTarget({ id, type });
  }, []);

  const closeDecision = useCallback(() => setDecisionTarget(null), []);

  const handleDecision = useCallback(async () => {
    if (!decisionTarget) return;
    if (!approveData.approvedById) {
      alert('Please select an approving manager for this simulation.');
      return;
    }
    const { id, type } = decisionTarget;
    const action = type === 'approve' ? approveLeave : rejectLeave;
    try {
      setSubmitting(true);
      await action(id, approveData.approvedById, approveData.managerNote);
      setDecisionTarget(null);
      void fetchData();
    } catch (err: unknown) {
      alert(getErrorMessage(err, type === 'approve' ? 'Approval failed' : 'Rejection failed'));
    } finally {
      setSubmitting(false);
    }
  }, [decisionTarget, approveData, fetchData]);

  const filteredRequests = useMemo(
    () => requests.filter(r =>
      !searchQuery ||
      r.employee?.user?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.reason.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    [requests, searchQuery]
  );

  const stats = useMemo(() => ({
    pending: requests.filter(r => r.status === LeaveStatus.PENDING).length,
    approved: requests.filter(r => r.status === LeaveStatus.APPROVED).length,
    activeToday: requests.filter(r =>
      r.status === LeaveStatus.APPROVED &&
      new Date(r.startDate) <= new Date() &&
      new Date(r.endDate) >= new Date()
    ).length,
  }), [requests]);

  const computedDays = useMemo(
    () => diffInDays(formData.startDate, formData.endDate),
    [formData.startDate, formData.endDate]
  );

  return {
    // Data
    loading,
    filteredRequests,
    employees,
    stats,
    computedDays,
    // Search
    searchQuery,
    setSearchQuery,
    // Request modal
    showRequestForm,
    setShowRequestForm,
    // Decision (approve/reject) modal
    decisionTarget,
    openDecision,
    closeDecision,
    // Forms
    formData,
    setFormData,
    approveData,
    setApproveData,
    // Actions
    submitting,
    handleRequestSubmit,
    handleDecision,
  };
}
