'use client';

import { fetchAPI } from '@/lib/api';

import ConfirmModal from '@/components/ui/ConfirmModal';
import { useSettings } from '@/contexts/SettingsContext';
import { Edit, Eye, Plus, Search, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  status: string;
  images: string[];
  features: string[];
  discountAmount?: number;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => { },
    isDangerous: false,
  });
  const { settings, formatPrice } = useSettings();

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    // Filter products based on search query
    if (searchQuery.trim() === '') {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [searchQuery, products]);

  const fetchProducts = async () => {
    try {
      const res = await fetchAPI('/products');
      // NestJS returns { data: { products: [] } }
      if (res.data?.products) {
        setProducts(res.data.products);
        setFilteredProducts(res.data.products);
      }
    } catch (error) {
      console.error('Failed to fetch products', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Product',
      message: 'Are you sure you want to delete this product? This action cannot be undone.',
      isDangerous: true,
      onConfirm: async () => {
        try {
          await fetchAPI(`/products/${id}`, { method: 'DELETE' });
          setProducts(products.filter((p: any) => p.id !== id));
          toast.success('Product deleted successfully');
        } catch (error) {
          toast.error('Error deleting product');
        }
      },
    });
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      await fetchAPI(`/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });

      // Update local state
      setProducts(products.map((p: any) =>
        p.id === id ? { ...p, status: newStatus } : p
      ));
      toast.success('Product status updated');
    } catch (error) {
      toast.error('Error updating product status');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-display">Products</h1>
        <Link
          href="/admin/products/new"
          className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-medium flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Product
        </Link>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search products by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Name</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Slug</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Price</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Stock</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Status</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Added</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Updated</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">Loading products...</td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    {searchQuery ? 'No products match your search.' : 'No products found.'}
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product: any) => (
                  <tr key={product.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4 text-slate-900 dark:text-white font-medium">{product.name}</td>
                    <td className="px-6 py-4">
                      <code className="text-xs bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded text-slate-600 dark:text-slate-400">
                        /{product.slug}
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      {product.discountAmount !== undefined && product.discountAmount > 0 ? (
                        <div className="flex flex-col">
                          <span className="text-slate-900 dark:text-white font-medium">
                            {formatPrice(product.price - product.discountAmount)}
                          </span>
                          <span className="text-xs text-slate-400 line-through">
                            {formatPrice(product.price)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-900 dark:text-white font-medium">
                          {formatPrice(product.price)}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{product.stock}</td>
                    <td className="px-6 py-4">
                      <select
                        value={product.status}
                        onChange={(e) => handleStatusUpdate(product.id, e.target.value)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors outline-none cursor-pointer ${product.status === 'active'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                          }`}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                      {new Date(product.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                      {new Date(product.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/products/${product.id}/review`}
                          className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="Edit Product"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        isDangerous={confirmModal.isDangerous}
      />
    </div >
  );
}

