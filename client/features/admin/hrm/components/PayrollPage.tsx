'use client';

import { Plus } from 'lucide-react';
import { usePayrollManager } from '../hooks/usePayrollManager';
import PayrollHistory from './payroll/PayrollHistory';
import PayrollInsights from './payroll/PayrollInsights';
import PayrollSlipsDrawer from './payroll/PayrollSlipsDrawer';
import ProcessPayrollModal from './payroll/ProcessPayrollModal';
import ApprovePayrollModal from './payroll/ApprovePayrollModal';

export default function PayrollPage() {
  const {
    loading,
    batches,
    employees,
    totalCompensated,
    selectedBatch,
    setSelectedBatch,
    slips,
    loadingSlips,
    showProcessModal,
    setShowProcessModal,
    showApproveModal,
    setShowApproveModal,
    approvedById,
    setApprovedById,
    processing,
    processData,
    setProcessData,
    handleProcessPayroll,
    handleApprove,
    handlePayBatch,
    handleViewSlips,
  } = usePayrollManager();

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight italic uppercase leading-none">
            Financial <span className="text-indigo-600">Disbursement</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-2">
            Managing payroll cycles, tax compliance, and net compensation
          </p>
        </div>
        <button
          onClick={() => setShowProcessModal(true)}
          className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all hover:scale-105 active:scale-95 shadow-xl"
        >
          <Plus className="w-4 h-4" />
          Process New Cycle
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <PayrollHistory
            loading={loading}
            batches={batches}
            onViewSlips={handleViewSlips}
            onApprove={setShowApproveModal}
          />
        </div>

        <PayrollInsights batches={batches} totalCompensated={totalCompensated} />
      </div>

      <PayrollSlipsDrawer
        selectedBatch={selectedBatch}
        slips={slips}
        loadingSlips={loadingSlips}
        processing={processing}
        onClose={() => setSelectedBatch(null)}
        onApprove={setShowApproveModal}
        onPayBatch={handlePayBatch}
      />

      <ProcessPayrollModal
        open={showProcessModal}
        onClose={() => setShowProcessModal(false)}
        processData={processData}
        setProcessData={setProcessData}
        processing={processing}
        onSubmit={handleProcessPayroll}
      />

      <ApprovePayrollModal
        batch={showApproveModal}
        onClose={() => setShowApproveModal(null)}
        employees={employees}
        approvedById={approvedById}
        setApprovedById={setApprovedById}
        processing={processing}
        onSubmit={handleApprove}
      />
    </div>
  );
}
