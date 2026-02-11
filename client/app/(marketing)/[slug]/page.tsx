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
                    fontSize: `${page.typography?.baseFontSize || 18}px`,
                    ...(page.typography?.headingFont && { '--heading-font': page.typography.headingFont } as React.CSSProperties),
                    ...(page.typography?.headingFontFamily && { '--heading-font-family': page.typography.headingFontFamily } as React.CSSProperties),
                    ...(page.typography?.headingFontWeight && { '--heading-font-weight': page.typography.headingFontWeight } as React.CSSProperties),
                    ...(page.typography?.headingFontSize && { '--heading-font-size': page.typography.headingFontSize } as React.CSSProperties),
                    ...(page.typography?.headingLineHeight && { '--heading-line-height': page.typography.headingLineHeight } as React.CSSProperties),
                    ...(page.typography?.paragraphFontFamily && { '--paragraph-font-family': page.typography.paragraphFontFamily } as React.CSSProperties),
                    ...(page.typography?.paragraphFontWeight && { '--paragraph-font-weight': page.typography.paragraphFontWeight } as React.CSSProperties),
                    ...(page.typography?.paragraphFontSize && { '--paragraph-font-size': page.typography.paragraphFontSize } as React.CSSProperties),
                    ...(page.typography?.paragraphLineHeight && { '--paragraph-line-height': page.typography.paragraphLineHeight } as React.CSSProperties),
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
