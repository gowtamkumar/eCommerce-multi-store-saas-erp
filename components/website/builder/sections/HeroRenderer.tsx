'use client';

import Hero from '@/components/Hero';

const HeroRenderer = ({ section, product }: { section: any, product: any }) => {
    // Extract builder-specific hero content
    const { tagline, badgeText, highlights } = section.content;

    return (
        <Hero
            product={product}
            isBuilderSection={true}
            highlights={highlights}
            badgeText={badgeText}
        // If tagline is in section content, pass it as product tagline override or title?
        // Hero component uses product.tagline. Let's effectively "patch" the product for the Hero, or use new props.
        // I added highlights and badgeText props. I didn't add tagline prop, but Hero uses title prop or product.tagline.
        // Let's passed title={tagline} if we want to override.
        />
    );
};

export default HeroRenderer;
