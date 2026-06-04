'use client';

import { Plus } from 'lucide-react';
import { useHolidayManager } from '@/features/admin/hrm/hooks/useHolidayManager';
import HolidaySummaryCards from '@/features/admin/hrm/components/holidays/HolidaySummaryCards';
import HolidayCalendarPanel from '@/features/admin/hrm/components/holidays/HolidayCalendarPanel';
import UpcomingHolidaysPanel from '@/features/admin/hrm/components/holidays/UpcomingHolidaysPanel';
import HolidayFormModal from '@/features/admin/hrm/components/holidays/HolidayFormModal';

export default function HolidaysPage() {
  const {
    loading,
    submitting,
    branches,
    selectedBranch,
    setSelectedBranch,
    calendarDate,
    setCalendarDate,
    showForm,
    editingHoliday,
    formData,
    setFormData,
    holidaysByDate,
    upcomingHolidays,
    stats,
    openCreateForm,
    openEditForm,
    closeForm,
    handleSubmit,
    handleDelete,
    goToPreviousMonth,
    goToToday,
    goToNextMonth,
  } = useHolidayManager();

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight italic uppercase leading-none">
            Holiday <span className="text-indigo-600">Calendar</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-2">
            Global and branch-specific holidays used by payroll attendance rules
          </p>
        </div>
        <button
          onClick={() => openCreateForm()}
          className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all hover:scale-105 active:scale-95 shadow-xl"
        >
          <Plus className="w-4 h-4" />
          Add Holiday
        </button>
      </div>

      <HolidaySummaryCards stats={stats} />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <HolidayCalendarPanel
          loading={loading}
          branches={branches}
          selectedBranch={selectedBranch}
          setSelectedBranch={setSelectedBranch}
          calendarDate={calendarDate}
          setCalendarDate={setCalendarDate}
          holidaysByDate={holidaysByDate}
          onCreate={openCreateForm}
          onEdit={openEditForm}
          onPreviousMonth={goToPreviousMonth}
          onToday={goToToday}
          onNextMonth={goToNextMonth}
        />

        <UpcomingHolidaysPanel holidays={upcomingHolidays} onEdit={openEditForm} />
      </div>

      <HolidayFormModal
        open={showForm}
        onClose={closeForm}
        editingHoliday={editingHoliday}
        formData={formData}
        setFormData={setFormData}
        branches={branches}
        submitting={submitting}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
      />
    </div>
  );
}
