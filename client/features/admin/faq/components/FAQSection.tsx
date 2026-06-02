"use client";

import { fetchAPI } from "@/services/api";
import { FAQItem } from "@/types/customizer";
import { HelpCircle, Sparkles, Plus, Minus, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SectionHeader from "@/features/admin/pages/components/customizer/runtime/SectionHeader";

interface FAQSectionProps {
    items?: FAQItem[];
    headline: string;
    subline: string;
    styles: any;
    buttonText: string;
    faqIds?: string[];
    source?: string;
    gridColumns?: string | number;
    mobileColumns?: string | number;
    layout?: 'grid' | 'accordion';
}

export default function FAQSection({
    items, headline, subline, styles, faqIds, source,
    gridColumns = '2', mobileColumns = '1',
    layout = 'grid'
}: FAQSectionProps) {
    const [faqs, setFaqs] = useState<FAQItem[]>(items || []);
    const [loading, setLoading] = useState(false);
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    useEffect(() => {
        if (source === 'selection' && faqIds && faqIds.length > 0) {
            setLoading(true);
            fetchAPI('/faqs/multiple', {
                method: 'POST',
                body: JSON.stringify({ ids: faqIds })
            })
                .then((response) => {
                    if (response.success && response.data) {
                        setFaqs(response.data);
                    }
                })
                .catch((error) => {
                    console.error('Error fetching FAQs:', error);
                })
                .finally(() => {
                    setLoading(false);
                });
        } else if (items) {
            setFaqs(items);
        }
    }, [faqIds, items, source]);

    const toggleAccordion = (index: number) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    /* ── Style Resolution ────────────────────────────────────────── */
    const resolvePx = (v: string | number | undefined) => {
        if (v === undefined || v === "" || v === null) return undefined;
        return typeof v === "number" ? `${v}px` : v;
    };

    const containerStyle: React.CSSProperties = {
        paddingTop: resolvePx(styles?.paddingTop) || '80px',
        paddingBottom: resolvePx(styles?.paddingBottom) || '80px',
        paddingLeft: resolvePx(styles?.paddingLeft),
        paddingRight: resolvePx(styles?.paddingRight),
        marginTop: resolvePx(styles?.marginTop),
        marginBottom: resolvePx(styles?.marginBottom),
        backgroundColor: styles?.backgroundColor || 'transparent',
    };

    const itemStyle = (isActive: boolean): React.CSSProperties => ({
        backgroundColor: styles?.cardBackgroundColor || (isActive && layout === 'accordion' ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)'),
        borderColor: styles?.borderColor || 'rgba(255,255,255,0.1)',
        borderRadius: resolvePx(styles?.cardRadius) || '1.5rem',
        borderWidth: styles?.borderWidth ? resolvePx(styles.borderWidth) : '1px',
    });

    const questionStyle: React.CSSProperties = {
        color: styles?.questionColor || styles?.headlineColor || 'inherit',
        fontSize: resolvePx(styles?.fontSize) || (layout === 'accordion' ? 'clamp(1.1rem, 2vw, 1.25rem)' : 'clamp(1.2rem, 2.5vw, 1.5rem)'),
        fontWeight: styles?.fontWeight || 700,
    };

    const answerStyle: React.CSSProperties = {
        color: styles?.answerColor || styles?.color || 'rgba(255,255,255,0.7)',
        fontSize: '1.05rem',
        lineHeight: '1.7',
    };

    const iconStyle = (isActive: boolean): React.CSSProperties => ({
        backgroundColor: styles?.iconBgColor || (isActive ? 'var(--brand-600, #4f46e5)' : 'rgba(255,255,255,0.05)'),
        color: styles?.iconColor || (isActive ? '#ffffff' : 'inherit'),
    });

    /* ── Grid Layout Classes ─────────────────────────────────────── */
    const getGridCols = () => {
        if (layout === 'accordion') return 'flex flex-col max-w-3xl mx-auto gap-4';

        const desktop = gridColumns?.toString() || '2';
        const mobile = mobileColumns?.toString() || '1';
        const mobileClass = mobile === '2' ? 'grid-cols-2' : 'grid-cols-1';
        const desktopClass = desktop === '3' ? 'md:grid-cols-3' : desktop === '1' ? 'md:grid-cols-1' : 'md:grid-cols-2';

        return `grid ${mobileClass} ${desktopClass} max-w-7xl mx-auto gap-6 lg:gap-8`;
    };

    return (
        <section className="w-full relative overflow-hidden group/faq" style={containerStyle}>
            {/* Background Decorative Elements */}
            <div className="absolute top-1/4 -right-24 w-96 h-96 bg-brand-500/10 blur-[120px] rounded-full pointer-events-none animate-pulse" />
            <div className="absolute bottom-1/4 -left-24 w-96 h-96 bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none animate-pulse" style={{ animationDelay: '2s' }} />

            <div className="px-6 relative z-10 w-full">
                <div className="mb-12 md:mb-16">
                    <SectionHeader
                        title={headline || 'Common Questions'}
                        description={subline || 'Everything you need to know about our services'}
                        styles={styles}
                    />
                </div>

                <div className={`transition-all duration-700 ${getGridCols()}`}>
                    {loading ? (
                        <div className="col-span-full py-32 text-center">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="w-14 h-14 border-4 border-brand-500 border-t-transparent rounded-full mx-auto mb-8 shadow-[0_0_20px_rgba(79,70,229,0.3)]"
                            />
                            <p className="text-slate-400 font-bold tracking-tight text-lg">Loading knowledge base...</p>
                        </div>
                    ) : (faqs || []).length > 0 ? (
                        faqs.map((faq: FAQItem, index: number) => {
                            const isActive = layout === 'accordion' ? activeIndex === index : true;

                            return (
                                <motion.div
                                    key={faq.id || index}
                                    layout={layout === 'accordion'}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.05, duration: 0.5 }}
                                    className={`group/card relative flex flex-col transition-all duration-500 border backdrop-blur-xl
                                        ${layout === 'accordion' ? 'cursor-pointer hover:bg-white/[0.06] dark:hover:bg-white/[0.08]' : 'hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.4)] hover:-translate-y-2'}
                                        ${isActive && layout === 'accordion' ? 'ring-2 ring-brand-500/30' : ''}
                                    `}
                                    style={itemStyle(isActive)}
                                    onClick={layout === 'accordion' ? () => toggleAccordion(index) : undefined}
                                >
                                    {/* Grid layout sparkle */}
                                    {layout === 'grid' && (
                                        <div className="absolute top-6 right-6 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500">
                                            <Sparkles className="w-6 h-6 text-brand-400/40" />
                                        </div>
                                    )}

                                    <div className={`flex items-center gap-6 ${layout === 'accordion' ? 'p-6 md:p-7' : 'p-8 md:p-10 pb-6'}`}>
                                        <div
                                            className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center border border-white/10 shadow-xl transition-all duration-500 group-hover/card:scale-110 group-hover/card:rotate-3"
                                            style={iconStyle(isActive)}
                                        >
                                            {layout === 'accordion' ? (
                                                <AnimatePresence mode="wait">
                                                    {isActive ? (
                                                        <motion.div
                                                            key="minus"
                                                            initial={{ rotate: -90, opacity: 0 }}
                                                            animate={{ rotate: 0, opacity: 1 }}
                                                            exit={{ rotate: 90, opacity: 0 }}
                                                        >
                                                            <Minus className="w-6 h-6 stroke-[2.5px]" />
                                                        </motion.div>
                                                    ) : (
                                                        <motion.div
                                                            key="plus"
                                                            initial={{ rotate: 90, opacity: 0 }}
                                                            animate={{ rotate: 0, opacity: 1 }}
                                                            exit={{ rotate: -90, opacity: 0 }}
                                                        >
                                                            <Plus className="w-6 h-6 stroke-[2.5px]" />
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            ) : (
                                                <HelpCircle className="w-6 h-6" />
                                            )}
                                        </div>
                                        <h3 className="leading-snug tracking-tight flex-1" style={questionStyle}>
                                            {faq.question}
                                        </h3>

                                        {layout === 'grid' && (
                                            <div className="shrink-0 opacity-0 group-hover/card:opacity-100 group-hover/card:translate-x-1 transition-all">
                                                <ArrowRight className="w-5 h-5 text-brand-500" />
                                            </div>
                                        )}
                                    </div>

                                    {layout === 'grid' && (
                                        <div className="px-8 md:p-10 pt-0 pb-10">
                                            <div className="w-12 h-1 bg-brand-500/30 rounded-full mb-8" />
                                            <p style={answerStyle}>
                                                {faq.answer}
                                            </p>
                                        </div>
                                    )}

                                    {layout === 'accordion' && (
                                        <AnimatePresence initial={false}>
                                            {isActive && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="px-6 pb-8 md:px-8 md:pb-10 pt-0 ml-16 md:ml-18">
                                                        <div className="w-full h-px bg-white/10 mb-8" />
                                                        <p style={answerStyle}>
                                                            {faq.answer}
                                                        </p>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    )}

                                    {/* Glass reflection gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none opacity-50" />
                                </motion.div>
                            );
                        })
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="col-span-full py-24 text-center border-2 border-dashed border-white/10 rounded-[3rem] backdrop-blur-xl bg-white/[0.02]"
                        >
                            <div className="w-24 h-24 bg-gradient-to-br from-brand-500/20 to-indigo-500/20 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
                                <HelpCircle className="w-12 h-12 text-brand-400" />
                            </div>
                            <h4 className="text-2xl font-black text-white mb-3">No Help Articles Found</h4>
                            <p className="text-slate-400 max-w-sm mx-auto font-medium">
                                Configure your FAQ selection in the sidebar panel to display content here.
                            </p>
                        </motion.div>
                    )}
                </div>
            </div>

            <style jsx>{`
                .md\\:ml-18 {
                    @media (min-width: 768px) {
                        margin-left: 4.5rem;
                    }
                }
            `}</style>
        </section>
    );
}