'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import { fetchAPI } from '@/services/api';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Briefcase, Building2, Calendar, DollarSign, FileText,
  Loader2, MapPin, Phone, Plus, Save, ShieldCheck, Trash2, User, X
} from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { ContractType, Employee, EmployeeStatus } from '../type';

interface EmployeeFormProps {
  employee?: Employee | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  loading: boolean;
  departments?: { id: string; name: string }[];
  designations?: { id: string; name: string }[];
  branches?: { id: string; name: string }[];
  warehouses?: { id: string; name: string }[];
  users?: { id: string; name: string; email: string }[];
  employees?: { id: string; user?: { name: string } }[]; // for manager picker
}

const INPUT_CLS = 'w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-slate-900 dark:text-white placeholder:text-slate-400';
const LABEL_CLS = 'block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 pl-1';

export default function EmployeeForm({
  employee, isOpen, onClose, onSubmit, loading,
  departments = [], designations = [], branches = [],
  warehouses = [], users = [], employees = [],
}: EmployeeFormProps) {
  const [activeStep, setActiveStep] = useState(1);
  const [formData, setFormData] = useState<any>(employee || {
    userId: '',
    departmentId: '',
    designationId: '',
    managerId: '',
    branchId: '',
    status: EmployeeStatus.ACTIVE,
    contractType: ContractType.FULL_TIME,
    joiningDate: new Date().toISOString().split('T')[0],
    exitDate: '',
    salaryConfig: { basicSalary: 0, allowances: [], deductions: [] },
    personalDetails: {
      gender: 'MALE', bloodGroup: 'A+',
      nationalId: '', passportNo: '', address: '', dob: '',
      emergencyContact: { name: '', relationship: '', phone: '' },
    },
    documents: [],
  });

  // Local helper for document state inside the form wizard
  const [newDocType, setNewDocType] = useState('');
  const [newDocUrl, setNewDocUrl] = useState('');
  const [newDocExpiry, setNewDocExpiry] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    void Promise.resolve().then(() => {
      setActiveStep(1);
      setNewDocType('');
      setNewDocUrl('');
      setNewDocExpiry('');
      if (employee) {
        setFormData({
          userId: employee.userId || '',
          departmentId: employee.departmentId || '',
          designationId: employee.designationId || '',
          managerId: employee.managerId || '',
          branchId: employee.branchId || '',
          status: employee.status || EmployeeStatus.ACTIVE,
          contractType: employee.contractType || ContractType.FULL_TIME,
          joiningDate: typeof employee.joiningDate === 'string'
            ? employee.joiningDate.split('T')[0]
            : new Date().toISOString().split('T')[0],
          exitDate: typeof employee.exitDate === 'string'
            ? employee.exitDate.split('T')[0]
            : '',
          salaryConfig: {
            basicSalary: employee.salaryConfig?.basicSalary || 0,
            allowances: employee.salaryConfig?.allowances || [],
            deductions: employee.salaryConfig?.deductions || [],
          },
          personalDetails: {
            gender: employee.personalDetails?.gender || 'MALE',
            bloodGroup: employee.personalDetails?.bloodGroup || 'A+',
            nationalId: employee.personalDetails?.nationalId || '',
            passportNo: employee.personalDetails?.passportNo || '',
            address: employee.personalDetails?.address || '',
            dob: typeof employee.personalDetails?.dob === 'string'
              ? employee.personalDetails.dob.split('T')[0]
              : '',
            emergencyContact: {
              name: employee.personalDetails?.emergencyContact?.name || '',
              relationship: employee.personalDetails?.emergencyContact?.relationship || '',
              phone: employee.personalDetails?.emergencyContact?.phone || '',
            },
          },
          documents: employee.documents || [],
        });
      } else {
        setFormData({
          userId: '',
          departmentId: '',
          designationId: '',
          managerId: '',
          branchId: '',
          status: EmployeeStatus.ACTIVE,
          contractType: ContractType.FULL_TIME,
          joiningDate: new Date().toISOString().split('T')[0],
          exitDate: '',
          salaryConfig: { basicSalary: 0, allowances: [], deductions: [] },
          personalDetails: {
            gender: 'MALE', bloodGroup: 'A+',
            nationalId: '', passportNo: '', address: '', dob: '',
            emergencyContact: { name: '', relationship: '', phone: '' },
          },
          documents: [],
        });
      }
    });
  }, [employee, isOpen]);

  const steps = [
    { id: 1, label: 'Account',    icon: User },
    { id: 2, label: 'Work Info',  icon: Briefcase },
    { id: 3, label: 'Personal',   icon: ShieldCheck },
    { id: 4, label: 'Emergency',  icon: Phone },
    { id: 5, label: 'Payroll',    icon: DollarSign },
    { id: 6, label: 'Documents',  icon: FileText },
  ];

  const set = (field: string, value: any) =>
    setFormData((p: any) => ({ ...p, [field]: value }));

  const setPD = (field: string, value: any) =>
    setFormData((p: any) => ({ ...p, personalDetails: { ...p.personalDetails, [field]: value } }));

  const setEC = (field: string, value: any) =>
    setFormData((p: any) => ({
      ...p,
      personalDetails: {
        ...p.personalDetails,
        emergencyContact: { ...p.personalDetails?.emergencyContact, [field]: value },
      },
    }));

  const setSC = (field: string, value: any) =>
    setFormData((p: any) => ({ ...p, salaryConfig: { ...p.salaryConfig, [field]: value } }));

  const addAllowance = () =>
    setSC('allowances', [...(formData.salaryConfig.allowances || []), { type: '', amount: 0 }]);

  const removeAllowance = (i: number) => {
    const arr = [...formData.salaryConfig.allowances]; arr.splice(i, 1);
    setSC('allowances', arr);
  };

  const changeAllowance = (i: number, field: string, value: any) => {
    const arr = [...formData.salaryConfig.allowances];
    arr[i] = { ...arr[i], [field]: value };
    setSC('allowances', arr);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setUploadingFile(true);
    const loadingToast = toast.loading('Uploading secure document...');
    try {
      // Step 1: Request presigned upload URL from API
      const presignedRes = await fetchAPI('/admin/media/presigned-url', {
        method: 'POST',
        body: JSON.stringify({
          filename: file.name,
          mimetype: file.type,
          size: file.size,
        }),
      });

      if (presignedRes.success && presignedRes.data?.uploadUrl) {
        const { uploadUrl, downloadUrl } = presignedRes.data;

        // Step 2: Upload direct file binary to storage server via PUT
        const uploadRes = await fetch(uploadUrl, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type,
          },
        });

        if (!uploadRes.ok) {
          throw new Error('Failed to upload file to target bucket');
        }

        setNewDocUrl(downloadUrl);
        toast.success('Document uploaded to cloud storage!');
      } else {
        toast.error('Could not open secure upload stream');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error uploading document file');
    } finally {
      toast.dismiss(loadingToast);
      setUploadingFile(false);
    }
  };

  // Add document to the local form list
  const addLocalDocument = () => {
    if (!newDocType || !newDocUrl) {
      toast.error('Please choose a document type and upload/link a file first');
      return;
    }
    const newDoc = {
      documentType: newDocType,
      fileUrl: newDocUrl,
      expiryDate: newDocExpiry || undefined,
    };
    setFormData((p: any) => ({
      ...p,
      documents: [...(p.documents || []), newDoc]
    }));
    setNewDocType('');
    setNewDocUrl('');
    setNewDocExpiry('');
  };

  const removeLocalDocument = (index: number) => {
    setFormData((p: any) => {
      const arr = [...(p.documents || [])];
      arr.splice(index, 1);
      return { ...p, documents: arr };
    });
  };

  const handleSubmit = () => {
    const payload: any = {
      userId: formData.userId || undefined,
      departmentId: formData.departmentId || undefined,
      designationId: formData.designationId || undefined,
      managerId: formData.managerId || undefined,
      branchId: formData.branchId || undefined,
      status: formData.status,
      contractType: formData.contractType,
      joiningDate: formData.joiningDate,
      exitDate: formData.exitDate || undefined,
      salaryConfig: formData.salaryConfig?.basicSalary > 0 ? formData.salaryConfig : undefined,
      personalDetails: formData.personalDetails?.gender ? formData.personalDetails : undefined,
      documents: formData.documents && formData.documents.length > 0 ? formData.documents : undefined,
    };
    Object.keys(payload).forEach(k => (payload[k] === '' || payload[k] === undefined) && delete payload[k]);
    onSubmit(payload);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />

          <motion.div initial={{ scale: 0.92, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0 }}
            className="relative w-full max-w-4xl bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
          >
            {/* Sidebar */}
            <div className="w-full md:w-60 bg-slate-50 dark:bg-slate-900/60 p-8 border-r border-slate-100 dark:border-slate-700 flex flex-col gap-2 shrink-0">
              <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight mb-6 italic">
                {employee ? 'Edit' : 'New'} <span className="text-indigo-600">Employee</span>
              </h2>
              {steps.map(step => (
                <button key={step.id} onClick={() => setActiveStep(step.id)} type="button"
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeStep === step.id
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 translate-x-1'
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                >
                  <step.icon className="w-4 h-4" /> {step.label}
                </button>
              ))}
              {/* Step progress */}
              <div className="mt-auto pt-6">
                <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600 rounded-full transition-all"
                    style={{ width: `${(activeStep / steps.length) * 100}%` }} />
                </div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2">
                  Step {activeStep} of {steps.length}
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="p-8 overflow-y-auto flex-1">
                <AnimatePresence mode="wait">

                  {/* Step 1 — Account */}
                  {activeStep === 1 && (
                    <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                      className="space-y-5">
                      <div>
                        <label className={LABEL_CLS}>Link User Account *</label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
                          <select value={formData.userId || ''} onChange={e => set('userId', e.target.value)}
                            className={`${INPUT_CLS} pl-11 appearance-none`}>
                            <option value="">Select existing user account</option>
                            {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
                          </select>
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold mt-1.5 pl-1 italic">
                          Links this HR profile to a system login account.
                        </p>
                      </div>
                      <div>
                        <label className={LABEL_CLS}>Reporting Manager</label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
                          <select value={formData.managerId || ''} onChange={e => set('managerId', e.target.value)}
                            className={`${INPUT_CLS} pl-11 appearance-none`}>
                            <option value="">No direct manager (top-level)</option>
                            {employees.filter(e => e.id !== employee?.id).map(e => (
                              <option key={e.id} value={e.id}>{e.user?.name || e.id}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 2 — Work Info */}
                  {activeStep === 2 && (
                    <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                      className="space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className={LABEL_CLS}>Department</label>
                          <div className="relative">
                            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
                            <select value={formData.departmentId || ''} onChange={e => set('departmentId', e.target.value)}
                              className={`${INPUT_CLS} pl-11 appearance-none`}>
                              <option value="">Select Department</option>
                              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className={LABEL_CLS}>Designation / Job Title</label>
                          <div className="relative">
                            <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
                            <select value={formData.designationId || ''} onChange={e => set('designationId', e.target.value)}
                              className={`${INPUT_CLS} pl-11 appearance-none`}>
                              <option value="">Select Designation</option>
                              {designations.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className={LABEL_CLS}>Employment Status</label>
                          <select value={formData.status} onChange={e => set('status', e.target.value)}
                            className={`${INPUT_CLS} appearance-none`}>
                            <option value={EmployeeStatus.ACTIVE}>Active</option>
                            <option value={EmployeeStatus.PROBATION}>Probation</option>
                            <option value={EmployeeStatus.ON_LEAVE}>On Leave</option>
                            <option value={EmployeeStatus.SUSPENDED}>Suspended</option>
                            <option value={EmployeeStatus.TERMINATED}>Terminated</option>
                          </select>
                        </div>
                        <div>
                          <label className={LABEL_CLS}>Contract Type</label>
                          <select value={formData.contractType} onChange={e => set('contractType', e.target.value)}
                            className={`${INPUT_CLS} appearance-none`}>
                            <option value={ContractType.FULL_TIME}>Full Time</option>
                            <option value={ContractType.PART_TIME}>Part Time</option>
                            <option value={ContractType.CONTRACTUAL}>Contractual</option>
                            <option value={ContractType.INTERN}>Intern</option>
                          </select>
                        </div>
                        <div>
                          <label className={LABEL_CLS}>Joining Date *</label>
                          <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
                            <input type="date" value={formData.joiningDate || ''} onChange={e => set('joiningDate', e.target.value)}
                              className={`${INPUT_CLS} pl-11`} />
                          </div>
                        </div>
                        <div>
                          <label className={LABEL_CLS}>Contract End / Exit Date</label>
                          <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
                            <input type="date" value={formData.exitDate || ''} onChange={e => set('exitDate', e.target.value)}
                              className={`${INPUT_CLS} pl-11`} placeholder="Leave blank if permanent" />
                          </div>
                          <p className="text-[10px] text-slate-400 font-bold mt-1.5 pl-1 italic">For fixed-term or probation end dates.</p>
                        </div>
                        <div>
                          <label className={LABEL_CLS}>Assigned Branch / Location</label>
                          <div className="relative">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
                            <select value={formData.branchId || ''} onChange={e => set('branchId', e.target.value)}
                              className={`${INPUT_CLS} pl-11 appearance-none`}>
                              <option value="">Remote / Unassigned</option>
                              {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                            </select>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3 — Personal Details */}
                  {activeStep === 3 && (
                    <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                      className="space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className={LABEL_CLS}>Date of Birth</label>
                          <input type="date" value={formData.personalDetails?.dob || ''}
                            onChange={e => setPD('dob', e.target.value)} className={INPUT_CLS} />
                        </div>
                        <div>
                          <label className={LABEL_CLS}>Gender</label>
                          <select value={formData.personalDetails?.gender || 'MALE'}
                            onChange={e => setPD('gender', e.target.value)} className={`${INPUT_CLS} appearance-none`}>
                            <option value="MALE">Male</option>
                            <option value="FEMALE">Female</option>
                            <option value="OTHER">Other / Prefer not to say</option>
                          </select>
                        </div>
                        <div>
                          <label className={LABEL_CLS}>National ID Number</label>
                          <input type="text" value={formData.personalDetails?.nationalId || ''}
                            onChange={e => setPD('nationalId', e.target.value)}
                            placeholder="NID / SSN" className={INPUT_CLS} />
                        </div>
                        <div>
                          <label className={LABEL_CLS}>Passport Number</label>
                          <input type="text" value={formData.personalDetails?.passportNo || ''}
                            onChange={e => setPD('passportNo', e.target.value)}
                            placeholder="Passport No." className={INPUT_CLS} />
                        </div>
                        <div>
                          <label className={LABEL_CLS}>Blood Group</label>
                          <select value={formData.personalDetails?.bloodGroup || 'A+'}
                            onChange={e => setPD('bloodGroup', e.target.value)} className={`${INPUT_CLS} appearance-none`}>
                            {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bg => (
                              <option key={bg} value={bg}>{bg}</option>
                            ))}
                          </select>
                        </div>
                        <div className="md:col-span-2">
                          <label className={LABEL_CLS}>Home Address</label>
                          <textarea value={formData.personalDetails?.address || ''}
                            onChange={e => setPD('address', e.target.value)} rows={2}
                            placeholder="Full residential address"
                            className={`${INPUT_CLS} resize-none`} />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 4 — Emergency Contact */}
                  {activeStep === 4 && (
                    <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                      className="space-y-5">
                      <div className="p-5 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-2xl">
                        <p className="text-xs font-black text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                          Emergency Contact Details
                        </p>
                        <p className="text-[10px] text-amber-600 dark:text-amber-500 font-semibold mt-1">
                          Person to be notified in case of emergency. Required for ERP compliance.
                        </p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className={LABEL_CLS}>Contact Full Name</label>
                          <input type="text" value={formData.personalDetails?.emergencyContact?.name || ''}
                            onChange={e => setEC('name', e.target.value)}
                            placeholder="e.g. Jane Doe" className={INPUT_CLS} />
                        </div>
                        <div>
                          <label className={LABEL_CLS}>Relationship</label>
                          <select value={formData.personalDetails?.emergencyContact?.relationship || ''}
                            onChange={e => setEC('relationship', e.target.value)} className={`${INPUT_CLS} appearance-none`}>
                            <option value="">Select Relationship</option>
                            <option value="Spouse">Spouse</option>
                            <option value="Parent">Parent</option>
                            <option value="Sibling">Sibling</option>
                            <option value="Child">Child</option>
                            <option value="Friend">Friend</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div className="md:col-span-2">
                          <label className={LABEL_CLS}>Contact Phone Number</label>
                          <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
                            <input type="tel" value={formData.personalDetails?.emergencyContact?.phone || ''}
                              onChange={e => setEC('phone', e.target.value)}
                              placeholder="+1 555 000 0000" className={`${INPUT_CLS} pl-11`} />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 5 — Payroll */}
                  {activeStep === 5 && (
                    <motion.div key="s5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                      className="space-y-5">
                      <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-700 space-y-5">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Monthly Package</h3>
                          <span className="px-2.5 py-1 bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest rounded-full">Primary</span>
                        </div>
                        <div>
                          <label className={LABEL_CLS}>Basic Salary</label>
                          <div className="relative">
                            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500 pointer-events-none" />
                            <input type="number" value={formData.salaryConfig?.basicSalary || 0}
                              onChange={e => setSC('basicSalary', parseFloat(e.target.value) || 0)}
                              placeholder="0.00" className={`${INPUT_CLS} pl-11 font-black`} />
                          </div>
                        </div>
                        <div className="space-y-3 pt-2">
                          <div className="flex items-center justify-between">
                            <label className={`${LABEL_CLS} mb-0`}>Allowances</label>
                            <button onClick={addAllowance} type="button"
                              className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all">
                              <Plus className="w-3 h-3" /> Add
                            </button>
                          </div>
                          {(formData.salaryConfig?.allowances || []).map((a: any, i: number) => (
                            <div key={i} className="flex gap-3 items-end">
                              <input type="text" value={a.type} placeholder="Type (e.g. Transport)"
                                onChange={e => changeAllowance(i, 'type', e.target.value)}
                                className="flex-1 px-4 py-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-xs font-bold outline-none" />
                              <input type="number" value={a.amount} placeholder="Amount"
                                onChange={e => changeAllowance(i, 'amount', parseFloat(e.target.value) || 0)}
                                className="w-28 px-4 py-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-xs font-black outline-none" />
                              <button onClick={() => removeAllowance(i)} type="button"
                                className="p-3 text-rose-400 hover:text-rose-600 transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 6 — Document Vault Setup */}
                  {activeStep === 6 && (
                    <motion.div key="s6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                      className="space-y-5">
                      <div className="p-5 bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-800/30 rounded-2xl">
                        <p className="text-xs font-black text-indigo-700 dark:text-indigo-400 uppercase tracking-wider">
                          Employee Document Vault
                        </p>
                        <p className="text-[10px] text-indigo-600 dark:text-indigo-500 font-semibold mt-1">
                          Attach employment contracts, NID/Passport copies, and certificates directly inside this profile.
                        </p>
                      </div>

                      {/* Attach Form */}
                      <div className="bg-slate-50 dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white pl-1">Attach New File</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className={LABEL_CLS}>Document Type</label>
                            <select value={newDocType} onChange={e => setNewDocType(e.target.value)}
                              className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-xs font-bold outline-none">
                              <option value="">Select type</option>
                              {['Employment Contract','National ID','Passport','Academic Certificate','Medical Certificate','Tax Form','Reference Letter','Other'].map(t => (
                                <option key={t} value={t}>{t}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className={LABEL_CLS}>Expiry Date</label>
                            <input type="date" value={newDocExpiry} onChange={e => setNewDocExpiry(e.target.value)}
                              className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-xs font-bold outline-none" />
                          </div>

                          {/* Direct Document File Uploader */}
                          <div className="col-span-2">
                            <label className={LABEL_CLS}>Upload Document File</label>
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-900/35 transition-all bg-white dark:bg-slate-800">
                              <div className="flex flex-col items-center justify-center p-4 text-center">
                                {uploadingFile ? (
                                  <Loader2 className="w-7 h-7 text-indigo-600 animate-spin mb-2" />
                                ) : (
                                  <Plus className="w-7 h-7 text-slate-400 mb-2" />
                                )}
                                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                                  {uploadingFile ? 'Uploading secure file...' : 'Click to select and upload document'}
                                </p>
                                <p className="text-[9px] text-slate-400 font-semibold mt-1">PDF, DOCX, PNG, JPG accepted</p>
                              </div>
                              <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploadingFile} />
                            </label>
                          </div>

                          <div className="col-span-2">
                            <label className={LABEL_CLS}>Document URL or Reference Link</label>
                            <input type="text" placeholder="e.g., https://secure-bucket.com/nid.pdf" value={newDocUrl}
                              onChange={e => setNewDocUrl(e.target.value)}
                              className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-xs font-bold outline-none" />
                          </div>
                        </div>
                        <button type="button" onClick={addLocalDocument}
                          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all">
                          Add Document to Vault
                        </button>
                      </div>

                      {/* Attached Documents List */}
                      <div className="space-y-2">
                        <label className={LABEL_CLS}>Currently Attached ({formData.documents?.length || 0})</label>
                        {(!formData.documents || formData.documents.length === 0) ? (
                          <div className="py-8 text-center border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
                            <p className="text-xs font-bold text-slate-400">No documents listed. Add files using the panel above.</p>
                          </div>
                        ) : (
                          <div className="space-y-2 max-h-56 overflow-y-auto">
                            {formData.documents.map((doc: any, index: number) => (
                              <div key={index} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
                                    <FileText className="w-4 h-4 text-indigo-600" />
                                  </div>
                                  <div>
                                    <p className="text-xs font-black text-slate-900 dark:text-white uppercase">{doc.documentType}</p>
                                    <p className="text-[10px] text-slate-400 font-bold truncate max-w-xs">{doc.fileUrl}</p>
                                  </div>
                                </div>
                                <button type="button" onClick={() => removeLocalDocument(index)}
                                  className="p-2 text-rose-500 hover:text-rose-600 transition-colors">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between bg-white dark:bg-slate-800 shrink-0">
                <button onClick={onClose} type="button"
                  className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
                  Discard
                </button>
                <div className="flex items-center gap-3">
                  {activeStep > 1 && (
                    <button onClick={() => setActiveStep(s => s - 1)} type="button"
                      className="px-5 py-3 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-600 transition-all">
                      Back
                    </button>
                  )}
                  {activeStep < steps.length ? (
                    <button onClick={() => setActiveStep(s => s + 1)} type="button"
                      className="px-7 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-lg">
                      Continue
                    </button>
                  ) : (
                    <button onClick={handleSubmit} disabled={loading} type="button"
                      className="px-7 py-3 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2">
                      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                      Save Record
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* X close */}
            <button onClick={onClose} type="button"
              className="absolute top-5 right-5 p-2 text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all z-50">
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}