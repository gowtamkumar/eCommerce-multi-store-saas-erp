'use client';

import { useSettings } from '@/contexts/SettingsContext';
import dynamic from 'next/dynamic';

const HeroRenderer = dynamic(() => import('./sections/HeroRenderer'));
const DescriptionRenderer = dynamic(() => import('./sections/DescriptionRenderer'));
const BenefitsRenderer = dynamic(() => import('./sections/BenefitsRenderer'));
const FAQRenderer = dynamic(() => import('./sections/FAQRenderer'));
const SocialProofRenderer = dynamic(() => import('./sections/SocialProofRenderer'));
const TechSpecsRenderer = dynamic(() => import('./sections/TechSpecsRenderer'));
// const ReviewsRenderer = dynamic(() => import('./sections/ReviewsRenderer')); // To be implemented if needed

interface PageRendererProps {
    sections: any[];
    product: any;
}

const PageRenderer = ({ sections, product }: PageRendererProps) => {
    if (!sections || sections.length === 0) return null;

    return (
        <div className="flex flex-col">
            {sections.map((section) => {
                // Apply section container styles here if needed
                const { settings } = section;
                const style = {
                    backgroundColor: settings?.backgroundColor,
                    color: settings?.textColor,
                    paddingTop: settings?.paddingTop,
                    paddingBottom: settings?.paddingBottom,
                };

                const renderSection = () => {
                    switch (section.type) {
                        case 'hero':
                            return <HeroRenderer section={section} product={product} />;
                        case 'description':
                            return <DescriptionRenderer section={section} />;
                        case 'benefits':
                            return <BenefitsRenderer section={section} />;
                        case 'faq':
                            return <FAQRenderer section={section} />;
                        case 'socialProof':
                            return <SocialProofRenderer section={section} />;
                        case 'techSpecs':
                            return <TechSpecsRenderer section={section} />;
                        default:
                            return null;
                    }
                };

                const containerWidthClass = settings?.containerWidth === 'full' ? 'w-full' : 'container mx-auto px-4';

                return (
                    <div key={section.id} id={section.id} style={style} className={settings?.customClass}>
                        <div className={containerWidthClass}>
                            {renderSection()}
                        </div>
                    </div>
                )
            })}
        </div>
    );
};

export default PageRenderer;
