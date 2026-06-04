'use client';

import { useCallback, useEffect, useState, useMemo } from 'react';
import { createDesignation, deleteDesignation, getDepartments, getDesignations, updateDesignation } from '@/services/hrm';
import type { Designation, DesignationDepartment, DesignationFormData } from '../types/designation';

export function useDesignationsManager() {
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [departments, setDepartments] = useState<DesignationDepartment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<DesignationFormData>({ name: '', grade: '', salaryBand: '', description: '', departmentId: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [desData, deptData] = await Promise.all([
        getDesignations(),
        getDepartments()
      ]);
      setDesignations(desData || []);
      setDepartments(deptData || []);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handleSubmit = useCallback(async () => {
    if (!formData.name?.trim() || !formData.departmentId) return;
    try {
      setSubmitting(true);
      const payload = {
        name: formData.name,
        grade: formData.grade,
        salaryBand: formData.salaryBand,
        description: formData.description,
        departmentId: formData.departmentId
      };
      if (editingId) {
        await updateDesignation(editingId, payload);
        setSuccessMsg('Designation updated successfully!');
      } else {
        await createDesignation(payload);
        setSuccessMsg('Designation created successfully!');
      }
      setShowForm(false);
      setFormData({ name: '', grade: '', salaryBand: '', description: '', departmentId: '' });
      setEditingId(null);
      setTimeout(() => setSuccessMsg(''), 3000);
      await fetchData();
    } catch (err) {
      console.error('Failed to save designation:', err);
    } finally {
      setSubmitting(false);
    }
  }, [formData, editingId, fetchData]);

  const handleEdit = useCallback((des: Designation) => {
    setFormData({
      name: des.name || '',
      grade: des.grade || '',
      salaryBand: des.salaryBand || '',
      description: des.description || '',
      departmentId: des.departmentId
    });
    setEditingId(des.id);
    setShowForm(true);
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('Are you sure you want to delete this designation?')) return;
    try {
      await deleteDesignation(id);
      setSuccessMsg('Designation deleted successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
      await fetchData();
    } catch (err) {
      console.error('Failed to delete designation:', err);
    }
  }, [fetchData]);

  const handleOpenCreateModal = useCallback(() => {
    setFormData({ name: '', grade: '', salaryBand: '', description: '', departmentId: '' });
    setEditingId(null);
    setShowForm(true);
  }, []);

  const filtered = useMemo(() => {
    return designations.filter(d =>
      !searchQuery || 
      (d.name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (d.grade?.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [designations, searchQuery]);

  return {
    designations,
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
export type { Designation } from '../types/designation';
