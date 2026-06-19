'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  approvePayrollBatch,
  getEmployees,
  getPayrollBatches,
  getPayrollSlips,
  payPayrollBatch,
  processPayroll,
} from '@/services/hrm';

export interface PayrollBatch {
  id: string;
  name: string;
  period: string;
  totalAmount: number;
  status: string;
  processedAt?: string;
  approvedAt?: string;
  paidAt?: string;
  createdAt: string;
}

export interface PayrollSlip {
  id: string;
  employeeId: string;
  basicSalary: number;
  totalAllowances: number;
  totalDeductions: number;
  netSalary: number;
  details?: {
    allowances?: Array<{ type: string; amount: number }>;
    deductions?: Array<{ type: string; amount: number }>;
    overtimePay?: number;
    leaveDeductions?: number;
    lateDeductions?: number;
    incomeTax?: number;
    overtimeHours?: number;
    lateMinutes?: number;
    unpaidLeaveDays?: number;
    unpaidAbsenceDays?: number;
    inactiveDays?: number;
    holidayDays?: number;
    weeklyOffDays?: number;
    activeDays?: number;
    workingDays?: number;
    unpaidLeaveDeductions?: number;
    unpaidAbsenceDeductions?: number;
    inactiveDeductions?: number;
  };
  employee?: {
    user?: { name: string; email: string };
    department?: { name: string };
    designation?: { name: string };
  };
}

export interface PayrollEmployee {
  id: string;
  user?: { name: string };
}

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

export function usePayrollManager() {
  const [loading, setLoading] = useState(true);
  const [batches, setBatches] = useState<PayrollBatch[]>([]);
  const [employees, setEmployees] = useState<PayrollEmployee[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<PayrollBatch | null>(null);
  const [slips, setSlips] = useState<PayrollSlip[]>([]);
  const [loadingSlips, setLoadingSlips] = useState(false);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState<PayrollBatch | null>(null);
  const [approvedById, setApprovedById] = useState('');
  const [processing, setProcessing] = useState(false);
  const [processData, setProcessData] = useState({
    period: new Date().toISOString().slice(0, 7),
    name: `Payroll ${new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}`,
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [batchesRes, empRes] = await Promise.all([getPayrollBatches(), getEmployees()]);
      setBatches((batchesRes as PayrollBatch[]) || []);
      setEmployees((empRes as PayrollEmployee[]) || []);
    } catch (err) {
      console.error('Failed to fetch payroll batches:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void Promise.resolve().then(fetchData); }, [fetchData]);

  const totalCompensated = batches.reduce((sum, b) => sum + Number(b.totalAmount || 0), 0);

  const handleProcessPayroll = useCallback(async () => {
    try {
      setProcessing(true);
      await processPayroll(processData.period, processData.name);
      setShowProcessModal(false);
      void fetchData();
      alert('Payroll cycle processed successfully! Salary slips have been generated and the batch is now pending approval.');
    } catch (err: unknown) {
      alert(getErrorMessage(err, 'Payroll processing failed'));
    } finally {
      setProcessing(false);
    }
  }, [processData, fetchData]);

  const handleApprove = useCallback(async () => {
    if (!showApproveModal || !approvedById) return;
    try {
      setProcessing(true);
      const updated = await approvePayrollBatch(showApproveModal.id, approvedById) as PayrollBatch;
      if (selectedBatch?.id === showApproveModal.id) setSelectedBatch(updated);
      setShowApproveModal(null);
      setApprovedById('');
      void fetchData();
      alert('Payroll batch approved successfully! Salary accrual journal entries have been successfully posted to the General Ledger.');
    } catch (err: unknown) {
      alert(getErrorMessage(err, 'Approval failed'));
    } finally {
      setProcessing(false);
    }
  }, [showApproveModal, approvedById, selectedBatch, fetchData]);

  const handlePayBatch = useCallback(async () => {
    if (!selectedBatch) return;
    if (selectedBatch.status !== 'APPROVED') {
      alert('This batch must be APPROVED before it can be paid out.');
      return;
    }
    try {
      setProcessing(true);
      const updatedBatch = await payPayrollBatch(selectedBatch.id) as PayrollBatch;
      setSelectedBatch(updatedBatch);
      void fetchData();
      alert('Payroll batch disbursed and GL journal entries successfully created!');
    } catch (err: unknown) {
      alert(getErrorMessage(err, 'Payment release failed'));
    } finally {
      setProcessing(false);
    }
  }, [selectedBatch, fetchData]);

  const handleViewSlips = useCallback(async (batch: PayrollBatch) => {
    setSelectedBatch(batch);
    setLoadingSlips(true);
    try {
      const res = await getPayrollSlips(batch.id);
      setSlips((res as PayrollSlip[]) || []);
    } catch (err) {
      console.error('Failed to fetch slips:', err);
    } finally {
      setLoadingSlips(false);
    }
  }, []);

  return {
    loading,
    batches,
    employees,
    totalCompensated,
    selectedBatch,
    setSelectedBatch,
    slips,
    loadingSlips,
    showProcessModal,
    setShowProcessModal,
    showApproveModal,
    setShowApproveModal,
    approvedById,
    setApprovedById,
    processing,
    processData,
    setProcessData,
    handleProcessPayroll,
    handleApprove,
    handlePayBatch,
    handleViewSlips,
  };
}
