import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import type { Product, ProductVariant } from '../type';

interface VariantSelectorModalProps {
  selectedProductForVariant: Product | null;
  setSelectedProductForVariant: (p: Product | null) => void;
  selectedVariant: ProductVariant | null;
  setSelectedVariant: (v: ProductVariant | null) => void;
  executeAddToCart: (p: Product, v?: ProductVariant) => void;
}

export default function VariantSelectorModal({
  selectedProductForVariant,
  setSelectedProductForVariant,
  selectedVariant,
  setSelectedVariant,
  executeAddToCart,
}: VariantSelectorModalProps) {
  return (
    <AnimatePresence>
      {selectedProductForVariant && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col"
          >
            <div className="p-6 border-b border-slate-105 dark:border-slate-850 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  Select Variation
                </h3>
                <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                  {selectedProductForVariant.name}
                </p>
              </div>
              <button
                onClick={() => setSelectedProductForVariant(null)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex flex-wrap gap-2.5">
                {selectedProductForVariant.variants?.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedVariant(v)}
                    className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all ${selectedVariant?.id === v.id
                      ? 'bg-slate-900 border-slate-900 text-white dark:bg-white dark:border-white dark:text-slate-900'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-400 text-slate-655'
                      }`}
                  >
                    {Object.entries(v.combination || {})
                      .map(([k, val]) => `${k}: ${val}`)
                      .join(' / ')}{' '}
                    (${v.price || selectedProductForVariant.price})
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-850 flex justify-end gap-2.5">
              <button
                onClick={() => setSelectedProductForVariant(null)}
                className="px-4 py-2.5 text-xs font-bold text-slate-500 border border-slate-200 dark:border-slate-850 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  executeAddToCart(
                    selectedProductForVariant,
                    selectedVariant || undefined
                  );
                  setSelectedProductForVariant(null);
                }}
                className="px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-black rounded-xl"
              >
                Add Selection
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
