import AuthProvider from "@/hooks/AuthProvider";
import { SettingsProvider } from "@/hooks/SettingsContext";
import ToasterProvider from "@/hooks/ToasterProvider";
import { getSiteSettings } from "@/services/getSettings";
import Script from "next/script";
import "../styles/typography.css";
import "./globals.css";

// const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
// const outfit = Outfit({ subsets: ["latin"], variable: '--font-outfit' });

export const dynamic = 'force-dynamic';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSiteSettings();
  const { googleSiteVerification, facebookDomainVerification, googleAnalyticsId, facebookPixelId } = settings.marketing || {};

  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head suppressHydrationWarning>
        {googleSiteVerification && <meta name="google-site-verification" content={googleSiteVerification} />}
        {facebookDomainVerification && <meta name="facebook-domain-verification" content={facebookDomainVerification} />}
      </head>
      <body className={`antialiased`} suppressHydrationWarning>
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

        {/* Meta Pixel */}
        {facebookPixelId && (
          <Script id="fb-pixel" strategy="afterInteractive">
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

        <AuthProvider>
          <SettingsProvider initialSettings={settings}>
            <ToasterProvider />
            {children}
          </SettingsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
