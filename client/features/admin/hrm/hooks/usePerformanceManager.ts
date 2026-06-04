'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  createPerformanceReview,
  getEmployees,
  getPerformanceReviews,
} from '@/services/hrm';

export interface KpiMetric {
  metric_name: string;
  target: number;
  achieved: number;
  score: number;
}

export interface PerformanceReview {
  id: string;
  reviewPeriod: string;
  score: number;
  comments: string;
  kpi_metrics: KpiMetric[] | null;
  employee: {
    id: string;
    user?: { name?: string; username?: string };
    department?: { name?: string };
  };
  reviewer?: {
    user?: { name?: string; username?: string };
  };
  createdAt: string;
}

export interface PerformanceEmployee {
  id: string;
  user?: { name?: string; username?: string };
  department?: { name?: string };
  designation?: { name?: string };
}

export interface PerformanceReviewForm {
  employeeId: string;
  reviewerId: string;
  reviewPeriod: string;
  score: number;
  comments: string;
  kpiRows: KpiMetric[];
}

const emptyKpiRow = (): KpiMetric => ({ metric_name: '', target: 0, achieved: 0, score: 0 });

const defaultReviewForm = (): PerformanceReviewForm => ({
  employeeId: '',
  reviewerId: '',
  reviewPeriod: '',
  score: 3,
  comments: '',
  kpiRows: [emptyKpiRow()],
});

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

export function usePerformanceManager() {
  const [reviews, setReviews] = useState<PerformanceReview[]>([]);
  const [employees, setEmployees] = useState<PerformanceEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<PerformanceReview | null>(null);
  const [reviewForm, setReviewForm] = useState<PerformanceReviewForm>(defaultReviewForm);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [reviewRes, employeeRes] = await Promise.all([
        getPerformanceReviews(),
        getEmployees(),
      ]);
      setReviews(Array.isArray(reviewRes) ? reviewRes : []);
      setEmployees(Array.isArray(employeeRes) ? employeeRes : []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load performance data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(fetchData);
  }, [fetchData]);

  const filteredReviews = useMemo(
    () =>
      reviews.filter((review) => {
        const employeeName = review.employee?.user?.name || review.employee?.user?.username || '';
        const departmentName = review.employee?.department?.name || '';
        const query = search.toLowerCase();
        return (
          employeeName.toLowerCase().includes(query) ||
          review.reviewPeriod.toLowerCase().includes(query) ||
          departmentName.toLowerCase().includes(query)
        );
      }),
    [reviews, search]
  );

  const avgScore = useMemo(
    () => reviews.length > 0
      ? reviews.reduce((sum, review) => sum + Number(review.score), 0) / reviews.length
      : 0,
    [reviews]
  );

  const outstandingCount = useMemo(
    () => reviews.filter((review) => Number(review.score) >= 4.5).length,
    [reviews]
  );

  const updateReviewForm = useCallback(<K extends keyof PerformanceReviewForm>(
    field: K,
    value: PerformanceReviewForm[K],
  ) => {
    setReviewForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleAddKpi = useCallback(() => {
    setReviewForm((prev) => ({ ...prev, kpiRows: [...prev.kpiRows, emptyKpiRow()] }));
  }, []);

  const handleKpiChange = useCallback(<K extends keyof KpiMetric>(
    index: number,
    field: K,
    value: KpiMetric[K],
  ) => {
    setReviewForm((prev) => ({
      ...prev,
      kpiRows: prev.kpiRows.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [field]: value } : row
      ),
    }));
  }, []);

  const handleSubmit = useCallback(async (event: FormEvent) => {
    event.preventDefault();
    if (!reviewForm.employeeId || !reviewForm.reviewPeriod) {
      toast.error('Employee and review period are required');
      return;
    }

    try {
      await createPerformanceReview({
        employeeId: reviewForm.employeeId,
        reviewerId: reviewForm.reviewerId || undefined,
        reviewPeriod: reviewForm.reviewPeriod,
        score: reviewForm.score,
        comments: reviewForm.comments,
        kpi_metrics: reviewForm.kpiRows.filter((kpi) => kpi.metric_name.trim() !== ''),
      });
      toast.success('Performance review submitted successfully');
      setCreateOpen(false);
      setReviewForm(defaultReviewForm());
      void fetchData();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Failed to create review'));
    }
  }, [reviewForm, fetchData]);

  return {
    reviews,
    employees,
    loading,
    search,
    setSearch,
    createOpen,
    setCreateOpen,
    selectedReview,
    setSelectedReview,
    reviewForm,
    updateReviewForm,
    handleAddKpi,
    handleKpiChange,
    handleSubmit,
    filteredReviews,
    avgScore,
    outstandingCount,
  };
}
