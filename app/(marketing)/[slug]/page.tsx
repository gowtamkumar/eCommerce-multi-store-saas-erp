import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import PaymentStatus from "@/components/PaymentStatus";
import SectionRenderer from "@/components/SectionRenderer";
import WhatsAppWidget from "@/components/WhatsAppWidget";
import { fetchAPI } from "@/lib/api";
import { getTenantId } from "@/lib/tenant";
import { notFound } from "next/navigation";
import { Suspense } from "react";

async function getPage(slug: string) {
    try {
        const tenantId = await getTenantId();

        const data = await fetchAPI(`/pages/slug/${slug}`, {
            headers: {
                'x-tenant-id': tenantId || '',
            },
            cache: 'no-store'
        });

        return data.success ? data.data : null;
    } catch (error) {
        console.error('Error fetching page:', error);
        return null;
    }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const page = await getPage(slug);

    if (!page) return {};

    return {
        title: page.metaTitle || `${page.title}`,
        description: page.metaDescription,
    };
}

export default async function DynamicPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    // Reserved slugs
    if (['api', 'admin', 'login', 'products', 'checkout', 'orders'].includes(slug)) {
        return notFound();
    }

    const page = await getPage(slug);

    if (!page) {
        notFound();
    }

    return (
        <main className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
            <Suspense fallback={null}>
                <PaymentStatus />
            </Suspense>
            <Navbar />
            <div className="pt-20">
                {/* If the page has modern sections, use the renderer */}
                {page.sections && page.sections.length > 0 ? (
                    <SectionRenderer sections={page.sections} />
                ) : (
                    /* Fallback for legacy content-only pages */
                    <div className="pt-32 pb-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 font-inter">
                        <h1 className="text-4xl md:text-5xl font-bold font-display text-slate-900 dark:text-white mb-8">
                            {page.title}
                        </h1>
                        <div
                            className="prose prose-lg dark:prose-invert max-w-none"
                            dangerouslySetInnerHTML={{ __html: page.content || '' }}
                        />
                    </div>
                )}
            </div>
            <WhatsAppWidget />
            <Footer />
        </main>
    );
}
