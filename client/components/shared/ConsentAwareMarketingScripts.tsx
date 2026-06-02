"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

interface MarketingSettings {
  googleAnalyticsId?: string;
  facebookPixelId?: string;
  requireConsent?: boolean;
}

const CONSENT_STORAGE_KEY = "omnicart_marketing_consent";

export default function ConsentAwareMarketingScripts({
  marketing,
}: {
  marketing?: MarketingSettings;
}) {
  const [hasConsent, setHasConsent] = useState(marketing?.requireConsent === false);
  const [showBanner, setShowBanner] = useState(false);
  const googleAnalyticsId = marketing?.googleAnalyticsId;
  const facebookPixelId = marketing?.facebookPixelId;
  const hasAnyScript = Boolean(googleAnalyticsId || facebookPixelId);
  const consentRequired = marketing?.requireConsent !== false;

  useEffect(() => {
    if (!hasAnyScript || !consentRequired) {
      setShowBanner(false);
      setHasConsent(hasAnyScript);
      return;
    }

    const stored = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (stored === "accepted") {
      setHasConsent(true);
      setShowBanner(false);
      return;
    }
    if (stored === "declined") {
      setHasConsent(false);
      setShowBanner(false);
      return;
    }
    setShowBanner(true);
  }, [consentRequired, hasAnyScript]);

  const accept = () => {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, "accepted");
    setHasConsent(true);
    setShowBanner(false);
  };

  const decline = () => {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, "declined");
    setHasConsent(false);
    setShowBanner(false);
  };

  return (
    <>
      {hasConsent && googleAnalyticsId && (
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

      {hasConsent && facebookPixelId && (
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

      {showBanner && (
        <div className="fixed bottom-4 left-4 right-4 z-9999 mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              We use analytics cookies to understand store traffic and improve shopping experience.
            </p>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={decline}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Decline
              </button>
              <button
                type="button"
                onClick={accept}
                className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
