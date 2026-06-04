'use client';

import { motion } from 'framer-motion';
import { Briefcase, Edit2, Trash2, TrendingUp, Users } from 'lucide-react';
import { Designation } from '../../types/designation';

interface DesignationCardProps {
  designation: Designation;
  index: number;
  onEdit: (designation: Designation) => void;
  onDelete: (id: string) => void;
}

export default function DesignationCard({ designation, index, onEdit, onDelete }: DesignationCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className="group bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-xl transition-all"
    >
      <div className="flex items-start justify-between mb-6">
        <div className="p-4 bg-amber-50 dark:bg-amber-900/30 rounded-2xl">
          <Briefcase className="w-8 h-8 text-amber-600" />
        </div>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(designation)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition-all">
            <Edit2 className="w-4 h-4" />
          </button>
          <button onClick={() => onDelete(designation.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-xl transition-all">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic mb-1">{designation.name}</h3>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
        Department: <span className="text-indigo-600">{designation.department?.name || 'N/A'}</span>
      </p>
      {designation.grade && <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Grade: {designation.grade}</p>}
      {designation.salaryBand && <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-3"><TrendingUp className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />{designation.salaryBand}</p>}
      <div className="flex items-center gap-2 pt-4 border-t border-slate-50 dark:border-slate-700">
        <Users className="w-4 h-4 text-slate-400" />
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{designation.employeeCount || 0} Employees</span>
      </div>
    </motion.div>
  );
}
