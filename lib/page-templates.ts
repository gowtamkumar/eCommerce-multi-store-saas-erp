import { PageBuilderSection, defaultSectionStyles } from "@/types/page-builder";
import { generateSectionId } from "./page-builder-utils";

export interface PageTemplate {
    id: string;
    name: string;
    description: string;
    category: 'business' | 'ecommerce' | 'blog' | 'general';
    sections: PageBuilderSection[];
}

export const TEMPLATE_PRESETS: PageTemplate[] = [
    {
        id: 'saas-landing',
        name: 'Modern SaaS Home',
        description: 'High-converting layout with Hero, Features, Social Proof, and CTA.',
        category: 'business',
        sections: [
            {
                id: 'temp-hero',
                type: 'hero',
                order: 0,
                isExpanded: false,
                styles: { ...defaultSectionStyles, paddingTop: 96, paddingBottom: 96, backgroundColor: '#f8fafc' },
                content: {
                    heading: "The Future of SaaS Management",
                    subheading: "All your tools in one place. Scale faster with our unified platform.",
                    buttonText: "Start Free Trial",
                    buttonUrl: "/signup",
                    imageUrl: "https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=2670&auto=format&fit=crop"
                }
            },
            {
                id: 'temp-features',
                type: 'features',
                order: 1,
                isExpanded: false,
                styles: { ...defaultSectionStyles, paddingTop: 80, paddingBottom: 80 },
                content: {
                    heading: "Why Choose Us?",
                    subheading: "Everything you need to succeed.",
                    features: [
                        { title: "Real-time Analytics", description: "Get insights instantly.", icon: "bar-chart" },
                        { title: "Secure Cloud", description: "Enterprise-grade security.", icon: "lock" },
                        { title: "24/7 Support", description: "We are here when you need us.", icon: "headphones" }
                    ]
                }
            },
            {
                id: 'temp-cta',
                type: 'cta',
                order: 2,
                isExpanded: false,
                styles: { ...defaultSectionStyles, backgroundColor: '#0f172a', textColor: '#ffffff', paddingTop: 80, paddingBottom: 80, alignment: 'center', borderRadius: 24, width: 'container' },
                content: {
                    heading: "Ready to Get Started?",
                    subheading: "Join 10,000+ happy customers today.",
                    buttonText: "Create Account",
                    buttonUrl: "/register"
                }
            }
        ]
    },
    {
        id: 'ecommerce-storefront',
        name: 'E-commerce Landing',
        description: 'Showcase your best products with a Hero and Grid layout.',
        category: 'ecommerce',
        sections: [
            {
                id: 'temp-hero-ecom',
                type: 'hero',
                order: 0,
                isExpanded: false,
                styles: { ...defaultSectionStyles, paddingTop: 100, paddingBottom: 100 },
                content: {
                    heading: "Summer Collection 2024",
                    subheading: "Discover the hottest trends of the season.",
                    buttonText: "Shop Now",
                    buttonUrl: "/products",
                    imageUrl: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2670&auto=format&fit=crop"
                }
            },
            {
                id: 'temp-products',
                type: 'product-grid',
                order: 1,
                isExpanded: false,
                styles: { ...defaultSectionStyles },
                content: {
                    heading: "Featured Products",
                    limit: 6
                }
            }
        ]
    },
    {
        id: 'minimal-page',
        name: 'Minimal Content',
        description: 'Simple layout for Terms, Privacy, or About pages.',
        category: 'general',
        sections: [
            {
                id: 'temp-text',
                type: 'rich-text',
                order: 0,
                isExpanded: true,
                styles: { ...defaultSectionStyles, width: 'narrow', paddingTop: 60 },
                content: {
                    content: "<h1>About Us</h1><p>Welcome to our company. We are dedicated to providing the best service possible.</p>"
                }
            }
        ]
    }
];

export function getTemplateSections(templateId: string): PageBuilderSection[] {
    const template = TEMPLATE_PRESETS.find(t => t.id === templateId);
    if (!template) return [];

    // Clone and regenerate IDs to avoid collisions
    return template.sections.map(section => ({
        ...section,
        id: generateSectionId(),
        // Reset order
        // styles: { ...section.styles } // deep copy handled by map spread roughly, but for styles object spread is enough
    }));
}
