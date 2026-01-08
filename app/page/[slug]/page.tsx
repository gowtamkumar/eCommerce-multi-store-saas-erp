import FAQ from '@/components/FAQ';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import ProductGrid from '@/components/ProductGrid';
import Reviews from '@/components/Reviews';
import { getSiteSettings } from '@/lib/getSettings';
import { ArrowRight } from 'lucide-react';
import { headers } from "next/headers";
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

async function getPage(slug: string) {
  try {
    const headersList = await headers();
    const tenantId = headersList.get("x-tenant-id") || "";
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3900/api/v1';

    const res = await fetch(`${apiUrl}/pages/slug/${slug}`, {
      headers: {
        "x-tenant-id": tenantId,
      },
      cache: 'no-store'
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error("Error fetching page:", error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await getPage(slug);

  if (!page) {
    return {
      title: 'Page Not Found',
    };
  }

  return {
    title: page.title,
    description: page.metaDescription || page.title,
  };
}

export default async function DynamicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await getPage(slug);
  const settings = await getSiteSettings();

  if (!page) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar settings={settings} />

      <main>
        {/* Render sections if they exist, otherwise fallback to legacy content */}
        {page.sections && page.sections.length > 0 ? (
          <div className="space-y-0">
            {page.sections.sort((a: any, b: any) => a.order - b.order).map((section: any) => (
              <div key={section.id}>
                {section.type === 'hero' && (
                  <section className="relative pt-40 pb-24 overflow-hidden">
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] rounded-full bg-brand-500/10 blur-[120px]" />
                      <div className="absolute top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[100px]" />
                    </div>
                    <div className="container mx-auto px-4 relative z-10 text-center">
                      <h1 className="text-5xl md:text-7xl font-bold font-display text-slate-900 dark:text-white mb-6 tracking-tight">
                        {section.content?.heading}
                      </h1>
                      <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        {section.content?.subtext}
                      </p>
                    </div>
                  </section>
                )}

                {section.type === 'content' && (
                  <section className="py-20">
                    <div className="container mx-auto px-4">
                      <div className="max-w-4xl mx-auto">
                        <div className="prose prose-slate dark:prose-invert prose-lg max-w-none">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {section.content?.text}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  </section>
                )}

                {section.type === 'faq' && <FAQ />}

                {section.type === 'testimonials' && <Reviews />}

                {section.type === 'cta' && (
                  <section className="py-24">
                    <div className="container mx-auto px-4">
                      <div className="max-w-5xl mx-auto bg-brand-600 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl shadow-brand-500/20">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                        <div className="relative z-10">
                          <h2 className="text-3xl md:text-5xl font-bold text-white mb-8 font-display tracking-tight">
                            {section.content?.title || 'Ready to transform your sound experience?'}
                          </h2>
                          <button className="px-10 py-5 bg-white text-brand-600 hover:bg-slate-100 rounded-full font-bold transition-all shadow-xl hover:shadow-2xl hover:scale-105 flex items-center gap-3 mx-auto">
                            {section.content?.buttonText || 'Shop Collection Now'}
                            <ArrowRight className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </section>
                )}

                {section.type === 'products' && (
                  <section className="container mx-auto px-4 py-20">
                    <ProductGrid />
                  </section>
                )}
              </div>
            ))}
          </div>
        ) : (
          /* Backward Compatibility: Legacy Content Layout */
          <>
            <div className="relative pt-32 pb-20 overflow-hidden">
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] rounded-full bg-brand-500/10 blur-[120px]" />
                <div className="absolute top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[100px]" />
              </div>

              <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-4xl mx-auto space-y-6 text-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-900/30 border border-brand-100 dark:border-brand-800 text-brand-600 dark:text-brand-400 text-xs font-bold uppercase tracking-wider">
                    {page.status === 'published' ? 'Official Page' : 'Draft'}
                  </div>

                  <h1 className="text-4xl md:text-6xl font-bold font-display text-slate-900 dark:text-white tracking-tight leading-tight">
                    {page.title}
                  </h1>

                  {page.metaDescription && (
                    <p className="text-lg text-slate-500 dark:text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
                      {page.metaDescription}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="container mx-auto px-4 pb-24">
              <div className="max-w-4xl mx-auto">
                <div className="bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] border border-white dark:border-slate-800/50 shadow-2xl overflow-hidden">
                  <article className="p-8 md:p-16">
                    <div className="prose prose-slate dark:prose-invert prose-lg max-w-none 
                      prose-headings:font-display prose-headings:font-bold prose-headings:tracking-tight
                      prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
                      prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4
                      prose-p:text-slate-600 dark:prose-p:text-slate-300 prose-p:leading-relaxed prose-p:mb-6
                      prose-a:text-brand-600 dark:prose-a:text-brand-400 prose-a:no-underline hover:prose-a:underline
                      prose-ul:list-disc prose-ol:list-decimal
                      prose-li:text-slate-600 dark:prose-li:text-slate-300 prose-li:mb-2
                      prose-img:rounded-3xl prose-img:shadow-xl prose-img:border prose-img:border-slate-200 dark:prose-img:border-slate-800
                    ">
                      {page.contentType === 'markdown' ? (
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {page.content}
                        </ReactMarkdown>
                      ) : (
                        <div dangerouslySetInnerHTML={{ __html: page.content }} />
                      )}
                    </div>
                  </article>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      <Footer settings={settings} />
    </div>
  );
}
