"use client";

import { motion } from "framer-motion";

interface SectionHeaderProps {
    title?: string;
    description?: string;
    styles?: any;
    className?: string;
}

export default function SectionHeader({ title, description, styles, className = "" }: SectionHeaderProps) {
    if (!title && !description) return null;

    const textAlign = styles?.textAlign || 'left';

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-12 space-y-4 px-6 ${className}
        ${textAlign === 'center' ? 'text-center' : ''}
        ${textAlign === 'right' ? 'text-right' : ''}
        ${textAlign === 'left' ? 'text-left' : ''}
      `}
        >
            {title && (
                <h2
                    className="font-black tracking-tighter uppercase"
                    style={{
                        color: styles?.headlineColor || styles?.color || 'inherit',
                        fontSize: styles?.headingFontSize ? (typeof styles.headingFontSize === 'number' ? `${styles.headingFontSize}px` : styles.headingFontSize) : 'clamp(2rem, 5vw, 3rem)',
                        fontWeight: styles?.headingFontWeight || '900',
                        lineHeight: styles?.headingLineHeight || '1.1',
                        textTransform: (styles?.textTransform as any) || 'uppercase',
                        fontFamily: styles?.headingFontFamily || 'inherit',
                    }}
                >
                    {title}
                </h2>
            )}
            <div
                className={`w-16 h-1 rounded-full
          ${textAlign === 'center' ? 'mx-auto' : ''}
          ${textAlign === 'right' ? 'ml-auto' : ''}
          ${textAlign === 'left' ? 'mr-auto' : ''}
        `}
                style={{ backgroundColor: styles?.sublineColor || styles?.headlineColor || styles?.color || '#4f46e5' }}
            />
            {description && (
                <p
                    className="text-lg opacity-80 max-w-2xl"
                    style={{
                        color: styles?.color || 'inherit',
                        marginLeft: textAlign === 'right' ? 'auto' : (textAlign === 'center' ? 'auto' : '0'),
                        marginRight: textAlign === 'left' ? 'auto' : (textAlign === 'center' ? 'auto' : '0'),
                    }}
                >
                    {description}
                </p>
            )}
        </motion.div>
    );
}
