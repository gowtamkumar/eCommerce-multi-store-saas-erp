'use client';

import { Edit, Plus, Search, Trash2, Package } from 'lucide-react';
import { memo, useState } from 'react';
import type { Category, CategoryListProps } from '../type';

const CategoryRow = memo(({ 
    category, 
    onEdit, 
    onDelete 
}: { 
    category: Category; 
    onEdit: (c: Category) => void; 
    onDelete: (id: string) => void; 
}) => (
    <tr className="group hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
        <td className="px-6 py-4">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-xl overflow-hidden">
                    {category.image ? <img src={category.image} className="w-full h-full object-cover" /> : '📁'}
                </div>
                <span className="font-semibold text-slate-900 dark:text-white">{category.name}</span>
            </div>
        </td>
        <td className="px-6 py-4 font-mono text-xs text-slate-500">/{category.slug}</td>
        <td className="px-6 py-4 text-sm text-slate-500 max-w-xs truncate">{category.description || '-'}</td>
        <td className="px-6 py-4">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <Package className="w-4 h-4" />
                <span className="text-sm font-medium">{category.productCount || 0}</span>
            </div>
        </td>
        <td className="px-6 py-4 text-right">
            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={() => onEdit(category)}
                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                >
                    <Edit className="w-4 h-4" />
                </button>
                <button
                    onClick={() => category.id && onDelete(category.id)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </td>
    </tr>
));

CategoryRow.displayName = 'CategoryRow';

export default function CategoryList({ categories, loading, onEdit, onDelete, onAdd }: CategoryListProps) {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredCategories = categories.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.slug.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-display">Categories</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Organize your products into meaningful groups.</p>
                </div>
                <button
                    onClick={onAdd}
                    className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-brand-500/20"
                >
                    <Plus className="w-5 h-5" />
                    Add Category
                </button>
            </div>

            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                    type="text"
                    placeholder="Search categories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                />
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Category</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Slug</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Description</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Products</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {loading ? (
                                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500">Loading categories...</td></tr>
                            ) : filteredCategories.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500">No categories found.</td></tr>
                            ) : (
                                filteredCategories.map((category) => (
                                    <CategoryRow 
                                        key={category.id} 
                                        category={category} 
                                        onEdit={onEdit} 
                                        onDelete={onDelete} 
                                    />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
