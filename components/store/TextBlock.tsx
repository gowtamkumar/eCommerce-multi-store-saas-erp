
export default function TextBlock({ html, headline, styles }: { html: string, headline: string, styles: any }) {
    return (
        <section
            style={{
                ...styles,
                paddingTop: styles?.paddingTop,
                paddingBottom: styles?.paddingBottom,
                backgroundColor: styles?.backgroundColor,
                color: styles?.color
            }}
            className={`px-4 md:px-10 ${!styles?.paddingTop && !styles?.paddingBottom ? 'py-16 md:py-24' : ''}`}
        >
            <div className={`max-w-7xl mx-auto w-full flex ${styles.textAlign === 'left' ? 'justify-start text-left' : styles.textAlign === 'right' ? 'justify-end text-right' : 'justify-center text-center'}`}>
                <div
                    className="max-w-3xl w-full prose dark:prose-invert prose-brand lg:prose-2xl"
                    style={{ color: styles?.color }}
                >

                    <div className="space-y-8">
                        <h2
                            className="text-5xl md:text-7xl font-black tracking-tight uppercase leading-none"
                            style={{ color: styles?.headlineColor || styles?.color }}
                        >
                            {headline || 'The Art of Design'}
                        </h2>
                        <div
                            className={`w-32 h-2 rounded-full ${styles.textAlign === 'left' ? 'mr-auto' : styles.textAlign === 'right' ? 'ml-auto' : 'mx-auto'}`}
                            style={{ backgroundColor: styles?.sublineColor || '#4f46e5' }}
                        />
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