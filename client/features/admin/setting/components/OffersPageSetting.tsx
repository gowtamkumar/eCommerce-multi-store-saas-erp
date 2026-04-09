import React, { useCallback, useMemo } from "react";
import { Tag } from "lucide-react";
import { OffersVisibility } from "./offers/OffersVisibility";
import { OffersBanner } from "./offers/OffersBanner";
import { OffersGrid } from "./offers/OffersGrid";

interface OffersPageSettingProps {
  formData: any;
  setFormData: (data: any | ((prev: any) => any)) => void;
}

const OffersPageSetting = ({ formData, setFormData }: OffersPageSettingProps) => {
  const offersPage = useMemo(() => formData.offersPage || {}, [formData.offersPage]);

  const handleUpdate = useCallback((field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      offersPage: {
        ...(prev.offersPage || {}),
        [field]: value,
      },
    }));
  }, [setFormData]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
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
        onUpdate={handleUpdate}
      />

      <OffersGrid
        productsPerRow={offersPage.productsPerRow}
        onUpdate={handleUpdate}
      />
    </div>
  );
};

export default OffersPageSetting;
