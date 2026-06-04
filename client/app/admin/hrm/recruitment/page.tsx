'use client';

import {
  createJobPosting,
  getApplicants,
  getDepartments,
  getEmployees,
  getJobPostings,
  onboardApplicant,
  scheduleInterview,
  updateApplicantStatus
} from '@/services/hrm';
import { AnimatePresence, motion } from 'framer-motion';
import DataTable, { DataTableColumn } from '@/components/shared/DataTable';
import {
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  Mail,
  MoreVertical,
  Plus,
  Search,
  Users,
  Video
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

enum ApplicantStatus {
  APPLIED = 'APPLIED',
  SCREENING = 'SCREENING',
  INTERVIEW = 'INTERVIEW',
  TECHNICAL = 'TECHNICAL',
  HR_ROUND = 'HR_ROUND',
  OFFER = 'OFFER',
  JOINED = 'JOINED',
  REJECTED = 'REJECTED'
}

interface JobPosting {
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

interface Applicant {
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

interface Employee {
  id: string;
  user?: {
    name: string;
  };
}

interface Department {
  id: string;
  name: string;
}

export default function RecruitmentManagementPage() {
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  const [view, setView] = useState<'BOARD' | 'APPLICANTS' | 'PIPELINE'>('BOARD');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showJobModal, setShowJobModal] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState<string | null>(null);
  const [showInterviewModal, setShowInterviewModal] = useState<string | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [jobStatusFilter, setJobStatusFilter] = useState<'ALL' | 'DRAFT' | 'PUBLISHED' | 'CLOSED' | 'CANCELLED'>('ALL');
  const [applicantStatusFilter, setApplicantStatusFilter] = useState<'ALL' | ApplicantStatus>('ALL');

  const [jobFormData, setJobFormData] = useState({
    title: '',
    departmentId: '',
    description: '',
    requirements: '',
    salaryRange: '',
    location: 'Remote'
  });

  const [applyFormData, setApplyFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    resumeUrl: 'https://example.com/resume.pdf',
    source: 'LinkedIn'
  });

  const [interviewData, setInterviewData] = useState({
    interviewerId: '',
    interviewDate: new Date().toISOString().slice(0, 16),
    location: 'Google Meet',
    notes: ''
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [jobsRes, appsRes, empRes, deptRes] = await Promise.all([
        getJobPostings(),
        getApplicants(),
        getEmployees(),
        getDepartments()
      ]);
      setJobs(jobsRes || []);
      setApplicants(appsRes || []);
      setEmployees(empRes || []);
      setDepartments(deptRes || []);
    } catch (err) {
      console.error('Failed to fetch recruitment data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void Promise.resolve().then(fetchData); }, [fetchData]);

  const handleCreateJob = async () => {
    try {
      setSubmitting(true);
      await createJobPosting({
        ...jobFormData,
        requirements: jobFormData.requirements.split('\n').filter(r => r.trim())
      });
      setShowJobModal(false);
      fetchData();
    } catch (err) {
      console.error('Failed to create job:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // const handleOnboard = async (id: string) => {
  //   if (!confirm('Convert this applicant to an Employee?')) return;
  //   try {
  //     setIsProcessing(true);
  //     await onboardApplicant(id);
  //     await fetchData();
  //     alert('Applicant onboarded successfully!');
  //   } catch (err) {
  //     console.error('Failed to onboard:', err);
  //   } finally {
  //     setIsProcessing(false);
  //   }
  // };

  const handleStatusChange = async (id: string, status: ApplicantStatus) => {
    try {
      await updateApplicantStatus(id, status);

      // Auto-onboard if status is JOINED
      if (status === ApplicantStatus.JOINED) {
        if (confirm('Move to JOINED status and auto-onboard as Employee?')) {
          await onboardApplicant(id);
          alert('Applicant onboarded successfully!');
        }
      }

      fetchData();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleScheduleInterview = async (applicantId: string) => {
    try {
      setSubmitting(true);
      await scheduleInterview({
        applicantId,
        interviewerId: interviewData.interviewerId,
        scheduledAt: interviewData.interviewDate,
        notes: interviewData.notes,
      });
      setShowInterviewModal(null);
      handleStatusChange(applicantId, ApplicantStatus.INTERVIEW);
    } catch (err) {
      console.error('Failed to schedule interview:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleApply = async () => {
    if (!showApplyModal) return;
    try {
      setSubmitting(true);
      await (await import('@/services/hrm')).applyForJob({
        ...applyFormData,
        jobPostingId: showApplyModal
      });
      setShowApplyModal(null);
      fetchData();
    } catch (err) {
      console.error('Failed to apply:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const columns = useMemo<DataTableColumn<Applicant>[]>(() => [
    {
      key: 'applicant',
      header: 'Applicant Name',
      cell: (app) => (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 font-black italic">
            {app.firstName.charAt(0)}
          </div>
          <div>
            <p className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-sm">
              {`${app.firstName} ${app.lastName}`}
            </p>
            <div className="flex gap-2 mt-1">
              <Mail className="w-3 h-3 text-slate-300" />
              <span className="text-[10px] font-bold text-slate-400 tracking-tight">{app.email}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'position',
      header: 'Target Position',
      cell: (app) => (
        <p className="text-sm font-black text-slate-900 dark:text-white italic uppercase">{app.jobPosting?.title}</p>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (app) => (
        <select
          value={app.status}
          onChange={(e) => handleStatusChange(app.id, e.target.value as ApplicantStatus)}
          className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border outline-none ${app.status === ApplicantStatus.JOINED ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
            app.status === ApplicantStatus.REJECTED ? 'bg-rose-50 text-rose-700 border-rose-100' :
              app.status === ApplicantStatus.INTERVIEW ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                'bg-amber-50 text-amber-700 border-amber-100'
            }`}
        >
          {Object.values(ApplicantStatus).map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      ),
    },
    {
      key: 'date',
      header: 'Application Date',
      cell: (app) => (
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          {new Date(app.createdAt).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      ),
    },
    {
      key: 'actions',
      header: 'Pipeline Control',
      headerClassName: 'text-right',
      className: 'text-right',
      cell: (app) => (
        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setShowInterviewModal(app.id)}
            className="p-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
            title="Schedule Interview"
          >
            <Calendar className="w-4 h-4" />
          </button>
          <a
            href={app.resumeUrl} target="_blank"
            rel="noopener noreferrer"
            className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-sm"
            title="View Resume"
          >
            <FileText className="w-4 h-4" />
          </a>
        </div>
      ),
    },
  ], [handleStatusChange, setShowInterviewModal]);

  const isJobFormValid = Boolean(jobFormData.title.trim() && jobFormData.departmentId);
  const isInterviewFormValid = Boolean(interviewData.interviewerId.trim() && interviewData.interviewDate.trim());

  const filteredJobs = jobs
    .filter(j => j.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter(j => jobStatusFilter === 'ALL' || j.status === jobStatusFilter);

  const filteredApps = applicants.filter(a => {
    const matchesSearch = `${a.firstName} ${a.lastName}`.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesJob = !selectedJobId || a.jobPostingId === selectedJobId;
    const matchesStage = applicantStatusFilter === 'ALL' || a.status === applicantStatusFilter;
    return matchesSearch && matchesJob && matchesStage;
  });

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight italic uppercase leading-none">
            Talent <span className="text-indigo-600">Acquisition</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-2">
            Orchestrating the recruitment lifecycle and hiring pipeline
          </p>
        </div>
        <div className="flex items-center gap-4 bg-white dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <button
            onClick={() => setView('BOARD')}
            className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${view === 'BOARD' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Job Board
          </button>
          <button
            onClick={() => setView('PIPELINE')}
            className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${view === 'PIPELINE' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Pipeline
          </button>
          <button
            onClick={() => setView('APPLICANTS')}
            className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${view === 'APPLICANTS' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
          >
            List View
          </button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              placeholder={`Search ${view === 'BOARD' ? 'open positions' : 'applicants'}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold shadow-sm focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          {view === 'BOARD' ? (
            <select
              value={jobStatusFilter}
              onChange={(e) => setJobStatusFilter(e.target.value as 'ALL' | 'DRAFT' | 'PUBLISHED' | 'CLOSED' | 'CANCELLED')}
              className="w-full sm:w-auto px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none"
            >
              <option value="ALL">All statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="CLOSED">Closed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          ) : (
            <>
              <select
                value={applicantStatusFilter}
                onChange={(e) => setApplicantStatusFilter(e.target.value as 'ALL' | ApplicantStatus)}
                className="w-full sm:w-auto px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none"
              >
                <option value="ALL">All stages</option>
                {Object.values(ApplicantStatus).map((stage) => (
                  <option key={stage} value={stage}>{stage}</option>
                ))}
              </select>
              <select
                value={selectedJobId || ''}
                onChange={(e) => setSelectedJobId(e.target.value || null)}
                className="w-full sm:w-auto px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none"
              >
                <option value="">All jobs</option>
                {jobs.map((job) => (
                  <option key={job.id} value={job.id}>{job.title}</option>
                ))}
              </select>
            </>
          )}

          {view === 'BOARD' && (
            <button
              onClick={() => setShowJobModal(true)}
              className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20"
            >
              <Plus className="w-4 h-4" />
              Post Opening
            </button>
          )}
        </div>
      </div>

      {/* Content Grid */}
      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="py-24 text-center">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
            <p className="text-xs font-black uppercase tracking-widest text-slate-400 italic">Synchronizing Talent Cloud...</p>
          </div>
        ) : view === 'PIPELINE' ? (
          <div className="flex flex-wrap gap-4 overflow-x-auto pb-8 min-h-150 scrollbar-hide">
            {Object.values(ApplicantStatus).map((status) => (
              <div key={status} className="shrink-0 w-full sm:w-80 group/col">
                <div className="flex items-center justify-between mb-4 px-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${status === ApplicantStatus.JOINED ? 'bg-emerald-500' :
                      status === ApplicantStatus.REJECTED ? 'bg-rose-500' :
                        status === ApplicantStatus.OFFER ? 'bg-indigo-500' :
                          'bg-amber-500'
                      }`} />
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 italic">
                      {status}
                    </h3>
                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-400 text-[10px] px-2 py-0.5 rounded-full font-bold">
                      {filteredApps.filter(a => a.status === status).length}
                    </span>
                  </div>
                  <button className="opacity-0 group-hover/col:opacity-100 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all text-slate-400">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4 min-h-125 p-2 bg-slate-50/50 dark:bg-slate-900/20 rounded-4xl border-2 border-dashed border-slate-100 dark:border-slate-800/50">
                  {filteredApps.filter(a => a.status === status).map((app) => (
                    <motion.div
                      key={app.id}
                      layoutId={app.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-xl hover:scale-[1.02] transition-all cursor-grab active:cursor-grabbing"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-xs font-black text-slate-400 italic border border-slate-100 dark:border-slate-700">
                          {app.firstName.charAt(0)}{app.lastName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">
                            {`${app.firstName} ${app.lastName}`}
                          </p>
                          <p className="text-[10px] font-bold text-indigo-500 mt-1 italic uppercase tracking-tighter truncate w-40">
                            {app.jobPosting?.title}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-700/50">
                        <div className="flex -space-x-2">
                          <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 border-2 border-white dark:border-slate-800" />
                          <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30 border-2 border-white dark:border-slate-800 flex items-center justify-center text-[8px] font-bold text-indigo-600">
                            +
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <select
                            value={app.status}
                            onChange={(e) => handleStatusChange(app.id, e.target.value as ApplicantStatus)}
                            className="text-[10px] font-black uppercase tracking-widest bg-transparent border-none outline-none cursor-pointer text-slate-400 hover:text-indigo-600 transition-colors"
                          >
                            {Object.values(ApplicantStatus).map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                          <button
                            onClick={() => setShowInterviewModal(app.id)}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                          >
                            <Calendar className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {filteredApps.filter(a => a.status === status).length === 0 && (
                    <div className="py-12 text-center opacity-20 flex flex-col items-center">
                      <Users className="w-8 h-8 mb-2" />
                      <p className="text-[9px] font-black uppercase tracking-widest italic">Empty Stage</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : view === 'BOARD' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredJobs.map((job) => (
                <motion.div
                  key={job.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 dark:bg-indigo-900/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-500/10 transition-colors" />

                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                      <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl text-indigo-600">
                        <Briefcase className="w-6 h-6" />
                      </div>
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-lg">
                        {job.status}
                      </span>
                    </div>

                    <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic mb-2 leading-tight">{job.title}</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">{job.department?.name} • {job.location}</p>

                    <div className="space-y-4 mb-8">
                      <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                        <Users className="w-4 h-4" />
                        <span className="text-xs font-bold">{applicants.filter(a => a.jobPostingId === job.id).length} Applicants</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                        <Clock className="w-4 h-4" />
                        <span className="text-xs font-bold">Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedJobId(job.id);
                          setView('APPLICANTS');
                        }}
                        className="flex-1 py-3 bg-slate-50 dark:bg-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all"
                      >
                        View List
                      </button>
                      <button
                        onClick={() => setShowApplyModal(job.id)}
                        className="px-4 py-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all"
                        title="Add Applicant"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <DataTable
            data={filteredApps}
            columns={columns}
            getRowKey={(app) => app.id}
            loading={loading}
            loadingLabel="Synchronizing Talent Cloud..."
            emptyLabel={
              <div className="py-12 text-center opacity-20 flex flex-col items-center">
                <Users className="w-8 h-8 mb-2" />
                <p className="text-[9px] font-black uppercase tracking-widest italic">No applicants found</p>
              </div>
            }
            containerClassName="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden"
            minWidthClassName="min-w-[1000px]"
          />
        )}
      </div>

      {/* Post Job Modal */}
      <AnimatePresence>
        {showJobModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowJobModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-2xl bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl p-10 overflow-y-auto max-h-[90vh]">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic mb-8">Post <span className="text-indigo-600">Requirement</span></h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Position Title</label>
                  <input type="text" value={jobFormData.title} onChange={e => setJobFormData({ ...jobFormData, title: e.target.value })} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none" placeholder="e.g. Senior Software Engineer" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Department</label>
                  <select value={jobFormData.departmentId} onChange={e => setJobFormData({ ...jobFormData, departmentId: e.target.value })} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none">
                    <option value="">Select Dept...</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Salary Range</label>
                  <input type="text" value={jobFormData.salaryRange} onChange={e => setJobFormData({ ...jobFormData, salaryRange: e.target.value })} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none" placeholder="e.g. $80k - $120k" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Work Setup</label>
                  <select value={jobFormData.location} onChange={e => setJobFormData({ ...jobFormData, location: e.target.value })} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none">
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="On-site">On-site</option>
                  </select>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Job Description</label>
                  <textarea value={jobFormData.description} onChange={e => setJobFormData({ ...jobFormData, description: e.target.value })} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none h-32 resize-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Key Requirements (One per line)</label>
                  <textarea value={jobFormData.requirements} onChange={e => setJobFormData({ ...jobFormData, requirements: e.target.value })} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none h-32 resize-none" />
                </div>

                <button
                  onClick={handleCreateJob}
                  disabled={submitting || !isJobFormValid}
                  className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  Publish Opening
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Schedule Interview Modal */}
      <AnimatePresence>
        {showInterviewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowInterviewModal(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl p-10">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic mb-8">Schedule <span className="text-indigo-600">Interview</span></h2>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Interviewer</label>
                  <select value={interviewData.interviewerId} onChange={e => setInterviewData({ ...interviewData, interviewerId: e.target.value })} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none">
                    <option value="">Select Personnel...</option>
                    {employees.map(e => <option key={e.id} value={e.id}>{e.user?.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Interview Date & Time</label>
                  <input type="datetime-local" value={interviewData.interviewDate} onChange={e => setInterviewData({ ...interviewData, interviewDate: e.target.value })} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Meeting Link / Location</label>
                  <input type="text" value={interviewData.location} onChange={e => setInterviewData({ ...interviewData, location: e.target.value })} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none" />
                </div>

                <button
                  onClick={() => handleScheduleInterview(showInterviewModal)}
                  disabled={submitting || !isInterviewFormValid}
                  className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Video className="w-4 h-4" />}
                  Confirm Interview
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Manual Application Modal */}
      <AnimatePresence>
        {showApplyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowApplyModal(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl p-10">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic mb-8">Add <span className="text-indigo-600">Applicant</span></h2>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">First Name</label>
                    <input type="text" value={applyFormData.firstName} onChange={e => setApplyFormData({ ...applyFormData, firstName: e.target.value })} className="w-full px-6 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none" placeholder="John" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Last Name</label>
                    <input type="text" value={applyFormData.lastName} onChange={e => setApplyFormData({ ...applyFormData, lastName: e.target.value })} className="w-full px-6 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none" placeholder="Doe" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                  <input type="email" value={applyFormData.email} onChange={e => setApplyFormData({ ...applyFormData, email: e.target.value })} className="w-full px-6 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none" placeholder="john@example.com" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                  <input type="text" value={applyFormData.phone} onChange={e => setApplyFormData({ ...applyFormData, phone: e.target.value })} className="w-full px-6 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none" placeholder="+1..." />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Source</label>
                  <select value={applyFormData.source} onChange={e => setApplyFormData({ ...applyFormData, source: e.target.value })} className="w-full px-6 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none">
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Referral">Referral</option>
                    <option value="Website">Website</option>
                    <option value="Job Board">Job Board</option>
                  </select>
                </div>

                <button
                  onClick={handleApply}
                  disabled={submitting}
                  className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl flex items-center justify-center gap-2 mt-4"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Register Applicant
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
