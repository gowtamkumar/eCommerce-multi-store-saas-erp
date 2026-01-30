import SectionRenderer from "@/components/core/SectionRenderer";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import PaymentStatus from "@/components/store/PaymentStatus";
import WhatsAppWidget from "@/components/ui/WhatsAppWidget";
import { fetchAPI } from "@/lib/api";
import { notFound } from "next/navigation";
import { Suspense } from "react";

async function getPage(slug: string) {
    try {
        const data = await fetchAPI(`/pages/slug/${slug}`);
        return data.success ? data.data : null;
    } catch (error) {
        console.error("Error fetching page:", error);
        return null;
    }
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const page = await getPage(slug);

    if (!page) return {};

    return {
        title: page.metaTitle || `${page.title}`,
        description: page.metaDescription,
    };
}

export default async function DynamicPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;

    // Reserved slugs
    if (
        ["api", "admin", "login", "products", "checkout", "orders"].includes(slug)
    ) {
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
            <div
                className="pt-20"
                style={{
                    fontFamily: page.typography?.fontFamily || 'Inter, sans-serif',
                    fontSize: `${page.typography?.baseFontSize || 16}px`,
                    ...(page.typography?.headingFont && {
                        '--heading-font': page.typography.headingFont,
                    } as React.CSSProperties),
                }}
            >
                {/* If the page has modern sections, use the renderer */}
                {page.sections.length > 0 &&
                    page.sections.map((section: any) => (
                        <SectionRenderer key={section.id} section={section} />
                    ))}
            </div>
            <WhatsAppWidget />
            <Footer />
        </main>
    );
}
