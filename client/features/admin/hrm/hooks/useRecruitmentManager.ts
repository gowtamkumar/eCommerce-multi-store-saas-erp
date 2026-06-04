'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  applyForJob,
  createJobPosting,
  getApplicants,
  getDepartments,
  getEmployees,
  getJobPostings,
  onboardApplicant,
  scheduleInterview,
  updateApplicantStatus,
} from '@/services/hrm';

export enum ApplicantStatus {
  APPLIED = 'APPLIED',
  SCREENING = 'SCREENING',
  INTERVIEW = 'INTERVIEW',
  TECHNICAL = 'TECHNICAL',
  HR_ROUND = 'HR_ROUND',
  OFFER = 'OFFER',
  JOINED = 'JOINED',
  REJECTED = 'REJECTED',
}

export type RecruitmentView = 'BOARD' | 'APPLICANTS' | 'PIPELINE';
export type JobStatusFilter = 'ALL' | 'DRAFT' | 'PUBLISHED' | 'CLOSED' | 'CANCELLED';
export type ApplicantStatusFilter = 'ALL' | ApplicantStatus;

export interface JobPosting {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  salaryRange: string;
  location: string;
  status: string;
  department?: { name: string };
  createdAt: string;
}

export interface Applicant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  resumeUrl: string;
  status: ApplicantStatus;
  jobPostingId: string;
  jobPosting?: { title: string };
  createdAt: string;
}

export interface RecruitmentEmployee {
  id: string;
  user?: { name: string };
}

export interface RecruitmentDepartment {
  id: string;
  name: string;
}

export interface JobFormData {
  title: string;
  departmentId: string;
  description: string;
  requirements: string;
  salaryRange: string;
  location: string;
}

export interface ApplyFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  resumeUrl: string;
  source: string;
}

export interface InterviewFormData {
  interviewerId: string;
  interviewDate: string;
  location: string;
  notes: string;
}

const defaultJobFormData: JobFormData = {
  title: '',
  departmentId: '',
  description: '',
  requirements: '',
  salaryRange: '',
  location: 'Remote',
};

const defaultApplyFormData: ApplyFormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  resumeUrl: 'https://example.com/resume.pdf',
  source: 'LinkedIn',
};

const getDefaultInterviewData = (): InterviewFormData => ({
  interviewerId: '',
  interviewDate: new Date().toISOString().slice(0, 16),
  location: 'Google Meet',
  notes: '',
});

export function useRecruitmentManager() {
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [employees, setEmployees] = useState<RecruitmentEmployee[]>([]);
  const [departments, setDepartments] = useState<RecruitmentDepartment[]>([]);

  const [view, setView] = useState<RecruitmentView>('BOARD');
  const [searchQuery, setSearchQuery] = useState('');
  const [showJobModal, setShowJobModal] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState<string | null>(null);
  const [showInterviewModal, setShowInterviewModal] = useState<string | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [jobStatusFilter, setJobStatusFilter] = useState<JobStatusFilter>('ALL');
  const [applicantStatusFilter, setApplicantStatusFilter] = useState<ApplicantStatusFilter>('ALL');
  const [jobFormData, setJobFormData] = useState<JobFormData>(defaultJobFormData);
  const [applyFormData, setApplyFormData] = useState<ApplyFormData>(defaultApplyFormData);
  const [interviewData, setInterviewData] = useState<InterviewFormData>(getDefaultInterviewData);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [jobsRes, appsRes, empRes, deptRes] = await Promise.all([
        getJobPostings(),
        getApplicants(),
        getEmployees(),
        getDepartments(),
      ]);
      setJobs((jobsRes as JobPosting[]) || []);
      setApplicants((appsRes as Applicant[]) || []);
      setEmployees((empRes as RecruitmentEmployee[]) || []);
      setDepartments((deptRes as RecruitmentDepartment[]) || []);
    } catch (err) {
      console.error('Failed to fetch recruitment data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void Promise.resolve().then(fetchData); }, [fetchData]);

  const handleCreateJob = useCallback(async () => {
    try {
      setSubmitting(true);
      await createJobPosting({
        ...jobFormData,
        requirements: jobFormData.requirements.split('\n').filter((r) => r.trim()),
      });
      setShowJobModal(false);
      setJobFormData(defaultJobFormData);
      void fetchData();
    } catch (err) {
      console.error('Failed to create job:', err);
    } finally {
      setSubmitting(false);
    }
  }, [jobFormData, fetchData]);

  const handleStatusChange = useCallback(async (id: string, status: ApplicantStatus) => {
    try {
      await updateApplicantStatus(id, status);
      if (status === ApplicantStatus.JOINED && confirm('Move to JOINED status and auto-onboard as Employee?')) {
        await onboardApplicant(id);
        alert('Applicant onboarded successfully!');
      }
      void fetchData();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  }, [fetchData]);

  const handleScheduleInterview = useCallback(async (applicantId: string) => {
    try {
      setSubmitting(true);
      await scheduleInterview({
        applicantId,
        interviewerId: interviewData.interviewerId,
        scheduledAt: interviewData.interviewDate,
        notes: interviewData.notes,
      });
      setShowInterviewModal(null);
      setInterviewData(getDefaultInterviewData());
      await handleStatusChange(applicantId, ApplicantStatus.INTERVIEW);
    } catch (err) {
      console.error('Failed to schedule interview:', err);
    } finally {
      setSubmitting(false);
    }
  }, [interviewData, handleStatusChange]);

  const handleApply = useCallback(async () => {
    if (!showApplyModal) return;
    try {
      setSubmitting(true);
      await applyForJob({
        ...applyFormData,
        jobPostingId: showApplyModal,
      });
      setShowApplyModal(null);
      setApplyFormData(defaultApplyFormData);
      void fetchData();
    } catch (err) {
      console.error('Failed to apply:', err);
    } finally {
      setSubmitting(false);
    }
  }, [showApplyModal, applyFormData, fetchData]);

  const openJobApplicants = useCallback((jobId: string) => {
    setSelectedJobId(jobId);
    setView('APPLICANTS');
  }, []);

  const filteredJobs = useMemo(
    () => jobs
      .filter((job) => job.title.toLowerCase().includes(searchQuery.toLowerCase()))
      .filter((job) => jobStatusFilter === 'ALL' || job.status === jobStatusFilter),
    [jobs, searchQuery, jobStatusFilter]
  );

  const filteredApplicants = useMemo(
    () => applicants.filter((applicant) => {
      const matchesSearch = `${applicant.firstName} ${applicant.lastName}`.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesJob = !selectedJobId || applicant.jobPostingId === selectedJobId;
      const matchesStage = applicantStatusFilter === 'ALL' || applicant.status === applicantStatusFilter;
      return matchesSearch && matchesJob && matchesStage;
    }),
    [applicants, searchQuery, selectedJobId, applicantStatusFilter]
  );

  const isJobFormValid = Boolean(jobFormData.title.trim() && jobFormData.departmentId);
  const isInterviewFormValid = Boolean(interviewData.interviewerId.trim() && interviewData.interviewDate.trim());

  return {
    loading,
    submitting,
    jobs,
    applicants,
    employees,
    departments,
    filteredJobs,
    filteredApplicants,
    view,
    setView,
    searchQuery,
    setSearchQuery,
    showJobModal,
    setShowJobModal,
    showApplyModal,
    setShowApplyModal,
    showInterviewModal,
    setShowInterviewModal,
    selectedJobId,
    setSelectedJobId,
    jobStatusFilter,
    setJobStatusFilter,
    applicantStatusFilter,
    setApplicantStatusFilter,
    jobFormData,
    setJobFormData,
    applyFormData,
    setApplyFormData,
    interviewData,
    setInterviewData,
    isJobFormValid,
    isInterviewFormValid,
    handleCreateJob,
    handleStatusChange,
    handleScheduleInterview,
    handleApply,
    openJobApplicants,
  };
}
