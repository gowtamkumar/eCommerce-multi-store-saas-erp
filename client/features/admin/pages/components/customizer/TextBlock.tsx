export default function TextBlock({ html, headline, styles }: { html: string, headline: string, styles: any }) {
    return (
        <div className="w-full">
            <div className={`w-full flex ${styles.textAlign === 'left' ? 'justify-start text-left' : styles.textAlign === 'right' ? 'justify-end text-right' : 'justify-center text-center'}`}>
                <div
                    className="w-full prose dark:prose-invert prose-brand lg:prose-2xl"
                    style={{ color: styles?.color || 'inherit' }}
                >
                    <div className="space-y-8">
                        {headline && (
                            <div className="space-y-6">
                                <h2
                                    className="text-4xl md:text-6xl font-black tracking-tight uppercase leading-none"
                                    style={{ color: styles?.headlineColor || styles?.color || 'inherit' }}
                                >
                                    {headline}
                                </h2>
                                <div
                                    className={`w-24 h-2 rounded-full ${styles.textAlign === 'left' ? 'mr-auto' : styles.textAlign === 'right' ? 'ml-auto' : 'mx-auto'}`}
                                    style={{ backgroundColor: styles?.sublineColor || styles?.headlineColor || '#4f46e5' }}
                                />
                            </div>
                        )}
                        {html ? (
                            <div dangerouslySetInnerHTML={{ __html: html }} className="space-y-6" />
                        ) : !headline && (
                            <p className="text-xl md:text-2xl opacity-70 leading-relaxed font-medium">
                                Add meaningful storytelling content here to connect with your customers.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}