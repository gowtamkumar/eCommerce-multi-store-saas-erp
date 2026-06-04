'use client';

import { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { fetchAPI } from '@/services/api';
import {
  ContractType,
  Employee,
  EmployeeFormData,
  EmployeeSalaryLine,
  EmployeeStatus,
  EmployeeSubmitPayload,
} from '../types/employee';

const todayIsoDate = () => new Date().toISOString().split('T')[0];

const blankFormData = (): EmployeeFormData => ({
  userId: '',
  departmentId: '',
  designationId: '',
  managerId: '',
  branchId: '',
  status: EmployeeStatus.ACTIVE,
  contractType: ContractType.FULL_TIME,
  joiningDate: todayIsoDate(),
  exitDate: '',
  salaryConfig: { basicSalary: 0, allowances: [], deductions: [] },
  personalDetails: {
    gender: 'MALE',
    bloodGroup: 'A+',
    nationalId: '',
    passportNo: '',
    address: '',
    dob: '',
    emergencyContact: { name: '', relationship: '', phone: '' },
  },
  documents: [],
});

const formDataFromEmployee = (employee: Employee): EmployeeFormData => ({
  userId: employee.userId || '',
  departmentId: employee.departmentId || '',
  designationId: employee.designationId || '',
  managerId: employee.managerId || '',
  branchId: employee.branchId || '',
  status: employee.status || EmployeeStatus.ACTIVE,
  contractType: employee.contractType || ContractType.FULL_TIME,
  joiningDate: typeof employee.joiningDate === 'string'
    ? employee.joiningDate.split('T')[0]
    : todayIsoDate(),
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

interface UseEmployeeFormWizardArgs {
  employee?: Employee | null;
  isOpen: boolean;
  onSubmit: (data: EmployeeSubmitPayload) => void;
}

export function useEmployeeFormWizard({ employee, isOpen, onSubmit }: UseEmployeeFormWizardArgs) {
  const [activeStep, setActiveStep] = useState(1);
  const [formData, setFormData] = useState<EmployeeFormData>(() => blankFormData());
  const [newDocType, setNewDocType] = useState('');
  const [newDocUrl, setNewDocUrl] = useState('');
  const [newDocExpiry, setNewDocExpiry] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setActiveStep(1);
    setNewDocType('');
    setNewDocUrl('');
    setNewDocExpiry('');
    setFormData(employee ? formDataFromEmployee(employee) : blankFormData());
  }, [employee, isOpen]);

  const setField = useCallback(<K extends keyof EmployeeFormData>(field: K, value: EmployeeFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const setPersonalDetail = useCallback((field: keyof EmployeeFormData['personalDetails'], value: string) => {
    setFormData((prev) => ({
      ...prev,
      personalDetails: { ...prev.personalDetails, [field]: value },
    }));
  }, []);

  const setEmergencyContact = useCallback((
    field: keyof EmployeeFormData['personalDetails']['emergencyContact'],
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      personalDetails: {
        ...prev.personalDetails,
        emergencyContact: { ...prev.personalDetails.emergencyContact, [field]: value },
      },
    }));
  }, []);

  const setSalaryConfig = useCallback(<K extends keyof EmployeeFormData['salaryConfig']>(
    field: K,
    value: EmployeeFormData['salaryConfig'][K],
  ) => {
    setFormData((prev) => ({
      ...prev,
      salaryConfig: { ...prev.salaryConfig, [field]: value },
    }));
  }, []);

  const addAllowance = useCallback(() => {
    setSalaryConfig('allowances', [...(formData.salaryConfig.allowances || []), { type: '', amount: 0 }]);
  }, [formData.salaryConfig.allowances, setSalaryConfig]);

  const removeAllowance = useCallback((index: number) => {
    const allowances = [...formData.salaryConfig.allowances];
    allowances.splice(index, 1);
    setSalaryConfig('allowances', allowances);
  }, [formData.salaryConfig.allowances, setSalaryConfig]);

  const changeAllowance = useCallback((index: number, field: keyof EmployeeSalaryLine, value: string | number) => {
    const allowances = [...formData.salaryConfig.allowances];
    allowances[index] = { ...allowances[index], [field]: value };
    setSalaryConfig('allowances', allowances);
  }, [formData.salaryConfig.allowances, setSalaryConfig]);

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

  const addLocalDocument = useCallback(() => {
    if (!newDocType || !newDocUrl) {
      toast.error('Please choose a document type and upload/link a file first');
      return;
    }

    setFormData((prev) => ({
      ...prev,
      documents: [
        ...(prev.documents || []),
        {
          documentType: newDocType,
          fileUrl: newDocUrl,
          expiryDate: newDocExpiry || undefined,
        },
      ],
    }));
    setNewDocType('');
    setNewDocUrl('');
    setNewDocExpiry('');
  }, [newDocExpiry, newDocType, newDocUrl]);

  const removeLocalDocument = useCallback((index: number) => {
    setFormData((prev) => {
      const documents = [...(prev.documents || [])];
      documents.splice(index, 1);
      return { ...prev, documents };
    });
  }, []);

  const handleSubmit = useCallback(() => {
    const payload: EmployeeSubmitPayload = {
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

    Object.keys(payload).forEach((key) => {
      const typedKey = key as keyof EmployeeSubmitPayload;
      if (payload[typedKey] === '' || payload[typedKey] === undefined) {
        delete payload[typedKey];
      }
    });

    onSubmit(payload);
  }, [formData, onSubmit]);

  const progressPercent = useMemo(() => (activeStep / 6) * 100, [activeStep]);

  return {
    activeStep,
    setActiveStep,
    formData,
    newDocType,
    setNewDocType,
    newDocUrl,
    setNewDocUrl,
    newDocExpiry,
    setNewDocExpiry,
    uploadingFile,
    progressPercent,
    setField,
    setPersonalDetail,
    setEmergencyContact,
    setSalaryConfig,
    addAllowance,
    removeAllowance,
    changeAllowance,
    handleFileUpload,
    addLocalDocument,
    removeLocalDocument,
    handleSubmit,
  };
}
