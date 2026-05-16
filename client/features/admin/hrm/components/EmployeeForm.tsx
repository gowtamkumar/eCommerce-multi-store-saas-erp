'use client';

import React, { useState } from 'react';
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Building2, 
  Briefcase, 
  Calendar,
  DollarSign,
  ShieldCheck,
  FileText,
  Plus,
  Trash2,
  Save,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Employee, EmployeeStatus, ContractType } from '../type';

interface EmployeeFormProps {
  employee?: Employee | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  loading: boolean;
}

export default function EmployeeForm({
  employee,
  isOpen,
  onClose,
  onSubmit,
  loading
}: EmployeeFormProps) {
  const [activeStep, setActiveStep] = useState(1);
  const [formData, setFormData] = useState<any>(employee || {
    status: EmployeeStatus.ACTIVE,
    contractType: ContractType.FULL_TIME,
    joiningDate: new Date().toISOString().split('T')[0],
    salaryConfig: {
      basicSalary: 0,
      allowances: [],
      deductions: []
    },
    personalDetails: {
      gender: 'MALE',
      bloodGroup: 'A+',
    }
  });

  const steps = [
    { id: 1, label: 'Account', icon: User },
    { id: 2, label: 'Work Info', icon: Briefcase },
    { id: 3, label: 'Personal', icon: ShieldCheck },
    { id: 4, label: 'Payroll', icon: DollarSign },
  ];

  const handleAddAllowance = () => {
    setFormData({
      ...formData,
      salaryConfig: {
        ...formData.salaryConfig,
        allowances: [...formData.salaryConfig.allowances, { type: '', amount: 0 }]
      }
    });
  };

  const handleRemoveAllowance = (index: number) => {
    const newAllowances = [...formData.salaryConfig.allowances];
    newAllowances.splice(index, 1);
    setFormData({
      ...formData,
      salaryConfig: { ...formData.salaryConfig, allowances: newAllowances }
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
          />
          
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-4xl bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row"
          >
            {/* Sidebar / Steps */}
            <div className="w-full md:w-64 bg-slate-50 dark:bg-slate-900/50 p-8 border-r border-slate-100 dark:border-slate-700 flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-8 italic">
                  {employee ? 'Edit' : 'New'} <span className="text-indigo-600">Employee</span>
                </h2>
                <div className="space-y-2">
                  {steps.map((step) => (
                    <button
                      key={step.id}
                      onClick={() => setActiveStep(step.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        activeStep === step.id 
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 translate-x-2' 
                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                      }`}
                    >
                      <step.icon className="w-4 h-4" />
                      {step.label}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="hidden md:block">
                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800/50">
                  <p className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-1">Quick Tip</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold leading-relaxed">Ensure all financial details are audited before saving.</p>
                </div>
              </div>
            </div>

            {/* Form Content */}
            <div className="flex-1 flex flex-col h-[80vh] md:h-auto overflow-hidden">
              <div className="p-8 overflow-y-auto flex-1">
                <AnimatePresence mode="wait">
                  {activeStep === 1 && (
                    <motion.div 
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                          <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                            <input 
                              type="text" 
                              placeholder="e.g. Robert Fox"
                              className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                          <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                            <input 
                              type="email" 
                              placeholder="robert@company.com"
                              className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeStep === 2 && (
                    <motion.div 
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Department</label>
                          <select className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none">
                            <option>Finance</option>
                            <option>Logistics</option>
                            <option>Marketing</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Designation</label>
                          <select className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none">
                            <option>Senior Executive</option>
                            <option>Manager</option>
                            <option>Lead</option>
                          </select>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeStep === 4 && (
                    <motion.div 
                      key="step4"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-700">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Monthly Package</h3>
                          <span className="px-3 py-1 bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest rounded-full">Primary</span>
                        </div>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Basic Salary ($)</label>
                            <div className="relative group">
                              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                              <input 
                                type="number" 
                                placeholder="0.00"
                                className="w-full pl-12 pr-6 py-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-black focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-4 pt-4">
                            <div className="flex items-center justify-between">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Allowances</label>
                              <button 
                                onClick={handleAddAllowance}
                                className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all"
                              >
                                <Plus className="w-3 h-3" /> Add Allowance
                              </button>
                            </div>
                            
                            {formData.salaryConfig.allowances.map((allowance: any, i: number) => (
                              <div key={i} className="flex gap-4 items-end animate-in slide-in-from-left duration-300">
                                <div className="flex-1 space-y-2">
                                  <input 
                                    type="text" 
                                    placeholder="Type (e.g. Travel)" 
                                    className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-xs font-bold outline-none"
                                  />
                                </div>
                                <div className="w-32 space-y-2">
                                  <input 
                                    type="number" 
                                    placeholder="Amount" 
                                    className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-xs font-black outline-none"
                                  />
                                </div>
                                <button 
                                  onClick={() => handleRemoveAllowance(i)}
                                  className="p-3 text-rose-400 hover:text-rose-600 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="p-8 border-t border-slate-50 dark:border-slate-700 flex items-center justify-between bg-white dark:bg-slate-800">
                <button 
                  onClick={onClose}
                  className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  Discard
                </button>
                <div className="flex items-center gap-3">
                  {activeStep > 1 && (
                    <button 
                      onClick={() => setActiveStep(activeStep - 1)}
                      className="px-6 py-3 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all"
                    >
                      Back
                    </button>
                  )}
                  {activeStep < 4 ? (
                    <button 
                      onClick={() => setActiveStep(activeStep + 1)}
                      className="px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-lg"
                    >
                      Next Step
                    </button>
                  ) : (
                    <button 
                      onClick={() => onSubmit(formData)}
                      disabled={loading}
                      className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2"
                    >
                      {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                      Save Record
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Close Button */}
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all z-50"
            >
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
