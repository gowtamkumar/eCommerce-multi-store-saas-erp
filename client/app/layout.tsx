import AuthProvider from "@/hooks/AuthProvider";
import { SettingsProvider } from "@/hooks/SettingsContext";
import { SocketProvider } from "@/hooks/SocketContext";
import ToasterProvider from "@/hooks/ToasterProvider";
import { getSiteSettings } from "@/services/getSettings";
import "../styles/typography.css";
import "react-calendar/dist/Calendar.css";
import "./globals.css";

import PushNotificationPrompt from "@/components/PushNotificationPrompt";
import ConsentAwareMarketingScripts from "@/components/shared/ConsentAwareMarketingScripts";
import MaintenanceWrapper from "@/components/shared/MaintenanceWrapper";

// const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
// const outfit = Outfit({ subsets: ["latin"], variable: '--font-outfit' });

// NOTE: This layout resolves the store via next/headers (getSiteSettings ->
// getStoreId), which already opts the tree into dynamic rendering per request.
// We therefore don't force 'force-dynamic' globally, letting leaf routes that
// don't read request headers be statically optimized / ISR-cached.

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSiteSettings();
  const { googleSiteVerification, facebookDomainVerification } = settings.marketing || {};

  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head suppressHydrationWarning>
        {googleSiteVerification && <meta name="google-site-verification" content={googleSiteVerification} />}
        {facebookDomainVerification && <meta name="facebook-domain-verification" content={facebookDomainVerification} />}
      </head>
      <body className={`antialiased`} suppressHydrationWarning>
        <AuthProvider>
          <SocketProvider>
            <SettingsProvider initialSettings={settings}>
              <ConsentAwareMarketingScripts marketing={settings.marketing} />
              <ToasterProvider />
              <PushNotificationPrompt />
              <MaintenanceWrapper>
                {children}
              </MaintenanceWrapper>
            </SettingsProvider>
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
