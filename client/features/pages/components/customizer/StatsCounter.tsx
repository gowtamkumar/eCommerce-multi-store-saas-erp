"use client";

interface StatsCounterProps {
  stats?: Array<{ id: string; label: string; value: string }>;
  settings?: any;
  styles?: any;
}

export default function StatsCounter({
  stats = [],
  settings,
  styles
}: StatsCounterProps) {
  if (!stats?.length) return null;

  return (
    <div className="w-full overflow-hidden">
      <div className="w-full">
        {(settings?.title || settings?.subline) && (
          <div className={`mb-12 md:mb-16 max-w-3xl mx-auto space-y-4 text-${styles?.textAlign || 'center'}`}>
            {settings?.title && (
              <h2
                className="font-bold tracking-tight"
                style={{
                  color: styles?.textColor || styles?.color,
                  fontFamily: styles?.headingFontFamily,
                  fontSize: styles?.headingFontSize ? `calc(${styles.headingFontSize} * 0.8)` : '2.25rem', // Fallback or scaled
                  lineHeight: styles?.headingLineHeight,
                  fontWeight: styles?.headingFontWeight
                }}
              >
                {settings.title}
              </h2>
            )}
            {settings?.subline && (
              <p
                style={{
                  color: styles?.sublineColor || styles?.color,
                  fontFamily: styles?.paragraphFontFamily,
                  fontSize: styles?.paragraphFontSize ? `calc(${styles.paragraphFontSize} * 1.1)` : '1.125rem',
                  lineHeight: styles?.paragraphLineHeight,
                  fontWeight: styles?.paragraphFontWeight
                }}
              >
                {settings.subline}
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, index) => (
            <div
              key={stat.id || index}
              className="text-center space-y-2 p-6"
              style={{
                backgroundColor: styles?.cardBackgroundColor || 'rgba(80, 64, 64, 0.05)',
                borderRadius: styles?.cardRadius === 'full' ? '9999px' :
                  styles?.cardRadius === 'large' ? '1.5rem' :
                    styles?.cardRadius === 'medium' ? '1rem' :
                      styles?.cardRadius === 'none' ? '0' : '1.5rem',
                borderWidth: styles?.cardBorder === 'thick' ? '12px' :
                  styles?.cardBorder === 'thin' ? '4px' :
                    styles?.cardBorder === 'none' ? '0' : '1px',
                borderStyle: 'solid',
                borderColor: styles?.borderColor || 'rgba(255,255,255,0.1)',
                boxShadow: styles?.cardShadow === 'large' ? '0 25px 50px -12px rgba(0, 0, 0, 0.25)' :
                  styles?.cardShadow === 'medium' ? '0 10px 15px -3px rgba(0, 0, 0, 0.1)' :
                    styles?.cardShadow === 'small' ? '0 1px 3px 0 rgba(0, 0, 0, 0.1)' : 'none',
              }}
            >
              <div
                style={{
                  color: styles?.headlineColor || styles?.color,
                  fontFamily: styles?.headingFontFamily,
                  fontWeight: styles?.headingFontWeight || 900,
                  fontSize: styles?.headingFontSize || '1.75rem',
                  lineHeight: styles?.headingLineHeight || 1,
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  color: styles?.color,
                  fontFamily: styles?.paragraphFontFamily,
                  fontWeight: styles?.paragraphFontWeight || 700,
                  fontSize: styles?.paragraphFontSize || '0.875rem',
                  lineHeight: styles?.paragraphLineHeight,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  opacity: 0.8
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
