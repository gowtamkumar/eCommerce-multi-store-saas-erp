'use client';

import EmployeeDetails from '@/features/admin/hrm/components/EmployeeDetails';
import EmployeeForm from '@/features/admin/hrm/components/EmployeeForm';
import EmployeeList from '@/features/admin/hrm/components/EmployeeList';
import { Employee } from '@/features/admin/hrm/type';
import { createEmployee, getDepartments, getDesignations, getEmployees, updateEmployee } from '@/services/hrm';
import { getBranches, getWarehouses } from '@/services/organization';
import { getUsers } from '@/services/user';
import { useCallback, useEffect, useState } from 'react';

export default function EmployeesPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [designations, setDesignations] = useState<{ id: string; name: string }[]>([]);
  const [branches, setBranches] = useState<{ id: string; name: string }[]>([]);
  const [warehouses, setWarehouses] = useState<{ id: string; name: string }[]>([]);
  const [users, setUsers] = useState<{ id: string; name: string; email: string }[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      const [empData, deptData, desigData, branchData, warehouseData, userData] = await Promise.all([
        getEmployees(),
        getDepartments(),
        getDesignations(),
        getBranches(),
        getWarehouses(),
        getUsers(),
      ]);
      setEmployees(empData || []);
      setDepartments(deptData || []);
      setDesignations(desigData || []);
      setBranches(branchData.data || []);
      setWarehouses(warehouseData.data || []);
      setUsers(userData || []);
    } catch (err) {
      console.error('Failed to fetch HRM data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleSubmit = async (data: any) => {
    try {
      setSubmitting(true);
      if (selectedEmployee?.id) {
        await updateEmployee(selectedEmployee.id, data);
      } else {
        await createEmployee(data);
      }
      setIsFormOpen(false);
      await fetchEmployees();
    } catch (err) {
      console.error('Failed to save employee:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredEmployees = employees.filter((emp) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      emp.user?.name?.toLowerCase().includes(q) ||
      emp.user?.email?.toLowerCase().includes(q) ||
      emp.designation?.name?.toLowerCase().includes(q) ||
      emp.department?.name?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      <EmployeeList
        employees={filteredEmployees}
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
        onEdit={(emp) => {
          setSelectedEmployee(emp);
          setIsDetailsOpen(false);
          setIsFormOpen(true);
        }}
      />
    </div>
  );
}
