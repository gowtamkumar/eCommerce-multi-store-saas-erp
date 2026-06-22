import ContactForm from '@/features/storefront/contact/components/ContactForm';
import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';
import { getSiteSettings } from '@/services/getSettings';
import { Mail, MapPin, Phone } from 'lucide-react';

export async function generateMetadata() {
    const settings = await getSiteSettings();
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL

    return {
        title: `Contact Us | ${settings.brandName || 'LuxeAudio'}`,
        description: `Get in touch with ${settings.brandName || 'LuxeAudio'}. We're here to help with any questions about our products.`,
        openGraph: {
            title: `Contact Us | ${settings.brandName || 'LuxeAudio'}`,
            description: `Get in touch with ${settings.brandName || 'LuxeAudio'}. We're here to help with any questions about our products.`,
            type: 'website',
            url: `${baseUrl}/contact`,
        },
        twitter: {
            card: 'summary',
            title: `Contact Us | ${settings.brandName || 'LuxeAudio'}`,
            description: `Get in touch with ${settings.brandName || 'LuxeAudio'}. We're here to help with any questions about our products.`,
        },
    };
}

export default async function Contact() {
    const settings = await getSiteSettings();

    return (
        <main className="min-h-screen bg-white dark:bg-slate-900">
            <Navbar />

            <div className="pt-32 pb-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h1 className="text-4xl md:text-5xl font-bold font-display text-slate-900 dark:text-white mb-6">
                            Get in <span className="text-gradient">Touch</span>
                        </h1>
                        <p className="text-xl text-slate-600 dark:text-slate-400">
                            Have questions about our products? We're here to help.
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-start">
                        {/* Contact Info */}
                        <div className="space-y-8">
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-3xl border border-slate-100 dark:border-slate-700">
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Contact Information</h3>
                                <div className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 flex-shrink-0">
                                            <Mail className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 dark:text-white mb-1">Email Us</h4>
                                            <p className="text-slate-600 dark:text-slate-400">{settings.contactEmail || 'support@luxeaudio.com'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 flex-shrink-0">
                                            <Phone className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 dark:text-white mb-1">Call Us</h4>
                                            <p className="text-slate-600 dark:text-slate-400">{settings.contactPhone}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center text-pink-600 dark:text-pink-400 flex-shrink-0">
                                            <MapPin className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 dark:text-white mb-1">Visit Us</h4>
                                            <p className="text-slate-600 dark:text-slate-400">{settings.address}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700">
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Send us a Message</h3>
                            <ContactForm />
                        </div>
                    </div>
                </div>
            </div>

            <Footer settings={settings} />
        </main>
    );
}
