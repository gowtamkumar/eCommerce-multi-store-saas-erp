import { fetchAPI } from "./api";

export interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  quantity: number;
  product?: {
    id: string;
    name: string;
    price: number;
    images: string[];
    slug: string;
  };
  variant?: {
    id: string;
    name: string;
  };
}

export interface Cart {
  id: string;
  items: CartItem[];
  userId: string;
}

export const getCart = async (): Promise<Cart> => {
  const res = await fetchAPI("/cart");
  return res || { items: [] }; // Handle potential null response if no cart exists yet
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
