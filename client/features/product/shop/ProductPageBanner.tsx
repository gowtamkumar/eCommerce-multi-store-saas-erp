/**
 * ProductPageBanner
 * Isolated, zero-dependency banner component for the /products page.
 * Extracted from the monolithic Products.tsx to allow independent testing
 * and future per-store customization without touching page-level logic.
 */
interface ProductPageBannerProps {
  settings: {
    bannerShow?: boolean;
    bannerFullWidth?: boolean;
    bannerStyle?: 'modern' | 'minimal' | string;
    bannerImage?: string;
    bannerBackgroundColor?: string;
    bannerOverlayOpacity?: number;
    bannerTextColor?: string;
    bannerTagline?: string;
    bannerHeadline?: string;
    bannerSubheadline?: string;
  };
}

export default function ProductPageBanner({ settings }: ProductPageBannerProps) {
  if (settings.bannerShow === false) return null;

  const hasImage = !!settings.bannerImage;
  const hasCustomText = !!(settings.bannerTextColor && settings.bannerTextColor !== '#000000');
  const isLightOnDark = hasImage || hasCustomText;

  return (
    <div
      className={`relative mb-16 overflow-hidden transition-all duration-500 ${
        settings.bannerFullWidth ? 'py-24 px-8 md:py-32' : 'py-16 px-8 rounded-[3rem]'
      } ${
        settings.bannerStyle === 'minimal'
          ? 'border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm'
          : settings.bannerStyle === 'modern'
          ? 'bg-slate-50 dark:bg-slate-800/20'
          : ''
      }`}
      style={{
        backgroundColor: settings.bannerBackgroundColor || undefined,
        backgroundImage: settings.bannerImage ? `url(${settings.bannerImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: settings.bannerTextColor || undefined,
      }}
    >
      {/* Abstract background blobs for "modern" style without a custom image */}
      {settings.bannerStyle === 'modern' && !settings.bannerImage && (
        <>
          <div className="absolute inset-0 bg-slate-50 dark:bg-slate-800/50 z-0" />
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl z-0" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-brand-600/5 rounded-full blur-3xl z-0" />
        </>
      )}

      {/* Dark overlay when a background image is present */}
      {settings.bannerImage && (
        <div
          className="absolute inset-0 bg-black/40 z-0"
          style={{ opacity: (settings.bannerOverlayOpacity ?? 40) / 100 }}
        />
      )}

      {/* Content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto">
        {/* Tagline pill */}
        <div
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-6 ${
            isLightOnDark
              ? 'bg-white/10 backdrop-blur-md text-white border border-white/20'
              : 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full animate-pulse ${
              isLightOnDark ? 'bg-white' : 'bg-brand-500'
            }`}
          />
          {settings.bannerTagline || 'Exclusive Collection'}
        </div>

        {/* Headline */}
        <h1
          className={`text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight tracking-tight ${
            !settings.bannerTextColor && !hasImage ? 'text-slate-900 dark:text-white' : ''
          }`}
          style={{
            color: settings.bannerTextColor || (hasImage ? '#ffffff' : undefined),
          }}
        >
          {settings.bannerHeadline || 'Our Collection'}
        </h1>

        {/* Subheadline */}
        <p
          className={`text-xl md:text-2xl font-medium leading-relaxed max-w-2xl mx-auto ${
            !settings.bannerTextColor && !hasImage ? 'text-slate-500 dark:text-slate-400' : ''
          }`}
          style={{
            color: settings.bannerTextColor
              ? `${settings.bannerTextColor}cc`
              : hasImage
              ? 'rgba(255,255,255,0.9)'
              : undefined,
          }}
        >
          {settings.bannerSubheadline || 'Premium products curated for you.'}
        </p>
      </div>
    </div>
  );
}
