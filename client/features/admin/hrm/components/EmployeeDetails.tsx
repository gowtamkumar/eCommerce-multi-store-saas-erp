'use client';

import { fetchAPI } from '@/services/api';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle, Briefcase, Building2, Calendar,
  Download, FileText, Loader2, Mail, MapPin, Phone,
  Plus, ShieldCheck, Trash2, X
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  addEmployeeDocument,
  deleteEmployeeDocument,
  getEmployeeDocuments,
} from '@/services/hrm';
import { Employee, EmployeeDocument } from '../type';

interface EmployeeDetailsProps {
  employee: Employee | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (employee: Employee) => void;
}

const CONTRACT_TYPE_LABEL: Record<string, string> = {
  FULL_TIME: 'Full-time Permanent',
  PART_TIME: 'Part-time',
  CONTRACTUAL: 'Fixed-term Contract',
  INTERN: 'Internship',
};

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-emerald-100 text-emerald-700',
  PROBATION: 'bg-blue-100 text-blue-700',
  ON_LEAVE: 'bg-amber-100 text-amber-700',
  TERMINATED: 'bg-rose-100 text-rose-700',
  SUSPENDED: 'bg-slate-100 text-slate-700',
};

export default function EmployeeDetails({ employee, isOpen, onClose, onEdit }: EmployeeDetailsProps) {
  const [documents, setDocuments] = useState<EmployeeDocument[]>([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [addingDoc, setAddingDoc] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDocType, setNewDocType] = useState('');
  const [newDocUrl, setNewDocUrl] = useState('');
  const [newDocExpiry, setNewDocExpiry] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);

  useEffect(() => {
    if (isOpen && employee?.id) {
      loadDocuments();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, employee?.id]);

  const loadDocuments = async () => {
    if (!employee?.id) return;
    setDocsLoading(true);
    try {
      const data = await getEmployeeDocuments(employee.id);
      setDocuments(data || []);
    } catch {
      setDocuments([]);
    } finally {
      setDocsLoading(false);
    }
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

  const handleAddDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee?.id || !newDocType || !newDocUrl) return;
    setAddingDoc(true);
    try {
      const res = await addEmployeeDocument(employee.id, {
        documentType: newDocType,
        fileUrl: newDocUrl,
        expiryDate: newDocExpiry || undefined,
      });
      if (res.success) {
        toast.success('Document attached to employee vault');
        setShowAddForm(false);
        setNewDocType(''); setNewDocUrl(''); setNewDocExpiry('');
        loadDocuments();
      }
    } catch {
      toast.error('Failed to attach document');
    } finally {
      setAddingDoc(false);
    }
  };

  const handleDeleteDoc = async (docId: string) => {
    if (!employee?.id || !confirm('Remove this document from the vault?')) return;
    try {
      await deleteEmployeeDocument(employee.id, docId);
      setDocuments(prev => prev.filter(d => d.id !== docId));
      toast.success('Document removed');
    } catch {
      toast.error('Failed to remove document');
    }
  };

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
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/30 to-purple-700/20" />
              <button onClick={onClose}
                className="absolute top-5 right-5 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors z-10">
                <X className="w-4 h-4" />
              </button>

              <div className="absolute bottom-6 left-8 right-8 flex items-end gap-5">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-500 to-indigo-600 border-2 border-white dark:border-slate-800 shadow-xl flex items-center justify-center text-white text-3xl font-black italic">
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
                    {employee.designation?.name || 'No Designation'} • {employee.department?.name || 'Unassigned Dept'}
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
                      {employee.personalDetails?.dob ? new Date(employee.personalDetails.dob).toLocaleDateString() : '—'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">Gender</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase">
                      {employee.personalDetails?.gender || '—'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">National ID (NID)</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {employee.personalDetails?.nationalId || '—'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">Passport Number</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {employee.personalDetails?.passportNo || '—'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">Blood Group</span>
                    <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                      {employee.personalDetails?.bloodGroup || '—'}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">Home Address</span>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {employee.personalDetails?.address || '—'}
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
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{ec.name || '—'}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">Relationship</span>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{ec.relationship || '—'}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">Contact Phone</span>
                      <span className="text-xs font-black text-amber-700 dark:text-amber-400">{ec.phone || '—'}</span>
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

              {/* Document Vault */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-500" />
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">
                      Document Vault <span className="text-slate-400 ml-1">({documents.length})</span>
                    </h3>
                  </div>
                  <button onClick={() => setShowAddForm(v => !v)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all">
                    <Plus className="w-3 h-3" /> Attach File
                  </button>
                </div>

                {/* Add Document form */}
                <AnimatePresence>
                  {showAddForm && (
                    <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }} onSubmit={handleAddDocument}
                      className="overflow-hidden mb-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Document Type *</label>
                          <select required value={newDocType} onChange={e => setNewDocType(e.target.value)}
                            className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none">
                            <option value="">Select type</option>
                            {['Employment Contract','National ID','Passport','Academic Certificate','Medical Certificate','Tax Form','Reference Letter','Other'].map(t => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Expiry Date</label>
                          <input type="date" value={newDocExpiry} onChange={e => setNewDocExpiry(e.target.value)}
                            className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none" />
                        </div>

                        {/* File Upload Selector inside details view */}
                        <div className="col-span-2">
                          <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Upload File</label>
                          <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl cursor-pointer bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                            <div className="flex flex-col items-center justify-center p-3 text-center">
                              {uploadingFile ? (
                                <Loader2 className="w-5 h-5 text-indigo-600 animate-spin mb-1" />
                              ) : (
                                <Plus className="w-5 h-5 text-slate-400 mb-1" />
                              )}
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">
                                {uploadingFile ? 'Uploadingsecure file...' : 'Select and upload secure document'}
                              </p>
                            </div>
                            <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploadingFile} />
                          </label>
                        </div>

                        <div className="col-span-2">
                          <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">File URL *</label>
                          <input type="text" required placeholder="https://... or /uploads/doc.pdf" value={newDocUrl}
                            onChange={e => setNewDocUrl(e.target.value)}
                            className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none" />
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button type="submit" disabled={addingDoc}
                          className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">
                          {addingDoc ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                          Attach
                        </button>
                        <button type="button" onClick={() => setShowAddForm(false)}
                          className="px-5 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-500 rounded-xl font-black text-[10px] uppercase hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
                          Cancel
                        </button>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>

                {/* Document list */}
                {docsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                  </div>
                ) : documents.length === 0 ? (
                  <div className="py-10 text-center border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
                    <FileText className="w-10 h-10 mx-auto text-slate-200 dark:text-slate-700 mb-2" />
                    <p className="text-xs font-bold text-slate-400">No documents attached yet.</p>
                    <p className="text-[10px] text-slate-400 font-semibold">Use "Attach File" to add employment contracts, IDs, etc.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {documents.map(doc => (
                      <div key={doc.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/40">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                            <FileText className="w-4 h-4 text-indigo-600" />
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase">{doc.documentType}</h4>
                            <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mt-0.5">
                              {doc.expiryDate ? `Expires: ${new Date(doc.expiryDate).toLocaleDateString()}` : 'No Expiry'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <a href={doc.fileUrl} target="_blank" rel="noreferrer"
                            className="p-2 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border border-slate-100 dark:border-slate-700 shadow-sm">
                            <Download className="w-3.5 h-3.5" />
                          </a>
                          <button onClick={() => handleDeleteDoc(doc.id)}
                            className="p-2 bg-white dark:bg-slate-800 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors border border-slate-100 dark:border-slate-700 shadow-sm">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
