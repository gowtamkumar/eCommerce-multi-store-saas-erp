import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const outfit = Outfit({ subsets: ["latin"], variable: '--font-outfit' });

// export const metadata: Metadata = {
//   title: "LuxeAudio | Experience Sound Like Never Before",
//   description: "Premium audio equipment for the discerning listener.",
// };

import AuthProvider from "@/components/providers/AuthProvider";
import ToasterProvider from "@/components/providers/ToasterProvider";
import { CartProvider } from "@/contexts/CartContext";
import { SettingsProvider } from "@/contexts/SettingsContext";

import CartDrawer from "@/components/store/CartDrawer";
import { getSiteSettings } from "@/lib/getSettings";
import Script from "next/script";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSiteSettings();
  const { googleAnalyticsId, facebookPixelId, googleSiteVerification, facebookDomainVerification } = settings.marketing || {};

  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {googleSiteVerification && <meta name="google-site-verification" content={googleSiteVerification} />}
        {facebookDomainVerification && <meta name="facebook-domain-verification" content={facebookDomainVerification} />}
      </head>
      <body className={`${inter.className} ${outfit.variable} antialiased`}>
        <AuthProvider>
          <SettingsProvider initialSettings={settings}>
            <CartProvider>
              <ToasterProvider />
              <CartDrawer />
              {children}
            </CartProvider>
          </SettingsProvider>
        </AuthProvider>

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
      </body>
    </html>
  );
}
