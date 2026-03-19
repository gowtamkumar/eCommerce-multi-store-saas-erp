"use client";

import { DividerSettings } from "@/types/customizer";

export default function Divider({ settings, styles }: { settings: DividerSettings, styles: any }) {
    const { thickness = 1, width = '100%', color, style = 'solid' } = settings || {};

    const dividerStyle: React.CSSProperties = {
        height: 0,
        borderTopWidth: `${thickness}px`,
        borderTopStyle: style,
        borderTopColor: color || styles?.borderColor || styles?.color || '#e2e8f0',
        width: width,
        margin: styles?.textAlign === 'center' ? '0 auto' : styles?.textAlign === 'right' ? '0 0 0 auto' : '0 auto 0 0',
    };

    return (
        <div className="w-full py-2">
            <div style={dividerStyle} />
        </div>
    );
}
