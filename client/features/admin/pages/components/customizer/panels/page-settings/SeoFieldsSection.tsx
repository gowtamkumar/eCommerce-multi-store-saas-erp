import ImageUploadField from '@/components/shared/ImageUploadField';
import { fetchAPI } from '@/services/api';
import type { PageData } from '@/types/customizer';
import { Search } from 'lucide-react';
import DebouncedInput from '../DebouncedInput';
import SectionHeading from './SectionHeading';

interface SeoFieldsSectionProps {
  data: PageData;
  onChange: (key: keyof PageData, value: unknown) => void;
}

const INPUT_CLASS =
  'w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-brand-500 outline-none transition-all';

/**
 * Meta title, meta description, and OG image — the fields that drive the
 * SEO score card and the social/search preview. The optimal-length hints
 * are deliberately permissive (informational, not blocking).
 */
export default function SeoFieldsSection({ data, onChange }: SeoFieldsSectionProps) {
  return (
    <section className="space-y-4">
      <SectionHeading icon={Search} label="Search Engine Optimization" />

      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase">Meta Title</label>
          <DebouncedInput
            type="text"
            value={data.metaTitle || ''}
            onChange={(val) => onChange('metaTitle', val)}
            className={INPUT_CLASS}
            placeholder="Google search title"
          />
          <p className="text-[9px] text-slate-400">
            Optimal: 50-60 characters. Current: {data.metaTitle?.length || 0}
          </p>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase">Meta Description</label>
          <DebouncedInput
            as="textarea"
            value={data.metaDescription || ''}
            onChange={(val) => onChange('metaDescription', val)}
            className={`${INPUT_CLASS} min-h-[100px]`}
            placeholder="What this page is about..."
          />
          <p className="text-[9px] text-slate-400">
            Optimal: 150-160 characters. Current: {data.metaDescription?.length || 0}
          </p>
        </div>

        <div>
          <ImageUploadField
            label="OG Image"
            value={data.ogImage || ''}
            onChange={(val) => onChange('ogImage', val)}
            uploadApi={fetchAPI}
            aspectRatio="wide"
            showUrlInput={true}
            description="Upload page social image or paste URL"
          />
        </div>
      </div>
    </section>
  );
}
