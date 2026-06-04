'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createTaxBracket, deleteTaxBracket, getTaxBrackets } from '@/services/hrm';
import toast from 'react-hot-toast';

export interface TaxBracket {
  id: string;
  fiscalYear: number;
  minAmount: number;
  maxAmount: number | null;
  rate: number;
  flatTax: number;
  sortOrder: number;
}

export interface TaxBracketFormData {
  fiscalYear: number;
  minAmount: number;
  maxAmount: string;
  rate: number;
  flatTax: number;
  sortOrder: number;
}

const currentYear = new Date().getFullYear();

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

export function useTaxBrackets() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fiscalYear, setFiscalYear] = useState(currentYear);
  const [brackets, setBrackets] = useState<TaxBracket[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<TaxBracketFormData>({
    fiscalYear: currentYear,
    minAmount: 0,
    maxAmount: '',
    rate: 0,
    flatTax: 0,
    sortOrder: 0,
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getTaxBrackets(fiscalYear);
      const next = (res || []) as TaxBracket[];
      setBrackets(next.sort((a, b) => a.sortOrder - b.sortOrder || Number(a.minAmount) - Number(b.minAmount)));
    } catch (err) {
      console.error('Failed to fetch tax brackets:', err);
    } finally {
      setLoading(false);
    }
  }, [fiscalYear]);

  useEffect(() => { void Promise.resolve().then(fetchData); }, [fetchData]);

  const effectiveRate = useMemo(() => {
    if (brackets.length === 0) return 0;
    return brackets.reduce((sum, b) => sum + Number(b.rate || 0), 0) / brackets.length;
  }, [brackets]);

  const openCreateForm = useCallback(() => {
    setFormData({
      fiscalYear,
      minAmount: 0,
      maxAmount: '',
      rate: 0,
      flatTax: 0,
      sortOrder: brackets.length + 1,
    });
    setShowForm(true);
  }, [fiscalYear, brackets.length]);

  const handleCreate = useCallback(async () => {
    if (formData.rate < 0 || formData.rate > 1) {
      toast.error('Rate must be between 0 and 1 (e.g., 0.10 for 10%)');
      return;
    }
    try {
      setSubmitting(true);
      await createTaxBracket({
        fiscalYear: formData.fiscalYear,
        minAmount: Number(formData.minAmount),
        maxAmount: formData.maxAmount === '' ? null : Number(formData.maxAmount),
        rate: Number(formData.rate),
        flatTax: Number(formData.flatTax || 0),
        sortOrder: Number(formData.sortOrder || 0),
      });
      setShowForm(false);
      setFiscalYear(formData.fiscalYear);
      await fetchData();
      toast.success('Tax bracket created successfully!');
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Failed to create tax bracket'));
    } finally {
      setSubmitting(false);
    }
  }, [formData, fetchData]);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('Delete this tax bracket?')) return;
    try {
      await deleteTaxBracket(id);
      await fetchData();
      toast.success('Tax bracket deleted successfully!');
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Failed to delete tax bracket'));
    }
  }, [fetchData]);

  return {
    loading,
    submitting,
    fiscalYear,
    setFiscalYear,
    brackets,
    effectiveRate,
    showForm,
    setShowForm,
    formData,
    setFormData,
    openCreateForm,
    handleCreate,
    handleDelete,
  };
}
