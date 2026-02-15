'use client';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

interface ImageUploadFieldProps {
  label: string;
  value?: string;
  onChange: (val: string) => void;
  onUploadSuccess?: (data: any) => void;
  uploadApi?: (endpoint: string, options: any) => Promise<any>;
  endpoint?: string;
  loadingMsg?: string;
  successMsg?: string;
  errorMsg?: string;
  aspectRatio?: 'square' | 'wide' | 'none';
  description?: string;
  showUrlInput?: boolean;
  className?: string;
  variant?: 'field' | 'button'; // 'field' is the full box, 'button' is just the trigger
}

export default function ImageUploadField({
  label,
  value,
  onChange,
  onUploadSuccess,
  uploadApi,
  endpoint = '/admin/media',
  loadingMsg = 'Uploading...',
  successMsg = 'Uploaded successfully',
  errorMsg = 'Error uploading image',
  aspectRatio = 'square',
  description,
  showUrlInput = true,
  className = '',
  variant = 'field'
}: ImageUploadFieldProps) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const loadingToast = toast.loading(loadingMsg);
    try {
      const formData = new FormData();
      formData.append('file', file);

      if (!uploadApi) {
        // Fallback to a default if not provided, but ideally it should be passed
        throw new Error("Upload API function not provided");
      }

      const res = await uploadApi(endpoint, {
        method: 'POST',
        body: formData,
      });

      if (res.success) {
        const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:3900';
        const fileUrl = res.data?.url || `${backendUrl}/uploads/${res.data?.filename}`;

        if (variant === 'field') {
          onChange(fileUrl);
        }

        if (onUploadSuccess) {
          onUploadSuccess(res.data);
        }

        toast.success(successMsg);
      } else {
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(errorMsg);
    } finally {
      toast.dismiss(loadingToast);
      setUploading(false);
      // Reset input
      e.target.value = '';
    }
  };

  if (variant === 'button') {
    return (
      <div className={className}>
        <input
          type="file"
          id={`file-upload-${label.replace(/\s+/g, '-').toLowerCase()}`}
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
        />
        <label
          htmlFor={`file-upload-${label.replace(/\s+/g, '-').toLowerCase()}`}
          className={`flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-medium cursor-pointer transition-all shadow-lg shadow-brand-500/20 active:scale-95 ${uploading ? 'opacity-70 cursor-wait' : ''
            }`}
        >
          {uploading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Plus className="w-5 h-5" />
          )}
          {uploading ? 'Uploading...' : label}
        </label>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">{label}</label>
      <div className={`flex ${aspectRatio === 'square' ? 'items-center gap-6' : 'flex-col gap-4'}`}>
        {value && aspectRatio !== 'none' && (
          <div className={`relative ${aspectRatio === 'square' ? 'w-24 h-24' : 'w-full h-48'} rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-50 dark:bg-slate-900/50 flex items-center justify-center group`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt={label}
              className={`max-w-full max-h-full ${aspectRatio === 'square' ? 'object-contain' : 'object-cover w-full h-full'}`}
            />
            <button
              onClick={() => onChange('')}
              className={`absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors ${aspectRatio === 'wide' ? 'opacity-0 group-hover:opacity-100 shadow-lg' : ''}`}
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        )}

        <div className="flex-1 space-y-3">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl cursor-pointer bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
              {uploading ? <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-2" /> : <Plus className="w-8 h-8 text-slate-400 mb-2" />}
              <p className="text-sm text-slate-500 dark:text-slate-400">
                <span className="font-semibold">{uploading ? 'Uploading...' : 'Click to upload'}</span> {label.toLowerCase()}
              </p>
              {description && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{description}</p>}
            </div>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
              disabled={uploading}
            />
          </label>
          {showUrlInput && (
            <input
              type="text"
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              className="w-full px-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              placeholder={`Or paste external ${label.toLowerCase()} URL...`}
            />
          )}
        </div>
      </div>
    </div>
  );
}
