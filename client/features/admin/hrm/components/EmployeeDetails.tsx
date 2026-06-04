'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, Phone, ShieldCheck, X } from 'lucide-react';
import { Employee } from '../types/employee';
import EmployeeDocumentVault from './employees/EmployeeDocumentVault';

interface EmployeeDetailsProps {
  employee: Employee | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (employee: Employee) => void;
}

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-emerald-100 text-emerald-700',
  PROBATION: 'bg-blue-100 text-blue-700',
  ON_LEAVE: 'bg-amber-100 text-amber-700',
  TERMINATED: 'bg-rose-100 text-rose-700',
  SUSPENDED: 'bg-slate-100 text-slate-700',
};

export default function EmployeeDetails({ employee, isOpen, onClose, onEdit }: EmployeeDetailsProps) {
  if (!employee) return null;
  const ec = employee.personalDetails?.emergencyContact;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />

          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
            className="relative w-full max-w-2xl bg-white dark:bg-slate-900 shadow-2xl h-full flex flex-col">

            {/* Hero Header */}
            <div className="relative h-52 bg-slate-900 overflow-hidden shrink-0">
              <div className="absolute inset-0 bg-linear-to-br from-indigo-600/30 to-purple-700/20" />
              <button onClick={onClose}
                className="absolute top-5 right-5 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors z-10">
                <X className="w-4 h-4" />
              </button>

              <div className="absolute bottom-6 left-8 right-8 flex items-end gap-5">
                <div className="w-20 h-20 rounded-2xl bg-linear-to-tr from-indigo-500 to-indigo-600 border-2 border-white dark:border-slate-800 shadow-xl flex items-center justify-center text-white text-3xl font-black italic">
                  {employee.user?.name ? employee.user.name.charAt(0).toUpperCase() : 'E'}
                </div>
                <div className="mb-1 flex-1">
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-xl font-black text-white italic tracking-tight uppercase">
                      {employee.user?.name || 'Unknown Employee'}
                    </h2>
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${STATUS_COLORS[employee.status] || 'bg-slate-100 text-slate-700'}`}>
                      {employee.status}
                    </span>
                  </div>
                  <p className="text-xs text-indigo-200/90 font-black tracking-widest uppercase mt-1">
                    {employee.designation?.name || 'No Designation'} - {employee.department?.name || 'Unassigned Dept'}
                  </p>
                </div>
                {onEdit && (
                  <button onClick={() => onEdit(employee)}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all backdrop-blur-md">
                    Edit Profile
                  </button>
                )}
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6">

              {/* Personal Details */}
              <section className="bg-slate-50 dark:bg-slate-900/60 rounded-3xl p-6 border border-slate-100 dark:border-slate-800/40">
                <div className="flex items-center gap-2 mb-4">
                  <ShieldCheck className="w-4 h-4 text-indigo-500" />
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-950 dark:text-white">
                    Personal & Compliance Identity
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                  <div>
                    <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">Date of Birth</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {employee.personalDetails?.dob ? new Date(employee.personalDetails.dob).toLocaleDateString() : '-'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">Gender</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase">
                      {employee.personalDetails?.gender || '-'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">National ID (NID)</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {employee.personalDetails?.nationalId || '-'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">Passport Number</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {employee.personalDetails?.passportNo || '-'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">Blood Group</span>
                    <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                      {employee.personalDetails?.bloodGroup || '-'}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">Home Address</span>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {employee.personalDetails?.address || '-'}
                    </span>
                  </div>
                </div>
              </section>

              {/* Emergency Contact */}
              <section className="bg-amber-500/5 dark:bg-amber-500/10 rounded-3xl p-6 border border-amber-500/10">
                <div className="flex items-center gap-2 mb-4">
                  <Phone className="w-4 h-4 text-amber-500" />
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-950 dark:text-white">
                    Emergency Contact Details
                  </h3>
                </div>
                {ec ? (
                  <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                    <div>
                      <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">Full Name</span>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{ec.name || '-'}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">Relationship</span>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{ec.relationship || '-'}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">Contact Phone</span>
                      <span className="text-xs font-black text-amber-700 dark:text-amber-400">{ec.phone || '-'}</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-2xl">
                    <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-500 shrink-0" />
                    <p className="text-[10px] font-semibold text-amber-600 dark:text-amber-500">
                      No emergency contacts specified. Fill details during edit to guarantee payroll/welfare safety.
                    </p>
                  </div>
                )}
              </section>

              <EmployeeDocumentVault employeeId={employee.id} isOpen={isOpen} />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
