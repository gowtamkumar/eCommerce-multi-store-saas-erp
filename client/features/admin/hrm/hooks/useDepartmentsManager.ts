'use client';

import { useCallback, useEffect, useState, useMemo } from 'react';
import { createDepartment, deleteDepartment, getDepartments, updateDepartment } from '@/services/hrm';
import type { Department, DepartmentFormData } from '../types/department';

export function useDepartmentsManager() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<DepartmentFormData>({ name: '', code: '', description: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getDepartments();
      setDepartments(data || []);
    } catch (err) {
      console.error('Failed to fetch departments:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handleSubmit = useCallback(async () => {
    if (!formData.name?.trim()) return;
    try {
      setSubmitting(true);
      if (editingId) {
        await updateDepartment(editingId, { name: formData.name, code: formData.code, description: formData.description });
        setSuccessMsg('Department updated successfully!');
      } else {
        await createDepartment({ name: formData.name, code: formData.code, description: formData.description });
        setSuccessMsg('Department created successfully!');
      }
      setShowForm(false);
      setFormData({ name: '', code: '', description: '' });
      setEditingId(null);
      setTimeout(() => setSuccessMsg(''), 3000);
      await fetchData();
    } catch (err) {
      console.error('Failed to save department:', err);
    } finally {
      setSubmitting(false);
    }
  }, [formData, editingId, fetchData]);

  const handleEdit = useCallback((dept: Department) => {
    setFormData({ 
      name: dept.name || '', 
      code: dept.code || '', 
      description: dept.description || '' 
    });
    setEditingId(dept.id);
    setShowForm(true);
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('Are you sure you want to delete this department?')) return;
    try {
      await deleteDepartment(id);
      setSuccessMsg('Department deleted successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
      await fetchData();
    } catch (err) {
      console.error('Failed to delete department:', err);
    }
  }, [fetchData]);

  const handleOpenCreateModal = useCallback(() => {
    setFormData({ name: '', code: '', description: '' });
    setEditingId(null);
    setShowForm(true);
  }, []);

  const filtered = useMemo(() => {
    return departments.filter(d =>
      !searchQuery || 
      (d.name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (d.code?.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [departments, searchQuery]);

  return {
    departments,
    loading,
    submitting,
    searchQuery,
    setSearchQuery,
    showForm,
    setShowForm,
    formData,
    setFormData,
    editingId,
    successMsg,
    setSuccessMsg,
    handleSubmit,
    handleEdit,
    handleDelete,
    handleOpenCreateModal,
    filtered,
    fetchData
  };
}
export type { Department } from '../types/department';
