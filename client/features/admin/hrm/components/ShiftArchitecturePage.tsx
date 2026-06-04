'use client';

import { AnimatePresence } from 'framer-motion';
import { Plus, Search, User } from 'lucide-react';
import { useShiftManager } from '../hooks/useShiftManager';
import ShiftCard from './shifts/ShiftCard';
import ShiftInsights from './shifts/ShiftInsights';
import ShiftTemplateModal from './shifts/ShiftTemplateModal';
import AssignShiftModal from './shifts/AssignShiftModal';

export default function ShiftArchitecturePage() {
  const {
    submitting,
    shifts,
    employees,
    filteredShifts,
    searchQuery,
    setSearchQuery,
    showShiftForm,
    setShowShiftForm,
    showAssignForm,
    setShowAssignForm,
    editingId,
    shiftData,
    setShiftData,
    assignData,
    setAssignData,
    openNewShiftForm,
    openEditShiftForm,
    toggleWorkingDay,
    handleShiftSubmit,
    handleAssignSubmit,
    handleDeleteShift,
  } = useShiftManager();

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight italic uppercase leading-none">
            Shift <span className="text-indigo-600">Architecture</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-2">
            Define work schedules and employee assignments
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAssignForm(true)}
            className="flex items-center gap-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-slate-100 dark:border-slate-700 hover:bg-slate-50 transition-all shadow-sm"
          >
            <User className="w-4 h-4 text-indigo-600" />
            Assign Shift
          </button>
          <button
            onClick={openNewShiftForm}
            className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all hover:scale-105 active:scale-95 shadow-xl"
          >
            <Plus className="w-4 h-4" />
            New Template
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              placeholder="Search shift templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl text-sm font-bold shadow-sm focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredShifts.map((shift) => (
                <ShiftCard
                  key={shift.id}
                  shift={shift}
                  onEdit={openEditShiftForm}
                  onDelete={handleDeleteShift}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>

        <ShiftInsights shifts={shifts} />
      </div>

      <ShiftTemplateModal
        open={showShiftForm}
        onClose={() => setShowShiftForm(false)}
        editing={!!editingId}
        shiftData={shiftData}
        setShiftData={setShiftData}
        toggleWorkingDay={toggleWorkingDay}
        submitting={submitting}
        onSubmit={handleShiftSubmit}
      />

      <AssignShiftModal
        open={showAssignForm}
        onClose={() => setShowAssignForm(false)}
        employees={employees}
        shifts={shifts}
        assignData={assignData}
        setAssignData={setAssignData}
        submitting={submitting}
        onSubmit={handleAssignSubmit}
      />
    </div>
  );
}
