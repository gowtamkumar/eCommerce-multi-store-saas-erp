'use client';

import { createDesignation, deleteDesignation, getDepartments, getDesignations, updateDesignation } from '@/services/hrm';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Briefcase,
  CheckCircle2,
  Edit2,
  Loader2,
  Plus,
  Save,
  Search,
  Trash2,
  TrendingUp,
  Users,
  X
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface Designation {
  id: string;
  name: string;
  grade?: string;
  salaryBand?: string;
  description?: string;
  departmentId: string;
  department?: { name: string };
  employeeCount?: number;
}

interface Department {
  id: string;
  name: string;
}

export default function DesignationManagementPage() {
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', grade: '', salaryBand: '', description: '', departmentId: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [desData, deptData] = await Promise.all([
        getDesignations(),
        getDepartments()
      ]);
      setDesignations(desData || []);
      setDepartments(deptData || []);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSubmit = async () => {
    if (!formData.name?.trim() || !formData.departmentId) return;
    try {
      setSubmitting(true);
      const payload = {
        name: formData.name,
        grade: formData.grade,
        salaryBand: formData.salaryBand,
        description: formData.description,
        departmentId: formData.departmentId
      };
      if (editingId) {
        await updateDesignation(editingId, payload);
        setSuccessMsg('Designation updated successfully!');
      } else {
        await createDesignation(payload);
        setSuccessMsg('Designation created successfully!');
      }
      setShowForm(false);
      setFormData({ name: '', grade: '', salaryBand: '', description: '', departmentId: '' });
      setEditingId(null);
      setTimeout(() => setSuccessMsg(''), 3000);
      await fetchData();
    } catch (err) {
      console.error('Failed to save designation:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (des: Designation) => {
    setFormData({
      name: des.name || '',
      grade: des.grade || '',
      salaryBand: des.salaryBand || '',
      description: des.description || '',
      departmentId: des.departmentId
    });
    setEditingId(des.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this designation?')) return;
    try {
      await deleteDesignation(id);
      setSuccessMsg('Designation deleted successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
      await fetchData();
    } catch (err) {
      console.error('Failed to delete designation:', err);
    }
  };

  const filtered = designations.filter(d =>
    !searchQuery || 
    (d.name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (d.grade?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
          onClick={() => { setFormData({ name: '', grade: '', salaryBand: '', description: '', departmentId: '' }); setEditingId(null); setShowForm(true); }}
          className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center gap-2 shadow-lg"
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

      <div className="relative w-full sm:w-[400px]">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search designations..."
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
                {editingId ? 'Edit' : 'New'} <span className="text-indigo-600">Designation</span>
              </h2>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Designation Title *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Senior Executive, Manager, Lead"
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Department *</label>
                  <select
                    value={formData.departmentId}
                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10"
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Grade Level</label>
                  <input
                    type="text"
                    value={formData.grade || ''}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    placeholder="e.g. L1, L2, Executive, Senior"
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Salary Band</label>
                  <input
                    type="text"
                    value={formData.salaryBand || ''}
                    onChange={(e) => setFormData({ ...formData, salaryBand: e.target.value })}
                    placeholder="e.g. $30k-$50k"
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10"
                  />
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !formData.name?.trim() || !formData.departmentId}
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {editingId ? 'Update Designation' : 'Create Designation'}
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
        ) : filtered.map((des, i) => (
          <motion.div
            key={des.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ y: -4 }}
            className="group bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-xl transition-all"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="p-4 bg-amber-50 dark:bg-amber-900/30 rounded-2xl">
                <Briefcase className="w-8 h-8 text-amber-600" />
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleEdit(des)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition-all">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(des.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-xl transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic mb-1">{des.name}</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
              Department: <span className="text-indigo-600">{des.department?.name || 'N/A'}</span>
            </p>
            {des.grade && <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Grade: {des.grade}</p>}
            {des.salaryBand && <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-3"><TrendingUp className="w-3 h-3 inline mr-1" />{des.salaryBand}</p>}
            <div className="flex items-center gap-2 pt-4 border-t border-slate-50 dark:border-slate-700">
              <Users className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{des.employeeCount || 0} Employees</span>
            </div>
          </motion.div>
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