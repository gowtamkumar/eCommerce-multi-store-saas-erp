'use client'

import ContactForm from '@/features/contact/components/ContactForm';
import { getSiteSettings } from '@/services/getSettings';
import { ContactSectionSettings } from '@/types/customizer';
import { Mail, MapPin, Phone, Sparkles } from 'lucide-react';
import SectionHeader from "./SectionHeader";
import { useEffect, useState, useMemo } from 'react';

interface ContactSectionProps {
    settings: ContactSectionSettings;
    styles: any;
}

export default function ContactSection({ settings, styles }: ContactSectionProps) {
    const [siteSettings, setSiteSettings] = useState<any>(null);
    const uid = useMemo(() => `contact-${Math.random().toString(36).substring(2, 9)}`, []);

    useEffect(() => {
        getSiteSettings().then(setSiteSettings);
    }, []);

    const showInfo = settings?.showInfo !== false;
    const showForm = settings?.showForm !== false;
    const cardLayout = settings?.cardLayout || 'left';

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

    const infoCardStyle: React.CSSProperties = {
        backgroundColor: styles?.cardBackgroundColor || 'rgba(255,255,255,0.03)',
        borderColor: styles?.borderColor || 'rgba(255,255,255,0.1)',
        borderRadius: resolvePx(styles?.cardRadius) || '2.5rem',
        borderWidth: styles?.borderWidth ? resolvePx(styles.borderWidth) : '1px',
    };

    const formCardStyle: React.CSSProperties = {
        backgroundColor: styles?.formBgColor || 'rgba(255,255,255,0.05)',
        borderColor: styles?.borderColor || 'rgba(255,255,255,0.1)',
        borderRadius: resolvePx(styles?.cardRadius) || '2.5rem',
        borderWidth: styles?.borderWidth ? resolvePx(styles.borderWidth) : '1px',
    };

    const iconBoxStyle: React.CSSProperties = {
        backgroundColor: styles?.iconBgColor || 'rgba(255,255,255,0.05)',
        color: styles?.iconColor || 'inherit',
    };

    const cardHeadingStyle: React.CSSProperties = {
        color: styles?.cardHeadingColor || styles?.headlineColor || styles?.color || 'inherit',
        textAlign: styles?.titleAlign || 'left',
        fontSize: resolvePx(styles?.cardHeadingSize) || undefined,
        fontWeight: styles?.cardHeadingWeight || 900,
    };

    return (
        <section className={`w-full relative overflow-hidden ${uid}`} style={containerStyle}>
            {/* Background Decorative Blobs */}
            <div className="absolute top-0 left-0 -translate-y-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brand-500/10 blur-[130px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 right-0 translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-indigo-500/10 blur-[130px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 relative z-10 w-full">
                <SectionHeader title={settings?.title || "Get in Touch"} description={settings?.subline} styles={styles} />

                <div
                    className={`grid lg:grid-cols-2 lg:gap-16 items-start ${cardLayout === 'right' ? 'lg:grid-flow-dense' : ''}`}
                    style={{ gap: resolvePx(styles?.gap) }}
                >
                    {/* Contact Info Card */}
                    {showInfo && (
                        <div
                            className={`group/info relative p-10 md:p-14 transition-all duration-700 border hover:shadow-[0_30px_100px_-20px_rgba(0,0,0,0.4)] backdrop-blur-xl ${cardLayout === 'right' ? 'lg:col-start-2' : ''} ${!showForm ? 'lg:col-span-2 max-w-4xl mx-auto w-full' : ''}`}
                            style={infoCardStyle}
                        >
                            <div className="absolute top-10 right-10 opacity-0 group-hover/info:opacity-100 transition-opacity duration-700">
                                <Sparkles className="w-6 h-6 text-brand-400/30 animate-pulse" />
                            </div>

                            <h3 className="text-3xl md:text-4xl mb-10 tracking-tighter" style={cardHeadingStyle}>
                                Contact <span className="text-brand-500">Information</span>
                            </h3>

                            <div className="space-y-10">
                                {[
                                    { icon: Mail, label: "Email Us", value: settings?.email || siteSettings?.contactEmail || 'support@example.com' },
                                    { icon: Phone, label: "Call Us", value: settings?.phone || siteSettings?.contactPhone || '+1 (555) 000-0000' },
                                    { icon: MapPin, label: "Visit Us", value: settings?.address || siteSettings?.address || '123 Audio Street, Sound City, SC 90210' }
                                ].map((item, idx) => (
                                    <div key={idx} className="flex items-start gap-6 group/item">
                                        <div
                                            className="shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center border border-white/10 shadow-xl transition-all duration-500 group-hover/item:scale-110 group-hover/item:rotate-6"
                                            style={iconBoxStyle}
                                        >
                                            <item.icon className="w-7 h-7" />
                                        </div>
                                        <div className="pt-1">
                                            <h4 className="font-black mb-2 uppercase text-[10px] tracking-[0.2em] text-slate-500">
                                                {item.label}
                                            </h4>
                                            <p className="text-lg md:text-xl font-bold tracking-tight opacity-90 group-hover/item:text-brand-400 transition-colors duration-300" style={{ color: styles?.color || 'inherit' }}>
                                                {item.value}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Decorative line */}
                            <div className="mt-14 h-px w-full bg-gradient-to-r from-white/10 via-white/20 to-transparent" />
                        </div>
                    )}

                    {/* Contact Form Card */}
                    {showForm && (
                        <div
                            className={`p-10 md:p-14 border transition-all duration-700 hover:shadow-[0_30px_100px_-20px_rgba(0,0,0,0.4)] backdrop-blur-3xl ${!showInfo ? 'lg:col-span-2 max-w-4xl mx-auto w-full' : ''}`}
                            style={formCardStyle}
                        >
                            <h3 className="text-3xl md:text-4xl mb-10 tracking-tighter" style={cardHeadingStyle}>
                                Send us a <span className="text-brand-500">Message</span>
                            </h3>
                            <ContactForm styles={styles} />
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
