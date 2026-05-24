'use client';

import { useSettings } from '@/hooks/SettingsContext';
import {
  Edit, Eye, LayoutTemplate, Plus, Search, Trash2,
  Tag, Package, TrendingUp, AlertTriangle, CheckCircle, XCircle, ChevronDown, Printer
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { ProductListProps, Product } from './types';
import BarcodeLabelModal from './BarcodeLabelModal';

function StockBadge({ stock, threshold }: { stock: number; threshold: number }) {
  if (stock === 0) return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
      <XCircle className="w-3 h-3" /> Out of Stock
    </span>
  );
  if (stock <= threshold) return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
      <AlertTriangle className="w-3 h-3" /> Low ({stock})
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
      <CheckCircle className="w-3 h-3" /> {stock} units
    </span>
  );
}

function MarginBadge({ price, cost }: { price: number; cost: number }) {
  if (!price || !cost) return <span className="text-[10px] text-slate-400 font-mono">—</span>;
  const margin = ((price - cost) / price) * 100;
  const color = margin >= 40
    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
    : margin >= 20
    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black font-mono ${color}`}>
      <TrendingUp className="w-2.5 h-2.5" />
      {margin.toFixed(1)}%
    </span>
  );
}

function StatusBadge({ status, onChange, productId }: { status: string; onChange: (id: string, s: string) => void; productId: string }) {
  const map: Record<string, string> = {
    active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    inactive: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400',
    draft: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    discontinued: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };
  return (
    <div className="relative">
      <select
        value={status}
        onChange={(e) => onChange(productId, e.target.value)}
        className={`pl-3 pr-7 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer appearance-none ${map[status] || map.inactive}`}
      >
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
        <option value="draft">Draft</option>
        <option value="discontinued">Discontinued</option>
      </select>
      <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" />
    </div>
  );
}

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
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterLowStock, setFilterLowStock] = useState(false);
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);
  const [selectedProductForBarcode, setSelectedProductForBarcode] = useState<Product | null>(null);

  const filtered = products.filter(p => {
    if (filterStatus !== 'all' && p.status !== filterStatus) return false;
    if (filterLowStock && p.stock > (p.lowStockThreshold || 5)) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Product Catalog</h1>
          <p className="text-slate-500 text-sm mt-1">{products.length} total products</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setSelectedProductForBarcode(null);
              setIsBarcodeModalOpen(true);
            }}
            className="px-5 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded-xl font-bold flex items-center gap-2 transition-all"
          >
            <Printer className="w-4 h-4" /> Print Barcodes
          </button>
          <Link
            href="/admin/products/new"
            className="px-5 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-brand-500/20"
          >
            <Plus className="w-4 h-4" /> New Product
          </Link>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, SKU, or barcode..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none text-sm"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-sm font-medium outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="draft">Draft</option>
            <option value="discontinued">Discontinued</option>
          </select>

          {/* Low Stock Toggle */}
          <button
            onClick={() => setFilterLowStock(!filterLowStock)}
            className={`px-4 py-2.5 rounded-xl border text-sm font-bold flex items-center gap-2 transition-all ${filterLowStock
              ? 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400'
              : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
          >
            <AlertTriangle className="w-4 h-4" />
            Low Stock
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
              <tr>
                <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Product</th>
                <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Category / Brand</th>
                <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Stock</th>
                <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Retail Price</th>
                <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Wholesale Price</th>
                <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Margin</th>
                <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Status</th>
                <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={8} className="px-5 py-4">
                      <div className="h-8 bg-slate-100 dark:bg-slate-700 rounded-lg animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-16 text-center">
                    <Package className="w-10 h-10 text-slate-200 dark:text-slate-700 mx-auto mb-3" strokeWidth={1} />
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">
                      {searchQuery || filterStatus !== 'all' || filterLowStock ? 'No products match your filters' : 'No products yet'}
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors group">
                    {/* Product Name + Image + SKU */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-600">
                          {product.images?.[0] ? (
                            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-4 h-4 text-slate-300" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white text-sm leading-tight">{product.name}</div>
                          {product.sku && (
                            <code className="text-[10px] text-slate-400 font-mono mt-0.5">SKU: {product.sku}</code>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Category + Brand */}
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1">
                        {product.category?.name && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400 rounded-md max-w-[140px] truncate">
                            <Tag className="w-2.5 h-2.5 shrink-0" />{product.category.name}
                          </span>
                        )}
                        {product.brand?.name && (
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{product.brand.name}</span>
                        )}
                      </div>
                    </td>

                    {/* Stock */}
                    <td className="px-5 py-4">
                      <StockBadge stock={product.stock || 0} threshold={product.lowStockThreshold || 5} />
                    </td>

                    {/* Retail Price */}
                    <td className="px-5 py-4">
                      <div className="font-black text-slate-900 dark:text-white font-mono text-sm">
                        {formatPrice(product.price || 0)}
                      </div>
                      {(product.discountAmount ?? 0) > 0 && (
                        <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                          -{product.discountAmount}{product.discountType === 'percentage' ? '%' : ''} off
                        </div>
                      )}
                    </td>

                    {/* Wholesale Price */}
                    <td className="px-5 py-4">
                      {(product.wholesalePrice ?? 0) > 0 ? (
                        <div>
                          <div className="font-black text-indigo-700 dark:text-indigo-400 font-mono text-sm">
                            {formatPrice(product.wholesalePrice ?? 0)}
                          </div>
                          {(product.minWholesaleQty ?? 0) > 1 && (
                            <div className="text-[10px] text-slate-400 font-mono">MOQ: {product.minWholesaleQty}</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-300 dark:text-slate-600">Not set</span>
                      )}
                    </td>
 
                    {/* Margin */}
                    <td className="px-5 py-4">
                      <MarginBadge price={product.price} cost={product.averageCost ?? 0} />
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <StatusBadge status={product.status} onChange={onStatusChange} productId={product.id} />
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setSelectedProductForBarcode(product);
                            setIsBarcodeModalOpen(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="Print Labels"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <Link
                          href={`/admin/products/${product.id}/review`}
                          className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="p-2 text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => onLandingPage(product)}
                          className={`p-2 rounded-lg transition-colors ${product.landingPage
                            ? 'text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                            : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                          title="Landing Page"
                        >
                          <LayoutTemplate className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(product.id)}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Delete"
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

        {/* Footer count */}
        {!loading && filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-700 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Showing {filtered.length} of {products.length} products
          </div>
        )}
      </div>

      <BarcodeLabelModal
        isOpen={isBarcodeModalOpen}
        onClose={() => setIsBarcodeModalOpen(false)}
        products={products}
        initialProduct={selectedProductForBarcode}
      />
    </div>
  );
}
