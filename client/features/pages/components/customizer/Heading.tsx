"use client";

import { HeadingSettings } from "@/types/customizer";

export default function Heading({ settings, styles }: { settings: HeadingSettings, styles: any }) {
    const { text, level = 'h2', alignment = 'left' } = settings || {};

    const Tag = level as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

    const alignmentClass = alignment === 'center' ? 'text-center' : alignment === 'right' ? 'text-right' : 'text-left';

    const sizeClasses = {
        h1: 'text-4xl md:text-6xl font-black leading-tight',
        h2: 'text-3xl md:text-5xl font-bold leading-tight',
        h3: 'text-2xl md:text-4xl font-bold leading-tight',
        h4: 'text-xl md:text-2xl font-bold leading-snug',
        h5: 'text-lg md:text-xl font-bold uppercase tracking-wider',
        h6: 'text-base md:text-lg font-bold uppercase tracking-widest',
    };

    return (
        <Tag
            className={`w-full ${sizeClasses[level as keyof typeof sizeClasses]} ${alignmentClass}`}
            style={{ color: styles?.color || styles?.headlineColor || 'inherit' }}
        >
            {text || 'Enter your heading here'}
        </Tag>
    );
}
