"use client";

import { calculatePricing } from "@/lib/utils";
import { fetchAPI } from "@/services/api";
import * as cartApi from "@/services/cart";
import { Cart, CartItem } from "@/services/cart";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useSettings } from "@/hooks/SettingsContext";

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
  applyCoupon: (code: string) => Promise<void>;
  removeCoupon: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { settings } = useSettings();

  // Helper for recalculating local guest carts
  const recalcLocalSummary = (items: CartItem[], couponDiscount = 0) => {
    const subtotal = items.reduce((acc, item) => acc + (item.pricing.base_price * item.quantity), 0);
    const offer_discount = items.reduce((acc, item) => acc + (item.pricing.discount * item.quantity), 0);
    const tax = items.reduce((acc, item) => acc + ((item.pricing.tax || 0) * item.quantity), 0);
    const payable = items.reduce((acc, item) => acc + item.line_total, 0) - couponDiscount;

    return { subtotal, offer_discount, coupon_discount: couponDiscount, tax, shipping_fee: 0, payable };
  };

  // Initialize local cart from localStorage
  useEffect(() => {
    if (status === "unauthenticated") {
      const localData = localStorage.getItem("temp_cart");
      if (localData) {
        try {
          const parsed = JSON.parse(localData);
          setCart(parsed);
        } catch (e) {
          console.error("Failed to parse local cart", e);
          localStorage.removeItem("temp_cart");
        }
      }
      setLoading(false);
    }
  }, [status]);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const refreshCart = async () => {
    if (status === "loading") return;
    if (settings?.isSaaS) {
      setLoading(false);
      return;
    }

    if (!session?.user?.accessToken) {
      // If we are guest, we just rely on state updating via local storage logic
      // But if we explicitly call refreshCart as guest, we can re-read local storage
      const localData = localStorage.getItem("temp_cart");
      if (localData) {
        setCart(JSON.parse(localData));
      }
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await cartApi.getCart();
      setCart((data as any).data || data);
    } catch (error) {
      console.error("Failed to fetch cart", error);
    } finally {
      setLoading(false);
    }
  };

  // Sync local cart to server when session becomes active
  useEffect(() => {
    const syncLocalCart = async () => {
      if (settings?.isSaaS) {
        setLoading(false);
        return;
      }
      if (status === "authenticated" && session?.user?.accessToken) {
        const localData = localStorage.getItem("temp_cart");
        if (localData) {
          try {
            const localCart: Cart = JSON.parse(localData);
            if (localCart.items.length > 0) {
              setLoading(true);
              // Sequentially add items to server cart
              // Note: Better backend would be bulk-add, but we use what we have
              for (const item of localCart.items) {
                try {
                  await cartApi.addToCart(item.product.id, item.quantity, item.variant?.id);
                } catch (err) {
                  console.error("Failed to sync item", item, err);
                }
              }
              // Clear local cart after sync attempt
              localStorage.removeItem("temp_cart");
              await refreshCart();
              toast.success("Cart synced with your account");
            } else {
              refreshCart();
            }
          } catch (e) {
            console.error("Sync error", e);
            refreshCart();
          }
        } else {
          refreshCart();
        }
      }
    };

    syncLocalCart();
  }, [status, session?.user?.accessToken, settings?.isSaaS]);


  const addToCart = useCallback(async (productId: string, quantity: number, variantId?: string) => {
    // If Guest
    if (!session?.user) {
      setLoading(true);
      try {
        const productRes = await fetchAPI(`/products/${productId}`);
        const product = productRes.data || productRes;

        const currentCart = cart || {
          cart_id: 'local',
          currency: 'USD',
          items: [],
          summary: { subtotal: 0, offer_discount: 0, coupon_discount: 0, payable: 0 }
        } as Cart;

        const existingItemIndex = currentCart.items.findIndex(
          i => i.product.id === productId && i.variant?.id === variantId
        );

        let newItems = [...currentCart.items];

        if (existingItemIndex > -1) {
          const updatedItem = { ...newItems[existingItemIndex] };
          updatedItem.quantity += quantity;
          updatedItem.line_total = updatedItem.quantity * updatedItem.pricing.final_price;
          newItems[existingItemIndex] = updatedItem;
        } else {
          let variantData = null;
          let price = product.price;

          if (variantId && product.variants) {
            const v = product.variants.find((v: any) => v.id === variantId);
            if (v) {
              variantData = {
                id: v.id,
                sku: v.sku,
                attributes: v.combination ? Object.entries(v.combination).map(([k, val]) => ({ name: k, value: val as string })) : []
              };
              if (v.price) price = v.price;
            }
          }

          const { finalPrice, discountAmount: discount, taxAmount } = calculatePricing(
            price,
            Number(product.discountAmount || 0),
            product.discountType || 'fixed',
            Number(product.taxRate || 0)
          );

          newItems.push({
            cart_item_id: `local_${Date.now()}_${Math.random()}`,
            product: {
              id: productId,
              name: product.name,
              image: product.images?.[0] || null
            },
            variant: variantData,
            pricing: {
              base_price: price,
              discount: discount,
              tax: taxAmount,
              final_price: finalPrice
            },
            quantity: quantity,
            line_total: finalPrice * quantity,
            stock_status: 'IN_STOCK'
          });
        }

        const updatedCart = { ...currentCart, items: newItems, summary: recalcLocalSummary(newItems) };
        setCart(updatedCart);
        localStorage.setItem("temp_cart", JSON.stringify(updatedCart));
        toast.success("Added to cart");
      } catch (e) {
        console.error("Local add to cart error", e);
        toast.error("Failed to add to cart");
      } finally {
        setLoading(false);
      }
      return;
    }

    // If Logged In
    try {
      setLoading(true);
      await cartApi.addToCart(productId, quantity, variantId);
      await refreshCart();
      toast.success("Added to cart");
    } catch (error: any) {
      console.error("Add to cart error", error);
      toast.error(error.message || "Failed to add to cart");
    } finally {
      setLoading(false);
    }
  }, [session?.user, cart, refreshCart]);

  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    if (!session?.user) {
      if (!cart) return;
      const newItems = cart.items.map(item => {
        if (item.cart_item_id === itemId) {
          return {
            ...item,
            quantity,
            line_total: quantity * item.pricing.final_price
          };
        }
        return item;
      });
      const updatedCart = {
        ...cart,
        items: newItems,
        summary: recalcLocalSummary(newItems, cart.summary?.coupon_discount)
      };
      setCart(updatedCart);
      localStorage.setItem("temp_cart", JSON.stringify(updatedCart));
      return;
    }

    try {
      await cartApi.updateCartItem(itemId, quantity);
      await refreshCart();
    } catch (error) {
      console.error("Update quantity error", error);
      toast.error("Failed to update quantity");
    }
  }, [session?.user, cart, refreshCart]);

  const removeItem = useCallback(async (itemId: string) => {
    if (!session?.user) {
      if (!cart) return;
      const newItems = cart.items.filter(item => item.cart_item_id !== itemId);
      const updatedCart = {
        ...cart,
        items: newItems,
        summary: recalcLocalSummary(newItems, cart.summary?.coupon_discount)
      };
      setCart(updatedCart);
      localStorage.setItem("temp_cart", JSON.stringify(updatedCart));
      toast.success("Removed from cart");
      return;
    }

    try {
      await cartApi.removeFromCart(itemId);
      await refreshCart();
      toast.success("Removed from cart");
    } catch (error) {
      console.error("Remove item error", error);
      toast.error("Failed to remove item");
    }
  }, [session?.user, cart, refreshCart]);

  const clearCart = useCallback(async () => {
    if (!session?.user) {
      setCart(null);
      localStorage.removeItem("temp_cart");
      toast.success("Cart cleared");
      return;
    }

    try {
      await cartApi.clearCart();
      setCart(null);
      toast.success("Cart cleared");
    } catch (error) {
      console.error("Clear cart error", error);
      toast.error("Failed to clear cart");
    }
  }, [session?.user]);

  const applyCoupon = useCallback(async (code: string) => {
    if (!session?.user) {
      toast.error("Please login to apply coupons");
      return;
    }

    try {
      setLoading(true);
      await cartApi.applyCoupon(code);
      await refreshCart();
      toast.success("Coupon applied successfully");
    } catch (error: any) {
      console.error("Apply coupon error", error);
      toast.error(error.message || "Failed to apply coupon");
    } finally {
      setLoading(false);
    }
  }, [session?.user, refreshCart]);

  const removeCoupon = useCallback(async () => {
    if (!session?.user) {
      return;
    }

    try {
      setLoading(true);
      await cartApi.removeCoupon();
      await refreshCart();
      toast.success("Coupon removed");
    } catch (error) {
      console.error("Remove coupon error", error);
      toast.error("Failed to remove coupon");
    } finally {
      setLoading(false);
    }
  }, [session?.user, refreshCart]);

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
        applyCoupon,
        removeCoupon,
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

