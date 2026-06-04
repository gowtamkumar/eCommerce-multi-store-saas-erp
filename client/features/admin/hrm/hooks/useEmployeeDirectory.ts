'use client';

import { useCallback, useEffect, useState, useMemo } from 'react';
import { createEmployee, getDepartments, getDesignations, getEmployees, updateEmployee } from '@/services/hrm';
import { getBranches, getWarehouses } from '@/services/organization';
import { getUsers } from '@/services/user';
import { Employee } from '../type';

export function useEmployeeDirectory() {
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
    void fetchEmployees();
  }, [fetchEmployees]);

  const handleSubmit = useCallback(async (data: any) => {
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
  }, [selectedEmployee, fetchEmployees]);

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        emp.user?.name?.toLowerCase().includes(q) ||
        emp.user?.email?.toLowerCase().includes(q) ||
        emp.designation?.name?.toLowerCase().includes(q) ||
        emp.department?.name?.toLowerCase().includes(q)
      );
    });
  }, [employees, searchQuery]);

  const handleAdd = useCallback(() => {
    setSelectedEmployee(null);
    setIsFormOpen(true);
  }, []);

  const handleEdit = useCallback((emp: Employee) => {
    setSelectedEmployee(emp);
    setIsFormOpen(true);
  }, []);

  const handleView = useCallback((emp: Employee) => {
    setSelectedEmployee(emp);
    setIsDetailsOpen(true);
  }, []);

  const handleOpenEditFromDetails = useCallback((emp: Employee) => {
    setSelectedEmployee(emp);
    setIsDetailsOpen(false);
    setIsFormOpen(true);
  }, []);

  return {
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
    fetchEmployees
  };
}
