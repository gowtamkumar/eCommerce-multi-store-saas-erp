'use client';

import DataTable, { DataTableColumn, DataTableSortOrder } from '@/components/shared/DataTable';
import { Edit, Globe, Image as ImageIcon, Plus, Search, Trash2, Package, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { Brand, BrandListProps } from '../type';

type BrandSortKey = 'name' | 'slug' | 'products';

const PAGE_SIZE = 10;

export default function BrandList({ brands, loading, onEdit, onDelete, onAdd }: BrandListProps) {
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [sortBy, setSortBy] = useState<BrandSortKey>('name');
    const [sortOrder, setSortOrder] = useState<DataTableSortOrder>('ASC');
    const [page, setPage] = useState<number>(1);

    const handleSortChange = (key: string) => {
        const sortKey = key as BrandSortKey;
        if (sortBy === sortKey) {
            setSortOrder((prev) => (prev === 'ASC' ? 'DESC' : 'ASC'));
        } else {
            setSortBy(sortKey);
            setSortOrder('ASC');
        }
        setPage(1);
    };

    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        setPage(1);
    };

    const visibleBrands = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        const filtered = query
            ? brands.filter(
                  (b) =>
                      b.name.toLowerCase().includes(query) ||
                      b.slug.toLowerCase().includes(query)
              )
            : brands;

        const direction = sortOrder === 'ASC' ? 1 : -1;
        return [...filtered].sort((a, b) => {
            switch (sortBy) {
                case 'products':
                    return ((a.productCount || 0) - (b.productCount || 0)) * direction;
                case 'slug':
                    return a.slug.localeCompare(b.slug) * direction;
                case 'name':
                default:
                    return a.name.localeCompare(b.name) * direction;
            }
        });
    }, [brands, searchQuery, sortBy, sortOrder]);

    const totalPages = Math.max(1, Math.ceil(visibleBrands.length / PAGE_SIZE));
    // Clamp during render so a shrinking result set never lands on an empty page.
    const currentPage = Math.min(page, totalPages);

    const paginatedBrands = useMemo(
        () => visibleBrands.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
        [visibleBrands, currentPage]
    );

    const rangeStart = visibleBrands.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
    const rangeEnd = Math.min(currentPage * PAGE_SIZE, visibleBrands.length);

    const columns = useMemo<DataTableColumn<Brand>[]>(() => [
        {
            key: 'brand',
            header: 'Brand',
            sortKey: 'name',
            cell: (brand) => (
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-xl overflow-hidden shadow-inner">
                        {brand.image ? <img src={brand.image} alt={brand.name} className="w-full h-full object-contain p-1" /> : <ImageIcon className="w-6 h-6 text-slate-400" />}
                    </div>
                    <div>
                        <span className="font-semibold text-slate-900 dark:text-white block">{brand.name}</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 max-w-[200px] truncate block">{brand.description || 'No description'}</span>
                    </div>
                </div>
            ),
        },
        {
            key: 'slug',
            header: 'Slug',
            sortKey: 'slug',
            className: 'font-mono text-xs text-slate-500',
            cell: (brand) => `/${brand.slug}`,
        },
        {
            key: 'website',
            header: 'Website',
            cell: (brand) => brand.website ? (
                <a href={brand.website} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:text-brand-700 flex items-center gap-1 text-sm">
                    <Globe className="w-3 h-3" />
                    Visit
                </a>
            ) : (
                <span className="text-slate-400 text-sm">-</span>
            ),
        },
        {
            key: 'products',
            header: 'Products',
            sortKey: 'products',
            cell: (brand) => (
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Package className="w-4 h-4" />
                    <span className="text-sm font-medium">{brand.productCount || 0}</span>
                </div>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            cell: (brand) => (
                brand.isActive === false ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                        Inactive
                    </span>
                ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        Active
                    </span>
                )
            ),
        },
        {
            key: 'actions',
            header: 'Actions',
            headerClassName: 'text-right',
            className: 'text-right',
            cell: (brand) => (
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
            ),
        },
    ], [onDelete, onEdit]);

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

            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search brands..."
                        value={searchQuery}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="w-full pl-12 pr-10 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => handleSearchChange('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>
                <span className="text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    {visibleBrands.length} {visibleBrands.length === 1 ? 'brand' : 'brands'}
                </span>
            </div>

            <DataTable
                data={paginatedBrands}
                columns={columns}
                getRowKey={(brand) => brand.id || brand.slug}
                loading={loading}
                loadingLabel="Loading brands..."
                emptyLabel="No brands found."
                sort={{ sortBy, sortOrder, onSortChange: handleSortChange }}
                pagination={{
                    page: currentPage,
                    total: visibleBrands.length,
                    totalPages,
                    onPageChange: setPage,
                }}
                paginationSummary={
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest hidden sm:block">
                        Showing {rangeStart}-{rangeEnd} of {visibleBrands.length}
                    </p>
                }
            />
        </div>
    );
}
