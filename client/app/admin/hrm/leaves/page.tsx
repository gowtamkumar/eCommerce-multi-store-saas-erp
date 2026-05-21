'use client';

import { approveLeave, getEmployees, getLeaveRequests, requestLeave, rejectLeave } from '@/services/hrm';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Filter,
  Loader2,
  MoreVertical,
  Plus,
  Search,
  User,
  X,
  FileText,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  ChevronRight
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

enum LeaveStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

enum LeaveType {
  SICK = 'SICK',
  CASUAL = 'CASUAL',
  ANNUAL = 'ANNUAL',
  UNPAID = 'UNPAID',
  MATERNITY = 'MATERNITY'
}

interface LeaveRequest {
  id: string;
  employeeId: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: LeaveStatus;
  managerNote?: string;
  employee?: {
    user?: { name: string; email: string };
    department?: { name: string };
    designation?: { name: string };
  };
  approvedBy?: {
    user?: { name: string };
  };
}

interface Employee {
  id: string;
  user?: { name: string; email: string };
}

export default function LeaveManagementPage() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState<string | null>(null);
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    employeeId: '',
    leaveType: LeaveType.ANNUAL,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    reason: '',
    totalDays: 1
  });

  const [approveData, setApproveData] = useState({
    managerNote: '',
    approvedById: '' // In real app, this would be current user's employeeId
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [leavesRes, empRes] = await Promise.all([
        getLeaveRequests(),
        getEmployees()
      ]);
      setRequests(leavesRes || []);
      setEmployees(empRes || []);
    } catch (err) {
      console.error('Failed to fetch leave data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleRequestSubmit = async () => {
    if (!formData.employeeId || !formData.reason) return;
    try {
      setSubmitting(true);
      await requestLeave(formData.employeeId, formData);
      setShowRequestForm(false);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Request failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApproveAction = async (requestId: string) => {
    if (!approveData.approvedById) {
      alert("Please select an approving manager for this simulation.");
      return;
    }
    try {
      setSubmitting(true);
      await approveLeave(requestId, approveData.approvedById, approveData.managerNote);
      setShowApproveModal(null);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Approval failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRejectAction = async (requestId: string) => {
    if (!approveData.approvedById) {
      alert("Please select an approving manager for this simulation.");
      return;
    }
    try {
      setSubmitting(true);
      await rejectLeave(requestId, approveData.approvedById, approveData.managerNote);
      setShowRejectModal(null);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Rejection failed');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredRequests = requests.filter(r =>
    !searchQuery || 
    r.employee?.user?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.reason.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight italic uppercase leading-none">
            Leave <span className="text-indigo-600">Vault</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-2">
            Managing employee absences and approval pipelines
          </p>
        </div>
        <button
          onClick={() => setShowRequestForm(true)}
          className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all hover:scale-105 active:scale-95 shadow-xl"
        >
          <Plus className="w-4 h-4" />
          Request Leave
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Pending Approval', count: requests.filter(r => r.status === LeaveStatus.PENDING).length, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
          { label: 'Approved', count: requests.filter(r => r.status === LeaveStatus.APPROVED).length, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
          { label: 'Active Today', count: requests.filter(r => r.status === LeaveStatus.APPROVED && new Date(r.startDate) <= new Date() && new Date(r.endDate) >= new Date()).length, icon: User, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Annual Quota', count: '100%', icon: FileText, color: 'text-slate-400', bg: 'bg-slate-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl ${stat.bg} dark:bg-slate-700 flex items-center justify-center ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">{stat.count}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Request List */}
        <div className="lg:col-span-12 space-y-6">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <input
                type="text"
                placeholder="Search requests by employee or reason..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-6 py-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold shadow-sm focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
              />
            </div>
            <button className="p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-slate-400 hover:text-indigo-600 transition-all shadow-sm">
              <Filter className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
                  <tr>
                    <th className="px-8 py-6">Employee</th>
                    <th className="px-8 py-6">Leave Details</th>
                    <th className="px-8 py-6">Duration</th>
                    <th className="px-8 py-6">Reason</th>
                    <th className="px-8 py-6">Status</th>
                    <th className="px-8 py-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-8 py-24 text-center">
                        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto" />
                        <p className="text-xs font-black uppercase tracking-widest text-slate-400 mt-4">Analyzing Requests...</p>
                      </td>
                    </tr>
                  ) : filteredRequests.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-8 py-24 text-center">
                        <AlertCircle className="w-12 h-12 text-slate-200 mx-auto" />
                        <p className="text-sm font-bold text-slate-400 mt-2 italic uppercase">No leave applications found</p>
                      </td>
                    </tr>
                  ) : (
                    <AnimatePresence>
                      {filteredRequests.map((request, i) => (
                        <motion.tr 
                          key={request.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="group hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-all"
                        >
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 font-black italic">
                                {request.employee?.user?.name?.charAt(0)}
                              </div>
                              <div>
                                <p className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-sm">
                                  {request.employee?.user?.name}
                                </p>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                  {request.employee?.department?.name}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-black uppercase tracking-widest rounded-lg">
                              {request.leaveType}
                            </span>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-3 h-3 text-indigo-500" />
                              <span className="text-sm font-black text-slate-900 dark:text-white italic">
                                {request.totalDays} Days
                              </span>
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
                              {new Date(request.startDate).toLocaleDateString([], { month: 'short', day: 'numeric' })} → {new Date(request.endDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                            </p>
                          </td>
                          <td className="px-8 py-6">
                            <p className="text-xs font-bold text-slate-600 dark:text-slate-400 italic max-w-[200px] truncate" title={request.reason}>
                              "{request.reason}"
                            </p>
                          </td>
                          <td className="px-8 py-6">
                            <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                              request.status === LeaveStatus.APPROVED ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                              request.status === LeaveStatus.REJECTED ? 'bg-rose-50 text-rose-700 border-rose-100' :
                              'bg-amber-50 text-amber-700 border-amber-100'
                            }`}>
                              {request.status}
                            </span>
                          </td>
                          <td className="px-8 py-6 text-right">
                            {request.status === LeaveStatus.PENDING ? (
                              <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                  onClick={() => setShowApproveModal(request.id)}
                                  className="p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all"
                                  title="Approve"
                                >
                                  <ThumbsUp className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => setShowRejectModal(request.id)}
                                  className="p-3 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all"
                                  title="Reject"
                                >
                                  <ThumbsDown className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex flex-col items-end">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Decision By</p>
                                <p className="text-[11px] font-bold text-slate-900 dark:text-white italic">{request.approvedBy?.user?.name || 'System'}</p>
                              </div>
                            )}
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Request Modal */}
      <AnimatePresence>
        {showRequestForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowRequestForm(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl p-8">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-8 italic">New <span className="text-indigo-600">Application</span></h2>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Personnel Selection</label>
                  <select 
                    value={formData.employeeId} 
                    onChange={e => setFormData({...formData, employeeId: e.target.value})}
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none"
                  >
                    <option value="">Select Employee...</option>
                    {employees.map(e => <option key={e.id} value={e.id}>{e.user?.name}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Type</label>
                    <select 
                      value={formData.leaveType} 
                      onChange={e => setFormData({...formData, leaveType: e.target.value as LeaveType})}
                      className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none"
                    >
                      {Object.values(LeaveType).map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Duration (Days)</label>
                    <input type="number" value={formData.totalDays} onChange={e => setFormData({...formData, totalDays: parseInt(e.target.value)})} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Start Date</label>
                    <input type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">End Date</label>
                    <input type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Reason / Context</label>
                  <textarea value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none h-24 resize-none" placeholder="Explain the necessity for this leave..." />
                </div>

                <button 
                  onClick={handleRequestSubmit}
                  disabled={submitting || !formData.employeeId || !formData.reason}
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
                  Submit Application
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Approval Modal */}
      <AnimatePresence>
        {showApproveModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowApproveModal(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl p-8">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-8 italic">Final <span className="text-emerald-600">Decision</span></h2>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Approving Manager</label>
                  <select 
                    value={approveData.approvedById} 
                    onChange={e => setApproveData({...approveData, approvedById: e.target.value})}
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none"
                  >
                    <option value="">Select Manager...</option>
                    {employees.map(e => <option key={e.id} value={e.id}>{e.user?.name}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Manager Context (Optional)</label>
                  <textarea value={approveData.managerNote} onChange={e => setApproveData({...approveData, managerNote: e.target.value})} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none h-24 resize-none" placeholder="Add any specific instructions or notes..." />
                </div>

                <button 
                  onClick={() => handleApproveAction(showApproveModal)}
                  disabled={submitting || !approveData.approvedById}
                  className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ThumbsUp className="w-4 h-4" />}
                  Confirm Approval
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Rejection Modal */}
      <AnimatePresence>
        {showRejectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowRejectModal(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl p-8">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-8 italic">Reject <span className="text-rose-600">Application</span></h2>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Rejecting Manager</label>
                  <select 
                    value={approveData.approvedById} 
                    onChange={e => setApproveData({...approveData, approvedById: e.target.value})}
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none"
                  >
                    <option value="">Select Manager...</option>
                    {employees.map(e => <option key={e.id} value={e.id}>{e.user?.name}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Rejection Reason</label>
                  <textarea value={approveData.managerNote} onChange={e => setApproveData({...approveData, managerNote: e.target.value})} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none h-24 resize-none" placeholder="Explain the reason for rejecting this leave application..." />
                </div>

                <button 
                  onClick={() => handleRejectAction(showRejectModal)}
                  disabled={submitting || !approveData.approvedById}
                  className="w-full py-4 bg-rose-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-700 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ThumbsDown className="w-4 h-4" />}
                  Confirm Rejection
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}