
export default function TextBlock({ alignment, html, headline, styles }: { alignment: string, html: string, headline: string, styles: any }) {
    return (
        <section style={styles} className="px-4 md:px-10 py-16 md:py-24">
            <div className={`max-w-7xl mx-auto w-full flex ${alignment === 'left' ? 'justify-start text-left' : alignment === 'right' ? 'justify-end text-right' : 'justify-center text-center'}`}>
                <div className="max-w-3xl w-full prose dark:prose-invert prose-brand lg:prose-2xl">

                    <div className="space-y-8">
                        <h2 className="text-5xl md:text-7xl font-black tracking-tight uppercase leading-none">{headline || 'The Art of Design'}</h2>
                        <div className={`w-32 h-2 bg-brand-600 rounded-full ${alignment === 'left' ? 'mr-auto' : alignment === 'right' ? 'ml-auto' : 'mx-auto'}`} />
                        {html ? (
                            <div dangerouslySetInnerHTML={{ __html: html }} className="space-y-8" />
                        ) : (
                            <p className="text-xl md:text-3xl opacity-70 leading-relaxed font-medium">
                                Add meaningful storytelling content here to connect with your customers.
                            </p>
                        )}
                    </div>

                </div>
            </div>
        </section>
    )

}