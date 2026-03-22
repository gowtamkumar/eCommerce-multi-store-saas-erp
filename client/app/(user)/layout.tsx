'use client';

import AnalyticsTracker from "@/components/shared/AnalyticsTracker";
import CartDrawer from "@/components/shared/CartDrawer";
import FloatingCartWidget from "@/components/shared/FloatingCartWidget";
import ScrollToTop from "@/components/shared/ScrollToTop";
import { CartProvider } from "@/hooks/CartContext";
import { useSettings } from "@/hooks/SettingsContext";
import Script from "next/script";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { settings } = useSettings();
  const { googleAnalyticsId, facebookPixelId } = settings?.marketing || {};

  return (
    <>
      <CartProvider>
        {/* <AnalyticsTracker /> */}
        <CartDrawer />
        <FloatingCartWidget />
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
