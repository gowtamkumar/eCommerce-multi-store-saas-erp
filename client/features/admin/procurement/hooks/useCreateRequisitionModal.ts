"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { fetchAPI } from "@/services/api";
import { createRequisition } from "@/services/procurement";
import { Product } from "@/features/admin/product/types";

interface AddedItem {
  productId: string;
  name: string;
  quantity: number;
  notes?: string;
}

export function useCreateRequisitionModal(onSuccess: () => void, isOpen: boolean) {
  const [justification, setJustification] = useState("");
  const [requiredDate, setRequiredDate] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedQty, setSelectedQty] = useState(1);
  const [selectedNotes, setSelectedNotes] = useState("");
  const [addedItems, setAddedItems] = useState<AddedItem[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    fetchAPI("/products?limit=100")
      .then((res) => {
        setProducts(res?.data || []);
      })
      .catch((err) => console.error("Failed to load products:", err));
  }, [isOpen]);

  const handleAddItem = () => {
    if (!selectedProductId) {
      toast.error("Select a product first");
      return;
    }
    const product = products.find((p) => String(p.id) === String(selectedProductId));
    if (!product) return;

    if (addedItems.some((item) => String(item.productId) === String(selectedProductId))) {
      toast.error("Product already added");
      return;
    }

    setAddedItems([
      ...addedItems,
      {
        productId: String(selectedProductId),
        name: product.name,
        quantity: selectedQty,
        notes: selectedNotes,
      },
    ]);

    setSelectedProductId("");
    setSelectedQty(1);
    setSelectedNotes("");
  };

  const handleRemoveItem = (index: number) => {
    setAddedItems(addedItems.filter((_, i) => i !== index));
  };

  const handleCreatePR = async (e: React.FormEvent) => {
    e.preventDefault();

    const finalItems = [...addedItems];

    console.debug("Creating PR - addedItems:", addedItems, "selectedProductId:", selectedProductId);

    // Automatically add the currently selected product if the user forgot to click "Add"
    if (selectedProductId) {
      const product = products.find((p) => String(p.id) === String(selectedProductId));
      if (product && !addedItems.some((item) => String(item.productId) === String(selectedProductId))) {
        finalItems.push({
          productId: String(selectedProductId),
          name: product.name,
          quantity: selectedQty,
          notes: selectedNotes,
        });
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
          quantity: item.quantity,
          notes: item.notes,
        })),
      });

      toast.success("Requisition submitted as Draft");
      setJustification("");
      setRequiredDate("");
      setAddedItems([]);
      setSelectedProductId("");
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
    selectedProductId,
    setSelectedProductId,
    selectedQty,
    setSelectedQty,
    selectedNotes,
    setSelectedNotes,
    addedItems,
    handleAddItem,
    handleRemoveItem,
    handleCreatePR,
  };
}
