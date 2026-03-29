"use client";

import * as wishlistApi from "@/services/wishlist";
import { WishlistItem } from "@/services/wishlist";
import { useSession } from "next-auth/react";
import React, { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-hot-toast";

interface WishlistContextType {
  wishlist: WishlistItem[];
  totalItems: number;
  loading: boolean;
  toggleWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  clearWishlist: () => Promise<void>;
  refreshWishlist: () => Promise<void>;
  isInWishlist: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshWishlist = async () => {
    if (status !== "authenticated" || !session?.user?.accessToken) {
      setWishlist([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const items = await wishlistApi.getWishlist();
      setWishlist(items);
    } catch (error) {
      console.error("Failed to fetch wishlist", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshWishlist();
  }, [status, session?.user?.accessToken]);

  const toggleWishlist = async (productId: string) => {
    if (!session?.user) {
      toast.error("Please login to manage your wishlist");
      return;
    }

    try {
      setLoading(true);
      const result = await wishlistApi.toggleWishlist(productId);
      await refreshWishlist();
      toast.success(result.added ? "Added to wishlist" : "Removed from wishlist");
    } catch (error: any) {
      console.error("Toggle wishlist error", error);
      toast.error(error.message || "Failed to update wishlist");
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId: string) => {
    if (!session?.user) return;

    try {
      setLoading(true);
      await wishlistApi.removeFromWishlist(productId);
      await refreshWishlist();
      toast.success("Removed from wishlist");
    } catch (error) {
      console.error("Remove from wishlist error", error);
      toast.error("Failed to remove item");
    } finally {
      setLoading(false);
    }
  };

  const clearWishlist = async () => {
    if (!session?.user) return;

    try {
      setLoading(true);
      await wishlistApi.clearWishlist();
      setWishlist([]);
      toast.success("Wishlist cleared");
    } catch (error) {
      console.error("Clear wishlist error", error);
      toast.error("Failed to clear wishlist");
    } finally {
      setLoading(false);
    }
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some((item) => item.productId === productId);
  };

  const totalItems = wishlist.length;

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        totalItems,
        loading,
        toggleWishlist,
        removeFromWishlist,
        clearWishlist,
        refreshWishlist,
        isInWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};
