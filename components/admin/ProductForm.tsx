'use client';

import { fetchAPI } from '@/lib/api';
import { Bold, Code, Eye, HelpCircle, Italic, Link as LinkIcon, List, ListOrdered, Loader2, MessageSquare, Plus, Quote, Save, Star, Type, Underline, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import LucideIcon from '../LucideIcon';
import IconPicker from './IconPicker';

interface ProductFormProps {
  initialData?: any;
  isEdit?: boolean;
}

export default function ProductForm({ initialData, isEdit }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const [iconPickerConfig, setIconPickerConfig] = useState<{
    type: 'hero' | 'benefit';
    index: number;
    value: string;
  } | null>(null);
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    slug: initialData?.slug || '',
    shortDescription: initialData?.shortDescription || '',
    description: initialData?.description || '',
    price: initialData?.price || 0,
    discountAmount: initialData?.discountAmount || 0,
    stock: initialData?.stock || 0,
    images: initialData?.images?.join(',') || '',
    features: initialData?.features?.join(',') || '',
    tagline: initialData?.tagline || '',
    socialProof: {
      noun: initialData?.socialProof?.noun || 'customers',
      count: initialData?.socialProof?.count || 2000,
      rating: initialData?.socialProof?.rating || 5,
      avatars: initialData?.socialProof?.avatars?.join(',') || ''
    },
    heroHighlights: initialData?.heroHighlights || [],
    keyBenefits: initialData?.keyBenefits || [],
    specifications: initialData?.specifications || [],
    videoUrl: initialData?.videoUrl || '',
    releaseBadgeText: initialData?.releaseBadgeText || 'New Release 2024',
    sections: {
      techSpecs: {
        heading: initialData?.sections?.techSpecs?.heading || 'Technical Specifications',
        subheading: initialData?.sections?.techSpecs?.subheading || 'Engineered for Perfection',
        description: initialData?.sections?.techSpecs?.description || 'Every component has been meticulously designed to deliver an unparalleled experience.',
      },
      features: {
        heading: initialData?.sections?.features?.heading || 'Features',
        subheading: initialData?.sections?.features?.subheading || 'Why Choose Us?',
        description: initialData?.sections?.features?.description || 'Packed with premium features to elevate your experience to new heights.',
      }
    },
    reviewSectionType: initialData?.reviewSectionType || 'testimonials',
    faqs: initialData?.faqs || []
  });

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  const applyFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      setFormData({ ...formData, description: editorRef.current.innerHTML });
    }
  };

  const handleEditorChange = () => {
    if (editorRef.current) {
      setFormData({ ...formData, description: editorRef.current.innerHTML });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
      slug: formData.slug || generateSlug(formData.name),
      shortDescription: formData.shortDescription,
      images: formData.images.split(',').map((s: string) => s.trim()).filter(Boolean),
      features: formData.features.split(',').map((s: string) => s.trim()).filter(Boolean),
      tagline: formData.tagline || undefined,
      socialProof: {
        ...formData.socialProof,
        avatars: formData.socialProof.avatars.split(',').map((s: string) => s.trim()).filter(Boolean)
      },
      heroHighlights: formData.heroHighlights,
      keyBenefits: formData.keyBenefits,
      specifications: formData.specifications,
      videoUrl: formData.videoUrl,
      releaseBadgeText: formData.releaseBadgeText,
      discountAmount: formData.discountAmount,
      sections: formData.sections,
      reviewSectionType: formData.reviewSectionType,
      faqs: formData.faqs,
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
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Short Description</label>
          <textarea
            value={formData.shortDescription}
            onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all resize-none"
            rows={2}
            placeholder="Brief overview of the product..."
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              <Eye className="w-3 h-3" />
              {showPreview ? 'Edit' : 'Preview'}
            </button>
          </div>

          {!showPreview ? (
            <>
              {/* Formatting Toolbar */}
              <div className="flex flex-wrap gap-1 p-2 bg-slate-100 dark:bg-slate-700 rounded-t-xl border border-slate-200 dark:border-slate-600">
                <button
                  type="button"
                  onClick={() => applyFormat('bold')}
                  className="p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors"
                  title="Bold"
                >
                  <Bold className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                </button>
                <button
                  type="button"
                  onClick={() => applyFormat('italic')}
                  className="p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors"
                  title="Italic"
                >
                  <Italic className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                </button>
                <button
                  type="button"
                  onClick={() => applyFormat('underline')}
                  className="p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors"
                  title="Underline"
                >
                  <Underline className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                </button>
                <div className="w-px bg-slate-300 dark:bg-slate-600 mx-1"></div>
                <button
                  type="button"
                  onClick={() => applyFormat('formatBlock', '<h2>')}
                  className="p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors"
                  title="Heading"
                >
                  <Type className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                </button>
                <div className="w-px bg-slate-300 dark:bg-slate-600 mx-1"></div>
                <button
                  type="button"
                  onClick={() => applyFormat('insertUnorderedList')}
                  className="p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors"
                  title="Bullet List"
                >
                  <List className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                </button>
                <button
                  type="button"
                  onClick={() => applyFormat('insertOrderedList')}
                  className="p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors"
                  title="Numbered List"
                >
                  <ListOrdered className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                </button>
                <div className="w-px bg-slate-300 dark:bg-slate-600 mx-1"></div>
                <button
                  type="button"
                  onClick={() => {
                    const url = prompt('Enter URL:');
                    if (url) applyFormat('createLink', url);
                  }}
                  className="p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors"
                  title="Insert Link"
                >
                  <LinkIcon className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                </button>
                <button
                  type="button"
                  onClick={() => applyFormat('formatBlock', '<pre>')}
                  className="p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors"
                  title="Code Block"
                >
                  <Code className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                </button>
              </div>

              {/* Rich Text Editor */}
              <div
                ref={editorRef}
                contentEditable
                onInput={handleEditorChange}
                dangerouslySetInnerHTML={{ __html: formData.description }}
                className="w-full min-h-[200px] px-4 py-3 rounded-b-xl border border-t-0 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all prose prose-sm dark:prose-invert max-w-none"
                style={{ whiteSpace: 'pre-wrap' }}
              />
            </>
          ) : (
            /* Preview Mode */
            <div className="w-full min-h-[200px] px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 prose prose-sm dark:prose-invert max-w-none">
              <div dangerouslySetInnerHTML={{ __html: formData.description }} />
            </div>
          )}
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

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Features (Comma separated)</label>
          <input
            type="text"
            required
            value={formData.features}
            onChange={(e) => setFormData({ ...formData, features: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
            placeholder="Bluetooth 5.0, Noise Cancellation"
          />
        </div>

        {/* New Customization Fields */}
        <div className="border-t border-slate-200 dark:border-slate-700 pt-6 mt-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Landing Page Customization</h3>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Tagline (Optional)
              </label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                placeholder="e.g., Transcends, Innovates, Perfects"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Appears below product name in hero section</p>
            </div>

            <div>
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
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Choose whether to show static testimonials or actual customer reviews for this product.</p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
              <h4 className="font-medium text-slate-900 dark:text-white">Social Proof Settings</h4>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Noun (e.g. customers)
                  </label>
                  <input
                    type="text"
                    value={formData.socialProof.noun}
                    onChange={(e) => setFormData({
                      ...formData,
                      socialProof: { ...formData.socialProof, noun: e.target.value }
                    })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Count (e.g. 2000)
                  </label>
                  <input
                    type="number"
                    value={formData.socialProof.count}
                    onChange={(e) => setFormData({
                      ...formData,
                      socialProof: { ...formData.socialProof, count: Number(e.target.value) }
                    })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Rating (0-5)
                </label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={formData.socialProof.rating}
                  onChange={(e) => setFormData({
                    ...formData,
                    socialProof: { ...formData.socialProof, rating: Number(e.target.value) }
                  })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Avatar URLs (Comma separated)
                </label>
                <textarea
                  value={formData.socialProof.avatars}
                  onChange={(e) => setFormData({
                    ...formData,
                    socialProof: { ...formData.socialProof, avatars: e.target.value }
                  })}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm resize-none"
                  placeholder="https://example.com/avatar1.jpg, https://example.com/avatar2.jpg"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Hero Highlights (Floating Cards)
              </label>
              <div className="space-y-3">
                {formData.heroHighlights.map((highlight: any, index: number) => (
                  <div key={index} className="flex gap-2 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 items-end">
                    <div className="flex-1 space-y-1">
                      <label className="text-[10px] font-bold uppercase text-slate-400">Icon</label>
                      <button
                        type="button"
                        onClick={() => setIconPickerConfig({
                          type: 'hero',
                          index,
                          value: highlight.icon
                        })}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm hover:border-brand-500 transition-colors"
                      >
                        <span className="flex items-center gap-2 truncate">
                          <LucideIcon name={highlight.icon} className="w-4 h-4" />
                          {highlight.icon}
                        </span>
                      </button>
                    </div>
                    <div className="flex-[2] space-y-1">
                      <label className="text-[10px] font-bold uppercase text-slate-400">Label</label>
                      <input
                        type="text"
                        value={highlight.label}
                        onChange={(e) => {
                          const newHighlights = [...formData.heroHighlights];
                          newHighlights[index].label = e.target.value;
                          setFormData({ ...formData, heroHighlights: newHighlights });
                        }}
                        placeholder="Label (e.g., Battery Life)"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                      />
                    </div>
                    <div className="flex-[2] space-y-1">
                      <label className="text-[10px] font-bold uppercase text-slate-400">Value</label>
                      <input
                        type="text"
                        value={highlight.value}
                        onChange={(e) => {
                          const newHighlights = [...formData.heroHighlights];
                          newHighlights[index].value = e.target.value;
                          setFormData({ ...formData, heroHighlights: newHighlights });
                        }}
                        placeholder="Value (e.g., 40+ Hours)"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                      />
                    </div>
                    <div className="flex-1 space-y-1">
                      <label className="text-[10px] font-bold uppercase text-slate-400">Color</label>
                      <select
                        value={highlight.color}
                        onChange={(e) => {
                          const newHighlights = [...formData.heroHighlights];
                          newHighlights[index].color = e.target.value;
                          setFormData({ ...formData, heroHighlights: newHighlights });
                        }}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                      >
                        <option value="green">Green</option>
                        <option value="blue">Blue</option>
                        <option value="purple">Purple</option>
                        <option value="orange">Orange</option>
                        <option value="red">Red</option>
                        <option value="brand">Brand</option>
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newHighlights = formData.heroHighlights.filter((_: any, i: number) => i !== index);
                        setFormData({ ...formData, heroHighlights: newHighlights });
                      }}
                      className="p-2.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      heroHighlights: [
                        ...formData.heroHighlights,
                        { icon: 'check', label: '', value: '', color: 'blue' }
                      ]
                    });
                  }}
                  className="w-full px-4 py-3 border-2 border-dashed border-slate-200 dark:border-slate-700/50 rounded-xl text-slate-500 dark:text-slate-400 hover:border-brand-500 hover:text-brand-600 transition-all font-semibold text-sm"
                >
                  + Add New Highlight Card
                </button>
              </div>
            </div>

            {/* Key Benefits */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Key Benefits (Interactive Grid)
              </label>
              <div className="space-y-3">
                {formData.keyBenefits.map((benefit: any, index: number) => (
                  <div key={index} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
                    <div className="flex gap-4 items-end">
                      <div className="w-1/4 space-y-1">
                        <label className="text-[10px] font-bold uppercase text-slate-400">Icon</label>
                        <button
                          type="button"
                          onClick={() => setIconPickerConfig({
                            type: 'benefit',
                            index,
                            value: benefit.icon
                          })}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm hover:border-brand-500 transition-colors"
                        >
                          <span className="flex items-center gap-2 truncate">
                            <LucideIcon name={benefit.icon} className="w-4 h-4" />
                            {benefit.icon}
                          </span>
                        </button>
                      </div>
                      <div className="w-1/4 space-y-1">
                        <label className="text-[10px] font-bold uppercase text-slate-400">Color</label>
                        <select
                          value={benefit.color}
                          onChange={(e) => {
                            const newBenefits = [...formData.keyBenefits];
                            newBenefits[index].color = e.target.value;
                            setFormData({ ...formData, keyBenefits: newBenefits });
                          }}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                        >
                          <option value="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">Blue</option>
                          <option value="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400">Yellow</option>
                          <option value="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">Purple</option>
                          <option value="bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400">Pink</option>
                          <option value="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">Green</option>
                          <option value="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">Orange</option>
                        </select>
                      </div>
                      <div className="flex-1 space-y-1">
                        <label className="text-[10px] font-bold uppercase text-slate-400">Benefit Title</label>
                        <input
                          type="text"
                          value={benefit.title}
                          onChange={(e) => {
                            const newBenefits = [...formData.keyBenefits];
                            newBenefits[index].title = e.target.value;
                            setFormData({ ...formData, keyBenefits: newBenefits });
                          }}
                          placeholder="Title (e.g., 40H Battery)"
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const newBenefits = formData.keyBenefits.filter((_: any, i: number) => i !== index);
                          setFormData({ ...formData, keyBenefits: newBenefits });
                        }}
                        className="p-2.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-slate-400">Detailed Description</label>
                      <textarea
                        value={benefit.description}
                        onChange={(e) => {
                          const newBenefits = [...formData.keyBenefits];
                          newBenefits[index].description = e.target.value;
                          setFormData({ ...formData, keyBenefits: newBenefits });
                        }}
                        placeholder="Description (e.g., Non-stop music with quick charge support)"
                        rows={2}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm resize-none"
                      />
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      keyBenefits: [
                        ...formData.keyBenefits,
                        { icon: 'star', title: '', description: '', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' }
                      ]
                    });
                  }}
                  className="w-full px-4 py-3 border-2 border-dashed border-slate-200 dark:border-slate-700/50 rounded-xl text-slate-500 dark:text-slate-400 hover:border-brand-500 hover:text-brand-600 transition-all font-semibold text-sm"
                >
                  + Add Benefit Card
                </button>
              </div>
            </div>

            {/* FAQs Section */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-slate-400" /> Product FAQs
              </label>
              <div className="space-y-4">
                {formData.faqs.map((faq: any, index: number) => (
                  <div key={index} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-bold uppercase text-slate-400">FAQ #{index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => {
                          const newFaqs = formData.faqs.filter((_: any, i: number) => i !== index);
                          setFormData({ ...formData, faqs: newFaqs });
                        }}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={faq.question}
                        onChange={(e) => {
                          const newFaqs = [...formData.faqs];
                          newFaqs[index].question = e.target.value;
                          setFormData({ ...formData, faqs: newFaqs });
                        }}
                        placeholder="Question (e.g., Is it waterproof?)"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                      />
                      <textarea
                        value={faq.answer}
                        onChange={(e) => {
                          const newFaqs = [...formData.faqs];
                          newFaqs[index].answer = e.target.value;
                          setFormData({ ...formData, faqs: newFaqs });
                        }}
                        placeholder="Answer"
                        rows={2}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm resize-none"
                      />
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-slate-500">Order:</label>
                        <input
                          type="number"
                          value={faq.order || 0}
                          onChange={(e) => {
                            const newFaqs = [...formData.faqs];
                            newFaqs[index].order = Number(e.target.value);
                            setFormData({ ...formData, faqs: newFaqs });
                          }}
                          className="w-16 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      faqs: [
                        ...formData.faqs,
                        { question: '', answer: '', order: formData.faqs.length }
                      ]
                    });
                  }}
                  className="w-full px-4 py-3 border-2 border-dashed border-slate-200 dark:border-slate-700/50 rounded-xl text-slate-500 dark:text-slate-400 hover:border-brand-500 hover:text-brand-600 transition-all font-semibold text-sm flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Add Product FAQ
                </button>
              </div>
            </div>

            {/* Technical Specifications */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Specifications (Table)
              </label>
              <div className="space-y-3">
                {formData.specifications.map((spec: any, index: number) => (
                  <div key={index} className="flex gap-2 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                    <input
                      type="text"
                      value={spec.label}
                      onChange={(e) => {
                        const newSpecs = [...formData.specifications];
                        newSpecs[index].label = e.target.value;
                        setFormData({ ...formData, specifications: newSpecs });
                      }}
                      placeholder="Label (e.g., Volume, Origin)"
                      className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                    />
                    <input
                      type="text"
                      value={spec.value}
                      onChange={(e) => {
                        const newSpecs = [...formData.specifications];
                        newSpecs[index].value = e.target.value;
                        setFormData({ ...formData, specifications: newSpecs });
                      }}
                      placeholder="Value (e.g., 1 Liter, Italy)"
                      className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newSpecs = formData.specifications.filter((_: any, i: number) => i !== index);
                        setFormData({ ...formData, specifications: newSpecs });
                      }}
                      className="px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors text-sm font-medium"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      specifications: [
                        ...formData.specifications,
                        { label: '', value: '' }
                      ]
                    });
                  }}
                  className="w-full px-4 py-2 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-400 hover:border-brand-500 hover:text-brand-600 dark:hover:text-brand-400 transition-colors text-sm font-medium"
                >
                  + Add Specification
                </button>
              </div>
            </div>

            {/* Section Content Customization */}
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Section Content & Labels</h3>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Hero Badge Text
                  </label>
                  <input
                    type="text"
                    value={formData.releaseBadgeText}
                    onChange={(e) => setFormData({ ...formData, releaseBadgeText: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Product Video URL (YouTube/Vimeo/MP4)
                  </label>
                  <input
                    type="url"
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Tech Specs Section */}
                  <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                    <h4 className="font-medium text-slate-900 dark:text-white">Technical Specs Section</h4>
                    <input
                      type="text"
                      value={formData.sections.techSpecs.heading}
                      onChange={(e) => setFormData({
                        ...formData,
                        sections: { ...formData.sections, techSpecs: { ...formData.sections.techSpecs, heading: e.target.value } }
                      })}
                      placeholder="Heading"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                    />
                    <input
                      type="text"
                      value={formData.sections.techSpecs.subheading}
                      onChange={(e) => setFormData({
                        ...formData,
                        sections: { ...formData.sections, techSpecs: { ...formData.sections.techSpecs, subheading: e.target.value } }
                      })}
                      placeholder="Subheading"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                    />
                    <textarea
                      value={formData.sections.techSpecs.description}
                      onChange={(e) => setFormData({
                        ...formData,
                        sections: { ...formData.sections, techSpecs: { ...formData.sections.techSpecs, description: e.target.value } }
                      })}
                      placeholder="Description"
                      rows={2}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm resize-none"
                    />
                  </div>

                  {/* Features Section */}
                  <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                    <h4 className="font-medium text-slate-900 dark:text-white">Features Section</h4>
                    <input
                      type="text"
                      value={formData.sections.features.heading}
                      onChange={(e) => setFormData({
                        ...formData,
                        sections: { ...formData.sections, features: { ...formData.sections.features, heading: e.target.value } }
                      })}
                      placeholder="Heading"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                    />
                    <input
                      type="text"
                      value={formData.sections.features.subheading}
                      onChange={(e) => setFormData({
                        ...formData,
                        sections: { ...formData.sections, features: { ...formData.sections.features, subheading: e.target.value } }
                      })}
                      placeholder="Subheading"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                    />
                    <textarea
                      value={formData.sections.features.description}
                      onChange={(e) => setFormData({
                        ...formData,
                        sections: { ...formData.sections, features: { ...formData.sections.features, description: e.target.value } }
                      })}
                      placeholder="Description"
                      rows={2}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-brand-500/25 flex items-center gap-2 disabled:opacity-70"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Save Product</>}
          </button>
        </div>
      </div>

      <IconPicker
        isOpen={!!iconPickerConfig}
        value={iconPickerConfig?.value || ''}
        onClose={() => setIconPickerConfig(null)}
        onChange={(iconName) => {
          if (!iconPickerConfig) return;
          if (iconPickerConfig.type === 'hero') {
            const newHighlights = [...formData.heroHighlights];
            newHighlights[iconPickerConfig.index].icon = iconName;
            setFormData({ ...formData, heroHighlights: newHighlights });
          } else {
            const newBenefits = [...formData.keyBenefits];
            newBenefits[iconPickerConfig.index].icon = iconName;
            setFormData({ ...formData, keyBenefits: newBenefits });
          }
        }}
      />
    </form>
  );
}

