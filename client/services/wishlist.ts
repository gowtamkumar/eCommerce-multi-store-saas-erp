import { fetchAPI } from "./api";

export interface WishlistItem {
  productId: string;
  addedAt: string;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    discountAmount: number;
    discountType: 'fixed' | 'percentage';
    images: string[];
    stock: number;
    category?: {
      name: string;
    };
    taxRate?: number;
  };
  pricing: {
    base_price: number;
    discount: number;
    tax: number;
    final_price: number;
  };
}

export const getWishlist = async (): Promise<WishlistItem[]> => {
  const res = await fetchAPI("/wishlist");
  return res?.data || [];
};

export const toggleWishlist = async (productId: string): Promise<{ added: boolean }> => {
  const res = await fetchAPI("/wishlist/toggle", {
    method: "POST",
    body: JSON.stringify({ productId }),
  });
  return res?.data || { added: false };
};

export const removeFromWishlist = async (productId: string): Promise<void> => {
  await fetchAPI(`/wishlist/${productId}`, {
    method: "DELETE",
  });
};

export const clearWishlist = async (): Promise<void> => {
  await fetchAPI("/wishlist", {
    method: "DELETE",
  });
};
