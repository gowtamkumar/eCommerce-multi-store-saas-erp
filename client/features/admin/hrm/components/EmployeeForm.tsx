'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  Briefcase,
  Building2,
  Calendar,
  DollarSign,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Plus,
  Save,
  ShieldCheck,
  Trash2,
  User,
  X
} from 'lucide-react';
import { useState } from 'react';
import { ContractType, Employee, EmployeeStatus } from '../type';

interface DepartmentOption {
  id: string;
  name: string;
}

interface DesignationOption {
  id: string;
  name: string;
}

interface EmployeeFormProps {
  employee?: Employee | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  loading: boolean;
  departments?: DepartmentOption[];
  designations?: DesignationOption[];
  branches?: { id: string; name: string }[];
  warehouses?: { id: string; name: string }[];
  users?: { id: string; name: string; email: string }[];
}

export default function EmployeeForm({
  employee,
  isOpen,
  onClose,
  onSubmit,
  loading,
  departments = [],
  designations = [],
  branches = [],
  warehouses = [],
  users = [],
}: EmployeeFormProps) {
  const [activeStep, setActiveStep] = useState(1);
  const [formData, setFormData] = useState<any>(employee || {
    userId: '',
    departmentId: '',
    designationId: '',
    branchId: '',
    warehouseId: '',
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

  const updateField = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const updateSalaryConfig = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      salaryConfig: { ...prev.salaryConfig, [field]: value }
    }));
  };

  const updatePersonalDetails = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      personalDetails: { ...prev.personalDetails, [field]: value }
    }));
  };

  const handleAddAllowance = () => {
    setFormData((prev: any) => ({
      ...prev,
      salaryConfig: {
        ...prev.salaryConfig,
        allowances: [...prev.salaryConfig.allowances, { type: '', amount: 0 }]
      }
    }));
  };

  const handleRemoveAllowance = (index: number) => {
    setFormData((prev: any) => {
      const newAllowances = [...prev.salaryConfig.allowances];
      newAllowances.splice(index, 1);
      return { ...prev, salaryConfig: { ...prev.salaryConfig, allowances: newAllowances } };
    });
  };

  const handleAllowanceChange = (index: number, field: string, value: any) => {
    setFormData((prev: any) => {
      const newAllowances = [...prev.salaryConfig.allowances];
      newAllowances[index] = { ...newAllowances[index], [field]: value };
      return { ...prev, salaryConfig: { ...prev.salaryConfig, allowances: newAllowances } };
    });
  };

  const handleSubmit = () => {
    // Build the payload matching backend CreateEmployeeDto
    const payload: any = {
      userId: formData.userId,
      departmentId: formData.departmentId || undefined,
      designationId: formData.designationId || undefined,
      branchId: formData.branchId || undefined,
      warehouseId: formData.warehouseId || undefined,
      status: formData.status,
      contractType: formData.contractType,
      joiningDate: formData.joiningDate,
      salaryConfig: formData.salaryConfig?.basicSalary > 0 ? formData.salaryConfig : undefined,
      personalDetails: formData.personalDetails?.gender ? formData.personalDetails : undefined,
    };
    // Clean up empty string refs
    Object.keys(payload).forEach(k => payload[k] === '' && delete payload[k]);
    onSubmit(payload);
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
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeStep === step.id
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
                      <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Link User Account *</label>
                          <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                            <select
                              value={formData.userId || ''}
                              onChange={(e) => updateField('userId', e.target.value)}
                              className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none appearance-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                            >
                              <option value="">Select User</option>
                              {users.map((u) => (
                                <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                              ))}
                            </select>
                          </div>
                          <p className="text-[10px] text-slate-400 font-bold mt-1 ml-1 italic">
                            Select the system user to link this employee profile to.
                          </p>
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
                          <div className="relative group">
                            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                            <select
                              value={formData.departmentId || ''}
                              onChange={(e) => updateField('departmentId', e.target.value)}
                              className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none appearance-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                            >
                              <option value="">Select Department</option>
                              {departments.map((dept) => (
                                <option key={dept.id} value={dept.id}>{dept.name}</option>
                              ))}
                              {departments.length === 0 && (
                                <option value="" disabled>Loading departments...</option>
                              )}
                            </select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Designation</label>
                          <div className="relative group">
                            <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                            <select
                              value={formData.designationId || ''}
                              onChange={(e) => updateField('designationId', e.target.value)}
                              className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none appearance-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                            >
                              <option value="">Select Designation</option>
                              {designations.map((des) => (
                                <option key={des.id} value={des.id}>{des.name}</option>
                              ))}
                              {designations.length === 0 && (
                                <option value="" disabled>Loading designations...</option>
                              )}
                            </select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
                          <select
                            value={formData.status}
                            onChange={(e) => updateField('status', e.target.value)}
                            className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none appearance-none"
                          >
                            <option value={EmployeeStatus.ACTIVE}>Active</option>
                            <option value={EmployeeStatus.PROBATION}>Probation</option>
                            <option value={EmployeeStatus.ON_LEAVE}>On Leave</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contract Type</label>
                          <select
                            value={formData.contractType}
                            onChange={(e) => updateField('contractType', e.target.value)}
                            className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none appearance-none"
                          >
                            <option value={ContractType.FULL_TIME}>Full Time</option>
                            <option value={ContractType.PART_TIME}>Part Time</option>
                            <option value={ContractType.CONTRACTUAL}>Contractual</option>
                            <option value={ContractType.INTERN}>Intern</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Joining Date</label>
                          <div className="relative group">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                            <input
                              type="date"
                              value={formData.joiningDate || ''}
                              onChange={(e) => updateField('joiningDate', e.target.value)}
                              className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assigned Location *</label>
                          <div className="relative group">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                            <select
                              value={formData.branchId || ''}
                              onChange={(e) => updateField('branchId', e.target.value)}
                              className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none appearance-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                            >
                              <option value="">Select Branch</option>
                              {branches.map(b => (
                                <option key={b.id} value={b.id}>{b.name}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeStep === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date of Birth</label>
                          <input
                            type="date"
                            value={formData.personalDetails?.dob || ''}
                            onChange={(e) => updatePersonalDetails('dob', e.target.value)}
                            className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Gender</label>
                          <select
                            value={formData.personalDetails?.gender || 'MALE'}
                            onChange={(e) => updatePersonalDetails('gender', e.target.value)}
                            className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none appearance-none"
                          >
                            <option value="MALE">Male</option>
                            <option value="FEMALE">Female</option>
                            <option value="OTHER">Other</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">National ID</label>
                          <input
                            type="text"
                            value={formData.personalDetails?.nationalId || ''}
                            onChange={(e) => updatePersonalDetails('nationalId', e.target.value)}
                            placeholder="NID Number"
                            className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Blood Group</label>
                          <select
                            value={formData.personalDetails?.bloodGroup || 'A+'}
                            onChange={(e) => updatePersonalDetails('bloodGroup', e.target.value)}
                            className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none appearance-none"
                          >
                            <option value="A+">A+</option>
                            <option value="A-">A-</option>
                            <option value="B+">B+</option>
                            <option value="B-">B-</option>
                            <option value="AB+">AB+</option>
                            <option value="AB-">AB-</option>
                            <option value="O+">O+</option>
                            <option value="O-">O-</option>
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
                                value={formData.salaryConfig?.basicSalary || 0}
                                onChange={(e) => updateSalaryConfig('basicSalary', parseFloat(e.target.value) || 0)}
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

                            {formData.salaryConfig?.allowances?.map((allowance: any, i: number) => (
                              <div key={i} className="flex gap-4 items-end animate-in slide-in-from-left duration-300">
                                <div className="flex-1 space-y-2">
                                  <input
                                    type="text"
                                    value={allowance.type}
                                    onChange={(e) => handleAllowanceChange(i, 'type', e.target.value)}
                                    placeholder="Type (e.g. Travel)"
                                    className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-xs font-bold outline-none"
                                  />
                                </div>
                                <div className="w-32 space-y-2">
                                  <input
                                    type="number"
                                    value={allowance.amount}
                                    onChange={(e) => handleAllowanceChange(i, 'amount', parseFloat(e.target.value) || 0)}
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
                      onClick={handleSubmit}
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