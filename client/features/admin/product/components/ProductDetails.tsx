"use client";

import Price from "@/components/shared/Price";
import { useCart } from "@/hooks/CartContext";
import { useSettings } from "@/hooks/SettingsContext";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  Heart,
  Maximize2,
  Minus,
  Plus,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Star,
  X,
  Tag
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ProductDetailsProps } from "../types";
import { calculatePricing } from "@/lib/utils";
import { PromotionType } from "@/lib/enums/promotion-type";


const ProductDetails = ({ product }: ProductDetailsProps) => {
  const { settings } = useSettings();
  const { addToCart } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<
    "description" | "specs" | "shipping"
  >("description");
  const [selectedAttributes, setSelectedAttributes] = useState<
    Record<string, string>
  >({});
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isStickyVisible, setIsStickyVisible] = useState(false);
  const [averageRating, setAverageRating] = useState(0);

  // Initialize attributes
  useEffect(() => {
    if (product?.attributes?.length > 0) {
      const initialAttrs: Record<string, string> = {};
      product.attributes.forEach((attr: any) => {
        if (attr.values?.length > 0) {
          initialAttrs[attr.name] = attr.values[0];
        }
      });
      setSelectedAttributes(initialAttrs);
    }
    if (product.reviews && product.reviews.length > 0) {
      const totalRating = product.reviews.reduce(
        (sum: number, review: any) => sum + review.rating,
        0,
      );
      const avgRating = totalRating / product.reviews.length;
      setAverageRating(avgRating);
    } else {
      setAverageRating(0);
    }
  }, [product]);

  // Update selected variant when attributes change
  useEffect(() => {
    if (product?.variants?.length > 0) {
      const variant = product.variants.find((v: any) => {
        return Object.entries(selectedAttributes).every(([attrName, value]) => {
          return v.combination[attrName] === value;
        });
      });
      setSelectedVariant(variant || null);
    }
  }, [selectedAttributes, product]);

  // Handle scroll for sticky bar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 600) {
        setIsStickyVisible(true);
      } else {
        setIsStickyVisible(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!product) return null;

  const currentPrice = selectedVariant?.price
    ? Number(selectedVariant.price)
    : product.price;
  const currentStock = selectedVariant ? selectedVariant.stock : product.stock;
  const currentImages =
    selectedVariant?.images && selectedVariant.images.length > 0
      ? selectedVariant.images
      : product.images && product.images.length > 0
        ? product.images
        : ["https://placeholder.com/600"];

  const images = currentImages;


  const handleAddToCart = () => {
    addToCart(product.id, quantity, selectedVariant?.id);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text:
            product.shortDescription ||
            product.description?.substring(0, 100),
          url: window.location.href,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  const { finalPrice, discountAmount: discountAmt } = calculatePricing(
    Number(currentPrice || 0),
    Number(product.discountAmount || 0),
    product.discountType || 'fixed',
    Number(product.taxRate || 0)
  );

  const basePrice = Number(currentPrice || 0);

  const discountPercent =
    discountAmt > 0 && basePrice > 0
      ? Math.round((discountAmt / basePrice) * 100)
      : 0;

  const validPromotions = product.applicablePromotions?.filter((p: any) => p.isActive) || [];

  const handleAttributeChange = (name: string, value: string) => {
    setSelectedAttributes((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <section className="py-12 md:py-20 bg-white dark:bg-slate-950 mt-20">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-start">
          {/* Image Gallery Section */}
          <div className="space-y-4">
            <div className="relative">
              {/* Main Image */}
              <motion.div
                key={selectedImage + (selectedVariant?.id || "base")}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative aspect-square rounded-[2rem] overflow-hidden bg-slate-100 dark:bg-slate-900 group cursor-zoom-in"
                onClick={() => setIsLightboxOpen(true)}
              >
                <img
                  src={images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 flex items-center justify-center">
                  <Maximize2 className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-10 h-10" />
                </div>

                {discountPercent > 0 && (
                  <div className="absolute top-6 right-6 px-4 py-2 bg-red-600 text-white rounded-full font-black text-xs shadow-xl z-10">
                    -{discountPercent}% OFF
                  </div>
                )}
              </motion.div>
            </div>

            {/* Thumbnail Images */}
            {images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
                {images.map((image: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative w-24 h-24 flex-shrink-0 rounded-2xl overflow-hidden border-2 transition-all duration-300 ${selectedImage === idx
                      ? "border-brand-600 ring-4 ring-brand-500/10"
                      : "border-transparent hover:border-slate-300 dark:hover:border-slate-700"
                      }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} - ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info Section */}
          <div className="space-y-8">
            <div>
              {/* Breadcrumb */}
              {settings?.singleProductPage?.showBreadcrumb !== false && (
                <nav
                  className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-6"
                  aria-label="Breadcrumb"
                >
                  <Link
                    href="/"
                    className="hover:text-brand-600 transition-colors"
                  >
                    Home
                  </Link>
                  <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                  <Link
                    href="/products"
                    className="hover:text-brand-600 transition-colors"
                  >
                    Products
                  </Link>
                  {product.category && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                      <Link
                        href={`/products?category=${product.category.slug || product.category.id}`}
                        className="hover:text-brand-600 transition-colors"
                      >
                        {product.category.name}
                      </Link>
                    </>
                  )}
                </nav>
              )}
              <div className="flex items-start justify-between gap-4 mb-4">
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight">
                  {product.name}
                </h1>
                <button className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <Heart className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              {/* Ratings & Real-time Info */}
              {(settings?.singleProductPage?.showRating !== false) && (
                <div className="flex items-center gap-6 mb-8">
                  <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 dark:bg-slate-900 rounded-full border border-slate-100 dark:border-slate-800">
                    <div className="flex -space-x-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3 h-3 ${s <= Math.floor(averageRating)
                            ? 'text-orange-400 fill-orange-400'
                            : s - 0.5 <= averageRating
                              ? 'text-orange-400 fill-orange-400/50'
                              : 'text-slate-300 dark:text-slate-600'
                            }`}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase leading-none mt-0.5">
                      {averageRating > 0 ? `${averageRating.toFixed(1)} / 5.0` : 'No reviews yet'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                      {product.reviews?.length} Reviews
                    </span>
                  </div>
                </div>
              )}

              {/* Promotions Banners */}
              {validPromotions.length > 0 && settings?.singleProductPage?.showPromotions !== false && (
                <div className="flex flex-col gap-2 mb-6">
                  {validPromotions.map((promo: any) => (
                    <div key={promo.id} className="flex items-center gap-3 p-3 bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800 rounded-2xl">
                      <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-800 flex items-center justify-center shrink-0">
                        <Tag className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-brand-900 dark:text-brand-100">{promo.name}</p>
                        {promo.description && <p className="text-xs text-brand-700 dark:text-brand-300">{promo.description}</p>}
                      </div>
                      <div className="px-3 py-1 bg-brand-600 text-white text-xs font-black uppercase rounded-full">
                        {promo.promotionType === PromotionType.PERCENTAGE && `${promo.value}% OFF`}
                        {promo.promotionType === PromotionType.FIXED && `${promo.value} OFF`}
                        {promo.promotionType === PromotionType.FREE_SHIPPING && `FREE SHIP`}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {product.shortDescription && (
                <p
                  dangerouslySetInnerHTML={{ __html: product.shortDescription }}
                  className="text-xl text-slate-600 dark:text-slate-400 font-medium leading-relaxed italic border-l-4 border-brand-500 pl-4 mb-8" />
              )}
            </div>

            {/* Price & Stock info */}
            <div className="bg-slate-50 dark:bg-slate-900/50 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-brand-500/10 transition-colors" />

              <div className="space-y-2 relative z-10">
                <div className="flex items-baseline gap-3">
                  {discountAmt > 0 ? (
                    <>
                      <Price
                        amount={finalPrice}
                        className="text-5xl font-black text-brand-600 dark:text-brand-400 tracking-tight"
                      />
                      <Price
                        amount={Number(currentPrice)}
                        className="text-xl text-slate-400 line-through font-bold"
                      />
                      <span className="px-2 py-1 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-xs font-black rounded-full">
                        -{discountPercent}% OFF
                      </span>
                    </>
                  ) : (
                    <Price
                      amount={finalPrice}
                      className="text-5xl font-black text-slate-900 dark:text-white tracking-tight"
                    />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3 h-3 text-brand-500" />
                  <p className="text-[10px] uppercase tracking-widest font-black text-slate-500">
                    Tax inclusive & Secure checkout
                  </p>
                </div>
              </div>

              {settings?.singleProductPage?.showStock !== false && (
                <div className="flex flex-col items-end">
                  <span
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wider ${currentStock > (product.lowStockThreshold || 5)
                      ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                      : currentStock > 0
                        ? "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400"
                        : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                      }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full animate-pulse ${currentStock > (product.lowStockThreshold || 5) ? "bg-green-500" : currentStock > 0 ? "bg-orange-500" : "bg-red-500"}`}
                    />
                    {currentStock > (product.lowStockThreshold || 5)
                      ? "Available"
                      : currentStock > 0
                        ? `Only ${currentStock} Left`
                        : "Sold Out"}
                  </span>
                </div>
              )}
            </div>

            {/* Attribute Selection */}
            {product.attributes?.length > 0 && (
              <div className="space-y-6">
                {product.attributes.map((attr: any) => (
                  <div key={attr.id} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-widest text-slate-500">
                        {attr.name}
                      </span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {selectedAttributes[attr.name]}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {attr.values.map((val: string) => {
                        const isSelected =
                          selectedAttributes[attr.name] === val;
                        const isColor = attr.name.toLowerCase() === "color";

                        return (
                          <button
                            key={val}
                            onClick={() =>
                              handleAttributeChange(attr.name, val)
                            }
                            className={`relative overflow-hidden transition-all duration-300 ${isColor
                              ? "w-10 h-10 rounded-full border-2 p-1"
                              : "px-6 py-2 rounded-xl border-2 font-bold text-sm"
                              } ${isSelected
                                ? "border-brand-600 bg-brand-50 dark:bg-brand-900/20 text-brand-600"
                                : "border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-600 dark:text-slate-400"
                              }`}
                          >
                            {isColor ? (
                              <span
                                className="block w-full h-full rounded-full shadow-inner"
                                style={{ backgroundColor: val.toLowerCase() }}
                              />
                            ) : (
                              val
                            )}
                            {isSelected && (
                              <div className="absolute top-0 right-0 p-0.5">
                                <Check
                                  className={`w-3 h-3 ${isColor ? "text-white drop-shadow-md" : "text-brand-600"}`}
                                />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Quantity & CTA */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center bg-slate-100 dark:bg-slate-900 rounded-2xl p-1 shrink-0">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="w-12 text-center font-black text-lg">
                  {quantity}
                </span>
                <button
                  onClick={() =>
                    setQuantity(Math.min(currentStock || 999, quantity + 1))
                  }
                  className="p-3 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={currentStock <= 0}
                className="flex-1 py-4 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-black rounded-2xl transition-all shadow-xl shadow-brand-500/30 hover:shadow-brand-500/50 flex items-center justify-center gap-3 transform hover:-translate-y-1 active:scale-95"
              >
                <ShoppingBag className="w-6 h-6" />
                {currentStock <= 0
                  ? "Out of Stock"
                  : "Add to Cart"
                }
              </button>

              {settings?.singleProductPage?.showShare !== false && (
                <button
                  onClick={handleShare}
                  className="p-4 border-2 border-slate-100 dark:border-slate-800 hover:border-brand-600 hover:text-brand-600 rounded-2xl transition-all active:scale-90"
                >
                  <Share2 className="w-6 h-6" />
                </button>
              )}
            </div>

            {/* Features List */}
            {product.features && product.features.length > 0 && settings?.singleProductPage?.showFeatures !== false && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {product.features.map((feature: string, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl"
                  >
                    <div className="w-8 h-8 rounded-full bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center shrink-0">
                      <Check className="w-4 h-4 text-brand-600" />
                    </div>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Trust Badges */}
            <div className={`grid ${(settings?.trustBadges?.length || 0) > 1 ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
              {(settings?.trustBadges || [
                { title: '100% Protected', description: 'Security', icon: 'ShieldCheck', color: 'green' },
                { title: 'Global Delivery', description: 'Shipping', icon: 'Truck', color: 'blue' }
              ]).map((badge: any, index: number) => {
                const IconComponent = (require('lucide-react') as any)[badge.icon] || ShieldCheck;
                const colors: any = {
                  green: 'bg-green-50 dark:bg-green-900/20 text-green-600',
                  blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600',
                };
                // Auto-color based on icon if not provided
                const colorClass = colors[badge.color] ||
                  (badge.icon?.toLowerCase().includes('shield') ? colors.green : colors.blue);

                return (
                  <div key={index} className="flex items-center gap-4 p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl group hover:border-brand-500/30 transition-all duration-500">
                    <div className={`w-12 h-12 ${colorClass.split(' ').slice(0, 2).join(' ')} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <IconComponent className={`w-7 h-7 ${colorClass.split(' ').pop()}`} />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-black text-slate-400">
                        {badge.description}
                      </p>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        {badge.title}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Tabs Section */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-12">
              <div className="flex gap-2 mb-8 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl w-fit">
                {["description", "specs"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${activeTab === tab
                      ? "bg-white dark:bg-slate-800 text-brand-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                      }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="prose prose-slate dark:prose-invert max-w-none px-2"
                >
                  {activeTab === "description" && (
                    <div
                      dangerouslySetInnerHTML={{
                        __html:
                          product.description || "No description available.",
                      }}
                    />
                  )}
                  {activeTab === "specs" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {product.attributes?.map((attr: any) => (
                        <div
                          key={attr.id}
                          className="flex justify-between py-4 px-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800"
                        >
                          <span className="text-xs uppercase tracking-widest font-black text-slate-400">
                            {attr.name}
                          </span>
                          <span className="text-sm font-bold">
                            {attr.values.join(", ")}
                          </span>
                        </div>
                      ))}
                      {product.specifications?.map((spec: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex justify-between py-4 px-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800"
                        >
                          <span className="text-xs uppercase tracking-widest font-black text-slate-400">
                            {spec.label}
                          </span>
                          <span className="text-sm font-bold">
                            {spec.value}
                          </span>
                        </div>
                      ))}
                      {!product.attributes?.length &&
                        !product.specifications?.length && (
                          <p className="text-slate-500">
                            No specifications available.
                          </p>
                        )}
                    </div>
                  )}
                  {/* {activeTab === "shipping" && (
                    <div className="grid gap-6">
                      <div className="flex gap-4 p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <TruckIcon className="w-8 h-8 text-brand-600 shrink-0" />
                        <div>
                          <h4 className="font-black text-slate-900 dark:text-white mb-2">
                            Fast Delivery
                          </h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            Standard: 5-7 business days. Express: 2-3 business
                            days.
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-4 p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <ShieldCheck className="w-8 h-8 text-green-600 shrink-0" />
                        <div>
                          <h4 className="font-black text-slate-900 dark:text-white mb-2">
                            Hassle-Free Returns
                          </h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            30-day money-back guarantee. Return shipping is on
                            us!
                          </p>
                        </div>
                      </div>
                    </div>
                  )} */}

                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col p-4 md:p-12 items-center justify-center"
            onClick={() => setIsLightboxOpen(false)}
          >
            <button className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors">
              <X className="w-10 h-10" />
            </button>

            <div className="flex flex-col items-center justify-center max-h-full w-full max-w-5xl gap-6">
              <div className="relative w-full aspect-square md:aspect-video flex items-center justify-center flex-1 min-h-0">
                <img
                  src={images[selectedImage]}
                  alt={product.name}
                  className="object-contain max-h-full rounded-3xl w-auto h-auto max-w-full"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              {images.length > 1 && (
                <div
                  className="flex gap-4 overflow-x-auto max-w-full pb-4 scrollbar-none shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  {images.map((img: string, i: number) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`relative w-20 h-20 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${selectedImage === i ? "border-brand-500 scale-110" : "border-transparent opacity-50 hover:opacity-100"}`}
                    >
                      <img src={img} alt="thumb" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sticky Mobile Bar */}
      <AnimatePresence>
        {isStickyVisible && settings?.singleProductPage?.showStickyCart !== false && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-0 left-0 right-0 z-50 p-4 lg:hidden"
          >
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-4 flex items-center justify-between gap-4 shadow-2xl shadow-black/20">
              <div className="flex flex-col pl-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Total Price
                </span>
                <Price
                  amount={finalPrice * quantity}
                  className="text-xl font-black text-slate-900 dark:text-white"
                />
              </div>
              <button
                onClick={handleAddToCart}
                disabled={currentStock <= 0}
                className="px-8 py-3.5 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white font-black rounded-full shadow-lg shadow-brand-500/30 transition-all flex items-center gap-2"
              >
                <ShoppingBag className="w-5 h-5" />
                {currentStock <= 0 ? "Out" : "Add"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default ProductDetails;
