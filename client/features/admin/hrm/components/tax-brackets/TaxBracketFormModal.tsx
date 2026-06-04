'use client';

import { Dispatch, SetStateAction } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import Modal from '@/components/shared/Modal';
import FormField, { fieldControlClass } from '@/components/shared/FormField';
import { TaxBracketFormData } from '../../hooks/useTaxBrackets';

type TaxBracketField = {
  label: string;
  key: keyof TaxBracketFormData;
  step?: string;
  placeholder?: string;
};

const TAX_BRACKET_FIELDS: TaxBracketField[] = [
  { label: 'Fiscal Year', key: 'fiscalYear' },
  { label: 'Minimum Amount', key: 'minAmount' },
  { label: 'Maximum Amount', key: 'maxAmount', placeholder: 'Leave empty for no limit' },
  { label: 'Rate (0.10 = 10%)', key: 'rate', step: '0.0001' },
  { label: 'Flat Tax', key: 'flatTax' },
  { label: 'Sort Order', key: 'sortOrder' },
];

interface TaxBracketFormModalProps {
  open: boolean;
  onClose: () => void;
  formData: TaxBracketFormData;
  setFormData: Dispatch<SetStateAction<TaxBracketFormData>>;
  submitting: boolean;
  onSubmit: () => void;
}

export default function TaxBracketFormModal({
  open,
  onClose,
  formData,
  setFormData,
  submitting,
  onSubmit,
}: TaxBracketFormModalProps) {
  const invalidRate = formData.rate < 0 || formData.rate > 1;
  const invalidMinimum = formData.minAmount < 0;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={<>Add <span className="text-indigo-600">Tax Bracket</span></>}
      maxWidthClassName="max-w-xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {TAX_BRACKET_FIELDS.map(({ label, key, step, placeholder }) => (
          <FormField
            key={key}
            label={label}
            hint={key === 'rate' && invalidRate ? (
              <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wider ml-1">
                Must be between 0 and 1 (e.g., 0.10 for 10%)
              </p>
            ) : undefined}
          >
            <input
              type="number"
              step={step || '1'}
              value={formData[key] as number | string}
              onChange={(e) => setFormData((prev) => ({
                ...prev,
                [key]: key === 'maxAmount' ? e.target.value : Number(e.target.value),
              }))}
              placeholder={placeholder}
              className={fieldControlClass}
            />
          </FormField>
        ))}
      </div>

      <button
        onClick={onSubmit}
        disabled={submitting || invalidRate || invalidMinimum}
        className="w-full mt-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
        Save Tax Bracket
      </button>
    </Modal>
  );
}
