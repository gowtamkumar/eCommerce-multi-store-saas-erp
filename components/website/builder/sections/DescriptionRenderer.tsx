'use client';

const DescriptionRenderer = ({ section }: { section: any }) => {
    const { html } = section.content;

    if (!html) return null;

    return (
        <div className="prose prose-lg dark:prose-invert max-w-none mx-auto" dangerouslySetInnerHTML={{ __html: html }} />
    );
};

export default DescriptionRenderer;
