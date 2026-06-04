'use client';

import { motion } from 'framer-motion';
import { Building2, Edit2, Trash2, Users } from 'lucide-react';
import { Department } from '../../types/department';

interface DepartmentCardProps {
  department: Department;
  index: number;
  onEdit: (department: Department) => void;
  onDelete: (id: string) => void;
}

export default function DepartmentCard({ department, index, onEdit, onDelete }: DepartmentCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className="group bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-xl transition-all"
    >
      <div className="flex items-start justify-between mb-6">
        <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl">
          <Building2 className="w-8 h-8 text-indigo-600" />
        </div>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(department)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition-all">
            <Edit2 className="w-4 h-4" />
          </button>
          <button onClick={() => onDelete(department.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-xl transition-all">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic mb-1">{department.name}</h3>
      {department.code && <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-3">Code: {department.code}</p>}
      {department.description && <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">{department.description}</p>}
      <div className="flex items-center gap-2 pt-4 border-t border-slate-50 dark:border-slate-700">
        <Users className="w-4 h-4 text-slate-400" />
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{department.employeeCount || 0} Employees</span>
      </div>
    </motion.div>
  );
}
