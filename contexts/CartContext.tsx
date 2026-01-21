"use client";

import * as cartApi from "@/lib/cart";
import { Cart, CartItem } from "@/lib/cart";
import { useSession } from "next-auth/react";
import React, { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-hot-toast";

interface CartContextType {
  cart: Cart | null;
  items: CartItem[];
  totalItems: number;
  loading: boolean;
  addToCart: (productId: string, quantity: number, variantId?: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const refreshCart = async () => {
    if (!session?.user) {
      setCart(null);
      return;
    }
    try {
      setLoading(true);
      const data = await cartApi.getCart();
      setCart(data);
    } catch (error) {
      console.error("Failed to fetch cart", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshCart();
  }, [session?.user?.id]); // Refresh when user changes

  const addToCart = async (productId: string, quantity: number, variantId?: string) => {
    if (!session?.user) {
      toast.error("Please login to add items to cart");
      return;
    }
    try {
      await cartApi.addToCart(productId, quantity, variantId);
      await refreshCart();
      toast.success("Added to cart");
      setIsCartOpen(true);
    } catch (error) {
      console.error("Add to cart error", error);
      toast.error("Failed to add to cart");
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      await cartApi.updateCartItem(itemId, quantity);
      await refreshCart();
    } catch (error) {
      console.error("Update quantity error", error);
      toast.error("Failed to update quantity");
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      await cartApi.removeFromCart(itemId);
      await refreshCart();
      toast.success("Removed from cart");
    } catch (error) {
      console.error("Remove item error", error);
      toast.error("Failed to remove item");
    }
  };

  const clearCart = async () => {
    try {
      await cartApi.clearCart();
      setCart(null);
      toast.success("Cart cleared");
    } catch (error) {
      console.error("Clear cart error", error);
      toast.error("Failed to clear cart");
    }
  };

  const items = cart?.items || [];
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        items: cart?.items || [],
        totalItems,
        loading,
        refreshCart,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        isCartOpen,
        openCart,
        closeCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
