'use client';

import { Edit, Eye, Plus, Search, Trash2, LayoutTemplate } from 'lucide-react';
import Link from 'next/link';
import { useSettings } from '@/hooks/SettingsContext';
import { ProductListProps } from './types';

export default function ProductList({
    products,
    loading,
    searchQuery,
    onSearchChange,
    onDelete,
    onStatusChange,
    onLandingPage
}: ProductListProps) {
    const { formatPrice } = useSettings();

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
                        onChange={(e) => onSearchChange(e.target.value)}
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
                                    <td colSpan={8} className="px-6 py-8 text-center text-slate-500">Loading products...</td>
                                </tr>
                            ) : products.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-8 text-center text-slate-500">
                                        {searchQuery ? 'No products match your search.' : 'No products found.'}
                                    </td>
                                </tr>
                            ) : (
                                products.map((product) => (
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
                                                onChange={(e) => onStatusChange(product.id, e.target.value)}
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
                                            {product.createdAt ? new Date(product.createdAt).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                                            {product.updatedAt ? new Date(product.updatedAt).toLocaleDateString() : 'N/A'}
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
                                                    onClick={() => onLandingPage(product)}
                                                    className={`p-2 rounded-lg transition-colors ${product.landingPage
                                                        ? 'text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                                                        : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                                                        }`}
                                                    title={product.landingPage ? "Edit Landing Page" : "Create Landing Page"}
                                                >
                                                    <LayoutTemplate className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => onDelete(product.id)}
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
        </div>
    );
}
