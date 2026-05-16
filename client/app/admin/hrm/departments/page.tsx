'use client';

import { createDepartment, deleteDepartment, getDepartments, updateDepartment } from '@/services/hrm';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Building2,
  CheckCircle2,
  Edit2,
  Loader2,
  Plus,
  Save,
  Search,
  Trash2,
  Users,
  X
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface Department {
  id: string;
  name: string;
  code?: string;
  parentDepartmentId?: string;
  description?: string;
  employeeCount?: number;
}

export default function DepartmentManagementPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', code: '', description: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getDepartments();
      setDepartments(data || []);
    } catch (err) {
      console.error('Failed to fetch departments:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSubmit = async () => {
    if (!formData.name?.trim()) return;
    try {
      setSubmitting(true);
      if (editingId) {
        await updateDepartment(editingId, { name: formData.name, code: formData.code, description: formData.description });
        setSuccessMsg('Department updated successfully!');
      } else {
        await createDepartment({ name: formData.name, code: formData.code, description: formData.description });
        setSuccessMsg('Department created successfully!');
      }
      setShowForm(false);
      setFormData({ name: '', code: '', description: '' });
      setEditingId(null);
      setTimeout(() => setSuccessMsg(''), 3000);
      await fetchData();
    } catch (err) {
      console.error('Failed to save department:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (dept: Department) => {
    setFormData({ 
      name: dept.name || '', 
      code: dept.code || '', 
      description: dept.description || '' 
    });
    setEditingId(dept.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this department?')) return;
    try {
      await deleteDepartment(id);
      setSuccessMsg('Department deleted successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
      await fetchData();
    } catch (err) {
      console.error('Failed to delete department:', err);
    }
  };

  const filtered = departments.filter(d =>
    !searchQuery || 
    (d.name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (d.code?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight italic uppercase leading-none">
            Department <span className="text-indigo-600">Management</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-2">
            Organize your business units and teams
          </p>
        </div>
        <button
          onClick={() => { setFormData({ name: '', code: '', description: '' }); setEditingId(null); setShowForm(true); }}
          className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center gap-2 shadow-lg"
        >
          <Plus className="w-4 h-4" /> Add Department
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

      <div className="relative w-full sm:w-[400px]">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search departments..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-6 py-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
        />
      </div>

      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowForm(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl p-8"
            >
              <button onClick={() => setShowForm(false)} className="absolute top-6 right-6 p-2 text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all">
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic mb-8">
                {editingId ? 'Edit' : 'New'} <span className="text-indigo-600">Department</span>
              </h2>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Department Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Finance, Logistics, Marketing"
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Department Code</label>
                  <input
                    type="text"
                    value={formData.code || ''}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="e.g. FIN, LOG, MKT"
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of this department's role"
                    rows={3}
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 resize-none"
                  />
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !formData.name?.trim()}
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {editingId ? 'Update Department' : 'Create Department'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center py-24">
            <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
        ) : filtered.map((dept, i) => (
          <motion.div
            key={dept.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ y: -4 }}
            className="group bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-xl transition-all"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl">
                <Building2 className="w-8 h-8 text-indigo-600" />
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleEdit(dept)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition-all">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(dept.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-xl transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic mb-1">{dept.name}</h3>
            {dept.code && <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-3">Code: {dept.code}</p>}
            {dept.description && <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">{dept.description}</p>}
            <div className="flex items-center gap-2 pt-4 border-t border-slate-50 dark:border-slate-700">
              <Users className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{dept.employeeCount || 0} Employees</span>
            </div>
          </motion.div>
        ))}
        {!loading && filtered.length === 0 && (
          <div className="col-span-full flex flex-col items-center py-24 text-slate-400">
            <Building2 className="w-16 h-16 mb-4 text-slate-200 dark:text-slate-700" />
            <p className="text-sm font-bold italic">No departments found</p>
            <p className="text-[10px] font-black uppercase tracking-widest mt-1">Create your first department to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}