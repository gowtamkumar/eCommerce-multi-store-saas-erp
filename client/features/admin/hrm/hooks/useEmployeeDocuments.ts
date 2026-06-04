'use client';

import { ChangeEvent, FormEvent, useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { fetchAPI } from '@/services/api';
import {
  addEmployeeDocument,
  deleteEmployeeDocument,
  getEmployeeDocuments,
} from '@/services/hrm';
import { EmployeeDocument } from '../types/employee';

interface UseEmployeeDocumentsArgs {
  employeeId?: string;
  isOpen: boolean;
}

export function useEmployeeDocuments({ employeeId, isOpen }: UseEmployeeDocumentsArgs) {
  const [documents, setDocuments] = useState<EmployeeDocument[]>([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [addingDoc, setAddingDoc] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDocType, setNewDocType] = useState('');
  const [newDocUrl, setNewDocUrl] = useState('');
  const [newDocExpiry, setNewDocExpiry] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);

  const loadDocuments = useCallback(async () => {
    if (!employeeId) return;
    setDocsLoading(true);
    try {
      const data = await getEmployeeDocuments(employeeId);
      setDocuments(data || []);
    } catch {
      setDocuments([]);
    } finally {
      setDocsLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    if (isOpen && employeeId) {
      void loadDocuments();
    }
  }, [employeeId, isOpen, loadDocuments]);

  const resetDraft = useCallback(() => {
    setNewDocType('');
    setNewDocUrl('');
    setNewDocExpiry('');
  }, []);

  const handleFileUpload = useCallback(async (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;
    const file = event.target.files[0];
    setUploadingFile(true);
    const loadingToast = toast.loading('Uploading secure document...');
    try {
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
  }, []);

  const handleAddDocument = useCallback(async (event: FormEvent) => {
    event.preventDefault();
    if (!employeeId || !newDocType || !newDocUrl) return;
    setAddingDoc(true);
    try {
      const res = await addEmployeeDocument(employeeId, {
        documentType: newDocType,
        fileUrl: newDocUrl,
        expiryDate: newDocExpiry || undefined,
      });
      if (res.success) {
        toast.success('Document attached to employee vault');
        setShowAddForm(false);
        resetDraft();
        await loadDocuments();
      }
    } catch {
      toast.error('Failed to attach document');
    } finally {
      setAddingDoc(false);
    }
  }, [employeeId, loadDocuments, newDocExpiry, newDocType, newDocUrl, resetDraft]);

  const handleDeleteDocument = useCallback(async (docId: string) => {
    if (!employeeId || !confirm('Remove this document from the vault?')) return;
    try {
      await deleteEmployeeDocument(employeeId, docId);
      setDocuments((prev) => prev.filter((doc) => doc.id !== docId));
      toast.success('Document removed');
    } catch {
      toast.error('Failed to remove document');
    }
  }, [employeeId]);

  const closeAddForm = useCallback(() => {
    setShowAddForm(false);
    resetDraft();
  }, [resetDraft]);

  return {
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
  };
}
