'use client';

import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Phone, 
  MapPin, 
  Building2, 
  Calendar, 
  Download, 
  ShieldCheck, 
  FileText,
  Clock,
  Briefcase,
  TrendingUp,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Employee } from '../type';

interface EmployeeDetailsProps {
  employee: Employee | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function EmployeeDetails({
  employee,
  isOpen,
  onClose
}: EmployeeDetailsProps) {
  if (!employee) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-full max-w-2xl bg-white dark:bg-slate-900 shadow-2xl h-full flex flex-col"
          >
            {/* Header / Profile Summary */}
            <div className="relative h-64 bg-slate-900 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-purple-600/20"></div>
              <button 
                onClick={onClose}
                className="absolute top-8 right-8 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl text-white transition-all z-10"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="absolute bottom-0 left-0 w-full p-10 flex items-end gap-8">
                <div className="w-32 h-32 rounded-[2.5rem] bg-white p-2 shadow-2xl">
                  <div className="w-full h-full rounded-[2rem] bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-4xl italic">
                    {employee.user?.name.charAt(0)}
                  </div>
                </div>
                <div className="pb-4 text-white">
                  <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-none">
                    {employee.user?.name}
                  </h2>
                  <p className="text-indigo-300 font-bold uppercase text-[10px] tracking-[0.25em] mt-2">
                    {employee.designation?.name} • {employee.department?.name}
                  </p>
                </div>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-10 space-y-12">
              {/* Quick Info Grid */}
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Identity</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 italic">
                    <Mail className="w-4 h-4 text-indigo-500" /> {employee.user?.email}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Line</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 italic">
                    <Phone className="w-4 h-4 text-emerald-500" /> {employee.personalDetails?.emergencyContact?.phone || 'N/A'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Primary Hub</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 italic">
                    <MapPin className="w-4 h-4 text-rose-500" /> {employee.branch?.name || employee.warehouse?.name || 'Remote'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Join Anniversary</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 italic">
                    <Calendar className="w-4 h-4 text-amber-500" /> {new Date(employee.joiningDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Work Profile Section */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <Briefcase className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white italic">Work Engagement</h3>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-700 flex items-center justify-between group cursor-pointer hover:bg-white dark:hover:bg-slate-800 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white dark:bg-slate-700 rounded-2xl shadow-sm">
                        <Clock className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Active Shift</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Day Shift • 09:00 AM - 06:00 PM</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-600 transition-all" />
                  </div>
                  
                  <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-700 flex items-center justify-between group cursor-pointer hover:bg-white dark:hover:bg-slate-800 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white dark:bg-slate-700 rounded-2xl shadow-sm">
                        <TrendingUp className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">KPI Performance</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Last Score: 4.8 / 5.0 (Excellent)</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-600 transition-all" />
                  </div>
                </div>
              </section>

              {/* Documents Section */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white italic">Employee Vault</h3>
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{employee.documents?.length || 0} Files</span>
                </div>
                <div className="space-y-3">
                  {[
                    { name: 'Employment_Contract.pdf', size: '1.2 MB', date: 'Joined' },
                    { name: 'National_ID_Copy.jpg', size: '2.4 MB', date: 'Verified' },
                  ].map((doc, i) => (
                    <div key={i} className="flex items-center justify-between p-5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl hover:shadow-md transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-indigo-50 dark:bg-indigo-950 rounded-xl">
                          <FileText className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{doc.name}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{doc.size} • {doc.date}</p>
                        </div>
                      </div>
                      <button className="p-2 text-slate-300 hover:text-indigo-600 transition-colors">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Footer Actions */}
            <div className="p-10 border-t border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex gap-4">
              <button className="flex-1 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-xl">
                Edit Profile
              </button>
              <button className="px-8 py-4 bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest border border-slate-100 dark:border-slate-700 hover:text-rose-500 transition-all">
                Terminate
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
