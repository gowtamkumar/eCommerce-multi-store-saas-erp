import Product from "@/features/product/components/Product";
import SectionRenderer from "@/features/pages/components/customizer/SectionRenderer";
import { fetchAPI } from "@/services/api";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppWidget from "@/components/shared/WhatsAppWidget";
import { Suspense } from "react";
import PaymentStatus from "@/components/shared/PaymentStatus";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    let landingPage = null;

    try {
        const res = await fetchAPI(`/products/slug/${slug}`);
        if (res.success && res.data?.landingPage) {
            landingPage = res.data.landingPage;
        }
    } catch (error) {
        console.error("Failed to fetch product for landing page check", error);
    }

    if (landingPage && landingPage.sections?.length > 0) {
        return (
            <main className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                <Suspense fallback={null}>
                    <PaymentStatus />
                </Suspense>
                <Navbar />
                <div
                    className="pt-20"
                    style={{
                        fontFamily: landingPage.typography?.fontFamily || 'Inter, sans-serif',
                        fontSize: `${landingPage.typography?.baseFontSize || 18}px`,
                        ...(landingPage.typography?.headingFont && { '--heading-font': landingPage.typography.headingFont } as React.CSSProperties),
                        ...(landingPage.typography?.headingFontFamily && { '--heading-font-family': landingPage.typography.headingFontFamily } as React.CSSProperties),
                        ...(landingPage.typography?.headingFontWeight && { '--heading-font-weight': landingPage.typography.headingFontWeight } as React.CSSProperties),
                        ...(landingPage.typography?.headingFontSize && { '--heading-font-size': landingPage.typography.headingFontSize } as React.CSSProperties),
                        ...(landingPage.typography?.headingLineHeight && { '--heading-line-height': landingPage.typography.headingLineHeight } as React.CSSProperties),
                        ...(landingPage.typography?.paragraphFontFamily && { '--paragraph-font-family': landingPage.typography.paragraphFontFamily } as React.CSSProperties),
                        ...(landingPage.typography?.paragraphFontWeight && { '--paragraph-font-weight': landingPage.typography.paragraphFontWeight } as React.CSSProperties),
                        ...(landingPage.typography?.paragraphFontSize && { '--paragraph-font-size': landingPage.typography.paragraphFontSize } as React.CSSProperties),
                        ...(landingPage.typography?.paragraphLineHeight && { '--paragraph-line-height': landingPage.typography.paragraphLineHeight } as React.CSSProperties),
                    }}
                >
                    {landingPage.sections.map((section: any) => (
                        <SectionRenderer key={section.id} section={section} />
                    ))}
                </div>
                <WhatsAppWidget />
                <Footer />
            </main>
        );
    }

    return (
        <Product params={params} />
    );
}