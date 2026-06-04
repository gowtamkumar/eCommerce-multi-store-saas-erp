'use client';

import React from 'react';
import { useEmployeeDirectory } from '@/features/admin/hrm/hooks/useEmployeeDirectory';
import EmployeeList from '@/features/admin/hrm/components/EmployeeList';
import EmployeeForm from '@/features/admin/hrm/components/EmployeeForm';
import EmployeeDetails from '@/features/admin/hrm/components/EmployeeDetails';

export default function EmployeesPage() {
  const {
    loading,
    submitting,
    isFormOpen,
    setIsFormOpen,
    isDetailsOpen,
    setIsDetailsOpen,
    selectedEmployee,
    setSelectedEmployee,
    employees,
    departments,
    designations,
    branches,
    warehouses,
    users,
    searchQuery,
    setSearchQuery,
    handleSubmit,
    filteredEmployees,
    handleAdd,
    handleEdit,
    handleView,
    handleOpenEditFromDetails,
  } = useEmployeeDirectory();

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      <EmployeeList
        employees={filteredEmployees}
        loading={loading}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onView={handleView}
        onDelete={() => { }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <EmployeeForm
        key={selectedEmployee?.id || 'new'}
        employee={selectedEmployee}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmit}
        loading={submitting}
        departments={departments}
        designations={designations}
        branches={branches}
        warehouses={warehouses}
        users={users}
        employees={employees}
      />

      <EmployeeDetails
        employee={selectedEmployee}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        onEdit={handleOpenEditFromDetails}
      />
    </div>
  );
}
