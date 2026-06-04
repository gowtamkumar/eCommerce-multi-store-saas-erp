'use client';

import { ChevronDown, ChevronRight, Edit, FolderTree, Layers, Package, Plus, Search, ToggleLeft, ToggleRight, Trash2, X } from 'lucide-react';
import { useState, useMemo, useCallback } from 'react';
import type { Category, CategoryListProps } from '../type';
import DataTable, { DataTableColumn } from '@/components/shared/DataTable';

type StatusFilter = 'all' | 'active' | 'inactive';
type CategoryRow = Category & { depth: number; hasChildren: boolean };

// Build a parent/child tree from a flat list of categories.
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

// Depth-first flatten that records each node's depth for indentation and skips
// the descendants of any collapsed node.
const flattenTree = (nodes: Category[], collapsed: Set<string>, depth = 0): CategoryRow[] => {
    const flat: CategoryRow[] = [];
    nodes.forEach(node => {
        const hasChildren = !!node.children && node.children.length > 0;
        flat.push({ ...node, depth, hasChildren });
        if (hasChildren && !(node.id && collapsed.has(node.id))) {
            flat.push(...flattenTree(node.children!, collapsed, depth + 1));
        }
    });
    return flat;
};

export default function CategoryList({ categories, loading, onEdit, onDelete, onAdd }: CategoryListProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());

    const isFiltering = !!searchQuery.trim() || statusFilter !== 'all';

    const matchesStatus = useCallback(
        (c: Category) => {
            if (statusFilter === 'active') return c.isActive !== false;
            if (statusFilter === 'inactive') return c.isActive === false;
            return true;
        },
        [statusFilter]
    );

    const displayCategories = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();

        // When searching or filtering by status, show a flat matching list.
        // Otherwise render the full hierarchical tree (honouring collapsed nodes).
        if (isFiltering) {
            return categories
                .filter(
                    (c) =>
                        matchesStatus(c) &&
                        (c.name.toLowerCase().includes(query) ||
                            c.slug.toLowerCase().includes(query))
                )
                .map((c) => ({ ...c, depth: 0, hasChildren: false }));
        }

        const tree = buildTree(categories);
        return flattenTree(tree, collapsedIds);
    }, [categories, searchQuery, isFiltering, matchesStatus, collapsedIds]);

    // Ids of categories that are referenced as a parent (i.e. have children).
    const parentIds = useMemo(() => {
        const ids = new Set<string>();
        categories.forEach((c) => {
            if (c.parentId) ids.add(c.parentId);
        });
        return ids;
    }, [categories]);

    const stats = useMemo(() => {
        const total = categories.length;
        const active = categories.filter((c) => c.isActive !== false).length;
        const roots = categories.filter((c) => !c.parentId).length;
        return { total, active, inactive: total - active, roots };
    }, [categories]);

    const toggleCollapse = useCallback((id: string) => {
        setCollapsedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, []);

    const expandAll = () => setCollapsedIds(new Set());
    const collapseAll = () => setCollapsedIds(new Set(parentIds));

    const columns = useMemo<DataTableColumn<CategoryRow>[]>(() => [
        {
            key: 'name',
            header: 'Category',
            className: 'px-5 py-4',
            cell: (category) => {
                const collapsed = !!category.id && collapsedIds.has(category.id);
                return (
                    <div className="flex items-center gap-2" style={{ paddingLeft: `${category.depth * 20}px` }}>
                        {!isFiltering && category.hasChildren ? (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (category.id) toggleCollapse(category.id);
                                }}
                                className="p-0.5 rounded text-slate-400 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shrink-0"
                                title={collapsed ? 'Expand' : 'Collapse'}
                            >
                                {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                        ) : (
                            <span className="w-5 shrink-0" />
                        )}
                        <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-900 flex items-center justify-center overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                            {category.image
                                ? <img src={category.image} className="w-full h-full object-cover" alt={category.name} />
                                : <span className="text-base">📁</span>}
                        </div>
                        <div>
                            <div className="font-bold text-slate-900 dark:text-white text-sm">{category.name}</div>
                            {!isFiltering && category.hasChildren && (
                                <div className="text-[10px] text-slate-400 mt-0.5">{category.children!.length} sub-categories</div>
                            )}
                        </div>
                    </div>
                );
            },
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
    ], [onEdit, onDelete, isFiltering, collapsedIds, toggleCollapse]);

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

            {/* Summary stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 px-4 py-3 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400"><Layers className="w-4 h-4" /></div>
                    <div>
                        <div className="text-lg font-black text-slate-900 dark:text-white leading-none">{stats.total}</div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Total</div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 px-4 py-3 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"><ToggleRight className="w-4 h-4" /></div>
                    <div>
                        <div className="text-lg font-black text-slate-900 dark:text-white leading-none">{stats.active}</div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Active</div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 px-4 py-3 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300"><ToggleLeft className="w-4 h-4" /></div>
                    <div>
                        <div className="text-lg font-black text-slate-900 dark:text-white leading-none">{stats.inactive}</div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Inactive</div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 px-4 py-3 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"><FolderTree className="w-4 h-4" /></div>
                    <div>
                        <div className="text-lg font-black text-slate-900 dark:text-white leading-none">{stats.roots}</div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Root</div>
                    </div>
                </div>
            </div>

            {/* Search + Status filter */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search categories by name or slug..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-10 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-brand-500 outline-none transition-all text-sm"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                    className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all text-sm"
                >
                    <option value="all">All statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>
            </div>

            {/* Tree controls */}
            {!isFiltering && parentIds.size > 0 && (
                <div className="flex items-center gap-2">
                    <button
                        onClick={expandAll}
                        className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 flex items-center gap-1 transition-colors"
                    >
                        <ChevronDown className="w-3.5 h-3.5" /> Expand all
                    </button>
                    <span className="text-slate-300 dark:text-slate-600">|</span>
                    <button
                        onClick={collapseAll}
                        className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 flex items-center gap-1 transition-colors"
                    >
                        <ChevronRight className="w-3.5 h-3.5" /> Collapse all
                    </button>
                </div>
            )}

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
                                {isFiltering ? 'No categories match your filters' : 'No categories yet'}
                            </p>
                        </div>
                    }
                    containerClassName="border-0 shadow-none rounded-t-none bg-transparent"
                    rowClassName="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-all group"
                />
                {!loading && categories.length > 0 && (
                    <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-700 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        {isFiltering
                            ? `${displayCategories.length} of ${categories.length} categories`
                            : `${categories.length} total categories`}
                    </div>
                )}
            </div>
        </div>
    );
}
