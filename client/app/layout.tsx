import AuthProvider from "@/hooks/AuthProvider";
import { SettingsProvider } from "@/hooks/SettingsContext";
import ToasterProvider from "@/hooks/ToasterProvider";
import { getSiteSettings } from "@/services/getSettings";
import { Inter, Outfit } from "next/font/google";
import "../styles/typography.css";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const outfit = Outfit({ subsets: ["latin"], variable: '--font-outfit' });

export const dynamic = 'force-dynamic';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSiteSettings();
  const { googleSiteVerification, facebookDomainVerification } = settings.marketing || {};

  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {googleSiteVerification && <meta name="google-site-verification" content={googleSiteVerification} />}
        {facebookDomainVerification && <meta name="facebook-domain-verification" content={facebookDomainVerification} />}
      </head>
      <body className={`${inter.className} ${outfit.variable} antialiased`}>
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
