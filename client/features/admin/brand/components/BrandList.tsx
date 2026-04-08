'use client';

import { Edit, Globe, Image as ImageIcon, Plus, Search, Trash2, Package } from 'lucide-react';
import { memo, useState } from 'react';
import type { Brand, BrandListProps } from '../type';

const BrandRow = memo(({ 
    brand, 
    onEdit, 
    onDelete 
}: { 
    brand: Brand; 
    onEdit: (b: Brand) => void; 
    onDelete: (id: string) => void; 
}) => (
    <tr className="group hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
        <td className="px-6 py-4">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-xl overflow-hidden shadow-inner">
                    {brand.image ? <img src={brand.image} alt={brand.name} className="w-full h-full object-contain p-1" /> : <ImageIcon className="w-6 h-6 text-slate-400" />}
                </div>
                <div>
                    <span className="font-semibold text-slate-900 dark:text-white block">{brand.name}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 max-w-[200px] truncate block">{brand.description || 'No description'}</span>
                </div>
            </div>
        </td>
        <td className="px-6 py-4 font-mono text-xs text-slate-500">/{brand.slug}</td>
        <td className="px-6 py-4">
            {brand.website ? (
                <a href={brand.website} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:text-brand-700 flex items-center gap-1 text-sm">
                    <Globe className="w-3 h-3" />
                    Visit
                </a>
            ) : (
                <span className="text-slate-400 text-sm">-</span>
            )}
        </td>
        <td className="px-6 py-4">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <Package className="w-4 h-4" />
                <span className="text-sm font-medium">{brand.productCount || 0}</span>
            </div>
        </td>
        <td className="px-6 py-4 text-right">
            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={() => onEdit(brand)}
                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                >
                    <Edit className="w-4 h-4" />
                </button>
                <button
                    onClick={() => brand.id && onDelete(brand.id)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </td>
    </tr>
));

BrandRow.displayName = 'BrandRow';

export default function BrandList({ brands, loading, onEdit, onDelete, onAdd }: BrandListProps) {
    const [searchQuery, setSearchQuery] = useState<string>('');

    const filteredBrands = brands.filter(b =>
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.slug.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-display">Brands</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your product brands and manufacturers.</p>
                </div>
                <button
                    onClick={onAdd}
                    className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-brand-500/20"
                >
                    <Plus className="w-5 h-5" />
                    Add Brand
                </button>
            </div>

            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                    type="text"
                    placeholder="Search brands..."
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
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Brand</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Slug</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Website</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Products</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {loading ? (
                                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500">Loading brands...</td></tr>
                            ) : filteredBrands.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500">No brands found.</td></tr>
                            ) : (
                                filteredBrands.map((brand) => (
                                    <BrandRow 
                                        key={brand.id} 
                                        brand={brand} 
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
