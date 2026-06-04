'use client';

import { useMemo } from 'react';
import { AlertCircle, Filter, Plus, Search } from 'lucide-react';
import DataTable from '@/components/shared/DataTable';
import { useLeaveVault } from '../hooks/useLeaveVault';
import LeaveStatsGrid from './leaves/LeaveStatsGrid';
import LeaveRequestModal from './leaves/LeaveRequestModal';
import LeaveDecisionModal from './leaves/LeaveDecisionModal';
import { buildLeaveColumns } from './leaves/leaveColumns';

export default function LeavesListPage() {
  const {
    loading,
    filteredRequests,
    employees,
    stats,
    computedDays,
    searchQuery,
    setSearchQuery,
    showRequestForm,
    setShowRequestForm,
    decisionTarget,
    openDecision,
    closeDecision,
    formData,
    setFormData,
    approveData,
    setApproveData,
    submitting,
    handleRequestSubmit,
    handleDecision,
  } = useLeaveVault();

  const columns = useMemo(
    () => buildLeaveColumns({
      onApprove: (id) => openDecision(id, 'approve'),
      onReject: (id) => openDecision(id, 'reject'),
    }),
    [openDecision]
  );

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8">
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

      <LeaveStatsGrid stats={stats} />

      <div className="space-y-6">
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

        <DataTable
          data={filteredRequests}
          columns={columns}
          getRowKey={(request) => request.id}
          loading={loading}
          loadingLabel="Analyzing Requests..."
          emptyLabel={
            <div className="py-12 text-center opacity-40 flex flex-col items-center">
              <AlertCircle className="w-12 h-12 text-slate-200 dark:text-slate-700 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-400 italic uppercase">No leave requests found</p>
            </div>
          }
          containerClassName="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden"
          minWidthClassName="min-w-[1000px]"
        />
      </div>

      <LeaveRequestModal
        open={showRequestForm}
        onClose={() => setShowRequestForm(false)}
        employees={employees}
        formData={formData}
        setFormData={setFormData}
        computedDays={computedDays}
        submitting={submitting}
        onSubmit={handleRequestSubmit}
      />

      <LeaveDecisionModal
        target={decisionTarget}
        onClose={closeDecision}
        employees={employees}
        approveData={approveData}
        setApproveData={setApproveData}
        submitting={submitting}
        onConfirm={handleDecision}
      />
    </div>
  );
}
