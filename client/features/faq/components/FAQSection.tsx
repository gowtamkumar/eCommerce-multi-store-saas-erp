"use client";

import { fetchAPI } from "@/services/api";
import { FAQItem } from "@/types/customizer";
import { HelpCircle, Sparkles, Plus, Minus } from "lucide-react";
import SectionHeader from "@/features/pages/components/customizer/SectionHeader";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
        paddingTop: resolvePx(styles?.paddingTop),
        paddingBottom: resolvePx(styles?.paddingBottom),
        paddingLeft: resolvePx(styles?.paddingLeft),
        paddingRight: resolvePx(styles?.paddingRight),
        marginTop: resolvePx(styles?.marginTop),
        marginBottom: resolvePx(styles?.marginBottom),
        backgroundColor: styles?.backgroundColor || 'transparent',
    };

    const itemStyle = (isActive: boolean): React.CSSProperties => ({
        backgroundColor: styles?.cardBackgroundColor || (isActive && layout === 'accordion' ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)'),
        borderColor: styles?.borderColor || 'rgba(255,255,255,0.1)',
        borderRadius: resolvePx(styles?.cardRadius) || '2rem',
        borderWidth: styles?.borderWidth ? resolvePx(styles.borderWidth) : '1px',
    });

    const questionStyle: React.CSSProperties = {
        color: styles?.questionColor || styles?.headlineColor || '#ffffff',
        fontSize: resolvePx(styles?.fontSize) || (layout === 'accordion' ? 'clamp(1rem, 2vw, 1.25rem)' : 'clamp(1.1rem, 2.5vw, 1.4rem)'),
        fontWeight: styles?.fontWeight || 800,
    };

    const answerStyle: React.CSSProperties = {
        color: styles?.answerColor || styles?.color || 'rgba(255,255,255,0.65)',
    };

    const iconStyle = (isActive: boolean): React.CSSProperties => ({
        backgroundColor: styles?.iconBgColor || (isActive && layout === 'accordion' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)'),
        color: styles?.iconColor || 'inherit',
    });

    /* ── Grid Layout Classes ─────────────────────────────────────── */
    const getGridCols = () => {
        if (layout === 'accordion') return 'grid-cols-1 max-w-4xl mx-auto';
        
        const desktop = gridColumns?.toString() || '2';
        const mobile = mobileColumns?.toString() || '1';
        const mobileClass = mobile === '2' ? 'grid-cols-2' : 'grid-cols-1';
        const desktopClass = desktop === '3' ? 'md:grid-cols-3' : desktop === '1' ? 'md:grid-cols-1' : 'md:grid-cols-2';

        return `${mobileClass} ${desktopClass} max-w-7xl mx-auto`;
    };

    return (
        <section className="w-full relative overflow-hidden" style={containerStyle}>
            {/* Background Decorative Blobs */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[500px] h-[500px] bg-brand-500/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="px-4 relative z-10 w-full">
                <div className={layout === 'accordion' ? 'max-w-4xl mx-auto' : 'max-w-7xl mx-auto'}>
                    <SectionHeader title={headline || 'Frequently Asked Questions'} description={subline} styles={styles} />
                </div>

                <div className={`grid gap-6 lg:gap-8 transition-all duration-700 ${getGridCols()}`}>
                    {loading ? (
                        <div className="col-span-full py-24 text-center">
                            <div className="animate-spin w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full mx-auto mb-6" />
                            <p className="text-slate-400 font-medium">Fetching help articles...</p>
                        </div>
                    ) : (faqs || []).length > 0 ? (
                        faqs.map((faq: FAQItem, index: number) => {
                            const isActive = layout === 'accordion' ? activeIndex === index : true;
                            return (
                                <div
                                    key={faq.id || index}
                                    className={`group/card relative flex flex-col transition-all duration-500 border ${layout === 'accordion' ? 'cursor-pointer' : 'hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] hover:-translate-y-1'}`}
                                    style={itemStyle(isActive)}
                                    onClick={layout === 'accordion' ? () => toggleAccordion(index) : undefined}
                                >
                                    {/* Grid layout decorations */}
                                    {layout === 'grid' && (
                                        <div className="absolute top-6 right-6 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500">
                                            <Sparkles className="w-5 h-5 text-brand-400/50" />
                                        </div>
                                    )}

                                    <div className={`flex items-start gap-5 ${layout === 'accordion' ? 'p-6 md:p-8' : 'p-8 md:p-10 pb-6 md:pb-6'}`}>
                                        <div 
                                            className="shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center border border-white/10 shadow-lg backdrop-blur-md transition-all duration-500 group-hover/card:scale-110"
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
                                                            transition={{ duration: 0.2 }}
                                                        >
                                                            <Minus className="w-6 h-6" />
                                                        </motion.div>
                                                    ) : (
                                                        <motion.div
                                                            key="plus"
                                                            initial={{ rotate: 90, opacity: 0 }}
                                                            animate={{ rotate: 0, opacity: 1 }}
                                                            exit={{ rotate: -90, opacity: 0 }}
                                                            transition={{ duration: 0.2 }}
                                                        >
                                                            <Plus className="w-6 h-6" />
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            ) : (
                                                <HelpCircle className="w-6 h-6 opacity-80" />
                                            )}
                                        </div>
                                        <h3 className="leading-tight tracking-tight mt-1 flex-1" style={questionStyle}>
                                            {faq.question}
                                        </h3>
                                    </div>

                                    {layout === 'grid' && (
                                        <div className="px-8 md:p-10 pt-0">
                                            <div className="h-px w-full bg-gradient-to-r from-white/10 via-white/5 to-transparent mb-6" />
                                            <p className="text-base md:text-lg leading-relaxed font-medium" style={answerStyle}>
                                                {faq.answer}
                                            </p>
                                        </div>
                                    )}

                                    {layout === 'accordion' && (
                                        <AnimatePresence>
                                            {isActive && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="px-6 pb-6 md:px-8 md:pb-8 pt-0 ml-16 md:ml-16">
                                                        <div className="h-px w-full bg-white/5 mb-6" />
                                                        <p className="text-base md:text-lg leading-relaxed font-medium" style={answerStyle}>
                                                            {faq.answer}
                                                        </p>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    )}

                                    {/* Bottom highlight ring (subtle) */}
                                    {layout === 'grid' && (
                                        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-brand-500/20 to-transparent scale-x-0 group-hover/card:scale-x-100 transition-transform duration-700 rounded-full" />
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <div className="col-span-full py-24 text-center border-4 border-dashed border-white/5 rounded-[3rem] backdrop-blur-sm">
                            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                                <HelpCircle className="w-10 h-10 text-slate-500" />
                            </div>
                            <h4 className="text-xl font-bold text-slate-300 mb-2">Knowledge Base Empty</h4>
                            <p className="text-slate-500">Manage your FAQ content in the section settings panel</p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}