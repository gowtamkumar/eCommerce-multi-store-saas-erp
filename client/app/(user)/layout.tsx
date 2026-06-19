'use client';

import AnalyticsTracker from "@/components/shared/AnalyticsTracker";
import CartDrawer from "@/components/shared/CartDrawer";
import FloatingCartWidget from "@/components/shared/FloatingCartWidget";
import ScrollToTop from "@/components/shared/ScrollToTop";
import LiveChatWidget from "@/components/shared/LiveChatWidget";
import ShoppingAssistantWidget from "@/components/shared/ShoppingAssistantWidget";
import { CartProvider } from "@/hooks/CartContext";
import { WishlistProvider } from "@/hooks/WishlistContext";
import { useSettings } from "@/hooks/SettingsContext";
import { usePathname } from "next/navigation";
import { Store } from "lucide-react";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { settings } = useSettings();
  const authPaths = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/verify-email",
    "/accept-invitation",
  ];

  const isAuthPage = authPaths.some((path) => pathname?.startsWith(path));
  const isExpired = settings?.status === 'expired' && !isAuthPage;

  if (isExpired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-900 p-6">
        <div className="max-w-md w-full text-center space-y-8">
          <div className="w-24 h-24 bg-indigo-50 dark:bg-indigo-900/20 rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl shadow-indigo-500/10">
            <Store className="w-12 h-12 text-indigo-600" />
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Store Closed</h1>
            <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed font-medium">
              This store is currently unavailable. Please check back later or contact the store owner for details.
            </p>
          </div>
          <div className="pt-10 border-t border-slate-100 dark:border-slate-800">
            <p className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.3em]">
              Powered by <span className="text-indigo-500">Antigravity Cloud</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  const hideCartPaths = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/verify-email",
    "/accept-invitation",
  ];

  const shouldHideCart = hideCartPaths.some((path) => pathname?.startsWith(path)) || settings?.isSaaS;

  return (
    <>
      <CartProvider>
        <WishlistProvider>
          {/* <AnalyticsTracker /> */}
          {!shouldHideCart && (
            <>
              <CartDrawer />
              <FloatingCartWidget />
            </>
          )}
          <ScrollToTop />
          <ShoppingAssistantWidget />
          <LiveChatWidget />
          {children}
        </WishlistProvider>
      </CartProvider>
    </>
  );
}
