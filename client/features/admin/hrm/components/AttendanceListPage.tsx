'use client';

import React, { useMemo } from 'react';
import { useAttendanceLedger } from '../hooks/useAttendanceLedger';
import AttendanceStats from './attendance/AttendanceStats';
import AttendanceFilters from './attendance/AttendanceFilters';
import ManualAttendanceModal from './attendance/ManualAttendanceModal';
import { buildAttendanceColumns } from './attendance/attendanceColumns';
import AttendanceHeader from './attendance/AttendanceHeader';
import AttendanceLogTable from './attendance/AttendanceLogTable';

export default function AttendanceListPage() {
  const {
    loading,
    employees,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    employeeFilter,
    setEmployeeFilter,
    selectedDate,
    setSelectedDate,
    pageSize,
    setPageSize,
    currentPage,
    setCurrentPage,
    isProcessing,
    showManualModal,
    openManualModal,
    closeManualModal,
    selectedEmp,
    setSelectedEmp,
    manualSource,
    setManualSource,
    filteredSessions,
    totalPages,
    paginatedSessions,
    stats,
    handleQuickCheckOut,
    handleManualCheckIn,
    handleManualCheckOut,
    formatLateMinutes,
    getSessionDuration,
  } = useAttendanceLedger();

  const columns = useMemo(
    () => buildAttendanceColumns({
      isProcessing,
      onForceExit: (employeeId) => handleQuickCheckOut(employeeId),
      formatLateMinutes,
      getSessionDuration,
    }),
    [isProcessing, handleQuickCheckOut, formatLateMinutes, getSessionDuration],
  );

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8">
      <AttendanceHeader onMarkAttendance={openManualModal} />

      <AttendanceStats stats={stats} />

      <AttendanceFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        employeeFilter={employeeFilter}
        onEmployeeChange={setEmployeeFilter}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
        employees={employees}
        totalLogs={filteredSessions.length}
      />

      <AttendanceLogTable
        sessions={paginatedSessions}
        columns={columns}
        loading={loading}
        currentPage={currentPage}
        pageSize={pageSize}
        totalLogs={filteredSessions.length}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      <ManualAttendanceModal
        open={showManualModal}
        onClose={closeManualModal}
        employees={employees}
        selectedEmp={selectedEmp}
        onSelectEmp={setSelectedEmp}
        manualSource={manualSource}
        onSelectSource={setManualSource}
        isProcessing={isProcessing}
        onCheckIn={() => { void handleManualCheckIn(); }}
        onCheckOut={() => { void handleManualCheckOut(); }}
      />
    </div>
  );
}
