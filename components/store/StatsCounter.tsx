"use client";

interface StatsCounterProps {
  stats?: Array<{ id: string; label: string; value: string }>;
  styles?: any;
}

export default function StatsCounter({
  stats = [],
  styles
}: StatsCounterProps) {
  if (!stats?.length) return null;

  return (
    <section
      style={{
        ...styles,
        paddingTop: styles?.paddingTop,
        paddingBottom: styles?.paddingBottom,
        backgroundColor: styles?.backgroundColor,
        color: styles?.color
      }}
      className={`px-4 md:px-10 ${!styles?.paddingTop && !styles?.paddingBottom ? 'py-16 md:py-24' : ''}`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, index) => (
            <div key={stat.id || index} className="text-center space-y-2 p-6 rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10">
              <div
                className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight"
                style={{ color: styles?.headlineColor || styles?.color }}
              >
                {stat.value}
              </div>
              <div
                className="text-sm md:text-base font-bold uppercase tracking-widest opacity-80"
                style={{ color: styles?.color }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
