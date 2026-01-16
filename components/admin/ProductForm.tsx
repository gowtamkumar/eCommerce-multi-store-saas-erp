'use client';

import { fetchAPI } from '@/lib/api';
import { Bold, Code, Eye, HelpCircle, Italic, Link as LinkIcon, List, ListOrdered, Loader2, MessageSquare, Plus, Quote, Save, Star, Type, Underline, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import LucideIcon from '../LucideIcon';
import IconPicker from './IconPicker';
import ProductBuilder from './builder/ProductBuilder';
import { Section } from './builder/types';
import { generateId } from './builder/utils';

interface ProductFormProps {
  initialData?: any;
  isEdit?: boolean;
}

const migrateSections = (initialData: any): Section[] => {
  if (initialData?.sections && Array.isArray(initialData.sections) && initialData.sections.length > 0) {
    return initialData.sections;
  }

  // Auto-Migration: Convert legacy fields to sections if no sections exist
  const migrated: Section[] = [];

  // 1. Hero Configuration
  if (initialData?.tagline || initialData?.releaseBadgeText || (initialData?.heroHighlights && initialData.heroHighlights.length > 0)) {
    migrated.push({
      id: generateId(),
      type: 'hero',
      content: {
        tagline: initialData.tagline,
        badgeText: initialData.releaseBadgeText,
        highlights: initialData.heroHighlights || []
      },
      order: migrated.length
    });
  }

  // 2. Description
  if (initialData?.description) {
    migrated.push({
      id: generateId(),
      type: 'description',
      content: { html: initialData.description },
      order: migrated.length
    });
  }

  // 3. Benefits
  if (initialData?.keyBenefits && initialData.keyBenefits.length > 0) {
    migrated.push({
      id: generateId(),
      type: 'benefits',
      content: { heading: 'Key Benefits', items: initialData.keyBenefits },
      order: migrated.length
    });
  }

  // 4. Tech Specs
  if (initialData?.specifications && initialData.specifications.length > 0) {
    migrated.push({
      id: generateId(),
      type: 'techSpecs',
      content: {
        heading: 'Specifications',
        items: initialData.specifications
      },
      order: migrated.length
    });
  }

  // 5. Features
  if (initialData?.features) {
    // Only if text features exist
    // Note: Old 'features' was comma-separated string, converting to simple bullets if possible or separate section
  }

  // 6. Social Proof
  if (initialData?.socialProof) {
    migrated.push({
      id: generateId(),
      type: 'socialProof',
      content: initialData.socialProof,
      order: migrated.length
    });
  }

  // 7. FAQs
  if (initialData?.faqs && initialData.faqs.length > 0) {
    migrated.push({
      id: generateId(),
      type: 'faq',
      content: { title: 'Frequently Asked Questions', items: initialData.faqs },
      order: migrated.length
    });
  }

  return migrated;
};

export default function ProductForm({ initialData, isEdit }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    slug: initialData?.slug || '',
    shortDescription: initialData?.shortDescription || '',
    price: initialData?.price || 0,
    discountAmount: initialData?.discountAmount || 0,
    stock: initialData?.stock || 0,
    images: initialData?.images?.join(',') || '',
    sections: migrateSections(initialData),
    reviewSectionType: initialData?.reviewSectionType || 'testimonials',
  });

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
      price: +formData.price,
      discountAmount: +formData.discountAmount,
      stock: +formData.stock,
      slug: formData.slug || generateSlug(formData.name),
      shortDescription: formData.shortDescription,
      images: formData.images.split(',').map((s: string) => s.trim()).filter(Boolean),
      sections: formData.sections,
      reviewSectionType: formData.reviewSectionType,
    };

    console.log("payload", payload);

    try {
      const url = isEdit ? `/products/${initialData.id}` : '/products';
      const method = isEdit ? 'PUT' : 'POST';

      await fetchAPI(url, {
        method,
        body: JSON.stringify(payload),
      });

      router.push('/admin/products');
      router.refresh();
      toast.success('Product saved successfully');
    } catch (error) {
      toast.error('Error saving product');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-8 max-w-4xl">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Product Name</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => {
              const name = e.target.value;
              if (!isEdit) {
                setFormData({ ...formData, name, slug: generateSlug(name) });
              } else {
                setFormData({ ...formData, name });
              }
            }}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Slug (URL Friendly Name)</label>
          <input
            type="text"
            required
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: generateSlug(e.target.value) })}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all font-mono text-sm overflow-hidden text-ellipsis whitespace-nowrap"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Short Description (SEO / Listings)</label>
          <textarea
            value={formData.shortDescription}
            onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all resize-none"
            rows={2}
            placeholder="Brief overview of the product..."
          />
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Price</label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Discount Amount</label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={formData.discountAmount}
              onChange={(e) => setFormData({ ...formData, discountAmount: Number(e.target.value) })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Stock</label>
            <input
              type="number"
              required
              min="0"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Images (Comma separated URLs)</label>
          <input
            type="text"
            required
            value={formData.images}
            onChange={(e) => setFormData({ ...formData, images: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
            placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
          />
        </div>

        {/* Page Builder */}
        <div className="border-t border-slate-200 dark:border-slate-700 pt-6 mt-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Page Content</h3>
          <p className="text-sm text-slate-500 mb-6">Drag and drop sections to build your product page layout.</p>

          <ProductBuilder
            sections={formData.sections}
            onChange={(newSections) => setFormData({ ...formData, sections: newSections })}
          />
        </div>

        {/* Review Section Toggle */}
        <div className="border-t border-slate-200 dark:border-slate-700 pt-6 mt-6">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-slate-400" /> Review Section Mode
          </label>
          <div className="flex gap-4">
            <label className="flex-1 cursor-pointer group">
              <input
                type="radio"
                name="reviewSectionType"
                value="testimonials"
                checked={formData.reviewSectionType === 'testimonials'}
                onChange={() => setFormData({ ...formData, reviewSectionType: 'testimonials' })}
                className="sr-only"
              />
              <div className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${formData.reviewSectionType === 'testimonials'
                ? 'bg-brand-50 dark:bg-brand-900/20 border-brand-500 text-brand-600'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-brand-200'
                }`}>
                <Quote className="w-5 h-5" />
                <span className="font-semibold text-sm">Testimonials</span>
              </div>
            </label>
            <label className="flex-1 cursor-pointer group">
              <input
                type="radio"
                name="reviewSectionType"
                value="reviews"
                checked={formData.reviewSectionType === 'reviews'}
                onChange={() => setFormData({ ...formData, reviewSectionType: 'reviews' })}
                className="sr-only"
              />
              <div className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${formData.reviewSectionType === 'reviews'
                ? 'bg-brand-50 dark:bg-brand-900/20 border-brand-500 text-brand-600'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-brand-200'
                }`}>
                <Star className="w-5 h-5" />
                <span className="font-semibold text-sm">Product Reviews</span>
              </div>
            </label>
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-700 pt-6 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-brand-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Product
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
