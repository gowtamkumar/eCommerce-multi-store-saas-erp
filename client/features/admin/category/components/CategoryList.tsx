'use client';

import { ChevronRight, Edit, Package, Plus, Search, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import { memo, useState } from 'react';
import type { Category, CategoryListProps } from '../type';

// Recursive row component to render category tree
const CategoryRow = memo(({
    category,
    depth = 0,
    onEdit,
    onDelete,
}: {
    category: Category;
    depth?: number;
    onEdit: (c: Category) => void;
    onDelete: (id: string) => void;
}) => (
    <>
        <tr className="group hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
            <td className="px-5 py-4">
                <div className="flex items-center gap-3" style={{ paddingLeft: `${depth * 20}px` }}>
                    {depth > 0 && <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" />}
                    <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-900 flex items-center justify-center overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                        {category.image
                            ? <img src={category.image} className="w-full h-full object-cover" alt={category.name} />
                            : <span className="text-base">📁</span>}
                    </div>
                    <div>
                        <div className="font-bold text-slate-900 dark:text-white text-sm">{category.name}</div>
                        {category.children && category.children.length > 0 && (
                            <div className="text-[10px] text-slate-400 mt-0.5">{category.children.length} sub-categories</div>
                        )}
                    </div>
                </div>
            </td>
            <td className="px-5 py-4 font-mono text-xs text-slate-500">/{category.slug}</td>
            <td className="px-5 py-4 text-sm text-slate-500 max-w-[200px] truncate">{category.description || '—'}</td>
            <td className="px-5 py-4">
                {category.parent?.name
                    ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
                        <ChevronRight className="w-2.5 h-2.5" />{category.parent.name}
                      </span>
                    : <span className="text-[10px] text-slate-300 dark:text-slate-600">Root</span>}
            </td>
            <td className="px-5 py-4">
                <div className="flex items-center gap-1 text-slate-500">
                    <Package className="w-3.5 h-3.5" />
                    <span className="text-sm font-semibold">{category.productCount || 0}</span>
                </div>
            </td>
            <td className="px-5 py-4">
                {category.isActive !== false
                    ? <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                        <ToggleRight className="w-3 h-3" /> Active
                      </span>
                    : <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 dark:bg-slate-700">
                        <ToggleLeft className="w-3 h-3" /> Inactive
                      </span>}
            </td>
            <td className="px-5 py-4 text-right">
                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => onEdit(category)}
                        className="p-2 text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-lg transition-colors"
                        title="Edit"
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => category.id && onDelete(category.id)}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </td>
        </tr>
        {/* Render children recursively */}
        {category.children?.map(child => (
            <CategoryRow key={child.id} category={child} depth={depth + 1} onEdit={onEdit} onDelete={onDelete} />
        ))}
    </>
));

CategoryRow.displayName = 'CategoryRow';

export default function CategoryList({ categories, loading, onEdit, onDelete, onAdd }: CategoryListProps) {
    const [searchQuery, setSearchQuery] = useState('');

    // Build tree from flat list
    const buildTree = (items: Category[]): Category[] => {
        const map = new Map<string, Category>();
        const roots: Category[] = [];
        items.forEach(item => map.set(item.id!, { ...item, children: [] }));
        map.forEach(item => {
            if (item.parentId && map.has(item.parentId)) {
                map.get(item.parentId)!.children!.push(item);
            } else {
                roots.push(item);
            }
        });
        return roots;
    };

    const treeCategories = buildTree(
        categories.filter(c =>
            c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.slug.toLowerCase().includes(searchQuery.toLowerCase())
        )
    );

    // When searching, show flat list so results are visible
    const displayCategories = searchQuery
        ? categories.filter(c =>
            c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.slug.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : buildTree(categories);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Categories</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Organize your catalog into a hierarchical tree structure.</p>
                </div>
                <button
                    onClick={onAdd}
                    className="px-5 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-brand-500/20"
                >
                    <Plus className="w-4 h-4" /> New Category
                </button>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                    type="text"
                    placeholder="Search categories by name or slug..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-brand-500 outline-none transition-all text-sm"
                />
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                            <tr>
                                <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Category</th>
                                <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Slug</th>
                                <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Description</th>
                                <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Parent</th>
                                <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Products</th>
                                <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Status</th>
                                <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                            {loading ? (
                                [...Array(4)].map((_, i) => (
                                    <tr key={i}><td colSpan={7} className="px-5 py-4">
                                        <div className="h-8 bg-slate-100 dark:bg-slate-700 rounded-lg animate-pulse" />
                                    </td></tr>
                                ))
                            ) : displayCategories.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-5 py-16 text-center">
                                        <span className="text-4xl mb-3 block">📁</span>
                                        <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">
                                            {searchQuery ? 'No categories match your search' : 'No categories yet'}
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                displayCategories.map(category => (
                                    <CategoryRow
                                        key={category.id}
                                        category={category}
                                        depth={0}
                                        onEdit={onEdit}
                                        onDelete={onDelete}
                                    />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {!loading && categories.length > 0 && (
                    <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-700 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        {categories.length} total categories
                    </div>
                )}
            </div>
        </div>
    );
}
