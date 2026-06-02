"use client";
import SectionHeader from "./SectionHeader";

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

  const cardRadiusClass = styles?.cardRadius === 'small' ? 'rounded-lg' :
    styles?.cardRadius === 'large' ? 'rounded-[2rem]' :
      styles?.cardRadius === 'full' ? 'rounded-full' :
        styles?.cardRadius === 'none' ? 'rounded-none' : 'rounded-2xl';

  return (
    <div className="w-full">
      <div className="w-full">
        <SectionHeader title={settings?.title} description={settings?.subline} styles={styles} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, index) => (
            <div
              key={stat.id || index}
              className={`text-center space-y-2 p-8 ${cardRadiusClass} border`}
              style={{
                backgroundColor: styles?.cardBackgroundColor || 'rgba(0, 0, 0, 0.03)',
                borderColor: styles?.borderColor || 'rgba(0, 0, 0, 0.1)',
                borderWidth: styles?.cardBorder === 'thick' ? '4px' :
                  styles?.cardBorder === 'thin' ? '1px' :
                    styles?.cardBorder === 'none' ? '0' : '1px',
                boxShadow: styles?.cardShadow === 'large' ? '0 20px 25px -5px rgb(0 0 0 / 0.1)' :
                  styles?.cardShadow === 'medium' ? '0 10px 15px -3px rgb(0 0 0 / 0.1)' :
                    styles?.cardShadow === 'small' ? '0 1px 2px 0 rgb(0 0 0 / 0.05)' : 'none',
              }}
            >
              <div
                className="text-2xl md:text-3xl font-black"
                style={{
                  color: styles?.headlineColor || styles?.color || 'inherit',
                  fontFamily: styles?.headingFontFamily,
                  lineHeight: 1,
                }}
              >
                {stat.value}
              </div>
              <div
                className="text-xs md:text-sm font-bold uppercase tracking-widest opacity-60"
                style={{
                  color: styles?.color || 'inherit',
                  fontFamily: styles?.paragraphFontFamily,
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
