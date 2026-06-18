import { fetchAPI } from '@/services/api';
import { Category, ProductAttribute, ProductVariant } from '@/types/product';
import { Loader2, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import ProductVariants from './ProductVariants';
import { ProductDetailsSidebar } from './form/ProductDetailsSidebar';
import { ProductFAQs } from './form/ProductFAQs';
import { ProductGeneralInfo } from './form/ProductGeneralInfo';
import { ProductInventoryLedger } from './form/ProductInventoryLedger';
import { ProductMedia } from './form/ProductMedia';
import { ProductPricing } from './form/ProductPricing';
import { ProductSEO } from './form/ProductSEO';
import { ProductPriceTiers } from './form/ProductPriceTiers';
import { ProductAiAssist } from './form/ProductAiAssist';
import type { ProductContentResult } from '@/features/admin/ai/types/ai-studio';

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
    sku: initialData?.sku || '',
    barcode: initialData?.barcode || '',
    productType: initialData?.productType || 'SIMPLE',
    description: initialData?.description || '',
    shortDescription: initialData?.shortDescription || '',
    price: initialData?.price?.toString() || '0',
    wholesalePrice: initialData?.wholesalePrice?.toString() || '0',
    minWholesaleQty: initialData?.minWholesaleQty?.toString() || '1',
    averageCost: initialData?.averageCost?.toString() || '0',
    discountAmount: initialData?.discountAmount?.toString() || '0',
    discountType: initialData?.discountType || 'percentage',
    taxRate: initialData?.taxRate?.toString() || '0',
    stock: initialData?.stock?.toString() || '0',
    lowStockThreshold: initialData?.lowStockThreshold?.toString() || '5',
    images: initialData?.images?.join(',') || '',
    status: initialData?.status || 'active',
    categoryId: initialData?.categoryId || initialData?.category?.id || '',
    brandId: initialData?.brandId || initialData?.brand?.id || '',
    isReview: initialData?.isReview ?? true,
    attributes: initialData?.attributes || [] as ProductAttribute[],
    variants: initialData?.variants || [] as ProductVariant[],
    faqs: initialData?.faqs || [],
    faqSource: initialData?.faqSource || 'manual',
    faqIds: initialData?.faqIds || [],
    metaTitle: initialData?.metaTitle || '',
    metaDescription: initialData?.metaDescription || '',
    ogImage: initialData?.ogImage || '',
    isNew: initialData?.isNew || false,
    isHot: initialData?.isHot || false,
    isSale: initialData?.isSale || false,
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

  const generateSlug = useCallback((text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }, []);

  const handleUpdate = useCallback((updates: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleFaqChange = useCallback((faqs: any[], faqSource: string, faqIds: string[]) => {
    setFormData(prev => ({ ...prev, faqs, faqSource, faqIds }));
  }, []);

  const handleVariantChange = useCallback((attributes: any[], variants: any[]) => {
    setFormData(prev => ({ ...prev, attributes, variants }));
  }, []);

  const handleAiContentApply = useCallback((result: ProductContentResult) => {
    setFormData((prev) => ({
      ...prev,
      shortDescription: result.shortDescription || prev.shortDescription,
      description: result.description || prev.description,
      metaTitle: result.seoTitle || prev.metaTitle,
      metaDescription: result.seoDescription || prev.metaDescription,
    }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload: any = {
      ...formData,
      price: parseFloat(formData.price) || 0,
      wholesalePrice: parseFloat(formData.wholesalePrice) || 0,
      minWholesaleQty: parseInt(formData.minWholesaleQty) || 1,
      discountAmount: parseFloat(formData.discountAmount) || 0,
      taxRate: parseFloat(formData.taxRate) || 0,
      lowStockThreshold: parseInt(formData.lowStockThreshold) || 5,
      sku: formData.sku || null,
      barcode: formData.barcode || null,
      productType: formData.productType || 'SIMPLE',
      slug: formData.slug || generateSlug(formData.name),
      images: formData.images.split(',').map((s: string) => s.trim()).filter(Boolean),
      categoryId: formData.categoryId || null,
      brandId: formData.brandId || null,
      faqIds: formData.faqSource === 'selection' ? formData.faqIds : [],
      faqs: formData.faqSource === 'manual' ? formData.faqs.map((f: any) => ({
        question: f.question,
        answer: f.answer,
        order: f.order
      })) : [],
      variants: formData.variants.map((v: any) => {
        const { stock, ...variantData } = v;
        return {
          ...variantData,
          price: parseFloat(v.price) || 0,
          wholesalePrice: parseFloat(v.wholesalePrice) || 0,
          lowStockThreshold: parseInt(v.lowStockThreshold || '5'),
          // Only send stock 0 for new variants (those without an ID)
          ...(!v.id && { stock: 0 })
        };
      }),
    };

    // ERP FIX: Only set stock 0 for NEW products. 
    // For existing products, remove the field so it doesn't overwrite.
    if (!isEdit) {
      payload.stock = 0;
    } else {
      delete payload.stock;
    }

    try {
      const url = isEdit ? `/products/${initialData.id}` : '/products';
      const method = isEdit ? 'PATCH' : 'POST';

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
    <form onSubmit={handleSubmit} className="max-w-[1200px] pb-20">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content Column */}
        <div className="flex-1 space-y-8">
          <ProductAiAssist
            productName={formData.name}
            shortDescription={formData.shortDescription}
            description={formData.description}
            onApply={handleAiContentApply}
          />

          <ProductGeneralInfo
            name={formData.name}
            slug={formData.slug}
            sku={formData.sku}
            barcode={formData.barcode}
            shortDescription={formData.shortDescription}
            description={formData.description}
            isEdit={isEdit}
            onUpdate={handleUpdate}
            generateSlug={generateSlug}
          />

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-8">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Inventory & Variants</h3>
            <ProductVariants
              attributes={formData.attributes}
              variants={formData.variants}
              basePrice={parseFloat(formData.price) || 0}
              stock={formData.stock}
              onChange={handleVariantChange}
            />
          </div>

          {isEdit && initialData?.id && (
            <>
              <ProductInventoryLedger productId={initialData.id} />
              <ProductPriceTiers
                productId={initialData.id}
                variants={formData.variants}
                averageCost={formData.averageCost}
              />
            </>
          )}

          <ProductSEO
            metaTitle={formData.metaTitle}
            metaDescription={formData.metaDescription}
            ogImage={formData.ogImage}
            onUpdate={handleUpdate}
          />

          <ProductFAQs
            faqs={formData.faqs}
            faqSource={formData.faqSource}
            faqIds={formData.faqIds}
            onChange={handleFaqChange}
          />
        </div>

        {/* Sidebar Column */}
        <div className="w-full lg:w-[350px] space-y-8">
          <ProductDetailsSidebar
            status={formData.status}
            categoryId={formData.categoryId}
            brandId={formData.brandId}
            isReview={formData.isReview}
            isNew={formData.isNew}
            isHot={formData.isHot}
            isSale={formData.isSale}
            categories={categories}
            brands={brands}
            onUpdate={handleUpdate}
          />

          <ProductPricing
            price={formData.price}
            wholesalePrice={formData.wholesalePrice}
            minWholesaleQty={formData.minWholesaleQty}
            averageCost={formData.averageCost}
            discountAmount={formData.discountAmount}
            discountType={formData.discountType}
            taxRate={formData.taxRate}
            stock={formData.stock}
            lowStockThreshold={formData.lowStockThreshold}
            onUpdate={handleUpdate}
          />

          <ProductMedia
            images={formData.images}
            onUpdate={handleUpdate}
          />

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

