"use client";

import { ParagraphSettings } from "@/types/customizer";

export default function Paragraph({ settings, styles }: { settings: ParagraphSettings, styles: any }) {
    const { content, alignment = 'left' } = settings || {};

    const alignmentClass = alignment === 'center' ? 'text-center' : alignment === 'right' ? 'text-right' : 'text-left';

    return (
        <div
            className={`w-full text-base md:text-lg opacity-80 leading-relaxed font-medium ${alignmentClass}`}
            style={{ color: styles?.color || 'inherit' }}
        >
            {content ? (
                <div dangerouslySetInnerHTML={{ __html: content as string }} />
            ) : (
                <p>Add your paragraph content here. Share your story or describe your product/service to connect with your customers.</p>
            )}
        </div>
    );
}
