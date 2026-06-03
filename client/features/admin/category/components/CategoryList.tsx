'use client';

import { ChevronRight, Edit, Package, Plus, Search, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import { useState, useMemo, useCallback } from 'react';
import type { Category, CategoryListProps } from '../type';
import DataTable, { DataTableColumn } from '@/components/shared/DataTable';

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

    const flattenTree = useCallback((nodes: Category[], depth = 0): (Category & { depth: number })[] => {
        const flat: (Category & { depth: number })[] = [];
        nodes.forEach(node => {
            flat.push({ ...node, depth });
            if (node.children && node.children.length > 0) {
                flat.push(...flattenTree(node.children, depth + 1));
            }
        });
        return flat;
    }, []);

    const displayCategories = useMemo(() => {
        const filtered = categories.filter(c =>
            c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.slug.toLowerCase().includes(searchQuery.toLowerCase())
        );

        if (searchQuery) {
            return filtered.map(c => ({ ...c, depth: 0 }));
        }

        const tree = buildTree(categories);
        return flattenTree(tree);
    }, [categories, searchQuery, flattenTree]);

    const columns = useMemo<DataTableColumn<Category & { depth: number }>[]>(() => [
        {
            key: 'name',
            header: 'Category',
            className: 'px-5 py-4',
            cell: (category) => (
                <div className="flex items-center gap-3" style={{ paddingLeft: `${category.depth * 20}px` }}>
                    {category.depth > 0 && <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" />}
                    <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-900 flex items-center justify-center overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                        {category.image
                            ? <img src={category.image} className="w-full h-full object-cover" alt={category.name} />
                            : <span className="text-base">📁</span>}
                    </div>
                    <div>
                        <div className="font-bold text-slate-900 dark:text-white text-sm">{category.name}</div>
                        {!searchQuery && category.children && category.children.length > 0 && (
                            <div className="text-[10px] text-slate-400 mt-0.5">{category.children.length} sub-categories</div>
                        )}
                    </div>
                </div>
            ),
        },
        {
            key: 'slug',
            header: 'Slug',
            className: 'px-5 py-4 font-mono text-xs text-slate-500',
            cell: (category) => `/${category.slug}`,
        },
        {
            key: 'description',
            header: 'Description',
            className: 'px-5 py-4 text-sm text-slate-500 max-w-[200px] truncate',
            cell: (category) => category.description || '—',
        },
        {
            key: 'parent',
            header: 'Parent',
            className: 'px-5 py-4',
            cell: (category) => category.parent?.name ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
                    <ChevronRight className="w-2.5 h-2.5" />{category.parent.name}
                </span>
            ) : (
                <span className="text-[10px] text-slate-300 dark:text-slate-600">Root</span>
            ),
        },
        {
            key: 'productCount',
            header: 'Products',
            className: 'px-5 py-4',
            cell: (category) => (
                <div className="flex items-center gap-1 text-slate-500">
                    <Package className="w-3.5 h-3.5" />
                    <span className="text-sm font-semibold">{category.productCount || 0}</span>
                </div>
            ),
        },
        {
            key: 'isActive',
            header: 'Status',
            className: 'px-5 py-4',
            cell: (category) => category.isActive !== false ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                    <ToggleRight className="w-3 h-3" /> Active
                </span>
            ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 dark:bg-slate-700">
                    <ToggleLeft className="w-3 h-3" /> Inactive
                </span>
            ),
        },
        {
            key: 'actions',
            header: 'Actions',
            headerClassName: 'text-right',
            className: 'px-5 py-4 text-right',
            cell: (category) => (
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
            ),
        },
    ], [onEdit, onDelete, searchQuery]);

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
                <DataTable
                    data={displayCategories}
                    columns={columns}
                    getRowKey={(category) => category.id || category.slug || category.name}
                    loading={loading}
                    loadingLabel="Syncing category registry..."
                    emptyLabel={
                        <div className="flex flex-col items-center gap-2">
                            <span className="text-4xl mb-3 block">📁</span>
                            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">
                                {searchQuery ? 'No categories match your search' : 'No categories yet'}
                            </p>
                        </div>
                    }
                    containerClassName="border-0 shadow-none rounded-t-none bg-transparent"
                    rowClassName="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-all group"
                />
                {!loading && categories.length > 0 && (
                    <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-700 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        {categories.length} total categories
                    </div>
                )}
            </div>
        </div>
    );
}
