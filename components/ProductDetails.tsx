'use client';

import Price from "@/components/Price";
import { useCart } from "@/contexts/CartContext";
import { useSettings } from "@/contexts/SettingsContext";
import { motion } from 'framer-motion';
import { Minus, Plus, Share2, ShieldCheck, ShoppingBag, TruckIcon } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface ProductDetailsProps {
  product: any;
}

const ProductDetails = ({ product }: ProductDetailsProps) => {
  const { formatPrice } = useSettings();
  const { addToCart } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'shipping'>('description');

  if (!product) return null;

  const images = product.images && product.images.length > 0
    ? product.images
    : ["https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=1000&auto=format&fit=crop"];

  const handleAddToCart = () => {
    addToCart(product.id, quantity);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.tagline || product.description?.substring(0, 100),
          url: window.location.href,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const discountPercent = product.discountAmount > 0
    ? Math.round((product.discountAmount / product.price) * 100)
    : 0;

  return (
    <section className="py-12 md:py-20 bg-white dark:bg-slate-900">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-start">
          {/* Image Gallery Section */}
          <div className="space-y-4">
            {/* Main Image */}
            <motion.div
              key={selectedImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative aspect-square rounded-3xl overflow-hidden bg-slate-100 dark:bg-slate-800 group"
            >
              <Image
                src={images[selectedImage]}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                priority
              />
              {discountPercent > 0 && (
                <div className="absolute top-4 right-4 px-4 py-2 bg-red-500 text-white rounded-full font-bold text-sm shadow-lg">
                  -{discountPercent}%
                </div>
              )}
              {product.stock <= 0 && (
                <div className="absolute top-4 left-4 px-4 py-2 bg-slate-900 text-white rounded-full font-bold text-sm">
                  Out of Stock
                </div>
              )}
            </motion.div>

            {/* Thumbnail Images */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {images.map((image: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${selectedImage === idx
                      ? 'border-brand-600 ring-2 ring-brand-200 dark:ring-brand-800'
                      : 'border-slate-200 dark:border-slate-700 hover:border-brand-300'
                      }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} - ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info Section */}
          <div className="lg:sticky lg:top-24 space-y-6">
            {/* Breadcrumb / Category */}
            {product.category && (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <span>Home</span>
                <span>/</span>
                <span>Products</span>
                <span>/</span>
                <span className="text-brand-600 font-medium">{product.category.name || 'Category'}</span>
              </div>
            )}

            {/* Product Name */}
            <div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white mb-3 font-display">
                {product.name}
              </h1>
              {product.tagline && (
                <p className="text-lg text-slate-600 dark:text-slate-400">{product.tagline}</p>
              )}
            </div>

            {/* Price */}
            <div className="border-y border-slate-200 dark:border-slate-700 py-6">
              <div className="flex items-baseline gap-3">
                {product.discountAmount > 0 ? (
                  <>
                    <Price
                      amount={product.price - product.discountAmount}
                      className="text-4xl font-bold text-brand-600 dark:text-brand-400"
                    />
                    <Price
                      amount={product.price}
                      className="text-xl text-slate-400 line-through"
                    />
                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-sm font-bold rounded-full">
                      Save {formatPrice(product.discountAmount)}
                    </span>
                  </>
                ) : (
                  <Price
                    amount={product.price}
                    className="text-4xl font-bold text-slate-900 dark:text-white"
                  />
                )}
              </div>
              <p className="text-sm text-slate-500 mt-2">Tax included. Shipping calculated at checkout.</p>
            </div>

            {/* Quantity Selector */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Quantity</label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border-2 border-slate-200 dark:border-slate-700 rounded-xl">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-6 font-bold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock || 999, quantity + 1))}
                    className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {product.stock > 0 && product.stock < 10 && (
                  <span className="text-sm text-orange-500 font-medium">
                    Only {product.stock} left in stock
                  </span>
                )}
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className="flex-1 py-4 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-5 h-5" />
                {product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
              <button
                onClick={handleShare}
                className="p-4 border-2 border-slate-200 dark:border-slate-700 hover:border-brand-600 hover:text-brand-600 rounded-xl transition-colors"
                title="Share"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-3 pt-4">
              <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <ShieldCheck className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Secure Payment</p>
                  <p className="text-xs text-slate-500">100% Protected</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <TruckIcon className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Free Shipping</p>
                  <p className="text-xs text-slate-500">On orders over $50</p>
                </div>
              </div>
            </div>

            {/* Tabs Section */}
            <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
              <div className="flex gap-2 mb-6 border-b border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => setActiveTab('description')}
                  className={`pb-3 px-4 font-bold text-sm transition-all border-b-2 ${activeTab === 'description'
                    ? 'border-brand-600 text-brand-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                >
                  Description
                </button>
                <button
                  onClick={() => setActiveTab('specs')}
                  className={`pb-3 px-4 font-bold text-sm transition-all border-b-2 ${activeTab === 'specs'
                    ? 'border-brand-600 text-brand-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                >
                  Specifications
                </button>
                <button
                  onClick={() => setActiveTab('shipping')}
                  className={`pb-3 px-4 font-bold text-sm transition-all border-b-2 ${activeTab === 'shipping'
                    ? 'border-brand-600 text-brand-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                >
                  Shipping
                </button>
              </div>

              <div className="prose prose-slate dark:prose-invert max-w-none">
                {activeTab === 'description' && (
                  <div dangerouslySetInnerHTML={{ __html: product.description || 'No description available.' }} />
                )}
                {activeTab === 'specs' && (
                  <div className="space-y-2">
                    {product.specifications && product.specifications.length > 0 ? (
                      product.specifications.map((spec: any, idx: number) => (
                        <div key={idx} className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                          <span className="font-semibold">{spec.label}</span>
                          <span className="text-slate-600 dark:text-slate-400">{spec.value}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-500">No specifications available.</p>
                    )}
                  </div>
                )}
                {activeTab === 'shipping' && (
                  <div className="space-y-4">
                    <p><strong>Standard Shipping:</strong> 5-7 business days</p>
                    <p><strong>Express Shipping:</strong> 2-3 business days</p>
                    <p><strong>Free Shipping:</strong> On orders over $50</p>
                    <p className="text-sm text-slate-500">All items are carefully packaged to ensure safe delivery.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductDetails;
