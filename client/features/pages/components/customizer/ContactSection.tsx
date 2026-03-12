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
    const cardLayout = settings?.cardLayout || 'left';

    const cardRadiusClass = styles?.cardRadius === 'small' ? 'rounded-lg' :
        styles?.cardRadius === 'large' ? 'rounded-[2rem]' :
            styles?.cardRadius === 'full' ? 'rounded-full' :
                styles?.cardRadius === 'none' ? 'rounded-none' : 'rounded-2xl';

    return (
        <div className="w-full">
            <div className="w-full">
                <div className="w-full">
                    {(settings?.title || settings?.subline) && (
                        <div className={`mb-12 space-y-4
                            ${styles?.textAlign === 'center' ? 'text-center' : ''}
                            ${styles?.textAlign === 'right' ? 'text-right' : 'text-left'}
                        `}>
                            {settings?.title && (
                                <h2
                                    className="text-3xl md:text-5xl font-black uppercase tracking-tight"
                                    style={{ color: styles?.headlineColor || styles?.color || 'inherit' }}
                                >
                                    {settings.title}
                                </h2>
                            )}
                            {settings?.subline && (
                                <p
                                    className="text-lg opacity-80"
                                    style={{ color: styles?.color || 'inherit' }}
                                >
                                    {settings.subline}
                                </p>
                            )}
                        </div>
                    )}

                    <div className={`grid lg:grid-cols-2 gap-8 lg:gap-12 items-start ${cardLayout === 'right' ? 'lg:grid-flow-dense' : ''}`}>
                        {/* Contact Info */}
                        {showInfo && (
                            <div className={`${cardLayout === 'right' ? 'lg:col-start-2' : ''} ${!showForm ? 'lg:col-span-2' : ''}`}>
                                <div className={`bg-slate-50 dark:bg-slate-800/50 p-8 ${cardRadiusClass} border border-slate-100 dark:border-slate-700`}>
                                    <h3 className="text-2xl font-black mb-6 uppercase tracking-tight" style={{ color: styles?.headlineColor || styles?.color || 'inherit' }}>Contact Information</h3>
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
                                                <h4 className="font-bold mb-1 uppercase text-xs tracking-widest opacity-60" style={{ color: styles?.color || 'inherit' }}>Email Us</h4>
                                                <p className="font-medium" style={{ color: styles?.color || 'inherit' }}>
                                                    {settings?.email || siteSettings?.contactEmail || 'support@example.com'}
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
                                                <h4 className="font-bold mb-1 uppercase text-xs tracking-widest opacity-60" style={{ color: styles?.color || 'inherit' }}>Call Us</h4>
                                                <p className="font-medium" style={{ color: styles?.color || 'inherit' }}>
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
                                                <h4 className="font-bold mb-1 uppercase text-xs tracking-widest opacity-60" style={{ color: styles?.color || 'inherit' }}>Visit Us</h4>
                                                <p className="font-medium" style={{ color: styles?.color || 'inherit' }}>
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
                            <div className={`bg-white dark:bg-slate-800 p-8 ${cardRadiusClass} shadow-xl shadow-slate-200/20 dark:shadow-none border border-slate-100 dark:border-slate-700 ${!showInfo ? 'lg:col-span-2' : ''}`}>
                                <h3 className="text-2xl font-black mb-6 uppercase tracking-tight" style={{ color: styles?.headlineColor || styles?.color || 'inherit' }}>Send us a Message</h3>
                                <ContactForm />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
