'use client';

import { fetchAPI } from '@/services/api';
import { Category, ProductAttribute, ProductVariant } from '@/types/product';
import { Image as ImageIcon, Layout, Loader2, MessageSquare, Plus, Save, Star, Tag, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import ProductVariants from './ProductVariants';
import RichEditor from '../../../components/shared/RichEditor';

interface ProductFormProps {
  initialData?: any;
  isEdit?: boolean;
}

export default function ProductForm({ initialData, isEdit }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    slug: initialData?.slug || '',
    description: initialData?.description || '',
    shortDescription: initialData?.shortDescription || '',
    price: initialData?.price?.toString() || '0',
    discountAmount: initialData?.discountAmount?.toString() || '0',
    stock: initialData?.stock?.toString() || '0',
    images: initialData?.images?.join(',') || '',
    status: initialData?.status || 'active',
    categoryId: initialData?.categoryId || initialData?.category?.id || '',
    brandId: initialData?.brandId || initialData?.brand?.id || '',
    isReview: initialData?.isReview,
    attributes: initialData?.attributes || [] as ProductAttribute[],
    variants: initialData?.variants || [] as ProductVariant[],
    faqs: initialData?.faqs || [],
    faqSource: initialData?.faqSource || 'manual',
    faqIds: initialData?.faqIds || [],
  });


  useEffect(() => {
    Promise.all([
      fetchAPI('/categories'),
      fetchAPI('/brands')
    ]).then(([catRes, brandRes]) => {
      if (catRes.success) setCategories(catRes.data);
      if (brandRes.success) setBrands(brandRes.data);
    });
  }, []);

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
      price: parseFloat(formData.price),
      discountAmount: parseFloat(formData.discountAmount),
      stock: parseInt(formData.stock),
      slug: formData.slug || generateSlug(formData.name),
      images: formData.images.split(',').map((s: string) => s.trim()).filter(Boolean),
      categoryId: formData.categoryId || null,
      brandId: formData.brandId || null,
      faqSource: formData.faqSource,
      faqIds: formData.faqSource === 'selection' ? formData.faqIds : [],
      faqs: formData.faqSource === 'manual' ? formData.faqs.map((f: any) => ({
        question: f.question,
        answer: f.answer,
        order: f.order
      })) : [],
      variants: formData.variants.map((v: any) => {
        const p = parseFloat(v.price);
        const s = parseInt(v.stock);
        return {
          ...v,
          price: !isNaN(p) ? p : 0,
          stock: !isNaN(s) ? s : 0,
        };
      }),
    };




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
    <form onSubmit={handleSubmit} className="max-w-[1200px]">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content Column */}
        <div className="flex-1 space-y-8">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-8">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <Layout className="w-5 h-5 text-brand-500" /> General Information
            </h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Product Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Premium Wireless Headphones"
                  value={formData.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    if (!isEdit) {
                      setFormData({ ...formData, name, slug: generateSlug(name) });
                    } else {
                      setFormData({ ...formData, name });
                    }
                  }}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Slug (URL)</label>
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900/50">
                  <span className="text-slate-400 text-sm">/products/</span>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: generateSlug(e.target.value) })}
                    className="flex-1 bg-transparent border-none outline-none text-slate-900 dark:text-white text-sm font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Short Description</label>
                <textarea
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all resize-none"
                  rows={2}
                  placeholder="A brief summary for listings..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Full Description</label>
                <RichEditor
                  content={formData.description}
                  onChange={(content) => setFormData({ ...formData, description: content })}
                  className="bg-white dark:bg-slate-900"
                />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-8">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Inventory & Variants</h3>
            <ProductVariants
              attributes={formData.attributes}
              variants={formData.variants}
              basePrice={parseFloat(formData.price)}
              onChange={(attributes, variants) => setFormData({ ...formData, attributes, variants })}
            />
          </div>

          <ProductFAQs
            faqs={formData.faqs}
            faqSource={formData.faqSource}
            faqIds={formData.faqIds}
            onChange={(faqs, faqSource, faqIds) => setFormData({ ...formData, faqs, faqSource, faqIds })}
          />
        </div>

        {/* Sidebar Column */}
        <div className="w-full lg:w-[350px] space-y-8">
          {/* Status & Category */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                <Layout className="w-4 h-4" /> Visibility
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
              >
                <option value="active">Active (Visible)</option>
                <option value="inactive">Inactive (Hidden)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                <Tag className="w-4 h-4" /> Category
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
              >
                <option value="">No Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                <Tag className="w-4 h-4" /> Brand
              </label>
              <select
                value={formData.brandId}
                onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
              >
                <option value="">No Brand</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 space-y-6">
            <h4 className="font-bold text-slate-900 dark:text-white">Pricing</h4>
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">Base Price</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">Discount Amount</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.discountAmount}
                  onChange={(e) => setFormData({ ...formData, discountAmount: e.target.value })}
                  className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none transition-all font-mono"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">Stock Quantity</label>
              <input
                type="number"
                required
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none transition-all"
              />
            </div>
          </div>

          {/* Images */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
              <ImageIcon className="w-4 h-4" /> Media URLs
            </label>
            <textarea
              required
              value={formData.images}
              onChange={(e) => setFormData({ ...formData, images: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all resize-none text-xs font-mono"
              rows={4}
              placeholder="Comma separated URLs..."
            />
          </div>

          Review Logic - Currently disabled as backend support was removed
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" /> Review Mode
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, isReview: !formData.isReview })}
                className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-2 ${formData.isReview
                  ? 'bg-brand-50 dark:bg-brand-900/20 border-brand-500 text-brand-600'
                  : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-brand-200'
                  }`}
              >
                <Star className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase">Reviews</span>
              </button>
            </div>
          </div>


          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl font-bold transition-all shadow-xl shadow-brand-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            {isEdit ? 'Update Product' : 'Create Product'}
          </button>
        </div>
      </div>
    </form>
  );
}

function ProductFAQs({ faqs, faqSource: initialSource, faqIds: initialFaqIds, onChange }: { faqs: any[], faqSource?: string, faqIds?: string[], onChange: (faqs: any[], faqSource: string, faqIds: string[]) => void }) {
  const [source, setSource] = useState<string>(initialSource || 'manual');
  const [faqIds, setFaqIds] = useState<string[]>(initialFaqIds || []);
  const [dbFaqs, setDbFaqs] = useState<any[]>([]);

  useEffect(() => {
    // Fetch FAQs from database
    fetchAPI('/faqs?limit=100')
      .then((res) => {
        if (res.success && res.data?.faqs) {
          setDbFaqs(res.data.faqs);
        }
      })
      .catch((err) => console.error('Error fetching FAQs:', err));
  }, []);

  // Sync source changes with parent
  useEffect(() => {
    onChange(faqs, source, faqIds);
  }, [source, faqIds]);

  const addFaq = () => {
    const updated = [...faqs, { question: '', answer: '', order: faqs.length }];
    onChange(updated, source, faqIds);
  };

  const removeFaq = (index: number) => {
    const updated = faqs.filter((_, i) => i !== index);
    onChange(updated, source, faqIds);
  };

  const updateFaq = (index: number, field: string, value: string) => {
    const newFaqs = [...faqs];
    newFaqs[index] = { ...newFaqs[index], [field]: value };
    onChange(newFaqs, source, faqIds);
  };

  const addFaqId = (id: string) => {
    if (!faqIds.includes(id)) {
      const updated = [...faqIds, id];
      setFaqIds(updated);
    }
  };

  const removeFaqId = (index: number) => {
    const updated = faqIds.filter((_, i) => i !== index);
    setFaqIds(updated);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-brand-500" /> Product FAQs
        </h3>
      </div>

      <div className="space-y-4">
        {/* Source Selection */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            FAQ Source
          </label>
          <select
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
          >
            <option value="manual">Manual Entry</option>
            <option value="selection">Select from Database</option>
          </select>
        </div>

        {source === 'selection' ? (
          <div className="space-y-4">
            {/* Selected FAQs Display */}
            <div className="space-y-2">
              {faqIds.map((id, idx) => {
                const faq = dbFaqs.find(f => f.id === id);
                return (
                  <div key={`${id}-${idx}`} className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
                    <span className="text-sm flex-1 truncate text-slate-900 dark:text-white">
                      {faq?.question || 'Unknown FAQ'}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFaqId(idx)}
                      className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Add FAQ Dropdown */}
            <select
              value=""
              onChange={(e) => {
                if (e.target.value) {
                  addFaqId(e.target.value);
                }
              }}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
            >
              <option value="">+ Select a FAQ from database...</option>
              {dbFaqs
                .filter(f => !faqIds.includes(f.id))
                .map((f: any) => (
                  <option key={f.id} value={f.id}>{f.question}</option>
                ))
              }
            </select>

          </div>
        ) : (
          <>
            {/* Manual Entry */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={addFaq}
                className="text-sm font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> Add Question
              </button>
            </div>

            <div className="space-y-4">
              {faqs.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 dark:bg-slate-900/50 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-400 text-sm">
                  No FAQs added yet.
                </div>
              ) : (
                faqs.map((faq, index) => (
                  <div key={index} className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 relative group">
                    <button
                      type="button"
                      onClick={() => removeFaq(index)}
                      className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors"
                      title="Remove FAQ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="space-y-3 pr-8">
                      <input
                        type="text"
                        placeholder="Question"
                        value={faq.question}
                        onChange={(e) => updateFaq(index, 'question', e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                      />
                      <textarea
                        placeholder="Answer"
                        value={faq.answer}
                        onChange={(e) => updateFaq(index, 'answer', e.target.value)}
                        rows={2}
                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-brand-500 outline-none resize-none"
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
