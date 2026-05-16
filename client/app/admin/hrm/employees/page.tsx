'use client';

import React, { useState } from 'react';
import EmployeeList from '@/features/admin/hrm/components/EmployeeList';
import EmployeeForm from '@/features/admin/hrm/components/EmployeeForm';
import EmployeeDetails from '@/features/admin/hrm/components/EmployeeDetails';
import { Employee } from '@/features/admin/hrm/type';

export default function EmployeesPage() {
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      <EmployeeList 
        employees={[]} // Fetch from API
        loading={loading}
        onAdd={() => {
          setSelectedEmployee(null);
          setIsFormOpen(true);
        }}
        onEdit={(emp) => {
          setSelectedEmployee(emp);
          setIsFormOpen(true);
        }}
        onView={(emp) => {
          setSelectedEmployee(emp);
          setIsDetailsOpen(true);
        }}
        onDelete={() => {}}
        searchQuery=""
        onSearchChange={() => {}}
      />

      <EmployeeForm 
        employee={selectedEmployee}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={(data) => {
          console.log('Submitting employee:', data);
          setIsFormOpen(false);
        }}
        loading={false}
      />

      <EmployeeDetails 
        employee={selectedEmployee}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
      />
    </div>
  );
}
