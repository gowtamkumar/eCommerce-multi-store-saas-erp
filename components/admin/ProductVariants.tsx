'use client';

import { ProductAttribute, ProductVariant } from '@/types/product';
import { DollarSign, Layers, Package, Plus, Tag, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface ProductVariantsProps {
  attributes: ProductAttribute[];
  variants: ProductVariant[];
  basePrice: number;
  onChange: (attributes: ProductAttribute[], variants: ProductVariant[]) => void;
}

export default function ProductVariants({ attributes, variants, basePrice, onChange }: ProductVariantsProps) {
  const [localAttributes, setLocalAttributes] = useState<ProductAttribute[]>(attributes);
  const [localVariants, setLocalVariants] = useState<ProductVariant[]>(variants);
  const [showGenerator, setShowGenerator] = useState(false);

  // Helper to generate cartesian product of attributes
  const generateCombinations = (attrs: ProductAttribute[]) => {
    if (attrs.length === 0) return [];

    // Filter out attributes with no values
    const filteredAttrs = attrs.filter(a => a.values.length > 0);
    if (filteredAttrs.length === 0) return [];

    let result: Record<string, string>[] = [{}];

    for (const attr of filteredAttrs) {
      const temp: Record<string, string>[] = [];
      for (const item of result) {
        for (const value of attr.values) {
          temp.push({ ...item, [attr.name]: value });
        }
      }
      result = temp;
    }

    return result;
  };

  const handleAddField = () => {
    const updated = [...localAttributes, { name: '', values: [] }];
    setLocalAttributes(updated);
    onChange(updated, localVariants);
  };

  const handleRemoveField = (index: number) => {
    const updated = localAttributes.filter((_, i) => i !== index);
    setLocalAttributes(updated);
    // When attributes change, we might want to re-generate or warn
    onChange(updated, localVariants);
  };

  const handleAttributeChange = (index: number, name: string, valuesStr: string) => {
    const values = valuesStr.split(',').map(v => v.trim()).filter(Boolean);
    const updated = [...localAttributes];
    updated[index] = { ...updated[index], name, values };
    setLocalAttributes(updated);
    onChange(updated, localVariants);
  };

  const generateVariants = () => {
    const combinations = generateCombinations(localAttributes);
    const newVariants: ProductVariant[] = combinations.map((combo, index) => {
      const sku = `SKU-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      return {
        sku,
        price: undefined, // uses base price by default
        stock: 0,
        combination: combo,
      };
    });
    setLocalVariants(newVariants);
    onChange(localAttributes, newVariants);
    setShowGenerator(false);
  };

  const updateVariant = (index: number, data: Partial<ProductVariant>) => {
    const updated = [...localVariants];
    updated[index] = { ...updated[index], ...data };
    setLocalVariants(updated);
    onChange(localAttributes, updated);
  };

  return (
    <div className="space-y-8">
      {/* Attributes Section */}
      <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-brand-500" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Product Options</h3>
          </div>
          <button
            type="button"
            onClick={handleAddField}
            className="flex items-center gap-2 text-sm font-semibold text-brand-600 hover:text-brand-700 bg-white dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" /> Add Option
          </button>
        </div>

        <div className="space-y-4">
          {localAttributes.map((attr, idx) => (
            <div key={idx} className="flex gap-4 items-start bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
              <div className="flex-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Option Name (e.g. Color)</label>
                <input
                  type="text"
                  value={attr.name}
                  onChange={(e) => handleAttributeChange(idx, e.target.value, attr.values.join(','))}
                  placeholder="Color, Size, Material..."
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                />
              </div>
              <div className="flex-[2]">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Values (comma separated)</label>
                <input
                  type="text"
                  value={attr.values.join(', ')}
                  onChange={(e) => handleAttributeChange(idx, attr.name, e.target.value)}
                  placeholder="Red, Blue, Green..."
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                />
              </div>
              <button
                type="button"
                onClick={() => handleRemoveField(idx)}
                className="mt-6 p-2 text-slate-400 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}

          {localAttributes.length > 0 && (
            <div className="pt-4 flex justify-center">
              <button
                type="button"
                onClick={generateVariants}
                className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-brand-500/20 flex items-center gap-2"
              >
                <Package className="w-4 h-4" /> Generate Variants from Options
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Variants List */}
      {localVariants.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-2">
            <Tag className="w-5 h-5 text-brand-500" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Generated Variants ({localVariants.length})</h3>
          </div>

          <div className="grid gap-3">
            {localVariants.map((variant, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all">
                <div className="flex flex-wrap items-center gap-4">
                  {/* Label from combination */}
                  <div className="flex-1 min-w-[200px]">
                    <div className="flex flex-wrap gap-1.5">
                      {Object.entries(variant.combination).map(([k, v]) => (
                        <span key={k} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-md text-xs font-bold border border-slate-200 dark:border-slate-600">
                          {k}: {v}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* SKU */}
                  <div className="flex-1 min-w-[150px]">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">SKU</label>
                    <input
                      type="text"
                      value={variant.sku}
                      onChange={(e) => updateVariant(idx, { sku: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs focus:ring-2 focus:ring-brand-500 outline-none transition-all font-mono"
                    />
                  </div>

                  {/* Price */}
                  <div className="w-28">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Price Override</label>
                    <div className="relative">
                      <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                      <input
                        type="number"
                        placeholder={basePrice.toString()}
                        value={variant.price || ''}
                        onChange={(e) => updateVariant(idx, { price: e.target.value ? Number(e.target.value) : undefined })}
                        className="w-full pl-7 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Stock */}
                  <div className="w-24">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Stock</label>
                    <input
                      type="number"
                      value={variant.stock}
                      onChange={(e) => updateVariant(idx, { stock: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                    />
                  </div>

                  {/* Images */}
                  <div className="flex-1 min-w-[150px]">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Images (CSV)</label>
                    <input
                      type="text"
                      placeholder="Image URL"
                      value={variant.images?.join(', ') || ''}
                      onChange={(e) => updateVariant(idx, { images: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const updated = localVariants.filter((_, i) => i !== idx);
                      setLocalVariants(updated);
                      onChange(localAttributes, updated);
                    }}
                    className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
