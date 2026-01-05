import dbConnect from '@/lib/mongodb';
import Page from '@/models/Page';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default async function DynamicPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    await dbConnect();
    const page = await Page.findOne({ slug, isPublished: true });

    if (!page) {
        notFound();
    }

    return (
        <main className="min-h-screen bg-white dark:bg-slate-900">
            <Navbar />

            <div className="pt-32 pb-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl md:text-5xl font-bold font-display text-slate-900 dark:text-white mb-8">
                    {page.title}
                </h1>

                <div
                    className="prose prose-lg dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: page.content }}
                />
            </div>

            <Footer />
        </main>
    );
}
