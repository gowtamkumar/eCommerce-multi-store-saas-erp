'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Download, FileText, Loader2, Plus, Trash2 } from 'lucide-react';
import { useEmployeeDocuments } from '../../hooks/useEmployeeDocuments';

interface EmployeeDocumentVaultProps {
  employeeId?: string;
  isOpen: boolean;
}

const DOCUMENT_TYPES = [
  'Employment Contract',
  'National ID',
  'Passport',
  'Academic Certificate',
  'Medical Certificate',
  'Tax Form',
  'Reference Letter',
  'Other',
];

export default function EmployeeDocumentVault({ employeeId, isOpen }: EmployeeDocumentVaultProps) {
  const {
    documents,
    docsLoading,
    addingDoc,
    showAddForm,
    setShowAddForm,
    closeAddForm,
    newDocType,
    setNewDocType,
    newDocUrl,
    setNewDocUrl,
    newDocExpiry,
    setNewDocExpiry,
    uploadingFile,
    handleFileUpload,
    handleAddDocument,
    handleDeleteDocument,
  } = useEmployeeDocuments({ employeeId, isOpen });

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-indigo-500" />
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">
            Document Vault <span className="text-slate-400 ml-1">({documents.length})</span>
          </h3>
        </div>
        <button onClick={() => setShowAddForm((value) => !value)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all">
          <Plus className="w-3 h-3" /> Attach File
        </button>
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }} onSubmit={handleAddDocument}
            className="overflow-hidden mb-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Document Type *</label>
                <select required value={newDocType} onChange={(e) => setNewDocType(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none">
                  <option value="">Select type</option>
                  {DOCUMENT_TYPES.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Expiry Date</label>
                <input type="date" value={newDocExpiry} onChange={(e) => setNewDocExpiry(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none" />
              </div>

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
                      {uploadingFile ? 'Uploading secure file...' : 'Select and upload secure document'}
                    </p>
                  </div>
                  <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploadingFile} />
                </label>
              </div>

              <div className="col-span-2">
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">File URL *</label>
                <input type="text" required placeholder="https://... or /uploads/doc.pdf" value={newDocUrl}
                  onChange={(e) => setNewDocUrl(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none" />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={addingDoc}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">
                {addingDoc ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                Attach
              </button>
              <button type="button" onClick={closeAddForm}
                className="px-5 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-500 rounded-xl font-black text-[10px] uppercase hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
                Cancel
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {docsLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
        </div>
      ) : documents.length === 0 ? (
        <div className="py-10 text-center border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
          <FileText className="w-10 h-10 mx-auto text-slate-200 dark:text-slate-700 mb-2" />
          <p className="text-xs font-bold text-slate-400">No documents attached yet.</p>
          <p className="text-[10px] text-slate-400 font-semibold">Use &ldquo;Attach File&rdquo; to add employment contracts, IDs, etc.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => (
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
                <button onClick={() => handleDeleteDocument(doc.id)}
                  className="p-2 bg-white dark:bg-slate-800 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors border border-slate-100 dark:border-slate-700 shadow-sm">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
