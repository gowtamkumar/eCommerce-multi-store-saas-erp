'use client'
import ContactForm from '@/features/contact/components/ContactForm';
import { getSiteSettings } from '@/services/getSettings';
import { ContactSectionSettings, SectionStyles } from '@/types/customizer';
import { Mail, MapPin, Phone } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ContactSectionProps {
    settings: ContactSectionSettings;
    styles: SectionStyles;
}

export default function ContactSection({ settings, styles }: ContactSectionProps) {
    const [siteSettings, setSiteSettings] = useState<any>(null);

    useEffect(() => {
        getSiteSettings().then(setSiteSettings);
    }, []);

    const showInfo = settings?.showInfo !== false;
    const showForm = settings?.showForm !== false;
    const showMap = settings?.showMap !== false; // Placeholder for map if implemented later

    const cardLayout = settings?.cardLayout || 'left';

    return (
        <section
            style={{
                paddingTop: styles?.paddingTop,
                paddingBottom: styles?.paddingBottom,
                backgroundColor: styles?.backgroundColor || 'transparent',
                color: styles?.textColor
            }}
            className="relative"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    {settings?.title && (
                        <h2
                            className="text-4xl md:text-5xl font-bold font-display mb-6"
                            style={{ color: styles?.headlineColor }}
                        >
                            {settings.title}
                        </h2>
                    )}
                    {settings?.subline && (
                        <p
                            className="text-xl opacity-80"
                            style={{ color: styles?.sublineColor }}
                        >
                            {settings.subline}
                        </p>
                    )}
                </div>

                <div className={`grid lg:grid-cols-2 gap-12 lg:gap-24 items-start ${cardLayout === 'right' ? 'lg:grid-flow-dense' : ''}`}>
                    {/* Contact Info */}
                    {showInfo && (
                        <div className={`space-y-8 ${cardLayout === 'right' ? 'lg:col-start-2' : ''} ${!showForm ? 'lg:col-span-2 max-w-2xl mx-auto w-full' : ''}`}>
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-3xl border border-slate-100 dark:border-slate-700">
                                <h3 className="text-2xl font-bold mb-6" style={{ color: styles?.headlineColor }}>Contact Information</h3>
                                <div className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div
                                            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                                            style={{
                                                backgroundColor: styles?.iconBgColor || 'rgba(59, 130, 246, 0.1)',
                                                color: styles?.iconColor || '#3b82f6'
                                            }}
                                        >
                                            <Mail className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold mb-1" style={{ color: styles?.headlineColor }}>Email Us</h4>
                                            <p className="opacity-80" style={{ color: styles?.textColor }}>
                                                {settings?.email || siteSettings?.contactEmail || 'support@luxeaudio.com'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div
                                            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                                            style={{
                                                backgroundColor: styles?.iconBgColor || 'rgba(59, 130, 246, 0.1)',
                                                color: styles?.iconColor || '#3b82f6'
                                            }}
                                        >
                                            <Phone className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold mb-1" style={{ color: styles?.headlineColor }}>Call Us</h4>
                                            <p className="opacity-80" style={{ color: styles?.textColor }}>
                                                {settings?.phone || siteSettings?.contactPhone || '+1 (555) 000-0000'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div
                                            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                                            style={{
                                                backgroundColor: styles?.iconBgColor || 'rgba(59, 130, 246, 0.1)',
                                                color: styles?.iconColor || '#3b82f6'
                                            }}
                                        >
                                            <MapPin className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold mb-1" style={{ color: styles?.headlineColor }}>Visit Us</h4>
                                            <p className="opacity-80" style={{ color: styles?.textColor }}>
                                                {settings?.address || siteSettings?.address || '123 Audio Street, Sound City, SC 90210'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Contact Form */}
                    {showForm && (
                        <div className={`bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 ${!showInfo ? 'lg:col-span-2 max-w-2xl mx-auto w-full' : ''}`}>
                            <h3 className="text-2xl font-bold mb-6" style={{ color: styles?.headlineColor }}>Send us a Message</h3>
                            <ContactForm />
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
