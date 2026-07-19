"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { fetchAPI } from "@/services/api";
import { createRequisition } from "@/services/procurement";
import { Product } from "@/features/admin/product/types";
import type { RequisitionJustificationResult } from "@/features/admin/ai/types/ai-studio";

interface AddedItem {
  productId: string;
  variantId?: string | null;
  name: string;
  quantity: number;
  notes?: string;
}

export function useCreateRequisitionModal(onSuccess: () => void, isOpen: boolean) {
  const [justification, setJustification] = useState("");
  const [requiredDate, setRequiredDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedVariantId, setSelectedVariantId] = useState("");
  const [selectedQty, setSelectedQty] = useState(1);
  const [selectedNotes, setSelectedNotes] = useState("");
  const [addedItems, setAddedItems] = useState<AddedItem[]>([]);

  const fetchProducts = async (query: string) => {
    setSearchLoading(true);
    try {
      const params = new URLSearchParams({ limit: "50", includeVariants: "true" });
      if (query.trim()) params.set("q", query.trim());
      const res = await fetchAPI(`/products?${params.toString()}`);
      if (res.success) {
        const list = res.data?.products ?? (Array.isArray(res.data) ? res.data : []);
        setProducts(list);
      }
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setSearchLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (!isOpen) return;
    void fetchProducts("");
  }, [isOpen]);

  // Debounced search on query change
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      void fetchProducts(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, isOpen]);

  const handleAddItem = () => {
    if (!selectedProductId) {
      toast.error("Select a product first");
      return;
    }
    const product = products.find((p) => String(p.id) === String(selectedProductId));
    if (!product) return;

    // Check if variant is selected if the product has variants
    const hasVariants = product.variants && product.variants.length > 0;
    if (hasVariants && !selectedVariantId) {
      toast.error("Please select a variant");
      return;
    }

    const variant = product.variants?.find((v) => String(v.id) === String(selectedVariantId));
    const variantNameSuffix = variant
      ? ` (${Object.values(variant.combination || {}).join(" / ") || variant.sku})`
      : "";

    if (
      addedItems.some(
        (item) =>
          String(item.productId) === String(selectedProductId) &&
          String(item.variantId) === String(selectedVariantId || ""),
      )
    ) {
      toast.error("Product variant already added");
      return;
    }

    setAddedItems([
      ...addedItems,
      {
        productId: String(selectedProductId),
        variantId: selectedVariantId ? String(selectedVariantId) : null,
        name: `${product.name}${variantNameSuffix}`,
        quantity: selectedQty,
        notes: selectedNotes,
      },
    ]);

    setSelectedProductId("");
    setSelectedVariantId("");
    setSearchQuery("");
    setSelectedQty(1);
    setSelectedNotes("");
  };

  const handleRemoveItem = (index: number) => {
    setAddedItems(addedItems.filter((_, i) => i !== index));
  };

  const applyJustificationResult = (result: RequisitionJustificationResult) => {
    setJustification(result.justificationText);
    setAddedItems((prev) =>
      prev.map((item, index) => ({
        ...item,
        notes: result.lineNotes[index]?.trim() || item.notes,
      })),
    );
  };

  const handleCreatePR = async (e: React.FormEvent) => {
    e.preventDefault();

    const finalItems = [...addedItems];

    console.debug("Creating PR - addedItems:", addedItems, "selectedProductId:", selectedProductId);

    // Automatically add the currently selected product if the user forgot to click "Add"
    if (selectedProductId) {
      const product = products.find((p) => String(p.id) === String(selectedProductId));
      if (product) {
        const hasVariants = product.variants && product.variants.length > 0;
        if (!hasVariants || selectedVariantId) {
          const variant = product.variants?.find((v) => String(v.id) === String(selectedVariantId));
          const variantNameSuffix = variant
            ? ` (${Object.values(variant.combination || {}).join(" / ") || variant.sku})`
            : "";
          
          if (
            !addedItems.some(
              (item) =>
                String(item.productId) === String(selectedProductId) &&
                String(item.variantId) === String(selectedVariantId || ""),
            )
          ) {
            finalItems.push({
              productId: String(selectedProductId),
              variantId: selectedVariantId ? String(selectedVariantId) : null,
              name: `${product.name}${variantNameSuffix}`,
              quantity: selectedQty,
              notes: selectedNotes,
            });
          }
        }
      }
    }

    if (finalItems.length === 0) {
      toast.error("Add at least one product");
      return;
    }
    if (!requiredDate) {
      toast.error("Please enter a required date");
      return;
    }

    try {
      await createRequisition({
        justification,
        requiredDate: new Date(requiredDate).toISOString(),
        items: finalItems.map((item) => ({
          productId: item.productId,
          variantId: item.variantId || undefined,
          quantity: item.quantity,
          notes: item.notes,
        })),
      });

      toast.success("Requisition submitted as Draft");
      setJustification("");
      setRequiredDate("");
      setAddedItems([]);
      setSelectedProductId("");
      setSelectedVariantId("");
      setSearchQuery("");
      setSelectedQty(1);
      setSelectedNotes("");
      onSuccess();
    } catch (err) {
      console.error(err);
      toast.error("Failed to create requisition");
    }
  };

  return {
    justification,
    setJustification,
    requiredDate,
    setRequiredDate,
    products,
    searchQuery,
    setSearchQuery,
    searchLoading,
    selectedProductId,
    setSelectedProductId,
    selectedVariantId,
    setSelectedVariantId,
    selectedQty,
    setSelectedQty,
    selectedNotes,
    setSelectedNotes,
    addedItems,
    handleAddItem,
    handleRemoveItem,
    applyJustificationResult,
    handleCreatePR,
  };
}
