import ProductForm from '@/features/admin/product/components/ProductForm';

export default function NewProductPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-display mb-8">Add New Product</h1>
      <ProductForm />
    </div>
  );
}
