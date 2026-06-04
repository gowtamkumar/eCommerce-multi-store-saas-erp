'use client';

import { useCallback, useState } from 'react';
import type { AttendanceSourceType } from '../types/attendance';

interface UseManualAttendanceEntryArgs {
  onCheckIn: (employeeId: string, source: AttendanceSourceType) => Promise<void>;
  onCheckOut: (employeeId: string, source: AttendanceSourceType) => Promise<void>;
}

export function useManualAttendanceEntry({
  onCheckIn,
  onCheckOut,
}: UseManualAttendanceEntryArgs) {
  const [showManualModal, setShowManualModal] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState('');
  const [manualSource, setManualSource] = useState<AttendanceSourceType>('WEB');

  const openManualModal = useCallback(() => {
    setShowManualModal(true);
  }, []);

  const closeManualModal = useCallback(() => {
    setShowManualModal(false);
  }, []);

  const handleManualCheckIn = useCallback(async () => {
    if (!selectedEmp) return;
    await onCheckIn(selectedEmp, manualSource);
    closeManualModal();
  }, [closeManualModal, manualSource, onCheckIn, selectedEmp]);

  const handleManualCheckOut = useCallback(async () => {
    if (!selectedEmp) return;
    await onCheckOut(selectedEmp, manualSource);
    closeManualModal();
  }, [closeManualModal, manualSource, onCheckOut, selectedEmp]);

  return {
    showManualModal,
    openManualModal,
    closeManualModal,
    selectedEmp,
    setSelectedEmp,
    manualSource,
    setManualSource,
    handleManualCheckIn,
    handleManualCheckOut,
  };
}
