import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import PaymentStatus from "@/components/shared/PaymentStatus";
import SectionRenderer from "@/features/admin/pages/components/customizer/SectionRenderer";
import { fetchAPI } from "@/services/api";
import { notFound } from "next/navigation";
import { Suspense } from "react";

// ISR: Revalidate pages every 10 minutes
export const revalidate = 600;

async function getPageData(slug: string) {
    try {
        const data = await fetchAPI(`/pages/slug/${slug}`);
        return data.success ? data.data : null;
    } catch (error) {
        console.error(`Error fetching page [${slug}]:`, error);
        return null;
    }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const page = await getPageData(slug);

    if (!page) return {};
    const image = page.ogImage;

    return {
        title: page.metaTitle || `${page.title}`,
        description: page.metaDescription,
        openGraph: {
            title: page.metaTitle || `${page.title}`,
            description: page.metaDescription,
            images: image ? [image] : [],
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: page.metaTitle || `${page.title}`,
            description: page.metaDescription,
            images: image ? [image] : [],
        },
    };
}

export default async function DynamicPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    // Reserved slugs check
    const reservedSlugs = ["api", "admin", "login", "products", "checkout", "orders"];
    if (reservedSlugs.includes(slug)) {
        return notFound();
    }

    const page = await getPageData(slug);
    if (!page) {
        notFound();
    }

    // Modern Typography Injection (using CSS Variables for cleaner JSX)
    const typographyStyles: React.CSSProperties = {
        fontFamily: page.typography?.fontFamily || 'Inter, sans-serif',
        fontSize: `${page.typography?.baseFontSize || 18}px`,
        '--heading-font': page.typography?.headingFont,
        '--heading-font-family': page.typography?.headingFontFamily,
        '--heading-font-weight': page.typography?.headingFontWeight,
        '--heading-font-size': page.typography?.headingFontSize,
        '--heading-line-height': page.typography?.headingLineHeight,
        '--paragraph-font-family': page.typography?.paragraphFontFamily,
        '--paragraph-font-weight': page.typography?.paragraphFontWeight,
        '--paragraph-font-size': page.typography?.paragraphFontSize,
        '--paragraph-line-height': page.typography?.paragraphLineHeight,
    } as React.CSSProperties;

    return (
        <main className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
            <Suspense fallback={null}>
                <PaymentStatus />
            </Suspense>
            <Navbar />

            <div className="pt-20" style={typographyStyles}>
                {/* Dynamically render page sections */}
                {page.sections?.length > 0 &&
                    page.sections.map((section: any) => (
                        <SectionRenderer key={section.id} section={section} />
                    ))}
            </div>

            <Footer />
        </main>
    );
}
