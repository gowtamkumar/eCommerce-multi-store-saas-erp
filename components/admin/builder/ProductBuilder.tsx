
'use client';

import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import BuilderSection from './BuilderSection';
import FeaturesSection from './sections/FeaturesSection';
import TechSpecsSection from './sections/TechSpecsSection';
import { generateId } from './utils';
import { Section } from './types';

import DescriptionSection from './sections/DescriptionSection';
import FAQSection from './sections/FAQSection';
import BenefitsSection from './sections/BenefitsSection';
import HeroSection from './sections/HeroSection';
import SocialProofSection from './sections/SocialProofSection';

// Define the available section types
const SECTION_TYPES = [
    { type: 'hero', label: 'Hero Config', description: 'Tagline and highlights' },
    { type: 'description', label: 'Rich Text', description: 'Description with formatting' },
    { type: 'techSpecs', label: 'Technical Specs', description: 'Table of product specifications' },
    { type: 'features', label: 'Features Grid', description: 'Key features with headings' },
    { type: 'benefits', label: 'Key Benefits', description: 'Interactive benefits grid' },
    { type: 'faq', label: 'FAQs', description: 'Frequently Asked Questions' },
    { type: 'socialProof', label: 'Social Proof', description: 'Ratings and avatars' },
];

interface ProductBuilderProps {
    sections: Section[];
    onChange: (sections: Section[]) => void;
}

export default function ProductBuilder({ sections = [], onChange }: ProductBuilderProps) {
    const [activeId, setActiveId] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = sections.findIndex((s) => s.id === active.id);
            const newIndex = sections.findIndex((s) => s.id === over.id);

            const newSections = arrayMove(sections, oldIndex, newIndex);
            // Update order property
            const orderedSections = newSections.map((s, idx) => ({ ...s, order: idx }));
            onChange(orderedSections);
        }

        setActiveId(null);
    };

    const addSection = (type: string) => {
        const newSection: Section = {
            id: generateId(),
            type,
            content: getInitialContent(type),
            order: sections.length,
        };
        onChange([...sections, newSection]);
    };

    const removeSection = (id: string) => {
        const newSections = sections.filter((s) => s.id !== id);
        onChange(newSections);
    };

    const updateSection = (id: string, updates: Partial<Section>) => {
        const newSections = sections.map((s) => (s.id === id ? { ...s, ...updates } : s));
        onChange(newSections);
    };

    const getInitialContent = (type: string) => {
        switch (type) {
            case 'hero':
                return { tagline: '', badgeText: 'New Release', highlights: [] };
            case 'description':
                return { html: '<p>Enter product description...</p>' };
            case 'techSpecs':
                return {
                    heading: 'Specifications',
                    subheading: 'Engineered for Perfection',
                    description: 'Detailed specs.',
                    items: [{ label: 'Battery', value: '24 Hours' }]
                };
            case 'features':
                return {
                    heading: 'Features',
                    subheading: 'Why Choose Us?',
                    description: 'Key highlights.',
                    items: [{ title: 'Fast Charging', description: 'Charge in minutes.' }]
                };
            case 'benefits':
                return { heading: 'Key Benefits', items: [] };
            case 'faq':
                return { title: 'Product FAQs', items: [] };
            case 'socialProof':
                return { noun: 'customers', count: 1000, rating: 5 };
            default:
                return {};
        }
    };

    const renderSectionEditor = (section: Section) => {
        switch (section.type) {
            case 'hero':
                return (
                    <HeroSection
                        content={section.content}
                        onChange={(newContent: any) => updateSection(section.id, { content: newContent })}
                    />
                );
            case 'description':
                return (
                    <DescriptionSection
                        content={section.content}
                        onChange={(newContent: any) => updateSection(section.id, { content: newContent })}
                    />
                );
            case 'techSpecs':
                return (
                    <TechSpecsSection
                        content={section.content}
                        onChange={(newContent: any) => updateSection(section.id, { content: newContent })}
                    />
                );
            case 'features':
                return (
                    <FeaturesSection
                        content={section.content}
                        onChange={(newContent: any) => updateSection(section.id, { content: newContent })}
                    />
                );
            case 'benefits':
                return (
                    <BenefitsSection
                        content={section.content}
                        onChange={(newContent: any) => updateSection(section.id, { content: newContent })}
                    />
                );
            case 'faq':
                return (
                    <FAQSection
                        content={section.content}
                        onChange={(newContent: any) => updateSection(section.id, { content: newContent })}
                    />
                );
            case 'socialProof':
                return (
                    <SocialProofSection
                        content={section.content}
                        onChange={(newContent: any) => updateSection(section.id, { content: newContent })}
                    />
                );
            default:
                return <div>Unknown Section Type</div>;
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-wrap gap-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                <span className="text-sm font-medium text-slate-500 w-full">Add Section:</span>
                {SECTION_TYPES.map((type) => (
                    <button
                        key={type.type}
                        type="button"
                        onClick={() => addSection(type.type)}
                        className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium hover:border-brand-500 hover:text-brand-600 transition-colors shadow-sm flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        {type.label}
                    </button>
                ))}
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                modifiers={[restrictToVerticalAxis]}
            >
                <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-4">
                        {sections.map((section) => (
                            <BuilderSection
                                key={section.id}
                                id={section.id}
                                title={SECTION_TYPES.find(t => t.type === section.type)?.label || 'Section'}
                                settings={section.settings}
                                onSettingsChange={(newSettings: any) => updateSection(section.id, { settings: newSettings })}
                                onRemove={() => removeSection(section.id)}
                            >
                                {renderSectionEditor(section)}
                            </BuilderSection>
                        ))}
                    </div>
                </SortableContext>

                {/* Drag Overlay for smooth preview */}
                <DragOverlay>
                    {activeId ? (
                        <div className="opacity-90">
                            {(() => {
                                const section = sections.find(s => s.id === activeId);
                                if (!section) return null;
                                return (
                                    <BuilderSection
                                        id={section.id}
                                        title={SECTION_TYPES.find(t => t.type === section.type)?.label || 'Section'}
                                        onRemove={() => { }} // No-op during drag
                                        isOverlay
                                    >
                                        <div className="p-4 bg-slate-50 text-slate-500 text-sm text-center italic">
                                            Dragging content...
                                        </div>
                                    </BuilderSection>
                                )
                            })()}
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>

            {sections.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl text-slate-400">
                    <p>No sections added yet. Start by adding a section above.</p>
                </div>
            )}
        </div>
    );
}
