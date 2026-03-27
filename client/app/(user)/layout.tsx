'use client';

import AnalyticsTracker from "@/components/shared/AnalyticsTracker";
import CartDrawer from "@/components/shared/CartDrawer";
import FloatingCartWidget from "@/components/shared/FloatingCartWidget";
import ScrollToTop from "@/components/shared/ScrollToTop";
import { CartProvider } from "@/hooks/CartContext";
import { useSettings } from "@/hooks/SettingsContext";
import { usePathname } from "next/navigation";
import Script from "next/script";
import { Store } from "lucide-react";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { settings } = useSettings();
  const { googleAnalyticsId, facebookPixelId } = settings?.marketing || {};
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

  const shouldHideCart = hideCartPaths.some((path) => pathname?.startsWith(path));

  return (
    <>
      <CartProvider>
        {/* <AnalyticsTracker /> */}
        {!shouldHideCart && (
          <>
            <CartDrawer />
            <FloatingCartWidget />
          </>
        )}
        <ScrollToTop />
        {children}
      </CartProvider>

      {/* Google Analytics */}
      {googleAnalyticsId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${googleAnalyticsId}');
            `}
          </Script>
        </>
      )}

      {/* Facebook Pixel */}
      {facebookPixelId && (
        <Script id="facebook-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${facebookPixelId}');
            fbq('track', 'PageView');
          `}
        </Script>
      )}
    </>
  );
}
