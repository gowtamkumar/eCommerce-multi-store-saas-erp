'use client';

import React, { useEffect, useState, memo } from 'react';
import { Loader2, Plus, Trash2, ShieldAlert, BadgeDollarSign, Layers } from 'lucide-react';
import { fetchAPI } from '@/services/api';
import toast from 'react-hot-toast';

interface ProductPriceTiersProps {
  productId: string;
  variants?: any[];
  averageCost: string;
}

export const ProductPriceTiers = memo(({ productId, variants = [], averageCost }: ProductPriceTiersProps) => {
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [priceBooks, setPriceBooks] = useState<any[]>([]);
  const [tiers, setTiers] = useState<any[]>([]);
  
  // Form State
  const [selectedPriceBook, setSelectedPriceBook] = useState('');
  const [selectedVariant, setSelectedVariant] = useState('');
  const [minQty, setMinQty] = useState('1');
  const [price, setPrice] = useState('');

  // Derived: currency of the currently selected price book
  const selectedBookCurrency = priceBooks.find(pb => pb.id === selectedPriceBook)?.currency || '—';

  useEffect(() => {
    if (productId) {
      loadData();
    }
  }, [productId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [pbRes, tiersRes] = await Promise.all([
        fetchAPI('/pricing/price-books'),
        fetchAPI(`/pricing/product-prices/${productId}`)
      ]);
      
      if (pbRes.success) setPriceBooks(pbRes.data);
      if (tiersRes.success) setTiers(tiersRes.data);
      
      if (pbRes.success && pbRes.data.length > 0) {
        setSelectedPriceBook(pbRes.data[0].id);
      }
    } catch (error) {
      console.error('Failed to load pricing data', error);
      toast.error('Failed to load pricing rules');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTier = async () => {
    if (!selectedPriceBook) {
      toast.error('Create a Price Book first (Admin → Price Books)');
      return;
    }
    if (!price || parseFloat(price) <= 0) {
      toast.error('Price must be greater than 0');
      return;
    }
    if (!minQty || parseInt(minQty) < 1) {
      toast.error('Minimum quantity must be 1 or more');
      return;
    }

    try {
      setAdding(true);
      const payload = {
        priceBookId: selectedPriceBook,
        productId,
        variantId: selectedVariant || undefined,
        price: parseFloat(price),
        minQuantity: parseInt(minQty)
      };

      const res = await fetchAPI('/pricing/product-prices', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (res.success) {
        toast.success('Price tier added');
        setPrice('');
        setMinQty('1');
        const tiersRes = await fetchAPI(`/pricing/product-prices/${productId}`);
        if (tiersRes.success) setTiers(tiersRes.data);
      }
    } catch (error: any) {
      console.error('Failed to add price tier', error);
      toast.error(error?.message || 'Failed to add price tier');
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteTier = async (id: string) => {
    if (!confirm('Are you sure you want to delete this price tier?')) return;
    try {
      const res = await fetchAPI(`/pricing/product-prices/${id}`, {
        method: 'DELETE'
      });
      if (res.success) {
        toast.success('Price tier deleted');
        setTiers(prev => prev.filter(t => t.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete price tier', error);
      toast.error('Failed to delete price tier');
    }
  };

  const calculateTierMargin = (tierPrice: number, variantId?: string) => {
    const cost = variantId 
      ? parseFloat(variants.find(v => v.id === variantId)?.averageCost || averageCost || '0')
      : parseFloat(averageCost || '0');
    
    if (tierPrice <= 0) return '0.0';
    return (((tierPrice - cost) / tierPrice) * 100).toFixed(1);
  };

  if (!productId) return null;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-8 space-y-6">
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <BadgeDollarSign className="w-5 h-5 text-indigo-500" />
          Volume Price Tiers & Books
        </h3>
        <p className="text-sm text-slate-500">Configure dynamic price books and bulk discount brackets.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-brand-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Add Price Tier Form */}
          <div className="xl:col-span-1 border-r border-slate-100 dark:border-slate-800 pr-0 xl:pr-8 space-y-4">
            <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-emerald-500" />
              Add Pricing Bracket
            </h4>
            
            {/* Must not be a <form>: this component lives inside ProductForm's <form>,
                and nested forms are invalid HTML — the browser ignores the inner form
                and the submit button updates the product instead of adding a tier. */}
            <div
              className="space-y-4"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  void handleAddTier();
                }
              }}
            >
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Price Book</label>
                <select
                  value={selectedPriceBook}
                  onChange={(e) => setSelectedPriceBook(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                >
                  {priceBooks.map(pb => (
                    <option key={pb.id} value={pb.id}>
                      {pb.name} ({pb.code})
                    </option>
                  ))}
                  {priceBooks.length === 0 && (
                    <option disabled value="">No active Price Books available</option>
                  )}
                </select>
                {priceBooks.length === 0 && (
                  <p className="mt-1.5 text-[11px] text-amber-600 dark:text-amber-400">
                    Create a Price Book under Admin → Price Books first.
                  </p>
                )}
              </div>

              {variants.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Variant Target</label>
                  <select
                    value={selectedVariant}
                    onChange={(e) => setSelectedVariant(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                  >
                    <option value="">Base Product (All Variants)</option>
                    {variants.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.sku} - {Object.values(v.combination || {}).join(' / ')}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Min Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={minQty}
                    onChange={(e) => setMinQty(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm outline-none transition-all font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">
                    Tier Price {selectedBookCurrency !== '—' ? `(${selectedBookCurrency})` : ''}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm outline-none transition-all font-mono"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddTier}
                disabled={adding || priceBooks.length === 0}
                className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold transition-all shadow-md text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {adding ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                Add Pricing Bracket
              </button>
            </div>
          </div>

          {/* List of Active Price Tiers */}
          <div className="xl:col-span-2 space-y-4">
            <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-brand-500" />
              Active Volume Brackets
            </h4>

            {tiers.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center gap-2">
                <ShieldAlert className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                No custom price books or volume brackets configured for this product.
              </div>
            ) : (
              <div className="overflow-hidden border border-slate-100 dark:border-slate-800 rounded-xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                      <th className="py-2.5 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Book</th>
                      <th className="py-2.5 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Target</th>
                      <th className="py-2.5 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Qty Threshold</th>
                      <th className="py-2.5 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">
                        Price
                      </th>
                      <th className="py-2.5 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Margin</th>
                      <th className="py-2.5 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tiers.map((tier) => {
                      const margin = calculateTierMargin(tier.price, tier.variantId);
                      return (
                        <tr key={tier.id} className="border-b border-slate-50 dark:border-slate-800/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="py-3 px-4">
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                              {tier.priceBook?.name || 'Volume Book'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-300">
                            {tier.variantId ? (
                              <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400">
                                {tier.variant?.sku || 'Variant override'}
                              </span>
                            ) : (
                              <span className="text-slate-400 text-xs italic">Base Product</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-sm text-center font-mono font-bold text-slate-700 dark:text-slate-300">
                            Qty &ge; {tier.minQuantity}
                          </td>
                          <td className="py-3 px-4 text-sm text-right font-mono font-bold text-slate-900 dark:text-white">
                            {tier.priceBook?.currency || ''} {parseFloat(tier.price).toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className={`inline-block px-2 py-0.5 rounded text-xs font-mono font-bold ${parseFloat(margin) < 20 ? 'text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-950/20' : parseFloat(margin) < 40 ? 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/20' : 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/20'}`}>
                              {margin}%
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => handleDeleteTier(tier.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 dark:text-slate-500 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
});

ProductPriceTiers.displayName = 'ProductPriceTiers';
