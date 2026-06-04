import React, { useCallback, useMemo } from "react";
import { Tag, Sparkles, ShoppingBag, Search, Eye, BadgePercent, Clock, Zap } from "lucide-react";
import { OffersVisibility } from "./offers/OffersVisibility";
import { OffersBanner } from "./offers/OffersBanner";
import { OffersGrid } from "./offers/OffersGrid";

interface OffersPageSettingProps {
  formData: any;
  setFormData: (data: any | ((prev: any) => any)) => void;
}

const OffersPageSetting = ({ formData, setFormData }: OffersPageSettingProps) => {
  const offersPage = useMemo(() => formData.offersPage || {}, [formData.offersPage]);
  const brandName = useMemo(() => formData.brandName || "My Store", [formData.brandName]);

  const handleUpdate = useCallback((field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      offersPage: {
        ...(prev.offersPage || {}),
        [field]: value,
      },
    }));
  }, [setFormData]);

  // Scaled height for the visual preview banner
  const previewBannerStyle = useMemo(() => {
    if (offersPage.bannerShow === false) return { height: "0px" };
    return {
      minHeight: `${Math.max(100, Math.min(200, (offersPage.bannerHeight || 400) * 0.4))}px`,
      backgroundColor: offersPage.bannerBackgroundColor || "#0f172a",
      backgroundImage: offersPage.bannerImage ? `url(${offersPage.bannerImage})` : undefined,
      backgroundSize: "cover",
      backgroundPosition: "center",
      color: offersPage.bannerTextColor || "#ffffff",
    };
  }, [offersPage]);

  // Map products per row to Tailwind columns for preview
  const gridColsClass = useMemo(() => {
    const colMap: Record<number, string> = {
      2: "grid-cols-2",
      3: "grid-cols-3",
      4: "grid-cols-4",
      5: "grid-cols-5",
      6: "grid-cols-6",
    };
    return colMap[offersPage.productsPerRow] || "grid-cols-5";
  }, [offersPage.productsPerRow]);

  // Alignments class inside preview hero banner
  const bannerAlignClass = useMemo(() => {
    const align = offersPage.bannerAlignment || "center";
    if (align === "left") return "items-start text-left";
    if (align === "right") return "items-end text-right";
    return "items-center text-center";
  }, [offersPage.bannerAlignment]);

  // Generate mock products based on products per row
  const mockProducts = useMemo(() => {
    const count = Math.max(3, Math.min(6, offersPage.productsPerRow || 5));
    return Array.from({ length: count }).map((_, idx) => ({
      id: idx,
      name: `Promo Item ${idx + 1}`,
      price: 79.99,
      originalPrice: 99.99,
      discount: "20% OFF",
    }));
  }, [offersPage.productsPerRow]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center mb-4 border border-brand-100 dark:border-brand-800">
            <Tag className="w-6 h-6 text-brand-600 dark:text-brand-400" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
            Offers Page Customization
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-2xl">
            Configure how your promotional offers are presented. Control banner content, filter visibility, and product grid density.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left column: Controls */}
        <div className="lg:col-span-7 space-y-8">
          <OffersVisibility
            bannerShow={offersPage.bannerShow !== false}
            showFilters={offersPage.showFilters !== false}
            onUpdate={handleUpdate}
          />

          <OffersBanner
            bannerShow={offersPage.bannerShow !== false}
            bannerHeadline={offersPage.bannerHeadline}
            bannerSubheadline={offersPage.bannerSubheadline}
            bannerImage={offersPage.bannerImage}
            bannerBackgroundColor={offersPage.bannerBackgroundColor}
            bannerTextColor={offersPage.bannerTextColor}
            bannerHeight={offersPage.bannerHeight}
            bannerFullWidth={offersPage.bannerFullWidth}
            bannerAlignment={offersPage.bannerAlignment}
            bannerOverlayOpacity={offersPage.bannerOverlayOpacity}
            onUpdate={handleUpdate}
          />

          <OffersGrid
            productsPerRow={offersPage.productsPerRow}
            countdownStyle={offersPage.countdownStyle}
            showCartButton={offersPage.showCartButton}
            showOriginalPrice={offersPage.showOriginalPrice}
            sortBy={offersPage.sortBy}
            onUpdate={handleUpdate}
          />
        </div>

        {/* Right column: Sticky visual preview */}
        <div className="lg:col-span-5 lg:sticky lg:top-8 self-start">
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-[2.5rem] p-5 border border-slate-100 dark:border-slate-800/60 shadow-inner">
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Live View Preview
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  Syncing
                </span>
              </div>
            </div>

            {/* Store Mockup Container */}
            <div className="bg-white dark:bg-slate-950 rounded-3xl shadow-2xl border border-slate-200/50 dark:border-slate-800/80 overflow-hidden relative select-none font-sans text-left transition-all duration-300">
              {/* Mock Browser Header */}
              <div className="bg-slate-100 dark:bg-slate-900 px-4 py-2 border-b border-slate-200/50 dark:border-slate-800/60 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                </div>
                <div className="flex-1 max-w-[200px] mx-auto bg-white dark:bg-slate-950 rounded-md py-0.5 px-2 text-[8px] text-slate-400 text-center truncate border border-slate-200/30 dark:border-slate-800/30">
                  {brandName.toLowerCase().replace(/\s+/g, "")}.com/offers
                </div>
              </div>

              {/* Mock Store Header / Navbar */}
              <div className="px-4 py-2.5 bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-900 flex items-center justify-between text-[10px]">
                <div className="font-extrabold text-slate-900 dark:text-white tracking-tight uppercase italic flex items-center gap-1">
                  <ShoppingBag className="w-3.5 h-3.5 text-brand-600" />
                  {brandName}
                </div>
                <div className="hidden sm:flex gap-3 font-semibold text-slate-500 dark:text-slate-400 text-[8px]">
                  <span>Home</span>
                  <span>Products</span>
                  <span className="text-brand-600 dark:text-brand-400 border-b border-brand-500 font-bold">Offers</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Search className="w-3 h-3" />
                  <ShoppingBag className="w-3 h-3" />
                </div>
              </div>

              {/* Mock Hero Banner */}
              {offersPage.bannerShow !== false ? (
                <div
                  style={previewBannerStyle}
                  className={`relative overflow-hidden flex flex-col justify-center p-6 transition-all duration-300 ${bannerAlignClass} ${
                    offersPage.bannerFullWidth ? "" : "m-3 rounded-2xl"
                  } ${!offersPage.bannerBackgroundColor && !offersPage.bannerImage ? "bg-slate-50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-900" : ""}`}
                >
                  {/* Decorative glowing blobs if no image */}
                  {!offersPage.bannerImage && (
                    <>
                      <div className="absolute -top-12 -right-12 w-28 h-28 bg-brand-500/10 rounded-full blur-2xl z-0" />
                      <div className="absolute -bottom-12 -left-12 w-28 h-28 bg-brand-600/5 rounded-full blur-2xl z-0" />
                    </>
                  )}

                  {/* Dimmer overlay if there's a background image */}
                  {offersPage.bannerImage && (
                    <div
                      className="absolute inset-0 bg-black z-0 transition-opacity duration-300"
                      style={{ opacity: (offersPage.bannerOverlayOpacity !== undefined ? offersPage.bannerOverlayOpacity : 40) / 100 }}
                    />
                  )}

                  <div className="relative z-10 max-w-[90%] mx-auto">
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 text-current opacity-85 text-[8px] font-semibold mb-2">
                      <Zap className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                      Promo Deals
                    </div>
                    <h4 className="text-sm md:text-base font-black mb-1.5 leading-tight tracking-tight break-words">
                      {(offersPage.bannerHeadline || "").includes("🔥") ? "" : "🔥 "}{offersPage.bannerHeadline || "Special Offers"}
                    </h4>
                    <p className="text-[9px] opacity-80 line-clamp-2 max-w-xs mx-auto">
                      {offersPage.bannerSubheadline || "Check out our best promotions and discounts!"}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="m-3 p-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-center bg-slate-50/50 dark:bg-slate-900/10">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-slate-300" />
                    Hero Banner Hidden
                  </span>
                </div>
              )}

              {/* Mock Content Body */}
              <div className="p-4 space-y-4">
                {/* Mock Filter Tabs */}
                {offersPage.showFilters !== false && (
                  <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    <button className="shrink-0 px-2 py-1 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-lg text-[8px] shadow-sm">
                      All Offers
                    </button>
                    <button className="shrink-0 px-2 py-1 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200/40 dark:border-slate-800/40 font-medium rounded-lg text-[8px]">
                      Flash Sale
                    </button>
                    <button className="shrink-0 px-2 py-1 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200/40 dark:border-slate-800/40 font-medium rounded-lg text-[8px]">
                      BOGO Deals
                    </button>
                  </div>
                )}

                {/* Mock Header and countdown timer based on countdownStyle */}
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-900 pb-1.5 gap-2">
                  <div className="space-y-0.5 min-w-0">
                    <span className="text-[9px] font-black text-slate-800 dark:text-slate-200 block truncate">Active Deals</span>
                    {offersPage.countdownStyle === "compact" && (
                      <span className="text-[7px] text-rose-500 font-bold flex items-center gap-0.5">
                        <Clock className="w-2 h-2" /> Ends in: 01d 05h 42m
                      </span>
                    )}
                  </div>

                  {offersPage.countdownStyle === "classic" && (
                    <div className="flex gap-1 items-center shrink-0">
                      <span className="text-[7px] text-slate-400 font-black uppercase mr-1">Ends:</span>
                      {["01", "05", "42"].map((val, idx) => (
                        <div key={idx} className="w-5 h-5 bg-brand-600 text-white rounded flex items-center justify-center text-[8px] font-bold">
                          {val}
                        </div>
                      ))}
                    </div>
                  )}

                  <span className="text-[8px] text-slate-400 font-medium shrink-0 align-self-end">
                    Sorted by: {offersPage.sortBy === "ending_soon" ? "Time" : offersPage.sortBy === "discount_desc" ? "Discount" : "Newest"}
                  </span>
                </div>

                {/* Mock Products Grid */}
                <div className={`grid ${gridColsClass} gap-2`}>
                  {mockProducts.map((prod) => (
                    <div
                      key={prod.id}
                      className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-900 rounded-xl p-1.5 flex flex-col justify-between transition-all duration-300 hover:scale-[1.02]"
                    >
                      <div className="aspect-square bg-slate-200/60 dark:bg-slate-800 rounded-lg relative overflow-hidden flex items-center justify-center">
                        <BadgePercent className="w-5 h-5 text-slate-400/80" />
                        <span className="absolute top-1 left-1 bg-rose-500 text-white text-[6px] font-black px-1 py-0.5 rounded-md">
                          {prod.discount}
                        </span>
                      </div>
                      
                      <div className="mt-2 flex items-center justify-between gap-1">
                        <div className="space-y-0.5 min-w-0 flex-1">
                          <div className="text-[7px] font-bold text-slate-900 dark:text-white truncate">
                            {prod.name}
                          </div>
                          <div className="flex items-center gap-1 text-[7px] flex-wrap">
                            <span className="font-extrabold text-brand-600 dark:text-brand-400">${prod.price}</span>
                            {offersPage.showOriginalPrice !== false && (
                              <span className="text-slate-400 line-through text-[6px]">${prod.originalPrice}</span>
                            )}
                          </div>
                        </div>
                        {offersPage.showCartButton && (
                          <button className="bg-brand-600 hover:bg-brand-700 text-white p-1 rounded-md text-[6px] font-bold transition-all shrink-0">
                            + Add
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OffersPageSetting;
