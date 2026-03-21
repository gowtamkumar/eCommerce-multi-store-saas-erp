import { fetchAPI } from "./api";

export interface CartItem {
  cart_item_id: string;
  product: {
    id: string;
    name: string;
    image: string | null;
  };
  variant: {
    id: string;
    sku: string;
    attributes: Array<{ name: string; value: string }>;
  } | null;
  pricing: {
    base_price: number;
    discount: number;
    tax?: number;
    final_price: number;
  };
  quantity: number;
  line_total: number;
  stock_status: 'IN_STOCK' | 'OUT_OF_STOCK';
}

export interface CartSummary {
  subtotal: number;
  offer_discount: number;
  coupon_discount: number;
  tax?: number;
  shipping_fee?: number;
  payable: number;
}

export interface Cart {
  cart_id: string;
  currency: string;
  items: CartItem[];
  summary: CartSummary;
  appliedCouponCode?: string | null;
}

export const getCart = async (): Promise<Cart> => {
  const res = await fetchAPI("/cart");
  return res || { items: [], summary: { subtotal: 0, offer_discount: 0, coupon_discount: 0, payable: 0 } };
};

export const addToCart = async (productId: string, quantity: number, variantId?: string) => {
  return await fetchAPI("/cart/items", {
    method: "POST",
    body: JSON.stringify({ productId, quantity, variantId }),
  });
};

export const updateCartItem = async (itemId: string, quantity: number) => {
  return await fetchAPI(`/cart/items/${itemId}`, {
    method: "PATCH",
    body: JSON.stringify({ quantity }),
  });
};

export const removeFromCart = async (itemId: string) => {
  return await fetchAPI(`/cart/items/${itemId}`, {
    method: "DELETE",
  });
};

export const clearCart = async () => {
  return await fetchAPI("/cart", {
    method: "DELETE",
  });
};

export const syncCart = async (items: { productId: string; quantity: number; variantId?: string }[]) => {
  return await fetchAPI("/cart/sync", {
    method: "POST",
    body: JSON.stringify(items),
  });
};

export const applyCoupon = async (code: string) => {
  return await fetchAPI("/cart/coupon/apply", {
    method: "POST",
    body: JSON.stringify({ code }),
  });
};

export const removeCoupon = async () => {
  return await fetchAPI("/cart/coupon/remove", {
    method: "POST",
  });
};
