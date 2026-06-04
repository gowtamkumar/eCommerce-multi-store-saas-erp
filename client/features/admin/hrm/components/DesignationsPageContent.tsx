'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Briefcase, CheckCircle2, Loader2, Plus, Search } from 'lucide-react';
import { useDesignationsManager } from '../hooks/useDesignationsManager';
import DesignationCard from './designations/DesignationCard';
import DesignationFormModal from './designations/DesignationFormModal';

export default function DesignationsPageContent() {
  const {
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
    handleSubmit,
    handleEdit,
    handleDelete,
    handleOpenCreateModal,
    filtered,
  } = useDesignationsManager();

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight italic uppercase leading-none">
            Designation <span className="text-indigo-600">Management</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-2">
            Define job titles, grades & salary bands
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-2 shadow-lg"
        >
          <Plus className="w-4 h-4" /> Add Designation
        </button>
      </div>

      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-emerald-700 dark:text-emerald-400 text-sm font-bold"
          >
            <CheckCircle2 className="w-5 h-5" /> {successMsg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative w-full sm:w-[400px] group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
        <input
          type="text"
          placeholder="Search designations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-6 py-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-400 shadow-sm"
        />
      </div>

      <DesignationFormModal
        open={showForm}
        onClose={() => setShowForm(false)}
        isEditing={!!editingId}
        submitting={submitting}
        formData={formData}
        setFormData={setFormData}
        departments={departments}
        onSubmit={handleSubmit}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center py-24">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
          </div>
        ) : filtered.map((des, i) => (
          <DesignationCard
            key={des.id}
            designation={des}
            index={i}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
        {!loading && filtered.length === 0 && (
          <div className="col-span-full flex flex-col items-center py-24 text-slate-400">
            <Briefcase className="w-16 h-16 mb-4 text-slate-200 dark:text-slate-700" />
            <p className="text-sm font-bold italic">No designations found</p>
            <p className="text-[10px] font-black uppercase tracking-widest mt-1">Create your first designation to define job roles</p>
          </div>
        )}
      </div>
    </div>
  );
}
